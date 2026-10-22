import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8"};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const path=resolve(root,"."+pathname);
    if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const b=await readFile(path);
    res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});
    res.end(b);
  }catch(error){res.writeHead(error.code==="ENOENT"?404:500);res.end(String(error.message??error));}
});
await new Promise((done,fail)=>{server.once("error",fail);server.listen(4182,"127.0.0.1",done)});
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const width of [360,390]){
    const ctx=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
    const page=await ctx.newPage();
    page.on("console",msg=>{if(msg.type()==="error")console.error("phone console:",msg.text())});
    await page.goto("http://127.0.0.1:4182/tests/fixtures/reader-phone-harness.html",{waitUntil:"networkidle"});
    await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:20000});
    await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getActiveCue()!=null,null,{timeout:4000});
    const original=await page.evaluate(()=>({
      cards:window.__AO_PHONE_PREVIEW.model.totalCards,
      cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
      phase:window.__AO_PHONE_PREVIEW.getPriestEntranceState().phase
    }));
    assert.equal(original.cards,65,"65-card curated Sung LIVE model was altered");
    assert.equal(original.phase,"UNOBSERVED");
    assert.match(original.cue,/^AO\.SM\.C\d{4}$/);
    const accepted=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const bad=api.observePriestArrival({actor:"SCHOLA",observed:true,station:"FOOT_OF_ALTAR"});
      const arrival=api.observePriestArrival({actor:"PRIEST",observed:true,station:"FOOT_OF_ALTAR"});
      const reverence=api.observePriestReverence({
        actor:"PRIEST",observed:true,kind:"SIMPLE_GENUFLECTION",blessedSacramentReserved:null
      });
      return {bad:bad.accepted,arrival:arrival.accepted,reverence:reverence.accepted};
    });
    assert.deepEqual(accepted,{bad:false,arrival:true,reverence:true});
    await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getNativeEventState()?.priestEntrance?.phase==="REVERENCE_OBSERVED",null,{timeout:4000});
    const observed=await page.evaluate(()=>({
      state:window.__AO_PHONE_PREVIEW.getNativeEventState(),
      independentSchola:window.__AO_PHONE_PREVIEW.getScholaState(),
      cards:window.__AO_PHONE_PREVIEW.model.totalCards
    }));
    assert.equal(observed.state.priestEntrance.priestAction,"SIMPLE_GENUFLECTION");
    assert.equal(observed.state.priestEntrance.reverence.blessedSacramentReserved,null);
    assert.equal(observed.state.priestEntrance.faithfulPosture,null);
    assert.notEqual(observed.state.ownership.priestAction,"OBSERVED_PREMASS_PRIEST",
      "before-Mass reverence leaked onto an active Mass prayer cue");
    assert.equal(observed.state.nativeCueId,original.cue);
    assert.equal(observed.cards,65);
    const began=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.beginObservedMass());
    assert.equal(began.accepted,true);
    await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getNativeEventState()?.priestEntrance?.phase==="MASS_STARTED",null,{timeout:4000});
    const after=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getNativeEventState());
    assert.equal(after.priestEntrance.priestAction,null);
    assert.equal(after.priestEntrance.phase,"MASS_STARTED");
    assert.equal(after.nativeCueId,original.cue);
    const rejected=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.observePriestReverence({
      actor:"PRIEST",observed:true,kind:"PROFOUND_BOW",blessedSacramentReserved:false
    }));
    assert.equal(rejected.accepted,false,"post-Mass entry appended a stale priest reverence");
    const nav=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const host=api.model.cards.find(c=>c.paragraphs?.some(p=>
        (p.sourceCueIds??[]).includes("AO.SM.C0172")));
      if(!host)throw new Error("Exact Host preparation C0172 is missing from canonical LIVE");
      api.showSequence(host.sequence);
      const element=document.getElementById("ao-r17-native-reader-preview");
      return {
        priestOwner:element?.dataset?.r17OwnerPriestAction,
        section:api.getCurrentCard()?.sectionId,
        cards:api.model.totalCards
      };
    });
    assert.equal(nav.section,"AO.LIVECURATED.AO.CANON.06.1");
    assert.equal(nav.cards,65);
    assert.notEqual(nav.priestOwner,"OBSERVED_PREMASS_PRIEST",
      "old entrance reverence flashed in priest rail during card transition");
    await ctx.close();
  }
  // Opening the reader without a priest observer cannot block Mass.
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await ctx.newPage();
  await page.goto("http://127.0.0.1:4182/tests/fixtures/reader-phone-harness.html",{waitUntil:"networkidle"});
  await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true");
  const untouched=await page.evaluate(()=>{
    const a=window.__AO_PHONE_PREVIEW;
    const result=a.beginObservedMass();
    return {accepted:result.accepted,observed:a.getPriestEntranceState().observed,
      phase:a.getPriestEntranceState().phase,cards:a.model.totalCards};
  });
  assert.deepEqual(untouched,{accepted:true,observed:false,phase:"MASS_STARTED",cards:65});
  await ctx.close();
  console.log("PASS 360/390px LIVE phone: 65-card curated projection, optional priest arrival without stale Mass cues; unobserved Mass never blocked");
}finally{await browser?.close();await new Promise(done=>server.close(done))}
