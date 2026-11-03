/* A source-identity gate for the entire 27-date frozen artwork backlog.
 * It certifies four specific Commons source PREVIEWS, not original photo QA.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {FROZEN_SELECTED_2026_EXACT_WORK_PREVIEWS,
 frozenSelected2026HomeArtwork} from "../src/home/approved-2026-frozen-selected-previews.js";
import {approved2026HomeArtwork} from "../src/home/approved-dated-artwork-2026.js";
import {ANNUAL_HOME_ARTWORK_DAYS_2026} from "../src/home/annual-home-artwork-2026.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const prior=read("data/artwork/2026-prior-date-artwork-evidence.v1.json");
const gallery=read("data/artwork/research-operational-989.v1.json");
const triage=read("data/artwork/home-2026-27-frozen-selected-release-triage.v1.json");
const census=read("data/artwork/home-2026-annual-release-census.v1.json");
const frozen=Object.values(FROZEN_SELECTED_2026_EXACT_WORK_PREVIEWS);
assert.equal(frozen.length,4);
assert.equal(triage.rows.length,27);
assert.equal(triage.counts.REMOTE_PREVIEW_MAPPED_NOT_OFFLINE_CERTIFIED,4);
assert.equal(triage.counts.EXACT_APPROVED_OBJECT_PHOTO_NOT_RELEASE_CLEARED,16);
assert.equal(triage.counts.APPROVED_DERIVED_IMAGE_FINAL_FILE_UNLOCATED,4);
assert.equal(triage.counts.MULTI_SCENE_VIGIL_NOT_SINGLE_HERO_PHOTO,1);
assert.equal(triage.counts.ATTRIBUTION_SHAREALIKE_RIGHTS_NOT_CLEARED,1);
assert.equal(triage.counts.EXACT_SOURCE_IDENTITY_AND_RIGHTS_UNRESOLVED,1);
assert.equal(census.days.length,365);
assert.equal(Object.keys(ANNUAL_HOME_ARTWORK_DAYS_2026).length,365);
assert.equal(census.counts.totalProposedMapped,134);
assert.equal(census.counts.pendingOrHeld,231);
assert.equal(census.counts.FROZEN_EXACT_SOURCE_PREVIEW_MAPPED,4);
assert.equal(census.counts.DATE_SELECTED_IMAGE_UNRELEASED,23);
assert.equal(new Set(triage.rows.map(r=>r.date)).size,27);

const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
for(const r of frozen){
 const day=prior.days.find(x=>x.date===r.date);
 assert.equal(day?.selection?.title,r.title,"Exact selected title changed "+r.date);
 assert.equal(norm(day.selection.artist),norm(r.artist));
 assert.equal(day.selection.editorialBasis,r.editorialBasis);
 assert.equal(day.principalId,r.principalId);
 assert.equal(day.selection.artworkId??null,
  r.date==="2026-09-29"?null:r.artworkId);
 const group=gallery.works.find(w=>w.workGroupId===r.workGroupId);
 assert.ok(group,"Gallery physical source absent "+r.date);
 assert.equal(norm(group.artist),norm(r.artist));
 assert.equal(group.selectedPhotoFingerprint,r.photoSha1);
 assert.equal(group.userPhotoQualityApproval,false,"Preview cannot be certified as final original");
 assert.equal(group.productionReleased,false,"Gallery research not independently released");
 assert.equal(group.historicalExclusion,false);
 assert.ok(["FREE_FILE_METADATA_VERIFIED","PUBLIC_DOMAIN_OR_CC0_COMMONS_FILE_METADATA"].includes(group.rightsCategory));
 const page=decodeURIComponent(group.selectedSourceUrl);
 assert.ok(page.endsWith("/wiki/File:"+r.file),"Original Commons physical file differs from frozen selection "+r.date);
 const state={selectedDate:r.date,resolving:false,route:"home",
  resolution:{date:r.date,status:"ready",day:{main:{id:r.principalId}},
   proper:{status:"ready",sourcePath:r.properPath}}};
 const actual=approved2026HomeArtwork(state);
 assert.ok(actual,"Home has no selected image "+r.date);
 assert.equal(actual.artworkId,r.artworkId);
 assert.equal(actual.title,r.title);
 assert.equal(actual.artist,r.artist);
 assert.equal(actual.selectionKind,"PREVIOUSLY_SELECTED_2026_FROZEN_EXACT_WORK_PREVIEW");
 assert.equal(actual.imageStatus,"REMOTE_FROZEN_SELECTED_EXACT_WORK_PREVIEW_NOT_OFFLINE_CERTIFIED");
 assert.match(actual.image,/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:Redirect\/file\//);
 assert.match(actual.source,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
 assert.equal(actual.sourcePhotoSha1,r.photoSha1);
 assert.equal(approved2026HomeArtwork({...state,resolution:{...state.resolution,
  day:{main:{id:"wrong-principal"}}}}),null);
 assert.equal(approved2026HomeArtwork({...state,resolution:{...state.resolution,
  proper:{status:"ready",sourcePath:r.properPath+"-wrong"}}}),null);
 assert.equal(frozenSelected2026HomeArtwork(r.date,"wrong",r.properPath),null);
 assert.equal(frozenSelected2026HomeArtwork(r.date,r.principalId,r.properPath+"-wrong"),null);
 assert.ok(triage.rows.some(x=>x.date===r.date&&x.decision==="REMOTE_PREVIEW_MAPPED_NOT_OFFLINE_CERTIFIED"));
 assert.equal(census.days.find(x=>x.date===r.date)?.status,"FROZEN_EXACT_SOURCE_PREVIEW_MAPPED");
}
for(const r of triage.rows.filter(x=>x.decision!=="REMOTE_PREVIEW_MAPPED_NOT_OFFLINE_CERTIFIED")){
 assert.equal(FROZEN_SELECTED_2026_EXACT_WORK_PREVIEWS[r.date],undefined);
 assert.equal(census.days.find(x=>x.date===r.date)?.status,"DATE_SELECTED_IMAGE_UNRELEASED");
}
for(const date of ["2026-10-25","2026-11-29"]){
 assert.equal(FROZEN_SELECTED_2026_EXACT_WORK_PREVIEWS[date],undefined,
  "Protected held work must not be bypassed");
 assert.equal(census.days.find(x=>x.date===date)?.status,"DATE_SELECTED_IMAGE_RIGHTS_HELD");
}
console.log("PASS frozen 27: four selected same-work Commons previews and 23 explicit holds");
console.log("PASS annual census 134/365 mapped, 231 outstanding, protected date rights holds");
