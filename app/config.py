from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  # .env, 시스템 환경변수, 컨테이너 환경변수를 함께 읽기 위한 공통 설정이다.
  # 추가 환경변수를 무시하도록 둔 이유는 실행 환경에서 넘어오는 부가 환경변수 때문에
  # 설정 검증이 실패하지 않게 하기 위해서다.
  model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

  # 1. 서버 실행 환경
  rag_env: str = "local"
  rag_host: str = "0.0.0.0"
  rag_port: int = 8090

  # 2. 생성 기능과 외부 LLM 설정
  mock_mode: bool = False
  # 외부 LLM 서버 주소다. OpenAI 호환 API 규격을 따른다.
  # 프록시 서버, 사내 추론 서버, 셀프호스팅 서버 등으로 교체될 수 있다.
  llm_api_base_url: str = "http://cellm.gachon.ac.kr:8000/v1"
  llm_api_key: str | None = None
  # 임베딩만 별도 provider로 분리하고 싶을 때 사용한다.
  # 값이 없으면 llm_api_base_url / llm_api_key를 그대로 재사용한다.
  embedding_api_base_url: str | None = None
  embedding_api_key: str | None = None
  # 채팅 모델과 임베딩 모델을 나눠둔 이유는,
  # 생성용 모델과 임베딩용 모델이 서로 다른 경우를 지원하기 위해서다.
  llm_chat_model: str | None = "text"
  embedding_model: str | None = "text-embedding-3-small"
  llm_api_timeout_seconds: float = 30.0

  # 3. 임베딩과 벡터 저장소 설정
  # 임베딩 백엔드는 현재 두 가지 경로만 사용한다.
  # - embedding_api: 외부 임베딩 API 호출
  # - hash: API 키나 모델 없이도 흐름 검증이 가능한 fallback
  embedding_backend: str = "embedding_api"
  vector_backend: str = "chroma"
  chroma_persist_directory: str = ".rag-data/chroma"
  chroma_host: str = "localhost"
  chroma_port: int = 8000
  chroma_ssl: bool = False
  embedding_dimensions: int = 384

  # 4. 문서 분할 전략 설정
  # 문서 분할 백엔드는 어떤 구현/프레임워크를 쓸지,
  # 문서 분할 전략은 PDF를 어떤 방식으로 자를지를 뜻한다.
  chunking_backend: str = "langchain"
  pdf_chunking_strategy: str = "semantic"

  # 5. 검색과 업로드 기본값
  # 분할 관련 기본값은 endpoint에서 별도 값을 안 넘겨도
  # 질문답변/매뉴얼이 일관된 기준으로 잘리도록 맞춘 값이다.
  default_top_k: int = 5
  default_chunk_size: int = 900
  default_chunk_overlap: int = 120
  max_upload_bytes: int = 10 * 1024 * 1024

  # 5-1. PDF OCR fallback 설정
  # 이미지형 PDF를 만났을 때 Tesseract OCR을 시도할지 여부와
  # 문자 인식에 사용할 언어 / 렌더링 해상도를 정의한다.
  pdf_ocr_enabled: bool = True
  pdf_ocr_languages: str = "kor"
  pdf_ocr_dpi: int = 300

  # 6. RabbitMQ worker 설정
  # 메시지 큐 워커를 HTTP 서버와 별개로 띄울 때 사용하는 연결/라우팅 정보다.
  rabbitmq_host: str = "localhost"
  rabbitmq_port: int = 5672
  rabbitmq_username: str = "guest"
  rabbitmq_password: str = "guest"
  rabbitmq_virtual_host: str = "/"
  rabbitmq_heartbeat_seconds: int = 60
  rabbitmq_blocked_connection_timeout_seconds: int = 30
  exchange_app_to_rag: str = "x.app2rag.direct"
  exchange_rag_to_app: str = "x.rag2app.direct"
  queue_knowledge_ingest_inbound: str = "q.2rag.knowledge.ingest"
  queue_template_index_inbound: str = "q.2rag.templates.index"
  queue_template_match_inbound: str = "q.2rag.templates.match"
  queue_draft_inbound: str = "q.2rag.draft"
  queue_dlx_failed: str = "q.dlx.failed"
  routing_key_knowledge_ingest_inbound: str = "2rag.knowledge.ingest"
  routing_key_template_index_inbound: str = "2rag.templates.index"
  routing_key_template_match_inbound: str = "2rag.templates.match"
  routing_key_draft_inbound: str = "2rag.draft"
  routing_key_knowledge_ingest_result: str = "2app.knowledge.ingest"
  routing_key_template_index_result: str = "2app.templates.index"
  routing_key_template_match_result: str = "2app.templates.match"
  routing_key_draft_result: str = "2app.rag.draft"
  routing_key_rag_progress: str = "2app.rag.progress"
  rabbitmq_max_retry_count: int = 3


# 6. 앱 전역 공통 설정 객체
# 각 서비스가 같은 설정값을 공유하도록 한 번만 만든다.
settings = Settings()
