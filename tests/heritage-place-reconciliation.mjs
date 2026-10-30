import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

// Independent, source-first crosswalk gate. The review ledger cannot quietly
// become a second registry or silently drop source-owned records when seeds grow.
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const G=read("data/geography/seed-registry.v1.json");
const S=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const P=read("data/explore/sacred-phenomena-seed.v1.json");
const C=read("data/customs/customs-atlas-seed.v1.json");
const N=read("data/customs/novena-context-links.v1.json");
const R=read("data/explore/heritage-place-reconciliation.review.v1.json");

assert.equal(R.schema,"AO_EXPLORE_PLACE_RECONCILIATION_REVIEW_V1");
assert.match(R.status,/REVIEW_ONLY/);
assert.match(R.purpose,/never grants relic authenticity/);
assert.equal(R.place_crosswalk.length,G.places.length,"source geography Place records were dropped");
assert.equal(new Set(R.place_crosswalk.map(p=>p.place_id)).size,G.places.length,
  "the review duplicates canonical Place IDs");
const placeById=new Map(G.places.map(p=>[p.place_id,p]));
const shrineById=new Map(S.shrines.map(s=>[s.shrine_id,s]));
const expected=new Map(G.places.map(p=>[p.place_id,new Map()]));
const dangling=[];
function attach(pid,type,id){
 if(!pid)return;
 if(!expected.has(pid)){dangling.push([type,id,pid]);return;}
 const record=expected.get(pid);
 if(!record.has(type))record.set(type,new Set());
 record.get(type).add(id);
}
for(const x of S.shrines)attach(x.place_id,"shrines",x.shrine_id);
for(const x of S.pilgrimages){
 assert.ok(shrineById.has(x.destination_shrine_id),
   "pilgrimage lacks exact destination Shrine: "+x.pilgrimage_id);
 attach(shrineById.get(x.destination_shrine_id).place_id,"pilgrimages",x.pilgrimage_id);
}
for(const x of S.routes){
 attach(x.destination_place_id,"routes",x.route_id);
 for(const waypoint of x.waypoint_place_ids??[])attach(waypoint,"route_waypoints",x.route_id);
}
for(const x of P.relics)attach(x.place_id,"relics",x.id);
for(const x of P.apparitions)attach(x.place_id,"apparitions",x.id);
for(const x of C.attestations)attach(x.place_id,"customs",x.attestation_id);
for(const x of N.links)attach(x.place_id,"novena_context",x.link_id);
for(const x of G.directoryPlaceLinks)attach(x.place_id,"directory_links",x.link_id);
assert.deepEqual(dangling,[],"source-owned records reference missing Places");

const heritageKinds=["shrines","pilgrimages","relics","apparitions","customs"];
let linked=0,multicategory=0;
for(const entry of R.place_crosswalk){
 const place=placeById.get(entry.place_id);
 assert.ok(place,"stale Place in editorial crosswalk: "+entry.place_id);
 assert.equal(entry.display_name,place.name?.official??"");
 const actual=expected.get(entry.place_id);
 const actualIds=Object.fromEntries([...actual].map(([key,ids])=>[key,[...ids].sort()]));
 assert.deepEqual(entry.record_ids,actualIds,"record crosswalk changed for "+entry.place_id);
 const hasCoordinates=Number.isFinite(place.geo?.lat)&&Number.isFinite(place.geo?.lng);
 const status=!hasCoordinates?"PENDING_COORDINATES":place.geo?.source_url?
   "GEO_SOURCE_URL_PRESENT":"COORDINATES_MISSING_SOURCE_URL";
 assert.equal(entry.geo_source_status,status,"geo source review drifted for "+entry.place_id);
 if(actual.size)linked++;
 if(heritageKinds.filter(kind=>actual.has(kind)).length>=2)multicategory++;
}
assert.equal(R.counts.places,G.places.length);
assert.equal(R.counts.places_with_linked_records,linked);
for(const kind of ["shrines","pilgrimages","relics","apparitions","customs","novena_context","routes","directory_links"]){
 const distinct=R.place_crosswalk.filter(p=>p.record_ids[kind]?.length).length;
 assert.equal(R.distinct_place_links[kind],distinct,"unique Place count drifted for "+kind);
}
// The 10 October editorial snapshot is immutable. Reconcile twenty later,
// explicitly source-locked non-pin additions; do not rewrite the snapshot as if
// it had been researched on that original date.
const admittedAfterSnapshot=[
  ["DOM-003","att:DOM-003:FR","AREA_CONTEXT"],
  ["DOM-011","att:DOM-011:FR","AREA_CONTEXT"],
  ["DOM-013","att:DOM-013:FR","AREA_CONTEXT"],
  ["BLSS-001","att:BLSS-001:ROMAN","NOT_MAPPED"],
  ["BLSS-002","att:BLSS-002:ROMAN","NOT_MAPPED"],
  ["BLSS-003","att:BLSS-003:ROMAN","NOT_MAPPED"],
  ["BLSS-004","att:BLSS-004:ROMAN","NOT_MAPPED"],
  ["ADVT-001","att:ADVT-001:US","NOT_MAPPED"],
  ["ADVT-002","att:ADVT-002:US","NOT_MAPPED"],
  ["ADVT-003","att:ADVT-003:MX","NOT_MAPPED"],
  ["XMAS-001","att:XMAS-001:US","NOT_MAPPED"],
  ["HTHU-001","att:HTHU-001:US","NOT_MAPPED"],
  ["ROGA-001","att:ROGA-001:US","NOT_MAPPED"],
  ["NDAY-001","att:NDAY-001:US","NOT_MAPPED"],
  ["PATR-001","att:PATR-001:FR","NOT_MAPPED"],
  ["MARI-001","att:MARI-001:FR","NOT_MAPPED"],
  ["SJOS-001","att:SJOS-001:US","NOT_MAPPED"],
  ["SANT-001","att:SANT-001:FR","NOT_MAPPED"],
  ["SCHR-001","att:SCHR-001:FR","NOT_MAPPED"],
  ["SNIC-001","att:SNIC-001:FR","NOT_MAPPED"],
  ["EPIP-001","att:EPIP-001:DE","NOT_MAPPED"],
  ["EPIP-002","att:EPIP-002:FR","NOT_MAPPED"],
  ["CORP-001","att:CORP-001:PL","NOT_MAPPED"],
  ["EAST-001","att:EAST-001:DE","NOT_MAPPED"],
  ["MARI-002","att:MARI-002:US","NOT_MAPPED"],
  // One separately sourced Polish regional article added after the fixed editorial snapshot.
  ["PENT-001","att:PENT-001:PL-HISTORICAL","NOT_MAPPED"],
];
for(const [customId,attestationId,policy] of admittedAfterSnapshot){
  const custom=C.customs.find(x=>x.custom_id===customId);
  const att=C.attestations.find(x=>x.attestation_id===attestationId);
  assert.ok(custom&&att,customId+" later admission missing");
  assert.equal(att.custom_id,customId);
  assert.equal(att.map_policy,policy);
  assert.equal(att.place_id,null);
}
assert.equal(R.counts.canonical_customs+admittedAfterSnapshot.length,C.customs.length,
  "canonical customs beyond the reviewed post-snapshot additions require reconciliation");
const postSnapshotAttestationEnrichments=["att:DEAD-003:POLAND-WYPOMINKI-2025"];
for(const id of postSnapshotAttestationEnrichments)assert.ok(C.attestations.some(a=>a.attestation_id===id),id+" must remain attached to DEAD-003");
assert.equal(R.counts.custom_attestations+admittedAfterSnapshot.length+postSnapshotAttestationEnrichments.length,C.attestations.length,
  "custom attestations beyond reviewed post-snapshot additions require reconciliation");
assert.match(R.map_policy_note,/not counts of publishable map pins/);
assert.equal(R.counts.multicategory_heritage_places,multicategory);
for(const [count,value] of Object.entries({
 shrines:S.shrines.length,pilgrimages:S.pilgrimages.length,
 relic_claims:P.relics.length,apparition_accounts:P.apparitions.length,
 canonical_customs:C.customs.length,custom_attestations:C.attestations.length,
 novena_context_links:N.links.length,route_records:S.routes.length,
 directory_place_links:G.directoryPlaceLinks.length,
})){
 if(count==="canonical_customs"||count==="custom_attestations")continue; // earlier dated baseline accounted for above
 assert.equal(R.counts[count],value,"audit baseline "+count+" drifted");
}
const noRefs=R.place_crosswalk.filter(p=>!Object.keys(p.record_ids).length).map(p=>p.place_id);
assert.deepEqual(R.exception_queues.places_without_direct_claim,noRefs);
assert.equal(R.counts.places_without_direct_claim,noRefs.length);
assert.deepEqual(R.exception_queues.dangling_place_references,[]);
assert.deepEqual(R.exception_queues.dangling_pilgrimage_shrine_references,[]);
assert.deepEqual(R.exception_queues.places_pending_coordinates,
 R.place_crosswalk.filter(p=>p.geo_source_status==="PENDING_COORDINATES").map(p=>p.place_id));
assert.deepEqual(R.exception_queues.coordinates_without_source_url,
 R.place_crosswalk.filter(p=>p.geo_source_status==="COORDINATES_MISSING_SOURCE_URL").map(p=>p.place_id));
const laterAttestationIds=new Set([...admittedAfterSnapshot.map(x=>x[1]),...postSnapshotAttestationEnrichments]);
assert.deepEqual(R.exception_queues.customs_without_exact_place,
 C.attestations.filter(p=>!p.place_id&&!laterAttestationIds.has(p.attestation_id)).map(p=>({
   id:p.attestation_id,map_policy:p.map_policy,geo_area_id:p.geo_area_id??null
 })));
assert.deepEqual(R.exception_queues.novena_context_without_exact_place,
 N.links.filter(p=>!p.place_id).map(p=>({
   id:p.link_id,map_policy:p.map_policy,geo_area_id:p.geo_area_id??null
 })));
assert.ok(R.exception_queues.customs_without_exact_place.every(x=>x.map_policy!=="PLACE"),
 "a site-specific custom lost its site and must not be transformed into a pin");
assert.ok(R.exception_queues.novena_context_without_exact_place.every(x=>x.map_policy!=="PLACE"),
 "a site-specific novena lost its site and must not be transformed into a pin");
console.log("PASS heritage crosswalk: "+G.places.length+" Places; "+linked+
 " associated; "+multicategory+" multitype; "+noRefs.length+" contextual-only; "+
 R.exception_queues.places_pending_coordinates.length+" unmapped Places; no dangling IDs");
