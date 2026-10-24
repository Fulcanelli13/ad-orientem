/**
 * P1.42 read-only patch plan for the 39 P1.41 candidates.
 * Builds exact owner/turn/old/new mappings and unsigned reviewer decision
 * templates. NEVER edits owner files or creates a release/promotion.
 * Run after P1.41 dossier generation in the existing offline workflow.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const readJson=p=>JSON.parse(readFileSync(p,'utf8'));
const hash=t=>createHash('sha256').update(t,'utf8').digest('hex');
const root='artifacts/pius-x-study-expanded/';
const p41=readJson(root+'SPX_P41_39_Italian_English_French_Specialist_Dossier.json');
const triage=readJson('data/learn/research/pius-x-100answer-editorial-release-triage-20261020.v1.json');
assert.equal(p41.schema,'AO_SPX_P41_SPECIALIST_READY_39_FULL_ITALIAN_EN_FR_COMPARISONS_V1');
assert.equal(p41.records.length,39);
assert.equal(triage.records.length,100);
const triageById=new Map(triage.records.map(r=>[r.id,r]));
assert.equal(triageById.size,100);
const allFilePaths=[...new Set(triage.records.map(r=>r.sourceOwnerPath))].sort();
assert.equal(allFilePaths.length,10);
const fileContents=new Map();
const ownerFamilies=new Map();
for(const path of allFilePaths){
 assert(/^data\/learn\/research\/pius-x-batch(?:9-sacraments|10-eucharist)-[a-e]-20261020\.v1\.json$/.test(path));
 const raw=readFileSync(path,'utf8'),doc=JSON.parse(raw);
 assert.equal(doc.records.length,10);
 fileContents.set(path,{sha256:hash(raw),raw});
 ownerFamilies.set(path,new Map(doc.records.map(r=>[r.source.questionId,r])));
 assert.equal(ownerFamilies.get(path).size,10);
 for(const r of doc.records){
  assert.equal(r.speaker,'EDUCATIONAL_DOCUMENTARY_PARAPHRASE');
  assert(r.turns.length>=2);
  assert.equal(r.turns[0].kind,'opening');
  assert(r.release&&Object.values(r.release).every(v=>v===false));
  assert.equal(r.source.attribution,'PAPALLY_PRESCRIBED_CATECHISM_NOT_AUTHENTICATED_PERSONAL_PAPAL_SPEECH');
 }
}
const makeSignoff=(specialty)=>({
 specialty,decision:'NOT_REVIEWED',reviewerName:null,reviewerAffiliationOrQualification:null,
 attestationDocument:null,reviewDate:null,notes:null,
 originalItalianConsulted:false,sourceQuestionScopeReviewed:false,originalPrintEditionCollated:false
});
const signoffNames=['ORIGINAL_ITALIAN_SOURCE_FIDELITY','ENGLISH_TRANSLATION','FRENCH_TRANSLATION',
 'THEOLOGICAL_HISTORICAL_SCOPE','EDITORIAL_PAPAL_ATTRIBUTION'];
const rows=[],groups={};
for(const item of p41.records){
 const id=item.sourceQid, meta=triageById.get(id);
 assert(meta && item.originalOwnerPath===meta.sourceOwnerPath);
 assert(!meta.published);
 assert(Object.values(meta.approval).every(v=>v==='NOT_SIGNED_OFF'));
 const family=ownerFamilies.get(meta.sourceOwnerPath)?.get(id);
 assert(family,'Missing exact immutable opening owner for '+id);
 const n=id.replace('PX1905-Q','');
 assert.equal(family.id,'SPX-1905-S-'+n);
 assert.equal(meta.turnId,family.id+'-T1');
 assert.equal(family.source.questionId,id);
 assert.equal(family.turns[0].kind,'opening');
 assert(family.turns[0].supports.includes(id));
 const oldEN=family.turns[0].response.en,oldFR=family.turns[0].response.fr;
 assert.equal(oldEN,item.originalDraftEN,'Source-owner English drift: '+id);
 assert.equal(oldFR,item.originalDraftFR,'Source-owner French drift: '+id);
 assert.equal(meta.originalDraftEN,oldEN);
 assert.equal(meta.originalDraftFR,oldFR);
 assert(item.p41RecommendedReviewCandidateEN.trim());
 assert(item.p41RecommendedReviewCandidateFR.trim());
 assert(item.p41RecommendedReviewCandidateEN!==oldEN || item.p41RecommendedReviewCandidateFR!==oldFR);
 assert(item.italianWitnesses.length>=1);
 assert.equal(item.italianWitnesses[0].sourceQid,id);
 const core=item.italianWitnesses[0];
 const row={
  sourceQid:id,turnId:meta.turnId,ownerPath:meta.sourceOwnerPath,
  familyId:family.id,turnOrdinal:0,turnKind:'opening',
  exactSourceQuestionId:family.source.questionId,
  originalAnswerItalian:core.safeItalianAnswerForDisplay,
  originalWitnessFingerprintSha256:core.existingAnswerFingerprintSha256,
  sourceUrl:item.sourceUrl,
  sourceOwnerFileSha256:fileContents.get(meta.sourceOwnerPath).sha256,
  expectedCurrentOpeningSHA256:hash(JSON.stringify(family.turns[0])),
  originalEnglishSHA256:hash(oldEN),originalFrenchSHA256:hash(oldFR),
  originalEN:oldEN,originalFR:oldFR,
  proposedEN:item.p41RecommendedReviewCandidateEN,proposedFR:item.p41RecommendedReviewCandidateFR,
  proposedEnglishSHA256:hash(item.p41RecommendedReviewCandidateEN),
  proposedFrenchSHA256:hash(item.p41RecommendedReviewCandidateFR),
  technicalReviewerLane:item.reviewerLane,
  issueCategory:item.issueCategory,
  sourceFinding:item.editorialIssue,
  scope:'EXACT_OPENING_RESPONSE_FIELDS_ONLY_NO_FOLLOWUP_MODIFICATIONS',
  signoffs:Object.fromEntries(signoffNames.map(k=>[k,makeSignoff(k)])),
  humanSignoffApproved:false,automatedSourceOwnerWriteAllowed:false,
  published:false,canMerge:false
 };
 rows.push(row);
 (groups[meta.sourceOwnerPath]??=[]).push(id);
}
rows.sort((a,b)=>Number(a.sourceQid.split('Q')[1])-Number(b.sourceQid.split('Q')[1]));
assert.equal(rows.length,39);
assert.equal(new Set(rows.map(r=>r.sourceQid)).size,39);
const exclude={otherSpecialistQueue26:p41.segregatedExistingQueues.aligned26,
 oldP35Holds24:p41.segregatedExistingQueues.earlierP35Holds24,
 oldP37Cases11:p41.segregatedExistingQueues.earlierP37SecondPass11};
const partition=new Set([...rows.map(r=>r.sourceQid),...Object.values(exclude).flat()]);
assert.equal(partition.size,100);
const manifest={
 schema:'AO_SPX_P42_EXACT_SOURCE_OWNER_RECONCILIATION_PREVIEW_V1',
 asOf:'2026-10-24',status:'READY_FOR_REVIEW_ONLY_ZERO_SIGNOFFS_NO_WRITES',
 inputs:['P41 39-case source-bound bilingual dossier','Original ten source-owner JSON files','Existing 100-answer original triage'],
 counts:{originalOpenings:100,stagedExactOwnerTurnPairs:39,sourceOwnerFilesCovered:Object.keys(groups).length,
  remainingSpecialistReview:26,previousP35Holds:24,previousP37SecondPass:11,
  signedOffCases:0,sourceOwnerRecordsEdited:0,existingP6_423Changed:0,published:0},
 files:Object.fromEntries(Object.entries(groups).sort(([a],[b])=>a.localeCompare(b)).map(([p,ids])=>[p,{
  unmodifiedFileSHA256:fileContents.get(p).sha256,
  candidateOpeningQuestionIds:ids.sort()
 }])),
 records:rows,
 excludedQueues:exclude,
 safeguards:{
  noAutomaticApplication:true,
  allCandidateSignoffsBlank:true,
  failClosedOnOwnerSHAChange:true,
  noSourceOwnerFilesWritten:true,
  noProductionOrPersonalPapalVoicePublication:true,
  printedEditionCollationNotDone:true,
  requiresIndependentExpertReview:true,
  originalSourceOwnerIsSourceOfTruth:true
 },
 laterHumanWorkflow:'Only after qualified reviewers record verifiable external decisions and source owners independently validate the evidence, reconcile accepted changes via a separately reviewed PR. This tool never writes source owners even when a decision ledger is modified.'
};
mkdirSync(root,{recursive:true});
const out=root+'SPX_P42_39_Exact_Owner_Reconciliation_Preview.json';
writeFileSync(out,JSON.stringify(manifest,null,2)+'\n');
const ledger={
 schema:'AO_SPX_P42_HUMAN_REVIEW_DECISION_TEMPLATE_V1',
 status:'ALL_PENDING_NO_SIGNOFFS',
 instructions:[
  'This blank ledger is a reviewer handoff, not evidence of completed independent review.',
  'Human reviewer must consult Italian source witness, separate EN/FR drafts, and assess doctrinal scope independently.',
  'A modified ledger alone never authorizes publication, mass text edits or automated source-owner application.',
  'Do not edit the original 423 dialogue corpus or rewrite source IDs.'
 ],
 cases:rows.map(r=>({
  sourceQid:r.sourceQid,ownerPath:r.ownerPath,expectedCurrentOpeningSHA256:r.expectedCurrentOpeningSHA256,
  proposedEnglishSHA256:r.proposedEnglishSHA256,proposedFrenchSHA256:r.proposedFrenchSHA256,
  requiredHumanReviews:r.signoffs,decision:'PENDING',changeApproved:false,publicationApproved:false
 }))
};
writeFileSync(root+'SPX_P42_39_Blank_Human_Review_Decisions.json',JSON.stringify(ledger,null,2)+'\n');
console.log('PASS P42_OWNER_PREVIEW '+JSON.stringify({path:out,reviewLedger:root+'SPX_P42_39_Blank_Human_Review_Decisions.json',
 counts:manifest.counts,files:Object.keys(manifest.files)}));
