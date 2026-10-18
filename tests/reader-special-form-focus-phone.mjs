import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {probeTextFocus} from "./support/text-focus-probe.mjs";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/special-mass-focus");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
  ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+name);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(await readFile(file));
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error))}
});
await new Promise((done,fail)=>{server.once("error",fail);server.listen(4296,"127.0.0.1",done)});
const cases=[
 {id:"missa-cantata-simple",type:"ordinary",query:"form=MISSA_CANTATA_SIMPLE&mode=LIVE&secondConfiteor=1"},
 {id:"solemn",type:"ordinary",query:"form=SOLEMN&mode=LIVE"},
 {id:"low-mass",type:"ordinary",query:"form=LOW&mode=LIVE"},
 {id:"asperges",type:"prelude",query:"rite=asperges&mode=LIVE"},
 {id:"vidi-aquam",type:"prelude",query:"rite=asperges&date=2026-04-12&mode=LIVE"},
 {id:"passiontide",type:"prelude",query:"rite=asperges&date=2026-03-22&mode=LIVE"},
 {id:"palm-sunday",type:"prelude",query:"rite=palm&date=2027-03-21&mode=LIVE"},
 {id:"ash-wednesday",type:"prelude",query:"rite=ash&date=2027-02-10&mode=LIVE"},
 {id:"candlemas",type:"prelude",query:"rite=candlemas&date=2027-02-02&mode=LIVE"},
 {id:"requiem",type:"ordinary",query:"requiem=1&form=SOLEMN&mode=LIVE"},
 {id:"good-friday",type:"distinct",query:"rite=good-friday&date=2027-03-26&form=SOLEMN&mode=LIVE"}
];
const findings={schema:"ao-special-mass-text-focus-audit-v1",
 measuredAt:new Date().toISOString(),tested:[],limitations:[],errors:[]};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const scenario of cases){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,
    hasTouch:true,deviceScaleFactor:1,locale:"en-GB",serviceWorkers:"block"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  const url="http://127.0.0.1:4296/tests/fixtures/reader-phone-harness.html?production=1&"+scenario.query;
  let row={id:scenario.id,type:scenario.type,query:scenario.query,status:"unchecked",
    errors,entered:[],sampleCards:[],missing:[],owner:null,unsupportedReason:null};
  try{
   await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000});
   await page.waitForFunction(()=>["true","error"].includes(document.documentElement.dataset.harnessReady),
     null,{timeout:45000});
   const init=await page.evaluate(()=>{
    const api=window.__AO_PHONE_PREVIEW;
    const root=document.querySelector("#ao-r17-native-reader-preview");
    return {error:window.__AO_PHONE_HARNESS_ERROR||null,
      owner:root?.dataset.r17CardOwner??null,
      stateOwner:root?.dataset.r17StateOwner??null,
      cardId:api?.getCurrentCard?.()?.id??api?.getCurrentCard?.()?.sectionId??null,
      modelCards:api?.model?.totalCards??null,
      hasGoodFriday:typeof api?.getGoodFridayState==="function",
      firstText:(root?.querySelector(".ao-prayer-body")?.innerText||"").slice(0,180)};
   });
   row.owner=init.owner;
   row.stateOwner=init.stateOwner;
   row.modelCards=init.modelCards;
   if(init.error)throw Error("HARNESS:"+init.error.slice(0,1600));
   if(init.hasGoodFriday){
     row.status="distinct-rite-own-focus";
     for(const record of ["GF-OPEN-010","GF-PASS-320","GF-VEN-620"]){
       const state=await page.evaluate(id=>{
         const api=window.__AO_PHONE_PREVIEW;
         api.goToGoodFridayRecord(id);
         const root=document.querySelector("#ao-r17-native-reader-preview");
         const body=root?.querySelector(".ao-prayer-body");
         const paragraphs=[...(body?.querySelectorAll(".ao-reader-paragraph")||[])];
         return {sourceId:api.getGoodFridayState()?.step?.recordId,
           owner:root?.dataset.r17CardOwner,
           stateOwner:root?.dataset.r17StateOwner,
           paragraphs:paragraphs.length,
           visible:paragraphs.filter(p=>p.getClientRects().length>0).length,
           nonempty:paragraphs.filter(p=>(p.textContent||"").trim()).length,
           first:paragraphs[0]?.textContent?.trim().slice(0,120)||""};
       },record);
       row.entered.push({requested:record,...state});
     }
     if(!row.entered.every(x=>x.sourceId&&x.nonempty>0)){
       row.status="needs-special-rite-review";
       row.missing.push("Good Friday records absent, unrendered or blank");
     }
   }else{
     if(scenario.type==="prelude"){
      for(let step=0;step<10;step++){
       const state=await page.evaluate(()=>{
        const api=window.__AO_PHONE_PREVIEW;
        const card=api.getCurrentCard?.();
        const root=document.querySelector("#ao-r17-native-reader-preview");
        const paragraphs=[...root?.querySelectorAll?.(".ao-prayer-card .ao-reader-paragraph")??[]]
          .filter(node=>node.getClientRects().length);
        return {cardId:card?.id??card?.sectionId??null,
          title:card?.title??null,
          role:root?.dataset.r17CardOwner??null,
          riteRecord:root?.dataset.r17NativeRiteRecord??null,
          visible:paragraphs.length,nonempty:paragraphs.filter(x=>x.textContent.trim()).length,
          rootText:(root?.querySelector(".ao-prayer-body")?.textContent||"").trim().slice(0,110)};
       });
       row.entered.push({step,...state});
       if(step>0 && state.cardId && state.cardId.startsWith("AO."))break;
       if(!state.cardId || step===9)break;
       await page.evaluate(()=>window.__AO_PHONE_PREVIEW.next?.());
       await page.evaluate(()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok))));
      }
     }
     const sourceCards=await page.evaluate(()=>{
       const api=window.__AO_PHONE_PREVIEW;
       return (api?.model?.cards||[]).map(c=>({id:c.sectionId??c.id??null,
         title:c.title,sequence:c.sequence}));
     });
     row.modelCards=sourceCards.length;
     // Sample the middle of substantial sections, not only the first screen.
     const selected=[];
     const add=i=>{if(i>=0&&i<sourceCards.length&&!selected.includes(i))selected.push(i)};
     add(0);add(sourceCards.length-1);
     for(const regexp of [/Introit/i,/Kyrie/i,/Gloria/i,/Credo/i,/Consecration/i,/Pater noster/i,/Communion/i])
       add(sourceCards.findIndex(c=>regexp.test(c.title)));
     for(const i of selected.sort((a,b)=>a-b)){
       const c=sourceCards[i];
       await page.evaluate(sequence=>window.__AO_PHONE_PREVIEW.showSequence(sequence),c.sequence);
       await page.evaluate(()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok))));
       const entry=await page.evaluate(probeTextFocus,{
         rootSelector:"#ao-r17-native-reader-preview",
         scrollSelector:".ao-prayer-card",paragraphSelector:".ao-reader-paragraph",
         owner:"mass",label:scenario.id+" / "+c.title,maxExamples:12
       });
       const rendered=await page.evaluate(()=>{
         const root=document.querySelector("#ao-r17-native-reader-preview");
         const list=[...root?.querySelectorAll?.(".ao-prayer-paragraph")??[]];
         return {owner:root?.dataset.r17CardOwner??null,
           actual:window.__AO_PHONE_PREVIEW.getCurrentCard?.()?.sectionId??null,
           rootText:(root?.querySelector(".ao-prayer-body")?.textContent||"").trim().length,
           noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1};
       });
       const observed={index:i,title:c.title,expectedId:c.id,sourceCues:entry.registered,
         focusedCues:entry.reached,unreachable:entry.unreachable,
         unownedText:entry.unownedTotal,scroll:entry.maxScroll,
         ...rendered};
       row.sampleCards.push(observed);
       if(entry.registered && entry.reached<entry.registered)
         row.missing.push({card:c.title,ids:entry.unreachable.map(x=>x.id)});
       if(!observed.rootText)row.missing.push({card:c.title,problem:"EMPTY_READER"});
     }
     row.status=row.missing.length?"focus-or-content-review":"sampled-ordinary-focus-ok";
     if(scenario.type==="prelude"&&!row.entered.length)row.status="prelude-not-visited";
   }
  }catch(error){
    row.status="unsupported-or-broken-fixture";
    row.unsupportedReason=String(error?.stack||error).slice(0,2000);
  }
  findings.tested.push(row);
  console.log("SPECIAL_FOCUS_CASE="+JSON.stringify({id:row.id,status:row.status,
    modelCards:row.modelCards,preludeRecords:row.entered.length,
    sampled:row.sampleCards.length,missing:row.missing.length,
    firstRecord:row.entered[0]?.cardId??null,reason:row.unsupportedReason?.slice(0,160)}));
  await context.close();
 }
 findings.limitations=[
  "Only sampled ordinary Mass cards per scenario, not exhaustive 259-cue coverage of every liturgical date.",
  "Special rite cards (Palm, Ash, Candlemas, Good Friday) have independent source IDs; never certify them using ordinary AO.SM.C cues.",
  "Easter Vigil, Corpus Christi procession and Requiem Absolution require separate explicit source fixtures and navigation states.",
  "A harness failure is recorded as unsupported-or-broken-fixture, not passed or silently omitted.",
  "Personal state (candle received, ashes received, procession participant) is not asserted by this presentation-focus inventory."
 ];
 assert.equal(findings.tested.length,cases.length,"Special/form audit did not visit every requested scenario");
}finally{
  await writeFile(resolve(output,"special-form-focus-matrix.json"),JSON.stringify(findings,null,2));
  await writeFile(resolve(output,"special-form-focus-summary.txt"),
    findings.tested.map(r=>[r.id,r.status,r.modelCards??"no-model",
      "prelude="+r.entered.length,"sampled="+r.sampleCards.length,"issues="+r.missing.length,
      r.unsupportedReason?"reason="+r.unsupportedReason.replace(/\s+/g," ").slice(0,160):""].join(" ")).join("\n")+"\n");
  await browser?.close().catch(()=>{});
  await new Promise(ok=>server.close(ok));
  console.log("SPECIAL_FOCUS_TOTAL="+JSON.stringify({tested:findings.tested.length,
    statuses:findings.tested.reduce((a,r)=>{a[r.status]=(a[r.status]||0)+1;return a},{}),
    unresolved:findings.tested.filter(r=>r.status!=="sampled-ordinary-focus-ok"&&
      r.status!=="distinct-rite-own-focus").map(r=>r.id)}));
}
