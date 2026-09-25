#!/usr/bin/env bash
# Strict FTPS identity for the Hostinger pool behind 31.170.161.105.
#
# Why this file exists. The FTPS certificate of this pool only covers
# *.hstgr.io, and no public DNS name under hstgr.io resolves to the pool IP
# (measured 2026-09-25: *-upload.hstgr.io is NXDOMAIN both locally and via
# Cloudflare DoH, the IP has no PTR, the server ignores SNI, and
# ftp.omnimon.com.mx points at Cloudflare, not at the FTP server). So the TLS
# identity (a name the certificate covers) and the TCP address (the pool IP)
# are two different values. Verification stays strict: openssl and curl both
# check the chain against the system roots plus the hostname against the SNI
# name. The SNI name does not need to resolve. Same shape as
# captienda_landing deploy-hostinger-public.yml, which holds green deploys
# against this same pool.
#
# Shared bytes on purpose: .github/workflows/deploy-hostinger.yml sources this
# file, and scripts/tests/ftps_identity_test.sh exercises the same function.
# An inline run: block in YAML can only be read, and reading is not testing.
#
# Usage (sourced, never executed for effect):
#   . scripts/ftps_identity.sh
#   ftps_resolve "$HOSTINGER_FTPS_HOST" "$FTP_HOST" "$FTP_PORT"
# On success prints three lines on stdout:
#   host=<tls-name>
#   addr=<tcp-address>
#   connect_to=<tls-name:port:tcp-address:port>
# On failure prints the reason on stderr and returns 1. Never prints secrets:
# the inputs are a DNS name, an IP and a port, none of them a credential.
#
# Portable to bash 3.2 (macOS) and bash 5 (ubuntu CI runners).

ftps_resolve() {
  local tls_host tcp_addr port
  tls_host="$(printf '%s' "${1:-}" | tr -d '[:space:]')"
  tcp_addr="$(printf '%s' "${2:-}" | tr -d '[:space:]')"
  port="$(printf '%s' "${3:-}" | tr -d '[:space:]')"

  if [ -z "$tls_host" ]; then
    printf 'ftps_identity: HOSTINGER_FTPS_HOST is empty\n' >&2
    return 1
  fi
  if [ -z "$tcp_addr" ]; then
    printf 'ftps_identity: FTP_HOST is empty\n' >&2
    return 1
  fi
  case "$port" in
    ''|*[!0-9]*)
      printf 'ftps_identity: FTP_PORT is not a port number\n' >&2
      return 1
      ;;
  esac

  # The TLS identity is verified by name, so an IP can never validate.
  # Herestring, not a pipe: grep -q exits on the first match and would
  # SIGPIPE the writer under pipefail.
  if grep -Eq '^[0-9]+(\.[0-9]+){3}$' <<<"$tls_host"; then
    printf 'ftps_identity: HOSTINGER_FTPS_HOST must be the TLS name the certificate covers, not an IP\n' >&2
    return 1
  fi
  case "$tls_host" in
    hstgr.io|*.hstgr.io) : ;;
    *)
      printf 'ftps_identity: HOSTINGER_FTPS_HOST must be hstgr.io or a name under it\n' >&2
      return 1
      ;;
  esac

  printf 'host=%s\naddr=%s\nconnect_to=%s:%s:%s:%s\n' \
    "$tls_host" "$tcp_addr" "$tls_host" "$port" "$tcp_addr" "$port"
}
