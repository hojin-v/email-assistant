# EmailAssist RAG Server

EmailAssist의 별도 RAG 서버입니다.

이 서비스는 아래 책임에 집중합니다.

- 비즈니스 프로필, FAQ, 업로드 문서 텍스트 정규화
- chunking
- embedding 생성
- knowledge chunk 검색
- template metadata embedding 저장 및 email-template candidate search
- Claude 기반 생성 영역 관리

현재 상태:

- FastAPI 기반 최소 실행 스캐폴드
- 기본 embedding backend는 로컬 해시 임베딩
- PDF는 LangChain 기반 semantic chunking을 우선 시도하고, 실패하면 기존 chunking으로 fallback
- 기본 vector backend는 Chroma persistent collection
- PDF/TXT 텍스트 추출 엔드포인트 포함
- `AI` 레포의 `draft` / `claude_service` 생성 영역을 `RAG` 내부 서비스로 포함
- 아직 Backend_Server, frontend/App, ai 서버와 직접 연결되지는 않음

## Folder Structure

`rag/`는 크게 `앱 코드`, `테스트`, `내부 문서`, `실행 설정`으로 나뉩니다.

```text
rag/
├─ app/
│  ├─ main.py
│  ├─ config.py
│  ├─ schemas.py
│  └─ services/
│     ├─ canonicalization.py
│     ├─ claude_service.py
│     ├─ chunking.py
│     ├─ draft_service.py
│     ├─ document_chunking.py
│     ├─ document_parser.py
│     ├─ embedding.py
│     └─ index_store.py
├─ tests/
│  ├─ test_canonicalization.py
│  ├─ test_chunking.py
│  ├─ test_document_chunking.py
│  ├─ test_draft_service.py
│  └─ test_index_store.py
├─ docs/
│  ├─ README.md
│  ├─ current-status.md
│  ├─ progress-log.md
│  ├─ ownership.md
│  ├─ backend-server-changes.md
│  └─ ai-server-changes.md
├─ pyproject.toml
├─ .env.example
├─ Dockerfile
└─ README.md
```

## File Roles

### App

- `app/main.py`
  - FastAPI 엔드포인트 진입점
  - 요청을 받아 canonicalization, indexing, matching 서비스에 연결
- `app/config.py`
  - 환경변수와 기본 설정값 관리
  - embedding backend, chunking backend, chunk size 같은 런타임 설정 보관
- `app/schemas.py`
  - API 요청/응답 스키마 정의
  - `AI/` 레포 naming과의 호환 alias 포함

### Services

- `app/services/canonicalization.py`
  - email canonical text
  - template canonical text 생성 규칙 관리
- `app/services/chunking.py`
  - 기본 native chunking
  - 문단 기반 + 길이 제한 + overlap 처리
- `app/services/claude_service.py`
  - Claude API 호출과 생성 프롬프트 관리
  - mock mode 포함
- `app/services/draft_service.py`
  - draft 요청 검증
  - 생성 결과와 reply embedding 조합
- `app/services/document_chunking.py`
  - 문서 종류별 chunking 진입점
  - PDF는 LangChain semantic chunking 우선 시도
  - 실패 시 native chunking으로 fallback
- `app/services/document_parser.py`
  - TXT/PDF 텍스트 추출
  - 현재는 `pypdf` 기반 단순 추출
- `app/services/embedding.py`
  - hash fallback embedding
  - sentence-transformer embedding backend 선택 및 생성
- `app/services/index_store.py`
  - namespace별 vector index 관리
  - Chroma collection 기반 upsert / search
  - user namespace를 collection 이름으로 분리
  - metadata filter와 persistent directory 관리

### Tests

- `tests/test_canonicalization.py`
  - canonical text 생성 규칙 테스트
- `tests/test_chunking.py`
  - native chunking 기본 동작 테스트
- `tests/test_document_chunking.py`
  - PDF LangChain 경로와 fallback 경로 테스트
- `tests/test_draft_service.py`
  - 생성 서비스의 기본 응답 조합 테스트
- `tests/test_index_store.py`
  - Chroma collection 기반 vector upsert / search 테스트

### Docs

- `docs/README.md`
  - `rag/docs` 내부 문서 인덱스
- `docs/current-status.md`
  - 현재 구현된 기능과 미구현 범위 기록
- `docs/progress-log.md`
  - 작업 진행 내역을 날짜순으로 누적 기록
- `docs/ownership.md`
  - RAG의 책임과 서비스 경계 정리
- `docs/backend-server-changes.md`
  - Backend_Server 수정 필요사항 정리
- `docs/ai-server-changes.md`
  - AI 서버 수정 필요사항 정리

### Runtime / Packaging

- `pyproject.toml`
  - Python 의존성 및 테스트 설정
- `.env.example`
  - 로컬 개발용 환경변수 예시
- `Dockerfile`
  - 컨테이너 실행용 기본 이미지 설정

## Quick Start

```bash
cd rag
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

기본 주소:

- `http://127.0.0.1:8090`
- `GET /health`

## Main Endpoints

- `POST /extract-text`
- `POST /draft`
- `POST /canonical/email`
- `POST /canonical/template`
- `POST /knowledge/index`
- `POST /knowledge/search`
- `POST /templates/index`
- `POST /templates/match`

호환 경로:

- 기존 `/v1/...` 경로도 함께 유지한다.

## Notes

- 운영 환경에서는 `EMBEDDING_BACKEND=sentence_transformer`로 전환하고 동일 embedding 모델을 템플릿과 이메일 모두에 사용해야 합니다.
- 기본 vector backend는 `VECTOR_BACKEND=chroma`입니다.
- Chroma 데이터는 `CHROMA_PERSIST_DIRECTORY` 아래에 저장됩니다.
- 운영 환경에서는 `CHUNKING_BACKEND=langchain`, `PDF_CHUNKING_STRATEGY=semantic` 조합을 권장합니다.
- Claude 호출이 필요하면 `ANTHROPIC_API_KEY`를 설정해야 합니다.
- RAG는 별도 DB를 두지 않는 방향을 기준으로 합니다.
- 관계형 DB 대신 Chroma persistent storage로 벡터와 메타데이터를 관리합니다.
- 공통 식별자와 HTTP 스타일은 가능한 범위에서 `AI/` 레포의 naming 규칙을 우선한다.
- 루트 `docs/rag-*.md`는 서비스 전체 관점의 설계를 관리합니다.
- `rag/docs/`는 RAG 모듈 자체의 구조, 상태, 진행 로그를 관리합니다.
- 진행 상황을 빠르게 보려면 아래 순서로 문서를 보면 됩니다.
  - `rag/README.md`
  - `rag/docs/current-status.md`
  - `rag/docs/progress-log.md`
