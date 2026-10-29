import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
import {attachApprovedDirectoryMedia,eligibleDirectoryImage,DIRECTORY_CARD_STYLE} from "../src/find/directory-card.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const read=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const geo=read("data/geography/seed-registry.v1.json");
const manifest=read("data/geography/approved-place-media.v1.json");
const release=read("data/geography/research/directory-p95-first-two-photo-covers.v1.json");
assert.equal(release.schema,"AO_P95_TWO_VERIFIED_DIRECTORY_COVERS_V1");
assert.equal(geo.places.length,518);
assert.equal(geo.directoryPlaceLinks.length,11);
assert.equal(manifest.schema,"AO_APPROVED_PLACE_MEDIA_V1");
assert.equal(manifest.items.length,33);
assert.equal(release.photos.length,2);
const expected=[
  ["AO-AMER-R28-US-25-03","place:US:st-boniface-sioux-city",
   "assets/approved/place-media/US-st-boniface-sioux-city.webp",
   "85c498e5078050d626f0d504b1fd4257ed5b5f720e5b26dd6734bc5604a529c3",
   "228b098e9254bfbf2fe93d208f9be4998d909d27","Ammodramus","CC0",[682,1000]],
  ["V19:DIO-US-MN-ST-PAUL-SAINT-AGNES","place:US:st-agnes-saint-paul",
   "assets/approved/place-media/US-st-agnes-saint-paul.webp",
   "4df12e7c03ccbd79e207a7f92e4a548c481d0cb47957d37a2a5b7fbfafb4f9d3",
   "661b34873db6f23afd5ef25ec08766e647644e4c","McGhiever","CC-BY-SA-3.0",[1000,843]]
];
for(const [venue,place,path,sha256,sha1,credit,licence,dim] of expected){
  const matches=manifest.items.filter(x=>x.place_id===place);
  assert.equal(matches.length,1,"exact Place must have exactly one new approved cover");
  const img=matches[0];
  assert.ok(eligibleDirectoryImage(img,place));
  assert.equal(img.source_sha1,sha1);
  assert.equal(img.derivative_sha256,sha256);
  assert.equal(img.asset_path,path);
  assert.equal(img.credit,credit);
  assert.equal(img.license,licence);
  assert.deepEqual([img.width,img.height],dim);
  assert.ok(img.source_url.startsWith("https://commons.wikimedia.org/wiki/File:"));
  assert.ok(img.license_url.startsWith("https://creativecommons.org/"));
  assert.ok(img.changes_en.toLowerCase().includes("no crop"));
  assert.ok(img.changes_fr.includes("sans recadrage"));
  assert.equal(img.crop_reviewed,true);
  assert.equal(img.rights_verified,true);
  assert.equal(img.subject_verified,true);
  const bytes=fs.readFileSync(new URL("../"+path,import.meta.url));
  assert.equal(createHash("sha256").update(bytes).digest("hex"),sha256);
  assert.ok(bytes.length>50_000&&bytes.length<500_000);
  assert.equal(bytes.toString("ascii",0,4),"RIFF");
  assert.equal(bytes.toString("ascii",8,12),"WEBP");
  assert.deepEqual(release.photos.find(x=>x.place_id===place)?.derivative_sha256,sha256);
  const link=geo.directoryPlaceLinks.filter(x=>x.venue_id===venue);
  assert.equal(link.length,1);
  assert.equal(link[0].place_id,place);
  assert.equal(link[0].confidence,"CONFIRMED");
  assert.equal(link[0].relationship,"LOCATED_AT");
  const approved=attachApprovedDirectoryMedia([{kind:"TLM_VENUE",source_id:venue,title:"Exact church",item_id:"tlm:"+venue,lens:"tlm",subtitle:"USA"}],
    {directoryPlaceLinks:geo.directoryPlaceLinks,approved:manifest.items,gallery:[]});
  assert.equal(approved[0].cover_media?.asset_path,path);
  const vm=buildExploreViewModel({language:"en",lens:"tlm",items:approved,view:"map",selectedId:"tlm:"+venue,filters:{directoryGroup:"ALL"}});
  const html=renderExploreToString(vm);
  assert.match(html,/aoTlmPreviewPhoto/);
  assert.match(html,/aoTlmPreviewPhotoCredit/);
  assert.ok(html.includes(credit));
  assert.ok(html.includes("https://creativecommons.org/"));
  assert.ok(html.includes("Original photo"));
}
assert.ok(DIRECTORY_CARD_STYLE.includes("object-fit:contain;object-position:center"));
assert.ok(DIRECTORY_CARD_STYLE.includes("aoTlmPreviewPhotoCredit"));
assert.ok(!DIRECTORY_CARD_STYLE.includes("aoTlmPreviewPhoto{display:block;width:100%;height:132px;object-fit:cover"));
assert.equal(release.existing_venue_records_changed,0);
assert.equal(release.schedule_or_calendar_claims_added,0);
assert.equal(release.expense_eur,0);
console.log("P95 PASS — 2 exact approved, source-authored full-frame WebPs matched byte-for-byte; attribution+licence linked in Directory");
