import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MASS_SEQUENCE_PRAYER_WORKS,MASS_SEQUENCE_PRAYER_SCHEMA,massSequencePrayerWork,
 massSequencePrayerLibraryMatches,projectMassSequencePrayer,loadMassSequencePrayer}
 from "../src/pray/mass-sequences-from-proper.v1.js";

assert.deepEqual(MASS_SEQUENCE_PRAYER_WORKS.map(x=>x.id),[
 "mass_sequence_victimae_paschali","mass_sequence_lauda_sion","mass_sequence_dies_irae"]);
const make=(work)=>({
 status:"ready",date:work.date,proper:{status:"ready",data:{
  sourcePath:work.sourcePath,sequence:{
   lat:work.opening+" "+("dóminus et fidéles recítent. ").repeat(125),
   en:(work.id==="mass_sequence_dies_irae"?"May be omitted at Daily Mass\n":"")+
       "Complete English donor form. "+("Original text belongs to the selected Proper. ").repeat(80),
   fr:"Témoin français intégral. "+("Le texte appartient au propre de la messe. ").repeat(80)
  }
 }}
});
for(const work of MASS_SEQUENCE_PRAYER_WORKS){
 const input=make(work),record=projectMassSequencePrayer(work.id,input);
 assert.equal(record.schema,MASS_SEQUENCE_PRAYER_SCHEMA);
 assert.equal(record.sourcePath,work.sourcePath);
 assert.equal(record.sourceDate,work.date);
 assert.equal(record.sourceSection,"Sequentia");
 assert.equal(record.printed1962IndependentlyCollated,false);
 assert.equal(record.notationApproved,false);
 assert.equal(record.devotionalReadingOnly,true);
 assert.ok(record.latin.includes(work.opening));
 assert.ok(record.french.length>=work.minLatin*.6);
 const result=await loadMassSequencePrayer(work.id,{resolver:{resolveDay:async date=>{
  assert.equal(date,work.date);return input;
 }}});
 assert.deepEqual(result,record);
 assert.throws(()=>projectMassSequencePrayer(work.id,{...input,date:"2026-01-01"}),/ACTUAL_MASS_DAY_NOT_READY/);
 assert.throws(()=>projectMassSequencePrayer(work.id,{...input,proper:{
  ...input.proper,data:{...input.proper.data,sourcePath:"Sancti/01-01"}
 }}),/SELECTED_1962_PROPER_IDENTITY_MISMATCH/);
 assert.throws(()=>projectMassSequencePrayer(work.id,{...input,proper:{
  ...input.proper,data:{...input.proper.data,sequence:{
   ...input.proper.data.sequence,fr:""
  }}
 }}),/COMPLETE_TRILINGUAL_TEXT_MISSING/);
 assert.throws(()=>projectMassSequencePrayer(work.id,{...input,proper:{
  ...input.proper,data:{...input.proper.data,sequence:{
   ...input.proper.data.sequence,lat:"Other sequence "+"x".repeat(1500)
  }}
 }}),work.id==="mass_sequence_lauda_sion"
  ? /LAUDA_SION_SOURCE_START_UNVERIFIED/
  : /LATIN_SEQUENCE_OPENING_MISMATCH/);
}
const corpus=massSequencePrayerWork("mass_sequence_lauda_sion");
const corpusDonor=make(corpus);
corpusDonor.proper.data.sequence.lat="Thomæ de Aquino. (infra octavam ad libitum Celebrantis omitti potest, juxta Rubricas.)\n"+
 corpusDonor.proper.data.sequence.lat;
const corpusReader=projectMassSequencePrayer(corpus.id,corpusDonor);
assert.ok(corpusReader.latin.startsWith("lauda sion salvatorem"),
 "The Latin sequence must not open with the donor's attribution");
assert.match(corpusReader.sourceEditorialNote,/Thomæ de Aquino/);
const dies=projectMassSequencePrayer("mass_sequence_dies_irae",
 make(massSequencePrayerWork("mass_sequence_dies_irae")));
assert.ok(!dies.english.startsWith("May be omitted at Daily Mass"),
 "All Souls English editorial note is not a verse");
assert.equal(massSequencePrayerWork("invented"),null);
assert.throws(()=>projectMassSequencePrayer("invented",{}),/UNKNOWN_WORK/);
assert.equal(massSequencePrayerLibraryMatches({search:"Lauda"}).length,1);
assert.equal(massSequencePrayerLibraryMatches({search:"dies",subject:"IX"}).length,1);
assert.equal(massSequencePrayerLibraryMatches({search:"victimae",subject:"III"}).length,0);
assert.equal(massSequencePrayerLibraryMatches({category:"essentials"}).length,0);
const runtime=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
for(const text of ["renderMassSequencePrayer()","loadMassSequencePrayer(id)",
 "data-ao-pray-mass-sequence","data-p435930-mass-sequence-open",
 "data-p435930-mass-sequence-retry","massSequencePrayerLibraryMatches"])
 assert.ok(runtime.includes(text),"Missing native Prayer reader integration: "+text);
console.log("PASS three source-owned Mass sequences: no duplicate hymn bodies, exact feast/Proper identity, complete trilingual projection, no score or print claims, source-specific All Souls note, Library discovery and held failures.");
