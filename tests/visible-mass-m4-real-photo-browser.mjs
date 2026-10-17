/** M4 photographic acceptance: original Commons-derived JPGs, not synthetic test art.
 * CI only. Browser assertions do not replace human Windows/Android visual approval.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {M4_PANORAMA_SCENES} from "../previews/visible-mass-3d/visible-mass-m4-panorama.mjs";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const imagesPath=resolve(root,process.env.AO_M4_REAL_DIR||"dist/visible-mass/panorama-sources");
const photoBytes={
 BROMPTON_PANO:await readFile(resolve(imagesPath,"brompton360.jpg")),
 NEWMAN_360:await readFile(resolve(imagesPath,"newman360.jpg"))
};
const target="/previews/visible-mass-3d/sanctuary-hotspot-pilot.html";
const mime={".html":"text/html; charset=utf-8",".json":"application/json; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".js":"text/javascript; charset=utf-8"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  const file=resolve(root,"."+p);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream"});res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const url="http://127.0.0.1:"+server.address().port+target;
const out=resolve(root,"dist/visible-mass/m4-real-photo-qa");
await mkdir(out,{recursive:true});
let browser;const report=[];
try{
 browser=await chromium.launch({headless:true});
 for(const viewport of [{name:"desktop",width:1280,height:820,mobile:false},{name:"phone",width:390,height:844,mobile:true}]){
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:viewport.mobile?2:1,isMobile:viewport.mobile,hasTouch:viewport.mobile});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e)));
  // Other original object still-image evidence is not involved in the sphere test.
  const ordinaryStill='<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="859"><rect width="1280" height="859" fill="#15212c"/></svg>';
  await page.route(/^https:\/\/(?:upload|thumb)\.wikimedia\.org\//,route=>route.fulfill({
   status:200,contentType:"image/svg+xml",headers:{"access-control-allow-origin":"*"},body:ordinaryStill}));
  await page.route(/^https:\/\/commons\.wikimedia\.org\/w\/api\.php\?/,route=>{
   const title=new URL(route.request().url()).searchParams.get("titles");
   const chosen=Object.values(M4_PANORAMA_SCENES).find(x=>"File:"+x.filename===title);
   if(!chosen)throw Error("Unexpected photographic source: "+title);
   return route.fulfill({status:200,contentType:"application/json",headers:{"access-control-allow-origin":"*"},
    body:JSON.stringify({query:{pages:[{imageinfo:[{thumburl:"https://upload.wikimedia.org/wikipedia/commons/m4-original-"+chosen.id+".jpg"}]}]}})});
  });
  await page.route(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/m4-original-(?:BROMPTON_PANO|NEWMAN_360)\.jpg$/,route=>{
   const scene=route.request().url().match(/m4-original-(BROMPTON_PANO|NEWMAN_360)\.jpg$/)?.[1];
   if(!scene)throw Error("Unknown test photo identity");
   return route.fulfill({status:200,body:photoBytes[scene],contentType:"image/jpeg",
    headers:{"access-control-allow-origin":"*"}});
  });
  await page.goto(url,{waitUntil:"domcontentloaded"});
  for(const [sceneId,mode] of [["BROMPTON_PANO","brompton"],["NEWMAN_360","newman"]]){
   const scene=M4_PANORAMA_SCENES[sceneId];
   await page.locator('[data-photo-mode="'+mode+'"]').click();
   await page.waitForFunction(id=>{const x=window.AO_VISIBLE_MASS_HOTSPOT_PILOT?.status()?.panorama;return x?.active===id&&x.loaded&&x.frameCount>=1;},sceneId,{timeout:35000});
   await page.waitForTimeout(220);
   assert.equal(await page.locator("#photo-viewport").isVisible(),false,"never transplant original still hotspots");
   assert.equal(await page.locator("#photo-credit").getAttribute("href"),scene.source);
   assert.equal(await page.locator("#photo-license").getAttribute("href"),scene.licenceUrl);
   assert.equal(await page.locator("#photo-transform").isVisible(),true,"derived perspective attribution");
   assert.ok((await page.locator("#photo-caption").innerText()).includes(scene.venue.split(",")[0]));
   await page.locator("#panorama-stage canvas").screenshot({path:out+"/"+viewport.name+"-"+mode+"-altar-facing.png"});
   // Same source decoded independently. Compare pixel mapping when looking UP
   // versus DOWN; this detects a vertically flipped shader/texture upload.
   const readings=[];
   for(const direction of ["up","down"]){
    for(let n=0;n<5;n++)await page.locator('[data-pan="'+direction+'"]').click();
    await page.waitForTimeout(180);
    const sample=await page.evaluate(async photoUrl=>{
     const canvas=document.querySelector("#panorama-stage canvas");
     const panorama=window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().panorama;
     const {m4EquirectangularUV}=await import("./visible-mass-m4-panorama.mjs");
     const image=new Image();image.crossOrigin="anonymous";
     await new Promise((ok,fail)=>{image.onload=ok;image.onerror=fail;image.src=photoUrl;});
     const src=document.createElement("canvas");src.width=image.naturalWidth;src.height=image.naturalHeight;
     const ctx=src.getContext("2d",{willReadFrequently:true});ctx.drawImage(image,0,0);
     const content=new Image();
     await new Promise((ok,fail)=>{content.onload=ok;content.onerror=fail;content.src=canvas.toDataURL("image/png");});
     const dest=document.createElement("canvas");dest.width=canvas.width;dest.height=canvas.height;
     const dc=dest.getContext("2d",{willReadFrequently:true});dc.drawImage(content,0,0);
     const samples=[];
     for(const px of [.35,.5,.65]){
      const x=Math.round(canvas.width*px),y=Math.round(canvas.height*.5);
      const uv=m4EquirectangularUV(x,y,canvas.width,canvas.height,panorama.pose);
      const drawn=dc.getImageData(x,y,1,1).data;
      const top=ctx.getImageData(Math.min(src.width-1,Math.floor(uv.u*src.width)),Math.min(src.height-1,Math.floor(uv.v*src.height)),1,1).data;
      const inverted=ctx.getImageData(Math.min(src.width-1,Math.floor(uv.u*src.width)),Math.min(src.height-1,Math.floor((1-uv.v)*src.height)),1,1).data;
      const error=(a,b)=>Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2);
      samples.push({expected:error(drawn,top),flipped:error(drawn,inverted),drawn:Array.from(drawn).slice(0,3),source:Array.from(top).slice(0,3),inverted:Array.from(inverted).slice(0,3),u:uv.u,v:uv.v});
     }
     return {renderer:panorama.renderer,lastRenderMs:panorama.lastRenderMs,pitch:panorama.pose.pitch,samples};
    },"https://upload.wikimedia.org/wikipedia/commons/m4-original-"+sceneId+".jpg");
    readings.push({direction,...sample});
    // Return to original initial pose before checking the opposite direction.
    for(let n=0;n<5;n++)await page.locator('[data-pan="'+(direction==="up"?"down":"up")+'"]').click();
    await page.waitForTimeout(100);
   }
   const mean=key=>readings.flatMap(r=>r.samples.map(s=>s[key])).reduce((a,b)=>a+b,0)/6;
   const uprightError=mean("expected"),flippedError=mean("flipped");
   assert.ok(readings[0].pitch>.3&&readings[1].pitch<-.3,"vertical controls must move in physical directions");
   console.log("M4 REAL IMAGE PIXEL PROOF",sceneId,viewport.name,JSON.stringify({uprightError,flippedError,readings}));
   assert.ok(uprightError+12<flippedError,"ACTUAL photograph must be upright, not inverted: "+JSON.stringify({sceneId,uprightError,flippedError,readings}));
   report.push({viewport:viewport.name,sceneId,renderer:readings[0].renderer,uprightError:Math.round(uprightError),flippedError:Math.round(flippedError),lastRenderMs:readings[0].lastRenderMs});
  }
  assert.deepEqual(errors,[],"no uncaught JS error from actual real photos");
  await context.close();
 }
 await writeFile(out+"/m4-real-photo-report.json",JSON.stringify({status:"RESEARCH_PASS_NOT_DEVICE_ACCEPTANCE",report},null,2));
 console.log("PASS M4 original licensed panorama pixel-mapping and view fidelity",JSON.stringify(report));
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
