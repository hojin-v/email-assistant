from app.services.document_chunking import ChunkingDocument, split_document


class StubEmbeddingService:
  def embed_texts(self, texts: list[str]):
    raise AssertionError("이 테스트에서는 실제 임베딩 호출이 필요하지 않습니다.")


def test_split_document_uses_native_chunking_for_non_pdf():
  document = ChunkingDocument(
    source_type="faq",
    source_id="faq-1",
    content=("첫 문단입니다. " * 5) + "\n\n" + ("둘째 문단입니다. " * 5),
  )

  chunks = split_document(
    document,
    embedding_service=StubEmbeddingService(),
    chunking_backend="langchain",
    pdf_chunking_strategy="semantic",
    max_chars=40,
    overlap=5,
  )

  assert len(chunks) >= 2


def test_split_document_uses_langchain_result_for_pdf(monkeypatch):
  document = ChunkingDocument(
    source_type="manual",
    source_id="manual-1",
    file_name="guide.pdf",
    media_type="application/pdf",
    content="의미 단위로 자를 긴 PDF 본문",
  )

  monkeypatch.setattr(
    "app.services.document_chunking._split_pdf_with_langchain",
    lambda **kwargs: ["chunk-a", "chunk-b"],
  )

  chunks = split_document(
    document,
    embedding_service=StubEmbeddingService(),
    chunking_backend="langchain",
    pdf_chunking_strategy="semantic",
    max_chars=100,
    overlap=10,
  )

  assert chunks == ["chunk-a", "chunk-b"]


def test_split_document_falls_back_when_langchain_pdf_result_is_empty(monkeypatch):
  document = ChunkingDocument(
    source_type="manual",
    source_id="manual-2",
    file_name="guide.pdf",
    media_type="application/pdf",
    content=("첫 문단입니다. " * 5) + "\n\n" + ("둘째 문단입니다. " * 5),
  )

  monkeypatch.setattr(
    "app.services.document_chunking._split_pdf_with_langchain",
    lambda **kwargs: [],
  )

  chunks = split_document(
    document,
    embedding_service=StubEmbeddingService(),
    chunking_backend="langchain",
    pdf_chunking_strategy="semantic",
    max_chars=40,
    overlap=5,
  )

  assert len(chunks) >= 2
