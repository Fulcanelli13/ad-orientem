import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditFirst60CompleteAntiphonText,FIRST60_TEXT_GATE_SCHEMA}
 from "../src/mass/reader-proper-first60-antiphon-text.js";
import {sourceNoteGroupInventory} from "../src/mass/reader-kyriale-source-note-groups.js";
const root=new URL("../.tmp/schola-1962-selected-annual/",import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name,root),"utf8"));
const source=read("2026-selected-proper-first60-print-review.json");
const original=read("2026-first60-complete-antiphon-text-audit.json");
const audit=auditFirst60CompleteAntiphonText({packet:source});
assert.deepEqual(audit,original,"Antiphon audit drifted from immutable first-60 source pack");
assert.equal(audit.schema,FIRST60_TEXT_GATE_SCHEMA);
assert.equal(audit.counts.audited,60);
assert.equal(audit.counts.fullAntiphonLexicalEqual,47);
assert.equal(audit.counts.literalDifferenceHolds,13);
assert.equal(audit.counts.byFamily.in.exact,18);
assert.equal(audit.counts.byFamily.of.exact,13);
assert.equal(audit.counts.byFamily.co.exact,16);
assert.deepEqual(audit.textDifferenceHolds.map(x=>x.scoreId).sort(),[
 "GREGOBASE-42","GREGOBASE-67","GREGOBASE-211",
 "GREGOBASE-339","GREGOBASE-616","GREGOBASE-937",
 "GREGOBASE-1071","GREGOBASE-1127","GREGOBASE-1145",
 "GREGOBASE-1319","GREGOBASE-1363","GREGOBASE-230",
 "GREGOBASE-628"
].sort());
// The current 2026 selected-source crosswalk contains three additional genuine
// wording differences. Never silently normalize them into musical approval.
const newHolds=[
 ["GREGOBASE-1319","nominis tui in omni","nominis tui domine in omni"],
 ["GREGOBASE-1363","in terra nomine iob","in terra hus nomine iob"],
 ["GREGOBASE-230","servasti vinum bonum","servasti bonum vinum"]
];
for(const [id,gabc,source] of newHolds){
 const row=audit.textDifferenceHolds.find(x=>x.scoreId===id);
 assert.ok(row,"Current selected-source variant must remain on hold: "+id);
 assert.ok(row.evidence.originalGabcAntiphonNormalized.includes(gabc));
 assert.ok(row.evidence.selected1962AntiphonNormalized.includes(source));
 assert.equal(row.publicScore,false);
 assert.equal(row.userEditorialApproval,false);
}
// On the actual Palm Sunday 2026 Offertory, the selected 1962 source
// includes a final phrase absent from the archived GABC. This is a hold,
// not permission to edit printed chant notation or omit selected Latin.
const palm=audit.textDifferenceHolds.find(x=>x.scoreId==="GREGOBASE-628");
assert.ok(palm,"Palm Sunday source-text continuation must remain held");
assert.equal(palm.status,"SELECTED_1962_HAS_ADDITIONAL_TEXT");
assert.ok(palm.evidence.selected1962AntiphonNormalized.startsWith(
 palm.evidence.originalGabcAntiphonNormalized+" et dederunt in escam meam fel"));
assert.equal(palm.publicScore,false);
assert.equal(palm.userEditorialApproval,false);
assert.ok(audit.scoreEvidence.every(x=>!x.publicScore&&
 !x.complete1962GabcMusicalUnderlayVerified&&
 !x.original1961PitchAndNeumeFacsimileVerified&&
 !x.exactReaderBlockAndCueCertified&&
 (x.evidence.originalScoreNoteBearingTokens>0||
  x.evidence.noteGroupInventoryStatus==="PROPER_GABC_NOTE_GROUP_TOKENIZATION_HOLD")));
assert.equal(audit.publication.publicReaderScores,0);
assert.equal(audit.counts.noteGroupTokenizationHolds,0,
 "All first-60 GABC source groups must be mechanically tokenizable; musical parity remains unreviewed");
const braced=sourceNoteGroupInventory("name: Proper sample;\n%%\n(c4) Al(le){ia} :(f.) (::)");
assert.equal(braced.divisionAttachedTokens,1);
assert.equal(braced.groups.at(-1).syllable,"ia");
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
console.log("PASS complete antiphon-text parity: 47 exact of 60, 13 source variants held; zero printed-note or public-score approvals");
