// Research-only structural acceptance. Run: node tests/mass-lanslots-original-cue-audit.mjs
// Zero external dependencies. Never writes runtime Mass content.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const first=load("data/research/mass-lanslots-1897-ocr-scripture-batch01.v1.json");
const second=load("data/research/mass-lanslots-1897-ocr-scripture-batch02.v1.json");
const audit=load("data/research/mass-lanslots-1897-69-reference-cue-ownership.v1.json");
const coverage=load("data/research/mass-lanslots-1897-chapter-coverage.v1.json");
const boundaries=load("data/research/mass-lanslots-1897-chapter-ocr-boundaries.v1.json");
const context=load("data/research/mass-lanslots-1897-seven-context-chapters.v1.json");
const live=load("data/research/mass-lanslots-1897-source-first39-map.v1.json");
const sung=load("data/presentation/reader-text-sung.v1.json");
const canon=load("data/presentation/reader-canon-source-map.v1.json");
const claims=load("data/research/mass-lanslots-1897-claim-differential.v1.json");
const normalize=value=>String(value).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/æ/g,"ae").replace(/[^\p{Letter}\p{Number}]+/gu," ").trim().replace(/\s+/g," ").toLowerCase();
const verses=[...first.records,...second.records],original=new Map(verses.map(x=>[x.id,x]));
assert.equal(first.rowCount,43);
assert.equal(second.newRecords,26);
assert.equal(verses.length,69);
assert.equal(original.size,69,"Unique OCR evidence IDs");
const citationKey=new Set();
for(const x of verses){
 assert(x.production==="BLOCKED"||x.runtimePromotion==="BLOCKED");
 assert.equal(x.verifiedAgainstScanPage??x.originalPageImageVerified,false);
 const key=[x.chapter,x.normalizedScriptureRef,x.webOcrLineRange.start].join("|");
 assert(!citationKey.has(key),"duplicate source position: "+key);
 citationKey.add(key);
 const chapter=boundaries.records.find(b=>b.chapter===x.chapter);
 if(x.chapter!=="Intro"){
  assert(chapter,"unknown book chapter "+x.chapter);
  assert(x.webOcrLineRange.start>=chapter.webOcrHeadingLine,"outside chapter: "+x.id);
  if(chapter.webOcrNextHeadingLineExclusive!==null)assert(x.webOcrLineRange.end<chapter.webOcrNextHeadingLineExclusive,"outside chapter: "+x.id);
 }
}
assert.equal(boundaries.records.length,25);
assert.equal(context.entries.length,7);
assert.equal(coverage.chapterCoverage.length,25);
assert.equal(coverage.chapterCoverage.filter(x=>x.scriptureSourceOccurrenceCount>0).length,18);
assert.equal(coverage.chapterCoverage.filter(x=>x.otherContextIds.length>0).length,7);
assert(coverage.chapterCoverage.every(x=>x.hasOriginalTextEvidence));
assert.equal(coverage.census.scriptureReferenceOccurrences,69);
assert.equal(coverage.census.originalTextPdfPagesVisuallyChecked,11,"exactly 11 independently documented PDF image checks");
assert.equal(coverage.census.completeBookLocalOcrExtracted,true,"complete original OCR is now immutable and checked");
assert.equal(coverage.census.exhaustiveVerseCountKnown,false);
assert.equal(live.rows.length,39);
assert.equal(live.rows.filter(x=>x.sourceKind==="CANON_SOURCE_SEGMENT").length,14);
assert.equal(claims.claimCount,16);
assert(claims.claims.every(x=>x.runtimePromotion==="BLOCKED"));
assert.equal(audit.entries.length,69);
assert.equal(audit.totalReferenceOccurrences,69);
assert.equal(audit.literalOrNamedMatches,12);
assert.equal(audit.topicOnlyRecords,57);
const blockByCue=new Map(),ownerByBlock=new Map();
for(const block of sung.blocks){
 for(const cue of block.units)blockByCue.set(cue.cue_id,{blockId:block.Block_ID,macroId:block.Macro_ID,latin:cue.latin||""});
}
for(const segment of canon.segments)for(const blockId of segment.blockIds)ownerByBlock.set(blockId,segment.id);
let matches=0;
for(const entry of audit.entries){
 assert(original.has(entry.sourceRecordId),"missing OCR source record");
 assert(!entry.publishToGuide,"research must remain unpublished");
 assert.equal(entry.verifyOriginalPageImage,false);
 if(entry.liturgicalMatchStatus==="LATIN_SOURCE_TEXT_MATCH_VERIFIED"){
  matches++;
  const source=blockByCue.get(entry.cueId);
  assert(source,"missing liturgical cue "+entry.cueId);
  assert.equal(entry.blockId,source.blockId,"wrong owner block "+entry.sourceRecordId);
  const currentSection=ownerByBlock.get(entry.blockId)??"AO.CARD."+source.macroId.match(/\d+$/)[0].padStart(3,"0");
  assert.equal(entry.sourceFirstSectionId,currentSection,"wrong source-first presentation segment");
  assert(normalize(source.latin).includes(normalize(entry.sourceLatinExcerpt)),"wording mismatch: "+entry.cueId);
 } else {
  assert.equal(entry.cueId,null,"thematic association must not imply direct cue placement");
  assert.equal(entry.blockId,null,"thematic association must not imply direct block ownership");
 }
}
assert.equal(matches,12);
const priest= audit.entries.find(x=>x.sourceChapter==="XXIV"&&x.scriptureReference==="Matthew 8:8");
assert.equal(priest.cueId,"AO.SM.C0229","centurion's words must refer to priest's Communion, not faithful repetition");
const melchi=audit.entries.find(x=>x.sourceChapter==="XX"&&x.scriptureReference==="Psalms 109:4");
assert.equal(melchi.sourceFirstSectionId,"AO.CANON.09","Supra quae Canon source ownership");
const bible=load("data/research/mass-lanslots-1897-independent-bible-spotchecks.v1.json");
assert.equal(bible.checkedRecordCount,10);
assert.equal(bible.checks.length,10);
assert.equal(new Set(bible.checks.map(x=>x.linkedResearchRecordId)).size,10,"independent checks must not duplicate source record IDs");
for(const check of bible.checks){
  const originalRecord=original.get(check.linkedResearchRecordId);
  assert(originalRecord,"independent Bible validation has no Lanslots source record "+check.id);
  assert.equal(check.reference,originalRecord.normalizedScriptureRef,"independent Bible citation reference mismatch");
  assert.equal(check.referenceAndContentMatch,true);
  assert.equal(check.originalLanslotsAttributionVerifiedByThisCheck,false,"independent Bible text cannot certify Lanslots attribution");
  assert.equal(check.originalLanslotsPrintedPageImageVerified,false,"cannot certify original PDF scan");
  assert.equal(check.currentAppPromotion,"BLOCKED");
  assert(check.primaryWitnessUrl.startsWith("https://"),"direct source witness required");
}
console.log("PASS Lanslots source-critical gate: 69 OCR occurrences; 25 chapter groups; 12 exact Sung anchors, 57 thematic; 39 current LIVE source steps, 14 Canon segments; no research promotion; 10 Bible-edition crosschecks.");
