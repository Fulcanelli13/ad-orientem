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
   if(url.startsWith('http://127.0.0.1:'+server.address().port)||url.startsWith('blob:http://127.0.0.1:'))return route.continue();
   return route.abort('blockedbyclient');
  });
  await page.goto(address,{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('#sceneSelect option').count(),12);
  assert.match(await page.locator('#speaker').innerText(),/EDITORIAL SOURCE READING/);
  assert.match(await page.locator('#visitor').innerText(),/friendship with God/);
  assert.equal(await page.locator('#stageActions button').count(),3);
  const stageGeometry=await page.evaluate(()=>{
    const ids=['gallery','script','visitor','reply','stageActions'];
    const items=Object.fromEntries(ids.map(id=>{
      const e=id==='script'?document.querySelector('.script'):document.getElementById(id),r=e.getBoundingClientRect(),cs=getComputedStyle(e);
      return [id,{x:r.x,y:r.y,w:r.width,h:r.height,scrollTop:e.scrollTop,scrollHeight:e.scrollHeight,overflow:cs.overflow,position:cs.position,zIndex:cs.zIndex}];
    }));
    const b=document.querySelector('#stageActions button'),r=b.getBoundingClientRect();
    const top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return {viewport:{w:window.innerWidth,h:window.innerHeight},button:{x:r.x,y:r.y,w:r.width,h:r.height},top:{tag:top?.tagName,id:top?.id,css:top?.className},items};
  });
  console.log('SPX_STAGED_GEOMETRY '+vp.width+' '+JSON.stringify(stageGeometry));
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
  assert.match(await page.locator('#reply').innerText(),/Peter denied that he knew Our Lord/);
  await page.getByRole('button',{name:/But did Judas not acknowledge his fault/}).click();
  assert.match(await page.locator('#visitor').innerText(),/But did Judas not acknowledge his fault/);
  assert.match(await page.locator('#reply').innerText(),/He returned the money and confessed/);
  await page.getByRole('button',{name:/And what did Peter do after his denial/}).click();
  assert.match(await page.locator('#visitor').innerText(),/And what did Peter do after his denial/);
  assert.match(await page.locator('#reply').innerText(),/wept for his sin and received pardon/);

  await page.locator('#langButton').click();
  assert.match(await page.locator('#visitor').innerText(),/après son reniement/);
  assert.match(await page.locator('#reply').innerText(),/reçut le pardon/);
  await page.locator('#langButton').click();

  await page.locator('#sceneSelect').selectOption('SPX-023');
  assert.match(await page.locator('#speaker').innerText(),/EXPERIMENTAL VOICE/);
  await page.getByRole('button',{name:/If I do not receive the sacrament/}).click();
  await page.getByRole('button',{name:/Can you decide whether I should receive Holy Communion today/}).click();
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
  await page.evaluate(()=>{
    const originalCreate=URL.createObjectURL.bind(URL);
    URL.createObjectURL=blob=>{window.__spxExportBlob=blob;return originalCreate(blob)};
    const originalClick=HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click=function(){
      window.__spxExportAnchor={download:this.download,href:this.href,connected:this.isConnected};
      return originalClick.call(this);
    };
  });
  await page.locator('#exportRating').click();
  const captured=await page.evaluate(async()=>({
    payload:window.__spxExportBlob?JSON.parse(await window.__spxExportBlob.text()):null,
    anchor:window.__spxExportAnchor||null
  }));
  assert(captured.payload,'review export must generate a complete client-side JSON Blob');
  assert.equal(captured.anchor?.download,'pius-x-12-scene-review-ratings.json');
  assert.equal(captured.anchor?.connected,true,'download link was connected when clicked');
  assert.match(captured.anchor.href,/^blob:http:\/\/127\.0\.0\.1:/);
  const exported=captured.payload;
  assert.equal(exported.schema,'AO_SPX_DEPTH12_EDITORIAL_SCENE_RATINGS_V1');
  assert.equal(exported.ratings['SPX-023'].pacing,'4');
  assert.equal(exported.ratings['SPX-023'].voice,'3');
  assert.equal(exported.ratings['SPX-023'].clarity,'5');
  assert.equal(exported.ratings['SPX-023'].notes,'The source and performer must remain separate.');
  await page.locator('#closeReview').click();
  assert.equal(await page.locator('#review').isVisible(),false);

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