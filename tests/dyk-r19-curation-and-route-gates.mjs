import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const dir="data/research/did-you-know/";
const read=name=>JSON.parse(readFileSync(dir+name,"utf8"));
const featured=read("dyk-r19-featured-86-bilingual-home-handoff.v1.json");
const board=read("dyk-r19-216-source-fact-adjudication.v1.json");
const sources=[
 "dyk-customs-weiser-folio-expansion-04a.v1.json",
 "dyk-customs-weiser-folio-expansion-04b.v1.json",
 "dyk-customs-pitre-new-feasts-04c.v1.json",
 "dyk-mass-canon-discoveries-04d.v1.json"
].flatMap(name=>read(name).facts);
const sourceMap=new Map(sources.map(x=>[x.id,x]));
const routeWeiser="https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf";
const routePitre="https://archive.org/details/afm3499.0021.001.umich.edu";
const weiser=/^WEI58-[A-Z0-9-]+$/;
const pitre=/^PIT1900-(?:(?:IT|NEW)-[0-9]{3}|W05-OBS-[0-9]{3})$/;
assert.equal(sources.length,216);
assert.equal(sourceMap.size,216);
assert.equal(board.adjudications.length,216);
assert.equal(new Set(board.adjudications.map(x=>x.id)).size,216);
assert.equal(featured.cards.length,86);
assert.equal(new Set(featured.cards.map(x=>x.id)).size,86);
const count={};for(const d of board.adjudications){
 assert.ok(sourceMap.has(d.id),d.id);
 assert.equal(d.approved,false);
 assert.equal(d.published,false);
 count[d.disposition]=(count[d.disposition]||0)+1;
 if(d.related_lead)assert.ok(sourceMap.has(d.related_lead),d.id);
}
assert.deepEqual(count,{
 RESERVE_FOR_BALANCE:78,FEATURED_FOR_REVIEW:86,
 CONSOLIDATE_OR_SPREAD_FESTIVAL:33,HOLD_SCOPE_OR_QUALITY:19
});
for(const c of featured.cards){
 const r=sourceMap.get(c.id);assert.ok(r,c.id);
 assert.equal(board.adjudications.find(x=>x.id===c.id).disposition,"FEATURED_FOR_REVIEW");
 assert.equal(c.source_id,r.source_family==="WEISER_1958"?r.source.observation_ids[0]:r.source_family==="PITRE_1900"?r.source.observation_id:r.source.action_id);
 assert.ok(c.statement.en.length>=20&&c.statement.fr.length>=20,c.id);
 assert.equal(/[?？]/.test(c.statement.en+c.statement.fr),false,c.id);
 assert.equal(c.release,"RESEARCH_HANDOFF_NOT_PUBLISHED",c.id);
 assert.equal(c.proof.publication_authorized,false,c.id);
 assert.equal(c.proof.actual_browser_route_verified,false,c.id);
 if(c.category==="customs"){
  const d=c.destination,h=d.historical_context;
  assert.equal(d.type,"route");assert.equal(d.id,"home.historical-source");assert.equal(d.factId,c.id);
  assert.ok(h.observation_ids.includes(c.source_id),c.id);
  assert.ok(h.observation_ids.every(x=>(c.source_family==="WEISER_1958"?weiser:pitre).test(x)),c.id);
  assert.ok(h.printed_pages.length>=1&&h.printed_pages.length<=8&&h.printed_pages.every(n=>Number.isInteger(n)&&n>=1&&n<=1800),c.id);
  assert.equal(h.source_url,c.source_family==="WEISER_1958"?routeWeiser:routePitre,c.id);
  assert.ok(h.scope.en.length&&h.scope.fr.length&&h.scope.en.length<=400&&h.scope.fr.length<=400,c.id);
  if(c.source_family==="PITRE_1900"){
   assert.equal(r.source.ocr_excerpt_rematched,true);assert.equal(r.source.original_page_image_verified,false);
  }
 }else{
  assert.equal(c.category,"mass_liturgy");
  assert.equal(c.destination.type,"PENDING_EXACT_MASS_CUE_ROUTE");
  assert.equal(c.destination.action_id,r.source.action_id);
  assert.equal(c.destination.cue_id,r.source.source_cue_id);
  assert.equal(c.destination.reader_route_verified,false);
 }
}
assert.equal(featured.cards.filter(x=>x.source_family==="WEISER_1958").length,60);
assert.equal(featured.cards.filter(x=>x.source_family==="PITRE_1900").length,14);
assert.equal(featured.cards.filter(x=>x.source_family==="1962_ROMAN_CANON_CEREMONIAL").length,12);
assert.equal(featured.cards.some(x=>x.id==="DYK-H04-W-B-102"),false);
assert.equal(board.adjudications.find(x=>x.id==="DYK-H04-W-B-102").disposition,"HOLD_SCOPE_OR_QUALITY");
assert.equal(featured.editorial_schedule_policy.home_widget_is_standalone_below_this_week,true);
assert.equal(featured.checks.new_facts_added_to_private_compiler,false);
console.log(JSON.stringify({status:"PASS",source_facts:216,featured:86,
 weiser:60,pitre:14,mass:12,historical_routes_well_formed:74,
 exact_mass_routes_verified:0,approved:0,published:0,
 old_home_preview_cards_unchanged:"NOT_MUTATED_BY_RESEARCH_PACK"}));
