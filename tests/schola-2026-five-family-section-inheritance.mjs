// Research-only section-chain lock for the five source-path families.
// A traceable text owner is NOT a Gregorian score or a public source-path alias.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const data=load("data/research/schola-2026-five-family-section-inheritance.v1.json");
const family=load("data/research/schola-2026-five-source-liturgical-family-corroboration.v1.json");
const historical=load("data/research/schola-2026-five-pinned-source-gap-evidence.v1.json");
const selected=load(".tmp/schola-1962-selected-annual/2026-schola-five-pinned-source-gap-dispositions.json");
const inventory=load("data/research/mass-music-1962-pinned-full-source-universe.v1.json");
const expectedBlobs=new Map([
 ["Commune/C10","65b0cfae138a1acc909ff9ee43031e9e9fbae009"],
 ["Commune/C10b","25a6a7b43c87fb7bb6c46437a10153c33f7f8924"],
 ["Commune/C10c","02c6058c330b31ab4183e2ef2c7d0067b71f29ae"],
 ["Commune/C10Pasc","cf8efa4b7cdb8d1b7ba7512d133f066c4d7c04b2"],
 ["Commune/C10t","dc7daad4e051c34636070dce89a690f5dddad6ed"],
 ["Tempora/Nat30","87d86207529bf7d4fd0487844ed9a61e6666ba6b"],
 ["Sancti/12-25m2","e9c7579c692cee14c9f3e4d8e5b31b07eea52a43"],
 ["Sancti/12-25m3","0aa08651eac53b13abeee330d1de44ee09b69918"]
]);
const roles={
 "Commune/C10b":{Introitus:"Commune/C10b",Gradual:"Commune/C10b",Alleluia:"Commune/C10b",Offertorium:"Commune/C10b",Communio:"Commune/C10",Secreta:"Commune/C10",Postcommunio:"Commune/C10b"},
 "Commune/C10c":{Introitus:"Commune/C10",Gradual:"Commune/C10c",Tract:"Commune/C10c",Offertorium:"Commune/C10c",Communio:"Commune/C10",Secreta:"Commune/C10",Postcommunio:"Commune/C10"},
 "Commune/C10Pasc":{Introitus:"Commune/C10",Alleluia1:"Commune/C10Pasc",Alleluia2:"Commune/C10Pasc",Offertorium:"Commune/C10Pasc",Communio:"Commune/C10",Secreta:"Commune/C10",Postcommunio:"Commune/C10"},
 "Commune/C10t":{Introitus:"Commune/C10",Gradual:"Commune/C10",Alleluia:"Commune/C10",Offertorium:"Commune/C10",Communio:"Commune/C10",Secreta:"Commune/C10",Postcommunio:"Commune/C10"},
 "Tempora/Nat1-1":{Introitus:"Tempora/Nat30",Gradual:"Sancti/12-25m3",Alleluia:"Sancti/12-25m3",Offertorium:"Tempora/Nat30",Communio:"Tempora/Nat30",Oratio:"Tempora/Nat30",Lectio:"Sancti/12-25m2",Evangelium:"Sancti/12-25m2",Secreta:"Sancti/12-25m3",Postcommunio:"Sancti/12-25m3"}
};
assert.equal(data.schema,"ao-schola-five-family-section-chain-collation-v1");
assert.equal(data.immutableRef,inventory.sourceRef);
assert.equal(data.original1962Missal.edition,"Missale Romanum 1962 (Benziger, editio iuxta typicam)");
assert.equal(data.progress.archiveInheritanceChainsDocumented,5);
assert.equal(data.progress.affectedDatesDocumented,15);
assert.equal(data.progress.pinnedSourceSectionCandidateFamilies,1);
assert.equal(data.progress.obsoleteOnlySectionFamilies,4);
assert.equal(data.progress.original1962PrintedMelodicScoresApproved,0);
assert.equal(data.progress.automaticRuntimeSourceAliasesApproved,0);
assert.equal(data.progress.publicProperScores,0);
for(const key of ["canCopyObsoleteFilesIntoPinnedInventory","canPromoteGabc","canChangePublicReader"])
 assert.equal(data.approval[key],false);
assert.equal(data.approval.researchOnly,true);
assert.equal(data.sourceBlobs.length,8);
const pinned=new Map(inventory.sourceFiles.map(x=>[x.path,x.sha]));
const seenBlobs=new Set();
for(const b of data.sourceBlobs){
 assert.ok(!seenBlobs.has(b.path));
 seenBlobs.add(b.path);
 assert.equal(b.blob,expectedBlobs.get(b.path));
 assert.ok(/^[a-f0-9]{40}$/.test(b.blob));
 if(b.tier==="PINNED_1049") assert.equal(pinned.get(b.path),b.blob);
 else { assert.equal(b.tier,"OBSOLETE_ONLY");assert.equal(pinned.has(b.path),false); }
 if(b.path.startsWith("Commune/C10")&&b.path!=="Commune/C10") assert.equal(b.parent,"Commune/C10");
}
assert.equal(seenBlobs.size,8);
assert.equal(pinned.has("Tempora/Nat1-1"),false);
assert.equal(pinned.has("Tempora/Nat1-0"),true);
assert.equal(data.sourceFamilies.length,5);
const seen=new Set(),allDates=new Set();
for(const f of data.sourceFamilies){
 assert.ok(roles[f.sourcePath],"Unexpected source path");
 assert.ok(!seen.has(f.sourcePath));seen.add(f.sourcePath);
 const listed=family.data.find(x=>x.sourcePath===f.sourcePath);
 const old=historical.selectedSourceGaps.find(x=>x.sourcePath===f.sourcePath);
 const audit=selected.gaps.find(x=>x.selectedSourcePath===f.sourcePath);
 assert.ok(listed&&old&&audit);
 assert.deepEqual(f.dates,listed.dates);
 assert.deepEqual(f.dates,audit.actual2026Dates.map(x=>x.date));
 assert.deepEqual(Object.keys(f.sections).sort(),Object.keys(roles[f.sourcePath]).sort());
 for(const [role,owner] of Object.entries(roles[f.sourcePath])){
   const ref=f.sections[role];
   assert.ok(ref.startsWith(owner+":"),"Incorrect section donor for "+f.sourcePath+":"+role);
   assert.ok(expectedBlobs.has(owner),"Unproved owner "+owner);
   assert.ok(!ref.includes("Nat1-0"),"Sunday source must never replace the Octave weekday");
 }
 assert.ok(Array.isArray(f.notAppointed)&&f.notAppointed.length>=1);
 assert.equal(f.ownerEvidence.startsWith("PRINTED_")||f.ownerEvidence.startsWith("HISTORICAL_"),true);
 for(const date of f.dates){assert.ok(!allDates.has(date));allDates.add(date);}
 if(f.sourcePath==="Commune/C10Pasc"){
  assert.equal(f.caution,"HISTORICAL_TEXT_OMITS_PRINTED_PASCHAL_ALLELUIA_SUFFIXES");
  assert.equal(f.sections.Alleluia1,f.sections.Alleluia2);
  assert.equal(Object.hasOwn(f.sections,"Gradual"),false);
  assert.equal(Object.hasOwn(f.sections,"Tract"),false);
 }
 if(f.sourcePath==="Commune/C10c"){
  assert.ok(f.notAppointed.some(x=>x.includes("Alleluia")));
  assert.equal(Object.hasOwn(f.sections,"Alleluia"),false);
 }
 if(f.sourcePath==="Commune/C10t") assert.ok(Object.values(f.sections).every(x=>x.startsWith("Commune/C10:")));
 if(f.sourcePath==="Tempora/Nat1-1"){
  assert.equal(f.dateOrationQualifications["2026-12-29"].includes("Thomas"),true);
  assert.equal(f.dateOrationQualifications["2026-12-30"].includes("No universal"),true);
  assert.equal(f.dateOrationQualifications["2026-12-31"].includes("Sylvester"),true);
  assert.equal(old.historicalSource,null);
  assert.ok(Object.values(f.sections).every(x=>!x.startsWith("Tempora/Nat1-1:")));
 }else{
  assert.ok(old.historicalSource);
  assert.equal(data.sourceBlobs.find(x=>x.path===f.sourcePath).blob,old.historicalSource.blobSha);
 }
 assert.equal(audit.aliasAuthorized,false);
 assert.equal(audit.selected1962OwnerCertified,false);
}
assert.equal(allDates.size,15);
assert.equal(seen.size,5);
assert.equal(selected.publication.aliasesApproved,0);
assert.equal(selected.publication.publicGregorianScores,0);
console.log("PASS 5 archival source-section chains / 15 actual dates / 8 immutable source blobs; Christmas Octave pinned candidate and Marian Paschal text-suffix hold; no public aliases or scores");
