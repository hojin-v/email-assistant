# 온보딩 백엔드 갭 정리

기준일: 2026-04-04

이 문서는 사용자 온보딩 화면을 기존 백엔드 API에 연결하면서 확인된 부족 항목을 정리한다.

## 현재 프론트가 실제로 연결하는 범위

- `GET /api/integrations/me`
- `GET /api/integrations/google/authorization-url`
- `GET /api/business/profile`
- `PUT /api/business/profile`
- `GET /api/business/resources/files`
- `POST /api/business/resources/files`
- `DELETE /api/business/resources/files/{resourceId}`
- `GET /api/business/resources/faqs`
- `POST /api/business/resources/faqs`
- `DELETE /api/business/resources/faqs/{faqId}`
- `GET /api/business/categories`
- `POST /api/business/categories`
- `DELETE /api/business/categories/{categoryId}`
- `GET /api/templates`
- `POST /api/business/templates/regenerate`

즉 현재 온보딩은 여러 개의 개별 API를 조합해서 동작한다.

## 백엔드에 없는 핵심 개념

### 1. 온보딩 전용 엔드포인트

- 현재는 `온보딩 시작`, `온보딩 저장`, `온보딩 완료`를 직접 표현하는 API가 없다.
- 프론트가 프로필/자료/FAQ/카테고리 API를 순서대로 호출해 화면 흐름을 구성하고 있다.

필요한 API 예시:

- `GET /api/onboarding`
- `PUT /api/onboarding/profile`
- `PUT /api/onboarding/resources`
- `POST /api/onboarding/complete`

### 2. 온보딩 완료 상태 저장

- 현재 백엔드에는 `onboarding_completed`를 직접 저장하거나 조회하는 계약이 없다.
- 프론트는 세션 플래그와 기존 프로필/연동 존재 여부로 임시 판정한다.

필요한 항목 예시:

- `Users.onboarding_completed BOOLEAN`
- `GET /api/onboarding/status`

### 3. OAuth 완료 후 프론트 복귀

- Google OAuth 콜백은 현재 JSON 응답으로 끝난다.
- 온보딩 화면으로 돌아와 자동으로 다음 단계로 넘어가는 흐름이 없다.
- 프론트는 인증 URL을 새 창으로 열고 `GET /api/integrations/me`를 반복 조회해 연결 여부를 확인한다.

필요한 개선 예시:

- 백엔드 콜백에서 프론트 온보딩 경로로 redirect
- 또는 popup/bridge용 프론트 전용 콜백 URL 지원

## 현재 가장 큰 미구현: 초기 템플릿 생성

### 현재 백엔드가 지원하는 것

- `POST /api/business/templates/regenerate`
- 이미 존재하는 템플릿에 대해서만 `PROCESSING` 응답을 반환

### 현재 백엔드가 지원하지 않는 것

- 온보딩 직후 템플릿이 하나도 없는 사용자에 대한 `초기 템플릿 생성`

현재 `BusinessService.regenerateTemplates()`는:

- `regenerate_all=true`면 기존 템플릿 개수를 세고
- `regenerate_all=false`면 전달된 `template_ids`를 검증한 뒤
- 재생성 가능한 템플릿 수가 0이면 예외를 반환한다

즉 새 사용자가 온보딩 마지막 단계에서 `처음 템플릿을 만드는 것`은 현재 계약상 불가능하다.

필요한 API 예시:

- `POST /api/business/templates/generate-initial`

권장 요청값 예시:

- `industry_type`
- `email_tone`
- `company_description`
- `category_ids`
- `faq_ids`
- `resource_ids`

권장 응답값 예시:

- `status`
- `processing_count`
- `job_id` 또는 추적 가능한 식별자

## 프론트가 현재 보완 처리하는 방식

- 이메일 연동: authorization URL 발급 후 연동 상태 polling
- 프로필/자료/FAQ/카테고리: 각 API를 온보딩 단계에서 직접 호출
- 초기 템플릿 생성: 기존 템플릿이 없으면 마지막 단계 완료를 막고 경고 메시지를 보여 줌

즉 현재 온보딩은 `1~2단계는 실연동`, `3단계 초기 템플릿 생성은 백엔드 계약 부족` 상태다.
