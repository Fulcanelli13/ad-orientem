import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
import {resolveHostIconAssets} from "../src/mass/browser-entry.js";
import {isDonorPngWrapper} from "../src/mass/reader-dom.js";
import {R17_FROZEN_ACTIVE_ICON_ASSETS} from "../src/mass/reader-icon-bank.js";
import {CANONICAL_ICON_ASSETS} from "../src/mass/reader-canonical-icons.js";
import {getCanonicalAsset,resolveCanonicalAssetUrl,AO_ASSET_BANK_CONTRACT,
 AO_USER_MASS_GESTURE_EXTENSION_20261112} from "../src/assets/asset-registry.js";
import {finalCurated65IconKeys} from "../src/mass/reader-final65-icon-keys.js";
import {USER_SUPPLIED_MASS_GESTURE_ASSETS_20261112 as selected,
 USER_SUPPLIED_MASS_GESTURE_SOURCE_CUES_20261112 as cues}
 from "../src/mass/reader-user-supplied-gesture-art-20261112.js";
const inventory=JSON.parse(readFileSync(new URL(
 "../assets/extensions/mass-user-gesture-20261112/manifest.v1.json",import.meta.url),"utf8"));
assert.equal(inventory.status,"USER_DIRECTLY_SELECTED");
assert.equal(inventory.assets.length,3);
assert.equal(AO_ASSET_BANK_CONTRACT.activeAssetCount,117,
 "Frozen V4/V4.1.1 bank count must not mutate");
assert.equal(Object.keys(AO_USER_MASS_GESTURE_EXTENSION_20261112).length,3);
const active=resolveHostIconAssets();
const iconBankKey={gospel_crosses:"ao-live-gospel-triple-cross-20261112",
 breast_strike:"ao-live-breast-strike-20261112",
 profound_bow:"ao-live-profound-bow-20261112"};
for(const item of inventory.assets){
 const canonical=getCanonicalAsset(item.assetId);
 assert.ok(canonical,"Owner-selected SVG missing in semantic asset lookup");
 assert.equal(canonical.path,item.path);
 assert.equal(canonical.status,"USER_APPROVED_ADDENDUM");
 assert.equal(canonical.sha256,item.svgSha256);
 const file=readFileSync(new URL("../"+item.path,import.meta.url));
 const svg=file.toString("utf8");
 assert.equal(createHash("sha256").update(file).digest("hex"),item.svgSha256,
  "Gesture SVG changed without explicit owner review: "+item.assetId);
 assert.match(svg,/<svg\b/);
 assert.match(svg,/fill-rule="evenodd"/);
 assert.match(svg,/<path/);
 assert.match(svg,/Original SHA-256:/);
 assert.ok(!/<script|<foreignObject|https?:\/\//i.test(svg.replace('xmlns="http://www.w3.org/2000/svg"','')),
  "Source-vector gesture asset cannot fetch external content");
 assert.equal(resolveCanonicalAssetUrl(item.assetId),new URL(
  "../"+item.path,import.meta.url).href);
 assert.equal(active[item.iconKey],selected[item.iconKey]);
 assert.equal(selected[item.iconKey],new URL(
  "../"+item.path,import.meta.url).href);
 assert.notEqual(R17_FROZEN_ACTIVE_ICON_ASSETS[item.iconKey],selected[item.iconKey],
  "Owner extension must not modify the donor V4.6 original");
 assert.equal(iconBankKey[item.iconKey],item.assetId);
}
for(const k of ["canon:faithful.gesture.gospel_crosses",
 "canon:faithful.gesture.strike_breast",
 "canon:faithful.gesture.bow_profound","canon:priest.action.strike_breast",
 "canon:priest.action.profound_bow"]){
 assert.equal(active[k],selected[k],"Runtime canonical icon must use owner-selected art");
 assert.notEqual(CANONICAL_ICON_ASSETS[k],active[k],
  "Frozen canonical donor art must remain separate from newer selected art");
}
assert.equal(active.final_profound_bow,selected.profound_bow);
// A later vector inherits a legacy gesture key but MUST NOT enter the
// PNG-unwrapper path; otherwise the image disappears on the real rail.
for(const key of ["breast_strike","profound_bow","gospel_crosses"]){
 assert.equal(isDonorPngWrapper(key,active[key]),false,
  "User-selected transparent SVG must use direct CSS mask: "+key);
}
assert.equal(isDonorPngWrapper("breast_strike",R17_FROZEN_ACTIVE_ICON_ASSETS.breast_strike),
 true,"Original v1.80 donor wrapper still needs PNG alpha unwrapping");
assert.equal(isDonorPngWrapper("breast_strike"),true,
 "Legacy no-source donor audits remain valid");
for(const form of ["LOW","MISSA_CANTATA_SIMPLE",
 "MISSA_CANTATA_INCENSE","SOLEMN"]){
 const faithful=(cue,type,posture=null)=>finalCurated65IconKeys({
  cueId:cue,form,posture:posture?{value:posture}:null,
  gesture:{cueId:cue,type,owner:"EXACT_SOURCE_GESTURE"}
 }).gestureIconKey;
 for(const id of cues.gospel_crosses)
  assert.equal(faithful(id,"GOSPEL_SMALL_CROSSES"),"gospel_crosses",
   form+" Gospel/Last Gospel must render the owner art at exact source");
 for(const id of cues.breast_strike.filter(x=>x!=="AO.SM.C0017"))
  if(id in (awaitFinalMap()))assert.equal(faithful(id,"BREAST_STRIKE"),
    "breast_strike",form+" breast strike must use the owner art");
 assert.equal(faithful("AO.SM.C0021","PROFOUND_BOW","STAND"),
  "profound_bow",form+" actual profound Confiteor bow must be available");
 assert.equal(faithful("AO.SM.C0021","PROFOUND_BOW","KNEEL"),null,
  form+" kneeling is not a profound bow");
 assert.equal(faithful("AO.SM.C0021","HEAD_BOW","STAND"),null,
  form+" ordinary head bow must not use the profound-bow icon");
 assert.equal(finalCurated65IconKeys({cueId:"AO.SM.C0021",form,
  posture:{value:"STAND"},gesture:{cueId:"AO.SM.C0021",
   owner:"GESTURE_MATRIX_SOT",action:"Profound bow / remain kneeling according profile"}})
  .gestureIconKey,"profound_bow",
  "Exact source gesture resolved for standing faithful should use selected artwork");
 for(const cueId of ["AO.SM.C0016","AO.SM.C0079","AO.SM.C0150","AO.SM.C0187"]){
  const label=cueId==="AO.SM.C0079"?"PROFOUND BOW":"BOWS PROFOUNDLY";
  const state={cueId,form,priestAction:{cueId,label,owner:"GESTURE_MATRIX_SOT"}};
  assert.equal(finalCurated65IconKeys(state).priestActionIconKey,
   "owner_profound_bow","Actual priest profound bow should use new artwork");
  assert.notEqual(finalCurated65IconKeys({...state,priestAction:{...state.priestAction,
    label:"BOWS HEAD"}}).priestActionIconKey,"owner_profound_bow",
   "No profound bow from a different rubric action");
 }

 assert.equal(finalCurated65IconKeys({cueId:"AO.SM.C0021",form}).gestureIconKey,
  null,"Never manufacture a Confiteor bow without a sourced gesture");
}
function awaitFinalMap(){return Object.fromEntries(
 ["AO.SM.C0022","AO.SM.C0196","AO.SM.C0197","AO.SM.C0198",
  "AO.SM.C0222","AO.SM.C0223","AO.SM.C0224","AO.SM.C0236",
  "AO.SM.C0243","AO.SM.C0244","AO.SM.C0245"].map(c=>[c,true]))}
// Special rites reuse SAME resolved icon keys, not an independent bank.
// Source rubrics remain the sole authority for displaying an action.
assert.equal(active.owner_profound_bow,selected.profound_bow);
for(const key of ["gospel_crosses","breast_strike","profound_bow"]){
 assert.ok(active[key].includes("mass-user-gesture-20261112"));
}
console.log("OWNER_20261112_MASS_GESTURES_PASS=3 SVGs, 4 forms, Gospel/Confiteor/Communion, special-rite aliases");
