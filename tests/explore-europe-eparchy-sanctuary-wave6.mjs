import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const a=read("data/explore/europe-acquisition.wave1.research.v1.json");
const b=read("data/explore/europe-acquisition.wave2.research.v1.json");
const c=read("data/explore/europe-acquisition.wave3.research.v1.json");
const d=read("data/explore/europe-acquisition.wave4-national-depth.research.v1.json");
const e=read("data/explore/europe-acquisition.wave5-diocesan-index.research.v1.json");
const prev=read("data/explore/europe-acquisition.five-wave-master.review.v1.json");
const f=read("data/explore/europe-acquisition.wave6-eparchy-sanctuaries.research.v1.json");
const master=read("data/explore/europe-acquisition.six-wave-coverage.review.v1.json");
const g=read("data/geography/seed-registry.v1.json");
const prior=[...a.place_candidates,...b.place_leads,...c.site_leads,...d.sites,...e.site_leads].map(x=>({country_code:x.country_code,name:x.name,id:x.lead_id||x.research_id||x.id||x.site_id}));
const published=g.places.map(x=>({country_code:x.address.country_code,name:x.name.official,id:x.place_id}));
const known=new Set([...prior,...published].map(x=>x.id));
const norm=x=>String(x).normalize("NFD").toLowerCase().replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"");
assert.equal(f.schema,"AO_EXPLORE_EUROPE_WAVE6_EPARCHY_SANCTUARY_ACQUISITION_V1");
assert.equal(f.status,"RESEARCH_ONLY_NO_LIVE_PLACE_CREATION");
assert.equal(f.site_leads.length,31);
assert.equal(f.source_register.length,31);
assert.equal(f.associations.length,48);
assert.equal(f.existing_site_enrichments.length,6);
const sites=new Map(f.site_leads.map(x=>[x.research_id,x])),sources=new Map(f.source_register.map(x=>[x.source_id,x]));
assert.equal(sites.size,f.site_leads.length,"duplicate site ids");
assert.equal(sources.size,f.source_register.length,"duplicate source IDs");
for(const x of sources.values()){
 assert.match(x.url,/^https:\/\//,x.source_id+" source URL invalid");
 assert.ok(x.authority?.length>12&&x.scope?.length>20,"source provenance incomplete: "+x.source_id);
}
for(const p of f.site_leads){
 assert.equal(p.canonical_place_id,null);
 assert.equal(p.geo,null);assert.equal(p.public_description,null);assert.equal(p.images,null);
 assert.equal(p.phase,"RESEARCH_IDENTITY_ONLY");
 assert.equal(p.publication_status,"HELD_SOURCE_RESEARCH");
 assert.ok(p.source_ids.length&&p.source_ids.every(id=>sources.has(id)),"orphan source on site "+p.name);
 assert.ok(!known.has(p.research_id));
 assert.ok(![...prior,...published].some(x=>x.country_code===p.country_code&&norm(x.name)===norm(p.name)),
  "exact-name collision with canonical/previous research: "+p.name);
}
assert.deepEqual(f.counts.by_country,{EE:2,FI:2,RO:3,SE:3,SK:9,UA:12});
const recordIds=new Set();
const cats=["PILGRIMAGES","RELICS","APPARITIONS","SACRED_IMAGE","CUSTOMS"];
for(const x of f.associations){
 assert.ok(!recordIds.has(x.id));recordIds.add(x.id);
 assert.ok(sites.has(x.site_research_id),x.id+" orphan new research site");
 assert.equal(x.country_code,sites.get(x.site_research_id).country_code);
 assert.ok(x.source_ids.length&&x.source_ids.every(id=>sources.has(id)),x.id+" orphan source");
 assert.equal(x.publication,"HELD_PENDING_CANONICAL_RECONCILIATION");
 assert.equal(x.coordinates,null);assert.equal(x.route_geometry,null);assert.equal(x.images,null);
 assert.ok(x.evidence_summary?.length>45&&x.qualification?.length>45,x.id+" lacks substantial evidence/limitation");
 assert.ok(cats.includes(x.category),x.id+" unknown category");
}
const en=new Set();
for(const x of f.existing_site_enrichments){
 assert.ok(!en.has(x.id));en.add(x.id);
 assert.ok(known.has(x.target_id),"evidence enrichment targets noncanonical/nonexisting Place "+x.target_id);
 assert.ok(x.source_ids.length&&x.source_ids.every(id=>sources.has(id)));
 assert.equal(x.publication,"SOURCE_ENRICHMENT_REQUIRES_DUPLICATE_RECONCILIATION");
 assert.equal(x.creates_new_place,false);assert.equal(x.creates_new_map_pin,false);
}
assert.equal(f.counts.source_records,sources.size);
assert.equal(f.counts.site_candidates,sites.size);
assert.equal(f.counts.association_records,recordIds.size);
assert.equal(f.counts.existing_site_enrichments,en.size);
assert.deepEqual(f.counts.by_category,Object.fromEntries(cats.map(k=>[k,f.associations.filter(x=>x.category===k).length])));
const lit=f.associations.filter(x=>x.site_research_id.includes("litmanova"));
assert.equal(lit.filter(x=>x.category==="APPARITIONS").length,1);
assert.ok(lit.every(x=>x.qualification.includes("NOT")||x.qualification.includes("not")),"Litmanova DDF status lost");
assert.ok(f.associations.find(x=>x.record_kind==="HISTORICAL_ST_HENRY_TRANSLATION").qualification.includes("Lutheran"));
assert.ok(f.associations.find(x=>x.record_kind==="TEMPORARY_TRUE_CROSS_VENERATION").qualification.includes("permanent"));
assert.ok(f.associations.find(x=>x.record_kind==="BLESSED_JOSAPHATA_HORDASHEVSKA_RELICS").qualification.includes("wartime"));
assert.ok(f.existing_site_enrichments.find(x=>x.target_id==="place:LU:basilica-st-willibrord-echternach"&&x.category==="CUSTOMS"));
assert.equal(master.schema,"AO_EXPLORE_EUROPE_SIX_WAVE_REGISTER_COVERAGE_V1");
assert.equal(master.status,"CONTINENT_SOURCE_ACQUISITION_INCOMPLETE_REVIEW_ONLY");
assert.equal(master.counts.jurisdictions,47);
assert.equal(master.counts.raw_site_research_leads,prev.totals.source_research_site_leads+f.site_leads.length);
assert.equal(master.counts.unmatched_new_place_research_leads,prev.totals.unmatched_place_candidates+f.site_leads.length);
assert.equal(master.counts.raw_source_references,prev.totals.source_records+f.source_register.length);
assert.equal(master.counts.source_owned_category_associations,prev.totals.category_associations+f.associations.length);
assert.equal(master.counts.existing_site_evidence_enrichments,f.existing_site_enrichments.length);
assert.deepEqual(master.counts.by_category,Object.fromEntries(cats.map(k=>[k,(prev.totals.by_category[k]||0)+f.associations.filter(x=>x.category===k).length])));
let sparse=[],empty=[];
for(const x of master.country_coverage){
 const old=prev.country_audit.find(y=>y.country_code===x.country_code);assert.ok(old,"lost European country "+x.country_code);
 const add=f.site_leads.filter(y=>y.country_code===x.country_code).length;
 assert.equal(x.wave6_research_sites,add);
 assert.equal(x.combined_research_sites,old.total_research_leads+add);
 assert.equal(x.combined_with_existing_places,old.total_including_published_places+add);
 assert.equal(x.completeness,"INCOMPLETE_IN_ALL_CATEGORIES");
 for(const cat of cats)assert.equal(x.category_associations[cat],(old.by_category[cat]||0)+f.associations.filter(y=>y.country_code===x.country_code&&y.category===cat).length);
 if(x.combined_with_existing_places===0)empty.push(x.country_code);
 if(x.combined_with_existing_places<=2)sparse.push(x.country_code);
}
assert.deepEqual(master.countries_with_no_site_lead,empty);
assert.deepEqual(master.countries_with_at_most_two_combined_place_or_research_sites,sparse);
assert.equal(master.counts.remaining_zero_site_jurisdictions,0);
assert.equal(master.counts.remaining_sparse_jurisdictions,16);
assert.equal(master.release_state,"EUROPE_RESEARCH_IN_PROGRESS_NOT_CERTIFIED");
console.log("PASS Europe wave6: 31 research sites, 48 associations, six exact-site evidence enrichments; 218 site leads and 16 sparse jurisdictions, no new pins");
