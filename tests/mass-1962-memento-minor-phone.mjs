import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

// Real reader/DOM + 1962 source registry: no synthetic rubric or screenshot mock.
// Scoped to the seven outstanding normative priest gesture exceptions, with
// visual proof for both Mementos and the iconless C0204 minor elevation.
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/mass-1962-memento-minor-phone");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){
   res.writeHead(403);res.end("forbidden");return;
  }
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(error){
  res.writeHead(error?.code==="ENOENT"?404:500);
  res.end(String(error?.message??error));
 }
});
await new Promise((ok,fail)=>{
 server.once("error",fail);server.listen(4476,"127.0.0.1",ok);
});
const scenarios=[
 {mode:"MISSAL",lang:"en",width:320,form:"LOW"},
 {mode:"MISSAL",lang:"fr",width:390,form:"SOLEMN"},
 {mode:"LIVE",lang:"en",width:320,form:"MISSA_CANTATA_SIMPLE"},
 {mode:"LIVE",lang:"fr",width:390,form:"SOLEMN"}
];
const cues=["AO.SM.C0155","AO.SM.C0193","AO.SM.C0204"];
const report=[];
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const spec of scenarios){
  const context=await browser.newContext({
   viewport:{width:spec.width,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,
   locale:spec.lang==="fr"?"fr-FR":"en-GB"});
  try{
   const page=await context.newPage(),errors=[];
   page.on("pageerror",error=>errors.push(String(error.message??error)));
   const params=new URLSearchParams({mode:spec.mode,lang:spec.lang,form:spec.form,aoLiveCards:"65"});
   await page.goto("http://127.0.0.1:4476/tests/fixtures/reader-phone-harness.html?"+params,
    {waitUntil:"networkidle",timeout:45000});
   await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",
    null,{timeout:30000});
   for(const cue of cues){
    const snapshot=await page.evaluate(async cueId=>{
     const api=window.__AO_PHONE_PREVIEW;
     const card=api.model.cards.find(c=>c.paragraphs?.some(p=>
      p.sourceCueIds?.includes(cueId)));
     if(!card||!api.showSequence(card.sequence))
      return {cueId,error:"Source-owned card missing"};
     const frame=()=>new Promise(ok=>requestAnimationFrame(()=>
      requestAnimationFrame(ok)));
     await frame();
     const shell=document.querySelector("[data-ao-reader-shell]");
     const scroller=document.querySelector("#ao-r17-native-reader-preview .ao-prayer-card");
     const row=[...scroller.querySelectorAll(".ao-reader-paragraph")]
       .find(x=>String(x.dataset.sourceCueIds??"").split(/\s+/).includes(cueId));
     if(!row)return {cueId,error:"Source paragraph missing"};
     // Focus the actual priest source cue to exercise the LIVE iconless
     // surface contract, not merely search static, off-screen text.
     const source=row.getBoundingClientRect(),viewport=scroller.getBoundingClientRect();
     const ideal=source.top-viewport.top+scroller.scrollTop+source.height/2-
       scroller.clientHeight*.39;
     const max=Math.max(0,scroller.scrollHeight-scroller.clientHeight);
     for(const delta of [0,25,50,75,100,125,150,175,200,225,-25,-50]){
      scroller.scrollTop=Math.max(0,Math.min(max,ideal+delta));
      scroller.dispatchEvent(new Event("scroll",{bubbles:true}));
      await frame();
      if(api.getActiveCue()===cueId)break;
     }
     row.scrollIntoView({block:"center",inline:"nearest"});
     await frame();
     const current=api.getNativeEventState();
     const primary=row.querySelector(".ao-line-primary");
     const liveRubric=row.querySelector('[data-source-gesture-id="GM.P.C0204.01"]')??
       row.querySelector(".ao-iconless-source-rubric");
     const missalRubric=row.querySelector(
      '.ao-missal-inline-rubrics [data-source-gesture-id="GM.P.C0204.01"]');
     const missalContainer=missalRubric?.closest(".ao-missal-inline-rubrics");
     const primaryStyle=primary?getComputedStyle(primary):null;
     const noteStyle=missalContainer?getComputedStyle(missalContainer):null;
     const rect=row.getBoundingClientRect();
     return {
      cueId,card:card.title,mode:shell?.dataset.mode,
      focused:api.getActiveCue(),nativeCue:current?.nativeCueId??null,
      rowKind:row.dataset.kind,sourceIds:row.dataset.sourceCueIds,
      primary:primary?.textContent?.trim()??"",
      primaryColor:primaryStyle?.color??"",
      liveRubric:liveRubric?.textContent?.trim()??"",
      liveMatrixIdentity:liveRubric?.dataset.sourceGestureId??null,
      fakeR17Rubric:row.querySelectorAll('[data-rubric-id="GM.P.C0204.01"]').length,
      matrixArt:liveRubric?.querySelector(".ao-approved-priest-gesture-rubric-art,.ao-approved-finger-rubric-art,.ao-approved-priest-head-bow-rubric-art")?.dataset.approvedAsset??null,
      missalRubric:missalRubric?.textContent?.trim()??"",
      missalColor:noteStyle?.color??"",
      missalRubricBeforeText:Boolean(missalContainer&&primary&&
        (missalContainer.compareDocumentPosition(primary)&Node.DOCUMENT_POSITION_FOLLOWING)),
      duplicateInline:row.querySelectorAll(".ao-live-inline-rubrics").length,
      actionIconKey:current?.priestActionIconKey??null,
      width:innerWidth,documentWidth:document.documentElement.scrollWidth,
      bounds:{left:rect.left,right:rect.right,top:rect.top,height:rect.height}
     };
    },cue);
    const screenshot=spec.mode.toLowerCase()+"-"+spec.lang+"-"+spec.width+
      "-"+cue.slice(-5)+".png";
    await page.screenshot({path:resolve(output,screenshot)});
    report.push({...spec,...snapshot,screenshot,errors:[...errors]});
    assert.equal(snapshot.error,undefined,JSON.stringify(snapshot));
    assert.equal(snapshot.mode,spec.mode,"Wrong reader mode");
    assert.equal(errors.length,0,"Runtime page exceptions: "+errors.join(" | "));
    assert.ok(snapshot.documentWidth<=spec.width+1,
      "Reader document horizontally overflows at "+spec.width);
    assert.ok(snapshot.bounds.left>=-1&&snapshot.bounds.right<=spec.width+1,
      "Source rubric paragraph clipped horizontally");
    if(cue!=="AO.SM.C0204"){
     const expected=cue==="AO.SM.C0155"
      ?spec.lang==="fr"?/tête légèrement inclinée/:/head slightly bowed/
      :spec.lang==="fr"?/yeux fixés sur le Saint-Sacrement/:/eyes fixed on the Blessed Sacrament/;
     assert.match(snapshot.primary,expected,
      spec.mode+" "+cue+" omitted prescribed priest movement");
     assert.equal(snapshot.rowKind,"RUBRIC","Memento lost source RUBRIC owner");
     assert.equal(snapshot.duplicateInline,0,"Source Memento rubric duplicated as a new event");
     if(spec.mode==="MISSAL")
      assert.equal(snapshot.primaryColor,"rgb(223, 126, 128)",
       "Missal printed Memento rubric not red");
    }else if(spec.mode==="MISSAL"){
     assert.match(snapshot.missalRubric,spec.lang==="fr"
      ?/élève légèrement le calice/:/raises the chalice slightly/,
      "Missal C0204 lacks exact degree of elevation");
     assert.equal(snapshot.missalColor,"rgb(223, 126, 128)",
      "Missal C0204 rubric must be red");
     assert.equal(snapshot.missalRubricBeforeText,true,
      "Missal minor elevation must precede omnis honor et gloria");
    }else{
     assert.match(snapshot.primary,/omnis honor|all honou?r and glory|honneur et (?:toute )?gloire/i,
      "Source doxology text must remain readable in the selected vernacular/Latin mode");
     assert.match(snapshot.liveRubric,spec.lang==="fr"
      ?/élève légèrement le calice avec la sainte Hostie/:/raises the chalice slightly with the Sacred Host/,
      "LIVE minor elevation lacks text-only source cue");
     assert.equal(snapshot.fakeR17Rubric,0,
      "The canonical gesture-matrix source must never masquerade as an R17 published event");
     assert.equal(snapshot.liveMatrixIdentity,"GM.P.C0204.01",
      "LIVE missing certified matrix source identity at exact C0204 paragraph");
     assert.equal(snapshot.matrixArt,null,
      "C0204 cannot acquire approximate elevation artwork");
    }
   }
  }finally{await context.close();}
 }
 await writeFile(resolve(output,"report.json"),JSON.stringify({scenarios:report},null,2));
 console.log("PASS "+report.length+" 1962 Memento/minor-elevation actual phone scenes in LIVE/MISSAL, EN/FR, Low/Sung/Solemn.");
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
