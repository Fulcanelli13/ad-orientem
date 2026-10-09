import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ROSARY_SCRIPTURE_POLICY_V1} from "../src/pray/rosary-scripture-policy.js";

const original=JSON.parse(readFileSync("data/pray/rosary-scripture-editorial-inventory.v1.json","utf8"));
const first=JSON.parse(readFileSync("data/pray/rosary-primary-edition-review.v1.json","utf8"));
const report=JSON.parse(readFileSync("data/pray/rosary-drc-crampon-collation.v1.json","utf8"));
const expectedOutput=process.argv[2]?JSON.parse(readFileSync(process.argv[2],"utf8")):null;

assert.equal(report.schema,"ao-rosary-drc-crampon-automated-collation-v1");
assert.equal(report.editionInput.sourceRepo,"scrollmapper/bible_databases");
assert.equal(report.editionInput.sourceCommit,"e1b254cef86d0e65b1a5d1a94b8b112d0f296a2c");
assert.match(report.editionInput.en,/Challoner/);
assert.match(report.editionInput.fr,/Crampon 1923/);
for(const key of ["en","fr"])assert.match(report.editionInput.sha256[key],/^[0-9a-f]{64}$/);
assert.match(report.disclaimer,/Not primary-facsimile or French-quote human verification/);
assert.equal(report.rows.length,200);
assert.equal(original.rows.length,200);
assert.equal(first.rows.length,200);
assert.equal(report.counts.donorRows,200);
assert.equal(report.counts.matchedToArchive,200);
assert.equal(report.counts.englishFoundAllSourceVerses,200);
assert.equal(report.counts.frenchFoundAllSourceVerses,197);
assert.equal(report.counts.englishEditorialApproved,0);
assert.equal(report.counts.frenchQuotationCollated,0);
assert.equal(report.counts.permittedPublication,0);
assert.equal(ROSARY_SCRIPTURE_POLICY_V1.publicPerBeadExcerptStatus,"WITHHELD_UNTIL_PASSAGE_CERTIFICATION");
const counts={},issues=[],seen=new Set(),bibleWordsAreAbsent=new Set(["text","fullText","englishVerse","frenchVerse"]);
for(let i=0;i<200;i++){
 const r=report.rows[i],old=original.rows[i],prev=first.rows[i];
 assert.equal(r.id,old.id,"Source order/id drift");
 assert.equal(r.id,prev.id,"Review order drift");
 assert.equal(r.citation,old.sourceReference);
 assert.equal(r.mysteryId,old.mysteryId);
 assert.ok(!seen.has(r.id));seen.add(r.id);
 assert.equal(r.editorialApproved,false);
 assert.equal(r.permissionToRepublish,false);
 assert.equal(r.frenchQuotationsChecked,0);
 for(const forbidden of bibleWordsAreAbsent)assert.ok(!(forbidden in r),r.id+" illegally bundled source text");
 for(const lang of ["en","fr"]){
  assert.ok(r[lang+"VersesLocated"]>=0);
  assert.ok(r[lang+"VersesLocated"]<=r[lang+"VersesExpected"]);
  if(r[lang+"VersesLocated"]>0)assert.match(r[lang+"PassageSha256"],/^[0-9a-f]{64}$/);
 }
 counts[r.enAutomaticResult]=(counts[r.enAutomaticResult]||0)+1;
 if(r.frVersesLocated!==r.frVersesExpected)issues.push(r.id);
}
assert.equal(seen.size,200);
assert.deepEqual(counts,report.counts.englishAutomaticResults);
assert.deepEqual(counts,{NORMALIZED_FULL_PASSAGE_MATCH:77,CONTIGUOUS_EXCERPT_MATCH:74,ORDERED_WITH_OMISSIONS:33,EDITION_OR_REFERENCE_UNRESOLVED:16});
assert.deepEqual(issues.sort(),["glo4.b10","glo5.b7","glo5.b8"].sort(),"Absent French digital keys must not be erased");
const exceptions=JSON.parse(readFileSync("data/pray/rosary-edition-exceptions.v1.json","utf8"));
assert.deepEqual(exceptions.exceptions.map(x=>x.id).sort(),["glo4.b1","glo4.b10","glo5.b7","glo5.b8"].sort());
const psalm=report.rows.find(x=>x.id==="glo4.b1");
assert.equal(psalm.frVerseAlias.chapter,132);
assert.equal(psalm.frVerseAlias.verseStart,8);
assert.equal(psalm.frVersesLocated,1);
assert.equal(psalm.frVerseAlias.verified,"Crampon_1923_printed_psalter");
assert.equal(exceptions.republicationAuthorised,false);
assert.equal(exceptions.humanFrenchVerbatimCertification,0);
assert.ok(exceptions.exceptions.filter(x=>x.finding==="PRINTED_VERSE_PRESENT_DIGITAL_KEY_ABSENT").length===3);
for(const e of exceptions.exceptions)assert.match(e.printedWitnessUrl,/^https:\/\/fr\.wikisource\.org\/wiki\//);
assert.equal(new Set(report.rows.map(x=>x.mysteryId)).size,20);
const displayed=readFileSync("src/pray/rosary-scripture-policy.js","utf8");
assert.match(displayed,/\.lab-prayer-sheet \.lab-scripture-cue/);
assert.doesNotMatch(displayed,/from ["'].*rosary-drc-crampon-collation/,"Machine statuses must never decide whether to publish Rosary verse text");
if(expectedOutput){
 assert.deepEqual(expectedOutput,report,"A newer remote digital witness silently replaced the pinned comparison");
}
console.log("PASS paired Rosary editions: all 200 Challoner verses located, 197 Crampon verses located, three secondary-dataset Judith gaps, one verified Psalm alias, 184 non-typological English automatic wording matches, zero quotations approved.");
