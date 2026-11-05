import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMassReaderModel } from "../src/mass/reader-model.js";
import { projectCuratedOrdinaryLiveCards } from "../src/mass/reader-live-curated-cards.js";
import { projectDirectOrdinaryCuratedLiveCards,projectDirectSpecialCuratedLiveCards } from "../src/mass/reader-live-direct-curated.js";
import { projectCuratedIntroitEntryLiveCards } from "../src/mass/reader-live-curated-cards.js";
import { captureReaderModeAnchor,findReaderModeAnchorCard } from "../src/mass/reader-mode-switch.js";

const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const data={
  sectionMap:load("../data/presentation/reader-section-map.v0.13.1.json"),
  lowCorpus:load("../data/presentation/reader-text-low.v1.json"),
  sungCorpus:load("../data/presentation/reader-text-sung.v1.json"),
  canonSourceMap:load("../data/presentation/reader-canon-source-map.v1.json"),
};
const t=(lat,en)=>({lat,en});
const proper={
  sourcePath:"Sancti/10-07",
  introit:t("Introitus","Introit"),collects:[t("Collecta","Collect")],
  epistle:t("Epistola","Epistle"),gradual:t("Graduale","Gradual"),
  alleluia_tract:t("Alleluia","Alleluia"),
  sequence:{lat:"",en:""},gospel:t("Evangelium","Gospel"),
  offertory:t("Offertorium","Offertory"),secrets:[t("Secreta","Secret")],
  preface:t("Praefatio","Preface"),communion:t("Communio","Communion"),
  postcommunions:[t("Postcommunio","Postcommunion")],
};
function build(form,scenario){
  const req=scenario==="REQUIEM";
  const hasSequence=scenario==="SEQUENCE" || req;
  const input={...proper,sourcePath:req?"Votive/Requiem":"Sancti/10-07",
    sequence:hasSequence?t("Sequentia","Sequence"):{lat:"",en:""}};
  const resolved={
    schema:"ao-resolved-mass-v2",date:req?"2026-11-02":"2026-10-07",
    form,presentationMode:"MISSAL",
    calendarCelebration:{id:req?"ALL_SOULS":"HOLY_ROSARY",type:"CALENDAR"},
    actualCelebration:{id:req?"requiem":"holy_rosary",type:req?"REQUIEM":"VOTIVE"},
    explicitlySelectedCelebration:true,
    proper:{status:"READY",data:input},
    overlays:req?["REQUIEM"]:["VOTIVE_PROPER"],
    precedingRites:[],followingActions:[],distinctRite:null,
  };
  const macros=createMassReaderModel({...data,resolvedMass:resolved});
  const source=createMassReaderModel({...data,resolvedMass:{
    ...resolved,presentationMode:"LIVE"}});
  const staged=projectCuratedOrdinaryLiveCards(source);
  const direct=projectDirectOrdinaryCuratedLiveCards(macros,data.canonSourceMap);
  return {macros,source,staged,direct};
}

function cardContract(c){
  return {
    sectionId:c.sectionId,sourceSectionId:c.sourceSectionId,
    sequence:c.sequence,sourceSequence:c.sourceSequence,
    guideSequence:c.guideSequence,title:c.title,part:c.part,
    paragraphs:c.paragraphs,blocks:c.blocks,
    stateOnly:c.stateOnly,omittedByRite:c.omittedByRite,
    sourceEventIds:c.sourceEventIds,eventIds:c.eventIds,
    curatedPresentationReview:c.curatedPresentationReview,
    provenance:c.provenance,
  };
}
let inspected=0;
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  for(const scenario of ["ORDINARY","SEQUENCE","REQUIEM"]){
    const {macros,source,staged,direct}=build(form,scenario);
    const context=form+"/"+scenario;
    assert.equal(macros.totalCards,30,context+" direct source macros");
    assert.equal(source.totalCards,39,context+" old source intermediary");
    assert.equal(direct.sourceAuthorityModel,macros,
      context+" direct presentation retained a hidden 39-card source owner");
    assert.equal(direct.directSourceMacroCount,30);
    assert.equal(direct.directCanonicalSourceUnitCount,39);
    assert.equal(direct.totalCards,staged.totalCards,context+" total card count");
    assert.deepEqual(direct.cards.map(cardContract),staged.cards.map(cardContract),
      context+" direct source stream differs from published 39 -> 65 cut list");
    assert.deepEqual(direct.cards.flatMap(c=>c.paragraphs.map(p=>p.id)),
      source.cards.flatMap(c=>c.paragraphs.map(p=>p.id)),
      context+" source paragraph order or multiplicity changed");
    assert.deepEqual(direct.cards.map(c=>c.sectionId),
      staged.cards.map(c=>c.sectionId),context+" distinct card identity changed");
    assert.equal(direct.sourceOnlyCueRegister===null,form==="LOW",
      context+" low-vs-chant source-only cue ownership differs");
    inspected++;
  }
}
assert.equal(inspected,12);
console.log("direct LIVE macro-to-curated parity: PASS — 12 four-form/Ordinary/Sequence/Requiem matrices; exact source paragraph, block, cue and card identity preserved without storing 39-card intermediary.");


// Phase 2: exact special-Mass equivalence, starting from unmodified 30
// source macros instead of a 39-card source owner. Existing source insertion
// functions still validate the 1962 position, wording and event ownership.
const nuptialData=load("../data/presentation/reader-nuptial.v1.json");
const mandatumSource=load("../data/mass/special-days-core.v1.1.json")
  .optional_inserts.HOLY_THURSDAY_MANDATUM;
const emberOrder=["OratioL2","LectioL1","GradualeL1","OratioL1","LectioL2"];
const emberNodes=emberOrder.map((sourceSectionId,index)=>({
  id:"PRE_GOSPEL."+String(index+1).padStart(2,"0")+"."+sourceSectionId,
  type:sourceSectionId.startsWith("Oratio")?"ORATION":
    sourceSectionId.startsWith("Lectio")?"LESSON":"GRADUAL",
  sourceSectionId,sourceOrderIndex:index,orderAuthority:"SOURCE_ORDER",
  payloadRef:"PAYLOAD_"+sourceSectionId,
  sourceRef:"Tempora/Ember-Test:"+sourceSectionId,
}));
const emberPayloads={
  PAYLOAD_OratioL2:{bodyLat:"Orémus. Flectámus génua. Oratio secunda. Leváte.",
    bodyEn:"Let us pray. Let us kneel. Second prayer. Arise.",
    conclusionLat:"Per Dóminum nostrum Iesum Christum.",
    conclusionEn:"Through our Lord Jesus Christ."},
  PAYLOAD_LectioL1:{textLat:"Lectio prima.",textEn:"First lesson."},
  PAYLOAD_GradualeL1:{textLat:"Graduale primum.",textEn:"First gradual."},
  PAYLOAD_OratioL1:{bodyLat:"Orémus. Oratio prima.",
    bodyEn:"Let us pray. First prayer.",
    conclusionLat:"Per Dóminum nostrum Iesum Christum.",
    conclusionEn:"Through our Lord Jesus Christ."},
  PAYLOAD_LectioL2:{textLat:"Lectio secunda.",textEn:"Second lesson."},
};
const emberProper={...proper,schema:"ao-proper-manifest-v2",
  sourcePath:"Tempora/Ember-Test",
  requirements:{preGospelSequence:true,preGospelSourceOrder:true,crossParity:true},
  crossParityStatus:"PASS",
  orations:{collectSet:[],secretSet:[],postcommunionSet:[]},
  canonPackage:{},
  preGospelSequence:emberNodes,
  preGospelSequenceProvenance:{
    schema:"ao-pre-gospel-source-order-v1",orderAuthority:"SOURCE_ORDER",
    structuralLanguage:"la",sourcePath:"Tempora/Ember-Test",
    sourceOrder:emberOrder,
  },
  preGospelPayloads:emberPayloads,
};

function specialModels(form,scenario){
  const holyThursday=scenario==="HOLY_THURSDAY"||scenario==="HOLY_THURSDAY_MANDATUM";
  const mandatumPresent=scenario==="HOLY_THURSDAY_MANDATUM";
  const nuptial=scenario==="NUPTIAL";
  const ember=scenario==="EMBER";
  const resolved={
    schema:"ao-resolved-mass-v2",date:holyThursday?"2026-04-02":"2026-10-07",
    form,presentationMode:"LIVE",
    calendarCelebration:{id:"special",type:"CALENDAR"},
    actualCelebration:{id:"special",type:"CALENDAR"},
    explicitlySelectedCelebration:true,
    proper:{status:"READY",data:holyThursday
      ? {...proper,sourcePath:"Tempora/Quad6-4r"}
      : ember?emberProper:proper},
    provenance:holyThursday?{holyThursday:{mandatumPresent}}:{},
    overlays:nuptial?["NUPTIAL"]:ember?["EMBER_LESSONS"]:[],
    precedingRites:[],followingActions:[],distinctRite:null,
  };
  const args={...data,nuptialData,holyThursdayMandatumSource:mandatumSource};
  const macros=createMassReaderModel({...args,
    resolvedMass:{...resolved,presentationMode:"MISSAL"},sourceMacrosOnly:true});
  const source=createMassReaderModel({...args,resolvedMass:resolved});
  const staged=projectCuratedOrdinaryLiveCards(source);
  const direct=projectDirectSpecialCuratedLiveCards({
    sourceMacros:macros,canonSourceMap:data.canonSourceMap,
    resolvedMass:resolved,nuptialData,
    holyThursdayMandatumSource:mandatumSource,
    holyThursdayMandatumPresent:mandatumPresent,
  });
  return {macros,source,staged,direct,resolved,args};
}

let specialCount=0;
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  for(const scenario of ["HOLY_THURSDAY","HOLY_THURSDAY_MANDATUM","NUPTIAL","EMBER"]){
    const {macros,source,staged,direct,resolved,args}=specialModels(form,scenario);
    const context=form+"/"+scenario;
    const count=scenario==="HOLY_THURSDAY"?61:
      scenario==="HOLY_THURSDAY_MANDATUM"?62:
      scenario==="NUPTIAL"?68:70;
    assert.equal(macros.totalCards,30,context+" macro source");
    assert.equal(macros.structureOwner,"BASE_30_MACROS");
    assert.equal(source.totalCards,scenario==="HOLY_THURSDAY"?38:
      scenario==="HOLY_THURSDAY_MANDATUM"?39:
      scenario==="NUPTIAL"?42:44);
    assert.equal(staged.totalCards,count,context+" legacy curated");
    assert.equal(direct.totalCards,count,context+" direct curated");
    assert.equal(direct.sourceAuthorityModel,macros,context+" leaked a 39-card model");
    assert.equal(direct.directCanonicalSourceUnitCount,39);
    assert.equal(direct.sourceModelTotalCards,source.totalCards);
    assert.deepEqual(direct.cards.map(cardContract),staged.cards.map(cardContract),
      context+" direct 1962 insertion drifted from published source curation");
    assert.deepEqual(direct.cards.flatMap(c=>c.paragraphs.map(p=>p.id)),
      source.cards.flatMap(c=>c.paragraphs.map(p=>p.id)),
      context+" prayer/reading paragraph duplicated or lost");
    if(scenario==="EMBER"){
      const inserted=direct.cards.filter(c=>c.emberInsertion);
      assert.deepEqual(inserted.map(c=>c.sourceSectionKey),emberOrder);
      assert.deepEqual(inserted[0].formulaStates,staged.cards.find(c=>
        c.sectionId===inserted[0].sectionId).formulaStates);
    }
    if(scenario==="HOLY_THURSDAY"||scenario==="HOLY_THURSDAY_MANDATUM"){
      assert.equal(direct.cards.some(c=>c.sourceSectionId==="AO.CARD.009"),false);
      assert.equal(direct.cards.some(c=>c.sourceSectionId==="AO.HT.MANDATUM"),
        scenario==="HOLY_THURSDAY_MANDATUM");
    }
    if(scenario==="NUPTIAL"||scenario==="EMBER"){
      const insert=direct.cards.find(c=>scenario==="NUPTIAL"?
        c.sectionId==="AO.NUPTIAL.02":c.sectionId==="AO.EMBER.02");
      const anchor=captureReaderModeAnchor(insert);
      const missal=createMassReaderModel({...args,
        resolvedMass:{...resolved,presentationMode:"MISSAL"}});
      assert.equal(findReaderModeAnchorCard(missal,anchor)?.sectionId,insert.sectionId,
        context+" direct LIVE insertion lost MISSAL anchor");
    }
    specialCount++;
  }
}
assert.equal(specialCount,16);

// An Introit-entry Mass after Palm/Ash/Candlemas/Rogations has four
// genuinely omitted Foot-cluster cards, not a different source corpus.
let introitCount=0;
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  const {macros,source,staged,direct}=build(form,"ORDINARY");
  for(const rite of ["PALM","ASH","CANDLEMAS","ROGATIONS"]){
    const historical=projectCuratedIntroitEntryLiveCards(staged);
    const replacement=projectCuratedIntroitEntryLiveCards(direct);
    assert.equal(replacement.totalCards,61,form+"/"+rite+" Introit handoff");
    assert.equal(replacement.cards[0].title,"Introit");
    assert.equal(replacement.cards.some(c=>c.sourceSectionId==="AO.CARD.001" &&
      c.title!=="Introit"),false);
    assert.deepEqual(replacement.cards.map(cardContract),historical.cards.map(cardContract));
    assert.equal(replacement.sourceAuthorityModel,macros);
    assert.equal(source.totalCards,39);
    introitCount++;
  }
}
assert.equal(introitCount,16);
assert.throws(()=>projectDirectSpecialCuratedLiveCards({
  sourceMacros:specialModels("LOW","NUPTIAL").macros,
  canonSourceMap:data.canonSourceMap,
  resolvedMass:{...specialModels("LOW","NUPTIAL").resolved,
    overlays:["NUPTIAL","EMBER_LESSONS"]},nuptialData,
}),/DIRECT_SPECIAL_MIXED_INSERTIONS_UNCERTIFIED/);
console.log("direct 30 -> 65 special-parity: PASS — 16 four-form Holy Thursday/Nuptial/Ember cases and 16 source-faithful Introit handoffs, with byte-identical curated cards, formula states and mode anchors.");
