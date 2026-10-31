// 600 research-only bilingual facts; no H7 publication and no source-certification inflation.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const prefix="data/research/did-you-know/";
const load=f=>JSON.parse(readFileSync(prefix+f,"utf8"));
const archive=load("dyk-500-composed-research-master-index.v1.json");
const master=load("dyk-600-effective-research-master-index.v1.json");
const fifty=load("dyk-r50-sample-remediation-and-weiser-primary-source-checks.v1.json");
const off=load("dyk-r33-outside-sample-three-overlap-resolution.v1.json");
const b501=load("dyk-next-501-520-bilingual-source-checked-drafts.v1.json");
const b521=load("dyk-next-521-560-pitre-inherited-folio-bilingual-drafts.v1.json");
const b561=load("dyk-next-561-600-pitre-inherited-folio-bilingual-drafts.v1.json");
assert.equal(archive.rows.length,500);
assert.equal(master.schema,"AO_DYK_600_EFFECTIVE_BILINGUAL_RESEARCH_INDEX_V1");
assert.equal(master.rows.length,600);
assert.equal(master.composed_drafts,600);
assert.deepEqual([b501.facts.length,b521.facts.length,b561.facts.length],[20,40,40]);
assert.equal(master.total_next_research_drafts,100);
assert.equal(master.review_history.post_repair_effective_500_approved_for_research_production_only,true);
assert.equal(master.review_history.new_100_editorially_approved,false);
assert.equal(master.publication_gate.publication_authorized,false);
assert.equal(master.publication_gate.new_h7_publications,0);
assert.equal(master.publication_gate.full_bilingual_editorial_signoff,false);
assert.equal(master.source_status.new_80_individually_page_image_rechecked_on_2026_10_31,false);
assert.equal(master.source_status.all_600_individually_primary_page_certified,false);
assert.equal(master.crossbank_screen.manual_semantic_and_quality_review_all_600_complete,false);
assert.equal(master.crossbank_screen.lexical_overlap_at_or_above_025,0);
assert.equal(master.crossbank_screen.novel_100_internal_overlap_at_or_above_025,0);
assert.equal(master.crossbank_screen.exact_en_collisions,0);
assert.equal(master.crossbank_screen.exact_fr_collisions,0);
assert.equal(master.crossbank_screen.exact_source_id_collisions,0);
const archiveIds=new Set(archive.rows.map(x=>x.id));
const retired=new Set([...fifty.retired_from_eligible_review.map(x=>x.id),...off.retirement_and_replacement.map(x=>x.retire_id)]);
assert.equal(retired.size,3);
const effective500=archive.rows.map(x=>x.id).filter(x=>!retired.has(x));
effective500.push(fifty.replacement.id,...off.retirement_and_replacement.map(x=>x.replacement.id));
assert.equal(effective500.length,500);
const ids=new Set(),sourceIds=new Set();
const fromIndex=new Map(master.rows.map(x=>[x.id,x]));
for(const row of master.rows){
 assert.ok(!ids.has(row.id),"Duplicate row "+row.id);ids.add(row.id);
 assert.equal(row.publication_authorized,false);
 assert.ok(row.source_ids?.length>0);
 for(const sid of row.source_ids){assert.ok(!sourceIds.has(sid),"Duplicate source ID "+sid);sourceIds.add(sid);}
}
assert.equal(ids.size,600);
assert.equal(sourceIds.size,master.unique_source_identifier_count);
for(const id of effective500)assert.ok(fromIndex.has(id),"Missing effective 500 "+id);
for(const id of retired)assert.ok(!ids.has(id),"Retired item leaked "+id);
const seenTextEn=new Set(),seenTextFr=new Set();
const norm=x=>x.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
for(const [batch,start,count] of [[b501,501,20],[b521,521,40],[b561,561,40]]){
 assert.equal(batch.facts.length,count);
 for(const [i,x] of batch.facts.entries()){
  assert.equal(x.id,`DYK-G${start+count-1}-${start===501?"W":"P"}-${String(i+1).padStart(3,"0")}`);
  const idx=fromIndex.get(x.id);assert.ok(idx);
  assert.deepEqual(idx.source_ids,[x.source_id]);
  assert.ok(x.statement.en.length>55&&x.statement.fr.length>55);
  const en=norm(x.statement.en),fr=norm(x.statement.fr);
  assert.ok(!seenTextEn.has(en)&&!seenTextFr.has(fr),"Bilingual duplicate copy "+x.id);
  seenTextEn.add(en);seenTextFr.add(fr);
  assert.equal(x.review.publication_authorized,false);
  if(start===501){assert.equal(x.source.original_folio_image_visually_screened,true);}
  else {
   assert.ok(x.source.original_page_reviewed_in_prior_source_work===true||x.source.prior_contact_sheet_page_review===true);
   assert.ok(x.source.original_page_newly_checked_in_this_tranche===false||x.source.fresh_page_image_rechecked_in_this_tranche===false);
   const printedPage=x.source.printed_page??x.source.original_folio;
   assert.ok(Number.isInteger(printedPage)&&printedPage>0);
  }
 }
}
console.log("PASS DYK 600 effective draft records: 500 research-accepted + 20 Weiser + 80 Pitrè; 628 unique provenance IDs; 0 public releases");
