import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateCanon20MinisterSourceMatrix,createCanon20MinisterSourceAcceptance}
 from "../src/mass/reader-canon-20-minister-stage-acceptance.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const sources={
 matrix:read("../data/research/mass-canon-20-minister-stage-acceptance-20261014.json"),
 legacy:read("../data/research/mass-canon-minister-form-branches-20261013.json"),
 attendants:read("../data/research/mass-canon-viii8-elevation-attendants-20261014.json"),
 french:read("../data/research/mass-canon-french-rubric-62-original-redraft-20261013.json"),
 sourceAnchors:read("../data/research/mass-canon-62-source-trigger-audit-20261013.json")
};
const audit=validateCanon20MinisterSourceMatrix(sources);
assert.equal(audit.coverage,20);
assert.equal(audit.distinctMinisterRoles,5);
assert.equal(audit.publishable,0);
assert.equal(audit.separatelyTimed,0);
assert.deepEqual(audit.byOwner,{EXISTING_MINISTER_11:11,
 VIII8_ATTENDANTS_6:6,CANONICAL_R62_SERVER_3:3});
const ids=new Set(audit.entries.map(x=>x.id));
assert.equal(ids.size,20);
const counts={};for(const a of audit.entries)counts[a.actor]=(counts[a.actor]||0)+1;
assert.deepEqual(counts,{DEACON:9,THURIFER:2,ACOLYTES:5,SUBDEACON:1,SERVER:3});
assert.ok(audit.entries.every(x=>x.actualObserved===false&&x.canPublish===false&&
 x.faithfulPosture===null&&x.sourceIdentityReviewed===false));
const accepted=createCanon20MinisterSourceAcceptance(sources);
assert.equal(accepted.preview().candidates.length,0);
assert.equal(accepted.preview({editorialPreview:true,form:"IMPOSSIBLE"}).candidates.length,0);
for(const [form,expect] of [
 ["LOW",{DEACON:0,THURIFER:0,ACOLYTES:0,SUBDEACON:0,SERVER:3}],
 ["MISSA_CANTATA_SIMPLE",{DEACON:0,THURIFER:0,ACOLYTES:0,SUBDEACON:0,SERVER:3}],
 ["MISSA_CANTATA_INCENSE",{DEACON:0,THURIFER:2,ACOLYTES:0,SUBDEACON:0,SERVER:3}]
]){
 const p=accepted.preview({editorialPreview:true,form,
 communicantsPresent:false,fastDay1962:false,massForDead:false});
 assert.equal(p.status,"MINISTER_SOURCE_MATRIX_EDITORIAL_NOT_LIVE");
 assert.equal(p.canPublish,false);
 assert.deepEqual(p.actorCounts,expect);
 assert.equal(p.candidates.length,Object.values(expect).reduce((a,b)=>a+b,0));
}

const unknown=accepted.preview({editorialPreview:true,form:"SOLEMN"});
assert.equal(unknown.torchContextVerified,false);
assert.equal(unknown.torchExtinguishCandidateId,null);
assert.equal(unknown.actorCounts.ACOLYTES,1,"Do not guess torch stop without complete conditions");
assert.equal(unknown.actorCounts.SUBDEACON,1);
assert.equal(unknown.actorCounts.DEACON,9);
assert.equal(unknown.actorCounts.THURIFER,2);
assert.equal(unknown.actorCounts.SERVER,3);
assert.equal(unknown.candidates.filter(x=>x.id.startsWith("AO.CANON.VIII8.00")&&
 x.actor==="ACOLYTES").length,1);
const sub=unknown.candidates.find(x=>x.actor==="SUBDEACON");
assert.equal(sub.id,"AO.CANON.VIII8.002");
assert.equal(sub.cueId,null,"No fabricated Latin word for the subdeacon genuflection");
for(const communicantsPresent of [false,true])
 for(const fastDay1962 of [false,true])
  for(const massForDead of [false,true]){
   const p=accepted.preview({editorialPreview:true,form:"SOLEMN",
    communicantsPresent,fastDay1962,massForDead});
   const keep=communicantsPresent||fastDay1962||massForDead;
   const expectedStop="AO.CANON.VIII8."+(keep?
     communicantsPresent?"004":fastDay1962?"005":"006":"003");
   assert.equal(p.torchContextVerified,true);
   assert.equal(p.torchExtinguishCandidateId,expectedStop);
   assert.deepEqual(p.actorCounts,
    {DEACON:9,THURIFER:2,ACOLYTES:2,SUBDEACON:1,SERVER:3});
   assert.equal(p.candidates.length,17);
   assert.equal(p.candidates.filter(x=>x.id.startsWith("AO.CANON.VIII8.")&&
     x.actor==="ACOLYTES"&&x.id!=="AO.CANON.VIII8.001").length,1);
   assert.equal(p.observedNow,false);
   assert.ok(p.candidates.every(x=>x.observedNow===false&&x.canPublish===false&&
     x.exactStageVerified===false));
  }
const pall=accepted.preview({editorialPreview:true,form:"SOLEMN",
 communicantsPresent:false,fastDay1962:false,massForDead:false,
 confirmedConditions:["AO.CANON.MIN.007","AO.CANON.MIN.008"]});
const pallOpen=pall.candidates.find(x=>x.id==="AO.CANON.MIN.007"),
 pallClose=pall.candidates.find(x=>x.id==="AO.CANON.MIN.008"),
 genuflect=pall.candidates.find(x=>x.id==="AO.CANON.MIN.011");
assert.equal(pallOpen.conditionSourceContextVerified,true);
assert.equal(pallClose.conditionSourceContextVerified,true);
assert.notEqual(genuflect.conditionSourceContextVerified,false,
 "Prescribed deacon genuflection must not be conditional on pall handling");
assert.equal(genuflect.observedNow,false);
assert.equal(pallOpen.observedNow,false);
assert.equal(pallClose.observedNow,false);
const bell=accepted.preview({editorialPreview:true,form:"LOW"}).candidates;
assert.equal(bell.length,3);
assert.ok(bell.every(x=>x.actor==="SERVER"&&x.conditionSourceContextVerified===false));
assert.equal(bell.find(x=>x.id==="AO.CANON.R62.062").stage,
 "ANTICIPATORY_CONSECRATION_SERVER_BELL");
assert.throws(()=>accepted.preview({editorialPreview:true,form:"SOLEMN",
 confirmedConditions:[42]}),/identifiers/);
const poison=fn=>{const s=structuredClone(sources);fn(s);return s;};
for(const mutate of [
 s=>s.matrix.rows[0].actualObserved=true,
 s=>s.matrix.rows[0].canPublish=true,
 s=>s.matrix.rows[0].actor="PRIEST",
 s=>s.matrix.rows[0].sourceIdentityReviewed=true,
 s=>s.matrix.rows[11].forms=["LOW"],
 s=>s.matrix.rows[12].cueId="AO.SM.C0181",
 s=>s.matrix.rows[19].stage="HANC_IGITUR_WORD_TRIGGERS_BELL",
 s=>s.matrix.rows[18].sourceUrls=["https://example.com"],
 s=>s.legacy.branches[0].id="AO.CANON.MIN.999",
 s=>s.attendants.rows[0].id="AO.CANON.VIII8.999",
 s=>s.french.rows.find(x=>x.id==="AO.CANON.R62.027").actor="PRIEST",
 s=>s.matrix.rows.pop(),
])assert.throws(()=>validateCanon20MinisterSourceMatrix(poison(mutate)));
console.log("PASS: 20 distinct Canon minister IDs, 5 actors, four Mass forms, eight torch contexts, independent deacon pall/genuflection and 0 observed/published.");
