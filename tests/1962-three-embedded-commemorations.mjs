// Exact historical 1962 Mass commemoration source-location audit.
// Three selected dates only. No calendars, words, or scores mutated.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const cases=[["2026-03-27","Tempora/Quad5-5Feria","Tempora/Quad5-5Feriac"],
 ["2026-12-26","Sancti/12-26","Sancti/12-26c"],
 ["2026-12-28","Sancti/12-28","Sancti/12-28c"]];
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",
 ".json":"application/json",".css":"text/css",".svg":"image/svg+xml",
 ".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const b=await readFile(file);res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream"});res.end(b);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message))}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(0,"127.0.0.1",ok)});
let browser,report;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
  null,{timeout:90000});
 report=await page.evaluate(async cases=>{
  const resolver=globalThis.AO_RUNTIME_V8.resolver;
  const {recoverReaderProperOmissions}=await import("/src/mass/reader-proper-runtime-recovery.js");
  const {adaptV346ResolvedMass}=await import("/src/mass/host-adapter.js");
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  const sections=["Commemoratio Oratio","Commemoratio Secreta","Commemoratio Postcommunio"];
  const names=["Oratio","Secreta","Postcommunio"];
  const clean=x=>String(x??"").replace(/\s+/g," ").slice(0,210);
  const rows=[];
  for(const [date,principal,placeholder] of cases){
   const d=await resolver.resolveDay(date),p=d?.proper?.data,
    actual=p?.sourcePath??null,main=d?.day?.main;
   const rawComms=(d?.day?.commemorations??[]).map(x=>({
    id:x.id,path:x.path,title:x.title,name:x.name,rank:x.rank,
    privileged:x.privileged}));
   const sectionsByOwner={};
   for(const path of [principal,placeholder,"Sancti/12-25m3",...(date==="2026-03-27"?["Sancti/03-27"]:[])]){
    const result={};
    for(const lang of ["la","en","fr"]){
     const diag={requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],
      structuralInheritances:[],legacyCommonRecoveries:[],warnings:[],errors:[]};
     try{
      const source=await resolver.properResolver.resolveSource(path,lang,diag);
      const keys=[...sections,...names];
      result[lang]=Object.fromEntries(keys.map(section=>{
       const v=source?.map?.get(section);
       return [section,{rows:Array.isArray(v)?v.length:0,
        preview:Array.isArray(v)?clean(v.join(" | ")):null,
        rawReference:Array.isArray(v)?v.some(x=>/^\s*@/.test(x)):false}];
      }));
      result[lang].diagnostics={errors:diag.errors.slice(0,3),
       referenced:diag.referencesResolved.slice(0,7)};
     }catch(e){result[lang]={error:String(e.message)}}
    }
    sectionsByOwner[path]=result;
   }
   const recovered=await recoverReaderProperOmissions(p,{hostResolver:resolver.properResolver,
    principalCelebrationId:main?.id,calendarDate:date});
   const adapted=adaptV346ResolvedMass({
    canStart:true,date,calendarDay:{id:main?.id,title:main?.title},
    celebrationId:"mass_of_day",requestedCelebrationId:"mass_of_day",
    celebrationType:"CALENDAR",properSource:actual},
    {form:"low",proper:recovered});
   const rp=adapted.proper?.data;
   const flat=s=>({ready:s.ready,missing:s.missing,
    orationCounts:{collects:rp?.collects?.length??0,secrets:rp?.secrets?.length??0,
     postcommunions:rp?.postcommunions?.length??0}});
   rows.push({date,principal,placeholder,selectedPath:actual,
    principalId:main?.id,principalRank:main?.rank,
    selectedDayStatus:d?.status,commemorations:rawComms,
    inheritedOwners:(p?.calendarCommemorations??[]).map(x=>({
     path:x.path,prayerSourcePath:x.prayerSourcePath,rank:x.rank})),
    sectionWitnesses:sectionsByOwner,
    readerEN:flat(properToReaderSlots(rp,{language:"en"})),
    readerFR:flat(properToReaderSlots(rp,{language:"fr"}))});
  }
  return {schema:"ao-1962-three-commemoration-original-section-audit-v1",
    authority:"PINNED_ORIGINAL_HOST_RESOLVER_SECTION_WITNESSES",
    rubricRules:["RG_108","RG_109","RG_110","RG_111","RG_112","RG_113","RG_114","RGMR_437"],
    rows,publication:{scoreApprovals:0,prayerTextEdits:0,calendarMutations:0}};
 },cases);
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
const dir=resolve(root,"artifacts/mass");
await mkdir(dir,{recursive:true});
await writeFile(resolve(dir,"1962-three-embedded-commemoration-witnesses.json"),
 JSON.stringify(report,null,2)+"\n");
assert.equal(report.rows.length,3);
for(const [date,path,placeholder] of cases){
 const d=report.rows.find(x=>x.date===date);
 assert.ok(d);assert.equal(d.selectedDayStatus,"ready");
 assert.equal(d.selectedPath,path);assert.equal(d.inheritedOwners.length,1);
 assert.equal(d.inheritedOwners[0].prayerSourcePath,placeholder);
 assert.ok(["Sancti/12-26","Sancti/12-28"].includes(path)?
  d.principalRank===2:d.principalRank===3);
 assert.equal(d.readerEN.ready,false);
 assert.equal(d.readerFR.ready,false);
 for(const lang of ["la","en","fr"])
  assert.equal(d.sectionWitnesses[path][lang]["Commemoratio Oratio"].rows>0,true,
   date+" original embedded commemoration absent: "+lang);
}
assert.equal(report.publication.scoreApprovals,0);
console.log("PASS pinned three-date original embedded commemorations located; 3-language witnesses; all 3 reader holds retained, no publication");
