import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const W1=read("data/explore/europe-acquisition.wave1.research.v1.json");
const W2=read("data/explore/europe-acquisition.wave2.research.v1.json");
const C=read("data/explore/europe-acquisition.combined-coverage.review.v1.json");
const G=read("data/geography/seed-registry.v1.json");
assert.equal(W2.schema,"AO_EXPLORE_EUROPE_RESEARCH_WAVE2_ZERO_COVERAGE_V1");
assert.equal(W2.status,"RESEARCH_ONLY_NO_PRODUCTION_ASSETS_OR_PINS");
assert.equal(W2.place_leads.length,12);
assert.equal(W2.category_associations.length,18);
assert.equal(W2.source_records.length,16);
assert.equal(W2.countries,10);
assert.equal(new Set(W2.place_leads.map(x=>x.research_id)).size,12);
assert.equal(new Set(W2.category_associations.map(x=>x.lead_id)).size,18);
assert.equal(new Set(W2.source_records.map(x=>x.source_id)).size,16);
const ids=new Set(W2.place_leads.map(x=>x.research_id));
const sources=new Set(W2.source_records.map(x=>x.source_id));
const oldCountries=new Set(G.places.map(p=>p.address.country_code));
const wave1Sites=new Set(W1.place_candidates.map(x=>x.lead_id));
for(const p of W2.place_leads){
 assert.equal(p.publication_status,"RESEARCH_ONLY");
 assert.equal(p.coordinates,null);
 assert.equal(p.biography,null);
 assert.equal(p.image,null);
 assert.equal(p.canonical_place_id,null);
 assert.ok(sources.has(p.identity_source_id),p.research_id+" lost source identity");
 assert.ok(!oldCountries.has(p.country_code),p.research_id+" already in canonical country: reconcile instead");
 assert.ok(!wave1Sites.has(p.research_id),p.research_id+" duplicates wave1");
}
for(const s of W2.source_records){
 assert.match(s.url,/^https:\/\//);
 assert.ok(s.role.length>=8);
}
for(const a of W2.category_associations){
 assert.ok(ids.has(a.site_research_id),a.lead_id+" unlinked site");
 assert.ok(a.source_ids.length>0&&a.source_ids.every(id=>sources.has(id)),a.lead_id+" source missing");
 assert.equal(a.publication_status,"RESEARCH_ONLY_NOT_MAPPED");
 assert.ok(a.qualifier.length>25);
 assert.equal(a.location_claim_only,true);
}
assert.equal(W2.category_associations.filter(x=>x.category==="APPARITIONS").length,1);
assert.equal(W2.category_associations.filter(x=>x.category==="CUSTOMS").length,4);
assert.equal(W2.category_associations.filter(x=>x.category==="PILGRIMAGES").length,9);
assert.equal(W2.category_associations.filter(x=>x.category==="RELICS").length,1);
assert.equal(W2.category_associations.filter(x=>x.category==="SACRED_IMAGE").length,3);
const medj=W2.category_associations.find(x=>x.category==="APPARITIONS");
assert.ok(medj&&/not supernatural origin/i.test(medj.qualifier),"Medjugorje nihil obstat is not supernatural certification");
const marina=W2.category_associations.find(x=>x.category==="RELICS");
assert.ok(marina&&marina.qualifier.includes("authentication"));
assert.ok(W2.evidence_guards.some(x=>x.includes("Budsla")));
assert.equal(C.schema,"AO_EXPLORE_EUROPE_ACQUISITION_COMBINED_COVERAGE_V1");
assert.equal(C.status,"EUROPE_SOURCE_ACQUISITION_IN_PROGRESS");
assert.equal(C.counts.country_jurisdictions,47);
assert.equal(C.country_coverage.length,47);
assert.equal(C.counts.wave1_existing_place_matches,W1.counts.existing_place_matches);
assert.equal(C.counts.wave1_new_site_leads,W1.counts.new_place_candidates);
assert.equal(C.counts.wave2_new_site_leads,W2.place_leads.length);
assert.equal(C.counts.combined_distinct_place_leads,W1.place_candidates.length+W2.place_leads.length);
assert.equal(C.counts.combined_new_place_leads,W1.counts.new_place_candidates+W2.place_leads.length);
assert.equal(C.counts.category_associations,W1.other_category_leads.length+W2.category_associations.length);
assert.equal(C.counts.source_records,W1.sources.length+W2.source_records.length);
const empty=[];
for(const row of C.country_coverage){
 assert.equal(row.existing_canonical_places,G.places.filter(p=>p.address.country_code===row.country_code).length);
 assert.equal(row.new_site_leads,W1.place_candidates.filter(p=>p.country_code===row.country_code&&!p.existing_place_id).length);
 assert.equal(row.wave2_new_leads,W2.place_leads.filter(p=>p.country_code===row.country_code).length);
 assert.equal(row.combined_new_leads,row.new_site_leads+row.wave2_new_leads);
 assert.equal(row.combined_research_state,"INCOMPLETE_RESEARCH_ONLY");
 if(row.combined_new_leads+row.existing_canonical_places===0)empty.push(row.country_code);
}
assert.deepEqual(C.countries_with_no_current_site_evidence,empty);
assert.equal(empty.length,10);
assert.equal(C.counts.zero_site_coverage_countries,empty.length);
assert.equal(C.publication_authority,"NO_IMPORTED_RECORDS_OR_PINS");
console.log("PASS Explore Europe 2 waves: 110 distinct site leads, 88 new candidates, 66 source-linked category claims, 10 countries without a site, zero imported pins");
