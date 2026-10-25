import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, sep, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';

/**
 * Real app-shell acceptance (no fake AO_* owners).
 * Start the actual index.html and inject the unpublished guide into the
 * existing shell. This does not introduce a public launcher.
 */
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8',
 '.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp',
 '.woff2':'font/woff2','.mjs':'text/javascript; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  const file=resolve(root,'.'+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);
  res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==='ENOENT'?404:500);res.end(String(error?.message||error));}
});
await new Promise((ok,fail)=>{server.once('error',fail);server.listen(4224,'127.0.0.1',ok);});
let browser;
const results=[];
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:900},deviceScaleFactor:width===390?2:1,isMobile:width===390,hasTouch:width===390,serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e?.message||e)));
  await page.goto('http://127.0.0.1:4224/index.html',{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:30000});
  await page.evaluate(async()=>{
   const {mountAskChurchGuide}=await import('/src/learn/ask-church-guided-preview.js');
   window.__ASK_GUIDE_ACCEPTANCE=await mountAskChurchGuide(window);
  });
  const guide=page.locator('#aoAskChurchGuideV5'),input=guide.locator('input[aria-label="Your objective or question"]');
  assert.equal(await guide.isVisible(),true,'guide not mounted into live shell');

  async function pathFromText(userMessage,cardContains){
   await guide.getByRole('button',{name:'Start a new objective'}).click();
   await input.fill(userMessage);
   await guide.locator('button[type=submit]').click();
   await guide.locator('.ac-card').filter({hasText:cardContains}).first().waitFor();
  }
  async function openCard(cardContains,verify,desc){
   const card=guide.locator('.ac-card').filter({hasText:cardContains}).first();
   await card.getByRole('button',{name:'Open in Ad Orientem'}).click();
   await page.waitForFunction(()=>document.getElementById('aoAskChurchGuideV5')?.hidden===true,null,{timeout:30000});
   await page.waitForFunction(verify,null,{timeout:25000});
   assert.equal(await page.locator('#aoAskChurchReturnV5').isVisible(),true,'return control absent: '+desc);
   const returnClearance=await page.evaluate(()=>({
    buttonBottom:document.getElementById('aoAskChurchReturnV5').getBoundingClientRect().bottom,
    ribbonTop:document.getElementById('ao-global-ribbon').getBoundingClientRect().top
   }));
   assert.ok(returnClearance.buttonBottom<=returnClearance.ribbonTop-4,
    'return control overlaps global navigation at '+width+': '+JSON.stringify(returnClearance));
   const returnHit=await page.locator('#aoAskChurchReturnV5').evaluate(el=>{
    const rect=el.getBoundingClientRect();
    return el===document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);
   });
   assert.equal(returnHit,true,'native module obstructs return control at '+width+': '+desc);
   await page.locator('#aoAskChurchReturnV5').click();
   assert.equal(await guide.isVisible(),true,'guide return failed: '+desc);
   assert.ok(await guide.locator('.ac-card').count()>=2,'context lost: '+desc);
   results.push({width,destination:desc,status:'PASS'});
  }

  await pathFromText("I haven't confessed in years",'Confession preparation');
  const original=await page.evaluate(()=>window.__ASK_GUIDE_ACCEPTANCE.state());
  await openCard('Confession preparation',()=>globalThis.AO_PRAY_V435930?.state?.()?.view==='confession','Confession');
  assert.deepEqual(await page.evaluate(()=>window.__ASK_GUIDE_ACCEPTANCE.state()),original,'return lost Confession state');

  // Apostolate uses a different owner; this is not simulated.
  await openCard('I haven',()=>globalThis.AO_APOSTOLATE_APP_V1?.status?.()?.open===true&&
    globalThis.AO_APOSTOLATE_APP_V1?.status?.()?.selectedId==='HS02','Apostolate HS02');

  await pathFromText('I want to understand the Latin Mass','Understand the Mass');
  await openCard('Understand the Mass',()=>globalThis.AO_MASS_EXPLORER_V1?.status?.()?.open===true,'Mass Explorer');

  await pathFromText('I want to begin praying','Spiritual Life');
  await openCard('Spiritual Life',()=>globalThis.AO_SPIRITUAL_LIFE_V1?.status?.()?.open===true,'Spiritual Life');

  await guide.getByRole('button',{name:'Start a new objective'}).click();
  await guide.getByRole('button',{name:'Français'}).click();
  assert.ok(await guide.locator('.ac-bubble').first().innerText().then(s=>s.includes('Bienvenue')),'French copy absent');
  await guide.getByRole('button',{name:'English'}).click();

  // No research-only publication or accidental native route exposure.
  assert.equal(await guide.getByText('learn.church_crisis').count(),0);
  assert.equal(await guide.getByText('learn.apologetics').count(),0);
  const overflow=await guide.evaluate(el=>el.scrollWidth-el.clientWidth);
  assert.ok(overflow<=2,'guide has horizontal overflow at '+width+': '+overflow);
  assert.deepEqual(errors,[],'unexpected browser exceptions at '+width);
  await context.close();
 }
} finally {await browser?.close();await new Promise(r=>server.close(r));}
console.log(JSON.stringify({status:'PASS',environment:'real app shell with actual owners',results}));
