import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {resolveApprovedPlaceGallery,buildExplorePlaceProfiles} from "../src/find/place-profiles.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const geo=read("data/geography/seed-registry.v1.json");
const shr=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const source=read("data/shrines/source-registry.v1.json");
const phen=read("data/explore/sacred-phenomena-seed.v1.json");
const covers=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
const focus=read("data/geography/research/sacred-atlas-round1-source-links-20261103.v1.json");
const dataset={
 directory:{records:[],communities:[]},
 geography:{places:geo.places,geoAreas:geo.geoAreas,directoryPlaceLinks:geo.directoryPlaceLinks},
 shrines:{shrines:shr.shrines,pilgrimages:shr.pilgrimages,routes:shr.routes,
  temporalLinks:shr.temporalLinks,sources:source.sources},
 sacredPhenomena:{relics:phen.relics,apparitions:phen.apparitions},
 customs:{customs:[],attestations:[],sources:[]},
 novenas:{records:[],links:[],sources:[]},
 editorial:{featured:[],placeGuides:[]},
 media:{approved:covers.items,gallery:gallery.items}
};
const projected=projectExploreDataset(dataset);
const profiles=buildExplorePlaceProfiles(dataset,projected,{today:"2026-11-03"});
const render=(id,language,lens="heritage")=>renderExploreToString(buildExploreViewModel({
 language,lens,view:"map",items:lens==="heritage"?projected.byLens.shrines:projected.byLens.tlm,
 filters:{heritageCategories:[]},
 selectedPlaceId:id,placeProfiles:profiles,expandPlace:true
}));
const approved=[
 ["place:PL:jasna-gora","ao-jasna-gora-original-black-madonna-icon-2024",
  "subject:focus:jasna-gora-black-madonna"],
 ["place:DE:altoetting-gnadenkapelle","ao-altoetting-original-black-madonna-altar-2013",
  "subject:round1-review:DE:altoetting-gnadenkapelle:9"]
];
for(const [placeId,mediaId,subjectId] of approved){
 const record=gallery.items.find(x=>x.media_id===mediaId);
 assert.ok(record&&record.place_id===placeId);
 assert.equal(record.status,"APPROVED");
 assert.equal(record.display_role,"GALLERY_OBJECT");
 assert.equal(record.subject_focus_id,subjectId);
 assert.equal(record.not_relic_image,true);
 assert.ok(record.rights_verified&&record.subject_verified&&record.crop_reviewed);
 const bytes=readFileSync(new URL("../"+record.asset_path,import.meta.url));
 assert.equal(bytes.toString("ascii",0,4),"RIFF");
 assert.equal(bytes.toString("ascii",8,12),"WEBP");
 assert.equal(createHash("sha256").update(bytes).digest("hex"),record.derivative_sha256);
 const profile=profiles.find(x=>x.place_id===placeId);
 assert.ok(profile,"Place missing "+placeId);
 const loaded=profile.gallery.find(x=>x.media_id===mediaId);
 assert.ok(loaded,"Approved photo not resolved into Place gallery "+mediaId);
 assert.equal(loaded.subject_focus_id,subjectId);
 assert.equal(loaded.not_relic_image,true);
 assert.equal(loaded.subject_relic_id,null,"Sacred image is not a relic");
 assert.equal(loaded.caption_en,record.caption_en);
 assert.equal(loaded.caption_fr,record.caption_fr);
 assert.ok(profile.media,"Existing exact Place cover must be preserved");
 assert.equal(profile.media.asset_path,covers.items.find(x=>x.place_id===placeId)?.asset_path);
 assert.ok(!profile.sacred_treasures.some(x=>x.image?.media_id===mediaId),
   "Venerated icon/statue must not hijack a relic card");
 for(const language of ["en","fr"]){
  const html=render(placeId,language);
  assert.ok(html.includes('data-explore-place-owner="'+placeId+'"'));
  assert.ok(html.includes('data-sacred-subject-photo="'+subjectId+'"'));
  assert.ok(html.includes('data-gallery-image="'+mediaId+'"'));
  assert.ok(html.includes(record.asset_path));
  assert.ok(html.includes(record["alt_"+language]));
  assert.ok(html.includes(record["caption_"+language]));
  assert.ok(html.includes(record.credit));
  assert.ok(html.includes(record.source_url));
  assert.ok(html.includes(record.license_url));
  assert.ok(html.includes('data-explore-place-jump="gallery"'),"Existing gallery navigation must remain");
  assert.equal(html.split('data-explore-place-chapter="gallery"').length-1,1,
   "Object gallery must render exactly once");
  assert.ok(html.includes(language==="fr"?
   "Le lieu et ses images vénérées en photographies":"The place and its venerated images in photographs"));
  const galleryAt=html.indexOf('data-explore-place-chapter="gallery"');
  const chaptersAt=html.indexOf('class="aoExplorePlaceOpening aoExploreSourcedStory"');
  if(chaptersAt>=0)assert.ok(galleryAt<chaptersAt,
   "Source-approved sacred-image gallery must precede long narrative for "+placeId+" "+language);
 }
 const restricted=resolveApprovedPlaceGallery([record],placeId);
 assert.equal(restricted.length,1);
 assert.equal(resolveApprovedPlaceGallery([{...record,rights_verified:false}],placeId).length,0);
 assert.equal(resolveApprovedPlaceGallery([{...record,subject_verified:false}],placeId).length,0);
 assert.equal(resolveApprovedPlaceGallery([record],"place:FR:chartres-notre-dame").length,0);
 assert.equal(resolveApprovedPlaceGallery([{...record,subject_focus_id:"subject:invalid"}],placeId)[0]?.subject_focus_id,null);
 assert.equal(resolveApprovedPlaceGallery([{...record,not_relic_image:false}],placeId)[0]?.subject_focus_id,null);
}
// Both independently approved source files are reused; this release never
// invents an image approval from the older Round 1 in-chat KEEP metadata.
assert.deepEqual(focus.rows.find(x=>x.round1_preview_number===9).independent_published_same_source_gallery_ids,
 ["ao-altoetting-original-black-madonna-altar-2013"]);
// Ordinary Place galleries remain generic and retain their existing order.
const ordinary=render("place:FR:pontmain","en");
assert.ok(ordinary.includes("The place in photographs"));
assert.ok(!ordinary.includes("The place and its venerated images in photographs"));
assert.ok(!ordinary.includes("data-sacred-subject-photo="));
// No alteration to TLM directory data, ministry classification or CL27 values.
assert.deepEqual(dataset.directory,{records:[],communities:[]});
console.log("Sacred Atlas approved venerated-image fidelity PASS: two distinct exact images, correct source and bilingual captions, visual hierarchy, no TLM changes.");
