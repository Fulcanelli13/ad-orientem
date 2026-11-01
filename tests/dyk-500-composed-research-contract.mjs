// Internal research-production milestone only. No publication clearance.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const dir="data/research/did-you-know/";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const master=read(dir+"dyk-500-composed-research-master-index.v1.json");
const names=[
 "dyk-production-growth-190-310-bilingual-drafts.v1.json",
 "dyk-production-growth-311-364-bilingual-drafts.v1.json",
 "dyk-production-growth-365-414-bilingual-drafts.v1.json",
 "dyk-production-growth-415-461-bilingual-drafts.v1.json",
 "dyk-production-growth-462-500-bilingual-drafts.v1.json"
];
const tranches=names.map(n=>read(dir+n));
assert.equal(master.schema,"AO_DYK_500_COMPOSED_BILINGUAL_RESEARCH_MASTER_INDEX_V1");
assert.equal(master.total_bilingual_research_drafts,500);
assert.equal(master.new_research_drafts_in_pr_2136,190);
assert.deepEqual(master.review_buckets.map(x=>x.count),[189,121,54,50,47,39]);
assert.equal(master.rows.length,500);
assert.equal(tranches.reduce((n,x)=>n+x.facts.length,0),311);
assert.equal(master.review_buckets[0].reference.review_index_blob_sha,"a26fc44231616df4654827a07b27a60cdec53135");
assert.equal(master.quality.publication_authorized,false);
assert.equal(master.quality.new_h7_publications,0);
assert.equal(master.quality.editorial_approvals_this_pr,0);
assert.equal(master.quality.semantic_novelty_against_612_private_previews_finalized,false);
assert.equal(master.quality.original_page_verification_all_complete,false);
const ids=new Set(),sources=new Set(),copyEn=new Set(),copyFr=new Set();
const norm=s=>String(s).normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const byID=new Map(master.rows.map(x=>[x.id,x]));
for(const x of master.rows){
 assert.ok(!ids.has(x.id),"Repeated record ID "+x.id);ids.add(x.id);
 assert.equal(x.publication_authorized,false);
 assert.ok(x.source_ids.length>0);
 for(const sid of x.source_ids){assert.ok(!sources.has(sid),"Repeated source ID "+sid);sources.add(sid)}
}
assert.equal(ids.size,500);assert.equal(sources.size,528);
assert.equal(master.rows.filter(x=>x.lane==="earlier-189-bilingual-review").length,189);
let pointerOnly=0,added=0;
for(let i=0;i<tranches.length;i++){
 const t=tranches[i];assert.equal(t.facts.length,[121,54,50,47,39][i]);
 for(const x of t.facts){
  const row=byID.get(x.id);assert.ok(row,"Unindexed fact "+x.id);
  assert.deepEqual(row.source_ids,x.source.source_ids||[x.source.source_id]);
  assert.equal(x.review.publication_authorized,false);
  assert.ok(x.statement.en.length>40&&x.statement.fr.length>40);
  assert.ok(x.source.primary_witness.startsWith("https://"));
  for(const [lang,seen] of [["en",copyEn],["fr",copyFr]]){
   const n=norm(x.statement[lang]);assert.ok(!seen.has(n),"Duplicate "+lang+" "+x.id);seen.add(n);
  }
  if(i>0)added++;
  if(x.source.source_pointer_only_not_original_page_certified===true){
   pointerOnly++;
   assert.equal(row.source_evidence_tier,"PRINTED_PAGE_POINTER_NOT_ORIGINAL_FOLIO_CHECKED");
   assert.equal(x.source.original_folio_action_checked,false);
   assert.equal(x.review.primary_page_claim_recheck_pending,true);
  }
 }
}
assert.equal(added,190);assert.equal(pointerOnly,136);
assert.equal(master.original_folio_pointer_only_new_records,136);
console.log("PASS DYK 500/500 research drafts: 189 prior + 121 + 54 + 50 + 47 + 39; 0 published; 136 inherited page-pointer holds");
