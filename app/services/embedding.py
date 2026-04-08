from __future__ import annotations

import hashlib
import math
import re
from dataclasses import dataclass
from typing import Protocol

import numpy as np

from app.config import Settings


TOKEN_PATTERN = re.compile(r"[A-Za-z0-9가-힣_]+")


# 1. 공통 embedding 인터페이스
class EmbeddingService(Protocol):
  dimensions: int

  def embed_texts(self, texts: list[str]) -> np.ndarray:
    ...


# 2. 개발용 fallback embedding
# 모델 다운로드 없이도 인덱싱 흐름을 확인할 수 있게 둔다.
@dataclass
class HashEmbeddingService:
  dimensions: int

  def embed_texts(self, texts: list[str]) -> np.ndarray:
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


# 3. 운영 품질용 semantic embedding backend
class SentenceTransformerEmbeddingService:
  def __init__(self, model_name: str):
    from sentence_transformers import SentenceTransformer

    self._model = SentenceTransformer(model_name)
    self.dimensions = int(self._model.get_sentence_embedding_dimension())

  def embed_texts(self, texts: list[str]) -> np.ndarray:
    embeddings = self._model.encode(texts, normalize_embeddings=True)
    return np.asarray(embeddings, dtype=np.float32)


# 4. embedding backend 선택 진입점
def create_embedding_service(settings: Settings) -> EmbeddingService:
  # template과 email embedding은 반드시 같은 embedding 공간을 써야 한다.
  # 이 선택을 한곳에 모아 서비스 전체에서 일관되게 유지한다.
  if settings.embedding_backend == "sentence_transformer":
    return SentenceTransformerEmbeddingService(settings.embedding_model_name)
  return HashEmbeddingService(dimensions=settings.embedding_dimensions)
