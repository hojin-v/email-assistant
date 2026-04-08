# RAG Docs

`rag/` 내부 문서는 RAG 서버 자체의 책임, 현재 구현 상태, 연동 수정안을
RAG 모듈 관점에서 관리하기 위한 문서 모음이다.

## 문서 목록

- `progress-log.md`
  - 날짜순 작업 기록
  - 어떤 변경이 언제 들어갔는지 추적
- `ownership.md`
  - RAG가 어느 레포 책임에 더 가까운지
  - Backend/AI와의 경계
- `current-status.md`
  - 현재 `rag/`에 실제 구현된 내용
  - 아직 없는 내용
- `retrieval-query-design.md`
  - 카테고리별 retrieval query 기준
  - source priority, query set, filter 설계
- `backend-server-changes.md`
  - RAG 연동을 위해 `Backend_Server`에 필요한 수정
- `ai-server-changes.md`
  - RAG 연동을 위해 `AI/` 레포에 필요한 수정

## 운영 원칙

- RAG는 별도 서비스로 유지한다.
- RAG는 별도 DB를 두지 않는다.
- Backend DB를 source of truth로 본다.
- AI는 분류/요약/템플릿 생성에 집중하고, RAG는 검색에 집중한다.

## 문서 사용 순서

새로 참여한 사람이 빠르게 이해하려면 아래 순서로 보면 된다.

1. `../README.md`
2. `current-status.md`
3. `retrieval-query-design.md`
4. `progress-log.md`
5. `ownership.md`
6. `backend-server-changes.md`, `ai-server-changes.md`

## 진행 기록 원칙

- 기능 구현이나 구조 변경이 있으면 `progress-log.md`에 먼저 날짜 단위로 남긴다.
- 현재 시점의 정리된 상태는 `current-status.md`에 반영한다.
- 서비스 경계나 타 서버 수정안이 바뀌면 관련 change 문서도 함께 갱신한다.
