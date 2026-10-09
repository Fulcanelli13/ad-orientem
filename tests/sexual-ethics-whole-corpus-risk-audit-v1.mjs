import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_QUESTIONS,CSE_PUBLIC_QUESTIONS,CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_CANONICAL_DOSSIERS,CSE_QUESTION_OWNER_MAP} from "../src/learn/sexual-ethics-data/canonical.js";
import {CSE_DEBATE_IDS,CSE_DEBATE_FIELDS} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_MARRIAGE_AUTHORITY_DEBATES} from "../src/learn/sexual-ethics-data/marriage-authority-debates.js";

const audit=JSON.parse(readFileSync("data/learn/sexual-ethics-whole-corpus-risk-audit-20261009.v1.json","utf8"));
const old95=JSON.parse(readFileSync("data/learn/sexual-ethics-95-short-answer-source-pass-20261009.v2.json","utf8"));
const interim=JSON.parse(readFileSync("data/learn/sexual-ethics-short-answer-passage-confirmations-20261009.v1.json","utf8"));
const final21=JSON.parse(readFileSync("data/learn/sexual-ethics-remaining-21-passage-checks-20261009.v1.json","utf8"));
const certified=JSON.parse(readFileSync("data/learn/sexual-ethics-certification-evidence.v2.json","utf8"));

assert.equal(CSE_QUESTIONS.length,150);
assert.equal(CSE_PUBLIC_QUESTIONS.length,147);
assert.equal(CSE_CANONICAL_DOSSIERS.length,50);
assert.equal(CSE_DEBATE_IDS.length,55);
assert.equal(CSE_DEBATE_FIELDS.length,8);
assert.equal(certified.summary.full_case_certifications,0);
assert.equal(audit.cases.length,150);
assert.equal(audit.summary.canonical_questions,150);
assert.equal(audit.summary.canonical_dossier_owners,50);
assert.equal(audit.summary.principal_debates,55);
assert.equal(audit.summary.principal_debate_stages,440);
assert.equal(audit.summary.short_questions,95);
assert.equal(audit.summary.short_bounded_original_paragraph_checks_reconciled,95);
assert.equal(audit.summary.complete_claim_by_claim_original_passage_certifications,0);
assert.equal(audit.summary.independent_theological_approvals,0);
assert.equal(audit.summary.independent_french_approvals,0);
assert.equal(audit.summary.headship_subdebates_after_owner_dedup,6);
assert.deepEqual(audit.summary.headship_topics_transferred_to_existing_owners,{"MAR-06":"CSE054","MAR-07":"CSE032"});
assert.deepEqual(CSE_MARRIAGE_AUTHORITY_DEBATES.map(d=>d.id),["MAR-01","MAR-02","MAR-03","MAR-04","MAR-05","MAR-08"]);
const checked=new Set([
 ...old95.records.filter(r=>r.bounded_source!==null).map(r=>r.id),
 ...interim.records.map(r=>r.id),
 ...final21.records.map(r=>r.id),
]);
assert.equal(checked.size,95);
assert.equal(old95.records.filter(r=>r.bounded_source!==null).length,72);
assert.equal(interim.records.length,2);
assert.equal(final21.records.length,21);
const knownDebates=new Set(CSE_DEBATE_IDS);
const archived=new Set(["CSE055","CSE056","CSE058"]);
const seen=new Set();
for(const [index,row] of audit.cases.entries()){
 const item=CSE_QUESTIONS[index];
 assert.equal(row.id,item.id,"Every canonical question must appear once and in order");
 assert.equal(seen.has(row.id),false,"Duplicate audited ID "+row.id);
 seen.add(row.id);
 assert.equal(row.canonical_owner,CSE_QUESTION_OWNER_MAP[row.id]);
 assert.equal(row.public,!archived.has(row.id));
 assert.equal(row.en_fr_question_and_answer_present,Boolean(item.q?.[0]&&item.q[1]&&item.a?.[0]&&item.a[1]));
 assert.deepEqual(row.source_ids,item.refs.map(r=>r[0]));
 for(const id of row.source_ids)assert.ok(CSE_SOURCE_MAP[id],row.id+" has an unregistered citation "+id);
 assert.equal(row.kind,knownDebates.has(row.id)?"PRINCIPAL_EIGHT_STAGE_DEBATE":"SHORT_STANDARD_OR_EXPANDED");
 assert.equal(row.full_claim_by_claim_certified,false,"Do not fabricate full claim certification");
 assert.equal(row.independent_fr_signed,false);
 assert.equal(row.independent_theology_signed,false);
 assert.equal(checked.has(row.id),!knownDebates.has(row.id),"Bounded source check review needs full 95 coverage");
}
assert.equal(seen.size,150);
assert.equal(new Set(audit.cases.map(r=>r.canonical_owner)).size,50);
console.log("PASS full 150-question CSE audit: 50 owners, 147 public, 55 eight-stage debates, 95 bounded source checks, 6 deduped Ephesians disputes, 0 false certifications");
