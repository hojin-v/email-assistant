# Retrieval Query Design

이 문서는 `draft` 생성 전에 수행할 retrieval 오케스트레이션 기준을 정리한다.
핵심 목적은 카테고리별로 어떤 검색 요청을 만들고, 어떤 소스에서 무엇을 우선 가져올지
일관된 규칙을 만드는 것이다.

## 1. 기본 원칙

- 검색은 프롬프트 내부가 아니라 `draft` 호출 전에 서비스 코드에서 먼저 수행한다.
- `draft` 프롬프트는 검색 결과를 소비하는 단계로 본다.
- 카테고리별 retrieval은 `intent`를 기준으로 정의하고, `domain`은 보조 힌트로 사용한다.
- `profile`, `faq`, `resource`, `manual` 네 가지 source_type을 기본 검색 대상으로 본다.
- 긴 PDF는 semantic chunking을 전제로 하고, profile/faq는 현재 기본 chunking 정책을 유지한다.

## 2. 표준 retrieval 흐름

1. `classify` 결과에서 `domain`, `intent`, `summary`, `keyphrases`, `entities`를 받는다.
2. `intent`에 대응하는 기본 query set을 만든다.
3. `entities.product`, `entities.company`, `summary`, `keyphrases`로 query를 보강한다.
4. source priority와 metadata filter를 적용해 `knowledge/search`를 여러 번 호출한다.
5. 결과를 source별로 묶고 중복 chunk를 제거한다.
6. 최종 context를 `draft` 요청의 `rag_context`로 넣는다.

## 3. 공통 query 조립 규칙

### 3.1 공통 입력

- `domain`
- `intent`
- `summary`
- `keyphrases`
- `entities.product`
- `entities.company`
- `entities.date`, `entities.time`, `entities.deadline`

### 3.2 공통 query 템플릿

- `{intent} 대응 정책`
- `{intent} 처리 절차`
- `{intent} 답변 시 포함할 정보`
- `{product} {intent}`
- `{summary 핵심구문}`

### 3.3 공통 source 우선순위

- 정책/예외/조건 확인: `faq > manual > resource > profile`
- 제품/서비스 소개 확인: `profile > resource > manual > faq`
- 절차/운영 가이드 확인: `manual > faq > resource > profile`
- 일정/사람/역할 확인: `profile > faq > manual > resource`

## 4. source_type별 검색 역할

| source_type | 역할 | 검색에 강한 내용 |
| --- | --- | --- |
| `profile` | 회사 기본 소개 | 회사 소개, 서비스 범위, 기본 응대 톤, 운영 시간 |
| `faq` | 반복 질문/정책 응답 | 자주 묻는 질문, 환불/과금/지원 정책, 예외 조건 |
| `resource` | 업로드 자료 | 브로슈어, 소개서, 가격표, 안내문 |
| `manual` | 업무 매뉴얼 | 세부 절차, 승인 흐름, 운영 규정, 장애 대응 |

## 5. intent별 retrieval 설계

아래 표의 `기본 query`는 최소 검색어 세트다.
실제 요청 시에는 `summary`, `keyphrases`, `entities.product`를 추가로 붙여 확장한다.

### 5.1 Sales

| intent | 필요한 정보 | 기본 query | source priority | filter 힌트 |
| --- | --- | --- | --- | --- |
| 견적 요청 | 가격 기준, 옵션, 납기, 도입 절차 | `견적 요청 가격 정책`, `견적 산정 기준`, `제품 옵션`, `도입 절차` | `faq > resource > manual > profile` | `intent=견적 요청` |
| 계약 문의 | 계약 절차, 계약 조건, 필수 정보 | `계약 문의 대응`, `계약 진행 절차`, `계약 시 필요 정보` | `manual > faq > resource > profile` | `domain=Sales` |
| 가격 협상 | 할인 조건, 협상 가능 범위, 승인 정책 | `가격 협상 기준`, `할인 정책`, `승인 필요 조건` | `manual > faq > resource > profile` | `domain=Sales` |
| 제안서 요청 | 제안서 범위, 제공 자료, 회사 소개 | `제안서 제공 범위`, `회사 소개 자료`, `서비스 강점` | `resource > profile > faq > manual` | `domain=Sales` |
| 미팅 일정 조율 | 가능 일정, 담당자, 회의 방식 | `미팅 일정 조율`, `상담 가능 시간`, `담당자 안내` | `profile > faq > manual > resource` | `domain=Sales` |

### 5.2 Marketing & PR

| intent | 필요한 정보 | 기본 query | source priority | filter 힌트 |
| --- | --- | --- | --- | --- |
| 협찬/제휴 제안 | 제휴 기준, 협업 범위, 문의 창구 | `협찬 제휴 기준`, `협업 가능 범위`, `제휴 문의 절차` | `faq > profile > manual > resource` | `domain=Marketing & PR` |
| 광고 문의 | 광고 가능 채널, 단가, 진행 절차 | `광고 문의 대응`, `광고 상품 안내`, `광고 진행 절차` | `resource > faq > profile > manual` | `intent=광고 문의` |
| 보도자료 요청 | 회사 소개, 보도자료 제공 범위, 연락처 | `보도자료 요청 대응`, `회사 소개`, `홍보 자료 제공` | `resource > profile > faq > manual` | `domain=Marketing & PR` |
| 인터뷰 요청 | 인터뷰 가능 범위, 담당자, 일정 | `인터뷰 요청 대응`, `인터뷰 가능 주제`, `홍보 담당자` | `profile > faq > manual > resource` | `domain=Marketing & PR` |
| 콘텐츠 협업 문의 | 협업 유형, 브랜드 가이드, 진행 절차 | `콘텐츠 협업 기준`, `브랜드 가이드`, `협업 진행 절차` | `resource > faq > profile > manual` | `domain=Marketing & PR` |
| 행사/캠페인 문의 | 참여 기준, 지원 범위, 일정 조건 | `행사 캠페인 문의`, `행사 참여 기준`, `캠페인 협업 절차` | `faq > manual > resource > profile` | `domain=Marketing & PR` |

### 5.3 HR

| intent | 필요한 정보 | 기본 query | source priority | filter 힌트 |
| --- | --- | --- | --- | --- |
| 채용 문의 | 채용 절차, 포지션 정보, 제출 방법 | `채용 문의 대응`, `지원 절차`, `채용 공고 정보` | `faq > resource > manual > profile` | `domain=HR` |
| 면접 일정 조율 | 가능한 일정, 면접 방식, 참석자 | `면접 일정 조율`, `면접 가능 시간`, `면접 진행 방식` | `manual > faq > profile > resource` | `intent=면접 일정 조율` |
| 휴가 신청 | 신청 절차, 승인 흐름, 제출 시점 | `휴가 신청 절차`, `휴가 승인 흐름`, `휴가 규정` | `manual > faq > profile > resource` | `domain=HR` |
| 증명서 발급 요청 | 발급 종류, 신청 방법, 소요 시간 | `증명서 발급 요청`, `발급 절차`, `처리 기간` | `faq > manual > profile > resource` | `domain=HR` |

### 5.4 Finance

| intent | 필요한 정보 | 기본 query | source priority | filter 힌트 |
| --- | --- | --- | --- | --- |
| 세금계산서 요청 | 발행 기준, 필요 정보, 처리 일정 | `세금계산서 요청`, `세금계산서 발행 기준`, `발행 시 필요 정보` | `faq > manual > resource > profile` | `intent=세금계산서 요청` |
| 비용 처리 문의 | 비용 처리 정책, 제출 서류, 승인 흐름 | `비용 처리 문의`, `증빙 제출 기준`, `비용 처리 절차` | `manual > faq > resource > profile` | `domain=Finance` |
| 입금 확인 요청 | 입금 확인 절차, 반영 시간, 확인 방법 | `입금 확인 요청`, `입금 반영 시간`, `결제 확인 절차` | `faq > manual > resource > profile` | `domain=Finance` |
| 정산 문의 | 정산 주기, 정산 기준, 예외 처리 | `정산 문의 대응`, `정산 기준`, `정산 일정` | `manual > faq > resource > profile` | `domain=Finance` |

### 5.5 Customer Support

| intent | 필요한 정보 | 기본 query | source priority | filter 힌트 |
| --- | --- | --- | --- | --- |
| 불만 접수 | 응대 원칙, escalation 경로, 보상 기준 | `불만 접수 대응`, `클레임 처리 절차`, `에스컬레이션 기준` | `manual > faq > profile > resource` | `domain=Customer Support` |
| 기술 지원 요청 | 문제 해결 절차, 점검 체크리스트, 지원 채널 | `기술 지원 요청`, `장애 대응 절차`, `기본 점검 항목` | `manual > faq > resource > profile` | `intent=기술 지원 요청` |
| 환불 요청 | 환불 정책, 예외 조건, 처리 절차 | `환불 요청`, `환불 정책`, `환불 처리 절차`, `환불 예외 조건` | `faq > manual > resource > profile` | `intent=환불 요청` |
| 사용법 문의 | 사용 방법, 가이드 문서, 시작 절차 | `사용법 문의`, `기본 사용 가이드`, `초기 설정 절차` | `resource > manual > faq > profile` | `domain=Customer Support` |

### 5.6 IT/Ops

| intent | 필요한 정보 | 기본 query | source priority | filter 힌트 |
| --- | --- | --- | --- | --- |
| 시스템 오류 보고 | 장애 분류, 대응 절차, 우회 방법 | `시스템 오류 보고`, `장애 대응 절차`, `우회 방법` | `manual > faq > resource > profile` | `domain=IT/Ops` |
| 계정 생성 요청 | 생성 절차, 필요 정보, 승인 조건 | `계정 생성 요청`, `계정 발급 절차`, `필수 입력 정보` | `manual > faq > profile > resource` | `intent=계정 생성 요청` |
| 권한 변경 요청 | 권한 정책, 승인 절차, 처리 시간 | `권한 변경 요청`, `권한 승인 절차`, `권한 정책` | `manual > faq > profile > resource` | `intent=권한 변경 요청` |

### 5.7 Admin

| intent | 필요한 정보 | 기본 query | source priority | filter 힌트 |
| --- | --- | --- | --- | --- |
| 공지 전달 | 공지 형식, 배포 채널, 일정 | `공지 전달 형식`, `공지 배포 절차`, `공지 템플릿` | `manual > resource > faq > profile` | `domain=Admin` |
| 내부 보고 | 보고 형식, 필수 항목, 승인 라인 | `내부 보고 절차`, `보고 형식`, `보고 시 포함 항목` | `manual > resource > faq > profile` | `domain=Admin` |
| 자료 요청 | 요청 가능 자료, 전달 절차, 보안 기준 | `자료 요청 절차`, `자료 제공 기준`, `전달 가능 범위` | `faq > manual > resource > profile` | `intent=자료 요청` |
| 협조 요청 | 협조 요청 형식, 관련 부서, 처리 절차 | `협조 요청 절차`, `내부 협업 기준`, `요청 시 포함 항목` | `manual > profile > faq > resource` | `intent=협조 요청` |

## 6. query 확장 규칙

### 6.1 엔터티 기반 확장

- `entities.product`가 있으면 기본 query 앞에 제품명을 붙인다.
- `entities.company`가 있으면 profile 검색 query에 회사명을 붙인다.
- `entities.date`, `entities.time`, `entities.deadline`이 있으면 일정/기한 관련 query를 추가한다.

예시:

- 기본 query: `환불 정책`
- 확장 query: `엔터프라이즈 플랜 환불 정책`

### 6.2 summary 기반 확장

- summary에서 핵심 명사구 1~2개를 추출해 보조 query로 추가한다.
- 단, summary 전체 문장을 그대로 query로 쓰지 않는다.

예시:

- summary: `고객이 결제 후 7일 이내 환불 가능 여부와 처리 절차를 문의함`
- 보조 query: `결제 후 7일 환불`, `환불 처리 절차`

## 7. draft 프롬프트에 넣을 context 조립 규칙

- source_type별로 섹션을 나눠 넣는다.
- 같은 source_type 안에서는 score 순으로 상위 2~3개만 넣는다.
- profile은 기본 배경으로 짧게 넣고, 실제 정책 근거는 faq/manual 위주로 넣는다.
- 중복 chunk는 제거한다.
- 너무 긴 chunk는 프롬프트 투입 전 500~700자 단위로 잘라 재정리한다.

예시 포맷:

```text
[회사 기본 정보]
- ...

[FAQ 근거]
- ...

[업무 매뉴얼 근거]
- ...
```

## 8. 구현 우선순위

1. `intent -> query set` 고정 매핑을 먼저 구현한다.
2. source priority를 반영한 다중 `knowledge/search` 호출을 붙인다.
3. `summary`, `keyphrases`, `entities` 기반 query 확장을 추가한다.
4. 이후에 검색 로그를 보고 query set을 intent별로 보정한다.

## 9. 초기 구현 권장 범위

처음부터 30개 intent를 모두 고도화하지 말고 아래 high-value intent부터 시작하는 것을 권장한다.

- `견적 요청`
- `광고 문의`
- `면접 일정 조율`
- `세금계산서 요청`
- `환불 요청`
- `기술 지원 요청`
- `계정 생성 요청`
- `자료 요청`
