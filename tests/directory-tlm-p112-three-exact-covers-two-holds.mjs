import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {eligibleVenueImage,eligibleRenderedDirectoryImage,attachApprovedDirectoryMedia,renderDirectoryVenueCard,DIRECTORY_CARD_STYLE} from "../src/find/directory-card.js";
import {directoryVenueVisualPolicy} from "../src/find/tlm-venue-visual-policy.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const p112=read("data/directory/research/tlm-p112-three-photo-cover-release-20261112.v1.json");
const p110=read("data/directory/research/tlm-p110-two-clean-cover-release-20261112.v1.json");
const initial=read("data/directory/research/tlm-21-source-verified-photo-release-20261112.v1.json");
const approved=read("data/directory/approved-venue-media.v1.json");
const sites=read("data/directory/generated/cl2-physical-site-index.v1.json");
const category=read("data/directory/cl2-exact-venue-category-witnesses-20261111.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

assert.equal(p112.schema,"AO_TLM_P112_THREE_EXACT_VENUE_COVERS_TWO_FINAL_HOLDS_V1");
assert.deepEqual(p112.baseline,{approved_direct_venue_covers:25,recovered_batch:28,remaining_held:5});
assert.deepEqual(p112.proposed,{
 new_exact_covers:3,approved_direct_venue_covers_after:28,remaining_held_after:2,
 new_pins:0,coordinate_changes:0,place_records_added:0,affiliation_changes:0,
 mass_schedules_added:0,previously_approved_cover_replacements:0
});
assert.equal(approved.items.length,28);
assert.equal(initial.published.length,21);
assert.equal(p110.approved.length,2);
assert.equal(p112.approved.length,3);
assert.equal(p112.held.length,2);
assert.equal(sites.records.length,2580);
assert.equal(new Set(approved.items.map(m=>m.venue_id)).size,28);
assert.equal(new Set(approved.items.map(m=>m.asset_path)).size,28);
assert.ok(DIRECTORY_CARD_STYLE.includes("object-fit:contain;object-position:center"),"No church may be cropped in card");
const heldSet=new Set(["RG-7C7DC29FFFAB","RG-ABBC659D0388"]);
assert.deepEqual(new Set(p112.held.map(x=>x.cl2_anchor)),heldSet);
const pins=new Map(sites.records.map(x=>[x[0],x]));
const witnesses=new Map(category.records.map(x=>[x.cl2_anchor,x]));
const expected=new Map([
 ["RG-10BAB9521232",{venue_id:"AO-B34-L-GB-D7DA8CC0BE16",credit:"David Anstiss",license:"CC-BY-SA-2.0",original_sha1:"9b6337123bb47270df19201902bfe2542cc129d1",derivative_sha256:"029b340fd84f3687e987c4f94d0b3079215e49f1229336d688eb9745f50c4aaf"}],
 ["RG-15198DD7A6FE",{venue_id:"AO-B35-L-GB-D1A88E153706",credit:"John Salmon",license:"CC-BY-SA-2.0",original_sha1:"40fd68f0718f478a9fd7e057625429bf7d4d487f",derivative_sha256:"fe7faf2d03a15ff228d626d19e059e587f508c2bbd6e73f97513277aebc7a56e"}],
 ["RG-AAFBFCE94AA0",{venue_id:"AO-B35-L-GB-089C7ED97E0F",credit:"Jack1956",license:"CC0-1.0",original_sha1:"4e1800ccc78ee3f31798860ca7a532f5b62e2c3f",derivative_sha256:"b547cb8dfcca3ef9a76f951a377b1b39855aa0fd2ba4d496b0c921f13aab53b3"}]
]);
assert.deepEqual(new Set(p112.approved.map(x=>x.cl2_anchor)),new Set(expected.keys()));
for(const initialRow of initial.published){
 const img=approved.items.find(x=>x.venue_id===initialRow.venue_id);
 assert.ok(img,"Historical 21-cover release was altered or removed");
 for(const f of ["asset_path","source_sha1","derivative_sha256"])
  assert.equal(img[f],initialRow[f]);
}
for(const prior of p110.approved){
 const img=approved.items.find(x=>x.venue_id===prior.venue_id);
 assert.ok(img,"P110 cover missing");
 assert.equal(img.asset_path,prior.asset_path);
 assert.equal(img.source_sha1,prior.original_sha1);
 assert.equal(img.derivative_sha256,prior.derivative_sha256);
}
for(const item of p112.approved){
 const known=expected.get(item.cl2_anchor);
 assert.ok(known,"Unexpected P112 photo "+item.cl2_anchor);
 const img=approved.items.find(x=>x.venue_id===item.venue_id);
 assert.equal(item.venue_id,known.venue_id);
 assert.equal(pins.get(item.cl2_anchor)?.[1]?.[0],known.venue_id,"Wrong exact physical site");
 assert.equal(witnesses.get(item.cl2_anchor)?.visual_lane,"DIOCESAN_PHOTO");
 assert.ok(!geo.directoryPlaceLinks.some(x=>x.venue_id===known.venue_id),"Existing Place cover has precedence");
 assert.ok(img&&eligibleVenueImage(img,item.venue_id),"Rejected by strict approved media gate");
 assert.equal(img.asset_path,item.asset_path);
 assert.equal(img.source_url,item.source_url);
 assert.equal(img.source_sha1,known.original_sha1);
 assert.equal(img.derivative_sha256,known.derivative_sha256);
 assert.equal(img.credit,known.credit);
 assert.equal(img.license,known.license);
 assert.equal(img.license_url,item.license_url);
 assert.ok(img.rights_verified&&img.subject_verified&&img.crop_reviewed);
 assert.ok(img.alt_en.length>65&&img.alt_fr.length>65);
 assert.ok(img.changes_en.includes("without cropping")&&img.changes_fr.includes("sans recadrage"));
 assert.ok(existsSync(new URL("../"+img.asset_path,import.meta.url)));
 const bytes=readFileSync(new URL("../"+img.asset_path,import.meta.url));
 assert.equal(bytes.toString("ascii",0,4),"RIFF");
 assert.equal(bytes.toString("ascii",8,12),"WEBP");
 assert.equal(bytes.readUInt32LE(4)+8,bytes.length);
 assert.equal(createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex"),item.git_blob_sha);
 assert.equal(createHash("sha256").update(bytes).digest("hex"),known.derivative_sha256);
 const cardIn={kind:"TLM_VENUE",item_id:"tlm:cl2:"+item.cl2_anchor,
  source_id:item.venue_id,title:"Exact Catholic Church",subtitle:"Verified diocesan source",
  sections:[],site_category:{category:"DIOCESAN_OR_PARISH_CONTEXT",visual_lane:"DIOCESAN_PHOTO",classification_basis:"CURRENT_FIRST_PARTY_VENUE"}};
 assert.equal(directoryVenueVisualPolicy(cardIn).photoAllowed,true);
 const [card,wrong]=attachApprovedDirectoryMedia([cardIn,{...cardIn,source_id:"unrelated-"+item.venue_id,item_id:"wrong"}],{venueApproved:approved.items});
 assert.equal(card.cover_media?.asset_path,item.asset_path);
 assert.ok(eligibleRenderedDirectoryImage(card.cover_media,card));
 assert.equal(wrong.cover_media,undefined,"Image crossed to a different venue");
 for(const lang of ["en","fr"]){
  const html=renderDirectoryVenueCard(card,lang);
  assert.ok(html.includes('data-visual-kind="photo"'));
  assert.ok(html.includes('src="'+item.asset_path+'"'));
  assert.ok(html.includes('alt="'+esc(lang==="fr"?img.alt_fr:img.alt_en)+'"'));
  const view=renderExploreToString(buildExploreViewModel({
   language:lang,lens:"tlm",items:[card],view:"map",selectedId:card.item_id,filters:{directoryGroup:"ALL"}
  }));
  assert.ok(view.includes("aoTlmPreviewPhotoCredit"));
  for(const value of [img.credit,img.source_url,img.license_url,lang==="fr"?img.changes_fr:img.changes_en])
   assert.ok(view.includes(esc(value)),"Missing "+lang+" source/rights/transformation disclosure");
 }
}
for(const h of p112.held){
 assert.ok(!approved.items.some(x=>x.venue_id===h.venue_id),"Held image prematurely approved");
}
assert.ok(!approved.items.some(x=>x.venue_id==="AO-AMER-R28-US-21-03"),"Lewiston identity conflict remains excluded");
console.log("P112 PASS: 3 exact-site original-hash-verified church covers, 25 prior immutable covers, 2 explicit holds, CC source/EN-FR previews; no new pins");
