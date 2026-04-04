# 프론트-백엔드 연결 정리

기준일: 2026-04-04

이 문서는 `Backend_Server` 실제 구현을 우선 기준으로 삼아, 현재 프론트와의 연결 상태를 정리한다.

우선순위는 다음과 같다.

1. `Backend_Server` 실제 컨트롤러, DTO, 엔티티
2. `Backend_Server/tasks/todo.md`
3. `Backend_Server/claude.md`
4. 보조 문서(`db.md`, 루트 `docs/architect.md`)

## 이번 작업에서 실제 연결한 범위

- 로그인: `POST /api/auth/tokens`
- 회원가입: `POST /api/users`
- 세션 복원: 저장된 JWT 기준 `/api/users/me`, `/api/integrations/me`, `/api/business/profile`
- 사용자 대시보드:
  - `GET /api/dashboard/summary`
  - `GET /api/dashboard/schedules`
  - `GET /api/dashboard/weekly-summary`
  - `GET /api/dashboard/recent-emails`
- 수신함:
  - `GET /api/inbox`
  - `GET /api/inbox/{emailId}`
  - `POST /api/inbox/{emailId}/reply`
- 상단 알림 패널:
  - `GET /api/notifications`
  - `PATCH /api/notifications/{id}/read`
  - `PATCH /api/notifications/read-all`
- 설정 > 계정:
  - `GET /api/users/me`
  - `PATCH /api/users/me`
  - `DELETE /api/users/me`
  - `PATCH /api/users/me/password`
- 설정 > 이메일 연동:
  - `GET /api/integrations/me`
  - `GET /api/integrations/google/authorization-url`
  - `DELETE /api/integrations/me`
- 비즈니스 프로필:
  - `GET /api/business/profile`
  - `PUT /api/business/profile`
  - `GET /api/business/resources/files`
  - `POST /api/business/resources/files`
  - `DELETE /api/business/resources/files/{resourceId}`
  - `GET /api/business/resources/faqs`
  - `POST /api/business/resources/faqs`
  - `PUT /api/business/resources/faqs/{faqId}`
  - `DELETE /api/business/resources/faqs/{faqId}`
  - `GET /api/business/categories`
  - `GET /api/templates`
  - `POST /api/business/templates/regenerate`
- 템플릿 라이브러리:
  - `GET /api/templates`
  - `POST /api/templates`
  - `PUT /api/templates/{templateId}`
  - `DELETE /api/templates/{templateId}`
  - `GET /api/business/categories`
- 캘린더:
  - `GET /api/calendar/events`
  - `POST /api/calendar/events`
  - `PUT /api/calendar/events/{eventId}`
  - `PATCH /api/calendar/events/{eventId}/confirm`
  - `DELETE /api/calendar/events/{eventId}`
- 자동화 설정:
  - `GET /api/automations/rules`
  - `POST /api/automations/rules`
  - `DELETE /api/automations/rules/{ruleId}`
  - `PATCH /api/automations/rules/{ruleId}/auto-send`
  - `GET /api/business/categories`
  - `GET /api/templates`
  - `GET /api/integrations/me`
- 설정 > 관리자 문의:
  - `GET /api/support-tickets`
  - `GET /api/support-tickets/{ticketId}`
  - `POST /api/support-tickets`
- 관리자 대시보드:
  - `GET /api/admin/dashboard/summary`
  - `GET /api/admin/dashboard/email-volume`
  - `GET /api/admin/dashboard/domain-distribution`
  - `GET /api/admin/dashboard/weekly-trend`
  - `GET /api/admin/support-tickets`
- 프론트 dev 서버:
  - `/api` 요청을 `http://localhost:8080`으로 프록시
  - 필요 시 `VITE_BACKEND_ORIGIN` 또는 `VITE_API_BASE_URL`로 변경 가능

## 현재 기준으로 정리가 필요한 항목

### 1. 비밀번호 재설정

- 프론트 로그인 화면에는 재설정 UI가 있다.
- 백엔드에는 `forgot/reset password` 플로우가 없다.
- 현재는 연결하지 않았고, 화면에서는 미구현 안내만 한다.

### 2. 관리자 VPN/IP 제한

- 이전 프론트는 관리자 로그인 시 VPN CIDR을 클라이언트에서 검증했다.
- 실제 백엔드는 `/api/admin/**`에 대해 `ROLE_ADMIN`만 검사한다.
- 이번 연결에서는 백엔드 기준으로 맞춰 클라이언트 VPN 차단 로직을 제거했다.
- 실제 VPN/IP 제한이 필요하면 백엔드 보안 정책으로 다시 구현해야 한다.

### 3. Gmail 다중 계정

- 이전 프론트는 여러 Gmail 계정을 추가하는 UX를 가지고 있었다.
- 실제 백엔드 `Integration`은 사용자당 하나의 연동만 허용한다.
- 이번 연결에서는 단일 Google 계정 연동 기준으로 화면을 단순화했다.
- 멀티 계정이 필요하면 백엔드 DB 모델과 API부터 바꿔야 한다.

### 4. OAuth 콜백 사용자 경험

- 백엔드는 Google OAuth 콜백에서 JSON 응답을 반환한다.
- 프론트로 다시 리다이렉트하거나 상태를 전달하지 않는다.
- 그래서 현재는 새 탭에서 인증을 시작하고, 인증 후 설정 화면에서 새로고침해 연동 상태를 다시 읽는 방식으로 연결했다.
- 추후에는 백엔드가 프론트 라우트로 redirect 하거나, 프론트-백엔드 간 OAuth bridge를 추가하는 편이 낫다.

### 5. 온보딩 완료 기준

- 프론트 라우터는 `onboardingCompleted` 플래그를 사용한다.
- 백엔드에는 “온보딩 완료”를 직접 저장하거나 조회하는 API가 없다.
- 현재는 아래 규칙으로 임시 판단한다.
  - 관리자: 항상 완료
  - 일반 사용자: Google 연동 또는 비즈니스 프로필이 있으면 완료로 간주
- 이 기준은 임시 규칙이므로 별도 계약이 필요하다.

### 6. 설정 저장 범위

- `설정 > 알림`, `설정 > 화면`은 프론트 로컬 상태만 있다.
- 백엔드에는 알림 선호값 저장 API, 화면 위젯/테마 저장 API가 없다.
- 현재는 기존 로컬 동작을 유지한다.

### 7. 아직 mock 상태인 화면

- 사용자 온보딩: 완료 기준과 OAuth 콜백 UX가 먼저 정리돼야 함
- 관리자 사용자/문의/모니터링/템플릿-자동화 일부 화면: 아직 mock 기반

## 현재 연결 방식 메모

- 비즈니스 프로필과 템플릿 라이브러리는 일반 진입에서는 실제 API를 사용한다.
- 캘린더도 일반 진입에서는 실제 API를 사용한다.
- 수신함도 일반 진입에서는 실제 API를 사용한다.
- 다만 `profile-*`, `templates-*` 시나리오에서는 기존 목업 데이터를 유지해 스크린샷 산출물과 상태 재현 테스트를 계속할 수 있게 했다.
- 캘린더도 `calendar-*` 시나리오에서는 기존 목업 데이터를 유지한다.
- 수신함도 `inbox-*` 시나리오에서는 기존 목업 데이터를 유지한다.
- 자동화 설정도 `automation-*` 시나리오에서는 기존 목업 데이터를 유지한다.
- 템플릿 수정에서는 백엔드 계약상 카테고리 변경을 지원하지 않으므로, 수정 화면에서는 카테고리를 읽기 전용으로 처리한다.
- 캘린더는 현재 백엔드 계약상 `제목 / 시작시간 / 종료시간 / 상태` 중심으로만 연결했고, 장소/참석자/메모 등 누락 항목은 [calendar-backend-gap.md](/home/hojin/Projects/email-assistant/docs/calendar-backend-gap.md)에 별도로 정리했다.
- 수신함은 현재 `미발송` 상태를 상세의 `draft status = SKIPPED`를 이용해 보강 판별하고 있으며, 목록 계약/발신자 이메일/일정 카드 구조의 누락 항목은 [inbox-backend-gap.md](/home/hojin/Projects/email-assistant/docs/inbox-backend-gap.md)에 정리했다.
- 자동화 설정은 현재 `카테고리 카드 = 여러 규칙 묶음`으로 프론트가 직접 그룹핑하고 있으며, bulk 저장/전역 캘린더 자동 등록처럼 아직 직접 지원되지 않는 항목은 [automation-backend-gap.md](/home/hojin/Projects/email-assistant/docs/automation-backend-gap.md)에 정리했다.

## 후속 작업 권장 순서

1. 관리자 나머지 화면 연결
2. 비밀번호 재설정, 온보딩 완료 기준, OAuth redirect UX 확정
