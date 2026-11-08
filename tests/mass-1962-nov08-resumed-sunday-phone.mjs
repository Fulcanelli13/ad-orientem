// Exact Sunday 8 November 2026: resumed fifth after Epiphany,
// including 23rd-after-Pentecost chant inheritance (1962 Roman Missal).
// Reproduce real H7 Home -> Door -> 390px native LIVE Mass, not a stubbed Proper.
// Independent 1962 Ordo: https://ordo.fsspx.org/en/day/2026-11-08
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const date="2026-11-08";
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
 ".mjs":"text/javascript;charset=utf-8",".json":"application/json",
 ".css":"text/css;charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".woff2":"font/woff2",".webp":"image/webp"};
const srv=http.createServer(async(req,res)=>{
 try{
  const name=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(name!==root&&!name.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const bytes=await readFile(name);
  res.writeHead(200,{"content-type":mime[extname(name)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message))}
});
await new Promise(done=>srv.listen(0,"127.0.0.1",done));
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const {form,lang,aspersion} of [
  {form:"LOW",lang:"en",aspersion:"no"},
  {form:"MISSA_CANTATA_SIMPLE",lang:"fr",aspersion:"no"}
 ]){
  const page=await browser.newPage({viewport:{width:390,height:844},
   isMobile:true,hasTouch:true,serviceWorkers:"block",locale:lang==="fr"?"fr-FR":"en-GB"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+srv.address().port+"/index.html?aoR17Reader=native",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForSelector(".homeScreen .aoH7HomeView [data-home-h7-enter]",
    {state:"visible",timeout:60000});
   await page.waitForFunction(()=>Boolean(globalThis.AO_RUNTIME_V8?.resolver?.resolveDay&&
    globalThis.AO_CALENDAR_APP_V1?.select&&globalThis.AO_R17_BROWSER_ENTRY?.installed),
    null,{timeout:60000});
   const source=await page.evaluate(async()=>{
    const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay("2026-11-08");
    const {select1962CommemorationsForMassForm}=await import("/src/mass/1962-commemoration-form-source.js");
    const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
    const {calendarOrdoMassFacts}=await import("/src/calendar/ordo-mass-facts.js");
    const selected=select1962CommemorationsForMassForm({proper:r.proper,calendarResolution:r,form:"LOW"});
    const p=selected.proper?.data??selected.proper;
    const lat=x=>String(x?.lat??x?.la??x?.latin??(typeof x==="string"?x:"")).replace(/\s+/g," ").slice(0,250);
    const slots=Object.fromEntries(["en","fr"].map(language=>{
     const x=properToReaderSlots(p,{language});
     return [language,{ready:x.ready,missing:x.missing,
      counts:Object.fromEntries(["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"].map(k=>
       [k,x.slots?.[k]?.data?.paragraphs?.filter(q=>q.kind==="TEXT").length??0]))}];
    }));
    const chants=Object.fromEntries(["introit","gradual","alleluia","offertory","communion"].map(k=>
     [k,lat(p?.[k])]));
    const readings=Object.fromEntries(["epistle","gospel"].map(k=>[k,lat(p?.[k])]));
    return {status:r.status,date:r.date,main:r.day?.main,
     properStatus:r.proper?.status,sourcePath:p?.sourcePath,
     commemorations:(r.day?.commemorations??[]).map(c=>({id:c.id,path:c.path})),
     sourceCommemorations:p?.calendarCommemorations?.map(c=>({path:c.path})),
     counts:["collects","secrets","postcommunions"].map(k=>p?.[k]?.length??0),
     chants,readings,preface:lat(p?.preface),slots,
     ordo:calendarOrdoMassFacts(r),formDecision:selected.status,
     formReason:selected.reason??null};
   });
   console.log("NOV08_1962_SOURCE_DIAGNOSTIC "+JSON.stringify({form,lang,source}));
   assert.equal(source.status,"ready",date+" calendar not ready");
   assert.equal(source.properStatus,"ready",date+" Proper not ready");
   assert.equal(source.date,date);
   assert.equal(source.main?.rank,2,"Resumed Sunday must be II class");
   assert.match(String(source.main?.title),/V|Fifth|5th/i,
    "Resumed fifth Sunday title missing");
   assert.match(String(source.main?.id),/Epi5/i,
    "Wrong Sunday principal; 24th Sunday is reserved for last Sunday before Advent");
   assert.equal(source.commemorations.length,0,
    "The 1962 universal Sunday must not import earlier-edition martyr commemorations");
   assert.deepEqual(source.counts,[1,1,1],
    "Sunday requires precisely one Collect, Secret, Postcommunion");
   assert.ok(source.slots.en.ready&&source.slots.fr.ready,
    "Both reader languages must be sourced");
   assert.match(source.chants.introit,/dicit\s+domin|dicit\s+dominus/i,
    "Resumed Sunday must sing the 23rd-after-Pentecost Dicit Dominus Introit");
   assert.match(source.chants.gradual,/liberasti|liber[aá]sti/i,
    "Resumed Sunday must sing the 23rd-after-Pentecost Liberasti gradual");
   assert.match(source.chants.offertory,/de\s+profundis/i,
    "Resumed Sunday must sing the 23rd-after-Pentecost De profundis Offertory");
   assert.match(source.chants.communion,/amen\s+dico/i,
    "Resumed Sunday must sing the 23rd-after-Pentecost Amen dico Communion");
   assert.match(source.readings.epistle,/indu[ií]te|induite/i,"Col 3:12-17 source missing");
   assert.match(source.readings.gospel,/semin[aá]vit|ziz[aá]nia/i,
    "Mt 13:24-30 (wheat and tares) Gospel missing");
   assert.match(source.preface,/trinitat/i,"Sunday Trinity Preface missing");
   // Select the dated Mass via the existing Calendar navigation, without
   // changing the computer's date or patching the renderer's DOM.
   await page.locator(".homeScreen .aoH7HomeView .date[data-home-calendar-view='picker']").click();
   await page.waitForSelector(".homeScreen .aoH4CalendarInline #ao-calendar-modular-root",
    {state:"visible",timeout:45000});
   assert.equal(await page.evaluate(d=>
    globalThis.AO_CALENDAR_APP_V1.select(d,{closeAfter:false}),date),true);
   await page.locator(".homeScreen .aoH4CalendarBack [data-home-calendar-today]").click();
   await page.waitForFunction(d=>{
    const s=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    return s?.selectedDate===d&&s?.resolution?.date===d&&!s?.resolving;
   },date,{timeout:45000});
   await page.locator(".homeScreen .aoH7HomeView [data-home-h7-enter]").click();
   const door=page.locator(".homeScreen .aoH7DoorView:not([hidden])");
   await door.waitFor({state:"visible",timeout:30000});
   await door.locator("[data-home-h4-change]").first().click();
   const choice=page.locator(".aoH4ChoiceDialog[open]");
   await choice.waitFor({state:"visible",timeout:20000});
   await choice.locator('[data-h4-option="form"]').selectOption(form);
   await choice.locator('[data-h4-option="readerMode"]').selectOption("LIVE");
   await choice.locator('[data-h4-option="readerLanguage"]').selectOption(lang);
   await choice.locator('[data-h4-option="beforeMass"]').selectOption("none");
   const asp=choice.locator('[data-h4-option="aspersion"]');
   if(form!=="LOW"&&await asp.isEnabled())await asp.selectOption(aspersion);
   await choice.locator("[data-h4-sheet-close]").last().click();
   await choice.waitFor({state:"detached",timeout:20000});
   await page.waitForFunction(()=>Boolean(document.querySelector(
    ".aoH7DoorView:not([hidden]) [data-home-h4-begin]:not([disabled])"
   )),null,{timeout:50000});
   const prepared=await page.evaluate(async()=>{
    const out=await globalThis.AO_R17_BROWSER_ENTRY.prepare();
    const mass=out?.session?.resolvedMass;
    const p=mass?.proper?.data??mass?.proper;
    return {date:mass?.date,form:mass?.form,sourcePath:p?.sourcePath,
     counts:["collects","secrets","postcommunions"].map(k=>p?.[k]?.length??0),
     preface:String(p?.preface?.lat??"").slice(0,180)};
   });
   console.log("NOV08_1962_PREPARED_DIAGNOSTIC "+JSON.stringify({form,lang,prepared}));
   assert.equal(prepared.date,date,"Selected dated host Mass changed");
   assert.equal(prepared.form,form);
   assert.deepEqual(prepared.counts,[1,1,1],
    "Actual Mass preparation added or omitted a Sunday prayer");
   await door.locator("[data-home-h4-begin]").click();
   const warning=door.locator("[data-home-mass-date-warning]");
   if(await warning.count()){
    await warning.waitFor({state:"visible",timeout:8000});
    await door.locator("[data-home-h4-begin]").click();
   }
   await page.waitForFunction(()=>Boolean(
    globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId&&
    document.querySelector("#ao-r17-native-reader-preview [data-ao-reader-shell]")
   ),null,{timeout:65000});
   const it=await page.evaluate(()=>{
    const p=globalThis.AO_R17_NATIVE_READER_PREVIEW;
    const root=document.querySelector("#ao-r17-native-reader-preview");
    const nav=[...root.querySelectorAll("[data-reader-section-all] [data-reader-section]")];
    const titles=nav.map(x=>x.innerText);
    const properCards=(p.model?.cards??[]).filter(c=>
     ["AO.CARD.004","AO.CARD.011","AO.CARD.027"].includes(c.sourceSectionId))
     .map(c=>({source:c.sourceSectionId,prayers:c.paragraphs.filter(x=>
      ["PRINCIPAL_ORATION","ADDITIONAL_ORATION"].includes(x.prayerRole))
      .map(x=>({role:x.prayerRole,group:x.orationGroupIndex}))}));
    return {sourceCards:p.model?.totalCards,visible:nav.length,titles,
     properCards,mode:root.querySelector("[data-ao-reader-shell]")?.dataset.mode,
     omitted:(p.model?.cards??[]).filter(c=>!nav.some(n=>
      n.getAttribute("data-reader-section")===c.sectionId))
      .map(c=>({source:c.sourceSectionId,title:c.title,omittedByRite:c.omittedByRite}))};
   });
   console.log("NOV08_1962_NATIVE_ITINERARY "+JSON.stringify({form,lang,
    ...it,titles:it.titles.filter(x=>/Gloria|Credo|Preface|Collect|Secret|Postcommunion|Gospel/i.test(x))}));
   assert.equal(it.sourceCards,65,"Canonical 65-card source graph changed");
   assert.equal(it.mode,"LIVE");
   assert.ok(it.titles.some(t=>/Gloria/i.test(t)),"Sunday Gloria missing");
   assert.ok(it.titles.some(t=>/Credo/i.test(t)),"Sunday Credo missing");
   assert.ok(it.titles.some(t=>/Preface/i.test(t)),"Sunday Preface missing");
   assert.equal(it.properCards.length,3,"Expected source-owned three oration cards");
   for(const card of it.properCards)
    assert.deepEqual(card.prayers,[{role:"PRINCIPAL_ORATION",group:1}],
     "Additional or missing Sunday prayer in "+card.source);
   assert.deepEqual(errors,[],"Browser errors");
   console.log("NOV08_1962_MASS_PHONE_PASS "+JSON.stringify({
    date,form,language:lang,source:prepared.sourcePath,
    orations:prepared.counts,readerCards:it.visible,gloria:true,credo:true,preface:true}));
  }finally{await page.close();}
 }
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(done=>srv.close(done));
}
