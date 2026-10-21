/** M4 direct Wikimedia delivery smoke test — no API or image routes mocked.
 * Only desktop Chromium is used for repeatable network CORS verification;
 * this does not certify a physical Windows browser or Android device.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {M4_PANORAMA_SCENES} from "../previews/visible-mass-3d/visible-mass-m4-panorama.mjs";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"dist/visible-mass/m4-live-delivery");
await mkdir(out,{recursive:true});
const types={".html":"text/html; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  const path=resolve(root,"."+p);
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  const data=await readFile(path);res.writeHead(200,{"content-type":types[extname(path)]||"application/octet-stream"});res.end(data);
 }catch(err){res.writeHead(err.code==="ENOENT"?404:500);res.end(String(err.message||err));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
const diagnostics=[];
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:"block"});
 const page=await context.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(String(e)));
 page.on("requestfailed",req=>{
  if(/wikimedia\.org/.test(req.url()))diagnostics.push({phase:"requestfailed",url:req.url().slice(0,170),error:req.failure()?.errorText||"unknown"});
 });
 page.on("response",res=>{
  if(/commons\.wikimedia\.org\/w\/api\.php|upload\.wikimedia\.org/.test(res.url()))
   diagnostics.push({phase:"response",status:res.status(),url:res.url().slice(0,160)});
 });
 await page.goto("http://127.0.0.1:"+server.address().port+"/previews/visible-mass-3d/sanctuary-hotspot-pilot.html",{waitUntil:"domcontentloaded"});
 for(const [mode,id] of [["brompton","BROMPTON_PANO"],["newman","NEWMAN_360"]]){
  await page.locator('[data-photo-mode="'+mode+'"]').click();
  await page.waitForFunction(expected=>{
   const status=window.AO_VISIBLE_MASS_HOTSPOT_PILOT?.status()?.panorama;
   return status?.active===expected&&(status.loaded||!!status.error);
  },id,{timeout:55000});
  const current=await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().panorama);
  if(current.error){
   const metadata=await page.evaluate(async scene=>{
    const mod=await import("./visible-mass-m4-panorama.mjs");
    const data=await (await fetch(mod.m4SourceRequest(scene))).json();
    const info=data?.query?.pages?.[0]?.imageinfo?.[0]||{};
    return {thumburl:info.thumburl,url:info.url,thumbwidth:info.thumbwidth,thumbheight:info.thumbheight,page:data?.query?.pages?.[0]?.title};
   },id);
   console.log("M4 DIRECT COMMONS SOURCE METADATA",id,JSON.stringify(metadata));
  }
  assert.equal(current.error,null,"Direct Commons image access failed: "+JSON.stringify({id,error:current.error,diagnostics}));
  assert.equal(current.loaded,true);
  assert.equal(await page.locator("#panorama-retry").isVisible(),false);
  assert.equal(await page.locator("#photo-credit").getAttribute("href"),M4_PANORAMA_SCENES[id].source);
  assert.ok((await page.locator("#panorama-stage canvas").evaluate(e=>e.width))>=280);
  await page.locator("#panorama-stage canvas").screenshot({path:out+"/"+mode+"-live-original.png"});
  diagnostics.push({phase:"loaded",id,renderer:current.renderer,frameCount:current.frameCount,cachedScenes:current.cachedScenes});
 }
 assert.deepEqual(errors,[],"no uncaught exceptions during direct Commons loading");
 await writeFile(out+"/delivery-diagnostics.json",JSON.stringify({test:"direct external request and CORS browser smoke",result:"pass",diagnostics},null,2));
 console.log("PASS M4 live original Commons image delivery (without mocked API/images):",JSON.stringify(diagnostics.filter(x=>x.phase==="loaded")));
 await context.close();
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
