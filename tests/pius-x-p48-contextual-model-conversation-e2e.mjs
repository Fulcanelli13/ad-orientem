/**
 * P2.48 tests the actual localhost model-review UI and exact original-source
 * continuation across three turns in EN and FR, using a FAKE model in CI.
 * It does not prove that any real AI behaves naturally or reliably.
 */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {chromium} from '@playwright/test';
import {readCorpus,composeDraft,selectDocumentedFollowups,
  makeReviewHTML,createReviewServer} from '../tools/pius-x-generative-review.mjs';

const p6=readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8');
const client=readFileSync('previews/pius-x-study/spx-model-review-client.js','utf8');
const css=readFileSync('previews/pius-x-study/spx-model-review-style.css','utf8');
const html=makeReviewHTML(p6,client,css);
const store=readCorpus(html);
assert.equal(store.chapters.size,106);
assert.equal(store.data.counts.allNodes,423);
assert.equal(store.data.approvals.publishing,false);
const nodes=store.chapters.get('SPX-PILOT-01').nodes;
assert.equal(nodes.length,3);
for(const language of ['en','fr']){
 const first=selectDocumentedFollowups(store,{chapterId:'SPX-PILOT-01',nodeId:nodes[0].id,language});
 assert.deepEqual(first.map(x=>x.nodeId),nodes.slice(1).map(x=>x.id));
 assert.deepEqual(first.map(x=>x.question),nodes.slice(1).map(x=>x.q[language]));
 assert(first.every(x=>x.status==='ORIGINAL_SOURCE_QUESTION_SUGGESTION_ONLY'));
 const second=selectDocumentedFollowups(store,{chapterId:'SPX-PILOT-01',nodeId:nodes[1].id,language});
 assert.deepEqual(second.map(x=>x.nodeId),[nodes[2].id]);
 assert.deepEqual(selectDocumentedFollowups(store,{
  chapterId:'SPX-PILOT-01',nodeId:nodes[2].id,language}),[]);
}
assert.deepEqual(selectDocumentedFollowups(store,{chapterId:'SPX-EXP-001',nodeId:'x',language:'en'}),[]);
assert.deepEqual(selectDocumentedFollowups(store,{chapterId:'SPX-PILOT-01',nodeId:'FAKE',language:'en'}),[]);
const modelInputs=[];
const fakeModel=async(purpose,messages)=>{
 const payload=JSON.parse(messages[1].content);
 if(purpose==='compose'){
  assert(['documentary','historical'].includes(payload.voiceMode));
  assert(payload.evidence.length===1);
  const id=payload.evidence[0].id;
  modelInputs.push({language:payload.language,voiceMode:payload.voiceMode,id,history:payload.history});
  const index=nodes.findIndex(x=>x.id===id);
  assert(index>=0);
  const line=payload.voiceMode==='historical'?
   (payload.language==='fr'? 'Nous étudions ici le témoignage pontifical transmis par le texte latin, sans inventer de souvenir personnel.':
    'We consider the attested passage, not an invented private reminiscence of the pontiff.'):
   (payload.language==='fr'? 'Le texte original témoigne d’une charge assumée dans la prière et tournée vers le Christ.':
    'The original document discusses the gravity of the pontificate and its purpose in Christ.');
  const unique=' ['+payload.language+' '+payload.voiceMode+' '+(index+1)+']';
  return {mode:'answer',text:line+unique,
   evidenceIds:[id],witnessIds:[payload.evidence[0].originalLanguageWitnesses[0].id],
   expression:index===1?'grave':'thoughtful'};
 }
 assert(payload.evidence?.length===1);
 return {supported:true,allClaimsSupported:true,
   ids:payload.candidate.ids,witnessIds:payload.candidate.witnessIds};
};
const before=modelInputs.length;
const abstain=await composeDraft(store,{chapterId:'SPX-PILOT-01',
 language:'en',question:'How many secret conversations did you have with your doctor?',
 autoRoute:true},fakeModel);
assert.equal(abstain.status,'held');
assert.equal(abstain.reason,'no_curated_source_match_for_free_question');
assert.equal(modelInputs.length,before);
const server=createReviewServer({html,model:fakeModel});
await new Promise((res,rej)=>server.listen(0,'127.0.0.1',e=>e?rej(e):res()));
const base='http://127.0.0.1:'+server.address().port;
const screenshots='artifacts/pius-x-study-expanded/review-screenshots/';
mkdirSync(screenshots,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[],external=[];
  page.on('pageerror',x=>errors.push(String(x)));
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(base))external.push(r.url());});
  await page.goto(base+'/',{waitUntil:'load'});
  await page.locator('#spxc-launch').click();
  if(width===390)await page.locator('#spxc-menu').click();
  await page.locator('[data-spxc-open="SPX-PILOT-01"]').first().click();
  const enter=async value=>{
   await page.locator('#spxm-question').fill(value);
   await page.locator('#spxm-send').click();
  };
  assert.match(await page.locator('#spxm-voice-mode').innerText(),/Voice: documentary reply/);
  const beforeCalls=modelInputs.length;
  await enter(nodes[0].q.en);
  await page.locator('#spxm-replies .spxm-draft').first().waitFor();
  assert.equal(await page.locator('.spxm-next-option').count(),2);
  assert.equal(await page.locator('.spxm-next-option').first().innerText(),nodes[1].q.en);
  assert.equal(modelInputs.at(-1).id,nodes[0].id);
  assert.equal(modelInputs.at(-1).history.length,0);
  // Clicking an EXACT original follow-up performs a second HTTP compose+verify.
  await page.locator('.spxm-next-option').first().click();
  await page.locator('#spxm-replies .spxm-draft').nth(1).waitFor();
  assert.equal(modelInputs.at(-1).id,nodes[1].id);
  assert.equal(modelInputs.at(-1).history.length,1);
  assert.equal(modelInputs.at(-1).history[0].contextOnly,true);
  assert.equal(await page.locator('#spxm-replies .spxm-entry').nth(1).locator('.spxm-next-option').count(),1);
  await page.locator('#spxm-replies .spxm-entry').nth(1).locator('.spxm-next-option').click();
  await page.locator('#spxm-replies .spxm-draft').nth(2).waitFor();
  assert.equal(modelInputs.at(-1).id,nodes[2].id);
  assert.equal(modelInputs.at(-1).history.length,2);
  assert.equal(await page.locator('#spxm-replies .spxm-entry').nth(2).locator('.spxm-next-option').count(),0);
  assert.equal(modelInputs.length-beforeCalls,3);
  // The private model is NOT called when a question has no safe source route.
  const heldBefore=modelInputs.length;
  await enter('What secret conversations did you have at the Vatican dinner table?');
  await page.locator('#spxm-replies .spxm-held').last().waitFor();
  assert.equal(modelInputs.length,heldBefore);
  await page.screenshot({path:screenshots+'SPX_P48_private_context_3turn_'+width+'.png',fullPage:true});
  // Voice mode intentionally resets the transcript and any previous style.
  await page.locator('#spxm-voice-mode').click();
  assert.match(await page.locator('#spxm-voice-mode').innerText(),/historical editorial reconstruction/);
  assert.equal(await page.locator('#spxm-replies .spxm-entry').count(),0);
  await enter(nodes[0].q.en);
  await page.locator('#spxm-replies .spxm-voice-disclaimer').first().waitFor();
  assert.equal(modelInputs.at(-1).voiceMode,'historical');
  assert.equal(modelInputs.at(-1).history.length,0);
  assert.match(await page.locator('.spxm-voice-disclaimer').first().innerText(),/NOT an authenticated quote/);
  // EN=>FR switches mode and history to defaults, even after previous responses.
  await page.locator('#spxc-lang').click();
  assert.equal(await page.locator('html').getAttribute('lang'),'fr');
  assert.equal(await page.locator('#spxm-replies .spxm-entry').count(),0);
  assert.match(await page.locator('#spxm-voice-mode').innerText(),/réponse documentaire/);
  await enter(nodes[0].q.fr);
  await page.locator('#spxm-replies .spxm-draft').first().waitFor();
  assert.equal(modelInputs.at(-1).language,'fr');
  assert.equal(modelInputs.at(-1).history.length,0);
  assert.equal(await page.locator('.spxm-next-option').first().innerText(),nodes[1].q.fr);
  assert.deepEqual(errors,[]);
  assert.deepEqual(external,[]);
  await page.close();
 }
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
console.log('PASS SPX_P48_CONTEXTUAL_PRIVATE_PILOT '+JSON.stringify({
 desktop:true,mobile:true,documentedEnglishThreeTurn:true,frenchContinuation:true,
 historicalVoiceModeReset:true,sourceIdsExact:true,unsupportedHeldBeforeInference:true,
 sourceOwnerNodes:423,modelUsed:'CI_FAKE_ONLY',realLLMCalls:0,approved:0,published:false
}));
