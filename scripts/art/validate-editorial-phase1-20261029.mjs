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


const officialMuseum = load("sacred-art-phase1-official-cma29-met73-verification-20261029.v1.json");
const officialCounts = officialMuseum.counts;
if (officialMuseum.rows.length !== 102 || officialCounts.officialMuseumPagesResolved !== 102 ||
    officialCounts.clevelandMuseumRecords !== 29 || officialCounts.metropolitanMuseumRecords !== 73 ||
    officialCounts.attributionOrAnonymousExceptionRows !== 11 ||
    officialCounts.parentComponentOrTwoSidedExceptionRows !== 5 ||
    officialCounts.canonical383NewLinks !== 0 ||
    officialCounts.numberOfDistinctNewPaintingsCertified !== 0 ||
    officialCounts.userDecisionsChanged !== 0 || officialCounts.productionImports !== 0)
  fail("102 official museum object page verification totals mismatch");
const auditedMuseumById = new Map(museum479.rows.map(r => [r.sourceId, r]));
const pageIds = new Set();
let cmaPages = 0, metPages = 0, attrExceptions = 0, groupingExceptions = 0;
for (const item of officialMuseum.rows) {
  const previous = auditedMuseumById.get(item.sourceId);
  if (!previous || pageIds.has(item.sourceId) ||
      previous.museum !== item.institution ||
      previous.title !== item.reviewedTitle ||
      previous.userDecision !== item.reviewChoiceFrozen ||
      previous.sourceAccession !== item.reviewedSourceAccession ||
      previous.artistAsReviewed !== item.reviewedArtist ||
      !["cma", "met"].includes(item.institution))
    fail("official museum record diverges from reviewed audit " + item.sourceId);
  pageIds.add(item.sourceId);
  const expectedUrl = item.institution === "cma"
    ? "https://www.clevelandart.org/art/" + previous.sourceAccession
    : "https://www.metmuseum.org/art/collection/search/" + previous.sourceObjectId;
  if (item.officialObjectPage !== expectedUrl ||
      item.verification.officialCollectionPageRetrieved !== true ||
      item.verification.objectPageTitleMatchesReviewedTitle !== true ||
      item.verification.notEvidenceOfDistinctPhysicalWork !== true ||
      item.canonical383Status !== "REMAINS_UNLINKED_TO_383" ||
      item.sourcePhotoRightsCertified !== false ||
      item.nativeImageVisualCertified !== false ||
      item.productionReleased !== false)
    fail("official museum evidence/rights gate mismatch " + item.sourceId);
  if (item.institution === "cma") cmaPages++;
  if (item.institution === "met") metPages++;
  if (item.officialAttributionException) attrExceptions++;
  if (item.physicalObjectRelationship) groupingExceptions++;
}
if (cmaPages !== 29 || metPages !== 73 || attrExceptions !== 11 || groupingExceptions !== 5)
  fail("CMA/Met per-source verification group totals mismatch");
if (officialMuseum.attributionExceptionQueue.length !== 11 ||
    officialMuseum.physicalGroupingQueue.length !== 5 ||
    officialMuseum.metSampleObjectNumberChecks.length !== 5)
  fail("museum evidence exception/sample queue totals mismatch");
for (const sample of officialMuseum.metSampleObjectNumberChecks) {
  const old = auditedMuseumById.get(sample.id);
  if (!old || old.museum !== "met" || sample.accession !== old.sourceAccession ||
      sample.source !== "https://www.metmuseum.org/art/collection/search/" + old.sourceObjectId)
    fail("Met verified sample accession mismatches frozen source " + sample.id);
}
if (officialMuseum.statusGuards.physicalUniqueWorkAssignment !== false ||
    officialMuseum.statusGuards.canonical383Changed !== false ||
    officialMuseum.statusGuards.sourcePhotographRightsCertified !== false ||
    officialMuseum.statusGuards.nativeImageInspected !== false ||
    officialMuseum.statusGuards.sourceUserDecisionsPreserved !== true ||
    officialMuseum.statusGuards.productionMutation !== false)
  fail("museum official evidence promoted to an uncertified release");
if (master.phase1MuseumAccessionAudit.institutionBackedUnlinkedCards !== 479 ||
    master.phase1MuseumAccessionAudit.productionMutation !== false ||
    master.phase1OfficialMuseumVerification.officialCollectionObjectPagesResolved !== 102 ||
    master.phase1OfficialMuseumVerification.remainingMuseumSourceCardsToVerify !== 377 ||
    master.phase1OfficialMuseumVerification.unlinkedTo383Still !== 784 ||
    master.phase1OfficialMuseumVerification.canonicalLinksNewlyEstablished !== 0 ||
    master.phase1OfficialMuseumVerification.productionMutation !== false)
  fail("phase1 research master museum evidence manifest mismatch");
console.log("PASS official museum source pages: CMA 29 + Met 73 = 102; 11 attribution exceptions; no production or canonical link mutation.");


const nga = load("sacred-art-phase1-nga-126-official-firstpass-20261029.v1.json");
const ngaRows = nga.rows;
const ngaSourceRecords = museum479.rows.filter(r => r.museum === "nga");
if (ngaRows.length !== 126 || ngaSourceRecords.length !== 126 ||
    nga.counts.ngaSourceCards !== 126 || nga.counts.officialObjectPageIdentityObserved !== 42 ||
    nga.counts.officialObjectPagesPending !== 84 ||
    nga.counts.afterVanDyckSeriesPanels !== 12 ||
    nga.counts.sameTitleDistinctTiepoloPaintings !== 2 ||
    nga.counts.frozenConditionalImports !== 16 ||
    nga.counts.physicalRelationshipFlaggedSourceCards !== 27 ||
    nga.counts.newConfirmedCanonical383Links !== 0 ||
    nga.counts.newPhysicalPaintingsCertifiableForRelease !== 0 ||
    nga.counts.productionImports !== 0) fail("NGA 126-source firstpass counts mismatch");
const ngaSourceById = new Map(ngaSourceRecords.map(r => [r.sourceId, r]));
const ngaIds = new Set();
let checkedNGA = 0, pendingNGA = 0, apostlesNGA = 0, conditionalNGA = 0, flaggedNGA = 0;
for (const r of ngaRows) {
  const old = ngaSourceById.get(r.sourceId);
  if (!old || ngaIds.has(r.sourceId) || r.reviewBatch !== old.batch ||
      r.decisionFrozen !== old.userDecision || r.reviewedTitle !== old.title ||
      r.reviewedArtist !== old.artistAsReviewed ||
      r.accessionFromFrozenSource !== old.sourceAccession ||
      r.sourceOriginalUrl !== old.sourceObjectUrl)
    fail("NGA source/decision evidence drift " + r.sourceId);
  ngaIds.add(r.sourceId);
  const reviewed = r.officialPageIdentityFound;
  if (reviewed) {
    checkedNGA++;
    if (r.verificationStatus !== "OFFICIAL_NGA_COLLECTION_PAGE_TITLE_AND_OBJECT_ID_OBSERVED" ||
        !r.officialNgaPageReviewed?.startsWith("https://www.nga.gov/artworks/" + old.sourceObjectId + "-") ||
        r.officialTitleObserved !== r.reviewedTitle)
      fail("NGA checked official page identity mismatch " + r.sourceId);
  } else {
    pendingNGA++;
    if (r.verificationStatus !== "OFFICIAL_OBJECT_PAGE_REVIEW_PENDING" ||
        r.officialNgaPageReviewed !== null || r.officialTitleObserved !== null)
      fail("NGA pending record was wrongly promoted " + r.sourceId);
  }
  if (r.decisionFrozen === "IMPORT_WITH_CORRECTIONS") conditionalNGA++;
  const issues = r.physicalArtworkRelationshipEvidence;
  if (issues.length) flaggedNGA++;
  if (issues.some(e => e.type === "ANONYMOUS_AFTER_VAN_DYCK_SERIES")) {
    apostlesNGA++;
    if (!/^1960\.6\.11\.[a-l]$/.test(r.accessionFromFrozenSource)) fail("NGA Timken apostle mismatch " + r.sourceId);
  }
  if (r.officialAccessionPageTranscriptionCompleted !== false ||
      r.objectIdentityWithCanonical383 !== "NOT_CONFIRMED" ||
      r.photoIdentityCertified !== false || r.rightsCertified !== false ||
      r.fullNativeVisualCertified !== false || r.productionApproved !== false)
    fail("NGA official source verification incorrectly promoted image or physical identity " + r.sourceId);
}
if (checkedNGA !== 42 || pendingNGA !== 84 || apostlesNGA !== 12 ||
    conditionalNGA !== 16 || flaggedNGA !== 27 ||
    nga.knownSeries.length !== 1 || nga.knownSeries[0].memberSourceIds.length !== 12 ||
    nga.releaseGuards.userDecisionsChanged !== false ||
    nga.releaseGuards.canonical383MasterMutated !== false ||
    nga.releaseGuards.sourceImageApprovalTransferred !== false ||
    nga.releaseGuards.photoRightsCertified !== false ||
    nga.releaseGuards.productionMutation !== false)
  fail("NGA official verification release gate/series mismatch");
if (master.phase1NgaVerification.sourceCards !== 126 ||
    master.phase1NgaVerification.officialObjectPageIdentitiesChecked !== 42 ||
    master.phase1NgaVerification.awaitingIndependentMuseumCheck !== 84 ||
    master.phase1NgaVerification.totalOfficialMuseumPagesChecked !== 144 ||
    master.phase1NgaVerification.remainingInstitutionBackedCards !== 335 ||
    master.phase1NgaVerification.canonical383NewLinks !== 0 ||
    master.phase1NgaVerification.productionMutation !== false)
  fail("NGA official verification manifest mismatch");
console.log("PASS NGA 126 official firstpass: 42 pages checked, 84 pending, 12 Van Dyck-after panels; no promotions.");


const authoritativeNGA = load("sacred-art-phase1-nga126-official-csv-report-20261029.v1.json");
const ngac = authoritativeNGA.counts;
const ngao = master.phase1NgaOpenDataVerification;
const expectedNGAHashes = [
  "53d0757fd5a4fb53785adefdb7e6eeb3290d97157eb5d59bfdc203d6d8e909c0",
  "59dd0f38d2756fe9400267d91c355bbbd1ff3a4165f9d76e47e9ce76a4325ca6"
];
if (authoritativeNGA.sources.objectsSha256 !== expectedNGAHashes[0] ||
    authoritativeNGA.sources.associationsSha256 !== expectedNGAHashes[1] ||
    ngao.officialObjectDataSha256 !== expectedNGAHashes[0] ||
    ngao.officialAssociationsSha256 !== expectedNGAHashes[1])
  fail("NGA source-data snapshot hashes drifted");
if (authoritativeNGA.rows.length !== 126 ||
    ngac.frozenNgaSourceCards !== 126 || ngac.foundByOfficialObjectId !== 126 ||
    ngac.accessionExact !== 126 || ngac.accessionConflict !== 0 ||
    ngac.missingInOfficialCsv !== 0 || ngac.titleNormalizedMismatch !== 0 ||
    ngac.virtualObjects !== 0 || ngac.associationRowsRelatedToTargetIds !== 18 ||
    ngac.newlyCertifiedDistinctPhysicalPaintings !== 0 || ngac.productionImports !== 0)
  fail("official NGA 126-row data comparison outcome changed");
const frozenNGAById = new Map(nga.rows.map(r => [r.sourceId, r]));
let associatedNGA = 0, paintingsNGA = 0;
const officialNGAIDs = new Set();
for (const row of authoritativeNGA.rows) {
  const source = frozenNGAById.get(row.sourceId), o = row.official;
  if (!source || officialNGAIDs.has(row.sourceId) ||
      !o || o.objectId !== row.sourceId.replace("nga:", "") ||
      row.frozenReviewDecision !== source.decisionFrozen ||
      row.reviewedAccession !== source.accessionFromFrozenSource ||
      row.frozenTitle !== source.reviewedTitle ||
      row.frozenArtist !== source.reviewedArtist ||
      o.accessionExact !== true || o.titleNormalizedEqual !== true ||
      row.status !== "OFFICIAL_OBJECT_ID_AND_ACCESSION_MATCH")
    fail("NGA official CSV record does not match frozen user source " + row.sourceId);
  officialNGAIDs.add(row.sourceId);
  if (o.classification === "Painting") paintingsNGA++;
  if (o.objectAssociations.length) associatedNGA++;
  if (row.countedAsNewDistinctPhysicalPainting !== false ||
      row.matchedToCanonical383 !== false ||
      row.sourcePhotoCertified !== false ||
      row.photoRightsCertified !== false ||
      row.nativeVisualCertified !== false ||
      row.productionMutation !== false)
    fail("NGA CSV report violated physical-work/photo/production gate " + row.sourceId);
}
if (associatedNGA !== 18 || paintingsNGA !== 126 || officialNGAIDs.size !== 126 ||
    ngao.ngaSourceCards !== 126 || ngao.confirmedObjectIds !== 126 ||
    ngao.accessionExact !== 126 || ngao.museumBackedOfficialVerifiedToDate !== 228 ||
    ngao.museumBackedOfficialStillUnverified !== 251 ||
    ngao.catalogueClassifiedPaintings !== 126 ||
    ngao.officialAssociationAffectedSourceCards !== 18 ||
    ngao.canonical383NewLinks !== 0 ||
    ngao.newPhysicalArtworkCountCertified !== 0 ||
    ngao.photographsCertified !== 0 ||
    ngao.originalUserChoicesChanged !== false ||
    ngao.productionMutation !== false)
  fail("NGA official CSV research master audit/status mismatch");
console.log("PASS NGA official Open Data: 126 exact accessions + titles, 18 associated records, zero releases.");


const kmskaQueue = load("sacred-art-phase1-kmska-89-official-identity-queue-20261029.v1.json");
const kmskaSource = museum479.rows.filter(r => r.museum === "kmska");
const kmskaBySource = new Map(kmskaSource.map(r => [r.sourceId, r]));
if (kmskaSource.length !== 89 || kmskaQueue.rows.length !== 89 ||
    kmskaQueue.counts.acceptedConditional !== 89 ||
    kmskaQueue.counts.accepted !== 56 ||
    kmskaQueue.counts.conditional !== 33 ||
    kmskaQueue.counts.legacyIdUnique !== 89 ||
    kmskaQueue.counts.inventoryStringUnique !== 89 ||
    kmskaQueue.counts.sourceLegacyUrlAligned !== 89 ||
    kmskaQueue.counts.knownPriorRelationshipRows !== 5 ||
    kmskaQueue.counts.knownPriorEnsembleComponentRows !== 1 ||
    kmskaQueue.counts.sourceRecordsIndependentlyVerified !== 0 ||
    kmskaQueue.counts.canonical383NewLinks !== 0 ||
    kmskaQueue.counts.sourceImageApprovals !== 0 ||
    kmskaQueue.counts.productionImports !== 0)
  fail("KMSKA 89-source queue counts incorrect");
let importedKmska = 0, correctedKmska = 0, relationshipKmska = 0, ensembleKmska = 0;
const kmskaIds = new Set(), kmskaAccessions = new Set();
for (const r of kmskaQueue.rows) {
  const frozen = kmskaBySource.get(r.sourceId);
  if (!frozen || kmskaIds.has(r.sourceId) || kmskaAccessions.has(r.inventoryNumberExactString) ||
      r.inventoryNumberExactString !== String(frozen.sourceAccession) ||
      r.legacyKmskaId !== frozen.sourceObjectId ||
      r.originalUserDecision !== frozen.userDecision || r.batch !== frozen.batch ||
      r.originalReviewedTitle !== frozen.title ||
      r.originalReviewedArtist !== frozen.artistAsReviewed ||
      r.originalLegacyKmskaUrl !== frozen.sourceObjectUrl ||
      r.urlIdInternallyChecked !== true)
    fail("KMSKA queue changed a frozen source or accession " + r.sourceId);
  kmskaIds.add(r.sourceId);
  kmskaAccessions.add(r.inventoryNumberExactString);
  if (r.originalUserDecision === "IMPORT") importedKmska++;
  if (r.originalUserDecision === "IMPORT_WITH_CORRECTIONS") correctedKmska++;
  if (r.existingIdentityTriage) {
    relationshipKmska++;
    if (r.existingIdentityTriage.relation === "ENSEMBLE_COMPONENT") ensembleKmska++;
  }
  if (r.currentInstitutionalPageResolved !== false ||
      r.currentOfficialApiRecordResolved !== false ||
      r.officialInventoryNumberVerified !== false ||
      r.officialTitleAndArtistVerified !== false ||
      r.physicalWorkOrEnsembleVerified !== false ||
      r.canonical383IdentityLink !== "NO_CONFIRMED_LINK" ||
      r.sourcePhotographCertified !== false || r.rightsCertified !== false ||
      r.nativeImageVisualCertified !== false || r.productionRelease !== false)
    fail("KMSKA queue prematurely certified artwork/source " + r.sourceId);
}
if (importedKmska !== 56 || correctedKmska !== 33 ||
    relationshipKmska !== 5 || ensembleKmska !== 1 ||
    kmskaQueue.gate.userDecisionsModified !== false ||
    kmskaQueue.gate.canonical383MasterModified !== false ||
    kmskaQueue.gate.exactPhotographicLicenceCertified !== false ||
    kmskaQueue.gate.originalPhotoVisualExamined !== false ||
    kmskaQueue.gate.productionMutation !== false)
  fail("KMSKA source review integrity gate changed");
console.log("PASS KMSKA 89 queued accession records, 33 conditional, 5 preserved relations; zero premature promotions.");


const kmskaOfficial2 = load("sacred-art-phase1-kmska-89-official-first2-20261029.v1.json");
const verifiedKmskaById = new Map(kmskaQueue.rows.map(r => [r.sourceId, r]));
const verifiedInventoryPages = {
  "kmska:7v3wb4": ["208", "https://kmska.be/nl/meesterwerk/aanbidding-door-de-koningen-3"],
  "kmska:9tct5i": ["209bis", "https://kmska.be/nl/meesterwerk/annunciatie"]
};
if (kmskaOfficial2.rows.length !== 2 ||
    kmskaOfficial2.counts.kmskaSourceCards !== 89 ||
    kmskaOfficial2.counts.exactOfficialMuseumPagesVerified !== 2 ||
    kmskaOfficial2.counts.awaitingExactOfficialVerification !== 87 ||
    kmskaOfficial2.counts.verifiedTriptychComponentOrSurfaceRecords !== 2 ||
    kmskaOfficial2.counts.confirmedCanonical383LinksAdded !== 0 ||
    kmskaOfficial2.counts.sourcePhotosCertified !== 0 ||
    kmskaOfficial2.counts.userDecisionsChanged !== 0 ||
    kmskaOfficial2.counts.productionMutations !== 0)
  fail("KMSKA two exact institutional pages audit count drift");
for (const r of kmskaOfficial2.rows) {
  const frozen = verifiedKmskaById.get(r.sourceId);
  const expectedPage = verifiedInventoryPages[r.sourceId];
  if (!frozen || !expectedPage || r.accession !== expectedPage[0] ||
      r.officialObjectPage !== expectedPage[1] ||
      r.sourceBatch !== frozen.batch || r.userDecision !== frozen.originalUserDecision ||
      r.originalReviewedTitle !== frozen.originalReviewedTitle ||
      r.originalReviewedArtist !== frozen.originalReviewedArtist ||
      r.accession !== frozen.inventoryNumberExactString ||
      r.officialVerified.title !== true || r.officialVerified.inventory !== true ||
      r.officialVerified.artist !== true || r.officialVerified.paintingMedium !== true ||
      !r.objectRelation || r.objectRelation.parentMuseumInventory !== "208-210" ||
      r.objectRelation.sourceDecisionNotTransferred !== true ||
      r.photoLicenceCertified !== false || r.nativePhotoVisualCertified !== false ||
      r.canonical383MatchEstablished !== false || r.productionReleased !== false)
    fail("KMSKA exact official accession or approval/ensemble link mismatch " + r.sourceId);
}
if (kmskaOfficial2.officialParentEvidence.museumInventory !== "208-210" ||
    kmskaOfficial2.officialParentEvidence.priorFrozenDecision !== "REJECT" ||
    kmskaOfficial2.restrictions.doNotMergeAcceptedComponentWithRejectedWhole !== true ||
    kmskaOfficial2.restrictions.productionMutation !== false ||
    master.phase1KmskaVerification.sourceCards !== 89 ||
    master.phase1KmskaVerification.frozenConditionalChoices !== 33 ||
    master.phase1KmskaVerification.exactOfficialPagesVerified !== 89 ||
    master.phase1KmskaVerification.exactOfficialPagesStillPending !== 0 ||
    master.phase1KmskaVerification.museumBackedOfficialVerifiedToDate !== 317 ||
    master.phase1KmskaVerification.museumBackedOfficialStillUnverified !== 162 ||
    master.phase1KmskaVerification.canonical383NewLinks !== 0 ||
    master.phase1KmskaVerification.productionMutation !== false)
  fail("KMSKA master canonical/release source-page totals mismatch");
console.log("PASS KMSKA two official accession pages, protected triptych parent and rejected-source distinction.");


const kmskaOfficial89 = load("sacred-art-phase1-kmska-89-official-inventory-report-20261029.v1.json");
const kmska89Counts = kmskaOfficial89.counts;
if (kmskaOfficial89.rows.length !== 89 || kmska89Counts.sourceCards !== 89 ||
    kmska89Counts.verifiedExact !== 89 ||
    kmska89Counts.resolvedNeedsReview !== 0 ||
    kmska89Counts.fetchFailures !== 0 ||
    kmska89Counts.authorMetadataLeads !== 0 ||
    kmska89Counts.originalConditionalDecisionsPreserved !== 33 ||
    kmska89Counts.newCanonical383Links !== 0 ||
    kmska89Counts.certifiedNewPaintings !== 0 ||
    kmska89Counts.certifiedImages !== 0 ||
    kmska89Counts.productionImports !== 0)
  fail("official KMSKA 89 complete count/release gates mismatch");
const officialKmskaIDs = new Set();
for(const record of kmskaOfficial89.rows){
  const frozen=verifiedKmskaById.get(record.sourceId);
  if(!frozen || officialKmskaIDs.has(record.sourceId) ||
    record.accession !== frozen.inventoryNumberExactString ||
    record.batch !== frozen.batch ||
    record.userChoice !== frozen.originalUserDecision ||
    record.reviewedTitle !== frozen.originalReviewedTitle ||
    record.reviewedArtist !== frozen.originalReviewedArtist ||
    record.legacyId !== frozen.legacyKmskaId ||
    record.requestedUrl !== "https://kmska.be/nl/meesterwerk/" + encodeURIComponent(record.accession) ||
    record.status !== "EXACT_OFFICIAL_INVENTORY_AND_TITLE" ||
    record.flags.length !== 0 ||
    record.evidence.status !== 200 || record.evidence.officialHost !== true ||
    record.evidence.inventoryTextMatches !== true ||
    record.evidence.titleMatches !== true ||
    record.evidence.artistMentioned !== true ||
    !/^[a-f0-9]{64}$/.test(record.evidence.contentSha256) ||
    record.canonical383Match !== false || record.uniquePhysicalWorkCertified !== false ||
    record.photoRightsCertified !== false || record.photoVisualCertified !== false ||
    record.productionMutation !== false)
    fail("official KMSKA 89 record identity or release gate mismatch "+record.sourceId);
  officialKmskaIDs.add(record.sourceId);
}
if (officialKmskaIDs.size !== 89 ||
    kmskaOfficial89.gates.originalChoicesModified !== false ||
    kmskaOfficial89.gates.canonicalMaster383Mutated !== false ||
    kmskaOfficial89.gates.photoRightsApproved !== false ||
    kmskaOfficial89.gates.imagesVisuallyInspected !== false ||
    kmskaOfficial89.gates.productionMutation !== false)
  fail("official KMSKA 89 release guard changed");
const kmskaSpecial = load("sacred-art-phase1-kmska-physical-special-cases-20261029.v1.json");
if(kmskaSpecial.records.length !== 4 ||
   kmskaSpecial.counts.verifiedSourceIdentities !== 4 ||
   kmskaSpecial.counts.distinctCossiersPaintings !== 2 ||
   kmskaSpecial.counts.acceptedTriptychComponents !== 2 ||
   kmskaSpecial.counts.newCanonical383Links !== 0 ||
   kmskaSpecial.counts.sourcePhotoCertified !== 0 ||
   kmskaSpecial.counts.userDecisionsMutated !== 0 ||
   kmskaSpecial.counts.productionImports !== 0)
 fail("KMSKA independent ensemble and distinct Cossiers works changed");
for (const r of kmskaSpecial.records) {
 const old=verifiedKmskaById.get(r.sourceId);
 if(!old || old.originalUserDecision!==r.legacyReviewChoice ||
   old.inventoryNumberExactString!==r.originalAccession ||
   old.originalReviewedTitle!==r.originalReviewedTitle ||
   r.releaseGate!=="RESEARCH_ONLY_NO_IMAGE_CERTIFICATION")
  fail("KMSKA physical special-case changed review choice "+r.sourceId);
}
if(master.phase1KmskaVerification.officialInventoryAndTitleMatches !== 89 ||
   master.phase1KmskaVerification.exactOfficialPagesVerified !== 89 ||
   master.phase1KmskaVerification.exactOfficialPagesStillPending !== 0 ||
   master.phase1KmskaVerification.museumBackedOfficialVerifiedToDate !== 317 ||
   master.phase1KmskaVerification.museumBackedOfficialStillUnverified !== 162 ||
   master.phase1KmskaVerification.canonical383NewLinks !== 0 ||
   master.phase1KmskaVerification.productionMutation !== false)
 fail("KMSKA official 89 verification master summary mismatch");
console.log("PASS KMSKA 89 official exact inventory/title matches, 4 special physical evidence cases, zero releases.");

console.log("PASS Sacred Art Phase 1: " + records.length + " reviewed; " + expected.acceptedOrConditional + " accepted/conditional; " + counts.REJECT + " rejected; no production mutations.");
