import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
 ".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const location=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+location);
  if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream"});
  res.end(await readFile(file));
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const url="http://127.0.0.1:"+server.address().port+
 "/previews/visible-mass-3d/sanctuary-hotspot-pilot.html?aoLivingChurchReview=1";
let browser;
try{
 browser=await chromium.launch({headless:true});
 const output=resolve(root,"artifacts/living-church-p2-real-photo");
 await mkdir(output,{recursive:true});
 for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
  const ctx=await browser.newContext({viewport,deviceScaleFactor:1,
    isMobile:viewport.width<500,hasTouch:viewport.width<500});
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e)));
  await page.goto(url,{waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>window.AO_LIVING_CHURCH_P2?.status()?.version==="AO_LIVING_CHURCH_SCENE_P2",
   null,{timeout:30000});
  try{
   await page.waitForFunction(()=>{
     const img=document.querySelector("#altar-photo");
     return img?.complete&&img.naturalWidth>=700&&
       !document.querySelector("#photo-canvas")?.classList.contains("image-failed");
   },null,{timeout:25000});
  }catch{
   throw Error("Original licensed Brompton photograph could not be loaded; real-photo acceptance NOT confirmed");
  }
  const photo=await page.locator("#altar-photo").evaluate(el=>({
   actualSource:el.currentSrc,width:el.naturalWidth,height:el.naturalHeight}));
  assert.ok(photo.actualSource.includes("geograph.org.uk_-_6213275.jpg"));
  await page.locator("#lc-stage-open").click();
  await page.locator("#lc-stage .lc-sprite").evaluate(el=>el.decode());
  await page.screenshot({path:resolve(output,"real-brompton-sacristan-"+viewport.width+".png")});
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:"Speak to the Canon"}).click();
  await page.locator("#lc-stage .lc-sprite").evaluate(el=>el.decode());
  await page.screenshot({path:resolve(output,"real-brompton-canon-"+viewport.width+".png")});
  await page.locator("#lc-stage .lc-guides [data-guide='pius-x']").click();
  await page.locator("#lc-stage .lc-sprite").evaluate(el=>el.decode());
  await page.screenshot({path:resolve(output,"real-brompton-pius-"+viewport.width+".png")});
  assert.deepEqual(errors,[]);
  console.log("REAL_PHOTO_CAPTURE "+viewport.width+"px",JSON.stringify(photo));
  await ctx.close();
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
