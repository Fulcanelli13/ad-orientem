import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const assets=resolve(root,'research-out/pius-x-depth12-review-sprites');
const manifest=JSON.parse(await readFile(resolve(assets,'manifest.json'),'utf8'));
const poses=['neutral','welcoming','explaining','thoughtful','grave'];
const images={};
for(const pose of poses){
 const name='pius_'+pose+'.webp',bytes=await readFile(resolve(assets,name));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.variants[name].sha256);
 images[name]=bytes;
}
const file='/previews/pius-x-second-eight-first-release-source-locked-20261021.html';
const server=http.createServer(async(req,res)=>{
 try{
  const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),target=resolve(root,'.'+p);
  if(!target.startsWith(root+sep))throw Error('forbidden');
  const data=await readFile(target);res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(data);
 }catch(e){res.writeHead(404);res.end(String(e))}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const assetOrigin='https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/2245d762237ef36fc778200ab2b3d536c342d2d4/previews/visible-mass-3d/assets/living-church/';
const out=resolve(root,'artifacts/pius-x-second-eight-browser');
await mkdir(out,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const viewport of [{width:390,height:844,isMobile:true,hasTouch:true},{width:1280,height:800,isMobile:false,hasTouch:false}]){
  const context=await browser.newContext({viewport,isMobile:viewport.isMobile,hasTouch:viewport.hasTouch,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.route('**/*',route=>{
   const url=route.request().url();
   if(url.startsWith(assetOrigin)){
    const name=url.slice(assetOrigin.length);
    if(!images[name])return route.abort();
    return route.fulfill({status:200,contentType:'image/webp',body:images[name]});
   }
   if(url.startsWith(origin))return route.continue();
   return route.abort();
  });
  await page.goto(origin+file,{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('#chapters option').count(),8);
  assert.match(await page.locator('#answer').innerText(),/It strengthens a Christian/);
  await page.locator('#actions button').first().click();
  assert.match(await page.locator('#question').innerText(),/already baptized/);
  await page.locator('#actions button').first().click();
  assert.match(await page.locator('#question').innerText(),/Who confers/);
  assert.equal(await page.locator('#back').isEnabled(),true,'after moving forward Back must remain enabled');
  await page.locator('#back').scrollIntoViewIfNeeded();
  await page.locator('#back').click({timeout:12000});
  await page.locator('#lang').click();
  assert.match(await page.locator('#question').innerText(),/déjà baptisé/);
  await page.locator('#lang').click();

  await page.locator('#chapters').selectOption('SPX-013');
  assert.match(await page.locator('#answer').innerText(),/Blessed Virgin/);
  await page.locator('#sourceToggle').click();
  assert.equal(await page.locator('#evidence').evaluate(x=>x.open),true);
  assert.match(await page.locator('#sourceFull a').getAttribute('href'),/^https:\/\/www\.vatican\.va\//);
  await page.locator('#reviewToggle').click();
  assert.equal(await page.locator('#evidence').evaluate(x=>x.open),false);
  assert.equal(await page.locator('#review').evaluate(x=>x.open),true);
  await page.locator('#pace').selectOption('4');
  await page.locator('#voice').selectOption('3');
  await page.locator('#clarity').selectOption('5');
  await page.locator('#notes').fill('The source notes remain outside Pius X’s dialogue.');
  await page.evaluate(()=>{const original=URL.createObjectURL.bind(URL);URL.createObjectURL=blob=>{window.__ratingsBlob=blob;return original(blob)}});
  await page.locator('#exportTop').click();
  const data=await page.evaluate(async()=>window.__ratingsBlob?JSON.parse(await window.__ratingsBlob.text()):null);
  assert.equal(data.schema,'AO_SPX_P1_SECOND_EIGHT_SOURCE_LOCKED_REVIEW_RATINGS_V1');
  assert.equal(data.ratings['SPX-013'].pacing,'4');

  await page.locator('#chapters').selectOption('SPX-PILOT-07');
  await page.locator('#actions button').click();
  await page.locator('#actions button').click();
  assert.match(await page.locator('#who').innerText(),/EDITORIAL NOTE/);
  assert.equal(await page.locator('#sprite').isVisible(),false,'historical portrait must not deliver editorial personal classification');

  await page.locator('#chapters').selectOption('SPX-026');
  await page.locator('#actions button').click();
  await page.locator('#actions button').click();
  assert.match(await page.locator('#who').innerText(),/EDITORIAL NOTE/);
  assert.equal(await page.locator('#sprite').isVisible(),false,'do not make Pius X adjudicate current Sunday obligations');

  await page.locator('#chapters').selectOption('SPX-001');
  assert.match(await page.locator('#answer').innerText(),/sacrifice of the Body and Blood/);
  assert.equal(await page.locator('#sprite').evaluate(x=>x.naturalWidth>0),true);
  const width=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,view:innerWidth}));
  assert(width.doc<=width.view+3&&width.body<=width.view+3,'no horizontal overflow');
  assert.deepEqual(errors,[],'browser JS errors');
  await page.screenshot({path:resolve(out,'pius-x-second-eight-'+viewport.width+'.png'),fullPage:true});
  await context.close();
 }
 console.log('PASS SPX second eight Chromium 390/1280: 8 scenes, EN/FR, parent continuity, source panel, export, both editorial holdbacks, original hashed sprites.');
}finally{await browser?.close();await new Promise(done=>server.close(done))}
