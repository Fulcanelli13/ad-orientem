import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const registry = JSON.parse(readFileSync(new URL("../data/calendar/living-sanctoral-pilot.v1.json", import.meta.url), "utf8"));
const byId = new Map(registry.persons.map(p => [p.id, p]));
const md = /^\d{2}-\d{2}$/;
const iso = /^\d{4}-\d{2}-\d{2}$/;

assert.equal(registry.schema, "AO_LIVING_SANCTORAL_PILOT_V1");
assert.equal(registry.publicationStatus, "RESEARCH_ONLY_NOT_RUNTIME");
assert.equal(registry.policy.actualMass, "NEVER_INFER_FROM_SAINT_ENTRY");
assert.equal(registry.policy.optionalMass, "NEVER_AUTO_SELECT");
assert.equal(registry.policy.modernMissalTextsNeverImportedAutomatically, true);
assert.equal(registry.completion.runtimeDisplayIntegrated, false);
assert.equal(byId.size, registry.persons.length);
assert.equal(registry.persons.length, 6);

for (const person of registry.persons) {
  assert.match(person.id, /^saint\.[a-z0-9-]+$/);
  assert.ok(person.name.en && person.name.fr, person.id + " missing translations");
  assert.ok(["SAINT", "BLESSED"].includes(person.recognition.rank), person.id);
  assert.ok(person.recognition.sourceIds.length, person.id + " has no primary recognition witness");
  if (person.recognition.canonizedOn) assert.match(person.recognition.canonizedOn, iso);
  if (person.recognition.doctorDeclaredOn) assert.match(person.recognition.doctorDeclaredOn, iso);
  for (const id of person.recognition.sourceIds) assert.ok(registry.sources[id]?.url, person.id + " missing " + id);
  for (const o of person.observances) {
    assert.match(o.monthDay, md);
    assert.ok(["1962_GENERAL", "CURRENT_ROMAN_GENERAL", "PARTICULAR_CALENDAR"].includes(o.calendar));
    for (const id of o.sourceIds) assert.ok(registry.sources[id]?.url, person.id + " missing " + id);
  }
  assert.notEqual(person.laterTraditionalMass.status, "AUTOMATICALLY_SELECTED");
  assert.equal("selectedFormularyId" in person, false);
  assert.equal("proper1962Text" in person, false);
  if (person.calendar1962.protectedThirdClass) {
    assert.ok(person.observances.some(o => o.calendar === "1962_GENERAL" && o.kind === "PROTECTED_THIRD_CLASS"));
  }
}

assert.equal(byId.get("saint.john-henry-newman").recognition.doctorDeclaredOn, "2025-11-01");
assert.equal(byId.get("saint.john-henry-newman").observances[0].monthDay, "10-09");
assert.equal(byId.get("saint.pio-pietrelcina").observances[0].monthDay, "09-23");
assert.equal(byId.get("saint.carlo-acutis").observances.length, 0, "no invented universal-calendar date");
assert.equal(byId.get("saint.carlo-acutis").laterTraditionalMass.status, "UNIVERSAL_MEMORIAL_DATE_UNVERIFIED");
assert.equal(byId.get("saint.therese-lisieux").calendar1962.principalId, "sancti:10-03");
assert.equal(byId.get("saint.teresa-avila").calendar1962.protectedThirdClass, true);
assert.equal(byId.get("saint.irenaeus-lyon").calendar1962.principalId, "sancti:07-03r:3:r");
assert.equal(byId.get("saint.teresa-avila").calendar1962.principalId, "sancti:10-15:3:w");

console.log("Living-sanctoral pilot identity/source/precedence guard: PASS (6 research-only cases)");
