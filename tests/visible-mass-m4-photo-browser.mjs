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
  const initial=(await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).panorama.pose;
  await page.locator('[data-pan="up"]').click();
  const moved=(await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).panorama.pose;
  assert.ok(moved.pitch>initial.pitch,"up control must turn toward zenith");
  await page.locator('[data-photo-mode="newman"]').click();
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().panorama?.active==="NEWMAN_360"&&window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().panorama.loaded);
  assert.match(await page.locator("#photo-caption").innerText(),/separate Catholic church, not a 1962 Mass record/);
  assert.equal(await page.locator("#photo-viewport").isVisible(),false);
  await page.locator('[data-photo-mode="brompton"]').click();
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().panorama?.active==="BROMPTON_PANO"&&window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().panorama.loaded);
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).panorama.pose.pitch,moved.pitch,"pose retained for original photograph");
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
