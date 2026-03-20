#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-capture}"
IMAGE_NAME="${EMAILASSIST_CAPTURE_IMAGE:-emailassist-design-capture}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
OUTPUT_ROOT="${EMAILASSIST_ARTIFACT_ROOT:-$(cd "${REPO_ROOT}/.." && pwd)/email-assistant-artifacts/design-doc}"

if ! command -v docker >/dev/null 2>&1; then
  cat <<'EOF' >&2
docker CLI를 찾을 수 없습니다.
Docker Desktop WSL integration 또는 로컬 Docker Engine이 필요합니다.
설치 후 다시 실행해 주세요.
EOF
  exit 1
fi

case "${MODE}" in
  build)
    docker build -f "${REPO_ROOT}/tools/design-capture/Dockerfile" -t "${IMAGE_NAME}" "${REPO_ROOT}"
    ;;
  scaffold|capture)
    mkdir -p "${OUTPUT_ROOT}"
    docker build -f "${REPO_ROOT}/tools/design-capture/Dockerfile" -t "${IMAGE_NAME}" "${REPO_ROOT}"
    docker run --rm \
      -e EMAILASSIST_ARTIFACT_ROOT=/workspace/design-doc \
      -v "${OUTPUT_ROOT}:/workspace/design-doc" \
      "${IMAGE_NAME}" \
      node "tools/design-capture/${MODE}.mjs"
    ;;
  shell)
    docker build -f "${REPO_ROOT}/tools/design-capture/Dockerfile" -t "${IMAGE_NAME}" "${REPO_ROOT}"
    docker run --rm -it "${IMAGE_NAME}" bash
    ;;
  *)
    cat <<'EOF' >&2
사용법:
  bash tools/design-capture/run-in-docker.sh build
  bash tools/design-capture/run-in-docker.sh scaffold
  bash tools/design-capture/run-in-docker.sh capture
  bash tools/design-capture/run-in-docker.sh shell
EOF
    exit 1
    ;;
esac
