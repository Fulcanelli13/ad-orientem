import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {certifyPreGospelChantParts,validatedPreGospelChantParts} from "../src/mass/reader-pre-gospel-chant-source.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";
import {recoverReaderProperOmissions} from "../src/mass/reader-proper-runtime-recovery.js";
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
// Exercise the actual browser-entry recovery API, not only its stand-alone
// source validator: each named section must already exist in the host resolver.
const sourceMaps=sources();
const calls=[];
const hostResolver={async resolveSource(path,language){
  calls.push([path,language]);
  return sourceMaps[language];
}};
const readyEnvelope={status:"READY",sourcePath:base.sourcePath,data:base};
const recovered=await recoverReaderProperOmissions(readyEnvelope,{hostResolver});
assert.equal(recovered.data.readerChantSourceProof?.status,"SOURCE_VERIFIED_EXACT",
 "Host recovery failed to carry genuinely distinct chant ownership");
assert.deepEqual(recovered.data.readerChantSourceProof.parts.map(p=>p.kind),
  ["GRADUAL","ALLELUIA"]);
assert.equal(calls.length,3,"Named chant ownership should reuse only one parsed source per language");
const unresolved=await recoverReaderProperOmissions({
 ...readyEnvelope,data:{...base,gradual:{...base.gradual,en:"Unrelated EN"}}
},{hostResolver});
assert.equal(unresolved.data.readerChantSourceProof,undefined,
 "Host recovery silently replaced a nonmatching translation");
// Real Divinum Officium source forms also pack both chants into [Graduale].
// Rosary: the Latin Alleluia starts a new line; in EN/FR the same refrain
// starts partway through a Gradual verse. We validate the entire source in
// each language rather than assuming matching line indices.
const inline={
 la:["!Ps 44:5","Propter veritátem et mansuetúdinem.",
   "V. Audi, fília, et vide.","Allelúja, allelúja.","V. Sollémnitas gloriósæ Vírginis. Allelúja."],
 en:["!Ps 44:5","In the cause of truth and mercy.",
   "V. Hear, O daughter, and see. Alleluia, alleluia.",
   "V. The solemnity of the glorious Virgin Mary. Alleluia."],
 fr:["!Ps 44:5","Pour la vérité, la douceur et la justice.",
   "V. Écoutez, ma Fille, voyez. Alléluia, alléluia.",
   "V. Voici la Solennité de la glorieuse Vierge Marie. Alléluia."],
};
const normal=(rows)=>rows.map(x=>x.startsWith("!")?x.slice(1):x).join("\n").trim();
const sourcesInline=Object.fromEntries(["la","en","fr"].map(lang=>
  [lang,{order:["__TOP__","Graduale"],map:new Map([["Graduale",inline[lang]]])}]));
const properInline={...base,gradual:{
 lat:normal(inline.la),en:normal(inline.en),fr:normal(inline.fr),
}};
const inlineProof=certifyPreGospelChantParts(properInline,{
 sources:sourcesInline,normalizeRows:normal,
});
assert.equal(inlineProof?.sourceMode,"INTRA_SECTION_TRILINGUAL_BOUNDARY",
 "Alleluia at different EN/FR line offsets was not recognized");
assert.deepEqual(inlineProof.parts.map(x=>x.kind),["GRADUAL","ALLELUIA"]);
assert.equal(validatedPreGospelChantParts({...properInline,readerChantSourceProof:inlineProof})?.length,2);
assert.deepEqual(makeForInline({...properInline,readerChantSourceProof:inlineProof}),["Gradual","Alleluia"]);
function makeForInline(proper){
 const source=createMassReaderModel({resolvedMass:{
  schema:"ao-resolved-mass-v2",date:"2026-10-15",
  form:"MISSA_CANTATA_INCENSE",presentationMode:"LIVE",
  actualCelebration:{id:"test-inline",type:"CALENDAR"},
  calendarCelebration:{id:"test-inline",type:"CALENDAR"},
  proper:{status:"READY",data:proper,sourcePath:proper.sourcePath},
  overlays:[],precedingRites:[],followingActions:[],distinctRite:null,
 },...presentation});
 return projectCuratedOrdinaryLiveCards(source).cards
   .filter(c=>c.sourceSectionId==="AO.CARD.006").map(c=>c.title);
}
const tractInline={
 la:["!Ps 90:11","Angelis suis Deus mandávit.","V. In mánibus portábunt te.",
   "_","!Tractus","!Ps 90:1-7","Qui hábitat in adjutório.","V. Dicet Dómino."],
 en:["!Ps 90:11","To His angels God has given command.","V. Upon their hands.",
   "_","!Tractus","!Ps 90:1-7","You who dwell in the shelter.","V. Say to the Lord."],
 fr:["!Ps 90:11","Dieu a commandé pour toi à ses anges.","V. Ils te porteront.",
   "_","!Tractus.","!Ps 90:1-7","Celui qui habite sous l’assistance.","V. Il dira au Seigneur."],
};
const tractSources=Object.fromEntries(["la","en","fr"].map(lang=>
 [lang,{order:["__TOP__","Graduale"],map:new Map([["Graduale",tractInline[lang]]])}]));
const tractProper={...base,gradual:{
 lat:normal(tractInline.la),en:normal(tractInline.en),fr:normal(tractInline.fr),
}};
const tractProof=certifyPreGospelChantParts(tractProper,{sources:tractSources,normalizeRows:normal});
assert.deepEqual(tractProof?.parts.map(x=>x.kind),["GRADUAL","TRACT"]);
assert.deepEqual(makeForInline({...tractProper,readerChantSourceProof:tractProof}),["Gradual","Tract"]);
const shifted={...sourcesInline,fr:{...sourcesInline.fr,
 map:new Map([["Graduale",["Unrelated translation"]]])}};
assert.equal(certifyPreGospelChantParts(properInline,{
 sources:shifted,normalizeRows:normal,
}),null,"Different French source must not create an Alleluia card");

const proof=certify(base);
assert.ok(proof,"Real named bilingual source sections must reconcile");
assert.equal(proof.status,"SOURCE_VERIFIED_EXACT");
assert.deepEqual(proof.parts.map(p=>p.kind),["GRADUAL","ALLELUIA"]);
assert.deepEqual(validatedPreGospelChantParts({...base,readerChantSourceProof:proof}).map(p=>p.sourceRef),
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
assert.throws(()=>validatedPreGospelChantParts({...base,readerChantSourceProof:{
  ...proof,parts:[proof.parts[0],{...proof.parts[1],lat:"Injected chant"}]}}),
 /PARITY_FAILED/,"Tampering a certified payload must not silently render");
const plain=properToReaderSlots(base),typed=properToReaderSlots({...base,readerChantSourceProof:proof});
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
 const withSplit={...base,readerChantSourceProof:proof};
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
   // A reader card jump is not an independent observation of singing.
   // Explicit Schola controls, not paragraph navigation, change its phrase.
   assert.equal(schola.activateForCard(children[2]).schola.segmentId,"ALLELUIA_TRACT_SEQUENCE.1",
    "Selecting Sequence text must not fabricate choir advancement");
   assert.equal(schola.next().schola.segmentId,"ALLELUIA_TRACT_SEQUENCE.2",
    "Explicit Schola advance must reach the sourced Sequence");
   assert.equal(schola.activateForCard(children[1]).schola.segmentId,"ALLELUIA_TRACT_SEQUENCE.2",
    "Returning to Alleluia reader text must not rewind the choir");
   assert.equal(schola.previous().schola.segmentId,"ALLELUIA_TRACT_SEQUENCE.1",
    "Explicit Schola correction must recover the sourced Alleluia");
  }
 }
}
console.log("PASS Phase 2: named Gradual/Alleluia/Tract sections verify in Latin/EN/FR; unsupported boundaries fail closed; 66/67 LIVE with independently sourced Alleluia, Introit and explicit Schola phrase navigation");
