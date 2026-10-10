import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const W1=read("data/explore/europe-acquisition.wave1.research.v1.json");
const W2=read("data/explore/europe-acquisition.wave2.research.v1.json");
const W3=read("data/explore/europe-acquisition.wave3.research.v1.json");
const W4=read("data/explore/europe-acquisition.wave4-national-depth.research.v1.json");
const W5=read("data/explore/europe-acquisition.wave5-diocesan-index.research.v1.json");
const W6=read("data/explore/europe-acquisition.wave6-eparchy-sanctuaries.research.v1.json");
const W7=read("data/explore/europe-acquisition.wave7-sparse-country.research.v1.json");
const M6=read("data/explore/europe-acquisition.six-wave-coverage.review.v1.json");
const M7=read("data/explore/europe-acquisition.seven-wave-coverage.review.v1.json");
const G=read("data/geography/seed-registry.v1.json");
assert.equal(W7.schema,"AO_EXPLORE_EUROPE_WAVE7_SPARSE_COUNTRY_SOURCE_RESEARCH_V1");
assert.equal(W7.status,"RESEARCH_ONLY_NO_NEW_PUBLIC_PLACES");
assert.equal(W7.site_leads.length,14);assert.equal(W7.source_records.length,13);assert.equal(W7.associations.length,19);
assert.equal(W7.canonical_enrichments.length,0);
const ids=new Set(W7.site_leads.map(x=>x.research_id)),sources=new Set(W7.source_records.map(x=>x.source_id));
assert.equal(ids.size,14);assert.equal(sources.size,13);
const prior=[...W1.place_candidates,...W2.place_leads,...W3.site_leads,...W4.sites,...W5.site_leads,...W6.site_leads].map(x=>({cc:x.country_code,name:x.name}));
prior.push(...G.places.map(x=>({cc:x.address.country_code,name:x.name.official})));
const norm=x=>String(x).normalize("NFD").toLowerCase().replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"");
const keys=new Set(prior.map(x=>x.cc+":"+norm(x.name)));
for(const s of W7.source_records){assert.match(s.url,/^https:\/\//);assert.ok(s.authority&&s.scope&&s.verification)}
for(const x of W7.site_leads){
 assert.equal(x.publication_state,"RESEARCH_ONLY_UNRESOLVED_CANONICAL_IDENTITY");
 assert.equal(x.canonical_place_id,null);
 assert.equal(x.coordinates,null);assert.equal(x.biography,null);assert.equal(x.images,null);
 assert.ok(x.site_source_ids.length&&x.site_source_ids.every(id=>sources.has(id)));
 const key=x.country_code+":"+norm(x.name);assert.ok(!keys.has(key),"name collides with prior European site "+x.name);keys.add(key);
}
const rec=new Set(),cat=["PILGRIMAGES","RELICS","APPARITIONS","SACRED_IMAGE","CUSTOMS"];
for(const a of W7.associations){
 assert.ok(!rec.has(a.record_id));rec.add(a.record_id);
 assert.ok(ids.has(a.site_research_id),"orphan site "+a.record_id);
 assert.equal(a.country_code,W7.site_leads.find(x=>x.research_id===a.site_research_id)?.country_code);
 assert.ok(a.source_ids.length&&a.source_ids.every(x=>sources.has(x)),a.record_id+" source lost");
 assert.ok(cat.includes(a.category));assert.equal(a.publication,"RESEARCH_ONLY_NOT_MAPPED");
 assert.equal(a.map_pin,false);assert.equal(a.coordinates,null);assert.equal(a.route_geometry,null);
 assert.ok(a.evidence_summary.length>=40);assert.ok(a.qualification.length>=45);
}
assert.deepEqual(W7.counts.by_category,Object.fromEntries(cat.map(k=>[k,W7.associations.filter(x=>x.category===k).length])));
assert.equal(W7.associations.filter(x=>x.category==="APPARITIONS").length,0,"do not infer apparitions at mere Marian sites");
assert.ok(W7.associations.find(x=>x.record_kind==="DESTROYED_OLD_MARIAN_IMAGE")?.qualification.includes("lost image"));
assert.ok(W7.associations.find(x=>x.record_kind==="REPORTED_ST_TRYPHON_CUSTODY_HISTORICAL")?.qualification.includes("Secondary"));
assert.ok(W7.associations.find(x=>x.record_kind==="GLACIS_MARIAN_OCTAVE_HERITAGE")?.qualification.includes("French"));
assert.ok(W7.associations.find(x=>x.record_kind==="CATHOLIC_CATHEDRAL_HERITAGE_STOP")?.qualification.includes("tombs"));
assert.equal(M7.schema,"AO_EXPLORE_EUROPE_SEVEN_WAVE_REGISTRY_COVERAGE_V1");
assert.equal(M7.status,"CONTINENTAL_SOURCE_RESEARCH_INCOMPLETE_NOT_CERTIFIED");
assert.equal(M7.totals.jurisdictions,47);
assert.equal(M7.totals.site_research_leads,M6.counts.raw_site_research_leads+W7.site_leads.length);
assert.equal(M7.totals.unmatched_research_place_candidates,M6.counts.unmatched_new_place_research_leads+W7.site_leads.length);
assert.equal(M7.totals.raw_source_records,M6.counts.raw_source_references+W7.source_records.length);
assert.equal(M7.totals.category_associations,M6.counts.source_owned_category_associations+W7.associations.length);
assert.deepEqual(M7.totals.by_category,Object.fromEntries(cat.map(k=>[k,M6.counts.by_category[k]+W7.associations.filter(x=>x.category===k).length])));
assert.equal(M7.country_coverage.length,47);
const sparse=[],empty=[];
for(const x of M7.country_coverage){
 const prev=M6.country_coverage.find(p=>p.country_code===x.country_code);assert.ok(prev);
 const gain=W7.site_leads.filter(p=>p.country_code===x.country_code).length;
 assert.equal(x.wave7_site_leads,gain);
 assert.equal(x.total_places_or_research_leads,prev.combined_with_existing_places+gain);
 assert.equal(x.coverage_status,"INCOMPLETE_RESEARCH_ONLY");
 for(const k of cat)assert.equal(x.category_associations[k],(prev.category_associations[k]||0)+W7.associations.filter(a=>a.country_code===x.country_code&&a.category===k).length);
 if(x.total_places_or_research_leads<=2)sparse.push(x.country_code);
 if(x.total_places_or_research_leads===0)empty.push(x.country_code);
}
assert.deepEqual(M7.sparse_jurisdictions,sparse);assert.deepEqual(M7.zero_site_jurisdictions,empty);
assert.equal(sparse.length,10);assert.equal(empty.length,0);
assert.equal(M7.release_status,"EUROPE_ACQUISITION_UNFINISHED_NO_PINS");
console.log("PASS Europe wave7: 14 sites, 19 category associations, 13 source records; Europe seven-wave 232 leads, 10 sparse countries, zero new pins");
