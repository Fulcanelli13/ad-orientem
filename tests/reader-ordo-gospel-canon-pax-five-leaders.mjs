import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {GOSPEL_CANON_PAX_LEADER_SCORES,gospelCanonPaxLeaderScoresForParagraph}
 from "../src/mass/reader-gospel-canon-pax-leader-reference.js";
import {GOSPEL_1961_REFERENCE_WITNESSES,GOSPEL_RESPONSE_REFERENCE_SCORES}
 from "../src/mass/reader-gospel-response-reference-scores.js";
import {CANON_PAX_1961_WITNESSES,CANON_PAX_REFERENCE_SCORES}
 from "../src/mass/reader-canon-pax-response-reference-scores.js";
import {APPROVED_MASS_INLINE_GABC} from "../src/mass/reader-inline-chant-approved.js";

const corpus=JSON.parse(readFileSync(new URL(
 "../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
const byCue=new Map(corpus.blocks.flatMap(b=>b.units??[]).map(u=>[u.cue_id,u]));
const witness=new Map([...GOSPEL_1961_REFERENCE_WITNESSES.map(w=>[w.sourceId,w.gabc]),
 ...CANON_PAX_1961_WITNESSES.map(w=>[w.sourceId,w.fullSourceGabc])]);
const expected=[
 {cue:"AO.SM.C0082",src:4490,i:0},
 {cue:"AO.SM.C0082",src:4491,i:0},
 {cue:"AO.SM.C0206",src:7282,i:0},
 {cue:"AO.SM.C0217",src:4327,i:0},
 {cue:"AO.SM.C0219",src:4327,i:2}
];
assert.equal(GOSPEL_CANON_PAX_LEADER_SCORES.length,5);
for(const row of expected){
 const score=GOSPEL_CANON_PAX_LEADER_SCORES.find(s=>s.sourceId===row.src&&
   s.sourceCueIds[0]===row.cue);
 assert.ok(score,"Missing leader "+row.cue+" "+row.src);
 assert.equal(score.publicScoreApproved,false);
 assert.equal(score.sourceLatin,byCue.get(row.cue)?.latin);
 assert.equal(score.sourcePhraseIndex,row.i);
 assert.equal(score.gabc.match(/%%\n([\s\S]*)/)[1].trim(),
  (witness.get(row.src).split("%%")[1].split("(::)")[row.i].trim()
   .replace(/^\(Z\)\s*/,"").startsWith("(c3)")?
   witness.get(row.src).split("%%")[1].split("(::)")[row.i].trim().replace(/^\(Z\)\s*/,""):
   "(c3) "+witness.get(row.src).split("%%")[1].split("(::)")[row.i].trim()
    .replace(/^\(Z\)\s*/,""))+" (::)",
  "No new notes or melodic edits compared with original 1961 GABC");
}
const make=(cue)=>({id:cue,sourceCueIds:[cue],primary:byCue.get(cue).latin,
 secondary:byCue.get(cue).english,kind:"TEXT",speakerRole:"PRIEST"});
const ordinary={schema:"ao-resolved-mass-v2",distinctRite:"NONE",form:"SOLEMN"};
const run=(p,{form="SOLEMN",mass=ordinary,gospel="GOSPEL_STANDARD",paragraphs=[p]}={})=>
 gospelCanonPaxLeaderScoresForParagraph({paragraph:p,paragraphs,form,
 resolvedMass:mass,selectedSettings:{GOSPEL_TONE:gospel}});
const gospel=make("AO.SM.C0082");
assert.deepEqual(run(gospel).map(s=>s.sourceId),[4490],"Default Gospel fixed greeting uses standard source");
assert.deepEqual(run(gospel,{gospel:"GOSPEL_ALTERNATE_AD_LIBITUM"}).map(s=>s.sourceId),[4491],
 "Explicit alternate Gospel choice changes the very same source cue");
assert.equal(run(gospel,{gospel:"FAKE"}).length,0,"Unknown Gospel tone fails closed");
assert.equal(run(gospel,{form:"LOW"}).length,0,"Low Mass text only");
assert.equal(run(gospel,{paragraphs:[gospel,gospel]}).length,0,"Duplicate Gospel cues fail closed");
assert.equal(run({...gospel,primary:"Another Latin",secondary:"Another translation"}).length,0,
 "Invalid Latin cannot inherit a chant just from cue ID");
for(const [cue,src] of [["AO.SM.C0206",7282],["AO.SM.C0217",4327],["AO.SM.C0219",4327]]){
 const p=make(cue);
 assert.deepEqual(run(p).map(s=>s.sourceId),[src],"Fixed ordinary Mass chant source "+cue);
 assert.equal(run(p,{mass:{...ordinary,distinctRite:"REQUIEM"}}).length,0);
 assert.equal(run(p,{mass:null}).length,0);
 assert.equal(run(p,{form:"LOW"}).length,0);
 assert.equal(run({...p,primary:"An unrelated prayer",secondary:"wrong"}).length,0);
}
assert.equal(GOSPEL_RESPONSE_REFERENCE_SCORES.length,4,
 "Both response phrases remain available for each separately chosen Gospel tone");
assert.equal(CANON_PAX_REFERENCE_SCORES.length,3,
 "Canonical Canon/Pax responses are untouched");
assert.equal(APPROVED_MASS_INLINE_GABC.length,2,
 "No research music may be automatically added to the publicly approved score bank");
console.log("PASS 5 real-source Gospel/Canon/Pax leader GABCs; Gospel standard/alternate switch; 3 ordinary fixed chants; text exact; Low/Requiem guards; no public approval");
