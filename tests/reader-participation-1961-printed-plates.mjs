import assert from "node:assert/strict";
import {PARTICIPATION_REFERENCE_SCORES} from "../src/mass/reader-participation-reference-scores.js";
import {PARTICIPATION_1961_PRINTED_PLATES,printedPlatesForParticipationScore,
 PRINTED_PLATE_INDEX_SCHEMA} from "../src/mass/reader-participation-printed-plates.js";
import {buildParticipationScoreReviewCsv} from "../scripts/mass/export-24-participation-review-csv.mjs";
assert.equal(PRINTED_PLATE_INDEX_SCHEMA,"ao-mass-participation-1961-plate-index-v1");
assert.equal(PARTICIPATION_REFERENCE_SCORES.length,24);
assert.equal(PARTICIPATION_1961_PRINTED_PLATES.length,11);
const sourceIds=[...new Set(PARTICIPATION_REFERENCE_SCORES.map(x=>x.sourceId))].sort((a,b)=>a-b);
assert.deepEqual(sourceIds,PARTICIPATION_1961_PRINTED_PLATES.map(x=>x.sourceId).sort((a,b)=>a-b));
const seen=new Set();
let linked=0;
const uniqueUrls=new Set();
for(const score of PARTICIPATION_REFERENCE_SCORES){
 const source=printedPlatesForParticipationScore(score.sourceId);
 assert.ok(source,"Missing 1961 plate "+score.sourceId);
 assert.equal(source.sourceNoteByNoteParity,"UNVERIFIED");
 assert.equal(source.publicScoreApproved,false);
 assert.equal(score.publicScoreApproved,false);
 assert.equal(source.chantRecord,score.sourceUrl);
 assert.ok(source.plates.length>=1);
 for(const plate of source.plates){
  assert.equal(plate.printedWitness,true);
  assert.equal(plate.noteByNoteCollation,"PENDING");
  assert.equal(plate.publicScoreApproval,false);
  assert.match(plate.book,/Solesmes 1961/);
  assert.match(plate.url,/^https:\/\/gregobase\.selapa\.net\/sources\/[23]\/\d+\.png$/);
  uniqueUrls.add(plate.url);
  linked++;
 }
 seen.add(score.id);
}
assert.equal(seen.size,24);
assert.equal(linked,40,"Eleven records now include the full GR p.130*-131* Preface sequence; archive score cards choose exact phrase pages");
assert.equal(uniqueUrls.size,13);
const expected={
  4449:["3/220.png","2/1007.png","2/1008.png"],
  4450:["3/220.png","2/1008.png"],4487:["3/209.png"],
  4490:["3/217.png"],4491:["3/218.png"],7282:["3/221.png"],
  4327:["3/221.png"],961:["2/906.png"],749:["2/941.png"],
  2901:["3/150.png","3/151.png"],
  823:["2/979.png","3/2060.png"]
};
for(const [id,paths] of Object.entries(expected)){
 const witness=printedPlatesForParticipationScore(+id);
 assert.deepEqual(witness.plates.map(x=>x.url.split("/sources/")[1]),paths);
}
assert.equal(printedPlatesForParticipationScore(123456),null);
const csv=buildParticipationScoreReviewCsv();
const lines=csv.trim().split("\n");
assert.equal(lines.length,25);
assert.match(lines[0],/printed_1961_plate_urls/);
assert.match(lines[0],/printed_source_note_parity/);
for(const row of lines.slice(1)){
 assert.match(row,/UNVERIFIED/);
 assert.match(row,/DO_NOT_PUBLISH/);
 assert.match(row,/https:\/\/gregobase\.selapa\.net\/sources\/[23]\/\d+\.png/);
}
console.log("PASS 11 archival source records, 13 distinct 1961 page scans, 40 record-plate associations on 24 unapproved excerpts");
