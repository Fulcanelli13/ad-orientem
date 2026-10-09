import { readFileSync } from "node:fs";
import { properToReaderSlots,assertReaderProperReady } from "../src/mass/proper-reader-slots.js";
import { compileRogationReaderProper } from "../src/mass/rogation-reader-proper.js";
import { adaptV346ResolvedMass, prepareMassSessionFromV346 } from "../src/mass/host-adapter.js";

const expect=(x,m)=>{if(!x)throw new Error(m)};
const base={
  date:"2026-10-04",
  calendarDay:{id:"Tempora/Pent18-0",title:"Sunday"},
  requestedCelebrationId:"mass_of_day",
  celebrationId:"mass_of_day",
  celebrationType:"calendar",
  properSource:"Tempora/Pent18-0",
  canStart:true,
  insertedRites:[],
  conditions:[],
  rubricSources:["RG60"],
  sourceDiagnostics:{architectureVersion:"1"},
};
const proper={sourcePath:"Tempora/Pent18-0",introit:{lat:"x"}};

const ordinary=prepareMassSessionFromV346(base,{form:"sung",followMode:"vox",proper});
expect(ordinary.resolvedMass.form==="MISSA_CANTATA_INCENSE","legacy sung form mapping changed");
expect(ordinary.resolvedMass.presentationMode==="LIVE","legacy vox mode mapping changed");
expect(ordinary.resolvedMass.explicitlySelectedCelebration===false,"Mass of day became manual override");
expect(ordinary.plan.massEntry==="FOOT_CLUSTER","ordinary plan changed");

const conditioned=prepareMassSessionFromV346({
  ...base,
  conditions:["GLORIA_APPOINTED","CREDO_APPOINTED","AGNUS_DEI_PUBLIC","LAST_GOSPEL_PRESENT"],
},{form:"sung",followMode:"vox",proper});
expect(conditioned.resolvedMass.conditions===undefined,"legacy compatibility conditions leaked into canonical top-level state");
expect(
  conditioned.resolvedMass.provenance.conditions.join("|")==="GLORIA_APPOINTED|CREDO_APPOINTED|AGNUS_DEI_PUBLIC|LAST_GOSPEL_PRESENT",
  "host liturgical conditions were not preserved by canonical provenance"
);

const rosary=prepareMassSessionFromV346({
  ...base,
  requestedCelebrationId:"holy_rosary",
  celebrationId:"holy_rosary",
  celebrationType:"votive",
  properSource:"Sancti/10-07",
},{
  form:"mc-simple",
  presentationMode:"SIMPLE",
  proper:{sourcePath:"Sancti/10-07",introit:{lat:"Gaudeamus"}},
});
expect(rosary.resolvedMass.actualCelebration.id==="holy_rosary","manual celebration identity lost");
expect(rosary.resolvedMass.overlays.includes("VOTIVE_PROPER"),"Votive Proper overlay not inferred");
expect(rosary.resolvedMass.form==="MISSA_CANTATA_SIMPLE","MC simple mapping lost");

let missingProper=false;
try{
  adaptV346ResolvedMass({
    ...base,
    requestedCelebrationId:"st_therese",
    celebrationId:"st_therese",
    celebrationType:"votive",
  },{form:"low"});
}catch{missingProper=true}
expect(missingProper,"Votive session without Proper did not fail closed");

const req=prepareMassSessionFromV346({
  ...base,
  requestedCelebrationId:"requiem",
  celebrationId:"requiem",
  celebrationType:"requiem",
  properSource:"Votive/Requiem",
},{
  form:"solemn",
  proper:{sourcePath:"Votive/Requiem",isRequiem:true},
});
expect(req.resolvedMass.overlays.includes("REQUIEM"),"Requiem overlay not inferred");
expect(req.plan.blessingAllowed===false,"Requiem blessing survived");

const reqAbs=prepareMassSessionFromV346({
  ...base,
  requestedCelebrationId:"requiem",
  celebrationId:"requiem",
  celebrationType:"requiem",
  requiemAbsolution:{bodyPresent:true,burialProcession:true},
},{
  form:"solemn",
  proper:{isRequiem:true},
  followingActions:["REQUIEM_ABSOLUTION"],
});
expect(reqAbs.plan.normalLastGospel===false,"Absolution branch did not suppress Last Gospel");
expect(reqAbs.resolvedMass.provenance.requiemAbsolution.bodyPresent===true,"Requiem body-present context was dropped");
expect(reqAbs.resolvedMass.provenance.requiemAbsolution.burialProcession===true,"Requiem burial-procession context was dropped");

const nuptial=prepareMassSessionFromV346({
  ...base,
  requestedCelebrationId:"nuptial",
  celebrationId:"nuptial",
  celebrationType:"nuptial",
},{
  form:"low",
  proper:{sourcePath:"MATRIMONIUM_V16"},
});
expect(nuptial.resolvedMass.overlays.includes("NUPTIAL"),"Nuptial overlay not inferred");
expect(nuptial.plan.insertions.length===3,"Nuptial insertions not compiled");

const lowLifecycle=prepareMassSessionFromV346(base,{
  form:"low",
  proper,
  intentionRef:"INTENTION-REF-ONLY",
  lifecycle:{successiveMassPosition:"NONFINAL"},
});
expect(lowLifecycle.resolvedMass.provenance.intentionRef==="INTENTION-REF-ONLY","Mass completion intention reference was not bridged");
expect(lowLifecycle.plan.lifecycle.leonine.eligible===false,"explicit Low lifecycle exception was ignored");
expect(lowLifecycle.plan.lifecycle.leonine.reasons.includes("SUCCESSIVE_MASS_DEFER_TO_FINAL"),"successive-Mass Leonine deferral was lost");

const gf=prepareMassSessionFromV346({
  ...base,
  exceptionalProfile:"good-friday-1962",
},{
  form:"solemn",
  proper,
});
expect(gf.plan.kind==="DISTINCT_RITE" && gf.plan.canonicalMassGraphActive===false,"Good Friday profile did not become distinct rite");

const corpusDate=prepareMassSessionFromV346({
  ...base,
  celebrationId:"corpus_christi",
  requestedCelebrationId:"mass_of_day",
},{
  proper,
});
expect(corpusDate.plan.normalLastGospel===true && corpusDate.plan.blessingAllowed===true,"Corpus date alone activated procession");

const corpusAction=prepareMassSessionFromV346(base,{
  proper,
  followingActions:["CORPUS_CHRISTI_PROCESSION"],
});
expect(corpusAction.plan.normalLastGospel===false && corpusAction.plan.blessingAllowed===false,"Explicit Corpus procession ending lost");


const load=(p)=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const actualRogationGate=load("../data/mass/rogation-proper-source-gate.v1.json");
const actualRogationText=load("../data/mass/rogation-proper-trilingual.v1.json");
const rogationDate={...base,date:"2027-05-03",calendarRank:4};
const actualRogationPreface=load("../data/mass/rogation-easter-preface.v1.json");
const requestedRogation={
  choice:"ROGATION_MASS",observanceConfirmed:true,
  service:"PUBLIC_PROCESSION",dayClass:4,
  sourceGate:actualRogationGate,sourceProper:actualRogationText,
  preface:{
    ...actualRogationPreface.text,
    sourceRef:actualRogationPreface.source.edition,
    sourceUrl:actualRogationPreface.source.url
  }
};
const unpublishedGate=structuredClone(actualRogationGate);
unpublishedGate.publicationAllowed=false;
let unpublishedBlocked=false;
try{prepareMassSessionFromV346(rogationDate,{
  form:"sung",proper,rogationSelection:{
    ...requestedRogation,sourceGate:unpublishedGate
  }
})}catch(e){unpublishedBlocked=/ROGATION_SELECTION_PROPER_NOT_SOURCE_CERTIFIED/.test(String(e))}
expect(unpublishedBlocked,"An unpublished source gate must fail closed even with published texts");
const certifiedSelection=requestedRogation;
const approved=prepareMassSessionFromV346(rogationDate,{
  form:"sung",proper,rogationSelection:certifiedSelection
});
expect(approved.resolvedMass.actualCelebration.id==="rogation-mass-1962",
  "Certified II-class Rogation Proper identity was lost");
expect(approved.resolvedMass.provenance.votiveClass===2,
  "II-class conditional votive class not retained");
expect(approved.resolvedMass.provenance.colour==="violet",
  "Violet colour not retained");
expect(approved.resolvedMass.provenance.gloria===false &&
  approved.resolvedMass.provenance.credo===false,
  "Gloria or Credo wrongly inherited from date-only host");
expect(approved.plan.massEntry==="INTROIT" &&
  approved.plan.precedingGraphs.includes("ROGATIONS"),
  "Procession-to-Introit handoff missing");
expect(approved.resolvedMass.overlays.includes("VOTIVE_PROPER"),
  "Certified Rogation must activate one canonical Votive overlay");
for(const lang of ["en","fr"]){
  const mapped=assertReaderProperReady(properToReaderSlots(
    approved.resolvedMass.proper.data,{language:lang}
  ));
  expect(mapped.ready && !mapped.missing.length,
    "Trilingual Rogation Proper missing R17 reader slot "+lang);
  const antiphon=mapped.slots.INTROIT.data.paragraphs[0];
  expect(/Exaudivit/.test(antiphon.latin),"Wrong Rogation Introit");
}
const permittedDayAfterRogation=prepareMassSessionFromV346(
  {...rogationDate,calendarRank:1},{
  proper,rogationSelection:{
    choice:"DAY_MASS",observanceConfirmed:true,
    service:"PUBLIC_PROCESSION",dayClass:1
  }
});
expect(permittedDayAfterRogation.plan.massEntry==="INTROIT",
  "Mass of day must also begin at Introit after public Litanies");
expect(permittedDayAfterRogation.resolvedMass.actualCelebration.id!=="rogation-mass-1962",
  "Impeded II-class votive may not replace class I day Mass");
expect(permittedDayAfterRogation.resolvedMass.proper.data.sourcePath===proper.sourcePath,
  "Impeded votive accidentally replaced ordinary Proper");
const dateOnly=prepareMassSessionFromV346(rogationDate,{proper});
expect(dateOnly.plan.massEntry==="FOOT_CLUSTER" && dateOnly.plan.precedingGraphs.length===0,
  "Date alone activated Rogations");

let blocked=false;
try{ adaptV346ResolvedMass({...base,canStart:false},{proper}); }catch{blocked=true}
expect(blocked,"Blocked preflight was allowed to enter Mass");

console.log("v3.4.6 host adapter PASS: calendar/manual/Votive/Requiem/Nuptial/distinct-rite/following-action guards.");
