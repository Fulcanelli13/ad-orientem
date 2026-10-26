// Live 2026 audit of 1962 Paschal Preface forms in the native source reader.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const body=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream",
    "cache-control":"no-store"});res.end(body);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message||e))}
});
const dates=[
 ["2026-04-04","VIGIL_NIGHT"],
 ["2026-04-05","OCTAVE_DAY"],
 ["2026-04-06","OCTAVE_DAY"],
 ["2026-04-07","OCTAVE_DAY"],
 ["2026-04-08","OCTAVE_DAY"],
 ["2026-04-09","OCTAVE_DAY"],
 ["2026-04-10","OCTAVE_DAY"],
 ["2026-04-11","OCTAVE_DAY"],
 ["2026-04-12","EASTERTIDE"],
 ["2026-04-19","EASTERTIDE"],
 ["2026-04-26","EASTERTIDE"],
 ["2026-05-03","EASTERTIDE"],
 ["2026-05-10","EASTERTIDE"],
 ["2026-05-13","EASTERTIDE"]
];
assert.equal(dates.length,14);
await new Promise(done=>server.listen(0,"127.0.0.1",done));
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.AO_BROWSER_BIN||undefined});
 const page=await browser.newPage({serviceWorkers:"block"});
 page.setDefaultTimeout(90000);
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
  null,{timeout:90000});
 const sourceDiagnostic=await page.evaluate(async()=>{
   const resolver=globalThis.AO_RUNTIME_V8.resolver.properResolver;
   const {render1962EasterPrefaceVariant}=await import("/src/mass/1962-easter-preface-form.js");
   const out={};
   for(const lang of ["la","en","fr"]){
     try{
       const diagnostic={requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],warnings:[],errors:[]};
       const parsed=await resolver.resolveSource("Ordo/Prefationes",lang,diagnostic);
       const lines=parsed?.map?.get?.("Pasch")??[];
       const simplified=lines.map(line=>String(line).trim().replace(/^!\s*/,"")
         .replace(/^[Vv]\.\s*/,"℣. ")).join("\n");
       out[lang]={rawLines:lines.slice(0,15),sourceStart:simplified.slice(0,400),
         nightly:render1962EasterPrefaceVariant(simplified,lang,"VIGIL_NIGHT")?.slice(0,120)??null,
         daily:render1962EasterPrefaceVariant(simplified,lang,"OCTAVE_DAY")?.slice(0,120)??null,
         season:render1962EasterPrefaceVariant(simplified,lang,"EASTERTIDE")?.slice(0,120)??null};
     }catch(e){out[lang]={error:String(e)}}
   }
   return out;
 });
 console.log("EASTER_PASCH_SOURCE_DIAGNOSTIC="+JSON.stringify(sourceDiagnostic));
 const rows=await page.evaluate(async cases=>{
  const dayResolver=globalThis.AO_RUNTIME_V8.resolver;
  const {recoverReaderProperOmissions,authenticated1962PrefaceRecoveryOwner}=
    await import("/src/mass/reader-proper-runtime-recovery.js");
  const {inspect1962PrefaceSelection}=
    await import("/src/mass/1962-preface-decision.js");
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  const {adaptV346ResolvedMass}=await import("/src/mass/host-adapter.js");
  const results=[];
  for(const [date,expectedVariant] of cases){
   try{
    const d=await dayResolver.resolveDay(date);
    const original=d?.proper?.data;
    const id=d?.day?.main?.id;
    const originalLatin=String(original?.preface?.lat??original?.preface?.la??"");
    const owner=authenticated1962PrefaceRecoveryOwner(id,original?.sourcePath);
    const before=inspect1962PrefaceSelection({principalCelebrationId:id,
      selectedPreface:original?.preface});
    const corrected=await recoverReaderProperOmissions(original,{
      hostResolver:dayResolver.properResolver,principalCelebrationId:id});
    const after=inspect1962PrefaceSelection({principalCelebrationId:id,
      selectedPreface:corrected?.preface});
    const originalSlot=properToReaderSlots({...original,principalCelebrationId:id},
      {language:"fr"}).slots.PREFACE;
    const slot=properToReaderSlots({...corrected,principalCelebrationId:id},
      {language:"fr"}).slots.PREFACE;
    // Exercise the real host-to-native reader adapter rather than passing
    // the principal ID manually to a standalone slot test.
    const legacy={
      canStart:true,date,calendarDay:{id,title:d?.day?.main?.title??null},
      celebrationId:"mass_of_day",requestedCelebrationId:"mass_of_day",
      celebrationType:"CALENDAR",properSource:original.sourcePath,
      ...(date==="2026-04-04"?{exceptionalProfile:"easter-vigil-1962"}:{})
    };
    const rawReaderMass=adaptV346ResolvedMass(legacy,{form:"low",proper:original});
    const resolvedReaderMass=adaptV346ResolvedMass(legacy,{form:"low",proper:corrected});
    const adapterRawSlot=properToReaderSlots(rawReaderMass.proper.data,{language:"fr"}).slots.PREFACE;
    const adapterSelectedSlot=properToReaderSlots(resolvedReaderMass.proper.data,{language:"fr"}).slots.PREFACE;
    const latin=String(corrected?.preface?.lat??corrected?.preface?.la??"");
    const french=String(corrected?.preface?.fr??"");
    const english=String(corrected?.preface?.en??"");
    results.push({date,id,expectedVariant,sourcePath:original?.sourcePath??null,
      originalHead:originalLatin.split("\n")[0],originalStatus:before.status,
      afterHead:latin.split("\n")[0],afterStatus:after.status,
      ownerSection:owner?.section??null,ownerVariant:owner?.variant??null,
      appliedVariant:corrected?.preface?.prefaceVariant??null,
      source:corrected?.preface?.sourcePath??null,
      latin,fr:french,en:english,
      originalSlot:originalSlot.status,slot:slot.status,
      adaptedPrincipalId:resolvedReaderMass.proper.data.principalCelebrationId??null,
      adapterRawSlot:adapterRawSlot.status,adapterSelectedSlot:adapterSelectedSlot.status,
      adaptedDistinctRite:resolvedReaderMass.distinctRite??null,
      originalUnchanged:String(original?.preface?.lat??original?.preface?.la??"")===originalLatin
    });
   }catch(error){results.push({date,expectedVariant,error:String(error?.stack??error)})}
  }
  return results;
 },dates);
 const patterns={
  VIGIL_NIGHT:/sed in hac potíssimum nocte/iu,
  OCTAVE_DAY:/sed in hac potíssimum die/iu,
  EASTERTIDE:/sed in hoc potíssimum/iu
 };
 console.log("MASS_1962_EASTER_PREFACE_TRIAGE="+JSON.stringify(rows.map(x=>({
  date:x.date,id:x.id,source:x.sourcePath,from:x.originalHead,to:x.afterHead,
  before:x.originalStatus,after:x.afterStatus,variant:x.appliedVariant,
  slot:x.slot,error:x.error}))));
 for(const row of rows){
  assert.ok(!row.error,row.date+" "+row.error);
  assert.equal(row.ownerSection,"Pasch",row.date+" non-Paschal source");
  assert.equal(row.ownerVariant,row.expectedVariant,row.date);
  assert.equal(row.appliedVariant,row.expectedVariant,row.date);
  assert.equal(row.source,"Ordo/Prefationes",row.date);
  assert.equal(row.afterHead,"Paschalis",row.date);
  assert.equal(row.afterStatus,"MATCH",row.date);
  assert.equal(row.originalSlot,"MISSING",row.date+" invalid original source should be blocked");
  assert.equal(row.adaptedPrincipalId,row.id,row.date+" actual reader handoff dropped Mass owner");
  assert.equal(row.adapterRawSlot,"MISSING",row.date+" actual reader accepted unselected Preface");
  assert.equal(row.adapterSelectedSlot,"READY",row.date+" actual reader rejected selected source Preface");
  assert.equal(row.slot,"READY",row.date);
  assert.equal(row.originalUnchanged,true,row.date+" mutated original Proper");
  assert.ok(row.en.length>350&&row.fr.length>350,row.date+" incomplete translation");
  assert.match(row.latin,patterns[row.expectedVariant],row.date);
  assert.equal((row.latin.match(/potíssimum/gu)||[]).length,1,row.date);
  assert.doesNotMatch(row.latin,/(?:sed tempore Passionis|sed octava Paschæ)/iu,row.date);
  assert.doesNotMatch(row.en,/(?:sed tempore Passionis|sed octava Paschæ)/iu,row.date);
  assert.doesNotMatch(row.fr,/(?:Messe de la Vigile pascale|pendant l’octave de Pâques|après l’octave de Pâques)/iu,row.date);
 }
 assert.equal(rows.filter(x=>x.appliedVariant==="VIGIL_NIGHT").length,1);
 assert.equal(rows.filter(x=>x.appliedVariant==="OCTAVE_DAY").length,7);
 assert.equal(rows.filter(x=>x.appliedVariant==="EASTERTIDE").length,6);
 // Render the repaired SOURCE PROPER through the same native presentation
 // used by the production Mass. This is not a unit projection or fabricated
 // 48-card surrogate: the real R17 UI must visibly show the selected text.
 // The 12 April (Dominica in albis) source is independently incomplete:
 // the production Secret has a self-referential source row. Explicitly
 // retain the native reader's rejection rather than patching it with
 // another day's Secret merely to pass a Preface presentation smoke test.
 const inAlbis=await page.evaluate(async()=>{
   const resolver=globalThis.AO_RUNTIME_V8.resolver;
   const {recoverReaderProperOmissions}=await import("/src/mass/reader-proper-runtime-recovery.js");
   const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
   const {hasExact1962InAlbisSecretSourceOwner}=await import("/src/mass/1962-in-albis-secret-source.js");
   const d=await resolver.resolveDay("2026-04-12"),id=d.day.main.id;
   const original=d.proper.data;
   const raw=properToReaderSlots({...original,principalCelebrationId:id},{language:"fr"});
   const p=await recoverReaderProperOmissions(original,{
     hostResolver:resolver.properResolver,principalCelebrationId:id
   });
   const corrected=properToReaderSlots({...p,principalCelebrationId:id},{language:"fr"});
   return {
     id,source:p.sourcePath,rawSecret:raw.slots.SECRET_SET.status,
     sourceOwnerEligible:hasExact1962InAlbisSecretSourceOwner(original,id),
     rawShape:{
       path:original.sourcePath,
       requestedCelebrationId:original.requestedCelebrationId??null,
       principalCelebrationId:original.principalCelebrationId??null,
       riteProfile:original.riteProfile??original.profile??null,
       calendarCommemorations:(original.calendarCommemorations??[]).map(x=>({
         path:x.path??null,inseparable:x.inseparable??null})),
       appliedCommemorations:(original.appliedCommemorations??[]).map(x=>({
         path:x.path??null,inseparable:x.inseparable??null})),
       sourceSecret:(original.secrets??[]).map(x=>({
         latin:String(x?.lat??x?.la??"").slice(0,115),
         english:String(x?.en??"").slice(0,115),
         french:String(x?.fr??"").slice(0,115),
         sourcePath:x?.sourcePath??null,oneConclusion:Boolean(x?.oneConclusion)
       })),
       singularSecret:original.secret?{
         lat:String(original.secret.lat??original.secret.la??"").slice(0,100),
         fr:String(original.secret.fr??"").slice(0,100)}:null
     },
     secret:corrected.slots.SECRET_SET.status,
     collect:corrected.slots.COLLECT_SET.status,
     postcommunion:corrected.slots.POSTCOMMUNION_SET.status,
     preface:corrected.slots.PREFACE.status,
     secretText:corrected.slots.SECRET_SET.data?.paragraphs?.[0]?.vernacular??null,
     sourceEvidence:p.secrets?.[0]?.sourceEvidence??null,
     untouched:String(original.secrets?.[0]?.fr??"")===
       String(d.proper.data.secrets?.[0]?.fr??"")
   };
 });
 console.log("MASS_1962_IN_ALBIS_SECRET_RECOVERED="+JSON.stringify(inAlbis));
 assert.equal(inAlbis.id,"tempora:Pasc1-0:1:w");
 assert.equal(inAlbis.rawSecret,"MISSING","Known donor self-reference must never be treated as Secret text");
 assert.equal(inAlbis.secret,"READY","Authenticated source must recover named 12 April Secret");
 assert.equal(inAlbis.preface,"READY");
 assert.equal(inAlbis.collect,"READY");
 assert.equal(inAlbis.postcommunion,"READY");
 assert.ok(inAlbis.secretText?.startsWith("Accueillez, Seigneur"));
 assert.equal(inAlbis.sourceEvidence?.schema,"AO_IN_ALBIS_1962_SECRET_SOURCE_V1");
 assert.equal(inAlbis.untouched,true);
 const rendered=await page.evaluate(async()=>{
   const dayResolver=globalThis.AO_RUNTIME_V8.resolver;
   const {recoverReaderProperOmissions}=await import("/src/mass/reader-proper-runtime-recovery.js");
   const {prepareMassSessionFromV346}=await import("/src/mass/host-adapter.js");
   const {mountR17Preview}=await import("/src/mass/browser-entry.js");
   const results=[];
   for(const [date,variant,mode] of [
     ["2026-04-05","OCTAVE_DAY","MISSAL"],
     ["2026-04-12","EASTERTIDE","MISSAL"],
     ["2026-04-12","EASTERTIDE","LIVE"],
     ["2026-05-10","EASTERTIDE","LIVE"],
     ["2026-05-10","EASTERTIDE","SIMPLE"]
   ]){
     let mounted=null;
     try{
       const day=await dayResolver.resolveDay(date);
       const id=day.day.main.id;
       const recovered=await recoverReaderProperOmissions(day.proper.data,{
         hostResolver:dayResolver.properResolver,principalCelebrationId:id
       });
       const legacy={date,canStart:true,calendarDay:{id,title:day.day.main.title},
         celebrationId:"mass_of_day",requestedCelebrationId:"mass_of_day",
         celebrationType:"CALENDAR",properSource:recovered.sourcePath};
       const session=prepareMassSessionFromV346(legacy,{
         form:"low",presentationMode:mode,proper:recovered
       });
       const prepared={schema:"ao-mass-entry-prepared-v1",session,
         readerPreferences:{mode,language:"fr",secondConfiteor:false,
           postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962",localPostures:{}}};
       mounted=await mountR17Preview({doc:document,prepared});
       const preview=mounted.preview;
       const original=preview.model?.properSlots?.slots?.PREFACE;
       const cards=preview.model?.cards??[];
       const card=cards.find(c=>JSON.stringify(c.paragraphs??[]).includes("le Christ, notre pâque"))||
         cards.find(c=>/pr[ée]face/i.test(String(c.title??"")));
       if(card)preview.showSection(card.sectionId);
       await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
       const root=preview.root;
       const visible=(root?.querySelector(".ao-prayer-card")?.innerText??root?.innerText??"");
       let inAlbisSecret=null;
       if(date==="2026-04-12"){
         const secretCard=cards.find(c=>JSON.stringify(c.paragraphs??[])
           .includes("Accueillez, Seigneur"));
         if(secretCard)preview.showSection(secretCard.sectionId);
         await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
         const renderedSecret=(root?.querySelector(".ao-prayer-card")?.innerText??root?.innerText??"");
         inAlbisSecret={sectionId:secretCard?.sectionId??null,
           hasFrench:renderedSecret.includes("Accueillez, Seigneur"),
           textBeforeConclusion:renderedSecret.indexOf("Accueillez, Seigneur")<
             renderedSecret.indexOf("Par Notre-Seigneur Jésus-Christ"),
           hasAuthenticBody:renderedSecret.includes("bonheur sans fin"),
           sample:renderedSecret.slice(0,340)};
       }
       results.push({date,mode,id,variant,modelCount:cards.length,inAlbisSecret,
         slotStatus:original?.status??null,cardSection:card?.sectionId??null,
         renderedPhrase:visible.includes("en ce jour")?"OCTAVE_DAY":
           visible.includes("en ce temps")?"EASTERTIDE":
           visible.includes("en cette nuit")?"VIGIL_NIGHT":null,
         hasFrench:visible.includes("le Christ, notre pâque"),
         hasComposite:/sed tempore Passionis|sed octava Paschæ|à la Messe de la Vigile pascale/.test(visible),
         sample:visible.slice(0,450),
         shellMounted:Boolean(root?.isConnected)});
     }catch(err){results.push({date,mode,variant,error:String(err?.stack??err)})}
     finally{try{mounted?.preview?.destroy?.()}catch{}}
   }
   return results;
 });
 console.log("MASS_1962_EASTER_PREFACE_NATIVE_DOM="+JSON.stringify(rendered));
 for(const item of rendered){
   assert.ok(!item.error,item.date+" "+item.error);
   assert.equal(item.slotStatus,"READY",item.date+" native reader lost source-ready Preface");
   assert.ok(item.modelCount>=30,item.date+" source reader did not build canonical cards");
   assert.ok(item.cardSection,item.date+" native reader Preface card absent");
   assert.equal(item.shellMounted,true,item.date+" native reader never mounted");
   assert.equal(item.renderedPhrase,item.variant,item.date+" wrong seasonal phrase in rendered Preface");
   assert.equal(item.hasFrench,true,item.date+" trilingual source lost in rendered reader");
   assert.equal(item.hasComposite,false,item.date+" unresolved seasonal alternatives visible");
   if(item.date==="2026-04-12"){
     assert.ok(item.inAlbisSecret?.sectionId,"In Albis native Secret card missing");
     assert.equal(item.inAlbisSecret.hasFrench,true,"In Albis Secret not rendered in native LIVE");
     assert.equal(item.inAlbisSecret.hasAuthenticBody,true,"In Albis Secret source body missing");
     assert.equal(item.inAlbisSecret.textBeforeConclusion,true,
       "In Albis Secret conclusion displayed before its prayer");
   }
 }
 console.log("PASS native R17 rendered Preface in MISSAL, LIVE, SIMPLE on real 2026 Masses.");
 console.log("PASS 14 real 1962 Easter Preface source identities and trilingual variants: 1 Vigil, 7 octave, 6 later.");
}finally{await browser?.close();await new Promise(done=>server.close(done))}
