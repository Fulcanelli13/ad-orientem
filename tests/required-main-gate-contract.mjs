import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const path=".github/workflows/required-main-gate.yml";
const workflow=readFileSync(path,"utf8");
const packageJson=JSON.parse(readFileSync("package.json","utf8"));

assert.match(workflow,/^name: Required main gate$/m);
assert.match(workflow,/^on:\s*$/m);
assert.match(workflow,/^  pull_request:\s*$/m);
assert.match(workflow,/^    types:\s*\[opened, synchronize, reopened, ready_for_review\]$/m);
assert.match(workflow,/^  merge_group:\s*$/m);
assert.doesNotMatch(workflow,/^\s+paths(?:-ignore)?:/m,
  "Required status workflow cannot have path filters");
assert.match(workflow,/^  required-main-gate:\s*$/m,
  "Required job identifier must remain stable for GitHub rules");
assert.match(workflow,/^    name: required-main-gate$/m);
assert.match(workflow,/^        run: npm test$/m);
assert.ok(packageJson.scripts?.test?.includes("test:r17"),
  "Repository regression suite cannot omit canonical Mass coverage");
assert.ok(packageJson.scripts?.test?.includes("test:learn-owner"),
  "Repository regression suite cannot omit Formation ownership checks");
assert.ok(packageJson.scripts?.test?.includes("test:directory"),
  "Repository regression suite cannot omit map/directory coverage");
console.log("PASS unconditional main gate: stable status, no path filters, full existing repository suite");
