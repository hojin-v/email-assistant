from app.schemas import TemplateMetadataInput
from app.services.canonicalization import build_email_canonical_text, build_template_canonical_text


def test_build_email_canonical_text_includes_structured_fields():
  canonical = build_email_canonical_text(
    subject="엔터프라이즈 플랜 문의",
    body_clean="안녕하세요. 가격과 도입 일정을 알고 싶습니다.",
    summary="가격 및 일정 문의",
    keyphrases=["가격", "도입 일정"],
    domain="Sales",
    intent="견적 요청",
    entities={"company": "ABC Corp", "date": "2026-04-10"},
  )

  assert "subject: 엔터프라이즈 플랜 문의" in canonical
  assert "summary: 가격 및 일정 문의" in canonical
  assert "domain: Sales" in canonical
  assert "intent: 견적 요청" in canonical
  assert "entities: company=ABC Corp, date=2026-04-10" in canonical


def test_build_template_canonical_text_includes_metadata():
  canonical = build_template_canonical_text(
    title="가격 안내 템플릿",
    category_name="견적 요청",
    email_tone="NEUTRAL",
    domain="Sales",
    metadata=TemplateMetadataInput(
      template_purpose="가격 및 플랜 안내",
      recommended_situations=["엔터프라이즈 문의", "플랜 비교 요청"],
      required_points=["가격표", "도입 절차"],
      semantic_keywords=["가격", "견적", "플랜"],
      negative_keywords=["환불", "장애"],
      search_summary="가격 문의에 대한 첫 응답",
    ),
  )

  assert "title: 가격 안내 템플릿" in canonical
  assert "category: 견적 요청" in canonical
  assert "tone: NEUTRAL" in canonical
  assert "purpose: 가격 및 플랜 안내" in canonical
  assert "semantic_keywords: 가격, 견적, 플랜" in canonical
