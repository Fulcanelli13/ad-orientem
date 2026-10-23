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
assert.equal(d.counts.editorialReview.expandedOpenings,82);
assert.equal(d.counts.editorialReview.unexpandedOpenings,0);
assert.equal(d.counts.followupReview.allFollowups,245);
assert.equal(d.counts.followupReview.extended,245);
assert.equal(d.counts.followupReview.unexpanded,0);
assert.equal(d.counts.followupReview.frenchExtensions,245);
const preservedRaw=d.chapters.flatMap(c=>c.nodes.slice(1)).filter(n=>n.voiceReview);
for(const n of preservedRaw){
 assert(n.originalDraft.en!==n.previousDraft.en||n.originalDraft.fr!==n.previousDraft.fr,
  'period-voice normalization destroyed original text witness '+n.id);
}
assert.deepEqual(d.counts.followupReview.unexpandedNodeIds,[]);
const expandedFollowups=d.chapters.flatMap(c=>c.nodes.slice(1));
assert.equal(expandedFollowups.length,245);
for(const n of expandedFollowups){
 assert.equal(n.editorialDepth,'ENRICHED_FOLLOWUP_UNAPPROVED','followup missing editorial addition: '+n.id);
 assert(n.originalDraft?.en&&n.originalDraft?.fr,'missing original short followup: '+n.id);
 assert(n.depthSourceStatus==='INHERITED_CHAPTER_LOCATOR_NOT_INDEPENDENTLY_COLLATED');
 assert(n.a.en.split(/\s+/).length>=45&&n.a.fr.split(/\s+/).length>=45,
  'followup insufficient context in both languages: '+n.id);
 assert(n.previousDraft?.en&&n.previousDraft?.fr,'missing pre-expansion, period-voice-normalized draft: '+n.id);
 assert(n.a.en.startsWith(n.previousDraft.en)&&n.a.fr.startsWith(n.previousDraft.fr),
  'source-owned answer not preserved as first paragraph: '+n.id);
}

assert.equal(d.counts.sourceClassCounts.BIOGRAPHICAL_NARRATOR,9);
assert.equal(d.counts.sourceClassCounts.PAPAL_DOCUMENT_ADAPTATION,29);
assert.equal(d.counts.sourceClassCounts.SOURCE_SCOPE_EDITORIAL_HOLD,6);
assert.equal(d.counts.sourceClassCounts.CATECHETICAL_ADAPTATION,38);
for(const id of ['SPX-013','SPX-EXP-031']){
 assert.equal(d.chapters.find(c=>c.id===id).sourceClass,'PAPAL_DOCUMENT_ADAPTATION',
  'original encyclical witness must outrank mixed inherited catechism label');
}
for(const id of ['SPX-EXP-029','SPX-EXP-041']){
 assert.equal(d.chapters.find(c=>c.id===id).sourceClass,'CATECHETICAL_ADAPTATION',
  'historical longer catechism must not be spoken as personal papal testimony');
}
assert.equal(d.chapters.filter(c=>c.partial).length,19);

assert.equal(d.approvals.publishing,false);
const fullDrafts=d.chapters.filter(c=>c.nodes[0].editorialDepth==='ENRICHED_OPENING_UNAPPROVED');
assert.equal(fullDrafts.length,82);
assert(d.chapters.every(c=>c.nodes[0].originalDraft?.en&&c.nodes[0].originalDraft?.fr));
assert(d.chapters.every(c=>c.nodes[0].depthSourceStatus==='INHERITED_CHAPTER_LOCATOR_NOT_INDEPENDENTLY_COLLATED'));
assert.equal(d.counts.allNodes,327);
const frenchAll=d.chapters.flatMap(c=>c.nodes.map(n=>n.a.fr)).join(' ');
assert(frenchAll.includes('âmes'),'accented French words must remain intact');
for(const c of fullDrafts){
 assert(c.nodes[0].originalDraft?.en&&c.nodes[0].originalDraft?.fr);
 assert(c.nodes[0].a.en.split(/\s+/).length>=90);
 assert(c.nodes[0].a.fr.split(/\s+/).length>=90);
}
for(const c of d.chapters.filter(c=>c.sourceClass==='PAPAL_DOCUMENT_ADAPTATION')){
 for(const n of c.nodes){
  assert(!/\b(I|my|me|mine|myself)\b/.test(n.a.en),'singular English papal voice '+n.id);
  assert(!/(?<![\p{L}\p{N}])(?:je|mon|ma|mes|moi|me)(?![\p{L}\p{N}])|(?<![\p{L}\p{N}])j[’']/iu.test(n.a.fr),'singular French papal voice '+n.id);
 }
}
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
  assert.match(await p.locator('#spxc-launch').innerText(),/82/);
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
  await p.locator('.spxc-choice').last().click();
  assert.equal(await p.locator('.spxc-turn').count(),2,'alternative followup must replace rather than append an unrelated branch');
  assert.equal(await p.locator('#spxc-portrait').isVisible(),false,'catechetical text must not impersonate the Pope');
  await p.locator('[data-spxc-source]').last().click();
  assert.equal(await p.locator('.spxc-cite').isVisible(),true);
  await p.locator('.spxc-cite-close').click();
  if(width===390)await p.locator('#spxc-menu').click();
  await p.locator('[data-spxc-open="SPX-EXP-015"]').first().click();
  assert.match(await p.locator('.spxc-voice').first().innerText(),/incomplete|incomplète/i);
  assert.doesNotMatch(await p.locator('.spxc-voice').first().innerText(),/biography|biographie/i);
  assert.equal(await p.locator('#spxc-portrait').isVisible(),false);
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
