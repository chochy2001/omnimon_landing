#!/usr/bin/env bash
# Tests for scripts/robots_check.sh. No framework: plain bash so the same
# file runs on macOS bash 3.2 and on the ubuntu CI runner.
#
# The Cloudflare fixture is measured reality, not a mock: the exact bytes
# https://omnimon.com.mx/robots.txt served on 2026-10-30 (2744 bytes, sha256
# 3b76bd29...), which is Cloudflare's managed block followed by the 68 byte
# origin file. Deploy runs 40987479394, 40993534823 and 41003280664 failed the
# byte-for-byte gate on it; this suite pins the fix and what it still rejects.
#
# The dist file is written by the test (not read from public/) so the suite is
# hermetic: editing public/robots.txt does not need a new Cloudflare fixture.
#
# Run from the repo root: bash scripts/tests/robots_check_test.sh
# Exit 0 only when every test passes. Prints PASS/FAIL counts.
set -euo pipefail

cd "$(dirname "$0")/../.."
. scripts/robots_check.sh

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

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

# expect_ok <name> <dist> <served> <content-type>
expect_ok() {
  if robots_matches "$2" "$3" "$4" 2>"$work/err.txt"; then
    ok "$1"
  else
    not_ok "$1" "expected a match, got: $(cat "$work/err.txt")"
  fi
}

# expect_reject <name> <dist> <served> <content-type> <stderr-fragment>
expect_reject() {
  if robots_matches "$2" "$3" "$4" 2>"$work/err.txt"; then
    not_ok "$1" "expected a rejection, but it matched"
    return 0
  fi
  case "$(cat "$work/err.txt")" in
    *"$5"*) ok "$1" ;;
    *) not_ok "$1" "rejected for the wrong reason, stderr: $(cat "$work/err.txt")" ;;
  esac
}

cf="scripts/tests/testdata/served-robots-cloudflare.txt"
dist="$work/dist-robots.txt"
printf 'User-agent: *\nAllow: /\n\nSitemap: https://omnimon.com.mx/sitemap.xml\n' >"$dist"
ct="text/plain; charset=utf-8"

# Guard the fixture itself: if it equalled dist the Cloudflare cases below
# would be vacuous, and if it lost the origin block they would test nothing.
dist_size="$(wc -c <"$dist" | tr -d ' ')"
cf_size="$(wc -c <"$cf" | tr -d ' ')"
if [ "$dist_size" -eq 68 ] && [ "$cf_size" -eq 2744 ] && ! cmp -s "$dist" "$cf"; then
  ok "fixtures are the measured sizes and differ (68 vs 2744 bytes)"
else
  not_ok "fixtures are the measured sizes and differ" "dist=${dist_size} cloudflare=${cf_size}"
fi
if tail -c "$dist_size" "$cf" | cmp -s - "$dist"; then
  ok "Cloudflare fixture ends with the origin file verbatim"
else
  not_ok "Cloudflare fixture ends with the origin file verbatim" "the origin block is not the tail"
fi

# --- accepted -------------------------------------------------------------

# 1. The run-failing case: Cloudflare managed block plus the origin file.
expect_ok "Cloudflare managed robots.txt is accepted" "$dist" "$cf" "$ct"

# 2. Cloudflare setting switched off: served equals dist. Must still pass so
# disabling the feature does not need a workflow change.
expect_ok "byte-identical robots.txt is accepted" "$dist" "$dist" "$ct"

# 3. Order does not matter: origin block first, Cloudflare block after.
{ cat "$dist"; printf '\n'; cat "$cf"; } >"$work/origin-first.txt"
expect_ok "origin block before the Cloudflare block is accepted" "$dist" "$work/origin-first.txt" "$ct"

# 4. CRLF line endings on either side are normalised.
sed 's/$/\r/' "$cf" >"$work/cf-crlf.txt"
expect_ok "CRLF served body is accepted" "$dist" "$work/cf-crlf.txt" "$ct"

# 5. Media type is case-insensitive and ignores parameters.
expect_ok "uppercase text/plain without charset is accepted" "$dist" "$cf" "TEXT/PLAIN"

# --- rejected: what the check still protects -------------------------------

# 6. Cloudflare block only: the origin copy is missing or the origin answered
# 404 and Cloudflare served just its own block. The Sitemap line is gone.
head -c $((cf_size - dist_size)) "$cf" >"$work/cf-only.txt"
expect_reject "Cloudflare block without the origin directives is rejected" \
  "$dist" "$work/cf-only.txt" "$ct" "Sitemap: https://omnimon.com.mx/sitemap.xml"

# 7. A stale origin copy with another sitemap URL.
sed 's#omnimon.com.mx/sitemap.xml#old.example/sitemap.xml#' "$cf" >"$work/cf-stale.txt"
expect_reject "stale Sitemap URL is rejected" \
  "$dist" "$work/cf-stale.txt" "$ct" "Sitemap: https://omnimon.com.mx/sitemap.xml"

# 8. The directive only inside a comment does not count.
sed 's#^Sitemap:#\# Sitemap:#' "$cf" >"$work/cf-commented.txt"
expect_reject "commented-out Sitemap is rejected" \
  "$dist" "$work/cf-commented.txt" "$ct" "Sitemap: https://omnimon.com.mx/sitemap.xml"

# 9. A longer line that merely contains the directive does not count.
sed 's#sitemap.xml$#sitemap.xml.bak#' "$cf" >"$work/cf-prefix.txt"
expect_reject "Sitemap line that only contains the directive is rejected" \
  "$dist" "$work/cf-prefix.txt" "$ct" "Sitemap: https://omnimon.com.mx/sitemap.xml"

# 10. Wrong content type, same body.
expect_reject "text/html content type is rejected" "$dist" "$cf" "text/html; charset=utf-8" "expected text/plain"
expect_reject "empty content type is rejected" "$dist" "$cf" "" "expected text/plain"
expect_reject "text/plain lookalike is rejected" "$dist" "$cf" "application/x-text/plain" "expected text/plain"

# 11. An HTML page with a robots-looking content type has no User-agent line.
printf '<!DOCTYPE html><html><body>Checking your browser</body></html>\n' >"$work/interstitial.html"
expect_reject "HTML body served as text/plain is rejected" \
  "$dist" "$work/interstitial.html" "$ct" "no User-agent"

# 12. Empty and missing inputs.
: >"$work/empty.txt"
expect_reject "empty served body is rejected" "$dist" "$work/empty.txt" "$ct" "empty"
expect_reject "missing served body is rejected" "$dist" "$work/no-such-file.txt" "$ct" "served body missing"
expect_reject "missing dist file is rejected" "$work/no-such-dist.txt" "$cf" "$ct" "dist robots.txt missing"

# 13. A dist file with nothing to assert must not pass vacuously.
printf '# only a comment\n\n   \n' >"$work/dist-comments.txt"
expect_reject "dist without directives is rejected" "$work/dist-comments.txt" "$cf" "$ct" "no directives"

printf 'robots_check: PASS=%d FAIL=%d\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
