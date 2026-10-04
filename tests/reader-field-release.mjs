import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {makeResolvedMass,compileMassPlan} from "../src/mass/session-engine.js";
import {projectSpecialStructure} from "../src/mass/reader-special-structure.js";
import {
  HOLY_ROSARY_FIELD_DATE,
  installFieldCelebrationOverrides,
  isHolyRosaryExternalSolemnity,
  holyRosaryExternalSolemnityDecision,
  normalizeHolyRosaryResolvedMass,
} from "../src/mass/field-celebration-overrides.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const gate=load("../data/presentation/reader-release-gate.v1.json");
const registry=load("../data/mass/rite-overlay-registry.v1.json");
const extension=load("../data/mass/special-days-extension.v1.3.json");
const core=load("../data/mass/special-days-core.v1.1.json");
const sources={registry,extension,core};

const hostCatalogue={};
const fieldOverride=installFieldCelebrationOverrides(hostCatalogue);
assert.equal(fieldOverride.installed,true);
assert.deepEqual([...fieldOverride.added],["holy_rosary"]);
assert.equal(hostCatalogue.holy_rosary?.type,"votive");
assert.equal(hostCatalogue.holy_rosary?.group,"mary");
assert.equal(hostCatalogue.holy_rosary?.path,"Sancti/10-07");
assert.equal(hostCatalogue.holy_rosary?.title?.en,"Most Holy Rosary");
assert.equal(hostCatalogue.holy_rosary?.title?.fr,"Très Saint Rosaire");
assert.deepEqual([...installFieldCelebrationOverrides(hostCatalogue).added],[],
  "field override must not replace an existing host celebration");

assert.equal(HOLY_ROSARY_FIELD_DATE,"2026-10-04");
const rosaryArch={
  date:"2026-10-04",
  actualCelebration:{id:"holy_rosary",type:"votive"},
  celebrationForm:"sung",
};
assert.equal(isHolyRosaryExternalSolemnity(rosaryArch),true);
assert.equal(isHolyRosaryExternalSolemnity({...rosaryArch,date:"2026-10-05"}),false);
assert.equal(isHolyRosaryExternalSolemnity({
  ...rosaryArch,
  actualCelebration:{id:"mass_of_day",type:"calendar"},
}),false);

const rosaryDecision=holyRosaryExternalSolemnityDecision({form:"sung"});
assert.equal(rosaryDecision.status,"permitted");
assert.equal(rosaryDecision.code,"external-solemnity-holy-rosary");
assert.equal(rosaryDecision.votiveClass,2);
assert.equal(rosaryDecision.basis,"external_solemnity");
assert.equal(rosaryDecision.gloria,true);
assert.equal(rosaryDecision.credo,true);
assert.equal(rosaryDecision.tone,"solemn");
assert.deepEqual([...rosaryDecision.conditions],[]);
assert.ok(rosaryDecision.sources.includes("RG 358b"));

const normalizedRosary=normalizeHolyRosaryResolvedMass({
  requestedCelebrationId:"holy_rosary",
  celebrationId:"holy_rosary",
  celebrationType:"votive",
  properSource:"Sancti/10-07",
  votiveClass:2,
  conditions:["proxy permission condition"],
  canStart:true,
  sourceDiagnostics:{votiveBasis:"special_occasion"},
},rosaryArch);
assert.equal(normalizedRosary.votiveClass,2);
assert.equal(normalizedRosary.canStart,true);
assert.deepEqual([...normalizedRosary.conditions],[]);
assert.ok(normalizedRosary.rubricSources.includes("RG 358b"));
assert.equal(normalizedRosary.sourceDiagnostics.votiveBasis,"external_solemnity");
assert.equal(
  normalizedRosary.sourceDiagnostics.fieldBridge,
  "HOLY_ROSARY_EXTERNAL_SOLEMNITY_2026_10_04",
);


assert.equal(gate.fieldRelease?.status,"READY");
assert.equal(gate.fieldRelease?.target,"2026-10-04_ORDINARY_OR_VOTIVE_MASS");
assert.equal(gate.fieldRelease?.readerUiPolicy,"NATIVE_PREVIEW_OVER_LEGACY_ROLLBACK");
assert.ok(gate.openBlockers.some(x=>x.id==="SPECIAL_STRUCTURE_PARITY"),
  "field readiness accidentally cleared full-year special-structure blocker");

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
assert.equal(projection.releaseSupport,false,"Generic Procession was silently certified by field release");

const nuptial=makeResolvedMass({
  date:"2026-10-04",form:"SOLEMN",presentationMode:"LIVE",
  calendarCelebration:{id:"TEMP.XIX",type:"CALENDAR"},
  requestedCelebration:{id:"nuptial",type:"NUPTIAL",title:"Nuptial Mass"},
  proper,
  overlays:["NUPTIAL"],
});
projection=projectSpecialStructure({session:{resolvedMass:nuptial,plan:compileMassPlan(nuptial)}},sources);
assert.equal(projection.releaseSupport,false,"Nuptial insertion work silently disappeared");

const emberProper=structuredClone(proper);
emberProper.data.resolver2={};
const ember=makeResolvedMass({
  date:"2026-10-04",form:"MISSA_CANTATA_INCENSE",presentationMode:"LIVE",
  calendarCelebration:{id:"EMBER",type:"CALENDAR"},
  proper:emberProper,
  overlays:["EMBER_LESSONS"],
});
projection=projectSpecialStructure({session:{resolvedMass:ember,plan:compileMassPlan(ember)}},sources);
assert.equal(projection.releaseSupport,false,"Ember insertion work silently disappeared");

console.log("Oct 4 field release: PASS — ordinary/Votive and Asperges path certified; unresolved full-year insertions remain fail-closed.");
