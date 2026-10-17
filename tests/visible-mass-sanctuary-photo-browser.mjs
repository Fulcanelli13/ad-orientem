import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const target='/previews/visible-mass-3d/sanctuary-hotspot-pilot.html';
const mime={'.html':'text/html; charset=utf-8','.json':'application/json; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 try {
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end('forbidden');return;}
  const bytes=await readFile(file);
  res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream','cache-control':'no-store'});
  res.end(bytes);
 }catch(e){res.writeHead(e.code==='ENOENT'?404:500);res.end(String(e.message||e));}
});
await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok);});
const port=server.address().port;
const screenshotDir=resolve(root,'dist/visible-mass/sanctuary-qa');
await mkdir(screenshotDir,{recursive:true});
let browser;
const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 859"><rect width="1280" height="859" fill="#29303a"/><rect x="370" y="200" width="550" height="550" fill="#5a5040"/><text x="640" y="420" text-anchor="middle" font-size="26" fill="white">Image intercepted: testing interaction, not photographic accuracy</text></svg>';
try{
 browser=await chromium.launch({headless:true});
 for(const spec of [{name:'desktop',width:1280,height:800,mobile:false},{name:'phone',width:390,height:844,mobile:true}]){
  const context=await browser.newContext({viewport:{width:spec.width,height:spec.height},deviceScaleFactor:spec.mobile?2:1,isMobile:spec.mobile,hasTouch:spec.mobile});
  const page=await context.newPage(); const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.route(/^https:\/\/(?:thumb|upload)\.wikimedia\.org\//,r=>r.fulfill({status:200,contentType:'image/svg+xml',body:svg}));
  await page.goto('http://127.0.0.1:'+port+target,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT?.status().questionsLoaded===134,{timeout:30000});
  const first=page.locator('.marker[data-object="AL01"]');
  assert.equal(await page.locator('.marker').count(),6);
  if(spec.mobile){
   await first.scrollIntoViewIfNeeded();
   await page.screenshot({path:screenshotDir+'/phone-before-tap.png'});
   const probe=await page.evaluate(()=>{
    const b=document.querySelector('.marker[data-object="AL01"]');
    const r=b.getBoundingClientRect(),vp=document.querySelector('#photo-viewport').getBoundingClientRect();
    const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return {documentWidth:document.documentElement.scrollWidth,viewportWidth:window.innerWidth,scrollX:window.scrollX,scrollY:window.scrollY,photoViewport:{x:vp.x,y:vp.y,width:vp.width,height:vp.height},marker:{x:r.x,y:r.y,width:r.width,height:r.height},hit:hit?.tagName,hitClass:hit?.getAttribute('class'),hitId:hit?.id};
   });
   console.log('PHOTO_PHONE_TAP_DIAGNOSTIC',JSON.stringify(probe));
  }
  await first.click();
  assert.equal(await page.locator('#object-title').innerText(),'High altar');
  assert.equal(await page.locator('#question-items button').count(),4);
  const stat=await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status());
  assert.equal(stat.selected,'AL01');
  if(spec.mobile){
   assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('object-open')),true,'body mobile open');
   assert.equal(await page.locator('#info').evaluate(e=>getComputedStyle(e).position),'fixed','mobile should use overlay');
   await page.waitForTimeout(160);
   const pos=await page.evaluate(()=>{
     const marker=document.querySelector('.marker[data-object="AL01"]').getBoundingClientRect();
     const sheet=document.querySelector('#info').getBoundingClientRect();
     return {markerBottom:marker.bottom,sheetTop:sheet.top,sheetBottom:sheet.bottom,viewport:window.innerHeight};
   });
   assert.ok(pos.markerBottom<pos.sheetTop+2,'selected object should remain visibly above the question sheet '+JSON.stringify(pos));
   assert.ok(pos.sheetBottom<=pos.viewport+3,'sheet should fit phone viewport '+JSON.stringify(pos));
  }
  await page.locator('#more-questions').click();
  assert.ok(await page.locator('#question-items button').count()>4);
  await page.locator('#question-items button').first().click();
  assert.equal(await page.locator('#question-detail').isVisible(),true);
  assert.match(await page.locator('#question-detail').innerText(),/not yet been published/);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#question-list').isVisible(),true);
  await page.screenshot({path:screenshotDir+'/'+spec.name+'-object.png'});
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#object-card').isVisible(),false);
  if(spec.mobile)assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('object-open')),false);
  await page.locator('#inspection-details summary').click();
  await page.locator('[data-inspection="AL03"]').click();
  assert.equal(await page.locator('#object-title').innerText(),'Tabernacle');
  assert.equal(await page.locator('#inspection-stage').isVisible(),true);
  assert.match(await page.locator('#photo-caption').innerText(),/not photographed at Brompton/);
  await page.screenshot({path:screenshotDir+'/'+spec.name+'-inspection.png'});
  await page.locator('#return-to-church').click();
  assert.equal(await page.locator('#inspection-stage').isVisible(),false);
  assert.equal(await page.locator('#photo-viewport').isVisible(),true);
  assert.deepEqual(errors,[],'no uncaught JS errors');
  await context.close();
  console.log('Sanctuary photo-browser PASS '+spec.name+' '+spec.width+'x'+spec.height);
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
