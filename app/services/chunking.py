from __future__ import annotations

import re


def normalize_text(text: str) -> str:
  # 비즈니스 문구는 최대한 보존하면서도
  # 검색 품질을 해치는 공백 노이즈만 정리한다.
  normalized = text.replace("\r\n", "\n").replace("\r", "\n")
  normalized = re.sub(r"[ \t]+", " ", normalized)
  normalized = re.sub(r"\n{3,}", "\n\n", normalized)
  return normalized.strip()


def chunk_text(text: str, max_chars: int, overlap: int) -> list[str]:
  cleaned = normalize_text(text)
  if not cleaned:
    return []

  paragraphs = [part.strip() for part in cleaned.split("\n\n") if part.strip()]
  if not paragraphs:
    return [cleaned[:max_chars]]

  chunks: list[str] = []
  current = ""

  for paragraph in paragraphs:
    candidate = paragraph if not current else f"{current}\n\n{paragraph}"
    if len(candidate) <= max_chars:
      current = candidate
      continue

    if current:
      chunks.append(current)
      # overlap을 두어 중요한 문맥이 chunk 경계에서 너무 날카롭게 끊기지 않게 한다.
      tail = current[-overlap:] if overlap > 0 else ""
      current = f"{tail}\n\n{paragraph}".strip()
    else:
      start = 0
      while start < len(paragraph):
        end = start + max_chars
        piece = paragraph[start:end].strip()
        if piece:
          chunks.append(piece)
        if end >= len(paragraph):
          current = ""
          break
        start = max(end - overlap, start + 1)

    while len(current) > max_chars:
      chunks.append(current[:max_chars].strip())
      current = current[max(max_chars - overlap, 1):].strip()

  if current:
    chunks.append(current)

  return [chunk for chunk in chunks if chunk]
