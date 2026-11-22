/**
 * P1.41: Assemble a single specialist-review dossier from existing P34/P39/P40
 * source witnesses. No authored answer is changed, certified or promoted.
 * Intended to run AFTER the existing P34 evidence generation in review CI.
 */
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(p,'utf8'));
const base='artifacts/pius-x-study-expanded/';
const evidence='previews/pius-x-study/evidence/';
const p34=load(base+'SPX_P34_Italian_EN_FR_100_Claim_Review.json');
const p39=load(evidence+'pius-x-p39-bilingual29-and-specialist36-20261024.v1.json');
const p40=load(evidence+'pius-x-p40-65-answer-second-pass-20261024.v1.json');
const owner=load('data/learn/research/pius-x-100answer-editorial-release-triage-20261020.v1.json');
assert.equal(p34.records.length,100);
assert.equal(owner.records.length,100);
const originals=new Map(p34.records.map(r=>[r.sourceQid,r]));
const owners=new Map(owner.records.map(r=>[r.id,r]));
const old=new Map(p39.corrections.map(r=>[r.sourceQid,r]));
const second=new Map(p40.p39SecondPass29.map(r=>[r.sourceQid,r]));
const newly=new Map(p40.newlyFlaggedFromPreviouslyAligned36.map(r=>[r.sourceQid,r]));
assert.equal(originals.size,100);
assert.equal(owners.size,100);
assert.equal(old.size,29); assert.equal(second.size,29); assert.equal(newly.size,10);
const specialTheology=new Set(['PX1905-Q611','PX1905-Q613','PX1905-Q657']);
const historicalDiscipline=new Set(['PX1905-Q574','PX1905-Q577','PX1905-Q584','PX1905-Q594']);
const headings=new Set(p39.sourceHeadingBoundaryPolicy.eightBoundaryQuestionIds);
assert.equal(headings.size,8);
const headingRe=/(?:§\s*\d)|(?:\bCAPO\s+[IVX]+\b)/i;
const displayAnswer=(raw,flag)=>{
 const text=String(raw||'').trim();
 if(!flag)return text;
 const match=headingRe.exec(text);
 assert(match,'Expected explicit source-section furniture in marked Italian witness');
 assert(match.index>15,'Heading boundary occurs at an impossible location');
 return text.slice(0,match.index).trim();
};
function assemble(id,candidateEN,candidateFR,secondPassFinding,origin,issueCategory){
 const original=originals.get(id),o=owners.get(id);
 assert(original&&o,'Unknown original source owner '+id);
 assert.equal(original.sourceQid,id);
 assert.equal(original.enDraft,o.originalDraftEN);
 assert.equal(original.frDraft,o.originalDraftFR);
 assert.equal(original.publicationApproved,false);
 assert(o.approval && Object.values(o.approval).every(v=>v==='NOT_SIGNED_OFF'));
 const witnesses=original.italianSourceWitnesses.map((w,i)=>({
  sourceQid:w.qid,role:i===0?'PRIMARY_1905_ITALIAN_WITNESS':'ADDITIONAL_CROSS_QUESTION_ITALIAN_WITNESS',
  italianQuestionVerbatim:w.italianQuestion,
  rawItalianAnswerVerbatim:w.italianAnswer,
  safeItalianAnswerForDisplay:displayAnswer(w.italianAnswer,headings.has(w.qid)),
  trailingSectionHeadingInDigitalExtraction:headings.has(w.qid),
  existingAnswerFingerprintSha256:w.originalAnswerSha256
 }));
 assert.equal(witnesses[0].sourceQid,id);
 const reviewerLane=specialTheology.has(id)?'TECHNICAL_SACRAMENTAL_THEOLOGY':
  historicalDiscipline.has(id)?'HISTORICAL_DISCIPLINE_AND_PERIOD_REGISTER':
  'BILINGUAL_SOURCE_FIDELITY';
 const previous=old.get(id);
 return {
  sourceQid:id, originalOwnerPath:o.sourceOwnerPath,sourceClass:o.sourceClass,
  sourceUrl:original.sourceUrl,reviewerLane,originalTriageLane:o.lane,
  originalTriageReasons:o.reviewReasons,originalQuestionEN:o.questionEN,originalQuestionFR:o.questionFR,
  italianWitnesses:witnesses,
  originalDraftEN:o.originalDraftEN,originalDraftFR:o.originalDraftFR,
  p39InitialProposalEN:previous?.proposedEN||null,
  p39InitialProposalFR:previous?.proposedFR||null,
  p41RecommendedReviewCandidateEN:candidateEN,
  p41RecommendedReviewCandidateFR:candidateFR,
  editorialIssue:secondPassFinding,issueCategory,provenanceTrack:origin,
  specialistChecks:[
   'Verify every asserted proposition against the attached original Italian answer(s), including conditions and omitted clauses',
   'Check English and French independently, especially modal obligation and technical sacramental vocabulary',
   'Keep historical ecclesiastical discipline distinct from a present-day ruling',
   'Exclude transcription headings and do not attribute Catechism text as a personal papal utterance'
  ],
  userVisiblePapalQuotationAllowed:false,printFacsimileCollated:false,
  italianSemanticApproval:false,englishProfessionalApproval:false,
  frenchProfessionalApproval:false,theologicalApproval:false,
  papalVoiceApproval:false,publicationApproved:false
 };
}
const records=[];
for(const item of p40.p39SecondPass29){
 const id=item.sourceQid;
 const sourceReview=old.get(id);
 assert(sourceReview);
 records.push(assemble(id,item.finalResearchCandidateEN,item.finalResearchCandidateFR,
  item.secondPassDisposition==='REFINEMENT_REQUIRED'?item.reason:sourceReview.sourceReviewFinding,
  'P39_29_WITH_P40_SECOND_PASS',sourceReview.sourceReviewClass));
}
for(const item of p40.newlyFlaggedFromPreviouslyAligned36){
 const id=item.sourceQid;
 assert(!old.has(id));
 records.push(assemble(id,item.finalResearchCandidateEN,item.finalResearchCandidateFR,
  item.secondPassFinding,'P40_10_NEWLY_FLAGGED',item.secondPassClassification));
}
records.sort((a,b)=>Number(a.sourceQid.split('Q')[1])-Number(b.sourceQid.split('Q')[1]));
assert.equal(records.length,39);
assert.equal(new Set(records.map(r=>r.sourceQid)).size,39);
assert.equal(records.filter(r=>r.provenanceTrack==='P39_29_WITH_P40_SECOND_PASS').length,29);
assert.equal(records.filter(r=>r.provenanceTrack==='P40_10_NEWLY_FLAGGED').length,10);
const lanes={};
for(const r of records)lanes[r.reviewerLane]=(lanes[r.reviewerLane]||0)+1;
const noCorrection=new Set(p40.alignedStillAwaitingSpecialistReview26.map(r=>r.sourceQid));
const older=new Set(p40.prior24P35HoldsStillSeparate.map(r=>r.sourceQid));
const earlier=new Set(p40.prior11P37SecondPassStillSeparate);
const all=new Set([...records.map(r=>r.sourceQid),...noCorrection,...older,...earlier]);
assert.equal(noCorrection.size,26);assert.equal(older.size,24);assert.equal(earlier.size,11);
assert.equal(all.size,100,'Cohort must partition all 100 unique owner questions');
for(const r of records)assert(!noCorrection.has(r.sourceQid)&&!older.has(r.sourceQid)&&!earlier.has(r.sourceQid));
const sourceHeadingsFound=[...headings].filter(id=>originals.get(id).italianSourceWitnesses.some(w=>w.qid===id&&headingRe.test(w.italianAnswer)));
assert.equal(sourceHeadingsFound.length,8,'All eight flagged raw heading boundaries must be present');
const report={
 schema:'AO_SPX_P41_SPECIALIST_READY_39_FULL_ITALIAN_EN_FR_COMPARISONS_V1',
 asOf:'2026-10-24',status:'39_DOCUMENTARY_COMPARISONS_PREPARED_FOR_HUMAN_REVIEW_NOT_APPROVED',
 provenance:{
  italianWitnessOwner:'P33 via P34 1905 Museo San Pio X digital Q&A',
  italianNotPrintFacsimile:true,
  originalEnglishFrenchOwner:'PR1458 P1 100-answer editorial originals',
  proposedCandidateOwners:'P39 29 proposals, refined in P40; P40 10 new concern proposals',
  printed1905NumbersNotAsserted:true,
  papalPrescribedCatechismNotPersonalAutograph:true
 },
 counts:{candidateCorrections:39,fromP39:29,newFromP40:10,otherSpecialistQueue:26,
  earlierP35Holds:24,earlierP37SecondPass:11,sourceHeadingBoundariesProtected:8,
  approvedEnglish:0,approvedFrench:0,approvedItalian:0,approvedDoctrinal:0,published:0},
 reviewerLanes:lanes,records,
 segregatedExistingQueues:{
  aligned26:[...noCorrection].sort(),
  earlierP35Holds24:[...older].sort(),
  earlierP37SecondPass11:[...earlier].sort()
 },
 releaseGates:{sourceOwnerImmutable:true,existing423DialogsImmutable:true,independentTranslationApproval:false,
  doctrinalApproval:false,periodVoiceApproval:false,printEditionCollation:false,publicationApproved:false}
};
mkdirSync(base,{recursive:true});
const json=base+'SPX_P41_39_Italian_English_French_Specialist_Dossier.json';
writeFileSync(json,JSON.stringify(report,null,2)+'\n');
const esc=t=>String(t??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const rows=records.map(r=>{
 const italian=r.italianWitnesses.map(w=>
  '<section class="witness"><p class="small">Italian source '+esc(w.sourceQid)+(w.trailingSectionHeadingInDigitalExtraction?' · following section heading excluded':'')+'</p>'+
  '<p lang="it"><b>D.</b> '+esc(w.italianQuestionVerbatim)+'</p><p lang="it"><b>R.</b> '+esc(w.safeItalianAnswerForDisplay)+'</p>'+
  (w.trailingSectionHeadingInDigitalExtraction?'<p class="warning">Transcription boundary: original raw witness and checksum preserved in JSON, next section heading not quoted.</p>':'')+'</section>'
 ).join('');
 return '<article id="'+esc(r.sourceQid)+'" data-id="'+esc(r.sourceQid)+'" data-lane="'+esc(r.reviewerLane)+'">'+
  '<header><h2>'+esc(r.sourceQid)+'</h2><span>'+esc(r.reviewerLane.replaceAll('_',' '))+'</span></header>'+
  '<p class="small">Original owner: '+esc(r.originalOwnerPath)+'</p>'+
  '<p class="finding">'+esc(r.editorialIssue)+'</p>'+
  '<h3>Original Italian — digital transcription, not certified printed text</h3>'+italian+
  '<div class="cols"><section><h3>English</h3><p><b>Previous draft</b></p><p lang="en">'+esc(r.originalDraftEN)+'</p>'+
  '<p><b>Proposed revision — not approved</b></p><p lang="en">'+esc(r.p41RecommendedReviewCandidateEN)+'</p></section>'+
  '<section><h3>French</h3><p><b>Previous draft</b></p><p lang="fr">'+esc(r.originalDraftFR)+'</p>'+
  '<p><b>Proposed revision — not approved</b></p><p lang="fr">'+esc(r.p41RecommendedReviewCandidateFR)+'</p></section></div>'+
  '<p class="small"><a href="'+esc(r.sourceUrl)+'">View original Italian transcription</a> · Source numbers are research locators. No expert approval.</p>'+
  '</article>';
}).join('\n');
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<title>Ad Orientem · P1.41 Specialist Review — 39 Italian EN FR</title>'+
 '<style>:root{color-scheme:dark;font-family:Georgia,serif;background:#0b1119;color:#e7e3d8}body{max-width:1100px;margin:auto;padding:24px}header{display:flex;justify-content:space-between;gap:12px;align-items:center}.intro{line-height:1.55;color:#c8c3b8}.toolbar{position:sticky;top:0;background:#0b1119;padding:12px 0;border-bottom:1px solid #45505a;display:flex;gap:10px;flex-wrap:wrap}input,select{background:#17232f;color:#fff;border:1px solid #62707b;border-radius:4px;padding:10px;min-width:180px}article{border-top:1px solid #45505a;padding:18px 0 26px;margin:10px 0}h2{color:#e7cf95}h3{font-size:1rem;color:#e8d5ab}section{line-height:1.5}.witness{border-left:2px solid #8a7758;padding:4px 16px}.cols{display:grid;grid-template-columns:1fr 1fr;gap:18px}.cols section{background:#13202a;padding:16px;border-radius:5px}.finding{color:#eed4a0}.small,.warning{font-size:.86rem;color:#aab0b6}.warning{color:#e9b6a3}a{color:#b9d7e8}button{background:#293946;color:#fff;border:1px solid #566473;padding:10px;border-radius:4px}@media(max-width:650px){body{padding:15px}.cols{grid-template-columns:1fr}}</style></head>'+
 '<body><h1>St Pius X · Source-fidelity specialist dossier</h1>'+
 '<p class="intro">39 research proposals: Italian source Q&A, original English/French drafts and proposed replacements. All remain unapproved. The printed 1905 edition is not collated; this is not St Pius X personal speech. The 26 provisionally aligned answers, 24 earlier holds and 11 P1.37 cases are separate.</p>'+
 '<div class="toolbar"><label>Find question <input id="query" placeholder="e.g. 657, consecration"></label><label>Review specialty <select id="lane"><option value="">All 39</option>'+
 ['BILINGUAL_SOURCE_FIDELITY','HISTORICAL_DISCIPLINE_AND_PERIOD_REGISTER','TECHNICAL_SACRAMENTAL_THEOLOGY'].map(x=>'<option value="'+x+'">'+x.replaceAll('_',' ')+'</option>').join('')+
 '</select></label><span id="count">39 records</span></div><main>'+rows+'</main>'+
 '<script>const q=document.getElementById("query"),lane=document.getElementById("lane"),ct=document.getElementById("count");function filter(){let n=0;for(const a of document.querySelectorAll("article")){const visible=a.textContent.toLowerCase().includes(q.value.toLowerCase())&&(!lane.value||a.dataset.lane===lane.value);a.hidden=!visible;n+=visible?1:0}ct.textContent=n+" records shown"}q.addEventListener("input",filter);lane.addEventListener("change",filter);</script></body></html>';
const htmlPath=base+'SPX_P41_39_Specialist_Italian_EN_FR_Review.html';
writeFileSync(htmlPath,html);
console.log('PASS P41_REVIEW_DOSSIER '+JSON.stringify({json,html:htmlPath,counts:report.counts,reviewerLanes:lanes}));
