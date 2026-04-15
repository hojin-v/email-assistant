from __future__ import annotations

import numpy as np

from app.config import Settings
from app.services.claude_service import generate_onboarding_templates
from app.services.embedding import OpenAICompatibleEmbeddingService


class StubApiClient:
  def __init__(self):
    self.chat_payload = None
    self.embedding_payload = None

  def create_chat_completion(self, *, messages, model=None, stream=False):
    self.chat_payload = {
      "messages": messages,
      "model": model,
      "stream": stream,
    }
    return {"choices": [{"message": {"content": "unused"}}]}

  def create_embeddings(self, *, inputs, model=None):
    self.embedding_payload = {
      "inputs": inputs,
      "model": model,
    }
    return {
      "data": [
        {"index": 1, "embedding": [0.0, 3.0, 4.0]},
        {"index": 0, "embedding": [3.0, 4.0, 0.0]},
      ]
    }

def test_generate_onboarding_templates_parses_strict_json_payload(monkeypatch):
  class OnboardingStubClient:
    def __init__(self):
      self.chat_payload = None

    def create_chat_completion(self, *, messages, model=None, stream=False):
      self.chat_payload = {
        "messages": messages,
        "model": model,
        "stream": stream,
      }
      return {
        "choices": [
          {
            "message": {
              "content": """```json
{
  "templates": [
    {
      "variant_label": "기본 응답형",
      "title": "견적 요청 기본 응답 템플릿",
      "subject_template": "[견적 요청] 기본 안내드립니다",
      "body_template": "안녕하세요. 견적 요청 관련 기본 안내드립니다."
    },
    {
      "variant_label": "상세 안내형",
      "title": "견적 요청 상세 안내 템플릿",
      "subject_template": "[견적 요청] 상세 안내드립니다",
      "body_template": "안녕하세요. 가격과 도입 절차를 자세히 안내드립니다."
    }
  ]
}
```"""
            }
          }
        ]
      }

  stub_client = OnboardingStubClient()

  monkeypatch.setattr("app.services.claude_service._get_client", lambda: stub_client)
  monkeypatch.setattr("app.services.claude_service.settings.mock_mode", False)
  monkeypatch.setattr("app.services.claude_service.settings.llm_chat_model", "campus-chat")

  result = generate_onboarding_templates(
    category_name="견적 요청",
    variants=[
      {"variant_label": "기본 응답형", "template_purpose": "기본 안내를 제공하는 템플릿"},
      {"variant_label": "상세 안내형", "template_purpose": "구체적인 정보를 안내하는 템플릿"},
    ],
    industry_type="B2B SaaS",
  )

  assert [item["variant_label"] for item in result] == ["기본 응답형", "상세 안내형"]
  assert result[0]["title"] == "견적 요청 기본 응답 템플릿"
  assert "templates" in stub_client.chat_payload["messages"][0]["content"]


def test_generate_onboarding_templates_rejects_mismatched_variant_order(monkeypatch):
  class InvalidOnboardingStubClient:
    def create_chat_completion(self, *, messages, model=None, stream=False):
      return {
        "choices": [
          {
            "message": {
              "content": """{
  "templates": [
    {
      "variant_label": "상세 안내형",
      "title": "견적 요청 상세 안내 템플릿",
      "subject_template": "[견적 요청] 상세 안내드립니다",
      "body_template": "안녕하세요. 상세 안내드립니다."
    }
  ]
}"""
            }
          }
        ]
      }

  monkeypatch.setattr("app.services.claude_service._get_client", lambda: InvalidOnboardingStubClient())
  monkeypatch.setattr("app.services.claude_service.settings.mock_mode", False)

  try:
    generate_onboarding_templates(
      category_name="견적 요청",
      variants=[
        {"variant_label": "기본 응답형", "template_purpose": "기본 안내를 제공하는 템플릿"},
      ],
    )
  except ValueError as error:
    assert "variant_label" in str(error)
    return

  raise AssertionError("ValueError가 발생해야 합니다.")


def test_openai_compatible_embedding_service_normalizes_vectors():
  stub_client = StubApiClient()
  service = OpenAICompatibleEmbeddingService(
    model_name="campus-embedding",
    api_client=stub_client,
  )

  result = service.embed_texts(["첫 번째", "두 번째"])

  assert stub_client.embedding_payload == {
    "inputs": ["첫 번째", "두 번째"],
    "model": "campus-embedding",
  }
  assert service.dimensions == 3
  assert result.shape == (2, 3)
  assert np.allclose(result[0], np.array([0.6, 0.8, 0.0], dtype=np.float32))
  assert np.allclose(result[1], np.array([0.0, 0.6, 0.8], dtype=np.float32))


def test_openai_compatible_embedding_service_uses_embedding_specific_overrides(monkeypatch):
  captured = {}

  def fake_create_client(settings, *, base_url=None, api_key=None):
    captured["base_url"] = base_url
    captured["api_key"] = api_key
    return StubApiClient()

  monkeypatch.setattr(
    "app.services.embedding.create_openai_compatible_client_with_overrides",
    fake_create_client,
  )

  settings = Settings(
    llm_api_base_url="http://chat.example.com/v1",
    llm_api_key="chat-key",
    embedding_api_base_url="https://api.openai.com/v1",
    embedding_api_key="embed-key",
  )

  OpenAICompatibleEmbeddingService(
    model_name="text-embedding-3-small",
    settings=settings,
  )

  assert captured == {
    "base_url": "https://api.openai.com/v1",
    "api_key": "embed-key",
  }
