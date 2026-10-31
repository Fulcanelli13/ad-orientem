import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {inspectPrayerArtworkDom,stampPrayerArtworkDomEvidence} from "../src/pray/artwork-dom-evidence.v1.js";

// Deterministic DOM doubles: loading an image is NOT a release/rights decision.
function root(slot="STG-pray.rosary-07",images=[],css=""){
 const r={
  dataset:{aoArtworkEditorialSlot:slot,aoArtworkPublished:"true"},
  hidden:false,parentElement:null,
  getAttribute:()=>null,
  style:{getPropertyValue:key=>key==="--r24-mystery-art"?css:""},
  querySelectorAll:()=>images
 };
 for(const img of images){img.parentElement=r;img.getAttribute=()=>null;}
 return r;
}
const img=({complete=true,width=1500,height=1700,hidden=false,geometry=1}={})=>({
 complete,naturalWidth:width,naturalHeight:height,hidden,
 getClientRects:()=>Array.from({length:geometry},()=>({}))
});
const absent=stampPrayerArtworkDomEvidence(root("STG-pray.stations-01"));
assert.equal(absent.status,"NO_ARTWORK_NODE");
assert.equal(absent.publicationVerified,false);
const current=root("STG-pray.rosary-07",[img()]);
const legacy=stampPrayerArtworkDomEvidence(current);
assert.equal(legacy.status,"VISIBLE_LEGACY_ART_UNCERTIFIED");
assert.equal(legacy.loadedVisibleImages,1);
assert.equal(current.dataset.aoArtworkPublished,"false");
assert.equal(current.dataset.aoArtworkDomImages,"1");
assert.ok(!Object.hasOwn(legacy,"assetUrl"),"DOM evidence must not leak or authorize a photo URL");
assert.equal(stampPrayerArtworkDomEvidence(root("COV-pray.angelus",[img({complete:false})])).status,"ARTWORK_NODE_UNLOADED_OR_BROKEN");
assert.equal(stampPrayerArtworkDomEvidence(root("COV-pray.angelus",[img({hidden:true})])).status,"ARTWORK_NODE_HIDDEN");
assert.equal(stampPrayerArtworkDomEvidence(root("STG-pray.rosary-07",[],'url("legacy")')).status,"CSS_ART_UNVERIFIED");
assert.equal(stampPrayerArtworkDomEvidence(root("",[img()])).status,"NO_EDITORIAL_ARTWORK_SLOT");
assert.equal(inspectPrayerArtworkDom(null).publicationVerified,false);
for(const owner of ["presentation-runtime.js","novena-runtime.js","traditional-pray-runtime.js"]){
 const source=readFileSync("src/pray/"+owner,"utf8");
 assert.ok(source.includes('stampPrayerArtworkDomEvidence'),"Reader does not collect DOM evidence: "+owner);
}
const presentation=readFileSync("src/pray/presentation-runtime.js","utf8");
assert.ok(presentation.includes("stampPrayerArtworkDomEvidence(shell)"),"Rosary donor not audited");
assert.ok(presentation.includes("stampPrayerArtworkDomEvidence(m)"),"Presentation owner not audited");
console.log(JSON.stringify({
 gate:"DOM_IMAGE_PRESENCE_ONLY_NOT_PHOTO_CERTIFICATION",
 checkedReaders:3,rosaryDonorChecked:true,
 tests:"passed",publicationCertified:false
},null,2));
