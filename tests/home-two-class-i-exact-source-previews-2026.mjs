// Exact dated 2026 Class I preview gate. The two paintings, not new
// recommendations, were selected by the owner in the 20 October editorial
// overlay; this test never treats a remote thumbnail as an original master.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CLASS_I_EXACT_SOURCE_PREVIEWS_2026,sourceVerifiedClassI2026Preview}
 from "../src/home/approved-class-i-exact-source-previews-2026.js";
import {approved2026HomeArtwork} from "../src/home/approved-dated-artwork-2026.js";
import {APPROVED_CLASS_I_2026} from "../src/calendar/approved-class-i-heroes-2026.js";
const master=JSON.parse(readFileSync(new URL(
 "../data/artwork/2026-prior-date-artwork-evidence.v1.json",import.meta.url),"utf8"));
const frozen=JSON.parse(readFileSync(new URL(
 "../data/artwork/sacred-art-2026-coverage-first-master-20261110.v1.json",import.meta.url),"utf8"));
const entries=Object.values(CLASS_I_EXACT_SOURCE_PREVIEWS_2026);
assert.equal(entries.length,2);
assert.deepEqual(new Set(entries.map(x=>x.date)),new Set(["2026-03-01","2026-05-25"]));
assert.equal(new Set(entries.map(x=>x.date)).size,2);
assert.equal(master.days.length,365);
assert.equal(APPROVED_CLASS_I_2026.filter(x=>entries.some(y=>y.date===x.date)).length,0,
 "Do not override separate Class I locked publication rules");
for(const row of entries){
 const prior=master.days.find(x=>x.date===row.date);
 const source=frozen.calendar.days.find(x=>x.date===row.date);
 assert.ok(prior?.selection&&source?.selectedArt,"No owner-approved physical work "+row.date);
 assert.equal(prior.rank,"I");
 assert.equal(source.rank,"I");
 assert.equal(source.status,"DATE_SELECTED_IMAGE_UNRELEASED");
 assert.equal(prior.principalId,row.principalId);
 assert.equal(prior.selection.editorialBasis,"NEW_DATE_SPECIFIC_APPROVAL");
 assert.equal(prior.selection.artist,row.artist);
 assert.equal(prior.selection.title,row.title);
 assert.equal(source.selectedArt.title,row.title);
 assert.equal(source.selectedArt.artist,row.artist);
 assert.equal(prior.selection.publicationCertified,false);
 assert.equal(row.imagePublicationStatus,"REMOTE_APPROVED_DATE_PREVIEW_NOT_OFFLINE_CERTIFIED");
 assert.ok(["2026-03-01","2026-05-25"].includes(row.date));
 assert.match(row.sourceObject,/^https:\/\/(?:www\.museivaticani\.va|www\.pafa\.org)\//);
 assert.match(row.photoFilePage,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
 assert.ok(!/Prado|Christie|Bridgeman/i.test(row.photoFilePage+" "+row.sourceObject));
 assert.ok(row.imageWidth>=960&&row.imageHeight>=900);
 assert.ok(row.collectionIdentity.length>18);
 const selected=sourceVerifiedClassI2026Preview(row.date,row.principalId,row.properPath);
 assert.ok(selected&&selected.image,"Missing exact remote photo preview "+row.date);
 assert.equal(selected.title,row.title);
 assert.equal(selected.artist,row.artist);
 assert.equal(selected.source,row.sourceObject);
 assert.equal(selected.imageSource,row.photoFilePage);
 assert.equal(selected.artworkId,"frozen-date:"+row.date);
 assert.equal(selected.imageStatus,row.imagePublicationStatus);
 assert.match(selected.image,/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:Redirect\/file\//);
 assert.equal(selected.offlineOriginalCertified,false);
 assert.equal(selected.photoOriginalBytesCommitted,false);
 assert.equal(selected.photographCropCertified,false);
 assert.equal(selected.ownerArtworkDecisionNewlyCreated,false);
 assert.equal(sourceVerifiedClassI2026Preview(row.date,"not-approved",row.properPath),null);
 assert.equal(sourceVerifiedClassI2026Preview(row.date,row.principalId,row.properPath+"-wrong"),null);
 const state={route:"home",selectedDate:row.date,resolving:false,resolution:{
  date:row.date,status:"ready",day:{main:{id:row.principalId}},
  proper:{status:"ready",sourcePath:row.properPath,data:{sourcePath:row.properPath}}
 }};
 const live=approved2026HomeArtwork(state);
 // A local exact original can supersede the historical source preview
 // without changing the owner's date selection or old preview metadata.
 if(row.date==="2026-05-25"){
  assert.equal(live?.image,"/assets/home/class-i-2026/tanner-nicodemus-1899-pafa-1900-1-original.jpg");
  assert.equal(live?.imageStatus,"LOCAL_ORIGINAL_PD_ART_BYTE_VERIFIED_CROP_NOT_OWNER_APPROVED");
  assert.equal(live?.ownerArtworkDecisionNewlyCreated,false);
 }else if(row.date==="2026-03-01"){
  assert.equal(live?.image,"/assets/home/class-i-2026/raphael-transfiguration-vatican-original.jpg");
  assert.equal(live?.imageStatus,"LOCAL_VATICAN_RAPHAEL_SOURCE_VERIFIED_UNALTERED_ARTBOOK_SCAN");
  assert.equal(live?.collectionIdentity,row.collectionIdentity);
  assert.equal(live?.source,row.sourceObject);
  assert.equal(live?.ownerArtworkDecisionNewlyCreated,false);
 }else{
  assert.equal(live?.image,selected.image,"Other exact approved preview changed "+row.date);
  assert.equal(live?.imageStatus,row.imagePublicationStatus);
 }
 assert.equal(approved2026HomeArtwork({...state,resolving:true}),null);
 assert.equal(approved2026HomeArtwork({...state,resolution:{...state.resolution,
  proper:{status:"pending",sourcePath:row.properPath}}}),null);
 assert.equal(approved2026HomeArtwork({...state,resolution:{...state.resolution,
  day:{main:{id:"sancti:bad"}}}}),null);
}
for(const other of ["2026-10-25","2026-11-29","2026-09-29","2026-04-03"]){
 assert.equal(CLASS_I_EXACT_SOURCE_PREVIEWS_2026[other],undefined,
  "Owner image rights and identity holds must not be bypassed");
 assert.equal(sourceVerifiedClassI2026Preview(other,"x","Tempora/wrong"),null);
}
console.log("PASS both archived exact Class I source previews remain pinned and live Home uses two individually verified local photo originals");
