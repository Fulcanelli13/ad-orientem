import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createReaderFormCueStateController } from "../src/mass/reader-form-state.js";
import { projectCertifiedSolemnMinisterRubric } from "../src/mass/reader-dom.js";
import { createNativeScholaController } from "../src/mass/reader-schola.js";
import { properToReaderSlots } from "../src/mass/proper-reader-slots.js";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const formState=load("../data/presentation/reader-form-state.v1.json"),lowCorpus=load("../data/presentation/reader-text-low.v1.json"),sungCorpus=load("../data/presentation/reader-text-sung.v1.json");
assert.equal(formState.sources.low.canonicalReaderTextSha256,lowCorpus.source.rawSha256);
assert.equal(formState.sources.solemn.sharedSungCueSourceSha256,"2f091b2f099387cbd709cadd78aff5c25ca1d4152ad0af18083edf301609891f");
const registries=Object.freeze({gestures:load("../data/presentation/reader-gestures.v1.json"),responses:load("../data/presentation/reader-responses.v1.json"),postures:load("../data/presentation/reader-postures.v1.json"),positions:load("../data/presentation/reader-priest-positions.v1.json"),voices:load("../data/presentation/reader-priest-voices.v1.json"),actions:load("../data/presentation/reader-priest-actions.v1.json")});
const prepared=(form,extra={})=>({session:{resolvedMass:{form,conditions:extra.conditions??[]}},readerPreferences:{mode:"SIMPLE",postureProfile:extra.postureProfile??"FOLLOW_CONGREGATION",gestureProfile:extra.gestureProfile??"GUIDED_1962"}});
const low=createReaderFormCueStateController({formStateData:formState,registries,lowCorpus,sungCorpus,prepared:prepared("LOW",{postureProfile:"OCONNELL_1962_COMMUNITY",gestureProfile:"TRADITIONAL"})});assert.equal(low.supported,true);assert.equal(low.canonicalCueCount,275);
let s=low.project("AO.SM.C0001");assert.equal(s.priestPosition.station,"FOOT_CENTER");assert.equal(s.priestVoice.value,"LOW / QUIET");assert.match(s.gesture.action,/Sign of the cross/i);assert.equal(s.response,null);
s=low.project("AO.SM.C0075");assert.equal(s.priestPosition.station,"ALTAR_EPISTLE_MISSAL");assert.equal(s.priestVoice.value,"CLEAR SPOKEN");assert.equal(s.posture.value,"SIT");
s=low.project("AO.SM.C0082");assert.equal(s.priestPosition.station,"ALTAR_GOSPEL_MISSAL");assert.equal(s.priestVoice.value,"CLEAR SPOKEN");
s=low.project("AO.SM.C0259");assert.equal(s.priestVoice.value,"CLEAR SPOKEN");assert.equal(s.priestPosition.facing,"PEOPLE");
s=low.project("AO.SM.C0268");assert.equal(s.response,null);assert.equal(s.ownership.response,"R18_LOW_SERVER_RESPONSE_SUPPRESSED");
const lowRequiem=createReaderFormCueStateController({
 formStateData:formState,registries,lowCorpus,sungCorpus,
 prepared:{session:{resolvedMass:{form:"LOW",overlays:["REQUIEM"],
   actualCelebration:{id:"requiem",type:"REQUIEM"}}},
   readerPreferences:{mode:"LIVE",postureProfile:"FOLLOW_CONGREGATION"}},
});
assert.match(lowRequiem.project("AO.SM.C0042").priestAction?.label??"",
 /Cross over the Missal/,"Requiem Introit must sign above the book");
assert.doesNotMatch(lowRequiem.project("AO.SM.C0042").priestAction?.label??"",
 /Signs Himself/i);
assert.equal(lowRequiem.project("AO.SM.C0080").priestAction,null);
assert.equal(lowRequiem.project("AO.SM.C0088").priestAction,null);
assert.equal(lowRequiem.project("AO.SM.C0112").priestAction,null,
 "Requiem Offertory water must not be blessed");
assert.match(low.project("AO.SM.C0042").priestAction?.label??"",
 /Sign of the Cross/,"Ordinary Introit source must remain unmodified");
assert.ok(low.project("AO.SM.C0088").priestAction,
 "Ordinary Gospel kiss must remain available");

const lowIds=new Set(lowCorpus.blocks.flatMap(b=>(b.units??[]).map(u=>u.cue_id)).filter(id=>/^AO\.SM\.C\d{4}$/.test(String(id))&&Number(String(id).slice(-4))<=275));assert.equal(lowIds.size,275);
for(const cueId of lowIds){const x=low.project(cueId);for(const ch of ["gesture","response","priestVoice","priestPosition","priestAction","sacredMinister"])assert.ok(!String(x.ownership?.[ch]??"").includes("LEGACY"),cueId+" Low "+ch);}
const solemn=createReaderFormCueStateController({formStateData:formState,registries,lowCorpus,sungCorpus,prepared:prepared("SOLEMN",{gestureProfile:"TRADITIONAL"})});assert.equal(solemn.supported,true);
s=solemn.project("AO.SM.C0075");assert.equal(s.priestPosition.station,"SEDILIA");assert.equal(s.priestVoice.value,"LISTENS");assert.match(s.sacredMinister.actor,/SUBDEACON/);
s=solemn.project("AO.SM.C0082");assert.equal(s.priestPosition.station,"SOLEMN_CELEBRANT_TRACK");assert.equal(s.priestVoice.value,"LISTENS");assert.match(s.sacredMinister.actor,/DEACON/);
s=solemn.project("AO.SM.C0174");assert.equal(s.priestAction?.label,"ELEVATES HOST","Solemn form wrapper erased the celebrant Host elevation action");assert.match(s.sacredMinister.actor,/DEACON/);assert.match(s.sacredMinister.actor,/SUBDEACON/);assert.match(s.sacredMinister.actor,/TORCHBEARERS/);
// The visible Solemn rubrical lane is entirely sourced from the already
// certified 19 R18 minister events. No P2/Ultra Master research is imported,
// and no tap/scroll is represented as an *observed* physical minister act.
const expectedMinisterCues=new Set();
for(const cue of sungCorpus.blocks.flatMap(b=>(b.units??[]).map(u=>u.cue_id))){
  const owned=solemn.project(cue);
  const projected=projectCertifiedSolemnMinisterRubric(owned.sacredMinister);
  if(owned.sacredMinister){
    assert.ok(projected,"Existing certified Solemn minister event hidden at "+cue);
    assert.equal(projected.sourceCueId,cue);
    assert.equal(projected.observed,false);
    assert.match(projected.label,/ · /);
    expectedMinisterCues.add(cue);
  }else assert.equal(projected,null);
}
assert.equal(formState.solemn.ministerEvents.length,19,
  "Existing canonical minister source corpus denominator changed");
for(const required of ["AO.SM.C0075","AO.SM.C0082","AO.SM.C0174","AO.SM.C0225"])
  assert.ok(expectedMinisterCues.has(required),
    "Existing certified Solemn minister action missing from rail "+required);
for(const cue of ["AO.SM.C0111","AO.SM.C0112","AO.SM.C0113"]){
  assert.equal(solemn.project(cue).sacredMinister,null,
    "Unapproved Offertory actor event was attributed to the public Mass");
}
const paxExpected=projectCertifiedSolemnMinisterRubric(solemn.project("AO.SM.C0225").sacredMinister);
assert.match(paxExpected?.label??"",/DEACON.*SUBDEACON.*PAX/);
assert.equal(paxExpected.observed,false);
s=solemn.project("AO.SM.C0259");assert.equal(s.priestVoice.value,"LISTENS");assert.match(s.sacredMinister.actor,/DEACON/);
s=solemn.project("AO.SM.C0268");assert.equal(s.response,null);assert.equal(s.ownership.response,"R18_SOLEMN_MINISTER_RESPONSE");assert.match(s.sacredMinister.actor,/SUBDEACON/);
s=solemn.project("AO.SM.C0225");assert.match(s.sacredMinister.actor,/DEACON/);assert.match(s.sacredMinister.actor,/SUBDEACON/);assert.equal(s.sacredMinister.owner,"R18_SOLEMN_PAX_PRIMARY_SOURCE");assert.equal(s.sacredMinister.authorityStatus,"CERTIFIED_PRIMARY_1962_RUBRIC");assert.equal(s.sacredMinisterAdvisory,null);assert.equal(s.ownership.sacredMinister,"R18_SOLEMN_PAX_PRIMARY_SOURCE");assert.equal(solemn.audit.pendingPaxAuthority,0);
// Ordinary Solemn rubrics remain canonical; a Requiem is NOT allowed to
// inherit actions specifically omitted in the 1962 rubrics. Use the SAME 19
// R18 records, with explicit form variants only (no 67-row research import).
const solemnRequiem=createReaderFormCueStateController({
  formStateData:formState,registries,lowCorpus,sungCorpus,
  prepared:{session:{resolvedMass:{
    form:"SOLEMN",overlays:["REQUIEM"],actualCelebration:{id:"requiem",type:"REQUIEM"}
  }},readerPreferences:{mode:"LIVE",gestureProfile:"GUIDED_1962"}}
});
const sr=cue=>solemnRequiem.project("AO.SM."+cue);
// Requiem has no deacon's blessing nor private Gospel-book kiss.
assert.equal(solemnRequiem.project("AO.SM.C0080").priestAction,null);
assert.equal(solemnRequiem.project("AO.SM.C0088").priestAction,null);
assert.ok(solemn.project("AO.SM.C0080").priestAction,
 "Ordinary Solemn pre-Gospel action was lost");

assert.match(sr("C0076").sacredMinister?.action??"",/without receiving.*blessing/i);
assert.equal(sr("C0080").sacredMinister,null,"Requiem deacon pre-Gospel blessing must be omitted");
assert.match(sr("C0081").sacredMinister?.action??"",/neither incense nor lighted candles/i);
assert.equal(sr("C0081").sacredMinister?.actor,"DEACON + ACOLYTES");
assert.match(sr("C0120").sacredMinister?.action??"",/choir and people are not/i);
assert.match(sr("C0124").sacredMinister?.label??"",/REQUIEM/);
assert.equal(sr("C0212").sacredMinister,null,"Requiem imported the ordinary paten handoff");
assert.equal(sr("C0225").sacredMinister,null,"Requiem imported the ministerial Pax");
assert.equal(sr("C0225").sacredMinisterAdvisory,null);
assert.equal(sr("C0225").ownership.sacredMinister,"R18_EXACT_CUE_NONE");
assert.equal(sr("C0075").sacredMinister?.actor,"SUBDEACON",
  "Requiem suppression must not remove the sung Epistle");
assert.equal(sr("C0082").sacredMinister?.actor,"DEACON",
  "Requiem suppression must not remove the sung Gospel");
assert.ok(sr("C0174").sacredMinister?.actor.includes("DEACON"),
  "Requiem exception must not remove Host elevation assistance");
assert.ok(sr("C0181").sacredMinister?.actor.includes("SUBDEACON"),
  "Requiem exception must not remove chalice elevation assistance");
assert.equal(sr("C0259").sacredMinister?.actor,"DEACON",
  "Requiem retains a deacon's dismissal role");
assert.equal(sr("C0268").sacredMinister?.actor,"SUBDEACON",
  "Requiem did not suppress the Last Gospel");
assert.equal(solemnRequiem.audit.sacredMinisterDeltas,19,
  "Requiem form projection must not mutate canonical minister denominator");
for(const cue of ["C0080","C0212","C0225"]){
  assert.ok(solemn.project("AO.SM."+cue).sacredMinister,
    "Requiem exception leaked into the ordinary Solemn Mass at "+cue);
}
const solemnTypeOnly=createReaderFormCueStateController({
  formStateData:formState,registries,lowCorpus,sungCorpus,
  prepared:{session:{resolvedMass:{form:"SOLEMN",overlays:[],
    actualCelebration:{id:"defunct",type:"REQUIEM"}}},readerPreferences:{mode:"LIVE"}}
});
assert.equal(solemnTypeOnly.project("AO.SM.C0225").sacredMinister,null,
  "Requiem type without duplicated overlay must still suppress Pax");
const solemnUnknownType=createReaderFormCueStateController({
  formStateData:formState,registries,lowCorpus,sungCorpus,
  prepared:{session:{resolvedMass:{form:"SOLEMN",overlays:[],
    actualCelebration:{id:"ordinary",type:"CALENDAR"}}},readerPreferences:{mode:"LIVE"}}
});
assert.ok(solemnUnknownType.project("AO.SM.C0225").sacredMinister,
  "Ordinary selected Mass must retain its certified Pax rubric");

const sungIds=new Set(sungCorpus.blocks.flatMap(b=>(b.units??[]).map(u=>u.cue_id)).filter(id=>/^AO\.SM\.C\d{4}$/.test(String(id))));assert.equal(sungIds.size,279);
for(const cueId of sungIds){const x=solemn.project(cueId);for(const ch of ["gesture","response","priestVoice","priestPosition","priestAction","sacredMinister"])assert.ok(!String(x.ownership?.[ch]??"").includes("LEGACY"),cueId+" Solemn "+ch);}
for(const form of ["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE"]){const c=createReaderFormCueStateController({formStateData:formState,registries,lowCorpus,sungCorpus,prepared:prepared(form)});assert.equal(c.supported,true);for(const cueId of ["AO.SM.C0001","AO.SM.C0075","AO.SM.C0082","AO.SM.C0174","AO.SM.C0259","AO.SM.C0268"]){const x=c.project(cueId);for(const ch of ["gesture","response","priestVoice","priestPosition","priestAction","sacredMinister"])assert.ok(!String(x.ownership?.[ch]??"").includes("LEGACY"),form+" "+cueId+" "+ch);}const elevation=c.project("AO.SM.C0174");assert.equal(elevation.priestAction?.label,"ELEVATES HOST",form+" erased the v1.80 Host elevation action");assert.equal(elevation.sacredMinister,null,form+" invented a sacred-minister lane");}
const t=(lat,en)=>({lat,en}),properSlots=properToReaderSlots({introit:t("Introitus","Introit"),collect:t("Collecta","Collect"),epistle:t("Epistola","Epistle"),gradual:t("Graduale","Gradual"),sequence:t("Sequentia","Sequence"),gospel:t("Evangelium","Gospel"),offertory:t("Offertorium","Offertory"),secret:t("Secreta","Secret"),preface:t("Praefatio","Preface"),communion:t("Communio","Communion"),postcommunion:t("Postcommunio","Postcommunion")});
const lowSchola=createNativeScholaController({sungCorpus,properSlots,prepared:prepared("LOW")});assert.equal(lowSchola.supported,true);assert.equal(lowSchola.project().schola,null);assert.equal(lowSchola.project().ownership,"R18_FORM_ABSENT_SCHOLA");
const solemnSchola=createNativeScholaController({sungCorpus,properSlots,prepared:prepared("SOLEMN")});assert.equal(solemnSchola.supported,true);assert.ok(solemnSchola.trackIds.includes("KYRIE"));
console.log("reader form-state parity: PASS — Low and Solemn are native-owned; form switches cannot silently fall back to legacy state.");
