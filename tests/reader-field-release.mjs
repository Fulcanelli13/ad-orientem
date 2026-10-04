import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {makeResolvedMass,compileMassPlan} from "../src/mass/session-engine.js";
import {projectSpecialStructure} from "../src/mass/reader-special-structure.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const gate=load("../data/presentation/reader-release-gate.v1.json");
const registry=load("../data/mass/rite-overlay-registry.v1.json");
const extension=load("../data/mass/special-days-extension.v1.3.json");
const core=load("../data/mass/special-days-core.v1.1.json");
const sources={registry,extension,core};

assert.equal(gate.fieldRelease?.status,"READY");
assert.equal(gate.fieldRelease?.target,"2026-10-04_ORDINARY_OR_VOTIVE_MASS");
assert.equal(gate.fieldRelease?.readerUiPolicy,"NATIVE_PREVIEW_OVER_LEGACY_ROLLBACK");
assert.equal(gate.openBlockers.length,0,
  "full-year special-structure certification still reports a release blocker");
assert.equal(gate.productionDefault,"LEGACY",
  "full-year structure certification silently widened deployment scope");

const proper={status:"READY",data:{
  sourcePath:"Sancti/10-07",
  introit:{lat:"Gaudeamus",en:"Let us rejoice"},
  collects:[{lat:"Deus, cujus Unigenitus",en:"O God"}],
  epistle:{lat:"Ab initio",en:"From the beginning"},
  gradual:{lat:"Propter veritatem",en:"Because of truth"},
  sequence:{lat:"",en:""},
  gospel:{lat:"In illo tempore",en:"At that time"},
  offertory:{lat:"In me gratia",en:"In me is all grace"},
  secrets:[{lat:"Fac nos",en:"Make us"}],
  preface:{lat:"Vere dignum",en:"It is truly meet"},
  communion:{lat:"Florete flores",en:"Blossom, flowers"},
  postcommunions:[{lat:"Sanctissimae Genetricis",en:"By the prayers"}],
}};

function prepared(extra={}){
  const resolvedMass=makeResolvedMass({
    date:"2026-10-04",
    form:"MISSA_CANTATA_INCENSE",
    presentationMode:"LIVE",
    calendarCelebration:{id:"TEMP.XIX",type:"CALENDAR",title:"Sunday"},
    requestedCelebration:{id:"holy_rosary",type:"VOTIVE",title:"Most Holy Rosary"},
    proper,
    overlays:["VOTIVE_PROPER"],
    ...extra,
  });
  return {session:{resolvedMass,plan:compileMassPlan(resolvedMass)}};
}

let p=prepared();
let projection=projectSpecialStructure(p,sources);
assert.equal(projection.releaseSupport,true);
assert.equal(projection.readerPayloadComplete,true);
assert.equal(projection.blockingSpecialSegmentCount,0);

p=prepared({precedingRites:["ASPERGES"]});
projection=projectSpecialStructure(p,sources);
assert.equal(projection.releaseSupport,true);
assert.equal(projection.segments[0].id,"ASPERGES");
assert.equal(projection.segments[0].readerPayload,"NATIVE_READER_PAYLOAD");
assert.equal(projection.segments[1].id,"ORDINARY_MASS");

for(const form of gate.fieldRelease.supportedForms){
  p=prepared({form});
  projection=projectSpecialStructure(p,sources);
  assert.equal(projection.releaseSupport,true,form+" fell outside field-release structure");
}

p=prepared({followingActions:["GENERIC_PROCESSION"]});
projection=projectSpecialStructure(p,sources);
assert.equal(projection.releaseSupport,true,"Generic Procession lost certified modular special-structure support");
assert.ok(!gate.fieldRelease.supportedFollowingActions.includes("GENERIC_PROCESSION"),
  "Oct-4 field-release scope silently widened to Generic Procession");
assert.ok(gate.fieldRelease.requiredConditions.includes("no Generic Procession following action"),
  "Oct-4 field-release guard for Generic Procession disappeared");

const nuptial=makeResolvedMass({
  date:"2026-10-04",form:"SOLEMN",presentationMode:"LIVE",
  calendarCelebration:{id:"TEMP.XIX",type:"CALENDAR"},
  requestedCelebration:{id:"nuptial",type:"NUPTIAL",title:"Nuptial Mass"},
  proper,
  overlays:["NUPTIAL"],
});
projection=projectSpecialStructure({session:{resolvedMass:nuptial,plan:compileMassPlan(nuptial)}},sources);
assert.equal(projection.releaseSupport,true,"Nuptial source insertions lost certified modular support");

const emberProper=structuredClone(proper);
emberProper.data.resolver2={};
const ember=makeResolvedMass({
  date:"2026-10-04",form:"MISSA_CANTATA_INCENSE",presentationMode:"LIVE",
  calendarCelebration:{id:"EMBER",type:"CALENDAR"},
  proper:emberProper,
  overlays:["EMBER_LESSONS"],
});
projection=projectSpecialStructure({session:{resolvedMass:ember,plan:compileMassPlan(ember)}},sources);
assert.equal(projection.releaseSupport,true,"Ember source-order insertion lost certified modular support");
assert.ok(gate.fieldRelease.requiredConditions.includes("no Ember-lessons insertion"),
  "Oct-4 field-release scope silently widened to Ember lessons");

console.log("Oct 4 field release: PASS — full-year special structures are certified while the pilot scope and LEGACY production feature gate remain intentionally narrow.");
