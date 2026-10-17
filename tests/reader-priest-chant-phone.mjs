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
  const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const f=resolve(root,"."+p);
  if(f!==root&&!f.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const b=await readFile(f);
  res.writeHead(200,{"content-type":mime[extname(f)]??"application/octet-stream","cache-control":"no-store"});res.end(b);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message??e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4178,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [360,390]){
  const ctx=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  const page=await ctx.newPage();
  page.on("console",m=>{if(m.type()==="error")console.error("phone console:",m.text())});
  await page.goto("http://127.0.0.1:4178/tests/fixtures/reader-phone-harness.html",{waitUntil:"networkidle"});
  await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",{timeout:20000});
  const pre=await page.evaluate(()=>{
   const api=window.__AO_PHONE_PREVIEW;
   api.showSection("AO.CARD.013");
   return {cards:api.model.totalCards,section:api.getCurrentCard()?.sectionId};
  });
  assert.equal(pre.cards,48,"LIVE 48-card invariant lost");
  assert.equal(pre.section,"AO.CARD.013");
  await page.waitForFunction(()=>/^AO\.SM\.C014[5-9]$/.test(window.__AO_PHONE_PREVIEW.getActiveCue()??""),null,{timeout:4000});
  // The public choir cue cannot by itself fire an action by the celebrant.
  const before=await page.evaluate(()=>({
   cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
   state:window.__AO_PHONE_PREVIEW.getNativeEventState(),
   owner:document.querySelector("#ao-r17-native-reader-preview")?.dataset.r17OwnerPriestAction,
   track:window.__AO_PHONE_PREVIEW.getScholaState()?.schola?.cueId??null
  }));
  if(before.cue!=="AO.SM.C0145"&&before.cue!=="AO.SM.C0148"){
   // The first page can focus on Pleni/Hosanna. Move the actual scroll to C0145.
   await page.locator(".ao-prayer-card").evaluate(el=>{
    const hit=el.querySelector('[data-cue-id="AO.SM.C0145"]');
    if(!hit)throw Error("Sanctus cue missing from source-first LIVE card");
    const cr=el.getBoundingClientRect(),r=hit.getBoundingClientRect();
    el.scrollTop=Math.max(0,r.top-cr.top+el.scrollTop+r.height/2-el.clientHeight*.39);
   });
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getActiveCue()==="AO.SM.C0145",null,{timeout:3000});
  }
  const cue=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getActiveCue());
  // Display must be fail closed for priest action; observe is an explicit source input.
  await page.waitForFunction(()=>document.querySelector("#ao-r17-native-reader-preview")?.dataset.r17OwnerPriestAction==="PRIEST_EVENT_UNOBSERVED_FAIL_CLOSED",null,{timeout:3000});
  const unobserved=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getNativeEventState());
  assert.equal(unobserved.priestAction,null);
  assert.equal(unobserved.priestVoice,null,
    "Schola-owned Sanctus cue must not project an inferred private priest voice");
  assert.equal(unobserved.ownership?.priestVoice,"PRIEST_VOICE_UNOBSERVED_FAIL_CLOSED");
  const scholaBefore=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getScholaState());
  const accepted=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.observePriestEvent({
   actor:"PRIEST",observed:true,source:"EXPLICIT_OBSERVATION",
   eventType:"PRIEST_BENEDICTUS_RECITATION"
  }));
  assert.equal(accepted.accepted,true);
  await page.waitForFunction(()=>document.querySelector("#ao-r17-native-reader-preview")?.dataset.r17OwnerPriestAction==="INDEPENDENT_PRIEST_OBSERVATION",null,{timeout:3000});
  const after=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getNativeEventState());
  assert.equal(after.priestAction.sourceGestureId,"GM.P.C0148.01");
  assert.equal(after.priestAction.owner,"INDEPENDENT_PRIEST_OBSERVATION");
  assert.equal(after.priestVoice?.owner,"INDEPENDENT_PRIEST_OBSERVATION");
  assert.match(after.priestVoice?.label??"",/BENEDICTUS/,
    "Independent priest Benedictus observation must restore priest-only quiet voice");
  assert.equal(after.ownership?.priestVoice,"INDEPENDENT_PRIEST_OBSERVATION");
  assert.equal(after.nativeCueId,cue,"reader cue changed because of priest observation");
  assert.deepEqual(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getScholaState()),scholaBefore,
   "explicit priest observation changed Schola position");
  const forged=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.observePriestEvent({
   actor:"SCHOLA",observed:true,source:"EXPLICIT_OBSERVATION",
   eventType:"PRIEST_BENEDICTUS_RECITATION"
  }));
  assert.equal(forged.accepted,false,"Schola forged a priest movement");
  await page.evaluate(()=>window.__AO_PHONE_PREVIEW.clearPriestObservation());
  await page.waitForFunction(()=>document.querySelector("#ao-r17-native-reader-preview")?.dataset.r17OwnerPriestAction==="PRIEST_EVENT_UNOBSERVED_FAIL_CLOSED");
  const cleared=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getNativeEventState());
  assert.equal(cleared.priestVoice,null);
  assert.equal(cleared.ownership?.priestVoice,"PRIEST_VOICE_UNOBSERVED_FAIL_CLOSED");
  await page.evaluate(()=>window.__AO_PHONE_PREVIEW.showSection("AO.CANON.06"));
  await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId==="AO.CANON.06");
  const stale=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getNativeEventState());
  assert.notEqual(stale.ownership?.priestAction,"INDEPENDENT_PRIEST_OBSERVATION");
  assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.model.totalCards),48);
  await ctx.close();
 }
 console.log("PASS 360/390px phone: 48-card reader; Schola alone cannot move priest; explicit observation restores priest-only gesture; no Schola advancement or stale carryover.");
} finally {await browser?.close();await new Promise(resolve=>server.close(resolve));}
