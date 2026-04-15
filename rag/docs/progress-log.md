# Progress Log

기준일: 2026-04-15

이 문서는 `rag/` 모듈 작업 내역을 날짜순으로 누적 기록하기 위한 로그다.
세부 구현 변경은 이 문서에 먼저 남기고, 정리된 현재 상태는 `current-status.md`에 반영한다.

## 2026-04-04

- `rag/` 디렉터리와 FastAPI 스캐폴드 추가
- `extract-text`, `canonical`, `knowledge`, `templates` 계열 엔드포인트 추가
- hash embedding fallback과 초기 벡터 저장 구조 추가
- PDF/TXT 텍스트 추출, 기본 chunking, canonicalization 구현

## 2026-04-05

- RAG 설계와 역할 분리를 위한 루트 문서 추가
- Backend/AI와의 연동 수정안 문서 초안 작성
- 한국어 주석 정리

## 2026-04-06

- `rag/docs/` 내부 문서 구조 추가
- RAG를 독립 서비스로 유지하고 별도 DB를 두지 않는 방향으로 문서 정리
- 요청/응답 스키마 alias 정리

## 2026-04-07

- PDF 문서에 대해 LangChain 기반 semantic chunking을 우선 시도하는 경로 추가
- 실패 시 native chunking으로 fallback 하도록 `document_chunking.py` 추가
- 템플릿 생성 계층 추가
- vector store를 Chroma persistent collection 구조로 전환
- `CHROMA_PERSIST_DIRECTORY` 설정 추가
- `retrieval-query-design.md` 초안 추가

## 2026-04-10

- `설명.md`, `사용자설명.md`, `Infra-Trade-off.md`, `RabbitMQ-설계안.md` 등 설명형 문서 추가
- 회사소개는 retrieval 대상이 아니라 고정 문맥으로 전달하고 FAQ/PDF만 검색 대상으로 두는 방향을 문서에 반영
- 업로드 문서를 모두 `manual` source_type으로 통일
- 최종 외부 API를 `knowledge/ingest`, `templates/index`, `templates/match`, `draft` 중심으로 정리

## 2026-04-13

- PDF 파서를 `pypdf`에서 `PyMuPDF`로 교체
- 이미지형 PDF를 휴리스틱으로 감지하고 OCR 필요 예외를 반환하도록 변경
- `document_parser` 테스트 추가
- RAG 테스트 과정에서 바뀐 백엔드/프론트 지점을 추적하는 문서 추가

## 2026-04-15

- 임베딩 backend 이름을 `embedding_api`로 정리
- 임베딩 환경변수 이름을 `EMBEDDING_*` 계열로 통일
- `llm_api`를 임베딩 backend alias로 사용하던 경로 제거
- `sentence-transformer` 기본 설정을 제거하고 외부 임베딩 API 기준으로 정리
- `rag` 전체 테스트를 다시 실행해 `18 passed` 확인
- `rag/docs`를 연동 문서 중심 구조로 재편
- 새 기준 문서 추가
  - `연동-개요.md`
  - `API-명세.md`
  - `RabbitMQ-명세.md`
  - `Chroma-저장구조-ERD.md`
- 기존 PT/설명 중심 문서는 정리하거나 제거
- RabbitMQ 기준을 `자동 파이프라인 우선`으로 재정리
- `templates.match`를 메일 수신 시 자동 수행되는 MQ 후보 작업으로 문서 수정
- `job_id`, progress event, Backend DB 상태 저장, SSE/polling 전달 구조를 문서에 추가
- `jobs` 테이블 최소 ERD와 progress event 표준 스키마를 문서에 추가
- RAG MQ worker 구현 및 로컬 RabbitMQ smoke test 완료
- `RabbitMQ-명세.md`, `Backend_Server/RabbitMQ.md`에 운영형 retry / DLQ / TTL 기준과 로컬 smoke test 기준을 함께 정리
- 이미지형 PDF에 대해 Tesseract OCR fallback 추가
- `PDF_OCR_*` 설정과 관련 문서를 정리
- 전체 테스트를 다시 실행해 `20 passed` 확인
