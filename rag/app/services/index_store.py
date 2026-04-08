from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from threading import Lock
from typing import Any

import numpy as np

try:
  import chromadb
except ImportError:  # pragma: no cover
  chromadb = None


SCALAR_METADATA_KEYS = {
  "user_id",
  "source_type",
  "source_id",
  "title",
  "intent",
  "chunk_index",
  "template_id",
  "mail_tone",
  "domain",
}


# 1. 인덱스에 저장되는 최소 단위
@dataclass
class IndexRecord:
  record_id: str
  vector: np.ndarray
  payload: dict[str, Any]


# 2. Chroma 기반 벡터 저장소
# 원본 데이터는 보관하지 않고 검색용 파생 데이터만 관리한다.
class VectorIndexStore:
  def __init__(
    self,
    dimensions: int,
    *,
    backend: str = "chroma",
    persist_directory: str = ".rag-data/chroma",
  ):
    self.dimensions = dimensions
    self.backend = backend
    self.persist_directory = persist_directory
    self._lock = Lock()
    self._collections: dict[str, Any] = {}
    self._client = self._create_client()

  def _create_client(self):
    # persistent client를 만들고 저장 경로를 준비한다.
    if self.backend != "chroma" or chromadb is None:
      return None

    Path(self.persist_directory).mkdir(parents=True, exist_ok=True)
    return chromadb.PersistentClient(path=self.persist_directory)

  def upsert(self, namespace: str, records: list[IndexRecord]) -> None:
    # 벡터와 메타데이터를 collection에 함께 저장한다.
    if not records:
      return

    if self._client is None:
      raise RuntimeError("Chroma backend is not available. Install chromadb to use vector storage.")

    collection = self._get_or_create_collection(namespace)

    ids: list[str] = []
    embeddings: list[list[float]] = []
    metadatas: list[dict[str, Any]] = []
    documents: list[str] = []

    # Chroma metadata는 단순 필드 위주로 두고
    # 복잡한 payload는 JSON으로 같이 저장해 복원성을 유지한다.
    for record in records:
      ids.append(record.record_id)
      embeddings.append(_normalize_vector(record.vector).tolist())
      metadatas.append(_serialize_payload(record.payload))
      documents.append(_extract_document_text(record.payload))

    with self._lock:
      collection.upsert(
        ids=ids,
        embeddings=embeddings,
        metadatas=metadatas,
        documents=documents,
      )

  def search(
    self,
    namespace: str,
    query_vector: np.ndarray,
    top_k: int,
    filters: dict[str, Any] | None = None,
  ) -> list[tuple[IndexRecord, float]]:
    # query vector와 가장 가까운 record를 찾아 payload 중심으로 복원한다.
    if self._client is None:
      return []

    collection = self._collections.get(namespace)
    if collection is None:
      try:
        collection = self._client.get_collection(name=_collection_name(namespace))
      except Exception:
        return []
      self._collections[namespace] = collection

    where = _build_where_clause(filters)
    results = collection.query(
      query_embeddings=[_normalize_vector(query_vector).tolist()],
      n_results=top_k,
      where=where,
      include=["metadatas", "documents", "distances"],
    )

    ids = results.get("ids", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    documents = results.get("documents", [[]])[0]
    distances = results.get("distances", [[]])[0]

    matches: list[tuple[IndexRecord, float]] = []
    # 검색 시점에는 원래 벡터 자체보다 payload 복원이 중요하므로
    # 응답용 IndexRecord를 다시 조립해 반환한다.
    for record_id, metadata, document, distance in zip(ids, metadatas, documents, distances, strict=False):
      payload = _deserialize_payload(metadata or {}, document)
      matches.append(
        (
          IndexRecord(
            record_id=record_id,
            vector=np.zeros(self.dimensions, dtype=np.float32),
            payload=payload,
          ),
          _distance_to_score(distance),
        )
      )
    return matches

  def backend_name(self) -> str:
    if self.backend == "chroma" and self._client is not None:
      return "chroma"
    return "unavailable"

  def _get_or_create_collection(self, namespace: str):
    # namespace별 collection은 한 번 만든 뒤 캐시해 재사용한다.
    collection = self._collections.get(namespace)
    if collection is not None:
      return collection

    if self._client is None:
      raise RuntimeError("Chroma client is not initialized.")

    collection = self._client.get_or_create_collection(
      name=_collection_name(namespace),
      metadata={"hnsw:space": "cosine"},
    )
    self._collections[namespace] = collection
    return collection


def _normalize_vector(vector: np.ndarray) -> np.ndarray:
  # cosine 유사도 계산 전에 길이를 1로 맞춘다.
  normalized = vector.astype(np.float32)
  norm = np.linalg.norm(normalized)
  if norm > 0:
    normalized = normalized / norm
  return normalized


def _collection_name(namespace: str) -> str:
  # Chroma collection 이름은 너무 긴 특수문자 조합보다
  # 단순한 영숫자/구분자 형태가 안정적이다.
  cleaned = re.sub(r"[^A-Za-z0-9_-]+", "_", namespace)
  return cleaned[:128]


def _extract_document_text(payload: dict[str, Any]) -> str:
  # document 필드에는 사람이 확인 가능한 대표 텍스트를 넣는다.
  return (
    payload.get("chunk_text")
    or payload.get("canonical_text")
    or payload.get("title")
    or ""
  )


def _serialize_payload(payload: dict[str, Any]) -> dict[str, Any]:
  # filter 가능한 scalar 값과 전체 payload JSON을 함께 저장한다.
  serialized: dict[str, Any] = {}
  for key in SCALAR_METADATA_KEYS:
    value = payload.get(key)
    if value is None:
      continue
    serialized[key] = value
  serialized["payload_json"] = json.dumps(payload, ensure_ascii=False)
  return serialized


def _deserialize_payload(metadata: dict[str, Any], document: str | None) -> dict[str, Any]:
  # 검색 결과에서 원래 payload 구조를 최대한 복원한다.
  payload_json = metadata.get("payload_json")
  if payload_json:
    payload = json.loads(payload_json)
  else:
    payload = {key: value for key, value in metadata.items() if key != "payload_json"}

  if document and "chunk_text" not in payload and "canonical_text" not in payload:
    if "template_id" in payload:
      payload["canonical_text"] = document
    else:
      payload["chunk_text"] = document
  return payload


def _build_where_clause(filters: dict[str, Any] | None) -> dict[str, Any] | None:
  # 단일 값과 다중 값 조건을 Chroma where 절로 바꾼다.
  if not filters:
    return None

  clauses: list[dict[str, Any]] = []
  for key, expected in filters.items():
    if expected is None:
      continue
    if isinstance(expected, list):
      if not expected:
        continue
      clauses.append({key: {"$in": expected}})
    else:
      clauses.append({key: expected})

  if not clauses:
    return None
  if len(clauses) == 1:
    return clauses[0]
  return {"$and": clauses}


def _distance_to_score(distance: float) -> float:
  # Chroma distance를 기존 API가 쓰는 유사도 점수 형태로 바꾼다.
  # Chroma cosine 검색은 거리를 반환하므로
  # 기존 API와 비슷하게 "클수록 더 유사함" 형태의 점수로 바꾼다.
  return 1.0 - float(distance)
