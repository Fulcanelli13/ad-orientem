// Source diagnosis for real November–December 2026 Mass commemoration cases.
// Reads the existing production DayResolver, recovery and source-form selector.
// No new liturgical decisions are inferred from these inventory records.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const dates=[
 "2026-11-09","2026-11-10","2026-11-11","2026-11-19",
 "2026-11-23","2026-11-24","2026-11-26","2026-12-02",
 "2026-12-03","2026-12-05","2026-12-07"
];
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
 ".mjs":"text/javascript;charset=utf-8",".json":"application/json",
 ".css":"text/css;charset=utf-8",".svg":"image/svg+xml"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error))}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:80000});
 const findings=await page.evaluate(async dates=>{
  const resolver=globalThis.AO_RUNTIME_V8.resolver;
  const {recoverReaderProperOmissions}=await import("/src/mass/reader-proper-runtime-recovery.js");
  const {select1962CommemorationsForMassForm:select}=await import("/src/mass/1962-commemoration-form-source.js");
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  const groups=["collects","secrets","postcommunions"];
  const out=[];
  for(const date of dates){
   const r=await resolver.resolveDay(date);
   const raw=r?.proper?.data;
   const prepared=await recoverReaderProperOmissions(r.proper,{
    hostResolver:resolver.properResolver,principalCelebrationId:r.day?.main?.id,calendarDate:date
   });
   const data=prepared?.data??prepared;
   const forms={};
   for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
    const s=select({proper:prepared,calendarResolution:r,form});
    const p=s.proper?.data??s.proper;
    const orationSlots=Object.fromEntries(["en","fr"].map(language=>{
      const mapped=properToReaderSlots(p,{language});
      return [language,["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"].map(slot=>{
        const entry=mapped.slots?.[slot];
        const paragraphs=entry?.data?.paragraphs??[];
        return {status:entry?.status??null,reason:entry?.reason??null,
          groups:[...new Set(paragraphs.map(x=>x.orationGroupIndex)
            .filter(Number.isInteger))].length};
      })];
    }));
    forms[form]={status:s.status,reason:s.reason??null,scope:s.decision?.scope??null,
     applied:s.decision?.appliedCount??null,prayerGroups:s.decision?.prayerGroupCount??null,
     counts:groups.map(k=>p?.[k]?.length??0),orationSlots};
   }
   out.push({
    date,resolverStatus:r?.status,properStatus:r?.proper?.status,
    principal:r.day?.main?{id:r.day.main.id,title:r.day.main.title,path:r.day.main.path,
     rank:r.day.main.rank}:null,
    commemorations:(r.day?.commemorations??[]).map(x=>({
     id:x.id,title:x.title,rank:x.rank,path:x.path,privileged:!!x.privileged,
     inseparable:!!x.inseparable})),
    sourceCommemorations:(data?.calendarCommemorations??[]).map(x=>({
     name:x.name,path:x.path,prayerSourcePath:x.prayerSourcePath,rank:x.rank,
     inseparable:!!x.inseparable})),
    sourcePath:data?.sourcePath,
    prayers:Object.fromEntries(groups.map(k=>[k,(data?.[k]??[]).map(x=>({
     lat:!!String(x?.lat??x?.la??"").trim(),en:!!String(x?.en??"").trim(),
     fr:!!String(x?.fr??"").trim(),sourcePath:x?.sourcePath??null}))])),
    formDecisions:forms,
   });
  }
  return out;
 },dates);
 const expected=[
  ["2026-11-09","Sancti/11-09","Sancti/11-09cc","ORDINARY"],
  ["2026-11-10","Sancti/11-10","Sancti/11-10o","ORDINARY"],
  ["2026-11-11","Sancti/11-11","Sancti/11-11cc","ORDINARY"],
  ["2026-11-19","Sancti/11-19","Sancti/11-19o","ORDINARY"],
  ["2026-11-23","Sancti/11-23","Sancti/11-23cc","SOURCE_FRENCH_HOLD"],
  ["2026-11-24","Sancti/11-24","Sancti/11-24o","ORDINARY"],
  ["2026-11-26","Sancti/11-26","Sancti/11-26t","ORDINARY"],
  ["2026-12-02","Sancti/12-02","Tempora/Adv1-3","PRIVILEGED_ADVENT"],
  ["2026-12-03","Sancti/12-03","Tempora/Adv1-4","PRIVILEGED_ADVENT"],
  ["2026-12-05","Tempora/Adv1-6","Sancti/12-05","ORDINARY"],
  ["2026-12-07","Sancti/12-07","Tempora/Adv2-1","PRIVILEGED_ADVENT"]
 ];
 assert.equal(findings.length,expected.length);
 for(const [date,principal,comm,rule] of expected){
  const f=findings.find(x=>x.date===date);
  assert.ok(f,date+" missing from production");
  console.log("NOV_DEC_1962_SOURCE_CASE="+JSON.stringify(f));
  assert.equal(f.resolverStatus,"ready",date+" source day");
  assert.equal(f.properStatus,"ready",date+" source Proper");
  assert.equal(f.principal.path,principal,date+" original principal source");
  assert.equal(f.sourcePath,principal,date+" selected Proper source");
  assert.equal(f.commemorations.length,1,date+" exactly one canonical commemoration");
  assert.equal(f.commemorations[0].path,comm,date+" Calendar commemoration");
  assert.equal(f.sourceCommemorations.length,1,date+" exactly one source owner");
  assert.equal(f.sourceCommemorations[0].path,comm,date+" source owner");
  for(const field of ["collects","secrets","postcommunions"]){
   assert.equal(f.prayers[field].length,2,date+" two original ordered source prayer groups");
  }
  const isOrdinary=rule==="ORDINARY";
  const isAdvent=rule==="PRIVILEGED_ADVENT";
  for(const [form,decision] of Object.entries(f.formDecisions)){
   if(rule==="SOURCE_FRENCH_HOLD"){
    assert.equal(decision.status,"UNVERIFIED",date+"/"+form+" incomplete original translation");
    assert.equal(decision.reason,"ORATION_SOURCE_INCOMPLETE",date+"/"+form);
    continue;
   }
   const shouldInclude=form==="LOW"||isAdvent;
   const expectedCount=shouldInclude?2:1;
   assert.equal(decision.status,"CERTIFIED",date+"/"+form+": "+decision.reason);
   assert.equal(decision.scope,isOrdinary?
     "NON_SUNDAY_II_III_CLASS_SINGLE_IV_CLASS_SANCTORAL_COMMEMORATION":
     "PRIVILEGED_ADVENT_FERIA_UNDER_SANCTORAL",date+"/"+form);
   assert.equal(decision.applied,shouldInclude?1:0,date+"/"+form);
   assert.deepEqual(decision.counts,[expectedCount,expectedCount,expectedCount],
     date+"/"+form+" source prayer groups");
   for(const [language,slots] of Object.entries(decision.orationSlots)){
    for(const slot of slots){
     assert.equal(slot.status,"READY",date+"/"+form+"/"+language+": "+slot.reason);
     assert.equal(slot.groups,expectedCount,
       date+"/"+form+"/"+language+" missing one original oration");
    }
   }
  }
 }
 const held=findings.find(x=>x.date==="2026-11-23");
 assert.equal(held.prayers.secrets[0].fr,false,"Original Clement Secret remains untranslated");
 assert.equal(held.prayers.postcommunions[0].fr,false,"Original Clement Postcommunion remains untranslated");
 console.log("PASS: 11 exact original Roman 1962 witnesses; 10 source-complete dates across four forms; 23 November missing principal French source explicitly withheld.");
}finally{await browser?.close();await new Promise(done=>server.close(done))}
