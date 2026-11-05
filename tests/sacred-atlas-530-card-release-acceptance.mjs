import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {buildExplorePlaceProfiles,resolveApprovedPlaceMedia} from "../src/find/place-profiles.js";
import {compactHeritagePlaceSheet} from "../src/find/heritage-presentation.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const json=p=>JSON.parse(readFileSync(p,"utf8"));
const geo=json("data/geography/seed-registry.v1.json");
const covers=json("data/geography/approved-place-media.v1.json");
const gallery=json("data/geography/approved-place-gallery.v1.json");
const shrines=json("data/shrines/shrines-pilgrimages-seed.v1.json");
const shrineSources=json("data/shrines/source-registry.v1.json");
const phenomena=json("data/explore/sacred-phenomena-seed.v1.json");
const ledger=json("data/geography/research/sacred-atlas-530-card-acceptance-20261104.v1.json");
const verified=json("data/geography/research/sacred-atlas-round25-23place-64-original-review-20261104.json");

assert.equal(ledger.schema,"AO_SACRED_ATLAS_530_PLACE_CARD_ACCEPTANCE_V1");
assert.equal(ledger.counts.canonical_places,530);
assert.equal(ledger.counts.photo_covers_approved,384);
assert.equal(ledger.counts.missing_approved_photo,146);
assert.equal(ledger.counts.verified_unapproved_photo_sites,23);
assert.equal(ledger.counts.no_verified_original_sites,123);
assert.equal(ledger.counts.approved_gallery_photos,42);
assert.equal(geo.places.length,530);
assert.equal(covers.items.length,384);
assert.equal(gallery.items.length,42);
assert.equal(verified.places.length,23);
assert.equal(ledger.photo_gaps.length,146);

const placeById=new Map(geo.places.map(p=>[p.place_id,p]));
const mediaById=new Map(covers.items.map(m=>[m.place_id,m]));
const verifiedIds=new Set(verified.places.map(p=>p.place_id));
assert.equal(placeById.size,530,"no duplicate Place identities");
assert.equal(mediaById.size,384,"no duplicate published covers");
assert.equal(new Set(ledger.photo_gaps.map(p=>p.place_id)).size,146,"no duplicate fallback Places");
assert.ok(covers.items.every(r=>placeById.has(r.place_id)),"no media orphans");
assert.ok(verified.places.every(r=>placeById.has(r.place_id)&&!mediaById.has(r.place_id)),"no already published site in unapproved review");
const gaps=geo.places.filter(p=>!mediaById.has(p.place_id));
assert.deepEqual(
 ledger.photo_gaps.map(p=>p.place_id).sort(),
 gaps.map(p=>p.place_id).sort(),
 "missing-photo ledger must equal actual canonical registry minus approved media");
for(const row of ledger.photo_gaps){
 const site=placeById.get(row.place_id);
 assert.equal(row.name,site.name.official);
 assert.equal(row.place_type,site.place_type);
 assert.equal(row.country_code,site.address.country_code);
 assert.equal(row.visual_type,"ILLUSTRATIVE_CATEGORY_SYMBOL");
 assert.equal(row.source_status,verifiedIds.has(row.place_id)?"ORIGINALS_VERIFIED_NOT_EDITORIALLY_APPROVED":"NO_ORIGINAL_BYTE_VERIFIED");
 assert.equal(row.photo_publication_allowed,false);
}
assert.equal(ledger.photo_gaps.filter(x=>x.source_status==="ORIGINALS_VERIFIED_NOT_EDITORIALLY_APPROVED").length,23);

// All 384 published photograph binaries must exist and match their registered
// SHA-256 values. The 21 explicit gallery-HERO reuses remain unchanged.
for(const record of covers.items){
 assert.equal(record.status,"APPROVED");
 assert.ok(record.rights_verified&&record.subject_verified&&record.crop_reviewed);
 assert.match(record.derivative_sha256,/^[a-f0-9]{64}$/);
 const resolved=resolveApprovedPlaceMedia(covers.items,record.place_id);
 assert.ok(resolved,record.place_id+" approved photo must survive rights/media resolver");
 assert.equal(resolved.asset_path,record.asset_path);
 const bytes=readFileSync(record.asset_path);
 if(record.asset_path.endsWith(".webp")){
  assert.equal(bytes.toString("ascii",0,4),"RIFF");
  assert.equal(bytes.toString("ascii",8,12),"WEBP");
 }
 assert.equal(createHash("sha256").update(bytes).digest("hex"),record.derivative_sha256,
  record.place_id+" approved derivative changed without source reapproval");
}

const dataset={
 geography:{places:geo.places,geoAreas:geo.geoAreas,directoryPlaceLinks:geo.directoryPlaceLinks},
 directory:{records:[],communities:[]},
 shrines:{shrines:shrines.shrines,pilgrimages:shrines.pilgrimages,routes:shrines.routes,temporalLinks:shrines.temporalLinks,sources:shrineSources.sources},
 sacredPhenomena:{relics:phenomena.relics,apparitions:phenomena.apparitions},
 customs:{customs:[],attestations:[],sources:[]},
 novenas:{records:[],links:[],sources:[]},
 editorial:{featured:[],placeGuides:[]},
 media:{approved:covers.items,gallery:gallery.items},
};
const projection=projectExploreDataset(dataset);
const profiles=buildExplorePlaceProfiles(dataset,projection,{today:"2026-11-04"});
const profileById=new Map(profiles.map(p=>[p.place_id,p]));
assert.equal(profiles.length,530,"one rendered-ready profile for every canonical Place");
assert.equal(profileById.size,530);
let photoCards=0,symbolCards=0;
for(const raw of geo.places){
 const p=profileById.get(raw.place_id);
 assert.ok(p,raw.place_id+" lacks a public Place profile");
 assert.equal(p.name,raw.name.official);
 assert.equal(p.place_type,raw.place_type);
 assert.ok(p.address,raw.place_id+" has no source address");
 assert.ok(p.geo,raw.place_id+" has no original site geography");
 const photographed=mediaById.has(raw.place_id);
 assert.equal(Boolean(p.media),photographed,"Unexpected photo or absent approved photo "+raw.place_id);
 if(photographed)photoCards++;else symbolCards++;
 for(const lang of ["en","fr"]){
  const preview=compactHeritagePlaceSheet({
   language:lang,selectedPlace:p,filters:{heritageCategories:[]},
   journeyOpen:false,placeJourneys:[],
  });
  assert.ok(preview.includes('data-explore-place-owner="'+raw.place_id+'"'),"wrong Place card ownership "+raw.place_id);
  assert.ok(preview.includes('data-explore-expand-place'),"no Discover affordance "+raw.place_id);
  if(photographed){
   assert.ok(preview.includes(p.media.asset_path),"published local cover absent "+raw.place_id);
   assert.ok(preview.includes(p.media.credit.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")),"photographer credit absent "+raw.place_id);
   assert.ok(!preview.includes("aoSacredPlaceSymbolFallback"),"photo and placeholder mixed "+raw.place_id);
  }else{
   assert.ok(preview.includes('data-visual-kind="category-symbol"'),"uncovered Place lacks illustrated fallback "+raw.place_id);
   assert.ok(preview.includes("aoSacredPlaceSymbolFallback"),"fallback styling lost "+raw.place_id);
   assert.ok(!preview.includes("<img"),"unapproved or fabricated image in photo-less card "+raw.place_id);
   assert.ok(preview.includes(lang==="fr"?"aucune photographie approuvée":"no approved photograph"),"fallback is not honestly labelled "+raw.place_id);
   assert.ok(preview.includes(lang==="fr"?"Découvrir":"Discover"),"bilingual Place navigation missing "+raw.place_id);
  }
 }
}
assert.equal(photoCards,384);
assert.equal(symbolCards,146);

// All 146 fallbacks must also survive the expanded detail reader, not merely
// the compact preview. Check both languages and exact canonical ownership.
for(const raw of gaps){
 for(const lang of ["en","fr"]){
  const vm=buildExploreViewModel({
   language:lang,lens:"heritage",view:"map",items:projection.byLens.shrines,
   selectedPlaceId:raw.place_id,placeProfiles:profiles,expandPlace:true,
   filters:{heritageCategories:[]},
  });
  assert.equal(vm.selectedPlace?.place_id,raw.place_id);
  const html=renderExploreToString(vm);
  assert.ok(html.includes('data-explore-place-owner="'+raw.place_id+'"'),"detail belongs to wrong site");
  assert.ok(html.includes('data-visual-kind="category-symbol"'),"missing detail visual fallback "+raw.place_id);
  assert.ok(html.includes(lang==="fr"?"aucune photographie approuvée":"no approved photograph"));
  assert.ok(!html.includes("Special:FilePath/"),"research Commons hotlink leaked into public detail");
  assert.ok(html.includes("aoExplorePlaceSheet"),"detail reader missing");
 }
}
console.log("SACRED ATLAS FINISH LINE PASS: 530/530 EN/FR Place previews, 146/146 EN/FR detailed fallbacks, 384 verified local photo binaries, 42 unchanged gallery records, and zero unapproved images.");
