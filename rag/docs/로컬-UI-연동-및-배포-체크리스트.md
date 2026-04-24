# 로컬 UI 연동 및 배포 체크리스트

이 문서는 `rag/`를 실제 Backend, SSE, Frontend와 붙여서 확인할 때 쓰는 실행 기준이다.
`Capstone_Cluster/`는 읽기 전용으로만 확인했고, 이 문서에서는 나중에 인프라 담당자에게 전달할 수정 지점만 정리한다.

## 1. 이번 구현 범위

```text
구현 완료
- RAG Chroma local persistent mode 유지
- RAG Chroma HTTP server mode 추가
- RAG Chroma 조회 스크립트 추가

문서화만 진행
- Capstone_Cluster RabbitMQ / Backend / SSE / RAG manifest 수정 지점
- 로컬 UI 기반 end-to-end 확인 경로
```

Chroma 모드는 환경변수로 고른다.

```text
로컬 파일 저장
- VECTOR_BACKEND=chroma
- CHROMA_PERSIST_DIRECTORY=.rag-data/chroma

외부 ChromaDB 서버
- VECTOR_BACKEND=chroma_http
- CHROMA_HOST=<chroma service host>
- CHROMA_PORT=<chroma service port>
- CHROMA_SSL=false 또는 true
```

## 2. 로컬 UI 테스트 목표

로컬에서 우선 확인할 흐름은 아래 순서다.

```text
브라우저
-> Frontend App
-> Backend API
-> RabbitMQ
-> RAG worker
-> Chroma 저장
-> Backend DB 저장
-> SSE Gateway
-> Frontend 화면 갱신
```

1차 확인 대상은 온보딩 기반 템플릿 생성이다.

```text
회원가입 / 로그인
-> 온보딩 입력
-> 맞춤 템플릿 생성 요청
-> Backend가 RAG MQ 작업 발행
-> RAG가 템플릿 생성 / 인덱싱
-> Backend가 결과 저장
-> Frontend가 SSE로 진행 상태 확인
```

## 3. 로컬 주소 기준

```text
Frontend App
- http://localhost:5173

Backend API
- http://localhost:8080/api

SSE Gateway
- http://localhost:8081/sse/connect?access_token=<JWT>

RAG HTTP health
- http://localhost:8090/health

RabbitMQ Management UI
- http://localhost:15672

MariaDB
- 127.0.0.1:3306
```

SSE는 Backend와 포트가 겹치지 않게 로컬에서 `8081`로 실행한다.

## 4. Frontend 로컬 설정

`frontend/App/.env.local`이 운영 서버와 demo mode를 바라보면 로컬 E2E가 되지 않는다.
로컬 확인 시에는 아래 값으로 실행한다.

```bash
cd frontend/App
env VITE_API_BASE_URL= \
  VITE_BACKEND_ORIGIN=http://localhost:8080 \
  VITE_SSE_BASE_URL= \
  VITE_SSE_ORIGIN=http://localhost:8081 \
  VITE_DEMO_MODE=false \
  npm run dev
```

의미:

```text
VITE_API_BASE_URL 비움
- 프론트 API 호출이 /api 기준으로 나가고 Vite proxy를 탄다.

VITE_BACKEND_ORIGIN=http://localhost:8080
- Vite proxy가 Backend로 API를 넘긴다.

VITE_SSE_BASE_URL 비움
- EventSource가 /sse/connect를 같은 origin으로 연다.

VITE_SSE_ORIGIN=http://localhost:8081
- Vite proxy가 SSE Gateway로 연결을 넘긴다.

VITE_DEMO_MODE=false
- 실제 Backend API를 사용한다.
```

## 5. 로컬 인프라 실행

RabbitMQ:

```bash
docker run --rm --name emailassist-rabbitmq \
  -p 5672:5672 -p 15672:15672 \
  rabbitmq:3-management
```

MariaDB:

```bash
docker run --rm --name emailassist-mariadb \
  -e MARIADB_DATABASE=email_agent \
  -e MARIADB_USER=emailassist \
  -e MARIADB_PASSWORD=emailassist \
  -e MARIADB_ROOT_PASSWORD=root \
  -p 3306:3306 \
  mariadb:11
```

외부 ChromaDB를 로컬에서도 따로 확인하려면:

```bash
docker run --rm --name emailassist-chroma \
  -p 8000:8000 \
  chromadb/chroma
```

단순 로컬 테스트는 `VECTOR_BACKEND=chroma`로 충분하고, 배포 서버 ChromaDB 연결 테스트는 `VECTOR_BACKEND=chroma_http`로 확인한다.

## 6. RabbitMQ 생성 방식

현재 `Capstone_Cluster/rabbitmq-manifest`는 RabbitMQ 서버 자체를 띄우는 방식이다.

```text
확인한 리소스
- rabbitmq StatefulSet
- rabbitmq headless Service
- rabbitmq NodePort Service
- rabbitmq ConfigMap
- rabbitmq StorageClass
```

현재 manifest는 브로커 인프라를 만든다.
RAG용 exchange / queue / binding 생성은 별도 manifest나 definitions import로 고정되어 있지 않다.

Backend는 RabbitMQ topology를 생성하지 않는다.
로컬 테스트에서도 운영과 같은 원칙으로 브로커 리소스 생성은 별도 setup 단계에서 수행한다.

운영 권장안:

```text
1. 인프라 레벨에서 RabbitMQ 서버를 먼저 배포한다.
2. exchange / queue / binding은 definitions.json 또는 별도 Kubernetes Job으로 선언한다.
3. Backend / RAG / SSE 앱은 이미 존재하는 topology를 사용한다.
4. 운영 source of truth는 앱 코드가 아니라 인프라 manifest 또는 definitions 파일로 둔다.
```

로컬 최소 topology:

```text
exchanges
- x.app2ai.direct
- x.ai2app.direct
- x.app2rag.direct
- x.rag2app.direct
- x.sse.fanout

AI queues
- q.2ai.classify
- q.2app.classify
- q.2app.training

RAG inbound queues
- q.2rag.knowledge.ingest
- q.2rag.templates.index
- q.2rag.templates.match
- q.2rag.draft

Backend inbound queues
- q.2app.knowledge.ingest
- q.2app.templates.index
- q.2app.templates.match
- q.2app.rag.draft
- q.2app.rag.progress

failure queue
- q.dlx.failed
```

운영에서는 위 최소 topology에 retry queue, DLQ, TTL을 추가한다.

### 6-1. 로컬 RabbitMQ 컨테이너 topology 생성

로컬에서도 Backend가 큐를 만들지 않고, RabbitMQ 컨테이너에 별도 setup 명령을 실행한다.
아래 명령은 운영 Terraform / definitions가 하는 일을 로컬에서 최소 형태로 흉내내는 smoke test용이다.

기존 테스트 queue / exchange를 지우고 다시 만들려면 RAG scripts의 reset 스크립트를 사용한다.

```bash
cd /home/hojin/Projects/email-assistant/rag
.venv/bin/python scripts/reset_local_rabbitmq_topology.py
.venv/bin/python scripts/reset_local_rabbitmq_topology.py --yes
```

첫 번째 명령은 dry-run이고, 두 번째 명령이 실제 삭제/재생성이다.

```bash
cd rag
.venv/bin/python - <<'PY'
import pika

connection = pika.BlockingConnection(
    pika.URLParameters("amqp://guest:guest@localhost:5672/")
)
channel = connection.channel()

for exchange, exchange_type in [
    ("x.app2ai.direct", "direct"),
    ("x.ai2app.direct", "direct"),
    ("x.app2rag.direct", "direct"),
    ("x.rag2app.direct", "direct"),
    ("x.sse.fanout", "fanout"),
]:
    channel.exchange_declare(
        exchange=exchange,
        exchange_type=exchange_type,
        durable=True,
    )

bindings = [
    ("q.2ai.classify", "x.app2ai.direct", "2ai.classify"),
    ("q.2app.classify", "x.ai2app.direct", "2app.classify"),
    ("q.2rag.knowledge.ingest", "x.app2rag.direct", "2rag.knowledge.ingest"),
    ("q.2rag.templates.index", "x.app2rag.direct", "2rag.templates.index"),
    ("q.2rag.templates.match", "x.app2rag.direct", "2rag.templates.match"),
    ("q.2rag.draft", "x.app2rag.direct", "2rag.draft"),
    ("q.2app.knowledge.ingest", "x.rag2app.direct", "2app.knowledge.ingest"),
    ("q.2app.templates.index", "x.rag2app.direct", "2app.templates.index"),
    ("q.2app.templates.match", "x.rag2app.direct", "2app.templates.match"),
    ("q.2app.rag.draft", "x.rag2app.direct", "2app.rag.draft"),
    ("q.2app.rag.progress", "x.rag2app.direct", "2app.rag.progress"),
]

for queue, exchange, routing_key in bindings:
    channel.queue_declare(queue=queue, durable=True)
    channel.queue_bind(queue=queue, exchange=exchange, routing_key=routing_key)

for queue in [
    "q.dlx.failed",
    "q.2app.training",
]:
    channel.queue_declare(queue=queue, durable=True)

connection.close()
print("Local RabbitMQ topology declared.")
PY
```

확인:

```bash
open http://localhost:15672
```

로그인:

```text
username: guest
password: guest
```

## 7. 서비스 실행

Backend:

```bash
cd Backend_Server
DB_HOST=127.0.0.1 DB_PORT=3306 DB_USERNAME=emailassist DB_PASSWORD=emailassist \
RABBITMQ_HOST=127.0.0.1 RABBITMQ_PORT=5672 RABBITMQ_USER=guest RABBITMQ_PASS=guest \
AI_SERVER_URL=http://127.0.0.1:8000 AI_API_KEY=local \
GOOGLE_CLIENT_ID=dummy GOOGLE_CLIENT_SECRET=dummy \
GOOGLE_REDIRECT_URI=http://localhost:8080/api/integrations/google/callback \
GOOGLE_TOPIC_NAME=dummy PUBSUB_VERIFY_TOKEN=dummy \
APP_FRONTEND_BASE_URL=http://localhost:5173 \
APP_FILE_UPLOAD_DIR=/tmp/emailassist-uploads \
bash mvnw spring-boot:run
```

RAG worker:

```bash
cd rag
MOCK_MODE=true EMBEDDING_BACKEND=hash VECTOR_BACKEND=chroma \
CHROMA_PERSIST_DIRECTORY=.rag-data/chroma \
RABBITMQ_HOST=127.0.0.1 RABBITMQ_PORT=5672 \
RABBITMQ_USERNAME=guest RABBITMQ_PASSWORD=guest \
python -m app.worker
```

RAG HTTP server:

```bash
cd rag
MOCK_MODE=true EMBEDDING_BACKEND=hash VECTOR_BACKEND=chroma \
uvicorn app.main:app --host 0.0.0.0 --port 8090 --reload
```

SSE Gateway:

```bash
cd SSE/Capstone_SSE
RABBITMQ_HOST=127.0.0.1 RABBITMQ_PORT=5672 \
ADMIN_ID=guest ADMIN_PW=guest SERVER_PORT=8081 \
go run .
```

AI classify API / worker는 현재 로컬 모델 파일 상태에 따라 실행 가능성이 갈린다.
온보딩 템플릿 생성과 RAG 저장 확인은 `RAG MOCK_MODE=true`만으로 먼저 진행할 수 있다.

## 8. UI 확인 순서

온보딩 템플릿 생성 확인:

```text
1. Frontend에서 회원가입 / 로그인
2. /onboarding 진입
3. 회사 정보, 카테고리, FAQ 또는 문서 입력
4. 맞춤 템플릿 생성 실행
5. 화면에서 rag-job-updated SSE 진행 상태 확인
6. 완료 후 Chroma에서 template_{user_id} collection 확인
```

테스트 메일 추천 흐름 확인:

```text
1. /app/inbox에서 테스트 메일 추가
2. Backend가 Email과 Outbox를 함께 생성
3. MailScheduler가 q.2ai.classify로 발행
4. AI가 q.2app.classify로 결과 발행
5. Backend가 분석 결과 저장 후 q.2rag.templates.match 발행
6. RAG가 q.2app.templates.match로 추천 결과 발행
7. Backend가 email_template_recommendations 저장
8. Frontend가 /api/inbox/{emailId}/recommendations 조회
```

## 9. Chroma 저장 확인

로컬 persistent Chroma 확인:

```bash
cd rag
.venv/bin/python scripts/check_chroma.py \
  --backend chroma \
  --persist-directory .rag-data/chroma \
  --peek 3
```

외부 ChromaDB HTTP 확인:

```bash
cd rag
.venv/bin/python scripts/check_chroma.py \
  --backend chroma_http \
  --host localhost \
  --port 8000 \
  --no-ssl \
  --peek 3
```

컬렉션 이름은 아래처럼 보인다.

```text
knowledge:{user_id} -> knowledge_{user_id}
template:{user_id}  -> template_{user_id}
```

## 10. 배포 시 수정해야 할 부분

`Capstone_Cluster/`는 이 작업에서 수정하지 않는다.
배포 PR 또는 인프라 작업에서 아래 파일들을 수정 대상으로 전달한다.

```text
Backend
- Capstone_Cluster/backend-manifest/03-backend-configmap.yaml
- Capstone_Cluster/backend-manifest/04-backend-service.yaml
- Capstone_Cluster/backend-manifest/06-backend-ingress.yaml

SSE
- Capstone_Cluster/sse-manifest/01-sse-configmap.yaml
- Capstone_Cluster/sse-manifest/02-sse-service.yaml
- Capstone_Cluster/sse-manifest/04-sse-ingress.yaml

RAG
- Capstone_Cluster/Rag-manifest/01-rag-configmap.yaml
- Capstone_Cluster/Rag-manifest/02-rag-service.yaml
- Capstone_Cluster/Rag-manifest/03-rag-deployment.yaml
- Capstone_Cluster/Rag-manifest/04-rag-ingress.yaml

RabbitMQ
- Capstone_Cluster/rabbitmq-manifest/*
- 신규 definitions.json 또는 topology Job

ChromaDB
- 신규 ChromaDB Deployment / Service / PVC 또는 기존 ChromaDB Service 연결 정보
```

현재 확인된 주의점:

```text
RabbitMQ internal host
- rabbitmq-headless.rabbitmq:5672

RabbitMQ external NodePort
- 192.168.2.20:30672

Backend / SSE ingress
- ingress backend service port와 실제 Service port가 서로 맞는지 재확인 필요

SSE Service selector
- Service selector와 Deployment label 정렬 필요

RAG manifest
- 현재 placeholder 수준이므로 실제 RAG image, env, secret, service, ingress로 교체 필요

ChromaDB
- 현재 Capstone_Cluster 안에 manifest 없음
```

배포 RAG env 권장:

```text
RAG_ENV=prod
MOCK_MODE=false
EMBEDDING_BACKEND=embedding_api
EMBEDDING_API_BASE_URL=<외부 embedding api base url>
EMBEDDING_API_KEY=<secret>
EMBEDDING_MODEL=text-embedding-nomic-embed-text-v1.5
EMBEDDING_DIMENSIONS=384
VECTOR_BACKEND=chroma_http
CHROMA_HOST=<chroma service dns>
CHROMA_PORT=<chroma service port>
CHROMA_SSL=false
RABBITMQ_HOST=rabbitmq-headless.rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=<secret>
RABBITMQ_PASSWORD=<secret>
```

## 11. 현재 남은 연결 이슈

아래 항목은 로컬 UI 전체 흐름에서 막힐 수 있는 지점이다.

```text
Frontend
- 운영/demo .env를 로컬 값으로 바꿔야 실제 API를 탄다.

SSE
- 브라우저 EventSource는 Authorization header를 직접 넣을 수 없다.
- 현재 프론트 기준은 /sse/connect?access_token=<JWT> 형태가 안전하다.

Backend
- Backend는 RabbitMQ topology를 생성하지 않는다.
- 로컬과 운영 모두 RabbitMQ topology를 setup script / Capstone_Cluster / definitions 기준으로 고정해야 한다.

AI
- AI 모델 파일이 없으면 classify worker가 실행되지 않을 수 있다.
- Backend는 현재 AI의 classification / summary / schedule_info 응답 형태를 받아들인다.

RabbitMQ
- 로컬에서는 최소 topology로 smoke test 가능하다.
- 운영에서는 retry / DLQ / TTL 포함 topology를 인프라 코드로 고정해야 한다.
```
