import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {resolveApprovedPlaceMedia,buildExplorePlaceProfiles} from "../src/find/place-profiles.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const m=read("data/geography/research/sacred-atlas-round11-pd-self-selected-cover-manifest-20261104.v1.json");
const e=read("data/geography/research/sacred-atlas-round11-pd-self-source-evidence-20261104.v1.json");
const covers=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const decisions=read("data/geography/research/photo-finder-20261030/decisions.json").decisions;
const shr=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const sources=read("data/shrines/source-registry.v1.json");
const phen=read("data/explore/sacred-phenomena-seed.v1.json");
assert.equal(m.schema,"AO_SACRED_ATLAS_ROUND11_PD_SELF_ORIGINAL_COVERS_V1");
assert.equal(e.schema,"AO_SACRED_ATLAS_ROUND11_PD_SELF_SOURCE_EVIDENCE_V1");
assert.equal(m.rows.length,11);
assert.equal(e.reviewed,11);
assert.equal(e.published_count,1,"Exactly one independently source-verified public-domain original");
assert.equal(e.held_count,10,"Preserve Commons 429 holds, not editorial rejections");
assert.equal(e.published.length,1);
assert.equal(e.holds.length,10);
assert.equal(e.before.covers,378);
assert.equal(e.after.covers,379);
assert.equal(e.after.missing,151);
assert.ok(covers.items.length>=379,"Later additive cover rounds must remain possible");
assert.equal(gallery.items.length,42);
assert.equal(new Set(covers.items.map(x=>x.place_id)).size,covers.items.length);
assert.ok(e.previous_editorial_choices_unchanged&&e.gallery_unchanged&&e.tlm_unchanged&&
  e.current_exact_sha1_original_bytes_pd_self_and_revision_verified_for_published);
const published=new Set(e.published.map(x=>x.place_id)),held=new Set(e.holds.map(x=>x.place_id));
assert.equal(published.size,1);assert.equal(held.size,10);
for(const row of m.rows){
  assert.equal(decisions[row.place_id].files[0],row.commons_file);
  assert.equal(geo.places.find(p=>p.place_id===row.place_id)?.photo_editorial?.cover_commons_file,row.commons_file);
  assert.ok(published.has(row.place_id)!==held.has(row.place_id));
  if(held.has(row.place_id))assert.ok(!covers.items.some(x=>x.place_id===row.place_id),
    "Rate-limited source must not be published without a later independently verified release");
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
const profiles=buildExplorePlaceProfiles(dataset,projection,{today:"2026-11-04"});
for(const proof of e.published){
  const item=m.rows.find(x=>x.place_id===proof.place_id);
  assert.ok(item);
  assert.equal(proof.place_id,"place:PL:divine-mercy-plock");
  const rec=covers.items.find(x=>x.place_id===proof.place_id);
  assert.ok(rec&&rec.status==="APPROVED");
  assert.equal(rec.source_sha1,item.original_sha1);
  assert.equal(rec.source_sha1,proof.source_sha1);
  assert.equal(proof.source_revision_id,item.expected_revision_id);
  assert.equal(rec.asset_path,proof.asset_path);
  assert.equal(rec.derivative_sha256,proof.derivative_sha256);
  assert.equal(rec.license,"PUBLIC_DOMAIN");
  assert.equal(rec.license_url,"https://creativecommons.org/publicdomain/mark/1.0/");
  assert.ok(rec.rights_verified&&rec.subject_verified&&rec.crop_reviewed);
  assert.ok(rec.credit.includes("Przemysław Jahr"));
  assert.ok(rec.alt_en&&rec.alt_fr&&rec.changes_en&&rec.changes_fr);
  const binary=readFileSync(new URL("../"+rec.asset_path,import.meta.url));
  assert.equal(binary.toString("ascii",0,4),"RIFF");
  assert.equal(binary.toString("ascii",8,12),"WEBP");
  assert.equal(createHash("sha256").update(binary).digest("hex"),rec.derivative_sha256);
  assert.ok(resolveApprovedPlaceMedia(covers.items,proof.place_id));
  const profile=profiles.find(x=>x.place_id===proof.place_id);
  assert.equal(profile?.media?.asset_path,rec.asset_path);
  for(const language of ["en","fr"]){
    const html=renderExploreToString(buildExploreViewModel({
      language,lens:"heritage",view:"map",items:projection.byLens.shrines,
      filters:{heritageCategories:[]},selectedPlaceId:proof.place_id,placeProfiles:profiles,expandPlace:true
    }));
    assert.ok(html.includes(rec.asset_path),"Płock cover not in "+language+" Place");
    assert.ok(html.includes(esc(rec["alt_"+language])));
    assert.ok(html.includes(esc(rec.credit)));
  }
}
console.log("SACRED ATLAS ROUND 11 PASS: 1 original Commons PD-self image, ten rate-limited holds; 42 gallery items unchanged; exact Płock EN/FR card");
