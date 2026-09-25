#!/usr/bin/env bash
# Contract test: the Hostinger deploy workflow never drops below strict TLS.
# Guards the exact regression that kept this repo undeployed: a transport that
# encrypts without authenticating would hand the production FTP password to
# anyone on the path. Fails closed on either side: a strictness marker that
# disappears fails, and a lax marker that appears fails.
#
# Run from the repo root: bash scripts/tests/deploy_strict_contract_test.sh
# Exit 0 only when every test passes. Prints PASS/FAIL counts.
set -euo pipefail

cd "$(dirname "$0")/../.."
workflow=".github/workflows/deploy-hostinger.yml"

pass=0
fail=0

present() {
  local out code
  # -- before the pattern: markers like --ssl-reqd start with a dash and
  # grep would parse them as options. A grep error (exit 2) fails the test
  # instead of passing it: an error is not an absence.
  code=0
  out="$(grep -F -- "$2" "$workflow" 2>&1)" || code=$?
  if [ "$code" -eq 0 ]; then
    pass=$((pass + 1))
    printf 'ok - %s\n' "$1"
  elif [ "$code" -eq 1 ]; then
    fail=$((fail + 1))
    printf 'NOT OK - %s: [%s] missing from %s\n' "$1" "$2" "$workflow"
  else
    fail=$((fail + 1))
    printf 'NOT OK - %s: grep failed: %s\n' "$1" "$out"
  fi
}

absent() {
  local out code
  code=0
  out="$(grep -F -- "$2" "$workflow" 2>&1)" || code=$?
  if [ "$code" -eq 0 ]; then
    fail=$((fail + 1))
    printf 'NOT OK - %s: [%s] found in %s\n' "$1" "$2" "$workflow"
  elif [ "$code" -eq 1 ]; then
    pass=$((pass + 1))
    printf 'ok - %s\n' "$1"
  else
    fail=$((fail + 1))
    printf 'NOT OK - %s: grep failed: %s\n' "$1" "$out"
  fi
}

present "openssl preflight checks the hostname" "-verify_hostname"
present "openssl preflight fails on verify error" "-verify_return_error"
present "upload forces explicit FTPS" "--ssl-reqd"
present "upload pins TCP without touching TLS identity" "--connect-to"
present "upload keeps the shared identity bytes" "scripts/ftps_identity.sh"
absent "no curl insecure flag" "--insecure"
absent "no FTP-Deploy-Action without connect-to support" "FTP-Deploy-Action"
absent "no loose security mode" "security: loose"

printf 'deploy_strict_contract: PASS=%d FAIL=%d\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
