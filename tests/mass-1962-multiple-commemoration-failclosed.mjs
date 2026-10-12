// Synthetic adversarial source contract only: this fixture is NOT a claim
// that any particular civil day actually has two commemorations. The real
// 2026 resolver inventory is audited separately in PR #1107.
import assert from "node:assert/strict";
import {select1962CommemorationsForMassForm as select} from "../src/mass/1962-commemoration-form-source.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";
import {assessPrintableProper} from "../src/calendar/print-proper.js";
import {massCalendarPreflightContext} from "../src/mass/calendar-preflight-context.js";
const tr=n=>({lat:"Lat "+n,en:"English "+n,fr:"Français "+n});
const prayerFields=["collects","secrets","postcommunions"];
const raw={sourcePath:"Tempora/Fictional-1",riteProfile:"ordinary_mass",
  name:"Synthetic source contract",introit:tr("intro"),epistle:tr("epistle"),
  gradual:tr("gradual"),gospel:tr("gospel"),offertory:tr("offertory"),
  preface:tr("preface"),communion:tr("communion"),
  calendarCommemorations:[{path:"Sancti/SYNTHETIC-A"},{path:"Sancti/SYNTHETIC-B"}]};
for(const field of prayerFields)raw[field]=[tr(field+" main"),tr(field+" A"),tr(field+" B")];
const day={status:"ready",date:"2026-09-30",
  day:{main:{id:"tempora:synthetic:3:g",path:"Tempora/Fictional-1",rank:3,
    title:"Synthetic principal"},
    commemorations:[
      {id:"sancti:synthetic-a:3:w",path:"Sancti/SYNTHETIC-A",title:"A",rank:3},
      {id:"sancti:synthetic-b:3:r",path:"Sancti/SYNTHETIC-B",title:"B",rank:3}]},
  proper:{status:"ready",data:raw}};
const untouched=JSON.stringify(raw);
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  const projected=select({proper:day.proper,calendarResolution:day,form});
  assert.equal(projected.status,"UNVERIFIED",form);
  assert.equal(projected.reason,"MULTIPLE_COMMEMORATIONS_SOURCE_PRIORITY_PENDING");
  const p=projected.proper.data;
  assert.deepEqual(prayerFields.map(k=>p[k].length),[3,3,3],
    "Do not drop even an unverified original text before source certification");
  assert.equal(p.calendarCommemorations.length,2,"Calendar source entries survive");
  assert.equal(p.commemorationFormDecision.status,"UNVERIFIED");
  assert.equal(p.commemorationFormDecision.calendarCount,2);
  assert.equal(p.commemorationFormDecision.form,form);
  const mapped=properToReaderSlots(p,{language:"fr"});
  for(const slot of ["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"]){
    assert.equal(mapped.slots[slot].status,"MISSING",form+" / "+slot);
    assert.match(mapped.slots[slot].reason,/not source-certified/);
  }
  assert.equal(mapped.ready,false,form+" must not display uncategorized orations as ready");
  const printed=assessPrintableProper(day,{language:"fr",massForm:form});
  assert.equal(printed.ok,false,form+" must not print an unsourced form-specific set");
  assert.match(printed.reason,/not yet source-certified/);
  const banner=massCalendarPreflightContext({date:day.date,
    celebrationType:"CALENDAR",celebrationId:"mass_of_day"},
    {selectedDate:day.date,resolving:false,resolution:day},"en",{form});
  assert.equal(banner.commemorationOrations.status,"FORM_RULES_UNVERIFIED");
  assert.deepEqual(banner.commemorations,["A","B"]);
}
assert.equal(JSON.stringify(raw),untouched,"Original Proper must not be mutated");
// Even 4+ raw prayers or the presence of a privileged token cannot authorize
// a silent decision about order, two-prayer limits or extra conclusions.
const extra={...day,day:{...day.day,
  commemorations:[...day.day.commemorations,{id:"other",title:"C",path:"Sancti/C"}]}};
assert.equal(select({proper:day.proper,calendarResolution:extra,form:"LOW"}).status,
  "UNVERIFIED");
assert.equal(select({proper:day.proper,calendarResolution:day,form:"SOLEMN",
  observedSource:true}).reason,"ALTERNATE_FORMULARY");
console.log("PASS: multiple commemorations fail closed in 4 Mass forms across LIVE, printed Proper and preflight, without deleting source Calendar or oration text.");
