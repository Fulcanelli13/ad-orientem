/**
 * Read-only 1962 oration source-owner diagnostic for the FIVE actual ordinary
 * Mass Reader cases left after source-attested 6 March recovery.
 * This is a targeted source/section query over five days, NOT an annual crawl
 * and NOT permission to compose, translate, or skip an oration.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const targets=Object.freeze([
 ["2026-03-27","Tempora/Quad5-5Feria"],
 ["2026-05-04","Sancti/05-04"],
 ["2026-10-08","Sancti/10-08"],
 ["2026-12-26","Sancti/12-26"],
 ["2026-12-28","Sancti/12-28"]
]);
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".woff2":"font/woff2",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const content=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream",
    "cache-control":"no-store"});
  res.end(content);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser,report;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 page.setDefaultTimeout(90000);
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
  null,{timeout:90000});
 report=await page.evaluate(async cases=>{
  const resolver=globalThis.AO_RUNTIME_V8.resolver;
  const {recoverReaderProperOmissions}=await import("/src/mass/reader-proper-runtime-recovery.js");
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  const {adaptV346ResolvedMass}=await import("/src/mass/host-adapter.js");
  const groups=[["collects","collect","Oratio"],["secrets","secret","Secreta"],
    ["postcommunions","postcommunion","Postcommunio"]];
  const labelRows=x=>({
   latin:Boolean(String(x?.lat??x?.la??"").trim()),
   english:Boolean(String(x?.en??"").trim()),
   french:Boolean(String(x?.fr??"").trim()),
   sourcePath:x?.sourcePath??null,
   oneConclusion:x?.oneConclusion?{status:x.oneConclusion.status,
    kind:x.oneConclusion.kind,sourcePaths:x.oneConclusion.sourcePaths}:null,
   leadingLatin:String(x?.lat??x?.la??"").slice(0,85),
   leadingEnglish:String(x?.en??"").slice(0,85),
   leadingFrench:String(x?.fr??"").slice(0,85)
  });
  const snap=(p,lang)=> {
   const projection=properToReaderSlots(p,{language:lang});
   return {ready:projection.ready,missing:projection.missing,
    sourceCorrections:(projection.sourceEditorialCorrections??[]).map(x=>({
     id:x.id,slot:x.slot??null,sourceSection:x.sourceSection??x.section??null,sourcePath:x.sourcePath})),
    orations:Object.fromEntries(groups.map(([plural,single,section])=>{
     const rows=Array.isArray(p?.[plural])&&p[plural].length?
       p[plural]:p?.[single]?[p[single]]:[];
     return [section,{count:rows.length,rows:rows.map(labelRows),
      slotStatus:projection.slots?.[
       section==="Oratio"?"COLLECT_SET":section==="Secreta"?"SECRET_SET":"POSTCOMMUNION_SET"]?.status,
      slotReason:projection.slots?.[
       section==="Oratio"?"COLLECT_SET":section==="Secreta"?"SECRET_SET":"POSTCOMMUNION_SET"]?.reason??null}];
    }))};
  };
  const results=[];
  for(const [date,wantedSourcePath] of cases){
   const d=await resolver.resolveDay(date);
   const p=d?.proper?.data,actualSource=p?.sourcePath??null;
   const principalId=d?.day?.main?.id??null;
   if(!p){results.push({date,wantedSourcePath,error:"PROPER_NOT_RESOLVED"});continue;}
   const diag={requestedFiles:[],cacheHits:[],referencesResolved:[],
    languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],
    warnings:[],errors:[]};
   const recovered=await recoverReaderProperOmissions(p,{
    hostResolver:resolver.properResolver,
    principalCelebrationId:principalId,calendarDate:date,diagnostic:diag
   });
   const request={canStart:true,date,calendarDay:{id:principalId,title:d.day?.main?.title},
    celebrationId:"mass_of_day",requestedCelebrationId:"mass_of_day",
    celebrationType:"CALENDAR",properSource:actualSource};
   const adapted=adaptV346ResolvedMass(request,{form:"low",proper:recovered});
   const rp=adapted.proper?.data??null;
   const comms=(p.calendarCommemorations??[]).map(x=>({
    path:x.path??null,prayerSourcePath:x.prayerSourcePath??null,
    id:x.id??null,rank:x.rank??null,inseparable:Boolean(x.inseparable)
   }));
   const owners=[...new Set([actualSource,...comms.map(x=>x.prayerSourcePath??x.path)]
    .filter(x=>/^(?:Sancti|Tempora|Commune)\/[A-Za-z0-9_-]+$/.test(x)))];
   const sourceSections=[];
   // Only the selected Proper's exact owned prayer source paths; never
   // enumerate all 1,049 sources or infer a Common from a saint's name.
   for(const path of owners){
    const record={path,languages:{}};
    for(const lang of ["la","en","fr"]){
     const diagnostic={requestedFiles:[],cacheHits:[],referencesResolved:[],
      languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],
      warnings:[],errors:[]};
     try{
      const parsed=await resolver.properResolver.resolveSource(path,lang,diagnostic);
      const map=parsed?.map;
      const keys=map?Array.from(map.keys()).filter(k=>
       /^(?:Oratio|Secreta|Postcommunio)/i.test(k)):[];
      const sections={};
      for(const key of keys){
       const rows=map.get(key)??[];
       sections[key]={lineCount:rows.length,
        unresolvedReference:rows.some(x=>/^\s*@/.test(String(x))),
        preview:String(rows[0]??"").slice(0,115)};
      }
      record.languages[lang]={sourcePresent:Boolean(map),
       sections,requestedFiles:diagnostic.requestedFiles.length,
       unresolved:diagnostic.errors.slice(0,3)};
     }catch(e){record.languages[lang]={error:String(e?.message??e)};}
    }
    sourceSections.push(record);
   }
   results.push({date,principalId,actualSource,wantedSourcePath,
    selectedDayStatus:d.status,properStatus:d.proper?.status,
    calendarCommemorations:comms,
    calendarDayCommemorations:(d.day?.commemorations??[]).map(x=>({
     path:x.path,id:x.id,rank:x.rank,privileged:Boolean(x.privileged)
    })),
    rawEN:snap(p,"en"),rawFR:snap(p,"fr"),
    recoveredEN:snap(rp,"en"),recoveredFR:snap(rp,"fr"),
    commemorationFormDecision:rp.commemorationFormDecision??null,
    recoveryWarnings:diag.warnings.slice(0,12),
    sourceSections,
    noNewScoreApproval:true});
  }
  return {schema:"ao-1962-five-oration-source-owner-reader-audit-v1",
   sourceOfTruth:"CURRENT_SELECTED_1962_RUNTIME_AND_EXACT_PINNED_SOURCE_SECTIONS",
   cases:results,
   publication:{newProperScores:0,newTranslations:0,automatedOrationSelection:false}};
 },targets);
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
await mkdir(resolve(root,"artifacts/mass"),{recursive:true});
await writeFile(resolve(root,"artifacts/mass/1962-five-oration-source-owner-audit.json"),
 JSON.stringify(report,null,2)+"\n");
assert.equal(report.schema,"ao-1962-five-oration-source-owner-reader-audit-v1");
assert.equal(report.cases.length,5);
for(const [date,sourcePath] of targets){
 const item=report.cases.find(x=>x.date===date);
 assert.ok(item,date+": no source record");
 assert.equal(item.error,undefined,date+": unresolved Proper");
 assert.equal(item.selectedDayStatus,"ready",date+": date was not selected 1962 Mass");
 assert.equal(item.actualSource,sourcePath,date+": original selected source changed");
 assert.ok(["ready","cached"].includes(String(item.properStatus).toLowerCase()));
 assert.ok(item.sourceSections.some(x=>x.path===sourcePath),
  date+": selected original source was not examined");
 const monica=date==="2026-05-04",bridget=date==="2026-10-08";
 const nativity=["2026-12-26","2026-12-28"].includes(date);
 assert.equal(item.recoveredEN.ready,monica||bridget||nativity,
  date+": unexpected change in source-owned English orations");
 assert.equal(item.recoveredFR.ready,monica||bridget||nativity,
  date+": unexpected change in source-owned French orations");
 if(nativity){
  for(const lang of ["recoveredEN","recoveredFR"]){
   for(const key of ["Oratio","Secreta","Postcommunio"]){
    assert.equal(item[lang].orations[key].count,2,
     date+":"+lang+":"+key+" Christmas octave commemoration not restored");
    assert.equal(item[lang].orations[key].rows[1].sourcePath,
     "Sancti/12-25m3","Christmas source donor identity drift");
   }
   assert.equal(item[lang].sourceCorrections.filter(x=>
    x.id==="1962_CHRISTMAS_OCTAVE_PRIVILEGED_ORATION").length,3);
  }
 }
 assert.ok(item.recoveredEN.missing.every(s=>
  ["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"].includes(s)),
  date+": missing non-oration section");
 if(bridget){
  assert.deepEqual(item.rawEN.missing,["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"]);
  const proof=item.recoveredEN.sourceCorrections.filter(x=>
   x.id==="1962_10_08C_MARTYRS_PINNED_ENGLISH_ORATIONS");
  assert.deepEqual(proof.map(x=>x.slot??x.sourceSection).sort(),
   ["Oratio","Postcommunio","Secreta"].sort(),
   "All three Oct 8 English orations must be fully source-verified");
  assert.equal(item.recoveredEN.orations.Oratio.count,2);
  assert.equal(item.recoveredEN.orations.Secreta.count,2);
  assert.equal(item.recoveredEN.orations.Postcommunio.count,2);
  const declared=item.calendarCommemorations[0];
  assert.equal(declared?.prayerSourcePath,"Sancti/10-08c",
   "Wrong martyrs source owner inherited by Bridget");
  assert.ok(item.sourceSections.some(x=>x.path==="Sancti/10-08c"),
   "Source-qualified original martyrs owner was never resolved");
 }
 if(monica){
  assert.deepEqual(item.rawEN.missing,["COLLECT_SET"],
   "The former raw St Monica Collect gap disappeared unexpectedly");
  assert.deepEqual(item.rawFR.missing,["COLLECT_SET"]);
  assert.ok(item.recoveredEN.sourceCorrections?.some(x=>
   x.id==="1962_ST_MONICA_ROMAN_CONDITIONAL_COLLECT"),
   "St Monica's Roman section not transparently restored");
  assert.ok(item.recoveredFR.sourceCorrections?.some(x=>
   x.id==="1962_ST_MONICA_ROMAN_CONDITIONAL_COLLECT"));
  const original=item.sourceSections.find(x=>x.path==="Sancti/05-04");
  for(const language of ["la","en","fr"]){
   assert.equal(original?.languages?.[language]?.sections?.[
    "Oratio (nisi rubrica cisterciensis)"]?.lineCount,2,
    "Original Roman conditional Collect source not independently present: "+language);
   assert.equal(original?.languages?.[language]?.sections?.Oratio?.lineCount,0,
    "A competing bare Oratio source must prevent this narrow restoration");
  }
 }
}
assert.equal(report.cases.find(x=>x.date==="2026-10-08").recoveredFR.ready,true,
 "Bridget French inherited source recovered by existing reader");
assert.equal(report.publication.newProperScores,0);
console.log("1962_FIVE_ORATION_OWNER_AUDIT "+JSON.stringify(report.cases.map(x=>({
 date:x.date,source:x.actualSource,commemorations:x.calendarCommemorations.map(y=>y.prayerSourcePath??y.path),
 owners:x.sourceSections.map(y=>y.path),
 rawEnglishMissing:x.rawEN.missing,
 readerEnglishMissing:x.recoveredEN.missing,
 readerFrenchMissing:x.recoveredFR.missing
}))));
