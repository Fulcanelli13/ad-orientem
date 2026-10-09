import assert from "node:assert/strict";
import { CPDV_EDITORIAL_CHECKLIST, buildCpdvEditorialComparison } from "../tools/scripture/audit-cpdv-vs-drc.mjs";
assert.ok(CPDV_EDITORIAL_CHECKLIST.length>=30);
assert.ok(CPDV_EDITORIAL_CHECKLIST.some(x=>x.book==="John"&&x.chapter===1&&x.verse===1));
assert.ok(CPDV_EDITORIAL_CHECKLIST.some(x=>x.book==="2Maccabees"));
assert.ok(CPDV_EDITORIAL_CHECKLIST.some(x=>x.book==="Luke"&&x.verse===28));
const sample=[{id:"John",chapters:[{number:1,verses:[{number:1,text:"TEST FIXTURE NOT SCRIPTURE"}]}]}];
const report=buildCpdvEditorialComparison({editionId:"dr-challoner",books:sample},
 {editionId:"cpdv-2009",books:sample});
assert.equal(report.totalReviewItems,CPDV_EDITORIAL_CHECKLIST.length);
assert.equal(report.doctrinallyCertified,0);
assert.equal(report.verseCollationCertified,0);
assert.ok(report.items.every(x=>x.approvedForPublication===false));
assert.ok(report.items.every(x=>x.wordingReview==="pending"&&x.doctrinalReview==="pending"));
assert.ok(report.items.some(x=>x.automatedFlags.includes("missing-reference")));
assert.throws(()=>buildCpdvEditorialComparison({editionId:"ncb-2019"},{}));
console.log("CPDV comparative theological-review gating contracts passed");
