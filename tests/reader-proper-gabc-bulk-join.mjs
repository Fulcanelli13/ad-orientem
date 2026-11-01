import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {index1961GradualeGabc,matchSelected1962ProperToGraduale,
  sourceMatchedGabcForEditorialReview,MASS_GABC_BULK_MATCH_SCHEMA,source1962ChantOpeningForMatch
} from "../src/mass/reader-proper-gabc-bulk-join.js";

const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const index=load("../data/mass/chant-corpus/gr1961-proper-index.json");
assert.equal(index.screening.validStaged,1195);
assert.equal(index.exceptions.length,58);
const batches=Array.from({length:6},(_,i)=>load("../data/mass/chant-corpus/gr1961-proper-"+
 String(i+1).padStart(3,"0")+".json"));
const archive=index1961GradualeGabc(batches);
assert.equal(archive.count,1195);
assert.equal(archive.approvedDigitalScores,0);
assert.deepEqual(Object.fromEntries(Object.entries(archive.byRole).map(([k,v])=>[k,v.length])),
 {in:229,gr:189,al:284,tr:83,of:185,co:225});
// The imported GABCs must be byte-for-byte the ORIGINAL research archive,
// not a new partial scrape or assistant-reconstructed Latin.
for(const rec of Object.values(archive.byRole).flat()){
 assert.equal(createHash("sha256").update(rec.gabc,"utf8").digest("hex"),
   rec.sha256,rec.id+" GABC changed during archive promotion");
 assert.equal(rec.releaseStatus,"RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED");
}
// Source notes in the LIVE 1962 Proper are bibliographic references, not
// GABC text. Do not allow their digits/book names to cause false negatives.
for(const [source,expected] of [
 ["Isa 9:6 ℣. Puer natus est nobis, et fílius datus est nobis.","Puer natus est nobis, et fílius datus est nobis."],
 ["Ps 88:12; 88:15 Tui sunt cœli et tua est terra.","Tui sunt cœli et tua est terra."],
 ["4 Esdr 2:34; 2:35 ℣. Réquiem ætérnam dona eis","Réquiem ætérnam dona eis"],
 ["Ps. 75:9-10. Terra trémuit, et quiévit","Terra trémuit, et quiévit"],
 ["Malach 3:1; 1 Par 29:12 ℣. Ecce, advénit dominátor Dóminus","Ecce, advénit dominátor Dóminus"],
 ["1 Cor 5:7-8 Pascha nostrum immolátus est Christus","Pascha nostrum immolátus est Christus"],
 ["Dómine Jesu Christe, Rex glóriæ","Dómine Jesu Christe, Rex glóriæ"]
])assert.equal(source1962ChantOpeningForMatch(source),expected);
assert.equal(source1962ChantOpeningForMatch("!Ps 97:3\n℣. Viderunt omnes fines terrae salutare Dei nostri"),
 "Viderunt omnes fines terrae salutare Dei nostri");
const mk=(text,group=null)=>({status:"READY",data:{paragraphs:[
 {id:"source-1962-1",latin:text,...(group?{liturgicalGroup:group}:{})}
]}});
const christmas={schema:"ao-reader-proper-slots-v1",ready:true,
 sourcePath:"Sancti/12-25m3",slots:{
 INTROIT:mk("Puer natus est nobis, et filius datus est nobis."),
 GRADUAL:mk("Viderunt omnes fines terrae salutare Dei nostri.","AO.CHANT.GRADUAL"),
 ALLELUIA_TRACT_SEQUENCE:mk(
   "Allelúia, allelúia. Dies sanctificatus illuxit nobis.","AO.CHANT.ALLELUIA"),
 OFFERTORY:mk("Tui sunt caeli, et tua est terra."),
 COMMUNION:mk("Viderunt omnes fines terrae salutare Dei nostri."),
}};
const citedChristmas=structuredClone(christmas);
citedChristmas.slots.INTROIT.data.paragraphs[0].latin="Isa 9:6 ℣. Puer natus est nobis, et filius datus est nobis.";
citedChristmas.slots.OFFERTORY.data.paragraphs[0].latin="Ps 88:12; 88:15 Tui sunt caeli, et tua est terra.";
citedChristmas.slots.COMMUNION.data.paragraphs[0].latin="Ps 97:3 Viderunt omnes fines terrae salutare Dei nostri.";
const cited=matchSelected1962ProperToGraduale({properSlots:citedChristmas,archive});
for(const [name,id] of [["INTROIT","GREGOBASE-72"],["OFFERTORY","GREGOBASE-1274"],
 ["COMMUNION","GREGOBASE-1139"]]){
 assert.equal(cited.tracks.find(t=>t.track===name).status,"UNIQUE_SOURCE_TEXT_CANDIDATE",
   name+" should strip only the printed bibliography before matching");
 assert.equal(cited.tracks.find(t=>t.track===name).scoreCandidates[0].scoreId,id);
}
const hit=matchSelected1962ProperToGraduale({properSlots:christmas,archive});
assert.equal(hit.schema,MASS_GABC_BULK_MATCH_SCHEMA);
assert.equal(hit.status,"SOURCE_FIRST_CANDIDATES_ONLY_NOT_SCORES");
assert.equal(hit.publicScores,0);
assert.equal(hit.tracks.length,5);
const expected=[
 ["INTROIT","GREGOBASE-72"],["GRADUAL","GREGOBASE-1163"],
 ["ALLELUIA_TRACT_SEQUENCE","GREGOBASE-324"],
 ["OFFERTORY","GREGOBASE-1274"],["COMMUNION","GREGOBASE-1139"]];
for(const [track,id] of expected){
 const row=hit.tracks.find(x=>x.track===track);
 assert.ok(row,track+" omitted");
 assert.ok(["UNIQUE_SOURCE_TEXT_CANDIDATE","AMBIGUOUS_SOURCE_TEXT_VARIANTS"].includes(row.status),
   track+" did not get a source-text candidate: "+row.status);
 assert.ok(row.scoreCandidates.some(c=>c.scoreId===id),
   track+" lost original source score "+id+"; got "+
   row.scoreCandidates.map(x=>x.scoreId).join(","));
 assert.ok(row.scoreCandidates.every(c=>
   c.matchedSelectedMass===true&&c.fullTextVerified===false&&
   c.musicalNotationVerified===false&&c.editorApproved===false&&c.publicScore===false));
 const material=sourceMatchedGabcForEditorialReview(hit,archive,id);
 assert.ok(material.gabc.length>50);
 assert.equal(material.approvedForPublic,false);
 assert.equal(material.audio,false);
}
const falsePath=matchSelected1962ProperToGraduale({properSlots:{
 ...christmas,sourcePath:"Unsafe/X"
},archive});
assert.equal(falsePath.status,"SOURCE_NOT_READY");
const noReady=matchSelected1962ProperToGraduale({properSlots:{
 ...christmas,ready:false
},archive});
assert.equal(noReady.status,"SOURCE_NOT_READY");
// A combined Gradual/Alleluia cannot silently become two chant settings.
const combined=matchSelected1962ProperToGraduale({properSlots:{
 ...christmas,slots:{...christmas.slots,
 GRADUAL:mk("Viderunt omnes fines terrae salutare Dei nostri. Alleluia."),
 ALLELUIA_TRACT_SEQUENCE:mk("Allelúia, allelúia. Dies sanctificatus illuxit nobis.")
}},archive});
assert.equal(combined.tracks.find(x=>x.track==="GRADUAL").status,"CHANT_ROLE_UNVERIFIED");
assert.equal(combined.tracks.find(x=>x.track==="ALLELUIA_TRACT_SEQUENCE").status,"CHANT_ROLE_UNVERIFIED");
const noArchive=matchSelected1962ProperToGraduale({properSlots:christmas,archive:null});
assert.equal(noArchive.status,"SOURCE_NOT_READY");
// The same Latin incipit in a Gradual and a Communion never crosses the
// original office-part boundary or authorises a different chant part.
const communion=hit.tracks.find(x=>x.track==="COMMUNION");
assert.ok(communion.scoreCandidates.every(c=>c.part==="co"));
assert.ok(!communion.scoreCandidates.some(c=>c.scoreId==="GREGOBASE-1163"));
const invalid=structuredClone(batches);
invalid[0].items[0].sourceEditionId=3;
assert.throws(()=>index1961GradualeGabc(invalid),/UNTRUSTED_ARCHIVE_SCORE/);
assert.equal(sourceMatchedGabcForEditorialReview({...hit,status:"SOURCE_NOT_READY"},archive,
 "GREGOBASE-72"),null);
console.log("PASS source-first 1962 -> 1195 parsed GABCs, 5 Christmas chant candidates, strict source and role holds");
