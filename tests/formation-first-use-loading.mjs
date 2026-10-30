// Real Chromium acceptance: Formation graph must not load during Today or
// Explore but must be fully accessible at the first explicit Formation visit.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const repo=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(repo,"artifacts/formation-first-use");
await mkdir(out,{recursive:true});
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".webp":"image/webp",".jpg":"image/jpeg",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const full=resolve(repo,"."+path);
  if(full!==repo&&!full.startsWith(repo+sep)){res.writeHead(403);res.end("blocked");return}
  const data=await readFile(full);
  res.writeHead(200,{"content-type":types[extname(full)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes)});
const base="http://127.0.0.1:"+server.address().port;
const results=[];
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const {width,locale} of [{width:320,locale:"en-GB"},{width:390,locale:"fr-FR"},{width:1440,locale:"en-GB"}]){
  const mobile=width<800;
  const context=await browser.newContext({viewport:{width,height:mobile?844:960},
    isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,locale,reducedMotion:"reduce"});
  const page=await context.newPage(),errors=[],modules=[];
  const record={width,locale,passed:false,loadedBefore:[],loadedAfter:[],stages:[],ownerPreserved:false};
  page.on("pageerror",e=>errors.push(String(e?.message??e)));
  page.on("request",r=>{const u=new URL(r.url());if(u.pathname.includes("/src/learn/"))modules.push(u.pathname)});
  const capture=async phase=>page.screenshot({
   path:resolve(out,"formation-"+width+"-"+locale.slice(0,2)+"-"+phase+".png"),fullPage:false});
  const owner=()=>page.evaluate(()=>({
   ready:Boolean(globalThis.AO_LEARN_APP_V1),
   installed:Boolean(globalThis.AO_LEARN_APP_V1?.status?.().installed),
   open:Boolean(globalThis.AO_LEARN_APP_V1?.status?.().open),
   shellActive:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
  }));
  try{
   await page.goto(base+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true,
    null,{timeout:45000});
   assert.equal((await owner()).ready,false,"Formation owner should not install on initial Today boot");
   assert.equal(modules.some(x=>x.endsWith("/src/learn/browser-entry.js")),false,
    "Formation browser entry must not fetch before first click");
   record.stages.push("today-no-formation-owner");
   await page.locator('[data-ao-app-surface="find"]').click({timeout:20000});
   await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready"
     &&Boolean(document.querySelector(".aoHeritageSurface")),null,{timeout:70000});
   assert.equal((await owner()).ready,false,"Explore must not eagerly install Formation owner");
   assert.equal(modules.some(x=>x.endsWith("/src/learn/browser-entry.js")),false,
     "Explore must not fetch Formation browser entry");
   record.loadedBefore=[...modules];
   record.stages.push("explore-no-formation-import");
   // Immersive Explore overlays the persistent ribbon on a narrow phone.
   // Use its real close/back affordance, not an occluded underlying tab.
   await page.locator('#ao-find-modular-root .aoFindHeader [data-find-close]').click({timeout:18000});
   await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="home"
     &&globalThis.AO_FIND_APP_V1?.status?.().open===false,
    null,{timeout:15000});
   await page.locator('[data-ao-app-surface="learn"]').click({timeout:18000});
   await page.locator("#ao-learn-modular-root .aoLearnFamilyGrid").waitFor({state:"visible",timeout:24000});
   assert.equal((await owner()).open,true,"Explicit Formation visit must install and open its real modular owner");
   assert.equal(modules.filter(x=>x.endsWith("/src/learn/browser-entry.js")).length,1,
     "Formation owner must load exactly once");
   assert.ok(await page.locator("#ao-learn-modular-root .aoLearnFamilyCard").count()>=8,
     "Formation family navigation must remain complete");
   await page.evaluate(()=>{globalThis.__AO_FIRST_FORMATION_OWNER=globalThis.AO_LEARN_APP_V1});
   await capture("opened");
   record.stages.push("formation-first-use-opens");
   await page.locator('[data-ao-app-surface="pray"]').click({timeout:18000});
   await page.waitForFunction(()=>globalThis.AO_PRAY_APP_V1?.status?.().open===true,
    null,{timeout:20000});
   await page.locator('[data-ao-app-surface="learn"]').click({timeout:18000});
   await page.locator("#ao-learn-modular-root .aoLearnFamilyGrid").waitFor({state:"visible",timeout:24000});
   assert.equal(await page.evaluate(()=>globalThis.__AO_FIRST_FORMATION_OWNER===globalThis.AO_LEARN_APP_V1),true,
     "Second Formation visit must reuse the same installed owner");
   assert.equal(modules.filter(x=>x.endsWith("/src/learn/browser-entry.js")).length,1,
     "Repeat Formation navigation must not fetch a duplicate module");
   record.ownerPreserved=true;
   record.loadedAfter=[...modules];
   record.stages.push("pray-formation-roundtrip-preserved");
   assert.equal(errors.length,0,"Runtime exceptions: "+errors.join(" | "));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=1,"Horizontal viewport overflow");
   record.passed=true;
   console.log("PASS Formation deferred until first use "+width+" "+locale+
     "; scripts before="+record.loadedBefore.length+" after="+record.loadedAfter.length);
  }catch(error){
   record.error=String(error?.stack??error).slice(0,4000);
   await capture("FAIL").catch(()=>{});
   console.error("FAIL Formation first-use "+width+" "+locale+": "+record.error);
   throw error;
  }finally{results.push(record);await context.close().catch(()=>{})}
 }
}finally{
 await writeFile(resolve(out,"formation-first-use-results.json"),JSON.stringify(results,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}
