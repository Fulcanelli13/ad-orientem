import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {eligibleVenueImage,eligibleRenderedDirectoryImage,attachApprovedDirectoryMedia,renderDirectoryVenueCard,DIRECTORY_CARD_STYLE} from "../src/find/directory-card.js";
import {directoryVenueVisualPolicy} from "../src/find/tlm-venue-visual-policy.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const ledger=read("data/directory/research/tlm-p110-two-clean-cover-release-20261112.v1.json");
const media=read("data/directory/approved-venue-media.v1.json");
const p112=read("data/directory/research/tlm-p112-three-photo-cover-release-20261112.v1.json");
const older=read("data/directory/research/tlm-21-source-verified-photo-release-20261112.v1.json");
const held=read("data/directory/research/tlm-7-held-photo-resolution-20261112.v1.json");
const physical=read("data/directory/generated/cl2-physical-site-index.v1.json");
const matrix=read("data/directory/cl2-source-site-category-matrix-20261111.v1.json");
const witnesses=read("data/directory/cl2-exact-venue-category-witnesses-20261111.v1.json");
const geography=read("data/geography/seed-registry.v1.json");
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

assert.equal(ledger.schema,"AO_TLM_P110_TWO_SOURCE_VERIFIED_CLEAN_DIOCESAN_COVERS_RELEASE_V1");
assert.deepEqual(ledger.proposed,{
 new_clean_alternate_covers:2,direct_venue_covers_after:25,remaining_held:5,
 new_map_pins:0,new_site_records:0,new_mass_schedules:0,prior_approved_covers_replaced:0
});
assert.equal(media.schema,"AO_APPROVED_TLM_VENUE_MEDIA_V1");
assert.equal(media.items.length,ledger.proposed.direct_venue_covers_after+p112.proposed.new_exact_covers);
assert.equal(p112.proposed.new_exact_covers,3);
assert.equal(older.published.length,21);
assert.equal(held.records.length,7);
assert.equal(ledger.approved.length,2);
assert.equal(ledger.held.length,5);
assert.deepEqual(new Set(ledger.approved.map(x=>x.cl2_anchor)),new Set(["RG-0B11C840F55E","RG-18825D70FD67"]));
assert.deepEqual(new Set(ledger.held.map(x=>x.cl2_anchor)),
 new Set(["RG-7C7DC29FFFAB","RG-10BAB9521232","RG-ABBC659D0388","RG-15198DD7A6FE","RG-AAFBFCE94AA0"]));
assert.equal(new Set(media.items.map(x=>x.venue_id)).size,25);
assert.equal(new Set(media.items.map(x=>x.asset_path)).size,25);
assert.equal(physical.records.length,2580);
assert.ok(DIRECTORY_CARD_STYLE.includes("object-fit:contain;object-position:center"),"Cover must not crop church architecture");
const source=new Map(physical.records.map(r=>[r[0],r]));
const classes=new Map(matrix.rows.map(r=>[r[0],r]));
const direct=new Map(witnesses.records.map(r=>[r.cl2_anchor,r]));
const previous=new Set(older.published.map(p=>p.venue_id));
assert.ok(media.items.some(m=>m.venue_id==="SSPXMAP:OPE-002280"));
assert.ok(media.items.some(m=>m.venue_id==="AO-B35-L-GB-E4B83FC0EAF5"));
for(const p of older.published){
 const img=media.items.find(x=>x.venue_id===p.venue_id);
 assert.ok(img,"Previously approved image disappeared");
 assert.equal(img.asset_path,p.asset_path);
 assert.equal(img.source_sha1,p.source_sha1);
 assert.equal(img.derivative_sha256,p.derivative_sha256);
 assert.equal(eligibleVenueImage(img,p.venue_id),true);
}
for(const p of ledger.approved){
 const img=media.items.find(x=>x.venue_id===p.venue_id);
 assert.ok(img,"P110 approved media record missing");
 assert.ok(!previous.has(p.venue_id),"P110 overwrote an original published photograph");
 assert.equal(source.get(p.cl2_anchor)?.[1]?.[0],p.venue_id,"Wrong canonical CL2 venue joined");
 assert.equal(direct.get(p.cl2_anchor)?.visual_lane||classes.get(source.get(p.cl2_anchor)?.[5])?.[4],
  "DIOCESAN_PHOTO","Photo allowed only in exact diocesan lane");
 assert.ok(!geography.directoryPlaceLinks.some(x=>x.venue_id===p.venue_id),"Existing Place cover has priority");
 assert.equal(img.status,"APPROVED");
 assert.equal(img.asset_path,p.asset_path);
 assert.equal(img.source_url,p.source_url);
 assert.equal(img.source_sha1,p.original_sha1);
 assert.equal(img.derivative_sha256,p.derivative_sha256);
 assert.equal(img.credit,p.credit);
 assert.equal(img.license,p.license);
 assert.equal(img.license_url,p.license_url);
 assert.deepEqual([img.width,img.height],[p.width,p.height]);
 assert.ok(img.rights_verified&&img.subject_verified&&img.crop_reviewed);
 assert.ok(img.alt_en.length>70&&img.alt_fr.length>70);
 assert.ok(img.changes_en.includes("without cropping")&&img.changes_fr.includes("sans recadrage"));
 assert.equal(eligibleVenueImage(img,p.venue_id),true);
 const bytes=readFileSync(new URL("../"+img.asset_path,import.meta.url));
 assert.equal(bytes.toString("ascii",0,4),"RIFF");
 assert.equal(bytes.toString("ascii",8,12),"WEBP");
 assert.equal(bytes.readUInt32LE(4)+8,bytes.length);
 assert.equal(createHash("sha256").update(bytes).digest("hex"),p.derivative_sha256);
 assert.equal(createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex"),p.git_blob_sha);
 const item={
  kind:"TLM_VENUE",item_id:"tlm:cl2:"+p.cl2_anchor,source_id:p.venue_id,title:"Exact church",
  subtitle:"Source-verified photo",sections:[],community_id:"DIOCESAN",
  site_category:{category:"DIOCESAN_OR_PARISH_CONTEXT",visual_lane:"DIOCESAN_PHOTO",classification_basis:"CURRENT_FIRST_PARTY_VENUE"}
 };
 assert.equal(directoryVenueVisualPolicy(item).photoAllowed,true);
 const [card,wrong]=attachApprovedDirectoryMedia([
  item,{...item,item_id:"wrong",source_id:"wrong-"+p.venue_id}],
  {venueApproved:media.items}
 );
 assert.equal(card.cover_media?.asset_path,p.asset_path);
 assert.equal(eligibleRenderedDirectoryImage(card.cover_media,card),true);
 assert.equal(wrong.cover_media,undefined,"Another church falsely inherited this source");
 for(const lang of ["en","fr"]){
  const html=renderDirectoryVenueCard(card,lang);
  assert.ok(html.includes('data-visual-kind="photo"'));
  assert.ok(html.includes('src="'+img.asset_path+'"'));
  assert.ok(html.includes('alt="'+esc(lang==="fr"?img.alt_fr:img.alt_en)+'"'));
  const preview=renderExploreToString(buildExploreViewModel({
   language:lang,lens:"tlm",items:[card],view:"map",selectedId:item.item_id,
   filters:{directoryGroup:"ALL"}
  }));
  assert.ok(preview.includes("aoTlmPreviewPhotoCredit"),"Credit missing on Directory preview");
  for(const text of [img.credit,img.license_url,img.source_url,lang==="fr"?img.changes_fr:img.changes_en])
   assert.ok(preview.includes(esc(text)),"P110 photo source/CC/transformation missing in "+lang);
 }
}
for(const row of ledger.held){
 const promoted=p112.approved.find(x=>x.venue_id===row.venue_id);
 if(promoted){
  const img=media.items.find(x=>x.venue_id===row.venue_id);
  assert.equal(promoted.cl2_anchor,row.cl2_anchor);
  assert.equal(img?.asset_path,promoted.asset_path,"Only source-verified P112 photo may resolve a historical P110 hold");
  assert.equal(img?.source_sha1,promoted.original_sha1);
  assert.equal(img?.derivative_sha256,promoted.derivative_sha256);
 }else assert.ok(!media.items.some(m=>m.venue_id===row.venue_id),"Unreviewed original/alternate photo published");
 assert.ok(row.reason&&row.next_evidence);
}
assert.ok(!media.items.some(x=>x.venue_id==="AO-AMER-R28-US-21-03"),"Lewiston conflicting site excluded");
console.log("P110 PASS: two Commons-SHA1 verified exact-site covers, byte-identical Git blobs, all 23 old covers, three P112 exact site promotions, two remaining holds, and EN/FR attribution");
