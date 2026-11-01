import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';

const baseDir='artifacts/pius-x-study-expanded/';
const sourceHtml=readFileSync(baseDir+'SPX_Study_Expanded_82.html','utf8');
const revisedHtml=readFileSync(baseDir+'SPX_Study_Expanded_94.html','utf8');
const grab=html=>{
 const m=html.match(/<script type="application\/json" id="spxExpandedCorpus">([\s\S]*?)<\/script>/);
 assert(m,'embedded conversation registry missing');
 return JSON.parse(m[1]);
};
const old=grab(sourceHtml),now=grab(revisedHtml);
assert.equal(old.chapters.length,82);
assert.equal(now.chapters.length,94);
assert.equal(now.version,'SPX_94_CHAPTER_375_NODE_UNAPPROVED_LIBRARY_V1');
assert.equal(now.counts.allNodes,375);
assert.equal(now.counts.newDialogueReview.addedChapters,12);
assert.equal(now.counts.newDialogueReview.addedBilingualNodes,48);
assert.equal(now.counts.newDialogueReview.addedFollowupAnswers,36);
assert.equal(now.counts.newDialogueReview.independentlyCollatedSupportingPassages,0);
assert.equal(now.approvals.publishing,false);
assert.deepEqual(now.chapters.slice(0,82),old.chapters,
 'the original 82 chapters and all 327 revised nodes must remain untouched');
const added=now.chapters.slice(82);
assert.equal(added.length,12);
assert.equal(new Set(added.map(c=>c.id)).size,12);
assert.equal(added.reduce((n,c)=>n+c.nodes.length,0),48);
assert(added.every(c=>c.nodes.length===4));
for(const c of added){
 assert(c.source.locus&&c.source.url.startsWith('https://'));
 assert(c.nodes[0].a.en.split(/\s+/).length>=85);
 assert(c.nodes[0].a.fr.split(/\s+/).length>=85);
 assert(c.nodes.every(n=>n.approvedReply===false&&n.publicationEligible===false));
 assert(c.nodes.every(n=>n.depthSourceStatus==='DOCUMENT_LOCATOR_CHECKED_EDITORIAL_CLAIMS_NOT_COLLATED'));
 for(const n of c.nodes.slice(1))
  assert(n.a.en.split(/\s+/).length>=30&&n.a.fr.split(/\s+/).length>=30);
}
assert.equal(added.filter(c=>c.sourceClass==='SOURCE_SCOPE_EDITORIAL_HOLD').length,1);
assert.equal(added.find(c=>c.id==='SPX-NEW-001').source.genre,
 'CONGREGATIONAL_DECREE_PAPAL_APPROVAL_NOT_PAPAL_AUTHORSHIP');
assert.equal(added.filter(c=>c.sourceClass==='PAPAL_DOCUMENT_ADAPTATION').length,11);
const ledger=JSON.parse(readFileSync(baseDir+'SPX_94_Source_Closure_Ledger.json','utf8'));
assert.equal(ledger.entries.length,94);
assert.equal(ledger.counts.nodes,375);
assert.equal(ledger.counts.verifiedOriginalPassageExcerpts,0);
assert(ledger.entries.every(x=>x.publicationEligible===false));
assert(!/<script[^>]+src=/.test(revisedHtml));
assert(!/<link[^>]+https?:\/\//.test(revisedHtml));
mkdirSync(baseDir+'review-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[],requests=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  await page.goto(pathToFileURL(resolve(baseDir+'SPX_Study_Expanded_94.html')).href,{waitUntil:'load'});
  assert.equal(await page.locator('#spxc-launch').innerText(),'Explore 94 conversations');
  await page.locator('#spxc-launch').click();
  assert.equal(await page.locator('#spxc-overlay').isVisible(),true);
  assert(await page.locator('[data-spxc-open="SPX-NEW-001"]').count()>0);
  if(width===390)await page.locator('#spxc-menu').click();
  await page.locator('[data-spxc-open="SPX-NEW-001"]').first().click();
  assert.equal(await page.locator('#spxc-portrait').isVisible(),false,
   'congregational decree must not impersonate papal first-person voice');
  assert.match(await page.locator('.spxc-voice').first().innerText(),/incomplete|incomplète/);
  assert.equal(await page.locator('.spxc-choice').count(),3);
  await page.locator('.spxc-choice').first().click();
  assert.equal(await page.locator('.spxc-turn').count(),2);
  if(width===390)await page.locator('#spxc-menu').click();
  await page.locator('[data-spxc-open="SPX-NEW-010"]').first().click();
  assert.equal(await page.locator('#spxc-portrait').isVisible(),true);
  assert.match(await page.locator('.spxc-topic-title').innerText(),/Indigenous/);
  await page.locator('[data-spxc-source]').first().click();
  assert.equal(await page.locator('.spxc-cite').isVisible(),true);
  assert.equal(await page.locator('.spxc-cite a[href^="https://"]').count(),1);
  await page.locator('.spxc-cite-close').click();
  await page.locator('#spxc-lang').click();
  assert.equal(await page.locator('html').getAttribute('lang'),'fr');
  assert.match(await page.locator('.spxc-topic-title').innerText(),/autochtones/);
  await page.screenshot({path:baseDir+'review-screenshots/'+width+'-new-dialogues.png'});
  assert.deepEqual(errors,[],'runtime error in '+width+'px viewport');
  assert.deepEqual(requests,[],'unexpected network request in offline review '+width);
  await page.close();
 }
}finally{await browser.close();}
console.log('PASS SPX_94_DIALOGUE_DESKTOP_MOBILE: 94 chapters, 375 answers, 12 new chapters, 48 new EN/FR nodes, zero network');
