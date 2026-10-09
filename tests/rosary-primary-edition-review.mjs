import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ROSARY_SCRIPTURE_POLICY_V1,ROSARY_SCRIPTURE_REFERENCE_V1} from "../src/pray/rosary-scripture-policy.js";

const source=JSON.parse(readFileSync("data/pray/rosary-scripture-editorial-inventory.v1.json","utf8"));
const witness=JSON.parse(readFileSync("data/pray/rosary-primary-edition-review.v1.json","utf8"));
const original=Object.fromEntries(source.rows.map(r=>[r.id,r]));
const mysteryIDs=Object.keys(ROSARY_SCRIPTURE_REFERENCE_V1);
const ids=new Set();
assert.equal(witness.rows.length,200,"do not discard any of the 200 original donor cue IDs");
assert.equal(Object.keys(original).length,200);
assert.equal(new Set(source.rows.map(x=>x.mysteryId)).size,20);
assert.equal(witness.counts.sourceRows,200);
assert.equal(ROSARY_SCRIPTURE_POLICY_V1.donorExcerptCount,200);
assert.equal(ROSARY_SCRIPTURE_POLICY_V1.publicPerBeadExcerptStatus,"WITHHELD_UNTIL_PASSAGE_CERTIFICATION");
assert.equal(witness.counts.bilingualTextApproved,0,"cannot approve a French quote by checking an English edition");
assert.equal(witness.counts.publishedScriptureQuotes,0,"200 unverified quotation fragments must stay hidden");
assert.equal(witness.counts.candidateSourceInvestigations,20);
assert.equal(witness.counts.candidateEnglishTextCompared,19);
assert.equal(witness.counts.candidateWithNumberingHold,1);

const allowed=new Set(["PENDING_EDITION_COLLATION","UNSAFE_FRAGMENT_HOLD","TYPOLOGICAL_REVIEW_HOLD"]);
const foundReview=[];
const sourcesWithLiveBooks=new Set(["Luke","Matthew","Mark","John","Acts","Apocalypse"]);
const holdCounts={};
for(const row of witness.rows){
 assert.ok(original[row.id],"Audit row does not exist in frozen donor archive: "+row.id);
 assert.ok(!ids.has(row.id),"Duplicate archival Scripture cue: "+row.id);
 ids.add(row.id);
 assert.equal(row.sourceReference,original[row.id].sourceReference,"Citation changed under frozen archival ID");
 assert.equal(row.mysteryId,original[row.id].mysteryId,"Mystery ownership changed");
 assert.ok(mysteryIDs.includes(row.mysteryId),"Orphan mystery "+row.mysteryId);
 assert.ok(allowed.has(row.editorialHold),"Invalid audit disposition: "+row.id);
 assert.ok(row.passage.chapter>=1&&row.passage.verseStart>=1);
 assert.ok(row.passage.verseEnd>=row.passage.verseStart);
 const parts=row.sourceReference.match(/^(.*?)\s+(\d+):(\d+)([ab])?(?:[–-](\d+)([ab])?)?$/i);
 assert.ok(parts,"Unparsed citation: "+row.id);
 assert.equal(row.passage.sourceBook,parts[1]);
 assert.equal(row.passage.chapter,Number(parts[2]));
 assert.equal(row.passage.verseStart,Number(parts[3]));
 if(parts[4]||parts[6])assert.equal(row.passage.partialVerse,true);
 holdCounts[row.editorialHold]=(holdCounts[row.editorialHold]||0)+1;
 if(sourcesWithLiveBooks.has(row.passage.sourceBook)){
  assert.match(row.editionLocators.en,/^https:\/\/en\.wikisource\.org\/wiki\/Bible_\(Douay-Rheims,_Challoner\)\//);
  assert.match(row.editionLocators.fr,/^https:\/\/fr\.wikisource\.org\/wiki\/Bible_Crampon_1923\//);
 }else{
  assert.equal(row.editionLocators.en,null,"Do not invent unverified book or Psalm alias URLs: "+row.id);
  assert.equal(row.editionLocators.fr,null,"Do not invent unverified Crampon mapping: "+row.id);
 }
 if(row.automatedFlags.includes("EDITORIAL_ELLIPSIS")||
    row.automatedFlags.includes("OPEN_SENTENCE")||
    row.automatedFlags.includes("VERSE_SPLIT")||
    row.automatedFlags.includes("UNFINISHED_CLAUSE")||
    row.automatedFlags.includes("HALF_VERSE_REFERENCE")){
  assert.equal(row.editorialHold,"UNSAFE_FRAGMENT_HOLD","Unsafe fragment approved for reading: "+row.id);
 }
 if(row.primaryWitnessReview){
  foundReview.push(row);
  assert.equal(row.primaryWitnessReview.independentApproval,"PENDING");
  assert.equal(row.primaryWitnessReview.rights,"UNRESOLVED");
  assert.notEqual(row.primaryWitnessReview.englishWordingFinding,"VERIFIED_FOR_RELEASE");
  assert.equal(row.primaryWitnessReview.frenchTextCollation.includes("APPROVED"),false);
 }
}
assert.equal(ids.size,200);
assert.deepEqual(holdCounts,witness.counts.holdDisposition);
assert.equal(foundReview.length,20,"exactly one representative candidate per mystery");
assert.deepEqual(new Set(foundReview.map(x=>x.mysteryId)),new Set(mysteryIDs));
const psalm=foundReview.find(x=>x.id==="glo4.b1");
assert.equal(psalm.primaryWitnessReview.englishWordingFinding,"HOLD_TYPOLOGY_AND_VULGATE_PSALM_NUMBER");
assert.equal(psalm.editionLocators.en,null,"Cannot pretend Psalms 131 and 132 are interchangeable in every Bible");
assert.equal(foundReview.filter(x=>x.primaryWitnessReview.englishWordingFinding==="COMPLETE_VERSE_MATCHED").length,4);
assert.equal(foundReview.filter(x=>x.primaryWitnessReview.englishWordingFinding==="PUNCTUATION_OR_ORTHOGRAPHY_DRIFT").length,7);

const policy=readFileSync("src/pray/rosary-scripture-policy.js","utf8");
assert.match(policy,/for\(const el of root\.querySelectorAll\(".lab-prayer-sheet \.lab-scripture-cue/);
assert.doesNotMatch(policy,/from ['"].*rosary-primary-edition-review/,"Research inventory must never be live Scripture text");
console.log("PASS Rosary primary witnesses: all 200 source IDs held, 20 candidate reviews (19 English compared; one numbering hold), four English complete-verse matches, zero EN/FR quotations cleared or republished.");
