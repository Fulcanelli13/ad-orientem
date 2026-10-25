import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const original=read("../data/customs/research/weiser-handbook-inventory.v0.json");
const p2=read("../data/customs/research/weiser-p1-wave02-full-reconciliation.v1.json");
const p3=read("../data/customs/research/weiser-p1-wave03-source-corroboration.v1.json");
const p4=read("../data/customs/research/weiser-p1-wave04-source-corroboration.v1.json");
const p5=read("../data/customs/research/weiser-p1-wave05-source-corroboration.v1.json");
const p6=read("../data/customs/research/weiser-p1-wave06-final-dispositions.v1.json");
const cards=read("../data/customs/research/weiser-p1-wave06-bilingual-editorial-cards.v1.json");
const inventory=new Map(original.records.map(x=>[x.id,x]));
const p1=new Map(p2.crosswalk.map(x=>[x.weiser_id,x]));
const before=new Set([...p2.source_witnesses.flatMap(x=>x.observation_ids),
...p3.witnesses.flatMap(x=>x.observation_ids),
...p4.witnesses.flatMap(x=>x.observation_ids),
...p5.witnesses.flatMap(x=>x.observation_ids)]);
assert.equal(original.records.length,568);
assert.equal(p1.size,144);
assert.equal(before.size,82);
assert.equal(p6.records.length,62);
const available=new Set();
for(const rec of p6.records){
 assert.ok(p1.has(rec.weiser_id),"unknown P1 ID: "+rec.weiser_id);
 assert.ok(!before.has(rec.weiser_id),"already in an earlier source wave: "+rec.weiser_id);
 assert.ok(!available.has(rec.weiser_id),"duplicate Wave06 record "+rec.weiser_id);
 available.add(rec.weiser_id);
 const inv=inventory.get(rec.weiser_id);
 assert.ok(inv,"missing source");
 assert.equal(rec.source_title,inv.title);
 assert.equal(rec.chapter,inv.chapter);
 assert.equal(rec.printed_page,inv.page);
 assert.equal(rec.original_triage,inv.triage);
 assert.equal(rec.app_publication,"NO");
 assert.equal(rec.permanent_rejection,false);
 const evidence=rec.evidence;
 assert.ok(["INDEPENDENT_BOUNDED","RELATED_OR_PARTIAL_EVIDENCE","NO_EXACT_INDEPENDENT_MATCH_CONFIRMED"].includes(evidence.status));
 if(evidence.status!=="NO_EXACT_INDEPENDENT_MATCH_CONFIRMED"){
  assert.ok(evidence.url.startsWith("https://"),"evidence URL required");
  assert.ok(evidence.verified_claim_scope.length>60,"precise witness claim required");
 }else {
  assert.equal(evidence.url,null);
  assert.ok(evidence.source_query?.length>20,"source gap must remain searchable");
  assert.ok(evidence.action?.startsWith("HOLD_")||evidence.action?.startsWith("DEFER_")||evidence.action==="RETAIN_HISTORICAL_INDEX_ONLY","unverified source released");
 }
}
assert.equal(available.size,62);
assert.equal(new Set([...before,...available]).size,144);
const types=(status)=>p6.records.filter(r=>r.evidence.status===status);
assert.equal(types("INDEPENDENT_BOUNDED").length,8);
assert.equal(types("RELATED_OR_PARTIAL_EVIDENCE").length,16);
assert.equal(types("NO_EXACT_INDEPENDENT_MATCH_CONFIRMED").length,38);
assert.equal(p6.audit.p1_records_with_disposition,144);
assert.equal(p6.audit.app_published,0);
assert.equal(p6.audit.permanently_excluded_by_wave06,0);
assert.equal(original.records.filter(x=>x.triage==="EXCLUDE").length,34);
assert.equal(cards.cards.length,5);
assert.equal(cards.audits.bilingual_cards,5);
assert.equal(cards.audits.source_bounded_ids_covered,6);
assert.equal(cards.audits.source_bounded_ids_existing_owner_only,2);
assert.equal(cards.audits.app_publications,0);
const cardIds=new Set(),seen=new Set();
for(const c of cards.cards){
 assert.equal(c.release_status,"BILINGUAL_RESEARCH_DRAFT_NO_APP_PUBLICATION");
 assert.ok(!cardIds.has(c.id),"duplicated card");
 cardIds.add(c.id);
 for(const field of ["title_en","title_fr","description_en","description_fr","meaning_en","meaning_fr","optional_observance_en","optional_observance_fr"]){
  assert.ok(c[field]?.length>(field.startsWith("title_")?10:50),"empty or shifted bilingual field "+c.id+" "+field);
 }
 assert.ok(c.caution.length>80 && c.scope.length>45 && c.existing_owner.length>30,"missing bounded scope and ownership");
 assert.equal(c.printed_pages.length,c.observations.length);
 assert.equal(c.independent_evidence.length,c.observations.length);
 for(const id of c.observations){
  assert.ok(!seen.has(id),"observation duplicated across cards");
  seen.add(id);
  assert.equal(p6.records.find(x=>x.weiser_id===id)?.evidence.action,"SOURCE_BOUNDED_DRAFT");
 }
 for(const ev of c.independent_evidence){
  const source=p6.records.find(x=>x.weiser_id===ev.observation_id)?.evidence;
  assert.ok(source);
  assert.equal(source.status,"INDEPENDENT_BOUNDED");
  assert.equal(source.url,ev.source_url);
 }
 for(const l of c.printed_pages)assert.equal(l.page,inventory.get(l.weiser_id).page);
}
assert.equal(seen.size,6);
for(const x of cards.existing_owner_only){
 assert.equal(p6.records.find(r=>r.weiser_id===x.weiser_id)?.evidence.status,"INDEPENDENT_BOUNDED");
 assert.equal(seen.has(x.weiser_id),false);
}
assert.equal(new Set(cards.existing_owner_only.map(x=>x.weiser_id)).size,2);
const integration=read("../data/customs/research/weiser-p1-final-integration-ledger.v1.json");
assert.equal(integration.records.length,144);
assert.equal(integration.drafts.length,42);
assert.equal(integration.audit.source_bounded,60);
assert.equal(integration.audit.partial_source_holds,46);
assert.equal(integration.audit.no_exact_source_match_holds,38);
assert.equal(integration.audit.bounded_observations_in_bilingual_drafts,56);
assert.equal(integration.audit.owner_context_only_bounded_observations,4);
assert.equal(integration.audit.app_publications,0);
const releaseIds=new Set();
for(const row of integration.records){
 assert.ok(p1.has(row.weiser_id));
 assert.ok(!releaseIds.has(row.weiser_id));releaseIds.add(row.weiser_id);
 assert.equal(row.app_published,false);
 assert.equal(row.permanent_exclusion,false);
 if(row.disposition==="EDITORIAL_DRAFT_REQUIRES_OWNER_PARITY"){
   assert.equal(row.source_class,"BOUNDED");
   assert.ok(row.editorial_draft?.card_id);
 } else {
   assert.equal(row.editorial_draft,null);
 }
 if(row.source_class==="UNMATCHED_HOLD")assert.equal(row.disposition,"NO_EXACT_INDEPENDENT_MATCH_HOLD");
}
assert.equal(releaseIds.size,144);
console.log("PASS Weiser P1 Wave06: 144/144 dispositions; 82 earlier source topics, 8 new bounded, 16 partial, 38 unverified; five bilingual drafts/6 source IDs, 2 existing owner-only, 34 exclusions intact, zero app publications.");
