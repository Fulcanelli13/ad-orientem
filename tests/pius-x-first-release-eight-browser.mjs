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
const sprite={};
for(const pose of poses){
 const name='pius_'+pose+'.webp',bytes=await readFile(resolve(assets,name));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.variants[name].sha256);
 sprite[name]=bytes;
}
const pagePath='/previews/pius-x-eight-first-release-source-locked-20261021.html';
const server=http.createServer(async(req,res)=>{
 try{
  const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=resolve(root,'.'+p);if(!file.startsWith(root+sep))throw Error('forbidden');
  const content=await readFile(file);res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(content);
 }catch(e){res.writeHead(404);res.end(String(e))}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const local='http://127.0.0.1:'+server.address().port;
const imageBase='https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/2245d762237ef36fc778200ab2b3d536c342d2d4/previews/visible-mass-3d/assets/living-church/';
const artifacts=resolve(root,'artifacts/pius-x-first-release-eight-browser');
await mkdir(artifacts,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const vp of [{width:390,height:844,isMobile:true,hasTouch:true},{width:1280,height:800,isMobile:false,hasTouch:false}]){
  const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.isMobile,hasTouch:vp.hasTouch,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.route('**/*',route=>{
   const url=route.request().url();
   if(url.startsWith(imageBase)){
    const name=url.slice(imageBase.length);
    if(!sprite[name])return route.abort();
    return route.fulfill({status:200,contentType:'image/webp',body:sprite[name]});
   }
   if(url.startsWith(local)||url.startsWith('blob:'))return route.continue();
   return route.abort();
  });
  await page.goto(local+pagePath,{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('#chapters option').count(),8);
  assert.match(await page.locator('#answer').innerText(),/Before confession, ask God for help/);
  assert.equal(await page.locator('#actions button').count(),1);
  await page.locator('#actions button').click();
  assert.match(await page.locator('#question').innerText(),/bad thought already a sin/);
  await page.locator('#actions button').click();
  assert.match(await page.locator('#answer').innerText(),/fixed number of minutes/);
  assert.equal(await page.locator('#actions button').count(),2);
  await page.locator('#back').click();
  assert.match(await page.locator('#question').innerText(),/bad thought/);
  await page.locator('#lang').click();
  assert.match(await page.locator('#answer').innerText(),/mauvaise pensée/);
  await page.locator('#lang').click();
  await page.locator('#chapters').selectOption('SPX-035');
  assert.match(await page.locator('#answer').innerText(),/Sacred reading should accompany/);
  await page.locator('#sourceToggle').click();
  assert.equal(await page.locator('#evidence').evaluate(x=>x.open),true);
  assert.match(await page.locator('#sourceFull a').getAttribute('href'),/^https:\/\/www\.vatican\.va\//);
  await page.locator('#reviewToggle').click();
  assert.equal(await page.locator('#evidence').evaluate(x=>x.open),false);
  assert.equal(await page.locator('#review').evaluate(x=>x.open),true);
  await page.locator('#pace').selectOption('4');
  await page.locator('#voice').selectOption('3');
  await page.locator('#clarity').selectOption('5');
  await page.locator('#notes').fill('Concise enough for the stage.');
  await page.evaluate(()=>{
   const orig=URL.createObjectURL.bind(URL);
   URL.createObjectURL=blob=>{window.__exportBlob=blob;return orig(blob)};
  });
  await page.locator('#exportTop').click();
  const data=await page.evaluate(async()=>window.__exportBlob?JSON.parse(await window.__exportBlob.text()):null);
  assert.equal(data.schema,'AO_SPX_P1_EIGHT_SOURCE_LOCKED_REVIEW_RATINGS_V1');
  assert.equal(data.ratings['SPX-035'].pacing,'4');
  assert.equal(data.ratings['SPX-035'].notes,'Concise enough for the stage.');
  await page.locator('#chapters').selectOption('SPX-005');
  assert.match(await page.locator('#sourceLine').innerText(),/Catechismo maggiore/);
  assert.equal(await page.locator('#sprite').evaluate(x=>x.naturalWidth>0),true,'approved sprite decoded');
  const widths=await page.evaluate(()=>({html:document.documentElement.scrollWidth,body:document.body.scrollWidth,window:innerWidth}));
  assert(widths.html<=widths.window+3&&widths.body<=widths.window+3,'no horizontal overflow '+JSON.stringify(widths));
  assert.deepEqual(errors,[]);
  await page.screenshot({path:resolve(artifacts,'pius-eight-'+vp.width+'.png'),fullPage:true});
  await context.close();
 }
 console.log('PASS 8 first-release SPX EN/FR scenes on Chromium 390px and 1280px, original hashed sprite, Q&A continuity, source panel, review export, no overflow.');
}finally{await browser?.close();await new Promise(done=>server.close(done));}
