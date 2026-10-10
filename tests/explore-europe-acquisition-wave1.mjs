import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const R=JSON.parse(readFileSync("data/explore/europe-acquisition.wave1.research.v1.json","utf8"));
const G=JSON.parse(readFileSync("data/geography/seed-registry.v1.json","utf8"));
// Source-acquisition wave snapshots compare with the geography registry at their original research freeze, not later map promotions.
const publishedAfterFreeze=new Set(JSON.parse(readFileSync("data/geography/research/sacred-geography-major-sites-launch-2026-10-10.v1.json","utf8")).promoted.map(p=>p.place_id));
const historicalPlaces=G.places.filter(p=>!publishedAfterFreeze.has(p.place_id));
const oldPlaces=new Map(historicalPlaces.map(x=>[x.place_id,x]));
const names=new Set(R.place_candidates.map(x=>x.lead_id));
const sources=new Set(R.sources.map(x=>x.source_id));
assert.equal(R.schema,"AO_EXPLORE_EUROPE_SOURCE_ACQUISITION_WAVE1_V1");
assert.equal(R.publication_status,"RESEARCH_ONLY_IDENTITY_AND_EVIDENCE_NO_PINS");
assert.equal(R.scope.continent,"EUROPE");
assert.equal(R.place_candidates.length,98);
assert.equal(names.size,R.place_candidates.length,"duplicate European site identities");
assert.equal(sources.size,R.sources.length,"duplicate source entries");
for(const s of R.sources){
 assert.match(s.url,/^https:\/\//,"European source is not clickable: "+s.source_id);
 assert.ok(s.role&&s.scope,"source role/scope unaccounted: "+s.source_id);
}
for(const p of R.place_candidates){
 assert.equal(p.continent,"EUROPE");assert.equal(p.publication_state,"RESEARCH_ONLY");
 assert.ok(p.country_code.match(/^[A-Z]{2}$/)&&p.name);
 assert.equal(p.geographic_coordinates,null,"Europe acquisition must not claim coordinate precision");
 assert.ok(p.identity_source_ids.length>0&&p.identity_source_ids.every(x=>sources.has(x)),p.lead_id+" lost authoritative discovery source");
 if(p.existing_place_id){
  const found=oldPlaces.get(p.existing_place_id);assert.ok(found,"claimed existing Place not found: "+p.existing_place_id);
  assert.equal(found.address.country_code,p.country_code,"country mismatch on existing Place "+p.lead_id);
  assert.equal(p.proposed_disposition,"EXISTING_IDENTITY_SOURCE_ENRICHMENT");
 }else{
  assert.equal(p.proposed_disposition,"NEW_PLACE_IDENTITY_CANDIDATE");
  assert.match(p.match_rule,/REVIEW_PENDING/);
 }
}
const matched=R.place_candidates.filter(x=>x.existing_place_id);
const newSites=R.place_candidates.filter(x=>!x.existing_place_id);
assert.equal(matched.length,22);assert.equal(newSites.length,76);
assert.equal(R.counts.distinct_place_leads,R.place_candidates.length);
assert.equal(R.counts.existing_place_matches,matched.length);
assert.equal(R.counts.new_place_candidates,newSites.length);
const groups=Object.fromEntries([...new Set(newSites.map(x=>x.country_code))].sort().map(c=>[c,newSites.filter(x=>x.country_code===c).length]));
assert.deepEqual(R.counts.new_place_by_country,groups);
assert.ok(Object.keys(groups).length>=20,"not yet a Europe-wide source sample");
assert.equal(R.country_coverage.length,47,"Europe source scope must account for minor jurisdictions too");
assert.equal(new Set(R.country_coverage.map(x=>x.country_code)).size,47,"duplicate country");
assert.equal(R.counts.coverage_countries,47);
assert.equal(R.counts.countries_with_zero_sites_in_current_registry_and_wave,
 R.country_coverage.filter(x=>x.coverage_state==="SOURCE_DISCOVERY_NOT_STARTED").length);
for(const row of R.country_coverage){
 assert.equal(row.existing_canonical_places,historicalPlaces.filter(p=>p.address.country_code===row.country_code).length);
 assert.equal(row.new_site_leads,newSites.filter(p=>p.country_code===row.country_code).length);
 assert.notEqual(row.coverage_state,"COMPLETE","no European country has passed full registry enumeration yet");
}
assert.ok(R.coverage_definition.includes("not a country-completion certificate"));

const leads=new Set(R.other_category_leads.map(x=>x.lead_id));
assert.equal(leads.size,R.other_category_leads.length,"duplicate assoc. identity");
const allowed=new Set(["SHRINES","PILGRIMAGES","RELICS","APPARITIONS","SACRED_IMAGE","CUSTOMS"]);
for(const x of R.other_category_leads){
 assert.ok(allowed.has(x.category),x.lead_id);
 assert.equal(x.publication_status,"RESEARCH_ONLY");
 assert.equal(x.coordinates,null);
 assert.equal(x.route_geometry,null);
 assert.ok(x.source_ids.length&&x.source_ids.every(s=>sources.has(s)),x.lead_id+" orphan source");
 assert.ok(x.claim_summary.length>=30,x.lead_id+" lacks meaningful sourced claim");
 const links=[x.target_place_lead_id,x.known_existing_place_id,...x.endpoint_place_lead_ids??[],...x.endpoint_existing_place_ids??[]].filter(Boolean);
 assert.ok(links.length>0,x.lead_id+" missing explicit Place target(s)");
 for(const link of links)assert.ok(names.has(link)||oldPlaces.has(link),x.lead_id+" dangling site "+link);
 assert.ok(x.review_gate.length>10);
}
for(const cat of ["PILGRIMAGES","RELICS","APPARITIONS","SACRED_IMAGE","CUSTOMS"])
 assert.equal(R.counts.by_category[cat],R.other_category_leads.filter(x=>x.category===cat).length);
assert.equal(R.counts.cross_category_research_associations,R.other_category_leads.length);
const tor=R.cross_reference_holds.find(x=>x.label.includes("Torreciudad"));
assert.ok(tor&&tor.decision==="DO_NOT_CLAIM_CANONICAL_SANCTUARY");
assert.ok(R.place_candidates.some(x=>x.name.includes("Panagia Evangelistria Orthodox")&&x.kind.includes("ORTHODOX")));
assert.ok(R.other_category_leads.some(x=>x.lead_id==="EUROPE:APPARITIONS:MT:TA-PINU-1883"&&x.kind.includes("AUDITORY")));
assert.ok(R.other_category_leads.some(x=>x.lead_id==="EUROPE:SACRED_IMAGE:IT:SIRACUSA-1953"));
assert.ok(R.other_category_leads.some(x=>x.lead_id==="EUROPE:APPARITIONS:FR:ILE-BOUCHARD-1947"&&x.review_gate.includes("NOT_RECOGNIZED")));
assert.ok(R.other_category_leads.some(x=>x.lead_id==="EUROPE:RELICS:GB:ST-SIMON-STOCK"));
const frenchGate=R.other_category_leads.filter(x=>x.category==="CUSTOMS"&&x.country_code!=="FR");
assert.ok(frenchGate.every(x=>x.scope||x.qualifier),"foreign local customs cannot silently become French domestic universals");
console.log("PASS Europe source acquisition: "+newSites.length+" new site leads, "+matched.length+" existing, "+R.other_category_leads.length+" documented cross-category leads, "+R.sources.length+" source records; zero new pins");
