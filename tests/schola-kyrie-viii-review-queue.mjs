import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {
 prepareKyrieVIIIReview,prepareKyrieVIIIUnapprovedGabcExcerpts,KYRIE_VIII_REVIEW_SOURCE,
 KYRIE_VIII_REVIEW_SCHEMA
} from "../src/mass/reader-kyrie-viii-review-queue.js";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";
const corpus=JSON.parse(readFileSync(new URL(
 "../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
const exactResearchSource=offlineKyrialeResearchScore("KYRIE","MASS_08");
assert.equal(createHash("sha256").update(exactResearchSource.gabc,"utf8").digest("hex"),
 KYRIE_VIII_REVIEW_SOURCE.sourceGabcSha256,
 "GregoBase Kyrie VIII neumes changed: source hash must be re-reviewed");
const result=prepareKyrieVIIIReview({corpus});
assert.equal(result.schema,KYRIE_VIII_REVIEW_SCHEMA);
assert.equal(result.status,"READY_FOR_NOTE_BY_NOTE_PRINT_REVIEW_NOT_PUBLISHABLE");
assert.equal(result.scoreId,"GREGOBASE-1184");
assert.equal(result.sourceCues,9);
assert.equal(result.printedSourceLines,4);
assert.deepEqual(result.printedRepeatPattern,[3,3,2,1]);
assert.equal(result.rows.length,9);
assert.deepEqual(result.rows.map(x=>x.cueId),Array.from({length:9},(_,i)=>
 "AO.SM.C"+String(44+i).padStart(4,"0")));
assert.deepEqual(result.rows.map(x=>x.sourceLine),[0,0,0,1,1,1,2,2,3]);
assert.deepEqual(result.rows.map(x=>x.facsimileFolios),[
 ["28*"],["28*"],["28*"],["28*"],["28*"],["28*"],
 ["28*","29*"],["28*","29*"],["29*"]
]);
assert.equal(result.sourceWitness,"Graduale Romanum, Solesmes 1961, pp. 28*–29*");
assert.deepEqual(result.rows.map(x=>x.sourceLatin),[
 "Kýrie, eléison.","Kýrie, eléison.","Kýrie, eléison.",
 "Christe, eléison.","Christe, eléison.","Christe, eléison.",
 "Kýrie, eléison.","Kýrie, eléison.","Kýrie, eléison."
]);
assert.ok(result.rows.every(x=>x.noteComparison==="NOT_DONE"&&
 !x.userEditorialApproval&&!x.musicalNotationVerified&&
 x.status==="RESEARCH_REVIEW_HOLD_NOT_PUBLIC"));
assert.equal(result.approvedScores,0);
assert.equal(result.publishedScores,0);
assert.equal(KYRIE_VIII_REVIEW_SOURCE.userApproved,false);
assert.equal(KYRIE_VIII_REVIEW_SOURCE.publication,"BLOCKED");
const source=offlineKyrialeResearchScore("KYRIE","MASS_08");
assert.equal(prepareKyrieVIIIReview({corpus,source:{...source,scoreId:"GREGOBASE-2468"}})
 .status,"HOLD_SOURCE_MISMATCH","Do not confuse ad libitum VIII with De Angelis VIII");
const bad=structuredClone(corpus);
const block=bad.blocks.find(b=>b.Macro_ID==="AO.SM.M02");
block.units[8].latin="Invented text";
assert.equal(prepareKyrieVIIIReview({corpus:bad}).status,"HOLD_SOURCE_MISMATCH");
const edited=structuredClone(corpus);
edited.blocks.find(b=>b.Macro_ID==="AO.SM.M02").units[1].cue_id="AO.SM.C9999";
assert.equal(prepareKyrieVIIIReview({corpus:edited}).status,"HOLD_SOURCE_MISMATCH");
const malformed={...source,gabc:source.gabc.replace("iij.","")};
assert.equal(prepareKyrieVIIIReview({corpus,source:malformed}).status,"HOLD_SOURCE_MISMATCH");
const excerptAudit=prepareKyrieVIIIUnapprovedGabcExcerpts({corpus});
assert.equal(excerptAudit.status,"RESEARCH_GABC_EXCERPTS_READY_FOR_PRINT_COMPARISON");
assert.equal(excerptAudit.excerpts.length,9);
assert.deepEqual(excerptAudit.excerpts.map(x=>x.sourceLine),[0,0,0,1,1,1,2,2,3]);
assert.ok(excerptAudit.excerpts.every(x=>x.gabc.includes("%%")&&
 x.gabc.includes("(c3)")&&x.gabc.includes("(::)")&&
 x.publication==="BLOCKED"&&!x.musicalNotationVerified));
assert.equal(excerptAudit.excerpts[0].gabc.split("%%")[1],
 excerptAudit.excerpts[1].gabc.split("%%")[1],
 "First Kyrie invocations must reuse the same exact musical line");
assert.notEqual(excerptAudit.excerpts[7].gabc.split("%%")[1],
 excerptAudit.excerpts[8].gabc.split("%%")[1],
 "Final Kyrie must use the distinct printed last-line melody");
assert.equal(excerptAudit.approvedScores,0);
assert.equal(excerptAudit.publishedScores,0);
console.log("SCHOLA_KYRIE_VIII_NINE_CUE_SOURCE_REVIEW_PASS nine exact cues; 4 authentic musical lines; 0 approvals");
