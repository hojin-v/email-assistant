#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys

try:
  import pika
except ImportError:
  print("pika is required. Run this with the rag venv or install pika first.", file=sys.stderr)
  raise


EXCHANGES = [
  ("x.app2ai.direct", "direct"),
  ("x.ai2app.direct", "direct"),
  ("x.app2rag.direct", "direct"),
  ("x.rag2app.direct", "direct"),
  ("x.sse.fanout", "fanout"),
]

QUEUES = [
  "q.2ai.classify",
  "q.2ai.training",
  "q.2app.classify",
  "q.2app.training",
  "q.2rag.knowledge.ingest",
  "q.2rag.templates.index",
  "q.2rag.templates.match",
  "q.2rag.draft",
  "q.2app.knowledge.ingest",
  "q.2app.templates.index",
  "q.2app.templates.match",
  "q.2app.rag.draft",
  "q.2app.rag.progress",
  "q.dlx.failed",
]

BINDINGS = [
  ("q.2ai.classify", "x.app2ai.direct", "2ai.classify"),
  ("q.2ai.training", "x.app2ai.direct", "q.2ai.training"),
  ("q.2app.classify", "x.ai2app.direct", "2app.classify"),
  ("q.2app.training", "x.ai2app.direct", "q.2app.training"),
  ("q.2rag.knowledge.ingest", "x.app2rag.direct", "2rag.knowledge.ingest"),
  ("q.2rag.templates.index", "x.app2rag.direct", "2rag.templates.index"),
  ("q.2rag.templates.match", "x.app2rag.direct", "2rag.templates.match"),
  ("q.2rag.draft", "x.app2rag.direct", "2rag.draft"),
  ("q.2app.knowledge.ingest", "x.rag2app.direct", "2app.knowledge.ingest"),
  ("q.2app.templates.index", "x.rag2app.direct", "2app.templates.index"),
  ("q.2app.templates.match", "x.rag2app.direct", "2app.templates.match"),
  ("q.2app.rag.draft", "x.rag2app.direct", "2app.rag.draft"),
  ("q.2app.rag.progress", "x.rag2app.direct", "2app.rag.progress"),
]


def main() -> int:
  parser = argparse.ArgumentParser(
    description="Reset EmailAssist local RabbitMQ topology for smoke tests.",
  )
  parser.add_argument(
    "--url",
    default="amqp://guest:guest@localhost:5672/",
    help="RabbitMQ AMQP URL. Defaults to local rabbitmq:3-management credentials.",
  )
  parser.add_argument(
    "--yes",
    action="store_true",
    help="Actually delete and recreate resources. Without this flag the script is dry-run only.",
  )
  args = parser.parse_args()

  print("EmailAssist local RabbitMQ topology reset")
  print(f"URL: {args.url}")
  print("Mode:", "apply" if args.yes else "dry-run")
  print()

  if not args.yes:
    print("This will delete known local test queues and exchanges, then recreate them.")
    print("Run again with --yes to apply.")
    print_resource_summary()
    return 0

  connection = pika.BlockingConnection(pika.URLParameters(args.url))
  channel = connection.channel()
  try:
    channel = delete_existing(channel)
    declare_topology(channel)
  finally:
    connection.close()

  print("Local RabbitMQ topology reset complete.")
  return 0


def print_resource_summary() -> None:
  print("Exchanges:")
  for exchange, exchange_type in EXCHANGES:
    print(f"- {exchange} ({exchange_type})")
  print()
  print("Queues:")
  for queue in QUEUES:
    print(f"- {queue}")


def delete_existing(channel):
  print("Deleting queues...")
  for queue in QUEUES:
    try:
      channel.queue_delete(queue=queue, if_unused=False, if_empty=False)
      print(f"- deleted queue {queue}")
    except pika.exceptions.ChannelClosedByBroker as exc:
      print(f"- queue delete skipped {queue}: {exc.reply_text}")
      channel = reopen_channel(channel)

  print("Deleting exchanges...")
  for exchange, _exchange_type in reversed(EXCHANGES):
    try:
      channel.exchange_delete(exchange=exchange, if_unused=False)
      print(f"- deleted exchange {exchange}")
    except pika.exceptions.ChannelClosedByBroker as exc:
      print(f"- exchange delete skipped {exchange}: {exc.reply_text}")
      channel = reopen_channel(channel)
  return channel


def reopen_channel(channel):
  connection = channel.connection
  if channel.is_open:
    return channel
  return connection.channel()


def declare_topology(channel) -> None:
  print("Declaring exchanges...")
  for exchange, exchange_type in EXCHANGES:
    channel.exchange_declare(exchange=exchange, exchange_type=exchange_type, durable=True)
    print(f"- declared exchange {exchange}")

  print("Declaring queues...")
  for queue in QUEUES:
    channel.queue_declare(queue=queue, durable=True)
    print(f"- declared queue {queue}")

  print("Declaring bindings...")
  for queue, exchange, routing_key in BINDINGS:
    channel.queue_bind(queue=queue, exchange=exchange, routing_key=routing_key)
    print(f"- bound queue={queue} exchange={exchange} routing_key={routing_key}")


if __name__ == "__main__":
  raise SystemExit(main())
