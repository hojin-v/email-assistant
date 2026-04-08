from __future__ import annotations

from app.schemas import DraftRequest, DraftResponse
from app.services.claude_service import generate_draft
from app.services.embedding import EmbeddingService


# 1. draft 생성 오케스트레이션
def run_draft(payload: DraftRequest, embedding_service: EmbeddingService) -> DraftResponse:
  # regenerate는 이전 초안이 있어야만 성립한다.
  if payload.mode == "regenerate" and not payload.previous_draft:
    raise ValueError("mode=regenerate 일 때 previous_draft 는 필수입니다.")

  # 실제 문장 생성은 Claude 서비스에 위임한다.
  draft_reply = generate_draft(
    subject=payload.subject,
    body=payload.body,
    domain=payload.domain,
    intent=payload.intent,
    summary=payload.summary,
    mode=payload.mode,
    previous_draft=payload.previous_draft or "",
    mail_tone=payload.mail_tone,
    rag_context=payload.rag_context,
  )

  # 생성된 초안도 같은 embedding 공간으로 벡터화한다.
  reply_embedding = embedding_service.embed_texts([draft_reply])[0].tolist()

  # API 응답 형식으로 묶어 반환한다.
  return DraftResponse(
    request_id=payload.request_id,
    emailId=payload.emailId,
    draft_reply=draft_reply,
    reply_embedding=reply_embedding,
  )
