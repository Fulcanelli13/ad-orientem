import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMassReaderModel } from "../src/mass/reader-model.js";
import { properToReaderSlots, assertReaderProperReady } from "../src/mass/proper-reader-slots.js";

const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const low=load("../data/presentation/reader-text-low.v1.json");
const sung=load("../data/presentation/reader-text-sung.v1.json");
const sectionMap=load("../data/presentation/reader-section-map.v0.13.1.json");
const frenchOrdinary=load("../data/presentation/reader-french-ordinary.v1.json");

assert.equal(frenchOrdinary.schema,"ao-reader-french-ordinary-v1");
assert.equal(
  frenchOrdinary.source.commit,
  "126a07f91ede04664108abb6fb20ace3f4de14b9",
  "French Ordinary source pin changed",
);

function fixedCueIds(corpus){
  return new Set((corpus.blocks??[]).flatMap(block=>
    block.Proper_Slot ? [] : (block.units??[])
      .filter(unit=>String(unit?.latin??"").trim() || String(unit?.english??"").trim())
      .map(unit=>String(unit.cue_id))
  ));
}

const lowFixed=fixedCueIds(low);
const sungFixed=fixedCueIds(sung);
const frenchIds=new Set(Object.keys(frenchOrdinary.byCue??{}));
assert.equal(lowFixed.size,256,"Low fixed-text denominator changed");
assert.equal(sungFixed.size,256,"Sung fixed-text denominator changed");
assert.equal(frenchIds.size,256,"French Ordinary must cover exactly 256 fixed cues");
assert.deepEqual(frenchIds,lowFixed,"French Ordinary coverage drifted from Low corpus");
assert.deepEqual(frenchIds,sungFixed,"French Ordinary coverage drifted from Sung corpus");
for(const id of frenchIds){
  assert.ok(String(frenchOrdinary.byCue[id]??"").trim(),id+" has blank French text");
}

const t=(lat,en,fr)=>({lat,en,fr});
const proper={
  sourcePath:"Sancti/10-07",
  introit:t("Introitus","Introit","Introït"),
  collects:[t("Collecta","Collect","Collecte")],
  epistle:t("Epistola","Epistle","Épître"),
  gradual:t("Graduale et Alleluia","Gradual and Alleluia","Graduel et Alléluia"),
  sequence:{lat:"",en:"",fr:""},
  gospel:t("Evangelium","Gospel","Évangile"),
  offertory:t("Offertorium","Offertory","Offertoire"),
  secrets:[t("Secreta","Secret","Secrète")],
  preface:t("Praefatio","Preface","Préface"),
  communion:t("Communio","Communion","Communion"),
  postcommunions:[t("Postcommunio","Postcommunion","Postcommunion")],
};

const resolvedMass={
  schema:"ao-resolved-mass-v2",
  date:"2026-10-07",
  form:"LOW",
  presentationMode:"SIMPLE",
  actualCelebration:{id:"test",type:"CALENDAR",title:"Test"},
  calendarCelebration:{id:"test",type:"CALENDAR"},
  explicitlySelectedCelebration:false,
  proper:{status:"READY",data:proper,sourcePath:proper.sourcePath},
  overlays:[],
  precedingRites:[],
  followingActions:[],
  distinctRite:null,
};

const model=createMassReaderModel({
  resolvedMass,
  sectionMap,
  lowCorpus:low,
  sungCorpus:sung,
  frenchOrdinary,
  vernacularLanguage:"fr",
});

const paragraphs=model.cards.flatMap(card=>card.paragraphs??[]);
const byCue=id=>paragraphs.find(p=>(p.sourceCueIds??[]).includes(id) || p.id===id);
const displayed=p=>[p?.primary,p?.secondary,p?.alternate].filter(Boolean).join(" ");

assert.match(displayed(byCue("AO.SM.C0002")),/J’entrerai à l’autel de Dieu/);
assert.match(displayed(byCue("AO.SM.C0053")),/Gloire à Dieu au plus haut des cieux/);
assert.match(displayed(byCue("AO.SM.C0076")),/Nous rendons grâces à Dieu/);
assert.match(displayed(byCue("AO.SM.C0087")),/Louange à vous, ô Christ/);
assert.match(displayed(byCue("AO.SM.C0088")),/paroles de l’Évangile nos péchés soient effacés/);

const visibleText=paragraphs.map(displayed).join("\n");
for(const leaked of [
  "I will go in unto the altar of God",
  "Glory to God in the highest",
  "Thanks be to God",
  "Praise be to Thee, O Christ",
  "By the words of the Gospel may our sins be blotted out",
]){
  assert.ok(!visibleText.includes(leaked),"English fallback leaked into French Mass: "+leaked);
}

const missingFrench=structuredClone(frenchOrdinary);
delete missingFrench.byCue["AO.SM.C0002"];
assert.throws(()=>createMassReaderModel({
  resolvedMass,
  sectionMap,
  lowCorpus:low,
  sungCorpus:sung,
  frenchOrdinary:missingFrench,
  vernacularLanguage:"fr",
}),/French Ordinary cue missing AO\.SM\.C0002/);

const incompleteProper={...proper,gospel:{lat:"Evangelium",en:"Gospel",fr:""}};
const mapped=properToReaderSlots(incompleteProper,{language:"fr"});
assert.equal(mapped.ready,false,"French Proper silently fell back to English");
assert.ok(mapped.missing.includes("GOSPEL"));
assert.throws(()=>assertReaderProperReady(mapped),/GOSPEL/);

console.log("French parity PASS: 256/256 fixed Mass cues sourced; French Ordinary/Proper fail closed; fixed followups localized.");
