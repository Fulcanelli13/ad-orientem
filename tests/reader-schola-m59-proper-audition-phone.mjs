// M59: one real 390px 65-card LIVE reader, five selected research Propers,
// one existing player. No Mass assignment, no automatic song or new audio API.
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8',
 '.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2',
 '.png':'image/png'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  const path=resolve(root,'.'+pathname);
  if(path!==root&&!path.startsWith(root+sep)){
   res.writeHead(403);res.end('Forbidden');return;
  }
  const bytes=await readFile(path);
  res.writeHead(200,{'content-type':mime[extname(path)]??'application/octet-stream',
   'cache-control':'no-store'});res.end(bytes);
 }catch(e){res.writeHead(e?.code==='ENOENT'?404:500);res.end(String(e?.message??e));}
});
await new Promise((ok,fail)=>{
 server.once('error',fail);server.listen(0,'127.0.0.1',ok);
});
const base='http://127.0.0.1:'+server.address().port+
 '/tests/fixtures/reader-phone-harness.html';
const cases=[
 ['ADVENT1_INTROIT','Introit · Ad te levavi',171,4],
 ['ADVENT1_GRADUAL','Gradual · Universi',188,2],
 ['ADVENT1_ALLELUIA','Alleluia · Ostende nobis',183,2],
 ['ADVENT1_OFFERTORY','Offertory · Ad te Domine',152,1],
 ['ADVENT1_COMMUNION','Communion · Dominus dabit',68,1]
];
const triggerSelector='[data-kyrie-research-audition-open][data-ordinary-preview-movement="PROPER"]';
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({
  viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'
 });
 try{
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'?production=1&print=1&notation=1&mode=LIVE&form=SOLEMN',
   {waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>['true','error'].includes(
   document.documentElement.dataset.harnessReady),null,{timeout:60000});
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.harnessReady),'true');
  assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW?.model?.totalCards),65);
  const plan=page.locator('[data-schola-local-panel]');
  await plan.waitFor({state:'attached'});
  await plan.locator('summary').first().click();
  const picker=page.locator('[data-schola-proper-research-select]');
  assert.deepEqual(await picker.locator('option').evaluateAll(nodes=>
    nodes.map(n=>n.value)),['',
    'ADVENT1_INTROIT','ADVENT1_GRADUAL','ADVENT1_ALLELUIA',
    'ADVENT1_OFFERTORY','ADVENT1_COMMUNION']);
  assert.equal(await picker.inputValue(),'','Source study requires active user choice');
  const trigger=page.locator(triggerSelector);
  const player=page.locator('section.ao-kyrie-audition');
  assert.equal(await trigger.count(),1,'No duplicate Proper players or launchers');
  assert.equal(await player.count(),1,'Exactly one existing melody player');
  assert.equal(await trigger.isVisible(),false,'No demo before selection');
  assert.equal(await player.isVisible(),false,'Never autoplay a selected Proper');
  const ordinaryBefore=await page.locator('[data-schola-kyriale-choice]').evaluateAll(
   nodes=>nodes.map(n=>[n.dataset.scholaKyrialeChoice,n.value]));
  for(const [id,title,notes,sections] of cases){
   await picker.selectOption(id);
   await trigger.waitFor({state:'visible',timeout:50000});
   assert.equal(await player.isVisible(),false,
    'Selecting a Proper cannot open audio or move a Mass cue');
   await trigger.click();
   await player.waitFor({state:'visible',timeout:20000});
   await page.waitForFunction(()=>document.querySelector('[data-kyrie-staff]')
     ?.dataset.scholaNoteheadsMapped==='true',null,{timeout:85000});
   assert.match(await player.locator('h3').textContent(),
    new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
   assert.equal(await player.locator(
    '[data-kyrie-staff] svg use.note[id^="note-"]').count(),notes,
    'Actual Exsurge SVG notehead count changed');
   assert.equal(await player.locator(
    '[data-kyrie-staff] svg use.note[data-schola-notehead-active="true"]').count(),1);
   assert.equal(await player.locator(
    '[data-kyrie-staff] svg use.note[data-schola-notehead-active="true"]')
      .getAttribute('id'),'note-1');
   assert.match(await player.locator('[data-kyrie-position]').textContent(),
    new RegExp('Section 1/'+sections));
   assert.deepEqual(await player.locator('[data-kyrie-tone] option').allTextContents(),
    ['Flute','Pure tone'],'No bells or recorded singers');
   await player.locator('[data-kyrie-tone]').selectOption('pure');
   await player.locator('[data-kyrie-pitch]').evaluate(node=>{
    node.value='3';node.dispatchEvent(new Event('input',{bubbles:true}));
   });
   assert.equal(await player.locator('[data-kyrie-pitch-value]').textContent(),'3');
   await player.locator('[data-kyrie-action="play"]').click();
   await page.waitForFunction(()=>Number(document.querySelector('[data-kyrie-staff]')
     ?.dataset.performanceNoteOrdinal)>=2,null,{timeout:12000});
   const pointer=await page.evaluate(()=>{
    const staff=document.querySelector('[data-kyrie-staff]');
    return {source:staff.dataset.sourceNoteOrdinal,
     active:[...staff.querySelectorAll('svg use.note[data-schola-notehead-active="true"]')]
      .map(n=>n.id)};
   });
   assert.deepEqual(pointer.active,['note-'+pointer.source]);
   await player.locator('[data-kyrie-action="minimize"]').click();
   assert.equal(await player.getAttribute('data-minimized'),'true');
   await page.locator('[data-reader-nav="next"]').click({timeout:10000});
   assert.equal(await page.locator('#ao-r17-native-reader-preview > div').first()
     .getAttribute('data-ao-last-nav-input'),'click:next');
   await player.locator('[data-kyrie-action="stop"]').click();
   await player.locator('[data-kyrie-action="close"]').click();
   assert.equal(await player.isVisible(),false);
   await plan.evaluate(node=>{node.open=true;});
   console.log('PASS M59 LIVE Proper',JSON.stringify({id,notes,sections}));
  }
  assert.deepEqual(await page.locator('[data-schola-kyriale-choice]').evaluateAll(
   nodes=>nodes.map(n=>[n.dataset.scholaKyrialeChoice,n.value])),ordinaryBefore,
   'Research listening must never alter any saved Ordinary setting');
  await trigger.click();await player.waitFor({state:'visible'});
  await picker.selectOption('');
  assert.equal(await trigger.isVisible(),false,
   'Removing study choice must hide its launcher immediately');
  assert.equal(await player.isVisible(),false,
   'Changing study selection must stop and dismiss an existing melody');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),
   true,'No phone horizontal overflow from source selector or player');
  assert.deepEqual(errors,[],'No uncaught runtime errors');
 }finally{await context.close();}
 for(const [mode,form,requiem] of [
  ['MISSAL','SOLEMN',false],['LIVE','LOW',false],
  ['LIVE','SOLEMN',true]
 ]){
  const ctx=await browser.newContext({
   viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'
  });
  try{
   const page=await ctx.newPage();
   const query=new URLSearchParams({
     production:'1',print:'1',notation:'1',mode,form,
     ...(requiem?{requiem:'1'}:{})
   });
   await page.goto(base+'?'+query,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>['true','error'].includes(
    document.documentElement.dataset.harnessReady),null,{timeout:60000});
   const picker=page.locator('[data-schola-proper-research-select]');
   await picker.waitFor({state:'attached',timeout:25000});
   await picker.selectOption('ADVENT1_INTROIT');
   await page.waitForTimeout(300);
   assert.equal(await page.locator(triggerSelector).isVisible(),false,
    'Low, Missal and Requiem may never expose research Proper audio');
   assert.equal(await page.locator('section.ao-kyrie-audition').isVisible(),false);
   console.log('PASS M59 Proper context excluded',JSON.stringify({mode,form,requiem}));
  }finally{await ctx.close();}
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
