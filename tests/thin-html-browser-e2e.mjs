import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const previous=process.env.AO_THIN_BASELINE_PATH||"";
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg",".woff2":"font/woff2"};
const all=[];
const server=http.createServer(async(req,res)=>{
 const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
 try{
  const name=path==="/index-baseline.html"&&previous?previous:resolve(root,"."+path);
  if(name!==previous&&name!==root&&!name.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const body=await readFile(name);
  all.push({path,bytes:body.length});
  res.writeHead(200,{"content-type":mime[extname(name)]??"application/octet-stream","cache-control":"no-store"});
  res.end(body);
 }catch(err){res.writeHead(err?.code==="ENOENT"?404:500);res.end(String(err?.message??err))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4196,"127.0.0.1",ok)});
let browser;
async function sample(name){
 const context=await browser.newContext({
  viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,
  serviceWorkers:"block"
 });
 const page=await context.newPage(),errors=[];
 if(process.env.AO_THIN_NETWORK_LATENCY){
  const cdp=await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions",{
   offline:false,latency:Number(process.env.AO_THIN_NETWORK_LATENCY),
   downloadThroughput:625000,uploadThroughput:300000,
  });
 }
 page.on("pageerror",e=>errors.push(e.message));
 const start=Date.now(),offset=all.length;
 await page.goto("http://127.0.0.1:4196/"+name,{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:30000});
 await page.waitForSelector(".homeScreen",{state:"visible",timeout:30000});
 const duration=Date.now()-start;
 const status=await page.evaluate(()=>({
  mass:typeof globalThis.AO_R17_BROWSER_ENTRY!=="undefined",
  pray:typeof globalThis.AO_PRAY_APP_V1?.open==="function",
  calendar:typeof globalThis.AO_CALENDAR_APP_V1?.open==="function",
  learn:typeof globalThis.AO_LEARN_APP_V1?.open==="function",
  title:document.title,
  ribbon:(document.querySelector("#ao-global-ribbon")?.innerText||"").replace(/\s+/g," ").trim(),
  ribbonOwner:globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner,
  bodyBackground:getComputedStyle(document.body).backgroundColor,
  criticalCss:getComputedStyle(document.querySelector(".homeScreen")).display,
  readyState:document.readyState,
 }));
 await page.waitForTimeout(200);
 const payload=all.slice(offset);
 await context.close();
 assert.deepEqual(errors.filter(x=>/Uncaught|SyntaxError|ReferenceError|TypeError|failed to fetch/i.test(x)),[],name+" browser exceptions");
 assert.equal(status.mass,true,name+" lost native Mass browser owner");
 assert.equal(status.pray,true,name+" lost Prayer route owner");
 assert.equal(status.calendar,true,name+" lost Calendar route owner");
 assert.equal(status.learn,true,name+" lost Formation route owner");
 assert.equal(status.ribbonOwner,true,name+" lost visible app owner");
 assert.notEqual(status.criticalCss,"none",name+" Home screen unexpectedly hidden");
 return {durationMs:duration,requests:payload.length,bytes:payload.reduce((n,e)=>n+e.bytes,0),status};
}
try{
 browser=await chromium.launch({headless:true});
 const baseline=previous?await sample("index-baseline.html"):null;
 const thin=await sample("index.html");
 if(baseline){
  assert.equal(thin.status.ribbon,baseline.status.ribbon,"HTML extraction altered navigation labels");
  assert.equal(thin.status.bodyBackground,baseline.status.bodyBackground,"HTML extraction changed Home background");
  assert.ok(thin.durationMs<Math.max(6000,baseline.durationMs*2.5),
   "HTML externalization severely regressed cold Home readiness");
 }
 console.log("PASS thin-shell phone Home, native Mass/PRAY/Calendar/Learn owners, style and navigation parity");
 console.log("THIN_PHONE_MEASURE="+JSON.stringify({baseline,thin}));
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
