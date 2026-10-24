import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
const root='artifacts/pius-x-study-expanded/';
const p35=JSON.parse(readFileSync(root+'SPX_P35_35_Provisional_Source_Findings.json','utf8'));
const report=JSON.parse(readFileSync(root+'SPX_P36_Bilingual_11_Revisions_35_Source_Cases.json','utf8'));
const proposed=JSON.parse(readFileSync('previews/pius-x-study/evidence/pius-x-p36-eleven-bilingual-rewrite-proposals-20261024.v1.json','utf8'));
assert.equal(report.schema,'AO_SPX_P36_BILINGUAL_11_REVISIONS_IN_35_SOURCE_REVIEW_V1');
assert.equal(report.counts.priorityCases,35);
assert.equal(report.counts.proposedBilingualRewritePairs,11);
assert.equal(report.counts.noRewriteStillHeld,24);
assert.equal(report.counts.historicalPastoralHolds,30);
assert.equal(report.counts.multiSourceCases,7);
assert.equal(report.counts.originalItalianWordingVariantCases,3);
assert.equal(report.counts.originalItalianWitnesses,44);
assert.equal(report.counts.originalDraftsChanged,0);
assert.equal(report.counts.humanSignoffs,0);
assert.equal(report.counts.translationsCertified,0);
assert.equal(report.counts.sourceClaimsCertified,0);
assert.equal(report.counts.publishedAnswers,0);
assert.equal(report.release.doctrinalCertified,0);
assert.equal(report.records.length,35);
assert.equal(proposed.candidates.length,11);
const origin=new Map(p35.records.map(x=>[x.sourceQid,x]));
const changed=new Map(proposed.candidates.map(x=>[x.sourceQid,x]));
const mandatory=new Set(p35.records.filter(x=>x.sourceComparison.suggestedAction==='REVISE_BEFORE_ANY_APPROVAL').map(x=>x.sourceQid));
assert.equal(mandatory.size,11);
assert.deepEqual(new Set(changed.keys()),mandatory);
let count=0,kept=0;
for(const row of report.records){
 const o=origin.get(row.sourceQid);assert(o);
 assert.equal(row.enDraft,o.enDraft);assert.equal(row.frDraft,o.frDraft);
 assert.deepEqual(row.italianSourceWitnesses,o.italianSourceWitnesses);
 assert.equal(row.sourceComparison.reasonedItalianToENFRAnalysis,o.sourceComparison.reasonedItalianToENFRAnalysis);
 assert.equal(row.publicationApproved,false);
 const item=changed.get(row.sourceQid);
 if(item){
  count++;const revised=row.correctedCandidate;assert(revised);
  assert.equal(revised.proposedEN,item.proposedEN);
  assert.equal(revised.proposedFR,item.proposedFR);
  assert.equal(revised.separateNarratorNoteEN,item.narratorNoteEN);
  assert.equal(revised.separateNarratorNoteFR,item.narratorNoteFR);
  assert.deepEqual(revised.sourceWitnessQids,row.italianSourceWitnesses.map(x=>x.qid));
  assert.equal(revised.sourceExpertSigned,false);
  assert.equal(revised.translatorSigned,false);
  assert.equal(revised.doctrinalReviewerSigned,false);
  assert.equal(revised.published,false);
  assert.equal(revised.personallySpokenByPiusX,false);
 }else{kept++;assert.equal(row.correctedCandidate,null);}
}
assert.equal(count,11);assert.equal(kept,24);
const pagePath=resolve(root+'SPX_P36_Bilingual_11_Proposed_Corrections.html');
const file=readFileSync(pagePath,'utf8');
assert(file.includes('Eleven proposed bilingual corrections'));
assert(!file.includes('UI_REPLACEMENT'));
assert(!file.includes('data.counts.openingCases!==100'));
const browser=await chromium.launch({headless:true});
const errors=[],outside=[];
for(const width of [1280,390]){
 const context=await browser.newContext({viewport:{width,height:900},acceptDownloads:true});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('request',r=>{if(/^https?:/i.test(r.url()))outside.push(r.url());});
 await page.goto(pathToFileURL(pagePath).href);
 assert.equal(await page.locator('#items button').count(),35);
 assert.match(await page.locator('#detail').innerText(),/Provisional source-to-draft editorial finding/);
 await page.locator('#query').fill('PX1905-Q655');
 assert.equal(await page.locator('#items button').count(),1);
 await page.locator('#items button').first().click();
 assert.match(await page.locator('#detail').innerText(),/Bilingual correction PROPOSED/);
 assert.match(await page.locator('#detail').innerText(),/the same Jesus Christ/);
 assert.match(await page.locator('#detail').innerText(),/Le Catéchisme de 1905/);
 await page.locator('#query').fill('PX1905-Q567');
 await page.locator('#items button').first().click();
 assert.match(await page.locator('#detail').innerText(),/Original draft retained without rewrite/);
 assert.equal(await page.locator('#detail').getByText('Bilingual correction PROPOSED').count(),0);
 await page.locator('#query').fill('');
 await page.locator('#lane').selectOption('HISTORICAL_PASTORAL_HOLD');
 assert.equal(await page.locator('#items button').count(),30);
 await page.locator('#lane').selectOption('');
 await page.locator('#flag').selectOption('COMPOSITE_SOURCE_ARGUMENT');
 assert.equal(await page.locator('#items button').count(),7);
 const wait=page.waitForEvent('download');
 await page.locator('#download').click();
 assert.equal((await wait).suggestedFilename(),'SPX_P36_Provisional_Annotations.json');
 await context.close();
}
await browser.close();
assert.deepEqual(errors,[]);
assert.deepEqual(outside,[]);
console.log('PASS SPX_P36_BILINGUAL_CORRECTIONS '+JSON.stringify({
 cases:35,rewrittenPairs:11,heldUnchanged:24,sourceWitnesses:44,
 desktopMobile:true,externalCalls:0,published:0
}));
