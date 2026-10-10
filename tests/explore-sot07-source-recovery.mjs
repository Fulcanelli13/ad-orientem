import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {isMapPublishablePlaceGeo} from "../src/find/geography-contracts.js";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const S=read("data/customs/sot07-full-recovery.review.v1.json");
const A=read("data/customs/sot07g-geographic-full-inventory.review.v1.json");
const P=read("data/customs/customs-atlas-seed.v1.json");
const N=read("data/customs/negative-knowledge.v1.json");
const G=read("data/geography/seed-registry.v1.json");
const R=read("data/explore/heritage-place-reconciliation.review.v1.json");

assert.equal(S.schema,"AO_SOT07_FULL_CUSTOMARY_CROSSWALK_REVIEW_V1");
assert.equal(S.status,"RESEARCH_RECOVERED_REVIEW_ONLY_NO_AUTOMATIC_PUBLICATION");
assert.equal(S.source_sheet,"01_CUSTOMARY_REGISTER");
assert.equal(S.rows.length,63,"63 original SOT07 row identities must be recovered");
assert.equal(new Set(S.rows.map(x=>x.original_custom_id)).size,63,"SOT07 original IDs duplicated");
assert.deepEqual(S.rows.map(x=>x.row_number),Array.from({length:63},(_,i)=>i+5));
assert.ok(S.rows.every(x=>x.workbook_source_ids.length>0),"a research row lost all original bibliographic provenance");
const published=new Set(P.customs.map(x=>x.custom_id));
const held=new Set(N.entries.filter(x=>x.decision==="HOLD").map(x=>x.custom_id));
const rejected=new Set(N.entries.filter(x=>x.decision==="REJECT").map(x=>x.custom_id));
assert.deepEqual(S.counts,{
 total:63,published:13,hold:3,reject:4,cross_module_or_review:43
});
for(const row of S.rows){
 const expected=published.has(row.original_custom_id)?"PUBLISHED_CANONICAL":
  held.has(row.original_custom_id)?"HOLD_NOT_PUBLISHED":
  rejected.has(row.original_custom_id)?"REJECT_NOT_PUBLISHED":"CROSS_MODULE_OR_EDITORIAL_REVIEW";
 assert.equal(row.disposition,expected,"SOT07 disposition drifted: "+row.original_custom_id);
 assert.equal(row.canonical_custom_id,published.has(row.original_custom_id)?row.original_custom_id:null);
 if(held.has(row.original_custom_id)||rejected.has(row.original_custom_id))
   assert.ok(row.notes,"blocked original research row lacks recorded negative knowledge");
}
for(const n of N.entries)assert.equal(n.map_blocked,true,"forbidden old custom returned to map: "+n.custom_id);

assert.equal(A.schema,"AO_SOT07G_GEOGRAPHIC_CUSTOMARY_FULL_INVENTORY_REVIEW_V1");
assert.equal(A.status,"ORIGINAL_RESEARCH_WORKBOOK_RECOVERED_REVIEW_ONLY");
assert.deepEqual(A.counts,{families:53,complexes:21,geographic_attestations:135,geo_areas:162,sources:117});
const fam=new Set(A.families.map(x=>x.family_id)),areas=new Set(A.geographic_areas.map(x=>x.geo_id)),src=new Set(A.source_registry.map(x=>x.source_id)),att=new Set(A.attestations.map(x=>x.attestation_id));
assert.equal(fam.size,53);assert.equal(areas.size,162);assert.equal(src.size,117);assert.equal(att.size,135);
assert.equal(new Set(A.complexes.map(x=>x.complex_id)).size,21);
assert.deepEqual(A.families.map(x=>x.workbook_row),Array.from({length:53},(_,i)=>i+5));
assert.deepEqual(A.complexes.map(x=>x.workbook_row),Array.from({length:21},(_,i)=>i+5));
assert.deepEqual(A.source_registry.map(x=>x.workbook_row),Array.from({length:117},(_,i)=>i+5));
assert.deepEqual(A.geographic_areas.map(x=>x.workbook_row),Array.from({length:162},(_,i)=>i+5));
assert.deepEqual(A.attestations.map(x=>x.original_workbook_row),Array.from({length:135},(_,i)=>i+5));
for(const x of A.attestations){
 assert.ok(fam.has(x.family_id),"atlas family missing: "+x.attestation_id);
 assert.ok(areas.has(x.geo_id),"atlas geography missing: "+x.attestation_id);
 assert.ok(src.has(x.source_id),"atlas source reference missing: "+x.attestation_id);
 assert.equal(x.publication_disposition,"REVIEW_NOT_AUTOMATICALLY_PUBLISHED");
 assert.ok(["PIN","LIVING_CENTRE","AREA","ROUTE","CLUSTER","ORIGIN_SITE"].includes(x.relation));
}
assert.deepEqual(Object.fromEntries(["FR","DACH","NA","II","AU","GB","AFR"].map(k=>[k,A.attestations.filter(a=>a.attestation_id.startsWith("ATT-"+k+"-")).length])),
 {FR:33,DACH:25,NA:28,II:20,AU:12,GB:6,AFR:11});
for(const x of A.families.filter(x=>x.sot07_custom_id))
 assert.ok(S.rows.some(row=>row.original_custom_id===x.sot07_custom_id),"geographic family references absent SOT07: "+x.family_id);
assert.ok(A.review_rules.some(x=>x.includes("French-world relevance")));
assert.ok(A.blockers.some(x=>x.includes("not")));
assert.ok(!("directory_venues" in A),"research companion crosswalk may not become a parallel TLM Directory");

const nowMapped=[
 "place:MU:pere-laval-sainte-croix","place:DE:kevelaer-kerzenkapelle",
 "place:AT:maria-taferl-basilica","place:CA:martyrs-shrine-midland",
 "place:GB:holywell-st-winefride-church","place:NZ:pukekaraka-otaki",
 "place:US:st-alphonsus-baltimore","place:FR:notre-dame-des-marins-arcachon",
 "place:US:la-salette-attleboro"
];
for(const id of nowMapped){
 const place=G.places.find(x=>x.place_id===id);assert.ok(place,"lost Place "+id);
 assert.ok(isMapPublishablePlaceGeo(place.geo,place.address?.country_code),"site not provenance locked: "+id);
 assert.match(place.geo.source_url,/^https:\/\//);
 assert.match(place.geo.locator_note,/.{15,}/);
 assert.equal(place.geo.verified_at,"2026-10-10");
}
assert.equal(G.places.filter(p=>!Number.isFinite(p.geo?.lat)||!Number.isFinite(p.geo?.lng)).length,0);
assert.deepEqual(R.exception_queues.places_pending_coordinates,[]);
assert.deepEqual(R.exception_queues.coordinates_without_source_url,[]);
const holywellChurch=G.places.find(p=>p.place_id==="place:GB:holywell-st-winefride-church");
const holywellWell=G.places.find(p=>p.place_id==="place:GB:holywell-st-winefride");
assert.notEqual(holywellChurch.geo.lat,holywellWell.geo.lat,"Church was falsely collapsed into Holy Well");
for(const id of ["place:DE:kevelaer-kerzenkapelle","place:GB:holywell-st-winefride-church"])
 assert.ok(R.exception_queues.places_without_direct_claim.includes(id),"contextual site acquired an inferred sacred-record identity");
console.log("PASS SOT-07: 63 original rows, 13 live, seven blocked, 43 separate-owner reviews; SOT-07G: 53 families, 135 attestations, 117 sources; nine provenance-locked Places");
