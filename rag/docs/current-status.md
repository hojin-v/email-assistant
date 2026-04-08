# Current Status

기준일: 2026-04-06

## 현재 구현된 내용

### API

- `GET /health`
- `POST /extract-text`
- `POST /draft`
- `POST /canonical/email`
- `POST /canonical/template`
- `POST /knowledge/index`
- `POST /knowledge/search`
- `POST /templates/index`
- `POST /templates/match`

호환용으로 기존 `/v1/...` 경로도 함께 유지한다.

### 내부 기능

- PDF/TXT 텍스트 추출
- 텍스트 normalize
- chunking
- PDF 문서에 대한 LangChain 기반 semantic chunking 시도
- Claude 기반 답장 생성
- reply embedding 생성
- email canonical text 생성
- template canonical text 생성
- 기본 hash embedding
- 선택적 sentence-transformer embedding backend
- Chroma persistent collection 기반 검색
- 사용자별 namespace 분리

### 현재 저장 방식

- 별도 DB 없음
- Chroma persistent directory 기반 index store
- namespace별 collection으로 사용자 데이터 분리

## 아직 없는 내용

- Backend_Server 실연동
- AI 서버와의 역할 재정리
- RabbitMQ consumer
- docx 파서
- Backend rerank 연동
- 장애 복구용 full rebuild 경로

## 현재 한계

- 파일 추출 포맷이 아직 제한적이다
- LangChain semantic chunking은 PDF 추출 결과 품질에 영향을 크게 받는다
- LangChain 의존성이 없거나 런타임에서 실패하면 기존 chunking으로 fallback 한다
- 운영용 인증/권한 검증이 없다
- 검색 결과는 candidate 수준이며 최종 선택은 하지 않는다
