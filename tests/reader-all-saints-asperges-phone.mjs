import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

// All Saints 2026: test a real 390px native reader and source-owned
// Sunday Asperges -> Foot-of-the-Altar Mass transition. The harness uses
// a synthetic test Proper, so this test does NOT certify today's Proper.
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/all-saints-asperges-phone");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
  ".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const path=resolve(root,"."+name);
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(await readFile(path));
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const sleepFrames=()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok)));
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const mode of ["LIVE","MISSAL"]){
  for(const lang of ["en","fr"]){
   const ctx=await browser.newContext({
    viewport:{width:390,height:844},deviceScaleFactor:1,
    isMobile:true,hasTouch:true,locale:lang==="fr"?"fr-FR":"en-GB",
    serviceWorkers:"block",
   });
   try{
    const page=await ctx.newPage(),errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    const params=new URLSearchParams({
     production:"1",date:"2026-11-01",rite:"asperges",
     mode,lang,form:"MISSA_CANTATA_SIMPLE",
    });
    await page.goto("http://127.0.0.1:"+server.address().port+
      "/tests/fixtures/reader-phone-harness.html?"+params,
      {waitUntil:"domcontentloaded",timeout:65000});
    await page.waitForFunction(()=>["true","error"].includes(document.documentElement.dataset.harnessReady),
      null,{timeout:45000});
    const opening=await page.evaluate(()=>{
     const api=window.__AO_PHONE_PREVIEW;
     return {error:window.__AO_PHONE_HARNESS_ERROR??null,
      stage:api?.getCurrentCard?.()?.id,
      formula:api?.getAspergesState?.()?.formulaState,
      mode:api?.getPresentationMode?.(),
      sourceCards:api?.sourceModel?.totalCards,
      modelCards:api?.model?.totalCards};
    });
    assert.equal(opening.error,null,mode+"/"+lang+" failed to mount");
    assert.equal(opening.stage,"ASP-R01");
    assert.equal(opening.mode,mode);
    assert.equal(opening.formula?.formula,"ORDINARY","All Saints must not show Vidi aquam");
    assert.equal(opening.formula?.omitGloriaPatri,false,"The doxology is not omitted on All Saints");
    assert.equal(opening.modelCards,mode==="LIVE"?65:opening.modelCards);
    assert.ok(opening.sourceCards===39||opening.sourceCards===30);

    const navigate=async direction=>{
     const moved=await page.evaluate(direction=>{
      const button=document.querySelector(
       "#ao-r17-native-reader-preview [data-reader-nav='"+direction+"']");
      if(!button||button.disabled)return false;
      button.click();return true;
     },direction);
     assert.equal(moved,true,"Visible reader "+direction+" was unavailable");
     await page.evaluate(sleepFrames);
    };
    const step=()=>page.evaluate(()=>{
     const api=window.__AO_PHONE_PREVIEW;
     const card=api?.getCurrentCard?.();
     const root=document.querySelector("#ao-r17-native-reader-preview");
     const paragraphs=[...root.querySelectorAll(".ao-prayer-card .ao-reader-paragraph")];
     return {id:card?.id??card?.sectionId??null,
      source:card?.sourceSectionId??card?.sectionId??null,
      blocks:(card?.blocks??[]).map(b=>b.blockId),
      mode:root.querySelector("[data-ao-reader-shell]")?.dataset.mode,
      latin:paragraphs.map(p=>p.querySelector(".ao-line-primary")?.textContent?.trim()??""),
      translation:paragraphs.map(p=>p.querySelector(".ao-line-secondary")?.textContent?.trim()??""),
      riteMusic:root.querySelector("[data-role='rite-music']")?.textContent?.trim()??null,
      bodyText:root.querySelector(".ao-prayer-body")?.textContent??"",
      stateOwner:root.dataset.r17StateOwner,
     };
    });
    for(const id of ["ASP-R01","ASP-R02","ASP-R03","ASP-R04","ASP-R05"]){
     const state=await step();
     assert.equal(state.id,id,mode+"/"+lang+" source rite stage changed order");
     if(id==="ASP-R02"){
      assert.ok(state.latin.some(t=>t.includes("Asperges me")));
      assert.ok(!state.latin.some(t=>t.includes("Vidi aquam")));
      assert.ok(state.latin.some(t=>t.includes("Glória Patri")));
      assert.ok(state.translation.filter(Boolean).length>=4,
       mode+"/"+lang+" Latin chant has no vernacular reading aid");
      if(lang==="fr")assert.ok(state.translation.some(t=>/Aspergez-moi/.test(t)));
      else assert.ok(state.translation.some(t=>/sprinkle me/.test(t)));
      await page.screenshot({path:out+"/"+mode+"-"+lang+"-asperges.png"});
     }
     if(id==="ASP-R04"){
      assert.ok(state.latin.some(t=>t.includes("℣. Orémus.")),
       "The appointed Oremus was omitted");
      assert.ok(state.latin.some(t=>t.includes("℟. Amen.")),
       "The Amen response was omitted");
      assert.ok(state.latin.some(t=>t.includes("℣. Dóminus vobíscum.")),
       "The spoken Latin versicles must show their exact response markers");
      assert.ok(state.translation.filter(Boolean).length>=9);
      await page.screenshot({path:out+"/"+mode+"-"+lang+"-responses.png"});
     }
     await navigate("next");
    }
    const entered=await step();
    assert.ok(entered.source==="AO.CARD.001",
      mode+"/"+lang+" Asperges did not hand off to the ordinary Mass opening");
    assert.ok(entered.blocks.includes("AO.SM.B001"),
      "Asperges wrongly skipped the Prayers at the Foot");
    assert.ok(entered.bodyText.trim(),"Mass opening after Asperges is empty");
    await page.screenshot({path:out+"/"+mode+"-"+lang+"-mass.png"});
    await navigate("previous");
    assert.equal((await step()).id,"ASP-R05",
      "Back at first Mass page did not restore the last Asperges stage");
    await navigate("next");
    assert.equal((await step()).source,"AO.CARD.001",
      "Returning to Mass did not restore the first opening page");
    const other=mode==="LIVE"?"MISSAL":"LIVE";
    const switched=await page.evaluate(other=>{
      const api=window.__AO_PHONE_PREVIEW;
      api.setPresentationMode(other);
      const card=api.getCurrentCard();
      return {mode:api.getPresentationMode(),total:api.model.totalCards,
       source:card?.sourceSectionId??card?.sectionId,
       visible:document.querySelector("[data-ao-reader-shell]")?.dataset.mode};
    },other);
    assert.equal(switched.mode,other);
    assert.equal(switched.visible,other);
    assert.equal(switched.source,"AO.CARD.001","Mode switch lost opening source section");
    assert.equal(switched.total,other==="LIVE"?65:switched.total);
    await navigate("next");
    assert.ok((await step()).bodyText.trim(),"Next after switch became blank");
    assert.deepEqual(errors,[],"Browser runtime errors in All Saints Asperges");
    console.log("PASS All Saints 2026 Asperges "+mode+"/"+lang+
     ": ordinary formula, complete response, bilingual reader, Foot handoff, Back, mode switch");
   }finally{await ctx.close()}
  }
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
