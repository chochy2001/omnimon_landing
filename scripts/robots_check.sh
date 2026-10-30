#!/usr/bin/env bash
# robots.txt assertions for the Hostinger asset gate.
#
# Why this file exists. omnimon.com.mx sits behind Cloudflare with the managed
# robots.txt feature (AI crawl control) enabled. Cloudflare does not serve the
# origin file as is: it prepends its own block (content signals plus a long list
# of Disallow rules for AI training crawlers) and appends the origin file
# verbatim. Measured 2026-10-30 with GET requests only: dist robots.txt is 68
# bytes (sha256 739f7b56...), the public URL answers 200 text/plain with 2744
# bytes (sha256 3b76bd29...), and the last 68 bytes of that body are exactly
# the dist file. Deploy runs 40987479394, 40993534823 and 41003280664 all
# failed the byte-for-byte gate on this one path while the other 22 assets
# were sha256 identical.
#
# Byte equality cannot hold for this path, and not only today: Cloudflare edits
# its managed block over time (new crawlers get added), so any pinned hash or
# pinned size would break again. A bare "skip it" would drop the only proof
# that the deployed robots.txt is ours, so this file keeps a weaker assertion
# that still fails when the origin is wrong:
#
#   1. content type is text/plain (an HTML error page or a CDN interstitial
#      served with a 200 fails here);
#   2. the body contains at least one User-agent line (a body that is not a
#      robots file fails here);
#   3. every directive line of the dist robots.txt (non blank, not a comment)
#      is present in the served body as a whole line, in any position. This is
#      what preserves the Sitemap line: Cloudflare keeps it, and a stale or
#      missing origin copy (an old sitemap URL, an origin that returns 404 so
#      Cloudflare serves only its own block) fails here;
#   4. the dist file must carry at least one directive, so the check cannot
#      pass vacuously.
#
# Honest residual: lines such as "User-agent: *" and "Allow: /" also occur in
# the Cloudflare block, so for those lines assertion 3 is satisfied by
# Cloudflare itself. The lines that only our file can supply (Sitemap, and any
# future origin-specific rule) are the ones this check actually protects. Do
# not extend it with a pinned Cloudflare hash, size or crawler list.
#
# Only /robots.txt may use this check. Every other asset keeps the sha256
# comparison (PNG: scripts/png_compare.sh) in the workflow. If the Cloudflare
# setting is turned off, the served body equals dist and every assertion here
# still passes, so no workflow change is needed on that day.
#
# Shared bytes on purpose: .github/workflows/deploy-hostinger.yml sources this
# file, and scripts/tests/robots_check_test.sh exercises the same function.
#
# Usage (sourced):
#   . scripts/robots_check.sh
#   robots_matches "$dist_robots" "$served_body" "$content_type"
# Exit 0 when every assertion holds, 1 otherwise. Prints the reason on stderr.
# Never prints the served body. Portable to bash 3.2 (macOS) and bash 5 (ubuntu
# CI runners): no mapfile, no associative arrays, no ${var,,}.

# robots_normalise prints a file with CR removed and leading and trailing
# whitespace stripped from every line. Cloudflare serves LF and git may check
# the file out with CRLF on Windows; neither should matter to the comparison.
robots_normalise() {
  tr -d '\r' <"$1" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//'
}

robots_matches() {
  local dist="$1" served="$2" ctype="${3:-}"
  local media dist_norm served_norm line directives=0 missing=0

  if [ ! -f "$dist" ]; then
    printf 'robots_check: dist robots.txt missing\n' >&2
    return 1
  fi
  if [ ! -f "$served" ]; then
    printf 'robots_check: served body missing\n' >&2
    return 1
  fi
  if [ ! -s "$served" ]; then
    printf 'robots_check: served body is empty\n' >&2
    return 1
  fi

  # 1. Media type, case-insensitive, parameters (charset) ignored.
  media="$(printf '%s' "$ctype" | tr 'A-Z' 'a-z')"
  media="${media%%;*}"
  media="$(printf '%s' "$media" | tr -d ' \t')"
  if [ "$media" != "text/plain" ]; then
    printf 'robots_check: content type is "%s", expected text/plain\n' "$ctype" >&2
    return 1
  fi

  dist_norm="$(robots_normalise "$dist")"
  served_norm="$(robots_normalise "$served")"

  # 2. It is a robots file at all. Here-strings and not pipes: grep -q exits
  # on the first match, the writer dies of SIGPIPE and pipefail would turn a
  # match into a failure.
  if ! grep -Eiq '^user-agent[[:space:]]*:' <<<"$served_norm"; then
    printf 'robots_check: served body has no User-agent line\n' >&2
    return 1
  fi

  # 3. Every directive of the dist file is in the served body, whole line.
  while IFS= read -r line; do
    case "$line" in
      '' | '#'*) continue ;;
    esac
    directives=$((directives + 1))
    if ! grep -Fxq -- "$line" <<<"$served_norm"; then
      printf 'robots_check: served robots.txt lacks the dist directive "%s"\n' "$line" >&2
      missing=$((missing + 1))
    fi
  done <<<"$dist_norm"

  # 4. No vacuous pass.
  if [ "$directives" -lt 1 ]; then
    printf 'robots_check: dist robots.txt has no directives, nothing to assert\n' >&2
    return 1
  fi
  if [ "$missing" -gt 0 ]; then
    return 1
  fi
  return 0
}
