/**
 * Research-only 21-artwork Prayer mount acceptance; does NOT claim that the
 * 53 eventual destinations are live. This tests QA slot resolver, real Prayer
 * root mounting, exact source file decode and contain-fit at 320/390 EN/FR.
 */
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';
import {R5D_RESEARCH_PHOTOS} from './fixtures/prayer-r5d-reader-preview.v1.js';
import {resolvePrayerEditorialArtwork,prayerEditorialPublicationSummary} from '../src/pray/art-slot-map.v1.js';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const out=resolve(root,'artifacts/prayer-r5d-first-cohort-preview');
await mkdir(out,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.mjs':'text/javascript; charset=utf-8','.json':'application/json',
 '.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg',
 '.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  const file=resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end('Forbidden');}
  const bytes=await readFile(file);
  res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream','cache-control':'no-store'});
  res.end(bytes);
 }catch(err){res.writeHead(err?.code==='ENOENT'?404:500);res.end(String(err?.message||err));}
});
await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok);});
const port=server.address().port;
let browser;
const report={schema:'AO_PRAYER_R5D_21_WORK_READER_MOUNT_BROWSER_V1',
 publicationAuthorized:false,realReaderDestinationAcceptance:false, // overlay ≠ final route
 configurations:[],errors:[]};
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const language of ['en','fr']){
  const context=await browser.newContext({viewport:{width,height:width===320?700:844},
   locale:language==='fr'?'fr-FR':'en-GB',isMobile:true,hasTouch:true,
   deviceScaleFactor:1,serviceWorkers:'block',reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push('pageerror: '+String(e.message)));
  page.on('console',message=>{if(message.type()==='error')errors.push('console: '+message.text());});
  page.on('response',res=>{if(res.status()>=400)errors.push('HTTP '+res.status()+': '+res.url());});
  page.on('requestfailed',req=>errors.push('FAILED '+req.url()+': '+(req.failure()?.errorText||'')));
  const results=[];
  try{
   await page.goto('http://127.0.0.1:'+port+'/index.html?aoPrayerPilot=1',
     {waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true
     &&typeof globalThis.AO_APP_SHELL_V1?.navigate==='function',
     null,{timeout:45000});
   // Match the already released Prayer browser acceptance: initialise language
   // in Settings for every configuration before entering the Prayer route.
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate('settings')))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+language+'"]').click();
   await page.waitForFunction(lang=>document.documentElement.lang===lang,language,{timeout:12000});
   // QA-only source montages use the real Prayer owner, not a shell route
   // transition. The shell may decline a redundant navigation to Pray.
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==='function',null,{timeout:30000});
   const owner=await page.evaluate(async()=>{
     const result=await globalThis.AO_PRAY_APP_V1.open();
     return {result,rootClass:document.querySelector('#aoPray435930')?.className||null,
       readerStatus:globalThis.AO_PRAY_APP_V1.status?.()||null,
       donorInstalled:typeof globalThis.AO_PRAY_V435930?.open==='function'};
   });
   assert.equal(owner.result,true,
     'Could not open real Prayer owner: '+JSON.stringify({owner,errors}));
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==='function',null,{timeout:30000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open('pray.library',{returnContext:null})),true);
   const rootSelector='#aoPray435930.open';
   for(let i=0;i<R5D_RESEARCH_PHOTOS.length;i++){
    const work=R5D_RESEARCH_PHOTOS[i],slot=work.slots[0];
    assert.equal(resolvePrayerEditorialArtwork(slot).state,'APPROVED_EXACT_PHOTO_PENDING');
    const mounted=await page.evaluate(async(slotId)=>{
      const {renderR5dResearchPhoto}=await import('/tests/fixtures/prayer-r5d-reader-preview.v1.js');
      const mount=document.querySelector('#aoPray435930.open .aoP435930Mount');
      if(!mount)throw Error('Prayer real UI mount is missing');
      document.querySelector('#aoR5dResearchRoot')?.remove();
      const wrapper=document.createElement('section');
      wrapper.id='aoR5dResearchRoot';
      wrapper.setAttribute('data-ao-research-mount','temporary-browser-only');
      wrapper.style.cssText='box-sizing:border-box;max-width:100%;min-width:0;width:100%;padding:10px;overflow-x:clip;';
      wrapper.innerHTML='<header style="font:16px Georgia,serif;margin-bottom:10px">'+
        'Research image: not released</header>'+
        renderR5dResearchPhoto(slotId,{qaOnly:true,className:'aoPrayerEditorialCardCover'});
      mount.prepend(wrapper);
      return {count:wrapper.querySelectorAll('[data-ao-editorial-slot]').length,
       published:wrapper.querySelector('[data-ao-editorial-slot]')?.dataset.aoPublished};
    },slot);
    assert.deepEqual(mounted,{count:1,published:'false'});
    const img=page.locator('#aoR5dResearchRoot [data-ao-editorial-slot="'+slot+'"] img');
    assert.equal(await img.count(),1);
    const details=await img.evaluate(async el=>{
       await el.decode();
       const box=el.getBoundingClientRect();
       const credit=el.closest('figure')?.querySelector('figcaption a[href^="https://"]');
       return {naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,
        src:el.getAttribute('src'),objectFit:getComputedStyle(el).objectFit,
        x:box.x,right:box.right,w:box.width,h:box.height,
        docOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
        credit:credit?.getAttribute('href')||null,
        publicationFlag:el.closest('[data-ao-published]')?.dataset.aoPublished};
    });
    assert.equal(details.src,'/'+work.imagePath,'Wrong artwork '+slot);
    assert.ok(details.naturalWidth>=1000&&details.naturalHeight>=1000,slot+' decoded too small');
    assert.equal(details.objectFit,'contain',slot+' must not crop the painting');
    assert.ok(details.w>=90&&details.right<=width+2&&details.x>=-2,slot+' offscreen');
    assert.ok(details.docOverflow<=2,slot+' causes mobile horizontal overflow');
    assert.equal(details.credit,work.sourcePage,slot+' source credit missing');
    assert.equal(details.publicationFlag,'false');
    if([0,7,14,20].includes(i))
      await page.screenshot({path:resolve(out,'preview-'+i+'-'+width+'-'+language+'.png'),
       animations:'disabled'});
    results.push({title:work.title,slot,...details});
   }
   await page.evaluate(()=>document.querySelector('#aoR5dResearchRoot')?.remove());
   assert.equal(await page.locator('#aoR5dResearchRoot').count(),0);
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open('pray.library',{returnContext:null})),true);
   assert.equal(await page.locator(rootSelector+' [data-ao-research-mount]').count(),0,
    'Research artwork remains after leaving preview');
   assert.deepEqual(errors,[],errors.join('; '));
   report.configurations.push({width,language,photographs:results.length,pass:true,results});
  }finally{await context.close();}
 }
 assert.equal(report.configurations.length,4);
 assert.equal(report.configurations.reduce((n,c)=>n+c.photographs,0),84);
 assert.equal(prayerEditorialPublicationSummary().states.PUBLISHED_EXACT_PHOTO,51);
 await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log('PASS 21 research images × 320/390 × EN/FR = 84 browser image-decode checks. No public release.');
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
