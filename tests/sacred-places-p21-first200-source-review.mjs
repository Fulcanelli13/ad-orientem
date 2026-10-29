import {LIVE} from "./helpers/sacred-places-live-baseline.mjs";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const p20=load("data/geography/research/sacred-places-p20-750-bulk-triage.v1.json");
const p21=load("data/geography/research/sacred-places-p21-first200-source-review.v1.json");
const geo=load("data/geography/seed-registry.v1.json");
const sources=load("data/shrines/source-registry.v1.json");
const p16=load("data/geography/research/sacred-places-p16-three-qualified-site-release.v1.json");

assert.equal(p21.schema,"AO_SACRED_PLACES_P21_FIRST200_SOURCE_EVIDENCE_REVIEW_V1");
assert.equal(p21.status,"RESEARCH_ONLY_FIRST_SCREEN_NOT_PHYSICAL_RELEASE");
assert.equal(p21.reviewed_200.length,200);
assert.deepEqual(p21.reviewed_200.map(x=>x.candidate_id),p20.verification_first_200,"Priority roster changed");
assert.equal(new Set(p21.reviewed_200.map(x=>x.candidate_id)).size,200);
assert.deepEqual([p21.baseline.places,p21.baseline.sources,p21.baseline.directory_links],[361,659,9]);
assert.ok(geo.places.length>=361);
assert.ok(sources.sources.length>=659);
assert.equal(geo.directoryPlaceLinks.length,LIVE.links);
const gates={};
let extracted=0,normalised=0;
const geoIds=new Set(geo.places.map(x=>x.place_id));
for(const [i,x] of p21.reviewed_200.entries()){
 assert.equal(x.order,i+1);
 assert.equal(x.identity_physical_unit_verified_for_publication,false);
 assert.equal(x.independent_exact_geo_review_pass,false);
 assert.equal(x.approved_new_canonical_place_id,null);
 assert.equal(x.publication_approved,false);
 gates[x.source_gate]=(gates[x.source_gate]||0)+1;
 if(x.source_status==="SOURCE_SNIPPET_REVIEWED_2026_10_24"){
  extracted++;
  assert.ok(x.primary_or_institutional_evidence,"A completed snippet review must retain direct source evidence");
  const e=x.primary_or_institutional_evidence;
  assert.match(e.url,/^https:\/\//);
  assert.ok(e.issuer.length>3);
  assert.ok(e.scope_note.length>30);
 }else{
  assert.equal(x.source_status,"NO_NEW_INDEPENDENT_SOURCE_REVIEW");
  assert.equal(x.primary_or_institutional_evidence,undefined,"No invented evidence for rows not checked");
 }
 if(x.inherited_discovery_urls)assert.equal(x.inherited_urls_certify_site,false);
 if(x.country_iso_alpha2!==x.country_original){normalised++;assert.deepEqual([x.country_original,x.country_iso_alpha2],x.country_original==="DY"?["DY","BJ"]:["HV","BF"]);}
 if(x.candidate_existing_place_id)assert.ok(geoIds.has(x.candidate_existing_place_id));
}
assert.deepEqual(p21.counts.source_gates,gates);
assert.equal(extracted,p21.counts.source_snippets_reviewed);
assert.equal(200-extracted,p21.counts.remaining_without_new_source_review);
assert.equal(normalised,2);
assert.equal(p21.counts.new_publishable_places,0);
assert.equal(p16.held_exceptions.length,16);
const id=new Map(p21.reviewed_200.map(x=>[x.candidate_id,x]));
assert.equal(id.get("SG-INV-0301").primary_or_institutional_evidence.issuer,"Archdiocese of Košice");
assert.equal(id.get("SG-INV-0299").source_gate,"EASTERN_CATHOLIC_COMPLEX_SOURCE_SUPPORTED");
assert.equal(id.get("SG-INV-0415").source_gate,"MULTIPLE_CATHOLIC_SAME_TITLE_SITES_UNRESOLVED");
assert.equal(id.get("SG-INV-0255").source_gate,"NON_CATHOLIC_OPERATING_SITE");
assert.equal(id.get("SG-INV-0734").candidate_existing_place_id,"place:MU:pere-laval-sainte-croix");
assert.equal(id.get("SG-INV-0572").candidate_existing_place_id,"place:JO:memorial-moses-mount-nebo");
assert.equal(id.get("SG-INV-0155").source_gate,"NEW_2026_CATHOLIC_BUILDING_SCOPE_SPLIT");
assert.equal(id.get("SG-INV-0631").source_gate,"CATHOLIC_COMPLEX_NEEDS_PHYSICAL_SPLIT");
console.log("PASS P21: 200 exact research IDs, "+extracted+" source-snippet reviews, protected 16 historic holds, 2 ISO repairs, no unverified Place release");
