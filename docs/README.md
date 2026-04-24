# RAG Docs

`rag/docs`는 이제 `설명용 메모`보다 `실제 연동 문서`를 우선한다.
현재 기준으로 팀에 전달할 문서는 아래 6개를 먼저 본다.

## 우선 읽을 문서

1. [연동-개요.md](./연동-개요.md)
2. [API-명세.md](./API-명세.md)
3. [RabbitMQ-명세.md](./RabbitMQ-명세.md)
4. [Chroma-저장구조-ERD.md](./Chroma-저장구조-ERD.md)
5. [로컬-UI-연동-및-배포-체크리스트.md](./로컬-UI-연동-및-배포-체크리스트.md)
6. [current-status.md](./current-status.md)

## 문서별 역할

- `연동-개요.md`
  - RAG의 현재 책임
  - Backend, AI, Infra 관점의 연결 포인트
  - 현재 구현과 목표 연동 방식의 차이

- `API-명세.md`
  - Backend가 실제로 호출할 HTTP API 계약
  - 요청/응답 필드
  - 현재 외부 공개 API와 내부/레거시 API 구분

- `RabbitMQ-명세.md`
  - 현재 구현 여부와 무관하게 MQ로 바꿀 수 있는 경로 정리
  - exchange, queue, routing key, 메시지 예시
  - 어떤 작업은 MQ가 맞고 어떤 작업은 HTTP가 더 맞는지 기준

- `Chroma-저장구조-ERD.md`
  - `.rag-data/chroma` 저장 구조
  - collection, segment, embedding, metadata 관계
  - DBeaver / sqlite 조회 시 확인할 포인트

- `로컬-UI-연동-및-배포-체크리스트.md`
  - Frontend / Backend / SSE / RAG / RabbitMQ 로컬 실행 경로
  - Chroma HTTP 서버 모드 확인 방법
  - Capstone_Cluster 배포 수정 지점

- `current-status.md`
  - 현재 코드 기준 구현/미구현 상태
  - 테스트 결과
  - 로컬 확인 시 주의사항

- `progress-log.md`
  - 날짜순 작업 기록
  - 구조나 문서 변경 이력 추적

- `sample-manual.txt`
  - 로컬 ingest 테스트용 샘플 문서

## 운영 원칙

- 현재 RAG의 외부 연동 기준은 `HTTP API`다.
- MQ 문서는 `추후 전환 설계` 기준으로 읽는다.
- RAG는 별도 비즈니스 DB를 두지 않고 `Chroma persistent storage` 또는 외부 `ChromaDB HTTP server`를 사용한다.
- Backend DB가 source of truth이고, RAG는 검색용 파생 데이터를 저장한다.

## 정리 기준

- 구현과 다르게 낡은 설명성 문서는 제거한다.
- 현재 코드 기준으로 바로 설명할 수 없는 문장은 넣지 않는다.
- 백엔드/AI/인프라에 전달할 문서는 이 디렉터리 안에서 바로 찾을 수 있게 유지한다.
