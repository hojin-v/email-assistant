from __future__ import annotations

import hashlib
import math
import re
from dataclasses import dataclass
from typing import Protocol

import numpy as np

from app.config import Settings
from app.services.openai_compatible_client import create_openai_compatible_client_with_overrides


TOKEN_PATTERN = re.compile(r"[A-Za-z0-9가-힣_]+")


# 1. 공통 embedding 인터페이스
class EmbeddingService(Protocol):
  # dimensions를 노출하는 이유는 vector store와 응답 조립 단계에서
  # 차원 정보를 알아야 할 때가 있기 때문이다.
  dimensions: int

  def embed_texts(self, texts: list[str]) -> np.ndarray:
    ...


# 2. 개발용 fallback embedding
# 모델 다운로드 없이도 인덱싱 흐름을 확인할 수 있게 둔다.
@dataclass
class HashEmbeddingService:
  dimensions: int

  def embed_texts(self, texts: list[str]) -> np.ndarray:
    # 각 텍스트를 결정적으로 같은 벡터로 바꾸기 때문에
    # 개발 환경에서 재현 가능한 fallback으로 적합하다.
    return np.vstack([self._embed_one(text) for text in texts])

  def _embed_one(self, text: str) -> np.ndarray:
    # hash embedding은 초기 연동을 위한 결정적 fallback 구현이다.
    # 운영 품질의 semantic model을 대체하려는 목적은 아니다.
    vector = np.zeros(self.dimensions, dtype=np.float32)
    tokens = TOKEN_PATTERN.findall(text.lower())

    if not tokens:
      vector[0] = 1.0
      return vector

    for token in tokens:
      digest = hashlib.sha256(token.encode("utf-8")).digest()
      index = int.from_bytes(digest[:4], "little") % self.dimensions
      sign = 1.0 if digest[4] % 2 == 0 else -1.0
      weight = 1.0 + (digest[5] / 255.0)
      vector[index] += sign * weight

    norm = math.sqrt(float(np.dot(vector, vector)))
    if norm > 0:
      vector /= norm
    return vector


class OpenAICompatibleEmbeddingService:
  def __init__(
    self,
    *,
    model_name: str | None,
    settings: Settings | None = None,
    api_client=None,
  ):
    self.dimensions = 0
    # model_name이 비어 있으면 API 서버의 기본 임베딩 모델을 사용한다.
    self._model_name = model_name.strip() if model_name else None
    resolved_settings = settings or Settings()
    # 임베딩 전용 provider를 쓰고 싶을 때만 override 값을 태운다.
    self._api_client = api_client or create_openai_compatible_client_with_overrides(
      resolved_settings,
      base_url=resolved_settings.embedding_api_base_url,
      api_key=resolved_settings.embedding_api_key,
    )

  def embed_texts(self, texts: list[str]) -> np.ndarray:
    if not texts:
      # 빈 입력도 항상 2차원 배열 형태로 맞춰 상위 로직을 단순화한다.
      return np.empty((0, self.dimensions), dtype=np.float32)

    response = self._api_client.create_embeddings(
      inputs=texts,
      model=self._model_name,
    )

    data = response.get("data")
    if not isinstance(data, list) or not data:
      raise ValueError("LLM API 응답에 embedding data가 없습니다.")

    ordered_items = sorted(
      [item for item in data if isinstance(item, dict)],
      key=lambda item: int(item.get("index", 0)),
    )
    # 응답 순서가 바뀔 수 있어 index 기준으로 재정렬한다.
    vectors = [item.get("embedding") for item in ordered_items]

    if len(vectors) != len(texts):
      raise ValueError("LLM API embedding 응답 개수가 요청 개수와 다릅니다.")

    embeddings = np.asarray(vectors, dtype=np.float32)
    if embeddings.ndim != 2:
      raise ValueError("LLM API embedding 응답 형식이 예상과 다릅니다.")

    actual_dimensions = int(embeddings.shape[1])
    if self.dimensions == 0:
      self.dimensions = actual_dimensions
    elif actual_dimensions != self.dimensions:
      raise ValueError(
        "LLM API embedding 차원이 이전 응답과 다릅니다. "
        f"previous={self.dimensions}, actual={actual_dimensions}"
      )

    return _normalize_embeddings(embeddings)


def _normalize_embeddings(vectors: np.ndarray) -> np.ndarray:
  # cosine similarity 기반 검색을 위해 행 단위 L2 normalize를 적용한다.
  norms = np.linalg.norm(vectors, axis=1, keepdims=True)
  safe_norms = np.where(norms == 0, 1.0, norms)
  return vectors / safe_norms


# 4. embedding backend 선택 진입점
def create_embedding_service(settings: Settings) -> EmbeddingService:
  # template과 email embedding은 반드시 같은 embedding 공간을 써야 한다.
  # 이 선택을 한곳에 모아 서비스 전체에서 일관되게 유지한다.
  if settings.embedding_backend == "embedding_api":
    return OpenAICompatibleEmbeddingService(
      model_name=settings.embedding_model,
      settings=settings,
    )
  if settings.embedding_backend == "hash":
    return HashEmbeddingService(dimensions=settings.embedding_dimensions)
  raise ValueError(f"지원하지 않는 embedding backend 입니다: {settings.embedding_backend}")
