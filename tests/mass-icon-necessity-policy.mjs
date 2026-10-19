import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditMassIconNecessity} from "../src/mass/reader-icon-necessity-audit.js";
import {iconKeysForReaderState} from "../src/mass/reader-icons.js";

const read=(path)=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const policy=read("data/presentation/mass-icon-necessity-policy-20261019.v1.json");
const actions=read("data/presentation/reader-priest-actions.v1.json");
const positions=read("data/presentation/reader-priest-positions.v1.json");
const audit=auditMassIconNecessity({policy,actions,positions});

assert.equal(audit.ok,true,audit.failures.join(", "));
assert.deepEqual(audit.missingActions,[]);
assert.deepEqual(audit.missingStations,[]);
assert.deepEqual(audit.unmatchedActions,[]);
assert.deepEqual(audit.unmatchedStations,[]);
assert.equal(audit.actionLabels,35,"35 current distinct source action labels must be classified");
assert.equal(audit.actionCues,77,"no source priest action may be lost");
assert.equal(audit.positionLabels,10,"each physical station in the registry must be covered");
assert.equal(audit.positionCues,49,"no source priest station may be lost");
assert.deepEqual(audit.actionCueTiers,{ESSENTIAL:6,SELECTIVE:16,RUBRIC_ONLY:55});
assert.deepEqual(audit.actionLabelTiers,{ESSENTIAL:6,SELECTIVE:7,RUBRIC_ONLY:22});
assert.deepEqual(audit.positionCueTiers,{ESSENTIAL:43,SELECTIVE:2,RUBRIC_ONLY:4});
assert.equal(audit.faithfulPostureStates,4);
assert.equal(audit.essentialArtRecords,11);
assert.equal(audit.essentialArtPending,7);
assert.deepEqual(audit.generateImmediately,[
 "EA.PRIEST_COMMUNION_HOST","EA.PRIEST_COMMUNION_CHALICE",
]);
assert.deepEqual(audit.verifyBeforeGeneration,[
 "ES.FOOT_ALTAR","ES.ALTAR_CENTER","EA.ECCE_AGNUS_DEI","EG.THREE_GOSPEL_CROSSES",
]);

// Fraction, particle and ordinary head-bows have fully documented rubrics.
// Their absence from the artwork queue is intentional and complete.
const expectedRubricOnly=[
 "BREAKS HOST","PLACES PARTICLE","KISSES ALTAR","GENUFLECTS",
 "PROFOUND BOW","READS EPISTLE","PROCLAIMS GOSPEL","TURNS TO MISSAL",
];
for(const label of expectedRubricOnly){
  const rows=audit.boundActions.filter(x=>x.label===label);
  assert.ok(rows.length>0,"missing source action in necessity policy: "+label);
  assert.ok(rows.every(x=>x.treatment==="RUBRIC_ONLY"),
    "wrong necessity treatment for "+label);
}
const lavabo=audit.boundActions.filter(x=>x.label==="WASHES / PURIFIES");
assert.deepEqual(lavabo.map(x=>[x.cueId,x.treatment]),[
 ["AO.SM.C0125","SELECTIVE"],["AO.SM.C0247","RUBRIC_ONLY"],
 ["AO.SM.C0248","RUBRIC_ONLY"],
]);

// Absence of reviewed artwork may NEVER erase the native action event label.
// These checks distinguish visual resolution from independent source data.
for(const label of ["RECEIVES HOST","RECEIVES CHALICE","BREAKS HOST","PLACES PARTICLE"]){
  const row=actions.items.find(x=>x.label===label);
  assert.ok(row?.cueId,label+" source-owned event was deleted");
  const art=iconKeysForReaderState({priestAction:row}).priestActionIconKey;
  assert.equal(art,null,label+" still projects a misleading unapproved icon");
}
assert.equal(iconKeysForReaderState({priestAction:{label:"ELEVATES CHALICE"}})
  .priestActionIconKey,"priest_elevate_chalice_rich");
assert.equal(iconKeysForReaderState({priestAction:{label:"GIVES COMMUNION"}})
  .priestActionIconKey,"priest_rail_after_rich");
assert.equal(policy.authority.status,"P2_EDITORIAL_PROPOSAL_NOT_AUTO_APPLIED",
  "policy changed liturgical reader presentation without separate approval");

// Negative/robustness checks: the audit must reject incomplete or wrong SOTs.
const badActions={...policy,priestActions:policy.priestActions.slice(1)};
assert.ok(auditMassIconNecessity({policy:badActions,actions,positions}).failures.includes("ACTION_COVERAGE"));
const badStations={...policy,priestStations:policy.priestStations.slice(1)};
assert.ok(auditMassIconNecessity({policy:badStations,actions,positions}).failures.includes("STATION_COVERAGE"));
const invalid={...policy,priestActions:policy.priestActions.map((x,i)=>i?x:{...x,treatment:"DECORATIVE"})};
assert.ok(auditMassIconNecessity({policy:invalid,actions,positions})
  .failures.some(x=>x.startsWith("UNKNOWN_TIER:")));
const dup={...policy,priestActions:[...policy.priestActions,policy.priestActions[0]]};
assert.ok(auditMassIconNecessity({policy:dup,actions,positions})
  .failures.includes("DUPLICATE_ACTION_POLICY"));
const fake={...policy,exceptions:[...policy.exceptions,{cueId:"AO.SM.C9999",label:"PROFOUND BOW",treatment:"RUBRIC_ONLY"}]};
assert.ok(auditMassIconNecessity({policy:fake,actions,positions})
  .failures.includes("UNKNOWN_EXCEPTION:AO.SM.C9999"));

console.log("Mass icon necessity P2 PASS — 35 labels, 77 actions, 10 stations, 49 position cues, 2 generation candidates.");
