import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { R17_REVIEWED_ACTION_ASSETS } from "../src/mass/reader-reviewed-action-assets.js";
import { R17_FROZEN_ACTIVE_ICON_ASSETS } from "../src/mass/reader-icon-bank.js";
import { R17_FROZEN_ACTIVE_ICON_KEYS, createHostIconResolver, iconKeysForReaderState } from "../src/mass/reader-icons.js";
import { resolveHostIconAssets } from "../src/mass/browser-entry.js";

const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const manifest=load("../data/presentation/mass-icon-recovered-svg-snapshot-20261020.v1.json");
const legacy=load("../data/presentation/mass-icon-rejected-legacy-artwork-20261019.v1.json");
assert.equal(manifest.status,"STAGED_VERIFIED_IN_PR_1485");
assert.equal(manifest.entries.length,13);
assert.equal(manifest.totals.githubVerifiedStagedSvgMasters,13);
assert.equal(legacy.items.length,16,"legacy rejection hashes unexpectedly changed");
const rejectedHashes=new Set(legacy.items.map(item=>item.sha256));

// All recovered masters must stay pure, theme-aware SVGs and byte-identical to
// the user's approved originals. No rejected/reserve artwork may be silently
// promoted into the active alias namespace.
for(const item of manifest.entries){
  assert.equal(item.stagedInGithub,true,item.name);
  assert.equal(item.editorialStatus,"ACCEPTED_FOR_POTENTIAL_USE",item.name);
  assert.ok(!rejectedHashes.has(item.sha256),"Rejected physical artwork reintroduced: "+item.name);
  const file=readFileSync(new URL("../"+item.githubReviewPath,import.meta.url));
  assert.equal(file.length,item.bytes,item.name+" byte length changed");
  assert.equal(createHash("sha256").update(file).digest("hex"),item.sha256,
    item.name+" no longer matches the user-reviewed original");
  const svg=file.toString("utf8");
  assert.match(svg,/^<svg\s/,item.name+" not SVG");
  assert.match(svg,/currentColor/,item.name+" not theme-aware");
  assert.doesNotMatch(svg,/<(?:script|image|foreignObject)\b|(?:href|xlink:href)=["']https?:\/\//i,
    item.name+" introduced a non-vector/external dependency");
}
const reviewed={
  review_priest_credo_chant:"ao_chant.svg",
  review_priest_receive_chalice:"ao_drink_chalice.svg",
  review_priest_fraction_host:"ea_priest_fraction_host.svg",
  review_priest_commingling:"ea_priest_commingling.svg",
};
assert.deepEqual(Object.keys(R17_REVIEWED_ACTION_ASSETS).sort(),Object.keys(reviewed).sort());
const host=resolveHostIconAssets({});
const resolve=createHostIconResolver({assets:host});
assert.equal(Object.keys(R17_FROZEN_ACTIVE_ICON_ASSETS).length,67);
assert.equal(R17_FROZEN_ACTIVE_ICON_KEYS.length,67);
for(const [key,filename] of Object.entries(reviewed)){
  const url=R17_REVIEWED_ACTION_ASSETS[key];
  assert.ok(url.endsWith("/assets/review/mass-icon-candidates/recovered-20261020/"+filename));
  assert.equal(host[key],url);
  assert.equal(resolve(key),url);
  assert.ok(!R17_FROZEN_ACTIVE_ICON_KEYS.includes(key),
    key+" must not overwrite one of the 67 frozen master keys");
}
assert.equal(Object.keys(host).length,67+5+4,
  "five approved postures and four reviewed actions are the only overlays");
const key=priestAction=>iconKeysForReaderState({priestAction}).priestActionIconKey;
for(const [label,want] of [
  ["INTONES CREDO","review_priest_credo_chant"],
  ["RECEIVES CHALICE","review_priest_receive_chalice"],
  ["BREAKS HOST","review_priest_fraction_host"],
  ["PLACES PARTICLE","review_priest_commingling"],
  ["OFFERS HOST",null],
  ["OFFERS CHALICE",null],
  ["KISSES GOSPEL",null],
  ["TURNS TO ALTAR",null],
  ["GENUFLECTS",null],
  ["RECEIVES HOST",null],
]){
  assert.equal(key({label}),want,"incorrect Mass action illustration: "+label);
}
for(const [label,oldKey,want] of [
  ["INTONES CREDO","priest_centre_arms_rich","review_priest_credo_chant"],
  ["RECEIVES CHALICE","chalice_elevation","review_priest_receive_chalice"],
  ["BREAKS HOST","fraction","review_priest_fraction_host"],
  ["PLACES PARTICLE","commingling","review_priest_commingling"],
  ["OFFERS HOST","priest_elevate_host_rich",null],
  ["OFFERS CHALICE","priest_elevate_chalice_rich",null],
  ["KISSES GOSPEL","priest_gospel_rich",null],
  ["TURNS TO ALTAR","priest_return_altar_rich",null],
]){
  assert.equal(key({label,iconKey:oldKey,owner:"R17_V180_PRIEST_ACTION_SOURCE"}),want,
    "Legacy direct key bypassed reviewed policy: "+label);
}
assert.equal(key({label:"INTONES GLORIA"}),"priest_centre_arms_rich",
  "Credo-accepted chanting art was incorrectly assigned to Gloria");
assert.equal(key({label:"ELEVATES HOST"}),"priest_elevation",
  "Host elevation accidentally became Offertory presentation");
assert.equal(key({label:"ELEVATES CHALICE"}),"priest_elevate_chalice_rich",
  "Approved earlier chalice elevation incorrectly replaced");
assert.equal(key({label:"RAISES EYES AND HANDS",owner:"GESTURE_MATRIX_SOT",iconKey:null}),null,
  "Unbound matrix cue received invented fallback artwork");
console.log("reviewed Mass actions: PASS — 13 recovered SVGs checksum-verified; 4 action replacements, 4 incorrect aliases suppressed; frozen 67 untouched.");
