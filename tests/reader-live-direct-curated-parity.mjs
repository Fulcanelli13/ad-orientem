import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMassReaderModel } from "../src/mass/reader-model.js";
import { projectCuratedOrdinaryLiveCards } from "../src/mass/reader-live-curated-cards.js";
import { projectDirectOrdinaryCuratedLiveCards } from "../src/mass/reader-live-direct-curated.js";

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
