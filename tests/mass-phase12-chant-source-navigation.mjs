import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {certifyPreGospelChantParts,validatedPreGospelChantParts} from "../src/mass/reader-pre-gospel-chant-source.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";
import {createMassReaderModel} from "../src/mass/reader-model.js";
import {projectCuratedOrdinaryLiveCards,projectCuratedIntroitEntryLiveCards} from "../src/mass/reader-live-curated-cards.js";
import {createNativeScholaController} from "../src/mass/reader-schola.js";
const j=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const presentation={
  sectionMap:j("../data/presentation/reader-section-map.v0.13.1.json"),
  lowCorpus:j("../data/presentation/reader-text-low.v1.json"),
  sungCorpus:j("../data/presentation/reader-text-sung.v1.json"),
  canonSourceMap:j("../data/presentation/reader-canon-source-map.v1.json"),
  frenchOrdinary:j("../data/presentation/reader-french-ordinary.v1.json"),
};
const t=(lat,en,fr=en)=>({lat,en,fr});
const base={
  sourcePath:"Sancti/10-07",
  introit:t("Introitus","Introit"),collects:[t("Collecta","Collect")],
  epistle:t("Epistola","Epistle"),
  gradual:t("Graduale lat\nAlleluia lat","Gradual en\nAlleluia en","Graduel fr\nAlléluia fr"),
  sequence:{lat:"",en:"",fr:""},
  gospel:t("Evangelium","Gospel"),offertory:t("Offertorium","Offertory"),
  secrets:[t("Secreta","Secret")],preface:t("Praefatio","Preface"),
  communion:t("Communio","Communion"),postcommunions:[t("Postcommunio","Postcommunion")],
};
function sources(secondary="Alleluia"){
  return Object.fromEntries([
    ["la",["Graduale lat",secondary==="Alleluia"?"Alleluia lat":"Tractus lat"]],
    ["en",["Gradual en",secondary==="Alleluia"?"Alleluia en":"Tract en"]],
    ["fr",["Graduel fr",secondary==="Alleluia"?"Alléluia fr":"Trait fr"]],
  ].map(([lang,words])=>[lang,{
    order:["__TOP__","Graduale",secondary],
    map:new Map([["Graduale",[words[0]]],[secondary,[words[1]]]]),
  }]));
}
const certify=(proper,secondary="Alleluia")=>
  certifyPreGospelChantParts(proper,{sources:sources(secondary),
    normalizeRows:rows=>rows.join("\n").trim()});
const proof=certify(base);
assert.ok(proof,"Real named bilingual source sections must reconcile");
assert.equal(proof.status,"SOURCE_VERIFIED_EXACT");
assert.deepEqual(proof.parts.map(p=>p.kind),["GRADUAL","ALLELUIA"]);
assert.deepEqual(validatedPreGospelChantParts({...base,preGospelChants:proof}).map(p=>p.sourceRef),
  ["Sancti/10-07:Graduale","Sancti/10-07:Alleluia"]);
assert.equal(certify({...base,gradual:{...base.gradual,en:"Nonmatching translation"}}),null,
  "English source drift must fail closed");
assert.equal(certify({...base,gradual:{...base.gradual,lat:"Other Proper"}}),null,
  "Latin source drift must fail closed");
assert.equal(certify({...base,gradual:{...base.gradual,fr:"Unrelated French"}}),null,
  "French source drift must fail closed");
assert.equal(certify(base,"Tractus"),null,"An invented Lenten Tract must not replace an Alleluia");
assert.equal(certifyPreGospelChantParts(base,{sources:{
 la:{...sources().la,order:["Graduale"]},en:sources().en,fr:sources().fr},
 normalizeRows:rows=>rows.join("\n")}),null,
 "Source order drift must fail closed");
assert.throws(()=>validatedPreGospelChantParts({...base,preGospelChants:{
  ...proof,parts:[proof.parts[0],{...proof.parts[1],lat:"Injected chant"}]}}),
 /PARITY_FAILED/,"Tampering a certified payload must not silently render");
const plain=properToReaderSlots(base),typed=properToReaderSlots({...base,preGospelChants:proof});
assert.equal(plain.slots.ALLELUIA_TRACT_SEQUENCE.status,"NOT_APPLICABLE");
assert.equal(typed.slots.GRADUAL.data.paragraphs[0].liturgicalGroup,"AO.CHANT.GRADUAL");
assert.equal(typed.slots.ALLELUIA_TRACT_SEQUENCE.data.paragraphs[0].liturgicalGroup,"AO.CHANT.ALLELUIA");
const resolved=(proper)=>({
 schema:"ao-resolved-mass-v2",date:"2026-10-15",form:"MISSA_CANTATA_INCENSE",
 presentationMode:"LIVE",actualCelebration:{id:"source-proof",type:"CALENDAR"},
 calendarCelebration:{id:"source-proof",type:"CALENDAR"},
 proper:{status:"READY",data:proper,sourcePath:proper.sourcePath},
 overlays:[],precedingRites:[],followingActions:[],distinctRite:null,
});
const make=(proper,language="en")=>{
 const mass=resolved(proper);
 const prepared={session:{resolvedMass:mass},readerPreferences:{language}};
 const source=createMassReaderModel({
  resolvedMass:mass,...presentation,vernacularLanguage:language,
 });
 return {source,curated:projectCuratedOrdinaryLiveCards(source),prepared};
};
for(const language of ["en","fr"]){
 const withSplit={...base,preGospelChants:proof};
 for(const hasSequence of [false,true]){
  const proper=hasSequence?{...withSplit,sequence:t("Lauda Sion","Praise O Sion","Loue Sion")}:withSplit;
  const {source,curated,prepared}=make(proper,language);
  const titles=curated.cards.filter(c=>c.sourceSectionId==="AO.CARD.006").map(c=>c.title);
  assert.deepEqual(titles,hasSequence?["Gradual","Alleluia","Sequence"]:["Gradual","Alleluia"]);
  assert.equal(curated.totalCards,hasSequence?67:66);
  const original=source.cards.find(c=>c.sectionId==="AO.CARD.006");
  const children=curated.cards.filter(c=>c.sourceSectionId==="AO.CARD.006");
  assert.deepEqual(children.flatMap(c=>c.paragraphs.map(p=>p.id)),original.paragraphs.map(p=>p.id),
    "Complete source paragraph conservation");
  assert.deepEqual(children.flatMap(c=>c.blocks.map(b=>b.blockId)),
    hasSequence?["AO.SM.B021","AO.SM.B022","AO.SM.B022"]:["AO.SM.B021","AO.SM.B022"]);
  assert.equal(projectCuratedIntroitEntryLiveCards(curated).totalCards,hasSequence?63:62);
  const schola=createNativeScholaController({
   sungCorpus:presentation.sungCorpus,properSlots:source.properSlots,
   prepared,frenchOrdinary:presentation.frenchOrdinary,
  });
  assert.equal(schola.activateForCard(children[0]).trackId,"GRADUAL");
  assert.equal(schola.activateForCard(children[1]).trackId,"ALLELUIA_TRACT_SEQUENCE");
  assert.equal(schola.project().schola.segmentId,"ALLELUIA_TRACT_SEQUENCE.1");
  if(hasSequence){
   assert.equal(schola.activateForCard(children[2]).schola.segmentId,"ALLELUIA_TRACT_SEQUENCE.2",
    "Schola must jump to independently selected Sequence, not stale Alleluia");
   assert.equal(schola.activateForCard(children[1]).schola.segmentId,"ALLELUIA_TRACT_SEQUENCE.1");
  }
 }
}
console.log("PASS Phase 2: named Gradual/Alleluia/Tract sections verify in Latin/EN/FR; unsupported boundaries fail closed; 66/67 LIVE, Introit and Schola exact paragraph navigation");
