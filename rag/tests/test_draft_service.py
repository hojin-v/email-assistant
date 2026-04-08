from app.schemas import DraftRequest
from app.services.draft_service import run_draft


class StubEmbeddingService:
  def embed_texts(self, texts: list[str]):
    class _Vector:
      def __init__(self, values):
        self._values = values

      def tolist(self):
        return self._values

    class _Matrix:
      def __getitem__(self, index):
        if index != 0:
          raise IndexError(index)
        return _Vector([0.1, 0.2, 0.3])

    return _Matrix()


def test_run_draft_builds_response(monkeypatch):
  monkeypatch.setattr(
    "app.services.draft_service.generate_draft",
    lambda **kwargs: "생성된 초안",
  )

  payload = DraftRequest(
    request_id="req-1",
    mode="generate",
    emailId="email-1",
    subject="문의드립니다",
    body="본문",
    domain="sales",
    intent="가격문의",
    summary="가격 관련 문의입니다.",
  )

  response = run_draft(payload, StubEmbeddingService())

  assert response.request_id == "req-1"
  assert response.emailId == "email-1"
  assert response.draft_reply == "생성된 초안"
  assert response.reply_embedding == [0.1, 0.2, 0.3]


def test_run_draft_requires_previous_draft_for_regenerate():
  payload = DraftRequest(
    request_id="req-2",
    mode="regenerate",
    emailId="email-2",
    subject="문의드립니다",
    body="본문",
    domain="sales",
    intent="가격문의",
    summary="가격 관련 문의입니다.",
  )

  try:
    run_draft(payload, StubEmbeddingService())
  except ValueError as error:
    assert "previous_draft" in str(error)
    return

  raise AssertionError("ValueError가 발생해야 합니다.")
