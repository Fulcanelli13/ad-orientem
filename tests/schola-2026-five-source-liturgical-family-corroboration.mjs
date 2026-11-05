// Confirm the dated 1962 Mass family without mistaking legacy file names for approved aliases.
// Runs after the annual selected-source disposition script; no note or melody approvals.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read = path => JSON.parse(readFileSync(path,"utf8"));
const review=read("data/research/schola-2026-five-source-liturgical-family-corroboration.v1.json");
const legacy=read("data/research/schola-2026-five-pinned-source-gap-evidence.v1.json");
const report=read(".tmp/schola-1962-selected-annual/2026-schola-five-pinned-source-gap-dispositions.json");
const expected = new Map([
 ["Commune/C10b",{dates:["2026-01-03","2026-01-10"],roles:["GRADUAL","ALLELUIA"],incipits:["Speciosus forma","Post partum, Virgo"]}],
 ["Commune/C10c",{dates:["2026-02-14"],roles:["GRADUAL","TRACT"],incipits:["Benedicta et venerabilis","Gaude, Maria Virgo"]}],
 ["Commune/C10Pasc",{dates:["2026-04-18"],roles:["ALLELUIA_1","ALLELUIA_2"],incipits:["Virga Jesse floruit","Ave Maria, gratia plena"]}],
 ["Commune/C10t",{dates:["2026-06-20","2026-06-27","2026-07-04","2026-07-11","2026-08-01","2026-10-31","2026-11-07","2026-11-28"],roles:["GRADUAL","ALLELUIA"],incipits:["Benedicta et venerabilis","Post partum, Virgo"]}],
 ["Tempora/Nat1-1",{dates:["2026-12-29","2026-12-30","2026-12-31"],roles:["GRADUAL","ALLELUIA"],incipits:["Viderunt omnes fines terrae","Dies sanctificatus illuxit nobis"]}]
]);
assert.equal(review.schema,"ao-schola-2026-five-source-liturgical-family-corroboration-v1");
assert.equal(review.boundaries.liturgicalFamilyCorroborated,5);
assert.equal(review.boundaries.selectedDatesCorroborated,15);
assert.equal(review.boundaries.original1962PrintedRubricAndEverySectionCertified,false);
assert.equal(review.boundaries.digitalSourceAliasAuthorized,false);
assert.equal(review.boundaries.scoreNotationCertified,false);
assert.equal(review.boundaries.approvedSourceAliases,0);
assert.equal(review.boundaries.approvedProperScores,0);
assert.equal(review.boundaries.productionChanges,false);
assert.equal(review.boundaries.auxiliary1942NOHIsNot1961GradualeProof,true);
assert.equal(review.data.length,5);
assert.equal(legacy.selectedSourceGaps.length,5);
assert.equal(report.gaps.length,5);
const seen=new Set();
for(const e of review.data){
 const target=expected.get(e.sourcePath);
 assert.ok(target,"Unrecognized selected-year family "+e.sourcePath);
 assert.ok(!seen.has(e.sourcePath),"Duplicate family");
 seen.add(e.sourcePath);
 assert.deepEqual(e.dates,target.dates);
 assert.deepEqual(e.preGospel.map(x=>x.role),target.roles);
 assert.deepEqual(e.preGospel.map(x=>x.incipit),target.incipits);
 assert.equal(e.liturgicalOwnerStatus,"DATED_1962_MASS_FAMILY_CORROBORATED");
 assert.equal(e.digitalSourceOwnerStatus,"HELD_PENDING_EXACT_SECTION_INHERITANCE_PROOF");
 assert.equal(e.allScoreCandidatesEditorialOnly,true);
 assert.ok(e.referenceUrls.length>=2 && e.referenceUrls.every(u=>/^https:\/\//.test(u)));
 const historical=legacy.selectedSourceGaps.find(x=>x.sourcePath===e.sourcePath);
 const selected=report.gaps.find(x=>x.selectedSourcePath===e.sourcePath);
 assert.ok(historical&&selected);
 assert.equal(selected.pinned1049SourceExists,false);
 assert.equal(selected.selected1962OwnerCertified,false);
 assert.equal(selected.original1962SectionCertified,false);
 assert.equal(selected.aliasAuthorized,false);
 assert.equal(selected.digitalScoreAuthorized,false);
 assert.deepEqual(selected.actual2026Dates.map(x=>x.date),e.dates);
 assert.ok(selected.actual2026Dates.every(x=>x.digitalScoreAuthorized===false));
 if(e.sourcePath==="Tempora/Nat1-1"){
   assert.equal(historical.historicalSource,null);
   assert.equal(selected.historicalWitness,null);
   assert.deepEqual(e.digitalSourceCandidate,{
    path:"Tempora/Nat30",
    sourceBlobSha:"87d86207529bf7d4fd0487844ed9a61e6666ba6b",
    status:"TEXT_SECTION_WITNESS_CANDIDATE_NO_AUTOMATIC_ALIAS"
   });
 } else {
   assert.equal(e.digitalSourceCandidate,null);
   assert.ok(historical.historicalSource.blobSha===selected.historicalWitness.blobSha);
 }
}
assert.equal(seen.size,5);
assert.equal(new Set(review.data.flatMap(x=>x.dates)).size,15);
assert.equal(report.publication.aliasesApproved,0);
assert.equal(report.publication.publicGregorianScores,0);
console.log("PASS five 1962 liturgical Mass families / 15 dates independently corroborated, with seasonal pre-Gospel roles; 0 pinned-owner aliases or printed 1961 scores approved");
