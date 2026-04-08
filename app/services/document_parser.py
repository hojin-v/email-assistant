from __future__ import annotations

import base64
from io import BytesIO
from pathlib import Path

from pypdf import PdfReader


class UnsupportedDocumentError(ValueError):
  pass


def extract_text_from_payload(file_name: str, media_type: str, content_base64: str) -> str:
  raw_bytes = base64.b64decode(content_base64)
  suffix = Path(file_name).suffix.lower()

  if media_type == "text/plain" or suffix == ".txt":
    return raw_bytes.decode("utf-8", errors="ignore").strip()

  if media_type == "application/pdf" or suffix == ".pdf":
    # 1차 구현에서는 단순 텍스트 추출만 처리한다.
    # 표나 레이아웃 의존 문서가 중요해지면 이후 파서를 교체할 수 있다.
    reader = PdfReader(BytesIO(raw_bytes))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n\n".join(page.strip() for page in pages if page.strip()).strip()

  raise UnsupportedDocumentError(
    f"Unsupported file type for RAG extraction: media_type={media_type}, suffix={suffix}"
  )
