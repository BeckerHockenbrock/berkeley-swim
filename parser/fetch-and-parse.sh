#!/usr/bin/env bash
# Download each pool PDF listed in parser/sources.json and run the Java parser
# to refresh the JSON files under web/public/data/.
#
# Usage:
#   parser/fetch-and-parse.sh
#
# Requires: jq, curl, Java 21+, and the Gradle wrapper (parser/gradlew).
# Run from the repo root.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCES="$SCRIPT_DIR/sources.json"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

if [[ ! -f "$SOURCES" ]]; then
  echo "Missing $SOURCES" >&2
  exit 1
fi

count=$(jq '.pools | length' "$SOURCES")
if [[ "$count" -eq 0 ]]; then
  echo "No pools listed in $SOURCES" >&2
  exit 1
fi

for i in $(seq 0 $((count - 1))); do
  pool_id=$(jq -r ".pools[$i].id" "$SOURCES")
  url=$(jq -r ".pools[$i].url" "$SOURCES")
  out_rel=$(jq -r ".pools[$i].out" "$SOURCES")
  out_abs="$REPO_ROOT/$out_rel"
  pdf_path="$TMP_DIR/${pool_id}.pdf"

  echo ">> $pool_id: downloading $url"
  curl --fail --location --silent --show-error --output "$pdf_path" "$url"

  if [[ ! -s "$pdf_path" ]]; then
    echo "Empty PDF downloaded for $pool_id" >&2
    exit 1
  fi

  echo ">> $pool_id: parsing -> $out_rel"
  (cd "$SCRIPT_DIR" && ./gradlew --quiet run --args="--pool $pool_id --pdf $pdf_path --out $out_abs")
done

echo "All pools refreshed."
