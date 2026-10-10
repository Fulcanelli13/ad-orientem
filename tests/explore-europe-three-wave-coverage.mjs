import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const W1=read("data/explore/europe-acquisition.wave1.research.v1.json");
const W2=read("data/explore/europe-acquisition.wave2.research.v1.json");
const W3=read("data/explore/europe-acquisition.wave3.research.v1.json");
const C=read("data/explore/europe-acquisition.three-wave-coverage.review.v1.json");
const G=read("data/geography/seed-registry.v1.json");
assert.equal(W3.schema,"AO_EXPLORE_EUROPE_WAVE3_TEN_COUNTRY_ACQUISITION_REVIEW_V1");
assert.equal(W3.status,"RESEARCH_ONLY_NO_LIVE_PINS");
assert.equal(W3.source_register.length,25);
assert.equal(W3.site_leads.length,22);
assert.equal(W3.category_leads.length,25);
assert.equal(W3.counts.countries,10);
const src=new Map(W3.source_register.map(x=>[x.id,x]));
const site=new Map(W3.site_leads.map(x=>[x.id,x]));
assert.equal(src.size,25,"duplicate source ID");
assert.equal(site.size,22,"duplicate Place candidate ID");
const countrySet=new Set(W3.site_leads.map(x=>x.country_code));
assert.equal(countrySet.size,10);
const prev=new Set(W2.place_leads.map(x=>x.country_code));
assert.ok([...countrySet].every(x=>!G.places.some(y=>y.address.country_code===x)),"new country is already in published registry");
assert.ok([...countrySet].every(x=>!W1.place_candidates.some(y=>y.country_code===x)),"wave3 mislabeled earlier wave1 country");
assert.ok([...countrySet].every(x=>!prev.has(x)),"wave3 mislabeled wave2 country");
for(const x of W3.source_register){
 assert.match(x.url,/^https:\/\//,"invalid institution link "+x.id);
 assert.ok(x.authority.length>=8);
}
for(const x of W3.site_leads){
 assert.equal(x.coordinates,null);assert.equal(x.media,null);assert.equal(x.biography,null);
 assert.equal(x.canonical_place_id,null);
 assert.equal(x.site_status,"RESEARCH_ONLY");
 assert.ok(x.source_ids.length>0&&x.source_ids.every(id=>src.has(id)));
 assert.ok(x.ownership.length>8);
}
const assoc=new Set();
for(const x of W3.category_leads){
 assert.ok(!assoc.has(x.id));assoc.add(x.id);
 assert.ok(site.has(x.site_id),"no canonical identity for "+x.id);
 assert.ok(x.source_ids.length>0&&x.source_ids.every(id=>src.has(id)));
 assert.equal(x.identity_status,"RESEARCH_ONLY");
 assert.equal(x.publication,"NOT_APPROVED");
 assert.equal(x.map_pin,false);
 assert.ok(x.claim.length>=35&&x.qualification.length>=35);
 assert.ok(["PILGRIMAGES","RELICS","SACRED_IMAGE","CUSTOMS","APPARITIONS"].includes(x.category));
 assert.equal(x.exact_date_status,"NO_EVENT_SCHEDULE_CLAIM");
}
assert.equal(W3.category_leads.filter(x=>x.category==="APPARITIONS").length,0,"do not manufacture new apparitions just to fill a category");
assert.ok(W3.category_leads.find(x=>x.id.includes("RU")&&x.claim.includes("memorial cross")&&x.qualification.includes("NOT a reliquary")));
assert.ok(W3.category_leads.find(x=>x.kind==="REPORTED_RELIC_EXHIBITION"));
assert.ok(W3.category_leads.find(x=>x.kind==="REGIONAL_MARONITE_BLESSING"));
assert.ok(W3.category_leads.find(x=>x.kind==="HISTORICAL_TRANSLATION_NO_PRESENT_OBJECT"));
assert.equal(C.schema,"AO_EXPLORE_EUROPE_ACQUISITION_THREE_WAVES_REVIEW_V1");
assert.equal(C.status,"RESEARCH_ONLY_INCOMPLETE_NO_PUBLICATION");
assert.equal(C.counts.country_jurisdictions,47);
assert.equal(C.counts.three_wave_site_leads,W1.place_candidates.length+W2.place_leads.length+W3.site_leads.length);
assert.equal(C.counts.exact_existing_place_matches,W1.place_candidates.filter(x=>x.existing_place_id).length);
assert.equal(C.counts.novel_place_candidates,W1.place_candidates.filter(x=>!x.existing_place_id).length+W2.place_leads.length+W3.site_leads.length);
assert.equal(C.counts.category_associations,W1.other_category_leads.length+W2.category_associations.length+W3.category_leads.length);
assert.equal(C.counts.source_records,W1.sources.length+W2.source_records.length+W3.source_register.length);
assert.equal(C.country_coverage??C.countries?.length,C.countries.length);
assert.equal(C.countries.length,47);
const remaining=[];
for(const x of C.countries){
 assert.equal(x.wave3_new_leads,W3.site_leads.filter(s=>s.country_code===x.country_code).length);
 assert.equal(x.after_three_waves_new_candidates,x.combined_new_leads+x.wave3_new_leads);
 assert.equal(x.completion_status,"PARTIAL_SOURCE_ACQUISITION_NOT_EXHAUSTIVE");
 if(x.after_three_waves_new_candidates+x.existing_canonical_places===0)remaining.push(x.country_code);
}
assert.deepEqual(C.remaining_zero_site_countries,remaining);
assert.equal(remaining.length,0);
assert.equal(C.phase_gate.public_pin_creation,"FORBIDDEN_IN_RESEARCH");
assert.match(C.coverage_caveat,/does not mean EUROPE COMPLETE/);
console.log("PASS Europe three waves: 132 site leads, 110 novel candidates, 95 source records, 91 category associations, 47/47 with at least one site lead; zero certified complete");
