# AI Server Changes For RAG

기준일: 2026-04-06

## 결론

AI 서버는 RAG의 일부가 아니라 별도 생성/분석 서버로 남아야 한다.

RAG 연동 후 AI 서버는 다음에 집중한다.

- `classify`
- `summarize`
- `schedule extraction`

현재 목표 설계에서는 `AI draft generation`은 제거 대상이다.

## 필요한 수정

### 1. `draft` 책임 이동 범위 정리

목표 구조에서는 아래 책임을 AI에서 제거한다.

- `/draft`
- `q.2ai.draft`
- `q.2app.draft`
- `reply_embedding`

이유:

- 템플릿 매칭 이후 별도 LLM 재작성 단계가 없다.
- placeholder 치환도 현재 목표 범위에 없다.

보완:

- 여기서 제거 대상은 "AI 서버가 draft를 생성하는 책임"이다.
- queue 이름 자체를 반드시 없애야 한다는 뜻은 아니다.
- 가능하면 기존 `q.2ai.draft`, `q.2app.draft`를 그대로 두고 consumer만 RAG로 옮기는 것이 좋다.

주의:

- `draft_reply`라는 이름은 Backend/UI 응답 필드로는 남을 수 있다.
- 다만 그 의미는 "Claude가 새로 작성한 답장"이 아니라 "선택된 템플릿 기반으로 사용자에게 보여주는 답장 결과물"이다.

### 2. `classify` 응답 확장

AI 서버는 이미 내부적으로 계산하는 값을 Backend에도 내려줘야 한다.

필요 필드:

- `domain`
- `domain_confidence`
- `intent`
- `intent_confidence`
- `low_confidence`
- `top2_domains`
- `domain_source`

### 3. `summarize` 출력 확장

Backend가 email canonical text를 안정적으로 만들 수 있도록 다음이 필요하다.

- `summary`
- `keyphrases`
- `entities`
- `schedule_detected`
- `calendar_candidate`

### 4. `draft`는 RAG 서버가 담당

필요 입력:

- `request_id`
- `user_id`
- `industry_type`
- `mail_tone`
- `domain`
- `intent`
- `generation_mode`
- `retrieved_context`
- `constraints`

필요 출력:

- `title`
- `subject_template`
- `body_template`
- `metadata`

가능하면:

- Backend와 인프라 변경을 줄이기 위해 기존 draft queue 계약 재사용을 우선 검토한다.

## AI 서버가 하지 않는 것

- vector DB 관리
- similarity search
- chunk 저장
- 최종 template rerank
- 원본 파일 저장

## AI 서버와 RAG의 관계

- AI 서버는 검색을 수행하지 않는다.
- RAG가 검색한 `retrieved_context`를 입력으로 사용해 `draft`를 생성한다.
