import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const upstream=load("data/learn/ltfaith-pius-x-en-witness-index.v1.json");
const crosswalk=load("data/learn/ltfaith-54-claim-citation-crosswalk.v1.json");
const corpus=load("data/learn/learn-the-faith-recovered-54.v1.json");
const learn=readFileSync("src/learn/presentation.js","utf8");
const pray=readFileSync("src/pray/presentation-runtime.js","utf8");
const q=new Map(upstream.entries.map(x=>[x.q,x]));
const rows=new Map(crosswalk.entries.map(x=>[x.id,x]));
assert.equal(upstream.status,"ALL_433_PINNED_EN_QUESTION_NUMBER_LOCATORS_VERIFIED_NOT_CONTENT_CERTIFIED");
assert.match(upstream.upstreamCommit,/^[a-f0-9]{40}$/);
assert.equal(upstream.entries.length,433);
assert.equal(q.size,433);
assert.equal(upstream.parts.length,21);
assert.equal(upstream.missing_question_numbers.length,0);
assert.equal(upstream.duplicate_question_ids.length,0);
assert.equal(rows.size,54);
assert.equal(crosswalk.entries.length,54);
assert.equal(crosswalk.metrics.v2Claims,176);
assert.equal(crosswalk.metrics.numbered_question_citation_instances,523);
assert.equal(crosswalk.metrics.distinct_questions_cited_by_claims,375);
assert.equal(crosswalk.metrics.lessons_with_reference_scope_differences,43);
assert.equal(crosswalk.metrics.lessons_with_new_handoff_proposals,9);
assert.equal(crosswalk.metrics.approved_claims,0);
assert.equal(crosswalk.metrics.public_routes_added,0);
for(let n=1;n<=433;n++){
 const x=q.get(n);assert.ok(x,"missing actual witness "+n);
 assert.match(x.source_file_url,new RegExp(upstream.upstreamCommit));
 assert.ok(x.q_stem.length>2);
 assert.match(x.witness_fingerprint,/^[a-f0-9]{8}$/);
 assert.ok(upstream.parts.some(s=>s.file===x.file));
}
let refs=0,drafts=0,diff=0,extra=0;
for(const lesson of corpus.lessons){
 const row=rows.get(lesson.id);
 assert.ok(row,lesson.id);
 assert.equal(row.claim_count,lesson.v2ClaimDraft.claims.length);
 assert.deepEqual(row.lesson_index_question_ids,lesson.catechismIndexRefs);
 assert.deepEqual(row.claimed_question_ids,lesson.detailedClaimPiusXRefs);
 assert.equal(row.claims.length,lesson.v2ClaimDraft.claims.length);
 assert.equal(row.publishable,false);
 drafts+=row.claims.length;
 for(const claim of row.claims){
  assert.equal(claim.approved,false);
  for(const ref of claim.refs){
   for(const loc of ref.locators){
    if(ref.source_id!=="PIUS_X_1912")continue;
    const n=Number(loc.ref.slice(8)),w=q.get(n);
    assert.ok(w,"claim references missing source question");
    assert.equal(loc.question_stem,w.q_stem);
    assert.equal(loc.source_url,w.source_file_url);
    refs++;
   }
  }
 }
 for(const ref of row.index_only_context)assert.ok(q.has(Number(ref.ref.slice(8))));
 for(const ref of row.detailed_claim_only)assert.ok(q.has(Number(ref.ref.slice(8))));
 const differed=row.index_only_context.length||row.detailed_claim_only.length;
 assert.equal(row.disposition.startsWith("REVIEW"),Boolean(differed));
 diff+=Number(Boolean(differed));
 for(const link of row.proposed_handoffs){
  assert.ok(learn.includes('id:"'+link+'"')||pray.includes("'"+link+"'"),"proposed nonexistent handoff "+link);
  assert.ok(!row.existing_handoffs.includes(link),"duplicate handoff "+link);
  extra++;
 }
}
assert.equal(drafts,176);
assert.equal(refs,523);
assert.equal(diff,43);
assert.ok(extra>=9);
assert.equal(crosswalk.editorial_findings.findings.find(x=>x.id==="LTF-051").primary_anchors.includes("PXQ385"),true);
assert.equal(crosswalk.editorial_findings.complete_54_lesson_claim_review,false);
assert.equal(crosswalk.editorial_findings.native_french_review,false);
assert.equal(corpus.summary.certifiedLessons,0);
assert.ok(!learn.includes('id:"learn.faith"'));
console.log(JSON.stringify({status:"PASS",sourceQuestions:q.size,lessons:rows.size,v2Claims:drafts,numberedClaimRefs:refs,referenceScopeDifferences:diff,proposedHandoffs:extra,claimApprovals:0,published:false}));
