import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {render1962EasterPrefaceVariant,EASTER_PREFACE_FORMS} from
  "../src/mass/1962-easter-preface-form.js";
import {authenticated1962PrefaceRecoveryOwner,recoverReaderProperOmissions} from
  "../src/mass/reader-proper-runtime-recovery.js";
import {inspect1962PrefaceSelection,required1962PaschalPrefaceVariant} from
  "../src/mass/1962-preface-decision.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";

const fixed=JSON.parse(readFileSync(new URL("./fixtures/mass-easter-preface-pasch-source.v1.json",import.meta.url),"utf8"));
const sources=fixed.languages;
const clean=lines=>lines.map(x=>x.replace(/^!\s*/u,"")
  .replace(/^[Vv]\.\s*/u,"℣. ")).join("\n").trim();
const sourceText=Object.fromEntries(["la","en","fr"].map(k=>[k,clean(sources[k].lines)]));
const phrases={
  la:{VIGIL_NIGHT:"sed in hac potíssimum nocte",OCTAVE_DAY:"sed in hac potíssimum die",EASTERTIDE:"sed in hoc potíssimum"},
  en:{VIGIL_NIGHT:"on this night",OCTAVE_DAY:"on this day",EASTERTIDE:"in this season"},
  fr:{VIGIL_NIGHT:"en cette nuit",OCTAVE_DAY:"en ce jour",EASTERTIDE:"en ce temps"}
};
const sourceSamples=Object.fromEntries(Object.values(EASTER_PREFACE_FORMS).map(form=>{
  const row={};
  for(const lang of ["la","en","fr"]){
    const original=sourceText[lang];
    const chosen=render1962EasterPrefaceVariant(original,lang,form);
    assert.ok(chosen,lang+" "+form+" must pass exact-source scrutiny");
    assert.ok(chosen.includes(phrases[lang][form]),lang+" "+form);
    assert.equal(chosen.split("\n").length,2,"One Preface heading and one text paragraph");
    for(const [variant,phrase] of Object.entries(phrases[lang]))
      if(variant!==form)assert.ok(!chosen.includes(phrase),lang+" "+form+" still has "+variant);
    assert.doesNotMatch(chosen,/(?:sed tempore Passionis|sed octava Paschæ|Messe de la Vigile pascale|pendant l’octave de Pâques|après l’octave de Pâques)/iu);
    assert.ok(chosen.length>250,lang+" "+form+" source passage unexpectedly short");
    row[lang]=chosen;
  }
  return [form,row];
}));
assert.equal(render1962EasterPrefaceVariant(sourceText.la,"la","wrong"),null);
assert.equal(render1962EasterPrefaceVariant(sourceText.la,"es","EASTERTIDE"),null);
assert.equal(render1962EasterPrefaceVariant(sourceText.la.replace("(sed tempore Passionis)",""),"la","EASTERTIDE"),null);
assert.equal(render1962EasterPrefaceVariant(sourceText.en.replace("on this day~",""),"en","OCTAVE_DAY"),null);
assert.equal(render1962EasterPrefaceVariant(sourceText.fr.replace("après l’octave de Pâques","autre lieu"),"fr","EASTERTIDE"),null);
assert.equal(render1962EasterPrefaceVariant("Paschalis\nsed in hoc potíssimum","la","EASTERTIDE"),null);

const cases=[
 ["2026-04-04","tempora:Quad6-6r:1:vw","Tempora/Quad6-6r","VIGIL_NIGHT"],
 ["2026-04-05","tempora:Pasc0-0:1:w","Tempora/Pasc0-0","OCTAVE_DAY"],
 ["2026-04-06","tempora:Pasc0-1:1:w","Tempora/Pasc0-1","OCTAVE_DAY"],
 ["2026-04-11","tempora:Pasc0-6:1:w","Tempora/Pasc0-6","OCTAVE_DAY"],
 ["2026-04-12","tempora:Pasc1-0:1:w","Tempora/Pasc1-0","EASTERTIDE"],
 ["2026-04-19","tempora:Pasc2-0:2:w","Tempora/Pasc2-0","EASTERTIDE"],
 ["2026-04-26","tempora:Pasc3-0r:2:w","Tempora/Pasc3-0r","EASTERTIDE"],
 ["2026-05-03","tempora:Pasc4-0:2:w","Tempora/Pasc4-0","EASTERTIDE"],
 ["2026-05-10","tempora:Pasc5-0:2:w","Tempora/Pasc5-0","EASTERTIDE"],
 ["2026-05-13","tempora:Pasc5-3:2:w","Tempora/Pasc5-3","EASTERTIDE"]
];
for(const [date,id,path,variant] of cases){
  const owner=authenticated1962PrefaceRecoveryOwner(id,path);
  assert.equal(owner?.section,"Pasch",date);
  assert.equal(owner?.variant,variant,date);
  assert.equal(required1962PaschalPrefaceVariant(id),variant,date);
}
for(const [id,path] of [
  ["tempora:Quad6-6r:1:vw","Tempora/Quad6-4r"],
  ["tempora:Pasc0-3:1:w","Tempora/Pasc0-4"],
  ["tempora:Pasc3-0r:2:w","Tempora/Pasc3-0"],
  ["tempora:Pasc5-4:1:w","Tempora/Pasc5-4"],
  ["tempora:Pasc6-0:2:w","Tempora/Pasc6-0"],
  [":feria:4:w","Tempora/Pasc2-0"],
  ["sancti:04-25:2:r","Tempora/Pasc2-0"],
  ["tempora:Pasc1-0:1:w","Votive/Easter"],
]){
  assert.equal(authenticated1962PrefaceRecoveryOwner(id,path),null,id+" "+path);
}
// The source parser must return authentic named [Pasch] rows from each
// language, not edited static replacement text.
const readCalls=[];
const hostResolver={async resolveSource(path,lang){
  readCalls.push([path,lang]);
  assert.equal(path,"Ordo/Prefationes");
  return {map:new Map([["Pasch",sources[lang].lines]])};
}};
const shell=(id,path,preface)=>{
  const triple=(value)=>({lat:value,en:value,fr:value});
  return {
    sourcePath:path,principalCelebrationId:id,
    introit:triple("Intro"),collects:[triple("Oratio")],epistle:triple("Lectio"),
    gradual:triple("Graduale"),gospel:triple("Evangelium"),
    offertory:triple("Offertorium"),secrets:[triple("Secreta")],
    preface:preface??{lat:"Communis\nVere dignum",en:"Common",fr:"Commune"},
    communion:triple("Communio"),postcommunions:[triple("Postcommunio")]
  };
};
for(const [date,id,path,variant] of cases){
  const sample=shell(id,path);
  const repaired=await recoverReaderProperOmissions(sample,{
    hostResolver,principalCelebrationId:id});
  assert.notEqual(repaired,sample,date);
  assert.equal(repaired.preface.prefaceSection,"Pasch",date);
  assert.equal(repaired.preface.prefaceVariant,variant,date);
  assert.equal(repaired.preface.originalProperSourcePath,path,date);
  assert.equal(repaired.preface.sourcePath,"Ordo/Prefationes",date);
  assert.deepEqual([repaired.preface.lat,repaired.preface.en,repaired.preface.fr],
    [sourceSamples[variant].la,sourceSamples[variant].en,sourceSamples[variant].fr],
    date+" exact named-source transformation diverged");
  assert.equal(inspect1962PrefaceSelection({principalCelebrationId:id,
    selectedPreface:repaired.preface}).status,"MATCH",date);
  assert.equal(properToReaderSlots(repaired,{language:"fr"}).slots.PREFACE.status,"READY",date);
  assert.equal(sample.preface.lat,"Communis\nVere dignum",date+" original source mutated");
}
// Easter Vigil and Easter Sunday carry a non-ready *composite* Pasch
// Preface in the inherited source; not just Common.
for(const [date,id,path,variant] of cases.slice(0,2)){
  const composite=shell(id,path,{
    lat:sourceText.la,en:sourceText.en,fr:sourceText.fr
  });
  assert.equal(inspect1962PrefaceSelection({principalCelebrationId:id,
    selectedPreface:composite.preface}).status,"CONTRADICTION",date);
  assert.equal(properToReaderSlots(composite,{language:"fr"}).slots.PREFACE.status,"MISSING",date);
  const result=await recoverReaderProperOmissions(composite,{
    hostResolver,principalCelebrationId:id});
  assert.equal(result.preface.prefaceVariant,variant,date);
  assert.equal(properToReaderSlots(result,{language:"fr"}).slots.PREFACE.status,"READY",date);
}
for(const [date,id,path,variant] of cases.slice(0,3)){
  const selected=shell(id,path,{lat:sourceSamples[variant].la,
    en:sourceSamples[variant].en,fr:sourceSamples[variant].fr});
  const calls=readCalls.length;
  assert.equal(await recoverReaderProperOmissions(selected,{hostResolver,principalCelebrationId:id}),selected,
    date+" already-correct single-variant text must be preserved");
  assert.equal(readCalls.length,calls);
}
for(const change of [{requestedCelebrationId:"votive"},{riteProfile:"requiem"}]){
  const [date,id,path]=cases[1];
  const sample={...shell(id,path),...change};
  assert.equal(await recoverReaderProperOmissions(sample,{hostResolver,principalCelebrationId:id}),sample);
}
const wrongSelected=shell(cases[1][1],cases[1][2],{
  lat:sourceSamples.EASTERTIDE.la,en:sourceSamples.EASTERTIDE.en,fr:sourceSamples.EASTERTIDE.fr
});
assert.equal(inspect1962PrefaceSelection({principalCelebrationId:cases[1][1],
  selectedPreface:wrongSelected.preface}).status,"CONTRADICTION");
assert.equal(properToReaderSlots(wrongSelected,{language:"fr"}).slots.PREFACE.status,"MISSING");
const brokenResolver={async resolveSource(path,lang){
  return {map:new Map([["Pasch",lang==="fr"?["!de Pâques","Truncated"]:sources[lang].lines]])};
}};
const failed=shell(cases[1][1],cases[1][2]);
const withheld=await recoverReaderProperOmissions(failed,{hostResolver:brokenResolver,
  principalCelebrationId:cases[1][1]});
assert.equal(withheld,failed,"No partial source must be substituted for the Easter Preface");
assert.equal(properToReaderSlots(withheld,{language:"fr"}).slots.PREFACE.status,"MISSING");
console.log("PASS 1962 Easter Preface: source-exact single variants, 10 owners, trilingual consistency, actual reader withholding and source fail-closed.");
