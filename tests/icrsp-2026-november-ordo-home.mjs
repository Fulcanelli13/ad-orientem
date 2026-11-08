import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import { icrspFranceOrdoForDate, renderIcrspFranceHomeOrdo } from "../src/calendar/icrsp-france-ordo-evidence.js";
import { h4HomeView } from "../src/home/today-h4-view.js";

// Distinguish the general 1962 Calendar's ferial Office from the
// explicitly celebrated institute-specific votive Mass. Never change
// the canonical day or silently substitute the Sacred Heart Proper.
const day=icrspFranceOrdoForDate("2026-11-06");
assert.ok(day);
assert.equal(day.scope,"ICRSP_FRANCE_PARTICULAR_ORDO");
assert.equal(day.status,"SOURCE_ATTESTED");
assert.deepEqual([day.office.name.fr,day.office.class,day.office.colour],
 ["Férie",4,"GREEN"]);
assert.deepEqual([day.mass.introit,day.mass.class,day.mass.colour],["Cogitationes",3,"WHITE"]);
assert.equal(day.mass.kind,"VOTIVE");
assert.equal(day.mass.gloria,true);
assert.equal(day.mass.credo,false);
assert.equal(day.mass.prayerForPope,true);
assert.equal(day.mass.preface.en,"Sacred Heart");
assert.equal(day.mass.epistle,"Ephesians 3:8–19");
assert.equal(day.mass.gospel,"John 19:31–37");
assert.deepEqual(day.observances,["FIRST_FRIDAY","FRIDAY_ABSTINENCE"]);
assert.match(day.sourceOrdo,/icrspfrance\.fr\/ordo\.php\?d=2026-11-06#j2026-11-06/);
assert.match(day.sourceTexts,/textes-de-la-messe\.php\?d=2026-11-06/);
const saturday=icrspFranceOrdoForDate("2026-11-07");
assert.deepEqual([saturday.office.class,saturday.office.colour],[4,"WHITE"]);
assert.deepEqual([saturday.mass.introit,saturday.mass.colour,saturday.mass.class],["Adeamus","WHITE",3]);
assert.equal(saturday.mass.title.en,"Votive Mass of the Immaculate Heart of Mary");
assert.deepEqual(saturday.observances,["FIRST_SATURDAY"]);
for(const unreviewed of ["2026-11-05","2026-11-09","2026-12-04","2027-11-05","",null])
 assert.equal(icrspFranceOrdoForDate(unreviewed),null,
  "No uncited mass appointment or cross-year assumption for "+unreviewed);
const snippet=renderIcrspFranceHomeOrdo("2026-11-06","en");
assert.match(snippet,/Mass celebrated in the Institute/);
assert.match(snippet,/Sacred Heart/);
assert.match(snippet,/Cogitationes/);
assert.match(snippet,/Ephesians 3:8–19/);
assert.match(snippet,/John 19:31–37/);
assert.match(snippet,/Class 4/);
assert.match(snippet,/Class 3/);
assert.match(snippet,/No Credo/);
assert.match(snippet,/Friday abstinence/);
assert.match(snippet,/data-home-icrsp-votive="VOTIVE"/);
assert.doesNotMatch(snippet,/data-home-h4-begin/);
assert.match(renderIcrspFranceHomeOrdo("2026-11-06","fr"),/Messe votive du Sacré-Cœur de Jésus/);
assert.match(renderIcrspFranceHomeOrdo("2026-11-07","fr"),/Cœur Immaculé de Marie/);
assert.match(renderIcrspFranceHomeOrdo("2026-11-07","en"),/Use Immaculate Heart votive · Low Mass/);
assert.match(renderIcrspFranceHomeOrdo("2026-11-07","en"),/Prayer for the Pope/);
const sunday=icrspFranceOrdoForDate("2026-11-08");
assert.deepEqual([sunday.mass.kind,sunday.mass.introit,sunday.mass.class],
 ["SUNDAY","Dicit Dominus",2]);
assert.equal(sunday.mass.prayerForPope,true);
assert.equal(sunday.mass.principalId,"tempora:Epi5-0:2:g");
assert.match(sunday.sourceOrdo,/icrspfrance\.fr\/ordo\.php\?d=2026-11-08/);
const sundayView=renderIcrspFranceHomeOrdo("2026-11-08","en");
assert.match(sundayView,/Prayer for the Pope/);
assert.match(sundayView,/Mass in green/);
assert.match(sundayView,/Credo/);
assert.match(sundayView,/data-home-icrsp-sunday="SUNDAY"/);
assert.match(renderIcrspFranceHomeOrdo("2026-11-08","fr"),/messe dominicale ICRSP/);

const vm={
 dateIso:"2026-11-06",language:"en",formularies:[],week:[],weekday:"Friday",
 dateTitle:"Friday 6 November 2026",observedTitle:"Feria",rank:"IV class",colour:"Green",
 isToday:true,massIntroit:"Si iniquitates",resolvedForSelection:true,properStatus:"ready",
 massFormularyName:null,contextualObservanceName:"Friday after Pentecost",loading:false,
};
const model={upcoming:[],spotlight:null,feature:null,monthlyObservances:[]};
const output=h4HomeView(vm,model);
assert.equal((output.match(/data-home-icrsp-ordo="2026-11-06"/g)||[]).length,2,
 "ICRSP evidence must appear on both Home and inside the Mass door");
assert.match(output,/Begin general-calendar Mass/);
assert.match(output,/Si iniquitates/,"Existing universal Proper must not be silently swapped");
assert.match(output,/Cogitationes/,"Observed institute Mass must be visible at first entry");
assert.match(h4HomeView({...vm,dateIso:"2026-11-08"},model),/data-home-icrsp-sunday="SUNDAY"/);
const handler=readFileSync("src/home/browser-entry.js","utf8");
assert.match(handler,/data-home-icrsp-votive/);
assert.match(handler,/state\(win\)\?\.selectedDate/);
assert.match(handler,/\["2026-11-06","2026-11-07"\]/);
assert.match(handler,/navigateHomeShortcut\("mass"/);
assert.match(handler,/selectIcrspNovemberLowMass/);
assert.match(handler,/dateIso:officialDate/);
assert.match(handler,/ICRSP selected Mass could not be certified/);
console.log("PASS: 2026-11-06 ICRSP feria vs Cogitationes actual votive, 2026-11-07 Adeamus, bilingual Home and exact host handoff.");
