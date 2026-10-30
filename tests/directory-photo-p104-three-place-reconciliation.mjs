import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditPlace,auditDirectoryPlaceLink,assertExploreGeographyRegistry} from "../src/find/geography-contracts.js";
import {auditShrineSource} from "../src/find/shrines-contracts.js";
import {LIVE} from "./helpers/sacred-places-live-baseline.mjs";
const read=x=>JSON.parse(readFileSync(new URL("../"+x,import.meta.url),"utf8"));
const c=read("docs/research/directory/p104-photo-site-join-reconciliation-20261030/p104-three-place-evidence.json");
const geo=read("data/geography/seed-registry.v1.json");
const src=read("data/shrines/source-registry.v1.json");
const p102=read("docs/research/directory/p102-source-preview-editorial-20261030/p102-actual-preview-editorial.json");
const r49=read("data/directory/preliminary-map-r49.v1.json");
const cols=Object.fromEntries(r49.columns.map((k,i)=>[k,i]));
const rows=new Map(r49.records.map(x=>[x[cols.id],x]));
const rad=Math.PI/180;
const meters=(a,b,c,d)=>{const h=Math.sin((c-a)*rad/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin((d-b)*rad/2)**2;return Math.round(12742000*Math.asin(Math.sqrt(h))*10)/10};
assert.equal(c.schema,"AO_DIRECTORY_PHOTO_P104_THREE_EXACT_PLACE_RECONCILIATION_V1");
assert.equal(c.state,"RESEARCH_PROPOSAL_FOR_SACRED_PLACES_OWNER_NOT_CANONICAL_RELEASE");
assert.equal(c.candidates.length,3);
assert.deepEqual(c.candidates.map(x=>x.photo_contact_id),[61,71,195]);
assert.deepEqual([geo.places.length,src.sources.length,geo.directoryPlaceLinks.length,r49.records.length],[529,844,22,1879]);
assert.deepEqual([LIVE.places,LIVE.sources,LIVE.links],[529,844,22]);
assert.equal(c.summary.link_ready_for_owner_review,1);
assert.equal(c.summary.r49_geo_or_venue_holds,2);
const existingIds=new Set(geo.places.map(x=>x.place_id));
const existingSources=new Set(src.sources.map(x=>x.id));
const proposed=new Set();
const proposedLink=[];
for(const x of c.candidates){
 const p=x.proposed_place;
 assert.equal(auditPlace(p).length,0,"Candidate must be structurally valid");
 assert.equal(x.proposed_sources.length,2);
 assert.ok(!existingIds.has(p.place_id),"A candidate already exists; reconcile rather than duplicate");
 assert.ok(!proposed.has(p.place_id),"Candidate duplicates another proposed place");
 proposed.add(p.place_id);
 assert.ok(geo.geoAreas.some(a=>a.geo_area_id===p.geo_area_ids[0]));
 for(const s of x.proposed_sources){
  assert.ok(!existingSources.has(s.id),"Source ID already exists");
  assert.equal(auditShrineSource(s).length,0);
  assert.ok(p.source_ids.includes(s.id));
 }
 assert.ok(p.geo.source_url.startsWith("https://")&&p.geo.precision==="site");
 const source=p102.entries.find(e=>e.photo_id===x.photo_contact_id);
 assert.equal(source?.physical_anchor_id,x.physical_anchor_id);
 assert.equal(source?.independent_sha1,x.photo_original_sha1);
 assert.equal(source?.editorial_preview_role,"PREFERRED_EXTERIOR_PREVIEW");
 assert.equal(x.production_place_created,false);
 assert.equal(x.production_link_created,false);
 assert.equal(x.source_photo_approved,false);
 assert.equal(x.production_schedule_added,false);
 assert.equal(x.production_photo_published,false);
 const row=rows.get(x.frozen_venue_id);
 assert.equal(Boolean(row),x.frozen_r49_venue_present);
 assert.equal(x.frozen_r49_to_source_building_distance_m,row?meters(row[cols.lat],row[cols.lng],p.geo.lat,p.geo.lng):null);
 if(x.proposed_link){
  assert.equal(auditDirectoryPlaceLink(x.proposed_link).length,0);
  assert.equal(x.proposed_link.venue_id,x.frozen_venue_id);
  assert.equal(x.proposed_link.place_id,p.place_id);
  assert.equal(x.proposed_link.relationship,"LOCATED_AT");
  assert.equal(x.proposed_link.confidence,"CONFIRMED");
  assert.ok(row&&x.frozen_r49_to_source_building_distance_m<=150);
  assert.ok(!geo.directoryPlaceLinks.some(l=>l.venue_id===row[cols.id]||l.place_id===p.place_id));
  proposedLink.push(x.proposed_link);
 }else{
  assert.ok(x.photo_contact_id===71||x.photo_contact_id===195);
  if(x.photo_contact_id===71){
   assert.ok(x.frozen_r49_to_source_building_distance_m>1500);
   assert.equal(row[cols.precision],"SOURCE_MARKER_UNASSESSED");
  }
  if(x.photo_contact_id===195){
   assert.equal(row,undefined);
   assert.equal(x.frozen_r49_to_source_building_distance_m,null);
   assert.ok(x.status.includes("TLM_TIMES_UNVERIFIED"));
  }
 }
}
assert.deepEqual(proposedLink.map(x=>x.venue_id),["ao-fssp-basilika-st-clemens-platz-an-der-basilika-1-d-30169-hannover-deutschland"]);
const proposedPlaces=c.candidates.map(x=>x.proposed_place);
const simulated=assertExploreGeographyRegistry({geoAreas:geo.geoAreas,places:[...geo.places,...proposedPlaces],directoryPlaceLinks:[...geo.directoryPlaceLinks,...proposedLink]});
assert.deepEqual([simulated.counts.places,simulated.counts.directoryPlaceLinks],[532,23],"Simulated only; do NOT change production registries in photo PR");
assert.deepEqual([geo.places.length,geo.directoryPlaceLinks.length],[529,22],"Live production baseline unchanged");
console.log("PASS Photo P104: three georeferenced proposal Places, one <=150m exact Directory link, two transparent location holds, no production mutations.");
