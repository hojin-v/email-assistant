from __future__ import annotations

from fastapi import FastAPI, HTTPException

from app.config import settings
from app.schemas import (
  CanonicalTextResponse,
  DraftRequest,
  DraftResponse,
  EmailCanonicalizationRequest,
  ExtractTextRequest,
  ExtractTextResponse,
  HealthResponse,
  IndexedChunkSummary,
  KnowledgeIndexRequest,
  KnowledgeIndexResponse,
  KnowledgeSearchRequest,
  KnowledgeSearchResponse,
  KnowledgeSearchResult,
  TemplateCanonicalizationRequest,
  TemplateIndexRequest,
  TemplateIndexResponse,
  TemplateMatchCandidate,
  TemplateMatchRequest,
  TemplateMatchResponse,
)
from app.services.canonicalization import build_email_canonical_text, build_template_canonical_text
from app.services.draft_service import run_draft
from app.services.document_chunking import ChunkingDocument, split_document
from app.services.document_parser import UnsupportedDocumentError, extract_text_from_payload
from app.services.embedding import create_embedding_service
from app.services.index_store import IndexRecord, VectorIndexStore


# 1. 앱 전역 공통 객체 초기화
app = FastAPI(title="EmailAssist RAG", version="0.1.0")
embedding_service = create_embedding_service(settings)
# 벡터 저장소는 기본적으로 Chroma persistent client를 사용한다.
# collection은 user namespace별로 분리한다.
vector_store = VectorIndexStore(
  dimensions=embedding_service.dimensions,
  backend=settings.vector_backend,
  persist_directory=settings.chroma_persist_directory,
)


def _knowledge_namespace(user_id: int) -> str:
  return f"knowledge:{user_id}"


def _template_namespace(user_id: int) -> str:
  return f"template:{user_id}"


# 2. 상태 확인 엔드포인트
@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
  return HealthResponse(
    status="ok",
    embedding_backend=settings.embedding_backend,
    vector_backend=vector_store.backend_name(),
  )


# 3. 텍스트 추출 엔드포인트
@app.post("/extract-text", response_model=ExtractTextResponse)
@app.post("/v1/resources/extract-text", response_model=ExtractTextResponse)
def extract_text(request: ExtractTextRequest) -> ExtractTextResponse:
  # Backend가 원본 파일을 저장한 뒤 파싱 대상 바이트를 이 엔드포인트로 전달한다.
  # RAG는 텍스트 추출 책임만 가지며 원본 파일 보관 책임은 갖지 않는다.
  try:
    extracted_text = extract_text_from_payload(
      file_name=request.file_name,
      media_type=request.media_type,
      content_base64=request.content_base64,
    )
  except UnsupportedDocumentError as error:
    raise HTTPException(status_code=400, detail=str(error)) from error
  except Exception as error:  # pragma: no cover
    raise HTTPException(status_code=500, detail=f"Failed to extract text: {error}") from error

  return ExtractTextResponse(
    request_id=request.request_id,
    file_name=request.file_name,
    media_type=request.media_type,
    extracted_text=extracted_text,
    char_count=len(extracted_text),
  )


# 4. canonical text 생성 엔드포인트
@app.post("/canonical/email", response_model=CanonicalTextResponse)
@app.post("/v1/canonical/email", response_model=CanonicalTextResponse)
def canonicalize_email(request: EmailCanonicalizationRequest) -> CanonicalTextResponse:
  # Email canonical text는 embedding과 template matching이 함께 쓰는 공통 표현이다.
  # 이 조합 규칙을 한곳에 두어야 Backend와 AI의 해석이 어긋나지 않는다.
  return CanonicalTextResponse(
    request_id=request.request_id,
    emailId=request.emailId,
    canonical_text=build_email_canonical_text(
      subject=request.subject,
      body_clean=request.body,
      summary=request.summary,
      keyphrases=request.keyphrases,
      domain=request.domain,
      intent=request.intent,
      entities=request.entities,
    )
  )


@app.post("/canonical/template", response_model=CanonicalTextResponse)
@app.post("/v1/canonical/template", response_model=CanonicalTextResponse)
def canonicalize_template(request: TemplateCanonicalizationRequest) -> CanonicalTextResponse:
  # Template canonical text는 본문보다 metadata 중심으로 만든다.
  # 템플릿 검색은 최종 답장 문장보다 "언제 써야 하는 템플릿인지"를 더 잘 반영해야 한다.
  return CanonicalTextResponse(
    request_id=request.request_id,
    canonical_text=build_template_canonical_text(
      title=request.title,
      category_name=request.intent,
      email_tone=request.mail_tone,
      domain=request.domain,
      metadata=request.metadata,
    )
  )


# 5. draft 생성 엔드포인트
@app.post("/draft", response_model=DraftResponse)
@app.post("/v1/draft", response_model=DraftResponse)
def draft_email(request: DraftRequest) -> DraftResponse:
  try:
    return run_draft(request, embedding_service)
  except ValueError as error:
    raise HTTPException(status_code=422, detail=str(error)) from error
  except Exception as error:  # pragma: no cover
    raise HTTPException(status_code=500, detail=str(error)) from error


# 6. knowledge index 엔드포인트
@app.post("/knowledge/index", response_model=KnowledgeIndexResponse)
@app.post("/v1/knowledge/index", response_model=KnowledgeIndexResponse)
def index_knowledge(request: KnowledgeIndexRequest) -> KnowledgeIndexResponse:
  chunk_size = request.chunk_size or settings.default_chunk_size
  chunk_overlap = request.chunk_overlap or settings.default_chunk_overlap

  records: list[IndexRecord] = []
  summaries: list[IndexedChunkSummary] = []

  for document in request.documents:
    # 문서 전체를 한 덩어리로 두지 않고 여러 검색 단위로 나눠야
    # 이후 retrieval에서 실제로 필요한 부분만 반환할 수 있다.
    chunks = split_document(
      ChunkingDocument(
        source_type=document.source_type,
        source_id=document.source_id,
        title=document.title,
        file_name=document.file_name,
        media_type=document.media_type,
        content=document.content,
        metadata=document.metadata,
      ),
      embedding_service=embedding_service,
      chunking_backend=settings.chunking_backend,
      pdf_chunking_strategy=settings.pdf_chunking_strategy,
      max_chars=chunk_size,
      overlap=chunk_overlap,
    )
    if not chunks:
      continue

    vectors = embedding_service.embed_texts(chunks)
    for index, chunk in enumerate(chunks):
      record_id = f"{document.source_type}:{document.source_id}:{index}"
      payload = {
        "user_id": request.user_id,
        "source_type": document.source_type,
        "source_id": document.source_id,
        "title": document.title,
        "intent": document.intent,
        "chunk_text": chunk,
        "metadata": document.metadata,
        "chunk_index": index,
      }
      records.append(IndexRecord(record_id=record_id, vector=vectors[index], payload=payload))
      summaries.append(
        IndexedChunkSummary(
          record_id=record_id,
          source_type=document.source_type,
          source_id=document.source_id,
          chunk_index=index,
        )
      )

  # 사용자별 namespace를 분리해 같은 프로세스를 공유해도
  # profile/FAQ/resource 데이터가 서로 섞이지 않도록 한다.
  vector_store.upsert(_knowledge_namespace(request.user_id), records)

  return KnowledgeIndexResponse(
    request_id=request.request_id,
    user_id=request.user_id,
    indexed_document_count=len(request.documents),
    indexed_chunk_count=len(records),
    chunks=summaries,
  )


# 7. knowledge search 엔드포인트
@app.post("/knowledge/search", response_model=KnowledgeSearchResponse)
@app.post("/v1/knowledge/search", response_model=KnowledgeSearchResponse)
def search_knowledge(request: KnowledgeSearchRequest) -> KnowledgeSearchResponse:
  query_vector = embedding_service.embed_texts([request.query_text])[0]
  # 별도 인덱스를 여러 개 두지 않고도 category/source 힌트로 retrieval 범위를
  # 좁힐 수 있도록 metadata filter를 함께 적용한다.
  filters = {
    "source_type": request.source_types if request.source_types else None,
    "intent": request.intent,
  }
  matches = vector_store.search(
    namespace=_knowledge_namespace(request.user_id),
    query_vector=query_vector,
    top_k=request.top_k,
    filters=filters,
  )
  return KnowledgeSearchResponse(
    request_id=request.request_id,
    user_id=request.user_id,
    query_text=request.query_text,
    results=[
      KnowledgeSearchResult(
        record_id=record.record_id,
        score=score,
        source_type=record.payload["source_type"],
        source_id=record.payload["source_id"],
        chunk_text=record.payload["chunk_text"],
        title=record.payload.get("title"),
        intent=record.payload.get("intent"),
        metadata=record.payload.get("metadata", {}),
      )
      for record, score in matches
    ],
  )


# 8. template index 엔드포인트
@app.post("/templates/index", response_model=TemplateIndexResponse)
@app.post("/v1/templates/index", response_model=TemplateIndexResponse)
def index_templates(request: TemplateIndexRequest) -> TemplateIndexResponse:
  records: list[IndexRecord] = []
  template_ids: list[int] = []

  for template in request.templates:
    # Backend가 canonical text를 직접 넣을 수도 있지만
    # 주변 서비스가 아직 완성되지 않은 단계에서도 이 엔드포인트를 쓸 수 있게 fallback을 둔다.
    canonical_text = template.canonical_text or build_template_canonical_text(
      title=template.title,
      category_name=template.intent,
      email_tone=template.mail_tone,
      domain=template.domain,
      metadata=template.metadata,
    )
    vector = embedding_service.embed_texts([canonical_text])[0]
    record_id = f"template:{template.template_id}"
    records.append(
      IndexRecord(
        record_id=record_id,
        vector=vector,
        payload={
          "template_id": template.template_id,
          "title": template.title,
          "intent": template.intent,
          "mail_tone": template.mail_tone,
          "domain": template.domain,
          "metadata": template.metadata.model_dump(),
          "canonical_text": canonical_text,
        },
      )
    )
    template_ids.append(template.template_id)

  # Template 검색은 knowledge chunk 검색과 목적이 다르므로
  # 전용 namespace에 따로 보관한다.
  vector_store.upsert(_template_namespace(request.user_id), records)

  return TemplateIndexResponse(
    request_id=request.request_id,
    user_id=request.user_id,
    indexed_template_count=len(template_ids),
    template_ids=template_ids,
  )


# 9. template match 엔드포인트
@app.post("/templates/match", response_model=TemplateMatchResponse)
@app.post("/v1/templates/match", response_model=TemplateMatchResponse)
def match_templates(request: TemplateMatchRequest) -> TemplateMatchResponse:
  query_vector = embedding_service.embed_texts([request.canonical_text])[0]
  # 여기서는 candidate template만 반환한다.
  # tone, negative keyword, usage log를 반영한 최종 rerank는 Backend 책임이다.
  filters = {
    "intent": request.intent,
    "mail_tone": request.mail_tone,
    "domain": request.domain,
  }
  matches = vector_store.search(
    namespace=_template_namespace(request.user_id),
    query_vector=query_vector,
    top_k=request.top_k,
    filters=filters,
  )
  return TemplateMatchResponse(
    request_id=request.request_id,
    emailId=request.emailId,
    user_id=request.user_id,
    results=[
      TemplateMatchCandidate(
        template_id=record.payload["template_id"],
        title=record.payload["title"],
        intent=record.payload["intent"],
        score=score,
        mail_tone=record.payload.get("mail_tone"),
        domain=record.payload.get("domain"),
        metadata=record.payload.get("metadata", {}),
      )
      for record, score in matches
    ],
  )
