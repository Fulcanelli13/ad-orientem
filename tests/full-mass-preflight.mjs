import assert from "node:assert/strict";
import {FULL_MASS_FORM_OPTIONS,massCelebrationKind,resolvedMassSummary} from "../src/mass/full-mass-preflight.js";
import {adaptV346ResolvedMass} from "../src/mass/host-adapter.js";
import {compileMassPlan,makeResolvedMass} from "../src/mass/session-engine.js";
import {availableOptionalMassRites,composeOptionalMassRites} from "../src/mass/full-mass-optional-rites.js";
import {specialMassPresentation} from "../src/mass/full-mass-special-presentation.js";


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

// Optional rites are explicit factual participation choices; dates cannot select them.
const available=(legacy,form,kind)=>availableOptionalMassRites(legacy,{form,kind}).filter(r=>r.allowed).map(r=>r.id);
assert.deepEqual(available(day,"MISSA_CANTATA_INCENSE","CALENDAR"),["ASPERGES"]);
assert.deepEqual(available(day,"LOW","CALENDAR"),[]);
assert.deepEqual(available(req,"SOLEMN","REQUIEM"),["ASPERGES","REQUIEM_ABSOLUTION"]);
assert.deepEqual(available({...day,calendarDay:{id:"CORPUS_CHRISTI",title:"Corpus Christi"}},"SOLEMN","CALENDAR"),
 ["ASPERGES","CORPUS_CHRISTI_PROCESSION"]);
assert.deepEqual(available(goodFriday,"SOLEMN","GOOD_FRIDAY"),[]);
const baseline={precedingRites:[],followingActions:[]};
let rites=composeOptionalMassRites(day,{form:"SOLEMN",kind:"CALENDAR"},baseline);
assert.deepEqual(rites,{precedingRites:[],followingActions:[]},"Sunday does not automatically enable Asperges");
rites=composeOptionalMassRites(day,{form:"SOLEMN",kind:"CALENDAR",overrides:{ASPERGES:true}},baseline);
assert.deepEqual(rites.precedingRites,["ASPERGES"]);
let resolved=adaptV346ResolvedMass(day,{form:"SOLEMN",proper,...rites});
assert.deepEqual(resolved.precedingRites,["ASPERGES"]);
assert.ok(compileMassPlan(resolved).precedingGraphs.includes("ASPERGES"));
rites=composeOptionalMassRites(req,{form:"LOW",kind:"REQUIEM",overrides:{REQUIEM_ABSOLUTION:true}},baseline);
resolved=adaptV346ResolvedMass(req,{form:"LOW",proper,...rites});
assert.ok(compileMassPlan(resolved).followingGraphs.includes("REQUIEM_ABSOLUTION"));
const corpus={...day,calendarDay:{id:"CORPUS_CHRISTI",title:"Corpus Christi"}};
rites=composeOptionalMassRites(corpus,{form:"SOLEMN",kind:"CALENDAR",
 overrides:{CORPUS_CHRISTI_PROCESSION:true}},baseline);
resolved=adaptV346ResolvedMass(corpus,{form:"SOLEMN",proper,...rites});
const corpusPlan=compileMassPlan(resolved);
assert.ok(corpusPlan.followingGraphs.includes("CORPUS_CHRISTI_PROCESSION"));
assert.equal(corpusPlan.dismissal,"BENEDICAMUS_DOMINO");
assert.throws(()=>composeOptionalMassRites(day,{form:"SOLEMN",kind:"CALENDAR",
 overrides:{CORPUS_CHRISTI_PROCESSION:true}},baseline),/NOT_APPLICABLE/);
assert.throws(()=>composeOptionalMassRites(day,{form:"LOW",kind:"CALENDAR",
 overrides:{ASPERGES:true}},baseline),/NOT_APPLICABLE/);
assert.throws(()=>composeOptionalMassRites(day,{form:"SOLEMN",kind:"CALENDAR",
 overrides:{OTHER_RITE:true}},baseline),/NOT_RECOGNIZED/);
const fromHost={...req,insertedRites:["Requiem absolution"]};
const overrides=composeOptionalMassRites(fromHost,{
 form:"SOLEMN",kind:"REQUIEM",overrides:{REQUIEM_ABSOLUTION:false},
},{precedingRites:[],followingActions:["REQUIEM_ABSOLUTION"]});
assert.deepEqual(overrides.followingActions,[],"Explicit absence should suppress source-proposed optional ceremony");

// Special Mass UI is projected only from actual celebration and its selected rites.
const context=(legacy,args={})=>specialMassPresentation(legacy,args);
let ui=context(req,{language:"en",kind:"REQUIEM"});
assert.equal(ui.variant,"REQUIEM");
assert.equal(ui.phases.some(p=>p.id==="req"),true);
assert.equal(ui.phases.some(p=>p.id==="absolution"),false,"Requiem date cannot invent Absolution");
ui=context(req,{kind:"REQUIEM",selectedRites:{followingActions:["REQUIEM_ABSOLUTION"]}});
assert.equal(ui.phases.at(-1).id,"absolution");
ui=context({...req,requiemClass:1},{kind:"REQUIEM",language:"fr"});
assert.match(ui.notes.join(" "),/Classe du Requiem : I/);
ui=context(nuptial,{kind:"NUPTIAL",language:"en"});
assert.deepEqual(ui.phases.map(p=>p.id),["nuptial-mass","nuptial-pater","nuptial-final"]);
assert.match(ui.intro,/appointed places/);
ui=context(votive,{kind:"VOTIVE",language:"fr"});
assert.match(ui.heading,/votive/);
const palm={...day,insertedRites:["PALM_RITE"]};
assert.equal(context(day,{kind:"CALENDAR"}).distinct,false);
assert.deepEqual(context(palm,{kind:"CALENDAR"}).phases.map(p=>p.id),["palm","mass"]);
assert.deepEqual(context({...day,insertedRites:["ASHES"]},{kind:"CALENDAR"}).phases.map(p=>p.id),["ash","mass"]);
assert.deepEqual(context({...day,insertedRites:["CANDLEMAS"]},{kind:"CALENDAR"}).phases.map(p=>p.id),["candlemas","mass"]);
assert.deepEqual(context({...day,insertedRites:["ROGATION_PROCESSION"]},{kind:"CALENDAR"}).phases.map(p=>p.id),["rogations","mass"]);
assert.deepEqual(context({...day,insertedRites:["HOLY_THURSDAY_POST"]},{kind:"CALENDAR"}).phases.map(p=>p.id),["mass","holy-thursday"]);
assert.equal(context({...day,calendarDay:{title:"Corpus Christi"}},{kind:"CALENDAR"}).phases.some(p=>p.id==="corpus"),false);
assert.equal(context({...day,calendarDay:{title:"Corpus Christi"}},{
 kind:"CALENDAR",selectedRites:{followingActions:["CORPUS_CHRISTI_PROCESSION"]}}).phases.at(-1).id,"corpus");
ui=context(goodFriday,{kind:"GOOD_FRIDAY",language:"fr"});
assert.equal(ui.variant,"GOOD_FRIDAY");assert.equal(ui.phases.some(p=>p.id==="mass"),false);
assert.match(ui.intro,/Ce n’est pas la messe/);
ui=context({...day,exceptionalProfile:"easter-vigil-1962"},{kind:"EASTER_VIGIL"});
assert.deepEqual(ui.phases.map(p=>p.id),["ev-light","ev-lessons","ev-mass","ev-lauds"]);
const preparedRequiem={session:{resolvedMass:makeResolvedMass({
 date:"2026-10-04",form:"LOW",presentationMode:"LIVE",
 calendarCelebration:{id:"TEMP.XIX",type:"CALENDAR"},
 requestedCelebration:{id:"requiem",type:"REQUIEM"},proper,
 overlays:["REQUIEM"],followingActions:["REQUIEM_ABSOLUTION"],
}),plan:{followingGraphs:["REQUIEM_ABSOLUTION"]}}};
const live=context(preparedRequiem,{mode:"reader",language:"fr"});
assert.equal(live.variant,"REQUIEM");
assert.ok(live.phases.some(p=>p.id==="absolution"),"native reader hides source-selected Absolution");
assert.equal(live.sourceOwned,true);
console.log("Special Mass UI: PASS — Requiem, Nuptial, Votive, Triduum, Palm/Ash/Candlemas, Holy Thursday and explicit Corpus.");

console.log("Optional Mass rites: PASS — explicit-only Asperges/Absolution/Corpus; Good Friday, form, date, source gates.");

console.log("Full Mass composer: PASS — 4 forms × calendar/votive/Requiem/Nuptial; no Proper substitution, Good Friday not a Mass.");
