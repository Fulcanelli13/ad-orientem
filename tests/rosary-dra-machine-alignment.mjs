import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const audit=JSON.parse(readFileSync("data/pray/rosary-dra-machine-alignment.v1.json","utf8"));
const donor=JSON.parse(readFileSync("data/pray/rosary-scripture-editorial-inventory.v1.json","utf8"));
const canonical=JSON.parse(readFileSync("data/pray/rosary-drc-crampon-collation.v1.json","utf8"));
assert.equal(canonical.rows.length,200);
assert.equal(canonical.counts.englishFoundAllSourceVerses,200);
assert.equal(canonical.counts.frenchFoundAllSourceVerses,197);
assert.equal(canonical.counts.permittedPublication,0);
assert.notEqual(canonical.editionInput.sourceRepo,audit.source.repository,
 "Independent English Challoner comparison must not silently replace the paired Catholic canonical SOT");

const rowMap=new Map(donor.rows.map(r=>[r.id,r]));
assert.equal(rowMap.size,200);
assert.equal(audit.rows.length,200);
assert.equal(audit.counts.matchedRows,200);
assert.equal(audit.source.pinnedBlobSha,"6d21aacbdf891673e731cf5dd6689abd7a4fa62d","comparison witness changed without review");
assert.equal(audit.counts.certifiedText,0);
assert.equal(audit.counts.excerptsReintroduced,0);
assert.equal(audit.counts.frenchQuoteCompared,0,"English word matching cannot certify Crampon text");
const expected={FULL_VERSE_NORMALIZED_MATCH:78,CONTIGUOUS_MATCH:76,ELLIPSIS_COMPONENTS_LOCATED:32,NOT_CONTIGUOUS:6,ELLIPSIS_UNRESOLVED:2,NUMBERING_MAPPING_REQUIRED:6};
assert.deepEqual(audit.counts.classification,expected);
const ids=new Set();
const counts={};
for(const row of audit.rows){
 assert.ok(rowMap.has(row.id),"nonexistent legacy Scripture cue "+row.id);
 assert.ok(!ids.has(row.id),"duplicate Scripture cue "+row.id);
 ids.add(row.id);
 const original=rowMap.get(row.id);
 assert.equal(row.sourceReference,original.sourceReference);
 const index=audit.rows.indexOf(row);
 assert.equal(row.id,canonical.rows[index].id,"Independent Challoner comparison drifted from paired Catholic SOT");
 assert.equal(row.sourceReference,canonical.rows[index].citation,"Mismatch in source citation ownership");
 assert.equal(row.mysteryId,original.mysteryId);
 assert.equal(row.certifiedForDisplay,false);
 assert.equal(row.frenchTextStatus,"NOT_COLLATED_TO_CRAMPON_1923");
 assert.ok(row.sourceVersesFound>=0);
 assert.ok(row.witnessUrl.includes(audit.source.pinnedBlobSha));
 counts[row.status]=(counts[row.status]||0)+1;
 if(row.status==="NUMBERING_MAPPING_REQUIRED")assert.equal(row.normalizedWitnessBook,"Psalms");
 if(["NOT_CONTIGUOUS","ELLIPSIS_UNRESOLVED"].includes(row.status)){
  assert.ok(row.manualDifferenceTriage?.verifiedAgainstPinnedEnglishWitness,row.id+" has untriaged wording mismatch");
  assert.equal(row.manualDifferenceTriage.approval,"HOLD_FOR_EXACT_TEXT_EDIT_AND_CONTEXT_REVIEW");
 }
}
assert.deepEqual(counts,expected);
assert.equal(ids.size,200);
assert.equal(audit.rows.filter(x=>x.manualDifferenceTriage).length,8);
assert.equal(audit.rows.filter(x=>x.status==="ELLIPSIS_COMPONENTS_LOCATED").every(x=>x.inheritedFlags.includes("EDITORIAL_ELLIPSIS")),true);
console.log("PASS Rosary 200/200 English DRA machine alignment: 78 normalized full matches, 76 excerpts, 32 ellipsis component matches, 8 held wording discrepancies, 6 Psalm-numbering holds, 0 quotes published.");
