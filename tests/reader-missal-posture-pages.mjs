import assert from "node:assert/strict";
import {projectPostureAwareMissalCards} from "../src/mass/reader-missal-posture-pages.js";
import {findReaderModeAnchorCard} from "../src/mass/reader-mode-switch.js";

// No liturgical words, events, posture owners or bilingual alignment may be
// altered by the secondary Missal page segmentation.
const row=(id,cues)=>Object.freeze({
  id,sourceCueIds:Object.freeze(cues),kind:"TEXT",
  primary:"Latin "+id,secondary:"English "+id,displayLanguage:"LATIN",
});
const a=Object.freeze({
  sectionId:"AO.MISSAL.010.1",sourceSectionId:"AO.CARD.010",
  sequence:1,title:"Offertory",missalPresentation:true,
  paragraphs:Object.freeze([
    row("p1",["AO.SM.C0106"]),row("p2",["AO.SM.C0107"]),
    row("p3",["AO.SM.C0109"]),row("p4",["AO.SM.C0110"]),
    row("p5",["AO.SM.C0111"]),
  ]),
  blocks:Object.freeze([
    {blockId:"AO.SM.B028",firstParagraphIndex:0,paragraphCount:2},
    {blockId:"AO.SM.B030",firstParagraphIndex:2,paragraphCount:3},
    {blockId:"AO.SM.B031",firstParagraphIndex:null,paragraphCount:0,omittedByRite:"SOURCE_ONLY"},
  ]),
});
const b=Object.freeze({
  sectionId:"AO.MISSAL.011.1",sourceSectionId:"AO.CARD.011",
  sequence:2,title:"Next Prayer",missalPresentation:true,
  paragraphs:Object.freeze([row("p6",["AO.SM.C0112"]),row("p7",["AO.SM.C0113"])]),
  blocks:Object.freeze([{blockId:"AO.SM.B039",firstParagraphIndex:0,paragraphCount:2}]),
});
const model=Object.freeze({
  presentationMode:"MISSAL",structureOwner:"CANONICAL_MISSAL_PRAYER_BLOCK_PRESENTATION",
  totalCards:2,cards:Object.freeze([a,b]),
  sourceAuthorityModel:Object.freeze({id:"ORIGINAL_CANONICAL"}),
});
const transitions={
  "AO.SM.C0106":"STAND",
  "AO.SM.C0109":"SIT",
  "AO.SM.C0112":"KNEEL",
};
const cueState=Object.freeze({
  supported:true,
  project:cueId=>({
    supported:true,postureTransition:cueId in transitions,
    posture:cueId in transitions ? {
      value:transitions[cueId],persistent:true,sourcePostureId:"SOURCE_"+cueId,
    }:null,
  }),
});
const projected=projectPostureAwareMissalCards(model,{
  cueState,preferences:{postureProfile:"FOLLOW_CONGREGATION"},
});
assert.equal(projected.totalCards,3,"One internal Offertory posture cue creates a new page");
assert.equal(projected.structureOwner,"CANONICAL_MISSAL_POSTURE_AWARE_PRAYER_PAGES");
assert.equal(projected.sourceAuthorityModel,model.sourceAuthorityModel);
assert.deepEqual(projected.cards.map(x=>x.sectionId),[
  "AO.MISSAL.010.1","AO.MISSAL.010.1.p2","AO.MISSAL.011.1",
]);
assert.deepEqual(projected.cards.map(x=>x.paragraphs.map(p=>p.id)),[
  ["p1","p2"],["p3","p4","p5"],["p6","p7"],
]);
assert.deepEqual(
  projected.cards.flatMap(card=>card.paragraphs),model.cards.flatMap(card=>card.paragraphs),
  "Page layout must never change the underlying bilingual paragraph objects");
assert.equal(projected.cards[0].nextPosture.value,"SIT");
assert.equal(projected.cards[0].nextPosture.advisory,true,
  "An observational/default congregation profile must not claim a universal posture");
assert.equal(projected.cards[1].nextPosture.value,"KNEEL");
assert.equal(projected.cards[1].postureEntry.cueId,"AO.SM.C0109");
assert.equal(projected.cards[1].blocks[0].blockId,"AO.SM.B030");
assert.equal(projected.cards[1].blocks[0].firstParagraphIndex,0);
assert.equal(projected.cards[1].blocks[0].paragraphCount,3);
assert.ok(projected.cards[0].blocks.some(block=>block.omittedByRite==="SOURCE_ONLY"),
  "Omitted source block remains traceable without a fake page");
assert.equal(projected.cards[1].blocks.some(block=>block.omittedByRite),false,
  "Omitted block must not be duplicated on a derived fragment");
assert.equal(projected.nextCard("AO.MISSAL.010.1")?.sectionId,"AO.MISSAL.010.1.p2");
assert.equal(projected.previousCard("AO.MISSAL.010.1.p2")?.sectionId,"AO.MISSAL.010.1");
assert.equal(findReaderModeAnchorCard(projected,{
  cueId:"AO.SM.C0110",sourceSectionId:"AO.CARD.010",
})?.sectionId,"AO.MISSAL.010.1.p2",
"Switching LIVE to MISSAL must land on the exact source cue, not first page");
assert.equal(projected.cardForEvent,undefined,"Missal page must not become an event clock");

const strict=projectPostureAwareMissalCards(model,{cueState,
  preferences:{postureProfile:"TRADITIONAL_WALSH"}});
assert.equal(strict.cards[0].nextPosture.advisory,false);

// A gesture without a persistent R17 postureTransition is never a new card.
const never=projectPostureAwareMissalCards(model,{cueState:{
  supported:true,project:()=>({supported:true,postureTransition:false,posture:{
    persistent:true,value:"KNEEL"}}),
}});
assert.equal(never.totalCards,2,"An ordinary bow/genuflection must not split Mass");
assert.equal(projectPostureAwareMissalCards(model,{cueState:{supported:false}}),model,
  "Unsupported Low-form projection must fail closed rather than invent posture");

// Saved local choices may be used, but local mode does not inherit source
// defaults when the user hasn't established them.
const local=projectPostureAwareMissalCards(model,{cueState,preferences:{
  postureProfile:"MY_LOCAL",localPostures:{"AO.SM.C0110":"KNEEL"},
}});
assert.equal(local.totalCards,3);
assert.equal(local.cards[1].postureEntry.owner,"MY_LOCAL_EXACT_CUE_POSTURE");
assert.equal(local.cards[0].nextPosture.value,"KNEEL");
const emptyLocal=projectPostureAwareMissalCards(model,{cueState,preferences:{
  postureProfile:"MY_LOCAL",localPostures:{},
}});
assert.equal(emptyLocal.totalCards,2);

// Unseparable multi-cue paragraph must never be bisected or projected as an
// exact physical-action timestamp.
const ambiguous=Object.freeze({...model,cards:Object.freeze([
  Object.freeze({...a,paragraphs:Object.freeze([
    row("p1",["AO.SM.C0106"]),row("p2",["AO.SM.C0109","AO.SM.C0110"]),
  ]),blocks:Object.freeze([{blockId:"AO.SM.B028",firstParagraphIndex:0,paragraphCount:2}])}),
])});
assert.equal(projectPostureAwareMissalCards(ambiguous,{cueState}).totalCards,1);
assert.equal(projectPostureAwareMissalCards({...model,presentationMode:"LIVE"},{cueState}).presentationMode,"LIVE");
console.log("PASS Missal posture page boundaries: source-owned, optional, bilingual, cue-anchored, no gesture events");
