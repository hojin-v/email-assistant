import numpy as np

from app.services.index_store import IndexRecord
from app.services.draft_service import run_onboarding_template_draft


def test_run_onboarding_template_draft_builds_structured_result(monkeypatch):
  captured_kwargs = {}

  def _stub_generate_onboarding_templates(**kwargs):
    captured_kwargs.update(kwargs)
    return [
      {
        "variant_label": item["variant_label"],
        "title": f"견적 요청 {item['variant_label']} 템플릿",
        "subject_template": f"[견적 요청] {item['variant_label']} 안내드립니다",
        "body_template": "안녕하세요.\n견적 요청 관련 안내드립니다.",
      }
      for item in kwargs["variants"]
    ]

  monkeypatch.setattr(
    "app.services.draft_service.generate_onboarding_templates",
    _stub_generate_onboarding_templates,
  )

  response = run_onboarding_template_draft(
    category_id=3,
    category_name="견적 요청",
    category_keywords=["가격", "도입", "견적"],
    industry_type="B2B SaaS",
    company_description="기업용 업무자동화 서비스를 제공합니다.",
    email_tone="formal",
    rag_context="가격 정책과 도입 절차를 우선 안내한다.",
  )

  assert len(response) == 3
  assert response[0].category_id == 3
  assert response[0].category_name == "견적 요청"
  assert response[0].variant_label == "기본 응답형"
  assert response[1].variant_label == "상세 안내형"
  assert response[2].variant_label == "추가 정보 요청형"
  assert "업무자동화" in captured_kwargs["company_description"]
  assert captured_kwargs["category_name"] == "견적 요청"
  assert [item["variant_label"] for item in captured_kwargs["variants"]] == [
    "기본 응답형",
    "상세 안내형",
    "추가 정보 요청형",
  ]
  assert captured_kwargs["category_keywords"] == ["가격", "도입", "견적"]


def test_run_onboarding_template_draft_uses_knowledge_retrieval_context(monkeypatch):
  captured_kwargs = {}

  def _stub_generate_onboarding_templates(**kwargs):
    captured_kwargs.update(kwargs)
    return [
      {
        "variant_label": item["variant_label"],
        "title": f"견적 요청 {item['variant_label']} 템플릿",
        "subject_template": f"[견적 요청] {item['variant_label']} 안내드립니다",
        "body_template": "안녕하세요.\n견적 요청 관련 안내드립니다.",
      }
      for item in kwargs["variants"]
    ]

  monkeypatch.setattr(
    "app.services.draft_service.generate_onboarding_templates",
    _stub_generate_onboarding_templates,
  )
  monkeypatch.setattr(
    "app.services.draft_service.embedding_service.embed_texts",
    lambda texts: np.asarray([[1.0, 0.0, 0.0]], dtype=np.float32),
  )
  monkeypatch.setattr(
    "app.services.draft_service.vector_store.search",
    lambda **kwargs: [
      (
        IndexRecord(
          record_id="faq:1:0",
          vector=np.zeros(3, dtype=np.float32),
          payload={
            "source_type": "faq",
            "title": "가격 정책",
            "chunk_text": "초기 도입 고객에게는 월 구독형 요금제를 우선 안내합니다.",
          },
        ),
        0.91,
      )
    ],
  )

  run_onboarding_template_draft(
    user_id=9,
    category_id=3,
    category_name="견적 요청",
    category_keywords=["가격", "도입"],
    industry_type="B2B SaaS",
    company_description="기업용 업무자동화 서비스를 제공합니다.",
    email_tone="formal",
    rag_context="회사 소개를 참고합니다.",
  )

  assert "[고정 참고 문맥]" in captured_kwargs["rag_context"]
  assert "[검색된 참고 자료]" in captured_kwargs["rag_context"]
  assert "가격 정책" in captured_kwargs["rag_context"]
  assert captured_kwargs["category_keywords"] == ["가격", "도입"]
