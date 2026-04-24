# Chroma 저장구조 / ERD

이 문서는 `rag/`가 Chroma에 데이터를 어떻게 저장하는지 설명한다.
RAG는 별도 비즈니스 DB를 만들지 않고 Chroma persistent storage를 사용한다.

## 1. 저장 위치

기본 저장 경로:

```text
rag/.rag-data/chroma
```

로컬 단독 실행은 위 persistent 경로를 사용한다.
배포 환경에서 별도 ChromaDB 서버를 띄운 경우에는 HTTP client로 연결한다.

```text
VECTOR_BACKEND=chroma
- chromadb.PersistentClient(path=CHROMA_PERSIST_DIRECTORY)

VECTOR_BACKEND=chroma_http
- chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT, ssl=CHROMA_SSL)
```

현재 실제 디스크 구조는 아래처럼 생긴다.

```text
.rag-data/chroma
  ├─ chroma.sqlite3
  ├─ <uuid>/
  │   ├─ data_level0.bin
  │   ├─ header.bin
  │   ├─ length.bin
  │   └─ link_lists.bin
  └─ ...
```

의미:

- `chroma.sqlite3`
  - collection, segment, metadata 등 메타데이터 저장
- `<uuid>/...bin`
  - HNSW 벡터 인덱스 내부 파일
  - 사람이 직접 읽는 용도 아님

즉 파일명을 보고 데이터를 관리하는 구조가 아니라,
`collection / record_id / metadata` 기준으로 관리한다.

외부 ChromaDB 서버 모드에서는 RAG 컨테이너 안에 `.rag-data/chroma`를 만들지 않고,
ChromaDB 서버가 가진 storage / PVC가 실제 저장 위치가 된다.

## 2. namespace와 collection

RAG는 사용자별 / 용도별로 namespace를 나눈다.

```text
knowledge namespace
- knowledge:{user_id}

template namespace
- template:{user_id}
```

코드에서 collection 이름은 Chroma에 맞게 정리된다.

```text
knowledge:1 -> knowledge_1
template:1  -> template_1
```

현재 실제 sqlite에서 확인된 collection 예시:

```text
knowledge_1
knowledge_2
knowledge_3
template_1
template_3
```

## 3. 저장 단위

### 3-1. knowledge record

knowledge는 chunk 단위로 저장한다.

```text
record_id
- faq:{source_id}:{chunk_index}
- manual:{source_id}:{chunk_index}
```

예:

```text
faq:faq-1:0
manual:manual-1:0
```

### 3-2. template record

template는 template 1건당 1 record로 저장한다.

```text
record_id
- template:{template_id}
```

예:

```text
template:101
```

## 4. 논리 ERD

Chroma 내부를 `RAG 관점`으로 단순화하면 아래와 같다.

```text
+------------------+
| Collection       |
+------------------+
| id               |
| name             |
| dimension        |
+------------------+
         |
         | 1:N
         v
+------------------+
| Segment          |
+------------------+
| id               |
| type             |
| scope            |
| collection       |
+------------------+
         |
         | 1:N
         v
+------------------+
| Embedding        |
+------------------+
| id               |
| segment_id       |
| embedding_id     |
| seq_id           |
| created_at       |
+------------------+
         |
         | 1:N
         v
+----------------------+
| EmbeddingMetadata    |
+----------------------+
| id                   |
| key                  |
| string_value         |
| int_value            |
| float_value          |
| bool_value           |
+----------------------+
```

그리고 RAG가 실제로 넣는 payload는 아래처럼 이해하면 된다.

```text
IndexRecord
  -> record_id
  -> vector
  -> payload
```

payload는 Chroma metadata와 document로 분해되어 들어간다.

## 5. RAG payload 저장 방식

### 5-1. document

`documents` 필드에는 사람이 읽을 대표 텍스트가 들어간다.

우선순위:

```text
chunk_text
-> canonical_text
-> title
```

즉:

- knowledge record면 `chunk_text`
- template record면 `canonical_text`

가 document에 들어간다.

### 5-2. metadata

filter 가능한 scalar 필드만 최상위 metadata에 넣는다.

현재 코드 기준 scalar metadata key:

```text
- user_id
- source_type
- source_id
- title
- intent
- chunk_index
- template_id
- mail_tone
- domain
```

### 5-3. payload_json

원래 payload 전체는 `payload_json` 문자열로 같이 저장한다.

즉 metadata는 두 겹이다.

```text
top-level metadata
- 빠른 filter 용

payload_json
- 전체 복원 용
```

## 6. 실제 예시

### 6-1. knowledge 예시

```text
collection
- knowledge_1

embedding_id
- faq:faq-1:0

document
- "질문: 환불은 언제 가능한가요?\n답변: 결제 후 7일 이내 가능합니다."

metadata
- user_id = 1
- source_type = faq
- source_id = faq-1
- title = 환불 정책
- chunk_index = 0
- payload_json = "{...}"
```

### 6-2. template 예시

```text
collection
- template_1

embedding_id
- template:101

document
- "title: 견적 요청 응답\nintent: 견적 요청\n..."

metadata
- template_id = 101
- title = 견적 요청 응답
- intent = 견적 요청
- mail_tone = formal
- domain = Sales
- payload_json = "{...}"
```

## 7. sqlite 주요 테이블

로컬 persistent mode에서는 `chroma.sqlite3`와 HNSW 파일을 직접 조회할 수 있다.
다만 운영에서 HTTP ChromaDB를 쓰면 파일 접근보다 client/API 기반 조회를 기준으로 한다.

RAG에는 간단한 조회 스크립트를 둔다.

```bash
cd rag
.venv/bin/python scripts/check_chroma.py --backend chroma --persist-directory .rag-data/chroma --peek 3
.venv/bin/python scripts/check_chroma.py --backend chroma_http --host localhost --port 8000 --no-ssl --peek 3
```

현재 실제 sqlite에서 확인된 주요 테이블:

```text
- collections
- segments
- embeddings
- embedding_metadata
- segment_metadata
```

### 7-1. `collections`

컬럼:

```text
- id
- name
- dimension
- database_id
- config_json_str
- schema_str
```

### 7-2. `segments`

컬럼:

```text
- id
- type
- scope
- collection
```

### 7-3. `embeddings`

컬럼:

```text
- id
- segment_id
- embedding_id
- seq_id
- created_at
```

### 7-4. `embedding_metadata`

컬럼:

```text
- id
- key
- string_value
- int_value
- float_value
- bool_value
```

### 7-5. `segment_metadata`

컬럼:

```text
- segment_id
- key
- str_value
- int_value
- float_value
- bool_value
```

## 8. DBeaver / sqlite로 확인하는 방법

### 8-1. 주의

RAG 서버가 실행 중이면 `SQLITE_BUSY`가 날 수 있다.

이유:

```text
RAG/Chroma가 chroma.sqlite3를 사용 중
-> 외부 툴이 접근
-> database is locked
```

안전한 방법:

```text
1. RAG 서버 중지 후 확인
또는
2. sqlite 파일 복사본을 열어 확인
```

예:

```bash
cp rag/.rag-data/chroma/chroma.sqlite3 /tmp/chroma-copy.sqlite3
```

### 8-2. 기본 조회 SQL

테이블 목록:

```sql
SELECT name
FROM sqlite_master
WHERE type = 'table'
ORDER BY name;
```

컬럼 확인:

```sql
PRAGMA table_info(collections);
PRAGMA table_info(segments);
PRAGMA table_info(embeddings);
PRAGMA table_info(embedding_metadata);
PRAGMA table_info(segment_metadata);
```

collection / segment 관계:

```sql
select c.name, s.id as segment_id, s.scope, s.type
from collections c
join segments s on s.collection = c.id
order by c.name, s.scope;
```

실제 record와 metadata 확인:

```sql
select
  c.name as collection_name,
  e.embedding_id,
  m.key,
  m.string_value,
  m.int_value
from embeddings e
join segments s on s.id = e.segment_id
join collections c on c.id = s.collection
left join embedding_metadata m on m.id = e.id
where m.key in (
  'source_type',
  'source_id',
  'title',
  'template_id',
  'payload_json',
  'chunk_index',
  'intent'
)
order by c.name, e.embedding_id, m.key;
```

## 9. 삭제 / 재인덱싱 기준

파일이 아니라 `record_id`와 metadata 기준으로 관리해야 한다.

예:

```text
manual 삭제
-> source_id = manual-55 기준 삭제

template 삭제
-> template_id = 101 기준 삭제
```

즉 운영 기준은:

```text
파일명 관리 X
collection / record_id / metadata 관리 O
```

## 10. 최종 정리

- Chroma는 `.rag-data/chroma` 아래에 저장된다.
- 사람은 `chroma.sqlite3`를 통해 구조를 확인한다.
- `.bin` 파일은 내부 벡터 인덱스 파일이라 직접 읽지 않는다.
- 실제 운영 관리 기준은 `collection`, `record_id`, `payload_json`이다.
