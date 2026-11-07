import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".mjs":"text/javascript; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const bytes=await readFile(p);
  res.writeHead(200,{"content-type":mime[extname(p)]||"application/octet-stream",
   "cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},
  isMobile:true,hasTouch:true});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:"+server.address().port+
  "/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:70000});
 await page.waitForSelector(".homeScreen.aoTodayH4",{state:"visible",timeout:45000});
 await page.waitForFunction(()=>Boolean(globalThis.AO_CALENDAR_APP_V1?.select &&
  globalThis.AO_R17_BROWSER_ENTRY?.installed),null,{timeout:50000});
 await page.locator(".homeScreen .aoH7HomeView .date[data-home-calendar-view='picker']").click();
 await page.waitForSelector(".homeScreen .aoH4CalendarInline #ao-calendar-modular-root",
  {state:"visible",timeout:45000});
 assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1.select(
  "2026-11-07",{closeAfter:false})),true);
 await page.locator(".homeScreen .aoH4CalendarBack [data-home-calendar-today]").click();
 await page.waitForFunction(()=>{
  const st=globalThis.AO_RUNTIME_V8?.store?.getState?.();
  return st?.selectedDate==="2026-11-07" && !st.resolving &&
   document.querySelector(".homeScreen .aoH7HomeView [data-home-icrsp-ordo='2026-11-07']");
 },null,{timeout:45000});
 const card=page.locator(".homeScreen .aoH7HomeView [data-home-icrsp-ordo='2026-11-07']");
 const rendered=await card.innerText();
 for(const expected of ["ICRSP France","Immaculate Heart","Adeamus",
  "Class 3","No Credo","Prayer for the Pope"])
  assert.ok(rendered.includes(expected),expected+": "+rendered);
 await page.locator(".homeScreen .aoH7HomeView [data-home-h7-enter]").click();
 const door=page.locator(".homeScreen .aoH7DoorView:not([hidden])");
 await door.waitFor({state:"visible"});
 assert.match(await door.innerText(),/Use Immaculate Heart votive/);
 await door.locator("[data-home-icrsp-votive='VOTIVE']").click();
 await page.waitForFunction(()=>{
  const arch=globalThis.AO_CELEBRATION_ARCH_V1;
  const form=globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.fullMassPreflight?.chosenForm;
  return arch?.actualCelebration?.id==="immaculate_heart"&&
   arch?.votiveBasis==="first_saturday"&&
   arch?.rubric?.gloria===true&&arch?.rubric?.credo===false&&
   form==="LOW";
 },null,{timeout:40000});
 await page.waitForFunction(()=>globalThis.AO_CELEBRATION_ARCH_V1?.readiness?.loading===false,
  null,{timeout:45000});
 const snapshot=await page.evaluate(async()=>{
  const host=globalThis.AO_CELEBRATION_ARCH_V1;
  const prepared=await globalThis.AO_R17_BROWSER_ENTRY.prepare();
  const mass=prepared?.session?.resolvedMass;
  const proper=mass?.proper?.data??mass?.proper;
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  const summary=language=>{
   const s=properToReaderSlots(proper,{language});
   return {ready:s.ready,missing:s.missing,
    counts:Object.fromEntries(["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"]
     .map(k=>[k,s.slots?.[k]?.data?.paragraphs?.length??0]))};
  };
  return {id:host.actualCelebration?.id,basis:host.votiveBasis,
   rubric:host.rubric,date:mass?.date,form:mass?.form,
   sourcePath:proper?.sourcePath,ordo:proper?.sourceOrdoExpectation?.id,
   decision:proper?.proPapaOrationDecision?.status,
   counts:Object.fromEntries(["collects","secrets","postcommunions"].map(
    k=>[k,proper?.[k]?.length??0])),
   en:summary("en"),fr:summary("fr")};
 });
 assert.deepEqual([snapshot.id,snapshot.basis,snapshot.date,snapshot.form,snapshot.sourcePath],
  ["immaculate_heart","first_saturday","2026-11-07","LOW","Votive/08-22r"],
  JSON.stringify(snapshot));
 assert.equal(snapshot.decision,"SOURCE_ATTESTED");
 assert.equal(snapshot.ordo,"ICRSP_FRANCE_2026-11-07_VOTIVE_PRO_PAPA");
 assert.deepEqual(snapshot.counts,{collects:2,secrets:2,postcommunions:2});
 for(const language of ["en","fr"]){
  assert.equal(snapshot[language].ready,true,JSON.stringify(snapshot[language]));
  assert.deepEqual(snapshot[language].counts,
   {COLLECT_SET:2,SECRET_SET:2,POSTCOMMUNION_SET:2});
 }
 // The original 2026 phone test stopped at preflight/prepare. The user
 // actually follows the NATIVE 65-card reader: prove BOTH real prayers
 // survive source composition and are physically rendered on Postcommunion.
 const liveProof=await page.evaluate(async()=>{
  const expected=(await globalThis.AO_R17_BROWSER_ENTRY.prepare())
   ?.session?.resolvedMass?.proper;
  const donor=expected?.data??expected;
  await globalThis.AO_R17_BROWSER_ENTRY.enter();
  const preview=globalThis.AO_R17_NATIVE_READER_PREVIEW;
  if(!preview?.showSection)throw Error("NATIVE_MASS_READER_NOT_MOUNTED");
  const links=[...document.querySelectorAll(
   "#ao-r17-native-reader-preview [data-reader-section]")];
  const candidates=links.filter(x=>/postcommun/i.test(x.textContent??""));
  const summaries=[];
  for(const link of candidates){
   const id=link.getAttribute("data-reader-section");
   const card=preview.showSection(id);
   if(!card)continue;
   const owned=(card.blocks??[]).some(x=>x.blockId==="AO.SM.B088");
   if(!owned)continue;
   const shell=document.querySelector("#ao-r17-native-reader-preview");
   const renderedText=shell?.querySelector(".ao-prayer-card")?.innerText??"";
   summaries.push({
    id,sourceSection:card.sourceSectionId??card.sectionId,
    labels:[...shell.querySelectorAll(".ao-reader-paragraph")].map(
     x=>x.getAttribute("data-oration-group-index")),
    rows:(card.paragraphs??[]).map(x=>({
     group:x.orationGroupIndex,role:x.prayerRole,
     primary:x.primary,alternate:x.alternate,sourcePath:x.sourcePath
    })),
    renderedText,
    countNotice:shell?.querySelector(".ao-verified-oration-count")?.innerText??null
   });
  }
  return {
   candidates:candidates.length,
   summaries,
   source:(donor?.postcommunions??[]).map(x=>({en:x.en,fr:x.fr,lat:x.lat})),
   mode:document.querySelector("#ao-r17-native-reader-preview [data-ao-reader-shell]")
    ?.getAttribute("data-mode")
  };
 });
 assert.equal(liveProof.mode,"LIVE","Native LIVE reader not mounted");
 assert.equal(liveProof.summaries.length,1,
  "Expected exactly one source-owned Postcommunion card: "+JSON.stringify(liveProof));
 const displayed=liveProof.summaries[0];
 console.log("NOV07_POSTCOMMUNION_RENDER_DEBUG "+JSON.stringify({
  source:liveProof.source.map(x=>({en:String(x.en).slice(0,95),lat:String(x.lat).slice(0,75)})),
  candidates:liveProof.candidates,
  cards:liveProof.summaries.map(x=>({
    id:x.id,sourceSection:x.sourceSection,
    rows:x.rows.map(y=>({group:y.group,role:y.role,primary:String(y.primary??"").slice(0,100),
      sourcePath:y.sourcePath})),
    notice:x.countNotice,
    rendered:String(x.renderedText).slice(0,500),
  }))
 }));
 assert.deepEqual([...new Set(displayed.rows.map(x=>x.group).filter(Number.isInteger))],
  [1,2],"Postcommunion card omitted a source-owned prayer group");
 for(const prayer of liveProof.source){
  const languageText=prayer.en;
  assert.ok(displayed.rows.some(x=>x.primary?.includes(languageText.slice(0,65))),
    "Postcommunion not in final prayer card: "+languageText.slice(0,65));
  assert.ok(displayed.renderedText.includes(languageText.slice(0,65)),
    "Postcommunion source not visibly rendered: "+languageText.slice(0,65));
 }
 assert.match(displayed.countNotice??"",/Two Postcommunions.*Prayer for the Pope/,
  "The reader does not indicate that a second Postcommunion is below");
 assert.match(displayed.renderedText,/Second Postcommunion.*Prayer for the Pope/,
  "The additional Postcommunion lacks its distinct source-owned label");
 assert.ok(displayed.renderedText.length>120,
  "Native Postcommunion card renders no visible prayers");
 // The user-facing NEXT control is not allowed to skip an unseen second
 // Postcommunion just because both paragraphs technically exist in DOM.
 // Test the real navigation from an untouched 390px prayer card.
 const beforeNext=await page.evaluate(()=>{
  const root=document.querySelector("#ao-r17-native-reader-preview");
  const card=root.querySelector(".ao-prayer-card");
  const second=card.querySelector('[data-oration-group-index="2"]');
  const rect=card.getBoundingClientRect(),next=second.getBoundingClientRect();
  return {id:globalThis.AO_R17_NATIVE_READER_PREVIEW.getCurrentCard()?.sectionId,
   scrollTop:card.scrollTop,secondTop:next.top,viewportTop:rect.top,
   viewportHeight:rect.height};
 });
 assert.ok(beforeNext.secondTop>beforeNext.viewportTop+
  Math.min(beforeNext.viewportHeight*.5,280),
  "The 390px first Postcommunion must put its second oration below reading position");
 const nextArrow=page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']");
 await nextArrow.click();
 const afterReveal=await page.evaluate(()=>{
  const root=document.querySelector("#ao-r17-native-reader-preview");
  const card=root.querySelector(".ao-prayer-card");
  const second=card.querySelector('[data-oration-group-index="2"]');
  const rect=card.getBoundingClientRect(),next=second.getBoundingClientRect();
  return {id:globalThis.AO_R17_NATIVE_READER_PREVIEW.getCurrentCard()?.sectionId,
   scrollTop:card.scrollTop,secondTop:next.top,viewportTop:rect.top,
   viewportHeight:rect.height,
   route:root.dataset.aoNextOration};
 });
 assert.equal(afterReveal.id,beforeNext.id,
  "NEXT skipped the second Postcommunion and left the canonical card");
 assert.equal(afterReveal.route,"SECOND_PRAYER_REVEALED");
 assert.ok(afterReveal.scrollTop>beforeNext.scrollTop+8,
  "NEXT did not scroll to the second Postcommunion");
 console.log("ICRSP_NEXT_REVEAL_DEBUG "+JSON.stringify({beforeNext,afterReveal}));
 assert.ok(afterReveal.secondTop<=afterReveal.viewportTop+
  Math.min(afterReveal.viewportHeight*.5,280)+8,
  "Second Postcommunion not revealed in the visible reading zone");
 await nextArrow.click();
 const afterAdvance=await page.evaluate(()=>
  globalThis.AO_R17_NATIVE_READER_PREVIEW.getCurrentCard()?.sectionId);
 assert.notEqual(afterAdvance,beforeNext.id,
  "NEXT must advance after the second Postcommunion is brought into view");
 console.log("ICRSP_NOV07_REAL_NEXT_POSTCOMMUNION_PASS "+JSON.stringify({
  beforeNext,afterReveal,afterAdvance
 }));
 // The shared NEXT interception must also protect the two other source
 // prayer groups. Exercise the actual phone control instead of assuming the
 // Postcommunion success covers the Collect and Secret rendering paths.
 for(const kind of ["Collect","Secret"]){
  const before=await page.evaluate(kind=>{
   const root=document.querySelector("#ao-r17-native-reader-preview");
   const preview=globalThis.AO_R17_NATIVE_READER_PREVIEW;
   const links=[...root.querySelectorAll("[data-reader-section]")]
    .filter(x=>new RegExp(kind,"i").test(x.textContent??""));
   for(const link of links){
    const card=preview.showSection(link.getAttribute("data-reader-section"));
    if(!card?.paragraphs?.some(p=>p.orationGroupIndex===2))continue;
    const scroll=root.querySelector(".ao-prayer-card");
    const first=scroll?.querySelector('.ao-reader-paragraph[data-oration-group-index="1"]');
    const second=scroll?.querySelector('.ao-reader-paragraph[data-oration-group-index="2"]');
    if(!first||!second)continue;
    const viewport=scroll.getBoundingClientRect(),prayer=second.getBoundingClientRect();
    return {id:card.sectionId,scrollTop:scroll.scrollTop,viewportTop:viewport.top,
     viewportHeight:viewport.height,secondTop:prayer.top,
     groups:[...new Set([...scroll.querySelectorAll(
      ".ao-reader-paragraph[data-oration-group-index]")].map(x=>
       Number(x.getAttribute("data-oration-group-index"))))].filter(Number.isInteger).sort(),
     renderedLength:scroll.innerText.length};
   }
   return null;
  },kind);
  assert.ok(before,kind+" source-owned second oration was not found in the LIVE reader");
  assert.deepEqual(before.groups,[1,2],kind+" lost a prayer in the rendered card");
  assert.ok(before.renderedLength>100,kind+" card has no substantive prayers");
  const secondBelowReadingZone=before.secondTop>
   before.viewportTop+Math.min(before.viewportHeight*.5,280);
  await nextArrow.click();
  const after=await page.evaluate(()=>{
   const root=document.querySelector("#ao-r17-native-reader-preview");
   const scroll=root.querySelector(".ao-prayer-card");
   const second=scroll?.querySelector('.ao-reader-paragraph[data-oration-group-index="2"]');
   const viewport=scroll?.getBoundingClientRect(),prayer=second?.getBoundingClientRect();
   return {id:globalThis.AO_R17_NATIVE_READER_PREVIEW.getCurrentCard()?.sectionId,
    scrollTop:scroll?.scrollTop,viewportTop:viewport?.top,
    viewportHeight:viewport?.height,secondTop:prayer?.top};
  });
  if(secondBelowReadingZone){
   assert.equal(after.id,before.id,kind+" NEXT skipped the second source prayer");
   assert.ok(after.scrollTop>before.scrollTop+8,
    kind+" NEXT did not move to the second source prayer");
   assert.ok(after.secondTop<=after.viewportTop+
    Math.min(after.viewportHeight*.5,280)+8,
    kind+" second prayer was not brought into reading position");
   await nextArrow.click();
   const afterAdvance=await page.evaluate(()=>
    globalThis.AO_R17_NATIVE_READER_PREVIEW.getCurrentCard()?.sectionId);
   assert.notEqual(afterAdvance,before.id,
    kind+" NEXT failed to advance after revealing the second prayer");
  }else{
   assert.notEqual(after.id,before.id,
    kind+" NEXT should advance when its second prayer is already in reading position");
  }
  console.log("ICRSP_NOV07_"+kind.toUpperCase()+"_PHONE_NEXT_PASS "+
   JSON.stringify({before,after,secondBelowReadingZone}));
 }
 assert.deepEqual(errors,[],"Runtime errors");
 console.log("ICRSP_NOV07_LIVE_POSTCOMMUNIONS "+JSON.stringify({
  sourcePath:snapshot.sourcePath,groups:displayed.rows.map(x=>x.group),
  roles:displayed.rows.map(x=>x.role),renderedLength:displayed.renderedText.length
 }));
 console.log("ICRSP_NOV07_ADEAMUS_PHONE_PASS "+JSON.stringify(snapshot));
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
