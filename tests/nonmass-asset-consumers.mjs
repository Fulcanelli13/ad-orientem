import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  AO_APP_SURFACE_ASSET_IDS,
  AO_LEARN_ROUTE_ASSET_IDS,
  AO_REMOVED_ASSET_IDS,
  canonicalAssetIdForLearnRoute,
  canonicalAssetIdForSurface,
  getCanonicalAsset,
} from "../src/assets/asset-registry.js";

assert.deepEqual(AO_APP_SURFACE_ASSET_IDS,{
  home:"ao-nav-home",
  mass:"ao-brand-emblem",
  pray:"ao-nav-pray",
  learn:"ao-nav-learn",
  calendar:"ao-nav-calendar",
  settings:"ao-nav-settings",
});
assert.deepEqual(AO_LEARN_ROUTE_ASSET_IDS,{
  "learn.catechism.daily":"ao-refined-study",
  "learn.mass":"ao-rich-guides",
  "learn.catechism":"ao-module-catechism",
  "today.gospel":"ao-refined-scripture",
  "today.saint":"ao-refined-saint-of-day",
});

for(const id of Object.values(AO_APP_SURFACE_ASSET_IDS)){
  assert.ok(getCanonicalAsset(id),"app surface uses a non-canonical asset: "+id);
  assert.ok(!AO_REMOVED_ASSET_IDS.includes(id),"app surface revived a removed asset: "+id);
}
for(const id of Object.values(AO_LEARN_ROUTE_ASSET_IDS)){
  assert.ok(getCanonicalAsset(id),"Learn route uses a non-canonical asset: "+id);
  assert.ok(!AO_REMOVED_ASSET_IDS.includes(id),"Learn route revived a removed asset: "+id);
}

assert.equal(canonicalAssetIdForSurface("settings"),"ao-nav-settings");
assert.equal(canonicalAssetIdForLearnRoute("learn.mass"),"ao-rich-guides");
assert.equal(canonicalAssetIdForLearnRoute("unknown"),null);

const appEntry=readFileSync("src/app/browser-entry.js","utf8");
const home=readFileSync("src/home/presentation.js","utf8");
const calendar=readFileSync("src/calendar/browser-entry.js","utf8");
const learn=readFileSync("src/learn/presentation.js","utf8");
const learnOwner=readFileSync("src/learn/browser-entry.js","utf8");
const prayOwner=readFileSync("src/pray/browser-entry.js","utf8");
const settingsOwner=readFileSync("src/settings/browser-entry.js","utf8");
const settings=readFileSync("src/settings/presentation.js","utf8");

assert.match(appEntry,/canonicalAssetIdForSurface/);
assert.match(appEntry,/button\.dataset\.aoAssetId=assetId/);
assert.match(home,/ao-ui-previous/);
assert.match(home,/ao-ui-next/);
assert.match(home,/ao-ui-close/);
assert.match(calendar,/ao-ui-back/);
assert.match(calendar,/ao-ui-previous/);
assert.match(calendar,/ao-ui-next/);
assert.match(learn,/canonicalAssetIdForLearnRoute/);
assert.doesNotMatch(learn,/AO_ICON_REGISTRY_V4333/,"Learn still depends on the historical icon registry");
assert.match(learnOwner,/canonicalAssetIdForSurface\("learn"\)/);
assert.match(prayOwner,/canonicalAssetIdForSurface\("pray"\)/);
assert.match(settingsOwner,/canonicalAssetIdForSurface\("settings"\)/);
assert.match(settings,/ao-ui-back/);
assert.match(settings,/ao-ui-close/);
assert.match(settings,/ao-ui-next/);

console.log("PASS canonical non-Mass asset consumers: shell, Home, Pray, Learn, Calendar and Settings are bound to V4/V4.1.1 identities.");
