import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/curated65-phone");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
  ".webp":"image/webp",".jpg":"image/jpeg",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+name);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const payload=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(payload);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4284,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 await mkdir(out,{recursive:true});
 for(const option of [
  {label:"ordinary63",query:"production=1",cards:64,visible:63,curated:"true"},
  {label:"optional64",query:"production=1&secondConfiteor=1",cards:64,visible:64,curated:"true"},
  {label:"rollback48",query:"production=1&aoLiveCards=48",cards:48,visible:48,curated:"false"},
  {label:"asperges63",query:"production=1&rite=asperges",cards:64,visible:63,curated:"true",rite:"ORDINARY"},
  {label:"asperges64",query:"production=1&rite=asperges&secondConfiteor=1",cards:64,visible:64,curated:"true",rite:"ORDINARY"},
  {label:"asperges63-fr",query:"production=1&rite=asperges&lang=fr",cards:64,visible:63,curated:"true",rite:"ORDINARY",lang:"fr"},
  {label:"vidi-aquam63",query:"production=1&rite=asperges&date=2026-04-12",cards:64,visible:63,curated:"true",rite:"PASCHAL"},
  {label:"passiontide63",query:"production=1&rite=asperges&date=2026-03-22",cards:64,visible:63,curated:"true",rite:"ORDINARY",omitGloria:true},
  {label:"asperges-rollback48",query:"production=1&rite=asperges&aoLiveCards=48",cards:48,visible:48,curated:"false",rite:"ORDINARY"},
 ]){
  const context=await browser.newContext({viewport:{width:390,height:844},
    isMobile:true,hasTouch:true,deviceScaleFactor:1,locale:"en-GB"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e?.message??e)));
  await page.goto("http://127.0.0.1:4284/tests/fixtures/reader-phone-harness.html?"+option.query,
    {waitUntil:"networkidle",timeout:60000});
  await page.waitForFunction(()=>document.documentElement.dataset.harnessReady!=="undefined" &&
    ["true","error"].includes(document.documentElement.dataset.harnessReady),null,{timeout:30000});
  const result=await page.evaluate(()=>{
   const app=window.__AO_PHONE_PREVIEW;
   const node=document.querySelector("#ao-r17-native-reader-preview");
   return {error:window.__AO_PHONE_HARNESS_ERROR??null,
    source:app?.sourceModel?.totalCards,model:app?.model?.totalCards,
    curator:node?.dataset.r17CuratedReview,
    title:app?.getCurrentCard?.()?.title,
    progress:node?.querySelector('[data-role="progress"]')?.textContent??"",
    navOpacity:parseFloat(getComputedStyle(node.querySelector('[data-reader-nav="next"]')).opacity),
    progressOpacity:parseFloat(getComputedStyle(node.querySelector('[data-role="progress"]')).opacity),
    overflow:document.documentElement.scrollWidth>innerWidth+1};
  });
  assert.equal(result.error,null,option.label+": "+result.error);
  assert.equal(result.source,39,option.label);
  assert.equal(result.model,option.cards,option.label);
  assert.equal(result.curator,option.curated,option.label);
  if(option.curated==="true"||option.rite){
    assert.ok(result.navOpacity>=.59,option.label+" touch arrows must be discoverable in low light");
    assert.ok(result.progressOpacity>=.79,option.label+" card counter must remain legible in low light");
  }
  if(option.rite){
    const initial=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const root=document.querySelector("#ao-r17-native-reader-preview");
      const rubric=root?.querySelector('.ao-reader-paragraph[data-kind="RUBRIC"]');
      return {state:api.getNativeEventState(),asperges:api.getAspergesState(),
        title:api.getCurrentCard()?.title,
        renderedTitle:root?.querySelector('[data-role="section-title"]')?.textContent?.trim()??"",
        guidance:rubric?.textContent?.trim()??"",
        guideCount:root?.querySelectorAll('.ao-reader-paragraph[data-kind="RUBRIC"]').length??0,
        fontPx:rubric?parseFloat(getComputedStyle(rubric).fontSize):0,
        cueId:rubric?.dataset.cueId??null};
    });
    assert.equal(initial.state.specialRite,"ASPERGES",option.label+" must begin in independent R20 rite");
    assert.equal(initial.asperges.formulaState.formula,option.rite,
      option.label+" must use the actual seasonal Asperges/Vidi aquam formula");
    assert.equal(initial.asperges.formulaState.omitGloriaPatri,option.omitGloria===true,
      option.label+" must preserve Passiontide omission");
    assert.equal(initial.asperges.card.id,"ASP-R01",option.label+" must preserve original pre-Mass first record");
    assert.equal(initial.renderedTitle,option.lang==="fr"?"Aspersion dominicale":"Sunday Aspersion",
      option.label+" requires the exact localized prayer-card title");
    assert.equal(initial.guideCount,1,option.label+" source-backed preparatory rubric must be visible");
    assert.ok(initial.guidance.includes(option.lang==="fr"?"Restez debout":"Stand for the Sunday"),
      option.label+" opening must show existing guidance in the selected language");
    assert.ok(initial.fontPx>=16,option.label+" opening rubric must be legible on phone");
    assert.equal(initial.cueId,null,option.label+" guide must not fabricate a liturgical source cue");
    assert.equal(initial.asperges.total,5,"five reader screens hold six R20 source events");
    await page.screenshot({path:resolve(out,"production-"+option.label+"-prelude-390.png"),
      animations:"disabled"});
    const traversed=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW,seen=[],errors=[];
      const next=document.querySelector('[data-reader-nav="next"]');
      if(!next)throw new Error("R20 next navigation absent");
      for(let n=0;n<20;n++){
        const a=api.getAspergesState(),special=api.getNativeEventState()?.specialRite;
        if(special!=="ASPERGES")break;
        const ui=document.querySelector("#ao-r17-native-reader-preview");
        const rows=[...(ui?.querySelectorAll('.ao-reader-paragraph')??[])];
        const onlyGuide=(a.card?.paragraphs??[]).length===0;
        if(onlyGuide && !rows.some(row=>row.dataset.kind==="RUBRIC"&&row.textContent.trim()))
          errors.push("blank source-guide ritual stage "+a.card?.id);
        if(!onlyGuide && rows.every(row=>row.dataset.kind==="RUBRIC"))
          errors.push("actual chant/response was replaced by rubric "+a.card?.id);
        if(onlyGuide && rows.some(row=>row.dataset.cueId))
          errors.push("invented source cue on action-only stage "+a.card?.id);
        seen.push({record:a.card?.id,sourceRecords:a.card?.sourceRecordIds??[],
          formula:a.formulaState.formula,guideOnly:onlyGuide});
        next.click();
      }
      const after={title:api.getCurrentCard()?.title,progress:
        document.querySelector('[data-role="progress"]')?.textContent||"",
        state:api.getNativeEventState(),count:api.model.totalCards,
        first:api.model.cards[0].title};
      if(api.getNativeEventState()?.specialRite==="ASPERGES")errors.push("failed to hand off");
      return {seen,after,errors};
    });
    assert.equal(traversed.seen.length,5,option.label+" five R20 reader screens must precede Mass");
    assert.deepEqual(traversed.seen.filter(x=>x.guideOnly).map(x=>x.record),
      ["ASP-R01","ASP-R03","ASP-R05"],
      option.label+" only the three nonspoken R20 screens may show editorial rubrics");
    assert.deepEqual(traversed.seen.flatMap(x=>x.sourceRecords),
      ["ASP-010","ASP-020","ASP-030","ASP-040","ASP-050","ASP-060"],
      option.label+" all six original source events must be conserved");
    assert.deepEqual(traversed.errors,[],option.label+" R20 handoff error");
    const firstMassTitle=option.curated==="true"
      ? "At the Foot of the Altar · Opening and Psalm 42"
      : "Introit & Preparatory Prayers";
    assert.equal(traversed.after.title,firstMassTitle,
      option.label+" must resume its form-appropriate first Mass card");
    assert.match(traversed.after.progress,new RegExp("1 / "+option.visible+"$"),
      option.label+" must display live card count after R20 handoff");
    assert.notEqual(traversed.after.state.specialRite,"ASPERGES",
      option.label+" stale prelude must not leak to the Mass state");
    // Return to the actual preceding rite and back without losing the card model.
    const roundtrip=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      document.querySelector('[data-reader-nav="previous"]').click();
      const returned={id:api.getCurrentCard()?.id,rite:api.getNativeEventState()?.specialRite};
      document.querySelector('[data-reader-nav="next"]').click();
      return {returned,title:api.getCurrentCard()?.title,
        progress:document.querySelector('[data-role="progress"]')?.textContent??""};
    });
    assert.equal(roundtrip.returned.rite,"ASPERGES",option.label+" Previous must reenter R20");
    assert.equal(roundtrip.returned.id,"ASP-R05",option.label+" backward handoff lands on closing rite card");
    assert.equal(roundtrip.title,firstMassTitle,
      option.label+" previous/next must retain the selected presentation model");
    assert.match(roundtrip.progress,new RegExp("1 / "+option.visible+"$"));
    // Enter a named source paragraph card and verify that the active ritual
    // remains owned by the ordinary reader, with no rite state contamination.
    if(option.curated==="true"){
      const massCard=await page.evaluate(()=>{
        const api=window.__AO_PHONE_PREVIEW;
        const next=api.model.cards.find(c=>c.title==="Gloria · Praise and Supplication");
        if(!next)throw new Error("No curated Gloria source group");
        api.showSequence(next.sequence);
        const root=document.querySelector("#ao-r17-native-reader-preview");
        return {title:api.getCurrentCard()?.title,state:api.getNativeEventState(),
          textCount:root.querySelectorAll(".ao-reader-paragraph").length,
          source:api.sourceModel.totalCards};
      });
      assert.equal(massCard.title,"Gloria · Praise and Supplication");
      assert.ok(massCard.textCount>0,option.label+" no Mass prayer paragraphs");
      assert.equal(massCard.source,39);
      assert.notEqual(massCard.state.specialRite,"ASPERGES");
    }
  }else{
    assert.match(result.progress,new RegExp("1 / "+option.visible+"$"),
      option.label+" visible-card progress");
  }
  assert.equal(result.overflow,false,option.label+" horizontal overflow");
  assert.ok(result.title,option.label+" must have a named prayer card");
  await page.screenshot({path:resolve(out,"production-"+option.label+"-390.png"),
    animations:"disabled"});
  assert.equal(errors.length,0,option.label+": "+errors.join(" | "));
  await context.close();
 }
 console.log("PASS LIVE production: 63/64 standard, 6-record Asperges/Vidi aquam and Passiontide rite handoffs, precise priest source/card progress and reversible 48 rollback on 390px phone");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
