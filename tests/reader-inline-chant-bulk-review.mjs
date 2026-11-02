import assert from "node:assert/strict";
import {buildSelectedMassInlineProperReviewBatch,
  buildAnnualInlineProperReviewQueue,INLINE_CHANT_BULK_REVIEW_SCHEMA}
 from "../src/mass/reader-inline-chant-bulk-review.js";

const texts={
 INTROIT:"Puer natus est nobis et filius datus est nobis",
 GRADUAL:"Viderunt omnes fines terrae salutare Dei nostri",
 ALLELUIA_TRACT_SEQUENCE:"Dies sanctificatus illuxit nobis hodie clementer",
 OFFERTORY:"Tui sunt caeli et tua est terra",
 COMMUNION:"Lux fulgebit hodie super nos redemptor"
};
const slotId={INTROIT:"INTROIT.1",GRADUAL:"GRADUAL.1",
 ALLELUIA_TRACT_SEQUENCE:"ALLELUIA_TRACT_SEQUENCE.1",
 OFFERTORY:"OFFERTORY.1",COMMUNION:"COMMUNION.1"};
const role={INTROIT:"in",GRADUAL:"gr",ALLELUIA_TRACT_SEQUENCE:"al",
 OFFERTORY:"of",COMMUNION:"co"};
const selection={INTROIT:"PROPER_INTROIT",GRADUAL:"PROPER_GRADUAL",
 ALLELUIA_TRACT_SEQUENCE:"PROPER_ALLELUIA",
 OFFERTORY:"PROPER_OFFERTORY",COMMUNION:"PROPER_COMMUNION"};
const sourcePath="Sancti/12-25m3";
const archive={schema:"ao-mass-1961-full-gabc-source-index-v1",count:1195,
 byRole:Object.fromEntries(Object.keys(texts).map((k,i)=>[role[k],[{
 id:"GREGOBASE-"+(100+i),sha256:"a".repeat(64),officePart:role[k],
 normalizedScoreText:texts[k].toLowerCase(),gradualeRomanum1961Page:"20",
 sourceUrl:"https://gregobase.selapa.net/chant.php?id="+(100+i)
 }]]))};
const properSlots={schema:"ao-reader-proper-slots-v1",ready:true,sourcePath,
 slots:Object.fromEntries(Object.keys(texts).map(k=>[k,{status:"READY",data:{paragraphs:[{
 id:slotId[k],latin:texts[k],sourcePath,
 ...(k==="GRADUAL"?{liturgicalGroup:"AO.CHANT.GRADUAL"}:{}),
 ...(k==="ALLELUIA_TRACT_SEQUENCE"?{liturgicalGroup:"AO.CHANT.ALLELUIA"}:{})
 }]}}]))};
const readerParagraphs=Object.keys(texts).map(k=>({id:slotId[k],primary:texts[k],
 sourcePath,sourceBlockId:"AO.SM.B"+k,sourceCueIds:[]}));
const data=buildSelectedMassInlineProperReviewBatch({properSlots,archive,readerParagraphs});
assert.equal(data.schema,INLINE_CHANT_BULK_REVIEW_SCHEMA);
assert.equal(data.status,"EDITORIAL_REVIEW_ONLY_NO_PUBLICATION");
assert.equal(data.candidateCount,5);
assert.equal(data.anchoredCandidateCount,5);
assert.equal(data.publicScores,0);
for(const k of Object.keys(texts)){
 const row=data.tracks.find(t=>t.selectionKey===selection[k]);
 assert.equal(row.status,"PARAGRAPH_ANCHORED_MUSIC_REVIEW_REQUIRED",k);
 assert.equal(row.candidates[0].sourceParagraphId,slotId[k]);
 assert.equal(row.candidates[0].publicScore,false);
 assert.equal(row.candidates[0].musicalNotationVerified,false);
 assert.equal(row.candidates[0].sourceBlockId,"AO.SM.B"+k);
 assert.equal(row.candidates[0].gabc,undefined);
}
const noReader=buildSelectedMassInlineProperReviewBatch({properSlots,archive});
assert.equal(noReader.candidateCount,0);
assert.equal(noReader.tracks.every(t=>t.status==="REVIEW_HOLD"),true);
const duplicate=buildSelectedMassInlineProperReviewBatch({properSlots,archive,
 readerParagraphs:[...readerParagraphs,readerParagraphs[0]]});
assert.equal(duplicate.candidateCount,4);
assert.equal(duplicate.tracks[0].reason,"READER_PARAGRAPH_AMBIGUOUS");
const unverified=buildSelectedMassInlineProperReviewBatch({
 properSlots:{...properSlots,ready:false},archive,readerParagraphs});
assert.equal(unverified.status,"SOURCE_HOLD");
const wrongPath=buildSelectedMassInlineProperReviewBatch({properSlots,archive,
 readerParagraphs:readerParagraphs.map(p=>({...p,sourcePath:"Sancti/11-01"}))});
assert.equal(wrongPath.candidateCount,0);

const annual=buildAnnualInlineProperReviewQueue({archive,selectedMasses:[
 {selectedMassId:"2026-12-25-MASS-III",properSlots,readerParagraphs},
 {selectedMassId:"2027-12-25-MASS-III",properSlots,readerParagraphs}
]});
assert.equal(annual.sourceCandidateOccurrences,10);
assert.equal(annual.distinctReviewLeadCount,5);
assert.equal(annual.reviewLeads[0].occurrences.length,2);
assert.equal(annual.publicScores,0);
assert.throws(()=>buildAnnualInlineProperReviewQueue({archive,selectedMasses:[
 {selectedMassId:"same",properSlots,readerParagraphs},
 {selectedMassId:"same",properSlots,readerParagraphs}
]}),/DUPLICATED/);
console.log("PASS source-anchored bulk Proper review, annual deduplication, no publication");