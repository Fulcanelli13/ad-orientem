import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const A=read("data/explore/europe-acquisition.four-wave-master.review.v1.json");
const W1=read("data/explore/europe-acquisition.wave1.research.v1.json");
const W2=read("data/explore/europe-acquisition.wave2.research.v1.json");
const W3=read("data/explore/europe-acquisition.wave3.research.v1.json");
const W4=read("data/explore/europe-acquisition.wave4-national-depth.research.v1.json");
const G=read("data/geography/seed-registry.v1.json");
assert.equal(A.schema,"AO_EXPLORE_EUROPE_FOUR_WAVE_MASTER_REVIEW_V1");
assert.equal(A.status,"REGISTRY_RESEARCH_IN_PROGRESS_NONE_COMPLETE");
assert.equal(A.publication_control,"ALL_INCOMING_WAVES_RESEARCH_ONLY_NO_NEW_PINS_NO_BIOGRAPHIES_NO_IMAGES");
const waves=[
 {places:W1.place_candidates.map(x=>({id:x.lead_id,name:x.name,cc:x.country_code,existing:x.existing_place_id})),sources:W1.sources.map(x=>x.url),ass:W1.other_category_leads.map(x=>({category:x.category,cc:x.country_code}))},
 {places:W2.place_leads.map(x=>({id:x.research_id,name:x.name,cc:x.country_code,existing:null})),sources:W2.source_records.map(x=>x.url),ass:W2.category_associations.map(x=>({category:x.category,cc:W2.place_leads.find(p=>p.research_id===x.site_research_id)?.country_code}))},
 {places:W3.site_leads.map(x=>({id:x.id,name:x.name,cc:x.country_code,existing:null})),sources:W3.source_register.map(x=>x.url),ass:W3.category_leads.map(x=>({category:x.category,cc:W3.site_leads.find(p=>p.id===x.site_id)?.country_code}))},
 {places:W4.sites.map(x=>({id:x.site_id,name:x.name,cc:x.country_code,existing:null})),sources:W4.sources.map(x=>x.url),ass:W4.associations.map(x=>({category:x.category,cc:W4.sites.find(p=>p.site_id===x.site_id)?.country_code}))}
];
const all=waves.flatMap(x=>x.places),urls=waves.flatMap(x=>x.sources),assoc=waves.flatMap(x=>x.ass);
assert.equal(A.summary.jurisdictions,47);
assert.equal(A.summary.waves,waves.length);
assert.equal(A.summary.site_research_leads,all.length);
assert.equal(A.summary.existing_canonical_place_matches,all.filter(x=>x.existing).length);
assert.equal(A.summary.unmatched_new_place_candidates,all.filter(x=>!x.existing).length);
assert.equal(A.summary.raw_source_records,urls.length);
assert.equal(A.summary.distinct_source_urls,new Set(urls).size);
assert.equal(A.summary.category_associations,assoc.length);
assert.equal(new Set(all.map(x=>x.id)).size,all.length,"research site IDs overlap");
const cat=["PILGRIMAGES","RELICS","APPARITIONS","SACRED_IMAGE","CUSTOMS"];
assert.deepEqual(A.summary.by_category,Object.fromEntries(cat.map(k=>[k,assoc.filter(x=>x.category===k).length])));
assert.equal(A.country_review.length,47);
assert.equal(new Set(A.country_review.map(x=>x.country_code)).size,47);
let sparse=0,empty=0;
const existingIds=new Set(G.places.map(x=>x.place_id));
for(const row of A.country_review){
 const cc=row.country_code,placeRows=all.filter(x=>x.cc===cc),acts=assoc.filter(x=>x.cc===cc);
 const existing=G.places.filter(p=>p.address.country_code===cc).length;
 assert.equal(row.published_canonical_places,existing);
 assert.equal(row.source_research_site_leads,placeRows.length);
 assert.equal(row.unmatched_research_site_leads,placeRows.filter(x=>!x.existing).length);
 assert.equal(row.source_research_associations,acts.length);
 assert.deepEqual(row.category_associations,Object.fromEntries(cat.map(k=>[k,acts.filter(x=>x.category===k).length])));
 assert.equal(row.coverage_status,"PARTIAL_COUNTRY_ACQUISITION_PENDING_EXHAUSTIVE_NATIONAL_RECONCILIATION");
 if(existing+placeRows.length<=2){sparse++;assert.equal(row.priority,"HIGH_UNDERREPRESENTED")}
 else if(existing+placeRows.length<=6)assert.equal(row.priority,"MEDIUM_UNDERREPRESENTED");
 else assert.equal(row.priority,"NATIONAL_COMPLETENESS_REVIEW");
 if(existing+placeRows.length===0)empty++;
}
assert.equal(A.summary.zero_site_countries,empty);
assert.equal(A.summary.countries_with_0_2_total_places_or_leads,sparse);
assert.equal(empty,0);
for(const item of all.filter(x=>x.existing))assert.ok(existingIds.has(item.existing),"proposed match was deleted from canonical registry");
const normalize=s=>String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"");
const duplicate=new Map(),collisions=[];
for(const x of all){
 const key=x.cc+":"+normalize(x.name);
 if(duplicate.has(key))collisions.push([x.id,duplicate.get(key)]);
 else duplicate.set(key,x.id);
}
assert.equal(A.summary.exact_name_collision_groups,collisions.length);
assert.deepEqual(A.source_identity_duplicate_scan,collisions.map(x=>({country_code:all.find(y=>y.id===x[0]).cc,ids:[x[1],x[0]]})));
assert.ok(A.category_boundaries.some(x=>x.includes("SHRINES")));
assert.ok(A.next_acquisition_gate.some(x=>x.includes("national source")));
console.log("PASS Europe four-wave master: "+all.length+" site leads, "+A.summary.unmatched_new_place_candidates+" unmatched, "+assoc.length+" evidence associations, "+sparse+" sparse countries, none complete");
