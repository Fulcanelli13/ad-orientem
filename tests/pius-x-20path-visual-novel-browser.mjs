import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const media={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
 '.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  const file=resolve(root,'.'+name);
  if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const data=await readFile(file);
  res.writeHead(200,{'content-type':media[extname(file)]||'application/octet-stream'});
  res.end(data);
 }catch(error){res.writeHead(error.code==='ENOENT'?404:500);res.end(String(error));}
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const url='http://127.0.0.1:'+server.address().port+
 '/previews/visible-mass-3d/pius-x-conversation-paths-review.html';
const out=resolve(root,'artifacts/pius-x-20path-visual-novel');
await mkdir(out,{recursive:true});
const pinned=/^https:\/\/raw\.githubusercontent\.com\/Fulcanelli13\/ad-orientem\/0a920793bcdf40cc053ad0aff31132ade8185a33\/previews\/visible-mass-3d\/assets\/living-church\/pius_(neutral|welcoming|explaining|thoughtful|grave)\.webp$/;
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const vp of [{width:390,height:844,mobile:true},{width:1280,height:800,mobile:false}]){
  const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},
   isMobile:vp.mobile,hasTouch:vp.mobile,reducedMotion:'reduce',acceptDownloads:true});
  const page=await context.newPage(),errors=[],portraitRequests=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.route(/^https:\/\/raw\.githubusercontent\.com\/Fulcanelli13\/ad-orientem\//,
   route=>{
    if(!pinned.test(route.request().url()))return route.abort('blockedbyclient');
    portraitRequests.push(route.request().url());
    return route.fulfill({status:200,contentType:'image/svg+xml',
     body:'<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="#22212a"/><circle cx="300" cy="270" r="110" fill="#999085"/></svg>'});
   });
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelectorAll('#chapters button.chapter').length===20);
  assert.equal(await page.locator('#chapters button.chapter').count(),20);
  await page.locator('#chapters button.chapter').nth(17).click();
  await page.locator('#content .choice').first().click();
  assert.match(await page.locator('.question-title').textContent(),/same sacrifice as Calvary/i);
  assert.equal(await page.locator('.novel-portrait img').isVisible(),true);
  assert.equal(await page.locator('.novel-dialogue .answer').isVisible(),true);
  assert.ok(portraitRequests.length>0,'pinned approved portrait not requested');
  assert.ok(pinned.test(await page.locator('.novel-portrait img').getAttribute('src')));
  await page.screenshot({path:resolve(out,'pius-20path-scene-'+vp.width+'.png')});
  await page.getByRole('button',{name:'Period-register draft'}).click();
  assert.match(await page.locator('.novel-dialogue .answer').textContent(),/substantially the same as that of Calvary/i);
  await page.getByRole('button',{name:'Voice / tone concern'}).click();
  await page.locator('.editorial textarea').fill('Period wording needs human review, without adding doctrine.');
  const [download]=await Promise.all([page.waitForEvent('download'),
    page.locator('#export-review').click()]);
  assert.equal(download.suggestedFilename(),'pius-x-conversation-editorial-notes.json');
  const save=resolve(out,'notes-'+vp.width+'.json');await download.saveAs(save);
  const data=JSON.parse(await readFile(save,'utf8'));
  assert.equal(data.publicationApproval,false);
  assert.ok(data.choices.find(c=>c.sourceQuestionId==='PX1905-Q655'&&c.status==='tone'));
  await page.locator('#view-folio').click();
  assert.equal(await page.locator('.novel-layout').count(),0);
  await page.locator('#view-scene').click();
  assert.equal(await page.locator('.novel-layout').count(),1);
  await page.locator('#lang-fr').click();
  assert.match(await page.locator('.novel-dialogue .answer').textContent(),/Le Sacrifice de la Messe/i);
  const follow=page.locator('#content .choice-list').first().locator('button.choice');
  assert.ok(await follow.count()>0);
  assert.equal((await follow.allTextContents()).some(x=>/Le sacrifice de la Messe est-il le même/i.test(x)),false);
  await follow.first().click();
  assert.match(await page.locator('.question-title').textContent(),/offrande de la Messe|mode d'offrande/i);
  const extent=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,width:window.innerWidth}));
  assert.ok(extent.scrollWidth<=extent.width+2,'Horizontal overflow '+JSON.stringify(extent));
  assert.deepEqual(errors,[]);
  await context.close();
 }
 console.log('PASS SPX visual-novel browser: 20 paths, pinned portrait, bilingual dialogue, period candidate, review export, no-repeat followups and mobile/desktop layout');
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
