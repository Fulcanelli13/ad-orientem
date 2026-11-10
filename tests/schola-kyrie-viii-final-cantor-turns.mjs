import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  reviewKyrieVIIICantorTurns,KYRIE_VIII_TURN_SCHEMA
} from "../src/mass/reader-kyrie-viii-cantor-turns-review.js";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";
const corpus=JSON.parse(readFileSync(new URL(
  "../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
const review=reviewKyrieVIIICantorTurns({corpus});
assert.equal(review.schema,KYRIE_VIII_TURN_SCHEMA);
assert.equal(review.status,"RUBRICALLY_MAPPED_MUSICAL_PROOF_NOT_APPROVED");
assert.equal(review.sourceRule,
 "Graduale Romanum (1961), De ritibus servandis in cantu Missae, II");
assert.equal(review.sourceScoreId,"GREGOBASE-1184");
assert.equal(review.finalCueId,"AO.SM.C0052");
assert.equal(review.canonicalMassCues,9);
assert.equal(review.extraMassCues,0);
assert.equal(review.firstEightCues.length,8);
assert.deepEqual(review.firstEightCues.map(x=>x.sourceCueId),
 Array.from({length:8},(_,i)=>"AO.SM.C"+String(44+i).padStart(4,"0")));
assert.ok(review.firstEightCues.every(row=>
 row.choirPattern==="ALTERNATING_CANTORS_OR_CHOIR_HALVES" &&
 row.startingSide==="LOCAL_UNSPECIFIED" && row.observed===false));
assert.equal(review.printedPartCount,3);
assert.deepEqual(review.subphrases.map(x=>x.owner),[
  "CANTORS_OR_FIRST_CHOIR","OTHER_CHOIR_HALF","FULL_CHOIR_TOGETHER"
]);
assert.deepEqual(review.subphrases.map(x=>x.sourceStar),[
  "BEFORE_SINGLE_STAR","AFTER_SINGLE_BEFORE_DOUBLE_STAR","AFTER_DOUBLE_STAR"
]);
assert.ok(review.subphrases.every(x=>x.sourceCueId==="AO.SM.C0052"&&
 x.performance==="EXPECTED_NOT_OBSERVED"&&x.sourceNoteVerified===false));
assert.ok(review.subphrases[0].rawGabcSourceFragment.includes("Ký(k')"));
assert.ok(review.subphrases[1].rawGabcSourceFragment.includes("kjkvJI"));
assert.ok(review.subphrases[2].rawGabcSourceFragment.includes("e(gxhvFE'Dgf)"));
assert.equal(review.userEditorialApproval,false);
assert.equal(review.musicalNotationVerified,false);
assert.equal(review.publication,"BLOCKED");
assert.equal(review.publicScoreCount,0);
const original=offlineKyrialeResearchScore("KYRIE","MASS_08");
const withoutDouble={...original,gabc:original.gabc.replace("<clear>**","")};
assert.equal(reviewKyrieVIIICantorTurns({corpus,source:withoutDouble}).status,
 "HOLD_ORIGINAL_RUBRIC_OR_SOURCE_DRIFT");
const wrongFinal={...original,gabc:original.gabc.replace("Ký(k')ri(j)e(kvJI'jkh.1) <clear>*",
 "Ký(k')ri(j)e(kvJI'jkh.1) <clear>**")};
assert.equal(reviewKyrieVIIICantorTurns({corpus,source:wrongFinal}).status,
 "HOLD_ORIGINAL_RUBRIC_OR_SOURCE_DRIFT");
const altered=structuredClone(corpus);
altered.blocks.find(x=>x.Macro_ID==="AO.SM.M02").units[8].cue_id="AO.SM.C1234";
assert.equal(reviewKyrieVIIICantorTurns({corpus:altered}).status,
 "HOLD_ORIGINAL_RUBRIC_OR_SOURCE_DRIFT");
console.log("SCHOLA_KYRIE_VIII_FINAL_TURNS_PASS 9 native cues; 3 cantors/alternate/full subphrases; no musical/public approval");
