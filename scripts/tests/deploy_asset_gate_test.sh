#!/usr/bin/env bash
# End-to-end test of the "Assert live assets match the built artifact byte for
# byte" step of .github/workflows/deploy-hostinger.yml.
#
# The step is extracted from the workflow (not copied), so this runs the exact
# bytes CI runs, against a local Bun server that plays the public origin. It
# proves the two halves of the robots.txt fix together:
#   - Cloudflare's managed robots.txt (measured 2026-10-30, 2744 bytes against
#     68 in dist) no longer fails the gate;
#   - every other asset keeps the byte-for-byte comparison, including a file
#     that is merely NAMED robots.txt in another directory.
# Deploy runs 40987479394, 40993534823 and 41003280664 failed on the first
# point while the other 22 assets matched.
#
# Set DEPLOY_WORKFLOW to point at another copy of the workflow, for example
# `git show origin/main:.github/workflows/deploy-hostinger.yml` saved to a
# file, to see the "accepts Cloudflare" scenarios fail without the fix.
#
# No network beyond 127.0.0.1. No framework: plain bash (3.2 and 5) plus Bun,
# which CI already installs. Run from the repo root:
#   bash scripts/tests/deploy_asset_gate_test.sh
# Exit 0 only when every scenario behaves as expected.
set -euo pipefail

cd "$(dirname "$0")/../.."
repo="$(pwd)"
workflow="${DEPLOY_WORKFLOW:-.github/workflows/deploy-hostinger.yml}"
cf="${repo}/scripts/tests/testdata/served-robots-cloudflare.txt"

work="$(mktemp -d)"
server_pid=""
cleanup() {
  if [ -n "$server_pid" ]; then
    kill "$server_pid" 2>/dev/null || true
  fi
  rm -rf "$work"
}
trap cleanup EXIT

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

if ! command -v bun >/dev/null 2>&1; then
  printf 'NOT OK - bun is required to run the local origin\n'
  exit 1
fi

# --- 1. Extract the gate step from the workflow ------------------------------
gate="${work}/gate.sh"
awk '
  /^      - name: Assert live assets match the built artifact byte for byte$/ { in_step = 1; next }
  in_step && /^        run: \|$/ { in_run = 1; next }
  in_run && /^      - name:/ { exit }
  in_run { sub(/^          /, ""); print }
' "$workflow" >"$gate"
if [ "$(wc -l <"$gate" | tr -d ' ')" -lt 50 ] || ! grep -q 'png_compare.sh' "$gate"; then
  printf 'NOT OK - could not extract the asset gate step from %s\n' "$workflow"
  exit 1
fi
ok "asset gate step extracted from $workflow ($(wc -l <"$gate" | tr -d ' ') lines)"

# --- 2. Build the fixture: a tiny dist and a matching live site ---------------
run="${work}/run"
mkdir -p "$run/scripts" "$run/dist/_astro" "$run/dist/fonts"
cp scripts/png_compare.sh "$run/scripts/"
if [ -f scripts/robots_check.sh ]; then
  cp scripts/robots_check.sh "$run/scripts/"
fi

printf 'body{margin:0;background:#0b1020}\n' >"$run/dist/_astro/app.AAAA.css"
printf 'export const answer = 42;\n' >"$run/dist/_astro/app.BBBB.js"
printf '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>\n' >"$run/dist/favicon.svg"
printf '<urlset><url><loc>https://omnimon.com.mx/</loc></url></urlset>\n' >"$run/dist/sitemap.xml"
printf 'User-agent: *\nAllow: /\n\nSitemap: https://omnimon.com.mx/sitemap.xml\n' >"$run/dist/robots.txt"
# A different file that only shares the name: must stay byte-compared.
printf 'font notes, not a robots file\n' >"$run/dist/fonts/robots.txt"
printf 'Options -Indexes\n' >"$run/dist/.htaccess"
printf '<!doctype html><title>x</title>\n' >"$run/dist/index.html"

tmp="${work}/tmp"
mkdir -p "$tmp/live"
(
  cd "$run"
  find dist -type f ! -name '*.html' | sort | while IFS= read -r f; do
    printf '/%s\n' "${f#dist/}"
  done
) >"$tmp/deploy-assets.txt"
printf '<!doctype html><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/_astro/app.AAAA.css"><script src="/_astro/app.BBBB.js"></script>\n' \
  >"$tmp/live/page_.html"

# make_live <dir>: a live site identical to dist, minus the hidden file
# (Apache does not serve it) and with Cloudflare's robots.txt in front.
make_live() {
  rm -rf "$1"
  mkdir -p "$1"
  cp -R "$run/dist/." "$1/"
  rm -f "$1/.htaccess" "$1/index.html"
  cp "$cf" "$1/robots.txt"
}

# --- 3. A local origin ---------------------------------------------------------
cat >"${work}/origin.ts" <<'EOF'
// Serves argv[2] on a free 127.0.0.1 port. argv[3], when set, overrides the
// content type of /robots.txt. Prints the port on the first line.
const [root, robotsType] = process.argv.slice(2);
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  async fetch(req) {
    const pathname = decodeURIComponent(new URL(req.url).pathname);
    if (pathname.includes("..")) return new Response("bad request", { status: 400 });
    const file = Bun.file(root + (pathname.endsWith("/") ? pathname + "index.html" : pathname));
    if (!(await file.exists())) {
      return new Response("<!doctype html><title>404</title>", {
        status: 404,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
    const headers: Record<string, string> = {};
    if (pathname === "/robots.txt" && robotsType) headers["content-type"] = robotsType;
    return new Response(file, { headers });
  },
});
console.log(server.port);
EOF

start_origin() {
  local live="$1" robots_type="${2:-}" i
  if [ -n "$server_pid" ]; then
    kill "$server_pid" 2>/dev/null || true
    server_pid=""
  fi
  : >"${work}/port.txt"
  bun "${work}/origin.ts" "$live" "$robots_type" >"${work}/port.txt" 2>"${work}/origin.err" &
  server_pid=$!
  # disown: bash 3.2 would otherwise print "Terminated: 15" when it is killed.
  disown "$server_pid" 2>/dev/null || true
  for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
    if [ -s "${work}/port.txt" ]; then
      port="$(head -n 1 "${work}/port.txt")"
      return 0
    fi
    sleep 0.25
  done
  printf 'NOT OK - local origin did not start: %s\n' "$(cat "${work}/origin.err")"
  exit 1
}

# run_gate: runs the extracted step against the origin on $port. Output in
# $work/out.txt, exit status in $gate_rc.
run_gate() {
  gate_rc=0
  (
    cd "$run"
    SITE_URL="http://127.0.0.1:${port}" RUNNER_TEMP="$tmp" \
      GITHUB_RUN_ID=1 GITHUB_RUN_ATTEMPT=1 bash "$gate"
  ) >"${work}/out.txt" 2>&1 || gate_rc=$?
}

# expect_pass <name> [fragment-in-output]
expect_pass() {
  if [ "$gate_rc" -ne 0 ]; then
    not_ok "$1" "expected exit 0, got ${gate_rc}: $(tail -n 6 "${work}/out.txt")"
  elif [ -n "${2:-}" ] && ! grep -qF -- "$2" "${work}/out.txt"; then
    not_ok "$1" "passed but the output lacks [$2]: $(tail -n 4 "${work}/out.txt")"
  else
    ok "$1"
  fi
}

# expect_fail <name> <fragment-in-output>
expect_fail() {
  if [ "$gate_rc" -eq 0 ]; then
    not_ok "$1" "expected a failure, the gate passed: $(tail -n 4 "${work}/out.txt")"
  elif ! grep -qF -- "$2" "${work}/out.txt"; then
    not_ok "$1" "failed for the wrong reason, lacks [$2]: $(grep -F '::error::' "${work}/out.txt" | head -n 3)"
  else
    ok "$1"
  fi
}

# --- 4. Scenarios --------------------------------------------------------------
live="${work}/live"

# A. The production situation: Cloudflare in front of robots.txt, the rest exact.
make_live "$live"
start_origin "$live" "text/plain; charset=utf-8"
run_gate
expect_pass "Cloudflare managed robots.txt passes the gate" "robots.txt verificado por directivas: 1"

# B. Cloudflare switched off: served robots.txt equals dist.
make_live "$live"
cp "$run/dist/robots.txt" "$live/robots.txt"
start_origin "$live" "text/plain; charset=utf-8"
run_gate
expect_pass "byte-identical robots.txt passes the gate" "robots.txt verificado por directivas: 1"

# C. Non-robots mismatch: one byte of the bundle differs. Cloudflare robots is
# still fine, and the gate must still fail on the bundle.
make_live "$live"
printf 'export const answer = 43;\n' >"$live/_astro/app.BBBB.js"
start_origin "$live" "text/plain; charset=utf-8"
run_gate
expect_fail "a corrupted non-robots asset still fails byte for byte" "El asset /_astro/app.BBBB.js responde 200 pero lo servido no es el fichero construido"

# D. Same size, different bytes (the stale-copy case the sha256 exists for).
make_live "$live"
printf 'body{margin:1;background:#0b1020}\n' >"$live/_astro/app.AAAA.css"
start_origin "$live" "text/plain; charset=utf-8"
run_gate
expect_fail "a same-size stale asset still fails byte for byte" "El asset /_astro/app.AAAA.css responde 200 pero lo servido no es el fichero construido"

# E. sitemap.xml replaced by the Cloudflare robots body: the exemption must not
# leak to other text files.
make_live "$live"
cp "$cf" "$live/sitemap.xml"
start_origin "$live" "text/plain; charset=utf-8"
run_gate
expect_fail "robots body served at /sitemap.xml still fails" "El asset /sitemap.xml responde 200 pero lo servido no es el fichero construido"

# F. A file named robots.txt in another directory is not exempt.
make_live "$live"
printf 'tampered\n' >"$live/fonts/robots.txt"
start_origin "$live" "text/plain; charset=utf-8"
run_gate
expect_fail "only the exact path /robots.txt is exempt" "El asset /fonts/robots.txt responde 200 pero lo servido no es el fichero construido"

# G. Cloudflare block served without our origin directives (stale or missing
# origin copy): the Sitemap line is gone.
make_live "$live"
head -c $((2744 - 68)) "$cf" >"$live/robots.txt"
start_origin "$live" "text/plain; charset=utf-8"
run_gate
expect_fail "robots.txt without the dist Sitemap line fails" "lacks the dist directive"

# H. robots.txt served as HTML.
make_live "$live"
start_origin "$live" "text/html; charset=utf-8"
run_gate
expect_fail "robots.txt served as text/html fails" "expected text/plain"

# I. robots.txt missing on the origin.
make_live "$live"
rm -f "$live/robots.txt"
start_origin "$live" "text/plain; charset=utf-8"
run_gate
expect_fail "missing robots.txt fails" "Se esperaba 200 en el asset /robots.txt"

printf 'deploy_asset_gate: PASS=%d FAIL=%d\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
