// Ordo title/commemoration text audit. This is intentionally READ-ONLY.
// Inspect ALL 2026 source-year entries, plus 48 stratified date-resolution
// outputs including actual Calendar titleOf() projection for EN and FR.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,dirname,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/calendar-ordo-grammar/ordo-2026-year-plus-48.json");
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
 ".json":"application/json;charset=utf-8",".css":"text/css;charset=utf-8",
 ".svg":"image/svg+xml",".woff2":"font/woff2"};
const srv=http.createServer(async(req,res)=>{
 try{
  const p=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const b=await readFile(p);res.writeHead(200,{"content-type":mime[extname(p)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(b);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise(ok=>srv.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block",viewport:{width:390,height:844}}),errors=[];
 page.on("pageerror",e=>errors.push(String(e.message)));
 await page.goto("http://127.0.0.1:"+srv.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
  null,{timeout:80000});
 const findings=await page.evaluate(async()=>{
  const {calendarObservanceAlias}=await import("/src/calendar/observance-title.js");
  const {observedCommemorationLabels}=await import("/src/calendar/observed-commemoration-labels.js");
  const {serialize1962CalendarMonth}=await import("/src/calendar/export-ics.js");
  const resolver=AO_RUNTIME_V8.resolver;
  const first=await resolver.resolveDay("2026-01-01");
  if(first.status!=="ready")throw Error("Calendar source not ready");
  const {cal}=await resolver.calendarEngine.getCalendar(2026);
  const yearRows=[...cal.entries()].filter(([date])=>date.startsWith("2026-")).sort((a,b)=>a[0].localeCompare(b[0]));
  const sourceOrdo=yearRows.map(([date,entry])=>({
    date,main:entry.celebration?.[0]??null,
    commemorations:entry.commemoration??[],
    sourceObservedMainCount:entry.celebration?.length??0,
  }));
  // Deterministic random sample with equal month coverage, two Sundays and
  // two non-Sundays per month. Do not select on suspected errors.
  let rng=2166136261;
  for(const c of "AO-ORDO-GRAMMAR-2026-10-18-V1"){rng^=c.charCodeAt(0);rng=Math.imul(rng,16777619)}
  const next=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)/4294967296};
  const shuffle=values=>{let a=[...values];for(let i=a.length-1;i>0;i--){
    const j=Math.floor(next()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const sampleDates=[];
  for(let m=1;m<=12;m++){
   for(const sunday of [true,false]){
    const eligible=sourceOrdo.map(x=>x.date).filter(date=>
      Number(date.slice(5,7))===m &&
      (new Date(date+"T12:00:00Z").getUTCDay()===0)===sunday);
    sampleDates.push(...shuffle(eligible).slice(0,2));
   }
  }
  const exceptions=["2026-12-11","2026-06-30","2026-10-18","2026-12-04",
    "2026-05-16","2026-10-03","2026-12-02","2026-06-19","2026-07-21"];
  const extract=r=>{
    const p=r?.proper?.status==="ready"?r.proper.data:null,d=r?.day?.main??null;
    const label=lang=>{
      const alias=calendarObservanceAlias(r,lang);
      const raw=(lang==="fr"?(p?.nameFr||p?.title?.fr||p?.name||d?.titleFr||d?.nameFr||d?.title):
        (p?.name||p?.title?.en||d?.title||d?.name));
      return {visible:String(alias||raw||(lang==="fr"?"Jour liturgique":"Liturgical day")),
       alias:alias??null,origin:alias?"CANONICAL_ALIAS":lang==="fr"?(p?.nameFr?"PROPER_FR":p?.title?.fr?"PROPER_TITLE_FR":p?.name?"PROPER_NAME_FALLBACK":d?.titleFr?"DAY_TITLE_FR":d?.nameFr?"DAY_NAME_FR":"DAY_TITLE"):(p?.name?"PROPER_NAME":p?.title?.en?"PROPER_TITLE_EN":"DAY_TITLE"),
       commemorations:observedCommemorationLabels(r,{language:lang}).map(x=>x.name)};
    };
    return {
      date:r.date,status:r.status,mainId:d?.id??null,sourceMainTitle:d?.title??null,
      sourceMainTitleFr:d?.titleFr??d?.nameFr??null,
      sourceRank:d?.rank??null,sourcePath:p?.sourcePath??null,
      properName:p?.name??null,properNameFr:p?.nameFr??null,
      properRank:p?.rank??null,properStatus:r?.proper?.status??null,
      commemorationSources:(r?.day?.commemorations??[]).map(c=>({
       id:c.id??null,title:c.title??null,titleFr:c.titleFr??null,name:c.name??null
      })),
      en:label("en"),fr:label("fr")
    };
  };
  const sampled=[],supplement=[],unresolved=[];
  for(const date of [...new Set([...sampleDates,...exceptions])]){
    let r;
    try{r=await resolver.resolveDay(date)}
    catch(e){unresolved.push({date,error:String(e.message??e)});continue}
    const entry=extract(r);
    (sampleDates.includes(date)?sampled:supplement).push(entry);
  }
  const textFlags=[],scan=(value,ctx)=>{
    const v=String(value??"");
    for(const [rule,re] of [
      ["UNRESOLVED_SOURCE_TOKEN",/(?:\b(?:undefined|null|NaN)\b|\{[A-Z_]+\}|(?:sancti|tempora|commune):[0-9a-z_-]+)/iu],
      ["OCR_REPLACEMENT_CHARACTER",/\uFFFD/u],
      ["DUPLICATE_WORD_EN",/\b(?:the the|of of|and and|for for|with with)\b/iu],
      ["DUPLICATE_WORD_FR",/\b(?:de de|la la|les les|des des|dans dans)\b/iu],
      ["SUSPICIOUS_LATIN_CASE_IN_VERNACULAR",/\b(?:Damasum|Petri|Mártyrem|Martyrum|Pontificem)\b/iu],
      ["MISSING_SPACE_EN_PUNCTUATION",/ ,/u],
    ]){
      const match=v.match(re);if(match)textFlags.push({...ctx,rule,excerpt:v.slice(Math.max(0,match.index-70),match.index+120)});
    }
  };
  for(const x of sourceOrdo){
    const principal=x.main??{};
    for(const [f,v] of Object.entries(principal))
      if(typeof v==="string"&&/title|name|description|note/i.test(f))
        scan(v,{date:x.date,surface:"SOURCE_ORDO",field:f});
    for(const c of x.commemorations){
      for(const [f,v] of Object.entries(c??{}))
        if(typeof v==="string"&&/title|name|description|note/i.test(f))
          scan(v,{date:x.date,surface:"SOURCE_COMMEMORATION",field:f});
    }
  }
  const fallback=[];
  for(const x of [...sampled,...supplement]){
    for(const lang of ["en","fr"]){
      scan(x[lang].visible,{date:x.date,surface:"CALENDAR_VISIBLE_TITLE",language:lang,field:"title"});
      for(const [i,title] of x[lang].commemorations.entries())
        scan(title,{date:x.date,surface:"CALENDAR_VISIBLE_COMMEMORATION",language:lang,index:i});
    }
    if(x.fr.origin==="PROPER_NAME_FALLBACK"&&x.sourceMainTitleFr&&
       x.fr.visible!==x.sourceMainTitleFr)
      fallback.push({date:x.date,properName:x.properName,dayTitleFr:x.sourceMainTitleFr,
        shownFrench:x.fr.visible});
  }
  // ICS is an additional shipped Ordo output, distinct from on-screen day
  // titles: exercise every complete sampled calendar month through export.
  const exportSamples=[];
  for(let m=1;m<=12;m++){
    const date="2026-"+String(m).padStart(2,"0");
    const dates=sourceOrdo.filter(x=>x.date.startsWith(date)).map(x=>x.date);
    // Run full month export only on months where all days have actual resolved
    // source data, to avoid pretending candidate metadata are final.
    const rows=sampled.concat(supplement).filter(x=>x.date.startsWith(date));
    exportSamples.push({month:date,sampledDays:rows.length,complete:false,
      reason:"Full-month source resolution not performed in this audit; ICS day/title parity separately gated"});
  }
  return {schema:"ao.calendar.ordo.language-qa.v1",
    year:2026,sourceOrdo,sourceDayCount:sourceOrdo.length,seed:"AO-ORDO-GRAMMAR-2026-10-18-V1",
    selection:"2 Sunday + 2 non-Sunday random dates per month; 48 sampled dates + 9 known-risk sentinel days",
    sampled,supplement,exceptions,unresolved,flags:textFlags,frenchFallbackCandidates:fallback,
    exportSamples};
 });
 assert.equal(findings.sourceDayCount,365,"Incomplete 2026 Ordo source");
 assert.equal(findings.sampled.length,48,"Expected 48 sampled resolved Ordo days");
 assert.equal(findings.sampled.filter(x=>x.fr.visible&&x.en.visible).length,48);
 assert.deepEqual(errors,[],"Ordo browser evaluation threw");
 const allResolved=[...findings.sampled,...findings.supplement];
 const totals={rawDayRecords:findings.sourceDayCount,
   rawDaysWithFrenchTitle:findings.sourceOrdo.filter(x=>x.main?.titleFr||x.main?.nameFr).length,
   actualResolvedRandomDays:findings.sampled.length,
   sameENFRHeadingsInRandomSample:findings.sampled.filter(x=>x.en.visible===x.fr.visible).length,
   properNameFrEqualsEnglishInRandomSample:findings.sampled.filter(x=>x.properName&&x.properName===x.properNameFr).length,
   sampledDaysWithCommemorations:findings.sampled.filter(x=>x.en.commemorations.length).length,
   sampledDaysWithUntranslatedFrenchCommemorations:findings.sampled.filter(x=>x.en.commemorations.length&&JSON.stringify(x.en.commemorations)===JSON.stringify(x.fr.commemorations)).length,
   allResolvedSameENFRHeadings:allResolved.filter(x=>x.en.visible===x.fr.visible).length,
   allResolvedProperNameFrEqualsEnglish:allResolved.filter(x=>x.properName&&x.properName===x.properNameFr).length,
   
   exceptionDates:findings.supplement.length,unresolved:findings.unresolved.length,
   sourceOrdoFlags:findings.flags.filter(x=>x.surface==="SOURCE_ORDO"||x.surface==="SOURCE_COMMEMORATION").length,
   displayedFlags:findings.flags.filter(x=>x.surface.startsWith("CALENDAR_VISIBLE")).length,
   possibleFrenchFallbackLeaks:findings.frenchFallbackCandidates.length};
 await mkdir(dirname(output),{recursive:true});
 await writeFile(output,JSON.stringify({...findings,totals},null,2)+"\n");
 console.log("ORDO_QA_TOTALS="+JSON.stringify(totals));
 for(const x of findings.sampled.concat(findings.supplement))
   console.log("ORDO_QA_ROW="+JSON.stringify({date:x.date,mainId:x.mainId,sourcePath:x.sourcePath,
    en:x.en.visible,fr:x.fr.visible,frOrigin:x.fr.origin,
    enComms:x.en.commemorations,frComms:x.fr.commemorations,
    dayTitleFr:x.sourceMainTitleFr,properName:x.properName,properNameFr:x.properNameFr}));
 for(const f of findings.flags)console.log("ORDO_QA_FLAG="+JSON.stringify(f));
 for(const f of findings.frenchFallbackCandidates)console.log("ORDO_QA_FR_FALLBACK="+JSON.stringify(f));
 console.log("PASS Ordo read-only source-year plus final calendar-title audit");
}finally{await browser?.close();await new Promise(ok=>srv.close(ok))}
