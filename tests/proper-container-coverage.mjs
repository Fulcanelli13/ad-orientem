import {
  auditProperContainerCoverage,
  assertProperContainerCoverage,
  assertProperCueOwnership,
} from "../src/mass/proper-container-coverage.js";

const expect=(x,m)=>{if(!x)throw new Error(m)};

const manifest={
  slots:{
    introit:{textLat:"Introit"},
    epistleOrLesson:{payloadRef:"LESSON-1"},
    gospel:{payloadRef:"GOSPEL-1"},
    offertory:{textLat:"Offertory"},
    preface:{payloadRef:"PREFACE-1"},
    communion:{textLat:"Communion"},
  },
  orations:{
    collectSet:[{bodyLat:"Collect"}],
    secretSet:[{bodyLat:"Secret"}],
    postcommunionSet:[{bodyLat:"Postcommunion"}],
  },
  preGospelSequence:[
    {id:"GR1",type:"GRADUAL",payloadRef:"GRADUAL-1",sourceRef:"FIXTURE"}
  ],
};

const required=[
  "INTROIT","COLLECT_SET","EPISTLE_OR_LESSON","PRE_GOSPEL_SEQUENCE","GOSPEL",
  "OFFERTORY","SECRET_SET","PREFACE","COMMUNION","POSTCOMMUNION_SET"
];
expect(auditProperContainerCoverage(manifest,required).pass,"complete Proper manifest failed coverage");
assertProperContainerCoverage(manifest,required);

const missing=structuredClone(manifest);
delete missing.slots.gospel;
const missingAudit=auditProperContainerCoverage(missing,required);
expect(!missingAudit.pass,"missing Gospel container was excluded from QA");
expect(missingAudit.results.find(x=>x.id==="GOSPEL")?.reason==="MISSING_OR_BLANK","missing Gospel not identified");

const blank=structuredClone(manifest);
blank.slots.epistleOrLesson={textLat:"   "};
expect(!auditProperContainerCoverage(blank,required).pass,"blank Epistle container passed QA");

const duplicate=[...required,"GOSPEL"];
expect(!auditProperContainerCoverage(manifest,duplicate).pass,"duplicate required container was ignored");

assertProperCueOwnership("EPISTLE_OR_LESSON","AO.SM.C0075",["AO.SM.C0076"]);
assertProperCueOwnership("GOSPEL","AO.SM.C0086",["AO.SM.C0087","AO.SM.C0088"]);

let absorbed=false;
try {
  assertProperCueOwnership("GOSPEL","AO.SM.C0086",["AO.SM.C0088"]);
} catch { absorbed=true; }
expect(absorbed,"Gospel fixed response ownership drift was not detected");

console.log("Proper container coverage PASS: required containers + B020/B026 cue ownership enforced.");
