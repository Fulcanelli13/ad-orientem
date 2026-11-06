import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const staged=read("data/geography/research/sacred-atlas-96-priority-unapproved-preimport-20261106.v1.json");
const geography=read("data/geography/seed-registry.v1.json");
const sources=read("data/shrines/source-registry.v1.json");
assert.equal(staged.schema,"AO_SACRED_ATLAS_PREIMPORT_96_RESEARCH_V1");
assert.equal(staged.candidates.length,96);
assert.equal(staged.counts.approved,0);
assert.equal(staged.counts.owner_approved,0);
assert.equal(staged.counts.publishable,0);
assert.equal(staged.counts.proposed_unreserved_canonical_ids,94);
assert.equal(staged.counts.draft_admission_prepared,2);
assert.deepEqual(staged.counts.review_lanes,{priority_identity_and_pin_review:67,secondary_or_approximate_review:26,shared_directory_source_exceptions:3});
assert.deepEqual(staged.counts.preview_precision,{site:45,complex_anchor:36,locality:15});
assert.deepEqual(staged.counts.historical_source_tiers,{A:78,B:18});
assert.equal(staged.review_policy.no_runtime_import,true);
assert.equal(staged.review_policy.may_use_illustrative_locality_if_accepted,true);
const sourceByUrl=new Map();
for(const s of sources.sources){if(s.url)sourceByUrl.set(s.url,[...(sourceByUrl.get(s.url)||[]),s.id]);}
const byUrl=new Map();
for(const c of staged.candidates)byUrl.set(c.identity_source_url,(byUrl.get(c.identity_source_url)||0)+1);
const canonical=new Set(geography.places.map(p=>p.place_id));
const proposals=new Set();
const laneCounts={PRIORITY_IDENTITY_AND_PIN_REVIEW:0,SECONDARY_OR_APPROXIMATE_REVIEW:0,SHARED_DIRECTORY_SOURCE_EXCEPTION:0};
const precisionCounts={site:0,complex_anchor:0,locality:0};
const sourceTiers={A:0,B:0};
const radians=x=>x*Math.PI/180;
function distanceM(a,b){
 const lat=radians(b[0]-a[0]),lon=radians(b[1]-a[1]);
 const h=Math.sin(lat/2)**2+Math.cos(radians(a[0]))*Math.cos(radians(b[0]))*Math.sin(lon/2)**2;
 return 12742000*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
}
for(const c of staged.candidates){
 assert.match(c.proposed_place_id_not_reserved,new RegExp("^place:"+c.country_code+":[a-z0-9]+(?:-[a-z0-9]+)*$"));
 assert.equal(canonical.has(c.proposed_place_id_not_reserved),["SG-INV-0415","SG-INV-0722"].includes(c.candidate_id),"Only the two proposed draft Place IDs may appear: "+c.candidate_id);
 assert.ok(!proposals.has(c.proposed_place_id_not_reserved),"Duplicate proposal "+c.candidate_id);
 proposals.add(c.proposed_place_id_not_reserved);
 assert.equal(c.canonical_place_id,null,c.candidate_id);
 assert.equal(c.status,"RESEARCH_ONLY_UNAPPROVED",c.candidate_id);
 assert.equal(c.owner_approved,false,c.candidate_id);
 assert.equal(c.publishable,false,c.candidate_id);
 assert.equal(c.source_ref,null,c.candidate_id);
 assert.equal(c.verified_at,null,c.candidate_id);
 assert.equal(c.location_preview.coordinate_independently_verified,["SG-INV-0415","SG-INV-0722"].includes(c.candidate_id),c.candidate_id);
 assert.ok(c.country_area_present_in_draft,c.candidate_id);
 assert.match(c.identity_source_url,/^https:\/\//,c.candidate_id);
 assert.match(c.location_preview.source_url,/^https:\/\//,c.candidate_id);
 const r=c.admission_review;
 assert.equal(r.owner_decision,"PENDING",c.candidate_id);
 assert.equal(r.canonical_import_ready,false,c.candidate_id);
 assert.equal(r.coordinate_is_illustrative_preview,true,c.candidate_id);
 assert.equal(r.exact_building_or_entrance_claim,false,c.candidate_id);
 assert.equal(r.source_url_confirmed_live_in_this_pass,false,c.candidate_id);
 assert.equal(r.map_precision_to_retain_if_accepted,c.location_preview.precision_suggestion,c.candidate_id);
 assert.deepEqual(r.source_registry_url_collision_ids,sourceByUrl.get(c.identity_source_url)||[],c.candidate_id);
 const shared=(byUrl.get(c.identity_source_url)>1||sourceByUrl.has(c.identity_source_url));
 const tier=c.archived_source_tier_unreverified.startsWith("A_")?"A":"B";
 const lane=shared?"SHARED_DIRECTORY_SOURCE_EXCEPTION":tier==="A"&&r.map_precision_to_retain_if_accepted!=="locality"?"PRIORITY_IDENTITY_AND_PIN_REVIEW":"SECONDARY_OR_APPROXIMATE_REVIEW";
 assert.equal(r.lane,lane,c.candidate_id);
 assert.equal(r.identity_url_scope_exception,shared,c.candidate_id);
 assert.equal(r.site_specific_source_corroboration_needed,shared,c.candidate_id);
 laneCounts[lane]++;sourceTiers[tier]++;precisionCounts[r.map_precision_to_retain_if_accepted]++;
 for(const p of geography.places){
  if(p.address?.country_code!==c.country_code||p.geo?.lat==null||p.geo?.lng==null)continue;
  assert.ok(distanceM([c.location_preview.latitude,c.location_preview.longitude],[p.geo.lat,p.geo.lng])>=500,"Possible near-existing site: "+c.candidate_id+" / "+p.place_id);
 }
}
for(let i=0;i<staged.candidates.length;i++)for(let j=i+1;j<staged.candidates.length;j++){
 const a=staged.candidates[i],b=staged.candidates[j];
 if(a.country_code!==b.country_code)continue;
 assert.ok(distanceM([a.location_preview.latitude,a.location_preview.longitude],[b.location_preview.latitude,b.location_preview.longitude])>=500,"Possible near-candidate site: "+a.candidate_id+" / "+b.candidate_id);
}
assert.deepEqual(laneCounts,{PRIORITY_IDENTITY_AND_PIN_REVIEW:67,SECONDARY_OR_APPROXIMATE_REVIEW:26,SHARED_DIRECTORY_SOURCE_EXCEPTION:3});
assert.deepEqual(precisionCounts,{site:45,complex_anchor:36,locality:15});
assert.deepEqual(sourceTiers,{A:78,B:18});
console.log("PASS: 96 distinct unreserved IDs, no proximity overlaps; 67 priority, 26 standard, 3 URL-source exceptions; 0 published");
