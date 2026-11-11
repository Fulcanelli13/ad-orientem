import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { RELEASED_MODULE_PAINTINGS } from "../src/art/released-module-paintings.v1.js";
import { SACRED_ART_RELEASED_GALLERY_V1, releasedGalleryAt, releasedGalleryBySource } from "../src/art/released-gallery-batch1.v1.js";
import { showC3ArtInfo, openC3ReleasedArtGallery, stepC3ReleasedArtGallery, returnFromC3ReleasedArtGallery, closeC3ArtInfo } from "../src/home/c3-gallery.js";

const selected = JSON.parse(readFileSync(new URL("../data/calendar/sacred-art-2026-batch01-60-exact-photo-owner-decisions-20261102.v1.json", import.meta.url),"utf8"));
const batch=JSON.parse(readFileSync(new URL("../data/artwork/sacred-art-batch1-25-release-progress.v1.json",import.meta.url),"utf8"));
assert.equal(batch.proposedBatchTarget,25);
assert.equal(batch.counts.previouslyReleasedPhotoEntries,16);
assert.equal(batch.counts.photoCandidatesInNextNine,9);
assert.equal(batch.counts.totalBatchWorkItems,25);
assert.equal(batch.counts.newlyReleasedInThisChange,0);
assert.equal(batch.counts.unreleasedNewWorks,9);
assert.equal(batch.counts.nineQueueTotalApprovedPrayerPositions,41);
assert.equal(batch.productionAlreadyReleased.length,16);
assert.equal(batch.nextNineSourcePhotographWorkQueue.length,9);
for(const photo of batch.productionAlreadyReleased){
  if(photo.moduleId==="bouts"){
    // Historical progress remains immutable, but this exact CMA original
    // received an explicit later global owner rejection (15 October W68).
    assert.equal(photo.source,"https://clevelandart.org/art/1942.635");
    assert.equal(RELEASED_MODULE_PAINTINGS.bouts,undefined);
    continue;
  }
  const source=RELEASED_MODULE_PAINTINGS[photo.moduleId];
  assert.ok(source,"Known release registry required for "+photo.id);
  assert.equal(photo.source,source.source);
  assert.equal(photo.localImage,source.image);
  assert.equal(photo.publiclyRenderEligibleNow,true);
  assert.equal(photo.newPhotoRelease,false);
}
for(const painting of batch.nextNineSourcePhotographWorkQueue){
  assert.equal(painting.explicitlyNotReleaseApproved,true);
  assert.equal(painting.appImage,null);
  assert.ok(painting.blockers.includes("EXACT_PHOTO_RIGHTS_QA_AND_VISUAL_CHECK_PENDING"));
  assert.ok(painting.selectedSlotIds.length===painting.knownSelectedSlotCount);
}
assert.equal(selected.counts.approve,25);
assert.equal(selected.counts.reject,35);
assert.ok(selected.rows.every(x=>x.appPublicationApproved===false),"The selected 25 cannot become released through gallery indexing");
assert.equal(Object.keys(RELEASED_MODULE_PAINTINGS).length,15);
assert.equal(SACRED_ART_RELEASED_GALLERY_V1.length,15,"One of 16 historically released photos is now globally rejected");
assert.equal(new Set(SACRED_ART_RELEASED_GALLERY_V1.map(p=>p.id)).size,15);
assert.equal(new Set(SACRED_ART_RELEASED_GALLERY_V1.map(p=>p.source)).size,15,"Every eligible gallery entry requires a unique exact source");
for(const a of SACRED_ART_RELEASED_GALLERY_V1){
  const original=RELEASED_MODULE_PAINTINGS[a.moduleId];
  assert.ok(original);
  assert.equal(a.id,"released-photo:"+a.moduleId);
  assert.equal(a.source,original.source);
  assert.equal(a.image,original.image);
  assert.equal(a.original,original.original);
  assert.equal(a.releasePr,original.releasePr);
  assert.equal(a.releaseState,"PREVIOUSLY_RELEASED_EXACT_MODULE_PHOTO");
  assert.equal(a.newEditorialApproval,false);
  assert.equal(a.newPublication,false);
  // Do not mistake a registered asset name for an actual release file.
  // Both exact selected source and approved display crop must exist in the
  // Git checkout as nonempty bytes; no remote photo fetch or promotion.
  for(const filename of [a.original,a.image]){
    const disk=new URL("../"+filename,import.meta.url);
    assert.ok(statSync(disk).isFile(),"Missing released image file: "+filename);
    assert.ok(statSync(disk).size>0,"Empty released image file: "+filename);
  }

  assert.match(a.image,/^assets\/(prayer|home)\//);
  assert.ok(releasedGalleryBySource(a.source)===a,"Gallery source join must be exact");
}
assert.equal(releasedGalleryAt(-1),null);
assert.equal(releasedGalleryAt(15),null);
assert.equal(releasedGalleryAt(1.25),null);
assert.equal(releasedGalleryBySource("https://commons.wikimedia.org/wiki/File:not-reviewed.jpg"),null);
assert.equal(releasedGalleryBySource(""),null);

// No browser is needed for this test: create a minimal authorised dialog
// that exposes the same four controls as the frozen H7 Home design.
const elements=new Map();
for(const key of [
 "[data-c3-art-title]","[data-c3-art-meta]","[data-c3-art-image]",
 "[data-c3-art-source]","[data-home-c3-gallery-nav]",
 "[data-home-c3-gallery-launcher]","[data-home-c3-gallery-counter]"
])elements.set(key,{hidden:false,textContent:"",src:"",alt:"",href:""});
const dialog={
 open:false,
 querySelector:key=>elements.get(key)??null,
 showModal(){this.open=true;},
 close(){this.open=false;}
};
const root={querySelector:key=>key==="[data-home-c3-art-dialog]"?dialog:null};
const one=SACRED_ART_RELEASED_GALLERY_V1[5];
const originalInfo={title:one.title,artist:one.artist,rights:one.rights,image:one.original,source:one.source};
assert.equal(openC3ReleasedArtGallery(root),false,"Cannot open gallery without artwork-info dialog");
assert.equal(showC3ArtInfo(root,{__c3Artwork:originalInfo}),true);
assert.equal(dialog.open,true);
assert.equal(elements.get("[data-c3-art-image]").src,one.original);
assert.equal(elements.get("[data-home-c3-gallery-nav]").hidden,true);
assert.equal(openC3ReleasedArtGallery(root),true);
assert.equal(dialog.__c3GalleryIndex,5,"Anchor gallery to the painting whose info was opened");
assert.equal(elements.get("[data-home-c3-gallery-counter]").textContent,"6 / 15");
assert.equal(elements.get("[data-c3-art-image]").src,one.image);
assert.equal(stepC3ReleasedArtGallery(root,1),true);
assert.equal(dialog.__c3GalleryIndex,6);
assert.equal(stepC3ReleasedArtGallery(root,-1),true);
assert.equal(dialog.__c3GalleryIndex,5);
assert.equal(stepC3ReleasedArtGallery(root,2),false,"Only single-step explicit navigation allowed");
assert.equal(returnFromC3ReleasedArtGallery(root),true);
assert.equal(elements.get("[data-c3-art-image]").src,one.original,"Return restores exact originally selected artwork");
assert.equal(elements.get("[data-home-c3-gallery-nav]").hidden,true);
assert.equal(closeC3ArtInfo(root),true);
assert.equal(dialog.open,false);
assert.equal(stepC3ReleasedArtGallery(root,1),false,"Closed dialog has no active gallery");

// Reopen with a date-specific Commons preview: browsing is opt-in and
// returning must never replace the date's authoritative artwork.
const heldPreview={title:"Date-locked painting",artist:"Recorded artist",
  rights:"Remote approved exact-work preview",image:"https://example.invalid/approved-remote-preview.jpg",
  source:"https://commons.wikimedia.org/wiki/File:Existing_user_approved_date.jpg"};
assert.equal(showC3ArtInfo(root,{__c3Artwork:heldPreview}),true);
assert.equal(openC3ReleasedArtGallery(root),true);
assert.equal(dialog.__c3GalleryIndex,0);
assert.equal(stepC3ReleasedArtGallery(root,-1),true);
assert.equal(dialog.__c3GalleryIndex,14,"Gallery navigation wraps safely");
assert.equal(returnFromC3ReleasedArtGallery(root),true);
assert.equal(elements.get("[data-c3-art-image]").src,heldPreview.image);
assert.equal(elements.get("[data-c3-art-source]").href,heldPreview.source);
assert.equal(closeC3ArtInfo(root),true);

const home = readFileSync(new URL("../src/home/today-h4-view.js",import.meta.url),"utf8");
const controller = readFileSync(new URL("../src/home/browser-entry.js",import.meta.url),"utf8");
const css = readFileSync(new URL("../src/home/c3-styles.js",import.meta.url),"utf8");
for(const name of ["gallery-open","gallery-prev","gallery-next","gallery-back"]){
  assert.ok(home.includes("data-home-c3-"+name),"Missing modal button: "+name);
  assert.ok(controller.includes("data-home-c3-"+name),"Missing UI controller: "+name);
}
assert.ok(home.includes("data-home-c3-gallery-nav hidden"));
assert.ok(css.includes("data-home-c3-gallery-nav][hidden]"));
assert.ok(!home.includes("data-home-c3-gallery-publish"),"No action may publish unapproved artwork");
console.log("Sacred Art Batch 1 PASS: 15 of 16 historical photos remain display-eligible after exact Bouts rejection; 25 pending photos remain quarantined.");
