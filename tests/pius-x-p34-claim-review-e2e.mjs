import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
const root='artifacts/pius-x-study-expanded/';
const data=JSON.parse(readFileSync(root+'SPX_P34_Italian_EN_FR_100_Claim_Review.json','utf8'));
const html=readFileSync(root+'SPX_P34_Bilingual_Original_Text_Review.html','utf8');
assert.equal(data.schema,'AO_SPX_P34_ITALIAN_EN_FR_CLAIM_REVIEW_PACKET_V1');
assert.equal(data.status,'SOURCE_CLAIM_COMPARISON_PREPARED_BUT_NO_HUMAN_CLAIM_CERTIFICATION');
assert.equal(data.counts.openingCases,100);
assert.equal(data.counts.originalItalianPrimaryAnswers,100);
assert.equal(data.counts.additionalItalianSourceAnswers,9);
assert.equal(data.counts.casesWithMultipleSourceQas,7);
assert.equal(data.counts.italianTranscriptionVariantCases,5);
assert.equal(data.counts.historicalPastoralCases,30);
assert.equal(data.counts.sourceTranslationLaneCases,57);
assert.equal(data.counts.precisionRewriteLaneCases,13);
assert.equal(data.counts.independentlySourceCertifiedClaims,0);
assert.equal(data.counts.certifiedEnglishFrenchTranslations,0);
assert.equal(data.counts.publishedTurns,0);
assert.equal(data.approvals.humanApprovals,0);
assert.equal(data.records.length,100);
const p33=JSON.parse(readFileSync(root+'SPX_P33_OriginalItalian_100_Opening_Audit.json','utf8'));
const raw=new Map(p33.records.map(r=>[r.turnId,r]));
let total=0,multi=0,variants=0,pastoral=0;
for(const r of data.records){
 const original=raw.get(r.turnId);assert(original);
 assert.equal(r.sourceQid,original.sourceQid);
 assert.equal(r.enDraft.length>0,true);assert.equal(r.frDraft.length>0,true);
 assert.equal(r.originalTextDoesNotVerifyTranslatedClaim,true);
 assert.equal(r.publicationApproved,false);
 assert.equal(r.allHumanApprovals,false);
 assert.equal(r.italianSourceWitnesses.length,original.allOriginalSourceQuestionIds.length);
 assert.equal(r.italianSourceWitnesses[0].italianAnswer,original.italianAnswerFromWitness);
 assert.equal(r.italianSourceWitnesses[0].originalAnswerSha256,original.witnessAnswerFingerprintSha256);
 assert(r.clauses.length>0);
 for(const c of r.clauses){
  total++;
  assert.equal(c.sourceClaimAssessment,'NOT_REVIEWED_ITALIAN_PASSAGES_ARE_CANDIDATE_EVIDENCE');
  assert.equal(c.humanSourceApproval,false);
  assert.equal(c.translationApproval,false);
  assert.equal(c.doctrinalApproval,false);
  assert.equal(c.papalVoiceApproval,false);
  assert(c.englishEditorialText||c.frenchEditorialText);
  assert.deepEqual(c.possibleOriginalQuestionIds,r.italianSourceWitnesses.map(w=>w.qid));
 }
 multi+=+(r.italianSourceWitnesses.length>1);
 variants+=+(r.originalSourceQuestionStatus!=='QUESTION_TRANSCRIPTION_NORMALIZED_EXACT');
 pastoral+=+(r.triageLane==='HISTORICAL_PASTORAL_HOLD');
}
assert.equal(total,data.counts.bilingualReviewUnits);
assert.equal(multi,7);assert.equal(variants,5);assert.equal(pastoral,30);
assert(html.includes('<script type="application/json" id="evidence">'));
assert(html.includes('No presumed quotations'));
assert(!html.includes('__DOCUMENTARY_REVIEW_DATA__'));
const failures=[],outside=[];
const browser=await chromium.launch({headless:true});
for(const width of [1280,390]){
 const context=await browser.newContext({viewport:{width,height:850},acceptDownloads:true});
 const page=await context.newPage();
 page.on('pageerror',e=>failures.push(String(e)));
 page.on('request',r=>{if(/^https?:/i.test(r.url()))outside.push(r.url());});
 await page.goto(pathToFileURL(resolve(root+'SPX_P34_Bilingual_Original_Text_Review.html')).href);
 assert.equal(await page.locator('#items button').count(),100);
 assert.match(await page.locator('#detail').innerText(),/Original Italian question and answer/);
 assert.equal(await page.locator('#detail .witness').count(),1);
 await page.locator('#lane').selectOption('HISTORICAL_PASTORAL_HOLD');
 assert.equal(await page.locator('#items button').count(),30);
 await page.locator('#lane').selectOption('');
 await page.locator('#flag').selectOption('COMPOSITE_SOURCE_ARGUMENT');
 assert.equal(await page.locator('#items button').count(),7);
 await page.locator('#items button').first().click();
 assert((await page.locator('#detail .witness').count())>1);
 const first=page.locator('#detail .unit').first();
 await first.locator('select').selectOption('PARTIAL_SUPPORT_OR_EXTRA_CLAIM');
 await first.locator('textarea').fill('Review proposal only: compare the Italian source clause.');
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#download').click();
 const dl=await downloadPromise;
 assert.equal(dl.suggestedFilename(),'SPX_P34_Provisional_Annotations.json');
 await page.locator('#flag').selectOption('');
 await page.locator('#query').fill('PX1905-Q620');
 assert.equal(await page.locator('#items button').count(),1);
 await page.locator('#items button').first().click();
 assert.match(await page.locator('#detail').innerText(),/qua!/);
 await context.close();
}
await browser.close();
assert.deepEqual(failures,[]);
assert.deepEqual(outside,[]);
console.log('PASS SPX_P34_ITALIAN_BILINGUAL_REVIEW '+JSON.stringify({
 cases:100,clauses:total,composite:7,variants:5,pastoral:30,
 desktopMobile:true,networkCalls:0,approved:0
}));
