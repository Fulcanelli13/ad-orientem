// Browser acceptance of the explicitly user-started provisional Kyrie XVI melody.
// The 65-card LIVE reader remains source-owned; the audio preview is an independent clock.
// No approval of GABC, publication of audio, or observed Schola performance is implied.
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const shots=resolve(root,'.tmp/kyrie-xvi-melody-in-reader');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
  '.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8',
  '.css':'text/css; charset=utf-8','.svg':'image/svg+xml',
  '.woff2':'font/woff2','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  const file=resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return;}
  const bytes=await readFile(file);
  res.writeHead(200,{'content-type':mime[extname(file)]??'application/octet-stream',
    'cache-control':'no-store'});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==='ENOENT'?404:500);res.end(String(e?.message??e));}
});
await new Promise((ok,fail)=>{
 server.once('error',fail);server.listen(0,'127.0.0.1',ok);
});
let browser;
try{
 browser=await chromium.launch({headless:true});
 await mkdir(shots,{recursive:true});
 const base='http://127.0.0.1:'+server.address().port+
   '/tests/fixtures/reader-phone-harness.html';
 const failures=[];
 for(const [width,mode,form,requiem] of [
   [320,'LIVE','MISSA_CANTATA_INCENSE',false],
   [390,'LIVE','SOLEMN',false],
   [390,'MISSAL','MISSA_CANTATA_SIMPLE',false],
   [390,'LIVE','LOW',false],
   [390,'LIVE','SOLEMN',true]
 ]){
  const context=await browser.newContext({viewport:{width,height:844},
    hasTouch:true,isMobile:true,serviceWorkers:'block'});
  try{
   const page=await context.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const query=new URLSearchParams({production:'1',print:'1',notation:'1',mode,form,
     ...(requiem?{requiem:'1'}:{})});
   await page.goto(base+'?'+query,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>['true','error'].includes(
     document.documentElement.dataset.harnessReady),null,{timeout:45000});
   const ready=await page.evaluate(()=>({
     ready:document.documentElement.dataset.harnessReady,
     error:window.__AO_PHONE_HARNESS_ERROR??null,
     total:window.__AO_PHONE_PREVIEW?.model?.totalCards??0,
   }));
   assert.equal(ready.ready,'true',JSON.stringify(ready));
   if(mode==='LIVE'&&!requiem)assert.equal(ready.total,65);
   const plan=page.locator('[data-schola-local-panel]');
   await plan.waitFor({state:'attached',timeout:20000});
   const exposed=mode==='LIVE'&&form!=='LOW'&&!requiem;
   if(exposed)await plan.locator('summary').first().click();
   const picker=page.locator('[data-schola-kyriale-choice="KYRIE"]');
   await picker.waitFor({state:'attached',timeout:20000});
   const trigger=page.locator('[data-kyrie-research-audition-open]');
   await trigger.waitFor({state:'attached',timeout:20000});
   assert.equal(await trigger.isVisible(),false,
     'Never show an unselected Kyrie research audition');
   if(!exposed){
     // Missal omits the LIVE Schola dock; Low Mass has no Schola;
     // Requiem cannot offer an ordinary Kyrie XVI audition.
     // Set the source choice without attempting to click hidden controls.
     // This tests a persisted choice without misrepresenting the visible UI.
     await picker.evaluate(node=>{
       node.value='MASS_16';
       node.dispatchEvent(new Event('change',{bubbles:true}));
     });
     await page.waitForTimeout(150);
     assert.equal(await trigger.isVisible(),false,
       'No ordinary research-audio launcher in Missal, Low or Requiem');
     assert.equal(await page.locator('section.ao-kyrie-audition').isVisible(),false);
   }else{
     await picker.selectOption('MASS_16');
     await trigger.waitFor({state:'visible',timeout:20000});
     await trigger.click();
     const player=page.locator('section.ao-kyrie-audition');
     await player.waitFor({state:'visible',timeout:20000});
     await player.locator('[data-kyrie-staff] svg').waitFor({timeout:35000});
     assert.deepEqual(await player.locator('[data-kyrie-tone] option').allTextContents(),
       ['Flute','Pure tone'],'Bells or unapproved sound choices entered the player');
     assert.equal(await player.locator('[data-kyrie-pitch]').inputValue(),'0');
     await player.locator('[data-kyrie-pitch]').evaluate(node=>{
       node.value='3';node.dispatchEvent(new Event('input',{bubbles:true}));
     });
     await player.locator('[data-kyrie-speed]').evaluate(node=>{
       node.value='1.3';node.dispatchEvent(new Event('input',{bubbles:true}));
     });
     await player.locator('[data-kyrie-tone]').selectOption('pure');
     assert.equal(await player.locator('[data-kyrie-pitch-value]').textContent(),'3');
     assert.equal(await player.locator('[data-kyrie-speed-value]').textContent(),'1.3×');
     await player.locator('[data-kyrie-action="play"]').click();
     await page.waitForFunction(()=>/Invocation 1\/9 · source note/.test(
       document.querySelector('[data-kyrie-position]')?.textContent??''),null,{timeout:10000});
     const start=await player.locator('[data-kyrie-position]').textContent();
     assert.match(start,/source note \d+\/40/);
     // Exercise an actual phone tap on the Mass navigation arrow while
     // the separate Schola score is open. Programmatic API navigation alone
     // does not prove the floating player leaves the reader usable.
     await page.locator('[data-reader-nav="next"]').click({timeout:7000});
     // createReaderDomAdapter receives the inner host, not the outer
     // #ao-r17-native-reader-preview wrapper. Read the navigation marker
     // from that actual event owner to avoid false negatives.
     const navMarker=await page.locator('#ao-r17-native-reader-preview > div')
       .first().getAttribute('data-ao-last-nav-input');
     assert.equal(navMarker,'click:next',
       'An open Kyrie player must not intercept the priest reader arrow');
     // The real production 65-card reader, not an illustrative split view.
     await page.evaluate(()=>{
       const api=window.__AO_PHONE_PREVIEW;
       const gloria=api.model.cards.find(c=>JSON.stringify(c).includes('AO.SM.C0053'));
       if(!gloria)throw Error('Cannot locate source-owned Gloria card');
       api.showSequence(gloria.sequence);
     });
     await page.waitForTimeout(1100);
     const progressed=await player.locator('[data-kyrie-position]').textContent();
     assert.notEqual(progressed,start,'Priest card navigation paused the independent melody');
     await player.locator('[data-kyrie-action="stop"]').click();
     assert.match(await player.locator('[data-kyrie-position]').textContent(),
       /Invocation 1\/9/);
     await page.screenshot({path:resolve(shots,mode.toLowerCase()+'-'+form.toLowerCase()+'-'+width+'.png'),
       animations:'disabled'});
     // Changing to a custom or unsupported Kyrie must immediately hide/stop the audition.
     await picker.selectOption('CUSTOM');
     await player.waitFor({state:'hidden',timeout:15000});
     assert.equal(await trigger.isVisible(),false);
     assert.equal(await page.evaluate(()=>document.querySelectorAll(
       '.ao-schola-dock[data-approved-score="true"]').length),0,
       'Research audition must never promote the live Schola dock score');
   }
   assert.equal(await page.evaluate(
     ()=>document.documentElement.scrollWidth<=innerWidth+1),true,
     'The Kyrie research preview caused horizontal page overflow');
   assert.deepEqual(errors,[],'Real reader browser errors');
   console.log('PASS Kyrie audition in actual reader',
     JSON.stringify({width,mode,form,requiem,cardCount:ready.total}));
  }catch(error){
   const failure={width,mode,form,requiem,error:String(error?.stack??error)};
   failures.push(failure);
   console.error('FAIL Kyrie audition phone case',JSON.stringify(failure));
  }finally{await context.close();}
 }
 assert.deepEqual(failures,[],'All five real-reader Schola research audition cases must pass');
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
