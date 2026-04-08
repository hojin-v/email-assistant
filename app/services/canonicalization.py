from __future__ import annotations

from collections.abc import Iterable

from app.schemas import TemplateMetadataInput


def _normalize_value(value: object) -> str | None:
  if value is None:
    return None
  text = str(value).strip()
  return text or None


def _extend_lines(lines: list[str], title: str, values: Iterable[object]) -> None:
  # Canonical text는 안정적이어야 하므로
  # embedding 전에 중복 metadata 값을 제거한다.
  cleaned = [_normalize_value(value) for value in values]
  unique_values = []
  seen: set[str] = set()
  for value in cleaned:
    if value and value not in seen:
      seen.add(value)
      unique_values.append(value)
  if unique_values:
    lines.append(f"{title}: {', '.join(unique_values)}")


def build_email_canonical_text(
  subject: str,
  body_clean: str,
  summary: str | None = None,
  keyphrases: list[str] | None = None,
  domain: str | None = None,
  intent: str | None = None,
  entities: dict[str, object] | None = None,
) -> str:
  # template matching에 사용할 단일 텍스트 표현이다.
  # 원문과 구조화된 AI 결과를 함께 반영하도록 의도했다.
  lines = [
    f"subject: {subject.strip()}",
    f"body: {body_clean.strip()}",
  ]
  if summary and summary.strip():
    lines.append(f"summary: {summary.strip()}")
  if domain and domain.strip():
    lines.append(f"domain: {domain.strip()}")
  if intent and intent.strip():
    lines.append(f"intent: {intent.strip()}")
  _extend_lines(lines, "keyphrases", keyphrases or [])
  if entities:
    entity_values = [f"{key}={value}" for key, value in entities.items() if _normalize_value(value)]
    _extend_lines(lines, "entities", entity_values)
  return "\n".join(lines).strip()


def build_template_canonical_text(
  title: str,
  category_name: str,
  email_tone: str | None,
  domain: str | None,
  metadata: TemplateMetadataInput,
) -> str:
  # template retrieval은 최종 답장 문장보다
  # "이 템플릿을 언제 써야 하는지"를 더 강하게 반영해야 한다.
  lines = [
    f"title: {title.strip()}",
    f"category: {category_name.strip()}",
  ]
  if email_tone and email_tone.strip():
    lines.append(f"tone: {email_tone.strip()}")
  if domain and domain.strip():
    lines.append(f"domain: {domain.strip()}")
  if metadata.template_purpose:
    lines.append(f"purpose: {metadata.template_purpose.strip()}")
  if metadata.search_summary:
    lines.append(f"search_summary: {metadata.search_summary.strip()}")
  _extend_lines(lines, "recommended_situations", metadata.recommended_situations)
  _extend_lines(lines, "required_points", metadata.required_points)
  _extend_lines(lines, "must_avoid", metadata.must_avoid)
  _extend_lines(lines, "variables", metadata.variables)
  _extend_lines(lines, "semantic_keywords", metadata.semantic_keywords)
  _extend_lines(lines, "negative_keywords", metadata.negative_keywords)
  return "\n".join(lines).strip()
