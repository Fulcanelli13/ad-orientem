import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
const dir='artifacts/pius-x-study-expanded/';
const text94=readFileSync(dir+'SPX_Study_Expanded_94.html','utf8');
const text106=readFileSync(dir+'SPX_Study_Expanded_106.html','utf8');
function corpus(s){
 const match=s.match(/<script type="application\/json" id="spxExpandedCorpus">([\s\S]*?)<\/script>/);
 assert(match,'missing standalone corpus');return JSON.parse(match[1]);
}
const b=corpus(text94),r=corpus(text106);
assert.equal(b.chapters.length,94);
assert.equal(r.chapters.length,106);
assert.equal(r.counts.allNodes,423);
assert.equal(r.counts.regularNodes,387);
assert.equal(r.counts.dependentNodes,36);
assert.equal(r.counts.thirdDialogueExpansion.addedChapters,12);
assert.equal(r.counts.thirdDialogueExpansion.addedNodes,48);
assert.equal(r.approvals.publishing,false);
assert.deepEqual(r.chapters.slice(0,94),b.chapters,'baseline 375 responses must be immutable');
const added=r.chapters.slice(94);
assert.deepEqual(added.map(c=>c.id),Array.from({length:12},(_,i)=>'SPX-NEW-'+String(13+i).padStart(3,'0')));
assert.equal(added.reduce((n,c)=>n+c.nodes.length,0),48);
assert(added.every(c=>c.sourceClass==='PAPAL_DOCUMENT_ADAPTATION'));
for(const c of added){
 assert(c.source.url.startsWith('https://www.vatican.va/'));
 assert(c.source.locus);
 assert(c.nodes.length===4);
 for(const [i,n] of c.nodes.entries()){
  assert(n.approvedReply===false&&n.publicationEligible===false);
  assert(n.q.en&&n.q.fr&&n.a.en&&n.a.fr);
  assert.equal(n.editorialDepth,'NEW_P4_DIALOGUE_UNAPPROVED');
  assert(n.a.en.split(/\s+/).length>=(i?30:90));
  assert(n.a.fr.split(/\s+/).length>=(i?30:90));
 }
}
const ledger=JSON.parse(readFileSync(dir+'SPX_106_Source_Closure_Ledger.json','utf8'));
assert.equal(ledger.entries.length,106);
assert.equal(ledger.counts.nodes,423);
assert.equal(ledger.counts.verifiedOriginalPassageExcerpts,0);
assert(ledger.entries.every(x=>x.publicationEligible===false));
assert(!/<script[^>]+src=/.test(text106));
assert(!/<link[^>]+https?:\/\//.test(text106));
mkdirSync(dir+'review-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const width of [1280,390]){
  const p=await browser.newPage({viewport:{width,height:844}});
  const errors=[],requests=[];
  p.on('pageerror',e=>errors.push(String(e)));
  p.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  await p.goto(pathToFileURL(resolve(dir+'SPX_Study_Expanded_106.html')).href,{waitUntil:'load'});
  assert.equal(await p.locator('#spxc-launch').innerText(),'Explore 106 conversations');
  await p.locator('#spxc-launch').click();
  assert.equal(await p.locator('#spxc-overlay').isVisible(),true);
  if(width===390)await p.locator('#spxc-menu').click();
  await p.locator('[data-spxc-open="SPX-NEW-020"]').first().click();
  assert.match(await p.locator('.spxc-topic-title').innerText(),/fiftieth anniversary/i);
  assert.equal(await p.locator('.spxc-choice').count(),3);
  assert.equal(await p.locator('#spxc-portrait').isVisible(),true);
  await p.locator('.spxc-choice').first().click();
  assert.equal(await p.locator('.spxc-turn').count(),2);
  await p.locator('.spxc-choice').last().click();
  assert.equal(await p.locator('.spxc-turn').count(),2,'alternative branch must replace sibling');
  await p.locator('[data-spxc-source]').last().click();
  assert.equal(await p.locator('.spxc-cite').isVisible(),true);
  assert.equal(await p.locator('.spxc-cite a[href^="https://"]').count(),1);
  await p.locator('.spxc-cite-close').click();
  await p.locator('#spxc-lang').click();
  assert.equal(await p.locator('html').getAttribute('lang'),'fr');
  assert.match(await p.locator('.spxc-topic-title').innerText(),/cinquantième anniversaire/i);
  await p.screenshot({path:dir+'review-screenshots/'+width+'-106-questions.png'});
  assert.deepEqual(errors,[]);
  assert.deepEqual(requests,[],'standalone HTML unexpectedly loaded internet');
  await p.close();
 }
}finally{await browser.close();}
console.log('PASS SPX_106_BROWSER_BILINGUAL: 106 subjects, 423 answers, 375 preserved; phone/desktop, offline');
