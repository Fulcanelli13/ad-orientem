// Exact, repeatable source-owner audit; no historical data is rewritten.
// Source files existing in the repository are NOT certificates for editions,
// translation identity, reader visibility, copyright, or printed facsimiles.
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";
import {PRAYER_DOOR_ORDER_V1,PRAYER_PRIMARY_DOOR_V1} from "../src/pray/prayer-design-pilot.js";

const read=relative=>JSON.parse(readFileSync(new URL(relative,import.meta.url),"utf8"));
const audit=read("../data/pray/prayer-ultra-master-97-source-owner-reconciliation-20261105.v1.json");
const master=read("../data/pray/prayer-corpus-editorial-acquisition-master.v1.json");
const b22=read("../data/pray/prayer-corpus-release-crosswalk-b22.v1.json");
const b31=read("../data/pray/prayer-corpus-current-release-overlay-b31.v1.json");
const triage=read("../data/pray/prayer-source-scope-triage-30-20261103.v1.json");
const printProof=read("../data/pray/original-print-72-body-visual-proof-20261029.v1.json");
const root=fileURLToPath(new URL("../",import.meta.url));
const statuses=new Set(Object.keys(b31.summary.byStatus));
const count=(rows,key)=>Object.fromEntries([...new Set(rows.map(x=>x[key]))].sort().map(x=>[
 x,rows.filter(y=>y[key]===x).length
]));
assert.equal(audit.schema,"ao.pray.ultra-master-97-source-owner-reconciliation.v1");
assert.match(audit.auditedMainCommit,/^[a-f0-9]{40}$/);
assert.equal(audit.scope,"APPEND_ONLY_CURRENT_REPOSITORY_OWNER_IDENTITY_CHECK_NOT_NEW_TEXT_COLLATION_OR_PUBLIC_BROWSER_CERTIFICATION");
assert.equal(audit.summary.acquisitionRows,97);
assert.deepEqual(audit.records.map(x=>x.acquisitionId),master.records.map(x=>x.id),"Frozen 97-record acquisition sequence changed");
assert.deepEqual(b22.records.map(x=>x.id),master.records.map(x=>x.id),"B22 sequence diverged");
assert.deepEqual(b31.records.map(x=>x.id),master.records.map(x=>x.id),"B31 sequence diverged");
assert.equal(new Set(audit.records.map(x=>x.acquisitionId)).size,97);
assert.deepEqual(audit.summary.byHistoricalB31Disposition,b31.summary.byStatus);
for(const key of ["b31Disposition","acquisitionDecision","originalPriority","sourceFamily","ownerReferenceEvidence"]){
 const summary={b31Disposition:"byHistoricalB31Disposition",acquisitionDecision:"byAcquisitionDecision",
  originalPriority:"byPriority",sourceFamily:"bySourceFamily",ownerReferenceEvidence:"byOwnerEvidence"}[key];
 assert.deepEqual(audit.summary[summary],count(audit.records,key),"Summary derived from wrong rows: "+key);
}
const evidenceTypes=new Set(["EXPLICIT_REPO_FILE_PATH","NARRATIVE_OWNER_REFERENCE_ONLY","NO_EXPLICIT_OWNER_REFERENCE"]);
for(let i=0;i<97;i++){
 const row=audit.records[i],orig=master.records[i],prev=b31.records[i],b=b22.records[i];
 assert.equal(row.title,orig.title);
 assert.equal(row.title,prev.title);
 assert.equal(row.originalPriority,orig.priority);
 assert.equal(row.acquisitionDecision,orig.decision);
 assert.equal(row.originallyTargetedModule,orig.target_module);
 assert.equal(row.sourceFamily,orig.source_family);
 assert.equal(row.historicalSourceUrl,orig.source_url);
 assert.equal(row.originalMasterOwnerHint,orig.existing_owner??null);
 assert.equal(row.originalMasterTextImported,orig.text_imported===true);
 assert.equal(row.originalMasterUserApproved,orig.approved_by_user===true);
 assert.equal(row.b22Assessment,b.currentAssessment);
 assert.equal(row.b31Disposition,prev.currentStatus);
 assert.equal(row.b31OwnerReference,prev.currentOwner??null);
 assert.equal(row.b31SourceScopeNotice,prev.sourceLimit);
 assert.equal(row.b31ExactHistoricalTextPublicationScope,prev.exactOriginalTextPublicationStatus??null);
 assert.equal(row.b31ReleasedPr,prev.release?.mergedPr??null);
 assert.equal(row.b31SourcePhotoCollationClaimed,prev.originalPhotoCollationClaimed===true);
 assert.ok(statuses.has(row.b31Disposition)&&row.followUpGate,"Row lacks a preservation-safe classification: "+row.acquisitionId);
 assert.ok(evidenceTypes.has(row.ownerReferenceEvidence));
 assert.equal(row.autoPublishAuthorized,false,"Owner evidence alone must never publish a historical text");
 for(const field of ["originalPrintedEditionCertificateFromThisAudit","bilingualFullTextCertificateFromThisAudit","independentPublicReaderInteractionCertificateFromThisAudit"])
  assert.equal(row[field],"NOT_TESTED","Owner-only reconciliation cannot certify "+field);
 if(row.ownerReferenceEvidence==="EXPLICIT_REPO_FILE_PATH"){
  assert.match(row.b31OwnerReference,/^(src|data|assets)\//);
  assert.equal(row.explicitOwnerPathPresentAtAuditedHead,true);
  assert.ok(existsSync(resolve(root,row.b31OwnerReference)),"Owner file is absent: "+row.b31OwnerReference);
 }else{
  assert.equal(row.explicitOwnerPathPresentAtAuditedHead,null);
  if(row.ownerReferenceEvidence==="NO_EXPLICIT_OWNER_REFERENCE")assert.equal(row.b31OwnerReference,null);
  else assert.ok(row.b31OwnerReference&&!row.b31OwnerReference.startsWith("src/"));
 }
}
assert.equal(audit.summary.explicitSourceFileReferencesPresentAtAuditedHead,10);
assert.equal(audit.summary.ownerLabelsNotPromotedToExactTextProof,36);
assert.equal(audit.summary.noRecordedOwnerReference,51);
assert.equal(audit.summary.publishedScopeRowsInB31,10);
assert.equal(audit.summary.existingOwnersNotExactlyCertified,25);
assert.deepEqual(audit.summary.p0SourceOrVariantHolds,["AO-AQ-047","AO-AQ-078"]);
const short=audit.records.find(x=>x.acquisitionId==="AO-AQ-047");
assert.equal(short.b31Disposition,"HOLD_VARIANT_CONFLICT");
assert.equal(short.b31ExactHistoricalTextPublicationScope,"HELD_SHORT_FORM");
assert.equal(short.b31ReleasedPr,null);
assert.equal(short.ownerReferenceEvidence,"EXPLICIT_REPO_FILE_PATH");
assert.match(short.followUpGate,/DISTINGUISH_SHORT_1857/);
const lasance=audit.records.find(x=>x.acquisitionId==="AO-AQ-078");
assert.equal(lasance.b31Disposition,"HOLD_SOURCE_OR_RIGHTS");
assert.equal(lasance.b31OwnerReference,null);
assert.deepEqual(audit.queuePolicy.FILE_OWNER_BUT_HELD,["AO-AQ-047"]);
assert.equal(audit.queuePolicy.ORIGINAL_OWNER_NOT_EXACT_EDITION.length,25);
assert.equal(audit.queuePolicy.EXACT_TEXT_NOT_IMPORTED.length,21);
assert.equal(audit.queuePolicy.SOURCE_OR_VARIANT_HOLDS.length,13);
assert.equal(audit.queuePolicy.OTHER_MODULE_ROUTES_TO_CONFIRM.length,5);
assert.equal(audit.queuePolicy.EDITORIAL_DEFERRALS.length,19);
assert.equal(audit.queuePolicy.EXCLUDED_DO_NOT_IMPORT.length,4);
assert.equal(Object.keys(PRAY_CANONICAL_DATA_V435930.prayers).length,48);
assert.equal(NOVENA_CORPUS_V4_IDS.length,16);
assert.equal(Object.keys(PRAYER_DOOR_ORDER_V1).length,9);
const routeEntries=Object.entries(PRAYER_DOOR_ORDER_V1).flatMap(([door,ids])=>ids.map(id=>({door,id})));
assert.equal(routeEntries.length,39);
assert.equal(new Set(routeEntries.map(r=>r.id)).size,39);
assert.ok(routeEntries.every(({door,id})=>PRAYER_PRIMARY_DOOR_V1[id]===door));
assert.equal(audit.laterEvidenceNotToConflate.canonicalSourceScopeOnly.scopeAnchorsChecked,triage.summary.publicSourceScopeAnchorChecks);
assert.equal(triage.summary.publicSourceScopeAnchorChecks,30);
assert.equal(triage.summary.fullOriginalPrintCertificates,0);
assert.equal(audit.laterEvidenceNotToConflate.originalNovenaPrintedProperDayBodies.visuallyWordSequenceChecked,printProof.counts.fullPrintedBodyWordSequenceChecked);
assert.equal(printProof.counts.fullPrintedBodyWordSequenceChecked,72);
assert.equal(printProof.counts.firstEditionWordForWordCertificate,0);
assert.equal(printProof.counts.completeProgrammeDevotionalPrintCertificates,0);
assert.equal(audit.laterEvidenceNotToConflate.originalNovenaPrintedProperDayBodies.not97AcquisitionCandidates,true);
assert.equal(audit.summary.exactOriginalPrintedEditionCertificatesAwardedByThisAudit,0);
assert.equal(audit.summary.fullThreeLanguageTextCertificatesAwardedByThisAudit,0);
assert.equal(audit.summary.newPrayersImported,0);
assert.equal(audit.summary.newPublicReaderRoutesAdded,0);
assert.equal(audit.summary.uniqueGlobalPublishedPrayers,"NOT_ESTABLISHED_FROM_OVERLAPPING_ACQUISITION_AND_PUBLISHED_LANES");
console.log("Prayer Ultra Master PASS: 97/97 frozen acquisition IDs, 10 existing file owners, 36 narrative owner references, 51 unmapped; B31 dispositions unchanged; 48/16/39 separate from 72 novena day print proofs; two P0 source holds remain, no new text certification.");


// Subsequent owner-code reconciliation is additive; 29 October B31 dispositions remain frozen.
const followUp=audit.subsequentOwnerCodeReview20261105;
assert.equal(followUp.reviewedExistingOwnerRows,25);
assert.equal(followUp.noHistoricB31DispositionChanged,true);
assert.equal(followUp.newEditionCertificates,0);
assert.equal(followUp.newPublicationAuthorized,0);
const reviewed=audit.records.filter(x=>x.ownerCodeReview20261105);
assert.deepEqual(reviewed.map(x=>x.acquisitionId).sort(),audit.queuePolicy.ORIGINAL_OWNER_NOT_EXACT_EDITION.slice().sort());
assert.deepEqual(Object.fromEntries([...new Set(reviewed.map(x=>x.ownerCodeReview20261105.coverage))].sort().map(k=>[k,reviewed.filter(x=>x.ownerCodeReview20261105.coverage===k).length])),followUp.coverageCounts);
for(const row of reviewed){
 const r=row.ownerCodeReview20261105;
 assert.equal(row.b31Disposition,"OWNED_NOT_EXACTLY_CERTIFIED");
 assert.ok(r.sourceAnchors.length>0&&r.finding&&r.evidenceScope.includes("STATIC"));
 for(const key of ["exactCandidateTextCertified","originalPrintWitnessCertified","threeLanguageWitnessCertified","independentBrowserInteractionCertified","authorizesPublication"])
  assert.equal(r[key],false,"Static code review must not issue a certificate: "+row.acquisitionId+" "+key);
 for(const {path,needle} of r.sourceAnchors){
  assert.ok(path.startsWith("src/pray/")&&!path.includes(".."),"Invalid owner path: "+path);
  assert.ok(existsSync(resolve(root,path)),"Missing owner code file: "+path);
  assert.ok(readFileSync(resolve(root,path),"utf8").includes(needle),"Code anchor disappeared: "+row.acquisitionId+" "+path+" "+needle);
 }
}
console.log("Prayer owner-code review PASS: 25/25 static code owner assessments; "+JSON.stringify(followUp.coverageCounts)+"; no original-print, translation, UI or release certification.");


// Post-B31 21 intent-only + 5 other-module static disposition (fail closed).
const intentModuleReview=audit.subsequentIntentAndModuleReview20261105;
assert.equal(intentModuleReview.reviewedIntentOnlyRows,21);
assert.equal(intentModuleReview.reviewedOtherModuleRows,5);
assert.equal(intentModuleReview.freezeHistoricalB31,true);
assert.deepEqual(intentModuleReview.unresolvedOfficeTargetIds,["AO-AQ-055","AO-AQ-058"]);
assert.deepEqual(intentModuleReview.distinctProgrammeGapIds,["AO-AQ-068","AO-AQ-069","AO-AQ-073","AO-AQ-075"]);
const imRows=audit.records.filter(x=>x.intentAndModuleCodeReview20261105);
assert.equal(imRows.length,26);
assert.deepEqual(imRows.filter(x=>x.b31Disposition==="INTENT_ONLY_NOT_TEXT").map(x=>x.acquisitionId).sort(),audit.queuePolicy.EXACT_TEXT_NOT_IMPORTED.slice().sort());
assert.deepEqual(imRows.filter(x=>x.b31Disposition==="ROUTED_OTHER_MODULE").map(x=>x.acquisitionId).sort(),audit.queuePolicy.OTHER_MODULE_ROUTES_TO_CONFIRM.slice().sort());
assert.deepEqual(Object.fromEntries([...new Set(imRows.map(x=>x.intentAndModuleCodeReview20261105.coverage))].sort().map(k=>[k,imRows.filter(x=>x.intentAndModuleCodeReview20261105.coverage===k).length])),intentModuleReview.coverageCounts);
let imAnchors=0;
for(const row of imRows){
 const e=row.intentAndModuleCodeReview20261105;
 assert.match(e.evidenceScope,/STATIC_REPO/);
 assert.ok(e.finding);
 for(const key of ["exactHistoricalWorkImported","originalPrintTextCertified","threeLanguageTextCertified","publicReaderInteractionCertified","newPublicRouteAuthorized","autoPublishAuthorized"])
  assert.equal(e[key],false,"Uncertified intent/module record cannot be auto-admitted: "+row.acquisitionId);
 if(e.coverage==="OFFICE_TARGET_NOT_IMPLEMENTATION_CERTIFIED"){
  assert.deepEqual(e.sourceAnchors,[],"Unknown Office owner must not gain invented code evidence");
 }else assert.ok(e.sourceAnchors.length,"Non-Office review must reference real code: "+row.acquisitionId);
 for(const {path,needle} of e.sourceAnchors){
  assert.ok(path.startsWith("src/")&&!path.includes(".."),"Invalid source path: "+path);
  assert.ok(existsSync(resolve(root,path)),"Intent/module code owner absent: "+path);
  assert.ok(readFileSync(resolve(root,path),"utf8").includes(needle),"Intent/module source anchor changed: "+row.acquisitionId+" "+needle);
  imAnchors++;
 }
}
assert.equal(imAnchors,intentModuleReview.ownerCodeAnchorsChecked);
for(const k of ["originalPrintCertificatesAwarded","languageCertificatesAwarded","readerInteractionCertificatesAwarded","newPublicRoutesAuthorized"])assert.equal(intentModuleReview[k],0);
assert.equal(intentModuleReview.novenaOrLitanyAdmissionAuthorized,false);
console.log("Prayer 21+5 source routing PASS: 26 row review, "+imAnchors+" source anchors, historical holds retained; 4 distinct programmes and 2 Office targets remain unverified.");
