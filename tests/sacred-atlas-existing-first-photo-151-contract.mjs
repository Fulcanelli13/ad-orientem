import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const masterPath="data/geography/research/sacred-atlas-existing-first-151-photo-reconciliation-20261104.v1.json";
const m=read(masterPath);
const d=Object.fromEntries(Object.entries(m.source_registry_paths).map(([key,path])=>[key,read(path)]));
assert.equal(m.schema,"AO_SACRED_ATLAS_EXISTING_FIRST_151_PHOTO_RECONCILIATION_V1");
assert.equal(m.publication,"RESEARCH_ONLY_NO_APP_MUTATION");
assert.equal(d.geo.places.length,530);
assert.equal(d.approved.items.length,379);
assert.equal(d.gallery.items.length,42);
assert.equal(m.rows.length,151);
assert.equal(m.summary.missing_approved_covers,151);
assert.equal(m.summary.photos_newly_approved,0);
assert.equal(Object.keys(d.decisions.decisions).length,451);
const published=new Set(d.approved.items.map(x=>x.place_id));
const geo=new Map(d.geo.places.map(x=>[x.place_id,x]));
const orig=new Map(d.r25.places.map(x=>[x.place_id,x]));
const hold=new Map(d.selected24.rows.map(x=>[x.place_id,x]));
const pd=new Map(d.pd11.rows.map(x=>[x.place_id,x]));
const pending=new Map(d.undecided.rows.map(x=>[x.place_id,x]));
const names=new Set();
const summary={}; let originals=0, covers=0, context=0;
for(const r of m.rows){
 assert.ok(!names.has(r.place_id),"duplicate Place ID");
 names.add(r.place_id);
 assert.ok(geo.has(r.place_id),"unknown Place ID");
 assert.equal(r.place_name,geo.get(r.place_id).name.official);
 assert.ok(!published.has(r.place_id),"approved Place must not be in gap queue");
 assert.equal(r.source_published,false);
 assert.equal(r.photo_publication_authorized,false);
 summary[r.recovery_state]=(summary[r.recovery_state]||0)+1;
 const editorial=geo.get(r.place_id).photo_editorial;
 assert.equal(r.photo_finder.decision,editorial?.decision||"NO_DECISION");
 assert.equal(r.photo_finder.cover_commons_file,editorial?.cover_commons_file||null);
 if(r.recovery_state==="PRIOR_SELECTED_24_SOURCE_HOLD"){
   assert.equal(editorial.decision,"SELECTED");
   assert.ok(hold.has(r.place_id));
   assert.equal(r.existing_selected_hold.source_title,hold.get(r.place_id).source_title);
   assert.equal(r.known_exact_selected_file,hold.get(r.place_id).source_title);
   assert.equal(r.current_original_photo_research,null);
 } else if(r.recovery_state==="PRIOR_SELECTED_PD_SELF_SOURCE_RECOVERY"){
   assert.equal(editorial.decision,"SELECTED");
   assert.ok(pd.has(r.place_id)&&!hold.has(r.place_id));
   assert.equal(r.existing_pd_self_hold.pinned_sha1,pd.get(r.place_id).original_sha1);
 } else if(r.recovery_state==="PRIOR_EXPLICIT_NONE_SELECTED"){
   assert.equal(editorial.decision,"NONE_SELECTED");
   assert.equal(r.known_exact_selected_file,null);
 } else if(r.recovery_state.startsWith("UNREVIEWED")){
   assert.equal(editorial||null,null);
   assert.ok(pending.has(r.place_id));
   if(r.recovery_state==="UNREVIEWED_NO_BYTE_VERIFIED_ORIGINAL"){
     assert.ok(!orig.has(r.place_id)); assert.equal(r.current_original_photo_research,null);
   } else {
     assert.ok(orig.has(r.place_id));
     const x=orig.get(r.place_id);
     assert.equal(x.images.length,r.current_original_photo_research.images.length);
     for(let i=0;i<x.images.length;i++){
       const photo=x.images[i],copy=r.current_original_photo_research.images[i];
       assert.equal(copy.original_sha1,photo.sha1);
       assert.equal(copy.source_url,photo.url);
       assert.equal(copy.subject_role,photo.role);
       assert.equal(copy.byte_verified,true);
       originals++;
       if(photo.role==="COVER_CANDIDATE")covers++; else context++;
     }
     assert.equal(r.current_original_photo_research.eligible_cover_count,x.images.filter(i=>i.role==="COVER_CANDIDATE").length);
     assert.equal(r.recovery_state==="UNREVIEWED_ORIGINAL_VERIFIED_GALLERY_ONLY",x.images.every(i=>i.role!=="COVER_CANDIDATE"));
   }
 }
}
assert.equal(new Set(m.rows.map(x=>x.place_id)).size,151);
assert.deepEqual([...geo.keys()].filter(x=>!published.has(x)).sort(),[...names].sort(),"coverage over all and only uncovered Places");
const expected={
 PRIOR_SELECTED_24_SOURCE_HOLD:24,
 PRIOR_SELECTED_PD_SELF_SOURCE_RECOVERY:10,
 PRIOR_EXPLICIT_NONE_SELECTED:51,
 UNREVIEWED_NO_BYTE_VERIFIED_ORIGINAL:43,
 UNREVIEWED_ORIGINAL_VERIFIED_COVER_CANDIDATE:21,
 UNREVIEWED_ORIGINAL_VERIFIED_GALLERY_ONLY:2
};
assert.deepEqual(summary,expected);
assert.equal(originals,64);
assert.equal(covers,61);
assert.equal(context,3);
for(const [key,path] of Object.entries(m.source_registry_paths)){
 const bytes=readFileSync(path);
 const fingerprint=createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");
 assert.equal(m.current_source_hashes[key],fingerprint,"original source SHA differs: "+key);
}
console.log("SACRED ATLAS EXISTING PHOTO FIRST PASS: 151 exact canonical gaps, selected 24+10, none 51, undecided 23+43, 64 verified source bytes, no media approval.");
