import assert from "node:assert/strict";
import { existsSync,readFileSync } from "node:fs";
import { OWNER_REJECTED_RELEASED_ORIGINALS_V1,isOwnerRejectedReleasedOriginal } from "../src/art/exact-owner-rejections.v1.js";
import { RELEASED_MODULE_PAINTINGS } from "../src/art/released-module-paintings.v1.js";
import { SACRED_ART_RELEASED_GALLERY_V1,releasedGalleryAt,releasedGalleryBySource } from "../src/art/released-gallery-batch1.v1.js";
import { SACRED_ART_CURATED_WORKS_V1,sacredArtWorkById,sacredArtReleasedPhotoClassification,sacredArtWorksInCategory } from "../src/art/sacred-art-taxonomy-v1.js";
import { SACRED_ART_CROSSMODULE_INDEX_V1,sacredArtCrossModuleLinks,sacredArtMatchesForTarget } from "../src/art/sacred-art-crossmodule-links-v1.js";
import { C3_RELEASED_ART_CATEGORY_CHOICES } from "../src/home/c3-gallery.js";

// Explicit user score 2 on the exact Cleveland original; preserve the
// historical record, but do not leave the rejected photo public.
assert.equal(OWNER_REJECTED_RELEASED_ORIGINALS_V1.length,1);
const rejected=OWNER_REJECTED_RELEASED_ORIGINALS_V1[0];
assert.equal(rejected.artworkId,"cma-122338");
assert.equal(rejected.ownerScore,2);
assert.equal(rejected.rejectionDate,"2026-10-15");
assert.equal(rejected.originalSource,"https://clevelandart.org/art/1942.635");
assert.equal(rejected.legacyModuleId,"bouts");
assert.equal(isOwnerRejectedReleasedOriginal(null),false);
assert.equal(isOwnerRejectedReleasedOriginal({}),false);

for(const record of [
 {id:"bouts"},
 {moduleId:"bouts"},
 {artworkId:"cma-122338"},
 {source:"https://clevelandart.org/art/1942.635"},
 {source:"https://www.clevelandart.org/art/1942.635/?v=1#gallery"},
 {original:"assets/prayer/released/bouts-annunciation-original.jpg"},
 {image:"assets/prayer/released/bouts-annunciation-original.jpg"}
]){
 assert.equal(isOwnerRejectedReleasedOriginal(record),true,"All exact aliases of the rejected original must fail closed: "+JSON.stringify(record));
}
for(const allowed of [
 {id:"angelus",source:"https://www.metmuseum.org/art/collection/search/438724"},
 {title:"The Annunciation",artist:"Philippe de Champaigne"},
 {title:"The Annunciation",artist:"another workshop"},
 {source:"https://clevelandart.org/art/1968.100"},
 {source:"https://clevelandart.org/art/1942.635-other"},
 {source:"https://othermuseum.org/art/1942.635"},
]){
 assert.equal(isOwnerRejectedReleasedOriginal(allowed),false,"Unrelated originals must remain eligible: "+JSON.stringify(allowed));
}
assert.equal(RELEASED_MODULE_PAINTINGS.bouts,undefined);
assert.equal(Object.keys(RELEASED_MODULE_PAINTINGS).length,15);
assert.ok(RELEASED_MODULE_PAINTINGS.angelus,"Philippe de Champaigne Annunciation remains eligible");
assert.ok(RELEASED_MODULE_PAINTINGS.cavallino,"Other Cleveland accession remains eligible");
assert.equal(SACRED_ART_RELEASED_GALLERY_V1.length,15);
assert.equal(new Set(SACRED_ART_RELEASED_GALLERY_V1.map(p=>p.id)).size,15);
assert.ok(SACRED_ART_RELEASED_GALLERY_V1.every(p=>!isOwnerRejectedReleasedOriginal({id:p.moduleId,...p})));
assert.equal(releasedGalleryBySource("https://clevelandart.org/art/1942.635"),null);
assert.equal(releasedGalleryBySource("https://www.clevelandart.org/art/1942.635"),null);
assert.equal(releasedGalleryAt(15),null);
assert.equal(sacredArtWorkById("released-photo:bouts"),null);
assert.equal(sacredArtReleasedPhotoClassification("bouts"),null);
assert.equal(sacredArtCrossModuleLinks("released-photo:bouts"),null);
assert.deepEqual(sacredArtMatchesForTarget("rosary","joy1").map(x=>x.workId),["released-photo:angelus"]);
assert.ok(SACRED_ART_CURATED_WORKS_V1.every(w=>w.id!=="released-photo:bouts"));
assert.ok(SACRED_ART_CROSSMODULE_INDEX_V1.every(w=>w.workId!=="released-photo:bouts"));
for(const category of C3_RELEASED_ART_CATEGORY_CHOICES){
 assert.equal(category.count,SACRED_ART_RELEASED_GALLERY_V1.filter(w=>sacredArtReleasedPhotoClassification(w.moduleId)?.categoryIds.includes(category.id)).length);
 assert.ok(sacredArtWorksInCategory(category.id,{releasedOnly:true}).every(w=>w.id!=="released-photo:bouts"));
}
assert.equal(existsSync(new URL("../assets/prayer/released/bouts-annunciation-original.jpg",import.meta.url)),false,
 "Rejected exact source JPG must not remain as a directly served GitHub Pages asset");
const originalRegister=readFileSync(new URL("../data/artwork/sacred-art-batch1-25-release-progress.v1.json",import.meta.url),"utf8");
assert.match(originalRegister,/"previouslyReleasedPhotoEntries"\s*:\s*16/,
 "Historic 16-release evidence is preserved separately from current eligible count 15");
console.log("PASS: owner-rejected CMA 1942.635 excluded from released source, C3 gallery, taxonomy, links and public binary; other Annunciations preserved.");
