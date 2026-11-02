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

// Regression for the real H7 failure: Home previously painted Resume Mass
// for an Oct 31 checkpoint on Nov 2, while R17 refused to open it.
import {readNativeMassResume} from "../src/home/presentation.js";
const nov2Evening=new Date("2026-11-02T18:27:00+04:00");
const fakeWindow=(record,now)=>({
  Date:class extends Date {constructor(...args){super(...(args.length?args:[now.getTime()]));}},
  localStorage:{getItem:key=>key==="ao-r17-active-mass-v1"?JSON.stringify(record):null},
});
const staleOct31=record("2026-10-31",{updatedAt:"2026-11-02T18:20:00+04:00"});
assert.equal(persistedMassIsResumable(staleOct31,nov2Evening),false,
  "A recently updated two-day-old reader must never be resumable");
assert.equal(readNativeMassResume(fakeWindow(staleOct31,nov2Evening)),null,
  "H7 must show Begin Mass rather than a stale Oct 31 Resume button on Nov 2");
const staleYesterday=record("2026-11-01",{updatedAt:"2026-11-02T18:20:00+04:00"});
assert.equal(persistedMassIsResumable(staleYesterday,nov2Evening),false,
  "A yesterday checkpoint refreshed in the evening is not a midnight crossing");
assert.equal(readNativeMassResume(fakeWindow(staleYesterday,nov2Evening)),null);
const validNov2=record("2026-11-02",{updatedAt:"2026-11-02T18:00:00+04:00"});
assert.equal(readNativeMassResume(fakeWindow(validNov2,nov2Evening))?.date,"2026-11-02",
  "A genuine same-day Mass must still present Resume");
const midnightCrossing=record("2026-11-01",{updatedAt:"2026-11-01T23:40:00+04:00"});
assert.equal(readNativeMassResume(fakeWindow(midnightCrossing,new Date("2026-11-02T00:30:00+04:00")))?.date,"2026-11-01",
  "A genuine immediately previous-day Mass may retain its midnight grace");

console.log("PASS: R17 and H7 agree on stale, same-day and midnight-grace resume");
