import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {probeTextFocus} from "./support/text-focus-probe.mjs";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/exceptional-rite-phone");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".webp":"image/webp",".woff2":"font/woff2"};
const srv=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const path=resolve(root,"."+pathname);
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(await readFile(path));
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,fail)=>{srv.once("error",fail);srv.listen(0,"127.0.0.1",ok)});
const report={schema:"ao-exceptional-rite-dom-focus-inventory-v1",cases:[],errors:[],
 limitations:[
 "Every selected source step is visited in real 390px native reader; visual focus is observed, not assumed.",
 "A source-owned ceremonial state is not the same as automatic text-focus opacity; independently classify static versus active liturgical text.",
 "Corpus Christi and Requiem post-Mass lifecycle are covered by the separate complete controller matrix, not yet by this browser sweep.",
 "We do not infer reception of Communion, Font use, baptism, or Cross veneration from date alone."
 ]};
const scenarios=[
 {id:"good-friday-personal",params:"rite=good-friday&date=2027-03-26&form=SOLEMN"},
 {id:"easter-vigil-no-font",params:"rite=easter-vigil&date=2027-03-27&form=SOLEMN&font=NONE"},
 {id:"easter-vigil-font",params:"rite=easter-vigil&date=2027-03-27&form=SOLEMN&font=IN_CHURCH"},
 {id:"easter-vigil-baptism",params:"rite=easter-vigil&date=2027-03-27&form=SOLEMN&font=SEPARATE_BAPTISTERY&baptism=1"}
];
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const scenario of scenarios){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,
   hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const url="http://127.0.0.1:"+srv.address().port+
   "/tests/fixtures/reader-phone-harness.html?production=1&"+scenario.params+"&mode=LIVE";
  const row={id:scenario.id,status:"unchecked",steps:[],pageErrors:errors,error:null};
  try{
   await page.goto(url,{waitUntil:"domcontentloaded",timeout:75000});
   await page.waitForFunction(()=>["true","error"].includes(document.documentElement.dataset.harnessReady),
     null,{timeout:45000});
   const init=await page.evaluate(()=>{
    const api=window.__AO_PHONE_PREVIEW;
    return {error:window.__AO_PHONE_HARNESS_ERROR||null,
     kind:typeof api?.getGoodFridayState==="function"?"GF":
       typeof api?.getEasterVigilState==="function"?"EV":null,
     owner:document.querySelector("#ao-r17-native-reader-preview")?.dataset.r17CardOwner,
     total:api?.getGoodFridayState?.()?.total??api?.getEasterVigilState?.()?.total??0};
   });
   if(init.error)throw Error("Native fixture error: "+init.error);
   assert.ok(init.kind==="GF"||init.kind==="EV",scenario.id+": distinct-rite reader not mounted");
   const expected=scenario.id.startsWith("good-friday")?"GF":"EV";
   assert.equal(init.kind,expected,scenario.id+": wrong source owner");
   for(let i=0;i<init.total;i++){
    const datum=await page.evaluate(async ()=>{
     const api=window.__AO_PHONE_PREVIEW;
     const current=api.getGoodFridayState?.()??api.getEasterVigilState?.();
     const root=document.querySelector("#ao-r17-native-reader-preview");
     const scroller=root?.querySelector(".ao-prayer-card");
     const body=root?.querySelector("[data-role='paragraphs']");
     const rows=[...(body?.querySelectorAll(".ao-reader-paragraph")||[])];
     const eligible=rows.filter(x=>x.dataset.kind!=="RUBRIC"&&x.getClientRects().length&&!x.hidden);
     const r={id:current?.step?.recordId,cardId:current?.card?.id,cardUpdate:current?.step?.cardUpdate,
      index:current?.index,sourceRows:current?.card?.paragraphs?.length||0,
      visibleRows:rows.filter(x=>x.getClientRects().length).length,
      domText:body?.textContent?.trim().length||0,
      sourceCueRows:rows.filter(x=>x.dataset.cueId).length,
      activeCueRows:rows.filter(x=>x.dataset.active==="true").length,
      focusEligible:eligible.length,
      focusActive:eligible.filter(x=>x.dataset.aoDistinctReadingActive==="true").length,
      dimRows:eligible.filter(x=>Number(getComputedStyle(x).opacity)<.5).length,
      viewportOverflow:document.documentElement.scrollWidth-innerWidth,
      maxScroll:scroller?Math.max(0,scroller.scrollHeight-scroller.clientHeight):null,
      owner:root?.dataset.r17CardOwner,
      currentStage:api.getCompositeStage?.()||null};
     api.next();
     await new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok)));
     return r;
    });
    row.steps.push(datum);
    assert.ok(datum.id&&datum.cardId,scenario.id+" source record or surface missing");
    assert.ok(datum.sourceRows>0||datum.cardUpdate===false,
      scenario.id+"/"+datum.id+" empty source card");
    assert.ok(datum.domText>0,scenario.id+"/"+datum.id+" source card rendered blank");
    assert.ok(datum.visibleRows>0,scenario.id+"/"+datum.id+" no visible DOM prayer paragraph");
    assert.ok(datum.viewportOverflow<=2,scenario.id+"/"+datum.id+" horizontal phone overflow");
    assert.equal(datum.focusActive,datum.focusEligible>0?1:0,
      scenario.id+"/"+datum.id+" active text focus is not unique");
    if(datum.focusEligible>=2)assert.ok(datum.dimRows>0,
      scenario.id+"/"+datum.id+" adjacent text does not mute in distinct rite");
   }
   row.status="source-steps-rendered";
   assert.equal(new Set(row.steps.map(x=>x.id)).size,init.total,scenario.id+" duplicate or missed source step");
   row.focusSamples=[];
   const focusRecords=init.kind==="EV"?["EV-LIT1-400","EV-LIT2-600","EV-FONT-420","EV-FONT-440"]:
     ["GF-SOP-01-K","GF-VEN-600"];
   for(const id of focusRecords){
    if(!row.steps.some(x=>x.id===id))continue;
    await page.evaluate(({kind,id})=>{
      const api=window.__AO_PHONE_PREVIEW;
      if(kind==="EV")api.goToEasterVigilRecord(id);
      else api.goToGoodFridayRecord(id);
    },{kind:init.kind,id});
    await page.evaluate(()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok))));
    const probed=await page.evaluate(probeTextFocus,{
      rootSelector:"#ao-r17-native-reader-preview",
      scrollSelector:".ao-prayer-card",paragraphSelector:".ao-reader-paragraph",
      owner:"distinct",label:scenario.id+" / "+id
    });
    row.focusSamples.push({id,registered:probed.registered,reached:probed.reached,
      missing:probed.unreachable,invalidated:probed.invalidated,maxScroll:probed.maxScroll});
    if(!probed.invalidated&&probed.unreachableTotal)throw Error(
      scenario.id+" "+id+" skips "+probed.unreachableTotal+" of "+probed.registered+" source-lit paragraphs");
   }
   if(init.kind==="EV"){
    assert.equal(row.steps.at(-1)?.id,"EV-MASS-700",scenario.id+" did not reach Mass handoff");
    const stage=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getCompositeStage?.());
    assert.equal(stage,"MASS_ACTIVE",scenario.id+" Mass handoff failed");
   }
   assert.deepEqual(errors,[],scenario.id+" browser errors");
  }catch(error){
   row.error=String(error?.stack||error);
   row.status="needs-review";
   report.errors.push({id:scenario.id,error:row.error});
  }
  report.cases.push(row);
  console.log("EXCEPTIONAL_PHONE_CASE="+JSON.stringify({id:row.id,status:row.status,
   steps:row.steps.length,sourceRows:row.steps.reduce((n,x)=>n+x.sourceRows,0),
   visualCueSteps:row.steps.filter(x=>x.activeCueRows>0).length,
   dimmedSteps:row.steps.filter(x=>x.dimRows>0).length,error:row.error?.slice(0,200)}));
  await context.close();
 }
}finally{
 await writeFile(resolve(output,"exceptional-rite-dom-inventory.json"),JSON.stringify(report,null,2));
 await writeFile(resolve(output,"exceptional-rite-dom-summary.txt"),
  report.cases.map(x=>[x.id,x.status,"steps="+x.steps.length,
    "visible="+x.steps.filter(y=>y.visibleRows>0).length,
    "activeCueSteps="+x.steps.filter(y=>y.activeCueRows>0).length].join(" ")).join("\n")+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(ok=>srv.close(ok));
 console.log("EXCEPTIONAL_PHONE_TOTAL="+JSON.stringify({scenarios:report.cases.length,
   rendered:report.cases.filter(x=>x.status==="source-steps-rendered").length,
   sourceSteps:report.cases.reduce((n,x)=>n+x.steps.length,0),
   errors:report.errors.map(x=>x.id)}));
}
assert.equal(report.errors.length,0,"Exceptional rites failed native reader rendering: "+report.errors.map(x=>x.id).join(","));
