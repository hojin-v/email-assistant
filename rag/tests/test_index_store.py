from __future__ import annotations

import numpy as np

from app.services.index_store import IndexRecord, VectorIndexStore


def test_chroma_store_upsert_and_search(tmp_path):
  store = VectorIndexStore(
    dimensions=3,
    backend="chroma",
    persist_directory=str(tmp_path / "chroma"),
  )

  store.upsert(
    "knowledge:1",
    [
      IndexRecord(
        record_id="faq:1:0",
        vector=np.array([1.0, 0.0, 0.0], dtype=np.float32),
        payload={
          "user_id": 1,
          "source_type": "faq",
          "source_id": "1",
          "intent": "가격문의",
          "chunk_text": "가격 정책 안내",
          "metadata": {"kind": "faq"},
        },
      ),
      IndexRecord(
        record_id="faq:2:0",
        vector=np.array([0.0, 1.0, 0.0], dtype=np.float32),
        payload={
          "user_id": 1,
          "source_type": "faq",
          "source_id": "2",
          "intent": "환불문의",
          "chunk_text": "환불 정책 안내",
          "metadata": {"kind": "faq"},
        },
      ),
    ],
  )

  matches = store.search(
    namespace="knowledge:1",
    query_vector=np.array([0.9, 0.1, 0.0], dtype=np.float32),
    top_k=2,
    filters={"intent": "가격문의"},
  )

  assert len(matches) == 1
  record, score = matches[0]
  assert record.record_id == "faq:1:0"
  assert record.payload["chunk_text"] == "가격 정책 안내"
  assert score > 0.5
