// B04: image-checked independent Latin incipit/register versus the running
// canonical AO 1962 Proper resolver. Source of expected texts = page images,
// NOT the Divinum Officium file or this app's own Latin strings.
// No machine text matches can certify the REST of the printed Missal.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const manifest=JSON.parse(await readFile(resolve(root,
  "data/mass/printed-1962-july-image-collation-b04.v1.json"),"utf8"));
const prior=JSON.parse(await readFile(resolve(root,
  "data/mass/printed-1962-july-facsimile-b01.v1.json"),"utf8"));
assert.equal(manifest.schema,"AO_PRINTED_1962_JULY_B04_IMAGE_COLLATION_V1");
const priorByDay=new Map(prior.cases.map(x=>[x.date,x]));
assert.equal(manifest.witness.url,prior.witness.url,"Independent image must belong to the same original");
assert.deepEqual(manifest.witness.pageImagesInspected,[1,2,3,4,5,6,7,8,9,10,11]);
const count=manifest.cases.reduce((n,x)=>n+x.assertions.length,0);
assert.equal(count,34,"Image-witness register lost expected assertions");
assert.equal(manifest.cases.length,8);
const fieldNames=new Set(["introit","gradual","offertory","secret","postcommunion"]);
const pageSet=new Set(),distinct=new Set();
for(const row of manifest.cases){
  assert.ok(priorByDay.has(row.date),"B04 case missing B01 canonical rank/source: "+row.date);
  for(const claim of row.assertions){
    assert.ok(fieldNames.has(claim.field),"Unknown field");
    assert.ok(Number.isInteger(claim.index)&&claim.index>=0&&claim.index<3);
    assert.ok(Number.isInteger(claim.page)&&claim.page>=1&&claim.page<=11);
    assert.equal(claim.printedPage,532+claim.page);
    assert.equal(claim.pdfUrl,manifest.witness.url+"#page="+claim.page);
    assert.equal(claim.visualInspection,"page-image-observed-2026-10-12");
    assert.ok(claim.latinIncipit.length>=22,"Non-distinct image reading");
    const key=[row.date,claim.field,claim.index].join("|");
    assert.ok(!distinct.has(key),"Duplicate proof: "+key);distinct.add(key);
    if(claim.runtimeLatinVariant){
      assert.ok(["edition-word-division","edition-ae-vs-oe-spelling"].includes(claim.varianceType),
        "Known variants must carry independently checked edition differences");
      assert.notEqual(fold(claim.runtimeLatinVariant),fold(claim.latinIncipit),
        "Printed and runtime variants must actually differ");
    }
    pageSet.add(claim.page);
  }
}
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
  ".mjs":"text/javascript;charset=utf-8",".json":"application/json",
  ".css":"text/css;charset=utf-8",".woff2":"font/woff2",".svg":"image/svg+xml",
  ".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const uri=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+uri);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
    const bytes=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
    res.end(bytes)
  }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
let browser;
const fold=value=>String(value??"").normalize("NFKD")
  .replace(/[\u0300-\u036f]/g,"").replace(/æ/gi,"ae").replace(/œ/gi,"oe")
  .toLowerCase().replace(/j/g,"i").replace(/[^a-z0-9]+/g," ").trim()
  .replace(/\s+/g," ");
const results=[];
try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({serviceWorkers:"block"});
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
    null,{timeout:60000});
  for(const row of manifest.cases){
    const actual=await page.evaluate(async date=>{
      const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
      const p=r?.proper?.data;
      return {status:r?.status,rank:r?.day?.main?.rank??null,
        source:p?.sourcePath??null,
        fields:{
          introit:[p?.introit?.lat??""],gradual:[p?.gradual?.lat??""],
          offertory:[p?.offertory?.lat??""],
          secret:(p?.secrets??[]).map(v=>v.lat??""),
          postcommunion:(p?.postcommunions??[]).map(v=>v.lat??""),
        }};
    },row.date);
    const earlier=priorByDay.get(row.date);
    const owner=actual.status==="ready"&&actual.source===earlier.proper
      &&actual.rank===earlier.rank;
    const checks=row.assertions.map(claim=>{
      const observed=actual.fields[claim.field]?.[claim.index]??"";
      const match=Boolean(observed)&&fold(observed).includes(fold(claim.latinIncipit));
      const variance=Boolean(!match&&observed&&claim.runtimeLatinVariant&&
        fold(observed).includes(fold(claim.runtimeLatinVariant)));
      return {field:claim.field,index:claim.index,page:claim.page,
        printedPage:claim.printedPage,imageRead:claim.latinIncipit,
        actualExcerpt:observed.slice(0,200),agrees:match,
        sourceSpellingDeviation:variance,varianceType:variance?claim.varianceType:null,
        editorialNote:claim.editorialNote??null,
        status:!observed?"runtime-field-missing":match?"image-incipit-verbatim-agreement":
          variance?"tracked-nonverbatim-edition-orthography":
          "unexplained-image-versus-runtime-discrepancy"};
    });
    const item={date:row.date,source:actual.source,rank:actual.rank,
      sameOwnerAndRankAsB01:owner,
      checks,
      status:!owner?"source-identity-discrepancy":
        checks.every(x=>x.agrees)?"image-located-incipits-agree":
        checks.every(x=>x.agrees||x.sourceSpellingDeviation)?
          "image-located-with-tracked-nonverbatim-variants":
          "image-incipit-unexplained-discrepancy"};
    results.push(item);
    console.log("PRINTED_1962_JULY_B04 "+JSON.stringify({date:row.date,
      status:item.status,checks:checks.length,discrepancies:checks.filter(x=>!x.agrees)
        .map(x=>({field:x.field,index:x.index,imageRead:x.imageRead,
          actualExcerpt:x.actualExcerpt}))}));
  }
}finally{
  await browser?.close();
  await new Promise(done=>server.close(done));
}
const accepted=results.flatMap(x=>x.checks).filter(x=>x.agrees).length;
const variants=results.flatMap(x=>x.checks).filter(x=>x.sourceSpellingDeviation);
const issues=results.filter(x=>x.status==="source-identity-discrepancy"||
  x.status==="image-incipit-unexplained-discrepancy");
const report={schema:"AO_PRINTED_1962_JULY_B04_RUNTIME_IMAGE_ANCHOR_AUDIT_V1",
  visualSourceInspection:"All 11 supplied page images inspected manually before transcribing new incipits",
  scope:"8 July observations; 34 new manually image-checked incipits, not full Missal",
  edition:manifest.witness.work,pdf:manifest.witness.url,
  originalEvidencePreservedAsLinksNotBundled:true,
  dates:results.length,newIndependentClaims:count,verbatimAgreements:accepted,
  trackedNonverbatimOrthographicVariants:variants.length,
  trackedDifferences:variants.map(x=>({field:x.field,page:x.page,
    printed:x.imageRead,runtimeExcerpt:x.actualExcerpt,
    varianceType:x.varianceType,note:x.editorialNote})),
  unexplainedDiscrepancies:count-accepted-variants.length,
  sourceIdentityOrUnexpectedIssues:issues.length,
  imagePagesCited:[...pageSet].sort((a,b)=>a-b),
  status:issues.length?"unexpected-print-comparison-requires-review":
    variants.length?"31-verbatim-plus-3-nonverbatim-orthography-review":
      "all-registered-image-incipits-verbatim-agree",
  results};
await mkdir(resolve(root,"artifacts"),{recursive:true});
await writeFile(resolve(root,"artifacts/mass-printed-1962-july-image-b04.json"),
  JSON.stringify(report,null,2)+"\n");
console.log("PRINTED_1962_JULY_B04_SUMMARY "+JSON.stringify({
  status:report.status,claims:count,verbatimAgreements:accepted,
  trackedNonverbatimOrthographicVariants:variants.length,
  unexplainedDiscrepancies:report.unexplainedDiscrepancies,
  dates:results.length,
  pages:report.imagePagesCited}));
if(process.argv.includes("--strict")){
  assert.equal(issues.length,0,
    "A visually page-located printed Missal claim has a NEW unexplained difference.");
  assert.equal(variants.length,3,"Expected three explicitly tracked non-verbatim orthographic variants");
  assert.equal(accepted,31,"Expected 31 independent image claims with verbatim agreement");
}
