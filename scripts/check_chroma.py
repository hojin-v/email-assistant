from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any


ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
  sys.path.insert(0, str(ROOT_DIR))

from app.config import settings  # noqa: E402

try:
  import chromadb
except ImportError:  # pragma: no cover
  chromadb = None


def main() -> int:
  parser = argparse.ArgumentParser(description="Inspect EmailAssist Chroma collections.")
  parser.add_argument(
    "--backend",
    choices=["chroma", "chroma_http"],
    default=settings.vector_backend,
    help="Vector backend to inspect. Defaults to VECTOR_BACKEND.",
  )
  parser.add_argument(
    "--persist-directory",
    default=settings.chroma_persist_directory,
    help="Local Chroma persistence path for backend=chroma.",
  )
  parser.add_argument("--host", default=settings.chroma_host, help="Chroma HTTP host.")
  parser.add_argument("--port", type=int, default=settings.chroma_port, help="Chroma HTTP port.")
  parser.add_argument(
    "--ssl",
    action=argparse.BooleanOptionalAction,
    default=settings.chroma_ssl,
    help="Use HTTPS for Chroma HTTP.",
  )
  parser.add_argument("--peek", type=int, default=0, help="Print up to N sample ids per collection.")
  args = parser.parse_args()

  if chromadb is None:
    print("chromadb is not installed.")
    return 1

  client = _create_client(args)
  collections = client.list_collections()

  if not collections:
    print("No Chroma collections found.")
    return 0

  print(f"Found {len(collections)} collection(s):")
  for item in collections:
    collection = _resolve_collection(client, item)
    name = getattr(collection, "name", str(item))
    try:
      count = collection.count()
    except Exception as exc:  # pragma: no cover
      print(f"- {name}: count unavailable ({exc})")
      continue

    print(f"- {name}: {count} record(s)")
    if args.peek > 0:
      _print_peek(collection, args.peek)

  return 0


def _create_client(args: argparse.Namespace) -> Any:
  if args.backend == "chroma":
    persist_directory = Path(args.persist_directory)
    if not persist_directory.exists():
      print(f"Persistent directory does not exist yet: {persist_directory}")
    return chromadb.PersistentClient(path=str(persist_directory))

  return chromadb.HttpClient(
    host=args.host,
    port=args.port,
    ssl=args.ssl,
  )


def _resolve_collection(client: Any, item: Any) -> Any:
  if hasattr(item, "count"):
    return item
  return client.get_collection(name=str(item))


def _print_peek(collection: Any, limit: int) -> None:
  try:
    sample = collection.peek(limit=limit)
  except Exception as exc:  # pragma: no cover
    print(f"  peek unavailable: {exc}")
    return

  ids = sample.get("ids") or []
  if not ids:
    print("  sample ids: none")
    return
  print(f"  sample ids: {', '.join(ids[:limit])}")


if __name__ == "__main__":
  raise SystemExit(main())
