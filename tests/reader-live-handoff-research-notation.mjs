import {test} from "node:test";
import assert from "node:assert/strict";
import {selectLiveHandoffResearchNotation} from "../src/mass/reader-live-handoff-research-notation.js";
import {SCHOLA_DOCK_SCORE_APPROVALS} from "../src/mass/reader-schola-dock-approved.js";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";

const schola=Object.freeze({
 trackId:"KYRIE",owner:"R17_NATIVE_SCHOLA",
 cueId:"AO.SM.C0041",segmentId:"AO.SM.C0041",
 trackSourceCueIds:["AO.SM.C0041","AO.SM.C0042"],
 trackSourceLatin:"Kyrie eleison Christe eleison",
 musicStatus:"EXPECTED_NOT_OBSERVED",composedWorkId:null
});
const base=Object.freeze({
 schola,form:"MISSA_CANTATA_INCENSE",settingId:"MASS_11",
 sourceGate:true,approvedScoreVisible:false
});
const select=overrides=>selectLiveHandoffResearchNotation({...base,...overrides});

test("existing owner-indexed Kyrie XI opens as a REFERENCE not a publication",()=>{
 const existing=offlineKyrialeResearchScore("KYRIE","MASS_11");
 assert.ok(existing?.gabc?.includes("%%"));
 assert.equal(existing.scoreId,"GREGOBASE-2982");
 const reference=select();
 assert.ok(reference);
 assert.equal(reference.scoreId,existing.scoreId);
 assert.equal(reference.status,"REFERENCE_ONLY_NOT_APPROVED");
 assert.equal(reference.sourceScoreApproved,false);
 assert.equal(reference.musicalPerformance,"NOT_OBSERVED");
 assert.deepEqual(reference.sourceCueIds,schola.trackSourceCueIds);
 assert.equal(SCHOLA_DOCK_SCORE_APPROVALS.length,0,
   "No explicit musical approval record exists: research must remain non-publishing");
});

test("only exact active native Schola and explicitly selected 1961 source may preview",()=>{
 for(const form of ["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"])
   assert.ok(select({form}),form+" must support historical references");
 assert.equal(select({form:"LOW"}),null);
 assert.equal(select({sourceGate:false}),null);
 assert.equal(select({approvedScoreVisible:true}),null);
 assert.equal(select({settingId:""}),null);
 assert.equal(select({settingId:"CUSTOM"}),null);
 assert.equal(select({settingId:"MASS_99"}),null);
 assert.equal(select({settingId:"MASS_08"}).scoreId,"GREGOBASE-1184");
 for(const bad of [
  {owner:"R17_PRIEST_SOURCE"},
  {musicStatus:"HEARD"},
  {composedWorkId:"FAURE_REQUIEM"},
  {cueId:"AO.SM.C0090"},
  {trackId:"INTROIT"},
  {trackSourceCueIds:["AO.SM.C0042","AO.SM.C0042"]},
  {trackSourceCueIds:[]},
  {trackSourceCueIds:["AO.SM.C0042"]},
  {trackSourceCueIds:["AO.CARD.003"]},
  {trackSourceLatin:""}
 ])assert.equal(select({schola:{...schola,...bad}}),null,
    "Invalid native source must fail closed "+Object.keys(bad).join(","));
});

test("other indexed Kyriale sources use exact selected movements, not seasonal guesses",()=>{
 const cases=[
  ["KYRIE","MASS_11","GREGOBASE-2982"],
  ["GLORIA","MASS_11","GREGOBASE-303"],
  ["SANCTUS_BENEDICTUS","MASS_11","GREGOBASE-1106"],
  ["AGNUS_DEI","MASS_11","GREGOBASE-1243"],
  ["CREDO","CREDO_03","GREGOBASE-749"]
 ];
 for(const [trackId,settingId,scoreId] of cases){
  const result=select({schola:{...schola,trackId},settingId});
  assert.equal(result?.scoreId,scoreId,trackId+" "+settingId);
  assert.equal(result.sourceScoreApproved,false);
 }
 assert.equal(select({schola:{...schola,trackId:"CREDO"},settingId:"MASS_11"}),null);
});
