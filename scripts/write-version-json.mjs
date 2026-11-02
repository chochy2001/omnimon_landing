#!/usr/bin/env node
/**
 * Write the deploy parity marker version.json.
 *
 * The file proves which commit the public origin serves:
 * {"sha": "<full 40-char commit>", "built_at": "<UTC ISO-8601>"}.
 *
 * Generated at deploy time from the release SHA (PUBLIC_BUILD_SHA in the
 * deploy workflow), never committed by hand: it lands in dist/, which is
 * gitignored. Until this marker existed, https://omnimon.com.mx/version.json
 * answered the 404 page, so fleet parity probes that read /version.json
 * classified this surface as NO_MEDIBLE even though the same SHA is also
 * stamped as <meta name="omnimon-build"> (AUDIT-GO-3).
 *
 * Exit 1 without writing anything when --sha is not a full 40-char
 * lowercase hex commit SHA. A loose marker ("dev", a short SHA) would read
 * as measurement while proving nothing.
 */
import { writeFileSync } from 'node:fs';

const SHA_RE = /^[0-9a-f]{40}$/;

export function versionPayload(sha, now = new Date()) {
  const normalized = String(sha ?? '').trim().toLowerCase();
  if (!SHA_RE.test(normalized)) {
    throw new Error(`--sha must be a 40-char hex commit SHA, got ${JSON.stringify(sha)}`);
  }
  return { sha: normalized, built_at: now.toISOString().replace(/\.\d{3}Z$/, 'Z') };
}

function parseArgs(argv) {
  let sha = '';
  let out = '';
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--sha') sha = argv[i + 1] ?? '';
    if (argv[i] === '--out') out = argv[i + 1] ?? '';
  }
  return { sha, out };
}

export function main(argv) {
  const { sha, out } = parseArgs(argv);
  if (!out) {
    console.error('::error::--out is required.');
    return 1;
  }
  let payload;
  try {
    payload = versionPayload(sha);
  } catch (err) {
    console.error(`::error::${err.message}`);
    return 1;
  }
  writeFileSync(out, `${JSON.stringify(payload)}\n`, 'utf8');
  console.log(`wrote ${out}: sha=${payload.sha}`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main(process.argv.slice(2)));
}
