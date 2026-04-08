from __future__ import annotations

from typing import Any, Literal

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


SourceType = Literal["profile", "faq", "resource", "manual"]


class ApiModel(BaseModel):
  # 1. 공통 API 모델 설정
  # alias 입력을 허용해 Backend/AI naming 차이를 흡수한다.
  model_config = ConfigDict(populate_by_name=True, extra="ignore")


# 2. 서버 상태 확인 스키마
class HealthResponse(ApiModel):
  status: str
  embedding_backend: str
  vector_backend: str


# 3. 원본 파일 텍스트 추출 스키마
class ExtractTextRequest(ApiModel):
  request_id: str | None = None
  file_name: str
  media_type: str
  content_base64: str


class ExtractTextResponse(ApiModel):
  request_id: str | None = None
  file_name: str
  media_type: str
  extracted_text: str
  char_count: int


# 4. knowledge index 입력 스키마
# profile, faq, resource처럼 출처가 다른 텍스트를 공통 형식으로 받는다.
class KnowledgeDocument(ApiModel):
  source_type: SourceType
  source_id: str
  title: str | None = None
  file_name: str | None = None
  media_type: str | None = None
  content: str = Field(min_length=1)
  intent: str | None = Field(
    default=None,
    validation_alias=AliasChoices("intent", "category_name"),
  )
  metadata: dict[str, Any] = Field(default_factory=dict)


class KnowledgeIndexRequest(ApiModel):
  request_id: str | None = None
  user_id: int
  documents: list[KnowledgeDocument]
  chunk_size: int | None = None
  chunk_overlap: int | None = None


class IndexedChunkSummary(ApiModel):
  record_id: str
  source_type: SourceType
  source_id: str
  chunk_index: int


class KnowledgeIndexResponse(ApiModel):
  request_id: str | None = None
  user_id: int
  indexed_document_count: int
  indexed_chunk_count: int
  chunks: list[IndexedChunkSummary]


# 5. knowledge search 요청/응답 스키마
class KnowledgeSearchRequest(ApiModel):
  request_id: str | None = None
  user_id: int
  query_text: str = Field(min_length=1)
  top_k: int = Field(default=5, ge=1, le=20)
  source_types: list[SourceType] | None = None
  intent: str | None = Field(
    default=None,
    validation_alias=AliasChoices("intent", "category_name"),
  )


class KnowledgeSearchResult(ApiModel):
  record_id: str
  score: float
  source_type: SourceType
  source_id: str
  chunk_text: str
  title: str | None = None
  intent: str | None = None
  metadata: dict[str, Any] = Field(default_factory=dict)


class KnowledgeSearchResponse(ApiModel):
  request_id: str | None = None
  user_id: int
  query_text: str
  results: list[KnowledgeSearchResult]


# 6. 이메일 canonical text 스키마
class EmailCanonicalizationRequest(ApiModel):
  request_id: str | None = None
  emailId: str | None = None
  threadId: str | None = None
  subject: str
  body: str = Field(validation_alias=AliasChoices("body", "body_clean"))
  summary: str | None = None
  keyphrases: list[str] = Field(default_factory=list)
  domain: str | None = None
  intent: str | None = None
  entities: dict[str, Any] = Field(default_factory=dict)


class CanonicalTextResponse(ApiModel):
  request_id: str | None = None
  emailId: str | None = None
  canonical_text: str


# 7. 템플릿 metadata / canonical text / index 스키마
class TemplateMetadataInput(ApiModel):
  template_purpose: str | None = None
  recommended_situations: list[str] = Field(default_factory=list)
  required_points: list[str] = Field(default_factory=list)
  must_avoid: list[str] = Field(default_factory=list)
  variables: list[str] = Field(default_factory=list)
  semantic_keywords: list[str] = Field(default_factory=list)
  negative_keywords: list[str] = Field(default_factory=list)
  search_summary: str | None = None


class TemplateCanonicalizationRequest(ApiModel):
  request_id: str | None = None
  title: str
  intent: str = Field(validation_alias=AliasChoices("intent", "category_name"))
  mail_tone: str | None = Field(
    default=None,
    validation_alias=AliasChoices("mail_tone", "email_tone"),
  )
  domain: str | None = None
  metadata: TemplateMetadataInput = Field(default_factory=TemplateMetadataInput)


class TemplateIndexItem(ApiModel):
  template_id: int
  title: str
  intent: str = Field(validation_alias=AliasChoices("intent", "category_name"))
  canonical_text: str | None = None
  mail_tone: str | None = Field(
    default=None,
    validation_alias=AliasChoices("mail_tone", "email_tone"),
  )
  domain: str | None = None
  metadata: TemplateMetadataInput = Field(default_factory=TemplateMetadataInput)


class TemplateIndexRequest(ApiModel):
  request_id: str | None = None
  user_id: int
  templates: list[TemplateIndexItem]


class TemplateIndexResponse(ApiModel):
  request_id: str | None = None
  user_id: int
  indexed_template_count: int
  template_ids: list[int]


# 8. 템플릿 매칭 스키마
class TemplateMatchRequest(ApiModel):
  request_id: str | None = None
  emailId: str | None = None
  user_id: int
  canonical_text: str = Field(min_length=1)
  top_k: int = Field(default=5, ge=1, le=20)
  intent: str | None = Field(
    default=None,
    validation_alias=AliasChoices("intent", "category_name"),
  )
  mail_tone: str | None = Field(
    default=None,
    validation_alias=AliasChoices("mail_tone", "email_tone"),
  )
  domain: str | None = None


class TemplateMatchCandidate(ApiModel):
  template_id: int
  title: str
  intent: str
  score: float
  mail_tone: str | None = None
  domain: str | None = None
  metadata: dict[str, Any] = Field(default_factory=dict)


class TemplateMatchResponse(ApiModel):
  request_id: str | None = None
  emailId: str | None = None
  user_id: int
  results: list[TemplateMatchCandidate]


# 9. draft 생성 스키마
# 현재 용어 기준에서 draft는 템플릿/초안 생성 단계다.
class DraftRequest(ApiModel):
  request_id: str
  mode: str
  emailId: str
  subject: str
  body: str = Field(validation_alias=AliasChoices("body", "body_clean"))
  domain: str
  intent: str
  summary: str
  mail_tone: str | None = Field(
    default=None,
    validation_alias=AliasChoices("mail_tone", "email_tone"),
  )
  rag_context: str | None = Field(
    default=None,
    validation_alias=AliasChoices("rag_context", "ragContext", "retrieved_context"),
  )
  previous_draft: str | None = None


class DraftResponse(ApiModel):
  request_id: str
  emailId: str
  draft_reply: str
  reply_embedding: list[float]
