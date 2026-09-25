#!/usr/bin/env bash
# Tests for scripts/png_compare.sh. No framework: plain bash so the same
# file runs on macOS bash 3.2 and on the ubuntu CI runner.
#
# The served fixture is measured reality, not a mock: the exact bytes
# https://omnimon.com.mx/apple-touch-icon.png served on 2026-09-25
# (sha256 8548f685...), re-encoded by the platform from the 0ba2aea2 dist
# file. Deploy run 36161664902 failed on it; this suite pins the fix.
#
# Run from the repo root: bash scripts/tests/png_compare_test.sh
# Exit 0 only when every test passes. Prints PASS/FAIL counts.
set -euo pipefail

cd "$(dirname "$0")/../.."
. scripts/png_compare.sh

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

served_fixture="scripts/tests/testdata/served-apple-touch-icon.png"
dist_png="public/apple-touch-icon.png"
served_shot="scripts/tests/testdata/served-omnimon-screenshot.png"
dist_shot="public/omnimon-screenshot.png"

# 1. The platform re-encode matches dist despite different bytes.
dist_sum="$(sha256sum "$dist_png" | cut -d ' ' -f 1)"
served_sum="$(sha256sum "$served_fixture" | cut -d ' ' -f 1)"
if [ "$dist_sum" = "$served_sum" ]; then
  not_ok "fixture differs from dist" "files are byte-identical; the test would be vacuous"
else
  if png_matches "$dist_png" "$served_fixture" 2>/tmp/omni_png_err.txt; then
    ok "re-encoded served bytes match dist structurally"
  else
    not_ok "re-encoded served bytes match dist structurally" "$(cat /tmp/omni_png_err.txt)"
  fi
fi

# 2. Identical files match.
if png_matches "$dist_png" "$dist_png" 2>/tmp/omni_png_err.txt; then
  ok "identical files match"
else
  not_ok "identical files match" "$(cat /tmp/omni_png_err.txt)"
fi

# 3. The platform downscale matches dist: same picture, fewer pixels.
shot_dist_sum="$(sha256sum "$dist_shot" | cut -d ' ' -f 1)"
shot_served_sum="$(sha256sum "$served_shot" | cut -d ' ' -f 1)"
if [ "$shot_dist_sum" = "$shot_served_sum" ]; then
  not_ok "downscaled served bytes match dist" "files are byte-identical; the test would be vacuous"
else
  if png_matches "$dist_shot" "$served_shot" 2>/tmp/omni_png_err.txt; then
    ok "downscaled served bytes match dist"
  else
    not_ok "downscaled served bytes match dist" "$(cat /tmp/omni_png_err.txt)"
  fi
fi

# 4. A truncated body is rejected.
head -c 20000 "$served_fixture" > /tmp/omni_png_trunc.png
if png_matches "$dist_png" /tmp/omni_png_trunc.png 2>/tmp/omni_png_err.txt; then
  not_ok "truncated body is rejected" "matched a 20000-byte prefix"
else
  case "$(cat /tmp/omni_png_err.txt)" in
    *IEND*) ok "truncated body is rejected" ;;
    *) not_ok "truncated body is rejected" "$(cat /tmp/omni_png_err.txt)" ;;
  esac
fi

# 5. An HTML error page served as PNG is rejected.
printf '<!DOCTYPE html><html><body>Not found</body></html>\n' > /tmp/omni_png_html.png
if png_matches "$dist_png" /tmp/omni_png_html.png 2>/tmp/omni_png_err.txt; then
  not_ok "HTML body is rejected" "matched an HTML page"
else
  case "$(cat /tmp/omni_png_err.txt)" in
    *signature*) ok "HTML body is rejected" ;;
    *) not_ok "HTML body is rejected" "$(cat /tmp/omni_png_err.txt)" ;;
  esac
fi

# 6. A PNG with a different aspect ratio is rejected: the 1.7:1
# screenshot served at the 1:1 icon URL is a wrong image, not a resize.
if png_matches "$dist_png" "$dist_shot" 2>/tmp/omni_png_err.txt; then
  not_ok "different-aspect PNG is rejected" "1.7:1 matched 1:1"
else
  case "$(cat /tmp/omni_png_err.txt)" in
    *aspect*) ok "different-aspect PNG is rejected" ;;
    *) not_ok "different-aspect PNG is rejected" "$(cat /tmp/omni_png_err.txt)" ;;
  esac
fi

# 7. Empty and missing bodies are rejected.
: > /tmp/omni_png_empty.png
if png_matches "$dist_png" /tmp/omni_png_empty.png 2>/dev/null; then
  not_ok "empty body is rejected" "matched an empty file"
else
  ok "empty body is rejected"
fi
if png_matches "$dist_png" /tmp/omni_png_no_such_file.png 2>/dev/null; then
  not_ok "missing body is rejected" "matched a missing file"
else
  ok "missing body is rejected"
fi

printf 'png_compare: PASS=%d FAIL=%d\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
