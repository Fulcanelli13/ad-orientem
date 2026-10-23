import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';

const out='artifacts/pius-x-study-expanded/';
const file=out+'SPX_P26_Offline_Source_Dialogue_Demo.html';
const html=readFileSync(file,'utf8');
const parsed=html.match(/<script type="application\/json" id="spxOfflineReplayData">([\s\S]*?)<\/script>/);
const owner=html.match(/<script type="application\/json" id="spxExpandedCorpus">([\s\S]*?)<\/script>/);
assert(parsed&&owner,'Original P6 corpus and review data must remain separately accessible');
const data=JSON.parse(parsed[1]),corpus=JSON.parse(owner[1]);
assert.equal(data.schema,'AO_SPX_P26_OFFLINE_REVIEW_CASES_V1');
assert.equal(data.status,'PRIVATE_STATIC_NO_MODEL_INFERENCE');
assert.equal(data.modelProviderEnabled,false);
assert.equal(data.publishingApproved,false);
assert.equal(data.canonicalChapters,4);
assert.equal(data.canonicalNodes,11);
assert.equal(data.bilingualEditorialPairs,22);
assert.equal(data.originalWitnessFragments,18);
assert.equal(data.originalCorpusNodes,423);
assert.equal(data.cases.length,11);
assert.equal(corpus.counts.allNodes,423);
assert.equal(corpus.chapters.length,106);
assert.equal(corpus.approvals.publishing,false);
assert(!/<script[^>]+src=/.test(html));
assert(!/<link[^>]+https?:\/\//.test(html));
assert(!html.includes('AO_SPX_MODEL_KEY'));
const keyed=new Set(data.cases.map(c=>c.nodeId));
assert.equal(keyed.size,11);
const seen=new Set();
for(const row of data.cases){
 const chapter=corpus.chapters.find(c=>c.id===row.chapterId);
 const node=chapter?.nodes.find(n=>n.id===row.nodeId);
 assert(chapter&&node&&chapter.sourceClass==='PAPAL_DOCUMENT_ADAPTATION');
 assert.deepEqual(row.question,node.q);
 assert.equal(row.publishingApproved,false);
 assert.equal(row.fullClaimReviewCertified,false);
 assert.equal(row.bilingualTranslationsCertified,false);
 assert(row.reply.en.length>=85&&row.reply.fr.length>=85);
 for(const w of row.witnesses){
  assert(w.sourceUrl.startsWith('https://www.vatican.va/'));
  assert(['la','it'].includes(w.originalLanguage));
  assert.equal(w.speaker,'PIUS_X_AUTHOR');
  assert(w.text.length>=12);
  seen.add(w.id);
 }
}
assert.equal(seen.size,18);
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const screenshots=out+'review-screenshots/';
mkdirSync(screenshots,{recursive:true});
try{
 for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[],requests=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url());});
  await page.goto(pathToFileURL(resolve(file)).href,{waitUntil:'load'});
  assert.equal(await page.locator('#spxc-offline-replay').count(),1);
  await page.locator('#spxc-launch').click();
  if(width===390)await page.locator('#spxc-menu').click();
  await page.locator('[data-spxc-open="SPX-PILOT-01"]').first().click();
  assert.equal(await page.locator('#spxc-offline-replay').isVisible(),true);
  assert.equal(await page.locator('.spxm-offline-choice').count(),3);
  await page.locator('.spxm-offline-choice').first().click();
  const first=page.locator('#spxm-offline-replies .spxm-entry').first();
  await first.locator('.spxm-draft').waitFor();
  assert.equal(await first.locator('.spxm-draft').innerText(),
   data.cases.find(c=>c.chapterId==='SPX-PILOT-01').reply.en);
  assert.match(await first.locator('.spxm-warning').innerText(),
   /NOT THE VERBATIM WORDS OF ST PIUS X/);
  assert.equal(await first.locator('details.spxm-offline-source').count(),3);
  await first.locator('details.spxm-offline-source summary').first().click();
  assert.match(await first.locator('details.spxm-offline-source').first().innerText(),
   /quibus Nos lacrymis/);
  assert.equal(await first.locator('details.spxm-offline-source a').first().getAttribute('href'),
   'https://www.vatican.va/content/pius-x/la/encyclicals/documents/hf_p-x_enc_04101903_e-supremi.html');
  await page.locator('#spxm-offline-question').fill('Tell me something you never recorded about your family.');
  await page.locator('#spxm-offline-send').click();
  const second=page.locator('#spxm-offline-replies .spxm-entry').nth(1);
  assert.match(await second.locator('.spxm-held').innerText(),/no reviewed offline response/i);
  assert.equal(await second.locator('.spxm-draft').count(),0);
  await page.locator('#spxc-lang').click();
  assert.equal(await page.locator('html').getAttribute('lang'),'fr');
  assert.equal(await page.locator('#spxm-offline-replies .spxm-entry').count(),0);
  assert.equal(await page.locator('.spxm-offline-choice').count(),3);
  await page.locator('.spxm-offline-choice').first().click();
  const french=page.locator('#spxm-offline-replies .spxm-entry').first();
  await french.locator('.spxm-draft').waitFor();
  assert.equal(await french.locator('.spxm-draft').innerText(),
   data.cases.find(c=>c.chapterId==='SPX-PILOT-01').reply.fr);
  assert.match(await french.locator('.spxm-warning').innerText(),/NON PAROLES TEXTUELLES/);
  if(width===390)await page.locator('#spxc-menu').click();
  await page.locator('#spxc-nav [data-spxc-open="SPX-NEW-012"]').first().click();
  assert.equal(await page.locator('.spxm-offline-choice').count(),2);
  assert.equal(await page.locator('#spxm-offline-replies .spxm-entry').count(),0);
  await page.locator('.spxm-offline-choice').first().click();
  assert.match(await page.locator('#spxm-offline-replies .spxm-draft').first().innerText(),
   /association fut supprimée/);
  await page.screenshot({path:screenshots+width+'-p26-offline-bilingual.png'});
  assert.deepEqual(errors,[],'No inline script exceptions');
  assert.deepEqual(requests,[],'No external HTTP(S) network requests during offline replay');
  await page.close();
 }
}finally{await browser.close();}
console.log('PASS SPX_P26_OFFLINE_REPLAY: one HTML, original 423 nodes, four papal chapters, 11 source-owned questions, 22 EN/FR responses, exact 18 Latin/Italian snippets, two viewport/language flows, no model or external requests');
