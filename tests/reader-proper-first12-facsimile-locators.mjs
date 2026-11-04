import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {FIRST12_1961_FACSIMILES,FIRST12_1961_FACSIMILE_SCHEMA,
 first12PrintedFacsimileForScore}
 from "../src/mass/reader-proper-first12-1961-facsimile-locators.js";
const root=new URL("../.tmp/schola-1962-selected-annual/",import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
const proof=read("2026-first60-1961-printed-music-proof-gate.json");
const pack=read("2026-selected-proper-first60-print-review.json");
assert.equal(FIRST12_1961_FACSIMILE_SCHEMA,"ao-first12-gregorian-solesmes-1961-facsimile-locators-v1");
assert.equal(FIRST12_1961_FACSIMILES.length,12);
assert.equal(new Set(FIRST12_1961_FACSIMILES.map(x=>x.scoreId)).size,12);
assert.deepEqual(FIRST12_1961_FACSIMILES.map(x=>x.scoreId),proof.firstTwelveForPrintComparison,
 "The pinned original facsimiles must match the top twelve selected-calendar worklist");
// One newly prioritized source: Exaltabo te, original 1961 printed folio 90,
// witnessed in the archived GregoBase source-page image 116.
assert.equal(FIRST12_1961_FACSIMILES.at(-1).scoreId,"GREGOBASE-648");
assert.equal(FIRST12_1961_FACSIMILES.at(-1).scanned1961PageUrl,
 "https://gregobase.selapa.net/sources/2/116.png");
const printSpans=new Map([
 ["GREGOBASE-475",["392","393"]],["GREGOBASE-782",["362","363"]],
 ["GREGOBASE-265",["79","80"]],["GREGOBASE-1271",["383","384"]]
]);
assert.equal(FIRST12_1961_FACSIMILES.filter(x=>x.scannedFolios.length===2).length,4);
assert.equal(new Set(FIRST12_1961_FACSIMILES.flatMap(x=>
 x.scannedFolios.map(y=>y.url))).size,14);
for(const entry of FIRST12_1961_FACSIMILES){
 const pages=entry.scannedFolios;
 assert.ok(Object.isFrozen(pages));
 assert.deepEqual(pages.map(x=>x.folio),printSpans.get(entry.scoreId)??[entry.folio]);
 assert.equal(entry.printedFolioSpan,pages.map(x=>x.folio).join("–"));
 assert.equal(entry.completeSourceSpanLocated,true);
 assert.equal(entry.sourceSpanMusicallyCompared,false);
 assert.equal(entry.scanned1961PageUrl,pages[0].url);
 for(let i=0;i<pages.length;i++){
  assert.match(pages[i].url,/^https:\/\/gregobase\.selapa\.net\/sources\/2\/\d+\.png$/);
  assert.equal(pages[i].imageNumber,entry.imageNumber+i);
 }
}
const packById=new Map(pack.candidates.map(x=>[x.scoreId,x]));
for(const candidate of FIRST12_1961_FACSIMILES){
 const original=packById.get(candidate.scoreId);
 assert.ok(original, "Missing first12 original candidate "+candidate.scoreId);
 const resolved=first12PrintedFacsimileForScore(original);
 assert.deepEqual(resolved,candidate);
 assert.equal(candidate.folio,original.original1961Page);
 assert.equal(candidate.sourceUrl,original.sourceUrl);
 assert.equal(candidate.part,original.part);
 assert.match(candidate.scanned1961PageUrl,
  /^https:\/\/gregobase\.selapa\.net\/sources\/2\/\d+\.png$/);
 assert.equal(candidate.sourceBook,"Graduale Romanum, Solesmes, 1961");
 assert.equal(candidate.scoreProof,"PRINT_FACSIMILE_SOURCE_LOCATED_NOT_MUSICALLY_COMPARED");
 assert.equal(candidate.publication,"EDITORIAL_HOLD_NOT_PUBLIC");
 assert.equal(proof.allScores.find(x=>x.scoreId===candidate.scoreId)?.textExact,true,
  "No source-text variant score may be shown as a print-priority candidate");
 const wrongPage={...original,original1961Page:"999"};
 assert.throws(()=>first12PrintedFacsimileForScore(wrongPage),
  /1961_PRINTED_FACSIMILE_SOURCE_OR_READER_APPROVAL_DRIFT/);
 const wrongRole={...original,part:"gr"};
 assert.throws(()=>first12PrintedFacsimileForScore(wrongRole),
  /1961_PRINTED_FACSIMILE_SOURCE_OR_READER_APPROVAL_DRIFT/);
 const publicScore={...original,approvedForMassReader:true};
 assert.throws(()=>first12PrintedFacsimileForScore(publicScore),
  /1961_PRINTED_FACSIMILE_SOURCE_OR_READER_APPROVAL_DRIFT/);
}
assert.equal(first12PrintedFacsimileForScore(pack.candidates.find(x=>
 !FIRST12_1961_FACSIMILES.some(y=>y.scoreId===x.scoreId))),null);
const html=readFileSync(new URL("../tools/mass/proper-1961-first60-collation.html",
 import.meta.url),"utf8");
for(const selector of ["originalBookPanel","originalBookScan","scanStatus","scanZoom",
 "scanSource","scanFolio","showOriginal1961Scan","first12PrintedFacsimileForScore",
 "PRINT_FACSIMILE_SOURCE_LOCATED_NOT_MUSICALLY_COMPARED"]){
 assert.ok(html.includes(selector)||selector==="PRINT_FACSIMILE_SOURCE_LOCATED_NOT_MUSICALLY_COMPARED",
  "Missing original print-and-GABC comparison UI: "+selector);
}
assert.ok(html.includes("img.onerror")&&html.includes("do not mark music as verified"),
 "A failed remote source image must never be mistaken for printed-music proof");
assert.ok(html.includes("continuationBookScan")&&
 html.includes("printedContinuation")&&html.includes("locator.scannedFolios")&&
 html.includes("Complete printed-score review is blocked"),
 "Two-page scores MUST visibly show the next original page and block truncated comparisons");
assert.ok(html.includes("independent pitch/neume/underlay comparison NOT recorded"),
 "Loading the source picture is NOT independent musical verification");
assert.ok(html.includes("data")||html.includes("document"),
 "The actual score comparison UI must remain script-driven");
assert.equal(proof.counts.completePrintedMusicVerified,0);
assert.equal(proof.counts.newlyPublicScores,0);
console.log("PASS: 12 first-calendar printed original-folio locators matched to 1961 edition, unchanged GABC/roles, safe image fallback, zero source music approvals");
