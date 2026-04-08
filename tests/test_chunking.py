from app.services.chunking import chunk_text, normalize_text


def test_normalize_text_collapses_blank_lines():
  normalized = normalize_text("첫 줄\r\n\r\n\r\n둘째 줄")
  assert normalized == "첫 줄\n\n둘째 줄"


def test_chunk_text_splits_long_text():
  text = (
    "첫 번째 문단입니다. " * 30
    + "\n\n"
    + "두 번째 문단입니다. " * 30
  )
  chunks = chunk_text(text, max_chars=120, overlap=20)

  assert len(chunks) >= 2
  assert all(len(chunk) <= 120 for chunk in chunks)
