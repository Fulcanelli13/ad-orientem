import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {resolveApprovedPlaceGallery,buildExplorePlaceProfiles} from "../src/find/place-profiles.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const release=read("data/geography/research/sacred-atlas-round1-four-photo-release-20261103.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const covers=read("data/geography/approved-place-media.v1.json");
const shr=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const source=read("data/shrines/source-registry.v1.json");
const phen=read("data/explore/sacred-phenomena-seed.v1.json");
assert.equal(release.schema,"AO_SACRED_ATLAS_ROUND1_FIRST_FOUR_PUBLICATION_V1");
assert.equal(release.rows.length,4);
assert.equal(release.rows.filter(x=>x.media_id).length,2);
assert.equal(release.rows.filter(x=>x.status?.startsWith("HOLD_")).length,2);
const evidence=read("data/geography/research/sacred-atlas-round1-published-binary-evidence-20261103.v1.json");
assert.equal(evidence.new_approved_assets.length,2);
assert.equal(evidence.published,2);
assert.equal(evidence.held,2);
const places=new Set(geo.places.map(x=>x.place_id));
const registry=new Set(phen.relics.map(x=>x.id));
const beforeCoverCount=covers.items.length;
assert.ok(beforeCoverCount>=312);
const dataset={directory:{records:[],communities:[]},
 geography:{places:geo.places,geoAreas:geo.geoAreas,directoryPlaceLinks:geo.directoryPlaceLinks},
 shrines:{shrines:shr.shrines,pilgrimages:shr.pilgrimages,routes:shr.routes,
 temporalLinks:shr.temporalLinks,sources:source.sources},
 sacredPhenomena:{relics:phen.relics,apparitions:phen.apparitions},
 customs:{customs:[],attestations:[],sources:[]},
 novenas:{records:[],links:[],sources:[]},
 editorial:{featured:[],placeGuides:[]},
 media:{approved:covers.items,gallery:gallery.items}};
const projection=projectExploreDataset(dataset);
const profiles=buildExplorePlaceProfiles(dataset,projection,{today:"2026-11-03"});
const render=(id,language)=>renderExploreToString(buildExploreViewModel({
 language,lens:"heritage",view:"map",items:projection.byLens.shrines,
 filters:{heritageCategories:[]},selectedPlaceId:id,placeProfiles:profiles,expandPlace:true}));
const published=release.rows.filter(x=>x.media_id);
const held=release.rows.filter(x=>!x.media_id);
for(const row of held){
 assert.ok(!gallery.items.some(x=>x.place_id===row.place_id&&x.source_url===row.source_url),
  "Rights-held source must not slip into an approved Place gallery");
}
for(const row of published){
 assert.ok(places.has(row.place_id));
 const rec=gallery.items.find(x=>x.media_id===row.media_id);
 assert.ok(rec&&rec.status==="APPROVED",row.media_id);
 assert.equal(rec.place_id,row.place_id);
 assert.equal(rec.subject_focus_id,row.subject_focus_id);
 assert.equal(rec.subject_relic_id??null,row.subject_relic_id??null);
 if(row.subject_relic_id)assert.ok(registry.has(row.subject_relic_id));
 assert.equal(rec.license,row.source_license);
 assert.equal(rec.license_url,row.license_url);
 assert.equal(rec.credit,row.source_author);
 assert.equal(rec.source_url,row.source_url);
 assert.equal(rec.rights_verified,true);
 assert.equal(rec.subject_verified,true);
 assert.equal(rec.crop_reviewed,true);
 assert.equal(rec.user_selection_provenance,"HISTORIC_KEEP_PROTECTED_20261031");
 assert.ok(rec.caption_en&&rec.caption_fr&&rec.alt_en&&rec.alt_fr);
 const asset=readFileSync(new URL("../"+rec.asset_path,import.meta.url));
 assert.equal(asset.toString("ascii",0,4),"RIFF");
 assert.equal(asset.toString("ascii",8,12),"WEBP");
 const sha=createHash("sha256").update(asset).digest("hex");
 assert.equal(rec.derivative_sha256,sha);
 const ev=evidence.new_approved_assets.find(x=>x.media_id===row.media_id);
 assert.ok(ev&&ev.archive_visual_hamming_distance<=8&&ev.derivative_sha256===sha);
 assert.equal(ev.original_sha1,rec.source_sha1);
 const resolved=resolveApprovedPlaceGallery(gallery.items,row.place_id);
 assert.ok(resolved.some(x=>x.media_id===rec.media_id));
 const place=profiles.find(x=>x.place_id===row.place_id);
 assert.equal(place.media?.asset_path,covers.items.find(x=>x.place_id===row.place_id).asset_path,
  "Do not replace an approved building/Place cover with a detail photo");
 assert.ok(place.gallery.some(x=>x.media_id===row.media_id));
 assert.equal(resolveApprovedPlaceGallery([rec],"place:IE:knock-shrine").length,0);
 for(const lang of ["en","fr"]){
  const html=render(row.place_id,lang);
  assert.ok(html.includes('data-gallery-image="'+rec.media_id+'"'));
  assert.ok(html.includes(rec.asset_path));
  assert.ok(html.includes(esc(rec["caption_"+lang])));
  assert.ok(html.includes(esc(rec["alt_"+lang])));
  assert.ok(html.includes(esc(rec.credit)));
  assert.ok(html.includes(esc(rec.source_url)));
  assert.ok(html.includes(esc(rec.license_url)));
  if(row.subject_relic_id){
   assert.ok(html.includes('data-sacred-object-photo="'+rec.media_id+'"'),
    "True exact relic placement should show the approved reliquary photograph");
   assert.ok(html.includes(row.subject_relic_id));
  }else{
   assert.ok(html.includes('data-sacred-subject-photo="'+row.subject_focus_id+'"'),
    "A venerated image/site must not silently become a relic");
  }
 }
}
assert.ok(gallery.items.length>=37,"First Round 1 release must add two genuinely new approved photographs");
console.log("SACRED ATLAS ROUND 1 PASS: 2 exact source files approved, 2 specific holds, bilingual gallery and relic reader, existing approved Place covers preserved");
