/**
 * Ad Orientem Sacred Art editorial Phase 1 integrity guard.
 * Run from repo root: node scripts/art/validate-editorial-phase1-20261029.mjs
 * This does not modify artwork assets, rights decisions, or production.
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const base = resolve("data/calendar");
const load = path => JSON.parse(readFileSync(resolve(base, path), "utf8"));
const fail = message => { throw new Error("SACRED_ART_PHASE1: " + message); };
const master = load("sacred-art-editorial-master-20261029.v1.json");
const records = [];
const stats = [];
for (const item of master.shards) {
  const name = item.path.replace(/^data\/calendar\//, "");
  const bytes = readFileSync(resolve(base, name));
  const blob = createHash("sha1").update(Buffer.from("blob " + bytes.length + "\0")).update(bytes).digest("hex");
  if (blob !== item.gitBlobSha) fail("shard blob changed: " + name);
  const shard = JSON.parse(bytes.toString("utf8"));
  if (shard.records.length !== item.reviewCards) fail("shard size changed: " + name);
  records.push(...shard.records);
  stats.push(...shard.stats);
}
const counts = {IMPORT:0, IMPORT_WITH_CORRECTIONS:0, REJECT:0};
const byId = new Map();
for (const r of records) {
  if (!Object.hasOwn(counts, r.decision)) fail("invalid decision " + r.sourceId);
  if (r.productionImported !== false) fail("forbidden production import status " + r.sourceId);
  if (byId.has(r.sourceId)) fail("repeated source ID " + r.sourceId);
  if (!r.decisionFile || !r.sourceFile) fail("missing review provenance for " + r.sourceId);
  counts[r.decision]++;
  byId.set(r.sourceId, r);
}
const expected = master.counts;
if (records.length !== 2455 || byId.size !== expected.distinctSourceIds) fail("global record-count mismatch");
if (counts.IMPORT !== expected.imports || counts.IMPORT_WITH_CORRECTIONS !== expected.importsWithCorrections || counts.REJECT !== expected.rejected) fail("decision count mismatch");
if (counts.IMPORT + counts.IMPORT_WITH_CORRECTIONS !== expected.acceptedOrConditional) fail("acceptance mismatch");
for (const [id, entries] of Object.entries(master.sourceIdIndex)) {
  if (!byId.has(id) || entries.length !== 1 || entries[0].decision !== byId.get(id).decision || entries[0].batch !== byId.get(id).batch) fail("source-index mismatch " + id);
}
if (Object.keys(master.sourceIdIndex).length !== records.length) fail("incomplete source index");
if (load("sacred-art-curator-queues-383-20261029.v1.json").main_records.length !== expected.canonical383Records) fail("original 383 baseline changed");
const b13 = load("sacred-art-editorial-b13-final-decisions-20261029.v1.json");
const b13Original = load("sacred-art-b13-french-museums-250-20261029.v1.json");
if (b13.batchSha256 !== b13Original.batchSha256) fail("B13 no longer linked to original reviewed source");
const replacements = b13.provenance.unreviewedSubstituteSourceIds;
if (replacements.length !== 10 || !replacements.every(id => !byId.has(id))) fail("later B13 substitutions inherited decisions");

const identity = load("sacred-art-phase1-identity-triage-34-20261029.v1.json");
if (identity.groups.length !== 34 || identity.counts.groups !== 34) fail("identity triage count mismatch");
const identityCounts = {};
for (const group of identity.groups) {
  identityCounts[group.identityDisposition] = (identityCounts[group.identityDisposition] || 0) + 1;
  for (const r of group.sourceRows) {
    if (!byId.has(r.sourceId) || byId.get(r.sourceId).decision !== r.decision) fail("identity triage changed user decision " + r.sourceId);
  }
  if (group.productionImports !== 0 || group.decisionsChanged !== 0) fail("identity group mutated a decision");
}
if (identityCounts.DISTINCT_INVENTORY_RECORDS_NO_MERGE !== 28 ||
    identityCounts.DISTINCT_WORK_INSTITUTIONAL_EVIDENCE !== 2 ||
    identityCounts.ENSEMBLE_COMPONENT !== 2 ||
    identityCounts.PARENT_COMPONENT !== 1 ||
    identityCounts.SAME_PHYSICAL_WORK_MULTIPLE_IMAGE_SOURCES !== 1) fail("identity disposition totals mismatch");
const exceptionReport = load("sacred-art-b13-four-approved-source-repairs-20261029.v1.json");
if (exceptionReport.cases.length !== 4 || exceptionReport.counts.originalUserDecisionsModified !== 0) fail("B13 approved source repair mismatch");
for (const c of exceptionReport.cases) {
  const r = byId.get(c.sourceId);
  if (!r || r.batch !== "B13" || r.decision !== "IMPORT" || c.reviewedChoice.decision !== "IMPORT" || c.productionEligible !== false) fail("B13 approved source case mismatch " + c.sourceId);
}
const copyrightCase = exceptionReport.cases.find(c => c.sourceId === "commons:85666930");
if (!copyrightCase || copyrightCase.rightGate !== "PHOTOGRAPH_CC_BY_SA_4_0_NOT_PUBLIC_DOMAIN") fail("Blanchard photo rights hold lost");
if (master.counts.identityTriagedCandidateGroups !== 34 ||
    master.counts.b13ApprovedSourceRepairCases !== 4 ||
    master.phase1EvidenceReview.productionMutation !== false) fail("phase1 follow-up manifest mismatch");

if (master.gates.production !== "UNTOUCHED") fail("production gate modified");
console.log("PASS Sacred Art Phase 1: " + records.length + " reviewed; " + expected.acceptedOrConditional + " accepted/conditional; " + counts.REJECT + " rejected; no production mutations.");
