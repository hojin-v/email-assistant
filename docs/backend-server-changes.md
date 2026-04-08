# Backend_Server Changes For RAG

기준일: 2026-04-06

## 결론

`Backend_Server`는 RAG 연동의 중심 오케스트레이터가 되어야 한다.

다만 현재 방향은 다음과 같다.

- Backend DB를 source of truth로 유지
- RAG용 별도 DB 테이블은 만들지 않음
- Backend는 원본 데이터 저장 + RAG 호출 + 최종 선택만 담당

## 필요한 수정

### 1. RAG client 추가

Backend에서 아래 HTTP 호출을 수행할 client가 필요하다.

- `POST /extract-text`
- `POST /knowledge/index`
- `POST /knowledge/search`
- `POST /canonical/email`
- `POST /canonical/template`
- `POST /templates/index`
- `POST /templates/match`

### 2. 파일 업로드 후 RAG 호출

필요 흐름:

1. 파일 원본 저장
2. 저장된 파일 바이트를 RAG `extract-text`로 전달
3. 추출 텍스트와 FAQ/회사 소개를 합쳐 `knowledge/index` 호출

### 3. 템플릿 생성 후 RAG 호출

필요 흐름:

1. AI 서버가 `template.generate` 결과 반환
2. Backend가 결과 저장
3. Backend가 `canonical/template` 호출
4. Backend가 `templates/index` 호출

### 4. 이메일 수신 후 RAG 호출

필요 흐름:

1. AI 서버가 `classify/summarize` 결과 반환
2. Backend가 `canonical/email` 호출
3. Backend가 `templates/match` 호출
4. Backend가 후보 rerank
5. 최종 템플릿 선택 후 프론트 응답 구성

## 권장 DB 변경 수준

최소 권장:

- 가능하면 신규 테이블 없이 시작
- 정말 필요하면 아래 정도만 고려
  - `Jobs`
  - `BusinessResources.index_status`
  - `Templates.generation_status`

굳이 만들지 않는 방향:

- chunk 저장 테이블
- embedding 저장 테이블
- RAG 전용 metadata 대형 테이블

## Backend가 담당해야 하는 것

- 사용자 인증/권한
- 원본 파일 저장
- 원본 데이터 조회
- AI와 RAG 호출 순서 제어
- 최종 template rerank
- 최종 API 응답 구성

## Backend가 하지 않는 것

- embedding 생성
- vector index 관리
- similarity search
- chunk 저장
