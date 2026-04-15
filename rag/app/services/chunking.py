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
  # 기본 chunking은 "문단 유지 + 길이 제한 + overlap" 전략이다.
  # semantic chunking이 실패하더라도 항상 동작해야 하는 가장 안정적인 경로다.
  cleaned = normalize_text(text)
  if not cleaned:
    return []

  paragraphs = [part.strip() for part in cleaned.split("\n\n") if part.strip()]
  if not paragraphs:
    # 문단 구분이 없는 텍스트라도 완전히 버리지 않고
    # 제한 길이 안에서 최소 1개 chunk는 만들도록 한다.
    return [cleaned[:max_chars]]

  chunks: list[str] = []
  current = ""

  for paragraph in paragraphs:
    candidate = paragraph if not current else f"{current}\n\n{paragraph}"
    if len(candidate) <= max_chars:
      # 아직 길이 제한 안이면 현재 chunk에 이어 붙인다.
      current = candidate
      continue

    if current:
      chunks.append(current)
      # overlap을 두어 중요한 문맥이 chunk 경계에서 너무 날카롭게 끊기지 않게 한다.
      tail = current[-overlap:] if overlap > 0 else ""
      current = f"{tail}\n\n{paragraph}".strip()
    else:
      # 문단 하나가 너무 길면, 문단 내부에서도 다시 잘라야 한다.
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
