import assert from "node:assert/strict";
import {calendarOrdoMassFacts,latinIntroitIncipit} from "../src/calendar/ordo-mass-facts.js";

const base={
  status:"ready",date:"2026-10-07",
  day:{main:{id:"sancti:10-07:2:w",title:"Our Lady of the Rosary",rank:2,color:"white"},
    commemorations:[{id:"sancti:10-07c:4:w",title:"St. Mark I"}]},
  proper:{status:"ready",data:{
    sourcePath:"Sancti/10-07",
    introit:{lat:"Gaudeámus omnes in Dómino, diem festum"},
    preface:{lat:"Communis\nVere dignum"},
    gloria:true,credo:true,
    alternateMasses:[{id:"unverified-votive",title:"No evidence"}]
  }}
};
const cold=calendarOrdoMassFacts(base);
assert.equal(cold.status,"SOURCE_PROPER");
assert.equal(cold.introitIncipit,"Gaudeámus omnes in Dómino, diem");
assert.deepEqual(cold.commemorations,["St. Mark I"]);
assert.equal(cold.preface.status,"SOURCE_CONFLICT",
  "Rosary must not display a Common Preface as correct");
assert.equal(cold.preface.heading,null);
assert.equal(cold.gloria,null,"Uncertified boolean in Proper cannot claim Gloria");
assert.equal(cold.credo,null,"Uncertified boolean in Proper cannot claim Credo");
assert.deepEqual(cold.alternateMasses,[],"An inherited alternative list proves no permission");
assert.equal(cold.commemorationsApplyToChosenForm,null,
  "Calendar commemoration is not automatic Mass-form oration");
assert.equal(cold.sourcePath,"Sancti/10-07");

const repaired=calendarOrdoMassFacts({...base,proper:{status:"ready",data:{
  ...base.proper.data,preface:{lat:"de Beata Maria Virgine\nVere dignum"}
}}});
assert.equal(repaired.preface.status,"MATCH");
assert.match(repaired.preface.heading,/de Beata Maria Virgine/);

const certified=calendarOrdoMassFacts({...base,proper:{status:"ready",data:{
  ...base.proper.data,
  ordoRubricDecision:{status:"CERTIFIED",source:"1962_PROPER_RESOLVER",
    principalCelebrationId:"sancti:10-07:2:w",evidenceUrl:"https://example.org/1962",
    gloria:true,credo:false}
}}});
assert.equal(certified.gloria,true);
assert.equal(certified.credo,false);
const forged=calendarOrdoMassFacts({...base,proper:{status:"ready",data:{
  ...base.proper.data,
  ordoRubricDecision:{status:"CERTIFIED",source:"UNVERIFIED_OTHER_ENGINE",
    principalCelebrationId:"sancti:10-07:2:w",evidenceUrl:"https://example.org/1962",
    gloria:true,credo:true}
}}});
assert.equal(forged.gloria,null);
assert.equal(forged.credo,null);

const unlisted=calendarOrdoMassFacts({...base,date:"2026-10-11",
  day:{main:{id:"tempora:Pent20-0:2:g",title:"XX Sunday after Pentecost",rank:2}},
  proper:{status:"ready",data:{...base.proper.data,
    preface:{lat:"de sanctissima Trinitate\nVere dignum"}}}});
assert.equal(unlisted.preface.status,"WITHHELD",
  "A plausible heading with no owner certification must not be asserted");

assert.equal(calendarOrdoMassFacts({...base,proper:{status:"loading"}}).status,"PROPER_UNAVAILABLE");
assert.equal(calendarOrdoMassFacts({...base,proper:{status:"ready",data:{
  ...base.proper.data,sourcePath:""}}}).status,"PROPER_UNAVAILABLE");
assert.equal(calendarOrdoMassFacts({...base,status:"failed"}).status,"UNAVAILABLE");
const goodFriday=calendarOrdoMassFacts({...base,day:{main:{
  id:"tempora:Quad6-5r:1:b",title:"Friday of the Passion"}}});
assert.equal(goodFriday.status,"SPECIAL_LITURGY");
assert.equal(goodFriday.introitIncipit,null);

assert.equal(latinIntroitIncipit({lat:"Introitus: Si iniquitates observaveris, Domine"}),"Si iniquitates observaveris, Domine");
assert.equal(latinIntroitIncipit({lat:"℣. Gaudeamus omnes"}),"Gaudeamus omnes");
assert.equal(latinIntroitIncipit({lat:"Ps 129:3-4\\nSi iniquitates observaveris, Domine, Domine"}),"Si iniquitates observaveris, Domine, Domine",
  "Missal reference-only heading must not be rendered as the Latin Introit");
assert.equal(latinIntroitIncipit({lat:"Ps 129:3-4"}),null,
  "A Scripture reference alone is not an Introit incipit");
assert.equal(latinIntroitIncipit({lat:"Ps 129:3-4 Si iniquitates observaveris"}),"Si iniquitates observaveris",
  "Citation prefixes on the same line must be stripped");
assert.equal(latinIntroitIncipit({lat:"$SourcePlaceholder"}),null);

console.log("PASS Calendar Ordo Mass facts: identity, proper, incipit, preface conflicts, strict rubrical flags, alternative exclusion and Good Friday");
