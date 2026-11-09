import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  INLINE_ORDINARY_SOURCE_ANCHORS,sourceBoundOrdinaryReferenceScores
} from "../src/mass/reader-inline-ordinary-reference.js";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";

// These identities come from the canonical SUNG donor, not titles, a date,
// an English translation, or an inferred parish repertoire.
const donor=JSON.parse(readFileSync(new URL(
  "../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
const cases=[
  ["KYRIE","MASS_16","GREGOBASE-545"],
  ["KYRIE","MASS_11","GREGOBASE-2982"],
  ["KYRIE","MASS_08","GREGOBASE-1184"],
  ["GLORIA","MASS_08","GREGOBASE-961"],
  ["CREDO","CREDO_03","GREGOBASE-749"],
  ["SANCTUS_BENEDICTUS","MASS_08","GREGOBASE-1384"],
  ["AGNUS_DEI","MASS_08","GREGOBASE-2760"]
];
assert.equal(INLINE_ORDINARY_SOURCE_ANCHORS.length,5);
assert.equal(new Set(INLINE_ORDINARY_SOURCE_ANCHORS.map(x=>x.firstCueId)).size,5);
assert.equal(new Set(cases.map(c=>c[2])).size,7);
for(const [movement,settingId,scoreId] of cases){
  const anchor=INLINE_ORDINARY_SOURCE_ANCHORS.find(x=>x.movement===movement);
  assert.ok(anchor,"No canonical anchor for "+movement);
  const block=donor.blocks.find(b=>b.Block_ID===anchor.blockId);
  assert.ok(block,"Canonical source block missing: "+anchor.blockId);
  const unit=block.units.find(u=>u.cue_id===anchor.firstCueId);
  assert.ok(unit?.latin,"Opening source cue missing: "+anchor.firstCueId);
  const cues=[anchor.firstCueId];
  if(movement==="GLORIA")cues.push("AO.SM.C0054");
  if(movement==="CREDO")cues.push("AO.SM.C0090");
  const paragraph={
    id:cues.join("+"),sourceBlockId:anchor.blockId,
    sourceCueIds:cues,kind:"TEXT",primary:unit.latin,secondary:unit.english
  };
  const input={paragraph,form:"MISSA_CANTATA_SIMPLE",resolvedMass:{},
    selectedSettings:{[movement]:settingId}};
  const selected=sourceBoundOrdinaryReferenceScores(input);
  assert.equal(selected.length,1,movement+" locally selected score absent");
  const score=selected[0];
  assert.equal(score.id,scoreId);
  assert.equal(score.movement,movement);
  assert.equal(score.settingId,settingId);
  assert.equal(score.gabc,offlineKyrialeResearchScore(movement,settingId).gabc,
    "Source GABC must not be rewritten");
  assert.equal(score.sourceContextCertified,false);
  assert.equal(score.publicScoreApproved,false);
  assert.equal(score.status,"RESEARCH_TRANSCRIPTION_NOT_FACSIMILE_APPROVED");
  assert.ok(score.sourceUrl.startsWith("https://gregobase.selapa.net/chant.php?id="));
  assert.deepEqual(score.sourceCueIds,[anchor.firstCueId]);
  assert.equal(sourceBoundOrdinaryReferenceScores({...input,form:"SOLEMN"}).length,1);
  assert.equal(sourceBoundOrdinaryReferenceScores({...input,form:"MISSA_CANTATA_INCENSE"}).length,1);
  assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,form:"LOW"}),[]);
  assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
    resolvedMass:{isRequiem:true}}),[]);
  assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
    selectedSettings:{}}),[],"No melody without an explicit local setting");
  assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
    selectedSettings:{[movement]:"CUSTOM"}}),[]);
  assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
    paragraph:{...paragraph,kind:"RUBRIC"}}),[]);
  assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
    paragraph:{...paragraph,sourceBlockId:"AO.SM.B001"}}),[]);
  const later=block.units.find(u=>u.cue_id!==anchor.firstCueId && u.latin);
  if(later)assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
    paragraph:{id:later.cue_id,sourceBlockId:anchor.blockId,
      sourceCueIds:[later.cue_id],kind:"TEXT",primary:later.latin}}),[],
      "Full score must not repeat at later source cue");
}
for(const movement of ["GLORIA","CREDO","SANCTUS_BENEDICTUS","AGNUS_DEI"]){
  const other=sourceBoundOrdinaryReferenceScores({
    paragraph:{sourceCueIds:["AO.SM.C0044"],kind:"TEXT",sourceBlockId:"AO.SM.B015"},
    form:"SOLEMN",selectedSettings:{[movement]:"MASS_08"}
  });
  assert.deepEqual(other,[],"Never cross-attach unrelated music");
}
console.log("PASS 7 archived Kyriale scores anchored at five canonical Ordinary movements");
