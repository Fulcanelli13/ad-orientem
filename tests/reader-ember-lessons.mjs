import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMassReaderModel } from "../src/mass/reader-model.js";
import { buildEmberInsertionCards } from "../src/mass/reader-ember-lessons.js";
import { makeResolvedMass, compileMassPlan } from "../src/mass/session-engine.js";
import { projectSpecialStructure } from "../src/mass/reader-special-structure.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const low=load("../data/presentation/reader-text-low.v1.json");
const sung=load("../data/presentation/reader-text-sung.v1.json");
const sectionMap=load("../data/presentation/reader-section-map.v0.13.1.json");
const canonSourceMap=load("../data/presentation/reader-canon-source-map.v1.json");
const registry=load("../data/mass/rite-overlay-registry.v1.json");
const extension=load("../data/mass/special-days-extension.v1.3.json");
const core=load("../data/mass/special-days-core.v1.1.json");

const t=(lat,en)=>({lat,en});
const order=["OratioL2","LectioL1","GradualeL1","OratioL1","LectioL2"];
const nodes=order.map((sourceSectionId,index)=>({
  id:"PRE_GOSPEL."+String(index+1).padStart(2,"0")+"."+sourceSectionId,
  type:sourceSectionId.startsWith("Oratio")?"ORATION":sourceSectionId.startsWith("Lectio")?"LESSON":"GRADUAL",
  sourceSectionId,
  sourceOrderIndex:index,
  orderAuthority:"SOURCE_ORDER",
  payloadRef:"PAYLOAD_"+sourceSectionId,
  sourceRef:"Tempora/Ember-Test:"+sourceSectionId,
}));
const payloads={
  PAYLOAD_OratioL2:{
    bodyLat:"Orémus. Flectámus génua. Oratio secunda. Leváte.",
    bodyEn:"Let us pray. Let us kneel. Second prayer. Arise.",
    conclusionLat:"Per Dóminum nostrum Iesum Christum.",
    conclusionEn:"Through our Lord Jesus Christ."
  },
  PAYLOAD_LectioL1:{textLat:"Lectio prima.",textEn:"First lesson."},
  PAYLOAD_GradualeL1:{textLat:"Graduale primum.",textEn:"First gradual."},
  PAYLOAD_OratioL1:{
    bodyLat:"Orémus. Oratio prima.",
    bodyEn:"Let us pray. First prayer.",
    conclusionLat:"Per Dóminum nostrum Iesum Christum.",
    conclusionEn:"Through our Lord Jesus Christ."
  },
  PAYLOAD_LectioL2:{textLat:"Lectio secunda.",textEn:"Second lesson."},
};

const proper={
  schema:"ao-proper-manifest-v2",
  sourcePath:"Tempora/Ember-Test",
  requirements:{preGospelSequence:true,preGospelSourceOrder:true,crossParity:true},
  crossParityStatus:"PASS",
  introit:t("Introitus","Introit"),
  collects:[t("Collecta","Collect")],
  epistle:t("Epistola ordinaria","Ordinary Epistle"),
  gradual:t("Graduale ordinarium","Ordinary Gradual"),
  sequence:{lat:"",en:""},
  gospel:t("Evangelium","Gospel"),
  offertory:t("Offertorium","Offertory"),
  secrets:[t("Secreta","Secret")],
  preface:t("Praefatio","Preface"),
  communion:t("Communio","Communion"),
  postcommunions:[t("Postcommunio","Postcommunion")],
  orations:{collectSet:[],secretSet:[],postcommunionSet:[]},
  canonPackage:{},
  preGospelSequence:nodes,
  preGospelSequenceProvenance:{
    schema:"ao-pre-gospel-source-order-v1",
    orderAuthority:"SOURCE_ORDER",
    structuralLanguage:"la",
    sourcePath:"Tempora/Ember-Test",
    sourceOrder:order,
  },
  preGospelPayloads:payloads,
};

const resolved={
  schema:"ao-resolved-mass-v2",
  date:"2026-09-19",
  form:"MISSA_CANTATA_INCENSE",
  presentationMode:"LIVE",
  calendarCelebration:{id:"ember-saturday",type:"CALENDAR"},
  actualCelebration:{id:"ember-saturday",type:"CALENDAR"},
  explicitlySelectedCelebration:false,
  proper,
  overlays:["EMBER_LESSONS"],precedingRites:[],followingActions:[],distinctRite:null,
};

const inserts=buildEmberInsertionCards(resolved);
assert.equal(inserts.length,5);
assert.deepEqual(inserts.map(x=>x.sourceSectionKey),order,
  "Ember insertion reordered nodes by numeric suffix");
assert.deepEqual(inserts.map(x=>x.emberNodeType),["ORATION","LESSON","GRADUAL","ORATION","LESSON"]);
assert.deepEqual(inserts[0].formulaStates.map(x=>x.formula),["FLECTAMUS_GENUA","LEVATE"]);
assert.equal(inserts[1].posture,"SIT");
assert.equal(inserts[2].posture,"STAND_OR_SOURCE_FORMULA");
assert.equal(inserts[0].paragraphs[0].primary,"Let us pray. Let us kneel. Second prayer. Arise.");
assert.equal(inserts[0].paragraphs[0].alternate,"Orémus. Flectámus génua. Oratio secunda. Leváte.");

const live=createMassReaderModel({resolvedMass:resolved,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap});
assert.equal(live.totalCards,44);
assert.equal(live.emberInsertionCount,5);
assert.deepEqual(live.emberSourceOrder,order);
assert.deepEqual(live.cards.slice(4,9).map(x=>x.sourceSectionKey),order);
assert.equal(live.cards[3].sourceSectionId,"AO.CARD.004");
assert.equal(live.cards[9].sourceSectionId,"AO.CARD.005");
assert.equal(live.cards[9].sourceSequence,5);
assert.equal(live.cards[9].title,"Epistle / Lesson");
const epistle=live.cardForEvent("MC-EPI-010");
assert.equal(epistle.card.sourceSectionId,"AO.CARD.005");
assert.equal(epistle.card.sequence,10);
assert.equal(epistle.progress.label,"10 / 44");
assert.equal(live.cards.at(-1).sourceSequence,30,
  "Ember insertion destroyed ordinary Last Gospel source sequence");

const simple=createMassReaderModel({
  resolvedMass:{...resolved,presentationMode:"SIMPLE"},
  sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
});
assert.equal(simple.totalCards,35);
assert.equal(simple.cards[9].sectionId,"AO.CARD.005");
assert.equal(simple.cards.at(-1).sourceSequence,30);

const unresolved=structuredClone(resolved);
delete unresolved.proper.preGospelPayloads.PAYLOAD_LectioL2;
assert.throws(()=>createMassReaderModel({
  resolvedMass:unresolved,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
}),/payloadRef is unresolved/);

const reordered=structuredClone(resolved);
reordered.proper.preGospelSequence.reverse();
assert.throws(()=>createMassReaderModel({
  resolvedMass:reordered,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
}),/sourceOrderIndex mismatch|does not preserve source order/);

const compiled=makeResolvedMass({
  date:"2026-09-19",form:"MISSA_CANTATA_INCENSE",presentationMode:"LIVE",
  calendarCelebration:{id:"ember-saturday",type:"CALENDAR"},
  proper,overlays:["EMBER_LESSONS"]
});
const plan=compileMassPlan(compiled);
assert.ok(plan.insertions.includes("RESOLVED_PREPARATORY_LESSONS"));
const projection=projectSpecialStructure({session:{resolvedMass:compiled,plan}},{registry,extension,core});
const segment=projection.segments.find(x=>x.id==="RESOLVED_PREPARATORY_LESSONS");
assert.ok(segment);
assert.equal(segment.renderable,true);
assert.equal(segment.planOwned,true);
assert.equal(segment.readerPayload,"SOURCE_ORDER_PRE_GOSPEL_READER");
assert.equal(projection.releaseSupport,true);

console.log("Ember lessons: PASS — source-order Proper nodes render before ordinary Epistle; suffix pairing is impossible and unresolved payloads fail closed.");
