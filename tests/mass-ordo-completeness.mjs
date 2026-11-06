import assert from "node:assert/strict";
import {icrspNovember2026Appointment,selectIcrspFirstSaturdayLowMass,
 isExplicitIcrspNovemberLowMassSelection} from "../src/mass/icrsp-first-friday-entry.js";
import {projectIcrspNovemberProPapaOrations,
 icrspNovemberOrdoMassContract} from "../src/mass/icrsp-nov06-pro-papa-orations.js";
import {assessMassOrdoCompleteness,requireMassOrdoCompleteness}
 from "../src/mass/ordo-mass-completeness.js";

const row=Object.freeze({lat:"Dómine, da nobis grátiam. Per Dóminum.",
 en:"O Lord, grant us grace. Through our Lord.",
 fr:"Seigneur, donnez-nous la grâce. Par Notre-Seigneur."});
const base=path=>Object.freeze({sourcePath:path,introit:row,
 collects:[row],epistle:row,gradual:row,gospel:row,offertory:row,
 secrets:[row],preface:row,communion:row,postcommunions:[row]});
for(const date of ["2026-11-06","2026-11-07"]){
 const spec=icrspNovember2026Appointment(date);
 const input={proper:base(spec.path),date,form:"LOW",
   actualCelebrationId:spec.id,votiveBasis:spec.basis,
   explicitInstituteSelection:true};
 const contract=icrspNovemberOrdoMassContract(date);
 assert.ok(contract, "No independent verified Ordo for "+date);
 assert.equal(contract.sourcePath,spec.path);
 assert.equal(contract.orations.postcommunions.length,2);
 const incomplete=assessMassOrdoCompleteness({
  proper:input.proper,contract,date,form:"LOW",
  celebrationId:spec.id,votiveBasis:spec.basis
 });
 assert.equal(incomplete.status,"UNVERIFIED",
  "The single-prayer Proper erroneously passed the same Ordo: "+date);
 assert.equal(incomplete.reason,"ORATION_COUNT_collects");
 const projected=projectIcrspNovemberProPapaOrations(input);
 assert.equal(projected.status,"APPLIED",date+": "+projected.reason);
 for(const group of ["collects","secrets","postcommunions"]){
  assert.equal(projected.proper[group].length,2,date+" "+group);
  assert.strictEqual(projected.proper[group][0],input.proper[group][0]);
 }
 const verified=requireMassOrdoCompleteness({
  proper:projected.proper,contract,date,form:"LOW",
  celebrationId:spec.id,votiveBasis:spec.basis
 });
 assert.equal(verified.status,"CERTIFIED");
 assert.equal(Object.keys(verified.checks).length,6);
 for(const group of ["collects","secrets","postcommunions"]){
  const shortened={...projected.proper,
   [group]:projected.proper[group].slice(0,1)};
  const check=assessMassOrdoCompleteness({
   proper:shortened,contract,date,form:"LOW",
   celebrationId:spec.id,votiveBasis:spec.basis
  });
  assert.equal(check.reason,"ORATION_COUNT_"+group,
   "Dropping "+group+" must fail before Mass");
  assert.throws(()=>requireMassOrdoCompleteness({
   proper:shortened,contract,date,form:"LOW",
   celebrationId:spec.id,votiveBasis:spec.basis
  }),/MASS_ORDO_INCOMPLETE/);
 }
 const stale={...projected.proper,
  postcommunions:[
   projected.proper.postcommunions[0],
   {...projected.proper.postcommunions[1],sourcePath:"Unknown source"}
  ]};
 assert.equal(assessMassOrdoCompleteness({
  proper:stale,contract,date,form:"LOW",
  celebrationId:spec.id,votiveBasis:spec.basis
 }).reason,"ORATION_SOURCE_ID_postcommunions_1");
 const wrongText={...projected.proper,
  postcommunions:[
   projected.proper.postcommunions[0],
   {...projected.proper.postcommunions[1],fr:"Prière accidentellement tronquée."}
  ]};
 assert.equal(assessMassOrdoCompleteness({
  proper:wrongText,contract,date,form:"LOW",
  celebrationId:spec.id,votiveBasis:spec.basis
 }).reason,"ORATION_TEXT_CHANGED_postcommunions_1");
 assert.equal(assessMassOrdoCompleteness({
  proper:projected.proper,contract,date,form:"SOLEMN",
  celebrationId:spec.id,votiveBasis:spec.basis
 }).reason,"MASS_SELECTION_CONTRACT_MISMATCH");
 for(const missing of [
  {date:"2026-11-09"},
  {date,explicitInstituteSelection:false},
  {date,form:"MISSA_CANTATA_SIMPLE"}
 ]){
  const next=projectIcrspNovemberProPapaOrations({...input,...missing});
  assert.notEqual(next.status,"APPLIED","Out of scope appointment admitted");
 }
}
const unverified=assessMassOrdoCompleteness({
 proper:base("Tempora/Pent24-0"),date:"2026-11-08",form:"LOW",
 celebrationId:"mass_of_day"
});
assert.equal(unverified.status,"UNASSESSED",
 "An unreviewed Mass must not receive a fabricated certification");
assert.equal(icrspNovemberOrdoMassContract("2026-11-08"),null);
const selectedDate={value:"2026-11-07"};
const win={AO_RUNTIME_V8:{store:{getState:()=>({
 selectedDate:selectedDate.value
})}},AO_CELEBRATION_ARCH_V1:{
 actualCelebration:null,votiveBasis:null,resolvedProper:base("Votive/08-22r"),
 readiness:{loading:false}
},AO_CELEBRATION_CATALOGUE:{
 immaculate_heart:{type:"votive",path:"Votive/08-22r"},
 sacred_heart:{type:"votive",path:"Votive/Pent02-5"}
},AO_CELEBRATION_API:{
 select(id){win.AO_CELEBRATION_ARCH_V1.actualCelebration={id}},
 setVotiveBasis(basis){win.AO_CELEBRATION_ARCH_V1.votiveBasis=basis;
  return {votiveClass:3,gloria:true,credo:false,status:"permitted"}}
},AO_R17_BROWSER_ENTRY:{selectTodayOption:(key,v)=>key==="form"&&v==="LOW"}};
assert.equal(isExplicitIcrspNovemberLowMassSelection({
 win,dateIso:selectedDate.value
}),false,"Catalogue selection must not impersonate institute's one-tap appointment");
const chosen=selectIcrspFirstSaturdayLowMass({win,dateIso:selectedDate.value});
assert.equal(chosen.ok,true,JSON.stringify(chosen));
assert.equal(chosen.path,"Votive/08-22r");
assert.equal(isExplicitIcrspNovemberLowMassSelection({
 win,dateIso:selectedDate.value
}),true);
selectedDate.value="2026-11-08";
assert.equal(isExplicitIcrspNovemberLowMassSelection({
 win,dateIso:"2026-11-07"
}),false,"Outdated selection must not survive a calendar date change");
console.log("PASS: two dated ICRSP contracts; all six trilingual oration groups; regression mutations rejected; 7 November exact source chosen; unreviewed dates not certified");
