import assert from "node:assert/strict";
import {C3_RELEASED_ART_CATEGORY_CHOICES,showC3ArtInfo,openC3ReleasedArtGallery,filterC3ReleasedArtGallery,stepC3ReleasedArtGallery,returnFromC3ReleasedArtGallery,closeC3ArtInfo} from "../src/home/c3-gallery.js";
import {SACRED_ART_RELEASED_GALLERY_V1} from "../src/art/released-gallery-batch1.v1.js";
import {SACRED_ART_CATEGORIES_V1,sacredArtReleasedPhotoClassification} from "../src/art/sacred-art-taxonomy-v1.js";
import {readFileSync} from "node:fs";

const fields=new Map();
for(const key of [
 "[data-c3-art-title]","[data-c3-art-meta]","[data-c3-art-image]","[data-c3-art-source]",
 "[data-c3-art-scene]","[data-home-c3-gallery-nav]","[data-home-c3-gallery-launcher]",
 "[data-home-c3-gallery-counter]","[data-home-c3-gallery-category]"
])fields.set(key,{hidden:false,textContent:"",src:"",href:"",alt:"",value:"all"});
const dlg={open:false,querySelector:key=>fields.get(key)||null,showModal(){this.open=true;},close(){this.open=false;}};
const root={querySelector:key=>key==="[data-home-c3-art-dialog]"?dlg:null};
const start=SACRED_ART_RELEASED_GALLERY_V1[0];
assert.ok(C3_RELEASED_ART_CATEGORY_CHOICES.length>=5);
assert.ok(C3_RELEASED_ART_CATEGORY_CHOICES.every(c=>c.count>0&&SACRED_ART_CATEGORIES_V1[c.id]));
assert.equal(showC3ArtInfo(root,{__c3Artwork:{title:start.title,artist:start.artist,image:start.image,source:start.source,rights:start.rights}}),true);
assert.equal(fields.get("[data-c3-art-scene]").hidden,true);
assert.equal(openC3ReleasedArtGallery(root),true);
assert.equal(fields.get("[data-c3-art-scene]").hidden,false);
assert.equal(fields.get("[data-home-c3-gallery-counter]").textContent,"1 / 16");
const category="INCARNATION";
const expected=SACRED_ART_RELEASED_GALLERY_V1.filter(x=>sacredArtReleasedPhotoClassification(x.moduleId)?.categoryIds.includes(category));
assert.ok(expected.length>1&&expected.length<16);
assert.equal(filterC3ReleasedArtGallery(root,category),true);
assert.equal(fields.get("[data-home-c3-gallery-counter]").textContent,"1 / "+expected.length);
assert.equal(fields.get("[data-c3-art-title]").textContent,expected[0].title);
assert.equal(fields.get("[data-c3-art-scene]").textContent.includes("Incarnation"),true);
for(let i=1;i<expected.length;i++){
 assert.equal(stepC3ReleasedArtGallery(root,1),true);
 assert.equal(fields.get("[data-c3-art-image]").src,expected[i].image);
 assert.equal(fields.get("[data-home-c3-gallery-counter]").textContent,(i+1)+" / "+expected.length);
}
assert.equal(stepC3ReleasedArtGallery(root,1),true);
assert.equal(fields.get("[data-c3-art-image]").src,expected[0].image,"Filtering wraps within category; must not leak unapproved imagery");
assert.equal(filterC3ReleasedArtGallery(root,"UNAPPROVED_NEW_WORK"),false);
assert.equal(filterC3ReleasedArtGallery(root,"all"),true);
assert.equal(fields.get("[data-home-c3-gallery-counter]").textContent,"1 / 16");
assert.equal(returnFromC3ReleasedArtGallery(root),true);
assert.equal(fields.get("[data-c3-art-scene]").hidden,true);
assert.equal(fields.get("[data-c3-art-image]").src,start.image);
assert.equal(closeC3ArtInfo(root),true);
assert.equal(dlg.open,false);
const markup=readFileSync(new URL("../src/home/today-h4-view.js",import.meta.url),"utf8");
const controller=readFileSync(new URL("../src/home/browser-entry.js",import.meta.url),"utf8");
const styles=readFileSync(new URL("../src/home/c3-styles.js",import.meta.url),"utf8");
assert.match(markup,/data-home-c3-gallery-category/);
assert.match(markup,/data-c3-art-scene/);
assert.match(controller,/function onEnricherChange/);
assert.match(controller,/filterC3ReleasedArtGallery/);
assert.match(controller,/removeEventListener\?\.\("change"/);
assert.match(styles,/aoC3GalleryFilter/);
assert.match(styles,/data-c3-art-scene/);
console.log("PASS: 16 published photographs are filtered by actual categorised subjects and French/English labels; no new image admission, original artwork restores.");
