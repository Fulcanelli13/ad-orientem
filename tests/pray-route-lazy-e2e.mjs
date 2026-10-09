import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg"};
const hits=[];
const server=http.createServer(async(req,res)=>{
  try{
    const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+path);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const bytes=await readFile(file);
    hits.push({path,bytes:bytes.length});
    res.writeHead(200,{"content-type":MIME[extname(file)]??"application/octet-stream","cache-control":"public,max-age=3600"});
    res.end(bytes);
  }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4197,"127.0.0.1",ok)});
let browser;
try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:"block"});
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const t=Date.now();
  await page.goto("http://127.0.0.1:4197/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:20000});
  await page.locator(".homeScreen").waitFor({state:"visible",timeout:20000});
  const cold=hits.slice(),coldMs=Date.now()-t;
  const deferred=["/src/pray/presentation-coherence.js","/src/pray/novena-runtime.js","/src/pray/traditional-pray-runtime.js","/src/pray/focus-installer.js"];
  for(const filename of deferred)assert.equal(cold.some(x=>x.path===filename),false,"Eager Prayer startup import: "+filename);
  const before=await page.evaluate(()=>({installed:globalThis.AO_PRAY_APP_V1?.status?.()?.installed,readerLoaded:globalThis.AO_PRAY_APP_V1?.status?.()?.readerLoaded,mass:Boolean(globalThis.AO_R17_BROWSER_ENTRY)}));
  assert.equal(before.installed,true,"Lightweight Prayer owner must exist at boot");
  assert.equal(before.readerLoaded,false,"Prayer enhancement graph still booted before route entry");
  assert.equal(before.mass,true,"Native Mass reader regressed");
  const start=Date.now();
  const nav=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray"));
  assert.equal(nav.ok,true,"Prayer route failed: "+JSON.stringify(nav));
  const openedMs=Date.now()-start;
  await page.waitForFunction(()=>globalThis.AO_PRAY_APP_V1?.status?.()?.readerLoaded===true,null,{timeout:10000});
  for(const filename of deferred)assert.ok(hits.some(x=>x.path===filename),"Deferred Prayer script did not load: "+filename);
  const snapshot=await page.evaluate(()=>({
    prayer:globalThis.AO_PRAY_APP_V1?.status?.(),
    novena:Boolean(globalThis.AO_NOVENAS_V3),
    traditional:Boolean(globalThis.AO_TRADITIONAL_PRAY_V381),
    focus:Boolean(globalThis.AO_PRAY_FOCUS_V3410),
    coherence:Boolean(globalThis.AO_PRAY_COHERENCE_V435930)
  }));
  assert.equal(snapshot.prayer.open,true,"Prayer module not visibly open after import");
  for(const key of ["novena","traditional","focus","coherence"])assert.equal(snapshot[key],true,"Canonical Prayer runtime unavailable after route: "+key);
  const once=deferred.map(path=>hits.filter(x=>x.path===path).length);
  const home=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("home"));
  assert.equal(home.ok,true,"Home return broken after deferred Prayer entry");
  const reopened=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray"));
  assert.equal(reopened.ok,true,"Second Prayer entry failed");
  for(let i=0;i<deferred.length;i++)assert.equal(hits.filter(x=>x.path===deferred[i]).length,once[i],"Prayer scripts reloaded on second entry");
  assert.deepEqual(errors.filter(x=>/module|SyntaxError|ReferenceError|TypeError|Failed to fetch/i.test(x)),[],"Deferred Prayer caused page errors");

  // Calendar and Coming Up deep-links invoke AO_MODULES directly; they must
  // not require visiting the Prayer tab first.
  const direct=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:"block"});
  try{
    await direct.goto("http://127.0.0.1:4197/index.html",{waitUntil:"domcontentloaded",timeout:90000});
    await direct.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:20000});
    const beforeDirect=await direct.evaluate(()=>({
      nav:globalThis.AO_APP_SHELL_V1?.getActive?.(),
      registered:globalThis.AO_MODULES?.get?.("pray.novenas")?.id,
      traditional:globalThis.AO_MODULES?.get?.("pray.good_death")?.id,
      readerLoaded:globalThis.AO_PRAY_APP_V1?.status?.()?.readerLoaded
    }));
    assert.equal(beforeDirect.nav,"home");
    assert.equal(beforeDirect.readerLoaded,false);
    assert.equal(beforeDirect.registered,"pray.novenas","Calendar Novena deep-link unregistered");
    assert.equal(beforeDirect.traditional,"pray.good_death","Traditional Prayer deep-link unregistered");
    const a=await direct.evaluate(()=>globalThis.AO_MODULES.open("pray.novenas",{returnContext:{surface:"calendar"}}));
    assert.equal(a?.ok,true,"Novenas did not open from Calendar-style first-use deep-link: "+JSON.stringify(a));
    const b=await direct.evaluate(()=>globalThis.AO_MODULES.open("pray.good_death",{returnContext:{surface:"calendar"}}));
    assert.equal(b?.ok,true,"Good Death did not open from direct module registry: "+JSON.stringify(b));
    assert.equal(await direct.evaluate(()=>globalThis.AO_PRAY_APP_V1?.status?.()?.readerLoaded),true);
  }finally{await direct.close();}

  console.log("PASS Prayer first-use module loading; Rosary/Novenas/traditional/focus runtime APIs and Home re-entry");
  console.log("PRAY_LAZY_METRICS="+JSON.stringify({
    coldMs,openedMs,coldRequests:cold.length,coldBytes:cold.reduce((n,x)=>n+x.bytes,0),
    loadedAfterClick:deferred,prayerLoaded:snapshot.prayer.readerLoaded
  }));
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
