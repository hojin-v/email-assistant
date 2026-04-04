# 문서 안내

EmailAssist 문서는 서비스 설계, 구현 핸드오프, 충돌/정보 공백 관리를 분리해 관리한다.

## 우선 읽을 문서

1. [architect.md](./architect.md)
2. [agents.md](./agents.md)
3. [concept-conflicts.md](./concept-conflicts.md)

## 기능 요구사항 표

- [사용자 요구사항.md](./사용자%20요구사항.md)
- [관리자 요구사항.md](./관리자%20요구사항.md)
- [frontend/docs/README.md](../frontend/docs/README.md)
- [template-generation-claude-process.md](./template-generation-claude-process.md)
- [template-generation-glossary.md](./template-generation-glossary.md)
- [rag-architecture.md](./rag-architecture.md)
- [rag-progress.md](./rag-progress.md)
- [rag-frontend-changes.md](./rag-frontend-changes.md)
- [rag-backend-changes.md](./rag-backend-changes.md)
- [rag-ai-changes.md](./rag-ai-changes.md)
- [ai-repo-modification-plan.md](./ai-repo-modification-plan.md)

## 문서별 역할

### architect.md

- 제공된 목차를 따르는 통합 설계서
- 서비스, 데이터, UI, API, AI, 인프라를 전체 관점에서 설명
- 현재 구현, 목표 상태, 임시 작성, 추가 정보 필요 항목을 함께 기록
- 현재는 로그인 → 온보딩 → 앱 진입 흐름과 인증/연동 구조의 기준 문서로 사용

### agents.md

- 구현 핸드오프 문서
- `Frontend`, `Backend`, `AI` 기준으로 바로 구현 가능한 정보 정리
- 현재 사실, 구현 기준, 임시 작성, 추가 정보 필요 항목을 구분
- 사용자/관리자 앱의 시나리오 기반 에러 화면과 캡처 준비 상태도 함께 참고

### concept-conflicts.md

- Notion/코드/설계 문서 간 충돌 기록
- 해결된 우선순위 규칙 정리
- 이후 사용자나 팀에 요청해야 할 정보 목록 관리

### frontend/docs/*

- 프론트-백엔드 연결 진행 상황과 화면별 백엔드 수정 요청 문서
- 백엔드 협업 시 우선 확인할 문서 묶음
- 현재는 아래 문서를 `frontend/docs`로 이동해 관리
  - `frontend-backend-integration-gap.md`
  - `calendar-backend-gap.md`
  - `inbox-backend-gap.md`
  - `automation-backend-gap.md`
  - `onboarding-backend-gap.md`

## 문서 작업 원칙

- 현재 구현 사실과 목표 상태를 반드시 구분한다.
- `frontend/App` 현재 상태는 코드 우선으로 적는다.
- 단, `domain`과 `intent` taxonomy는 AI 설계 문서를 우선한다.
- 관리자 콘솔의 현재 정식 진입 구조는 `frontend/App`의 `/admin/*` 라우트 기준으로 적는다.
- `frontend/Admin-Web`은 레거시 프로토타입 참조용으로만 구분해 적는다.
- 문서나 코드로 채울 수 없는 내용은 `임시 작성` 또는 `추가 정보 필요`로 명시한다.
- 새 충돌이나 정보 공백이 생기면 `concept-conflicts.md`에 먼저 기록한다.
- 설계서용 스크린샷은 `tools/design-capture`와 `?scenario=...` 규칙을 기준으로 생성한다.
- 스크린샷 실행은 가능하면 `tools/design-capture/run-in-docker.sh`를 사용해 Docker 컨테이너 안에서 수행한다.
