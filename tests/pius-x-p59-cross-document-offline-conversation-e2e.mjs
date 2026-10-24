/**
 * P2.59 product-focused offline UX acceptance:
 * - four original papal documents, all eleven original questions
 * - navigate by activating native P6 chapter controls (not synthetic events)
 * - cross-document context reset, true EN/FR reply/source pairing
 * - exact next-question suggestions and no invented text/network
 * - unchanged five-stage visual novel and original 106/423 corpus
 */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
const input='artifacts/pius-x-study-expanded/SPX_P26_Offline_Source_Dialogue_Demo.html';
const html=readFileSync(input,'utf8');
const embedded=id=>{
 const re=new RegExp('<script type="application/json" id="'+id+'">([\\s\\S]*?)<\\/script>');
 const m=html.match(re);assert(m,'missing embedded '+id);
 return JSON.parse(m[1]);
};
const data=embedded('spxOfflineReplayData'),owners=embedded('spxExpandedCorpus');
assert.equal(owners.counts.allNodes,423);
assert.equal(owners.chapters.length,106);
assert.equal(owners.approvals.publishing,false);
assert.equal(data.modelProviderEnabled,false);
assert.equal(data.publishingApproved,false);
assert.equal(data.cases.length,11);
assert.equal(data.documentNavigationCount,4);
assert.equal(data.sourceDocumentNavigation.length,4);
assert(!/<script[^>]+src=/.test(html));
assert(!/<link[^>]+https?:\/\//.test(html));
const docs=data.sourceDocumentNavigation;
assert.deepEqual(docs.map(x=>x.chapterId),[
 'SPX-PILOT-01','SPX-PILOT-09','SPX-029','SPX-NEW-012']);
assert.deepEqual(docs.map(x=>x.questionCount),[3,3,3,2]);
assert.deepEqual(docs.map(x=>x.title),[
 'E supremi','Haerent animo','Il fermo proposito','Tribus circiter']);
for(const doc of docs){
 const original=data.cases.filter(c=>c.chapterId===doc.chapterId);
 assert.deepEqual(doc.exactOriginalNodeIDs,original.map(c=>c.nodeId));
 assert.equal(doc.approvedForPublication,false);
 assert.equal(doc.sourceStatus,'PRIMARY_WITNESS_NAVIGATION_ONLY');
 assert(doc.documentUrl.startsWith('https://www.vatican.va/'));
}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const shots='artifacts/pius-x-study-expanded/review-screenshots/';
mkdirSync(shots,{recursive:true});
try{
 for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[],network=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('request',req=>{if(/^https?:/.test(req.url()))network.push(req.url());});
  await page.goto(pathToFileURL(resolve(input)).href,{waitUntil:'load'});
  await page.locator('#spxc-launch').click();
  if(width===390)await page.locator('#spxc-menu').click();
  await page.locator('[data-spxc-open="SPX-PILOT-01"]').first().click();
  const panel=page.locator('#spxc-offline-replay');
  const nav=page.locator('#spxm-document-explore');
  assert(await panel.isVisible());
  assert.equal(await nav.count(),1);
  assert.equal(await nav.getAttribute('open'),null);
  await nav.locator('summary').click();
  assert.equal(await page.locator('.spxm-document-choice').count(),4);
  assert.equal(await page.locator('.spxm-document-choice:disabled').count(),1);
  assert.equal(await page.locator('.spxm-document-choice:disabled strong').innerText(),'E supremi');
  assert.deepEqual(await page.locator('.spxm-document-choice strong').allInnerTexts(),
   docs.map(d=>d.title));
  // First: free choice yields ORIGINAL answer and suggested exact-source
  // next questions. No generative answer fabrication.
  await page.locator('.spxm-offline-choice').first().click();
  const source=data.cases.filter(x=>x.chapterId==='SPX-PILOT-01');
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').first().innerText(),
   source[0].reply.en);
  assert.equal(await page.locator('.spxm-offline-next-question').count(),2);
  assert.deepEqual(await page.locator('.spxm-offline-next-question').allInnerTexts(),
   source.slice(1).map(c=>c.question.en));
  const marker=source[2].nodeId;
  await page.locator('.spxm-offline-next-question').last().click();
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').count(),2);
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').nth(1).innerText(),
   source[2].reply.en);
  assert.equal(await page.locator('#spxm-offline-replies .spxm-entry').last().getAttribute('data-node-id'),marker);
  await page.locator('#spxm-offline-question').fill('Tell me an unrecorded private memory about your family.');
  await page.locator('#spxm-offline-send').click();
  assert.match(await page.locator('#spxm-offline-replies .spxm-held').last().innerText(),
   /no reviewed offline response/i);
  // Move into the SECOND canonical document using actual P6 navigation.
  await page.locator('.spxm-document-choice[data-document-chapter="SPX-PILOT-09"]').click();
  assert(await panel.isVisible(),'P6 navigation activates destination chapter');
  assert.equal(await page.locator('.spxm-document-choice:disabled strong').innerText(),'Haerent animo');
  assert.equal(await page.locator('#spxm-offline-replies .spxm-entry').count(),0);
  assert.equal(await page.locator('.spxm-offline-choice').count(),3);
  await page.locator('.spxm-offline-choice').first().click();
  const second=data.cases.filter(c=>c.chapterId==='SPX-PILOT-09');
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').first().innerText(),
   second[0].reply.en);
  assert.equal(await page.locator('.spxm-offline-next-question').count(),2);
  // Native source switching must also allow the fourth two-question doc.
  await nav.locator('summary').click();
  await page.locator('.spxm-document-choice[data-document-chapter="SPX-NEW-012"]').click();
  assert.equal(await page.locator('.spxm-document-choice:disabled strong').innerText(),'Tribus circiter');
  assert.equal(await page.locator('.spxm-offline-choice').count(),2);
  await page.locator('#spxm-guided-start').click();
  assert.equal(await page.locator('.spxm-draft').count(),1);
  await page.locator('.spxm-guided-question').click();
  assert.equal(await page.locator('.spxm-draft').count(),2);
  assert.equal(await page.locator('.spxm-guided-question').count(),0);
  assert.equal(await page.locator('.spxm-guided-other-document').count(),1);
  await page.locator('.spxm-guided-other-document').click();
  assert.notEqual(await nav.getAttribute('open'),null);
  await page.locator('.spxm-document-choice[data-document-chapter="SPX-029"]').click();
  assert.equal(await page.locator('.spxm-document-choice:disabled strong').innerText(),'Il fermo proposito');
  assert.equal(await page.locator('#spxm-offline-replies .spxm-entry').count(),0);
  assert.equal(await page.locator('.spxm-offline-choice').count(),3);
  // Locale reset and original witnesses are still coupled to the source owner.
  await page.evaluate(()=>document.dispatchEvent(new CustomEvent('ao-spx-review-context',
   {detail:{chapterId:'SPX-029',language:'fr'}})));
  assert.equal(await page.locator('.spxm-offline-choice').count(),3);
  assert.match(await nav.locator('summary').innerText(),/dialogues documentés/i);
  await page.locator('.spxm-offline-choice').first().click();
  assert.equal(await page.locator('.spxm-draft').first().innerText(),
   data.cases.find(c=>c.chapterId==='SPX-029').reply.fr);
  assert.equal(await page.locator('.spxm-offline-next-question').count(),2);
  assert(await page.locator('.spxm-offline-source').count()>0);
  await page.screenshot({path:shots+'SPX_P59_four_source_offline_navigation_'+width+'.png',
   fullPage:true});
  assert.deepEqual(errors,[]);
  assert.deepEqual(network,[]);
  await page.close();
 }
}finally{await browser.close();}
console.log('PASS SPX_P59_FOUR_ORIGINAL_DOCUMENT_DIALOGUES '+JSON.stringify({
 originalSubjects:106,originalNodes:423,
 originalDocumentCount:4,originalQuestions:11,
 witnessedNavigation:true,sourceWitnessesPreserved:true,
 naturalQuestionFollowupsAreNavigationOnly:true,
 unsupportedPrivateClaimsHeld:true,englishAndFrench:true,
 desktopAndMobile:true,modelAPICalls:0,networkCalls:0,published:false
}));
