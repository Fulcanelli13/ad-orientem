import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CATENA_REVIEW_CHECKS,isCatenaReviewRouteEligible,
 validateCatenaReviewDecision,buildCatenaReviewExport,CATENA_REVIEW_EXPORT_SCHEMA} from "../src/scripture/catena-review-decisions.js";
const data=JSON.parse(readFileSync("data/scripture/catena/editorial-matthew-first-30-review.v1.json","utf8"));
assert.equal(data.records.length,30);
const ready=data.records.filter(isCatenaReviewRouteEligible),blocked=data.records.filter(x=>!isCatenaReviewRouteEligible(x));
assert.equal(ready.length,22);assert.equal(blocked.length,8);
assert.equal(CATENA_REVIEW_CHECKS.length,6);
const a=ready[0],other=blocked[0],digest="ab".repeat(32);
const approve={
 sourcePointer:a.sourcePointer,disposition:"approve",reviewer:"Editorial source reviewer",
 editorialReason:"I compared the full original excerpt, its context and source work independently.",
 originalWorkReference:"Example source work, book, chapter and edition independently checked",
 sourceSHA256:digest,checks:Object.fromEntries(CATENA_REVIEW_CHECKS.map(k=>[k,true])),
 recordedAt:"2026-10-21T20:00:00Z"
};
const inspected=validateCatenaReviewDecision(a,approve);
assert.equal(inspected.disposition,"approve");assert.equal(inspected.publicationEligibility,"blocked_research_only");
assert.equal(inspected.humanApprovalRequiresSeparateRepositoryImport,true);
assert.throws(()=>validateCatenaReviewDecision(a,{...approve,checks:{...approve.checks,speaker:false}}),/CHECKLIST_INCOMPLETE/);
assert.throws(()=>validateCatenaReviewDecision(a,{...approve,sourceSHA256:"unverified"}),/SOURCE_ATTESTATION_REQUIRED/);
assert.throws(()=>validateCatenaReviewDecision(a,{...approve,originalWorkReference:""}),/SOURCE_ATTESTATION_REQUIRED/);
assert.throws(()=>validateCatenaReviewDecision(other,{...approve,sourcePointer:other.sourcePointer}),/ESCALATED_CANDIDATE/);
assert.throws(()=>validateCatenaReviewDecision(a,{...approve,sourcePointer:"catena.matthew.99.0:2"}),/INVALID/);
const hold=validateCatenaReviewDecision(other,{
 sourcePointer:other.sourcePointer,disposition:"hold",reviewer:"Editorial reviewer",
 editorialReason:"Needs original source collation before any reader presentation."
});
assert.equal(hold.disposition,"hold");
const record=buildCatenaReviewExport(data.records,new Map([[a.sourcePointer,approve],[other.sourcePointer,hold]]),
 {sourceResearchCommit:data.sourceResearchCommit});
assert.equal(record.schema,CATENA_REVIEW_EXPORT_SCHEMA);
assert.deepEqual(record.counts,{pending:28,approve:1,revise:0,hold:1,reject:0});
assert.equal(record.records.length,30);
assert.ok(record.records.every(x=>x.publicationEligibility==="blocked_research_only"));
assert.ok(record.noVerbatimSourceTextCopied);
assert.equal(JSON.stringify(record).includes("originalWords"),false);
assert.throws(()=>buildCatenaReviewExport(data.records,new Map([["invented:pointer",approve]]),
 {sourceResearchCommit:data.sourceResearchCommit}),/UNKNOWN_POINTER_IN_EXPORT/);
assert.throws(()=>buildCatenaReviewExport(data.records,[["bad",approve]],
 {sourceResearchCommit:"bad"}),/SOURCE_REVISION_INVALID/);
const html=readFileSync("previews/living-catena-editorial-workbench-20261021.html","utf8");
assert.match(html,/loadCatenaForPassage/);
assert.match(html,/catenaOwnerUnits/);
assert.match(html,/crypto\.subtle\.digest\("SHA-256"/);
assert.match(html,/Propose source approval/);
assert.match(html,/Export review manifest/);
assert.ok(!html.includes("autoPublish"));
console.log("PASS: 22 approval-candidate previews, 8 escalations, exact-source attestations and publication-blocked human export");
