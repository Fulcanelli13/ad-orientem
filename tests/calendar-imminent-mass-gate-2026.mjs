// Actual production host Calendar -> Mass source -> native R17 gate
// for the coming 1962 feasts. Do not infer the Requiem rules from colour.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".woff2":"font/woff2",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  const body=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(body);
 }catch(err){res.writeHead(err?.code==="ENOENT"?404:500);res.end(String(err?.message||err));}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native",
   {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>Boolean(
   globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.revealDate&&
   globalThis.AO_CELEBRATION_API?.getResolvedMass),null,{timeout:90000});
 for(const witness of [
  {date:"2026-10-28",id:"sancti:10-28:2:r",path:"Sancti/10-28",colour:"Red"},
  {date:"2026-11-01",id:"sancti:11-01:1:w",path:"Sancti/11-01",colour:"White"},
  {date:"2026-11-02",id:"sancti:11-02m1:1:b",path:"Sancti/11-02m1",colour:"Black"}
 ]){
  const moved=await page.evaluate(async date=>
    globalThis.AO_CALENDAR_WEEK_CACHE_V4345.revealDate(date,{forceLoader:false,prefetch:false}),witness.date);
  assert.equal(moved,true,witness.date+" selected Calendar failed");
  await page.waitForFunction(date=>{
   const s=globalThis.AO_RUNTIME_V8?.store?.getState?.();
   return s?.selectedDate===date&&s?.resolution?.date===date&&!s?.resolving&&
     globalThis.AO_CELEBRATION_API?.getResolvedMass?.()?.date===date;
  },witness.date,{timeout:45000});
  const result=await page.evaluate(async()=>{
   const legacy=globalThis.AO_CELEBRATION_API.getResolvedMass();
   const resolution=globalThis.AO_RUNTIME_V8.store.getState().resolution;
   const {adaptV346ResolvedMass}=await import("/src/mass/host-adapter.js");
   const {compileMassPlan}=await import("/src/mass/session-engine.js");
   const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
   const {select1962CommemorationsForMassForm}=await import("/src/mass/1962-commemoration-form-source.js");
   const bridge=globalThis.AO_SEQUENCE_BRIDGE_V23??globalThis.AO_SEQUENCE_BRIDGE_V22;
   const assembly=bridge?.getAssemblyStatus?.();
   // Reproduce browser-entry deriveHostOptions: assembly source has priority,
   // then legacy. A direct resolver source is the recovery witness if the
   // assembly has not yet populated its independent Proper slot.
   const inputProper=assembly?.proper??legacy?.proper??resolution?.proper??null;
   const source=inputProper?.data??inputProper;
   if(!source)throw Error("REAL_2026_MASS_PROPER_UNAVAILABLE");
   const selected=select1962CommemorationsForMassForm({
     proper:inputProper,calendarResolution:resolution,form:"SOLEMN"});
   const prepared=adaptV346ResolvedMass(legacy,{
     form:"solemn",presentationMode:"MISSAL",proper:selected.proper,
     calendarResolution:resolution});
   const plan=compileMassPlan(prepared);
   const p=prepared.proper?.data??prepared.proper;
   const slots={};
   for(const language of ["en","fr"]){
     const out=properToReaderSlots(p,{language});
     slots[language]={preface:out.slots.PREFACE.status,
       prefaceText:out.slots.PREFACE.data?.paragraphs?.[0]?.latin?.slice(0,110)??null,
       collects:out.slots.COLLECT_SET.data?.paragraphs?.length??null};
   }
   return {
     date:resolution?.date,id:resolution?.day?.main?.id,
     path:source?.sourcePath,colour:resolution?.colourPlan?.massColor??source?.color??null,
     legacyType:legacy?.celebrationType,legacyId:legacy?.celebrationId,
     legacyRequestedId:legacy?.requestedCelebrationId,legacyCalendarId:legacy?.calendarDay?.id,
     legacyProperSource:legacy?.properSource,
     adaptedProperPath:p?.sourcePath,
     adaptedCalendarId:prepared?.calendarCelebration?.id,
     legacyStatus:legacy?.canStart,sourceStatus:inputProper?.status??"ready",
     sourceFromAssembly:Boolean(assembly?.proper),
     sourceFromLegacy:Boolean(legacy?.proper),
     sourceFromResolution:Boolean(resolution?.proper),
     selectedStatus:selected?.status,selectedReason:selected?.reason,
     sourcePreface:String(source?.preface?.lat??source?.preface?.la??"").slice(0,140),
     sourceLanguages:["la","en","fr"].map(lang=>
       String(lang==="la"?(source?.preface?.lat??source?.preface?.la??""):
         source?.preface?.[lang]??"").length),
     nativeOverlays:prepared?.overlays??[],
     plan:{blessingAllowed:plan.blessingAllowed,
       dismissal:plan.dismissal,normalLastGospel:plan.normalLastGospel},
     slots,commemorations:(source?.calendarCommemorations??[]).map(x=>x.path),
     selectedCounts:["collects","secrets","postcommunions"].map(k=>p?.[k]?.length??0)
   };
  });
  console.log("IMMINENT_1962_MASS_GATE="+JSON.stringify(result));
  assert.equal(result.date,witness.date);
  assert.equal(result.id,witness.id,witness.date+" wrong actual Mass owner");
  assert.equal(result.path,witness.path,witness.date+" wrong selected Proper source");
  assert.equal(result.colour,witness.colour,witness.date+" wrong Mass colour");
  assert.equal(result.legacyStatus,true,witness.date+" host cannot start Mass");
  assert.ok(["ready","READY"].includes(result.sourceStatus),witness.date+" selected Proper not ready");
  for(const lang of ["en","fr"])
    assert.equal(result.slots[lang].preface,"READY",
      witness.date+"/"+lang+" selected reader Preface not READY");
  if(witness.date==="2026-11-01"){
   assert.equal(result.selectedStatus,"CERTIFIED",
     "All Saints displaced Sunday oration source lacks form classification");
   assert.ok(result.commemorations.includes("Tempora/Pent23-0"),
     "1 November must retain displaced Sunday commemoration");
   assert.deepEqual(result.selectedCounts,[2,2,2],
     "All Saints solemn Mass must have principal + privileged Sunday orations");
  }
  if(witness.date==="2026-11-02"){
   assert.ok(result.nativeOverlays.includes("REQUIEM"),
     "All Souls Mass of day did not activate Requiem rule overlay");
   assert.equal(result.plan.blessingAllowed,false,
     "All Souls wrongly offers ordinary final blessing");
   assert.equal(result.plan.dismissal,"REQUIESCANT_IN_PACE",
     "All Souls wrongly offers Ite missa est");
   assert.equal(result.plan.normalLastGospel,true,
     "Requiem without a selected Absolution must retain the Last Gospel");
   assert.match(result.slots.fr.prefaceText||"",/^Defunctorum\b/i,
     "All Souls did not select the proper Latin Preface of the Dead");
  }
 }
 // The existing production Calendar engine already resolves and labels all
 // three 1962 All Souls formularies. Test each *original* donor, not a
 // reconstruction of Masses II–III from the first Mass's text.
 const variants=await page.evaluate(async()=>{
   const resolver=globalThis.AO_RUNTIME_V8?.resolver;
   const host=globalThis.AO_CELEBRATION_API?.getResolvedMass?.();
   const {adaptV346ResolvedMass}=await import("/src/mass/host-adapter.js");
   const {compileMassPlan}=await import("/src/mass/session-engine.js");
   const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
   const rows=[];
   try{
     for(let index=0;index<3;index++){
       const resolved=await resolver.resolveDay("2026-11-02",{formularyIndex:index});
       const proper=resolved?.proper?.data;
       const selectedPath=proper?.sourcePath??null;
       const legacy={...host,date:"2026-11-02",
         calendarDay:resolved?.day?.main,
         celebrationId:"mass_of_day",requestedCelebrationId:"mass_of_day",
         celebrationType:"CALENDAR",properSource:selectedPath,canStart:true};
       const prepared=adaptV346ResolvedMass(legacy,{
         form:"solemn",presentationMode:"MISSAL",proper:resolved?.proper,
         calendarResolution:resolved});
       const plan=compileMassPlan(prepared);
       const selected=prepared?.proper?.data??prepared?.proper;
       const languages={};
       for(const language of ["en","fr"]){
         const slots=properToReaderSlots(selected,{language}).slots;
         languages[language]={
           preface:slots.PREFACE.status,
           heading:slots.PREFACE.data?.paragraphs?.[0]?.latin?.slice(0,70)??null,
           collect:slots.COLLECT_SET.status,
           epistle:slots.EPISTLE_OR_LESSON.status,
           gospel:slots.GOSPEL.status,
           postcommunion:slots.POSTCOMMUNION_SET.status
         };
       }
       rows.push({index,date:resolved?.date,status:resolved?.status,
         principalId:resolved?.day?.main?.id,selectedPath,
         selectedMassOption:resolved?.day?.selectedMassOption?.path,
         availableOptions:resolved?.day?.massOptions?.map(x=>({id:x.id,path:x.path,label:x.label})),
         overlays:prepared.overlays,
         plan:{blessingAllowed:plan.blessingAllowed,dismissal:plan.dismissal,
           normalLastGospel:plan.normalLastGospel},
         languages,
         firstCollectLatin:String(proper?.collects?.[0]?.lat??
           proper?.collects?.[0]?.la??"").slice(0,90)});
     }
   }finally{await resolver.resolveDay("2026-11-02",{formularyIndex:0});}
   return rows;
 });
 for(let index=0;index<3;index++){
   const item=variants[index],source="Sancti/11-02m"+(index+1);
   assert.equal(item.status,"ready","Mass "+(index+1)+" source failed");
   assert.equal(item.date,"2026-11-02");
   assert.equal(item.selectedPath,source,"Wrong Mass "+(index+1)+" original Proper");
   assert.equal(item.selectedMassOption,source,"Mass option not selected");
   assert.equal(item.principalId,"sancti:11-02m"+(index+1)+":1:b",
     "Wrong canonical principal Mass identity");
   assert.deepEqual(item.availableOptions.map(x=>x.path),
     ["Sancti/11-02m1","Sancti/11-02m2","Sancti/11-02m3"],
     "The three source-resolved Mass options are not present");
   assert.ok(item.overlays.includes("REQUIEM"),
     "Mass "+(index+1)+" lacks the required Requiem overlay");
   assert.equal(item.plan.blessingAllowed,false);
   assert.equal(item.plan.dismissal,"REQUIESCANT_IN_PACE");
   for(const language of ["en","fr"]){
     for(const slot of ["preface","collect","epistle","gospel","postcommunion"])
       assert.equal(item.languages[language][slot],"READY",
         "All Souls Mass "+(index+1)+" "+language+" "+slot+" not ready");
     assert.match(item.languages[language].heading||"",/^Defunctorum\b/i);
   }
 }
 console.log("ALL_SOULS_THREE_REAL_MASS_OPTIONS="+JSON.stringify(variants));
 // Inspect whether the original Home formulary buttons are currently
 // visible beneath the modular Home; do not infer UI accessibility merely
 // from existing source/runtime support.
 const selector=await page.evaluate(()=>[...document.querySelectorAll("[data-formulary]")]
   .map(node=>({index:node.dataset.formulary,title:node.textContent?.trim(),
     visible:Boolean(node.getClientRects().length)&&getComputedStyle(node).visibility!=="hidden"})));
 console.log("ALL_SOULS_HOME_FORMULARY_VISIBILITY="+JSON.stringify(selector));
 // Exercise the CURRENT modular Today screen, not only the old Home
 // rendering or the resolver's direct formularyIndex API. Selecting a
 // formulary must change the actual live Calendar day AND Mass host donor.
 const chooser=page.locator(".homeScreen.aoTodayV2 [data-formulary]");
 await chooser.first().waitFor({state:"visible",timeout:15000});
 assert.equal(await chooser.count(),3,
   "Modular Home must expose the three existing source-owned All Souls Mass buttons");
 for(const index of [1,2,0]){
   const source="Sancti/11-02m"+(index+1);
   await chooser.nth(index).click();
   await page.waitForFunction(path=>{
     const current=globalThis.AO_RUNTIME_V8?.store?.getState?.();
     const host=globalThis.AO_CELEBRATION_API?.getResolvedMass?.();
     return current?.selectedDate==="2026-11-02"&&
       current?.resolution?.date==="2026-11-02"&&!current?.resolving&&
       current?.resolution?.day?.selectedMassOption?.path===path&&
       current?.resolution?.proper?.data?.sourcePath===path&&
       host?.properSource===path;
   },source,{timeout:45000});
   const active=await page.evaluate(()=>({
     calendarPath:globalThis.AO_RUNTIME_V8.store.getState().resolution.day.main.path,
     hostPath:globalThis.AO_CELEBRATION_API.getResolvedMass().properSource,
     selected:globalThis.AO_RUNTIME_V8.store.getState().resolution.day.formularyIndex
   }));
   assert.equal(active.calendarPath,source);
   assert.equal(active.hostPath,source);
   assert.equal(active.selected,index);
   console.log("ALL_SOULS_CURRENT_HOME_SELECTION="+JSON.stringify({index,source,active}));
 }
 console.log("PASS three real imminent Roman-1962 Mass host/reader journeys");
}finally{
 await browser?.close();
 await new Promise(done=>server.close(done));
}
