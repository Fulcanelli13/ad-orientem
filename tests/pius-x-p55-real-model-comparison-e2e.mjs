import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';

// Test a static, no-network avatar visual novel with reproduced ACTUAL model
// outputs, not a model call, an invented quote, or a publishable Pius X reply.
const input='artifacts/pius-x-study-expanded/SPX_P26_Offline_Source_Dialogue_Demo.html';
const html=readFileSync(input,'utf8');
const extract=id=>{
 const m=html.match(new RegExp('<script type="application/json" id="'+id+'">([\\s\\S]*?)<\\/script>'));
 assert(m,'Missing JSON source '+id);
 return JSON.parse(m[1]);
};
const data=extract('spxOfflineReplayData'),corpus=extract('spxExpandedCorpus');
const actual=JSON.parse(readFileSync(
 'previews/pius-x-study/evidence/pius-x-p54-real-7b-four-turn-research-20261024.v1.json','utf8'));
assert.equal(data.real7bComparisonCount,4);
assert.equal(data.real7bComparisonApproved,false);
assert.equal(data.real7bComparisonLive,false);
assert.equal(data.modelProviderEnabled,false);
assert.equal(data.publishingApproved,false);
assert.equal(corpus.counts.allNodes,423);
assert.equal(corpus.chapters.length,106);
assert.equal(corpus.approvals.publishing,false);
assert.equal(actual.turns.length,4);
assert.equal(actual.counts.structurallyAccepted,4);
assert.equal(actual.counts.independentlyApproved,0);
const cases=data.cases.filter(x=>x.chapterId==='SPX-PILOT-01');
assert.equal(cases.length,3);
for(const turn of actual.turns){
 const row=cases[turn.turn-1];
 assert.equal(turn.nodeId,row.nodeId);
 assert.equal(row.real7bPreview[turn.language].text,turn.text);
 assert.equal(row.real7bPreview[turn.language].editorialConcern,turn.editorialConcern);
 assert.equal(row.real7bPreview[turn.language].status,
  'ACTUAL_7B_MACHINE_GENERATION_EDITORIAL_UNAPPROVED');
 assert.equal(row.real7bPreview[turn.language].publishingApproved,false);
 assert.equal(row.real7bPreview[turn.language].firstPersonAuthenticated,false);
 assert.equal(row.real7bPreview[turn.language].currentModelInference,false);
 assert.deepEqual(row.real7bPreview[turn.language].witnesses.map(w=>w.id),turn.sourceWitnessIds);
 assert(row.real7bPreview[turn.language].witnesses.every(w=>w.speaker==='PIUS_X_AUTHOR'&&
   w.originalLanguage==='la'&&w.sourceUrl.startsWith('https://www.vatican.va/')));
}
assert(!('real7bPreview' in cases[2]));
assert(!data.cases.find(c=>c.chapterId==='SPX-PILOT-09')?.real7bPreview);
const dir='artifacts/pius-x-study-expanded/review-screenshots/';
mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[],network=[];
  page.on('pageerror',error=>errors.push(String(error)));
  page.on('request',request=>{if(/^https?:/.test(request.url()))network.push(request.url());});
  await page.goto(pathToFileURL(resolve(input)).href,{waitUntil:'load'});
  await page.locator('#spxc-launch').click();
  if(width===390)await page.locator('#spxc-menu').click();
  await page.locator('[data-spxc-open="SPX-PILOT-01"]').first().click();
  const comparison=page.locator('.spxm-real-7b-comparison');
  await page.locator('#spxm-guided-start').click();
  assert.equal(await comparison.count(),1);
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').first().innerText(),cases[0].reply.en);
  assert.equal(await comparison.first().getAttribute('data-research-only'),'true');
  await comparison.first().locator('summary').first().click();
  assert.equal(await page.locator('.spxm-real-7b-text').first().innerText(),actual.turns[0].text);
  assert.match(await comparison.first().locator('.spxm-real-7b-warning').innerText(),/NOT A HISTORICAL QUOTATION/);
  assert.match(await comparison.first().locator('.spxm-real-7b-concern').innerText(),/honor of pontificate/);
  await comparison.first().locator('.spxm-real-7b-sources summary').click();
  assert.equal(await comparison.first().locator('.spxm-real-7b-witness').count(),5);
  assert.equal(await comparison.first().locator('.spxm-real-7b-run').getAttribute('href'),actual.runUrl);
  // Switching to the separate, earlier GPT-6 in-chat speculative prose does
  // not replace or hide the genuinely generated 7B comparison.
  await page.locator('#spxm-voice-preview-toggle').click();
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').first().innerText(),
   cases[0].voicePreview.en.text);
  assert(await comparison.first().isVisible());
  await page.locator('#spxm-voice-preview-toggle').click();
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').first().innerText(),cases[0].reply.en);
  await page.locator('.spxm-guided-question').click();
  await page.locator('.spxm-guided-question').click();
  assert.equal(await comparison.count(),2,'Only first two turns have measured 7B replies');
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').count(),3);
  await comparison.nth(1).locator('summary').first().click();
  assert.equal(await comparison.nth(1).locator('.spxm-real-7b-text').innerText(),actual.turns[1].text);
  await page.screenshot({path:dir+'SPX_P55_real_7b_voice_comparison_en_'+width+'.png',fullPage:true});
  await page.evaluate(()=>document.dispatchEvent(new CustomEvent('ao-spx-review-context',{
   detail:{chapterId:'SPX-PILOT-01',language:'fr'}})));
  assert.equal(await comparison.count(),0);
  assert.equal(await page.locator('#spxm-voice-preview-toggle').isVisible(),true);
  await page.locator('#spxm-guided-start').click();
  assert.equal(await comparison.count(),1);
  await comparison.first().locator('summary').first().click();
  const french=actual.turns.filter(x=>x.language==='fr');
  assert.equal(await comparison.first().locator('.spxm-real-7b-text').innerText(),french[0].text);
  assert.match(await comparison.first().locator('.spxm-real-7b-warning').innerText(),/NON CITATION HISTORIQUE/);
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').first().innerText(),cases[0].reply.fr);
  await page.locator('.spxm-guided-question').click();
  assert.equal(await comparison.count(),2);
  await comparison.nth(1).locator('summary').first().click();
  assert.equal(await comparison.nth(1).locator('.spxm-real-7b-text').innerText(),french[1].text);
  assert.equal(await comparison.nth(1).locator('.spxm-real-7b-witness').count(),2);
  await page.screenshot({path:dir+'SPX_P55_real_7b_voice_comparison_fr_'+width+'.png',fullPage:true});
  await page.evaluate(()=>document.dispatchEvent(new CustomEvent('ao-spx-review-context',{
   detail:{chapterId:'SPX-PILOT-09',language:'en'}})));
  assert.equal(await comparison.count(),0);
  assert.equal(await page.locator('#spxm-voice-preview-toggle').isVisible(),false);
  assert.deepEqual(errors,[]);
  assert.deepEqual(network,[]);
  await page.close();
 }
}finally{await browser.close();}
console.log('PASS SPX_P55_REAL_7B_COMPARE_INSIDE_VISUAL_NOVEL '+JSON.stringify({
 actualInferenceSamples:4,englishTwo:true,frenchTwo:true,
 desktopMobile:true,originalDocumentaryDialogueUntouched:true,
 existingGPT6ResearchUntouched:true,sourceWitnessLinksPresent:true,
 otherTopicsNo7b:true,thirdTurnNotFaked:true,
 externalNetworkRequests:0,liveModelInference:0,sourceOwnerNodes:423,published:false
}));
