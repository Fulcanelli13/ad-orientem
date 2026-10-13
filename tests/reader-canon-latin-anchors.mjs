import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolveCanonLatinWordAnchors} from "../src/mass/reader-canon-latin-anchors.js";
const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const audit=load("../data/research/mass-canon-62-source-trigger-audit-20261013.json");
const sung=load("../data/presentation/reader-text-sung.v1.json");
const original=JSON.stringify(sung);
const cues=new Map(sung.blocks.flatMap(b=>(b.units??[]).map(u=>[u.cue_id,u.latin])));
let exact=0,nonText=0;
for(const item of audit.rows){
 const latin=cues.get(item.cueId);
 assert.equal(latin,item.sourceLatin,item.id+" source text differs");
 const result=resolveCanonLatinWordAnchors({sourceLatin:latin,
   anchorKind:item.sourceAnchorType,anchorLatin:item.verifiedSourceWordAnchor});
 if(item.sourceAnchorType!=="SOURCE_LATIN_WORDS"){
   nonText++;
   assert.equal(result.status,"NON_TEXT_SOURCE_EVENT",item.id);
   assert.equal(result.spans.length,0,"Nontext/bell cannot attach to prayer words");
   continue;
 }
 exact++;
 assert.equal(result.status,"WORD_MATCH_EXACT",item.id+" "+item.verifiedSourceWordAnchor);
 assert.ok(result.spans.length>0);
 for(const span of result.spans){
   assert.equal(latin.slice(span.start,span.end),span.sourceText,
     "Original Latin cross/accents must not change");
   assert.equal(span.sourceCharactersUnchanged,true);
 }
}
assert.deepEqual([exact,nonText],[50,12]);
assert.equal(JSON.stringify(sung),original,"Frozen Latin donor mutated by read-only anchor projection");
// Cross glyphs interrupt a *single* Latin word, not new prayer cues.
const crosses=resolveCanonLatinWordAnchors({
 sourceLatin:"bene ✠ díctam, adscríp ✠ tam, ra ✠ tam",
 anchorKind:"SOURCE_LATIN_WORDS",
 anchorLatin:"benedictam / adscriptam / ratam",
});
assert.equal(crosses.status,"WORD_MATCH_EXACT");
assert.equal(crosses.spans.length,3);
assert.ok(crosses.spans.every(s=>s.sourceText.includes("✠")));
assert.deepEqual(crosses.spans.map(s=>s.sourceText),[
 "bene ✠ díctam","adscríp ✠ tam","ra ✠ tam",
]);
const ligatures=resolveCanonLatinWordAnchors({
 sourceLatin:"℣. Per ómnia sǽcula sæculórum.",
 anchorKind:"SOURCE_LATIN_WORDS",anchorLatin:"Per omnia saecula saeculorum",
});
assert.equal(ligatures.status,"WORD_MATCH_EXACT");
assert.match(ligatures.spans[0].sourceText,/sǽcula sæculórum/);
const ambiguous=resolveCanonLatinWordAnchors({
 sourceLatin:"Amen. Amen.",anchorKind:"SOURCE_LATIN_WORDS",anchorLatin:"Amen",
});
assert.equal(ambiguous.status,"MISSING_OR_AMBIGUOUS_LATIN_ANCHOR");
const invented=resolveCanonLatinWordAnchors({
 sourceLatin:"Quam oblationem",
 anchorKind:"SOURCE_LATIN_WORDS",anchorLatin:"Elevationem Hostiae",
});
assert.equal(invented.status,"MISSING_OR_AMBIGUOUS_LATIN_ANCHOR");
const reverse=resolveCanonLatinWordAnchors({
 sourceLatin:"A et B",anchorKind:"SOURCE_LATIN_WORDS",anchorLatin:"B / A",
});
assert.equal(reverse.status,"NON_SEQUENTIAL_LATIN_ANCHORS");
console.log("PASS: 50/50 precise Canon Latin word anchors; 12 non-text cues excluded; ligatures, crosses and source offsets preserved.");
