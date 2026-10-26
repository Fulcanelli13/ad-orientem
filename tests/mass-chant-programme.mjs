import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  MASS_CHANT_PROGRAMME_SCHEMA,massChantProgrammeIdentity,chantProgrammeEnabled,
  massChantOptions,createMassChantProgramme,selectedChantScoreForReader,
  MASS_CHANT_ORDINARY_TRACKS,
} from "../src/mass/mass-chant-programme.js";
const base={date:"2026-10-26",celebrationId:"mass_of_day",
  requestedCelebrationId:"mass_of_day",celebrationType:"CALENDAR",
  actualCelebration:{id:"king-1962"},properSource:"data/propers/king.json"};
const ctx={form:"MISSA_CANTATA_INCENSE",kind:"CALENDAR"};
assert.equal(chantProgrammeEnabled(ctx),true);
assert.equal(chantProgrammeEnabled({form:"LOW",kind:"CALENDAR"}),false);
assert.equal(chantProgrammeEnabled({form:"SOLEMN",kind:"GOOD_FRIDAY"}),false);
assert.equal(chantProgrammeEnabled({form:"SOLEMN",kind:"EASTER_VIGIL"}),false);
assert.equal(chantProgrammeEnabled({form:"SOLEMN",kind:"REQUIEM"}),false);
assert.equal(chantProgrammeEnabled({form:"MISSA_CANTATA_INCENSE",kind:"NUPTIAL"}),false);
assert.equal(chantProgrammeEnabled({form:"MISSA_CANTATA_INCENSE",kind:"SPECIAL_FORMULARY"}),false);
assert.equal(chantProgrammeEnabled({form:"MISSA_CANTATA_INCENSE",kind:"VOTIVE"}),true);
assert.equal(massChantOptions("KYRIE",ctx).length,3);
assert.equal(massChantOptions("SANCTUS_BENEDICTUS",ctx).length,1);
assert.equal(massChantOptions("GLORIA",ctx).length,1);
assert.equal(massChantOptions("CREDO",ctx).length,1);
assert.equal(massChantOptions("AGNUS_DEI",ctx).length,1);
assert.deepEqual(MASS_CHANT_ORDINARY_TRACKS,["KYRIE","GLORIA","CREDO","SANCTUS_BENEDICTUS","AGNUS_DEI"]);
assert.equal(massChantOptions("INTROIT",ctx).length,0);
assert.equal(massChantOptions("KYRIE",{form:"LOW",kind:"CALENDAR"}).length,0);
assert.equal(massChantProgrammeIdentity({...base,date:"invalid"},ctx),null);
const unknown=createMassChantProgramme(base,ctx);
assert.equal(unknown.schema,MASS_CHANT_PROGRAMME_SCHEMA);
assert.equal(unknown.kyrieScoreId,null,"No guessed Kyrie from liturgical date");
assert.equal(selectedChantScoreForReader(unknown,"KYRIE"),null);
assert.equal(unknown.sourceOfLiturgicalText,"EXISTING_1962_MASS_HOST");
assert.ok(unknown.unresolvedTracks.includes("SANCTUS_BENEDICTUS"));
assert.ok(unknown.unresolvedTracks.includes("INTROIT"));
const selected=createMassChantProgramme(base,{...ctx,kyrieScoreId:"GREGOBASE-2982"});
assert.equal(selected.kyrieScoreId,"GREGOBASE-2982");
assert.equal(selectedChantScoreForReader(selected,"KYRIE"),"GREGOBASE-2982");
const resumed=JSON.parse(JSON.stringify({readerPreferences:{chantProgramme:selected}}));
assert.equal(selectedChantScoreForReader(resumed.readerPreferences.chantProgramme,"KYRIE"),"GREGOBASE-2982",
  "Active Mass resume must preserve only the explicit user-selected Kyrie");
assert.equal(selectedChantScoreForReader(selected,"SANCTUS_BENEDICTUS"),null);
const independent=createMassChantProgramme(base,{...ctx,selectedScores:{
  KYRIE:"GREGOBASE-1184",GLORIA:"GREGOBASE-961",CREDO:"GREGOBASE-749",
  SANCTUS_BENEDICTUS:"GREGOBASE-1384",AGNUS_DEI:"GREGOBASE-2760",
  INTROIT:"GREGOBASE-1384"
}});
assert.equal(Object.keys(independent.selections).length,5);
for(const track of MASS_CHANT_ORDINARY_TRACKS)
  assert.equal(selectedChantScoreForReader(independent,track),independent.selections[track]);
assert.equal(selectedChantScoreForReader(independent,"INTROIT"),null);
assert.equal(independent.unresolvedTracks.includes("INTROIT"),true);
assert.equal(independent.unresolvedTracks.includes("CREDO"),false);
const polyphonic=createMassChantProgramme(base,{...ctx,sanctusPerformance:"POLYPHONIC",
  selectedScores:{KYRIE:"GREGOBASE-1184",SANCTUS_BENEDICTUS:"GREGOBASE-1384"}});
assert.equal(polyphonic.sanctusPerformance,"POLYPHONIC");
assert.equal(selectedChantScoreForReader(polyphonic,"SANCTUS_BENEDICTUS"),null,
  "Gregorian Sanctus cannot represent polyphonic performance");
assert.equal(polyphonic.selections.SANCTUS_BENEDICTUS,undefined);
assert.equal(selectedChantScoreForReader(polyphonic,"KYRIE"),"GREGOBASE-1184");
const gregorian=createMassChantProgramme(base,{...ctx,sanctusPerformance:"GREGORIAN",
  selectedScores:{SANCTUS_BENEDICTUS:"GREGOBASE-1384"}});
assert.equal(selectedChantScoreForReader(gregorian,"SANCTUS_BENEDICTUS"),"GREGOBASE-1384");
assert.equal(createMassChantProgramme(base,{...ctx,sanctusPerformance:"INVALID"}).sanctusPerformance,"UNSPECIFIED");
const nonPropagating=createMassChantProgramme(base,{...ctx,selectedScores:{KYRIE:"GREGOBASE-1184"}});
assert.equal(selectedChantScoreForReader(nonPropagating,"GLORIA"),null);
assert.equal(selectedChantScoreForReader(nonPropagating,"CREDO"),null);
assert.equal(selectedChantScoreForReader(nonPropagating,"SANCTUS_BENEDICTUS"),null);
assert.equal(selectedChantScoreForReader(nonPropagating,"AGNUS_DEI"),null);

assert.equal(selectedChantScoreForReader({...selected,selections:{KYRIE:"UNKNOWN"}},"KYRIE"),null);
assert.equal(selectedChantScoreForReader({...selected,sourceType:"SOURCE_CERTIFIED"},"KYRIE"),null);
assert.equal(createMassChantProgramme(base,{...ctx,kyrieScoreId:"FREE_FORM_FAKE_TUNE"}).kyrieScoreId,null);
assert.equal(createMassChantProgramme(base,{form:"LOW",kind:"CALENDAR",kyrieScoreId:selected.kyrieScoreId}),null);
assert.equal(createMassChantProgramme(base,{form:"SOLEMN",kind:"GOOD_FRIDAY",kyrieScoreId:selected.kyrieScoreId}),null);
assert.notEqual(massChantProgrammeIdentity({...base,date:"2026-10-27"},ctx),selected.identity);
assert.notEqual(massChantProgrammeIdentity({...base,celebrationId:"votive"},ctx),selected.identity);
assert.notEqual(massChantProgrammeIdentity({...base,properSource:"different-source"},ctx),selected.identity);
assert.notEqual(massChantProgrammeIdentity({...base,actualCelebration:{id:"other"}},ctx),selected.identity);
assert.notEqual(massChantProgrammeIdentity(base,{...ctx,form:"SOLEMN"}),selected.identity);
assert.equal(selectedChantScoreForReader({...selected,schema:"untrusted"},"KYRIE"),null);
const preflight=readFileSync(new URL("../src/mass/full-mass-preflight.js",import.meta.url),"utf8");
const bridge=readFileSync(new URL("../src/mass/browser-entry.js",import.meta.url),"utf8");
const reader=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
const score=readFileSync(new URL("../src/mass/reader-chant-score-pilot.js",import.meta.url),"utf8");
assert.match(preflight,/data-full-mass-chant-choice/);
assert.match(preflight,/chantIdentity=massChantProgrammeIdentity/);
assert.match(preflight,/chantSelections=\{\.\.\.chantSelections,\[track\]:value\}/);
assert.match(preflight,/data-full-mass-other-chants/);
assert.match(preflight,/if\(lastDate!==null&&date!==lastDate\).*chantScoreId=null/);
assert.match(preflight,/if\(lastCelebrationKey!==null&&lastCelebrationKey!==celebrationKey\).*chantScoreId=null/);
assert.match(preflight,/chantProgramme=createMassChantProgramme/);
assert.match(preflight,/move\("\[data-full-mass-chant\]","\[data-folio-reader-controls\]"\)/);
assert.match(bridge,/chantProgramme:selected\?\.chantProgramme\?\?null/);
assert.match(bridge,/sanctusPerformance:selected\?\.sanctusPerformance\?\?"UNSPECIFIED"/);
assert.match(preflight,/data-full-mass-sanctus-performance/);
assert.match(reader,/selectedChantScoreForReader\(prepared\.readerPreferences\?\.chantProgramme,"KYRIE"\)/);
assert.match(reader,/programmeSelections:Object\.fromEntries/);
assert.match(score,/programmeScoreId=null/);
assert.match(score,/let scoreId=selectedForTrack\("KYRIE"\)\?\.id\?\?SCHOLA_SCORE_PILOT\.id/);
assert.doesNotMatch(preflight,/(?:localStorage|sessionStorage)\.setItem\(/);
console.log("PASS Mass musical programme: limited user-confirmed source data, preflight/read handoff, identity isolation");
