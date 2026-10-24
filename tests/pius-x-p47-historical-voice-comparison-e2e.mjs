import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';

const html=readFileSync('artifacts/pius-x-study-expanded/SPX_P26_Offline_Source_Dialogue_Demo.html','utf8');
const extract=id=>{
 const m=html.match(new RegExp('<script type="application/json" id="'+id+'">([\\s\\S]*?)<\\/script>'));
 assert(m,'Missing source JSON '+id);
 return JSON.parse(m[1]);
};
const data=extract('spxOfflineReplayData'),corpus=extract('spxExpandedCorpus');
assert.equal(data.voicePreviewCaseCount,3);
assert.equal(data.voicePreviewLanguageCount,2);
assert.equal(data.voicePreviewApproved,false);
assert.equal(data.voicePreviewLiveInference,false);
assert.equal(corpus.counts.allNodes,423);
assert.equal(corpus.chapters.length,106);
assert.equal(corpus.approvals.publishing,false);
assert.equal(data.cases.length,11);
const preview=data.cases.filter(x=>x.chapterId==='SPX-PILOT-01');
assert.equal(preview.length,3);
const sourceExample=JSON.parse(readFileSync(
 'previews/pius-x-study/evidence/pius-x-e-supremi-gpt6-inchat-bilingual-dialogue-20261023.v1.json','utf8'));
for(const [i,c] of preview.entries()){
 for(const lang of ['en','fr']){
  const sample=c.voicePreview?.[lang],expected=sourceExample.sequences.find(s=>s.language===lang).turns[i];
  assert(sample&&sample.text===expected.reply);
  assert(sample.witnesses.length>=2);
  assert(sample.witnesses.every(w=>w.speaker==='PIUS_X_AUTHOR'&&w.text.length>10&&
   w.sourceUrl.startsWith('https://www.vatican.va/')));
  assert.deepEqual(sample.witnesses.map(w=>w.id),expected.evidenceIds);
  assert.equal(sample.publicationApproved,false);
  assert.equal(sample.independentVerification,false);
  assert.equal(sample.liveConversationTested,false);
 }
}
assert(!('voicePreview' in data.cases.find(x=>x.chapterId==='SPX-PILOT-09')));
const screenshots='artifacts/pius-x-study-expanded/review-screenshots/';
mkdirSync(screenshots,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[],network=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
  await page.goto(pathToFileURL(resolve('artifacts/pius-x-study-expanded/SPX_P26_Offline_Source_Dialogue_Demo.html')).href);
  await page.locator('#spxc-launch').click();
  if(width===390)await page.locator('#spxc-menu').click();
  await page.locator('[data-spxc-open="SPX-PILOT-01"]').first().click();
  const btn=page.locator('#spxm-voice-preview-toggle');
  assert(await btn.isVisible());
  assert.match(await btn.innerText(),/historical-voice draft/);
  await page.locator('#spxm-guided-start').click();
  let draft=page.locator('#spxm-offline-replies .spxm-draft').first();
  assert.equal(await draft.innerText(),preview[0].reply.en);
  assert.match(await page.locator('#spxm-offline-replies .spxm-warning').first().innerText(),/NOT THE VERBATIM/);
  await btn.click();
  assert.equal(await draft.innerText(),preview[0].voicePreview.en.text);
  assert.match(await page.locator('#spxm-offline-replies .spxm-warning').first().innerText(),/CONSTRUCTED FIRST PERSON/);
  assert.equal(await page.locator('.spxm-voice-evidence').count(),1);
  assert(await page.locator('.spxm-voice-evidence').isVisible());
  assert.equal(await page.locator('.spxm-claim-audit').first().isVisible(),false);
  assert.equal(await page.locator('.spxm-offline-source').first().isVisible(),false);
  await page.locator('.spxm-voice-evidence summary').first().click();
  assert.equal(await page.locator('.spxm-voice-witness').count(),3);
  assert.equal(await page.locator('.spxm-voice-witness a').first().getAttribute('href'),
   'https://www.vatican.va/content/pius-x/la/encyclicals/documents/hf_p-x_enc_04101903_e-supremi.html');
  // Guided flow keeps the original exact questions but toggles answer voice.
  await page.locator('.spxm-guided-question').click();
  await page.locator('.spxm-guided-question').click();
  assert.deepEqual(await page.locator('#spxm-offline-replies .spxm-draft').allInnerTexts(),
   preview.map(x=>x.voicePreview.en.text));
  assert.equal(await page.locator('.spxm-voice-evidence').count(),3);
  assert.equal(await page.locator('.spxm-voice-evidence:not([hidden])').count(),3);
  assert.match(await page.locator('#spxm-guided-state').innerText(),/complete/i);
  await page.screenshot({path:screenshots+'SPX_P47_voice_3turn_'+width+'.png',fullPage:true});
  // Documentary comparison is reversible, including three-source claim audits.
  await btn.click();
  assert.deepEqual(await page.locator('#spxm-offline-replies .spxm-draft').allInnerTexts(),preview.map(x=>x.reply.en));
  assert.equal(await page.locator('.spxm-voice-evidence:not([hidden])').count(),0);
  assert.equal(await page.locator('.spxm-claim-audit:not([hidden])').count(),3);
  // Language change cannot leak English first-person reconstruction into French.
  await page.evaluate(()=>document.dispatchEvent(new CustomEvent('ao-spx-review-context',{
   detail:{chapterId:'SPX-PILOT-01',language:'fr'}})));
  assert.equal(await page.locator('#spxm-offline-replies .spxm-entry').count(),0);
  await page.locator('#spxm-guided-start').click();
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').first().innerText(),preview[0].reply.fr);
  await btn.click();
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').first().innerText(),preview[0].voicePreview.fr.text);
  assert.match(await page.locator('.spxm-warning').first().innerText(),/NON PAROLES ATTESTÉES/);
  await page.locator('.spxm-guided-question').click();
  await page.locator('.spxm-guided-question').click();
  assert.deepEqual(await page.locator('#spxm-offline-replies .spxm-draft').allInnerTexts(),
   preview.map(x=>x.voicePreview.fr.text));
  // Another source topic never inherits a forged Pius-X personal voice.
  await page.evaluate(()=>document.dispatchEvent(new CustomEvent('ao-spx-review-context',{
   detail:{chapterId:'SPX-PILOT-09',language:'en'}})));
  assert.equal(await page.locator('#spxm-offline-replies .spxm-entry').count(),0);
  assert.equal(await btn.isVisible(),false);
  assert.equal(await page.locator('#spxm-offline-choices').isVisible(),true);
  assert.deepEqual(errors,[]);
  assert.deepEqual(network,[]);
  await page.close();
 }
}finally{await browser.close();}
console.log('PASS SPX_P47_6_UNAPPROVED_VOICE_PREVIEWS '+JSON.stringify({
 languageSequences:2,turnsPerSequence:3,witnessIDsExact:true,
 documentaryVersionPreserved:true,sourceDrawerPreserved:true,
 subjectLanguageReset:true,workingDesktopMobile:true,
 liveModelCalls:0,sourceOwnerEdits:0,approved:0,published:false
}));
