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
// Only narrowly scoped Directory review branches may write generated artifacts.
const reviewBranchMutationWorkflows=new Map([
  ["directory-snapshot-promotion.yml",/branches:\s*\n\s*-\s*["']snapshot\/directory-\*["']/i],
  ["directory-geocode-promotion.yml",/branches:\s*\n\s*-\s*["']snapshot\/directory-\*["']/i],
  ["directory-icksp-research-geocode.yml",/branches:\s*\n\s*-\s*["']directory\/icksp-quality-\*["']/i],
]);
for(const name of workflows){
  const path=join(workflowDir,name);
  const source=readFileSync(path,"utf8");

  const reviewBranchGuard=reviewBranchMutationWorkflows.get(name);
  if(reviewBranchGuard){
    assert.match(source,reviewBranchGuard,
      name+" must remain scoped to its designated Directory review branch family");
    if(name==="directory-icksp-research-geocode.yml"){
      assert.match(source,/branches:[ \t]*\n[ \t]*-[ \t]*["']directory\/icksp-quality-\*["'][ \t]*\n[ \t]*paths:[ \t]*\n[ \t]*-[ \t]*["']data\/directory\/\.icksp-research-geocode-request["']/i,
        name+" must be triggered only by the ICKSP geocode request marker on review branches");
    }
    assert.doesNotMatch(source,/branches:\s*[\s\S]{0,160}?[-"'\s]main\b/i,
      name+" must never target main");
    assert.match(source,/permissions:\s*[\s\S]*?contents:\s*write/i,
      name+" review-branch promotion requires explicit contents: write");
    assert.match(source,/git\s+push\s+origin\s+["']HEAD:\$\{GITHUB_REF_NAME\}["']/i,
      name+" must push only back to the triggering review branch");
  }else if(name==="directory-st-alphonsus-stage.yml"){
    // Narrow, exact-branch staging of FOUR fixed-source local photographs.
    // Writes staged assets + report only; no approved media or production edits.
    assert.match(source,/push:\s*\n\s*branches:\s*\n\s*-\s*feat\/directory-st-alphonsus-media-20261029/i,
      "St Alphonsus binary staging must remain on its exact feature branch");
    assert.match(source,/permissions:\s*\n\s*contents:\s*write/i,
      "St Alphonsus staged-asset job must use explicit write permission");
    assert.match(source,/refs\/heads\/feat\/directory-st-alphonsus-media-20261029/,
      "St Alphonsus push cannot address main");
    assert.match(source,/git add assets\/staged\/directory-st-alphonsus\/US-st-alphonsus-baltimore-exterior-2018\.webp/,
      "Only explicit exterior image may be staged");
    assert.match(source,/git add assets\/staged\/directory-st-alphonsus\/US-st-alphonsus-baltimore-nave-2013\.webp/,
      "Only explicit interior image may be staged");
    assert.match(source,/git add assets\/staged\/directory-st-alphonsus\/US-st-alphonsus-baltimore-exterior-spire-2014\.webp/,
      "Only explicit full-spire exterior alternate may be staged");
    assert.match(source,/git add assets\/staged\/directory-st-alphonsus\/US-st-alphonsus-baltimore-high-altar-2013\.webp/,
      "Only exact St Alphonsus high altar image may be staged");
    assert.match(source,/git add data\/geography\/research\/directory-st-alphonsus-photo-stage-20261029\.v1\.json/,
      "Only provenance report may be staged");
    assert.equal((source.match(/git\s+push\s+/g)||[]).length,1,
      "Exact staged-asset workflow may push only once");
    assert.doesNotMatch(source,/git\s+add\s+(?:-A|--all|\.)/i);
    assert.doesNotMatch(source,/git\s+push\s+[^\n]*\bmain\b/i);
    assert.doesNotMatch(source,/assets\/approved|approved-place-media\.v1\.json|approved-place-gallery\.v1\.json/,
      "Staging cannot publish approved images");
  }else if(name==="directory-open-photo-discovery-batch.yml"){
    // Only this explicitly dispatched *metadata-only* collector may write one
    // fixed research branch. Never allow research-batch automation to push main,
    // approve media, or mutate the canonical repository outside that branch.
    assert.match(source,/workflow_dispatch:/i,"photo batch requires manual dispatch");
    assert.doesNotMatch(source,/schedule:\s*\n/,"photo batch must not run on a paid/unbounded cadence");
    assert.match(source,/permissions:\s*\n\s*contents:\s*write/i,
      "photo batch requires explicit research-branch write permission");
    assert.match(source,/publication[^\\n]*RESEARCH_ONLY_NEVER_APP_VISIBLE/,
      "photo batch cannot claim publication");
    assert.match(source,/git add "\$target\/r49-\$OFFSET-\$LIMIT\.json"/,
      "photo batch may stage exactly one per-batch metadata file");
    assert.match(source,/git push origin HEAD:refs\/heads\/research\/directory-photo-candidates/,
      "photo batch writes only the candidate research branch");
    assert.equal((source.match(/git\s+push\s+/g)||[]).length,1,
      "photo batch may have exactly one push command");
    assert.doesNotMatch(source,/git\s+push\s+[^\n]*(?:main|master|production)\b/i);
    assert.doesNotMatch(source,/git\s+add\s+(?:-A|--all|\.)/i);
    assert.doesNotMatch(source,/gh\s+api\s+-X\s+(?:PUT|PATCH|POST)/i);
  }else if(name==="branch-hygiene.yml"){
    // Merged-branch ref deletion is deliberately distinct from mutating app
    // source or restoring old production builds. Enforce the exact safeguards,
    // rather than blindly treating this limited git-ref cleanup as promotion.
    assert.match(source,/permissions:\s*[\s\S]*?contents:\s*write/i,
      "merged-head cleanup needs explicit ref-delete permission");
    assert.match(source,/pull_request:\s*\n\s*types:\s*\[closed\]/i);
    assert.match(source,/github\.event\.pull_request\.merged == true/);
    assert.match(source,/current["']?\s*!=\s*["']?\$MERGED_HEAD|"\$current"\s*!=\s*"\$MERGED_HEAD"/,
      "only the exact merged head may be removed");
    assert.match(source,/protected["']?\s*==\s*false|"\$protected"\s*==\s*false/,
      "protected branch refs must not be removed");
    assert.match(source,/git merge-base --is-ancestor "\$sha" refs\/remotes\/origin\/main/,
      "old branch cleanup must require ancestry on main");
    assert.match(source,/max_delete=150/,
      "prune mode must have a bounded deletion cap");
    assert.match(source,/grep -Fxq -- "\$branch" "\$RUNNER_TEMP\/open-pr-heads\.txt"/,
      "unmerged or open PR heads must not be removed");
    assert.match(source,/main\|HEAD\|gh-pages\|archive\/\*\|release\/\*/,
      "preserved main/archive/release refs must be excluded");
    assert.doesNotMatch(source,/git\s+push\b/i,"no source push allowed");
    assert.doesNotMatch(source,/gh api\s+-X\s+(?:PUT|PATCH|POST)/i,
      "branch hygiene must remain delete/read only");
  }else{
    assert.doesNotMatch(source,/permissions:\s*[\s\S]*?contents:\s*write/i,
      name+" regained contents: write");
    assert.doesNotMatch(source,/git\s+push\b/i,
      name+" can push repository mutations");
  }
  assert.doesNotMatch(source,/cp\s+legacy\/.*\s+index\.html/i,
    name+" can replace production index.html from legacy baseline");
  assert.doesNotMatch(source,/apply_emergency_stable|apply-r17-browser-entry/i,
    name+" references an obsolete mutator");
}


// Retire superseded PR revisions without cancelling independent manual
// source-research runs or production-main verification.
// Hold separate source-owner regression lanes (#342, #658) unchanged until their
// actual data/provenance failures have been repaired.
const supervisedPrWorkflows=[
  "calendar-1962-full-year-oracle.yml",
  "cse-author-original-source-integrity.yml",
  "directory-sspx-world-index.yml",
  "five-destination-smoke.yml",
  "formation-research-preview.yml",
  "native-mass-booklet-print.yml",
  "offline-snapshot-acceptance.yml",
  "pilot-review-packet.yml",
  "pius-x-french-scan-survey.yml",
  "pius-x-italian-digital-source-comparison.yml",
  "pray-guided-acceptance.yml",
  "pray-marian-acceptance.yml",
  "rosary-edition-collation.yml",
  "scripture-contracts.yml",
  "scripture-reader-mobile.yml",
  "scripture-source-audit.yml",
  "sspx-official-live-audit.yml",
];
for(const name of supervisedPrWorkflows){
  const source=readFileSync(join(workflowDir,name),"utf8");
  assert.ok(source.includes("group: ${{ github.workflow }}-${{ github.event.pull_request.number || github.run_id }}"),
    name+" no longer isolates PR cancellation by workflow and PR number");
  assert.ok(source.includes("cancel-in-progress: ${{ github.event_name == 'pull_request' }}"),
    name+" can cancel a manual source audit or a main verification");
}



// Queue ownership: changes in package.json must not launch unrelated
// specialist source/research suites. App convergence remains the catch-all.
const narrowWorkflows=[
  "directory-foundation.yml",
  "scripture-contracts.yml",
  "rosary-edition-collation.yml",
  "tenebrae-source-integrity.yml",
];
for(const name of narrowWorkflows){
  const source=readFileSync(join(workflowDir,name),"utf8");
  assert.doesNotMatch(source,/^\s*-\s*["']package\.json["']\s*$/m,
    name+" broad package.json trigger reintroduced");
}
const additionalCancelledPrLanes=[
  "directory-preliminary-map-r49.yml",
  "tenebrae-source-integrity.yml",
  "explore-mobile-r53.yml",
  "sexual-ethics-canonical.yml",
  "content-architecture-census.yml",
];
for(const name of additionalCancelledPrLanes){
  const source=readFileSync(join(workflowDir,name),"utf8");
  assert.ok(source.includes("group: ${{ github.workflow }}-${{ github.event.pull_request.number || github.run_id }}"),
    name+" cannot isolate superseded PR attempts");
  assert.ok(source.includes("cancel-in-progress: ${{ github.event_name == 'pull_request' }}"),
    name+" must preserve main and manually launched verification");
}
const appWorkflow=readFileSync(join(workflowDir,"app-convergence.yml"),"utf8");
assert.match(appWorkflow,/^\s*-\s*["']package\.json["']\s*$/m,
  "app-wide package and dependency verification owner disappeared");

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

console.log("production tree hygiene: PASS — one native Mass renderer, no legacy/shadow execution path, no emergency runtime, and repository mutation limited to guarded Directory review-branch promotion workflows.");
