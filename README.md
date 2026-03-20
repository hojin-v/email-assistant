# EmailAssist

EmailAssist는 반복적인 업무용 이메일 처리를 줄이기 위한 AI 기반 이메일 자동화 서비스입니다.  
수신 메일을 분류하고, 상황에 맞는 답변 초안을 제안하며, 일정 관련 메일은 캘린더 등록까지 이어질 수 있도록 설계되어 있습니다.

## 서비스 소개

이 서비스는 메일함을 단순히 보여주는 도구가 아니라, 실제 업무 흐름을 줄이는 보조 운영 도구를 목표로 합니다.

- 메일 카테고리 분류
- 답변 템플릿 추천 및 생성
- 비즈니스 정보 기반 맞춤 응답
- 일정 감지 및 캘린더 반영
- 자동화 규칙과 분류 기준 운영

## 사용자용 앱

`frontend/App`은 실사용자를 위한 이메일 업무 화면입니다.

- `Inbox`: 수신 메일 확인, 초안 검토, 발송/건너뛰기
- `Template Library`: 카테고리별 템플릿 조회, 생성, 수정
- `Calendar`: 일정 감지 결과 확인 및 일정 관리
- `Automation`: 자동 분류/자동화 규칙 설정
- `Business Profile`: 회사 정보, FAQ, 자료 업로드 기반 응답 품질 개선
- `Settings`: 계정, 알림, 이메일 연동 설정

첫 진입은 로그인/회원가입 화면이며, 로그인 후 온보딩에서 이메일 연동, 비즈니스 정보 입력, 카테고리 설정, 템플릿 생성까지 한 흐름으로 진행할 수 있습니다.

## 관리자용 앱

관리자 콘솔의 정식 런타임 진입점은 이제 `frontend/App` 내부의 `/admin/*`입니다.

- 운영 대시보드: 가입 사용자, 연동 완료 사용자, AI 분석/초안 생성 건수, 문의 접수 현황 요약
- 사용자 관리: 이름/이메일/업종 검색, 계정 활성/비활성, Google 연동 상태 조회와 강제 해제
- 템플릿 / 자동화 관리: 생성 템플릿 사용 현황 조회, 카테고리별 통계, 자동화 규칙 생성/수정/삭제
- 사용자 문의 대응: 상태별 문의 목록 조회, 상세 확인, 관리자 답변 작성과 이력 관리
- 시스템 운영 모니터링: 실패/대기 작업 강제 삭제

관리자 로그인은 계정 `role=ADMIN`과 VPN 허용 대역 IP를 함께 만족해야 하며, VPN 미승인 IP에서는 로그인 화면에서 접근 거부 UI를 표시합니다.

`frontend/Admin-Web`은 기존 관리자 프로토타입을 보존한 레거시 참조용 디렉터리로 유지합니다.

## 저장소 구성

- `frontend/App`: 사용자용 프론트엔드
- `frontend/Admin-Web`: 이전 관리자 콘솔 프로토타입 보관용 프론트엔드
- `backend`: 백엔드 코드
- `ai`: AI 관련 코드
- `docs`: 제품 및 운영 문서
- `tools/design-capture`: IA/기능구성도/스크린샷 산출물 생성 도구

## 설계 산출물 캡처

문서용 정상 화면과 에러 화면은 숨김 시나리오 모드로 캡처한다.

- URL 쿼리 `?scenario=<scenario-id>`가 있을 때만 에러/빈 상태/권한 없음 화면을 강제로 렌더링
- 사용자 앱 시나리오 정의: `frontend/App/src/shared/scenarios/user-scenarios.json`
- 관리자 앱 시나리오 정의: `frontend/App/src/admin/shared/scenarios/admin-scenarios.json`
- 산출물 생성 도구: `tools/design-capture`
- 기본 출력 경로: `/home/hojin/Projects/email-assistant-artifacts/design-doc/`
- Docker 실행 권장: `cd tools/design-capture && npm run docker:capture`
- Docker 이미지는 Playwright 런타임과 브라우저를 포함해 호스트 시스템 라이브러리 설치 없이 캡처하도록 구성했다.

## 참고

- 아키텍처 설계: [docs/architect.md](docs/architect.md)
- 구현 핸드오프 문서: [docs/agents.md](docs/agents.md)
- 충돌 및 후속 정보 요청 문서: [docs/concept-conflicts.md](docs/concept-conflicts.md)
- 문서 인덱스: [docs/README.md](docs/README.md)
- 개발 규칙과 운영 매뉴얼: [AGENTS.md](AGENTS.md)
