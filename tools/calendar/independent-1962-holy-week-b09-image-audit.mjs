// 1962 Vatican Missal printed IMAGE witness, not an app-source self-comparison.
// 21 editorial text/structure anchors on 15 page images courtesy CMMA,
// surfaced through GregoBase; B05's 17 full-text holds remain OPEN.
// Never infer that a matching incipit equals full Latin/EN/FR rite certification.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {buildPalmPayload} from "../../src/mass/reader-palm.js";
import {buildGoodFridayReader} from "../../src/mass/reader-good-friday.js";
import {buildEasterVigilReader} from "../../src/mass/reader-easter-vigil.js";
import {compileMassPlan,makeResolvedMass} from "../../src/mass/session-engine.js";
const base=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const load=async p=>JSON.parse(await readFile(resolve(base,p),"utf8"));
const [manifest,b04,b05,palm,friday,vigil,core,extra]=await Promise.all([
 load("data/mass/independent-1962-holy-week-b09-original-image-witness.v1.json"),
 load("data/mass/independent-1962-holy-week-b04.v1.json"),
 load("data/mass/independent-1962-holy-week-b05-text-audit.v1.json"),
 load("data/presentation/reader-palm.v1.json"),
 load("data/presentation/reader-good-friday.v1.json"),
 load("data/presentation/reader-easter-vigil.v1.json"),
 load("data/mass/special-days-core.v1.1.json"),
 load("data/mass/special-days-extension.v1.3.json"),
]);
const fold=v=>String(v??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/œ/gi,"oe").toLowerCase().replace(/j/g,"i")
 .replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();
assert.equal(manifest.schema,"AO_MR1962_HOLY_WEEK_B09_VATICAN_IMAGE_WITNESS_V1");
assert.equal(manifest.witnesses.length,21,"Image witness must not silently lose an entry");
assert.equal(new Set(manifest.witnesses.map(x=>x.imageUrl)).size,15);
assert.equal(new Set(manifest.witnesses.map(x=>x.id)).size,21);
assert.equal(manifest.certification.status,"PARTIAL_IMAGE_ANCHORS_ONLY");
assert.equal(b05.auditItems.length,17,"Separate 17 uncollated B05 issues remain visible");
assert.equal(b05.certification,"NOT_CERTIFIED");
assert.equal(b04.rites.length,4);
const assetRoots={palm,friday,vigil};
const checkPath=(root,p)=>p.replace(/\[(\d+)\]/g,".$1")
 .split(".").reduce((o,k)=>o?.[k],root);
const results=[];
for(const a of manifest.witnesses){
 assert.ok(manifest.rites.includes(a.rite),"Invalid 1962 rite "+a.rite);
 assert.equal(a.imageUrl,"https://gregobase.selapa.net/sources/42/"+a.scanId+".png");
 assert.equal(a.scanId,a.printedPage+82,"Printed folio has incorrect CMMA scan pointer");
 assert.ok(a.reading.length>=15,"Weak textual image witness");
 assert.match(a.evidenceClass,/visually-observed/);
 let observed=null,status="IMAGE_RUBRIC_ONLY__TEXT_REVIEW_NOT_APPLICABLE";
 if(a.runtimePath&&a.runtimePath!=="resolvedProper.introit.lat"){
   observed=checkPath(assetRoots,a.runtimePath);
   status=typeof observed!=="string"?"RUNTIME_PATH_MISSING":
     fold(observed).includes(fold(a.reading))?"IMAGE_LATIN_INCIPIT_AGREES":
       "IMAGE_LATIN_INCIPIT_DIFFERS";
 }
 results.push({...a,status,actualExcerpt:typeof observed==="string"?observed.slice(0,220):null});
 console.log("MR62_B09_WITNESS "+JSON.stringify({id:a.id,page:a.printedPage,
   sourceImage:a.imageUrl,status,actualExcerpt:status==="IMAGE_LATIN_INCIPIT_DIFFERS"?
     String(observed).slice(0,160):undefined}));
}
// The exact 1962 distinct-rite engines are NOT regular Missa Cantata cards.
assert.equal(extra.graphs.PALM.length,7);
assert.equal(core.graphs.GF.length,56);
assert.ok(core.graphs.EV.length>=30);
const palmBuilt=buildPalmPayload({graph:extra.graphs.PALM,payload:palm});
const gfBuilt=buildGoodFridayReader({graph:core.graphs.GF,payload:friday});
const evBuilt=buildEasterVigilReader({graph:core.graphs.EV,payload:vigil});
assert.equal(palmBuilt.cards.length,7);
assert.ok(gfBuilt.ordinaryMassGraphActive===false);
assert.ok(evBuilt);
const specialPlan=compileMassPlan(makeResolvedMass({
 date:"2026-04-03",form:"SOLEMN",presentationMode:"MISSAL",
 calendarCelebration:{id:"good-friday",type:"CALENDAR"},distinctRite:"GOOD_FRIDAY",
}));
assert.equal(specialPlan.kind,"DISTINCT_RITE");
assert.equal(specialPlan.ordinaryMassAssumptionsAllowed,false);
// The printed 1962 Good Friday order is Passion, nine Solemn Prayers,
// veneration, Communion; it cannot be replaced by a Eucharistic Mass.
const graphIds=core.graphs.GF.map(x=>x.id);
const before=(a,b)=>graphIds.indexOf(a)>=0&&graphIds.indexOf(b)>=0&&
  graphIds.indexOf(a)<graphIds.indexOf(b);
assert.ok(before("GF-PASS-310","GF-SOP-400"));
assert.ok(before("GF-SOP-09-R","GF-X-510"));
assert.ok(before("GF-VEN-600","GF-COM-800"));
assert.equal(friday.solemnPrayers.length,9);
assert.equal(friday.cross.unveiling.repetitions,3);
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",
 ".css":"text/css",".json":"application/json",".svg":"image/svg+xml",
 ".woff2":"font/woff2",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
 try{
 const pathname=resolve(base,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
 if(pathname!==base&&!pathname.startsWith(base+sep)){res.writeHead(403);res.end();return}
 const bytes=await readFile(pathname);
 res.writeHead(200,{"content-type":mime[extname(pathname)]??"application/octet-stream"});
 res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
  null,{timeout:80000});
 const actual=await page.evaluate(async()=>{
  const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay("2026-04-02");
  return {status:r?.status,properStatus:r?.proper?.status,
   main:r?.day?.main?.title??null,source:r?.proper?.data?.sourcePath??null,
   introit:r?.proper?.data?.introit?.lat??null};
 });
 const evidence=results.find(z=>z.id==="HOLY_THURSDAY_INTROIT");
 evidence.actualExcerpt=String(actual.introit??"").slice(0,220);
 evidence.status=actual.status==="ready"&&typeof actual.introit==="string"&&
  fold(actual.introit).includes(fold(evidence.reading))?
    "IMAGE_LATIN_INCIPIT_AGREES":"RUNTIME_OR_SOURCE_UNRESOLVED";
 console.log("MR62_B09_HOLY_THURSDAY_RUNTIME "+JSON.stringify(actual));
}finally{
 await browser?.close();
 await new Promise(done=>server.close(done));
}
const discrepancies=results.filter(x=>x.runtimePath&&x.status!=="IMAGE_LATIN_INCIPIT_AGREES");
const report={
 schema:"AO_MR1962_HOLY_WEEK_B09_IMAGE_ANCHORS_RUNTIME_REPORT",
 witness:manifest.source.imageIndex,sourceEdition:manifest.source.edition,
 scope:"21 image-located anchors on 15 printed leaves / four 1962 Holy Week rites",
 imageWitnesses:15,expectedClaims:21,
 textClaims:results.filter(x=>x.runtimePath).length,
 textMatches:results.filter(x=>x.status==="IMAGE_LATIN_INCIPIT_AGREES").length,
 evidenceOnlyRubricClaims:results.filter(x=>!x.runtimePath).length,
 discrepancies:discrepancies.map(x=>({id:x.id,page:x.printedPage,
   imageUrl:x.imageUrl,printedReading:x.reading,actual:x.actualExcerpt,
   status:x.status})),
 fullHolyWeekCollationCertified:false,
 b05OpenTextDefectsUnchanged:17,
 results};
await mkdir(resolve(base,"artifacts"),{recursive:true});
await writeFile(resolve(base,"artifacts/mass-1962-holy-week-b09-printed-image-report.json"),
 JSON.stringify(report,null,2)+"\n");
console.log("MR62_B09_SUMMARY "+JSON.stringify({imageLeaves:15,claims:21,
 textClaims:report.textClaims,textMatches:report.textMatches,
 failed:discrepancies.length,structuralClaims:report.evidenceOnlyRubricClaims,
 b05OpenTextDefects:17,fullHolyWeekCertified:false}));
if(process.argv.includes("--strict"))assert.deepEqual(discrepancies,[],
 "Printed source text and actual runtime deviate: see page-linked B09 report");
