import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditFirst60CompleteAntiphonText,FIRST60_TEXT_GATE_SCHEMA}
 from "../src/mass/reader-proper-first60-antiphon-text.js";
const root=new URL("../.tmp/schola-1962-selected-annual/",import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name,root),"utf8"));
const source=read("2026-selected-proper-first60-print-review.json");
const original=read("2026-first60-complete-antiphon-text-audit.json");
const audit=auditFirst60CompleteAntiphonText({packet:source});
assert.deepEqual(audit,original,"Antiphon audit drifted from immutable first-60 source pack");
assert.equal(audit.schema,FIRST60_TEXT_GATE_SCHEMA);
assert.equal(audit.counts.audited,60);
assert.equal(audit.counts.fullAntiphonLexicalEqual,51);
assert.equal(audit.counts.literalDifferenceHolds,9);
assert.equal(audit.counts.byFamily.in.exact,18);
assert.equal(audit.counts.byFamily.of.exact,16);
assert.equal(audit.counts.byFamily.co.exact,17);
assert.deepEqual(audit.textDifferenceHolds.map(x=>x.scoreId).sort(),[
 "GREGOBASE-42","GREGOBASE-67","GREGOBASE-211",
 "GREGOBASE-339","GREGOBASE-616","GREGOBASE-937",
 "GREGOBASE-1071","GREGOBASE-1127","GREGOBASE-1145"
].sort());
assert.ok(audit.scoreEvidence.every(x=>!x.publicScore&&
 !x.complete1962GabcMusicalUnderlayVerified&&
 !x.original1961PitchAndNeumeFacsimileVerified&&
 !x.exactReaderBlockAndCueCertified&&
 x.evidence.originalScoreNoteBearingTokens>0));
assert.equal(audit.publication.publicReaderScores,0);
const tampered=structuredClone(source);
tampered.candidates[0].scoreGabc+="alteration";
assert.throws(()=>auditFirst60CompleteAntiphonText({packet:tampered}),
 /REVIEW_SCORE_ORIGINAL_IDENTITY_OR_RELEASE_GATE_CHANGED/);
const fabricated=structuredClone(source);
fabricated.candidates[0].review.allNotePitchesVerified=true;
assert.throws(()=>auditFirst60CompleteAntiphonText({packet:fabricated}),
 /REVIEW_SCORE_ORIGINAL_IDENTITY_OR_RELEASE_GATE_CHANGED/);
const incomplete=structuredClone(source);
incomplete.candidates.pop();
assert.throws(()=>auditFirst60CompleteAntiphonText({packet:incomplete}),
 /SOURCE_FIRST_60_EDITORIAL_PACKET_INVALID/);
console.log("PASS complete antiphon-text parity: 51 exact of 60, 9 source variants held; zero printed-note or public-score approvals");
