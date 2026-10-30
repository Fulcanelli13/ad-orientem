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
const sourceBy=new Map(src.sources.map(s=>[s.id,s]));
const rad=Math.PI/180;
const meters=(a,b,c,d)=>{const h=Math.sin((c-a)*rad/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin((d-b)*rad/2)**2;return Math.round(12742000*Math.asin(Math.sqrt(h))*10)/10};
assert.equal(c.schema,"AO_DIRECTORY_PHOTO_P104_THREE_EXACT_PLACE_RECONCILIATION_V1");
assert.equal(c.state,"RESEARCH_PROPOSAL_FOR_SACRED_PLACES_OWNER_NOT_CANONICAL_RELEASE");
assert.deepEqual(c.candidates.map(x=>x.photo_contact_id),[61,71,195]);
assert.deepEqual([geo.places.length,src.sources.length,geo.directoryPlaceLinks.length],[LIVE.places,LIVE.sources,LIVE.links]);
assert.equal(r49.records.length,1879);
assert.equal(c.summary.link_ready_for_owner_review,1);
assert.equal(c.summary.r49_geo_or_venue_holds,2);
const releasedId=61;
const proposedRemaining=[];
for(const x of c.candidates){
 const p=x.proposed_place;
 assert.deepEqual(auditPlace(p),[],"Candidate schemas remain valid");
 assert.equal(x.proposed_sources.length,2);
 for(const s of x.proposed_sources){
  assert.deepEqual(auditShrineSource(s),[]);
  assert.ok(p.source_ids.includes(s.id));
 }
 const visual=p102.entries.find(e=>e.photo_id===x.photo_contact_id);
 assert.equal(visual?.physical_anchor_id,x.physical_anchor_id);
 assert.equal(visual?.independent_sha1,x.photo_original_sha1);
 assert.equal(visual?.editorial_preview_role,"PREFERRED_EXTERIOR_PREVIEW");
 const row=rows.get(x.frozen_venue_id);
 assert.equal(Boolean(row),x.frozen_r49_venue_present);
 assert.equal(x.frozen_r49_to_source_building_distance_m,row?meters(row[cols.lat],row[cols.lng],p.geo.lat,p.geo.lng):null);
 if(x.photo_contact_id===releasedId){
  assert.ok(x.proposed_link&&row);
  assert.deepEqual(auditDirectoryPlaceLink(x.proposed_link),[]);
  assert.equal(x.frozen_r49_to_source_building_distance_m,1.6);
  const published=geo.places.find(g=>g.place_id===p.place_id);
  assert.deepEqual(published,p,"Owner release preserves frozen research physical identity");
  assert.deepEqual(geo.directoryPlaceLinks.find(l=>l.link_id===x.proposed_link.link_id),x.proposed_link);
  for(const s of x.proposed_sources)assert.deepEqual(sourceBy.get(s.id),s);
 }else{
  assert.ok(!geo.places.some(g=>g.place_id===p.place_id),"Unresolved chapel must stay outside canonical release");
  for(const s of x.proposed_sources)assert.ok(!sourceBy.has(s.id),"Unapproved source ID must not be appended to live registry");
  assert.equal(x.proposed_link,null);
  proposedRemaining.push(p);
  if(x.photo_contact_id===71){
   assert.ok(x.frozen_r49_to_source_building_distance_m>1500);
   assert.equal(row[cols.precision],"SOURCE_MARKER_UNASSESSED");
  }else{
   assert.equal(x.photo_contact_id,195);
   assert.equal(row,undefined);
   assert.ok(x.status.includes("TLM_TIMES_UNVERIFIED"));
  }
 }
 // Historical research flags were authored before owner promotion; remain immutable,
 // and must not be mistaken for current live release status.
 assert.equal(x.production_photo_published,false);
 assert.equal(x.source_photo_approved,false);
}
const simulated=assertExploreGeographyRegistry({geoAreas:geo.geoAreas,places:[...geo.places,...proposedRemaining],directoryPlaceLinks:geo.directoryPlaceLinks});
assert.deepEqual([simulated.counts.places,simulated.counts.directoryPlaceLinks],[532,23]);
assert.deepEqual([geo.places.length,geo.directoryPlaceLinks.length],[530,23]);
console.log("PASS historical photo P104: Hannover now canonically linked; Kolbermoor and Blandford remain held; no publication.");
