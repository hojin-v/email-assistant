import base64

import pymupdf
import pytest

from app.services.document_parser import (
  UnsupportedDocumentError,
  extract_text_from_payload,
)


def test_extract_text_from_pdf_with_pymupdf_text_layer():
  document = pymupdf.open()
  page = document.new_page()
  page.insert_text((72, 72), "Refund is available within seven days.")
  pdf_bytes = document.tobytes()
  document.close()

  extracted = extract_text_from_payload(
    file_name="guide.pdf",
    media_type="application/pdf",
    content_base64=base64.b64encode(pdf_bytes).decode("utf-8"),
  )

  assert "Refund" in extracted


def test_extract_text_from_pdf_uses_ocr_fallback_for_image_only_pdf(monkeypatch):
  # PyMuPDF가 직접 만든 PNG를 사용해 이미지 손상 이슈 없이 테스트한다.
  pixmap = pymupdf.Pixmap(pymupdf.csRGB, pymupdf.IRect(0, 0, 10, 10), False)
  image_bytes = pixmap.tobytes("png")

  document = pymupdf.open()
  page = document.new_page()
  page.insert_image(pymupdf.Rect(72, 72, 220, 220), stream=image_bytes)
  pdf_bytes = document.tobytes()
  document.close()

  monkeypatch.setattr(
    "app.services.document_parser._extract_text_from_pdf_with_tesseract",
    lambda raw_bytes: "OCR fallback result",
  )

  extracted = extract_text_from_payload(
    file_name="scanned.pdf",
    media_type="application/pdf",
    content_base64=base64.b64encode(pdf_bytes).decode("utf-8"),
  )

  assert extracted == "OCR fallback result"


def test_extract_text_from_pdf_raises_helpful_error_when_ocr_fails(monkeypatch):
  pixmap = pymupdf.Pixmap(pymupdf.csRGB, pymupdf.IRect(0, 0, 10, 10), False)
  image_bytes = pixmap.tobytes("png")

  document = pymupdf.open()
  page = document.new_page()
  page.insert_image(pymupdf.Rect(72, 72, 220, 220), stream=image_bytes)
  pdf_bytes = document.tobytes()
  document.close()

  monkeypatch.setattr(
    "app.services.document_parser._extract_text_from_pdf_with_tesseract",
    lambda raw_bytes: (_ for _ in ()).throw(
      UnsupportedDocumentError("이미지형 PDF OCR에 실패했습니다. Tesseract가 설치되어 있고 언어 데이터를 확인해주세요.")
    ),
  )

  with pytest.raises(UnsupportedDocumentError) as error:
    extract_text_from_payload(
      file_name="scanned.pdf",
      media_type="application/pdf",
      content_base64=base64.b64encode(pdf_bytes).decode("utf-8"),
    )

  assert "Tesseract" in str(error.value)
