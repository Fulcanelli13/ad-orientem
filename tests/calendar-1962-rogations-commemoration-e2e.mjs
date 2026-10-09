import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
  try{
    const loc=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname),file=resolve(root,"."+loc);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const data=await readFile(file);
    res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(data);
  }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:45000});
 const dates=["2024-05-06","2027-05-03","2024-06-15","2027-07-17","2027-06-30","2027-08-15","2027-11-30","2027-12-08","2024-12-08",
   "2024-10-27","2027-10-31","2026-10-25","2024-01-07","2027-01-03","2027-01-10","2027-05-23","2028-08-06","2026-11-01","2024-12-04","2027-12-04","2026-12-04","2022-12-04",
   "2024-01-25","2027-01-25","2024-02-22","2027-02-22",
   "2024-05-16","2024-06-12","2027-06-12","2024-10-03",
   "2024-03-28","2024-03-30","2027-03-25","2027-03-27"];
 const result=[];
 for(const date of dates){
   const row=await page.evaluate(async date=>{
     const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
     const p=r?.proper?.data;
     const {calendarObservanceAlias}=await import("/src/calendar/observance-title.js");
     return {date,status:r?.status,properStatus:r?.proper?.status,error:r?.error||null,diagnosticErrors:r?.diagnostic?.errors||[],main:r?.day?.main,
       path:p?.sourcePath??p?.meta?.path??p?.source?.path??p?.path??null,
       properTitle:p?.name||p?.title,properColour:p?.color,canonicalColour:p?.canonicalColor,
       nameEn:calendarObservanceAlias(r,"en"),nameFr:calendarObservanceAlias(r,"fr"),
       inherited:p?.inheritedProper,calendarCommemorations:p?.calendarCommemorations,
       comms:(r?.day?.commemorations||[]).map(x=>({id:x.id,title:x.title,path:x.path,inseparable:x.inseparable})),
       collects:p?.collects?.length||0,secrets:p?.secrets?.length||0,postcommunions:p?.postcommunions?.length||0,
       lastCollect:p?.collects?.at(-1)||null,lastSecret:p?.secrets?.at(-1)||null,lastPostcommunion:p?.postcommunions?.at(-1)||null,
       languageCoverage:p?.languageCoverage||null,composedSourceIntegrity:p?.composedSourceIntegrity||null,
       firstCollect:p?.collects?.[0]||null,firstSecret:p?.secrets?.[0]||null,firstPostcommunion:p?.postcommunions?.[0]||null,
       temporale:(r?.day?.tempora||[]).map(x=>({id:x.id,path:x.path,color:x.color}))};
   },date);
   result.push(row);
 }
 console.log("1962_COMMEMORATIONS_AND_ROGATIONS="+JSON.stringify(result));
 for(const date of ["2024-05-06","2027-05-03"]){
   const item=result.find(x=>x.date===date);
   assert.equal(item.status,"ready",date+" resolver unavailable");
   assert.equal(item.main?.rank,4,date+" must retain IV-class weekday");
   assert.equal(item.main?.color,"White",date+" must be ordinary Eastertide white");
   assert.equal(item.properStatus,"ready",date+" must load full Eastertide Mass proper");
   assert.match(item.path||"",/Tempora\/Pasc5-0/,date+" must inherit Sunday Eastertide Mass, not unselected Rogation");
   assert.equal(item.properColour,"White",date+" Proper did not inherit white Mass colour");
   assert.ok(item.collects>=1&&item.secrets>=1&&item.postcommunions>=1,date+" must load all Mass orations");
 }
 // Genuine IV-class Saturday BVM Masses in the season after Pentecost
 // use C10t. Its pinned Latin root must resolve even if the redundant
 // obsolete Divinum Officium upstream duplicate is absent.
 for(const date of ["2024-06-15","2027-07-17"]){
   const row=result.find(x=>x.date===date);
   assert.equal(row.status,"ready",date+": Calendar unable to resolve");
   assert.equal(row.properStatus,"ready",date+": Mass of BVM Common source unavailable");
   assert.equal(row.main?.id,"commune:C10t:4:w",date+": wrong BVM Common identity");
   assert.equal(row.path,"Commune/C10t",date+": don't swap to a different seasonal Proper");
   assert.equal(row.properColour,"White",date+": Saturday BVM vestment colour wrong");
   for(const key of ["collects","secrets","postcommunions"])
     assert.ok(row[key]>=1,date+": BVM Latin Proper missing "+key);
 }
 const peter=result.find(x=>x.date==="2027-06-30");
 assert.match(peter.main?.id||"",/^sancti:06-30:/);
 assert.ok(peter.comms.some(x=>x.inseparable&&/Peter|Petrus/i.test(x.title)),"Petrine inseparable commemoration missing");
 assert.equal(peter.properStatus,"ready","Saint Paul Mass Proper must load");
 // The two apostolic prayers are already included in Sancti/06-30;
 // ordinary merge logic must not append duplicate collect by commemoration path.
 assert.ok(peter.collects>=1,"St Paul and St Peter must retain the combined Oratio");
 assert.equal(peter.comms.find(x=>x.inseparable)?.path,null,"Inseparable Petrine prayers are in the original St Paul Proper and must not be appended twice");
 for(const [date,id,path] of [
   ["2027-08-15",/tempora:Pent13-0:/,/Tempora\/Pent13-0/],
   ["2027-11-30",/tempora:Adv1-2:/,/Tempora\/Adv1-2/],
   ["2027-12-08",/tempora:Adv2-3:/,/Tempora\/Adv2-3/]
 ]){
   const item=result.find(x=>x.date===date),comm=item.comms.find(x=>id.test(x.id));
   assert.ok(comm,date+" must preserve privileged commemoration");
   assert.match(comm.path||"",path,date+" must point to existing source proper with Collect");
   assert.equal(item.properStatus,"ready",date+" Proper loading failed");
   assert.ok(item.collects>=2,date+" must include second Collect for privileged commemoration");
   assert.ok(item.secrets>=2,date+" must include second Secret for privileged commemoration");
   assert.ok(item.postcommunions>=2,date+" must include second Postcommunion");
 }


 // The 32 saint-name flags were reconciled by canonical identity.
 // Only four required a less-obscure bilingual Calendar headline.
 for(const [date,id,en,fr] of [
   ["2024-05-16","sancti:05-16:3:w","St Ubald","Saint Ubald"],
   ["2024-06-12","sancti:06-12:3:w","St John of Sahagún","Saint Jean de Sahagún"],
   ["2027-06-12","sancti:06-12:3:w","St John of Sahagún","Saint Jean de Sahagún"],
   ["2024-10-03","sancti:10-03:3:w","St Thérèse of the Child Jesus","Sainte Thérèse de l’Enfant-Jésus"]
 ]){
   const row=result.find(x=>x.date===date);
   assert.equal(row.properStatus,"ready",date+": original saint's Mass Proper failed");
   assert.equal(row.main?.id,id,date+": mismatched saint source identity");
   assert.equal(row.nameEn,en,date+": wrong English title");
   assert.equal(row.nameFr,fr,date+": wrong French title");
 }
 // Liturgical days and appointed Masses are different concepts; no title
 // alias should silently rename Holy Saturday's entire day to a Mass alone.
 for(const [date,id,title] of [
   ["2024-03-28",/^tempora:Quad6-4r:1:/,"Holy Thursday"],
   ["2027-03-25",/^tempora:Quad6-4r:1:/,"Holy Thursday"],
   ["2024-03-30",/^tempora:Quad6-6r:1:/,"Holy Saturday"],
   ["2027-03-27",/^tempora:Quad6-6r:1:/,"Holy Saturday"]
 ]){
   const row=result.find(x=>x.date===date);
   assert.equal(row.properStatus,"ready",date+": principal Paschal Mass Proper failed");
   assert.match(row.main?.id||"",id,date+": wrong day structure");
   assert.equal(row.main?.title,title,date+": liturgical-day title collapsed into ritual name");
   assert.equal(row.nameEn,null,date+": redundant alias added for day/Mass distinction");
 }
 // 1960 General Rubrics n.110: the two Apostles are inseparable.
 // Their main + reciprocal texts share *one conclusion*, counting as one
 // collect/secret/postcommunion group, not as two independent collects.
 // Lenten privileged feria on Feb 22 remains a second prayer group.
 for(const date of ["2024-01-25","2027-01-25"]){
   const row=result.find(x=>x.date===date);
   assert.equal(row.properStatus,"ready",date+": St Paul Conversion Proper absent");
   assert.ok(row.comms.some(x=>x.id==="sancti:01-25c:4:w"),date+": St Peter commemoration omitted");
   assert.ok(row.calendarCommemorations?.some(x=>x.path==="Sancti/01-25c"
     && x.prayerSourcePath==="Sancti/02-22" && x.inseparable && x.underOneConclusion),
     date+": reciprocal St Peter prayer not source-composed");
   for(const key of ["collects","secrets","postcommunions"])
     assert.equal(row[key],1,date+": Apostle pair must have one shared conclusion: "+key);
   for(const [field,petri,pauli] of [
     ["firstCollect",/Petro|Petri/i,/Pauli/i],
     ["firstSecret",/Petri|Petr/i,/Pauli/i],
     ["firstPostcommunion",/Petr/i,/Sanctific/i]
   ]){
     const prayer=row[field];
     assert.match(prayer?.lat||"",pauli,date+": St Paul omitted in joined "+field);
     assert.match(prayer?.lat||"",petri,date+": St Peter omitted in joined "+field);
     assert.equal((prayer?.lat||"").match(/Amen\./g)?.length||0,1,
       date+": apostolic "+field+" has more than one liturgical conclusion");
     assert.ok(prayer?.en?.length>100 && prayer?.fr?.length>100,
       date+": EN/FR reciprocal apostolic "+field+" incomplete");
   }
 }
 for(const date of ["2024-02-22","2027-02-22"]){
   const row=result.find(x=>x.date===date);
   assert.equal(row.properStatus,"ready",date+": Chair of St Peter Proper absent");
   assert.ok(row.comms.some(x=>x.id==="sancti:02-22c:4:r"),date+": St Paul commemoration omitted");
   assert.ok(row.comms.some(x=>/^tempora:Quad/.test(x.id)),date+": privileged Lenten feria omitted");
   assert.ok(row.calendarCommemorations?.some(x=>x.path==="Sancti/02-22c"
     && x.prayerSourcePath==="Sancti/02-22" && x.inseparable && x.underOneConclusion),
     date+": reciprocal St Paul prayer not composed");
   for(const key of ["collects","secrets","postcommunions"])
     assert.equal(row[key],2,date+": apostolic pair + Lenten feria, not three independent "+key);
   for(const [field,petri,pauli] of [
     ["firstCollect",/Petr/i,/Paul/i],
     ["firstSecret",/Petr/i,/Paul/i],
     ["firstPostcommunion",/Petr/i,/Sanctific/i]
   ]){
     const prayer=row[field];
     assert.match(prayer?.lat||"",petri,date+": main St Peter not in "+field);
     assert.match(prayer?.lat||"",pauli,date+": reciprocal St Paul source section not in "+field);
     assert.equal((prayer?.lat||"").match(/Amen\./g)?.length||0,1,
       date+": reciprocal Apostles must share one conclusion");
     assert.ok(prayer?.en?.length>100&&prayer?.fr?.length>100,
       date+": bilingual apostolic "+field+" incomplete");
   }
 }
 // The III-class St Peter Chrysologus on Dec 4 requires the III-class
 // Advent weekday plus a commemoration of St Barbara (ordos and 1962).
 // Both accompanying three-prayer sets must survive into the Mass Proper.
 for(const date of ["2024-12-04","2027-12-04","2026-12-04"]){
   const row=result.find(x=>x.date===date);
   assert.equal(row.status,"ready",date+": Calendar failed");
   assert.equal(row.properStatus,"ready",date+": Mass Proper unavailable");
   assert.match(row.main?.id||"",/^sancti:12-04:3:w$/,date+": Peter Chrysologus displaced");
   assert.ok(row.comms.some(x=>/tempora:Adv[1-4]-/.test(x.id)),date+": Advent feria missing");
   const barbara=row.comms.find(x=>x.id==="commemoration:12-04-barbara:4:r");
   assert.ok(barbara,date+": universal 1962 St Barbara commemoration omitted");
   assert.equal(barbara.path,"Sancti/12-04pl",date+": wrong pinned Barbara Collect owner");
   assert.ok(row.calendarCommemorations?.some(x=>x.path==="Sancti/12-04pl"),
     date+": Barbara missing from composed Mass orations");
   assert.equal(row.comms.length,2,date+": only Advent feria + Barbara should be commemorated");
   for(const key of ["collects","secrets","postcommunions"])
     assert.equal(row[key],3,date+": required triple of Peter, Advent, Barbara "+key+" absent");
   // Language coverage is recomputed AFTER appending Advent and St Barbara's
   // distinct sourced orations; otherwise the UI reports false completeness.
   const composedMinimum=row.collects+row.secrets+row.postcommunions;
   for(const language of ["en","fr"]){
     const coverage=row.languageCoverage?.[language];
     assert.ok(coverage,date+": missing "+language+" coverage after composition");
     assert.ok(coverage.expected>=composedMinimum,
       date+": post-composition "+language+" coverage omitted commemorative orations");
     assert.equal(coverage.available+coverage.missing.length,coverage.expected,
       date+": incoherent composed language coverage");
   }
   assert.equal(row.composedSourceIntegrity?.expectedLatinSections,row.languageCoverage.en.expected,
     date+": composed source scanner excluded a Latin-bearing prayer");

   const prayers=[row.lastCollect,row.lastSecret,row.lastPostcommunion];
   for(const [ix,prayer] of prayers.entries()){
     assert.ok(prayer&&typeof prayer==="object",date+": Barbara prayer object "+ix+" absent");
     for(const lang of ["lat","en","fr"]){
       const text=String(prayer[lang]||"");
       assert.ok(text.length>=80,date+": Barbara "+ix+" "+lang+" has empty or truncated text");
       assert.doesNotMatch(text,/\bN\.|\$Qui tecum/,
         date+": unfilled saint-name or liturgical conclusion in "+lang+" prayer "+ix);
     }
   }
   assert.match(row.lastCollect.lat,/Intercessio, quaesumus, Domine, beatae Barbarae/,
     date+": St Barbara's named Latin Collect changed");
   assert.match(row.lastSecret.lat,/Bárbaræ Vírginis/,
     date+": Barbara's Secret must have her name in the genitive");
   assert.match(row.lastPostcommunion.lat,/beáta Bárbara Vírgine/,
     date+": Barbara's Postcommunion requires her name in the ablative");
 }
 const deferred=result.find(x=>x.date==="2022-12-04");
 assert.ok(!deferred.comms.some(x=>x.id==="commemoration:12-04-barbara:4:r"),
   "Advent Sunday must not acquire Barbara commemoration from Dec 4 civil-date rule");
 // The 1960 General Rubrics 16(a), 17(d) explicitly prohibit the
 // Sunday commemoration under a feast of the Lord assigned to that Sunday.
 // This is a source-owner prayer rule, not only a Calendar label preference.
 for(const date of ["2024-10-27","2027-10-31","2026-10-25"]){
   const item=result.find(x=>x.date===date);
   assert.match(item.main?.id||"",/^sancti:10-DU:1:w$/,date+": wrong Lord's feast");
   assert.equal(item.comms.length,0,date+": Christ the King must omit the Sunday");
   assert.equal(item.calendarCommemorations?.length||0,0,date+": forbidden Sunday Mass orations were appended");
   for(const key of ["collects","secrets","postcommunions"])
     assert.equal(item[key],1,date+": unexpected extra "+key+" in Christ the King Proper");
 }
 for(const date of ["2024-01-07","2027-01-03","2027-01-10","2027-05-23","2028-08-06"]){
   const item=result.find(x=>x.date===date);
   assert.equal(item.status,"ready",date+": Lord's feast day unresolved");
   assert.ok(!item.comms.some(x=>/^tempora:.*-0/.test(x.id||"")),
     date+": Sunday commemoration added beneath an assigned Lord's feast");
 }
 // Do not generalize this suppression to feasts of saints or Our Lady:
 // e.g. a first-class feast replacing a second-class Sunday may require
 // privileged Sunday orations, as on the Assumption or All Saints.
 const saintsSunday=result.find(x=>x.date==="2026-11-01");
 assert.ok(saintsSunday.comms.some(x=>/^tempora:.*-0/.test(x.id||"")),
   "All Saints must retain the privileged Sunday commemoration");
 assert.ok(saintsSunday.collects>=2&&saintsSunday.secrets>=2&&saintsSunday.postcommunions>=2,
   "All Saints must retain the three Sunday orations");
 console.log("PASS 1962 ordinary Rogations, Christ the King no-Sunday-commemoration, other Lord feasts and privileged saint/Advent/Petrine commemorations");
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
