// Pure Phase A contracts. Synthetic documents are NOT source-text certification.
import test from "node:test";
import assert from "node:assert/strict";
import {
  ROMAN_OFFICE_HOURS, makeOfficeSourceRequest, tenebraeDayIndex,
  adaptExistingTenebraeHour,
} from "../src/office/source-context.js";

const calendar = date => ({
  status: "ready", date,
  day: {main: {id:"source:principal",title:"Resolved source celebration",rank:"I Class"}},
});
const compiled = (dayIndex, hour = "MATINS") => ({
  schema: "ao.tenebrae.1960.hour-reader.v1",
  dayIndex, hour, mode: "RUBRICS_1960_MATINS_LAUDS",
  textsCompleteForSourceDerivedReading: true,
  printEditionCriticallyCertified: false,
  sourceRevision: "b9f8c8eb15d52b2b2c02e2ca24807cfaa73758f0",
  attribution: "© Divinum Officium — original compiler attribution retained",
  steps: Array.from({length:hour==="MATINS"?32:10}, (_,i)=>({
    id:"T."+i, kind:"SOURCE_PARAGRAPH", latin:"La "+i, en:"En "+i, fr:"Fr "+i,
  })),
});

test("Office requests reuse the canonical Calendar, without claiming Office precedence", () => {
  assert.equal(ROMAN_OFFICE_HOURS.length, 8);
  for (const hour of ROMAN_OFFICE_HOURS) {
    const x = makeOfficeSourceRequest({date:"2026-10-28",hour,calendarResolution:calendar("2026-10-28")});
    assert.equal(x.hour, hour);
    assert.equal(x.status, "OFFICE_COMPOSITION_PENDING");
    assert.equal(x.requiresIndependentOfficeDecision, true);
    assert.equal(x.calendar.officePrecedenceResolved, false);
    assert.deepEqual([...x.requestedLanguages], ["la","en","fr"]);
  }
});

test("Stale, missing or failed canonical Calendar is rejected", () => {
  for (const value of [null, calendar("2026-10-27"), {...calendar("2026-10-28"),status:"failed"}]) {
    assert.throws(()=>makeOfficeSourceRequest({date:"2026-10-28",hour:"VESPERS",calendarResolution:value}), /OFFICE_CALENDAR_/);
  }
  assert.throws(()=>makeOfficeSourceRequest({date:"2026-02-30",hour:"LAUDS",calendarResolution:calendar("2026-02-30")}), /OFFICE_DATE_INVALID/);
  assert.throws(()=>makeOfficeSourceRequest({date:"2026-10-28",hour:"COMPLINE_II",calendarResolution:calendar("2026-10-28")}), /OFFICE_HOUR_INVALID/);
});

test("Existing Holy Week Tenebrae date mapping is read from the shared liturgical year", () => {
  assert.equal(tenebraeDayIndex("2026-04-02"),0);
  assert.equal(tenebraeDayIndex("2026-04-03"),1);
  assert.equal(tenebraeDayIndex("2026-04-04"),2);
  assert.throws(()=>tenebraeDayIndex("2026-04-05"),/NOT_HOLY_WEEK/);
});

test("Existing fully-compiled Tenebrae becomes an Office document without copying source text", () => {
  for (const [date,index] of [["2026-04-02",0],["2026-04-03",1],["2026-04-04",2]]) {
    for (const hour of ["MATINS","LAUDS"]) {
      const original = compiled(index,hour);
      const x=adaptExistingTenebraeHour({date,calendarResolution:calendar(date),tenebrae:original});
      assert.equal(x.status, "READY");
      assert.equal(x.kind, "HOLY_WEEK_TENEBRAE");
      assert.equal(x.sections.length, hour==="MATINS"?32:10);
      assert.equal(x.sections[0].text.la,original.steps[0].latin);
      assert.equal(x.sections[0].text.en,original.steps[0].en);
      assert.equal(x.sections[0].text.fr,original.steps[0].fr);
      assert.equal(x.provenance.sourceRevision,original.sourceRevision);
      assert.equal(x.provenance.independentlyPrintedEditionCertified,false);
    }
  }
});

test("A partial, mismatched or unresolved Tenebrae document must fail closed", () => {
  const base = compiled(0);
  const adapt = t => adaptExistingTenebraeHour({date:"2026-04-02",calendarResolution:calendar("2026-04-02"),tenebrae:t});
  assert.throws(()=>adapt({...base,dayIndex:1}),/DAY_MISMATCH/);
  assert.throws(()=>adapt({...base,steps:base.steps.slice(0,31)}),/STEPS_INCOMPLETE/);
  assert.throws(()=>adapt({...base,sourceRevision:""}),/SOURCE_NOT_READY/);
  assert.throws(()=>adapt({...base,steps:base.steps.map((s,i)=>i===0?{...s,fr:""}:s)}),/UNRESOLVED_TEXT/);
  assert.throws(()=>adapt({...base,steps:base.steps.map((s,i)=>i===1?{...s,id:"T.0"}:s)}),/SECTION_INVALID/);
  assert.throws(()=>adapt({...base,steps:base.steps.map((s,i)=>i===0?{...s,latin:"$macro"}:s)}),/UNRESOLVED_TEXT/);
  assert.throws(()=>adapt({...base,hour:"VESPERS"}),/HOUR_UNSUPPORTED/);
});
