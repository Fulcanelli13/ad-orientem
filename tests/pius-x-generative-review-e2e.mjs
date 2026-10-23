import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {
 readCorpus,selectEvidence,composeDraft,makeReviewHTML,createReviewServer
} from '../tools/pius-x-generative-review.mjs';
import {readFileSync} from 'node:fs';

const raw=readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8');
const client=readFileSync('previews/pius-x-study/spx-model-review-client.js','utf8');
const css=readFileSync('previews/pius-x-study/spx-model-review-style.css','utf8');
const html=makeReviewHTML(raw,client,css);
const store=readCorpus(html);
assert.equal(store.chapters.size,106);
assert.equal(store.data.counts.allNodes,423);
assert.equal(store.data.approvals.publishing,false);
const historical=selectEvidence(store,{chapterId:'SPX-EXP-001',language:'en',question:'What was your childhood like?'});
assert.equal(historical.status,'held');
assert.equal(historical.reason,'not_papal_primary_document_adaptation');
let calls=0;
let sabotage=false;
let rejectVerification=false;
let emitWitnesses=false;
const fakeModel=async(kind,messages)=>{
 calls++;
 const input=JSON.parse(messages[1].content);
 if(kind==='compose'){
  const id=input.evidence[0].id;
  return {mode:'answer',text:'The existing editorial material emphasizes the task of encouraging faithful Christian instruction and pastoral care.',
   evidenceIds:[sabotage?'NEVER-IN-THIS-SOURCE':id],
   ...(emitWitnesses?{witnessIds:[input.evidence[0].originalLanguageWitnesses[0].id]}:{}),
   expression:'explaining'};
 }
 return {supported:!rejectVerification,allClaimsSupported:!rejectVerification,ids:input.candidate.ids,
  ...(emitWitnesses?{witnessIds:input.candidate.witnessIds}: {})};
};
const eligible={chapterId:'SPX-PILOT-01',language:'en',question:'Did you welcome your election as Pope?'};
const chosen=selectEvidence(store,eligible);
assert.equal(chosen.status,'eligible');
assert.equal(chosen.evidence[0].status,'UNVERIFIED_EDITORIAL_ADAPTATION_NOT_ORIGINAL_QUOTATION');
const successful=await composeDraft(store,eligible,fakeModel);
assert.equal(successful.status,'draft');
assert.equal(successful.publishingApproved,false);
assert.equal(successful.originalTextCollated,false);
assert.equal(successful.evidence.length,1);
assert.match(successful.label,/NOT AN AUTHENTIC/);
sabotage=true;
assert.equal((await composeDraft(store,eligible,fakeModel)).reason,'invalid_generated_content_or_reference');
sabotage=false;rejectVerification=true;
assert.equal((await composeDraft(store,eligible,fakeModel)).reason,'unsupported_or_unverified_generated_claim');
rejectVerification=false;
const countBefore=calls;
assert.equal((await composeDraft(store,{...eligible,question:'Please grant absolution'},fakeModel)).status,'held');
assert.equal(calls,countBefore);
const noProvider=await composeDraft(store,eligible,null);
assert.equal(noProvider.reason,'no_private_model_configured');

const server=createReviewServer({html,model:fakeModel});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
let browser;
try{
 const wrongOrigin=await fetch(base+'/api/pius-x-review',{method:'POST',
  headers:{'content-type':'application/json','x-ao-review':'1',origin:'https://untrusted.example'},
  body:JSON.stringify(eligible)});
 assert.equal(wrongOrigin.status,403);
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const width of [1280,390]){
  emitWitnesses=width===1280; // cover original-fragment pointers and legacy node-only fallback
  const page=await browser.newPage({viewport:{width,height:844}});
  const errs=[];page.on('pageerror',e=>errs.push(String(e)));
  await page.goto(base+'/',{waitUntil:'load'});
  await page.locator('#spxc-launch').click();
  assert.equal(await page.locator('#spxc-model-review').isVisible(),false);
  if(width===390)await page.locator('#spxc-menu').click();
  await page.locator('[data-spxc-open="SPX-PILOT-01"]').first().click();
  await page.locator('#spxm-question').fill('Did you welcome your election as Pope?');
  await page.locator('#spxm-send').click();
  await page.locator('.spxm-draft').first().waitFor();
  assert.match(await page.locator('.spxm-warning').first().innerText(),/NOT THE WORDS OF ST PIUS X/);
  const firstSource=await page.locator('.spxm-entry a').first().innerText();
  assert.match(firstSource,/NOT COLLATED/);
  if(emitWitnesses){
   assert.match(firstSource,/ES-INTRO-TEARS/);
   assert.match(firstSource,/PIUS X AUTHOR/);
   assert.match(firstSource,/LA/);
   assert.match(await page.locator('.spxm-source-label').first().innerText(),/Matched original-language excerpt locators/);
  }else{
   assert.match(firstSource,/AO.SPX.DIALOGUE.SPX_PILOT_01.OPEN/);
   assert.match(await page.locator('.spxm-source-label').first().innerText(),/Underlying unapproved editorial source pointers/);
  }
  assert.equal(await page.locator('#spxc-portrait').getAttribute('data-expression'),'explaining');
  // A user stays on the election-opening card but asks about the restoration
  // mission; the private source router must switch to the section-eight node.
  await page.locator('#spxm-question').fill('What does restoring everything in Christ mean in the cited passage?');
  await page.locator('#spxm-send').click();
  const secondEntry=page.locator('.spxm-entry').nth(1);
  await secondEntry.locator('.spxm-draft').waitFor();
  const secondSource=await secondEntry.locator('a').first().innerText();
  if(emitWitnesses){
   assert.match(secondSource,/ES-4-MOTTO/);
  }else{
   assert.match(secondSource,/AO.SPX.DIALOGUE.SPX_PILOT_01.FOLLOW_2/);
  }
  assert.match(secondSource,/NOT COLLATED/);

  await page.locator('#spxc-lang').click();
  assert.equal(await page.locator('html').getAttribute('lang'),'fr');
  assert.equal(await page.locator('#spxm-replies .spxm-entry').count(),0,
   'Changing language clears previous-language generated history and display');
  await page.locator('#spxc-lang').click();
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  if(width===390)await page.locator('#spxc-menu').click();
  await page.locator('#spxc-nav [data-spxc-open="SPX-EXP-001"]').first().click();
  await page.locator('#spxm-question').fill('Please tell me about your childhood');
  await page.locator('#spxm-send').click();
  await page.locator('.spxm-held').first().waitFor();
  assert.match(await page.locator('.spxm-held').first().innerText(),/not_papal_primary_document_adaptation/);
  assert.equal(await page.locator('#spxc-portrait').isVisible(),false);
  assert.deepEqual(errs,[]);
  await page.close();
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
console.log('PASS SPX_GENERATIVE_REVIEW: 106 unchanged, model+verifier, precise ID gate, hard abstentions, same-origin localhost, bilingual host, responsive browser');
