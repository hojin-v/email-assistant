from __future__ import annotations

from app.config import settings
from app.services.embedding import create_embedding_service
from app.services.index_store import VectorIndexStore


embedding_service = create_embedding_service(settings)
vector_store = VectorIndexStore(
  backend=settings.vector_backend,
  persist_directory=settings.chroma_persist_directory,
  chroma_host=settings.chroma_host,
  chroma_port=settings.chroma_port,
  chroma_ssl=settings.chroma_ssl,
)


def knowledge_namespace(user_id: int) -> str:
  # 지식 컬렉션은 사용자별로 완전히 분리한다.
  return f"knowledge:{user_id}"


def template_namespace(user_id: int) -> str:
  # 템플릿 검색도 지식 검색과 별도 목적을 갖기 때문에 별도 namespace를 사용한다.
  return f"template:{user_id}"
