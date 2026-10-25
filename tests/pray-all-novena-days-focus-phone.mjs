import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {NOVENA_CORPUS_V4} from "../src/pray/novena-corpus-v4.js";
import {novenaStageChapters} from "../src/pray/devotional-sequence-adapter.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/prayer-deep-focus");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+name);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  // Read bytes before publishing success headers. Missing files are normal
  // 404s, not an attempt to send a second set of response headers.
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){
  if(res.headersSent){res.end();return}
  res.writeHead(e?.code==="ENOENT"?404:500);
  res.end(String(e?.message||e));
 }
});
await new Promise((done,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",done)});
const report={schema:"ao-deep-prayer-day-focus-audit-v1",viewport:"390x844",
 cases:[],errors:[],limitations:[
  "All nine days of the 16 canonical novenas checked in both Simple and Guided at the opening paragraph; Guided closing chapter sampled.",
  "This audit does not certify every intermediate word/scroll pixel, all historical novena witness footnotes, or every Rosary bead.",
  "Rosary is a separate source-owned bead player and requires its own subsequent full-step focus audit."
 ]};
let browser;
const port=server.address().port;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,
  deviceScaleFactor:1,serviceWorkers:"block",reducedMotion:"reduce"});
 const jsErrors=[];page.on("pageerror",e=>jsErrors.push(e.message));
 await page.goto("http://127.0.0.1:"+port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof window.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
 assert.equal(await page.evaluate(()=>window.AO_PRAY_APP_V1.open()),true);
 await page.waitForFunction(()=>typeof window.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
 await page.evaluate(async()=>window.AO_MODULES.open("pray.novenas",{returnContext:null}));
 await page.waitForFunction(()=>typeof window.AO_NOVENAS_V3?.open==="function",null,{timeout:15000});
 const inspect=async(id,mode,day,expectedChapters)=>{
  const result=await page.evaluate(async ({id,mode,day})=>{
   await new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok)));
   const root=document.querySelector("#aoPray435930.open .aoN1Reader");
   const scroller=root?.querySelector(".aoDevoCardScroll");
   const visible=el=>el?.getClientRects().length>0&&!el.closest("[hidden]");
   const paras=[...(scroller?.querySelectorAll(".aoDevoParagraph")||[])].filter(visible);
   const active=paras.filter(el=>el.dataset.aoDevoActive==="true");
   const title=root?.querySelector(".aoDevoCardTitle")?.textContent?.trim()||"";
   return {id,mode,day,actualDay:window.AO_NOVENAS_V3.state().day,
    actualMode:window.AO_NOVENAS_V3.state().mode,
    stage:window.AO_NOVENAS_V3.state().stage,
    registered:paras.length,active:active.length,
    activeText:active[0]?.textContent?.trim().slice(0,110)||"",
    totalText:scroller?.textContent?.trim().length||0,
    scroll:scroller?Math.max(0,scroller.scrollHeight-scroller.clientHeight):null,
    chapters:root?.querySelectorAll(".aoDevoStop").length||0,title,
    viewportOverflow:document.documentElement.scrollWidth-innerWidth,
    activeOpacity:active[0]?Number(getComputedStyle(active[0]).opacity):null};
  },{id,mode,day});
  assert.equal(result.actualDay,day,id+"/"+mode+" wrong day");
  assert.equal(result.actualMode,mode,id+"/"+mode+"/"+day+" wrong mode");
  assert.equal(result.active,1,id+"/"+mode+"/"+day+" no unique active reading paragraph");
  assert.ok(result.registered>0&&result.totalText>40&&result.activeText.length>0,
    id+"/"+mode+"/"+day+" missing visible prayer text");
  assert.ok(result.activeOpacity>.95,id+"/"+mode+"/"+day+" active passage is dim");
  assert.ok(result.viewportOverflow<=2,id+"/"+mode+"/"+day+" horizontal phone overflow");
  assert.equal(result.chapters,expectedChapters,id+"/"+mode+"/"+day+" chapter mismatch");
  report.cases.push(result);
  return result;
 };
 for(const id of Object.keys(NOVENA_CORPUS_V4)){
  const corpus=NOVENA_CORPUS_V4[id];
  const pattern=corpus.pattern||(id==="immaculate_conception"?"OPENING_DAY_COMMON_CLOSE":"STANDARD");
  const chapters=novenaStageChapters({pattern,sharedClosing:!!corpus.sharedClosingText});
  assert.equal(await page.evaluate(id=>window.AO_NOVENAS_V3.open({novenaId:id,returnContext:null}),id),true,
    "Cannot open novena "+id);
  await page.locator("#aoPray435930.open [data-n1-mode='guided']").evaluate(el=>el.click());
  await page.locator("#aoPray435930.open [data-n1-begin]").evaluate(el=>el.click());
  await page.waitForSelector("#aoPray435930.open .aoN1Reader[data-ao-novena-deck='guided']",{timeout:9000});
  for(const mode of ["guided","simple"]){
   if(mode==="simple"){
    await page.locator("#aoPray435930.open [data-n1-mode='simple']").evaluate(el=>el.click());
    await page.waitForSelector("#aoPray435930.open .aoN1Reader[data-ao-novena-deck='simple']",{timeout:9000});
   }
   for(let day=1;day<=9;day++){
    const changed=await page.evaluate(day=>{
      const root=document.querySelector("#aoPray435930.open .aoN1Reader");
      const disclosure=root?.querySelector(".aoN1DayDisclosure");
      if(disclosure&&!disclosure.open)disclosure.open=true;
      const btn=disclosure?.querySelector("[data-n1-day='"+day+"']");
      if(!btn)return {ok:false,available:[...disclosure?.querySelectorAll("[data-n1-day]")||[]].map(x=>x.dataset.n1Day)};
      btn.click();
      return {ok:true};
    },day);
    assert.ok(changed.ok,id+"/"+mode+": cannot select day "+day+": "+JSON.stringify(changed));
    await page.waitForFunction(day=>window.AO_NOVENAS_V3?.state?.().day===day,day,{timeout:4000});
    await inspect(id,mode,day,mode==="guided"?chapters.length:1);
    if(mode==="guided"&&chapters.length>1){
      const clicked=await page.evaluate(idx=>{
        const btn=document.querySelector("#aoPray435930.open .aoN1Reader [data-ao-devo-chapter='"+idx+"']");
        if(!btn)return false;btn.click();return true;
      },chapters.length-1);
      assert.ok(clicked,id+"/"+day+" missing Guided final chapter");
      await page.waitForFunction(n=>window.AO_NOVENAS_V3?.state?.()?.stage===n,chapters.length-1,{timeout:3000});
      await inspect(id,mode,day,chapters.length);
    }
   }
  }
  console.log("DEEP_PRAYER_NOVENA="+JSON.stringify({id,days:9,modes:["guided","simple"],
   samples:report.cases.filter(x=>x.id===id).length}));
 }
 assert.deepEqual(jsErrors,[],"Prayer runtime errors: "+jsErrors.join(" | "));
 await page.close();
} catch(e){report.errors.push(String(e?.stack||e));throw e}
finally{
 await writeFile(resolve(output,"novena-day-focus.json"),JSON.stringify(report,null,2));
 await writeFile(resolve(output,"novena-day-focus-summary.txt"),
 report.cases.map(x=>[x.id,x.mode,x.day,"stage="+x.stage,"paragraphs="+x.registered,"active="+x.active,
 "scroll="+x.scroll].join(" ")).join("\n")+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
 console.log("DEEP_PRAYER_TOTAL="+JSON.stringify({samples:report.cases.length,
  uniqueNovenas:new Set(report.cases.map(x=>x.id)).size,
  dayModes:new Set(report.cases.map(x=>x.id+":"+x.day+":"+x.mode)).size,errors:report.errors.length}));
}
