// Run: node tools/calendar/audit-2026-home-calendar-gospel-artwork.mjs
// Source-only 365-day audit. Requires the existing pinned 1962 DayResolver.
// No painting is automatically approved, changed, or released.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const output=resolve(root,"artifacts/calendar-gospel-home/2026-source-audit.json");
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
  ".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const dates=[];
for(let ms=Date.UTC(2026,0,1);ms<Date.UTC(2027,0,1);ms+=86400000)
  dates.push(new Date(ms).toISOString().slice(0,10));
assert.equal(dates.length,365);

const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,"http://127.0.0.1");
    const filename=resolve(root,"."+decodeURIComponent(url.pathname));
    if(filename!==root&&!filename.startsWith(root+sep)){
      res.writeHead(403);res.end();return;
    }
    const data=await readFile(filename);
    res.writeHead(200,{"content-type":MIME[extname(filename)]??"application/octet-stream",
      "cache-control":"no-store"});
    res.end(data);
  }catch(error){
    res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));
  }
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
let browser;
try {
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({serviceWorkers:"block"});
  page.setDefaultTimeout(90000);
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
    null,{timeout:90000});
  const rows=[];
  for(let i=0;i<dates.length;i+=8){
    const subset=dates.slice(i,i+8);
    const batch=await page.evaluate(async dayList=>{
      const provider=globalThis.AO_PHASE1_ART??null;
      const resolver=globalThis.AO_RUNTIME_V8.resolver;
      const {homeCalendarGospelArtworkEvidence}=await import(
        "/src/home/calendar-gospel-artwork-evidence.js");
      return Promise.all(dayList.map(async date=>{
        try{
          const resolution=await resolver.resolveDay(date);
          return homeCalendarGospelArtworkEvidence({date,resolution,artProvider:provider});
        }catch(error){
          return {date,status:"DAY_UNRESOLVED",gospel:{status:"NOT_VERIFIED",reference:null},
            homepageArtworkState:"NOT_CERTIFIED",error:String(error?.message??error)};
        }
      }));
    },subset);
    rows.push(...batch);
    if((i+8)%80===0||i+8>=dates.length)
      console.log("Inspected "+rows.length+"/365 observed day sources");
  }
  assert.equal(rows.length,365);
  assert.deepEqual(rows.map(row=>row.date),dates,"Calendar audit reordered dates");
  const count=(field,value)=>rows.filter(row=>field(row)===value).length;
  const report={
    schema:"AO_2026_CALENDAR_GOSPEL_HOME_ARTWORK_SOURCE_AUDIT_V1",
    generatedAt:new Date().toISOString(),year:2026,source:"Production 1962 DayResolver",
    scope:"GENERAL_ROMAN_1962_OBSERVED_PRINCIPAL_NOT_LOCAL_OR_VOTIVE_MASS",
    policies:[
      "GOSPEL_ONLY_WHEN_EXACT_PROPER_TEXT_OR_WITNESS_VALIDATED",
      "HISTORIC_GREEN_IS_NOT_APPROVED_ART",
      "EXACT_USER_DATE_PAINTING_MUST_MATCH_OBSERVED_PRINCIPAL",
      "RIGHTS_HELD_IMAGES_ARE_NOT_PUBLISHED",
      "CALENDAR_ART_AND_GOSPEL_SCENE_ARE_DISTINCT_RELEVANCE_CLAIMS",
      "NO_RENDER_OR_IMAGE_BYTE_VERIFICATION_FROM_THIS_AUDIT"
    ],
    totals:{
      dates:rows.length,
      observedPrincipalResolved:count(r=>r.status,"OBSERVED_PRINCIPAL_RESOLVED"),
      gospelCitationVerified:count(r=>r.gospel?.status,"VERIFIED_FROM_SELECTED_PROPER"),
      gospelCitationUnverified:count(r=>r.gospel?.status,"NOT_VERIFIED"),
      approvedHomepageDatePreviews:count(r=>r.homepageArtworkState,
        "APPROVED_DATE_PREVIEW_NOT_OFFLINE_CERTIFIED"),
      datePaintingSourceHolds:count(r=>r.homepageArtworkState,"APPROVED_ART_SOURCE_HELD"),
      legacyProperCandidates:rows.filter(r=>r.legacyCandidate).length,
      legacyCandidatesBlockedByUserPolicy:rows.filter(r=>
        r.legacyCandidate?.status==="EXCLUDED_BY_USER_ART_POLICY").length,
      actualImagesRenderedCertified:0,
      independentlyGospelMatchedPaintings:0
    },
    dates:rows
  };
  await mkdir(resolve(root,"artifacts/calendar-gospel-home"),{recursive:true});
  await writeFile(output,JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify(report.totals,null,2));
  console.log("Source audit: "+output);
} finally {
  if(browser)await browser.close();
  await new Promise(ok=>server.close(ok));
}
