import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const W1=read("data/explore/europe-acquisition.wave1.research.v1.json");
const W2=read("data/explore/europe-acquisition.wave2.research.v1.json");
const W3=read("data/explore/europe-acquisition.wave3.research.v1.json");
const W4=read("data/explore/europe-acquisition.wave4-national-depth.research.v1.json");
const W5=read("data/explore/europe-acquisition.wave5-diocesan-index.research.v1.json");
const M4=read("data/explore/europe-acquisition.four-wave-master.review.v1.json");
const M5=read("data/explore/europe-acquisition.five-wave-master.review.v1.json");
const G=read("data/geography/seed-registry.v1.json");
// Source-acquisition wave snapshots compare with the geography registry at their original research freeze, not later map promotions.
const publishedAfterFreeze=new Set(read("data/geography/research/sacred-geography-major-sites-launch-2026-10-10.v1.json").promoted.map(p=>p.place_id));
for(const p of read("data/geography/research/sacred-geography-major-exceptions-2026-10-10.v1.json").promoted)publishedAfterFreeze.add(p.place_id);
const historicalPlaces=G.places.filter(p=>!publishedAfterFreeze.has(p.place_id));
const id=x=>x.research_id||x.lead_id||x.id||x.site_id||x.place_id;
const allBefore=[
 ...W1.place_candidates.map(x=>({id:id(x),cc:x.country_code,name:x.name})),
 ...W2.place_leads.map(x=>({id:id(x),cc:x.country_code,name:x.name})),
 ...W3.site_leads.map(x=>({id:id(x),cc:x.country_code,name:x.name})),
 ...W4.sites.map(x=>({id:id(x),cc:x.country_code,name:x.name})),
 ...historicalPlaces.map(x=>({id:id(x),cc:x.address.country_code,name:x.name.official}))
];
const normalize=x=>String(x).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"");
assert.equal(W5.schema,"AO_EXPLORE_EUROPE_DIOCESAN_INDICES_WAVE5_RESEARCH_V1");
assert.equal(W5.status,"RESEARCH_ONLY_NO_GEO_OR_PUBLICATION");
assert.equal(W5.site_leads.length,38);
assert.equal(W5.sources.length,20);
assert.equal(W5.associations.length,47);
const sites=new Map(W5.site_leads.map(x=>[x.research_id,x]));
const sources=new Map(W5.sources.map(x=>[x.source_id,x]));
assert.equal(sites.size,38,"duplicate exact site ID");
assert.equal(sources.size,20,"duplicate source identity");
for(const s of W5.sources){assert.match(s.url,/^https:\/\//);assert.ok(s.authority.length>10);assert.ok(s.scope.length>25)}
for(const x of W5.site_leads){
 assert.equal(x.publication,"RESEARCH_ONLY");
 assert.equal(x.canonical_place_id,null);
 assert.equal(x.geo,null);assert.equal(x.image,null);assert.equal(x.biography,null);
 assert.equal(x.disposition,"CANDIDATE_EXACT_SITE_RECONCILIATION");
 assert.ok(x.source_ids.length>0&&x.source_ids.every(k=>sources.has(k)),"orphan primary source: "+x.name);
 assert.ok(x.site_type&&x.site_type.length>=20);
 assert.ok(!allBefore.some(o=>o.cc===x.country_code&&normalize(o.name)===normalize(x.name)),
 "wave5 accidentally duplicated previous site: "+x.name);
}
const assocIds=new Set();
for(const a of W5.associations){
 assert.ok(!assocIds.has(a.record_id));assocIds.add(a.record_id);
 assert.ok(sites.has(a.site_research_id),"orphan site in association "+a.record_id);
 assert.equal(a.country_code,sites.get(a.site_research_id).country_code);
 assert.ok(a.source_ids.length>0&&a.source_ids.every(k=>sources.has(k)),"orphan category source "+a.record_id);
 assert.equal(a.publication,"RESEARCH_ONLY");assert.equal(a.one_place_one_pin,true);
 assert.equal(a.geo,null);assert.equal(a.route_geometry,null);
 assert.ok(a.claim_evidence.length>35&&a.qualification.length>35);
 assert.ok(["PILGRIMAGES","RELICS","CUSTOMS","SACRED_IMAGE","APPARITIONS"].includes(a.category));
}
assert.deepEqual(W5.counts.by_country,
 Object.fromEntries([...new Set(W5.site_leads.map(x=>x.country_code))].sort().map(cc=>[cc,W5.site_leads.filter(x=>x.country_code===cc).length])));
for(const cat of ["PILGRIMAGES","RELICS","CUSTOMS","SACRED_IMAGE","APPARITIONS"])
 assert.equal(W5.counts.by_category[cat],W5.associations.filter(x=>x.category===cat).length);
assert.equal(W5.counts.source_records,W5.sources.length);
assert.equal(W5.counts.site_candidates,W5.site_leads.length);
assert.equal(W5.counts.category_associations,W5.associations.length);
assert.equal(W5.associations.filter(x=>x.category==="APPARITIONS").length,0,
 "historical discoveries, Lourdes replicas, visions and miracle claims must not be automatically promoted to apparitions");
assert.ok(W5.associations.some(x=>x.kind==="HISTORICAL_ST_HALLVARD_RELIQUARY_SITE"&&x.qualification.includes("No claim")));
assert.ok(W5.associations.some(x=>x.kind==="TEMPORARY_PROCESSIONAL_RELIC"&&x.qualification.includes("portable")));
assert.ok(W5.associations.some(x=>x.kind==="SAINT_AGATHA_RELIC_CUSTODY"&&x.qualification.includes("authentication")));
assert.ok(W5.associations.some(x=>x.kind==="EUCHARISTIC_BLOOD_DEVOTION"&&!x.claim_evidence.includes("apparition")));
assert.ok(W5.associations.some(x=>x.kind==="MARIAN_CAVE_IMAGE"&&x.qualification.includes("St Luke")));
assert.ok(W5.associations.some(x=>x.kind==="ECUMENICAL_PILGRIM_MASS"&&x.qualification.includes("Pax Mariae")));
assert.equal(M5.schema,"AO_EXPLORE_EUROPE_FIVE_WAVE_SOURCE_REGISTER_V1");
assert.equal(M5.status,"FIVE_WAVE_DISCOVERY_IN_PROGRESS_COUNTRIES_NOT_CERTIFIED");
assert.equal(M5.totals.source_research_site_leads,M4.summary.site_research_leads+W5.site_leads.length);
assert.equal(M5.totals.existing_canonical_place_matches,M4.summary.existing_canonical_place_matches);
assert.equal(M5.totals.unmatched_place_candidates,M4.summary.unmatched_new_place_candidates+W5.site_leads.length);
assert.equal(M5.totals.source_records,M4.summary.raw_source_records+W5.sources.length);
assert.equal(M5.totals.category_associations,M4.summary.category_associations+W5.associations.length);
const cats=["PILGRIMAGES","RELICS","APPARITIONS","SACRED_IMAGE","CUSTOMS"];
assert.deepEqual(M5.totals.by_category,Object.fromEntries(cats.map(k=>[k,(M4.summary.by_category[k]||0)+W5.associations.filter(x=>x.category===k).length])));
assert.equal(M5.country_audit.length,47);
const empty=[],sparse=[];
for(const c of M5.country_audit){
 assert.equal(c.published_canonical_places,historicalPlaces.filter(x=>x.address.country_code===c.country_code).length);
 assert.equal(c.additional_wave5_leads,W5.site_leads.filter(x=>x.country_code===c.country_code).length);
 assert.equal(c.total_research_leads,c.previous_research_leads+c.additional_wave5_leads);
 assert.equal(c.total_including_published_places,c.published_canonical_places+c.total_research_leads);
 assert.equal(c.certification,"INCOMPLETE_RESEARCH_ONLY");
 if(c.total_including_published_places===0)empty.push(c.country_code);
 if(c.total_including_published_places<=2)sparse.push(c.country_code);
}
assert.deepEqual(M5.scope.countries_without_site_or_lead,empty);
assert.deepEqual(M5.scope.countries_with_at_most_two_total_sites,sparse);
assert.equal(M5.totals.remaining_sparse_jurisdictions,sparse.length);
assert.equal(sparse.length,21);
assert.equal(empty.length,0);
assert.equal(M5.publication_state,"NO_NEW_PUBLIC_PLACES_OR_PINS");
console.log("PASS Europe fifth wave: 38 candidate sites, 47 category associations, 20 linked sources; 187 research leads across five waves; 21 sparse jurisdictions, zero published pins");
