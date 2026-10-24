import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
const load=p=>JSON.parse(readFileSync(p,'utf8'));
const root='artifacts/pius-x-study-expanded/';
const p34=load(root+'SPX_P34_Italian_EN_FR_100_Claim_Review.json');
const p39=load('previews/pius-x-study/evidence/pius-x-p39-bilingual29-and-specialist36-20261024.v1.json');
const p40=load('previews/pius-x-study/evidence/pius-x-p40-65-answer-second-pass-20261024.v1.json');
const dossier=load(root+'SPX_P41_39_Italian_English_French_Specialist_Dossier.json');
assert.equal(dossier.schema,'AO_SPX_P41_SPECIALIST_READY_39_FULL_ITALIAN_EN_FR_COMPARISONS_V1');
assert.equal(dossier.status,'39_DOCUMENTARY_COMPARISONS_PREPARED_FOR_HUMAN_REVIEW_NOT_APPROVED');
const c=dossier.counts;
assert.deepEqual([c.candidateCorrections,c.fromP39,c.newFromP40,c.otherSpecialistQueue,c.earlierP35Holds,c.earlierP37SecondPass,c.sourceHeadingBoundariesProtected,c.approvedEnglish,c.approvedFrench,c.approvedItalian,c.approvedDoctrinal,c.published],[39,29,10,26,24,11,8,0,0,0,0,0]);
assert.equal(dossier.records.length,39);
const originals=new Map(p34.records.map(r=>[r.sourceQid,r]));
const p39byid=new Map(p39.corrections.map(r=>[r.sourceQid,r]));
const p40first=new Map(p40.p39SecondPass29.map(r=>[r.sourceQid,r]));
const p40new=new Map(p40.newlyFlaggedFromPreviouslyAligned36.map(r=>[r.sourceQid,r]));
const seen=new Set();
let countItalian=0,sectionsTrimmed=0;
for(const r of dossier.records){
 assert(!seen.has(r.sourceQid));seen.add(r.sourceQid);
 const original=originals.get(r.sourceQid);
 assert(original&&r.sourceUrl===original.sourceUrl);
 assert.equal(r.originalDraftEN,original.enDraft);
 assert.equal(r.originalDraftFR,original.frDraft);
 assert.deepEqual(r.italianWitnesses.map(w=>w.sourceQid),original.italianSourceWitnesses.map(w=>w.qid));
 assert.equal(r.italianWitnesses.length,original.italianSourceWitnesses.length);
 for(let i=0;i<r.italianWitnesses.length;i++){
  const w=r.italianWitnesses[i],source=original.italianSourceWitnesses[i];
  assert.equal(w.rawItalianAnswerVerbatim,source.italianAnswer);
  assert.equal(w.italianQuestionVerbatim,source.italianQuestion);
  assert.equal(w.existingAnswerFingerprintSha256,source.originalAnswerSha256);
  assert(w.safeItalianAnswerForDisplay.length>12);
  assert(w.rawItalianAnswerVerbatim.startsWith(w.safeItalianAnswerForDisplay));
  if(w.trailingSectionHeadingInDigitalExtraction){
    sectionsTrimmed++;
    assert(w.rawItalianAnswerVerbatim.length>w.safeItalianAnswerForDisplay.length);
    assert(!/(?:§\s*\d)|(?:\bCAPO\s+[IVX]+\b)/i.test(w.safeItalianAnswerForDisplay));
  }
  countItalian++;
 }
 const old=p39byid.get(r.sourceQid);
 const newer=p40new.get(r.sourceQid);
 const pass=p40first.get(r.sourceQid);
 assert(Boolean(old)!==Boolean(newer));
 assert(!r.publicationApproved&&!r.italianSemanticApproval&&!r.englishProfessionalApproval&&!r.frenchProfessionalApproval&&!r.theologicalApproval&&!r.papalVoiceApproval);
 assert(!r.printFacsimileCollated&&!r.userVisiblePapalQuotationAllowed);
 if(old){assert(pass);assert.equal(r.p41RecommendedReviewCandidateEN,pass.finalResearchCandidateEN);assert.equal(r.p41RecommendedReviewCandidateFR,pass.finalResearchCandidateFR);}
 else{assert.equal(r.p41RecommendedReviewCandidateEN,newer.finalResearchCandidateEN);assert.equal(r.p41RecommendedReviewCandidateFR,newer.finalResearchCandidateFR);}
}
assert.equal(seen.size,39);
assert(dossier.records.find(x=>x.sourceQid==='PX1905-Q611').reviewerLane==='TECHNICAL_SACRAMENTAL_THEOLOGY');
assert(dossier.records.find(x=>x.sourceQid==='PX1905-Q657').reviewerLane==='TECHNICAL_SACRAMENTAL_THEOLOGY');
assert.equal(sectionsTrimmed,5,'Five section-heading contaminated answers among 39 corrections');
const other=new Set([...dossier.segregatedExistingQueues.aligned26,...dossier.segregatedExistingQueues.earlierP35Holds24,...dossier.segregatedExistingQueues.earlierP37SecondPass11]);
assert.equal(other.size,61);
assert([...other].every(x=>!seen.has(x)));
const file=resolve(root+'SPX_P41_39_Specialist_Italian_EN_FR_Review.html');
const browser=await chromium.launch({headless:true});
const pageErrors=[],network=[];
for(const width of [1280,390]){
 const context=await browser.newContext({viewport:{width,height:850}});
 const page=await context.newPage();
 page.on('pageerror',e=>pageErrors.push(String(e)));
 page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url())});
 await page.goto(pathToFileURL(file).href);
 assert.equal(await page.locator('article').count(),39);
 assert.equal(await page.locator('article:visible').count(),39);
 await page.locator('#query').fill('PX1905-Q611');
 assert.equal(await page.locator('article:visible').count(),1);
 assert.match(await page.locator('article:visible').innerText(),/without their substance/);
 await page.locator('#query').fill('');
 await page.locator('#lane').selectOption('TECHNICAL_SACRAMENTAL_THEOLOGY');
 assert.equal(await page.locator('article:visible').count(),3);
 await page.locator('#lane').selectOption('');
 await page.locator('#query').fill('PX1905-Q657');
 assert.match(await page.locator('article:visible').innerText(),/concomitance/);
 await context.close();
}
await browser.close();
assert.deepEqual(pageErrors,[]);
assert.deepEqual(network,[]);
console.log('PASS P41_REVIEW_DOSSIER '+JSON.stringify({cases:39,italianWitnesses:countItalian,headingTrimmed:sectionsTrimmed,languageDraftsIntact:true,reviewerLanes:dossier.reviewerLanes,desktopAndMobile:true,networkRequests:0,approvals:0}));
