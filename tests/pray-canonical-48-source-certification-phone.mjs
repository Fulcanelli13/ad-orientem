import assert from "node:assert/strict";
import {libraryVariantFamily} from "../src/pray/library-variant-groups.js";
import http from "node:http";
import {readFileSync} from "node:fs";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {PRAY_COLLATION_NOTICES_V1,PRAY_CANONICAL_ANCHOR_REVIEWED_V1,
 PRAY_CANONICAL_NO_DIRECT_CORPUS_URL_V1,prayCanonicalSourceReviewV1
} from "../src/pray/source-collation-notices.v1.js";
import {prayEditionWitness} from "../src/pray/prayer-edition-witnesses.v1.js";

/** Source/edition status audit of ALL 48 canonical cards.
 * The original source text is immutable and no independent print collation
 * is asserted. This suite DOES NOT involve the Rosary bead reader.
 */
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const evidence=resolve(root,"artifacts/pray-canonical-48-source-review");
const inventory=JSON.parse(readFileSync(resolve(root,"data/pray/prayer-source-certification-inventory.v3.json"),"utf8"));
const release=JSON.parse(readFileSync(resolve(root,"data/pray/prayer-release-coverage-evidence.v1.json"),"utf8"));
const prayerOwners=PRAY_CANONICAL_DATA_V435930.prayers;
assert.equal(Object.keys(prayerOwners).length,48);
assert.equal(inventory.prayers.length,48);
assert.equal(release.counts.canonicalCore,48);
assert.equal(release.counts.independentOriginalPrintCertificates,0);
assert.equal(release.counts.fullRouteVariantCertificates,0);
assert.equal(inventory.provenance,"REPOSITORY_RECORD_EXTRACTION_NOT_INDEPENDENT_COLLATION");
assert.equal(inventory.counts.fullyCertified,0);
assert.equal(Object.keys(PRAY_COLLATION_NOTICES_V1).length,12);
assert.equal(PRAY_CANONICAL_ANCHOR_REVIEWED_V1.length,18);
assert.equal(PRAY_CANONICAL_NO_DIRECT_CORPUS_URL_V1.length,2);
const expected=new Map(inventory.prayers.map(r=>[r.id,r]));
assert.deepEqual([...expected.keys()].sort(),Object.keys(prayerOwners).sort());
assert.deepEqual(PRAY_CANONICAL_ANCHOR_REVIEWED_V1.slice().sort(),
 inventory.prayers.filter(x=>x.collation.status==="ANCHOR_REVIEWED_NOT_FULL_VERBATIM").map(x=>x.id).sort());
assert.deepEqual(PRAY_CANONICAL_NO_DIRECT_CORPUS_URL_V1.slice().sort(),
 inventory.prayers.filter(x=>!x.sourceUrl).map(x=>x.id).sort());
assert.deepEqual(Object.keys(PRAY_COLLATION_NOTICES_V1).sort(),
 inventory.prayers.filter(x=>!!x.collation.uiNotice).map(x=>x.id).sort());
for(const row of inventory.prayers){
 const model=prayCanonicalSourceReviewV1(row.id);
 assert.equal(model.status,row.collation.status,row.id+" source inventory diverges from reader");
 assert.equal(model.independentPrintCertified,false);
 assert.equal(model.originalCorpusDirectSourceUrlPresent,!!row.sourceUrl,row.id+" missing original URL status");
 assert.equal(model.editionOrLocaleDiscrepancyRecorded,!!row.collation.uiNotice,
  row.id+" source discrepancy vanished");
 if(row.collation.uiNotice){
  assert.deepEqual(PRAY_COLLATION_NOTICES_V1[row.id].notice,row.collation.uiNotice,
   row.id+" bilingual print/locale discrepancy changed without editor review");
 }
 if(!row.sourceUrl){
  const alternative=prayEditionWitness(row.id);
  assert.ok(alternative?.url?.startsWith("https://"),
   row.id+" missing original source URL has no qualified comparative witness");
  assert.equal(alternative.witnessType,"PRINTED_MISSAL_FACSIMILE_UNCOLLATED");
 }
}
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const body=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(0,"127.0.0.1",ok)});
const report={schema:"ao.pray.canonical-source-integrity-48-phone-v1",
 source:"data/pray/prayer-source-certification-inventory.v3.json",
 scope:"CANONICAL_PRAYER_SOURCE_DISCLOSURE_NOT_TEXT_EDITION_COLLATION",
 variants:[],errors:[],count:{total:0,anchorReviewed:0,unreviewed:0,materialDiscrepancy:0,
 comparativeUrlMissingOriginal:0},historicCertificateClaims:0};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const ui of ["en","fr"]){
  const context=await browser.newContext({viewport:{width,height:width===320?700:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,locale:ui==="fr"?"fr-FR":"en-GB",
   serviceWorkers:"block",reducedMotion:"reduce"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&
    typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",
    null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]').click();
   await page.waitForFunction(x=>document.documentElement.lang===x,ui,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",
    null,{timeout:20000});
   for(const row of inventory.prayers){
    const id=row.id,expectedStatus=row.collation.status;
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null})),true);
    const button=page.locator('#aoPray435930.open [data-p435930-lib-open="'+id+'"]');
    assert.equal(await button.count(),1,"Source-owned Library index lost "+id);
    const family=libraryVariantFamily(id);
    if(family)await page.locator('#aoPray435930.open [data-ao-prayer-family="'+family+'"] > summary').click();
    await button.click();
    await page.waitForFunction(id=>document.querySelector("#aoPray435930.open .aoP435930LibraryReader")?.querySelector(
     '[data-ao-devo-card="'+id+'"]')||document.querySelector("#aoPray435930.open .aoP435930LibraryReader .aoP435930Prayer"),
     id,{timeout:10000});
    const observation=await page.evaluate(id=>{
     const surface=document.querySelector("#aoPray435930.open"),
       mount=surface?.querySelector(".aoP435930Mount"),
       reader=mount?.querySelector(".aoP435930LibraryReader"),
       // Approved Holy Card / Choir source controls are placed in the
       // header's real Aa menu, outside the reader body. Inspect the
       // complete live source-owned Prayer sheet, not just the prayer card.
       all=[...(surface?.querySelectorAll(".aoP435930Source")||[])],
       notices=all.flatMap(el=>[...el.querySelectorAll("[data-ao-prayer-source-review]")]),
       registry=globalThis.AO_PRAY_V435930?.sources?.[id];
     return {
      id,owner:mount?.dataset.aoPrayView,sourceDrawers:all.length,
      sourceNotices:notices.map(x=>({
       status:x.dataset.aoPrayerSourceReview,
       direct:x.dataset.aoPrayerOriginalCorpusUrl,
       text:x.textContent.trim()
      })),
      editionNotices:surface?.querySelectorAll(".aoP435930SourceEditionVariant").length||0,
      alternate:surface?.querySelectorAll("[data-ao-prayer-alternate-witness]").length||0,
      sources:all.flatMap(el=>[...el.querySelectorAll("a.aoP435930SourceLink[href]")].map(a=>a.href)),
      inheritedUnqualifiedVerbatim:all.some(el=>[...el.querySelectorAll("small")].some(s=>s.textContent.trim()==="VERBATIM")),
      registry:registry?{
       collationStatus:registry.collationStatus,independentPrintCertified:registry.independentPrintCertified,
       originalCorpusDirectSourceUrlPresent:registry.originalCorpusDirectSourceUrlPresent,
       editionOrLocaleDiscrepancyRecorded:registry.editionOrLocaleDiscrepancyRecorded
      }:null,language:document.documentElement.lang,
      documentOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
      readerOverflow:reader?Math.max(0,reader.scrollWidth-reader.clientWidth):null
     };
    },id);
    assert.equal(observation.owner,"library",id+" source owner changed");
    assert.ok(observation.sourceDrawers>=1,id+" source witness drawer inaccessible");
    assert.equal(observation.sourceDrawers,observation.sourceNotices.length,
     id+" some canonical source drawers still omit their certification caveat");
    for(const source of observation.sourceNotices){
     assert.equal(source.status,expectedStatus,id+" falsely upgrades or downgrades source evidence");
     assert.equal(source.direct,row.sourceUrl?"present":"missing",
      id+" original corpus link status mislabeled");
     assert.ok(source.text.length>65,id+" missing user-visible English/French qualification");
     assert.ok(ui==="fr"?/collationné|comparée|source citée/i.test(source.text):
      /collated|compared|cited source/i.test(source.text),id+" source qualification not in correct language");
    }
    assert.deepEqual(observation.registry,{
     collationStatus:expectedStatus,independentPrintCertified:false,
     originalCorpusDirectSourceUrlPresent:!!row.sourceUrl,
     editionOrLocaleDiscrepancyRecorded:!!row.collation.uiNotice
    },id+" public source metadata contradicts printed-edition audit");
    assert.ok(!observation.inheritedUnqualifiedVerbatim,
     id+" inherited VERBATIM falsely advertised as audited original text");
    assert.equal(observation.alternate,row.sourceUrl?0:observation.sourceDrawers,
     id+" missing original URL or falsely suggesting a second facsimile");
    assert.ok(observation.sources.some(u=>u.startsWith("https://")),
     id+" library source drawer lost published or qualified comparative witness");
    if(!row.sourceUrl)
     assert.ok(observation.sources.includes(prayEditionWitness(id).url),
      id+" printed Missal alternative was not linked to actual source drawer");
    assert.equal(observation.editionNotices,row.collation.uiNotice?observation.sourceDrawers:0,
     id+" material bilingual edition difference was hidden or invented");
    if(row.collation.uiNotice){
     const notice=await page.locator("#aoPray435930.open .aoP435930SourceEditionVariant").first().textContent();
     assert.equal(notice,row.collation.uiNotice[ui],
      id+" historical wording discrepancy does not match approved original inventory");
    }
    assert.ok(observation.documentOverflow<=2&&observation.readerOverflow<=2,
     id+"/"+width+"/"+ui+" source drawer caused phone clipping: "+JSON.stringify(observation));
    assert.equal(observation.language,ui);
    const back=page.locator("#aoPray435930.open [data-p435930-back]");
    assert.equal(await page.locator("#aoPray435930.open [data-p435930-lib-back]").count(),0,
     id+" source reader duplicates the native Back");
    assert.ok(await back.count()>0,id+" source reader lost its return");
    report.variants.push({width,ui,id,
     sourceReview:expectedStatus,sourceDrawers:observation.sourceDrawers,
     discrepancy:!!row.collation.uiNotice,
     originalUrlMissing:!row.sourceUrl,
     alternativeSourceAvailable:!!observation.sources.length});
    report.count.total++;
    report.count.anchorReviewed+=Number(expectedStatus==="ANCHOR_REVIEWED_NOT_FULL_VERBATIM");
    report.count.unreviewed+=Number(expectedStatus==="NOT_REVIEWED");
    report.count.materialDiscrepancy+=Number(!!row.collation.uiNotice);
    report.count.comparativeUrlMissingOriginal+=Number(!row.sourceUrl);
   }
   assert.deepEqual(errors,[],"Canonical source browser errors "+width+"/"+ui+": "+errors.join(" | "));
   console.log("PASS canonical source disclosure "+width+" "+ui+" · 48/48 original library entries, qualified witness and edition notices");
  }catch(e){report.errors.push({width,ui,details:String(e?.stack||e)});throw e;}
  finally{await context.close()}
 }
 assert.deepEqual(report.count,{total:192,anchorReviewed:72,unreviewed:120,
  materialDiscrepancy:48,comparativeUrlMissingOriginal:8});
 console.log("PASS 192/192 canonical Prayer source-drawer variants; 72 partial anchor observations, 120 unreviewed, 48 edition-discrepancy notices, 8 missing-original-URL comparative witness disclosures; zero false full-print certifications.");
}finally{
 await mkdir(evidence,{recursive:true});
 await writeFile(resolve(evidence,"48-source-disclosure-variants.json"),JSON.stringify(report,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
