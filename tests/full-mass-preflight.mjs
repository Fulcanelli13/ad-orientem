import assert from "node:assert/strict";
import {FULL_MASS_FORM_OPTIONS,massCelebrationKind,resolvedMassSummary} from "../src/mass/full-mass-preflight.js";
import {adaptV346ResolvedMass} from "../src/mass/host-adapter.js";
import {compileMassPlan} from "../src/mass/session-engine.js";

assert.deepEqual(FULL_MASS_FORM_OPTIONS.map(x=>x.id),[
  "LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"
]);
const proper={status:"READY",data:{
  sourcePath:"Sancti/10-07",
  introit:{lat:"Gaudeamus",en:"Let us rejoice",fr:"Réjouissons-nous"},
  collects:[{lat:"Deus",en:"O God",fr:"Dieu"}],
  epistle:{lat:"Ab initio",en:"From the beginning",fr:"Au commencement"},
  gradual:{lat:"Propter",en:"For",fr:"Pour"},
  sequence:{lat:"",en:"",fr:""},
  gospel:{lat:"In illo",en:"In that time",fr:"En ce temps-là"},
  offertory:{lat:"In me",en:"In me",fr:"En moi"},
  secrets:[{lat:"Fac nos",en:"Make us",fr:"Faites-nous"}],
  preface:{lat:"Vere",en:"Truly",fr:"Vraiment"},
  communion:{lat:"Florete",en:"Blossom",fr:"Fleurissez"},
  postcommunions:[{lat:"Sanctissimae",en:"By the prayers",fr:"Par les prières"}]
}};
const day={canStart:true,date:"2026-10-04",
 calendarDay:{id:"TEMP.XIX",title:"Nineteenth Sunday after Pentecost"},
 celebrationId:"mass_of_day",requestedCelebrationId:"mass_of_day",
 celebrationType:"CALENDAR",proper,properSource:"Sancti/10-07"};
const votive={...day,celebrationId:"holy_rosary",requestedCelebrationId:"holy_rosary",celebrationType:"VOTIVE"};
const req={...day,celebrationId:"requiem",requestedCelebrationId:"requiem",celebrationType:"REQUIEM"};
const nuptial={...day,celebrationId:"nuptial",requestedCelebrationId:"nuptial",celebrationType:"NUPTIAL"};
for(const [legacy,kind] of [[day,"CALENDAR"],[votive,"VOTIVE"],[req,"REQUIEM"],[nuptial,"NUPTIAL"]]){
 assert.equal(massCelebrationKind(legacy),kind);
 for(const {id} of FULL_MASS_FORM_OPTIONS){
  const info=resolvedMassSummary(legacy,{form:id,language:"fr"});
  assert.equal(info.kind,kind);
  assert.equal(info.form,id);
  assert.equal(info.canStart,true);
  assert.equal(info.sourceOwnedByHost,true);
  const resolved=adaptV346ResolvedMass(legacy,{celebrationForm:info.form,proper});
  assert.equal(resolved.form,id);
  assert.equal(resolved.actualCelebration.id,kind==="CALENDAR"?"TEMP.XIX":legacy.celebrationId);
  assert.equal(resolved.proper.data.introit.lat,proper.data.introit.lat);
  assert.equal(resolved.proper.data.introit.fr,proper.data.introit.fr);
  const plan=compileMassPlan(resolved);
  assert.equal(plan.form,id);
  if(kind==="REQUIEM")assert.ok(resolved.overlays.includes("REQUIEM"));
  if(kind==="VOTIVE")assert.ok(resolved.overlays.includes("VOTIVE_PROPER"));
  if(kind==="NUPTIAL")assert.ok(resolved.overlays.includes("NUPTIAL"));
 }
}
const goodFriday={...day,exceptionalProfile:"good-friday-1962",celebrationType:"CALENDAR"};
assert.equal(massCelebrationKind(goodFriday),"GOOD_FRIDAY");
assert.equal(resolvedMassSummary(goodFriday,{form:"low"}).formChangeAllowed,false);
assert.equal(massCelebrationKind({...day,exceptionalProfile:"easter-vigil-1962"}),"EASTER_VIGIL");
assert.equal(resolvedMassSummary({...req,canStart:false},{form:"solemn"}).canStart,false);
assert.throws(()=>resolvedMassSummary(day,{form:"NOT_A_MASS_FORM"}),/Unsupported Mass form/);
assert.throws(()=>adaptV346ResolvedMass({...req,proper:null},{celebrationForm:"LOW"}),/source-resolved Proper/);
console.log("Full Mass composer: PASS — 4 forms × calendar/votive/Requiem/Nuptial; no Proper substitution, Good Friday not a Mass.");
