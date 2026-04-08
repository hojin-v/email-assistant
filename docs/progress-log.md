# Progress Log

기준일: 2026-04-07

이 문서는 `rag/` 모듈 작업 내역을 날짜순으로 누적 기록하기 위한 로그다.
세부 구현 변경은 이 문서에 먼저 남기고, 정리된 현재 상태는 `current-status.md`에 반영한다.

## 2026-04-04

- `rag/` 디렉터리와 FastAPI 스캐폴드 추가
- `extract-text`, `canonical`, `knowledge`, `templates` 계열 엔드포인트 추가
- hash embedding fallback과 optional FAISS index store 추가
- PDF/TXT 텍스트 추출, 기본 chunking, canonicalization 구현

## 2026-04-05

- RAG 설계와 역할 분리를 위한 루트 문서 추가
- Backend/AI와의 연동 수정안 문서 초안 작성
- 한국어 주석 정리

## 2026-04-06

- `rag/docs/` 내부 문서 구조 추가
- RAG를 독립 서비스로 유지하고 별도 DB를 두지 않는 방향으로 문서 정리
- AI naming 규칙과 호환되도록 요청/응답 스키마 alias 정리

## 2026-04-07

- PDF 문서에 대해 LangChain 기반 semantic chunking을 우선 시도하는 경로 추가
- 실패 시 native chunking으로 fallback 하도록 `document_chunking.py` 추가
- `KnowledgeDocument`에 `file_name`, `media_type` 추가
- `AI` 레포의 `draft` / `claude_service` 생성 영역을 `RAG` 내부 서비스로 이동
- `POST /draft` 엔드포인트와 Claude 호출 계층 추가
- vector store를 custom memory/FAISS 구조에서 Chroma persistent collection 구조로 전환
- `VECTOR_BACKEND`, `CHROMA_PERSIST_DIRECTORY` 설정 추가
- README에 폴더 구조와 파일 역할 설명 추가
- 문서 추적용 본 `progress-log.md` 추가
- 카테고리별 retrieval query 기준 문서 `retrieval-query-design.md` 추가
