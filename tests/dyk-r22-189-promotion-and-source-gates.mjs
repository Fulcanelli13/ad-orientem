import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const dir="data/research/did-you-know/";
const read=x=>JSON.parse(readFileSync(dir+x,"utf8"));
const r21=read("dyk-r21-unified-1001-consolidation-master.v1.json");
const audit=read("dyk-r22-49-restored-distinct-editorial-selection.v1.json");
const master=read("dyk-r22-1001-current-master-index.v1.json");
const review=read("dyk-r21-168-integrated-bilingual-review.v1.json");
const added=read("dyk-r22-21-added-review-cards.v1.json");
const index=read("dyk-r22-189-review-index.v1.json");
assert.equal(audit.records.length,49);
assert.equal(audit.counts.promoted,21);
assert.equal(audit.counts.reserved,28);
assert.equal(new Set(audit.records.map(x=>x.id)).size,49);
assert.equal(master.status_rows.length,1001);
assert.equal(new Set(master.status_rows.map(x=>x[0])).size,1001);
assert.equal(master.counts.featured,189);
assert.equal(master.counts.approval,0);
assert.equal(master.counts.newly_published,0);
assert.equal(master.counts.existing_private_home_preview_not_additive,612);
assert.equal(master.counts.per_day_limit,12);
assert.equal(review.cards.length,168);
assert.equal(added.cards.length,21);
assert.equal(index.all_review_ids.length,189);
assert.equal(new Set(index.all_review_ids).size,189);
assert.deepEqual(new Set(index.all_review_ids),new Set([...review.cards,...added.cards].map(x=>x.id)));
const old=new Map(r21.ledger.map(x=>[x.id,x]));
const current=new Map(master.status_rows.map(x=>[x[0],x]));
const decisions=new Map(audit.records.map(x=>[x.id,x]));
for(const [id,row] of current){
 const original=old.get(id);
 assert.ok(original,id);
 assert.equal(row[2],original.batch,id);
 assert.equal(row[3],original.source_record_id??null,id);
 const decision=decisions.get(id);
 assert.equal(row[1],decision?
  (decision.outcome==="PROMOTE_TO_BILINGUAL_REVIEW"?"FEATURED_FOR_REVIEW":"R22_RESERVE_DISTINCT_RESEARCH"):
  original.status,id);
}
const WEISER="https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf";
const PITRE="https://archive.org/details/afm3499.0021.001.umich.edu";
const RITUS="https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/";
let historical=0,canon=0,gesture=0;
for(const fact of added.cards){
 assert.equal(decisions.get(fact.id).outcome,"PROMOTE_TO_BILINGUAL_REVIEW",fact.id);
 assert.equal(current.get(fact.id)[1],"FEATURED_FOR_REVIEW",fact.id);
 assert.equal(fact.release,"R22_REVIEW_ONLY_NOT_APPROVED",fact.id);
 for(const result of Object.values(fact.approval))assert.equal(result,false,fact.id);
 for(const lang of ["en","fr"]){
  assert.ok(fact.statement[lang].length>=35,fact.id);
  assert.equal(/^(Did you know|Saviez-vous)/i.test(fact.statement[lang]),false,fact.id);
  assert.equal(/[?？]\s*$/.test(fact.statement[lang]),false,fact.id);
 }
 const d=fact.destination;
 if(fact.category==="customs"){
  historical++;
  assert.equal(d.type,"route",fact.id);
  assert.equal(d.id,"home.historical-source",fact.id);
  assert.equal(d.factId,fact.id);
  assert.ok(d.historical_context.observation_ids.includes(fact.source_id),fact.id);
  assert.ok(d.historical_context.printed_pages.length>0,fact.id);
  assert.ok(d.historical_context.printed_pages.every(n=>Number.isInteger(n)&&n>0&&n<1801),fact.id);
  assert.equal(d.historical_context.source_url,
   fact.source_family==="WEISER_1958"?WEISER:PITRE,fact.id);
  assert.ok(d.historical_context.scope.en.length&&d.historical_context.scope.fr.length);
  assert.ok(d.historical_context.observation_ids.every(id=>
   fact.source_family==="WEISER_1958"?/^WEI58-[A-Z0-9-]+$/.test(id):
   /^PIT1900-(?:(?:IT|NEW)-[0-9]{3}|W05-OBS-[0-9]{3})$/.test(id)),fact.id);
 }else if(d.type==="route"){
  canon++;
  assert.equal(fact.category,"mass_liturgy");
  assert.equal(d.id,"home.mass-source");
  assert.equal(d.factId,fact.id);
  assert.equal(d.reader_cue_jump_verified,false);
  assert.equal(d.mass_context.action_id,fact.source_id);
  assert.match(d.mass_context.action_id,/^AO\.CANON\.R62\.[0-9]{3}$/);
  assert.match(d.mass_context.cue_id,/^AO\.SM\.C\d{4}$/);
  assert.match(d.mass_context.ritus_locator,/^(?:VIII|IX|X)\.[1-9]$/);
  assert.equal(d.mass_context.source_url,RITUS);
 }else{
  gesture++;
  assert.equal(d.type,"PENDING_EXACT_GESTURE_SOURCE_VIEW");
  assert.equal(d.reader_cue_jump_verified,false);
  assert.match(d.gesture_record_id,/^GM\.P\.C\d{4}\.\d{2}$/);
  assert.match(d.source_cue_id,/^AO\.SM\.C\d{4}$/);
 }
}
assert.equal(historical,14);
assert.equal(canon,5);
assert.equal(gesture,2);
for(const decision of audit.records){
 assert.equal(decision.original_page_image_reverified_in_this_pass,false);
 assert.equal(decision.exact_browser_route_verified,false);
 assert.equal(decision.french_editorial_approved,false);
 assert.equal(decision.publication_authorized,false);
}
assert.equal(master.counts.by_status.R22_RESERVE_DISTINCT_RESEARCH,28);
assert.equal(master.counts.by_status.FEATURED_FOR_REVIEW,189);
assert.equal(master.counts.total,1001);
console.log(JSON.stringify({status:"PASS",generated:1001,reviewed:49,
 featured:189,addedToReview:21,reserved:28,historicalSourceRoutes:14,
 romanCanonReadOnlyRoutes:5,gestureRoutesPending:2,approved:0,published:0}));
