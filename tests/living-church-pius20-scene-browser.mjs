import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';
import {PIUS_20_REVIEW_PIN} from '../previews/visible-mass-3d/living-church-pius20-source-bridge.mjs';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const hostRoot=resolve(root,'research-out/pius20-pinned-source');
const whitelist=new Set([
 'pius-x-20path-bilingual-choice-navigation-20261020.v1.json',
 'pius-x-source-bounded-bilingual-corrections-20261020.v1.json',
 'pius-x-chanoine-22-answer-aq04-aq05-eligibility-20261020.v1.json',
 'pius-x-historical-visual-novel-stage-20261020.v1.json',
 'pius-x-six-period-voice-candidates-20261020.v1.json',
 ...['a','b','c','d','e'].map(k=>'pius-x-batch9-sacraments-'+k+'-20261020.v1.json'),
 ...['a','b','c','d','e'].map(k=>'pius-x-batch10-eucharist-'+k+'-20261020.v1.json')
]);
assert.equal(whitelist.size,15);
const mimes={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp'};
const server=http.createServer(async(req,res)=>{
 try{
  const requested=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  const path=resolve(root,'.'+requested);
  if(!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(path);
  res.writeHead(200,{'content-type':mimes[extname(path)]||'application/octet-stream'});res.end(bytes);
 }catch(e){res.writeHead(e.code==='ENOENT'?404:500);res.end(String(e));}
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const url='http://127.0.0.1:'+server.address().port+
 '/previews/visible-mass-3d/sanctuary-hotspot-pilot.html?aoLivingChurchReview=1&aoPius20Review=1';
const out=resolve(root,'artifacts/living-church-pius20-review');
await mkdir(out,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const vp of [{width:390,height:844},{width:1280,height:800}]){
  const ctx=await browser.newContext({viewport:vp,isMobile:vp.width===390,hasTouch:vp.width===390,reducedMotion:'reduce'});
  const page=await ctx.newPage(),errors=[],sourceReads=new Set();
  page.on('pageerror',e=>errors.push(String(e)));
  await page.route('https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/**',async route=>{
   const u=new URL(route.request().url());
   const pathPrefix='/Fulcanelli13/ad-orientem/'+PIUS_20_REVIEW_PIN+'/data/learn/research/';
   if(!u.pathname.startsWith(pathPrefix))return route.fulfill({status:404,body:'Unpinned original denied'});
   const file=u.pathname.slice(pathPrefix.length);
   if(!whitelist.has(file))return route.fulfill({status:404,body:'Unknown original denied'});
   sourceReads.add(file);
   const bytes=await readFile(resolve(hostRoot,file));
   return route.fulfill({status:200,contentType:'application/json',body:bytes.toString('utf8')});
  });
  await page.route(/^https:\/\/(?:thumb|upload)\.wikimedia\.org\//,r=>r.fulfill({
   status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="900"><rect width="1000" height="900" fill="#28231e"/></svg>'
  }));
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.AO_LIVING_CHURCH_P2?.status().pius20Available===true,null,{timeout:45000});
  assert.equal(sourceReads.size,15);
  assert.equal(await page.evaluate(()=>AO_LIVING_CHURCH_P2.status().published),false);
  await page.locator('#lc-stage-open').click();
  await page.locator('#lc-stage .lc-guides button[data-guide="pius-x"]').click();
  await page.locator('#lc-stage .lc-actions').getByRole('button',{name:/Explore 20 source-backed Catechism paths/}).click();
  assert.match(await page.locator('#lc-stage .lc-name').innerText(),/SOURCE-FIRST REVIEW/);
  const nav=page.locator('#lc-stage .lc-actions');
  for(let i=0;i<3;i++)await nav.getByRole('button',{name:'More subjects'}).click();
  await nav.getByRole('button',{name:/Mass a repetition of Calvary\?/}).click();
  await nav.getByRole('button',{name:/Is the Sacrifice of the Mass the same sacrifice as Calvary\?/}).click();
  await page.waitForFunction(()=>AO_LIVING_CHURCH_P2.status().pius20Visited===1);
  assert.match(await page.locator('#lc-stage .lc-dialogue').innerText(),/same|substantially|Christ/i);
  assert.match(await page.locator('#lc-stage .lc-source-record').innerText(),/1905|PX1905-Q655/);
  assert.match(await page.locator('#lc-stage .lc-note').innerText(),/UNAPPROVED REVIEW/);
  assert.equal(await page.locator('#lc-stage .lc-sprite').isVisible(),true);
  assert.match(await page.locator('#lc-stage .lc-sprite').getAttribute('src'),/pius_grave\.webp/);
  assert.equal(await page.locator('#lc-stage .lc-ask').isHidden(),true);
  await page.screenshot({path:resolve(out,'pius20-living-church-'+vp.width+'.png')});
  // Language changes retain the same question rather than starting a new script.
  await nav.getByRole('button',{name:'Français'}).click();
  await page.waitForFunction(()=>AO_LIVING_CHURCH_P2.status().pius20Language==='fr');
  assert.match(await page.locator('#lc-stage .lc-dialogue').innerText(),/Jésus-Christ|Croix|substantiellement/i);
  assert.equal(await page.evaluate(()=>AO_LIVING_CHURCH_P2.status().pius20Visited),1);
  await nav.getByRole('button',{name:/Chapitre|Questions du chapitre/}).click();
  assert.match(await page.locator('#lc-stage .lc-dialogue').innerText(),/Messe|Calvaire/i);
  await nav.getByRole('button',{name:/Le Sacrifice de la Messe est-il le même|sacrifice que celui du Calvaire/i}).click();
  await page.waitForFunction(()=>AO_LIVING_CHURCH_P2.status().pius20Visited===1);
  await nav.getByRole('button',{name:/Revenir à saint Pie X/}).click();
  assert.equal(await page.evaluate(()=>AO_LIVING_CHURCH_P2.status().node),'pius');
  assert.equal(await page.locator('#lc-stage .lc-ask').isVisible(),true);
  await page.locator('#lc-stage .lc-guides button[data-guide="canon"]').click();
  assert.equal(await page.evaluate(()=>AO_LIVING_CHURCH_P2.status().guide),'canon');
  assert.equal(await page.locator('#photo-canvas').count(),1);
  assert.deepEqual(errors,[]);
  await ctx.close();
 }
 console.log('PASS Living Church P2 pinned SPX 20-path integration at 390px and desktop: 15 source files, approved sprites, bilingual return, no typed prompt capture, original Canon/Mass controls intact');
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
