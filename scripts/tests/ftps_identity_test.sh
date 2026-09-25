#!/usr/bin/env bash
# Tests for scripts/ftps_identity.sh. No framework: plain bash so the same
# file runs on macOS bash 3.2 and on the ubuntu CI runner.
#
# Run from the repo root: bash scripts/tests/ftps_identity_test.sh
# Exit 0 only when every test passes. Prints PASS/FAIL counts.
set -euo pipefail

cd "$(dirname "$0")/../.."
. scripts/ftps_identity.sh

pass=0
fail=0

ok() {
  pass=$((pass + 1))
  printf 'ok - %s\n' "$1"
}

not_ok() {
  fail=$((fail + 1))
  printf 'NOT OK - %s\n' "$1"
  printf '%s\n' "$2" | sed 's/^/  /'
}

# assert_resolve <name> <tls> <addr> <port> <expected-stdout>
assert_resolve() {
  local name="$1" got
  if ! got="$(ftps_resolve "$2" "$3" "$4" 2>/tmp/omni_ftps_err.txt)"; then
    not_ok "$name" "expected success, got exit 1: $(cat /tmp/omni_ftps_err.txt)"
    return 0
  fi
  if [ "$got" = "$5" ]; then
    ok "$name"
  else
    not_ok "$name" "stdout differs. got: [$got] want: [$5]"
  fi
}

# assert_rejects <name> <tls> <addr> <port> <expected-stderr-fragment>
assert_rejects() {
  local name="$1" err
  if ftps_resolve "$2" "$3" "$4" >/tmp/omni_ftps_out.txt 2>/tmp/omni_ftps_err.txt; then
    not_ok "$name" "expected rejection, got success: $(cat /tmp/omni_ftps_out.txt)"
    return 0
  fi
  err="$(cat /tmp/omni_ftps_err.txt)"
  case "$err" in
    *"$5"*) ok "$name" ;;
    *) not_ok "$name" "stderr [$err] does not name [$5]" ;;
  esac
}

assert_resolve "ip address builds connect_to" \
  "omnimon-upload.hstgr.io" "31.170.161.105" "21" \
  "host=omnimon-upload.hstgr.io
addr=31.170.161.105
connect_to=omnimon-upload.hstgr.io:21:31.170.161.105:21"

assert_resolve "hostname address builds connect_to" \
  "omnimon-upload.hstgr.io" "ftp.example.net" "21" \
  "host=omnimon-upload.hstgr.io
addr=ftp.example.net
connect_to=omnimon-upload.hstgr.io:21:ftp.example.net:21"

assert_resolve "hstgr.io apex is accepted as TLS name" \
  "hstgr.io" "31.170.161.105" "21" \
  "host=hstgr.io
addr=31.170.161.105
connect_to=hstgr.io:21:31.170.161.105:21"

assert_resolve "surrounding whitespace is trimmed" \
  "  omnimon-upload.hstgr.io
" " 31.170.161.105 " " 21 " \
  "host=omnimon-upload.hstgr.io
addr=31.170.161.105
connect_to=omnimon-upload.hstgr.io:21:31.170.161.105:21"

assert_rejects "empty TLS name fails" \
  "" "31.170.161.105" "21" "HOSTINGER_FTPS_HOST is empty"

assert_rejects "empty TCP address fails" \
  "omnimon-upload.hstgr.io" "" "21" "FTP_HOST is empty"

assert_rejects "TLS name as IP fails" \
  "31.170.161.105" "31.170.161.105" "21" "not an IP"

assert_rejects "TLS name outside hstgr.io fails" \
  "ftp.omnimon.com.mx" "31.170.161.105" "21" "must be hstgr.io"

assert_rejects "TLS name with hstgr.io suffix trick fails" \
  "x.hstgr.io.evil.com" "31.170.161.105" "21" "must be hstgr.io"

assert_rejects "non-numeric port fails" \
  "omnimon-upload.hstgr.io" "31.170.161.105" "abc" "not a port number"

assert_rejects "empty port fails" \
  "omnimon-upload.hstgr.io" "31.170.161.105" "" "not a port number"

printf 'ftps_identity: PASS=%d FAIL=%d\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
