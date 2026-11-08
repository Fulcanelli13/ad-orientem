// A later successful GitHub Pages release must supersede any older parity
// run; PR syntax validation must never cancel main's live browser checks.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const yaml=readFileSync(new URL("../.github/workflows/installed-pages-live-phone.yml",import.meta.url),"utf8");
assert.match(yaml,/workflow_run:\s*\n\s*workflows: \["Ad Orientem — GitHub Pages release"\]/);
assert.match(yaml,/^concurrency:\s*\n\s*group: installed-pages-parity-\$\{\{ github\.event_name == 'pull_request' && github\.event\.pull_request\.number \|\| 'main' \}\}\s*\n\s*cancel-in-progress: true/m);
assert.match(yaml,/AO_PAGES_RELEASE_SHA: \$\{\{ github\.event\.workflow_run\.head_sha \|\| github\.sha \}\}/);
assert.match(yaml,/node tests\/installed-pages-parity-concurrency\.mjs/);
console.log("PASS: newest published Pages parity cancels obsolete runs, PR checks remain isolated, original release SHA remains pinned");
