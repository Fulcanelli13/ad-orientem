// Calendar P0: inspect the ACTUAL production 1962 day+Proper resolver for all 24
// protected-annex Sunday overlaps. This is not an independent Missal certification.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const filename="data/calendar/1962-sunday-overlap-dispositions-2026-2028.review.v1.json";
const manifest=JSON.parse(await readFile(resolve(root,filename),"utf8"));
const cases=manifest.cases;
assert.equal(manifest.schema,"AO_CALENDAR_SUNDAY_OVERLAP_DISPOSITION_SCREENING_V1");
assert.equal(cases.length,24);
const strict=process.argv.includes("--strict");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".woff2":"font/woff2",
  ".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const target=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(target!==root&&!target.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const content=await readFile(target);
  res.writeHead(200,{"content-type":mime[extname(target)]||"application/octet-stream","cache-control":"no-store"});
  res.end(content);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
let browser;
let evidence=[];
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:90000});
 for(let i=0;i<cases.length;i+=6){
  const current=cases.slice(i,i+6);
  const observed=await page.evaluate(async entries=>{
   const resolver=globalThis.AO_RUNTIME_V8.resolver;
   const {canonical1962Commemorations}=await import("/src/calendar/traditional-day-adjudication.js");
   // Preserve the raw Proper and canonical commemoration identities; do
   // not interpret titles or source-attached candidate lists as approvals.
   return Promise.all(entries.map(async entry=>{
    try{
     const r=await resolver.resolveDay(entry.date);
     const main=r?.day?.main||{}, p=r?.proper?.data||{};
     const comm=canonical1962Commemorations(r);
     const rawComms=r?.day?.commemorations??main.commemorations??r?.commemorations??[];
     const src=x=>typeof x==="string"?x:String(x?.sourcePath||x?.prayerSourcePath||x?.path||x?.id||"");
     const orations=name=>Array.isArray(p[name])?p[name].map(x=>({
       source:src(x),hasLatin:Boolean(x?.lat??x?.la??x?.latin??x?.text?.lat??(typeof x==="string"?x:""))
     })):[];
     return {
      date:entry.date,status:r?.status??null,resolvedDate:r?.date??null,
      main:{id:main.id??null,rank:main.rank??null,colour:main.color??main.colour??null,title:main.title??null},
      proper:{status:r?.proper?.status??null,sourcePath:p.sourcePath??null,
       name:p.name??p.title??null,
       collectCount:Array.isArray(p.collects)?p.collects.length:0,
       secretCount:Array.isArray(p.secrets)?p.secrets.length:0,
       postcommunionCount:Array.isArray(p.postcommunions)?p.postcommunions.length:0,
       calendarCommemorations:(p.calendarCommemorations||[]).map(x=>({
        name:x.name??null,path:x.path??null,prayerSourcePath:x.prayerSourcePath??null
       })),
       orationLineage:{collects:orations("collects"),secrets:orations("secrets"),
        postcommunions:orations("postcommunions")}
      },
      canonicalCommemorations:comm.map(x=>x.sourceId),
      rawCommemorationCount:Array.isArray(rawComms)?rawComms.length:null,
      selectedMassOrAlternative:r?.selectedFormularyId??r?.massSelection?.id??null,
      error:r?.error??r?.proper?.error??null
     };
    }catch(e){return {date:entry.date,status:"exception",error:String(e?.stack||e)}}
   }));
  },current);
  evidence.push(...observed);
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
const results=cases.map(expected=>{
 const actual=evidence.find(x=>x.date===expected.date);
 const problems=[];
 if(!actual||actual.status!=="ready"||actual.resolvedDate!==expected.date)
  problems.push("DAY_UNRESOLVED_OR_WRONG_DATE");
 if(actual?.proper?.status!=="ready"||!actual?.proper?.sourcePath)
  problems.push("PROPER_UNAVAILABLE");
 const id=actual?.main?.id||"";
 const match=id.match(/^tempora:([A-Za-z0-9-]+):([1-4]):[a-z]{1,3}$/i);
 if(!match||Number(match[2])!==expected.generalSundayClass)
  problems.push("PRINCIPAL_ID_OR_RANK_MISMATCH");
 const path=match?"Tempora/"+match[1]:null;
 if(path&&actual?.proper?.sourcePath!==path)
  problems.push("PRINCIPAL_PROPER_SOURCE_MISMATCH");
 const fixedId=String(expected.protectedFeastResolverIdentity).replace(/:[1-4]:[a-z]{1,3}$/i,"");
 const snapshot=expected.productionSnapshot;
 if(!snapshot||actual?.main?.id!==snapshot.observedPrincipalId)
  problems.push("OBSERVED_PRINCIPAL_SNAPSHOT_DRIFT");
 if(actual?.proper?.sourcePath!==snapshot?.observedProperSourcePath)
  problems.push("OBSERVED_PROPER_SNAPSHOT_DRIFT");
 if(JSON.stringify(actual?.canonicalCommemorations||[])!==JSON.stringify(snapshot?.canonicalCommemorationIds))
  problems.push("OBSERVED_COMMEMORATION_SNAPSHOT_DRIFT");
 for(const name of ["collects","secrets","postcommunions"]){
  const actualCount=actual?.proper?.[name==="collects"?"collectCount":name==="secrets"?"secretCount":"postcommunionCount"];
  if(actualCount!==snapshot?.orationCounts?.[name])problems.push("OBSERVED_"+name.toUpperCase()+"_SNAPSHOT_DRIFT");
 }
 if(snapshot?.sourceCertified!==false||snapshot?.publishable!==false)
  problems.push("UNSAFE_PRODUCTION_SNAPSHOT_CERTIFICATION");
 if((actual?.canonicalCommemorations||[]).some(id=>
   String(id).replace(/:[1-4]:[a-z]{1,3}$/i,"")===fixedId))
  problems.push("FORBIDDEN_III_CLASS_SAINT_COMMEMORATION");
 for(const [key,count] of [
  ["COLLECT",actual?.proper?.collectCount??0],
  ["SECRET",actual?.proper?.secretCount??0],
  ["POSTCOMMUNION",actual?.proper?.postcommunionCount??0]
 ])if(count<1)problems.push("MISSING_"+key);
 // Extra source-backed orations must be reconciled with the canonical
 // commemoration owner; counts alone do not certify their rubrical legitimacy.
 const counts=[actual?.proper?.collectCount||0,actual?.proper?.secretCount||0,
  actual?.proper?.postcommunionCount||0];
 if(new Set(counts).size!==1)problems.push("UNEQUAL_ORATION_COUNTS_NEED_SOURCE_REVIEW");
 return {date:expected.date,feast:expected.feastTitle,expectedSunday:expected.generalSundayPrincipal,
   expectedRank:expected.generalSundayClass,exception:expected.exception?.id||null,
   production:actual??null,problems,sourceCertified:false,publishable:false,
   remaining:["EXACT_DATED_ORIGINAL_MISSAL_ORDO_AND_PRAYER_AUTHORITY",
    "PARTICULAR_CALENDAR_AUTHORITY_WHERE_RELEVANT"]};
});
const summary={
 cases:cases.length,productionDaysReady:results.filter(x=>x.production?.status==="ready").length,
 canonicalMainAndProperMatched:results.filter(x=>!x.problems.includes("PRINCIPAL_ID_OR_RANK_MISMATCH")&&
  !x.problems.includes("PRINCIPAL_PROPER_SOURCE_MISMATCH")&&
  !x.problems.includes("PROPER_UNAVAILABLE")&&
  !x.problems.includes("DAY_UNRESOLVED_OR_WRONG_DATE")).length,
 withProductionProblems:results.filter(x=>x.problems.length).length,
 forbiddenIIICommemorations:results.filter(x=>x.problems.includes("FORBIDDEN_III_CLASS_SAINT_COMMEMORATION")).length,
 primaryOriginalSourceCertified:0,published:0,particularCasesHeld:cases.filter(x=>x.exception).length
};
const report={schema:"AO_1962_PROTECTED_SUNDAY_PRODUCTION_PARITY_AUDIT_V1",
 generatedAt:new Date().toISOString(),repositoryPopulation:filename,
 scope:"Production resolver and Proper observed in Chromium, not original-edition collation",
 originalSourceCertification:"NOT_ATTESTED_BY_THIS_RUN",summary,rows:results};
const location=resolve(root,"artifacts/calendar-oracle/sunday-overlap-24-production-parity.json");
await mkdir(resolve(root,"artifacts/calendar-oracle"),{recursive:true});
await writeFile(location,JSON.stringify(report,null,2)+"\n","utf8");
console.log("SUNDAY_OVERLAP_PRODUCTION_PARITY_SUMMARY="+JSON.stringify(summary));
for(const row of results)console.log("SUNDAY_OVERLAP_DATE="+JSON.stringify({
 date:row.date,feast:row.feast,expected:row.expectedSunday,rank:row.expectedRank,
 main:row.production?.main?.id,source:row.production?.proper?.sourcePath,
 comm:row.production?.canonicalCommemorations,orations:[
  row.production?.proper?.collectCount,row.production?.proper?.secretCount,
  row.production?.proper?.postcommunionCount
 ],exception:row.exception,problems:row.problems
}));
assert.equal(results.length,24);
assert.equal(new Set(results.map(x=>x.date)).size,24);
assert.ok(results.every(x=>!x.publishable&&!x.sourceCertified));
if(strict)assert.equal(summary.withProductionProblems,0,
 "The production 1962 Calendar diverges from the protected-Sunday expectations; read the dated evidence JSON first.");
