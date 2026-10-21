import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const assetFolder=resolve(root,'research-out/pius-x-depth12-review-sprites');
const manifest=JSON.parse(await readFile(resolve(assetFolder,'manifest.json'),'utf8'));
assert.equal(manifest.schema,'AO_LIVING_CHURCH_SPRITES_LOCKED_V1');
const variants=['neutral','welcoming','explaining','thoughtful','grave'];
const images={};
for(const pose of variants){
 const name='pius_'+pose+'.webp',data=await readFile(resolve(assetFolder,name));
 const digest=createHash('sha256').update(data).digest('hex');
 assert.equal(digest,manifest.variants[name].sha256,'Approved sprite byte preservation');
 images[name]=data;
}
const html='/previews/pius-x-12scene-visual-novel-editorial-review-20261021.html';
const server=http.createServer(async(req,res)=>{
 try{
  const sub=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=resolve(root,'.'+sub);
  if(!file.startsWith(root+sep)) {res.writeHead(403);res.end();return;}
  const data=await readFile(file);
  res.writeHead(200,{'content-type':extname(file)==='.html'?'text/html; charset=utf-8':'application/octet-stream'});
  res.end(data);
 }catch(e){res.writeHead(e.code==='ENOENT'?404:500);res.end(String(e))}
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const address='http://127.0.0.1:'+server.address().port+html;
const expectedAssetBase='https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/2245d762237ef36fc778200ab2b3d536c342d2d4/previews/visible-mass-3d/assets/living-church/';
const artefacts=resolve(root,'artifacts/pius-x-depth12-visual-review');
await mkdir(artefacts,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const vp of [{width:390,height:844,phone:true},{width:1280,height:800,phone:false}]){
  const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.phone,hasTouch:vp.phone,acceptDownloads:true,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.route('**/*',route=>{
   const url=route.request().url();
   if(url.startsWith(expectedAssetBase)){
    const file=url.slice(expectedAssetBase.length);
    if(!Object.hasOwn(images,file))return route.abort('blockedbyclient');
    requests.push(file);
    return route.fulfill({status:200,contentType:'image/webp',body:images[file]});
   }
   if(url.startsWith('http://127.0.0.1:'+server.address().port))return route.continue();
   return route.abort('blockedbyclient');
  });
  await page.goto(address,{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('#sceneSelect option').count(),12);
  assert.match(await page.locator('#speaker').innerText(),/EDITORIAL SOURCE READING/);
  assert.match(await page.locator('#visitor').innerText(),/friendship with God/);
  assert.equal(await page.locator('#stageActions button').count(),3);
  await page.locator('#stageActions button').first().click();
  assert.match(await page.locator('#stateTrail').innerText(),/follow/);
  await page.locator('#stageActions button').first().click();
  assert.match(await page.locator('#stateTrail').innerText(),/deep/);
  assert.equal(await page.locator('#progress').innerText(),'3 / 3');
  await page.getByRole('button',{name:'Other subjects'}).click();
  assert.equal(await page.locator('#stageActions button').count(),13,'all twelve topics and return in stage');
  await page.getByRole('button',{name:'Back',exact:true}).click();
  assert.match(await page.locator('#stateTrail').innerText(),/deep/);

  await page.locator('#sceneSelect').selectOption('SPX-010');
  const mode=page.locator('#voiceButton');
  assert.equal(await mode.isVisible(),true);
  await mode.click();
  assert.match(await page.locator('#speaker').innerText(),/EXPERIMENTAL VOICE/);
  assert.match(await page.locator('#reply').innerText(),/Peter fell grievously/);
  await page.getByRole('button',{name:/Was Peter.s betrayal less serious/}).click();
  assert.match(await page.locator('#visitor').innerText(),/Was Peter.s betrayal less serious/);
  assert.match(await page.locator('#reply').innerText(),/Repentance does not make betrayal a small matter/);
  await page.getByRole('button',{name:/What keeps sorrow for sin/}).click();
  assert.match(await page.locator('#visitor').innerText(),/What keeps sorrow for sin/);
  assert.match(await page.locator('#reply').innerText(),/impossibility of pardon/);

  await page.locator('#langButton').click();
  assert.match(await page.locator('#visitor').innerText(),/empêche la douleur/);
  assert.match(await page.locator('#reply').innerText(),/miséricorde/);
  await page.locator('#langButton').click();

  await page.locator('#sceneSelect').selectOption('SPX-023');
  assert.match(await page.locator('#speaker').innerText(),/EXPERIMENTAL VOICE/);
  await page.getByRole('button',{name:/Is spiritual Communion without value/}).click();
  await page.getByRole('button',{name:/Can you tell whether I ought to receive Communion today/}).click();
  assert.match(await page.locator('#speaker').innerText(),/EDITORIAL SOURCE BOUNDARY/);
  assert.equal(await page.locator('#gallery').evaluate(x=>x.classList.contains('editorial-boundary')),true);
  assert.equal(await page.locator('#sprite').isVisible(),false,'Pius cannot appear to utter editorial sacramental disclaimer');
  await page.locator('#voiceButton').click();
  assert.equal(await page.locator('#gallery').evaluate(x=>x.classList.contains('editorial-boundary')),false);

  await page.locator('#reviewButton').click();
  await page.locator('#ratePace').selectOption('4');
  await page.locator('#rateVoice').selectOption('3');
  await page.locator('#rateClarity').selectOption('5');
  await page.locator('#notes').fill('The source and performer must remain separate.');
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#exportRating').click()]);
  assert.equal(download.suggestedFilename(),'pius-x-12-scene-review-ratings.json');
  const dest=resolve(artefacts,'review-'+vp.width+'.json');
  await download.saveAs(dest);
  const exported=JSON.parse(await readFile(dest,'utf8'));
  assert.equal(exported.schema,'AO_SPX_DEPTH12_EDITORIAL_SCENE_RATINGS_V1');
  assert.equal(exported.ratings['SPX-023'].pacing,'4');
  assert.equal(exported.ratings['SPX-023'].voice,'3');
  assert.equal(exported.ratings['SPX-023'].clarity,'5');
  assert.equal(exported.ratings['SPX-023'].notes,'The source and performer must remain separate.');

  await page.locator('#sceneSelect').selectOption('SPX-032');
  await page.locator('#voiceButton').click();
  await page.locator('#evidenceButton').click();
  assert.equal(await page.locator('#evidence').isVisible(),true);
  assert.match(await page.locator('#sourceLink').getAttribute('href'),/^https:\/\/www\.vatican\.va\//);
  const extent=await page.evaluate(()=>({html:document.documentElement.scrollWidth,body:document.body.scrollWidth,width:window.innerWidth}));
  assert(extent.html<=extent.width+3&&extent.body<=extent.width+3,'horizontal overflow '+JSON.stringify(extent));
  assert.deepEqual(errors,[],'no browser JS exception');
  assert(requests.includes('pius_explaining.webp'));
  assert(requests.includes('pius_thoughtful.webp'));

  for(const pose of variants){
   const works=await page.evaluate(async url=>{const img=new Image();img.src=url;await img.decode();return {width:img.naturalWidth,height:img.naturalHeight}},expectedAssetBase+'pius_'+pose+'.webp');
   assert.equal(works.width,manifest.variants['pius_'+pose+'.webp'].width);
   assert.equal(works.height,manifest.variants['pius_'+pose+'.webp'].height);
  }
  await page.screenshot({path:resolve(artefacts,'pius-12-deep-'+vp.width+'.png'),fullPage:true});
  await context.close();
 }
 console.log('PASS Pius X depth12 Chromium at 390/1280: 12 scenes, 3 dependent turn choices, source/voice toggle, EN/FR, off-character hold, 5 authentic hashed sprites, reviewer export, no horizontal overflow.');
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}