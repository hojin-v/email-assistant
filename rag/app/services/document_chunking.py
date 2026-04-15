from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol

from app.services.chunking import chunk_text


# 1. semantic chunking에 필요한 최소 embedding 인터페이스
class SupportsEmbedTexts(Protocol):
  # semantic chunking은 구체적인 임베딩 구현을 몰라도 되게 하기 위해
  # embed_texts만 있으면 된다는 최소 계약만 정의한다.
  def embed_texts(self, texts: list[str]):
    ...


# 2. chunking에 필요한 문서 공통 표현
# 파일 형식과 출처를 같이 들고 있어야 전략 분기가 가능하다.
@dataclass
class ChunkingDocument:
  # content 외의 메타 필드는 "어떤 전략으로 자를지" 결정하는 힌트로 쓴다.
  source_type: str
  source_id: str
  content: str
  title: str | None = None
  file_name: str | None = None
  media_type: str | None = None
  metadata: dict[str, Any] | None = None


def split_document(
  document: ChunkingDocument,
  *,
  embedding_service: SupportsEmbedTexts,
  chunking_backend: str,
  pdf_chunking_strategy: str,
  max_chars: int,
  overlap: int,
) -> list[str]:
  # 문서 유형에 따라 어떤 chunking 경로를 쓸지 결정하는 라우터 함수다.
  if not document.content.strip():
    return []

  # PDF는 일반 텍스트보다 구조와 의미 경계 영향이 커서
  # LangChain 기반 semantic chunking을 우선 시도한다.
  if chunking_backend == "langchain" and _is_pdf_document(document):
    chunks = _split_pdf_with_langchain(
      text=document.content,
      embedding_service=embedding_service,
      strategy=pdf_chunking_strategy,
      max_chars=max_chars,
      overlap=overlap,
    )
    if chunks:
      return chunks

  # semantic 경로가 실패하면 안정적인 기본 chunking으로 되돌린다.
  return chunk_text(document.content, max_chars=max_chars, overlap=overlap)


def _is_pdf_document(document: ChunkingDocument) -> bool:
  # mime type을 우선 신뢰하고, 없으면 파일명 suffix로 fallback 판단한다.
  if document.media_type == "application/pdf":
    return True
  if document.file_name and document.file_name.lower().endswith(".pdf"):
    return True
  return False


def _split_pdf_with_langchain(
  *,
  text: str,
  embedding_service: SupportsEmbedTexts,
  strategy: str,
  max_chars: int,
  overlap: int,
) -> list[str]:
  # PDF는 일반 텍스트보다 구조와 의미 경계 영향이 크므로
  # semantic chunking을 먼저 시도하고, 실패하면 기본 분할기로 내려간다.
  try:
    from langchain_core.documents import Document as LangChainDocument
    from langchain_text_splitters import RecursiveCharacterTextSplitter
  except ImportError:
    # 의존성이 아직 설치되지 않았거나 런타임 환경에 없으면
    # 기존 native chunking으로 자연스럽게 되돌린다.
    return []

  base_document = LangChainDocument(page_content=text)

  semantic_chunks: list[str] = []
  if strategy == "semantic":
    # semantic strategy는 문장 의미 경계 기반 1차 분할을 의미한다.
    semantic_chunks = _run_semantic_chunker(base_document.page_content, embedding_service)

  if not semantic_chunks:
    # semantic 결과가 비어 있거나 실패하면
    # RecursiveCharacterTextSplitter가 안전한 fallback 역할을 한다.
    splitter = RecursiveCharacterTextSplitter(
      chunk_size=max_chars,
      chunk_overlap=overlap,
      separators=["\n\n", "\n", ". ", " ", ""],
    )
    return [
      chunk
      for chunk in splitter.split_text(base_document.page_content)
      if chunk.strip()
    ]

  # semantic chunk 결과가 너무 길 수 있으므로
  # 마지막에 길이 제한을 한 번 더 적용해 검색 단위를 안정적으로 맞춘다.
  final_splitter = RecursiveCharacterTextSplitter(
    chunk_size=max_chars,
    chunk_overlap=overlap,
    separators=["\n\n", "\n", ". ", " ", ""],
  )

  final_chunks: list[str] = []
  for semantic_chunk in semantic_chunks:
    final_chunks.extend(
      chunk
      for chunk in final_splitter.split_text(semantic_chunk)
      if chunk.strip()
    )
  return final_chunks


# 3. 임베딩 기반 의미 경계 분할
def _run_semantic_chunker(text: str, embedding_service: SupportsEmbedTexts) -> list[str]:
  try:
    from langchain_experimental.text_splitter import SemanticChunker
  except ImportError:
    return []

  try:
    chunker = SemanticChunker(
      embeddings=_LangChainEmbeddingAdapter(embedding_service),
      breakpoint_threshold_type="percentile",
    )
    documents = chunker.create_documents([text])
  except Exception:
    # SemanticChunker의 내부 동작이나 버전 차이로 실패하더라도
    # 인덱싱 전체가 깨지지 않도록 상위에서 fallback 하게 둔다.
    return []

  return [document.page_content.strip() for document in documents if document.page_content.strip()]


# 4. LangChain embedding 어댑터
class _LangChainEmbeddingAdapter:
  # 기존 embedding 서비스를 LangChain 인터페이스로 감싸는 어댑터다.
  def __init__(self, embedding_service: SupportsEmbedTexts):
    self._embedding_service = embedding_service

  def embed_documents(self, texts: list[str]) -> list[list[float]]:
    # LangChain은 numpy 배열이 아니라 list[list[float]]를 기대한다.
    vectors = self._embedding_service.embed_texts(texts)
    return vectors.tolist()

  def embed_query(self, text: str) -> list[float]:
    vector = self._embedding_service.embed_texts([text])[0]
    return vector.tolist()
