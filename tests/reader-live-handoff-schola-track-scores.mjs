import {test} from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {selectApprovedScholaDockScore,SCHOLA_DOCK_APPROVAL_SCHEMA,
 SCHOLA_DOCK_SCORE_APPROVALS} from "../src/mass/reader-schola-dock-approved.js";
import {APPROVED_MASS_INLINE_GABC} from "../src/mass/reader-inline-chant-approved.js";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";

const cues=["AO.SM.C0037","AO.SM.C0038"];
const latin="Kyrie eleison Christe eleison";
const gabc="name: Kyrie;\n%%\n(c4) KY(g)ri(h)e(i) e(h)lé(g)i(f)son.(e.) (::)";
const sha=createHash("sha256").update(gabc).digest("hex");
const baseScore=Object.freeze({
 schema:"ao-mass-inline-approved-gabc-v1",scoreId:"TEST-SCHOLA-TRACK-001",
 scoreScope:"FULL_SCHOLA_TRACK",selectionKey:"KYRIE",settingId:"MASS_11",
 riteScope:"ORDINARY",sourceCueIds:cues,sourceLatin:latin,
 approval:"USER_AND_MUSICAL_SOURCE_REVIEWED",publication:"PUBLIC_APPROVED",
 sourceTextVerified:true,musicalNotationVerified:true,
 sourceWitness:"Test witness for synthetic positive source track",
 sourceUrl:"https://example.org/test-kyrie",gabc,gabcSha256:sha
});
const baseApproval=Object.freeze({
 schema:SCHOLA_DOCK_APPROVAL_SCHEMA,scoreScope:"FULL_SCHOLA_TRACK",
 score_status:"approved",scoreId:baseScore.scoreId,trackId:"KYRIE",
 settingId:"MASS_11",riteScope:"ORDINARY",licence:"CC0-1.0",
 sourceUrl:baseScore.sourceUrl,gabcSha256:sha,
 sourceCueIds:cues,sourceLatin:latin
});
const native=Object.freeze({
 owner:"R17_NATIVE_SCHOLA",trackId:"KYRIE",segmentId:cues[0],
 cueId:cues[0],latin:"Kyrie eleison",trackSourceCueIds:cues,
 trackSourceLatin:latin,musicStatus:"EXPECTED_NOT_OBSERVED",
 composedWorkId:null
});
const context=Object.freeze({
 schola:native,form:"MISSA_CANTATA_SIMPLE",
 resolvedMass:{form:"MISSA_CANTATA_SIMPLE"},
 localProgramme:{ordinarySelections:{KYRIE:"MASS_11"}},
 approvedScores:[baseScore],approvalRegistry:[baseApproval]
});
const pick=(options={})=>selectApprovedScholaDockScore({...context,...options});

test("existing corpus has no Schola-publication approvals: research is not publication",()=>{
 assert.equal(SCHOLA_DOCK_SCORE_APPROVALS.length,0);
 assert.deepEqual(APPROVED_MASS_INLINE_GABC.map(s=>s.selectionKey),
   ["DISMISSAL","DISMISSAL"]);
 assert.equal(pick({approvalRegistry:[]}),null);
 assert.equal(pick({approvedScores:APPROVED_MASS_INLINE_GABC}),null);
 const research=offlineKyrialeResearchScore("KYRIE","MASS_11");
 assert.ok(research?.gabc?.includes("%%"),"existing indexed Kyrie XI source expected");
 assert.equal(research?.scoreApproved,false);
 assert.equal(pick({approvedScores:[research]}),null);
});

test("one approved full score binds to all its source cues without card time",()=>{
 for(const form of ["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  for(const id of cues){
   const selected=pick({form,schola:{...native,cueId:id,segmentId:id,
     latin:id===cues[0]?"Kyrie eleison":"Christe eleison"}});
   assert.ok(selected,form+" "+id);
   assert.equal(selected.scoreId,baseScore.scoreId);
   assert.equal(selected.settingId,"MASS_11");
   assert.equal(selected.scholaSegmentId,id);
   assert.deepEqual(selected.scholaSourceCueIds,cues);
   assert.equal(selected.musicalPerformance,"EXPECTED_NOT_OBSERVED");
  }
 }
 assert.equal(pick({form:"LOW"}),null,"Low Mass must never obtain a Schola score");
});

test("unreviewed, unpublished or merely catalogued score fails closed",()=>{
 for(const changes of [
  {approval:"UNREVIEWED"},
  {publication:"RESEARCH_ONLY"},
  {sourceTextVerified:false},
  {musicalNotationVerified:false},
  {scoreScope:"CUE_ONLY"},
  {selectionKey:"GLORIA"},
  {settingId:"MASS_08"},
  {riteScope:"REQUIEM"},
  {sourceCueIds:[cues[0]]},
  {sourceLatin:"Kyrie eleison Gloria"},
  {sourceUrl:"http://example.org/unapproved"},
  {gabcSha256:"f".repeat(64)},
  {gabc:"plain text without a GABC clef"}
 ]){
  assert.equal(pick({approvedScores:[{...baseScore,...changes}]}),null,
    "Wrongly approved "+Object.keys(changes).join(","));
 }
});

test("a score cannot be inferred from the date, card, first cue, or local title",()=>{
 assert.equal(pick({localProgramme:{ordinarySettings:{KYRIE:"Mass XI"}}}),null);
 assert.equal(pick({schola:{...native,trackSourceCueIds:undefined}}),null);
 assert.equal(pick({schola:{...native,trackSourceCueIds:[cues[1],cues[0]]}}),null);
 assert.equal(pick({schola:{...native,trackSourceCueIds:[cues[0]]}}),null);
 assert.equal(pick({schola:{...native,cueId:"AO.SM.C0054"}}),null);
 assert.equal(pick({schola:{...native,owner:"SYNTHETIC"}}),null);
 assert.equal(pick({schola:{...native,musicStatus:"HEARD"}}),null);
 assert.equal(pick({schola:{...native,composedWorkId:"POLYPHONIC_WORK"}}),null);
});

test("promotion record must independently agree on licensed setting, source and hash",()=>{
 for(const changes of [
  {score_status:"candidate"},
  {scoreScope:"ONE_CUE"},
  {licence:"UNKNOWN"},
  {trackId:"GLORIA"},
  {settingId:"MASS_08"},
  {sourceCueIds:[cues[0]]},
  {sourceLatin:"Kyrie eleison Gloria"},
  {sourceUrl:"https://example.org/other"},
  {gabcSha256:"0".repeat(64)},
  {riteScope:"REQUIEM"},
  {schema:"incorrect"}
 ]){
   assert.equal(pick({approvalRegistry:[{...baseApproval,...changes}]}),null,
     "Bad promotion "+Object.keys(changes).join(","));
 }
 assert.equal(pick({approvalRegistry:[baseApproval,baseApproval]}),null,
   "Ambiguous duplicate promotions must not auto-pick");
});

test("full-track score cannot cross a Requiem/Ordinary source scope",()=>{
 const requiem={form:"MISSA_CANTATA_SIMPLE",
   isRequiem:true,conditions:["REQUIEM"],liturgicalClass:"REQUIEM"};
 // The source-owned Requiem detector may reject incomplete synthetic context,
 // but a row explicitly marked REQUIEM can never become selected on ordinary.
 assert.equal(pick({approvedScores:[{...baseScore,riteScope:"REQUIEM"}]}),null);
 assert.equal(pick({approvalRegistry:[{...baseApproval,riteScope:"REQUIEM"}]}),null);
 assert.equal(pick({resolvedMass:requiem,approvedScores:[{...baseScore,riteScope:"REQUIEM"}]}),
   null,"Without a matching independent promotion no Requiem score may surface");
});
