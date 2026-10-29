import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {NOVENA_CORPUS_V4} from "../src/pray/novena-corpus-v4.js";
import {novenaStageChapters} from "../src/pray/devotional-sequence-adapter.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const shots=resolve(root,"artifacts/pray-novena-dual-axis");
await mkdir(shots,{recursive:true});
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".json":"application/json",".css":"text/css",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const body=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,430]){
  const page=await browser.newPage({viewport:{width,height:width===320?700:width===390?844:932},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block",reducedMotion:"reduce"});
  const errors=[];page.on("pageerror",e=>errors.push(String(e?.message||e)));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   await page.evaluate(async()=>globalThis.AO_MODULES?.open?.("pray.novenas",{returnContext:null}));
   await page.waitForFunction(()=>typeof globalThis.AO_NOVENAS_V3?.open==="function",null,{timeout:20000});
   const ids=width===390?Object.keys(NOVENA_CORPUS_V4):
     ["annunciation","immaculate_conception","st_anthony_nine_tuesdays","st_michael"];
   const gesture=async(dx,dy)=>{
    await page.locator("#aoPray435930.open .aoN1Reader .aoDevoCardScroll").evaluate((node,{dx,dy})=>{
     const t=(x,y)=>new Touch({identifier:28,target:node,clientX:x,clientY:y});
     node.dispatchEvent(new TouchEvent("touchstart",{bubbles:true,touches:[t(240,350)],changedTouches:[t(240,350)]}));
     node.dispatchEvent(new TouchEvent("touchend",{bubbles:true,touches:[],changedTouches:[t(240+dx,350+dy)]}));
    },{dx,dy});
   };
   for(const id of ids){
    assert.equal(await page.evaluate(id=>globalThis.AO_NOVENAS_V3.open({novenaId:id,returnContext:null}),id),true,"Novena did not open: "+id);
    const detail=page.locator("#aoPray435930.open .aoN1DetailFolio");
    assert.equal(await detail.locator(".aoN1DayLeaf").count(),9,id+" source-owned days not visible");
    assert.equal(await detail.locator(".aoN1DayLeaf[aria-current='step']").count(),1,id+" suggested day is ambiguous");
    assert.equal(await detail.locator(".aoN1AboutDisclosure").evaluate(el=>el.open),false,id+" background should start collapsed");
    assert.equal(await detail.locator(".aoN1Hero").count(),0,id+" oversized introductory panel returned");
    if(id==="st_michael")await page.screenshot({path:resolve(shots,"st_michael-detail-quiet-"+width+".png"),animations:"disabled"});
    await page.locator("#aoPray435930.open [data-n1-mode='guided']").evaluate(el=>el.click());
    await page.locator("#aoPray435930.open [data-n1-begin]").evaluate(el=>el.click());
    assert.equal(await page.locator("#aoPray435930.open .aoN1Reader .aoN1DayDisclosure").count(),1,id+" missing compact day navigator");
    assert.equal(await page.locator("#aoPray435930.open .aoN1Reader .aoN1DayDisclosure").evaluate(el=>el.open),false,id+" day navigator must not crowd prayer");
    const top=await page.locator("#aoPray435930.open .aoN1Reader .aoDevoCardScroll").evaluate(el=>el.getBoundingClientRect().top);
    assert.ok(top<620,id+" main prayer pushed too low: "+top);

    await page.waitForSelector("#aoPray435930.open .aoN1Reader[data-ao-novena-deck='guided'] .aoDevoSequenceTimeline",{timeout:9000});
    // Paragraph illumination is committed on the next animation frame;
    // assert its actual visible state rather than racing the first paint.
    await page.waitForFunction(()=>document.querySelectorAll(
      "#aoPray435930.open .aoN1Reader .aoDevoParagraph[data-ao-devo-active='true']").length===1,
      null,{timeout:3500});
    const n=NOVENA_CORPUS_V4[id];
    const expected=novenaStageChapters({pattern:n.pattern||(id==="immaculate_conception"?"OPENING_DAY_COMMON_CLOSE":"STANDARD"),sharedClosing:!!n.sharedClosingText,commonRequired:!!(n.commonPrayers?.length||n.sharedClosingText)});
    const state=await page.evaluate(()=>({
     screen:globalThis.AO_NOVENAS_V3.state().screen,
     current:globalThis.AO_NOVENAS_V3.state().stage,
     scroll:document.querySelector(".aoN1Reader .aoDevoCardScroll")?.style.overflowY||
       getComputedStyle(document.querySelector(".aoN1Reader .aoDevoCardScroll")).overflowY,
     stops:document.querySelectorAll(".aoN1Reader .aoDevoStop").length,
     selected:document.querySelectorAll(".aoN1Reader .aoDevoStop[aria-current='step']").length,
     title:document.querySelector(".aoN1Reader .aoDevoCardTitle")?.textContent?.trim(),
     body:document.querySelector(".aoN1Reader .aoDevoCardScroll")?.textContent?.trim()?.length,
     active:document.querySelectorAll(".aoN1Reader .aoDevoParagraph[data-ao-devo-active='true']").length,
     day:globalThis.AO_NOVENAS_V3.state().day,
     source:document.querySelectorAll("#aoPray435930.open details.aoN1SourceDetails").length
    }));
    assert.equal(state.screen,"day",id+" reader not on day");
    assert.equal(state.current,0,id+" unexpectedly advanced");
    assert.equal(state.stops,expected.length,id+" source stages diverged");
    assert.equal(state.selected,1,id+" timeline selection ambiguous");
    assert.equal(state.scroll,"auto",id+" card does not scroll vertically");
    assert.ok(state.title?.length>3&&state.body>40&&state.active===1,
      id+" missing named card or paragraph illumination: "+JSON.stringify(state));
    await gesture(5,-150);
    assert.equal(await page.evaluate(()=>globalThis.AO_NOVENAS_V3.state().stage),0,id+" vertical swipe changed chapter");
    await gesture(-160,6);
    await page.waitForFunction(()=>globalThis.AO_NOVENAS_V3?.state?.()?.stage===1,null,{timeout:3000});
    assert.equal(await page.locator(".aoN1Reader .aoDevoStop[aria-current='step']").getAttribute("data-ao-devo-chapter"),"1",id+" timeline did not follow swipe");
    await gesture(160,6);
    await page.waitForFunction(()=>globalThis.AO_NOVENAS_V3?.state?.()?.stage===0,null,{timeout:3000});
    await page.locator(".aoN1Reader [data-ao-devo-chapter='"+(expected.length-1)+"']").evaluate(x=>x.click());
    await page.waitForFunction(n=>globalThis.AO_NOVENAS_V3?.state?.()?.stage===n,expected.length-1,{timeout:3000});
    assert.equal(await page.locator(".aoN1Reader .aoDevoCard").getAttribute("data-ao-devo-card"),expected.at(-1).id,id+" final chapter mismatch");
    assert.equal(state.source,0,"Novena witness unexpectedly in Day card before final stage");
    if(id==="st_michael"||id==="annunciation")await page.screenshot({path:resolve(shots,id+"-"+width+".png"),animations:"disabled"});
    // Simple retains the complete source-owned day sequence, not its guided-stage subset.
    await page.locator("#aoPray435930.open [data-n1-mode='simple']").evaluate(x=>x.click());
    await page.waitForSelector("#aoPray435930.open .aoN1Reader[data-ao-novena-deck='simple'] .aoDevoCardScroll",{timeout:5000});
    assert.equal(await page.locator(".aoN1Reader .aoDevoStop").count(),1,id+" Simple is not continuous");
    assert.ok((await page.locator(".aoN1Reader .aoDevoCardScroll").innerText()).length>90,id+" Simple omitted source prayers");
    assert.equal(await page.locator("#aoPray435930.open .aoN1Reader [data-n1-day-next]").count(),1,id+" next-day navigation missing");
    if(id==="st_michael"){
     await page.locator("#aoPray435930.open .aoN1DayDisclosure > summary").evaluate(el=>el.click());
     assert.equal(await page.locator("#aoPray435930.open .aoN1DayDisclosure .aoN1DayLeaf").count(),9);
     await page.locator("#aoPray435930.open .aoN1DayDisclosure [data-n1-day='9']").evaluate(el=>el.click());
     assert.equal(await page.evaluate(()=>globalThis.AO_NOVENAS_V3.state().day),9,id+" skipping directly to day 9 failed");
     assert.equal(await page.evaluate(()=>globalThis.AO_NOVENAS_V3.state().mode),"simple");
     await page.screenshot({path:resolve(shots,"st_michael-day9-quiet-"+width+".png"),animations:"disabled"});
    }

   }
   assert.deepEqual(errors,[],"Novena browser errors "+width+": "+errors.join("; "));
   console.log("PASS "+width+"px Novena dual-axis named reader, source-owned stages, Simple/Guided, phone gestures: "+ids.length+" novenas");
  }finally{await page.close()}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
