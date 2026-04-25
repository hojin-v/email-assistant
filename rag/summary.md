# Capstone RAG — K8s 배포 및 아키텍처 요약

## 1. 애플리케이션 구조

```
app/
├── main.py              # FastAPI HTTP 서버 (포트 8090)
├── worker.py            # RabbitMQ 메시지 컨슈머
├── config.py            # Pydantic Settings (모든 환경변수 정의)
├── mq/schemas.py        # RabbitMQ 메시지 스키마
└── services/
    ├── runtime.py       # 서비스 초기화 (embedding, vector_store)
    ├── embedding.py     # 임베딩 (OpenAI-compatible API or hash fallback)
    ├── index_store.py   # ChromaDB 벡터 스토어 클라이언트
    ├── openai_compatible_client.py  # LLM/Embedding API 호출
    ├── document_parser.py           # PDF/OCR 파싱 (PyMuPDF + Tesseract)
    ├── claude_service.py            # LLM을 통한 템플릿 생성
    └── draft_service.py             # 온보딩 템플릿 초안 생성
```

진입점이 두 개다.
- **HTTP API** (`uvicorn app.main:app`) — 동기 API 요청 처리
- **MQ Worker** (`python -m app.worker`) — RabbitMQ 비동기 작업 처리

---

## 2. BackendServer 통신 구조

### 2-1. RabbitMQ (주 통신 채널)

BackendServer(Spring)와 RAG 서버는 **직접 HTTP 호출 없이 RabbitMQ를 통해 비동기 통신**한다.

```
BackendServer ──publish──▶ EXCHANGE (x.app2rag.direct) ──route──▶ RAG inbound queue
BackendServer ◀──consume── EXCHANGE (x.rag2app.direct) ◀──publish── RAG outbound queue
```

**Inbound (BackendServer → RAG가 소비)**

| Queue | Routing Key | 용도 |
|---|---|---|
| `q.2rag.knowledge.ingest` | `2rag.knowledge.ingest` | FAQ/매뉴얼 문서 벡터 인덱싱 요청 |
| `q.2rag.templates.index` | `2rag.templates.index` | 템플릿 벡터 인덱싱 요청 |
| `q.2rag.templates.match` | `2rag.templates.match` | 이메일에 맞는 템플릿 검색 요청 |
| `q.2rag.draft` | `2rag.draft` | 이메일 초안 생성 요청 |

**Outbound (RAG가 발행 → BackendServer가 소비)**

| Queue | Routing Key | 용도 |
|---|---|---|
| `q.2app.knowledge.ingest` | `2app.knowledge.ingest` | 인덱싱 완료/실패 결과 |
| `q.2app.templates.index` | `2app.templates.index` | 템플릿 인덱싱 완료/실패 결과 |
| `q.2app.templates.match` | `2app.templates.match` | 템플릿 매칭 결과 |
| `q.2app.rag.draft` | `2app.rag.draft` | 이메일 초안 생성 결과 |
| `q.2app.rag.progress` | `2app.rag.progress` | 실시간 진행 상태 이벤트 |
| `q.dlx.failed` | — | 재시도 3회 초과 실패 메시지 DLQ |

**메시지 공통 필드**: `job_id`, `request_id`, `user_id`, `payload`

**재시도 로직**: `x-death` 헤더 기반 3회 재시도 → 실패 시 `q.dlx.failed` 라우팅

### 2-2. 외부 LLM/Embedding API 호출

RAG 서버가 직접 외부 API를 호출한다 (`openai_compatible_client.py`).

```
RAG ──HTTPS──▶ LLM Server (LLM_API_BASE_URL/v1/chat/completions)
RAG ──HTTPS──▶ Embedding Server (EMBEDDING_API_BASE_URL/v1/embeddings)
```

- 표준 라이브러리 `urllib` 사용 (httpx/requests 없음)
- `Authorization: Bearer {API_KEY}` 헤더 인증
- 타임아웃: `LLM_API_TIMEOUT_SECONDS` (기본 30초)

---

## 3. VectorDB (ChromaDB) 사용 구조

### 3-1. 백엔드 모드

| 모드 | 환경변수 | 설명 |
|---|---|---|
| `chroma` | `VECTOR_BACKEND=chroma` | 로컬 파일 저장 (`CHROMA_PERSIST_DIRECTORY`) |
| `chroma_http` | `VECTOR_BACKEND=chroma_http` | 외부 ChromaDB 서버 (K8s 권장) |

K8s 배포 시 반드시 `VECTOR_BACKEND=chroma_http`로 설정해야 한다.  
`chroma` 모드는 PVC 없이는 Pod 재시작 시 데이터가 사라진다.

### 3-2. 컬렉션 네임스페이스 (사용자 격리)

| 컬렉션 이름 | 내용 | Record ID 패턴 |
|---|---|---|
| `knowledge:{user_id}` | FAQ/매뉴얼 청크 벡터 | `faq:{source_id}:{chunk_index}` |
| `template:{user_id}` | 이메일 템플릿 벡터 | `template:{template_id}` |

### 3-3. 벡터 인덱싱 흐름

```
문서 수신 (MQ)
  → PDF/텍스트 파싱 (PyMuPDF + Tesseract OCR)
  → 청킹 (LangChain semantic chunking)
  → 각 청크 임베딩 (EMBEDDING_API)
  → L2 정규화 (cosine similarity 대비)
  → ChromaDB upsert (컬렉션: knowledge:{user_id})
  → 결과 발행 (MQ outbound)
```

### 3-4. 벡터 검색 흐름

```
쿼리 텍스트 수신
  → 쿼리 임베딩
  → ChromaDB query (top_k, 메타데이터 필터: source_type / intent / mail_tone / domain)
  → distance → similarity 변환 (1.0 - distance)
  → RAG 컨텍스트 조합 → LLM 프롬프트
  → 초안 생성 결과 반환
```

---

## 4. K8s ConfigMap / Secret 분류

### Secret (민감 정보 — 반드시 Secret으로 주입)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: rag-secret
type: Opaque
stringData:
  LLM_API_KEY: ""               # LLM 서버 API 키
  EMBEDDING_API_KEY: ""         # Embedding API 키 (OpenAI 등)
  RABBITMQ_USERNAME: ""         # RabbitMQ 사용자명
  RABBITMQ_PASSWORD: ""         # RabbitMQ 비밀번호
```

### ConfigMap (비민감 설정 — ConfigMap으로 주입)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: rag-config
data:
  # 서버
  RAG_ENV: "production"
  RAG_HOST: "0.0.0.0"
  RAG_PORT: "8090"
  MOCK_MODE: "false"

  # LLM
  LLM_API_BASE_URL: "http://cellm.gachon.ac.kr:8000/v1"
  LLM_CHAT_MODEL: "text"
  LLM_API_TIMEOUT_SECONDS: "60"

  # Embedding
  EMBEDDING_API_BASE_URL: "https://api.openai.com/v1"
  EMBEDDING_MODEL: "text-embedding-3-small"
  EMBEDDING_BACKEND: "embedding_api"
  EMBEDDING_DIMENSIONS: "384"

  # VectorDB (ChromaDB HTTP 모드 필수)
  VECTOR_BACKEND: "chroma_http"
  CHROMA_HOST: "chromadb.<namespace>.svc.cluster.local"
  CHROMA_PORT: "8000"
  CHROMA_SSL: "false"

  # RabbitMQ 접속 정보 (비밀번호 제외)
  RABBITMQ_HOST: "rabbitmq.<namespace>.svc.cluster.local"
  RABBITMQ_PORT: "5672"
  RABBITMQ_VIRTUAL_HOST: "/"
  RABBITMQ_HEARTBEAT_SECONDS: "60"
  RABBITMQ_BLOCKED_CONNECTION_TIMEOUT_SECONDS: "30"
  RABBITMQ_MAX_RETRY_COUNT: "3"

  # RabbitMQ Exchange/Queue 이름
  EXCHANGE_APP_TO_RAG: "x.app2rag.direct"
  EXCHANGE_RAG_TO_APP: "x.rag2app.direct"

  # 문서 처리
  CHUNKING_BACKEND: "langchain"
  PDF_CHUNKING_STRATEGY: "semantic"
  DEFAULT_TOP_K: "5"
  DEFAULT_CHUNK_SIZE: "900"
  DEFAULT_CHUNK_OVERLAP: "120"
  MAX_UPLOAD_BYTES: "10485760"

  # OCR
  PDF_OCR_ENABLED: "true"
  PDF_OCR_LANGUAGES: "kor"
  PDF_OCR_DPI: "300"
```

---

## 5. 하드코딩 문제 — 수정 필요 항목

| 파일 | 위치 | 하드코딩 값 | 문제 |
|---|---|---|---|
| `app/config.py` | `llm_api_base_url` 기본값 | `http://cellm.gachon.ac.kr:8000/v1` | 환경에 따라 달라야 하는 URL이 default로 고정됨. ConfigMap으로 주입해야 함 |
| `app/config.py` | `rabbitmq_username` 기본값 | `"guest"` | 프로덕션에서 guest 계정 사용 금지. Secret으로만 주입 |
| `app/config.py` | `rabbitmq_password` 기본값 | `"guest"` | 동일. Secret에 기본값 없이 강제 주입 필요 |
| `app/services/index_store.py` | `chroma_host` 파라미터 기본값 | `"localhost"` | `config.py`에서 주입받으므로 실질적 영향은 없지만, 기본값 자체가 오해를 유발 |

> `app/config.py`에서 `LLM_API_KEY`와 `EMBEDDING_API_KEY`는 기본값이 빈 문자열(`""`)로 설정되어 있어 미설정 시 API 호출이 실패한다. K8s에서 secretKeyRef로 반드시 주입해야 한다.

---

## 6. K8s Deployment 환경변수 주입 예시

```yaml
envFrom:
  - configMapRef:
      name: rag-config
env:
  - name: LLM_API_KEY
    valueFrom:
      secretKeyRef:
        name: rag-secret
        key: LLM_API_KEY
  - name: EMBEDDING_API_KEY
    valueFrom:
      secretKeyRef:
        name: rag-secret
        key: EMBEDDING_API_KEY
  - name: RABBITMQ_USERNAME
    valueFrom:
      secretKeyRef:
        name: rag-secret
        key: RABBITMQ_USERNAME
  - name: RABBITMQ_PASSWORD
    valueFrom:
      secretKeyRef:
        name: rag-secret
        key: RABBITMQ_PASSWORD
```

### ChromaDB HTTP 모드 사용 시 볼륨 불필요

`VECTOR_BACKEND=chroma_http`로 설정하면 `CHROMA_PERSIST_DIRECTORY`는 사용되지 않으므로 PVC 마운트가 불필요하다.  
`chroma` (로컬 파일) 모드를 사용할 경우 `/app/.rag-data/chroma` 경로에 PVC를 마운트해야 데이터가 유지된다.

---

## 7. 의존 서비스 목록 (K8s 내 필요)

| 서비스 | 용도 | K8s Service 명 예시 |
|---|---|---|
| ChromaDB | 벡터 저장/검색 | `chromadb.<namespace>.svc.cluster.local:8000` |
| RabbitMQ | BackendServer와 비동기 메시지 통신 | `rabbitmq.<namespace>.svc.cluster.local:5672` |
| LLM Server | 이메일 초안 생성 (외부 또는 내부) | `cellm.gachon.ac.kr:8000` (현재 외부 고정) |
| Embedding Server | 텍스트 벡터 변환 (OpenAI API 기본) | `api.openai.com` (현재 외부) |
