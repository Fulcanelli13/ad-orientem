import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {adaptV346ResolvedMass,bind1962PrincipalPrefaceIdentity} from "../src/mass/host-adapter.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";
import {createMassReaderModel} from "../src/mass/reader-model.js";
import {render1962EasterPrefaceVariant} from "../src/mass/1962-easter-preface-form.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const sectionMap=load("../data/presentation/reader-section-map.v0.13.1.json");
const lowCorpus=load("../data/presentation/reader-text-low.v1.json");
const sungCorpus=load("../data/presentation/reader-text-sung.v1.json");
const canonSourceMap=load("../data/presentation/reader-canon-source-map.v1.json");
const frenchOrdinary=load("../data/presentation/reader-french-ordinary.v1.json");
const pinned=load("./fixtures/mass-easter-preface-pasch-host-flat.v1.json");
const srcLang=lang=>pinned.languages[lang].lines.map(x=>String(x)
  .replace(/^!\s*/u,"").replace(/^[Vv]\.\s*/u,"℣. ")).join("\n");
const choose=variant=>({lat:render1962EasterPrefaceVariant(srcLang("la"),"la",variant),
  en:render1962EasterPrefaceVariant(srcLang("en"),"en",variant),
  fr:render1962EasterPrefaceVariant(srcLang("fr"),"fr",variant)});
const field=(name)=>({lat:name+" Latine",en:name+" English",fr:name+" français"});
const proper=(path,preface)=>({
 sourcePath:path,introit:field("Introit"),
 collects:[field("Collect")],epistle:field("Epistle"),
 gradual:field("Gradual"),gospel:field("Gospel"),
 offertory:field("Offertory"),secrets:[field("Secret")],
 preface,communion:field("Communion"),postcommunions:[field("Postcommunion")]
});
const selected=(date,id,path,source,change={})=>adaptV346ResolvedMass({
 date,calendarDay:{id,title:"Selected canonical Mass"},
 requestedCelebrationId:"mass_of_day",celebrationId:"mass_of_day",
 celebrationType:"CALENDAR",properSource:path,canStart:true,...change
},{form:"low",presentationMode:"MISSAL",proper:source});
const noIdentity=p=>({status:"READY",data:p,sourcePath:p.sourcePath});
for(const [date,id,path,variant,phrase] of [
 ["2026-04-05","tempora:Pasc0-0:1:w","Tempora/Pasc0-0","OCTAVE_DAY","sed in hac potíssimum die"],
 ["2026-04-06","tempora:Pasc0-1:1:w","Tempora/Pasc0-1","OCTAVE_DAY","sed in hac potíssimum die"],
 ["2026-04-12","tempora:Pasc1-0:1:w","Tempora/Pasc1-0","EASTERTIDE","sed in hoc potíssimum"],
 ["2026-05-10","tempora:Pasc5-0:2:w","Tempora/Pasc5-0","EASTERTIDE","sed in hoc potíssimum"],
 ["2026-03-02","tempora:Quad2-1:3:v","Tempora/Quad2-1",null,null],
 ["2026-05-27","tempora:Pasc7-3:1:r","Tempora/Pasc7-3",null,null],
 ["2026-10-07","sancti:10-07:2:w","Sancti/10-07",null,null]
]){
 const wrong=proper(path,{lat:"Communis\nVere dignum",en:"Common",fr:"Commune"});
 const old=noIdentity(wrong);
 assert.equal(properToReaderSlots(old.data,{language:"fr"}).slots.PREFACE.status,"READY",
   "Regression fixture must prove the historical unbound-ID bypass");
 const bound=selected(date,id,path,old);
 assert.equal(bound.proper.data.principalCelebrationId,id,date);
 assert.equal(bound.proper.data.requestedCelebrationId,"mass_of_day");
 assert.equal(properToReaderSlots(bound.proper.data,{language:"fr"}).slots.PREFACE.status,"MISSING",
   date+" must fail closed on a source-owned Common Preface after final adapter handoff");
 assert.equal(wrong.principalCelebrationId,undefined,date+" mutated original source");
 if(variant){
   const chosen=choose(variant);
   const resolved=selected(date,id,path,proper(path,chosen));
   assert.equal(resolved.proper.data.principalCelebrationId,id);
   assert.equal(properToReaderSlots(resolved.proper.data,{language:"fr"}).slots.PREFACE.status,"READY");
   const reader=createMassReaderModel({
     resolvedMass:resolved,sectionMap,lowCorpus,sungCorpus,
     canonSourceMap,vernacularLanguage:"fr",frenchOrdinary
   });
   assert.equal(reader.properSlots.slots.PREFACE.status,"READY",date);
   const preface=reader.properSlots.slots.PREFACE.data.paragraphs;
   assert.ok(preface.some(x=>x.latin.includes(phrase)),date+" reader slot lost selected 1962 Latin");
   assert.ok(preface.some(x=>x.vernacular.includes("le Christ, notre pâque")),date+" reader slot lost sourced French");
   const serialized=JSON.stringify(reader.cards);
   assert.ok(serialized.includes("le Christ, notre pâque"),date+" displayed Reader cards lost Preface");
   assert.ok(!serialized.includes("sed octava Paschæ"),date+" displayed Reader shows composite rubric alternatives");
 }
}
// Easter Vigil is a distinct rite (not a generic 30-card Low/Sung Mass);
// still enforce its Preface source identity before entering its own reader.
const vigil="tempora:Quad6-6r:1:vw",vigilPath="Tempora/Quad6-6r";
const boundVigil=selected("2026-04-04",vigil,vigilPath,proper(vigilPath,{
 lat:"Paschalis\nVere dignum sed in hoc potíssimum hac potíssimum die",
 en:"All options",fr:"Les trois options"}),{exceptionalProfile:"easter-vigil-1962"});
assert.equal(boundVigil.proper.data.principalCelebrationId,vigil);
assert.equal(properToReaderSlots(boundVigil.proper.data,{language:"fr"}).slots.PREFACE.status,"MISSING");
const correctVigil=selected("2026-04-04",vigil,vigilPath,proper(vigilPath,choose("VIGIL_NIGHT")),
  {exceptionalProfile:"easter-vigil-1962"});
assert.equal(properToReaderSlots(correctVigil.proper.data,{language:"fr"}).slots.PREFACE.status,"READY");
assert.equal(correctVigil.distinctRite,"EASTER_VIGIL");
// Do not bind a Calendar identity to a different selected Mass source, even
// if its calendar-day ID is still present in the legacy Mass context.
const n="tempora:Pasc0-1:1:w",src="Tempora/Pasc0-1";
for(const [label,change,altpath] of [
 ["votive",{requestedCelebrationId:"votive",celebrationId:"votive",celebrationType:"VOTIVE"},src],
 ["requiem",{requestedCelebrationId:"requiem",celebrationId:"requiem",celebrationType:"REQUIEM"},src],
 ["observed",{}, "Sancti/04-06"],
 ["source suffix",{},src+"-observed"],
 ["different source",{}, "Tempora/Pasc0-2"],
 ["nonprincipal id",{calendarDay:{id:"Pasc0-1",title:"Vernacular title"}},src]
]){
 const item=proper(altpath,{lat:"Communis",en:"Common",fr:"Commune"});
 const session=selected("2026-04-06",n,altpath,item,change);
 assert.equal(session.proper.data.principalCelebrationId,undefined,
   label+": borrowed the calendar's principal Preface");
}
const raw=proper(src,{lat:"Communis",en:"Common",fr:"Commune"});
const wrapped=Object.freeze({status:"READY",sourcePath:src,data:raw});
const original=bind1962PrincipalPrefaceIdentity(wrapped,{
 calendarDay:{id:n},celebrationId:"mass_of_day",requestedCelebrationId:"mass_of_day",
 celebrationType:"CALENDAR"
});
assert.notEqual(original,wrapped);
assert.notEqual(original.data,raw);
assert.equal(wrapped.data.principalCelebrationId,undefined);
assert.throws(()=>bind1962PrincipalPrefaceIdentity(
 {...raw,principalCelebrationId:"tempora:Pasc0-2:1:w"},
 {calendarDay:{id:n},celebrationId:"mass_of_day",requestedCelebrationId:"mass_of_day",
 celebrationType:"CALENDAR"}),/PREFACE_SOURCE_IDENTITY_CONFLICT/);
console.log("PASS native Mass Preface identity handoff: actual reader text, correct Easter variants, vigil special rite, fail-closed seasonal/Marian mismatches, no votive/observed leakage");
