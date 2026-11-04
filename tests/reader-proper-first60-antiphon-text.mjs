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
// This is a source-selected annual sample, not a permanently fixed set of
// 60 chants: calendar Proper transport had failed intermittently when the
// DayResolver was called on 12 dates concurrently. Validate complete,
 // source-derived per-record decisions and an explicit known-hold cohort
// instead of accepting a different guessed 47/13, 46/14, etc. each run.
const exact=audit.scoreEvidence.filter(x=>x.fullAntiphonLexicalEquality).length;
const holds=audit.textDifferenceHolds.length;
assert.equal(exact+holds,60);
assert.equal(audit.counts.fullAntiphonLexicalEqual,exact);
assert.equal(audit.counts.literalDifferenceHolds,holds);
for(const part of ["in","of","co"]){
 const family=audit.counts.byFamily[part];
 assert.equal(family.exact+family.hold,20);
 assert.equal(family.exact,audit.scoreEvidence.filter(x=>
  x.part===part&&x.fullAntiphonLexicalEquality).length);
}
const previouslyIdentifiedVariants=new Set([
 "GREGOBASE-42","GREGOBASE-67","GREGOBASE-211",
 "GREGOBASE-339","GREGOBASE-616","GREGOBASE-937",
 "GREGOBASE-1071","GREGOBASE-1127","GREGOBASE-1145",
 "GREGOBASE-1319","GREGOBASE-1363","GREGOBASE-230",
 "GREGOBASE-628","GREGOBASE-325","GREGOBASE-591"
]);
assert.ok(audit.textDifferenceHolds.every(x=>
 previouslyIdentifiedVariants.has(x.scoreId)),
 "A NEW source-text variant must be independently reviewed before this gate passes");
assert.ok(audit.textDifferenceHolds.every(x=>
 !x.fullAntiphonLexicalEquality&&!x.publicScore&&!x.userEditorialApproval));

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
const palm=audit.scoreEvidence.find(x=>x.scoreId==="GREGOBASE-628");
if(palm){
 assert.equal(palm.status,"SELECTED_1962_HAS_ADDITIONAL_TEXT");
 assert.equal(palm.fullAntiphonLexicalEquality,false);
 assert.ok(palm.evidence.selected1962AntiphonNormalized.startsWith(
  palm.evidence.originalGabcAntiphonNormalized+" et dederunt in escam meam fel"));
 assert.equal(palm.publicScore,false);
 assert.equal(palm.userEditorialApproval,false);
}
// The historical GABC and selected 1962 source are different witnesses.
// These two newly encountered Lenten variants are distinct, unreleased holds.
for(const [id,originalWords,selectedWords] of [
 ["GREGOBASE-325",
  "precatus est moyses in conspectu domini dei sui et dixit precatus est",
  "precatus est moyses in conspectu domini dei sui et dixit quare"],
 ["GREGOBASE-591",
  "iustitiae domini rectae laetificantes corda et dulciora",
  "iustitiae domini rectae laetificantes corda et iudicia eius dulciora"]
]){
 const row=audit.scoreEvidence.find(x=>x.scoreId===id);
 if(!row)continue;
 assert.equal(row.fullAntiphonLexicalEquality,false);
 assert.ok(row.evidence.originalGabcAntiphonNormalized.startsWith(originalWords));
 assert.ok(row.evidence.selected1962AntiphonNormalized.startsWith(selectedWords));
 assert.equal(row.publicScore,false);
}
assert.ok(audit.scoreEvidence.every(x=>!x.publicScore&&
 !x.complete1962GabcMusicalUnderlayVerified&&
 !x.original1961PitchAndNeumeFacsimileVerified&&
 !x.exactReaderBlockAndCueCertified&&
 (x.evidence.originalScoreNoteBearingTokens>0||
  x.evidence.noteGroupInventoryStatus==="PROPER_GABC_NOTE_GROUP_TOKENIZATION_HOLD")));
assert.equal(audit.publication.publicReaderScores,0);
assert.equal(audit.counts.noteGroupTokenizationHolds,0,
 "All first-60 GABC source groups must be mechanically tokenizable; musical parity remains unreviewed");
// Guard against reintroducing concurrent DayResolver calls that made
// 17 real 2026 formularies intermittently report Proper.status='failed'.
const annualBuilder=readFileSync(new URL(
 "../scripts/schola/build-2026-selected-repertoire.mjs",import.meta.url),"utf8");
assert.ok(annualBuilder.includes(
 "for(const date of ids)settled.push(await resolveOne(date))"),
 "Production annual DayResolver must capture source dates sequentially");
assert.ok(!annualBuilder.includes("Promise.all(ids.map(async date"),
 "Concurrent Mass source resolution may not return");
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
console.log("PASS 60 source-bound antiphons: "+exact+" exact, "+holds+" known variants held, 0 musical approvals");
