from __future__ import annotations

import os


os.environ["EMBEDDING_BACKEND"] = "hash"
os.environ.setdefault("LLM_API_KEY", "test-key")
