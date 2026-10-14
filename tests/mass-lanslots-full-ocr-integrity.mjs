// Reproducible full-OCR acquisition and source-grounding acceptance (research only).
// node tests/mass-lanslots-full-ocr-integrity.mjs
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const originalFile="data/research/archive/lanslots-1897-original-ocr.txt";
const raw=readFileSync(new URL("../"+originalFile,import.meta.url));
const ocr=raw.toString("utf8");
const acquired=load("data/research/archive/lanslots-1897-original-ocr-acquisition.v1.json");
const scanned=load("data/research/mass-lanslots-1897-whole-ocr-parenthetical-screen.v1.json");
const recovered=load("data/research/mass-lanslots-1897-fulltext-17-new-citations.v1.json");
const prior1=load("data/research/mass-lanslots-1897-ocr-scripture-batch01.v1.json");
const prior2=load("data/research/mass-lanslots-1897-ocr-scripture-batch02.v1.json");
const doctrine=load("data/research/mass-lanslots-1897-royal-priesthood-prepost-crosswalk.v1.json");
const liturgy=load("data/presentation/reader-text-sung.v1.json");
const hash=createHash("sha256").update(raw).digest("hex");
assert.equal(raw.length,488041,"original plain-text bytes must be preserved");
assert.equal(raw.length,acquired.bytes);
assert.equal(hash,acquired.sha256,"archive must be byte-for-byte identical to acquired original");
assert.equal(scanned.sourceSha256,hash);
assert.equal(recovered.sourceSha256,hash);
assert(ocr.startsWith("LIBRARY  OF  CONGRESS"));
assert(ocr.includes("CHAPTER  XXV."));
assert.equal(scanned.chapterHeadingCount,25);
assert.equal(scanned.parentheticalCitationLikeCount,82);
assert.equal(scanned.records.length,82);
assert.equal(new Set(scanned.records.map(r=>r.id)).size,82);
const normal=t=>String(t).replace(/\s+/g," ").trim();
for(const candidate of scanned.records){
  const pos=candidate.rawCharacterOffset;
  assert.equal(ocr[pos],"(","parenthetical offset incorrect for "+candidate.id);
  const end=ocr.indexOf(")",pos);
  assert(end>pos,"unclosed text candidate "+candidate.id);
  assert.equal(normal(ocr.slice(pos+1,end)),candidate.asPrinted,"source mismatch "+candidate.id);
  assert.equal(candidate.citationHumanApproved,false);
  assert.equal(candidate.originalPdfPageChecked,false);
  assert.equal(candidate.publication,"BLOCKED");
}
const older=[...prior1.records,...prior2.records];
assert.equal(older.length,69);
assert.equal(recovered.records.length,17);
assert.equal(recovered.newCitationOccurrences,17);
assert.equal(recovered.combinedReviewableOccurrenceTotal,86);
const oldKeys=new Set(older.map(x=>x.chapter+"|"+x.normalizedScriptureRef));
const srcCandidates=new Map(scanned.records.map(x=>[x.id,x]));
for(const row of recovered.records){
  const source=srcCandidates.get(row.originalParentheticalScreenId);
  assert(source,"new verse not found in full-text screen "+row.id);
  assert.equal(source.rawCharacterOffset,row.originalOcrCharacterOffset);
  assert.equal(source.rawLineStart,row.originalOcrRawLine);
  assert.equal(source.chapter,row.chapter);
  assert(!oldKeys.has(row.chapter+"|"+row.normalizedScriptureRef),"new entry duplicates prior batch: "+row.id);
  const originalPages=new Map([["L1897-OCR3-001",16],["L1897-OCR3-007",150],["L1897-OCR3-008",173],["L1897-OCR3-009",179]]);
  const verifiedPage=originalPages.get(row.id);
  assert.equal(row.pdfPageVisualCheck,verifiedPage!==undefined,"exactly four new-record page checks must be marked");
  if(verifiedPage!==undefined)assert.equal(row.visuallyVerifiedOriginalScan.oneBasedPdfPage,verifiedPage,"visual evidence must match image record");
  assert.equal(row.runtimePromotion,"BLOCKED");
}
const royal=recovered.records.filter(x=>x.normalizedScriptureRef==="1 Peter 2:9");
assert.equal(royal.length,2,"intro and Orate fratres must each be captured");
assert(royal.some(x=>x.chapter==="INTRODUCTION"));
assert(royal.some(x=>x.chapter==="XV"));
assert.equal(doctrine.originalOcrWitnesses.length,2);
assert.equal(doctrine.checks.runtimePromotion,"BLOCKED");
assert.deepEqual(doctrine.doctrinalSourceChronology.map(x=>x.year),[1947,1964,1963]);
const cueIds=new Set(liturgy.blocks.flatMap(b=>b.units.map(u=>u.cue_id)));
for(const row of recovered.records){
  const cue=row.readerAssociation?.cueId;
  if(cue)assert(cueIds.has(cue),"source owner missing "+cue);
}
console.log("PASS Lanslots full OCR: verified exact source SHA-256; 25 chapters; 82 candidate citation-like parentheses; 17 missed Scripture occurrences; 2 royal priesthood passages; no runtime promotion.");
