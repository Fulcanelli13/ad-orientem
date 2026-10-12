import assert from "node:assert/strict";
import {select1962CommemorationsForMassForm as select} from "../src/mass/1962-commemoration-form-source.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";
import {assessPrintableProper,renderPrintableProperHtml} from "../src/calendar/print-proper.js";

const tr=n=>({lat:"Oratio latina "+n,en:"English prayer "+n,fr:"Prière française "+n});
const one=tr("principal"),extra=tr("Marian");
const base={
  sourcePath:"Tempora/Pent20-0",riteProfile:"ordinary_mass",
  name:"XX Sunday after Pentecost",
  introit:tr("introit"),epistle:tr("epistle"),gradual:tr("gradual"),gospel:tr("gospel"),
  offertory:tr("offertory"),preface:tr("preface"),communion:tr("communion"),
  collects:[one,extra],secrets:[one,extra],postcommunions:[one,extra],
  calendarCommemorations:[{path:"Sancti/10-11",name:"Divine Maternity",inseparable:false}],
};
const day={
  date:"2026-10-11",status:"ready",
  day:{main:{id:"tempora:Pent20-0:2:g",rank:2,title:"XX Sunday after Pentecost"},
    commemorations:[{id:"sancti:10-11:2:w",rank:2,path:"Sancti/10-11",title:"Divine Maternity"}]},
  proper:{status:"ready",data:base}
};
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  const original={status:"READY",data:base};
  const selected=select({proper:original,calendarResolution:day,form});
  assert.equal(selected.status,"CERTIFIED",form);
  const p=selected.proper.data;
  const expected=form==="LOW"?2:1;
  assert.equal(p.commemorationFormDecision.appliedCount,expected-1,form);
  assert.equal(p.collects.length,expected,form);
  assert.equal(p.secrets.length,expected,form);
  assert.equal(p.postcommunions.length,expected,form);
  assert.equal(p.calendarCommemorations.length,1,"Calendar is preserved");
  assert.equal(p.appliedCommemorations.length,expected-1);
  assert.deepEqual(p.collects[0],one,"Principal prayer must not be replaced");
  assert.equal(properToReaderSlots(p,{language:"fr"}).slots.COLLECT_SET.data.paragraphs.length,expected);
  assert.equal(properToReaderSlots(p,{language:"en"}).slots.SECRET_SET.data.paragraphs.length,expected);
  const printed=assessPrintableProper(day,{language:"fr",massForm:form});
  assert.equal(printed.ok,true,form+": "+printed.reason);
  assert.equal(printed.sections.filter(x=>x.kind==="collect").length,expected,form);
  const html=renderPrintableProperHtml(day,{language:"en",massForm:form});
  assert.equal((html.match(/<h2 id="section-\d+">Collect/g)||[]).length,expected);
}
for(const [change,reason] of [
  [{date:"2026-10-12"},"RUBRICAL_CLASSIFICATION_PENDING"],
  [{day:{main:{...day.day.main,rank:1},commemorations:day.day.commemorations}},"RUBRICAL_CLASSIFICATION_PENDING"],
  [{day:{main:day.day.main,commemorations:[...day.day.commemorations,...day.day.commemorations]}},"RUBRICAL_CLASSIFICATION_PENDING"],
]){
  const blocked=select({proper:base,calendarResolution:{...day,...change},form:"LOW"});
  assert.equal(blocked.status,"UNVERIFIED");assert.equal(blocked.reason,reason);
}
assert.equal(select({proper:base,calendarResolution:day,form:"SOLEMN",isConventual:true}).reason,
  "CONVENTUAL_RULES_NOT_VERIFIED");
assert.equal(select({proper:base,calendarResolution:day,form:"LOW",celebrationId:"votive"}).reason,
  "ALTERNATE_FORMULARY");
assert.equal(select({proper:{...base,calendarCommemorations:[{path:"Other"}]},calendarResolution:day,form:"LOW"}).reason,
  "RUBRICAL_CLASSIFICATION_PENDING");
assert.equal(select({proper:{...base,secrets:[one]},calendarResolution:day,form:"LOW"}).reason,
  "ORATION_SOURCE_INCOMPLETE");
assert.equal(assessPrintableProper({...day,day:{...day.day,commemorations:[
  {...day.day.commemorations[0],rank:1}]}},{massForm:"SOLEMN"}).ok,false);
console.log("PASS: source-owned II-class Sunday commemoration, four forms × reader × print, strict holds for unsupported cases.");
