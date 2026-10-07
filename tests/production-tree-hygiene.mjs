import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const forbiddenPaths=[
  "field",
  ".github/workflows/apply-emergency-stable-v4333.yml",
  ".github/workflows/apply-r17-browser-entry.yml",
  ".github/workflows/diagnose-mass-text-proper.yml",
  "tools/apply_emergency_stable_v4333.py",
  "tools/apply_emergency_stable_v4333_core.py",
  "tools/apply-r17-browser-entry.py",
];

for(const path of forbiddenPaths){
  assert.equal(existsSync(path),false,"obsolete production mutator returned: "+path);
}

const workflowDir=".github/workflows";
const workflows=readdirSync(workflowDir).filter(name=>/\.ya?ml$/i.test(name));
for(const name of workflows){
  const path=join(workflowDir,name);
  const source=readFileSync(path,"utf8");
  assert.doesNotMatch(source,/permissions:\s*[\s\S]*?contents:\s*write/i,
    name+" regained contents: write");
  assert.doesNotMatch(source,/git\s+push\b/i,
    name+" can push repository mutations");
  assert.doesNotMatch(source,/cp\s+legacy\/.*\s+index\.html/i,
    name+" can replace production index.html from legacy baseline");
  assert.doesNotMatch(source,/apply_emergency_stable|apply-r17-browser-entry/i,
    name+" references an obsolete mutator");
}


const productionIndex=readFileSync("index.html","utf8");
const massBrowserEntryTags=productionIndex.match(
  /<script\b[^>]*\bsrc=["']\.\/src\/mass\/browser-entry\.js["'][^>]*><\/script>/gi
)??[];
assert.equal(massBrowserEntryTags.length,1,
  "production index must contain exactly one Mass browser-entry module include");
assert.doesNotMatch(productionIndex,/data-ao-r17-icon-bridge/,
  "obsolete inline R17 icon bridge returned; icon discovery belongs to the modular browser entry");
assert.doesNotMatch(productionIndex,/AO_EMERGENCY_STABLE_V4333|ao-v4333-emergency-stable-(?:css|js)/,
  "embedded v43.33 emergency runtime returned to production index");


const massReaderGate=readFileSync("src/mass/reader-gate.js","utf8");
const massBrowserEntry=readFileSync("src/mass/browser-entry.js","utf8");
assert.match(massReaderGate,/READER_UI_MODES\s*=\s*Object\.freeze\(\[["']NATIVE["']\]\)/,
  "Mass reader gate no longer declares one native renderer");
assert.doesNotMatch(massReaderGate,/\["NATIVE"\s*,\s*"LEGACY"|\bSHADOW\b.*return\s+["']SHADOW["']/,
  "legacy/shadow Mass renderer selection returned");
assert.doesNotMatch(massBrowserEntry,/\.startLive\s*\(|runReaderShadowAudit|LEGACY_EXPLICIT_ROLLBACK|LEGACY_SHADOW_AUDIT/,
  "browser entry regained an executable legacy/shadow Mass renderer");
assert.match(massBrowserEntry,/presentationOwner:\s*"R17_NATIVE_PRODUCTION"/,
  "browser entry lost the single definitive presentation owner marker");

const baseline=readFileSync(".github/workflows/baseline-integrity.yml","utf8");
assert.match(baseline,/contents:\s*read/i,"baseline verification is not read-only");
assert.match(baseline,/Frozen v43\.33 verified as historical baseline only/i,
  "baseline workflow lost historical-only guard");

const readme=readFileSync("README.md","utf8");
assert.match(readme,/archive\/2026-10-04-pre-hygiene/,
  "README does not point to the preserved pre-hygiene archive");
assert.doesNotMatch(readme,/retained under `field\/2026-10-04\/`/,
  "README still claims the field snapshot lives in production main");

console.log("production tree hygiene: PASS — one native Mass renderer, no legacy/shadow execution path, no emergency runtime, no duplicate Mass entry.");
