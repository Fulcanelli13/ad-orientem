import assert from 'node:assert/strict';
import http from 'node:http';
import {readFileSync,createReadStream,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {extname,resolve,sep} from 'node:path';
import {chromium} from '@playwright/test';
import {PRAYER_SELECTED_COVER_PHOTO_QA,renderPrayerSelectedCoverQA} from '../src/pray/prayer-cover-photo-qa.v1.js';

const originals=Object.entries(PRAYER_SELECTED_COVER_PHOTO_QA);
assert.equal(originals.length,2);
for(const [slot,photo] of originals){
 const path='.'+photo.stagedAsset;
 const bytes=readFileSync(path);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),photo.expectedSHA256,slot+' exact older archive hash');
 assert.equal(photo.publicationAuthorized,false);
 assert.equal(photo.croppingApproved,false);
 assert.ok(bytes.length>1_000_000);
}
assert.equal(renderPrayerSelectedCoverQA('COV-pray.confession'),'', 'no default app publication');
assert.equal(renderPrayerSelectedCoverQA('COV-prayer.seven_sorrows_chaplet'),'', 'no implicit new route');
assert.equal(renderPrayerSelectedCoverQA('COV-pray.confession',false,{qaOnly:true}).includes('confession-murillo-nga-cc0.jpg'),true);
assert.equal(renderPrayerSelectedCoverQA('COV-pray.rosary',false,{qaOnly:true}),'');

const root=resolve('.'),captures=resolve('artifacts/prayer-selected-cover-phone-qa');
mkdirSync(captures,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 try{const uri=new URL(req.url,'http://127.0.0.1');const filename=decodeURIComponent(uri.pathname);
  const full=resolve(root,'.'+filename);
  if(full!==root&&!full.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const ext=extname(full);res.writeHead(200,{'content-type':mime[ext]||'application/octet-stream','cache-control':'no-store'});
  const stream=createReadStream(full);stream.on('error',()=>{res.destroy()});stream.pipe(res);
 }catch(err){res.writeHead(500);res.end(String(err.message))}
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const port=server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const [w,h] of [[320,568],[390,844]]){
  const page=await browser.newPage({viewport:{width:w,height:h},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{globalThis.__AO_PRAYER_ART_QA_PREVIEW__=true});
  await page.goto('http://127.0.0.1:'+port+'/index.html',{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==='function');
  await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open());
  assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open('pray.confession',{returnContext:null})),true);
  const cover=page.locator('[data-ao-prayer-art-qa="COV-pray.confession"] img');
  assert.equal(await cover.count(),1);
  await cover.evaluate(img=>img.decode());
  const state=await page.evaluate(()=>{
   const root=document.querySelector('.aoP435930ConfessionReader');
   const img=root.querySelector('[data-ao-prayer-art-qa] img');
   const rect=img.getBoundingClientRect();
   const figure=img.closest('figure');
   return {pixels:[img.naturalWidth,img.naturalHeight],w:rect.width,h:rect.height,
    documentOverflow:document.documentElement.scrollWidth-innerWidth,
    paths:root.querySelectorAll('[data-p435930-conf-path]').length,
    inputCount:root.querySelectorAll('input').length,
    figureCaption:figure.querySelector('figcaption')?.textContent,
    release:figure.dataset.aoProductionRelease,
    stage:root.dataset.aoConfessionSection,
    mode:getComputedStyle(img).objectFit
   };
  });
  assert.deepEqual(state.pixels,[4000,3658]);
  assert.equal(state.mode,'contain');
  assert.ok(state.w>100&&state.h>90&&state.h<=h*.36,JSON.stringify(state));
  assert.ok(state.documentOverflow<=2,JSON.stringify(state));
  assert.equal(state.paths,3);
  assert.equal(state.inputCount,1);
  assert.equal(state.release,'false');
  assert.equal(state.stage,'0');
  assert.match(state.figureCaption,/Murillo.*Prodigal Son/);
  assert.deepEqual(errors,[]);
  await page.screenshot({path:resolve(captures,'confession-murillo-approved-photo-'+w+'.png'),animations:'disabled'});
  await page.close();
 }
 // Default production session must still show no unreleased cover art.
 const ordinary=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});
 await ordinary.goto('http://127.0.0.1:'+port+'/index.html',{waitUntil:'domcontentloaded',timeout:90000});
 await ordinary.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==='function');
 await ordinary.evaluate(()=>globalThis.AO_PRAY_APP_V1.open());
 await ordinary.evaluate(()=>globalThis.AO_PRAY_V435930.open('pray.confession',{returnContext:null}));
 assert.equal(await ordinary.locator('[data-ao-prayer-art-qa]').count(),0);
 await ordinary.close();
 console.log('PASS two prior user-approved exact-cover source hashes; 320/390px opt-in Murillo phone QA and zero public release');
}finally{await browser?.close().catch(()=>{});await new Promise(ok=>server.close(ok))}
