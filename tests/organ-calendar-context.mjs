import assert from "node:assert/strict";
import {verifiedOrganContextFrom1962Calendar} from "../src/mass/organ-calendar-context.js";
import {prepareMassSessionFromV346} from "../src/mass/host-adapter.js";
import {project1962ReaderOrganNote} from "../src/mass/reader-organ-permission-presentation.js";

const day=(date,props={})=>({
  date,status:"ready",
  day:{main:{id:"TEMPORAL_1962_"+date,...props}},
  proper:{status:"ready",data:{riteProfile:null}},
});
const context=(date,change={})=>verifiedOrganContextFrom1962Calendar({
  date,selectedCalendarDate:date,calendarResolution:day(date),...change,
});
const cases=[
  ["2026-01-06","EPIPHANY","PERMITTED"],
  ["2026-02-01","SEPTUAGESIMA","PERMITTED"],
  ["2026-02-18","LENT","ACCOMPANIMENT_ONLY"],
  ["2026-03-22","PASSIONTIDE","ACCOMPANIMENT_ONLY"],
  ["2026-04-05","EASTER","PERMITTED"],
  ["2026-05-24","PENTECOST","PERMITTED"],
  ["2026-10-19","ORDINARY","PERMITTED"],
  ["2026-12-06","ADVENT","ACCOMPANIMENT_ONLY"],
];
const massCard={sectionId:"AO.CARD.006",blocks:[]};
for(const [date,season,status] of cases){
  const plan=context(date);
  assert.ok(plan,"Successful Calendar 1962 day resolution failed: "+date);
  assert.equal(plan.season,season);
  assert.equal(plan.calendarDayId,"TEMPORAL_1962_"+date);
  assert.equal(plan.verified,true);
  assert.equal(plan.source,"LITURGICAL_PLAN_1962");
  assert.equal(plan.notAnObservation,true);
  const norm=project1962ReaderOrganNote({massCard,resolvedMass:{
    form:"MISSA_CANTATA_INCENSE",overlays:[],provenance:{organ1962:plan}
  }});
  assert.equal(norm?.status,status,"1958 seasonal indicator incorrect for "+date);
  assert.equal(norm.actuallyPlaying,"UNKNOWN");
}
assert.equal(context("2026-10-19",{selectedCalendarDate:"2026-10-18"}),null);
assert.equal(context("2026-10-19",{calendarResolving:true}),null);
assert.equal(context("2026-10-19",{calendarResolution:day("2026-10-18")}),null);
assert.equal(context("2026-10-19",{calendarResolution:{...day("2026-10-19"),status:"failed"}}),null);
assert.equal(context("2026-10-19",{calendarResolution:{date:"2026-10-19",day:{main:{title:"A feast"}}}}),null);
assert.equal(context("2026-10-19",{calendarResolution:{
  ...day("2026-10-19"),day:{main:{...day("2026-10-19").day.main,season:"ADVENT"}}
}}),null,"Conflicting resolver season must fail closed");
// §83(a): a saint's feast in a restricted season may lift the restriction
// (holy day of obligation, local holiday, patronal...). That is local, so the
// bridge makes no claim rather than showing a wrong silence or permission.
assert.equal(context("2026-03-25",{calendarResolution:{
  ...day("2026-03-25"),day:{main:{id:"sancti:03-25:1:w",season:"Passiontide"}}
}}),null,
  "A feast in Passiontide must neither switch season nor assert the Lenten silence (§83a is local)");
assert.equal(context("2026-12-08",{calendarResolution:{
  ...day("2026-12-08"),day:{main:{id:"sancti:12-08:1:w"}}
}}),null,"Immaculate Conception in Advent: no silence asserted (§83a)");
assert.equal(context("2026-03-25",{celebrationType:"VOTIVE"})?.season,"PASSIONTIDE",
  "An actual votive proper does not change the annual liturgical season");
assert.equal(context("2026-04-03"),null,"Good Friday cannot inherit an ordinary Mass organ policy");
assert.equal(context("2026-04-04"),null,"Easter Vigil cannot inherit an ordinary Mass organ policy");
assert.equal(context("2026-04-02"),null,"Unidentified Holy Thursday cannot activate an organ exception");
const ht=context("2026-04-02",{calendarResolution:{
  ...day("2026-04-02"),
  proper:{status:"ready",data:{riteProfile:"holy_thursday_mass"}},
}});
assert.equal(ht?.triduum,true);
assert.equal(ht?.holyThursdayMass,true);
assert.equal(context("2026-04-02",{celebrationType:"VOTIVE",calendarResolution:{
  ...day("2026-04-02"),proper:{status:"ready",data:{riteProfile:"holy_thursday_mass"}}
}}),null,"Holy Thursday exception cannot leak to an alternate Mass");
const htMass={form:"MISSA_CANTATA_SIMPLE",overlays:[],provenance:{organ1962:ht}};
assert.equal(project1962ReaderOrganNote({massCard:{
  sectionId:"AO.CARD.001",blocks:[]
},resolvedMass:htMass})?.status,"PERMITTED");
assert.equal(project1962ReaderOrganNote({massCard:{
  sectionId:"AO.CARD.004",blocks:[]
},resolvedMass:htMass})?.status,"SILENT");
const base={
  date:"2026-12-06",canStart:true,
  calendarDay:{id:"tempora:Advent2",title:"Advent Sunday"},
  celebrationId:"mass_of_day",requestedCelebrationId:"mass_of_day",
  celebrationType:"calendar",
};
const proper={sourcePath:"tempora:Advent2",introit:{lat:"Populus Sion"}};
const src=context("2026-12-06");
const bridged=prepareMassSessionFromV346(base,{form:"sung",proper,organ1962:src});
assert.equal(bridged.resolvedMass.provenance.organ1962?.season,"ADVENT",
  "Verified calendar context was not preserved by the v3.4.6 bridge");
assert.equal(prepareMassSessionFromV346(base,{form:"sung",proper,
  organ1962:{...src,date:"2026-12-07"}}).resolvedMass.provenance.organ1962,null,
  "A stale calendar organ context must not survive the Mass bridge");
assert.equal(prepareMassSessionFromV346(base,{form:"sung",proper,
  organ1962:{...src,verified:false}}).resolvedMass.provenance.organ1962,null);
assert.equal(prepareMassSessionFromV346(base,{form:"sung",proper})
  .resolvedMass.provenance.organ1962,null,"Old host caller remains fail-closed");
// §83(b): organ only on Gaudete and Laetare.
const note=(plan,form="MISSA_CANTATA_SIMPLE")=>project1962ReaderOrganNote({massCard:{sectionId:"AO.CARD.006",blocks:[]},
  resolvedMass:{form,overlays:[],provenance:{organ1962:plan}}});
for(const [date,label] of [["2026-12-13","Gaudete"],["2026-03-15","Laetare"]]){
  const plan=context(date);
  assert.equal(plan?.organOnlySunday,true,label+" not recognised");
  assert.equal(note(plan)?.status,"PERMITTED",label+": the organ is permitted (§83b)");
  assert.deepEqual([...note(plan).authority].includes("83b"),true);
}
assert.equal(context("2026-12-06")?.organOnlySunday,false,"Second Sunday of Advent is not Gaudete");
assert.equal(note(context("2026-12-06"))?.status,"ACCOMPANIMENT_ONLY");
assert.equal(note(context("2026-03-22"))?.status,"ACCOMPANIMENT_ONLY","Passion Sunday is not Laetare");
// §81(c): September Ember days (2026: after the third Sunday, 20 Sept) when the ferial Mass is said.
for(const date of ["2026-09-23","2026-09-25","2026-09-26"]){
  const plan=context(date);
  assert.equal(plan?.septEmberFerial,true,date+" is a September Ember feria");
  assert.equal(note(plan)?.status,"ACCOMPANIMENT_ONLY",date+": §81(c) restriction missing");
}
assert.equal(context("2026-09-24")?.septEmberFerial,false,"Ember Thursday does not exist");
assert.equal(note(context("2026-09-16"))?.status,"PERMITTED","The week before is unrestricted");
const emberFeast=context("2026-09-23",{calendarResolution:{...day("2026-09-23"),day:{main:{id:"sancti:09-23:2:r"}}}});
assert.equal(emberFeast?.septEmberFerial,false,"A feast replacing the Ember feria lifts §81(c)");
assert.equal(note(emberFeast)?.status,"PERMITTED");

console.log("Calendar → Mass → existing 1958 organ authority: PASS — same-day 1962 resolver, eight seasons, context holds, triduum, original host compatibility");
