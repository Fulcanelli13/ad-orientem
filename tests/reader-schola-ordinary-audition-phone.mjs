// M55: real 390px 65-card LIVE Mass reader, shared (not duplicated) player.
// Four non-Kyrie Ordinary movements are research-only, user-started, and
// never change the reader cue, Mass form or approved Schola programme.
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
      'cache-control':'no-store'});
    res.end(bytes);
  }catch(e){
    res.writeHead(e?.code==='ENOENT'?404:500);res.end(String(e?.message??e));
  }
});
await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok)});
const base='http://127.0.0.1:'+server.address().port+
  '/tests/fixtures/reader-phone-harness.html';
const movementCases=[
 ['GLORIA','MASS_08','Gloria VIII',250,18],
 ['CREDO','CREDO_03','Credo III',414,19],
 ['SANCTUS_BENEDICTUS','MASS_08','Sanctus VIII',143,1],
 ['AGNUS_DEI','MASS_08','Agnus Dei VIII',106,3]
];
const selector=movement=>
  '[data-kyrie-research-audition-open][data-ordinary-preview-movement="'+movement+'"]';
let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},
    hasTouch:true,isMobile:true,serviceWorkers:'block'});
  try{
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'?production=1&print=1&notation=1&mode=LIVE&form=SOLEMN',
      {waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>['true','error'].includes(
      document.documentElement.dataset.harnessReady),null,{timeout:60000});
    const ready=await page.evaluate(()=>({
      ready:document.documentElement.dataset.harnessReady,
      cards:window.__AO_PHONE_PREVIEW?.model?.totalCards
    }));
    assert.deepEqual(ready,{ready:'true',cards:65});
    const plan=page.locator('[data-schola-local-panel]');
    await plan.waitFor({state:'attached'});
    await plan.locator('summary').first().click();
    const player=page.locator('section.ao-kyrie-audition');
    assert.equal(await player.count(),1,'One and only one shared player instance');
    assert.equal(await player.isVisible(),false,'No playback UI before user selection');
    for(const [movement,settingId,title,notes,sections] of movementCases){
      const picker=page.locator('[data-schola-kyriale-choice="'+movement+'"]');
      await picker.selectOption(settingId);
      const trigger=page.locator(selector(movement));
      await trigger.waitFor({state:'visible',timeout:60000});
      assert.equal(await player.isVisible(),false,'Selection alone must not start audio');
      await trigger.click();
      await player.waitFor({state:'visible',timeout:20000});
      await page.waitForFunction(()=>document.querySelector('[data-kyrie-staff]')
        ?.dataset.scholaNoteheadsMapped==='true',null,{timeout:85000});
      assert.match(await player.locator('h3').textContent(),new RegExp(title));
      assert.equal(await player.locator('[data-kyrie-staff] svg use.note[id^="note-"]').count(),
        notes,'Exact original GABC notehead count must map to SVG');
      assert.equal(await player.locator('[data-kyrie-staff] svg use.note[data-schola-notehead-active="true"]').count(),1);
      assert.equal(await player.locator('[data-kyrie-staff] svg use.note[data-schola-notehead-active="true"]')
        .getAttribute('id'),'note-1');
      assert.match(await player.locator('[data-kyrie-position]').textContent(),
        new RegExp('Section 1/'+sections));
      assert.deepEqual(await player.locator('[data-kyrie-tone] option').allTextContents(),
        ['Flute','Pure tone'],'No bells or new sounds');
      await player.locator('[data-kyrie-tone]').selectOption('pure');
      await player.locator('[data-kyrie-pitch]').evaluate(el=>{
        el.value='2';el.dispatchEvent(new Event('input',{bubbles:true}));
      });
      assert.equal(await player.locator('[data-kyrie-pitch-value]').textContent(),'2');
      await player.locator('[data-kyrie-action="play"]').click();
      await page.waitForFunction(()=>Number(document.querySelector('[data-kyrie-staff]')
        ?.dataset.performanceNoteOrdinal)>=2,null,{timeout:12000});
      const pointer=await page.evaluate(()=>{
        const staff=document.querySelector('[data-kyrie-staff]');
        return {
          ordinal:staff.dataset.sourceNoteOrdinal,
          active:[...staff.querySelectorAll('svg use.note[data-schola-notehead-active="true"]')]
            .map(n=>n.id)
        };
      });
      assert.deepEqual(pointer.active,['note-'+pointer.ordinal],
        'Playing source event must highlight exactly its Exsurge physical notehead');
      await player.locator('[data-kyrie-action="minimize"]').click();
      assert.equal(await player.getAttribute('data-minimized'),'true');
      await page.locator('[data-reader-nav="next"]').click({timeout:9000});
      const nav=await page.locator('#ao-r17-native-reader-preview > div').first()
        .getAttribute('data-ao-last-nav-input');
      assert.equal(nav,'click:next','Melody popover must not obstruct Mass reader navigation');
      await player.locator('[data-kyrie-action="stop"]').click();
      assert.match(await player.locator('[data-kyrie-position]').textContent(),
        new RegExp('Section 1/'+sections));
      await player.locator('[data-kyrie-action="close"]').click();
      assert.equal(await player.isVisible(),false);
      // Reopen the same user-owned settings panel to choose the next movement.
      await plan.evaluate(node=>{node.open=true;});
      console.log('PASS M55 LIVE ordinary',JSON.stringify({movement,notes,sections}));
    }
    // Change a selected movement while the last source's score is sounding:
    // any stale player must close and cease audio on an explicit new selection.
    const agnusPicker=page.locator('[data-schola-kyriale-choice="AGNUS_DEI"]');
    await page.locator(selector('AGNUS_DEI')).click();
    await player.waitFor({state:'visible'});
    await agnusPicker.evaluate(node=>{
      node.value='CUSTOM';node.dispatchEvent(new Event('change',{bubbles:true}));
    });
    assert.equal(await player.isVisible(),false);
    assert.equal(await page.locator(selector('AGNUS_DEI')).isVisible(),false);
    assert.deepEqual(errors,[],'Uncaught browser errors in production Mass reader');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),
      true,'The shared player must not introduce horizontal phone overflow');
  }finally{await context.close();}
  for(const [mode,form,requiem] of [
    ['MISSAL','SOLEMN',false],['LIVE','LOW',false],['LIVE','SOLEMN',true]
  ]){
    const ctx=await browser.newContext({viewport:{width:390,height:844},
      isMobile:true,hasTouch:true,serviceWorkers:'block'});
    try{
      const page=await ctx.newPage();
      const query=new URLSearchParams({production:'1',print:'1',notation:'1',mode,form,
        ...(requiem?{requiem:'1'}:{})});
      await page.goto(base+'?'+query,{waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(()=>['true','error'].includes(
        document.documentElement.dataset.harnessReady),null,{timeout:45000});
      const picker=page.locator('[data-schola-kyriale-choice="GLORIA"]');
      await picker.waitFor({state:'attached',timeout:25000});
      await picker.evaluate(node=>{
        node.value='MASS_08';node.dispatchEvent(new Event('change',{bubbles:true}));
      });
      await page.waitForTimeout(200);
      assert.equal(await page.locator(selector('GLORIA')).isVisible(),false,
        'Low/Missal/Requiem cannot expose non-Kyrie melody preview');
      assert.equal(await page.locator('section.ao-kyrie-audition').isVisible(),false);
      console.log('PASS M55 excluded context',JSON.stringify({mode,form,requiem}));
    }finally{await ctx.close();}
  }
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
