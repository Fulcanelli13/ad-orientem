import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
import {eligibleVenueImage,eligibleRenderedDirectoryImage,attachApprovedDirectoryMedia,renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {directoryVenueVisualPolicy} from "../src/find/tlm-venue-visual-policy.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const read=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const ledger=read("data/directory/research/tlm-p109-two-usable-covers-five-holds-20261112.v1.json");
const release21=read("data/directory/research/tlm-21-source-verified-photo-release-20261112.v1.json");
const media=read("data/directory/approved-venue-media.v1.json");
const idx=read("data/directory/generated/cl2-physical-site-index.v1.json");
const geography=read("data/geography/seed-registry.v1.json");
const stage=read("data/directory/research/tlm-28-release-candidates-20261112.v1.json");
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
assert.equal(ledger.schema,"AO_TLM_23_PUBLISHED_EXACT_VENUE_COVERS_AFTER_P109_V1");
assert.deepEqual(ledger.baseline,{new_venue_photos:21,approved_total:23,recovered_batch:28,held:7});
assert.deepEqual(ledger.increment,{new_approved_count:2,approved_total_after:25,held_after:5});
assert.equal(media.items.length,25,"P109 must add exactly two and preserve all 23 prior approved photos");
assert.equal(release21.published.length,21);
assert.equal(ledger.promoted.length,2);
assert.equal(ledger.held.length,5);
assert.equal(new Set(media.items.map(x=>x.venue_id)).size,media.items.length);
assert.equal(new Set(media.items.map(x=>x.asset_path)).size,media.items.length);
assert.ok(!ledger.promoted.concat(ledger.held).some(x=>x.cl2_anchor==="RG-A1C02A9EC71D"),"Lewiston must remain excluded");
const byAnchor=new Map(idx.records.map(x=>[x[0],x]));
const expectedAnchors=new Set(["RG-ABBC659D0388","RG-AAFBFCE94AA0"]);
const expectedVenueIds=new Set(["AO-B34-L-GB-FDC98808D553","AO-B35-L-GB-089C7ED97E0F"]);
assert.deepEqual(new Set(ledger.promoted.map(x=>x.cl2_anchor)),expectedAnchors);
assert.deepEqual(new Set(ledger.promoted.map(x=>x.venue_id)),expectedVenueIds);
const stageIds=new Set(stage.entries.map(x=>x.venue_id));
for(const p of release21.published){
 const img=media.items.find(x=>x.venue_id===p.venue_id);
 assert.ok(img,"Existing published photo lost: "+p.venue_id);
 assert.equal(img.asset_path,p.asset_path);
 assert.equal(img.derivative_sha256,p.derivative_sha256);
}
for(const p of ledger.promoted){
 assert.ok(stageIds.has(p.venue_id),"Source candidate not in original 28");
 const photo=media.items.find(x=>x.venue_id===p.venue_id);
 assert.ok(photo,"Approved media missing: "+p.venue_id);
 assert.equal(byAnchor.get(p.cl2_anchor)?.[1]?.[0],p.venue_id,"The exact CL2 primary venue ID is required");
 assert.equal(photo.asset_path,p.asset_path);
 assert.equal(photo.derivative_sha256,p.derivative_sha256);
 assert.equal(photo.source_sha1,p.original_sha1);
 assert.equal(photo.source_url,p.source_url);
 assert.equal(photo.credit,p.source_author);
 assert.equal(photo.license,p.license);
 assert.equal(photo.license_url,p.license_url);
 assert.deepEqual([photo.width,photo.height],[p.width,p.height]);
 assert.ok(photo.rights_verified&&photo.subject_verified&&photo.crop_reviewed);
 assert.ok(photo.alt_en.length>25&&photo.alt_fr.length>25);
 assert.ok(photo.changes_en.includes("without cropping")&&photo.changes_fr.includes("sans recadrage"));
 assert.ok(!geography.directoryPlaceLinks.some(x=>x.venue_id===p.venue_id),"Existing Place cover must not be overwritten");
 const bytes=fs.readFileSync(new URL("../"+p.asset_path,import.meta.url));
 assert.equal(bytes.toString("ascii",0,4),"RIFF");
 assert.equal(bytes.toString("ascii",8,12),"WEBP");
 assert.equal(createHash("sha256").update(bytes).digest("hex"),p.derivative_sha256);
 assert.ok(eligibleVenueImage(photo,p.venue_id),"Exact source/rights approval contract failed");
 const item={kind:"TLM_VENUE",item_id:"tlm:cl2:"+p.cl2_anchor,source_id:p.venue_id,
    title:"Exact Catholic church",subtitle:"Source-verified",sections:[],
    site_category:{category:"DIOCESAN_OR_PARISH_CONTEXT",visual_lane:"DIOCESAN_PHOTO",classification_basis:"CURRENT_FIRST_PARTY_VENUE"}};
 assert.equal(directoryVenueVisualPolicy(item).photoAllowed,true);
 const [card,wrong]=attachApprovedDirectoryMedia([item,{...item,item_id:"wrong",source_id:"wrong-"+p.venue_id}],{venueApproved:media.items});
 assert.equal(card.cover_media?.asset_path,p.asset_path);
 assert.ok(eligibleRenderedDirectoryImage(card.cover_media,card));
 assert.equal(wrong.cover_media,undefined,"Wrong source inherited a photograph");
 for(const lang of ["en","fr"]){
  const html=renderDirectoryVenueCard(card,lang);
  assert.ok(html.includes('data-visual-kind="photo"'));
  assert.ok(html.includes('src="'+p.asset_path+'"'));
  assert.ok(html.includes('alt="'+esc(lang==="fr"?photo.alt_fr:photo.alt_en)+'"'));
  const view=renderExploreToString(buildExploreViewModel({
   language:lang,lens:"tlm",items:[card],view:"map",selectedId:card.item_id,filters:{directoryGroup:"ALL"}
  }));
  assert.ok(view.includes("aoTlmPreviewPhotoCredit"));
  assert.ok(view.includes(esc(photo.credit)));
  assert.ok(view.includes(esc(photo.license_url)));
  assert.ok(view.includes(esc(photo.source_url)));
  assert.ok(view.includes(esc(lang==="fr"?photo.changes_fr:photo.changes_en)));
 }
}
const heldSet=new Set(ledger.held.map(x=>x.venue_id));
assert.equal(heldSet.size,5);
assert.ok(heldSet.has("AO-AMER-R28-US-31-17"),"Old Town Chapel must remain identity-held");
for(const h of ledger.held){
 assert.ok(!media.items.some(x=>x.venue_id===h.venue_id),"Held church must not acquire approved photo");
 assert.ok(h.editorial_note);
}
assert.equal(idx.records.length,2580,"No new pins or Places");
console.log("P109 PASS: two exact-venue covers, existing 21 photos immutable, five holds including Park City, no new pins, bilingual source+licence+WebP SHA");
