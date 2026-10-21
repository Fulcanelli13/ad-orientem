import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
const file=resolve('previews/pius-x-study/SPX_Study_Standalone_20261021.html');
const html=readFileSync(file,'utf8');
assert(html.length>400000,'HTML source is unexpectedly small; six approved images must be embedded');
assert(!/<script[^>]*src=/i.test(html),'standalone file may not depend on external JavaScript');
assert(!/<link[^>]+(?:stylesheet|https?:)/i.test(html),'no stylesheet external dependencies');
const found=html.match(/<script type="application\/json" id="spxData">([\s\S]*?)<\/script>/);
assert(found,'data must be embedded as JSON, not fetched at runtime');
const data=JSON.parse(found[1]);
assert.equal(data.version,'SPX_STUDY_PLAYABLE_REVIEW_V1');
assert.equal(data.status,'REVIEW_ONLY_UNAPPROVED_ADAPTED_DIALOGUE');
assert.equal(data.docs.length,3);
assert.deepEqual(data.docs.map(d=>d.turns.length),[11,10,13]);
const turns=data.docs.flatMap(d=>d.turns);
assert.equal(turns.length,34);
assert.equal(turns.reduce((n,t)=>n+t.segments.length,0),68);
for(const d of data.docs){
 assert(Object.values(d.urls).every(s=>s.startsWith('https://www.vatican.va/')));
 for(const turn of d.turns){
  assert(turn.question.en.length>10&&turn.question.fr.length>10);
  for(const seg of turn.segments){
   assert(seg.en.length>20&&seg.fr.length>20);
   assert(seg.claims.length>=1);
   assert(seg.claims.every(c=>/^§/.test(c.locus)&&/^([AEH])\d\d$/.test(c.id)));
  }
 }
}
for(const k of ['study','neutral','welcoming','explaining','thoughtful','grave'])assert(data.art[k].startsWith('data:image/webp;base64,UklG'),k+' WebP is missing');
assert.deepEqual(data.provenance.dataOwners.map(x=>x.path),[
 'data/learn/research/pius-x-document-first-three-benchmark-source-map-20261021.v1.json',
 'data/learn/research/pius-x-document-first-remaining-acerbo-esupremi-20261021.v1.json',
 'data/learn/research/pius-x-document-first-remaining-haerent-20261021.v1.json',
 'data/learn/research/pius-x-document-first-34-editorial-corrections-20261021.v1.json']);
assert.equal(turns.find(t=>t.id==='SPX.BENCH.ACERBO.T7').segments[1].claims[0].id,'A16');
assert(turns.find(t=>t.id==='SPX.BENCH.ACERBO.T7').segments[1].en.includes('ornate sermon'));
assert(turns.find(t=>t.id==='SPX.BENCH.HAERENT.T11').segments[1].en.includes('offered'));
mkdirSync('artifacts/pius-x-study-review',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let imagesDecoded=0;
try{
 for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1});
  const errors=[];const blockedRequests=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('request',r=>{if(/^https?:/i.test(r.url()))blockedRequests.push(r.url());});
  await page.goto(pathToFileURL(file).href,{waitUntil:'load'});
  await page.waitForSelector('#folioContent .dialog-title');
  assert.match(await page.locator('.dialog-title').innerText(),/conversation with the sources/i);
  assert.equal(await page.locator('#portrait').evaluate(e=>e.complete&&e.naturalWidth>0),true,'Approved sprite failed to render');
  imagesDecoded++;
  await page.locator('#folioContent [data-open="SPX.BENCH.E_SUPREMI.T1"]').click();
  assert.match(await page.locator('.dialog-title').innerText(),/purpose did you set/i);
  await page.locator('[data-next="1"]').click();
  assert.match(await page.locator('.dialogue').last().innerText(),/We denied|We.*design/i);
  await page.locator('[data-source="1"]').click();
  assert.equal(await page.locator('#citation').isVisible(),true);
  assert.match(await page.locator('#citation .cite-name').innerText(),/E supremi/);
  assert(await page.locator('#citation a[href*="vatican.va"]').count()>=1);
  await page.locator('[data-close="1"]').click();
  await page.locator('#langBtn').click();
  assert.equal(await page.locator('html').getAttribute('lang'),'fr');
  assert.match(await page.locator('.dialog-title').innerText(),/pontificat/i);
  await page.locator('#searchBtn').click();
  await page.locator('#askInput').fill('catéchisme pour les adultes');
  await page.locator('#askForm button[type="submit"]').click();
  assert(await page.locator('.choices .choice').count()>=1,'Expected source navigation choices in French');
  // Any arbitrary query must NOT produce speech. It offers source topics instead.
  await page.locator('#askInput').fill('quantum astrophysique girafe banana');
  await page.locator('#askForm button[type="submit"]').click();
  assert.match(await page.locator('.discreet-note').first().innerText(),/Aucune correspondance/i);
  assert.equal(await page.locator('.editor-label').count(),0,'Unsupported input must not create papal dialogue');
  if(width===390){
   await page.locator('#libraryBtn').click();
   assert.equal(await page.locator('#library').getAttribute('data-open'),'true');
   await page.locator('[data-doc="HAERENT"]').click();
   assert.match(await page.locator('.dialog-title').innerText(),/Haerent animo/i);
   await page.locator('[data-open="SPX.BENCH.HAERENT.T7"]').first().click();
   assert.equal(await page.locator('#portrait').evaluate(e=>e.complete&&e.naturalWidth>0),true);
  }
  await page.screenshot({path:'artifacts/pius-x-study-review/'+(width===390?'mobile':'desktop')+'.png',fullPage:true});
  assert.deepEqual(errors,[],'Browser errors');
  assert.deepEqual(blockedRequests,[],'Standalone HTML must work without HTTP requests');
  await page.close();
 }
}finally{await browser.close();}
console.log('PASS SPX_STUDY_STANDALONE',{turns:34,segments:68,sprites:5,background:1,assetsDecoded:imagesDecoded,widths:[1280,390],externalRequests:0,publishedResponses:0});
