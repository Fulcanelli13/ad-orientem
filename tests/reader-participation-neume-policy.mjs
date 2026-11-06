import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {PARTICIPATION_NEUME_POLICY,PARTICIPATION_NEUME_SCHEMA,
 participationNeumeOpportunity,participationNotationDecision}
 from "../src/mass/reader-participation-neume-policy.js";
import {selectApprovedInlineScore} from "../src/mass/reader-inline-chant-selector.js";
import {APPROVED_MASS_INLINE_GABC} from "../src/mass/reader-inline-chant-approved.js";
const audit=JSON.parse(await readFile(new URL("../data/mass/ordinary-sung-speaker-audit.v1.json",import.meta.url),"utf8"));
const source=JSON.parse(await readFile(new URL("../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
const auditByCue=new Map(audit.records.map(row=>[row.cueId,row]));
const sourceByCue=new Map(source.blocks.flatMap(block=>block.units.map(unit=>[unit.cue_id,unit])));
assert.equal(PARTICIPATION_NEUME_SCHEMA,"ao-mass-compact-participation-neumes-v1");
assert.equal(PARTICIPATION_NEUME_POLICY.length,20);
const all=new Set();
for(const spec of PARTICIPATION_NEUME_POLICY){
 assert.ok(spec.cueIds.length,"No empty cue group: "+spec.id);
 for(const cueId of spec.cueIds){
  assert.equal(all.has(cueId),false,"No duplicate ownership "+cueId);all.add(cueId);
  const audited=auditByCue.get(cueId);
  assert.ok(audited,"Must remain source exact "+cueId);
  assert.ok(spec.kind==="CELEBRANT_INTONATION"?
   audited.evidence==="SUNG_INTONATION":
   spec.kind==="DISMISSAL_PAIR"?
    ["DISMISSAL_MINISTER","RESPONDERS"].includes(audited.role):
    audited.role==="RESPONDERS",cueId+" must have correct source role");
  const unit=sourceByCue.get(cueId);
  assert.ok(unit,"Every candidate retains its original source text cue "+cueId);
  const p={kind:"TEXT",sourceCueIds:[cueId],primary:unit.latin||""};
  const opportunity=participationNeumeOpportunity({cueId,form:"MISSA_CANTATA_SIMPLE",paragraph:p});
  assert.equal(Boolean(opportunity),Boolean(unit.latin),cueId+" unresolved text must not acquire neumes");
  assert.equal(participationNotationDecision({cueId,form:"SOLEMN",paragraph:p}).score,null);
  assert.equal(participationNeumeOpportunity({cueId,form:"LOW",paragraph:p}),null);
 }
}
assert.equal(all.size,23);
for(const cueId of ["AO.SM.C0003","AO.SM.C0013","AO.SM.C0270","AO.SM.C0275"]){
 const unit=sourceByCue.get(cueId);
 assert.equal(participationNeumeOpportunity({cueId,form:"SOLEMN",
   paragraph:{kind:"TEXT",sourceCueIds:[cueId],primary:unit.latin}}),null,
  "Private/Last Gospel/foot-of-altar responses must not be treated as Sung Mass music");
}
for(const cueId of ["AO.SM.C0074","AO.SM.C0087","AO.SM.C0255"]){
 assert.equal(participationNeumeOpportunity({cueId,form:"SOLEMN",
  paragraph:{kind:"TEXT",sourceCueIds:[cueId],primary:null}}),null,
  "Dynamic response cannot get a guessed Amen or Gospel conclusion");
}
// The source's after-Gospel Laus tibi, Christe remains in the reader, but
// according to 1962 High-Mass music guidance it is not sung by the choir.
// An instantiated Latin response must still never trigger a neume.
const afterGospel={kind:"TEXT",sourceCueIds:["AO.SM.C0087"],
 primary:"℟. Laus tibi, Christe."};
for(const form of ["SOLEMN","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE"]){
 assert.equal(participationNeumeOpportunity({cueId:"AO.SM.C0087",
  form,paragraph:afterGospel}),null,
  "Gospel conclusion is a spoken response, not a sung Gregorian cue");
}
assert.equal(PARTICIPATION_NEUME_POLICY.find(x=>x.id==="GOSPEL_CONCLUSION")?.sungExclusion,
 "GOSPEL_END_LAUS_TIBI_CHRISTE_RESPONDED_NOT_SUNG");

const [minister,response]=APPROVED_MASS_INLINE_GABC;
for(const score of [minister,response]){
 const paragraph={kind:"TEXT",sourceCueIds:[score.sourceCueId],primary:score.sourceLatin,
  secondary:"Live translated text remains intact"};
 const selected=selectApprovedInlineScore({cueId:score.sourceCueId,paragraph,
  form:"SOLEMN",settingId:"ITE_VIII"});
 assert.equal(selected?.scoreId,score.scoreId);
 const decision=participationNotationDecision({cueId:score.sourceCueId,paragraph,
  form:"SOLEMN",score:selected});
 assert.equal(decision.status,"COMPACT_APPROVED");
 assert.equal(decision.score.scoreId,score.scoreId);
 assert.equal(participationNotationDecision({cueId:score.sourceCueId,paragraph,form:"LOW",score:selected}).score,null);
 assert.equal(participationNotationDecision({cueId:score.sourceCueId,paragraph,
  form:"SOLEMN",score:{...selected,publication:"RESEARCH_ONLY"}}).score,null);
 assert.equal(participationNotationDecision({cueId:score.sourceCueId,paragraph,
  form:"SOLEMN",score:{...selected,sourceCueId:"AO.SM.C0275"}}).score,null);
}
assert.equal(participationNotationDecision({cueId:"AO.SM.C0053",form:"SOLEMN",
 paragraph:{kind:"TEXT",sourceCueIds:["AO.SM.C0053"],primary:"Glória in excélsis"},
 score:null}).status,"SOURCE_SCORE_REVIEW_PENDING");
console.log("PASS 20 source-anchored participation events / 23 cue IDs; 2 approved dismissal cues; 21 research holds, no Low/Last Gospel/foot altar leak");
