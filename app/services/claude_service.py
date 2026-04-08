from __future__ import annotations

import anthropic

from app.config import settings


# 1. Claude client 준비
def _get_client() -> anthropic.Anthropic:
  api_key = settings.anthropic_api_key
  if not api_key:
    raise ValueError("ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.")
  return anthropic.Anthropic(api_key=api_key)


# 2. 개발용 mock 응답
def _mock_response(domain: str, intent: str, mode: str) -> str:
  return f"""[MOCK] 답장 초안

안녕하세요.

문의하신 {intent} 관련하여 답변 드립니다.
도메인: {domain} | 모드: {mode}

확인 후 빠른 시일 내에 처리해 드리겠습니다.

감사합니다.
[MOCK 응답 - 실제 Claude API 호출 아님]"""


def _build_prompt(
  *,
  subject: str,
  body: str,
  domain: str,
  intent: str,
  summary: str,
  mode: str,
  previous_draft: str = "",
  mail_tone: str | None = None,
  rag_context: str | None = None,
) -> str:
  # 이메일 원문, 분석 결과, 검색 문맥을 한곳에서 합쳐 프롬프트를 만든다.
  mode_section = ""
  if mode == "regenerate" and previous_draft:
    mode_section = f"\n[이전 초안]\n{previous_draft}\n\n이전 초안을 개선하여 다시 작성해주세요."

  tone_section = ""
  if mail_tone:
    tone_section = f"- 답장 어조는 {mail_tone} 기준으로 작성\n"

  context_section = ""
  if rag_context:
    context_section = f"\n[참고 문맥]\n{rag_context}\n"

  return f"""당신은 한국 비즈니스 이메일 답장 작성 전문가입니다.
아래 정보를 바탕으로 적절한 답장 초안을 작성해주세요.
{mode_section}

[수신 이메일]
제목: {subject}
본문: {body}

[요약]
{summary}

[분류 결과]
도메인: {domain}
인텐트: {intent}
{context_section}
[작성 조건]
- 인사말과 맺음말 포함
{tone_section}- 비즈니스 맥락에 맞는 전문적인 표현 사용
- 불필요한 내용 없이 간결하게 작성
- 답장 본문만 출력 (설명이나 부가 텍스트 없이)
"""


def generate_draft(
  *,
  subject: str,
  body: str,
  domain: str,
  intent: str,
  summary: str = "",
  mode: str = "generate",
  previous_draft: str = "",
  mail_tone: str | None = None,
  rag_context: str | None = None,
) -> str:
  # mock mode면 외부 API 없이 로컬 응답으로 대체한다.
  if settings.mock_mode:
    return _mock_response(domain, intent, mode)

  client = _get_client()
  prompt = _build_prompt(
    subject=subject,
    body=body,
    domain=domain,
    intent=intent,
    summary=summary,
    mode=mode,
    previous_draft=previous_draft,
    mail_tone=mail_tone,
    rag_context=rag_context,
  )

  message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": prompt}],
  )

  return message.content[0].text.strip()
