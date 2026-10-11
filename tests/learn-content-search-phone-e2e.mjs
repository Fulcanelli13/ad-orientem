import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

// Real 320px phone smoke test: search must navigate into canonical owners,
// not duplicate doctrinal content in the Formation root.
const base=resolve(fileURLToPath(new URL("..",import.meta.url)));
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(base,"."+path);
  if(file!==base&&!file.startsWith(base+sep)){res.writeHead(403);res.end();return}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(err){res.writeHead(err?.code==="ENOENT"?404:500);res.end(String(err?.message||err))}
});
await new Promise((done,fail)=>{server.once("error",fail);server.listen(4255,"127.0.0.1",done)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:320,height:700},isMobile:true,hasTouch:true,
  deviceScaleFactor:2,serviceWorkers:"block"});
 const errors=[];
 page.on("pageerror",e=>errors.push(String(e?.message||e)));
 await page.goto("http://127.0.0.1:4255/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:30000});
 const nav=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("learn"));
 assert.equal(nav?.ok,true);
 const hub=page.locator("#ao-learn-modular-root");
 await hub.waitFor({state:"visible"});
 const doors=hub.locator("[data-ao-learn-family]");
 assert.equal(await doors.count(),9,"Formation homepage must have nine distinct subject doors");
 const hubNav=hub.locator(".aoFNav");
 assert.equal(await hubNav.count(),1,"Formation subject hub needs a visual navigator");
 assert.equal(await hubNav.locator("[data-ao-fnav-go]").count(),9,
  "Formation table of contents must reach every subject");
 const hubControls=await hubNav.locator(".aoFNavRail button").evaluateAll(nodes=>
  nodes.map(n=>({h:n.getBoundingClientRect().height,w:n.getBoundingClientRect().width})));
 assert.ok(hubControls.every(x=>x.h>=44&&x.w>=44),
  "Intra-Formation navigation controls must remain finger-sized on 320px phones");
 await hubNav.locator('[data-ao-fnav-action="toggle"]').tap();
 assert.equal(await hubNav.locator(".aoFNavMenu").isVisible(),true,
  "The contents index must open on an explicit tap");
 assert.equal(await hubNav.locator('[data-ao-fnav-action="toggle"]').getAttribute("aria-expanded"),"true");
 await hubNav.locator('[data-ao-fnav-go="4"]').tap();
 assert.equal(await hubNav.locator(".aoFNavMenu").isVisible(),false,
  "Jumping to a subject must close the expanded contents index");
 const grid=await doors.evaluateAll(nodes=>nodes.map(x=>{const b=x.getBoundingClientRect();return{x:b.x,y:b.y,w:b.width,h:b.height,id:x.dataset.aoLearnFamily}}));
 assert.ok(grid[1].x>grid[0].x+30&&Math.abs(grid[1].y-grid[0].y)<3,
   "320px Formation categories must use compact two-column geometry: "+JSON.stringify(grid.slice(0,2)));
 assert.ok(grid.every(x=>x.w>=128&&x.h>=120),
   "320px Formation subject cards are too small: "+JSON.stringify(grid));
 assert.deepEqual(grid.map(x=>x.id),
   ["foundations","spiritual-moral","liturgy-tradition","sacraments-life","questions","apologetics","church-crisis","latin","reference"]);
 const search=hub.locator("[data-ao-learn-discovery-search]");
 async function find(id){
  await search.fill(id);
  const button=hub.locator('[data-ao-learn-content-id="'+id+'"]');
  await button.waitFor({state:"visible",timeout:12000});
  await button.tap();
 }
 async function returnToHub(closeScript){
  await page.evaluate(closeScript);
  await hub.waitFor({state:"visible",timeout:12000});
 }
 await find("CSE123");
 await page.waitForFunction(()=>globalThis.AO_SEXUAL_ETHICS_V1?.status?.()?.questionId==="CSE123",null,{timeout:12000});
 await returnToHub(()=>globalThis.AO_SEXUAL_ETHICS_V1?.close?.());
 assert.equal(await search.inputValue(),"CSE123","Question search context lost on return");
 await find("SL01");
 await page.waitForFunction(()=>globalThis.AO_SPIRITUAL_LIFE_V1?.status?.()?.lessonId==="SL01",null,{timeout:12000});
 const slNav=page.locator("#ao-spiritual-life-root .aoFNav");
 assert.equal(await slNav.count(),1,"Spiritual Life lesson lacks its section rail");
 assert.ok(await slNav.locator("[data-ao-fnav-go]").count()>=2,
  "Spiritual Life sections should be navigable without paging through full text");
 await slNav.locator('[data-ao-fnav-action="toggle"]').tap();
 await slNav.locator('[data-ao-fnav-go="1"]').tap();
 assert.equal(await slNav.locator(".aoFNavMenu").isVisible(),false);
 const scrollInfo=await page.locator("#ao-spiritual-life-root").evaluate(n=>({
  overflow:n.scrollWidth-n.clientWidth,progress:n.querySelector(".aoFNav")?.style.getPropertyValue("--ao-fnav-progress")
 }));
 assert.ok(scrollInfo.overflow<=2,"Spiritual Life navigator causes mobile overflow");
 assert.ok(scrollInfo.progress!==undefined,"Scroll-position indicator missing");
 await returnToHub(()=>globalThis.AO_SPIRITUAL_LIFE_V1?.close?.());
 await find("PX1912-Q213");
 await page.waitForFunction(()=>globalThis.AO_TRADITIONAL_CATECHISM?.getState?.()?.detail===213,
  null,{timeout:15000});
 assert.equal(await page.locator("#ao-cate-root").isVisible(),true,
  "Catechism global search did not open its existing native question reader");
 await returnToHub(()=>globalThis.AO_TRADITIONAL_CATECHISM?.close?.());
 assert.equal(await search.inputValue(),"PX1912-Q213","Catechism question search context lost");
 await find("latin:40");
 await page.waitForFunction(()=>globalThis.AO_LATIN_COURSE_V1?.status?.()?.lesson===40,null,{timeout:15000});
 const latinRoot=page.locator("#ao-latin-course-root");
 // The specialist owner's actual ID is implementation-specific; validate the mounted UI by status.
 assert.equal(await page.evaluate(()=>globalThis.AO_LATIN_COURSE_V1?.status?.()?.screen),"lesson");
 await returnToHub(()=>globalThis.AO_LATIN_COURSE_V1?.close?.());
 await search.fill("");
 // After Latin the suspended parent is correctly its Latin subject, not the root.
 await hub.locator("[data-ao-learn-back]").tap();
 await page.waitForFunction(()=>!globalThis.AO_LEARN_APP_V1?.status?.()?.family,null,{timeout:10000});
 await hub.locator("[data-ao-learn-questions]").tap();
 await page.waitForFunction(()=>globalThis.AO_LEARN_APP_V1?.status?.()?.family==="questions",null,{timeout:10000});
 assert.equal(await hub.locator('[data-ao-learn-module="learn.sexual_ethics"]').count(),1);
 assert.equal(await hub.locator("[data-ao-learn-dossier-review]").count(),0);
 for(const [family,corpus] of [["apologetics","apologetics"],["church-crisis","crisis"]]){
  await hub.locator("[data-ao-learn-back]").tap();
  await page.waitForFunction(()=>!globalThis.AO_LEARN_APP_V1?.status?.()?.family,null,{timeout:10000});
  await hub.locator('[data-ao-learn-family="'+family+'"]').tap();
  await page.waitForFunction(expected=>globalThis.AO_LEARN_APP_V1?.status?.()?.family===expected,
   family,{timeout:10000});
  assert.equal(await hub.locator('[data-ao-learn-dossier-review="'+corpus+'"]').count(),1);
  assert.equal(await hub.locator("[data-ao-learn-dossier-review]").count(),1);
 }
 const mobile=await hub.evaluate(el=>({over:el.scrollWidth-el.clientWidth,
  width:el.clientWidth,links:[...el.querySelectorAll("button")].map(b=>b.getBoundingClientRect().height)}));
 assert.ok(mobile.over<=2,"Formation overflows at 320px: "+JSON.stringify(mobile));
 assert.ok(mobile.links.every(h=>h>=44),"Formation has undersized phone controls");
 assert.deepEqual(errors,[],"Formation navigation has page errors");
 console.log("PASS: 320px mobile, CSE123, SL01, PX1912-Q213, Latin lesson 40, return context and three distinct moral, Apologetics and Crisis directories");
}finally{
 await browser?.close();
 await new Promise(done=>server.close(done));
}
