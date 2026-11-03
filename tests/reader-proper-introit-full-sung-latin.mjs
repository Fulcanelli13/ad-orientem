import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {selected1962IntroitSungText,INTROIT_SUNG_TEXT_SCHEMA}
 from "../src/mass/reader-proper-introit-full-sung-latin.js";
const file=new URL("../.tmp/schola-1962-selected-annual/2026-selected-proper-first60-print-review.json",import.meta.url);
const raw=JSON.parse(readFileSync(file,"utf8"));
assert.equal(raw.schema,"ao-mass-1962-first-60-print-score-collation-v1");
const introits=raw.candidates.filter(x=>x.part==="in");
assert.equal(introits.length,20);
let withGloria=0,withoutGloria=0,abbreviated=0,reprise=0;
const evidence=[];
for(const score of introits){
 const x=selected1962IntroitSungText({
  part:score.part,scoreId:score.scoreId,
  sourceLatin:score.representative.sourceLatin,
  originalGabc:score.scoreGabc
 });
 assert.equal(x.schema,INTROIT_SUNG_TEXT_SCHEMA);
 assert.equal(x.source,"EXACT_SELECTED_1962_LATIN_NOT_GABC_PRINT_SHORTHAND");
 assert.equal(x.segments[0].role,"INTROIT_ANTIPHON");
 assert.equal(x.segments[1].role,"PSALM_VERSE");
 assert.equal(x.segments.at(-1).role,"INTROIT_ANTIPHON_REPEAT");
 // Preserve source punctuation; some original selected sections omit a final period on first use.
 assert.equal(x.segments[0].text.replace(/[.,;:!?]+$/,""),
  x.segments.at(-1).text.replace(/[.,;:!?]+$/,""));
 assert.equal(x.sungLatin.split("\n\n").length,x.segments.length);
 assert.equal(x.publication,"TEXT_REFERENCE_ONLY_MUSIC_REVIEW_HOLD");
 assert.equal(x.musicalUnderlayVerified,false);
 assert.equal(x.psalmToneCadenceVerified,false);
 assert.equal(x.publicNotationApproved,false);
 assert.doesNotMatch(x.sungLatin,/\bE\s+u\s+o\s+u\s+a\s+e\b/i);
 assert.doesNotMatch(x.sungLatin,/<eu>/i);
 if(x.hasFullSourceDoxology){
  withGloria++;
  assert.equal(x.segments.length,4);
  assert.ok(x.segments[2].text.includes("Glória Patri"));
  assert.ok(x.segments[2].text.includes("et Fílio, et Spirítui Sancto"));
  assert.ok(x.segments[2].text.includes("sæculórum. Amen."));
 }else{
  withoutGloria++;
  assert.equal(x.segments.length,3);
  assert.ok(!x.sungLatin.includes("Glória Patri"));
 }
 if(x.warnings.some(w=>w.code==="EUOUAE_NOT_SUNG_LYRICS"))abbreviated++;
 if(x.warnings.some(w=>w.code==="GABC_ANTIPHON_REPRISE_NOT_ENGRAVED"))reprise++;
 evidence.push({scoreId:score.scoreId,
  hasFullSourceDoxology:x.hasFullSourceDoxology,
  sourceSegmentCount:x.segments.length,
  originalGabcUsesEuouae:x.warnings.some(w=>w.code==="EUOUAE_NOT_SUNG_LYRICS"),
  sungLatinIsMusicallyCertified:false,publicScore:false});
}
assert.equal(withGloria,19,
 "Selected 1962 Introit records with Gloria Patri must come from exact liturgical source");
assert.equal(withoutGloria,1,
 "Selected 1962 record without Gloria Patri must not have a doxology invented");
assert.equal(abbreviated,20,
 "All 20 archived GABCs use EUOUAE as a melodic ending symbol, not sung words");
assert.equal(reprise,20,
 "Original GABC abbreviates repeated antiphon; source-selected Latin supplies it");
const mihi=raw.candidates.find(x=>x.scoreId==="GREGOBASE-475");
const full=selected1962IntroitSungText({
 part:mihi.part,scoreId:mihi.scoreId,
 sourceLatin:mihi.representative.sourceLatin,originalGabc:mihi.scoreGabc
});
assert.equal(full.segments[0].text,
 "Mihi autem nimis honoráti sunt amíci tui, Deus: nimis confortátus est principátus eórum.");
assert.equal(full.segments[1].text,
 "Dómine, probásti me et cognovísti me: tu cognovísti sessiónem meam et resurrectiónem meam.");
assert.equal(full.segments[2].text,
 "Glória Patri, et Fílio, et Spirítui Sancto. Sicut erat in princípio, et nunc, et semper, et in sǽcula sæculórum. Amen.");
assert.equal(full.segments[3].text,full.segments[0].text);
assert.deepEqual(full.warnings.map(x=>x.code).sort(),[
 "EUOUAE_NOT_SUNG_LYRICS","GABC_ANTIPHON_REPRISE_NOT_ENGRAVED",
 "GABC_GLORIA_ABBREVIATED"
].sort());
const missingRepeat={...mihi.representative,sourceLatin:
 mihi.representative.sourceLatin.replace(/\n℣\. Mihi autem[^\n]+$/,"")};
assert.throws(()=>selected1962IntroitSungText({
 part:mihi.part,scoreId:mihi.scoreId,
 sourceLatin:missingRepeat.sourceLatin,originalGabc:mihi.scoreGabc
}),/INTROIT_ANTIPHON_REPETITION_NOT_RESOLVED/);
const shortened={...mihi.representative,sourceLatin:
 mihi.representative.sourceLatin.replace(
 "Glória Patri, et Fílio, et Spirítui Sancto. Sicut erat in princípio, et nunc, et semper, et in sǽcula sæculórum. Amen.",
 "Glória Patri.")};
assert.throws(()=>selected1962IntroitSungText({
 part:mihi.part,scoreId:mihi.scoreId,
 sourceLatin:shortened.sourceLatin,originalGabc:mihi.scoreGabc
}),/INTROIT_SELECTED_GLORIA_NOT_COMPLETE/);
console.log("PASS first-60 Introit FULL SUNG LATIN: 20/20 original selected source sequences, 19 actual complete Glória Patri, 1 proper omission, 20 EUOUAE musical mnemonics NOT lyrics, 20 antiphon repetitions, 0 digital musical approvals");
