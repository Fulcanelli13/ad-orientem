import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream"});
  res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const url="http://127.0.0.1:"+server.address().port+
 "/previews/visible-mass-3d/sanctuary-hotspot-pilot.html?aoLivingChurchReview=1";
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
  const ctx=await browser.newContext({viewport,hasTouch:viewport.width===390,isMobile:viewport.width===390});
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e)));
  // Same existing photo-browser test policy: this does not certify the image.
  await page.route(/^https:\/\/(?:thumb|upload)\.wikimedia\.org\//,r=>
    r.fulfill({status:200,contentType:"image/svg+xml",
     body:'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#302a24"/></svg>'}));
  await page.goto(url,{waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_LIVING_CHURCH_P1?.status().sceneSupported===true &&
   window.AO_VISIBLE_MASS_HOTSPOT_PILOT?.status().questionsLoaded===134,{timeout:30000});
  const current=()=>page.evaluate(()=>window.AO_VISIBLE_MASS_LIVING_CHURCH_P1.status());
  assert.equal((await current()).context.scene.sceneId,"BROMPTON_ALTAR_2019_B");
  assert.equal((await current()).context.mode,"explore");
  assert.equal((await current()).massHandoffIntegrated,false);
  await page.locator('.marker[data-object="AL01"]').click();
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_LIVING_CHURCH_P1.status().context.objectId==="AL01");
  assert.equal((await current()).context.mode,"understand");
  const chosen=await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.chooseTrail("FIRST_VISIT"));
  assert.equal(chosen,true);
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_LIVING_CHURCH_P1.status().context.trailId==="FIRST_VISIT");
  const opened=await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideExplore("VMQ-0001"));
  assert.equal(opened,true);
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_LIVING_CHURCH_P1.status().context.questionId==="VMQ-0001");
  const originalRead=await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus().readCount);
  const checked=await page.evaluate(()=>window.AO_VISIBLE_MASS_LIVING_CHURCH_P1.sync());
  assert.equal(checked.ok,true);
  assert.equal(await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus().readCount),originalRead,
    "P1 adapter never marks original question read");
  assert.equal((await current()).context.trailId,"FIRST_VISIT");
  await page.locator("#study-language").selectOption("fr");
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_LIVING_CHURCH_P1.status().context.lang==="fr");
  await page.locator("#back-to-object").click();
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_LIVING_CHURCH_P1.status().context.questionId===null);
  assert.equal((await current()).context.objectId,"AL01");
  await page.locator("#close-card").click();
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_LIVING_CHURCH_P1.status().context.objectId===null);
  assert.equal((await current()).context.trailId,"FIRST_VISIT");
  assert.equal((await current()).sceneSupported,true);
  assert.equal((await current()).context.questionId,null);
  assert.deepEqual(errors,[]);
  await ctx.close();
  console.log("PASS real original Visible Mass photo + Living Church P1 context "+viewport.width+"x"+viewport.height);
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
