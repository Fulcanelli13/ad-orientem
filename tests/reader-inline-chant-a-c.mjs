import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {selectApprovedInlineScore,INLINE_CHANT_SCHEMA,INLINE_CHANT_CSS}
 from "../src/mass/reader-inline-chant.js";
import {APPROVED_MASS_INLINE_GABC} from "../src/mass/reader-inline-chant-approved.js";
import {normalizeScholaLocalProgramme,updateScholaLocalProgramme}
 from "../src/mass/reader-schola-local-programme.js";

const [a,b]=APPROVED_MASS_INLINE_GABC;
assert.equal(APPROVED_MASS_INLINE_GABC.length,2,"Only the exact Ite VIII source pair is live");
const latin=["℣. Ite, missa est.","℟. Deo grátias."];
for(const [i,x] of APPROVED_MASS_INLINE_GABC.entries()){
 assert.equal(x.schema,INLINE_CHANT_SCHEMA);
 assert.equal(x.sourceLatin,latin[i]);
 assert.equal(x.sourceCueId,["AO.SM.C0259","AO.SM.C0260"][i]);
 assert.equal(x.settingId,"ITE_VIII");
 assert.equal(x.originalSourceId,832);
 assert.equal(x.sourceUrl,"https://gregobase.selapa.net/chant.php?id=832");
 assert.equal(x.gabcSha256,createHash("sha256").update(x.gabc).digest("hex"),"exact source SHA");
 assert.match(x.gabc,/%%\s*\(c3\)/);
 assert.match(x.gabc,/\(::\)/);
 assert.equal((x.gabc.match(/\(::\)/g)||[]).length,1,"Only one speaker line per cue");
}
const paragraph=(x)=>({kind:"TEXT",primary:x.sourceLatin,secondary:"Translation",sourceCueIds:[x.sourceCueId]});
const pick=(x,settingId="ITE_VIII",form="MISSA_CANTATA_SIMPLE",patch={})=>
 selectApprovedInlineScore({cueId:x.sourceCueId,paragraph:paragraph(x),settingId,form,
  approvedScores:APPROVED_MASS_INLINE_GABC,...patch});
assert.equal(pick(a)?.scoreId,a.scoreId);
assert.equal(pick(b)?.scoreId,b.scoreId);
assert.equal(pick(a,"ITE_VIII","SOLEMN")?.scoreId,a.scoreId);
assert.equal(pick(a,"ITE_VIII","MISSA_CANTATA_INCENSE")?.scoreId,a.scoreId);
assert.equal(pick(a,"ITE_VIII","LOW"),null);
assert.equal(pick(a,""),null,"No automatic selection from Mass form or Kyrie");
assert.equal(pick(a,"MASS_08"),null,"Kyrie VIII must not select Ite VIII");
assert.equal(pick(a,"ITE_I"),null);
assert.equal(pick(a,"ITE_VIII","SOLEMN",{resolvedMass:{isRequiem:true}}),null);
assert.equal(pick(a,"ITE_VIII","SOLEMN",{resolvedMass:{provenance:{isRequiem:true}}}),null);
assert.equal(pick(a,"ITE_VIII","SOLEMN",{resolvedMass:{actualCelebration:{type:"REQUIEM"}}}),null);
assert.equal(pick(a,"ITE_VIII","SOLEMN",{resolvedMass:{actualCelebration:{kind:"MASS_FOR_THE_DEAD"}}}),null);
assert.equal(pick(a,"ITE_VIII","SOLEMN",{resolvedMass:{overlays:["REQUIEM"]}}),null);
assert.equal(pick(a,"ITE_VIII","SOLEMN",{paragraph:{...paragraph(a),primary:"℣. Benedicamus Domino.",secondary:null}}),null);
assert.equal(pick(a,"ITE_VIII","SOLEMN",{paragraph:{...paragraph(a),sourceCueIds:[b.sourceCueId]}}),null);
assert.equal(pick(a,"ITE_VIII","SOLEMN",{paragraph:{...paragraph(a),sourceCueIds:[a.sourceCueId,b.sourceCueId]}}),null);
assert.equal(pick(a,"ITE_VIII","SOLEMN",{approvedScores:[a,a]}),null);
for(const patch of [{publication:"RESEARCH_ONLY"},{approval:"PENDING"},{sourceTextVerified:false},
  {musicalNotationVerified:false},{sourceUrl:"javascript:bad"},{gabc:"(c3)Fake(::)"},
  {settingId:"ITE_I"},{gabcSha256:"broken"}]){
 assert.equal(pick(a,"ITE_VIII","SOLEMN",{approvedScores:[{...a,...patch}]}),null,
   "Fail closed when provenance invalid: "+JSON.stringify(patch));
}
let local=normalizeScholaLocalProgramme({});
assert.equal(local.dismissalSelection,"");
local=updateScholaLocalProgramme(local,{kind:"ordinarySelection",eventId:"KYRIE",value:"MASS_08"});
assert.equal(local.dismissalSelection,"","Kyrie VIII does not infer Ite VIII");
local=updateScholaLocalProgramme(local,{kind:"dismissalSelection",value:"ITE_VIII"});
assert.equal(local.dismissalSelection,"ITE_VIII");
assert.equal(local.profiles[0].dismissalSelection,"ITE_VIII");
local=updateScholaLocalProgramme(local,{kind:"profileCreate",value:"Another parish"});
assert.equal(local.dismissalSelection,"","New profile may not inherit old parish's dismissal");
local=updateScholaLocalProgramme(local,{kind:"profileSelect",value:"p1"});
assert.equal(local.dismissalSelection,"ITE_VIII");
local=updateScholaLocalProgramme(local,{kind:"dismissalSelection",value:"INVALID"});
assert.equal(local.dismissalSelection,"ITE_VIII");
local=updateScholaLocalProgramme(local,{kind:"dismissalSelection",value:""});
assert.equal(local.dismissalSelection,"");
assert.match(INLINE_CHANT_CSS,/grid-template-columns:24px minmax\(0,1fr\)/);
console.log("PASS Ite VIII source SHA, 2 verified cues, scoped local selection, Requiem/Benedicamus/Low guards");
