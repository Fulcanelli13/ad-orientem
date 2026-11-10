import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {buildKyrieVIIIReviewManifest} from "../scripts/schola/prepare-kyrie-viii-review-manifest.mjs";
import {selectApprovedScholaDockScore,SCHOLA_DOCK_APPROVAL_SCHEMA}
 from "../src/mass/reader-schola-dock-approved.js";

const pkg=buildKyrieVIIIReviewManifest();
assert.equal(pkg.status,"SOURCE_CUES_READY_MUSICAL_PROOF_AND_PUBLICATION_HELD");
assert.equal(pkg.verifiedResearchGabcSha256,pkg.source.sourceGabcSha256,
 "Manifest must reject changed GABC even when 4-line layout is still intact");
assert.equal(pkg.approvedScores,0);
assert.equal(pkg.publishedScores,0);
assert.equal(pkg.approval,"NOT_GRANTED");
assert.equal(pkg.printedSourceLines,4);
assert.equal(pkg.sourceCues,9);
assert.deepEqual(pkg.repeatPattern,[3,3,2,1]);
assert.equal(pkg.candidates.length,9);
assert.deepEqual(pkg.candidates.map(x=>x.sourceLine),[0,0,0,1,1,1,2,2,3]);
assert.deepEqual(pkg.candidates.map(x=>x.sourceCueId),
 Array.from({length:9},(_,i)=>"AO.SM.C"+String(i+44).padStart(4,"0")));
assert.ok(pkg.candidates.every((score,i)=>
 score.schema==="ao-mass-inline-approved-gabc-v1"&&
 score.settingId==="MASS_08"&&score.selectionKey==="KYRIE"&&
 score.riteScope==="ORDINARY"&&score.sourceBlockId==="AO.SM.B015"&&
 score.scoreId==="GREGOBASE-1184-"+score.sourceCueId&&
 score.sourceLine===pkg.candidates[i].sourceLine &&
 score.gabc.includes("%%") && score.gabc.includes("(::)")&&
 score.sourceTextVerified===true &&
 score.musicalNotationVerified===false &&
 score.userEditorialApproval===false &&
 score.publication==="BLOCKED" &&
 score.approval!=="USER_AND_MUSICAL_SOURCE_REVIEWED" &&
 score.gabcSha256===createHash("sha256").update(score.gabc,"utf8").digest("hex")
));
assert.equal(pkg.candidates[0].gabc.split("%%")[1],
 pkg.candidates[2].gabc.split("%%")[1]);
assert.equal(pkg.candidates[3].gabc.split("%%")[1],
 pkg.candidates[5].gabc.split("%%")[1]);
assert.equal(pkg.candidates[6].gabc.split("%%")[1],
 pkg.candidates[7].gabc.split("%%")[1]);
assert.notEqual(pkg.candidates[7].gabc.split("%%")[1],
 pkg.candidates[8].gabc.split("%%")[1],
 "Final Kyrie must not reuse the preceding twice-repeated melody");
const rows=pkg.candidates.map(score=>({
  schema:SCHOLA_DOCK_APPROVAL_SCHEMA,
  score_status:"research_hold",
  scoreId:score.scoreId,trackId:"KYRIE",settingId:score.settingId,
  sourceCueId:score.sourceCueId,gabcSha256:score.gabcSha256,
  sourceUrl:score.sourceUrl,licence:score.licence
}));
const base={form:"MISSA_CANTATA_SIMPLE",
 resolvedMass:{form:"MISSA_CANTATA_SIMPLE"},
 localProgramme:{ordinarySelections:{KYRIE:"MASS_08"}},
 approvalRegistry:rows,approvedScores:pkg.candidates
};
for(const score of pkg.candidates){
 const schola={trackId:"KYRIE",segmentId:score.sourceCueId,cueId:score.sourceCueId,
  latin:score.sourceLatin,musicStatus:"EXPECTED_NOT_OBSERVED"};
 assert.equal(selectApprovedScholaDockScore({...base,schola}),null,
  "No Kyrie review candidate may surface in production: "+score.sourceCueId);
 assert.equal(selectApprovedScholaDockScore({...base,schola,
  approvalRegistry:rows.map(r=>({...r,score_status:"approved"}))}),null,
  "Changing ONLY promotion row cannot override musical-score approval");
}
assert.equal(buildKyrieVIIIReviewManifest({corpus:{blocks:[]}}).status,"SOURCE_IDENTITY_HOLD");
console.log("SCHOLA_KYRIE_VIII_REVIEW_CANDIDATES_PASS 9 hashes, source cues, blocked publish status; production selector remains silent");
