import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createMassReaderModel} from "../src/mass/reader-model.js";
import {projectCuratedOrdinaryLiveCards,projectCuratedIntroitEntryLiveCards} from "../src/mass/reader-live-curated-cards.js";
import {buildReaderModeModels} from "../src/mass/reader-mode-switch.js";
import {createNativeScholaController} from "../src/mass/reader-schola.js";
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const data={
  sectionMap:read("../data/presentation/reader-section-map.v0.13.1.json"),
  lowCorpus:read("../data/presentation/reader-text-low.v1.json"),
  sungCorpus:read("../data/presentation/reader-text-sung.v1.json"),
  canonSourceMap:read("../data/presentation/reader-canon-source-map.v1.json"),
  frenchOrdinary:read("../data/presentation/reader-french-ordinary.v1.json"),
};
const tr=(latin,english,french=english)=>({lat:latin,en:english,fr:french});
const bare={
  sourcePath:"Sancti/10-07",
  introit:tr("Introitus","Introit"),
  collects:[tr("Collecta","Collect")],
  epistle:tr("Epistola","Epistle"),
  gradual:tr("Graduale et Alleluia","Gradual and Alleluia"),
  sequence:{lat:"",en:"",fr:""},
  gospel:tr("Evangelium","Gospel"),
  offertory:tr("Offertorium","Offertory"),
  secrets:[tr("Secreta","Secret")],
  preface:tr("Praefatio","Preface"),
  communion:tr("Communio","Communion"),
  postcommunions:[tr("Postcommunio","Postcommunion")],
};
const sessionFor=(proper)=>({
  schema:"ao-resolved-mass-v2",
  date:"2026-10-15",
  form:"MISSA_CANTATA_INCENSE",
  presentationMode:"LIVE",
  actualCelebration:{id:"test-source",type:"CALENDAR",title:"Source test"},
  calendarCelebration:{id:"test-source",type:"CALENDAR"},
  explicitlySelectedCelebration:true,
  proper:{status:"READY",data:proper,sourcePath:proper.sourcePath},
  overlays:[],precedingRites:[],followingActions:[],distinctRite:null,
});
const make=(proper,language="en")=>{
  const prepared={session:{resolvedMass:sessionFor(proper)},readerPreferences:{language}};
  const source=createMassReaderModel({
    resolvedMass:prepared.session.resolvedMass,sectionMap:data.sectionMap,
    lowCorpus:data.lowCorpus,sungCorpus:data.sungCorpus,
    canonSourceMap:data.canonSourceMap,frenchOrdinary:data.frenchOrdinary,
    vernacularLanguage:language,
  });
  return {source,prepared,curated:projectCuratedOrdinaryLiveCards(source)};
};
const normal=make(bare);
assert.equal(normal.source.totalCards,39);
assert.equal(normal.curated.totalCards,64,"Ordinary Mass with no Sequence has a single Sanctus–Benedictus card");
assert.equal(normal.curated.cards.filter(c=>c.sourceSectionId==="AO.CARD.006").length,1,
  "No-source Sequence must not yield a phantom card");
const sequenceProper={...bare,sequence:tr("Lauda Sion","Praise, O Sion","Loue, Sion")};
for(const language of ["en","fr"]){
 const {source,prepared,curated}=make(sequenceProper,language);
 assert.equal(curated.totalCards,65,"A real separate Sequence merits another navigable card");
 const sourceChant=source.cards.find(c=>c.sectionId==="AO.CARD.006");
 const chantCards=curated.cards.filter(c=>c.sourceSectionId==="AO.CARD.006");
 assert.deepEqual(chantCards.map(c=>c.title),["Gradual · Alleluia / Tract","Sequence"]);
 assert.deepEqual(chantCards.flatMap(c=>c.paragraphs.map(p=>p.id)),
   sourceChant.paragraphs.map(p=>p.id),
   "Source paragraphs lost or duplicated when splitting Gradual and Sequence");
 assert.deepEqual(chantCards.map(c=>c.blocks.filter(b=>b.paragraphCount>0).map(b=>b.blockId)),
   [["AO.SM.B021"],["AO.SM.B022"]],
   "Each source chant must retain its own exact canonical block");
 assert.equal(chantCards[0].paragraphs.some(p=>String(p.primary).includes(language==="fr"?"Gradual and Alleluia":"Gradual and Alleluia")),true);
 assert.ok(chantCards[1].paragraphs.some(p=>
   String(p.primary).includes(language==="fr"?"Loue, Sion":"Praise, O Sion")));
 assert.equal(curated.nextCard(chantCards[0].sectionId)?.sectionId,chantCards[1].sectionId);
 assert.equal(curated.previousCard(chantCards[1].sectionId)?.sectionId,chantCards[0].sectionId);
 const baseParagraphs=source.cards.flatMap(c=>c.paragraphs.map(p=>p.id));
 assert.deepEqual(curated.cards.flatMap(c=>c.paragraphs.map(p=>p.id)),baseParagraphs,
   "A conditional Sequence changed the source-first Mass text inventory");
 const schola=createNativeScholaController({
   sungCorpus:data.sungCorpus,properSlots:source.properSlots,
   prepared,frenchOrdinary:data.frenchOrdinary,
 });
 assert.equal(schola.activateForCard(chantCards[0]).trackId,"GRADUAL");
 assert.equal(schola.activateForCard(chantCards[1]).trackId,"ALLELUIA_TRACT_SEQUENCE");
 assert.equal(schola.activateForCard(chantCards[0]).trackId,"GRADUAL");
 const introit=projectCuratedIntroitEntryLiveCards(curated);
 assert.equal(introit.totalCards,61);
 assert.equal(introit.cards[0].title,"Introit");
 assert.equal(introit.cards.filter(c=>c.sourceSectionId==="AO.CARD.006").length,2);
 const switchModel=buildReaderModeModels({
   prepared,data,mode:"LIVE",reviewExpandedCards:true,
 });
 assert.equal(switchModel.presentationModel.totalCards,65);
 assert.equal(switchModel.presentationModel.cards.filter(c=>c.title==="Sequence").length,1);
 console.log("PASS "+language.toUpperCase()+" sourced Sequence: independent card, source conservation, Schola and Introit/mode switch");
}
assert.equal(projectCuratedIntroitEntryLiveCards(normal.curated).totalCards,60,
 "60-stage post-Introit projection regressed on days with no Sequence");
console.log("PASS conditional pre-Gospel card architecture: ordinary 64, sourced Sequence 65, no fabricated Alleluia/Tract segments");
