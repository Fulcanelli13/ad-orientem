import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
const dir='artifacts/pius-x-study-expanded/';
const report=JSON.parse(readFileSync(dir+'SPX_P35_35_Provisional_Source_Findings.json','utf8'));
const p34=JSON.parse(readFileSync(dir+'SPX_P34_Italian_EN_FR_100_Claim_Review.json','utf8'));
const authored=JSON.parse(readFileSync('previews/pius-x-study/evidence/pius-x-p35-35-high-priority-editorial-findings-20261024.v1.json','utf8'));
const original=new Map(p34.records.map(x=>[x.sourceQid,x]));
const anchors=new Map(authored.findings.map(x=>[x.sourceQid,x]));
assert.equal(report.schema,'AO_SPX_P35_35_PROVISIONAL_SUBSTANTIVE_EDITORIAL_FINDINGS_V1');
assert.equal(report.records.length,35);assert.equal(anchors.size,35);
assert.equal(report.counts.cases,35);
assert.equal(report.counts.pastoralHolds,30);
assert.equal(report.counts.compositeCases,7);
assert.equal(report.counts.transcriptionVariantCases,3);
assert.equal(report.counts.exactItalianAnchors,35);
assert.equal(report.counts.italianSourcePassages,44);
assert(report.counts.chapterHeadingContaminationCases>=4);
assert(report.counts.mandatoryWordingRevisionProposals>=8);
assert.equal(report.release.humanSignedOff,0);
assert.equal(report.release.sourceClaimCertified,0);
assert.equal(report.release.englishCertified,0);
assert.equal(report.release.frenchCertified,0);
assert.equal(report.release.docrinalCertified??0,0);
assert.equal(report.release.publicRuntimeUpdates,0);
const normalize=text=>String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const found=new Set();
for(const r of report.records){
 assert(!found.has(r.sourceQid));found.add(r.sourceQid);
 const old=original.get(r.sourceQid),proposal=anchors.get(r.sourceQid);
 assert(old&&proposal&&old.reviewPriority==='P0_HISTORICAL_OR_COMPOSITE');
 assert.equal(r.enDraft,old.enDraft);assert.equal(r.frDraft,old.frDraft);
 assert.deepEqual(r.italianSourceWitnesses,old.italianSourceWitnesses);
 assert.equal(r.sourceComparison.sourceEvidenceAnchor,proposal.italianEvidenceAnchor);
 assert.equal(r.sourceComparison.provisionalEditorialFinding,proposal.editorialFindingType);
 assert.equal(r.sourceComparison.reasonedItalianToENFRAnalysis,proposal.analysis);
 assert.equal(r.sourceComparison.requestedRevisionOrDisposition,proposal.requestedRevisionOrDisposition);
 assert(r.italianSourceWitnesses.some(w=>normalize(w.italianAnswer).includes(normalize(r.sourceComparison.sourceEvidenceAnchor))));
 assert(r.italianSourceWitnesses.some(w=>w.qid===r.sourceComparison.sourceAnchorQid));
 assert.equal(r.sourceComparison.editorialAssessmentIsNotTranslationCertification,true);
 assert.equal(r.sourceComparison.approval.independentSourceExpert,false);
 assert.equal(r.sourceComparison.approval.theologicalReviewer,false);
 assert.equal(r.sourceComparison.approval.bilingualTranslator,false);
 assert.equal(r.sourceComparison.approval.periodVoice,false);
 assert.equal(r.sourceComparison.approval.publication,false);
 assert.equal(r.publicationApproved,false);
 assert.equal(r.allHumanApprovals,false);
}
assert.equal(found.size,35);
for(const qid of ['PX1905-Q576','PX1905-Q585','PX1905-Q619','PX1905-Q630','PX1905-Q632','PX1905-Q636','PX1905-Q655','PX1905-Q666'])
 assert(found.has(qid));
const fullHtml=readFileSync(dir+'SPX_P35_35_Editorial_Italian_Review.html','utf8');
assert(fullHtml.includes('Thirty-five priority openings'));
assert(fullHtml.includes('Provisional source-to-draft editorial finding'));
assert(!fullHtml.includes('__DOCUMENTARY_REVIEW_DATA__'));
const browser=await chromium.launch({headless:true});
const faults=[],network=[];
for(const width of [1280,390]){
 const ctx=await browser.newContext({viewport:{width,height:850},acceptDownloads:true});
 const page=await ctx.newPage();
 page.on('pageerror',e=>faults.push(String(e)));
 page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
 await page.goto(pathToFileURL(resolve(dir+'SPX_P35_35_Editorial_Italian_Review.html')).href);
 assert.equal(await page.locator('#items button').count(),35);
 assert.match(await page.locator('#detail').innerText(),/Provisional source-to-draft editorial finding/);
 await page.locator('#lane').selectOption('HISTORICAL_PASTORAL_HOLD');
 assert.equal(await page.locator('#items button').count(),30);
 await page.locator('#lane').selectOption('');
 await page.locator('#flag').selectOption('COMPOSITE_SOURCE_ARGUMENT');
 assert.equal(await page.locator('#items button').count(),7);
 await page.locator('#flag').selectOption('');
 await page.locator('#query').fill('PX1905-Q655');
 assert.equal(await page.locator('#items button').count(),1);
 await page.locator('#items button').first().click();
 const body=await page.locator('#detail').innerText();
 assert.match(body,/SOURCE CLAIM OVERREACH/);
 assert.match(body,/same Priest and Victim/);
 assert.equal(await page.locator('#detail .witness').count(),2);
 await page.locator('#query').fill('PX1905-Q576');
 await page.locator('#items button').first().click();
 assert.match(await page.locator('#detail').innerText(),/following-section heading/);
 const unit=page.locator('#detail .unit').first();
 await unit.locator('select').selectOption('NOT_SUPPORTED_BY_CITED_ITALIAN');
 await unit.locator('textarea').fill('Research proposal: reconsider the present-day-law caveat.');
 const wait=page.waitForEvent('download');
 await page.locator('#download').click();
 assert.equal((await wait).suggestedFilename(),'SPX_P34_Provisional_Annotations.json');
 await ctx.close();
}
await browser.close();
assert.deepEqual(faults,[]);
assert.deepEqual(network,[]);
console.log('PASS SPX_P35_35_SOURCE_FINDINGS '+JSON.stringify({cases:35,
 primaryAndCompanionItalianWitnesses:44,pastoral:30,composite:7,
 transcriptionHolds:3,sourceAnchors:35,
 recommendedRevisions:report.counts.mandatoryWordingRevisionProposals,
 boundaryContamination:report.counts.chapterHeadingContaminationCases,
 desktopMobile:true,humanCertified:0,published:0}));
