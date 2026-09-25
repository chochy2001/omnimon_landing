#!/usr/bin/env bash
# Structural PNG comparison for the Hostinger asset gate.
#
# Why this file exists. Hostinger re-encodes PNGs between our upload and the
# HTTP response (measured 2026-09-25, deploy run 36161664902, both on
# x-hcdn-cache-status MISS with Accept-Encoding: identity): dist
# apple-touch-icon.png is 31959 bytes sha256 0ba2aea2 and the origin serves
# 28144 bytes sha256 8548f685 with the same 128x128 dimensions; dist
# omnimon-screenshot.png is 3456x2022 and the origin serves the same picture
# downscaled to 1600x936. Byte equality cannot hold on this platform, and
# neither can dimension equality, so PNGs compare by structural identity:
# a valid PNG signature, the same aspect ratio within 1%, and a complete
# IEND trailer. That still detects a truncated STOR (no IEND), an HTML error
# page served as PNG (bad signature), and a wrong image at the URL (wrong
# aspect). It cannot detect a same-aspect image swap; that residual is
# documented in .github/DEPLOYMENT.md. Everything else still compares byte
# for byte.
#
# Shared bytes on purpose: .github/workflows/deploy-hostinger.yml sources this
# file, and scripts/tests/png_compare_test.sh exercises the same function.
#
# Usage (sourced):
#   . scripts/png_compare.sh
#   png_matches "$local_png" "$served_body"
# Exit 0 on structural identity, 1 otherwise. Prints the reason on stderr.
# Never prints file contents. Pure shell plus od/tail/head; portable to
# bash 3.2 (macOS) and bash 5 (ubuntu CI runners).

# png_dims prints "width height" of a PNG on stdout, or fails.
# Reads single bytes and assembles big-endian by hand: od -tu4 would use
# the host endianness and PNG stores network order.
png_dims() {
  local b1 b2 b3 b4 b5 b6 b7 b8 rest w h
  read -r b1 b2 b3 b4 b5 b6 b7 b8 rest \
    <<<"$(od -An -j16 -N8 -tu1 "$1" 2>/dev/null)"
  case "$b1$b2$b3$b4$b5$b6$b7$b8" in
    ''|*[!0-9]*) return 1 ;;
  esac
  w=$((b1 * 16777216 + b2 * 65536 + b3 * 256 + b4))
  h=$((b5 * 16777216 + b6 * 65536 + b7 * 256 + b8))
  if [ "$w" -lt 1 ] || [ "$h" -lt 1 ]; then
    return 1
  fi
  printf '%s %s\n' "$w" "$h"
}

png_matches() {
  local dist="$1" served="$2" sig trailer dw dh sw sh dims_dist dims_served rest
  if [ ! -f "$dist" ]; then
    printf 'png_compare: dist file missing\n' >&2
    return 1
  fi
  if [ ! -f "$served" ]; then
    printf 'png_compare: served body missing\n' >&2
    return 1
  fi
  # PNG signature: 89 50 4E 47 0D 0A 1A 0A. An HTML error page served with
  # a 200 and a .png URL fails here.
  sig="$(head -c 8 "$served" | od -An -tx1 | tr -d ' \n')"
  if [ "$sig" != "89504e470d0a1a0a" ]; then
    printf 'png_compare: served body is not a PNG (bad signature)\n' >&2
    return 1
  fi
  # Same aspect ratio within 1%, via cross-multiplication in integers.
  # A CDN downscale preserves it; a wrong image at the URL does not.
  dims_dist="$(png_dims "$dist")" || {
    printf 'png_compare: dist file has no readable IHDR\n' >&2
    return 1
  }
  dims_served="$(png_dims "$served")" || {
    printf 'png_compare: served body has no readable IHDR\n' >&2
    return 1
  }
  read -r dw dh rest <<<"$dims_dist"
  read -r sw sh rest <<<"$dims_served"
  if [ $((dw * sh > sw * dh ? (dw * sh - sw * dh) * 100 : (sw * dh - dw * sh) * 100)) -gt $((sw * dh)) ]; then
    printf 'png_compare: served PNG has a different aspect ratio (%sx%s vs dist %sx%s)\n' \
      "$sw" "$sh" "$dw" "$dh" >&2
    return 1
  fi
  # Complete trailer: the file must end with the IEND chunk
  # 00 00 00 00 49 45 4E 44 AE 42 60 82. A truncated STOR fails here.
  trailer="$(tail -c 12 "$served" | od -An -tx1 | tr -d ' \n')"
  if [ "$trailer" != "0000000049454e44ae426082" ]; then
    printf 'png_compare: served PNG is truncated (no IEND trailer)\n' >&2
    return 1
  fi
  return 0
}
