import test from "node:test";
import assert from "node:assert/strict";
import {getDivineOfficePrayerReadiness as gate,DIVINE_OFFICE_PUBLIC_MODULE_ID}
 from "../src/pray/divine-office-readiness-gate.js";
import {internalPrayerView,supportedDirectPrayerRoute}
 from "../src/pray/internal-route-owner.js";

test("all eight independently certified Latin Advent Compline dates release; no other dates",()=>{
 let count=0;
 for(let day=28;day<=30;day++){
  const r=gate({date:"2026-11-"+day});
  assert.equal(r.researchPreviewEligible,true);
  count++;
  const released=[28,29,30].includes(day);
  assert.equal(r.published,released);
  assert.equal(r.publicRouteEnabled,true);
  assert.equal(r.sourceTextReleased,released);
  assert.equal(r.registeredAsPrayerModule,true);
  assert.equal(r.discoverableInPrayer,true);
  assert.equal(r.rightsApproved,released);
 }
 for(let day=1;day<=5;day++){
  const r=gate({date:"2026-12-0"+day});
  assert.equal(r.researchPreviewEligible,true);
  assert.equal(r.publiclyNavigable,true);
  const released=true;
  assert.equal(r.publishable,released);
  assert.equal(r.published,released);
  assert.equal(r.rightsApproved,released);
  assert.equal(r.sourceTextReleased,released);
  count++;
 }
 for(let day=6;day<=13;day++){
  const date="2026-12-"+String(day).padStart(2,"0");
  const r=gate({date});
  assert.equal(r.published,true,date);
  assert.equal(r.sourceTextReleased,true,date);
  assert.equal(r.rightsApproved,true,date);
  count++;
 }
 assert.equal(count,16);
 assert.equal(DIVINE_OFFICE_PUBLIC_MODULE_ID,"pray.divine_office");
 assert.equal(internalPrayerView(DIVINE_OFFICE_PUBLIC_MODULE_ID),null);
 assert.equal(supportedDirectPrayerRoute(DIVINE_OFFICE_PUBLIC_MODULE_ID),false);
});
test("unreviewed feasts and arbitrary dates cannot inherit the Compline pilot",()=>{
 for(const date of ["2026-12-14","2026-12-16","2026-12-25",
  "2027-11-28","2026-11-27","yesterday",undefined]){
  const r=gate({date});
  assert.equal(r.researchPreviewEligible,false);
  assert.equal(r.psalterAppointment,null);
  assert.equal(r.marianSection,null);
  assert.equal(r.rightsApproved,false);
  assert.equal(r.published,false);
 }
});
