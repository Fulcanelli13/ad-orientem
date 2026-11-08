// Real 390px Home -> Low Mass -> LIVE reader regression for source-certified
// days with principal + two commemorations. The two commemorations use one
// common conclusion (§437): 3 prayer texts, but only 2 liturgical groups.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const name=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(name!==root&&!name.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const bytes=await readFile(name);
  res.writeHead(200,{"content-type":mime[extname(name)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true});
 // January's ordinary double commemoration and December's privileged
 // Advent occurrence use different source calendars and language settings.
 for(const {date,language} of [
  {date:"2026-01-19",language:"en"},
  {date:"2026-12-04",language:"fr"}
 ]){
  const page=await browser.newPage({viewport:{width:390,height:844},
   isMobile:true,hasTouch:true,serviceWorkers:"block"});
  const pageErrors=[];page.on("pageerror",e=>pageErrors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+
    "/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:80000});
   await page.waitForSelector(".homeScreen .aoH7HomeView [data-home-h7-enter]",
    {state:"visible",timeout:60000});
   await page.waitForFunction(()=>Boolean(
    globalThis.AO_CALENDAR_APP_V1?.select&&globalThis.AO_R17_BROWSER_ENTRY?.installed
   ),null,{timeout:55000});
   await page.locator(".homeScreen .aoH7HomeView .date[data-home-calendar-view='picker']").click();
   await page.waitForSelector(".homeScreen .aoH4CalendarInline #ao-calendar-modular-root",
    {state:"visible",timeout:35000});
   assert.equal(await page.evaluate(d=>
    globalThis.AO_CALENDAR_APP_V1.select(d,{closeAfter:false}),date),true);
   await page.locator(".homeScreen .aoH4CalendarBack [data-home-calendar-today]").click();
   await page.waitForFunction(d=>{
    const st=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    return st?.selectedDate===d&&st?.resolution?.date===d&&!st?.resolving;
   },date,{timeout:45000});
   await page.locator(".homeScreen .aoH7HomeView [data-home-h7-enter]").click();
   const door=page.locator(".homeScreen .aoH7DoorView:not([hidden])");
   await door.waitFor({state:"visible",timeout:30000});
   await door.locator("[data-home-h4-change]").first().click();
   const options=page.locator(".aoH4ChoiceDialog[open]");
   await options.waitFor({state:"visible",timeout:20000});
   await options.locator('[data-h4-option="form"]').selectOption("LOW");
   await options.locator('[data-h4-option="readerMode"]').selectOption("LIVE");
   await options.locator('[data-h4-option="readerLanguage"]').selectOption(language);
   await options.locator('[data-h4-option="beforeMass"]').selectOption("none");
   await options.locator("[data-h4-sheet-close]").last().click();
   await options.waitFor({state:"detached",timeout:20000});
   await page.waitForFunction(()=>Boolean(document.querySelector(
    ".aoH7DoorView:not([hidden]) [data-home-h4-begin]:not([disabled])"
   )),null,{timeout:50000});
   const preflight=await page.evaluate(async()=>{
    const prepared=await globalThis.AO_R17_BROWSER_ENTRY.prepare();
    const mass=prepared?.session?.resolvedMass;
    const p=mass?.proper?.data??mass?.proper;
    return {date:mass?.date,form:mass?.form,
     path:p?.sourcePath,counts:["collects","secrets","postcommunions"].map(k=>p?.[k]?.length),
     joined:["collects","secrets","postcommunions"].map(k=>
      p?.[k]?.[1]?.oneConclusion?.kind??null)};
   });
   assert.equal(preflight.date,date,"Host Mass date mismatch");
   assert.equal(preflight.form,"LOW","Host selected wrong Mass form");
   assert.deepEqual(preflight.counts,[2,2,2],
    date+" should have principal prayer plus one shared-conclusion group");
   assert.deepEqual(preflight.joined,Array(3).fill("MULTIPLE_COMMEMORATIONS"),
    date+" two named commemorations are not composed under one conclusion");
   // A historical Calendar date deliberately requires two explicit Begin
   // activations. Preserve the app's date-mismatch guard; the first press
   // warns, and only the second enters the selected historical Mass.
   await door.locator("[data-home-h4-begin]").click();
   const warning=door.locator("[data-home-mass-date-warning]");
   await warning.waitFor({state:"visible",timeout:8000});
   assert.match(await warning.innerText(),new RegExp(date),
    "Historical-date confirmation must name the actual selected date");
   await door.locator("[data-home-h4-begin]").click();
   await page.waitForFunction(()=>Boolean(
    globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId&&
    document.querySelector("#ao-r17-native-reader-preview [data-ao-reader-shell]")
   ),null,{timeout:25000}).catch(async error=>{
    const detail=await page.evaluate(()=>{
     const st=globalThis.AO_RUNTIME_V8?.store?.getState?.();
     const api=globalThis.AO_R17_BROWSER_ENTRY;
     const status=api?.status?.();
     const host=globalThis.AO_CELEBRATION_API?.getResolvedMass?.();
     const shell=globalThis.AO_APP_SHELL_V1?.status?.();
     const native=document.querySelector("#ao-r17-native-reader-preview");
     const preflight=document.querySelector("[data-ao-full-mass-preflight]");
     return {
      selectedDate:st?.selectedDate,resolving:st?.resolving,
      route:st?.route,activeShell:shell?.active,visibleOwner:shell?.visibleOwner,
      currentHostDate:host?.date,hostSource:host?.proper?.data?.sourcePath,
      browserStatus:{installed:status?.installed,
       chosenForm:status?.fullMassPreflight?.chosenForm,
       phase:status?.phase,readiness:status?.readiness},
      preflight:{exists:!!preflight,visible:Boolean(preflight&&
       getComputedStyle(preflight).display!=="none"),text:preflight?.innerText?.slice(0,700)},
      native:{exists:!!native,text:native?.innerText?.slice(0,350)},
      dialog:[...document.querySelectorAll("[role=dialog]")].filter(x=>
       getComputedStyle(x).display!=="none").map(x=>x.innerText.slice(0,300)),
      pageErrors:[]
     };
    });
    throw new Error(date+" reader handoff failed: "+JSON.stringify(detail)+
      " / prior errors: "+JSON.stringify(pageErrors)+" / "+error.message);
   });
   const next=page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']");
   const rows=[];
   for(const [name,source] of [
    ["Collect","AO.CARD.004"],["Secret","AO.CARD.011"],["Postcommunion","AO.CARD.027"]
   ]){
    const initial=await page.evaluate(source=>{
     const preview=globalThis.AO_R17_NATIVE_READER_PREVIEW;
     const root=document.querySelector("#ao-r17-native-reader-preview");
     const matched=preview.model.cards.filter(card=>
      card.sourceSectionId===source &&
      card.paragraphs.some(p=>p.prayerRole==="SECOND_COMMEMORATION"));
     if(matched.length!==1)return {error:"SOURCE_CARD_COUNT",count:matched.length};
     const card=preview.showSection(matched[0].sectionId);
     const scroll=root.querySelector(".ao-prayer-card");
     const nodes=[...scroll.querySelectorAll(".ao-reader-paragraph[data-prayer-role]")];
     return {id:card?.sectionId,
      source:card?.sourceSectionId,
      roles:nodes.map(n=>n.dataset.prayerRole).filter(x=>
       ["PRINCIPAL_ORATION","FIRST_COMMEMORATION","SECOND_COMMEMORATION"].includes(x)),
      groups:nodes.filter(n=>["PRINCIPAL_ORATION","FIRST_COMMEMORATION",
       "SECOND_COMMEMORATION"].includes(n.dataset.prayerRole))
       .map(n=>Number(n.dataset.orationGroupIndex)),
      length:scroll.innerText.length};
    },source);
    assert.ok(!initial.error,date+" "+name+" missing actual composed card "+JSON.stringify(initial));
    assert.deepEqual(initial.roles,["PRINCIPAL_ORATION","FIRST_COMMEMORATION",
     "SECOND_COMMEMORATION"],date+" "+name+" must render three distinct source texts");
    assert.deepEqual(initial.groups,[1,2,2],date+" "+name+" one-conclusion boundaries");
    assert.ok(initial.length>150,date+" "+name+" source card has no visible prayer text");
    const seen=new Set(),revealStates=[];
    for(let tap=0;tap<5;tap++){
     const now=await page.evaluate(()=>{
      const root=document.querySelector("#ao-r17-native-reader-preview");
      const scroll=root.querySelector(".ao-prayer-card");
      const viewport=scroll.getBoundingClientRect();
      const threshold=viewport.top+Math.min(viewport.height*.5,280);
      const entries=[...scroll.querySelectorAll(
       ".ao-reader-paragraph[data-prayer-role]")].map(n=>({
        role:n.dataset.prayerRole,top:n.getBoundingClientRect().top,
        bottom:n.getBoundingClientRect().bottom
       }));
      return {id:globalThis.AO_R17_NATIVE_READER_PREVIEW.getCurrentCard()?.sectionId,
       positions:entries,threshold,viewportTop:viewport.top,
       scrollTop:scroll.scrollTop,focus:root.dataset.aoNextOration??""};
     });
     assert.equal(now.id,initial.id,date+" "+name+" advanced before second commemoration");
     for(const x of now.positions)if(x.top<=now.threshold+8 &&
       x.bottom>=now.viewportTop-8)seen.add(x.role);
     if(seen.has("SECOND_COMMEMORATION"))break;
     await next.click();
     const after=await page.evaluate(()=>({
      id:globalThis.AO_R17_NATIVE_READER_PREVIEW.getCurrentCard()?.sectionId,
      focus:document.querySelector("#ao-r17-native-reader-preview")?.dataset.aoNextOration
     }));
     revealStates.push(after.focus);
     assert.equal(after.id,initial.id,
      date+" "+name+" NEXT skipped unread second commemoration");
    }
    assert.ok(seen.has("FIRST_COMMEMORATION"),
     date+" "+name+" NEXT bypassed the first commemoration");
    assert.ok(seen.has("SECOND_COMMEMORATION"),
     date+" "+name+" NEXT never reached the second commemoration");
    // The first source prayer scroll can legitimately bring both short
    // commemorations into the reading zone together. Require only that a
    // previously unseen second prayer becomes physically visible before
    // NEXT advances, not an unnecessary separate tap/debug marker.
    if(revealStates.length)assert.ok(revealStates.some(x=>
     ["SECOND_PRAYER_REVEALED","SECOND_COMMEMORATION_REVEALED"].includes(x)),
     date+" "+name+" changed focus without an identified source prayer");
    await next.click();
    assert.notEqual(await page.evaluate(()=>
     globalThis.AO_R17_NATIVE_READER_PREVIEW.getCurrentCard()?.sectionId),
     initial.id,date+" "+name+" NEXT did not advance after completed orations");
    rows.push({name,source,roles:initial.roles,groups:initial.groups,
     seen:[...seen],revealStates});
   }
   assert.deepEqual(pageErrors,[],date+" browser errors");
   console.log("MASS_LOW_DOUBLE_COMMEMORATION_PHONE_PASS "+JSON.stringify({
    date,language,proper:preflight.path,orations:preflight.counts,
    sharedConclusions:preflight.joined,groups:rows}));
  }finally{await page.close();}
 }
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
