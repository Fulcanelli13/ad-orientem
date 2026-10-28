import assert from "node:assert/strict";
import {ALL_SOULS_1962_FORMULARIES,is1962AllSoulsCalendarMass,
  allSouls1962RequiemOverlay} from "../src/mass/1962-all-souls-source.js";
import {deriveHostOptions} from "../src/mass/browser-entry.js";
import {isExplicitRequiemMass} from "../src/mass/reader-requiem-conditions.js";

assert.deepEqual(ALL_SOULS_1962_FORMULARIES,
 ["Sancti/11-02m1","Sancti/11-02m2","Sancti/11-02m3"]);
const proper=Object.freeze({status:"ready",data:Object.freeze({
 sourcePath:"Sancti/11-02m1",preface:{lat:"Præfatio Defunctorum"}})});
const mass=Object.freeze({
 date:"2026-11-02",requestedCelebrationId:"mass_of_day",
 celebrationId:"mass_of_day",celebrationType:"calendar",
 calendarDay:{id:"sancti:11-02m1:1:b"},proper,
});
assert.equal(is1962AllSoulsCalendarMass(mass),true);
const wrapped=Object.freeze({...mass,
  proper:undefined,properSource:"Sancti/11-02m1",
  calendarDay:{title:"Commemoration of All Souls",
    raw:{main:{id:"sancti:11-02m1:1:b"}}}});
assert.equal(is1962AllSoulsCalendarMass(wrapped),true,
 "The host Calendar wrapper is a source-authoritative owner");
assert.deepEqual(deriveHostOptions({resolvedMass:wrapped}).overlays,["REQUIEM"],
 "The actual preflight without .proper still activates the Requiem rite");
assert.deepEqual(deriveHostOptions({resolvedMass:wrapped,
  runtimeState:{resolution:{date:"2026-11-02",proper}}}).overlays,["REQUIEM"]);
assert.deepEqual(deriveHostOptions({resolvedMass:wrapped,
  assemblyStatus:{proper:{data:{sourcePath:"Tempora/Pent23-0"}}}}).overlays,[],
 "An explicit conflicting Proper blocks Requiem even with a valid host source path");
const options=deriveHostOptions({resolvedMass:mass});
assert.deepEqual(options.overlays,["REQUIEM"]);
assert.equal(isExplicitRequiemMass({session:{resolvedMass:{overlays:options.overlays}}}),true);
for(const [name,changed] of [
 ["ordinary day",{date:"2026-10-27"}],
 ["another feast",{calendarDay:{id:"sancti:11-01:1:w"}}],
 ["unverified source",{proper:{data:{sourcePath:"Commune/C9"}}}],
 ["first Mass source mislabeled",{proper:{data:{sourcePath:"Sancti/11-02m2"}}}],
 ["different year disputed",{date:"2026-11-03"}],
 ["explicit Nuptial",{requestedCelebrationId:"nuptial",celebrationId:"nuptial",celebrationType:"nuptial"}],
 ["explicit votive",{requestedCelebrationId:"holy_rosary",celebrationId:"holy_rosary",celebrationType:"votive"}],
 ["generic Requiem",{requestedCelebrationId:"requiem",celebrationId:"requiem",celebrationType:"requiem"}],
 ]){
 const candidate={...mass,...changed};
 assert.equal(is1962AllSoulsCalendarMass(candidate),false,name);
 assert.deepEqual(allSouls1962RequiemOverlay(candidate),[],name);
 assert.deepEqual(deriveHostOptions({resolvedMass:candidate}).overlays,[],name);
}
assert.equal(is1962AllSoulsCalendarMass({...mass,date:"2027-11-02"}),true,
 "Exact 1962 source identity, not the Gregorian year, owns the Requiem conditions");
assert.deepEqual(deriveHostOptions({resolvedMass:mass,
 assemblyStatus:{proper:{data:{sourcePath:"Tempora/Pent23-0"}}}}).overlays,[],
 "Contradictory selected Proper must not inherit the calendar Requiem overlay");

for(const number of [1,2,3]){
 const selected={...mass,calendarDay:{id:"sancti:11-02m"+number+":1:b"},
   proper:{status:"ready",data:{sourcePath:"Sancti/11-02m"+number}}};
 assert.equal(is1962AllSoulsCalendarMass(selected),true,
   "Authenticated All Souls Mass "+number+" must survive Home-to-Folio handoff");
 assert.deepEqual(deriveHostOptions({resolvedMass:selected}).overlays,["REQUIEM"]);
 for(const wrong of [1,2,3].filter(other=>other!==number)){
  assert.equal(is1962AllSoulsCalendarMass({...selected,
    proper:{data:{sourcePath:"Sancti/11-02m"+wrong}}}),false,
    "Wrong Mass "+wrong+" donor was accepted for Mass "+number);
 }
}
console.log("All Souls calendar Requiem overlay source-owner gate: PASS");
