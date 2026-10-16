import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {gospelHeadingVariantForProper} from "../src/mass/reader-gospel-heading.js";
import {createMassReaderModel} from "../src/mass/reader-model.js";
import {VERIFIED_MASS_SCRIPTURE_READINGS} from "../src/mass/scripture-reading-witness-index.js";

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const low=read("../data/presentation/reader-text-low.v1.json");
const sung=read("../data/presentation/reader-text-sung.v1.json");
const sectionMap=read("../data/presentation/reader-section-map.v0.13.1.json");
const canonSourceMap=read("../data/presentation/reader-canon-source-map.v1.json");
const frenchOrdinary=read("../data/presentation/reader-french-ordinary.v1.json");

const cases=[
  {path:"Tempora/Pent18-0",book:"Matthew",latin:"Matthǽum",en:"Matthew",fr:"Matthieu"},
  {path:"Tempora/Pent11-0",book:"Mark",latin:"Marcum",en:"Mark",fr:"Marc"},
  {path:"Tempora/Pent10-0",book:"Luke",latin:"Lucam",en:"Luke",fr:"Luc"},
  {path:"Tempora/Pent20-0",book:"John",latin:"Ioánnem",en:"John",fr:"Jean"},
];
const t=(lat,en,fr)=>({lat,en,fr});
function properFor(sourcePath,latin,reference=null){
  const gospel=t(latin,"English test Gospel","Évangile de test");
  if(reference)gospel.scriptureReference=reference;
  return {
    sourcePath,
    introit:t("Introitus test","Test introit","Introït test"),
    collects:[t("Collecta test","Test collect","Collecte test")],
    epistle:t("Epistola test","Test epistle","Épître test"),
    gradual:t("Graduale test","Test gradual","Graduel test"),
    sequence:t("","",""),
    gospel,
    offertory:t("Offertorium test","Test offertory","Offertoire test"),
    secrets:[t("Secreta test","Test secret","Secrète test")],
    preface:t("Praefatio test","Test preface","Préface test"),
    communion:t("Communio test","Test communion","Communion test"),
    postcommunions:[t("Postcommunio test","Test postcommunion","Postcommunion test")],
  };
}
function modelFor(proper,form,mode,language){
  return createMassReaderModel({
    resolvedMass:{
      schema:"ao-resolved-mass-v2",date:"2026-10-04",form,
      presentationMode:mode,
      actualCelebration:{id:"GOSPEL_HEADING_TEST",type:"VOTIVE"},
      calendarCelebration:{id:"GOSPEL_HEADING_CALENDAR_FIXTURE",type:"CALENDAR"},
      explicitlySelectedCelebration:true,
      proper:{status:"READY",data:proper,sourcePath:proper.sourcePath},
      overlays:[],precedingRites:[],followingActions:[],distinctRite:null,
    },
    sectionMap,lowCorpus:low,sungCorpus:sung,
    canonSourceMap,frenchOrdinary,
    vernacularLanguage:language,
  });
}
const cue=(model,id)=>model.cards.flatMap(c=>c.paragraphs)
  .find(p=>p.id===id||p.sourceCueIds?.includes(id));
for(const row of cases){
  const witness=VERIFIED_MASS_SCRIPTURE_READINGS.find(x=>x.sourcePath===row.path);
  assert.ok(witness?.readings.GOSPEL,"missing source-backed test witness "+row.path);
  assert.ok(witness.readings.GOSPEL.reference.startsWith(row.book));
  const proper=properFor(row.path,
    witness.readings.GOSPEL.latinIncipit+" et alia verba de Evangelio.");
  const expected="Sequéntia ✠ sancti Evangélii secúndum "+row.latin;
  const selection=gospelHeadingVariantForProper(proper,{sourcePath:row.path});
  assert.equal(selection.lat,expected,row.book+" source-backed Latin heading");
  assert.ok(selection.en.includes(row.en));
  assert.ok(selection.fr.includes(row.fr));

  for(const [form,mode,language] of [
    ["LOW","MISSAL","en"],
    ["LOW","SIMPLE","fr"],
    ["MISSA_CANTATA_INCENSE","LIVE","en"],
    ["MISSA_CANTATA_SIMPLE","LIVE","fr"],
    ["SOLEMN","LIVE","en"],
  ]){
    const reader=modelFor(proper,form,mode,language);
    const paragraph=cue(reader,"AO.SM.C0084");
    assert.ok(paragraph,form+"/"+mode+"/"+language+" lost C0084");
    const text=[paragraph.primary,paragraph.alternate].filter(Boolean).join(" ");
    assert.ok(text.includes(row.latin),form+"/"+mode+"/"+language+" wrong Gospel announcement: "+text);
    if(row.book!=="Matthew")assert.ok(!text.includes("Matthǽum"),
      form+"/"+mode+"/"+language+" leaked frozen Matthew");
    assert.ok(cue(reader,"GOSPEL.1"),"Resolved selected Gospel text missing");
  }

  const wrongLatin=properFor(row.path,"Completely different Latin opening that does not match witness");
  const withheld=gospelHeadingVariantForProper(wrongLatin,{sourcePath:row.path});
  assert.equal(withheld.lat,"Sequéntia ✠ sancti Evangélii",
    "Path-only lookup falsely assigned "+row.book);
}
// Contradictory declared citation vetoes what an otherwise matched source says.
const matthew=VERIFIED_MASS_SCRIPTURE_READINGS.find(x=>x.sourcePath==="Tempora/Pent18-0");
const conflicting=properFor("Tempora/Pent18-0",
  matthew.readings.GOSPEL.latinIncipit+" et alia verba.","Mark 7:31–37");
assert.equal(gospelHeadingVariantForProper(conflicting).lat,
  "Sequéntia ✠ sancti Evangélii");
// An unknown Proper must not claim Matthew or pretend that an editorial
// research placeholder N. is an actual priestly spoken formula.
const unknown=properFor("UNRESEARCHED/NO_SOURCE","In illo tempore...");
const fallback=gospelHeadingVariantForProper(unknown);
assert.equal(fallback.lat,"Sequéntia ✠ sancti Evangélii");
assert.ok(!fallback.en.includes("Matthew"));
const source=cue(modelFor(unknown,"MISSA_CANTATA_INCENSE","LIVE","en"),"AO.SM.C0084");
assert.ok(![source.primary,source.alternate].join(" ").includes("Matthǽum"));
console.log("1962 Gospel heading: PASS — four evangelists, source/incipit conflicts, LIVE/LOW/MISSAL/SIMPLE, EN/FR.");
