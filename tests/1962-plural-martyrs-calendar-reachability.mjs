/**
 * Read-only 1962 source reachability survey.
 *
 * Does NOT authorize a Common, celebrate a different Mass, invent text or
 * alter a Mass day. Distinguishes exact Calendar source selection from
 * indirectly inherited source text and explicit alternate-Mass user choices.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".svg":"image/svg+xml",
 ".woff2":"font/woff2",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try {
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden");}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
const dates=[];
for(let day=Date.UTC(2024,0,1);day<Date.UTC(2030,0,1);day+=86400000)
 dates.push(new Date(day).toISOString().slice(0,10));
assert.equal(dates.length,2192,"2024–2029 inclusive: two leap years");
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
let browser;const observed=[];
try {
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 page.setDefaultTimeout(90000);
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
  null,{timeout:90000});
 for(let offset=0;offset<dates.length;offset+=24){
  const group=dates.slice(offset,offset+24);
  const batch=await page.evaluate(async ids=>{
   const resolver=globalThis.AO_RUNTIME_V8.resolver;
   const {select1962CommemorationsForMassForm}=await import("/src/mass/1962-commemoration-form-source.js");
   const normalize=x=>String(x??"").trim().replace(/\.txt$/iu,"")
     .replace(/:(?:Oratio|Secreta|Postcommunio)$/iu,"");
   const common=path=>/^(?:Commune\/C6b|Commune\/C7b)$/iu.test(normalize(path));
   const compactOwner=x=>({path:x?.path??null,prayerSourcePath:x?.prayerSourcePath??null,
      sourcePath:x?.sourcePath??null,inseparable:x?.inseparable??false});
   const cleanForm=({status,reason,decision,proper})=>({
     status:status??null,reason:reason??null,
     appliedCount:decision?.appliedCount??null,
     scope:decision?.scope??null,
     selectedSource:proper?.data?.sourcePath??proper?.sourcePath??null
   });
   return await Promise.all(ids.map(async date=>{
    try{
     const r=await resolver.resolveDay(date);
     const p=r?.proper?.data,day=r?.day;
     if(r?.status!=="ready"||r?.proper?.status!=="ready"||!p||!day?.main){
      return {date,status:r?.status??"unknown",properStatus:r?.proper?.status??"missing",
       failure:"UNRESOLVED_CALENDAR_PROPER",sourcePath:p?.sourcePath??null};}
     const principals=[day.main.path,p.sourcePath].filter(Boolean);
     const cals=(p.calendarCommemorations??[]).map(compactOwner);
     const commemorations=(day.commemorations??[]).map(compactOwner);
     const rowOwners=[];
     for(const field of ["collects","secrets","postcommunions"])
      for(const [index,row] of (p[field]??[]).entries()){
       const value=normalize(row?.sourcePath??row?.sourceRef??"");
       if(common(value))rowOwners.push({field,index,sourcePath:value});
      }
     const primary=principals.filter(common);
     const sourceCommem=cals.filter(x=>common(x.prayerSourcePath)||
       common(x.path)||common(x.sourcePath));
     const dayCommem=commemorations.filter(x=>common(x.prayerSourcePath)||
       common(x.path)||common(x.sourcePath));
     const matched=primary.length>0||sourceCommem.length>0||
       dayCommem.length>0||rowOwners.length>0;
     const formResults={};
     if(matched||(day.commemorations??[]).length){
      for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
       const assessment=select1962CommemorationsForMassForm({
        proper:p,calendarResolution:r,form,celebrationId:"mass_of_day"});
       formResults[form]=cleanForm(assessment);
      }
     }
     return {date,status:"ready",mainPath:day.main.path??null,
       mainId:day.main.id??null,sourcePath:p.sourcePath??null,
       rank:day.main.rank??null,calendarCommemCount:cals.length,
       dayCommemCount:commemorations.length,
       matching:{principals:primary,calendarCommemorations:sourceCommem,
        dayCommemorations:dayCommem,prayerRows:rowOwners},
       matched,formResults,
       // Perpetua & Felicity remain their own named source-owner case.
       namedMarch6Source:cals.some(x=>normalize(x.prayerSourcePath??x.path)==="Sancti/03-06"),
       sourceFilesNotExpanded:true};
    }catch(e){return {date,status:"exception",failure:String(e?.message??e)};}
   }));
  },group);
  observed.push(...batch);
  if((offset+24)%240===0||offset+24>=dates.length)
   console.log("MARTYRS_REACH_PROGRESS="+JSON.stringify({
    checked:observed.length,ready:observed.filter(x=>x.status==="ready").length,
    exactSourceMatches:observed.filter(x=>x.matched).length,
    errors:observed.filter(x=>x.status!=="ready").length}));
 }
}finally {await browser?.close();await new Promise(ok=>server.close(ok));}

const matched=observed.filter(x=>x.matched);
const failed=observed.filter(x=>x.status!=="ready");
const countByYear=Object.fromEntries([2024,2025,2026,2027,2028,2029].map(year=>{
 const rows=observed.filter(x=>x.date.startsWith(String(year)));
 return [year,{checked:rows.length,ready:rows.filter(x=>x.status==="ready").length,
  failed:rows.filter(x=>x.status!=="ready").length,
  exactSourceMatches:rows.filter(x=>x.matched).length,
  namedPerpetuaCommemorations:rows.filter(x=>x.namedMarch6Source).length}];
}));
const report={
 schema:"AO_1962_MULTIPLE_FEMALE_MARTYRS_ACTUAL_CALENDAR_REACHABILITY_V1",
 checkedAt:"2026-10-28",range:"2024-01-01_to_2029-12-31",
 method:"Local production index.html + AO_RUNTIME_V8.resolver.resolveDay for all civil dates; source path matching and source-owned Mass-form decision inspection; no date substitution or alternate Mass selection",
 inspectedDays:observed.length,byYear:countByYear,
 exactSourceMatchCount:matched.length,exactSourceMatches:matched,
 failures:failed,
 // A zero count here does not prove that source aliases, embedded parser
 // inheritance or expressly chosen votives are impossible.
 exclusions:["nested @Common reference chains not expanded",
  "user explicitly chosen votive/Requiem/nuptial/observed-day Masses",
  "local calendars or private observances not selected by default resolver",
  "any unrepresented future calendar additions"],
 interpretation:"An exact source owner match proves reachability under the default Calendar for that date; zero exact matches means only no explicit direct-owner selection among scanned dates, NOT universal unreachability.",
 modifiedProduction:false
};
assert.equal(observed.length,2192);
assert.equal(matched.length,observed.filter(x=>x.matched).length);
const march=observed.find(x=>x.date==="2026-03-06");
assert.ok(march&&march.namedMarch6Source&&march.sourcePath!=="Commune/C7b",
 "Must distinguish named March 6 commemoration from direct C7b owner.");
const years=Object.values(countByYear);
assert.equal(years.reduce((sum,y)=>sum+y.checked,0),2192);
await mkdir(resolve(root,"artifacts/mass"),{recursive:true});
await writeFile(resolve(root,"artifacts/mass/1962-c6b-c7b-calendar-reachability-2024-2029.json"),
 JSON.stringify(report,null,2)+"\n","utf8");
console.log("MARTYRS_REACH_SUMMARY="+JSON.stringify({
 checked:report.inspectedDays,byYear:report.byYear,
 exactSourceMatches:matched.map(x=>({date:x.date,mainId:x.mainId,
  sourcePath:x.sourcePath,match:x.matching,formResults:x.formResults})),
 failures:failed.slice(0,20),excludedAlternates:true,
 noClaimAboutNestedOrChosenMasses:true
}));
console.log("PASS 1962 actual Calendar source-owner reachability: 2024–2029 scanned; exclusions and exact-match results separately recorded.");
