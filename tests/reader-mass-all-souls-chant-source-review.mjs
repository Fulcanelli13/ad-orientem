import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const data=read("data/research/mass-music-2026-11-02-all-souls-six-chant-leads.v1.json");
const archive=Array.from({length:6},(_,i)=>read(
 "data/research/mass-music-m07-gr1961-review-00"+(i+1)+".v1.json"))
 .flatMap(x=>x.candidates);
const byId=new Map(archive.map(x=>[x.sourceId,x]));
const priority=read("data/research/mass-music-m07-priority-source-queue.v1.json");
const expectedRoles=["INTROIT","GRADUAL","TRACT","OFFERTORY","COMMUNION"];
const expectedIds=[766,1261,338,1199,241];
const expectedParts=["in","gr","tr","of","co"];
const expectedPages=["94*","95*","95*","100*","102*"];
assert.equal(data.publication,"RESEARCH_HOLD");
assert.equal(data.churchCalendar.date,"2026-11-02");
assert.equal(data.selectedMassWitnesses.length,3);
assert.deepEqual(data.selectedMassWitnesses.map(x=>x.mass),["I","II","III"]);
assert.deepEqual(data.selectedMassWitnesses.map(x=>x.sourcePath),
 ["Sancti/11-02m1","Sancti/11-02m2","Sancti/11-02m3"]);
assert.deepEqual(data.selectedMassWitnesses.map(x=>x.originalSourceBlobSha),
 ["5dc537fdbabcb257f54d24bb12d02f59ea1fa6bd",
  "463d11b23ed573ad84a720c5f476c9f1f48be52e",
  "43d07bb659a6da36b7628710121f3c6318cc2651"]);
assert.equal(new Set(data.selectedMassWitnesses.map(x=>x.collectIncipit)).size,3);
for(const m of data.selectedMassWitnesses){
 assert.equal(m.inheritance,"ex C9");
 assert.equal(m.noGloria,true);
 assert.equal(m.noCredo,true);
 assert.equal(m.sequenceRule,true);
}
assert.equal(data.inheritedProperWitness.status,"PARENT_FILE_NOT_FOUND_AT_PINNED_PATH");
assert.equal(data.properScoreLeads.length,5);
assert.deepEqual(data.properScoreLeads.map(x=>x.role),expectedRoles);
assert.deepEqual(data.properScoreLeads.map(x=>x.gregobaseId),expectedIds);
assert.deepEqual(data.properScoreLeads.map(x=>x.folio),expectedPages);
for(const [i,x] of data.properScoreLeads.entries()){
 const original=byId.get(x.gregobaseId);
 assert.ok(original,"Missing original 1961 archive ID "+x.gregobaseId);
 assert.equal(x.originalArchiveId,original.id);
 assert.equal(x.originalPart,expectedParts[i]);
 assert.equal(x.originalPart,original.part);
 assert.equal(x.originalGabcSha256,original.sourceSha256);
 assert.equal(x.folio,original.folio);
 assert.equal(x.sourceUrl,original.sourceUrl);
 assert.equal(x.selected1962MassMatch,"NOT_VERIFIED");
 assert.equal(x.completeLatinVerses,"NOT_VERIFIED");
 assert.equal(x.printed1961Neumes,"NOT_COMPARED");
 assert.equal(x.editorialApproval,false);
 assert.equal(x.publicReader,false);
 assert.equal(x.audioPublished,false);
}
const seq=data.sequenceSourceLead;
const lead=priority.leads.find(x=>x.sourceId===1198);
assert.ok(lead,"M07 Dies irae source lead must be preserved");
assert.equal(seq.role,"SEQUENCE");
assert.equal(seq.gregobaseId,1198);
assert.equal(seq.sourceReferenceId,lead.id);
assert.equal(seq.sourceUrl,lead.sourceUrl);
assert.equal(seq.sourceFolio,lead.sourceFolio);
assert.equal(byId.has(1198),false,
 "Separate Sequence source must not be falsely promoted to the 1,195-score Proper archive");
assert.equal(seq.selected1962MassMatch,"NOT_VERIFIED");
assert.equal(seq.completeLatinVerses,"NOT_VERIFIED");
assert.equal(seq.printed1961Neumes,"NOT_COMPARED");
assert.equal(seq.editorialApproval,false);
assert.equal(seq.publicReader,false);
assert.equal(seq.audioPublished,false);
assert.deepEqual(data.otherMusicBoundaries.disallowed,
 ["GLORIA","CREDO","ALLELUIA","ASPERGES_SUNDAY"]);
assert.deepEqual(data.published,{
 selectedProperScoreCount:0,facsimileNoteMatches:0,recordingsApproved:0,
 publicNotationCount:0,noNewGabcCopied:true,noNewRenderer:true,
 userApprovalRequired:"ONE_FINAL_COMPLETE_COLLECTION_REVIEW"
});
console.log("PASS: three All Souls source formularies, five archive-linked Requiem scores and one separate Dies irae lead; publication closed");
