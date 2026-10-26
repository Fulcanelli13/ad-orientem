import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  MASS_CHANT_PROGRAMME_SCHEMA,massChantProgrammeIdentity,chantProgrammeEnabled,
  massChantOptions,createMassChantProgramme,selectedChantScoreForReader,
} from "../src/mass/mass-chant-programme.js";
const base={date:"2026-10-26",celebrationId:"mass_of_day",
  requestedCelebrationId:"mass_of_day",celebrationType:"CALENDAR",
  actualCelebration:{id:"king-1962"},properSource:"data/propers/king.json"};
const ctx={form:"MISSA_CANTATA_INCENSE",kind:"CALENDAR"};
assert.equal(chantProgrammeEnabled(ctx),true);
assert.equal(chantProgrammeEnabled({form:"LOW",kind:"CALENDAR"}),false);
assert.equal(chantProgrammeEnabled({form:"SOLEMN",kind:"GOOD_FRIDAY"}),false);
assert.equal(chantProgrammeEnabled({form:"SOLEMN",kind:"EASTER_VIGIL"}),false);
assert.equal(massChantOptions("KYRIE",ctx).length,3);
assert.equal(massChantOptions("SANCTUS_BENEDICTUS",ctx).length,0);
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
assert.equal(selectedChantScoreForReader(selected,"SANCTUS_BENEDICTUS"),null);
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
assert.match(preflight,/chantScoreId=options\.some/);
assert.match(preflight,/if\(lastDate!==null&&date!==lastDate\).*chantScoreId=null/);
assert.match(preflight,/if\(lastCelebrationKey!==null&&lastCelebrationKey!==celebrationKey\).*chantScoreId=null/);
assert.match(preflight,/chantProgramme=createMassChantProgramme/);
assert.match(preflight,/move\("\[data-full-mass-chant\]","\[data-folio-reader-controls\]"\)/);
assert.match(bridge,/chantProgramme:selected\?\.chantProgramme\?\?null/);
assert.match(reader,/selectedChantScoreForReader\(prepared\.readerPreferences\?\.chantProgramme,"KYRIE"\)/);
assert.match(score,/programmeScoreId=null/);
assert.match(score,/let scoreId=preselected\?\.id\?\?SCHOLA_SCORE_PILOT\.id/);
assert.doesNotMatch(preflight,/(?:localStorage|sessionStorage)\.setItem\(/);
console.log("PASS Mass musical programme: limited user-confirmed source data, preflight/read handoff, identity isolation");
