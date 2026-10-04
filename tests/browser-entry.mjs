import assert from "node:assert/strict";
import {
  mapLegacyFollowMode,
  resolveFieldPresentationMode,
  mapInsertedRites,
  deriveHostOptions,
  mountR17Preview,
} from "../src/mass/browser-entry.js";

assert.equal(mapLegacyFollowMode("missal"), "MISSAL");
assert.equal(mapLegacyFollowMode("read"), "MISSAL");
assert.equal(mapLegacyFollowMode("simple"), "SIMPLE");
assert.equal(mapLegacyFollowMode("vox"), "LIVE");
assert.equal(mapLegacyFollowMode(undefined), "LIVE");
assert.equal(resolveFieldPresentationMode({
  date:"2026-10-04",celebrationId:"holy_rosary",requestedMode:"simple",
}),"LIVE");
assert.equal(resolveFieldPresentationMode({
  date:"2026-10-05",celebrationId:"holy_rosary",requestedMode:"simple",
}),"SIMPLE");

const rites = mapInsertedRites([
  "asperges",
  "corpus procession",
  "requiem absolution",
  "rogation procession",
]);
assert.deepEqual([...rites.precedingRites], ["ASPERGES", "ROGATIONS"]);
assert.deepEqual(
  [...rites.followingActions],
  ["CORPUS_CHRISTI_PROCESSION", "REQUIEM_ABSOLUTION", "GENERIC_PROCESSION"],
);

const options = deriveHostOptions({
  resolvedMass: { insertedRites: ["ash"] },
  assemblyStatus: { ok: true, proper: { id: "P" } },
  arch: { celebrationForm: "low", followMode: "missal" },
  runtimeState: { settings: { localMassProfile: "LOCAL" } },
});
assert.equal(options.proper.id, "P");
assert.equal(options.celebrationForm, "low");
assert.equal(options.presentationMode, "MISSAL");
assert.deepEqual([...options.precedingRites], ["ASH"]);
assert.equal(options.localProfile, "LOCAL");

assert.throws(
  () => deriveHostOptions({
    resolvedMass: {},
    assemblyStatus: { ok: false, reason: "blocked" },
  }),
  /blocked/,
);

console.log("browser-entry contract: PASS");

const iconKeys=[
  "stand","sit","kneel","genuflect","bow","cross","gospel_crosses","breast_strike","head_bow","profound_bow","hands_joined",
  "response","schola","priest_audible","priest_silent","priest_foot","priest_steps","priest_centre","priest_epistle","priest_gospel","priest_sedilia","priest_rail","priest_people",
];
const iconAssets=Object.fromEntries(iconKeys.map(key=>[key,"data:image/svg+xml;base64,PHN2Zy8+"]));


let mirrorCalls=0;
const nativeChoice=await mountR17Preview({
  doc:{},
  prepared:{},
  nativeMount:()=>({kind:"native"}),
  mirrorMount:()=>{mirrorCalls+=1;return {kind:"mirror"}},
  iconAssets,
  iconAssets,
});
assert.equal(nativeChoice.uiOwner,"R17_NATIVE_CARDS_OVER_LEGACY_STATE");
assert.equal(nativeChoice.preview.kind,"native");
assert.equal(nativeChoice.fallbackReason,null);
assert.equal(mirrorCalls,0);

const fallback=await mountR17Preview({
  doc:{},
  prepared:{},
  nativeMount:()=>{throw new Error("native blocked")},
  mirrorMount:()=>{mirrorCalls+=1;return {kind:"mirror"}},
  iconAssets,
  iconAssets,
});
assert.equal(fallback.uiOwner,"R17_MIRROR_FALLBACK");
assert.equal(fallback.preview.kind,"mirror");
assert.match(fallback.fallbackReason,/native blocked/);
assert.equal(mirrorCalls,1);

const missingBank=await mountR17Preview({
  doc:{},prepared:{},iconAssets:{},
  nativeMount:()=>({kind:"should-not-mount"}),
  mirrorMount:()=>({kind:"mirror"}),
});
assert.equal(missingBank.uiOwner,"R17_MIRROR_FALLBACK");
assert.match(missingBank.fallbackReason,/R17_ICON_BANK_INCOMPLETE/);
