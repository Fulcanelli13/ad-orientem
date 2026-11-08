import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {icrspFranceOrdoForDate,renderIcrspFranceHomeOrdo}
 from "../src/calendar/icrsp-france-ordo-evidence.js";
import {ICRSP_FRANCE_INTAKE_WINDOW,icrspFranceOrdoIntakeStatus}
 from "../src/calendar/icrsp-france-ordo-intake-status.js";
import {assessIndependentOrdoSourceClaim}
 from "../src/mass/independent-ordo-source-gate.js";
import {h4HomeView} from "../src/home/today-h4-view.js";
import {projectIcrspNovemberProPapaOrations}
 from "../src/mass/icrsp-nov06-pro-papa-orations.js";
import {projectIcrspNov08SundayProPapaOrations}
 from "../src/mass/icrsp-nov08-sunday-pro-papa.js";

// INDEPENDENT ORACLE: research JSON comes from the published dated Ordo,
// not from any reader/source projection. These compact invariants are
// transcribed separately from the Ordo, so changes to the app cannot
// automatically change the expected counts or permissions.
const ledger=JSON.parse(readFileSync(
 "data/research/icrsp-france-ordo-2026-11-09-29-independent.v1.json","utf8"));
const tripleDays=[9,10,11,19,23,24,26];
const firstOrSecondClassDays=[9,15,22,29];
const expectedIncipits=new Map([
 [9,"Terribilis"],[10,"Os justi"],[11,"Statuit ei"],
 [15,"Dicit Dominus"],[22,"Dicit Dominus"],
 [23,"Dicit Dominus"],[24,"In medio"],
 [27,"Sunday Mass"],[28,"Salve Sancta Parens"],[29,"Ad Te levavi"]
]);
const dates=Array.from({length:21},(_,i)=>
 "2026-11-"+String(i+9).padStart(2,"0"));
assert.equal(ledger.schema,"ao-independent-institute-ordo-audit-v1");
assert.equal(ledger.sourceScope,"ICRSP_FRANCE_PARTICULAR_ORDO");
assert.equal(ledger.entries.length,21,"Intake must include 21 separate dated source records");
assert.deepEqual(ledger.entries.map(x=>x.date),dates);
assert.deepEqual([ledger.start,ledger.end],[dates[0],dates.at(-1)]);
assert.deepEqual([ICRSP_FRANCE_INTAKE_WINDOW.start,ICRSP_FRANCE_INTAKE_WINDOW.end],
 [ledger.start,ledger.end]);
const observedTriple=[];
for(const e of ledger.entries){
 const day=Number(e.date.slice(-2)),claims=e.sourceClaim;
 assert.equal(e.officialOrdoUrl,
  "https://icrspfrance.fr/ordo.php?d="+e.date+"#j"+e.date);
 assert.equal(e.independentRubricalReview.status,"PENDING_INDEPENDENT_AUTHORITY");
 assert.equal(e.independentRubricalReview.permissionOrPrivilegeEvidenceUrl,null);
 assert.equal(e.editorialState.publishedInstituteSelection,false,
  "A source-attested institute instruction must not be promoted before authorization");
 assert.deepEqual([
  claims.expectedCollectCount,claims.expectedSecretCount,
  claims.expectedPostcommunionCount
 ],[claims.sourceOrder.length,claims.sourceOrder.length,claims.sourceOrder.length],
 "Three oration groups must be independently accounted for");
 assert.equal(claims.sourceOrder[0],"PRINCIPAL");
 assert.equal(claims.sourceOrder.at(-1),"ORATIO_PRO_PAPA");
 if(claims.sourceOrder.length===3)observedTriple.push(day);
 assert.equal(claims.sourceOrder.length,tripleDays.includes(day)?3:2,
  "Official Ordo records an extra Mass commemoration on this exact date: "+e.date);
 assert.ok(e.liturgicalDay&&e.listedMassIncipit&&e.listedPreface);
 if(expectedIncipits.has(day))
  assert.equal(e.listedMassIncipit,expectedIncipits.get(day));
 if(firstOrSecondClassDays.includes(day)){
  assert.ok(e.listedMassClass<=2);
  assert.ok(e.independentRubricalReview.rubricFlags.some(f=>f.startsWith("RGMR_434_")),
   "Source-attested extra oration conflicts with class-specific 1960 limits: "+e.date);
 }
 const intake=icrspFranceOrdoIntakeStatus(e.date);
 assert.equal(intake?.status,"SOURCE_ATTESTED_READER_NOT_CERTIFIED");
 assert.equal(intake?.instituteMassSelectionAllowed,false);
 assert.equal(intake?.mayCertifyReader,false);
 assert.equal(icrspFranceOrdoForDate(e.date),null,
  "No original ICRSP Mass contract has been checked for this day");
 for(const lng of ["en","fr"]){
  const ui=renderIcrspFranceHomeOrdo(e.date,lng);
  assert.match(ui,/data-home-icrsp-intake-hold/);
  assert.match(ui,/data-mass-source-status="UNVERIFIED"/);
  assert.ok(ui.includes(e.officialOrdoUrl));
  assert.doesNotMatch(ui,/data-home-icrsp-(sunday|votive)=/,
   "An intake-only Ordo must not offer a falsely certified institute Mass");
  assert.match(ui,lng==="en"?/not yet verified/:/non encore vérifiée/);
 }
 const unsourced=assessIndependentOrdoSourceClaim({
  expectation:e,communityId:"ICRSP_FRANCE_PARTICULAR_ORDO",date:e.date,
  form:"LOW",proper:null
 });
 assert.equal(unsourced.status,"HOLD");
 assert.equal(unsourced.reason,"LOCAL_INSTITUTE_MASS_NOT_ASSEMBLED");
 assert.equal(unsourced.expectedOrations,claims.sourceOrder.length);
 assert.equal(unsourced.mayPublishAsVerified,false);
 const general={data:{sourcePath:"Tempora/Epi5-0",
  collects:[{lat:"general",en:"general",fr:"général"}],
  secrets:[{lat:"general",en:"general",fr:"général"}],
  postcommunions:[{lat:"general",en:"general",fr:"général"}]}};
 const deficient=assessIndependentOrdoSourceClaim({
  expectation:e,communityId:"ICRSP_FRANCE_PARTICULAR_ORDO",date:e.date,
  form:"LOW",proper:general
 });
 assert.equal(deficient.status,"HOLD");
 assert.equal(deficient.reason,"SOURCE_VS_READER_COUNT_collects",
  "A passed universal Mass test may not certify the institute's missing extra prayers");
 assert.equal(assessIndependentOrdoSourceClaim({
  expectation:e,communityId:"GENERAL_ROMAN_1962",date:e.date,
  form:"LOW",proper:general
 }).status,"OUT_OF_SCOPE","Do not globalize ICRSP France's prayer instructions");
 assert.notEqual(projectIcrspNovemberProPapaOrations({
  proper:general,date:e.date,form:"LOW",explicitInstituteSelection:true,
  actualCelebrationId:"mass_of_day",votiveBasis:"ordinary"
 }).status,"APPLIED","Historic 6–7 Nov projector must not extend to unreviewed dates");
 assert.notEqual(projectIcrspNov08SundayProPapaOrations({
  proper:general,date:e.date,form:"LOW",explicitInstituteSelection:true,
  actualCelebrationId:"mass_of_day",votiveBasis:"ordinary"
 }).status,"APPLIED","8 Nov projector must not spill into future Sundays");
}
assert.deepEqual(observedTriple,tripleDays);
assert.deepEqual(ledger.entries.filter(x=>x.listedMassClass<=2)
 .map(x=>Number(x.date.slice(-2))),firstOrSecondClassDays);
const stub=(id)=>({lat:"Sample Latin for source-check testing only",
 en:"Sample English for source-check testing only",
 fr:"Texte français de contrôle uniquement",
 sourcePath:"SOURCE_ONLY_DO_NOT_PUBLISH",
 liturgicalPurpose:id,
 ordoOrationId:id});
for(const day of [9,10,15,23,29]){
 const e=ledger.entries.find(x=>x.date.endsWith("-"+day)),order=e.sourceClaim.sourceOrder;
 const proper=Object.fromEntries(["collects","secrets","postcommunions"].map(k=>
  [k,order.map(id=>stub(id))]));
 const completeButUnauthorized=assessIndependentOrdoSourceClaim({
  expectation:e,communityId:"ICRSP_FRANCE_PARTICULAR_ORDO",
  date:e.date,form:"LOW",proper
 });
 assert.deepEqual([completeButUnauthorized.status,completeButUnauthorized.reason],
  ["HOLD","RUBRICAL_AUTHORITY_NOT_YET_VERIFIED"],
  "Even perfectly displayed text must not certify absent privilege/permission evidence");
 const wrong={...proper,postcommunions:proper.postcommunions.map((x,i)=>
  i===order.length-1?stub("OTHER_ORATION"):x)};
 assert.match(assessIndependentOrdoSourceClaim({
  expectation:e,communityId:"ICRSP_FRANCE_PARTICULAR_ORDO",
  date:e.date,form:"LOW",proper:wrong
 }).reason,/SOURCE_VS_READER_ORDER_postcommunions/,
 "A missing/replaced papal Postcommunion must fail the independent gate");
 assert.equal(assessIndependentOrdoSourceClaim({
  expectation:e,communityId:"ICRSP_FRANCE_PARTICULAR_ORDO",
  date:"2026-12-01",form:"LOW",proper
 }).reason,"SOURCE_DATE_MISMATCH");
}
const vm={dateIso:"2026-11-09",language:"en",formularies:[],week:[],
 weekday:"Monday",dateTitle:"Monday 9 November 2026",
 observedTitle:"Lateran Dedication",rank:"II class",colour:"White",isToday:false,
 massIntroit:"Terribilis",resolvedForSelection:true,properStatus:"ready",
 massFormularyName:null,contextualObservanceName:null,loading:false};
const model={upcoming:[],spotlight:null,feature:null,monthlyObservances:[]};
const page=h4HomeView(vm,model);
assert.equal((page.match(/data-home-icrsp-intake-hold="2026-11-09"/g)||[]).length,2,
 "The warning must appear on both Home and Mass door");
assert.match(page,/Begin general-calendar Mass/,
 "General calendar must not masquerade as the independently unverified Institute Mass");
assert.doesNotMatch(page,/data-home-icrsp-(sunday|votive)=/);
assert.equal(renderIcrspFranceHomeOrdo("2026-11-30"),"",
 "The source audit must not invent future unreviewed days");
assert.equal(icrspFranceOrdoIntakeStatus("2026-11-08"),null,
 "Preserve the previously verified 8 Nov source record");
assert.ok(renderIcrspFranceHomeOrdo("2026-11-08").includes(
 'data-home-icrsp-sunday="SUNDAY"'));
console.log("PASS ICRSP France independent 21-date source ledger: 21 papal prayers, "+
 "7 extra commemorations, 4 class-I/II rubrical review holds; "+
 "3 trilingual oration groups and generated Home/Door warnings; "+
 "source-to-reader missing/changed/extra/source-date negatives block certification.");
