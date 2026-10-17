import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const target='/previews/visible-mass-3d/sanctuary-hotspot-pilot.html';
const mime={'.html':'text/html; charset=utf-8','.json':'application/json; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
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
  assert.equal(await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.experience()),'explore');
  assert.equal(await page.locator('#experience-understand').isDisabled(),true);
  await first.click();
  assert.equal(await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.experience()),'understand');
  assert.equal(await page.locator('#object-title').innerText(),'High altar');
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().inspections===17,{timeout:20000});
  assert.ok(await page.locator('#related-items [data-related="AL03"]').count()===1,'altar links to tabernacle reference');
  assert.equal(await page.locator('#question-items button').count(),4);
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT?.status?.().explanationCount===20,{timeout:30000});
  assert.equal(await page.locator('#liturgical-explanations').isVisible(),true);
  await page.locator('#liturgical-explanations > summary').click();
  assert.ok(await page.locator('#liturgical-answer-items .answer-entry').count()>=10,'high altar should lead to multiple liturgical explanations');
  const firstExplanation=page.locator('#liturgical-answer-items .answer-entry').first();
  await firstExplanation.locator('summary').click();
  assert.ok((await firstExplanation.locator('.answer-lead').innerText()).length>50);
  assert.ok(await firstExplanation.locator('.answer-source a[target="_blank"]').count()>=1);
  await page.locator('#liturgical-explanations > summary').click();

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
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().historicalAnswerCount===97,{timeout:30000});
  await page.locator('#question-items button[data-question="VMQ-0003"]').click();
  assert.equal(await page.locator('#historical-answer').isVisible(),true,'canonical question shows its exact history answer');
  assert.equal(await page.locator('#answer-pending').isVisible(),false);
  assert.match(await page.locator('#historical-answer-lead').innerText(),/Early Christians/);
  assert.ok(await page.locator('#historical-answer-sources a').count()>=1);
  assert.equal(await page.locator('#historical-answer').getAttribute('data-question'),null);
  await page.locator('#back-to-object').click();
  await page.locator('#question-items button[data-question="VMQ-0001"]').click();
  assert.equal(await page.locator('#historical-answer').isVisible(),true,'newly answered question has a response');
  await page.locator('#back-to-object').click();
  await page.locator('#question-items button[data-question="VMQ-0004"]').click();
  assert.equal(await page.locator('#historical-answer').isVisible(),false,'unanswered liturgical requirement remains pending');
  assert.equal(await page.locator('#answer-pending').isVisible(),true);
  await page.locator('#back-to-object').click();
  await page.locator('#occasion-select').selectOption('thursday');
  assert.match(await page.locator('#occasion-note-title').innerText(),/stripped altar/);
  assert.equal(await page.locator('#occasion-note').isVisible(),true);
  assert.equal(await page.locator('#altar-photo').getAttribute('src'),'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c1/The_High_Altar_-_geograph.org.uk_-_6213275.jpg/1280px-The_High_Altar_-_geograph.org.uk_-_6213275.jpg');
  await page.locator('#occasion-select').selectOption('ordinary');
  assert.equal(await page.locator('#occasion-note').isVisible(),false);
  await page.locator('#more-questions').click();
  assert.ok(await page.locator('#question-items button').count()>4);
  await page.locator('#question-items button').first().click();
  assert.equal(await page.locator('#question-detail').isVisible(),true);
  assert.equal(await page.locator('#historical-answer').isVisible(),true);
  assert.equal(await page.locator('#answer-pending').isVisible(),false);
  assert.ok((await page.locator('#historical-answer-sources a').first().innerText()).trim().length>6);
  await page.locator('#study-sources > summary').click();
  assert.equal(await page.locator('#study-sources').evaluate(e=>e.open),true);
  assert.ok(await page.locator('#study-source-links li').count()>=2);
  assert.match(await page.locator('#study-sources').innerText(),/not necessarily this precise question/);
  assert.ok(await page.locator('#study-source-links a[target="_blank"]').count()>=1);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#question-list').isVisible(),true);
  await page.screenshot({path:screenshotDir+'/'+spec.name+'-object.png'});
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#object-card').isVisible(),false);
  assert.equal(await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.experience()),'explore');
  if(spec.mobile)assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('object-open')),false);
  // Physical ancestor → question-only object; do not fabricate a photographic hotspot.
  await page.locator('.marker[data-object="AL07"]').click();
  await page.locator('#related-items [data-related="AL08"]').click();
  assert.equal(await page.locator('#object-title').innerText(),'Individual altar candle');
  assert.match(await page.locator('#inspection-provenance').innerText(),/No independent object photograph/);
  assert.equal(await page.locator('#question-items button').count(),4);
  await page.locator('#close-card').click();
    await page.locator('.marker[data-object="AL06"]').click();
  await page.locator('#occasion-select').selectOption('passion');
  assert.match(await page.locator('#occasion-note-title').innerText(),/hidden images/);
  await page.locator('#occasion-select').selectOption('friday');
  assert.match(await page.locator('#occasion-note-title').innerText(),/veneration of the Cross/);
  await page.locator('#occasion-select').selectOption('ordinary');
  assert.equal(await page.locator('#occasion-note').isVisible(),false);
  await page.locator('#close-card').click();
  await page.locator('#inspection-details > summary').click();
  await page.locator('.inspect-family > summary').filter({hasText:'Altar & sanctuary'}).click();
  await page.locator('[data-inspection="AL03"]').click();
  assert.equal(await page.locator('#object-title').innerText(),'Tabernacle');
  assert.equal(await page.locator('#inspection-stage').isVisible(),true);
  assert.match(await page.locator('#photo-caption').innerText(),/not photographed at Brompton/);
  await page.screenshot({path:screenshotDir+'/'+spec.name+'-inspection.png'});
  await page.locator('#return-to-church').click();
  assert.equal(await page.locator('#inspection-stage').isVisible(),false);
  await page.locator('[data-inspection="SN07"]').click();
  await page.locator('#related-items [data-related="EQ06"]').click();
  assert.equal(await page.locator('#object-title').innerText(),'Altar bell');
  assert.match(await page.locator('#canonical-link').innerText(),/No G### glossary identity/);
  assert.equal(await page.locator('#question-items button').count(),4);
  await page.locator('#close-card').click();
  await page.locator('.inspect-family > summary').filter({hasText:'Sacred linens'}).click();
  await page.locator('[data-inspection="LN01"]').click();
  assert.match(await page.locator('#inspection-provenance').innerText(),/corporal/);
  await page.locator('#related-items [data-related="LN04"]').click();
  assert.equal(await page.locator('#inspection-type').innerText(),'Historical reference illustration');
  assert.match(await page.locator('#photo-caption').innerText(),/not photographed at Brompton/);
  await page.locator('#return-to-church').click();
  assert.equal(await page.locator('#inspection-stage').isVisible(),false);
  assert.equal(await page.locator('#photo-viewport').isVisible(),true);
  // Reset ONLY the test visitor's trail history after the preceding glossary
  // and inspection coverage, so the navigation checks start with a fresh
  // research visitor rather than falsely assuming earlier answers were unread.
  await page.evaluate(()=>sessionStorage.removeItem('ao-visible-mass-visitor-trails-v1'));
  await page.reload({waitUntil:'domcontentloaded'});
  // The optional dialogue director is mounted on the EXISTING sanctuary
  // photograph, not in an independent course or duplicated question owner.
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT?.guideStatus()?.availableRoutes?.length===4);
  assert.equal(await page.locator('#guide-routes [data-trail]').count(),4);
  await page.locator('#experience-discover').click();
  assert.equal(await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.experience()),'discover');
  assert.equal(await page.locator('#guide-dock').isVisible(),true);
  assert.equal(await page.locator('#intro-card').isVisible(),false);
  assert.equal(await page.locator('#object-card').isVisible(),false);
  // "Secrets" begins at the retable and then crosses to candlesticks.
  await page.locator('#guide-routes [data-trail="SANCTUARY_SECRETS"]').click();
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus())).nextQuestionId,'VMQ-0052');
  await page.locator('#guide-actions [data-guide-question="VMQ-0052"]').click();
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).selected,'AL19');
  assert.equal(await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.experience()),'understand');
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).question,'VMQ-0052');
  assert.equal(await page.locator('#photo-canvas').getAttribute('data-guided-focus'),'AL19');
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus())).readCount,1);
  await page.locator('#guide-return').click();
  assert.equal(await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.experience()),'discover');
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus())).nextQuestionId,'VMQ-0053');
  await page.locator('#guide-actions button').filter({hasText:'Skip suggestion'}).click();
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus())).nextQuestionId,'VMQ-0017');
  await page.locator('#guide-actions [data-guide-question="VMQ-0017"]').click();
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).selected,'AL07');
  assert.equal(await page.locator('#photo-canvas').getAttribute('data-guided-focus'),'AL07');
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus())).readCount,2);
  await page.locator('#guide-return').click();
  // Global discovery memory prevents the crucifix being re-read on another route.
  await page.locator('#guide-routes [data-trail="ALTAR_MYSTERY"]').click();
  assert.equal((await page.locator('#guide-prompt').innerText()).includes('crucifix'),true);
  await page.locator('#guide-actions [data-guide-question="VMQ-0013"]').click();
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).selected,'AL06');
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).question,'VMQ-0013');
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus())).readCount,3);
  await page.locator('#guide-return').click();
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus())).nextQuestionId,'VMQ-0014');
  await page.locator('#guide-actions button').filter({hasText:'Skip suggestion'}).click();
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus())).nextQuestionId,'VMQ-0002');
  await page.locator('#guide-routes [data-trail="FIRST_VISIT"]').click();
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus())).nextQuestionId,'VMQ-0062');
  await page.locator('#guide-actions [data-guide-question="VMQ-0062"]').click();
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).selected,'SN04');
  assert.equal(await page.locator('#photo-canvas').getAttribute('data-guided-focus'),'SN04');
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus())).readCount,4);
  await page.locator('#guide-return').click();
  await page.locator('#guide-actions button').filter({hasText:'Skip this path'}).click();
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus())).visible,false);
  assert.equal(await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.experience()),'explore');
  assert.equal(await page.locator('#guide-routes [data-trail]').count(),4,'skip whole trail must leave alternate paths selectable');
  await page.locator('#experience-discover').click();
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus())).visible,true);
  assert.equal(await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.experience()),'discover');
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus())).nextQuestionId,'VMQ-0056');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT?.guideStatus()?.readCount===4);
  assert.equal(await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.experience()),'explore');
  await page.locator('#experience-discover').click();
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus())).nextQuestionId,'VMQ-0056');
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus())).active,'FIRST_VISIT');
  await page.screenshot({path:screenshotDir+'/'+spec.name+'-guided.png'});
  assert.deepEqual(errors,[],'no uncaught JS errors');
  await context.close();
  console.log('Sanctuary photo-browser PASS '+spec.name+' '+spec.width+'x'+spec.height);
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
