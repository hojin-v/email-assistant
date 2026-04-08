# RAG Ownership

기준일: 2026-04-06

## 결론

현재 구조에서 `rag/`는 `Backend_Server` 안이나 `AI/` 안으로 포함되기보다
독립 서비스로 두는 것이 가장 적절하다.

다만 굳이 더 가까운 쪽을 고르면 `AI`보다는 `Backend_Server` 쪽에 더 가깝다.

## 이유

### 왜 `AI` 안이 아닌가

- `AI/` 레포의 핵심 책임은 분류, 요약, 일정 추출, 템플릿 생성이다.
- RAG는 생성 모델 자체보다 검색 인프라에 가깝다.
- 벡터 인덱스, canonical text, retrieval는 분류/생성 모델 책임과 성격이 다르다.
- 현재 목표 설계에서도 AI는 `template.generate`, RAG는 `template.match`로 분리된다.

### 왜 `Backend_Server` 쪽에 더 가까운가

- RAG는 Backend가 저장한 원본 데이터를 받아 검색 가능한 형태로 가공한다.
- 실제 오케스트레이션은 Backend가 담당한다.
- 최종 템플릿 선택과 rerank도 Backend 책임이다.
- 인증, 권한, 사용자별 격리, 파일 저장, 작업 상태 관리는 Backend 중심이다.

### 그래도 독립 서비스로 두는 이유

- 검색과 생성의 책임을 분리할 수 있다.
- embedding 모델, 인덱스 전략, retrieval 로직을 독립적으로 다룰 수 있다.
- AI 서버 변경 없이 검색 로직만 교체하거나 확장하기 쉽다.
- Backend에 벡터 검색 구현을 억지로 섞지 않아도 된다.

## 현재 권장 구조

```text
Frontend
  -> Backend_Server
       -> AI Server
       -> RAG Server
```

## 정리

- 권장: `rag/`는 독립 디렉터리 유지
- 책임상 더 가까운 곳: `Backend_Server`
- 포함시키지 않는 쪽: `AI`
