// Field regression: yesterday's saved Mass must never replace today's Proper.
// A real Mass crossing midnight retains a bounded short resume grace.
import assert from "node:assert/strict";
import {persistedMassIsResumable} from "../src/mass/browser-entry.js";

process.env.TZ="Indian/Mauritius";
const now=new Date("2026-11-01T09:30:00+04:00");
const record=(date,{updatedAt="2026-10-31T15:00:00+04:00",state="suspended"}={})=>({
  schema:"ao-mass-entry-bootstrap-v1",
  state,
  session:{resolvedMass:{schema:"ao-resolved-mass-v2",date}},
  readerPreferences:{mode:"LIVE",language:"en"},
  storedAt:updatedAt,updatedAt
});

assert.equal(persistedMassIsResumable(record("2026-10-31"),now),false,
  "October 31 persisted Mass must not hijack November 1 Morning Mass");
assert.equal(persistedMassIsResumable(record("2026-11-01",{
  updatedAt:"2026-11-01T05:00:00+04:00"
}),now),true,"Same-day reader checkpoint must remain resumable");
assert.equal(persistedMassIsResumable(record("2026-11-02",{
  updatedAt:"2026-11-01T09:00:00+04:00"
}),now),false,"Future-day checkpoints must never masquerade as today");
const midnight=new Date("2026-11-01T00:30:00+04:00");
assert.equal(persistedMassIsResumable(record("2026-10-31",{
  updatedAt:"2026-10-31T23:40:00+04:00"
}),midnight),true,"A Mass actually spanning local midnight may be resumed shortly after");
assert.equal(persistedMassIsResumable({...record("2026-10-31"),
  storedAt:null,updatedAt:null},now),false,"Undated old-day record must fail closed");
assert.equal(persistedMassIsResumable(record("2026-10-31",{state:"completed"}),now),false);
assert.equal(persistedMassIsResumable(record("2026-11-01",{
  updatedAt:"2026-11-01T06:00:00+04:00"
}),new Date("2026-11-02T09:30:00+04:00")),false,
  "November 1 Mass must not be resumed on All Souls the following morning");
console.log("PASS: prior-day Mass resume expires, same-day and midnight grace retained");
