// A newer *successful* release supersedes an older live parity job. Failed
// releases and independent PR validation cannot cancel the live check.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const yaml=readFileSync(new URL("../.github/workflows/installed-pages-live-phone.yml",import.meta.url),"utf8");
assert.match(yaml,/workflow_run:\s*\n\s*workflows: \["Ad Orientem — GitHub Pages release"\]/);
assert.doesNotMatch(yaml,/^concurrency:/m,"Workflow-wide concurrency would cancel live checks on failed releases");
const live=yaml.slice(yaml.indexOf("  verify-live-installed-path:"));
assert.ok(live.length>150);
assert.match(live,/^    concurrency:\s*\n      group: installed-pages-parity-main\s*\n      cancel-in-progress: true/m);
assert.match(live,/github\.event\.workflow_run\.conclusion == 'success'/);
assert.match(live,/AO_PAGES_RELEASE_SHA: \$\{\{ github\.event\.workflow_run\.head_sha \|\| github\.sha \}\}/);
assert.match(yaml,/node tests\/installed-pages-parity-concurrency\.mjs/);
console.log("PASS live Pages parity: successful new release supersedes only older live job; PR and failed-release workflows stay isolated");
