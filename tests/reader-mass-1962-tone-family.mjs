import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve1962CommonMassTone,resolve1962DialogueToneFamily,
 MASS_TONE_CONTEXT_SCHEMA,MASS_TONE_CONTEXT_OWNER} from "../src/mass/reader-mass-1962-tone-family.js";
import {projectMassSungDialogue} from "../src/mass/reader-mass-sung-dialogue-pairs.js";
import {buildScholaMusicItinerary} from "../src/mass/reader-schola-event-timeline.js";

const ctx=(celebrationKind,liturgicalClass=null)=>({
 schema:MASS_TONE_CONTEXT_SCHEMA,sourceOwner:MASS_TONE_CONTEXT_OWNER,
 verified:true,celebrationKind,liturgicalClass
});
const tone=(context,actualCelebration)=>resolve1962CommonMassTone({
 resolvedMass:{actualCelebration,provenance:{musicToneContext:context}}
});
const normal={type:"CALENDAR"};
const cases=[
 ["SUNDAY",null,"SOLEMN"],["FESTIVE_MASS",2,"SOLEMN"],
 ["SATURDAY_BVM_OFFICE",null,"SOLEMN"],
 ["HOLY_THURSDAY_MASS",null,"SOLEMN"],["EASTER_VIGIL_MASS",null,"SOLEMN"],
 ["WITHIN_APPROVED_OCTAVE",null,"SOLEMN"],["FERIA",4,"FERIAL"],
 ["VIGIL",1,"SOLEMN"],["VIGIL",2,"FERIAL"],["VIGIL",3,"FERIAL"],
 ["VOTIVE",1,"SOLEMN"],["VOTIVE",2,"SOLEMN"],
 ["VOTIVE",3,"SOLEMN"],["VOTIVE",4,"FERIAL"]
];
for(const [kind,cls,family] of cases){
 const type=kind==="VOTIVE"?{type:"VOTIVE"}:normal;
 const decided=tone(ctx(kind,cls),type);
 assert.equal(decided.family,family,kind+"/"+cls);
 assert.equal(decided.status,"RUBRICAL_FAMILY_RESOLVED",kind+"/"+cls);
 assert.equal(decided.source.source,"MISSAL_ROMANUM_1962_GENERAL_RUBRICS");
 assert.equal(decided.musicEncoded,false);
 assert.equal(decided.musicalScoreApproved,false);
 assert.equal(decided.seasonalInference,false);
}
// A Lenten or Advent SUNDAY is still a Sunday for Mass prayer tones.
// Conversely an Eastertide FERIA outside an octave remains ferial by §516;
// neither season name nor vestment colour determines the answer.
const lentenSunday=resolve1962CommonMassTone({resolvedMass:{
 actualCelebration:normal,season:"LENT",
 provenance:{musicToneContext:ctx("SUNDAY")}}});
assert.equal(lentenSunday.family,"SOLEMN");
const easterFeria=resolve1962CommonMassTone({resolvedMass:{
 actualCelebration:normal,season:"EASTERTIDE",
 provenance:{musicToneContext:ctx("FERIA")}}});
assert.equal(easterFeria.family,"FERIAL");
// Requiem overrides anything derived from the civil day, and contradictory
// certified metadata is explicitly held instead of mixing musical families.
const req=resolve1962CommonMassTone({
 resolvedMass:{actualCelebration:{type:"REQUIEM"},overlays:["REQUIEM"],
  season:"EASTERTIDE"}});
assert.equal(req.family,"FERIAL");
assert.equal(req.reason,"1962_516_D_REQUIEM");
assert.equal(resolve1962CommonMassTone({
 resolvedMass:{actualCelebration:{type:"REQUIEM"},overlays:["REQUIEM"]},
 toneContext:ctx("SUNDAY")
}).status,"CONFLICT");
assert.equal(resolve1962CommonMassTone({toneContext:ctx("REQUIEM")}).status,"CONFLICT");
assert.equal(tone(ctx("VIGIL",4),normal).status,"REQUIRES_VERIFIED_CELEBRATION");
assert.equal(tone(ctx("VOTIVE",1),normal).status,"CONFLICT");
assert.equal(tone(ctx("SUNDAY"),{type:"VOTIVE"}).status,"CONFLICT");
assert.equal(resolve1962CommonMassTone({resolvedMass:{
 date:"2026-11-01",season:"ALL_SAINTS",proper:{color:"WHITE"},actualCelebration:normal
}}).family,"UNRESOLVED");
assert.equal(resolve1962CommonMassTone({resolvedMass:{
 actualCelebration:normal,provenance:{musicToneContext:{
 ...ctx("SUNDAY"),sourceOwner:"USER_ENTERED_FEAST"
 }}
}}).family,"UNRESOLVED");
assert.equal(resolve1962CommonMassTone({resolvedMass:{
 actualCelebration:normal,provenance:{musicToneContext:{
 ...ctx("SUNDAY"),verified:false
 }}
}}).family,"UNRESOLVED");
// The actual three Preface versicle-response pairs MUST share one family.
// The authority does not certify pitch, tune encoding or a score.
const resolvedMass={actualCelebration:normal,
 provenance:{musicToneContext:ctx("SUNDAY")}};
for(const id of ["COLLECT","PREFACE_DIALOGUE","PATERNOSTER","POSTCOMMUNION"]){
 const result=resolve1962DialogueToneFamily(id,{resolvedMass});
 assert.equal(result.family,"SOLEMN",id);
 assert.equal(result.status,"RUBRICAL_FAMILY_RESOLVED");
 assert.equal(result.scoreStatus,"PENDING_SOURCE_NOTATION_AND_EDITORIAL_APPROVAL");
 const dialogue=projectMassSungDialogue({eventId:id,form:"SOLEMN",resolvedMass});
 assert.equal(dialogue.toneSelection.toneFamily,"SOLEMN");
 assert.equal(dialogue.toneSelection.status,"RUBRICAL_FAMILY_RESOLVED_SCORE_PENDING");
 assert.equal(dialogue.toneSelection.celebrant,"NOTATION_NOT_APPROVED");
 assert.equal(dialogue.toneSelection.response,"NOTATION_NOT_APPROVED");
 assert.equal(dialogue.toneSelection.match,"NOT_MUSICALLY_VERIFIED");
 assert.ok(dialogue.exchanges.every(e=>e.tonePair==="UNVERIFIED_MUSICAL_SETTING"));
}
const p=resolve1962DialogueToneFamily("PREFACE_DIALOGUE",{resolvedMass});
assert.equal(p.celebrantAndResponseMustMatch,true);
assert.equal(p.matchedResponseFamily,"SOLEMN");
assert.equal(projectMassSungDialogue({eventId:"PREFACE_DIALOGUE",form:"SOLEMN",
 resolvedMass:{actualCelebration:normal,
 provenance:{musicToneContext:ctx("FERIA")}}}).toneSelection.matchedResponseFamily,"FERIAL");
// Choice of Gospel tone, dismissal melody and Kyriale/Credo setting is a
// different rule, not the seasonal solemn/ferial Preface family.
for(const id of ["GOSPEL","DISMISSAL","GLORIA","GLORIA_INTONATION",
 "CREDO","CREDO_INTONATION"])
 assert.equal(resolve1962DialogueToneFamily(id,{resolvedMass}),null,id);
assert.equal(projectMassSungDialogue({eventId:"DISMISSAL",form:"SOLEMN",
 resolvedMass}).toneSelection.status,"NOT_SOURCE_CERTIFIED");
assert.equal(projectMassSungDialogue({eventId:"GOSPEL",form:"SOLEMN",
 resolvedMass}).toneSelection.status,"NOT_SOURCE_CERTIFIED");

// Check that the existing runtime itinerary still projects exactly one
// grouped Preface dialogue (not three generated Mass cards).
const content=readFileSync(new URL("../src/mass/reader-schola-event-timeline.js",import.meta.url),"utf8");
assert.match(content,/const sungDialogue=projectMassSungDialogue\(/);
assert.match(content,/sungDialogue,notationHandoff,/);
assert.match(content,/form:selected,resolvedMass,massPlan/);
assert.doesNotMatch(readFileSync(new URL("../src/mass/reader-mass-1962-tone-family.js",import.meta.url),"utf8"),
 /setTimeout|getUserMedia|Date\.now|\.play\(|\.advance\(/);
console.log("PASS M03 fourteen 1962 tone-category cases, seasonal exceptions, actual-Mass source gates and matched Preface response family");
