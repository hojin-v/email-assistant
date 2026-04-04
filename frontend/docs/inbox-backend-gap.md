# 수신함 프론트-백엔드 연결 갭 정리

기준일: 2026-04-04

이 문서는 현재 `frontend/App` 수신함 화면 흐름을 기준으로, `Backend_Server` 실제 API와 아직 맞지 않는 항목을 정리한다.

## 1. 현재 연결된 범위

현재 실제 API로 연결한 범위:

- `GET /api/inbox`
- `GET /api/inbox/{emailId}`
- `POST /api/inbox/{emailId}/reply`

현재 화면에서 실제 액션으로 연결한 범위:

- 발송하기 → `SEND`
- 편집 후 발송 → `EDIT_SEND`
- 건너뛰기 → `SKIP`

## 2. 프론트 기준 상태 체계

현재 프론트 수신함은 아래 4개 상태로 본다.

- `pending`
- `completed`
- `unsent`
- `auto-sent`

의미:

- `pending`: 검토 대기
- `completed`: 사용자가 발송 완료
- `unsent`: 읽음 확인은 했지만 발송하지 않음
- `auto-sent`: 자동 발송됨

## 3. 현재 백엔드 상태 체계

현재 `EmailStatus`는 아래 3개다.

- `PENDING_REVIEW`
- `PROCESSED`
- `AUTO_SENT`

그리고 `DraftStatus`는 아래 4개다.

- `PENDING_REVIEW`
- `EDITED`
- `SENT`
- `SKIPPED`

즉 현재 `unsent`는 이메일 상태로 직접 존재하지 않고, 상세 응답에서 `draft_reply.status = SKIPPED`일 때만 추론 가능하다.

## 4. 현재 연결 방식

현재 프론트는 아래처럼 보강한다.

- 목록 응답의 `status=PROCESSED`는 일단 `completed`로 매핑
- 이후 상세 응답을 읽고 `draft_reply.status=SKIPPED`이면 `unsent`로 재분류

이 방식으로 현재 요구사항인 “읽음 확인은 했지만 답변을 발송하지 않은 메일” 묶음은 구현 가능하다.

다만 한계가 있다.

- 목록 API만으로는 `completed`와 `unsent`를 구분할 수 없음
- 프론트가 상세를 추가 조회해야 함
- 목록 규모가 커질수록 비효율적

## 5. 백엔드에 필요한 목록 API 보강

### 5.1 최소 보강안

`GET /api/inbox` 응답에 아래 필드 추가:

- `draft_status`

예시:

```json
{
  "email_id": 501,
  "sender_name": "박민수",
  "subject": "엔터프라이즈 플랜 가격 문의",
  "received_at": "2026-03-12T10:23:00",
  "status": "PROCESSED",
  "draft_status": "SKIPPED",
  "category_name": "가격문의",
  "schedule_detected": true,
  "has_attachments": true
}
```

이 정도만 추가돼도 프론트는 목록만으로 `completed`와 `unsent`를 안정적으로 구분할 수 있다.

### 5.2 더 좋은 보강안

목록 응답에 프론트 친화 상태를 별도 제공:

- `display_status`

가능 값:

- `PENDING_REVIEW`
- `COMPLETED`
- `UNSENT`
- `AUTO_SENT`

이 경우 프론트는 별도 재해석 없이 바로 탭 분류 가능하다.

## 6. 상세 API에 필요한 보강

현재 상세 응답에는 아래 값이 빠져 있다.

- `sender_email`

프론트 메일 상세 패널은 발신자 이메일 표시를 사용하므로, 아래 필드가 필요하다.

- `email_info.sender_email`

권장 예시:

```json
{
  "email_info": {
    "email_id": 501,
    "sender_name": "박민수",
    "sender_email": "minsu.park@techsolution.co.kr",
    "subject": "엔터프라이즈 플랜 가격 문의",
    "body": "...",
    "received_at": "2026-03-12T10:23:00",
    "has_attachments": true
  }
}
```

## 7. 일정 감지 정보의 한계

현재 상세 응답의 `ai_analysis.entities`는 구조가 고정돼 있지 않다.

그래서 프론트는 현재 아래 값이 있을 때만 일정 감지 카드를 안정적으로 보여줄 수 있다.

- `title`
- `date`
- `time` 또는 `start_time`
- `location`
- `participants`

이 값들이 AI/백엔드에서 고정 스키마로 오지 않으면 일정 카드 렌더링은 불안정할 수 있다.

## 8. 첨부파일/추천 초안/일정 액션의 현재 상태

백엔드 API는 이미 존재한다.

- `GET /api/inbox/{emailId}/attachments/{attachmentId}`
- `GET /api/inbox/{emailId}/recommendations`
- `POST /api/inbox/{emailId}/calendar`

하지만 현재 프론트 수신함 화면에는 아직 직접 연결하지 않았다.

이유:

- 첨부파일 UI가 아직 없음
- 추천 초안 비교 UX가 아직 없음
- 일정 액션은 캘린더 연결 범위와 함께 정리 필요

## 9. 백엔드 우선 보완 순서

1. `GET /api/inbox` 목록 응답에 `draft_status` 추가
2. 또는 목록 응답에 `display_status` 추가
3. `GET /api/inbox/{emailId}` 상세 응답에 `sender_email` 추가
4. `ai_analysis.entities`의 일정 관련 구조를 고정 스키마로 정리
5. 이후 추천 초안/첨부파일/일정 액션을 화면에 직접 연결
