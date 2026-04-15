from __future__ import annotations

from dataclasses import dataclass

from app.config import settings
from app.services.claude_service import generate_onboarding_templates
from app.services.runtime import embedding_service, knowledge_namespace, vector_store


@dataclass
class OnboardingTemplateDraft:
  category_id: int | None
  category_name: str
  variant_label: str
  template_purpose: str
  title: str
  subject_template: str
  body_template: str


@dataclass(frozen=True)
class OnboardingTemplateVariant:
  label: str
  purpose: str


DEFAULT_ONBOARDING_TEMPLATE_VARIANTS: list[OnboardingTemplateVariant] = [
  OnboardingTemplateVariant(
    label="기본 응답형",
    purpose="첫 문의에 빠르게 답하면서 요청 접수와 기본 안내를 전달하는 템플릿",
  ),
  OnboardingTemplateVariant(
    label="상세 안내형",
    purpose="도입 절차, 가격, 기능, 다음 단계처럼 더 구체적인 정보를 풍부하게 안내하는 템플릿",
  ),
  OnboardingTemplateVariant(
    label="추가 정보 요청형",
    purpose="답변에 필요한 정보가 부족할 때 필요한 항목을 정리해 추가 정보를 요청하는 템플릿",
  ),
]


def _truncate_text(value: str, limit: int) -> str:
  text = value.strip()
  if len(text) <= limit:
    return text
  return f"{text[:limit].rstrip()}..."


def _build_onboarding_query_text(
  *,
  category_name: str,
  category_keywords: list[str] | None,
  industry_type: str | None,
  company_description: str | None,
) -> str:
  lines = [f"category: {category_name.strip()}"]
  cleaned_keywords = [keyword.strip() for keyword in (category_keywords or []) if keyword and keyword.strip()]
  if cleaned_keywords:
    lines.append(f"category_keywords: {', '.join(cleaned_keywords)}")
  if industry_type and industry_type.strip():
    lines.append(f"industry: {industry_type.strip()}")
  if company_description and company_description.strip():
    lines.append(f"company: {_truncate_text(company_description, 300)}")
  return "\n".join(lines)


def _build_retrieved_context(
  *,
  user_id: int | None,
  category_name: str,
  category_keywords: list[str] | None,
  industry_type: str | None,
  company_description: str | None,
  top_k: int,
) -> str | None:
  if user_id is None:
    return None

  query_text = _build_onboarding_query_text(
    category_name=category_name,
    category_keywords=category_keywords,
    industry_type=industry_type,
    company_description=company_description,
  )
  query_vector = embedding_service.embed_texts([query_text])[0]
  matches = vector_store.search(
    namespace=knowledge_namespace(user_id),
    query_vector=query_vector,
    top_k=max(1, top_k),
    filters={"source_type": ["faq", "manual"]},
  )
  if not matches:
    return None

  lines = ["[검색된 참고 자료]"]
  for index, (record, _score) in enumerate(matches, start=1):
    title = str(record.payload.get("title") or "").strip()
    source_type = str(record.payload.get("source_type") or "").strip()
    chunk_text = _truncate_text(str(record.payload.get("chunk_text") or "").strip(), 700)
    if not chunk_text:
      continue
    header = f"{index}. ({source_type}) {title}".strip()
    lines.append(header)
    lines.append(chunk_text)

  if len(lines) == 1:
    return None
  return "\n".join(lines)


def _merge_rag_contexts(static_context: str | None, retrieved_context: str | None) -> str | None:
  sections = []
  if static_context and static_context.strip():
    sections.append("[고정 참고 문맥]\n" + static_context.strip())
  if retrieved_context and retrieved_context.strip():
    sections.append(retrieved_context.strip())
  if not sections:
    return None
  return "\n\n".join(sections)


def run_onboarding_template_draft(
  *,
  user_id: int | None = None,
  category_id: int | None,
  category_name: str,
  category_keywords: list[str] | None = None,
  industry_type: str | None = None,
  company_description: str | None = None,
  email_tone: str | None = None,
  rag_context: str | None = None,
  template_count: int = 3,
) -> list[OnboardingTemplateDraft]:
  variants = DEFAULT_ONBOARDING_TEMPLATE_VARIANTS[: max(1, min(template_count, len(DEFAULT_ONBOARDING_TEMPLATE_VARIANTS)))]
  retrieved_context = _build_retrieved_context(
    user_id=user_id,
    category_name=category_name,
    category_keywords=category_keywords,
    industry_type=industry_type,
    company_description=company_description,
    top_k=settings.default_top_k,
  )
  variant_payloads = [
    {
      "variant_label": variant.label,
      "template_purpose": variant.purpose,
    }
    for variant in variants
  ]
  templates = generate_onboarding_templates(
    category_name=category_name,
    variants=variant_payloads,
    category_keywords=category_keywords,
    industry_type=industry_type,
    company_description=company_description,
    email_tone=email_tone,
    rag_context=_merge_rag_contexts(rag_context, retrieved_context),
  )

  drafts: list[OnboardingTemplateDraft] = []
  for template, variant in zip(templates, variants, strict=True):
    drafts.append(
      OnboardingTemplateDraft(
        category_id=category_id,
        category_name=category_name,
        variant_label=variant.label,
        template_purpose=variant.purpose,
        title=template["title"],
        subject_template=template["subject_template"],
        body_template=template["body_template"],
      )
    )

  return drafts
