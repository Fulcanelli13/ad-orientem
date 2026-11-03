import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {resolveApprovedPlaceMedia,buildExplorePlaceProfiles} from "../src/find/place-profiles.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const manifest=read("data/geography/research/sacred-atlas-round9-selected-429-retry-manifest-20261103.v1.json");
const evidence=read("data/geography/research/sacred-atlas-round9-selected-429-retry-evidence-20261103.v1.json");
const covers=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const decisions=read("data/geography/research/photo-finder-20261030/decisions.json").decisions;
const shr=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const sources=read("data/shrines/source-registry.v1.json");
const phen=read("data/explore/sacred-phenomena-seed.v1.json");
assert.equal(manifest.schema,"AO_SACRED_ATLAS_PHASE_B_ROUND9_SELECTED_429_RECOVERY_V1");
assert.equal(evidence.schema,"AO_SACRED_ATLAS_ROUND9_PRODUCTION_COVERS_V1");
assert.equal(manifest.rows.length,10);
assert.equal(evidence.reviewed,10);
assert.equal(evidence.published_count+evidence.held_count,10);
assert.equal(evidence.published_count,10,"Freeze actual source-verified Round 9 results");
assert.equal(evidence.held_count,0,"Preserve all Round 9 source holds");
assert.equal(evidence.published.length,evidence.published_count);
assert.equal(evidence.holds.length,evidence.held_count);
assert.ok(evidence.published_count>=1,"Round 9 requires a real newly published image");
assert.equal(evidence.before.covers,364);
assert.ok(covers.items.length>=364+evidence.published_count,
  "Later additive cover rounds must not invalidate the source-verified Round 9 cohort");
assert.equal(evidence.after.covers,364+evidence.published_count,
  "Round 9 release evidence is a frozen production snapshot");
assert.equal(evidence.after.missing,530-evidence.after.covers);
assert.equal(gallery.items.length,42,"Place gallery content cannot be changed in the cover programme");
assert.equal(new Set(covers.items.map(x=>x.place_id)).size,covers.items.length);
assert.ok(evidence.existing_covers_unchanged && evidence.gallery_unchanged && evidence.no_tlm_changes);
assert.ok(evidence.current_commons_sha1_and_license_verified && evidence.current_source_original_bytes_verified && evidence.original_user_choices_preserved && evidence.no_unselected_substitutions);
const published=new Set(evidence.published.map(x=>x.place_id));
const held=new Set(evidence.holds.map(x=>x.place_id));
assert.equal(published.size,evidence.published_count);
assert.equal(held.size,evidence.held_count);
for (const row of manifest.rows) {
  assert.equal(decisions[row.place_id].files[0],row.reviewed_file,"User's rank-1 selected file was silently changed");
  assert.equal(geo.places.find(x=>x.place_id===row.place_id).photo_editorial.cover_commons_file,row.reviewed_file);
  assert.ok(published.has(row.place_id)!==held.has(row.place_id),"Each reviewed item is either published or held");
  if(held.has(row.place_id))assert.ok(!covers.items.some(x=>x.place_id===row.place_id),"Held cover was incorrectly published");
}
const dataset={
 directory:{records:[],communities:[]},
 geography:{places:geo.places,geoAreas:geo.geoAreas,directoryPlaceLinks:geo.directoryPlaceLinks},
 shrines:{shrines:shr.shrines,pilgrimages:shr.pilgrimages,routes:shr.routes,temporalLinks:shr.temporalLinks,sources:sources.sources},
 sacredPhenomena:{relics:phen.relics,apparitions:phen.apparitions},
 customs:{customs:[],attestations:[],sources:[]},novenas:{records:[],links:[],sources:[]},
 editorial:{featured:[],placeGuides:[]},media:{approved:covers.items,gallery:gallery.items}
};
const projection=projectExploreDataset(dataset);
const profiles=buildExplorePlaceProfiles(dataset,projection,{today:"2026-11-03"});
for (const pub of evidence.published) {
  const row=manifest.rows.find(x=>x.place_id===pub.place_id);
  assert.ok(row);
  const rec=covers.items.find(x=>x.place_id===pub.place_id);
  assert.ok(rec&&rec.status==="APPROVED");
  assert.equal(rec.source_sha1,row.expected_original_sha1);
  assert.equal(rec.asset_path,pub.asset_path);
  assert.equal(rec.source_sha1,pub.source_sha1);
  assert.equal(rec.derivative_sha256,pub.derivative_sha256);
  assert.equal(rec.credit,pub.credit);
  assert.equal(rec.license,pub.license);
  assert.ok(rec.rights_verified&&rec.subject_verified&&rec.crop_reviewed);
  assert.ok(rec.source_url.startsWith("https://commons.wikimedia.org/wiki/File"));
  assert.ok(rec.alt_en&&rec.alt_fr);
  const bytes=readFileSync(new URL("../"+rec.asset_path,import.meta.url));
  assert.equal(bytes.toString("ascii",0,4),"RIFF");
  assert.equal(bytes.toString("ascii",8,12),"WEBP");
  assert.equal(createHash("sha256").update(bytes).digest("hex"),rec.derivative_sha256);
  assert.ok(resolveApprovedPlaceMedia(covers.items,row.place_id));
  const profile=profiles.find(x=>x.place_id===row.place_id);
  assert.equal(profile?.media?.asset_path,rec.asset_path,"Cover not bound to correct Place");
  for(const language of ["en","fr"]){
    const html=renderExploreToString(buildExploreViewModel({
      language,lens:"heritage",view:"map",items:projection.byLens.shrines,
      filters:{heritageCategories:[]},selectedPlaceId:row.place_id,placeProfiles:profiles,expandPlace:true
    }));
    assert.ok(html.includes(rec.asset_path),"Bilingual Place card does not show actual cover "+row.place_id);
    assert.ok(html.includes(esc(rec["alt_"+language])));
    assert.ok(html.includes(esc(rec.credit)));
  }
}
console.log("SACRED ATLAS ROUND 8 PASS: "+evidence.published_count+" locally verified, prior user-selected covers, "+evidence.held_count+" source holds, 364 original covers preserved, 42 gallery images preserved, exact EN/FR Place display");
