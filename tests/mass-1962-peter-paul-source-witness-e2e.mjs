import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html",".js":"text/javascript",".json":"application/json",".css":"text/css",".mjs":"text/javascript"};
const server=http.createServer(async(req,res)=>{try{const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}const bytes=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream"});res.end(bytes)}catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}});
await new Promise(done=>server.listen(0,"127.0.0.1",done));let browser;
try{
browser=await chromium.launch({headless:true});const page=await browser.newPage({serviceWorkers:"block"});
await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
await page.waitForFunction(()=>!!globalThis.AO_RUNTIME_V8?.resolver?.resolveDay,null,{timeout:80000});
const rows=await page.evaluate(async()=>{
const dates=["2026-01-25","2026-02-22","2026-06-29","2026-06-30","2026-08-01"];
const out=[];
for(const date of dates){
const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);const p=r?.proper?.data;
out.push({date,status:r?.status,properStatus:r?.proper?.status,
main:{id:r?.day?.main?.id,path:r?.day?.main?.path,title:r?.day?.main?.title,rank:r?.day?.main?.rank},
comms:r?.day?.commemorations?.map(q=>({id:q.id,path:q.path,title:q.title,rank:q.rank,inseparable:q.inseparable})),
source:p?.sourcePath,sourceComms:p?.calendarCommemorations?.map(q=>({name:q.name,path:q.path,prayerSourcePath:q.prayerSourcePath,inseparable:q.inseparable})),
fullCollectLatin:date==="2026-06-30"?p?.collects?.[0]?.lat:null,
fullCollectEnglish:date==="2026-06-30"?p?.collects?.[0]?.en:null,
fullCollectFrench:date==="2026-06-30"?p?.collects?.[0]?.fr:null,
groups:["collects","secrets","postcommunions"].map(k=>({name:k,count:p?.[k]?.length,rows:p?.[k]?.map((x,i)=>({id:i,latin:String(x?.lat??"").slice(0,140),latinEnding:String(x?.lat??"").slice(-145),enOk:!!x?.en,frOk:!!x?.fr}))})),
warnings:r?.diagnostic?.warnings?.slice(0,3)??[]});
}return out});
for(const row of rows){console.log("PETER_PAUL_1962_WITNESS="+JSON.stringify(row));assert.equal(row.status,"ready",row.date)}
const hostSections=await page.evaluate(async()=>{
 const host=globalThis.AO_RUNTIME_V8.resolver.properResolver;
 const out={};
 for(const language of ["la","en","fr"]){
  for(const source of ["Sancti/02-22","Sancti/06-30"]){
    try{
      const parsed=await host.resolveSource(source,language,{
        requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],
        structuralInheritances:[],legacyCommonRecoveries:[],warnings:[],errors:[]
      });
      const wanted=["Oratio Petri","Secreta Petri","Postcommunio Petri",
        "Oratio","Secreta","Postcommunio"];
      out[source+"|"+language]=Object.fromEntries(wanted.map(k=>[k,
        parsed?.map?.get(k)?.map(s=>s.slice(0,140))??null]));
    }catch(e){out[source+"|"+language]={error:String(e?.message??e)}}
  }
 }return out;
});
console.log("PETER_PAUL_SOURCE_SECTIONS="+JSON.stringify(hostSections));

const certified=await page.evaluate(async()=>{
 const resolver=globalThis.AO_RUNTIME_V8.resolver;
 const resolution=await resolver.resolveDay("2026-06-30");
 const {recoverReaderProperOmissions}=await import("/src/mass/reader-proper-runtime-recovery.js");
 const {select1962CommemorationsForMassForm}=await import("/src/mass/1962-commemoration-form-source.js");
 const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
 const {assessPrintableProper}=await import("/src/calendar/print-proper.js");
 const recovered=await recoverReaderProperOmissions(resolution.proper,{
   hostResolver:resolver.properResolver,principalCelebrationId:resolution.day.main.id});
 const outputs={recoveredStatus:recovered.data?.inseparableApostolicSources?.status??null};
 for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
   const selected=select1962CommemorationsForMassForm({
     proper:recovered,calendarResolution:resolution,form
   });
   const proper=selected.proper?.data??selected.proper;
   const slots=properToReaderSlots(proper,{language:"fr"});
   outputs[form]={
     status:selected.status,reason:selected.reason??null,
     scope:selected.decision?.scope??null,
     groups:["collects","secrets","postcommunions"].map(k=>proper?.[k]?.length),
     paragraphs:["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"].map(k=>slots.slots[k].data?.paragraphs?.length??null),
     prayerGroupCount:selected.decision?.prayerGroupCount??null,
     conclusionOwner:proper?.collects?.[0]?.oneConclusion?.conclusionOwner??null,
     print:assessPrintableProper({...resolution,proper:{status:"ready",data:proper}},
       {language:"fr"}),
     originalPrint:assessPrintableProper(resolution,{language:"fr"}).reason??"READY",
   };
 }
 return outputs;
});
console.log("PETER_PAUL_1962_CERTIFIED="+JSON.stringify(certified));
assert.equal(certified.recoveredStatus,"SOURCE_VERIFIED","Other apostle's source sections not recovered");
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
 const result=certified[form];
 assert.equal(result.status,"CERTIFIED",form+": "+result.reason);
 assert.equal(result.scope,"INSEPARABLE_PETER_PAUL_JUNE_30");
 assert.deepEqual(result.groups,[1,1,1],form+" must count Apostles as one oration per group");
 assert.deepEqual(result.paragraphs,[2,2,2],form+" must show both apostolic prayers, one conclusion");
 assert.equal(result.conclusionOwner,"SAINT_PETER");
 assert.equal(result.prayerGroupCount,1);
 if(result.originalPrint==="READY"){
   assert.equal(result.print.ok,true,"No new printed-Proper regression: "+result.print.reason);
 }else{
   assert.equal(result.print.ok,false,"Print must remain withheld if source was already incomplete");
   assert.equal(result.print.reason,result.originalPrint,
     "Inseparable prayer projection must not change unrelated print blockers");
 }
}

}finally{await browser?.close();await new Promise(done=>server.close(done))}
