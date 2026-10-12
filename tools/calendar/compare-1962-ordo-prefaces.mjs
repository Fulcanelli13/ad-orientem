#!/usr/bin/env node
// Ordo discrepancy discovery, not liturgical approval. May contain genuine
// optional/local/votive differences, PDF column ambiguities, or source defects.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,dirname,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const [input,output]=process.argv.slice(2);
if(!input||!output)throw Error("Usage: node compare-1962-ordo-prefaces.mjs OrdoRows.json Out.json");
const ordo=JSON.parse(readFileSync(input,"utf8"));
assert.equal(ordo.stats.uniquePrintedDates,364,"Requires complete source PDF date index");
const primary=new Map([
 ["holy trinity","HOLY_TRINITY"],["trinity","HOLY_TRINITY"],
 ["holy spirit","HOLY_GHOST"],["holy ghost","HOLY_GHOST"],
 ["bvm","BVM"],["nativity","NATIVITY"],["epiphany","EPIPHANY"],["easter","EASTER"],
 ["ascension","ASCENSION"],["sacred heart","SACRED_HEART"],["advent","ADVENT"],["lent","LENT"],
 ["passion","PASSION"],["christ the king","CHRIST_KING"],["apostles","APOSTLES"],["st. joseph","ST_JOSEPH"],
 ["for the dead","DEAD"],["common","COMMON"]
]);
const order=[...primary.keys()].sort((a,b)=>b.length-a.length);
const expected=x=>{
 const str=String(x??"").toLowerCase();
 for(const k of order)if(str.includes(k))return primary.get(k);
 return null;
};
const observed=text=>{
 const val=String(text??"").split("\n")[0].normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
 if(/\btrinitat/.test(val))return"HOLY_TRINITY";
 if(/spiritu sancto/.test(val))return"HOLY_GHOST";
 if(/maria virg|beata maria/.test(val))return"BVM";
 if(/communi|common/.test(val))return"COMMON";
 if(/nativit/.test(val))return"NATIVITY";
 if(/epiphan/.test(val))return"EPIPHANY";
 if(/pasch|paques/.test(val))return"EASTER";
 if(/ascen/.test(val))return"ASCENSION";
 if(/cordis|coeur/.test(val))return"SACRED_HEART";
 if(/adv/.test(val))return"ADVENT";
 if(/quadragesima|car[eê]me/.test(val))return"LENT";
 if(/passion|croix/.test(val))return"PASSION";
 if(/regis|christi regis/.test(val))return"CHRIST_KING";
 if(/apostol/.test(val))return"APOSTLES";
 if(/ioseph|joseph/.test(val))return"ST_JOSEPH";
 if(/defunctor|morts/.test(val))return"DEAD";
 return"UNCLASSIFIED";
};
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
 const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://local").pathname));
 if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
 const bytes=await readFile(path);
 res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});res.end(bytes);
 }catch(err){res.writeHead(err.code==="ENOENT"?404:500);res.end(err.message);}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function"&&globalThis.AO_R17_BROWSER_ENTRY?.installed,{timeout:90000});
 const runtime=await page.evaluate(async dates=>{
  const resolver=globalThis.AO_RUNTIME_V8.resolver;
  const values=[];
  for(const date of dates){
   try{
    const result=await resolver.resolveDay(date);
    const pre=result?.proper?.data?.preface;
    values.push({date,status:result?.status,mainId:result?.day?.main?.id,
      mainTitle:result?.day?.main?.title,properStatus:result?.proper?.status,
      prefaceHeading:String(pre?.lat??pre?.la??"").split("\n")[0].slice(0,100),
      decision:result?.prefaceDecision?.id??null,
      commemorationCount:result?.day?.commemorations?.length??0});
   }catch(err){values.push({date,error:String(err)})}
  }
  return values;
 },ordo.rows.map(x=>x.date));
 const byDate=new Map(runtime.map(x=>[x.date,x]));
 const rows=ordo.rows.map(x=>{
  const matched=byDate.get(x.date);
  const ordoCat=expected(x.prefaceKeywordCandidate??x.rawPrefaceColumn);
  const actualCat=observed(matched?.prefaceHeading);
  return {date:x.date,printedPage:x.sourcePdfPage,sourcePrincipalExcerpt:x.provisionalPrincipalText,
   ordoPrefaceCell:x.rawPrefaceColumn,ordoCategoryCandidate:ordoCat,
   resolvedMainId:matched?.mainId??null,resolvedMainTitle:matched?.mainTitle??null,
   runtimeStatus:matched?.status??"NOT_RESOLVED",runtimeProperStatus:matched?.properStatus??null,
   resolvedPrefaceHeading:matched?.prefaceHeading??null,
   actualPrefaceCategory:actualCat,sourcePrefaceDecision:matched?.decision??null,
   commemorationCount:matched?.commemorationCount??0,
   categoryMatch:ordoCat?ordoCat===actualCat:null,
   reviewStatus:matched?.error?"RUNTIME_ERROR":
    !ordoCat?"ORDO_COLUMN_NOT_CERTAIN":
    actualCat==="UNCLASSIFIED"?"PREFACE_HEADING_UNCLASSIFIED":
    ordoCat===actualCat?"PROVISIONAL_CATEGORY_MATCH":"SOURCE_AND_CALENDAR_REVIEW_REQUIRED",
   editionProof:false,localVariationExcluded:false,fullyCertified:false,approvedForApp:false};
 });
 const count=k=>rows.filter(x=>x.reviewStatus===k).length;
 const stats={checkedDates:rows.length,expectedDates:364,
  provisionalCategoryMatches:count("PROVISIONAL_CATEGORY_MATCH"),
  reviewRequired:count("SOURCE_AND_CALENDAR_REVIEW_REQUIRED"),
  ocrUnknown:count("ORDO_COLUMN_NOT_CERTAIN"),
  unclassified:count("PREFACE_HEADING_UNCLASSIFIED"),
  runtimeErrors:count("RUNTIME_ERROR"),publicationApproved:0};
 const result={schema:"MASS_1962_ORDO_FULL_YEAR_PREFACE_DISCREPANCY_TRIAGE_V1",
  date:"2026-10-12",sourceOrdo:ordo.sourceUrl,sourceFile:input,
  governingRule:"1962 Roman Missal rubrics: actual principal Mass proper Preface precedes seasonal and Common; a mere commemoration does not change it.",
  note:"Algorithm compares broad Preface categories against preliminary PDF text-column OCR. Differences are review candidates; no authority to change Mass selection without page/rubric confirmation. Ordo has optional local/votive cases.",
  stats,rows,releaseGate:"RESEARCH_ONLY"};
 mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(result,null,2)+"\n");
 console.log("ORDO_PREFACE_364="+JSON.stringify({stats,sampleDiscrepancies:rows.filter(x=>x.reviewStatus==="SOURCE_AND_CALENDAR_REVIEW_REQUIRED").slice(0,22).map(x=>({date:x.date,ordo:x.ordoPrefaceCell,selected:x.resolvedPrefaceHeading,main:x.resolvedMainId}))}));
 if(stats.checkedDates!==364)throw new Error("Missing full-year data");
 if(stats.runtimeErrors)throw new Error("Resolver errors on "+stats.runtimeErrors+" dates");
}finally{await browser?.close();await new Promise(done=>server.close(done))}
