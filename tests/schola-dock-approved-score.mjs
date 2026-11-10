import assert from "node:assert/strict";
import {APPROVED_MASS_INLINE_GABC} from "../src/mass/reader-inline-chant-approved.js";
import {
 SCHOLA_DOCK_APPROVAL_SCHEMA,SCHOLA_DOCK_SCORE_APPROVALS,
 selectApprovedScholaDockScore
} from "../src/mass/reader-schola-dock-approved.js";

assert.deepEqual(SCHOLA_DOCK_SCORE_APPROVALS,[],
 "Provisional Gregorian research must not be silently promoted to LIVE");
const ctx={
 schola:{trackId:"KYRIE",cueId:"AO.SM.C0034",segmentId:"AO.SM.C0034",
  latin:"Kýrie eléison.",musicStatus:"EXPECTED_NOT_OBSERVED"},
 form:"MISSA_CANTATA_SIMPLE",
 resolvedMass:{form:"MISSA_CANTATA_SIMPLE"},
 localProgramme:{ordinarySelections:{KYRIE:"VIII"}}
};
assert.equal(selectApprovedScholaDockScore(ctx),null,
 "The production Schola dock must fall back to source-owned Latin text");

// Synthetic positive fixture exercises the permission gate only. Reuse a
// technically valid, already reviewed GABC envelope without inventing a
// score that could leak into production. This is NOT Kyrie musical content.
const first=APPROVED_MASS_INLINE_GABC[0];
const candidate={...first,scoreId:"TEST-GATE-KYRIE",selectionKey:"KYRIE",
 settingId:"VIII",sourceCueId:"AO.SM.C0034",sourceLatin:"Kýrie eléison."};
const row={schema:SCHOLA_DOCK_APPROVAL_SCHEMA,score_status:"approved",
 scoreId:candidate.scoreId,trackId:"KYRIE",settingId:"VIII",
 sourceCueId:"AO.SM.C0034",gabcSha256:candidate.gabcSha256,
 sourceUrl:candidate.sourceUrl,licence:"CC0-1.0"};
const select=(overrides={},approvalRegistry=[row],approvedScores=[candidate])=>
 selectApprovedScholaDockScore({...ctx,...overrides,approvalRegistry,approvedScores});
const accepted=select();
assert.equal(accepted?.score_status,"approved");
assert.equal(accepted?.scholaTrackId,"KYRIE");
assert.equal(accepted?.musicalPerformance,"EXPECTED_NOT_OBSERVED");
assert.equal(select({},[{...row,score_status:"pending"}]),null);
assert.equal(select({},[{...row,licence:"unknown"}]),null);
assert.equal(select({},[{...row,sourceUrl:"https://example.com/other"}]),null);
assert.equal(select({},[{...row,sourceCueId:"AO.SM.C0099"}]),null);
assert.equal(select({},[{...row,settingId:"XI"}]),null);
assert.equal(select({},[row,row]),null,"Ambiguous promotion must fail closed");
assert.equal(select({form:"LOW"}),null,"Low Mass must not acquire Schola notation");
assert.equal(select({schola:{...ctx.schola,musicStatus:"OBSERVED"}}),null);
assert.equal(select({schola:{...ctx.schola,composedWorkId:"FAURE"}}),null);
assert.equal(select({localProgramme:{ordinarySelections:{KYRIE:"XI"}}}),null);
assert.equal(select({},[row],[{...candidate,publication:"BLOCKED"}]),null);
assert.equal(select({},[row],[{...candidate,musicalNotationVerified:false}]),null);
assert.equal(select({},[row],[{...candidate,gabc:"(c4) no source"}]),null);

const proper={...candidate,scoreId:"TEST-GATE-INTROIT",selectionKey:"PROPER_INTROIT",
 settingId:"ORIGINAL_1961",sourceCueId:null,sourceParagraphId:"INTROIT.1",
 sourceBlockId:"AO.SM.B014",sourcePath:"Tempora/Adv1-0",
 sourceLatin:"Ad te levavi animam meam."};
const properApproval={schema:SCHOLA_DOCK_APPROVAL_SCHEMA,score_status:"approved",
 scoreId:proper.scoreId,trackId:"INTROIT",settingId:proper.settingId,
 sourcePath:"Tempora/Adv1-0",sourceParagraphId:"INTROIT.1",
 sourceBlockId:"AO.SM.B014",gabcSha256:proper.gabcSha256,
 sourceUrl:proper.sourceUrl,licence:"CC0-1.0"};
const properCtx={
 schola:{trackId:"INTROIT",segmentId:"INTROIT.1",
  latin:"Ad te levavi animam meam.",musicStatus:"EXPECTED_NOT_OBSERVED"},
 form:"MISSA_CANTATA_SIMPLE",
 resolvedMass:{proper:{data:{sourcePath:"Tempora/Adv1-0"}},
  sourceCertifiedInlineChantSelections:{
   status:"SOURCE_CERTIFIED_1962_MUSIC",
   selections:{PROPER_INTROIT:"ORIGINAL_1961"}}},
 localProgramme:null,
 approvalRegistry:[properApproval],
 approvedScores:[proper]
};
assert.equal(selectApprovedScholaDockScore(properCtx)?.score_status,"approved");
assert.equal(selectApprovedScholaDockScore({...properCtx,
 resolvedMass:{...properCtx.resolvedMass,
  proper:{data:{sourcePath:"Tempora/Adv2-0"}}}}),null,
 "Changing the selected 1962 Proper must invalidate the score");
assert.equal(selectApprovedScholaDockScore({...properCtx,
 approvedScores:[{...proper,sourcePath:"Tempora/Adv2-0"}]}),null);
console.log("SCHOLA_DOCK_APPROVAL_GATE_PASS explicit reviewed score/source/setting required; nonmatching and provisional sources fail closed");
