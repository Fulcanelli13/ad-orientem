import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {eligibleVenueImage,eligibleRenderedDirectoryImage,attachApprovedDirectoryMedia,renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {directoryVenueVisualPolicy} from "../src/find/tlm-venue-visual-policy.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const l=read("data/directory/research/tlm-21-source-verified-photo-release-20261112.v1.json");
const media=read("data/directory/approved-venue-media.v1.json");
const index=read("data/directory/generated/cl2-physical-site-index.v1.json");
const labels=read("data/directory/cl2-source-site-category-matrix-20261111.v1.json");
const witnesses=read("data/directory/cl2-exact-venue-category-witnesses-20261111.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
assert.equal(l.schema,"AO_TLM_21_SOURCE_VERIFIED_DIOCESAN_COVERS_RELEASE_V1");
assert.deepEqual(l.counts,{prior_approved_venue_media:2,new_exact_diocesan_venue_photos:21,approved_after:23,staged_batch:28,held_batch:7,worldwide_site_count_unchanged:2580,new_map_pins:0,new_mass_schedules:0});
assert.equal(media.items.length,23);
assert.equal(l.published.length,21);
assert.equal(l.held.length,7);
assert.equal(index.records.length,2580);
const source=new Map(index.records.map(r=>[r[0],r]));
const classes=new Map(labels.rows.map(r=>[r[0],r]));
const more=new Map(witnesses.records.map(r=>[r.cl2_anchor,r]));
const venueIds=new Set(),assets=new Set(),hashes=new Set();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
for(const p of l.published){
  const img=media.items.find(x=>x.venue_id===p.venue_id);
  assert.ok(img,"Published venue media missing: "+p.venue_id);
  assert.ok(!venueIds.has(p.venue_id)&&!assets.has(img.asset_path),"Duplicate venue or asset");
  venueIds.add(p.venue_id);assets.add(img.asset_path);hashes.add(img.derivative_sha256);
  assert.equal(img.asset_path,p.asset_path);assert.equal(img.derivative_sha256,p.derivative_sha256);
  assert.equal(img.source_sha1,p.source_sha1);
  assert.ok(eligibleVenueImage(img,p.venue_id),"Image fails strict source+rights test");
  assert.ok(img.rights_verified&&img.subject_verified&&img.crop_reviewed);
  const cl=source.get(p.cl2_anchor),w=more.get(p.cl2_anchor);
  assert.ok(cl?.[1]?.includes(p.venue_id),"Missing exact CL2 source");
  assert.equal(w?.visual_lane||classes.get(cl[5])?.[4],"DIOCESAN_PHOTO");
  assert.ok(!geo.directoryPlaceLinks.some(x=>x.venue_id===p.venue_id),"Cannot override exact Place cover");
  assert.ok(img.source_url.startsWith("https://commons.wikimedia.org/wiki/File:"));
  assert.ok(img.license_url.startsWith("https://creativecommons.org/"));
  assert.ok(img.credit&&img.alt_en.length>25&&img.alt_fr.length>25);
  assert.ok(img.changes_en.includes("without cropping")&&img.changes_fr.includes("sans recadrage"));
  const buf=readFileSync(new URL("../"+img.asset_path,import.meta.url));
  assert.equal(buf.toString("ascii",0,4),"RIFF");
  assert.equal(buf.toString("ascii",8,12),"WEBP");
  assert.equal(createHash("sha256").update(buf).digest("hex"),p.derivative_sha256);
  const item={kind:"TLM_VENUE",item_id:"tlm:cl2:"+p.cl2_anchor,source_id:p.venue_id,
   title:"Exact church",subtitle:"Diocesan source",sections:[],community_id:"DIOCESAN",
   site_category:{category:"DIOCESAN_OR_PARISH_CONTEXT",visual_lane:"DIOCESAN_PHOTO",classification_basis:"SOURCE_REPORTED"}};
  assert.equal(directoryVenueVisualPolicy(item).photoAllowed,true);
  const [card,wrong]=attachApprovedDirectoryMedia([item,{...item,source_id:"different-source-"+p.venue_id,item_id:"wrong"}],{venueApproved:media.items});
  assert.equal(card.place_id,undefined,"No invented Sacred Place");
  assert.equal(card.cover_media?.asset_path,img.asset_path,"Exact venue photo did not attach");
  assert.equal(eligibleRenderedDirectoryImage(card.cover_media,card),true);
  assert.equal(wrong.cover_media,undefined,"Similar/wrong source inherited photo");
  for(const lang of ["en","fr"]){
   const markup=renderDirectoryVenueCard(card,lang);
   assert.ok(markup.includes('data-visual-kind="photo"'));
   assert.ok(markup.includes('src="'+img.asset_path+'"'));
   assert.ok(markup.includes('alt="'+esc(lang==="fr"?img.alt_fr:img.alt_en)+'"'));
   const preview=renderExploreToString(buildExploreViewModel({
      language:lang,lens:"tlm",items:[card],view:"map",selectedId:card.item_id,
      filters:{directoryGroup:"ALL"}
   }));
   assert.ok(preview.includes("aoTlmPreviewPhotoCredit"),"Missing discoverable photo credit");
   assert.ok(preview.includes(esc(img.credit)),"Creator attribution not rendered");
   assert.ok(preview.includes(esc(img.license_url)),"Creative Commons licence link absent");
   assert.ok(preview.includes(esc(img.source_url)),"Commons original link absent");
   assert.ok(preview.includes(esc(lang==="fr"?img.changes_fr:img.changes_en)),
      "WebP adaptation must be disclosed to "+lang+" readers");
  }
}
assert.equal(venueIds.size,21);assert.equal(assets.size,21);assert.equal(hashes.size,21);
for(const hold of l.held){
 assert.ok(!media.items.some(m=>m.venue_id===hold.venue_id));
 assert.ok(hold.reason==="CROP_REVIEW"||/CROP|HOLD/.test(hold.reason));
}
assert.ok(!media.items.some(m=>m.venue_id==="AO-AMER-R28-US-21-03"),"Lewiston conflict cannot be automatically published");
console.log("TLM21_VERIFIED_PUBLIC_EXACT_DIOCESAN_COVERS_PASS: 21 unique source/site/hash/rights/EN-FR/visual-lane records; 7 held");
