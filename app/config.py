from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

  # 1. 서버 실행 환경
  rag_env: str = "local"
  rag_host: str = "0.0.0.0"
  rag_port: int = 8090

  # 2. 생성 기능과 외부 LLM 설정
  mock_mode: bool = False
  anthropic_api_key: str | None = None

  # 3. 임베딩과 벡터 저장소 설정
  embedding_backend: str = "hash"
  vector_backend: str = "chroma"
  chroma_persist_directory: str = ".rag-data/chroma"
  embedding_model_name: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
  embedding_dimensions: int = 384

  # 4. 문서 분할 전략 설정
  chunking_backend: str = "langchain"
  pdf_chunking_strategy: str = "semantic"

  # 5. 검색과 업로드 기본값
  default_top_k: int = 5
  default_chunk_size: int = 900
  default_chunk_overlap: int = 120
  max_upload_bytes: int = 10 * 1024 * 1024


# 6. 앱 전역 공통 설정 객체
# 각 서비스가 같은 설정값을 공유하도록 한 번만 만든다.
settings = Settings()
