import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const pagePath="/previews/visible-mass-3d/sanctuary-hotspot-pilot.html";
const mime={".html":"text/html; charset=utf-8",".json":"application/json; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".js":"text/javascript; charset=utf-8"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream"});
  res.end(data);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message||e));}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const url="http://127.0.0.1:"+server.address().port+pagePath;
const out=resolve(root,"dist/visible-mass/sanctuary-qa");
await mkdir(out,{recursive:true});
const pano='<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1024" viewBox="0 0 2048 1024"><rect width="2048" height="512" fill="#536473"/><rect y="512" width="2048" height="512" fill="#564334"/><circle cx="1024" cy="512" r="90" fill="#dec899"/></svg>';
const still='<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="859" viewBox="0 0 1280 859"><rect width="1280" height="859" fill="#29303a"/></svg>';
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const spec of [{name:"desktop",width:1280,height:820,mobile:false},{name:"phone",width:390,height:844,mobile:true}]){
  const context=await browser.newContext({viewport:{width:spec.width,height:spec.height},deviceScaleFactor:spec.mobile?2:1,isMobile:spec.mobile,hasTouch:spec.mobile});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e)));
  await page.route(/^https:\/\/(?:thumb|upload)\.wikimedia\.org\//,route=>route.fulfill({
   status:200,contentType:"image/svg+xml",headers:{"access-control-allow-origin":"*"},body:still}));
  await page.route(/^https:\/\/commons\.wikimedia\.org\/w\/api\.php\?/,route=>route.fulfill({
   status:200,contentType:"application/json",headers:{"access-control-allow-origin":"*"},
   body:JSON.stringify({query:{pages:[{imageinfo:[{thumburl:"https://upload.wikimedia.org/wikipedia/commons/thumb/m4-review-panorama.jpg"}]}]}})}));
  await page.route("https://upload.wikimedia.org/wikipedia/commons/thumb/m4-review-panorama.jpg",route=>route.fulfill({
   status:200,contentType:"image/svg+xml",headers:{"access-control-allow-origin":"*"},body:pano}));
  await page.goto(url,{waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT?.status().questionsLoaded===134);
  assert.equal(await page.locator("#hotspots .marker").count(),6);
  const beforeRead=(await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus()))?.readCount??0;
  await page.locator('[data-photo-mode="brompton"]').click();
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().panorama?.loaded===true,{timeout:20000});
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).photoMode,"brompton");
  assert.equal(await page.locator("#photo-viewport").isVisible(),false);
  assert.equal(await page.locator("#panorama-stage canvas").count(),1);
  assert.match(await page.locator("#photo-credit").innerText(),/David Iliff.*CC BY-SA 3.0/);
  await page.waitForTimeout(150);
  const pixelProof=await page.evaluate(async()=>{
   const canvas=document.querySelector("#panorama-stage canvas");
   const image=new Image();
   await new Promise((ok,fail)=>{image.onload=ok;image.onerror=fail;image.src=canvas.toDataURL("image/png");});
   const sampler=document.createElement("canvas");sampler.width=canvas.width;sampler.height=canvas.height;
   const ctx=sampler.getContext("2d");ctx.drawImage(image,0,0);
   const point=y=>Array.from(ctx.getImageData(Math.floor(canvas.width/2),Math.floor(canvas.height*y),1,1).data).slice(0,3);
   return {renderer:window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().panorama.renderer,upper:point(.2),lower:point(.8)};
  });
  console.log("M4 SYNTHETIC SPHERE PIXELS",spec.name,JSON.stringify(pixelProof));
  assert.ok(pixelProof.upper[2]>pixelProof.upper[0],"upright scene upper half must be blue, not black or floor");
  assert.ok(pixelProof.lower[0]>pixelProof.lower[2],"upright scene lower half must be brown, not ceiling");
  const initial=(await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).panorama.pose;
  await page.locator('[data-pan="up"]').click();
  const moved=(await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).panorama.pose;
  assert.ok(moved.pitch>initial.pitch,"up control must turn toward zenith");
  // M4 touch/drag contract: real pointer gestures must turn the actual camera,
  // never navigate the page or mark source-owned VMQ questions as read.
  const surface=page.locator("#panorama-stage canvas");
  const box=await surface.boundingBox();
  assert.ok(box&&box.width>100&&box.height>100);
  const x=box.x+box.width*.5,y=box.y+box.height*.5;
  const beforeDrag=(await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).panorama;
  if(spec.mobile){
   const session=await context.newCDPSession(page);
   await session.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y,id:1}]});
   await session.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:x+48,y:y-20,id:1}]});
   await session.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
   await session.detach();
  }else{
   await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+48,y-20,{steps:4});await page.mouse.up();
  }
  const afterDrag=(await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).panorama;
  assert.notEqual(afterDrag.pose.yaw,beforeDrag.pose.yaw,"drag gesture changes fixed-position photographic yaw");
  assert.ok(afterDrag.frameCount>=beforeDrag.frameCount,"camera redraw remains available");
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus()))?.readCount??0,beforeRead);
  const beforeResize=await page.locator("#panorama-stage canvas").evaluate(el=>el.width);
  await page.setViewportSize({width:spec.mobile?790:700,height:spec.height});
  await page.waitForTimeout(180);
  const afterResize=await page.locator("#panorama-stage canvas").evaluate(el=>el.width);
  assert.notEqual(afterResize,beforeResize,"panorama canvas adapts to viewport change");
  await page.setViewportSize({width:spec.width,height:spec.height});
  await page.waitForTimeout(180);
  await page.locator('[data-photo-mode="newman"]').click();
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().panorama?.active==="NEWMAN_360"&&window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().panorama.loaded);
  assert.match(await page.locator("#photo-caption").innerText(),/separate Catholic church, not a 1962 Mass record/);
  assert.equal(await page.locator("#photo-viewport").isVisible(),false);
  await page.locator('[data-photo-mode="brompton"]').click();
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().panorama?.active==="BROMPTON_PANO"&&window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().panorama.loaded);
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).panorama.pose.pitch,afterDrag.pose.pitch,"last finger-adjusted pose retained for original photograph");
  await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.select("AL01"));
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).view,"church","object selection uses original hotspot still");
  await page.locator("#close-card").click();
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().panorama?.active==="BROMPTON_PANO"&&window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().panorama.loaded);
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus()))?.readCount??0,beforeRead);
  await page.screenshot({path:out+"/"+spec.name+"-m4-review-panorama.png"});
  await page.locator('[data-photo-mode="still"]').click();
  assert.equal(await page.locator("#panorama-stage").isVisible(),false);
  assert.equal(await page.locator("#hotspots .marker").count(),6);
  assert.deepEqual(errors,[],"no uncaught JS errors");
  await context.close();
  console.log("M4 browser continuity PASS",spec.name,spec.width+"x"+spec.height);
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
