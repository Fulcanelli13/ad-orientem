import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PREFACE_SOLEMNIOR_ORIGINAL_GABC, PREFACE_SOLEMNIOR_RESEARCH_SCORES}
 from "../src/mass/reader-preface-solemnior-reference-scores.js";
import {APPROVED_MASS_INLINE_GABC}
 from "../src/mass/reader-inline-chant-approved.js";
const evidence=JSON.parse(readFileSync(new URL(
 "../data/mass/preface-1961-solemnior-spi-ictus-print-inspection.v1.json",
 import.meta.url),"utf8"));
assert.equal(evidence.schema,"ao-preface-1961-solemnior-spi-ictus-original-print-witness-v1");
assert.equal(evidence.issueKey,"AO.PREFACE.SOLEMNIOR.ET_CUM.SPÍ.VERTICAL_EPISEMA");
assert.deepEqual(evidence.counts,{
 originalPrintedWitnesses:2,witnessesWithPositiveVisibleMark:1,witnessesUnresolved:1,
 newlyMusicallyCertifiedResponses:0,newlyApprovedPublicScores:0
});
assert.equal(evidence.printedWitnesses.length,2);
const [lu,gr]=evidence.printedWitnesses;
assert.equal(lu.book,"Liber Usualis");
assert.equal(lu.printedPage,"110");
assert.equal(lu.printedSignReading,"VERTICAL_EPISEMA_PRESENT");
assert.equal(lu.inspectionStatus,"PRINTED_SIGN_VISUALLY_SUPPORTED_BY_ORIGINAL_LU_IMAGE");
assert.equal(lu.originalImageSha256.length,64);
assert.equal(lu.evidenceFileSha256.length,64);
assert.equal(gr.book,"Graduale Romanum");
assert.equal(gr.printedPage,"132*");
assert.equal(gr.sourcePdfPageZeroBased,133);
assert.equal(gr.printedSignReading,"INDETERMINATE");
assert.equal(gr.inspectionStatus,"PRINTED_SIGN_NEEDS_CLEARER_GR_SCAN");
assert.equal(gr.evidenceFileSha256.length,64);
assert.deepEqual(gr.detailedNeumeCropNormalized,[0.548,0.285,0.632,0.355]);
assert.equal(gr.detailedNeumeCropFile,"GR132_spi_neume_context.png");
assert.equal(gr.detailedNeumeCropSha256.length,64);
assert.ok(evidence.evidenceCapture.artifactUrl.endsWith("/13614803505"));
assert.equal(evidence.decision.bothOriginalWitnessesIndependentlyConfirmed,false);
assert.equal(evidence.decision.researchScoreApproved,false);
assert.equal(evidence.decision.publicScoreApproved,false);
assert.equal(evidence.decision.all12PrefaceMusicCertified,false);
assert.equal(evidence.decision.action,
 "KEEP_PRIMARY_GABC_UNCHANGED_PENDING_GR_OR_SECOND_EXPERT_READING");
assert.equal(evidence.phrase.primaryGabcNote,"g");
assert.equal(evidence.phrase.alternateGabcNote,"g'");
assert.ok(PREFACE_SOLEMNIOR_ORIGINAL_GABC.includes("spí(g)ri(f)"));
assert.ok(!PREFACE_SOLEMNIOR_ORIGINAL_GABC.includes("spí(g')ri(f)"));
assert.ok(PREFACE_SOLEMNIOR_RESEARCH_SCORES.every(x=>x.publicScoreApproved===false));
assert.equal(APPROVED_MASS_INLINE_GABC.length,2);
console.log("PASS 1961 LU printed spí vertical episema evidence recorded, GR still indeterminate; 0 certified melodies and no public notation changes");
