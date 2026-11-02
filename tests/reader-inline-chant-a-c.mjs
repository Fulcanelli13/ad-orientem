import assert from "node:assert/strict";
import {selectApprovedInlineScore,INLINE_CHANT_SCHEMA,INLINE_CHANT_CSS}
 from "../src/mass/reader-inline-chant.js";
import {APPROVED_MASS_INLINE_GABC} from "../src/mass/reader-inline-chant-approved.js";

const PRIEST="AO.SM.C0259",ANSWER="AO.SM.C0260";
const mk=(cue,source)=>({
 schema:INLINE_CHANT_SCHEMA,sourceCueId:cue,
 approval:"USER_AND_MUSICAL_SOURCE_REVIEWED",
 publication:"PUBLIC_APPROVED",
 sourceTextVerified:true,musicalNotationVerified:true,
 sourceLatin:source,scoreId:"TEST-DO-NOT-PUBLISH",
 gabcSha256:"a".repeat(64),sourceWitness:"TEST EDITION — NOT RELEASED",
 sourceUrl:"https://example.org/test-do-not-publish",
 gabc:"(c4)I(f)te(g) mis(h)sa(g) est(f)(::)"
});
const row=(cue,latin)=>({kind:"TEXT",sourceCueIds:[cue],primary:latin,
 secondary:"English translation",alternate:null});
const p=mk(PRIEST,"℣. Ite, missa est.");
const r=mk(ANSWER,"℟. Deo grátias.");
const corpus=[p,r];
const pick=(cue,paragraph,form="MISSA_CANTATA_SIMPLE",scores=corpus)=>
 selectApprovedInlineScore({cueId:cue,paragraph,form,approvedScores:scores});
assert.equal(APPROVED_MASS_INLINE_GABC.length,0,
 "Unapproved GregoBase archive must NOT expose production music");
assert.equal(pick(PRIEST,row(PRIEST,p.sourceLatin))?.sourceCueId,PRIEST);
assert.equal(pick(ANSWER,row(ANSWER,r.sourceLatin))?.sourceCueId,ANSWER);
assert.equal(pick(PRIEST,row(PRIEST,p.sourceLatin),"SOLEMN")?.sourceCueId,PRIEST);
assert.equal(pick(PRIEST,row(PRIEST,p.sourceLatin),"LOW"),null);
assert.equal(pick(PRIEST,row(PRIEST,p.sourceLatin),"MISSA_CANTATA_INCENSE")?.sourceCueId,PRIEST);
assert.equal(pick(PRIEST,row(ANSWER,p.sourceLatin)),null,"Wrong canonical cue cannot borrow score");
assert.equal(pick(PRIEST,row(PRIEST,"℣. Benedicamus Domino.")),null,"Wrong text forbidden");
assert.equal(pick(PRIEST,{...row(PRIEST,p.sourceLatin),sourceCueIds:[PRIEST,ANSWER]}),null);
assert.equal(pick(PRIEST,{...row(PRIEST,p.sourceLatin),kind:"RUBRIC"}),null);
assert.equal(pick(PRIEST,row(PRIEST,p.sourceLatin),"SOLEMN",[p,p]),null,"Ambiguous registry must fail closed");
for(const patch of [
 {publication:"RESEARCH_ONLY"},
 {approval:"PENDING_USER_REVIEW"},
 {musicalNotationVerified:false},
 {sourceTextVerified:false},
 {gabcSha256:"INVALID"},
 {gabc:"fake score"},
 {sourceUrl:"javascript:alert(1)"}
]){
 assert.equal(pick(PRIEST,row(PRIEST,p.sourceLatin),"SOLEMN",[{...p,...patch}]),null,
  "Incomplete / untrusted publication cannot display music: "+JSON.stringify(patch));
}
assert.match(INLINE_CHANT_CSS,/grid-template-columns:24px minmax\(0,1fr\)/);
assert.match(INLINE_CHANT_CSS,/@media\(max-width:480px\)/);
assert.match(INLINE_CHANT_CSS,/prefers-reduced-motion/);
console.log("PASS source-authenticated A/C cue-first score gate (incl. LOW, Requiem/Benedicamus, source mismatch, ambiguity and mobile CSS)");
