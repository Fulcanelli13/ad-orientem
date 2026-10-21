import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
const file=resolve('artifacts/pius-x-study-expanded/SPX_Study_Expanded_82.html');
const html=readFileSync(file,'utf8');
assert(!/<script[^>]+src=/.test(html));
const mark=html.match(/<script type="application\/json" id="spxExpandedCorpus">([\s\S]*?)<\/script>/);
assert(mark);
const d=JSON.parse(mark[1]);
assert.equal(d.counts.chapters,82);
assert.equal(d.counts.allNodes,327);
assert.equal(d.approvals.publishing,false);
const chapters=d.chapters;
assert.equal(new Set(chapters.map(c=>c.id)).size,82);
assert.equal(chapters.flatMap(c=>c.nodes).filter(n=>n.parentId).length,36);
for(const c of chapters){
 assert(c.source.url.startsWith('https://'));
 assert(c.source.locus);
 for(const n of c.nodes){
  assert(n.q.en&&n.q.fr&&n.a.en&&n.a.fr);
  assert((n.source?.url||c.source.url).startsWith('https://'));
 }
}
mkdirSync('artifacts/pius-x-study-expanded/review-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const width of [1280,390]){
  const p=await browser.newPage({viewport:{width,height:844}});
  const errors=[],requests=[];
  p.on('pageerror',e=>errors.push(String(e)));
  p.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  await p.goto(pathToFileURL(file).href,{waitUntil:'load'});
  await p.locator('#spxc-launch').click();
  assert.equal(await p.locator('#spxc-overlay').isVisible(),true);
  if(width===390)await p.locator('#spxc-menu').click();
  await p.locator('[data-spxc-open="SPX-001"]').first().click();
  assert.equal(await p.locator('.spxc-turn').count(),1);
  const rect=await p.locator('.spxc-turn').first().boundingBox();
  assert(rect?.width>(width===1280?480:290),'dialogue column is too narrow on viewport '+width+': '+rect?.width);
  await p.screenshot({path:'artifacts/pius-x-study-expanded/review-screenshots/'+width+'-opening.png'});
  assert.equal(await p.locator('.spxc-choice').count(),3);
  await p.locator('.spxc-choice').first().click();
  assert.equal(await p.locator('.spxc-turn').count(),2);
  await p.locator('[data-spxc-source]').last().click();
  assert.equal(await p.locator('.spxc-cite').isVisible(),true);
  await p.locator('.spxc-cite-close').click();
  if(width===390)await p.locator('#spxc-menu').click();
  await p.locator('[data-spxc-open="SPX-009"]').first().click();
  await p.locator('.spxc-choice').first().click();
  await p.locator('.spxc-next [data-spxc-choose]').last().click();
  assert(await p.locator('.spxc-turn').count()>=2);
  await p.locator('#spxc-lang').click();
  assert.equal(await p.locator('html').getAttribute('lang'),'fr');
  await p.screenshot({path:'artifacts/pius-x-study-expanded/review-screenshots/'+width+'.png'});
  assert.deepEqual(errors,[]);
  assert.deepEqual(requests,[]);
  await p.close();
 }
}finally{await browser.close();}
console.log('PASS SPX_EXPANDED_VISUAL_NOVEL: 82 chapters, 327 nodes, 36 dependent, desktop/mobile, offline');
