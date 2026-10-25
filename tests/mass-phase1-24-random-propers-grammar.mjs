// Phase 1: read-only, reproducible grammar sampling of *real app* 1962 Propers.
// No spelling correction, no source-file mutation, no synthetic fixture, and
// no assertion that a mechanical flag proves a grammatical error.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,dirname,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const SEED="AO-P1-GRAMMAR-2026-10-18-v1";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const outfile=resolve(root,"artifacts/proper-grammar/phase1-random24-2026.json");
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
  ".json":"application/json;charset=utf-8",".css":"text/css;charset=utf-8",
  ".svg":"image/svg+xml",".woff2":"font/woff2",".webmanifest":"application/manifest+json"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const body=await readFile(p);
  res.writeHead(200,{"content-type":mime[extname(p)]??"application/octet-stream",
    "cache-control":"no-store"});res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,
   locale:"en-GB",serviceWorkers:"block"}),errors=[];
 page.on("pageerror",e=>errors.push(String(e.message)));
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
   {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
   null,{timeout:80000});
 const evidence=await page.evaluate(async seed=>{
  const {select1962CommemorationsForMassForm}=await import("/src/mass/1962-commemoration-form-source.js");
  const {recoverReaderProperOmissions}=await import("/src/mass/reader-proper-runtime-recovery.js");
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  const {assessPrintableProper}=await import("/src/calendar/print-proper.js");
  const form="MISSA_CANTATA_SIMPLE";
  const slotNames=["INTROIT","COLLECT_SET","EPISTLE_OR_LESSON","GRADUAL",
    "ALLELUIA_TRACT_SEQUENCE","GOSPEL","OFFERTORY","SECRET_SET","PREFACE",
    "COMMUNION","POSTCOMMUNION_SET"];
  // FNV-1a seed -> xorshift32; one Sunday and one weekday per calendar month.
  let rng=2166136261;
  for(const c of seed){rng^=c.charCodeAt(0);rng=Math.imul(rng,16777619)}
  const next=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)/4294967296};
  const shuffled=a=>{
   const values=[...a];
   for(let i=values.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[values[i],values[j]]=[values[j],values[i]]}
   return values;
  };
  const datesFor=(month,sunday)=>{
   const n=new Date(Date.UTC(2026,month,0)).getUTCDate(),items=[];
   for(let d=1;d<=n;d++){
    const isSunday=new Date(Date.UTC(2026,month-1,d)).getUTCDay()===0;
    if(isSunday===sunday)items.push(`2026-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`);
   }
   return shuffled(items);
  };
  const used=new Set(),results=[],unresolved=[];
  for(let month=1;month<=12;month++){
   for(const sunday of [true,false]){
    let found=false;
    for(const date of datesFor(month,sunday)){
     let day;
     try{day=await AO_RUNTIME_V8.resolver.resolveDay(date)}
     catch(e){unresolved.push({date,reason:String(e.message??e)});continue}
     const path=String(day?.proper?.data?.sourcePath??"").trim();
     if(day?.proper?.status!=="ready"||!path||used.has(path))continue;
     used.add(path);found=true;
     const original=day.proper.data,selected=select1962CommemorationsForMassForm({
       proper:day.proper,calendarResolution:day,form});
     const base=selected?.proper??day.proper;
     let resolved=base,recoveryFailure=null;
     try{resolved=await recoverReaderProperOmissions(base,{
       hostResolver:AO_RUNTIME_V8.resolver.properResolver,
       principalCelebrationId:day.day?.main?.id
     })}catch(e){recoveryFailure=String(e.message??e)}
     const actual=resolved?.data??resolved;
     const languages={};
     for(const language of ["en","fr"]){
      try{
       const mapped=properToReaderSlots(actual,{language});
       languages[language]={
        ready:mapped.ready,missing:mapped.missing,
        displayCorrections:mapped.displayTranslationCorrections??[],
        slots:Object.fromEntries(slotNames.map(k=>[k,{
         status:mapped.slots[k]?.status??"UNKNOWN",
         reason:mapped.slots[k]?.reason??null,
         paragraphs:(mapped.slots[k]?.data?.paragraphs??[]).map(x=>({
           id:x.id,kind:x.kind,latin:String(x.latin??""),
           vernacular:String(x.vernacular??""),sourcePath:x.sourcePath??null
         }))
        }]))
       };
      }catch(e){languages[language]={ready:false,error:String(e.message??e)}}
     }
     const print={};
     for(const language of ["en","fr"]){
      try{
       const p=assessPrintableProper(day,{language,massForm:form});
       print[language]={ok:p.ok,reason:p.reason??null,
         sections:p.ok?p.sections.map(x=>({kind:x.kind,latin:x.latin,vernacular:x.vernacular})):[]};
      }catch(e){print[language]={ok:false,error:String(e.message??e)}}
     }
     results.push({date,dayType:sunday?"SUNDAY":"NONSUNDAY",
       mainId:day.day?.main?.id??null,title:day.day?.main?.title??null,
       sourcePath:path,sourceStatus:day.proper?.status,selectedStatus:selected.status,
       selectedReason:selected.reason??null,recoveryFailure,
       commemorations:(day.day?.commemorations??[]).map(c=>({id:c.id,name:c.name??c.title??null})),
       languages,print});
     break;
    }
    if(!found)unresolved.push({month,dayType:sunday?"SUNDAY":"NONSUNDAY",
      reason:"NO_DISTINCT_READY_SOURCE"});
   }
  }
  return {schema:"ao.mass.grammar.phase1.review.v1",seed,year:2026,
    form,selectionRule:"2 per month, 1 Sunday and 1 non-Sunday, seeded shuffled dates; unique sourcePath; no cherry-picking",
    sampled:results,unresolved};
 },SEED);
 const flags=[];
 const suspicious=[
  ["UNRESOLVED_MACRO",/(?:\$Per Dominum|\$Deo gratias|&Gloria|\$Qui vivis|\bundefined\b|\bnull\b)/iu],
  ["HTML_ENTITY_LEAK",/&(?:nbsp|amp|lt|gt|quot|#\d+);/iu],
  ["DUPLICATE_WORD_EN",/\b(the the|and and|of of|to to|in in|that that|which which)\b/iu],
  ["DUPLICATE_WORD_FR",/\b(de de|la la|les les|et et|que que|qui qui|du du)\b/iu],
  ["BROKEN_SPACE_BEFORE_PUNCTUATION_EN",/\s+[,.!?](?:\s|$)/u],
  ["FR_CLOSING_GUILLEMET_SPACING",/[^\s]»/u],
  ["REPLACEMENT_CHARACTER",/\uFFFD/u],
  ["EMPTY_RENDERED_PASSAGE",/^\s*$/u],
 ];
 const scan=(s,details)=>{
  for(const [rule,re] of suspicious){
   if(rule.endsWith("_EN")&&details.language!=="en")continue;
   if(rule.startsWith("FR_")&&details.language!=="fr")continue;
   const m=String(s??"").match(re);
   if(m)flags.push({...details,rule,excerpt:String(s).slice(Math.max(0,(m.index??0)-100),Math.min(String(s).length,(m.index??0)+180))});
  }
 };
 for(const v of evidence.sampled){
  for(const language of ["en","fr"]){
   const owner=v.languages[language];
   if(!owner?.slots){flags.push({date:v.date,sourcePath:v.sourcePath,language,rule:"READER_UNAVAILABLE",error:owner?.error});continue}
   for(const [slot,body] of Object.entries(owner.slots)){
    if(body.status==="MISSING")flags.push({date:v.date,sourcePath:v.sourcePath,language,slot,rule:"SLOT_MISSING",error:body.reason});
    for(const item of body.paragraphs){
     scan(item.vernacular,{date:v.date,sourcePath:v.sourcePath,language,slot,paragraphId:item.id});
     if(item.latin.length>60&&item.vernacular===item.latin)
      flags.push({date:v.date,sourcePath:v.sourcePath,language,slot,
        paragraphId:item.id,rule:"POSSIBLE_UNTRANSLATED_PASSAGE",excerpt:item.latin.slice(0,220)});
    }
   }
  }
  for(const [slot,en] of Object.entries(v.languages.en?.slots??{})){
   const fr=v.languages.fr?.slots?.[slot];
   if(fr?.paragraphs?.length!==en.paragraphs?.length)flags.push({date:v.date,
      sourcePath:v.sourcePath,slot,rule:"LANGUAGE_PARAGRAPH_COUNT_MISMATCH",
      en:en.paragraphs?.length,fr:fr?.paragraphs?.length});
  }
 }
 evidence.flags=flags;
 evidence.summary={propers:evidence.sampled.length,uniqueSourcePaths:new Set(evidence.sampled.map(x=>x.sourcePath)).size,
   readerReadyBoth:evidence.sampled.filter(x=>x.languages.en?.ready&&x.languages.fr?.ready).length,
   printReadyBoth:evidence.sampled.filter(x=>x.print.en?.ok&&x.print.fr?.ok).length,
   automatedFlags:flags.length,byRule:Object.fromEntries(
    [...new Set(flags.map(f=>f.rule))].map(x=>[x,flags.filter(f=>f.rule===x).length]))};
 await mkdir(dirname(outfile),{recursive:true});
 await writeFile(outfile,JSON.stringify(evidence,null,2)+"\n","utf8");
 console.log("AO_P1_GRAMMAR_SUMMARY="+JSON.stringify(evidence.summary));
 console.log("AO_P1_GRAMMAR_MANIFEST="+JSON.stringify(evidence.sampled.map(v=>({
   date:v.date,kind:v.dayType,main:v.mainId,source:v.sourcePath,
   en:v.languages.en?.ready,fr:v.languages.fr?.ready}))));
 for(const f of flags)console.log("AO_P1_GRAMMAR_FLAG="+JSON.stringify(f));
 for(const v of evidence.sampled){
  const rows=v.languages.en?.slots??{};
  for(const key of ["INTROIT","GRADUAL","ALLELUIA_TRACT_SEQUENCE","COLLECT_SET","POSTCOMMUNION_SET"]){
   const en=(rows[key]?.paragraphs??[]).map(x=>x.vernacular).join("\n");
   const fr=(v.languages.fr?.slots?.[key]?.paragraphs??[]).map(x=>x.vernacular).join("\n");
   console.log("AO_P1_GRAMMAR_REVIEW="+JSON.stringify({date:v.date,source:v.sourcePath,
     slot:key,en:en.slice(0,700),fr:fr.slice(0,700)}));
  }
 }
 assert.equal(evidence.sampled.length,24,"Must capture all 24 distinct source Propers before accepting a sample");
 assert.equal(evidence.summary.uniqueSourcePaths,24,"Duplicate Propers are not a valid random sample");
 assert.deepEqual(errors,[],"Actual browser runtime errors detected during grammar sample");
 console.log("AO_P1_GRAMMAR_ARTIFACT=artifacts/proper-grammar/phase1-random24-2026.json");
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
