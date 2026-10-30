import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
const root='artifacts/pius-x-study-expanded/';
const report=JSON.parse(readFileSync(root+'SPX_P37_Eleven_Italian_Bilingual_Second_Pass.json','utf8'));
const p36=JSON.parse(readFileSync(root+'SPX_P36_Bilingual_11_Revisions_35_Source_Cases.json','utf8'));
const source=JSON.parse(readFileSync('previews/pius-x-study/evidence/pius-x-p37-eleven-second-pass-translation-review-20261024.v1.json','utf8'));
assert.equal(report.schema,'AO_SPX_P37_SECOND_PASS_11_ITALIAN_BILINGUAL_REVIEW_V1');
assert.equal(report.status,'ASSISTANT_SECOND_PASS_SOURCE_FIDELITY_ASSESSMENT_NOT_INDEPENDENT_CERTIFICATION');
assert.equal(report.records.length,11);
assert.equal(report.counts.secondPassCases,11);
assert.equal(report.counts.sourceClaimsCheckedAsEditorialProposals,25);
assert.equal(report.counts.proposedThirdVersionPairs,3);
assert.equal(report.counts.retainedWithoutAdditionalRedraft,8);
assert.equal(report.counts.historicallySensitiveCasesInCohort,9);
assert.equal(report.counts.certifiedEnglishFrenchClaimPairs,0);
assert.equal(report.counts.independentHumanSignoffs,0);
assert.equal(report.counts.publications,0);
assert.equal(report.approvals.translationCertified,0);
assert.equal(report.approvals.doctrinalCertified,0);
assert.equal(report.approvals.humanSignedOff,0);
assert.equal(source.records.length,11);
const p36rows=new Map(p36.records.map(r=>[r.sourceQid,r]));
const notes=new Map(source.records.map(r=>[r.sourceQid,r]));
let anchors=0,refined=0;
const normalize=t=>String(t).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
for(const row of report.records){
 const prior=p36rows.get(row.sourceQid),audit=notes.get(row.sourceQid);
 assert(prior&&audit&&prior.correctedCandidate);
 assert.equal(row.enDraft,prior.enDraft);
 assert.equal(row.frDraft,prior.frDraft);
 assert.deepEqual(row.italianSourceWitnesses,prior.italianSourceWitnesses);
 assert.deepEqual(row.correctedCandidate,prior.correctedCandidate);
 assert.equal(row.secondPassAudit.editorialAnalysis,audit.editorialAnalysis);
 assert.equal(row.secondPassAudit.professionalTranslationApproval,false);
 assert.equal(row.secondPassAudit.doctrinalSignoff,false);
 assert.equal(row.secondPassAudit.humanIndependentSourceReview,false);
 assert.equal(row.secondPassAudit.publicationApproved,false);
 for(const unit of row.secondPassAudit.sourcePropositionChecks){
  const witness=row.italianSourceWitnesses.find(w=>w.qid===unit.sourceQid);
  assert(witness);
  assert(normalize(witness.italianAnswer).includes(normalize(unit.exactItalianSpan)));
  assert.equal(unit.substantiveEvaluation,'SECOND_PASS_EDITORIAL_PROPOSAL_NOT_INDEPENDENTLY_CERTIFIED');
  anchors++;
 }
 if(row.secondPassAudit.alternativeCandidate){
  refined++;
  const next=row.secondPassAudit.alternativeCandidate;
  assert(next.proposedEN!==prior.correctedCandidate.proposedEN);
  assert(next.proposedFR!==prior.correctedCandidate.proposedFR);
  assert.equal(next.translatorApproved,false);
  assert.equal(next.doctrinalApproved,false);
 }
}
assert.equal(anchors,25);assert.equal(refined,3);
const html=readFileSync(root+'SPX_P37_Eleven_Bilingual_Second_Pass.html','utf8');
assert(html.includes('Eleven source-checked bilingual drafts'));
assert(!html.includes('OVERLAY_SECOND_PASS'));
assert(!html.includes('__DOCUMENTARY_REVIEW_DATA__'));
const browser=await chromium.launch({headless:true});
const errors=[],requests=[];
for(const width of [1280,390]){
 const ctx=await browser.newContext({viewport:{width,height:860},acceptDownloads:true});
 const page=await ctx.newPage();
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('request',r=>{if(/^https?:/i.test(r.url()))requests.push(r.url())});
 await page.goto(pathToFileURL(resolve(root+'SPX_P37_Eleven_Bilingual_Second_Pass.html')).href);
 assert.equal(await page.locator('#items button').count(),11);
 assert.match(await page.locator('#detail').innerText(),/second-pass Italian \/ EN \/ FR analysis/);
 await page.locator('#query').fill('PX1905-Q585');
 assert.equal(await page.locator('#items button').count(),1);
 await page.locator('#items button').first().click();
 const q585=await page.locator('#detail').innerText();
 assert.match(q585,/SECOND bilingual correction proposal/);
 assert.match(q585,/right hand/);
 assert.match(q585,/main droite/);
 await page.locator('#query').fill('PX1905-Q648');
 await page.locator('#items button').first().click();
 assert.match(await page.locator('#detail').innerText(),/grave account to God/);
 await page.locator('#query').fill('PX1905-Q655');
 await page.locator('#items button').first().click();
 assert.match(await page.locator('#detail').innerText(),/UNSUPPORTED SHORTHAND REMOVED/);
 assert.equal(await page.locator('#detail').getByText('SECOND bilingual correction proposal').count(),0);
 await page.locator('#query').fill('');
 await page.locator('#lane').selectOption('HISTORICAL_PASTORAL_HOLD');
 assert.equal(await page.locator('#items button').count(),9);
 await page.locator('#lane').selectOption('');
 const d=page.waitForEvent('download');
 await page.locator('#download').click();
 assert.equal((await d).suggestedFilename(),'SPX_P37_Provisional_Annotations.json');
 await ctx.close();
}
await browser.close();
assert.deepEqual(errors,[]);
assert.deepEqual(requests,[]);
console.log('PASS SPX_P37_ELEVEN_SECOND_PASS '+JSON.stringify({
 cases:11,italianAnchors:25,additionalBilingualProposals:3,unchangedP36Pairs:11,
 desktopMobile:true,externalNetwork:0,humanApproved:0,published:0
}));
