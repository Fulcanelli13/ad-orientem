import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".webp":"image/webp"};
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
  const context=await browser.newContext({viewport,isMobile:viewport.width===390,hasTouch:viewport.width===390,reducedMotion:"reduce"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",err=>errors.push(String(err)));
  await page.route(/^https:\/\/(?:thumb|upload)\.wikimedia\.org\//,route=>
    route.fulfill({status:200,contentType:"image/svg+xml",
      body:'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#302a24"/></svg>'}));
  await page.goto(url,{waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>
    window.AO_LIVING_CHURCH_P2?.status().version==="AO_LIVING_CHURCH_SCENE_P2" &&
    window.AO_VISIBLE_MASS_LIVING_CHURCH_P1?.status().sceneSupported===true,{timeout:30000});
  const original=await page.evaluate(()=>window.AO_VISIBLE_MASS_LIVING_CHURCH_P1.status().context.scene);
  await page.locator("#lc-stage-open").click();
  assert.equal(await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status().open),true);
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:"Show me the altar"}).click();
  assert.equal(await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status().node),"altar");
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:"Ask the Canon"}).click();
  assert.equal(await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status().guide),"canon");
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:"Ask St Pius X"}).click();
  assert.equal(await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status().guide),"pius-x");
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:"Return to Sacristan"}).click();
  assert.equal(await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status().guide),"sacristan");
  const scene=await page.evaluate(()=>window.AO_VISIBLE_MASS_LIVING_CHURCH_P1.status().context.scene);
  assert.deepEqual(scene,original,"guide switches must retain original photograph and camera pose");
  await page.locator("#lc-stage [data-close]").click();
  assert.equal(await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status().open),false);
  assert.equal(await page.locator("#photo-canvas").count(),1);
  assert.deepEqual(errors,[]);
  console.log("PASS Living Church P2 original photograph and safe character handoff "+viewport.width+"px");
  await context.close();
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
