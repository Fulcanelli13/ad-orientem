import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const dir="data/research/did-you-know/";
const read=n=>JSON.parse(readFileSync(dir+n,"utf8"));
const previous=read("dyk-r20-unified-1001-first-pass-ledger.v1.json");
const decisionPack=read("dyk-r21-74-consolidation-adjudication.v1.json");
const master=read("dyk-r21-unified-1001-consolidation-master.v1.json");
const proposals=read("dyk-r21-12-bilingual-consolidated-copy-proposals.v1.json");
const prior=new Map(previous.ledger.map(x=>[x.id,x]));
const current=new Map(master.ledger.map(x=>[x.id,x]));
const marked=previous.ledger.filter(x=>
 ["CONSOLIDATE_WITH_RELATED","CONSOLIDATE_OR_SPREAD_FESTIVAL"].includes(x.status));
assert.equal(marked.length,74);
assert.equal(decisionPack.decisions.length,74);
assert.equal(new Set(decisionPack.decisions.map(x=>x.id)).size,74);
assert.equal(master.ledger.length,1001);
assert.equal(current.size,1001);
assert.deepEqual(new Set(current.keys()),new Set(prior.keys()));
const expected={
 ABSORB_SUPPORTING_DETAIL:16,
 HOME_PREVIEW_SAME_SOURCE_VARIANT:8,
 RETAIN_DISTINCT_INCORRECT_LEAD:33,
 COMPARE_RELATED_VARIANTS:16,
 HOLD_HISTORICAL_PRECISION:1
};
for(const [key,n] of Object.entries(expected))assert.equal(
 decisionPack.totals[key],n,key);
const dispositions={
 ABSORB_SUPPORTING_DETAIL:"R21_ABSORB_IN_LEAD_COPY_REVIEW",
 HOME_PREVIEW_SAME_SOURCE_VARIANT:"R21_HOME_PREVIEW_ENTRY_VARIANT",
 RETAIN_DISTINCT_INCORRECT_LEAD:"R21_RETAIN_DISTINCT_WRONG_LEAD",
 COMPARE_RELATED_VARIANTS:"R21_RETAIN_COMPARATIVE_VARIANTS",
 HOLD_HISTORICAL_PRECISION:"R21_HOLD_PRECISE_HISTORICAL_CLAIM"
};
for(const d of decisionPack.decisions){
 const old=prior.get(d.id),cur=current.get(d.id);
 assert.ok(old&&cur,d.id);
 assert.ok(["CONSOLIDATE_WITH_RELATED","CONSOLIDATE_OR_SPREAD_FESTIVAL"].includes(old.status),d.id);
 assert.equal(d.previous_disposition,old.status);
 assert.equal(cur.previous_status,old.status);
 assert.equal(d.next_status,dispositions[d.resolution],d.id);
 assert.equal(cur.status,d.next_status,d.id);
 assert.equal(cur.r21_resolution,d.resolution,d.id);
 assert.equal(cur.related_lead,d.merge_lead,d.id);
 assert.equal(cur.r21_rationale,d.factual_rationale,d.id);
 assert.ok(d.factual_rationale.length>50,d.id);
 assert.ok(d.own_original_claim.en.length>30,d.id);
 assert.ok(d.own_original_claim.fr.length>30,d.id);
 assert.ok(d.own_source.source_file,d.id);
 assert.equal(d.english_claim_signed_off,false);
 assert.equal(d.french_claim_signed_off,false);
 assert.equal(d.published,false);
 assert.equal(d.true_word_for_word_duplicate_certified,false);
 assert.equal(d.historical_original_page_verified_this_pass,false);
 if(d.resolution==="RETAIN_DISTINCT_INCORRECT_LEAD"||
    d.resolution==="COMPARE_RELATED_VARIANTS"||
    d.resolution==="HOLD_HISTORICAL_PRECISION")
  assert.equal(d.merge_lead,null,"Wrong links must not masquerade as a merger "+d.id);
 if(d.resolution==="ABSORB_SUPPORTING_DETAIL"||
    d.resolution==="HOME_PREVIEW_SAME_SOURCE_VARIANT")
  assert.ok(d.merge_lead,"Retained lead missing "+d.id);
}
for(const [id,erroneous] of [
 ["DYK-M04-CANON-003","DYK-M04-CANON-013"],
 ["DYK-M04-CANON-038","DYK-M04-CANON-013"],
 ["DYK-M04-CANON-047","DYK-M04-CANON-006"],
 ["DYK-UM03-041","DYK-UM02-042"],
 ["DYK-H04-W-A-064","DYK-H04-W-A-062"],
 ["DYK-H04-W-B-097","DYK-H04-W-B-095"],
 ["DYK-SF01-036","DYK-M04-CANON-001"]
]){
 const x=current.get(id);
 assert.equal(x.status,"R21_RETAIN_DISTINCT_WRONG_LEAD",id);
 assert.equal(x.related_lead,null,id);
 assert.equal(x.previous_lead,erroneous,id);
}
assert.equal(current.get("DYK-UM01-029").related_lead,"DYK-UM01-023",
 "Santa Croce cannot be merged into Ribera");
assert.equal(current.get("DYK-M04-CANON-015").related_lead,"DYK-M04-CANON-014");
assert.equal(current.get("DYK-UM03-005").status,"R21_HOLD_PRECISE_HISTORICAL_CLAIM");
const counts={};for(const x of master.ledger){
 assert.equal(x.approved,false,x.id);assert.equal(x.published,false,x.id);
 counts[x.status]=(counts[x.status]||0)+1;
}
assert.deepEqual(counts,master.metrics.by_status);
assert.equal(Object.values(counts).reduce((x,y)=>x+y,0),1001);
assert.equal(counts.CONSOLIDATE_WITH_RELATED??0,0);
assert.equal(counts.CONSOLIDATE_OR_SPREAD_FESTIVAL??0,0);
assert.equal(counts.FEATURED_FOR_REVIEW,168);
assert.equal(master.metrics.final_approved,0);
assert.equal(master.metrics.published_new,0);
assert.equal(proposals.proposals.length,12);
assert.equal(proposals.counts.added_to_1001_source_record_total,0);
const copyTargets=new Set();
for(const p of proposals.proposals){
 assert.ok(!copyTargets.has(p.updates_existing_candidate_id));
 copyTargets.add(p.updates_existing_candidate_id);
 assert.ok(current.has(p.updates_existing_candidate_id));
 assert.ok(p.originating_fact_ids.length>=2);
 assert.ok(p.originating_fact_ids.includes(p.updates_existing_candidate_id));
 assert.equal(p.originating_fact_ids.length,p.evidence.length);
 assert.equal(new Set(p.originating_fact_ids).size,p.originating_fact_ids.length);
 for(const e of p.evidence)assert.ok(current.has(e.record_id),e.record_id);
 for(const lang of ["en","fr"]){
  assert.ok(p.statement[lang].length>=80&&p.statement[lang].length<=300,p.id);
  assert.equal(/[?？]$/.test(p.statement[lang]),false,p.id);
  assert.equal(/^(?:Did you know|Saviez-vous)/i.test(p.statement[lang]),false,p.id);
 }
 for(const v of Object.values(p.signoff))assert.equal(v,false,p.id);
 assert.equal(p.release,"UNPUBLISHED_EDITORIAL_OPTION");
}
const reviewPrevious=read("dyk-r20-168-bilingual-review-cards.v1.json");
const reviewCurrent=read("dyk-r21-168-integrated-bilingual-review.v1.json");
assert.equal(reviewCurrent.cards.length,168);
assert.equal(reviewCurrent.counts.updated_composite_copy,9);
assert.equal(reviewCurrent.counts.optional_reserve_rewrites_not_promoted,3);
assert.equal(reviewCurrent.counts.new_source_records,0);
assert.equal(reviewCurrent.counts.approved,0);
assert.equal(reviewCurrent.counts.published,0);
const previousReviewById=new Map(reviewPrevious.cards.map(x=>[x.id,x]));
const integratedById=new Map(reviewCurrent.cards.map(x=>[x.id,x]));
assert.deepEqual(new Set(previousReviewById.keys()),new Set(integratedById.keys()));
let revised=0;
for(const [id,card] of integratedById){
 const older=previousReviewById.get(id);
 assert.equal(card.gates.publication_authorized,false);
 assert.equal(card.gates.claim_editorial_approved,false);
 assert.equal(card.gates.french_editorial_approved,false);
 if(card.r21_provenance){
  revised++;
  const proposal=proposals.proposals.find(x=>x.id===card.r21_provenance.source_proposal_id);
  assert.ok(proposal,id);
  assert.equal(proposal.updates_existing_candidate_id,id);
  assert.deepEqual(card.statement,proposal.statement);
  assert.deepEqual(card.prior_statement_for_editorial_comparison,older.statement);
  assert.deepEqual(card.r21_provenance.original_fact_ids,proposal.originating_fact_ids);
  assert.equal(card.r21_provenance.new_fact_generated,false);
 }else{
  // R21 established the 168 identities. Subsequent R24-R33 passes improved
  // original-folio citations and corrected historical copy in place: the
  // identity test must reject unexplained changes, not revert verified edits.
  for(const key of ["id","source_batch","category","editorial_copy_method",
                    "original_language_text","gates","release"])
    assert.deepEqual(card[key],older[key],id+" immutable "+key);
  for(const key of ["family","source_id","source_path","deep_link"])
    assert.deepEqual(card.source?.[key],older.source?.[key],id+" source "+key);
  if(JSON.stringify(card)!==JSON.stringify(older)){
    const sourceReviewKeys=Object.keys(card).filter(key=>/^r(?:2[4-9]|3[0-3])_/.test(key));
    assert.ok(sourceReviewKeys.length>0,
      "A changed R21 record must carry its later source-review provenance: "+id);
    assert.ok(card.statement?.en?.trim()&&card.statement?.fr?.trim(),
      "Verified record lost bilingual editorial copy: "+id);
  }
 }
}
assert.equal(revised,9);
assert.equal(reviewCurrent.optional_reserve_proposals.length,3);
for(const item of reviewCurrent.optional_reserve_proposals){
 assert.ok(!integratedById.has(item.lead));
 assert.equal(item.status,"OPTIONAL_RESERVE_ONLY_NOT_SHORTLISTED");
}
console.log(JSON.stringify({status:"PASS",sourceRecords:1001,
 reviewedFlaggedPairs:74,absorbDetails:16,
 restoredIncorrectMerges:33,regionalComparisons:16,
 privateHomeVariants:8,precisionHolds:1,
 proposedUpdatedLeadCopies:12,extraRawRecords:0,
 approved:0,published:0}));
