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
  ["2026-01-25","SEPTUAGESIMA","PERMITTED"],
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
assert.equal(context("2026-03-25",{calendarResolution:{
  ...day("2026-03-25"),day:{main:{id:"SANCTI_ANNUNCIATION",season:"Passiontide"}}
}})?.season,"PASSIONTIDE",
  "An observed feast in Passiontide must not switch to Ordinary season");
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
console.log("Calendar → Mass → existing 1958 organ authority: PASS — same-day 1962 resolver, eight seasons, context holds, triduum, original host compatibility");
