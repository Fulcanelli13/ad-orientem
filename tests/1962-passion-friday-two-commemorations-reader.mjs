/**
 * Actual Chromium runtime: universal 1962 Friday in Passion Week.
 * Main Feria + Seven Sorrows + St John Damascene, the latter missing
 * from the historical display-day token inventory but fully original in
 * the pinned Sancti/03-27 Proper. No synthesized prayers or global calendar
 * modifications. The alternative SSPX I-class Our Lady of Compassion Mass
 * must not inherit the ordinary ferial commemorations.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".json":"application/json",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
 if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return}
 const data=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream"});res.end(data);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser,output;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:90000});
 output=await page.evaluate(async()=>{
  const date="2026-03-27",res=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
  const {recoverReaderProperOmissions}=await import("/src/mass/reader-proper-runtime-recovery.js");
  const {select1962PassionFridayCommemorationsForMassForm}=await import("/src/mass/1962-passion-friday-commemorations.js");
  const {select1962CommemorationsForMassForm}=await import("/src/mass/1962-commemoration-form-source.js");
  const {adaptV346ResolvedMass}=await import("/src/mass/host-adapter.js");
  const {massCalendarPreflightContext}=await import("/src/mass/calendar-preflight-context.js");
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  const diagnostics={requestedFiles:[],cacheHits:[],referencesResolved:[],
   languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],
   warnings:[],errors:[]};
  const p=res.proper.data,principalId=res.day.main.id;
  const recovered=await recoverReaderProperOmissions(p,{
   hostResolver:globalThis.AO_RUNTIME_V8.resolver.properResolver,
   principalCelebrationId:principalId,calendarDate:date,diagnostic:diagnostics
  });
  const legacy={date,canStart:true,calendarDay:{id:principalId,title:res.day.main.title},
   celebrationType:"CALENDAR",celebrationId:"mass_of_day",
   requestedCelebrationId:"mass_of_day",properSource:p.sourcePath,
   proper:recovered};
  const forms={};
  const statuses=["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"];
  const view=proper=>Object.fromEntries(["en","fr"].map(lang=>{
   const slots=properToReaderSlots(proper,{language:lang});
   return [lang,{ready:slots.ready,missing:slots.missing,
    threeOrations:Object.fromEntries(statuses.map(s=>[s,{
     status:slots.slots?.[s]?.status,
     reason:slots.slots?.[s]?.reason??null,
     paragraphs:slots.slots?.[s]?.data?.paragraphs?.length??0
    }]))}];
  }));
  for(const [form,legacyForm] of [["LOW","low"],["MISSA_CANTATA_SIMPLE","mc-simple"],["MISSA_CANTATA_INCENSE","sung"],["SOLEMN","solemn"]]){
   const selection=select1962PassionFridayCommemorationsForMassForm({
    proper:recovered,date,principalId,form
   });
   const native=select1962CommemorationsForMassForm({
    proper:recovered,calendarResolution:res,form
   });
   const adapted=adaptV346ResolvedMass(legacy,{
    form:legacyForm,proper:recovered,calendarResolution:res
   });
   const actual=adapted.proper?.data??null;
   const preflight=massCalendarPreflightContext(legacy,
    {resolution:res,selectedDate:date}, "en",{form});
   forms[form]={
    sourceDecision:selection.status,preflightDecision:native.status,
    actualSourcePath:actual?.sourcePath??null,
    actualSelectedForm:actual?.commemorationFormDecision?.form??null,
    actualApplied:actual?.appliedCommemorations?.length??null,
    actualOmitted:actual?.omittedCommemorations?.length??null,
    actualGroups:Object.fromEntries(["collects","secrets","postcommunions"].map(k=>[
     k, (actual?.[k]??[]).map(row=>({
      sourcePath:row.sourcePath??null,
      oneConclusionKind:row.oneConclusion?.kind??null,
      parts:row.oneConclusion?.parts??null,
      sourcePaths:row.oneConclusion?.sourcePaths??null,
      segmentLatin:row.oneConclusion?.segments?.lat?{
       principal:row.oneConclusion.segments.lat.principal.slice(0,100),
       additional:row.oneConclusion.segments.lat.additional.slice(0,100),
       conclusion:row.oneConclusion.segments.lat.conclusion.slice(0,80)
      }:null
     }))
    ])),
    reader:view(actual),
    preflight:{names:preflight.commemorations,readiness:preflight.commemorationOrations,
      applies:preflight.commemorationPrayerApplies}
   };
  }
  const alter=adaptV346ResolvedMass({
   ...legacy,celebrationId:"votive-other",
   requestedCelebrationId:"votive-other",celebrationType:"VOTIVE"
  },{form:"low",proper:recovered});
  const negative={
   altered:alter.proper?.data?.commemorationFormDecision?.status??null,
   sourceOriginalPreserved:p.calendarCommemorations.length===1&&
    res.day.commemorations.length===1,
   proof:recovered.verifiedPassionFridayCommemorations?{
    status:recovered.verifiedPassionFridayCommemorations.status,
    schema:recovered.verifiedPassionFridayCommemorations.schema,
    sources:recovered.verifiedPassionFridayCommemorations.observances.map(x=>x.path)
   }:null,
   warnings:diagnostics.warnings.slice(0,5)
  };
  return {schema:"ao-1962-passion-friday-two-original-commemorations-reader-v1",
   date,principalId,source:p.sourcePath,rawCalendarCommemorations:res.day.commemorations.map(x=>({
     id:x.id,path:x.path,rank:x.rank})),forms,negative,
   noNewTranslations:true,noGabcApprovals:true};
 });
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
await mkdir(resolve(root,"artifacts/mass"),{recursive:true});
await writeFile(resolve(root,"artifacts/mass/1962-passion-friday-two-commemorations-reader.json"),
 JSON.stringify(output,null,2)+"\n");
const id="tempora:Quad5-5Feria:3:v";
assert.equal(output.principalId,id);
assert.equal(output.source,"Tempora/Quad5-5Feria");
assert.equal(output.negative.sourceOriginalPreserved,true);
assert.equal(output.negative.proof?.status,"SOURCE_VERIFIED");
assert.deepEqual(output.negative.proof?.sources,
 ["Tempora/Quad5-5Feriac","Sancti/03-27"]);
assert.equal(output.negative.altered,null,
 "A chosen alternative/votive Mass inherited universal Passion Friday prayers");
for(const [form,obj] of Object.entries(output.forms)){
 const low=form==="LOW";
 assert.equal(obj.sourceDecision,"CERTIFIED",form+": source selection");
 assert.equal(obj.preflightDecision,"CERTIFIED",form+": native form source selection");
 assert.equal(obj.actualSourcePath,"Tempora/Quad5-5Feria");
 assert.equal(obj.actualSelectedForm,form);
 assert.equal(obj.actualApplied,low?2:0);
 assert.equal(obj.actualOmitted,low?0:2);
 for(const k of ["collects","secrets","postcommunions"]){
  assert.equal(obj.actualGroups[k].length,low?2:1,form+":"+k);
  if(low){
   const extra=obj.actualGroups[k][1];
   assert.equal(extra.oneConclusionKind,"MULTIPLE_COMMEMORATIONS");
   assert.deepEqual(extra.parts,["FIRST_COMMEMORATION","SECOND_COMMEMORATION"]);
   assert.ok(extra.segmentLatin?.principal&&extra.segmentLatin?.additional);
   assert.equal(extra.sourcePaths.length,2);
  }
 }
 for(const language of ["en","fr"]){
  assert.equal(obj.reader[language].ready,true,form+":"+language+":"+
   JSON.stringify(obj.reader[language].missing));
  for(const slot of ["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"])
   assert.equal(obj.reader[language].threeOrations[slot].status,"READY",
    form+":"+language+":"+slot);
 }
 assert.equal(obj.preflight.names.length,2,form+" two original display names");
 assert.equal(obj.preflight.readiness.status,low?"COMPLETE":"NOT_APPLIED_TO_FORM",
  form+": Mass applicability disclaimer");
}
assert.equal(output.noGabcApprovals,true);
console.log("PASS 27 March universal 1962: two original Latin/EN/FR commemorations, under one conclusion Low; omitted Sung/Solemn; alternate SSPX never inherits");
