import test from "node:test";
import assert from "node:assert/strict";
import {getDivineOfficePrayerReadiness as gate,DIVINE_OFFICE_PUBLIC_MODULE_ID}
 from "../src/pray/divine-office-readiness-gate.js";
import {internalPrayerView,supportedDirectPrayerRoute}
 from "../src/pray/internal-route-owner.js";

test("eight reviewed dates can be inspected internally but none are public Prayer modules",()=>{
 let count=0;
 for(let day=28;day<=30;day++){
  const r=gate({date:"2026-11-"+day});
  assert.equal(r.researchPreviewEligible,true);
  count++;
  assert.equal(r.published,false);
  assert.equal(r.publicRouteEnabled,false);
  assert.equal(r.registeredAsPrayerModule,false);
  assert.equal(r.discoverableInPrayer,false);
  assert.equal(r.rightsApproved,false);
 }
 for(let day=1;day<=5;day++){
  const r=gate({date:"2026-12-0"+day});
  assert.equal(r.researchPreviewEligible,true);
  assert.equal(r.publiclyNavigable,false);
  assert.equal(r.publishable,false);
  count++;
 }
 assert.equal(count,8);
 assert.equal(DIVINE_OFFICE_PUBLIC_MODULE_ID,"pray.divine_office");
 assert.equal(internalPrayerView(DIVINE_OFFICE_PUBLIC_MODULE_ID),null);
 assert.equal(supportedDirectPrayerRoute(DIVINE_OFFICE_PUBLIC_MODULE_ID),false);
});
test("unreviewed feasts and arbitrary dates cannot inherit the Compline pilot",()=>{
 for(const date of ["2026-12-06","2026-12-08","2026-12-25",
  "2027-11-28","2026-11-27","yesterday",undefined]){
  const r=gate({date});
  assert.equal(r.researchPreviewEligible,false);
  assert.equal(r.psalterAppointment,null);
  assert.equal(r.marianSection,null);
  assert.equal(r.rightsApproved,false);
  assert.equal(r.published,false);
 }
});
