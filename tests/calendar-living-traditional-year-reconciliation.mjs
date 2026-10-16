// 2026 production-resolver-backed living-calendar reconciliation.
// Runs ONLY in Playwright CI: a source sweep, not an alternative Ordo.
// Do not equate indexed canonizations with certified feast-date coverage.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/calendar-oracle");
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",".json":"application/json",
  ".css":"text/css;charset=utf-8",".svg":"image/svg+xml",".woff2":"font/woff2",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const name=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
    if(name!==root&&!name.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
    const bytes=await readFile(name);
    res.writeHead(200,{"content-type":mime[extname(name)]??"application/octet-stream","cache-control":"no-store"});
    res.end(bytes);
  }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
const report={
  schema:"AO_LIVING_TRADITIONAL_2026_SOURCE_RECONCILIATION_V1",
  year:2026,calendarBase:"PRODUCTION_1962_ROMAN_DAY_RESOLVER",
  assurance:"RUNTIME_RESOLVER_SWEEP_NOT_INDEPENDENT_LITURGICAL_CERTIFICATION",
  modernDateAuthority:"18_SOURCE_REVIEWED_RECORDS_ONLY",
  massAuthority:"NONE_AUTOMATIC",
  rows:[],exceptions:[]
};
try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({serviceWorkers:"block"});
  page.setDefaultTimeout(90000);
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:90000});
  const dates=Array.from({length:365},(_,i)=>new Date(Date.UTC(2026,0,i+1,12)).toISOString().slice(0,10));
  for(let i=0;i<dates.length;i+=20){
    const rows=await page.evaluate(async chunk=>{
      const {buildReviewedSanctoralCards}=await import("/src/calendar/reviewed-sanctoral-cards.js");
      const {canonical1962Commemorations,reconcileHonouredToday,reviewNewSaintMassChoice,
        base1962Identity}=await import("/src/calendar/traditional-day-adjudication.js");
      const read=await (await fetch("/data/calendar/living-sanctoral-read-model.v1.json")).json();
      const protectedList=await (await fetch("/data/calendar/cum-sanctissima-protected-third-class.review.v1.json")).json();
      const resolver=globalThis.AO_RUNTIME_V8.resolver;
      const identity={};
      for(const x of [...read.pilotPersons,...read.doctorRoster]){
        const person=x?.canonicalPersonId||x?.id;
        const source=x?.calendar1962?.principalId||x?.observanceSourceIdentity;
        if(person&&source)identity[base1962Identity(source)]=person;
      }
      return Promise.all(chunk.map(async date=>{
        try{
          const r=await resolver.resolveDay(date);
          const main=r?.day?.main?.id||null;
          if(!main||r?.status==="failed"||r?.date!==date)
            return {date,error:"1962_DAY_NOT_RESOLVED",main,status:r?.status??null};
          const commemorations=canonical1962Commemorations(r);
          const observedCommemorationIds=commemorations.map(x=>x.sourceId);
          const allRecords=read.observanceRegistry.observances.filter(x=>x.monthDay===date.slice(5));
          const all=buildReviewedSanctoralCards({
            date,jurisdiction:"US",observedPrincipalId:main,observedCommemorationIds,...read});
          const global=buildReviewedSanctoralCards({
            date,jurisdiction:"UNSPECIFIED",observedPrincipalId:main,observedCommemorationIds,...read});
          const merged=reconcileHonouredToday({
            resolution:r,secondaryCards:all,canonicalPersonForSourceId:identity});
          const sourceCardIds=new Set(all.map(x=>x.id));
          const originalProper=r?.proper?.data?.sourcePath||null;
          const matched=allRecords.filter(x=>["GENERAL_ROMAN_VATICAN_DECREE","GENERAL_ROMAN_PAPAL_ANNOUNCEMENT"].includes(x.authorityScope)&&
            x.publishedOn<=date);
          const options=matched.map(x=>{
            const saint=[...read.pilotPersons,...read.censusPersons].find(p=>p.id===x.subjectId);
            if(!saint)return {id:x.subjectId,status:"NOT_EVALUATED_NO_RECONCILED_PERSON"};
            try{
              const decision=reviewNewSaintMassChoice({
                date,saint,observedDay:r,protectedFeasts:protectedList.feasts,
                sourceObservance:x});
              return {id:x.subjectId,status:decision.status,reason:decision.reason,
                massInsertionAuthorized:decision.massInsertionAuthorized,
                selectedFormularyId:decision.selectedFormularyId};
            }catch(e){return {id:x.subjectId,status:"REVIEW_ERROR",error:String(e.message||e)}}
          });
          return {
            date,mainId:main,mainRank:r?.day?.main?.rank??null,
            sourceProper:originalProper,
            commemorationIds:observedCommemorationIds,
            commemorationDuplicates:observedCommemorationIds
              .filter((x,j)=>observedCommemorationIds.findIndex(y=>base1962Identity(y)===base1962Identity(x))!==j),
            sourceWitnesses:allRecords.map(x=>({subjectId:x.subjectId,scope:x.authorityScope,
              authority:x.universalStatus,publishedOn:x.publishedOn,monthDay:x.monthDay})),
            globalHonourIds:global.map(x=>x.id),
            usOptInHonourIds:all.map(x=>x.id),
            duplicateSubjectIds:merged.suppressedDuplicatePersonIds,
            crosswalkPresentForPrincipal:Boolean(identity[base1962Identity(main)]),
            crosswalkPresentForCommemorations:commemorations
              .filter(c=>Boolean(identity[c.identity])).map(x=>x.identity),
            optionalTraditionalMassReviews:options,
            massAutomaticallySelected:false,
            erroneousDuplicateCards:global.filter(c=>!sourceCardIds.has(c.id)).map(c=>c.id)
          };
        }catch(e){return {date,error:"REVIEW_EXCEPTION",detail:String(e?.stack||e)}}
      }));
    },dates.slice(i,i+20));
    report.rows.push(...rows);
  }
  const invariantDates=["2024-03-25","2024-04-08","2025-10-09","2027-03-25","2027-04-05"];
  report.historicDates=await page.evaluate(async ids=>{
    const {buildReviewedSanctoralCards}=await import("/src/calendar/reviewed-sanctoral-cards.js");
    const read=await (await fetch("/data/calendar/living-sanctoral-read-model.v1.json")).json();
    return Promise.all(ids.map(async date=>{
      const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
      const cards=buildReviewedSanctoralCards({
        date,jurisdiction:"UNSPECIFIED",observedPrincipalId:r?.day?.main?.id||null,...read});
      return {date,principal:r?.day?.main?.id||null,
        modernGlobalHonours:cards.map(x=>x.id),resolved:Boolean(r?.day?.main?.id)};
    }));
  },invariantDates);
  const witnessed=report.rows.flatMap(r=>r.sourceWitnesses||[]);
  const allDates=report.rows.filter(r=>r.sourceWitnesses?.length);
  const errors=report.rows.filter(r=>r.error);
  const repeats=report.rows.filter(r=>r.commemorationDuplicates?.length);
  const cross=report.rows.filter(r=>r.duplicateSubjectIds?.length);
  const badCards=report.rows.filter(r=>r.erroneousDuplicateCards?.length);
  const reviews=report.rows.flatMap(r=>r.optionalTraditionalMassReviews||[]);
  const declared=await readFile(resolve(root,"data/calendar/living-sanctoral-modern-observances.review.v1.json"),"utf8");
  const data=JSON.parse(declared);
  report.summary={
    scannedDates:report.rows.length,
    resolvedDates:report.rows.length-errors.length,
    failedDates:errors.length,
    modernDatedSourceWitnesses:witnessed.length,
    modernDistinctDates:allDates.length,
    reviewedObservanceRegistryRows:data.observances.length,
    worldwideVaticanDecreeRows:data.observances.filter(r=>r.universalStatus==="CERTIFIED_BY_DECREE").length,
    localOrHistoricalWitnessRows:data.observances.filter(r=>r.authorityScope.startsWith("USCCB_")).length,
    worldwideHolySeePrimaryRows:data.observances.filter(r=>["GENERAL_ROMAN_VATICAN_DECREE","GENERAL_ROMAN_PAPAL_ANNOUNCEMENT"].includes(r.authorityScope)).length,
    duplicate1962CommemorationDays:repeats.length,
    suppressedIdentityCollisionDays:cross.length,
    erroneousGlobalScopeDays:badCards.length,
    optionalTraditionalMassReviews:reviews.length,
    optionalTraditionalMassCandidates:reviews.filter(x=>x.status==="CANDIDATE_NEEDS_AUTHORITY_AND_RUBRICAL_REVIEW").length,
    automaticallySelectedMasses:0,
    fullModernSanctoralCoverageCertified:false,
    fullYearIndependentlyLiturgicallyCertified:false,
    historicalTransferSpotChecks:report.historicDates.length
  };
  report.exceptions=errors.map(x=>({date:x.date,type:x.error,details:x.detail??null}));
  await mkdir(out,{recursive:true});
  await writeFile(resolve(out,"living-traditional-2026-reconciliation.json"),JSON.stringify(report,null,2)+"\n","utf8");
  console.log("LIVING_TRADITIONAL_2026_AUDIT="+JSON.stringify(report.summary));
  console.log("LIVING_TRADITIONAL_COLLISIONS="+JSON.stringify(cross.map(x=>({
    date:x.date,principal:x.mainId,suppressed:x.duplicateSubjectIds}))));
  assert.equal(report.rows.length,365,"Must resolve all 365 civil dates");
  assert.equal(new Set(report.rows.map(x=>x.date)).size,365,"Every date exactly once");
  assert.equal(errors.length,0,"All 2026 historical resolver dates must resolve");
  assert.equal(badCards.length,0,"Unknown/local witnesses entered global calendar");
  assert.equal(repeats.length,0,"Duplicate historical commemoration source IDs require review");
  assert.equal(report.summary.reviewedObservanceRegistryRows,18);
  assert.equal(report.summary.worldwideVaticanDecreeRows,9);
  assert.equal(report.summary.localOrHistoricalWitnessRows,8);
  assert.equal(report.summary.worldwideHolySeePrimaryRows,10);
  assert.equal(report.rows.find(x=>x.date==="2026-10-09")?.mainId,"sancti:10-09:3:w");
  assert.deepEqual(report.rows.find(x=>x.date==="2026-10-09")?.globalHonourIds,["saint.john-henry-newman"]);
  assert.ok(report.rows.find(x=>x.date==="2026-10-09")?.optionalTraditionalMassReviews
    .every(x=>x.massInsertionAuthorized===false&&x.selectedFormularyId===null));
  assert.deepEqual(report.rows.find(x=>x.date==="2026-09-23")?.globalHonourIds,["saint.pio-pietrelcina"]);
  assert.equal(report.historicDates.find(x=>x.date==="2025-10-09").modernGlobalHonours.length,0);
  assert.ok(report.historicDates.every(x=>x.resolved));
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
