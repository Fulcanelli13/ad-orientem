import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".woff2":"font/woff2"};
const hits=[];
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const data=await readFile(file);
  hits.push({path,bytes:data.length});
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4203,"127.0.0.1",ok)});
let browser;
const mustDefer=[
 "/src/calendar/calendar-runtime.js",
 "/src/learn/traditional-life.js","/src/learn/spiritual-life-data.js",
 "/src/learn/sexual-ethics.js","/src/learn/latin-course-v2.js",
 "/src/glossary/browser-entry.js"
];
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:"block"});
 const pageErrors=[];
 page.on("pageerror",e=>pageErrors.push(String(e?.message??e)));
 const t=Date.now();
 await page.goto("http://127.0.0.1:4203/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:30000});
 const coldMs=Date.now()-t,cold=hits.slice();
 for(const path of mustDefer)assert.equal(cold.some(h=>h.path===path),false,"Home eagerly downloaded "+path);
 const owners=await page.evaluate(()=>({
  learn:globalThis.AO_LEARN_APP_V1?.status?.().installed,
  calendar:globalThis.AO_CALENDAR_APP_V1?.status?.().installed,
  calendarLoaded:globalThis.AO_CALENDAR_APP_V1?.status?.().loaded??false,
  calendarCache:globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.version,
  mass:Boolean(globalThis.AO_R17_BROWSER_ENTRY),
  spiritualRoute:globalThis.AO_MODULES?.get?.("learn.spiritual_life")?.id,
  sexualRoute:globalThis.AO_MODULES?.get?.("learn.sexual_ethics")?.id,
  traditionalRoute:globalThis.AO_MODULES?.get?.("learn.rites.sick")?.id
 }));
 assert.equal(owners.learn,true,"Formation route owner missing from Home");
 assert.equal(owners.calendar,true,"Calendar route owner missing from Home");
 assert.equal(owners.calendarLoaded,false,"Calendar heavy runtime should be absent from Home");
 assert.equal(owners.calendarCache,"43.45-modular-exact","Week-cache compatibility API removed");
 assert.equal(owners.mass,true,"Native Mass owner missing");
 for(const route of ["spiritualRoute","sexualRoute","traditionalRoute"])assert.ok(owners[route]?.startsWith("learn."),"Formation deep-link route missing "+route);
 const learnOpen=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("learn"));
 assert.equal(learnOpen?.ok,true,"Formation hub could not open");
 await page.locator("#ao-learn-modular-root").waitFor({state:"visible",timeout:12000});
 for(const path of mustDefer.filter(x=>x.includes("/learn/")||x.includes("glossary/")))assert.equal(hits.some(x=>x.path===path),false,"Formation hub eagerly downloaded course "+path);
 const direct=await page.evaluate(()=>globalThis.AO_LEARN_APP_V1?.openModule?.("learn.spiritual_life"));
 assert.equal(direct,true,"Spiritual Life failed first-use lazy launch");
 assert.ok(hits.some(x=>x.path==="/src/learn/spiritual-life-data.js"),"Spiritual Life lessons were not fetched on first use");
 assert.equal(await page.evaluate(()=>globalThis.AO_SPIRITUAL_LIFE_V1?.status?.().open),true,"Spiritual Life module did not open");
 await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("home"));
 const calStart=Date.now();
 const opened=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("calendar"));
 assert.equal(opened?.ok,true,"Canonical Calendar navigation failed");
 await page.locator("#ao-calendar-modular-root").waitFor({state:"visible",timeout:15000});
 const calMs=Date.now()-calStart;
 assert.equal(hits.some(x=>x.path==="/src/calendar/calendar-runtime.js"),true,"Calendar did not load on first use");
 const calendar=await page.evaluate(()=>({
  status:globalThis.AO_CALENDAR_APP_V1?.status?.(),
  week:globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.inspect?.(),
  root:document.getElementById("ao-calendar-modular-root")?.id
 }));
 assert.equal(calendar.status?.installed,true);
 assert.equal(calendar.status?.open,true);
 assert.equal(calendar.root,"ao-calendar-modular-root");
 assert.equal(calendar.week?.version,"43.45-modular-exact");
 await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("home"));
 const fetchedBefore=hits.filter(x=>x.path==="/src/calendar/calendar-runtime.js").length;
 const second=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("calendar"));
 assert.equal(second?.ok,true);
 assert.equal(hits.filter(x=>x.path==="/src/calendar/calendar-runtime.js").length,fetchedBefore,"Calendar code fetched again on re-entry");
 assert.deepEqual(pageErrors.filter(s=>/SyntaxError|ReferenceError|TypeError|import.*failed|Cannot read/.test(s)),[], "Deferred Formation/Calendar caused errors");
 console.log("PASS Home avoided Formation courses and Calendar runtime; first-use Formation child and Calendar navigation preserved");
 console.log("FORMATION_CALENDAR_LAZY="+JSON.stringify({coldMs,calMs,coldRequests:cold.length,coldBytes:cold.reduce((n,v)=>n+v.bytes,0),calendarInstalled:calendar.status.installed,deepLinks:["learn.spiritual_life","learn.sexual_ethics","learn.rites.sick"]}));
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
