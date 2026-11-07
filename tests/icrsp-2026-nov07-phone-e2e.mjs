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
     latin:x.latin,vernacular:x.vernacular
    })),
    renderedText
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
    rows:x.rows.map(y=>({group:y.group,role:y.role,latin:String(y.latin??"").slice(0,100),
      vernacular:String(y.vernacular??"").slice(0,100)})),
    rendered:String(x.renderedText).slice(0,500),
  }))
 }));
 assert.deepEqual([...new Set(displayed.rows.map(x=>x.group).filter(Number.isInteger))],
  [1,2],"Postcommunion card omitted a source-owned prayer group");
 for(const prayer of liveProof.source){
  const languageText=prayer.en;
  assert.ok(displayed.rows.some(x=>x.vernacular?.includes(languageText.slice(0,65))),
    "Postcommunion not in final prayer card: "+languageText.slice(0,65));
 }
 assert.ok(displayed.renderedText.length>120,
  "Native Postcommunion card renders no visible prayers");
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
