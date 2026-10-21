import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const folder=resolve(root,"test-output/historia-theatre-p4");
await mkdir(folder,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const path=resolve(root,"."+pathname);
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes)});
const url="http://127.0.0.1:"+server.address().port+"/labs/historia-salutis-theatre-p4.html";
let browser=null;
const metrics=async page=>page.evaluate(()=>({
 viewport:document.documentElement.clientWidth,
 documentWidth:document.documentElement.scrollWidth,
 stageWidth:document.querySelector(".stage").getBoundingClientRect().width,
 folioWidth:document.querySelector(".folio").getBoundingClientRect().width,
 stageVisible:document.querySelector(".stage").getBoundingClientRect().height>0
}));
function assertNoHorizontalOverflow(g,size){
 assert.ok(g.documentWidth<=g.viewport+1,"Horizontal overflow at "+size+": "+JSON.stringify(g));
 assert.ok(g.stageWidth>160&&g.folioWidth>170&&g.stageVisible,"Theatre panels collapsed at "+size+": "+JSON.stringify(g));
}
try{
 browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-webgl"]});
 const offline=await browser.newContext({viewport:{width:390,height:844},locale:"en-GB",reducedMotion:"reduce"});
 const p=await offline.newPage(),errors=[];
 p.on("pageerror",e=>errors.push(e.message));
 await p.route("**/*",route=>{
  if(route.request().url().startsWith("http://127.0.0.1:"))return route.continue();
  return route.abort("failed");
 });
 await p.goto(url,{waitUntil:"domcontentloaded",timeout:45000});
 await p.locator("#scene-title").waitFor({state:"visible"});
 assert.equal(await p.locator("#scene-title").textContent(),"The Baptism in the Jordan");
 assert.equal(await p.locator("#map").isVisible(),true);
 assert.equal(await p.locator("#vision.show").count(),0);
 for(const size of [320,390,768,1280]){
  await p.setViewportSize({width:size,height:size===1280?800:size===768?1024:844});
  await p.waitForTimeout(50);
  assertNoHorizontalOverflow(await metrics(p),size);
  await p.screenshot({path:resolve(folder,"offline-"+size+".png"),animations:"disabled"});
 }
 await p.setViewportSize({width:390,height:844});
 await p.locator('[data-scene="1"]').click();
 assert.equal(await p.locator("#scene-title").textContent(),"The Transfiguration");
 assert.match(await p.locator("#stage-caveat").textContent(),/not identification.*proven/i);
 await p.locator("#next").click();
 assert.equal(await p.locator("#scene-title").textContent(),"The Last Supper");
 assert.match(await p.locator("#link-value").textContent(),/cv:new-covenant-christ/);
 await p.locator("#lang").click();
 assert.equal(await p.locator("html").getAttribute("lang"),"fr");
 assert.equal(await p.locator("#scene-title").textContent(),"La Cène");
 await p.locator("#next").click();
 assert.equal(await p.locator("#scene-title").textContent(),"La Jérusalem nouvelle");
 assert.equal(await p.locator("#map").isVisible(),false);
 assert.equal(await p.locator("#vision.show").isVisible(),true);
 assert.match(await p.locator("#stage-caveat").textContent(),/Carte volontairement absente/i);
 assert.equal(await p.locator("#next").isDisabled(),true);
 await p.locator("#prev").click();
 assert.equal(await p.locator("#scene-title").textContent(),"La Cène");
 assert.equal(await p.locator("#map").isVisible(),true);
 await p.screenshot({path:resolve(folder,"offline-french-covenant-390.png"),animations:"disabled"});
 assert.deepEqual(errors,[],"Offline browser JavaScript errors: "+errors.join(" | "));
 await offline.close();
 console.log("PASS offline full browser: 320/390/768/1280 responsive, navigation, translation, Revelation without map, fallback");

 // Online MapLibre is an independent acceptance gate, never inferred from
 // offline fallbacks or static code. Fail visibly if the library/canvas is absent.
 const online=await browser.newContext({viewport:{width:390,height:844},locale:"en-GB"});
 const q=await online.newPage(),onlineErrors=[];
 q.on("pageerror",e=>onlineErrors.push(e.message));
 await q.goto(url,{waitUntil:"domcontentloaded",timeout:90000});
 await q.waitForFunction(()=>!!window.maplibregl,{timeout:25000});
 await q.locator("#map canvas.maplibregl-canvas").waitFor({state:"visible",timeout:30000});
 await q.locator(".maplibregl-ctrl-attrib").waitFor({state:"attached",timeout:30000});
 assertNoHorizontalOverflow(await metrics(q),390);
 await q.screenshot({path:resolve(folder,"online-jordan-390.png"),animations:"disabled"});
 await q.locator('[data-scene="1"]').click();
 assert.equal(await q.locator("#scene-title").textContent(),"The Transfiguration");
 assert.equal(await q.locator("#map canvas").isVisible(),true);
 await q.locator('[data-scene="3"]').click();
 assert.equal(await q.locator("#map canvas").isVisible(),false);
 assert.equal(await q.locator("#vision.show").isVisible(),true);
 await q.locator('[data-scene="2"]').click();
 assert.equal(await q.locator("#map canvas").isVisible(),true);
 assert.match(await q.locator("#stage-caveat").textContent(),/Jerusalem city-level anchor/);
 await q.screenshot({path:resolve(folder,"online-covenant-390.png"),animations:"disabled"});
 assert.deepEqual(onlineErrors,[],"MapLibre browser JavaScript errors: "+onlineErrors.join(" | "));
 await online.close();
 console.log("PASS online MapLibre: actual canvas, attribution, 4-state map/vision transitions, city-context disclosure");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}
