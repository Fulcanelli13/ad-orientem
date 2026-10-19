import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildRogationsLitanyOwnershipMatrix} from "../tools/mass/reconcile-rogation-litany-1962.mjs";
import {buildRogationsPayload} from "../src/mass/reader-rogations.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const alignment=read("../data/mass/rogation-112-invocations-historical-en-fr-crosswalk.v1.json");
const census=read("../data/mass/rogation-187-vernacular-owner-census.v1.json");
const source=read("../data/presentation/reader-rogations.v1.json");
const graph=read("../data/mass/special-days-extension.v1.3.json").graphs.ROG;
const m=buildRogationsLitanyOwnershipMatrix();
const reader=buildRogationsPayload({graph,payload:source});
const rows=reader.cards.find(x=>x.id==="ROG-R03").paragraphs;
const owners=census.rows.filter(x=>x.stage==="ROG-R03");
assert.equal(alignment.schema,"ao-rogation-112-invocation-historical-english-french-alignment-v1");
assert.equal(alignment.status,"112_HISTORICAL_AND_LATER_RITUAL_PARALLELS_FOUND_EDITORIAL_RIGHTS_RELEASE_BLOCKED");
assert.equal(alignment.summary.additionalLaterWitnessStatus.frenchBilingualProcessionTextCandidates,112);
assert.equal(alignment.summary.additionalLaterWitnessStatus.englishRitualLitanyTextCandidates,112);
assert.equal(alignment.summary.additionalLaterWitnessStatus.noEnglishSourceCandidateFound,0);
assert.equal(alignment.summary.additionalLaterWitnessStatus.noFrenchSourceCandidateFound,0);
assert.equal(alignment.summary.additionalLaterWitnessStatus.fullyApprovedBothLanguages,0);
assert.equal(alignment.summary.additionalLaterWitnessStatus.completeEditionToEditionVerifiedParity,false);
assert.deepEqual(alignment.summary.additionalLaterWitnessStatus.firstHistoricalOmissionsBackfilled.french,
 ["ROG-R03-10","ROG-R03-74","ROG-R03-75","ROG-R03-81","ROG-R03-96"]);
assert.deepEqual(alignment.summary.additionalLaterWitnessStatus.firstHistoricalOmissionsBackfilled.english,
 ["ROG-R03-74","ROG-R03-75","ROG-R03-96"]);
assert.equal(alignment.rows.length,112);
assert.equal(m.items.length,112);
assert.equal(rows.length,112);
assert.equal(owners.length,112);
assert.equal(reader.cards.length,6);
assert.equal(reader.petitionsDuplicated,false);
assert.equal(new Set(alignment.rows.map(x=>x.rowId)).size,112);
assert.equal(alignment.summary.totalSourceInvocations,112);
assert.equal(alignment.summary.existingExactOrdinaryOrPRAYLatinCandidates,11);
assert.equal(alignment.summary.withoutExistingExactOwner,101);
assert.equal(alignment.summary.bothEnFr,107);
assert.equal(alignment.summary.enOnly,2);
assert.equal(alignment.summary.frOnly,0);
assert.equal(alignment.summary.neither,3);
assert.deepEqual(alignment.summary.historicalWithoutExactOwner,{
 HISTORICAL_EN_FR_PARALLEL:96,
 HISTORICAL_EN_ONLY:2,
 NO_EN_FR_HISTORICAL_PARALLEL:3
});
assert.equal(alignment.summary.sourceRowsApprovedEn,0);
assert.equal(alignment.summary.sourceRowsApprovedFr,0);
assert.equal(alignment.summary.confirmedNewEnglishTranslationsNeeded,null);
assert.equal(alignment.summary.confirmedNewFrenchTranslationsNeeded,null);
for(let i=0;i<112;i++){
 const a=alignment.rows[i],r=rows[i],o=owners[i],old=m.items[i];
 assert.equal(a.rowId,"ROG-R03-"+(i+1));
 assert.equal(a.rowId,r.id);
 assert.equal(a.rowId,o.rowId);
 assert.equal(a.rowId,old.rowId);
 assert.equal(a.canonicalIndex,i+1);
 assert.equal(a.sourcePath,"processionLitany."+i);
 assert.equal(a.sourcePath,o.sourcePath);
 assert.equal(r.latin,source.processionLitany[i]);
 assert.equal(a.existingExactLatinOwnerCandidate,
   Boolean(o.ordinaryCueIds.length||o.prayIds.length));
 assert.equal(a.english.state==="ABSENT_IN_1883",a.english.renderedLine===null);
 assert.equal(a.french.state==="ABSENT_IN_1862_FRENCH_PROSE",a.french.renderedLine===null);
 assert.equal(a.historicalPairStatus,
   a.english.renderedLine!==null&&a.french.renderedLine!==null?
     "HISTORICAL_EN_FR_PARALLEL":
     a.english.renderedLine!==null?"HISTORICAL_EN_ONLY":
     a.french.renderedLine!==null?"HISTORICAL_FR_ONLY":"NO_EN_FR_HISTORICAL_PARALLEL");
 if(a.english.renderedLine!==null){
   assert.ok(a.english.sourceUrl.includes("oldid=12282621"));
   assert.ok(Number.isInteger(a.english.renderedLine));
 }
 if(a.french.renderedLine!==null){
   assert.ok(a.french.sourceUrl.includes("oldid=14794744"));
   assert.ok(Number.isInteger(a.french.renderedLine));
 }
 const newer=a.additionalQualifiedCandidateWitnesses;
 assert.ok(newer,"Missing separately qualified later witness for "+a.rowId);
 const expectedPage=a.canonicalIndex===1?0:a.canonicalIndex<=40?1:
   a.canonicalIndex<=81?2:a.canonicalIndex<=107?3:4;
 assert.equal(newer.french.pdfPageZeroBased,expectedPage);
 assert.equal(newer.french.state,"LATIN_FRENCH_SIDE_BY_SIDE_ROW_CANDIDATE_NOT_APPROVED");
 assert.equal(newer.english.state,"ORDERED_GROUP_PARALLEL_CANDIDATE_NOT_APPROVED");
 assert.equal(newer.english.distributionRights,"COPYRIGHT_1964_NO_REUSE_PERMISSION");
 assert.equal(newer.french.distributionRights,"NOT_ESTABLISHED");
 assert.ok(Number.isInteger(newer.english.sectionLines.lineStart));
 assert.ok(Number.isInteger(newer.english.sectionLines.lineEnd));
 assert.equal(newer.english.historicalAbsenceBackfilled,a.english.renderedLine===null);
 assert.equal(newer.french.historicalAbsenceBackfilled,a.french.renderedLine===null);
 assert.deepEqual(a.translationApproved,{en:false,fr:false});
 assert.equal(Object.hasOwn(a,"englishText"),false);
 assert.equal(Object.hasOwn(a,"frenchText"),false);
 assert.equal(Object.hasOwn(a,"latin"),false);
}
const absentEng=alignment.rows.filter(x=>x.english.renderedLine===null).map(x=>x.rowId);
const absentFr=alignment.rows.filter(x=>x.french.renderedLine===null).map(x=>x.rowId);
assert.deepEqual(absentEng,["ROG-R03-74","ROG-R03-75","ROG-R03-96"]);
assert.deepEqual(absentFr,["ROG-R03-10","ROG-R03-74","ROG-R03-75","ROG-R03-81","ROG-R03-96"]);
assert.deepEqual(alignment.exceptionRows.map(x=>x.rowId),absentFr);
assert.equal(alignment.rows[80].french.historicalLatinWitnessLine,847,
  "French omission at Cross and Passion exists despite separate 1862 Latin printed witness");
assert.equal(alignment.rows[80].french.historicalLatinState,"PRESENT_DESPITE_PROSE_OMISSION");
assert.equal(alignment.rows[14].english.renderedLine,161);
assert.equal(alignment.rows[17].english.renderedLine,167);
assert.equal(alignment.rows[14].french.renderedLine,908);
assert.equal(alignment.rows[17].french.renderedLine,911);
assert.notEqual(alignment.rows[14].canonicalTextOwner,alignment.rows[17].canonicalTextOwner);
assert.equal(alignment.rows[21].english.renderedLine,alignment.rows[22].english.renderedLine,
 "1883 St Simon and St Thaddeus printed together without merging canonical identities");
assert.equal(alignment.rows[62].historicalPairStatus,"HISTORICAL_EN_FR_PARALLEL");
assert.equal(alignment.rows[86].historicalPairStatus,"HISTORICAL_EN_FR_PARALLEL");
assert.equal(alignment.rows[103].historicalPairStatus,"HISTORICAL_EN_FR_PARALLEL");
assert.equal(alignment.rows[111].historicalPairStatus,"HISTORICAL_EN_FR_PARALLEL");
assert.ok(alignment.editorialGates.some(x=>x.includes("General Rubrics")));
assert.match(alignment.provenance.additionalCandidateWitnesses.english.rights,/COPYRIGHT_1964/);
assert.match(alignment.provenance.additionalCandidateWitnesses.french.rights,/NO_AUTOMATIC/);
console.log("PASS all 112 source invocations have 2020 French bilingual and 1964 Weller English candidates; five omissions confined to the older witnesses; 0 approvals.");
