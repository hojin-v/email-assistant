# EmailAssist

이 저장소는 `email_assistant` 원격을 기준으로 관리하는 통합 저장소입니다.

## 폴더 구조

- `frontend/App`: 사용자용 프론트엔드
- `frontend/Admin-Web`: 관리자용 프론트엔드
- `backend`: 백엔드 코드용 폴더
- `ai`: AI 관련 코드용 폴더
- `design`: 로컬 디자인 참고 자산
- `EmailAssistFigma`: 로컬 Figma 작업 자산

## 원격 저장소 역할

- `email_assistant`: 전체 프로젝트 저장소
- `web_front`: 프론트엔드 전용 저장소

## 운영 원칙

- 평소 개발은 이 저장소에서 진행합니다.
- 프론트 변경도 먼저 이 저장소에 커밋합니다.
- `web_front`에는 `frontend` subtree만 반영합니다.
- `web_front`에서 직접 작업하기보다, 이 저장소를 원본으로 유지하는 것을 권장합니다.

## 자주 쓰는 명령어

### 전체 저장소 push

```bash
git push
```

현재 로컬 `main`은 `email_assistant/main`을 추적합니다.

### 프론트만 web_front로 반영

```bash
git subtree push --prefix=frontend web_front main
```

필요하면 먼저 split 결과만 확인할 수 있습니다.

```bash
git subtree split --prefix=frontend
```

## 비고

- `frontend/.gitignore`는 프론트 전용 규칙만 관리합니다.
- 루트 `.gitignore`는 전체 저장소 기준으로 관리합니다.
