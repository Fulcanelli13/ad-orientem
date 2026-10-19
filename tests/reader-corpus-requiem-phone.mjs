import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/corpus-requiem-phone");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const cases=[
 {id:"corpus",query:"following=corpus&date=2027-05-27&form=SOLEMN&mode=LIVE",
  owner:"CORPUS_CHRISTI_PROCESSION",expected:["CORPUS-R01","CORPUS-R02","CORPUS-R03","CORPUS-R04","CORPUS-R05","CORPUS-R06"]},
 {id:"requiem-body-burial",query:"following=requiem&body=1&burial=1&date=2026-11-02&form=SOLEMN&mode=LIVE",
  owner:"REQUIEM_ABSOLUTION",expected:["ABS-R01","ABS-R02","ABS-R03","ABS-R04","ABS-R05"]},
 {id:"requiem-without-body",query:"following=requiem&body=0&burial=1&date=2026-11-02&form=SOLEMN&mode=LIVE",
  owner:"REQUIEM_ABSOLUTION",expected:["ABS-R01","ABS-R03","ABS-R04"]}
];
const report={schema:"ao-following-action-phone-dom-v1",cases:[],errors:[],
 limitations:["Only explicit following-action selections may activate these rites.",
  "The source model already certifies verses and object-state ordering. This audit verifies the actual phone rendering/handoff and lay participation boundaries.",
  "The source ceremonies are not assigned synthetic AO.SM.C cues."]};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const spec of cases){
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,
   hasTouch:true,deviceScaleFactor:1,reducedMotion:"reduce",serviceWorkers:"block"});
  const pageErrors=[];page.on("pageerror",e=>pageErrors.push(e.message));
  const row={id:spec.id,status:"unchecked",states:[],pageErrors};
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+
     "/tests/fixtures/reader-phone-harness.html?production=1&"+spec.query,
     {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>["true","error"].includes(document.documentElement.dataset.harnessReady),
     null,{timeout:60000});
   const ready=await page.evaluate(owner=>{
    const api=window.__AO_PHONE_PREVIEW;
    const expected=owner==="CORPUS_CHRISTI_PROCESSION"?
      api?.getCorpusChristiState?.():api?.getRequiemAbsolutionState?.();
    return {error:window.__AO_PHONE_HARNESS_ERROR||null,sourceReady:!!expected,
      owner:api?.ownership?.[owner==="CORPUS_CHRISTI_PROCESSION"?"corpusChristi":"requiemAbsolution"],
      modelCards:api?.model?.cards?.length||0};
   },spec.owner);
   assert.ok(!ready.error,spec.id+" failed fixture: "+ready.error);
   assert.ok(ready.sourceReady,spec.id+" source controller never mounted");
   // Navigate to the final *permitted* ordinary Mass card. Do not create
   // ceremonial cues or silently bypass omitted Requiem blessing/Last Gospel.
   const terminal=await page.evaluate(()=>{
    const api=window.__AO_PHONE_PREVIEW;
    for(const c of [...api.model.cards].reverse()){
      if(api.showSequence(c.sequence))return {id:c.sectionId,seq:c.sequence};
    }
    return null;
   });
   assert.ok(terminal,spec.id+" has no visible final ordinary-Mass card");
   assert.equal(await page.locator("#ao-r17-native-reader-preview [data-reader-nav]").count(),0,
     "Following-action rites must share the arrow-free Mass reader");
   const advance=async()=>{
     await page.locator("#ao-r17-native-reader-preview .ao-prayer-card").focus();
     await page.keyboard.press("ArrowRight");
   };
   await advance();
   await page.waitForFunction(owner=>{
    const state=window.__AO_PHONE_PREVIEW?.getNativeEventState?.();
    return state?.specialRite===owner;
   },spec.owner,{timeout:10000});
   const capture=async()=>{
    await page.evaluate(()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok))));
    return page.evaluate(owner=>{
      const api=window.__AO_PHONE_PREVIEW;
      const state=owner==="CORPUS_CHRISTI_PROCESSION"?
        api.getCorpusChristiState():api.getRequiemAbsolutionState();
      const root=document.querySelector("#ao-r17-native-reader-preview");
      const body=root?.querySelector("[data-role='paragraphs']");
      const nodes=[...(body?.querySelectorAll(".ao-reader-paragraph")||[])]
        .filter(x=>x.getClientRects().length);
      const source=state.card?.paragraphs||[];
      return {cardId:state.card?.id||null,
       stateOwner:root?.dataset.r17StateOwner,
       sourceParagraphs:source.length,
       visibleParagraphs:nodes.length,
       renderedText:body?.innerText?.trim()?.length||0,
       originalCueCount:nodes.filter(x=>/^AO\.SM\.C\d{4}$/.test(x.dataset.cueId||"")).length,
       personalPosture:state.posture??null,
       joined:owner==="CORPUS_CHRISTI_PROCESSION"?
        state.processionParticipant??null:state.burialParticipant??null,
       objectState:state.objectState??null,
       handoff:state.handoff??null,
       horizontalOverflow:document.documentElement.scrollWidth-innerWidth,
       atEnd:state.atEnd??false};
    },spec.owner);
   };
   const record=async(expected)=>{
    const current=await capture();
    row.states.push(current);
    assert.equal(current.cardId,expected,spec.id+" source stage mismatch");
    assert.ok(current.sourceParagraphs===0||
      current.visibleParagraphs>0&&current.renderedText>0,
      spec.id+"/"+expected+" source text rendered blank");
    assert.equal(current.originalCueCount,0,
      spec.id+"/"+expected+" invented ordinary Mass cue ownership");
    assert.ok(current.horizontalOverflow<=2,spec.id+"/"+expected+" viewport overflow");
    return current;
   };
   if(spec.id==="corpus"){
    await record("CORPUS-R01");
    for(const [observed,id] of [
      ["MONSTRANCE_PLACED_IN_CELEBRANT_HANDS","CORPUS-R02"],
      ["PROCESSION_ACTIVE","CORPUS-R03"],
      ["BLESSED_SACRAMENT_REPLACED_ON_ALTAR","CORPUS-R04"]
    ]){
      await page.evaluate(value=>window.__AO_PHONE_PREVIEW.setCorpusChristiSacramentalState(value),observed);
      const s=await record(id);
      if(id==="CORPUS-R03"){
        assert.notEqual(s.personalPosture,"PROCESSIONAL",
          "Corpus Christi automatically imposed lay procession");
        await page.evaluate(()=>window.__AO_PHONE_PREVIEW.setCorpusChristiProcessionParticipant(true));
        assert.equal((await capture()).personalPosture,"PROCESSIONAL");
        await page.evaluate(()=>window.__AO_PHONE_PREVIEW.setCorpusChristiProcessionParticipant(false));
        assert.notEqual((await capture()).personalPosture,"PROCESSIONAL");
      }
    }
    await advance();
    await record("CORPUS-R05");
    await page.evaluate(()=>window.__AO_PHONE_PREVIEW.setCorpusChristiSacramentalState("BENEDICTION_COMPLETE"));
    await record("CORPUS-R06");
   }else{
    for(const id of spec.expected){
      const current=await record(id);
      if(id==="ABS-R05"){
        assert.notEqual(current.personalPosture,"PROCESSIONAL",
         "Requiem automatically imposed burial procession");
        await page.evaluate(()=>window.__AO_PHONE_PREVIEW.setRequiemBurialParticipant(true));
        assert.equal((await capture()).personalPosture,"PROCESSIONAL");
        await page.evaluate(()=>window.__AO_PHONE_PREVIEW.setRequiemBurialParticipant(false));
        assert.notEqual((await capture()).personalPosture,"PROCESSIONAL");
      }
      if(!current.atEnd)await advance();
    }
   }
   assert.deepEqual(row.states.map(s=>s.cardId),spec.expected);
   await advance();
   const after=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getLifecycleState?.()||null);
   row.lifecycle=after;
   assert.ok(after&&!row.states.map(s=>s.cardId).includes(after?.card?.id),
    spec.id+" did not complete following-action lifecycle");
   assert.deepEqual(pageErrors,[],spec.id+" browser runtime errors");
   row.status="rendered-following-action-complete";
  }catch(e){row.status="needs-review";row.failure=String(e?.stack||e);report.errors.push({id:spec.id,error:row.failure})}
  report.cases.push(row);
  console.log("FOLLOWING_ACTION_PHONE_CASE="+JSON.stringify({id:row.id,status:row.status,
   sourceCards:row.states.length,ids:row.states.map(s=>s.cardId),error:row.failure?.slice(0,250)}));
  await page.close();
 }
} finally{
 await writeFile(resolve(out,"following-action-mobile-ledger.json"),JSON.stringify(report,null,2));
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
assert.equal(report.errors.length,0,"Following-action mobile lifecycle gaps: "+report.errors.map(x=>x.id));
