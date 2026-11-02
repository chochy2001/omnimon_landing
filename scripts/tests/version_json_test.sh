#!/usr/bin/env bash
# Contract test: the deploy stamps /version.json with the release SHA and
# verifies what the public origin serves (AUDIT-GO-3). Behavior first: the
# writer script runs against temp files and its output is parsed as JSON;
# then the deploy workflow must still contain the stamping and the live
# read-back markers, so the gate cannot be quietly deleted later.
#
# Run from the repo root: bash scripts/tests/version_json_test.sh
# Exit 0 only when every test passes. Prints PASS/FAIL counts.
set -euo pipefail

cd "$(dirname "$0")/../.."
script="scripts/write-version-json.mjs"
workflow=".github/workflows/deploy-hostinger.yml"

pass=0
fail=0
ok() { pass=$((pass + 1)); printf 'ok - %s\n' "$1"; }
not_ok() { fail=$((fail + 1)); printf 'NOT OK - %s\n' "$1"; }

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

sha="0123456789abcdef0123456789abcdef01234567"
out="$tmp/version.json"

if node "$script" --sha "$sha" --out "$out" >/dev/null 2>&1 && [ -s "$out" ]; then
  if SHA="$sha" OUT="$out" node -e '
    const fs = require("node:fs");
    const d = JSON.parse(fs.readFileSync(process.env.OUT, "utf8"));
    if (d.sha !== process.env.SHA) process.exit(1);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(d.built_at || "")) process.exit(2);
  ' 2>/dev/null; then
    ok "writer emits parseable version.json with exact sha and built_at"
  else
    not_ok "writer output is not the expected JSON contract"
  fi
else
  not_ok "writer failed on a valid 40-char sha"
fi

bad="$tmp/bad.json"
if node "$script" --sha "dev" --out "$bad" >/dev/null 2>&1; then
  not_ok "writer accepted a non-SHA marker"
elif [ -e "$bad" ]; then
  not_ok "writer left a file behind after rejecting the sha"
else
  ok "writer rejects a non-SHA marker and writes nothing"
fi

short="0123456789abcdef"
if node "$script" --sha "$short" --out "$bad" >/dev/null 2>&1; then
  not_ok "writer accepted a short sha"
else
  ok "writer rejects a short sha"
fi

present() {
  local code=0
  grep -F -- "$2" "$workflow" >/dev/null 2>&1 || code=$?
  if [ "$code" -eq 0 ]; then ok "$1"; else not_ok "$1: [$2] missing from $workflow"; fi
}

present "deploy stamps dist/version.json from the release SHA" "write-version-json.mjs"
present "deploy writes into the uploaded artifact" "dist/version.json"
present "deploy reads the served marker back" "version.json?deploycheck="
present "served marker mismatch fails the deploy" "no sirve el version.json"

printf 'version_json: PASS=%d FAIL=%d\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
