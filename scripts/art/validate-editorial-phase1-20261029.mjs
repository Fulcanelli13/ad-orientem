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


const crosswalk = load("sacred-art-accepted-856-to-canonical-383-20261029.v1.json");
const confirmedRows = crosswalk.records.filter(r => r.canonical383.status === "CONFIRMED_IDENTITY");
const unlinkedRows = crosswalk.records.filter(r => r.canonical383.status === "NO_CONFIRMED_IDENTITY");
if (crosswalk.records.length !== 856 || confirmedRows.length !== 72 || unlinkedRows.length !== 784)
  fail("crosswalk 856-to-383 identity counts mismatch");
const c383 = new Map(load("sacred-art-curator-queues-383-20261029.v1.json").main_records.map(r => [r.artwork_id, r]));
const positiveTypes = {};
for (const r of crosswalk.records) {
  const raw = byId.get(r.sourceId);
  if (!raw || raw.decision !== r.review.decision || raw.batch !== r.batch || raw.corrections !== r.review.corrections)
    fail("crosswalk mismatches frozen review choice " + r.sourceId);
  if (r.releaseStatus !== "NOT_CERTIFIED_DO_NOT_PUBLISH" || r.productionMutation !== false)
    fail("crosswalk mistakenly promoted source photo " + r.sourceId);
  if (r.canonical383.status === "CONFIRMED_IDENTITY") {
    if (!c383.has(r.canonical383.artworkId)) fail("nonexistent canonical art work " + r.canonical383.artworkId);
    const typ = r.canonical383.evidence;
    positiveTypes[typ] = (positiveTypes[typ] || 0) + 1;
    if (typ === "EXACT_CANONICAL_OBJECT_ID" &&
        r.sourceId.toLowerCase().replace(":", "-") !== r.canonical383.artworkId.toLowerCase())
      fail("canonical source ID evidence mismatch " + r.sourceId);
    if (r.canonical383.existingProductionApproved !== false) fail("photo-approval gate unexpectedly true");
  }
}
const expectedPositiveTypes = {
  EXACT_CANONICAL_OBJECT_ID: 63,
  EXACT_COMMONS_FILE_IDENTITY: 4,
  EXACT_LEGACY_COMMONS_FILENAME_ID: 4,
  EXACT_INSTITUTIONAL_ACCESSION_FROM_COMMONS: 1,
};
for (const [type, expectedCount] of Object.entries(expectedPositiveTypes))
  if (positiveTypes[type] !== expectedCount) fail("crosswalk evidence count mismatch " + type);
if (Object.keys(positiveTypes).length !== Object.keys(expectedPositiveTypes).length)
  fail("unknown positive evidence class");
if (crosswalk.counts.researchCandidateMatched !== 74 ||
    crosswalk.counts.researchCandidateUnlinked !== 11 ||
    crosswalk.counts.acceptedWithCorrections !== 84 ||
    crosswalk.counts.documentedB13Exceptions !== 4) fail("crosswalk companion counts mismatch");
const weakIdentityQueue = load("sacred-art-phase1-identity-review-13-20261029.v1.json");
if (weakIdentityQueue.leadRows.length !== 13 ||
    weakIdentityQueue.counts.certifiedAsSameWork !== 0 ||
    weakIdentityQueue.counts.unlinkedTotal !== 784) fail("weak-identity research queue status mismatch");
for (const lead of weakIdentityQueue.leadRows)
  if (!unlinkedRows.some(r => r.sourceId === lead.sourceId) ||
      lead.noAutoMerge !== true || lead.userDecisionProtected !== true)
    fail("weak heuristic lead auto-approved or no longer unlinked " + lead.sourceId);
if (master.counts.acceptedToCanonical383VerifiedSourceLinks !== 72 ||
    master.counts.acceptedWithoutCanonicalPhysicalIdentityLink !== 784 ||
    master.counts.weakTextualWorkIdentityLeadsForReview !== 13 ||
    master.phase1AcceptedCrosswalk.mergesPerformed !== 0)
  fail("master no longer agrees with accepted/canonical crosswalk");

const linkage = load("sacred-art-phase1-856-to-383-crosswalk-20261029.v1.json");
if (linkage.rows.length !== 856 || linkage.counts.exactIdentityLinked !== 63 ||
    linkage.counts.titleArtistCandidatesOnly !== 3 || linkage.counts.unlinked !== 790 ||
    linkage.counts.ambiguousStrong !== 0) fail("856-to-383 crosswalk counts mismatch");
for (const entry of linkage.rows) {
  const record = byId.get(entry.id);
  if (!record || record.decision === "REJECT" || record.decision !== entry.choice) fail("crosswalk decision mismatch " + entry.id);
}
if (master.phase1Crosswalk.reviewCardsAssessed !== 856 || master.phase1Crosswalk.productionMutation !== false) fail("master crosswalk metadata mismatch");
if (master.gates.production !== "UNTOUCHED") fail("production gate modified");

const museum479 = load("sacred-art-phase1-museum-479-accession-audit-20261029.v1.json");
const registry281Ids = new Set(load("sacred-art-candidates.v1.json").artworks.map(r => r.id.toLowerCase()));
const researchWeak = new Map(weakIdentityQueue.leadRows.map(r => [r.sourceId, r.possibleExistingCanonical.map(w => w.canonicalArtworkId)]));
const museumTargets = unlinkedRows.filter(r => !r.sourceId.startsWith("commons:"));
const expectedDomains = {
  cma: "clevelandart.org", kmska: "kmska.be", met: "metmuseum.org", nga: "nga.gov",
  walters: "purl.thewalters.org", smk: "open.smk.dk", rijks: "id.rijksmuseum.nl"
};
if (museumTargets.length !== 479 || museum479.rows.length !== 479) fail("museum accession audit coverage changed");
const museumById = new Map(museumTargets.map(r => [r.sourceId, r]));
if (new Set(museum479.rows.map(r => r.sourceId)).size !== 479) fail("museum accession audit duplicate source ID");
const accessionAllReviews = new Map();
const normAcc = v => String(v ?? "").toLowerCase().replace(/\s+/g, "");
for (const r of records) {
  const k = r.sourceId.split(":")[0] + "|" + normAcc(r.accession);
  accessionAllReviews.set(k, [...(accessionAllReviews.get(k) ?? []), r.sourceId]);
}
let prior281 = 0, textLeads = 0, conditional479 = 0;
const titleArtistGroups = new Map();
const normalized = s => String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
for (const row of museum479.rows) {
  const reviewed = museumById.get(row.sourceId), raw = byId.get(row.sourceId);
  if (!reviewed || !raw || raw.decision !== row.userDecision || raw.batch !== row.batch ||
      reviewed.review.accession !== row.sourceAccession || raw.accession !== row.sourceAccession ||
      reviewed.review.originalSourceUrl !== row.sourceObjectUrl ||
      raw.title !== row.title || raw.artist !== row.artistAsReviewed) fail("museum frozen source mismatch " + row.sourceId);
  const prefix = row.sourceId.split(":")[0], objId = row.sourceId.split(":")[1];
  if (row.museum !== prefix || row.sourceObjectId !== objId || !Object.hasOwn(expectedDomains, prefix))
    fail("museum identity prefix mismatch " + row.sourceId);
  const target = (prefix === "cma" || prefix === "walters") ? row.sourceAccession : objId;
  const u = new URL(row.sourceObjectUrl);
  if (u.hostname.toLowerCase().replace(/^www\./, "") !== expectedDomains[prefix] ||
      !decodeURIComponent(u.pathname).toLowerCase().endsWith("/" + String(target).toLowerCase()) ||
      row.sourceUrlAlignedWithSuppliedId !== true) fail("museum source URL internal reference mismatch " + row.sourceId);
  const k = prefix + "|" + normAcc(row.sourceAccession);
  if ((accessionAllReviews.get(k) ?? []).length !== 1 ||
      row.sourceAccessionCollisionWithAnyReviewedCard.length !== 0) fail("museum accession collision " + row.sourceId);
  const researchId = row.sourceId.replace(":", "-").toLowerCase();
  if (row.reviewResearchRegistry281Id !== (registry281Ids.has(researchId) ? researchId : null))
    fail("museum research-281 crosswalk mismatch " + row.sourceId);
  if (row.reviewResearchRegistry281Id) prior281++;
  const lead = researchWeak.get(row.sourceId) ?? [];
  if (JSON.stringify(row.existingTextOnlyCanonicalLeads) !== JSON.stringify(lead))
    fail("museum weak leads changed " + row.sourceId);
  if (lead.length) textLeads++;
  if (row.userDecision === "IMPORT_WITH_CORRECTIONS") conditional479++;
  const key = normalized(row.title) + "|" + normalized(row.artistAsReviewed);
  titleArtistGroups.set(key, [...(titleArtistGroups.get(key) ?? []), row.sourceId]);
  if (row.externalInstitutionalRecordVerified !== false || row.canonical383Identity !== "NO_CONFIRMED_LINK" ||
      row.imageVisualCertified !== false || row.imageRightsCertified !== false || row.productionApproved !== false)
    fail("museum audit accidentally released or certified an artwork " + row.sourceId);
}
let titleGroups = 0;
for (const r of museum479.rows) {
  const key = normalized(r.title) + "|" + normalized(r.artistAsReviewed);
  const peers = (titleArtistGroups.get(key) ?? []).filter(id => id !== r.sourceId);
  if (JSON.stringify(r.sameTitleArtistOtherSourceCards.slice().sort()) !== JSON.stringify(peers.slice().sort()))
    fail("museum same-title/artist queue mismatch " + r.sourceId);
}
for (const peers of titleArtistGroups.values()) if (peers.length > 1) titleGroups++;
if (prior281 !== 11 || textLeads !== 11 || conditional479 !== 67 || titleGroups !== 3 ||
    museum479.counts.institutionBackedUnlinkedSourceCards !== 479 ||
    museum479.counts.sourceUrlInternallyAligned !== 479 ||
    museum479.counts.uniqueAccessionKeysAgainstAll2455 !== 479 ||
    museum479.counts.priorResearchRegistryMatches !== prior281 ||
    museum479.counts.existingHeuristicTextOnlyLeadRows !== textLeads ||
    museum479.counts.sameTitleArtistCandidateGroups !== titleGroups ||
    museum479.counts.conditionalImportCards !== conditional479 ||
    museum479.counts.externallyVerifiedInstitutionalRecords !== 0 ||
    museum479.counts.newConfirmedCanonical383Links !== 0 ||
    museum479.counts.newDistinctPhysicalArtworksCertified !== 0 ||
    museum479.counts.productionImports !== 0 ||
    museum479.releaseGates.productionMutation !== false ||
    museum479.releaseGates.userChoicesModified !== false) fail("museum accession audit count/release gates changed");
console.log("PASS museum-backed accession internal audit: 479 reviewed, 479 URL-aligned, 11 research-registry matches, zero confirmed new canonical links.");

console.log("PASS Sacred Art Phase 1: " + records.length + " reviewed; " + expected.acceptedOrConditional + " accepted/conditional; " + counts.REJECT + " rejected; no production mutations.");
