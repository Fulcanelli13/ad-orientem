import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { HOME_ENRICHER_ICON_ASSET_IDS } from "../src/home/enrichers.js";
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

for(const file of [
  "assets/active/navigation/ao-nav-home.png",
  "assets/active/navigation/ao-brand-emblem.png",
  "assets/active/navigation/ao-nav-pray.png",
  "assets/active/navigation/ao-nav-learn.png",
  "assets/active/navigation/ao-nav-calendar.png",
  "assets/active/navigation/ao-nav-settings.png",
]){
  assert.ok(existsSync(file),"canonical global-ribbon asset missing: "+file);
}

const productionHost=readFileSync("index.html","utf8");
const embeddedSymbol=id=>productionHost.includes(`id="${id}"`)||productionHost.includes(`id='${id}'`);
const physicalCanonical=id=>{
  const record=getCanonicalAsset(id);
  return Boolean(record?.path&&existsSync(record.path));
};

for(const id of Object.values(AO_APP_SURFACE_ASSET_IDS)){
  assert.equal(physicalCanonical(id),true,"global ribbon canonical asset is not physically externalized: "+id);
}

const presentationConsumers=new Set([
  ...Object.values(AO_LEARN_ROUTE_ASSET_IDS),
  ...Object.values(HOME_ENRICHER_ICON_ASSET_IDS),
  "ao-ui-back","ao-ui-close","ao-ui-next","ao-ui-previous","ao-ui-search",
]);
const unresolved=[...presentationConsumers].filter(id=>!physicalCanonical(id)&&!embeddedSymbol(id));
assert.deepEqual(unresolved,[],"current production presentation references unresolved canonical assets");

const appEntry=readFileSync("src/app/browser-entry.js","utf8");
const home=readFileSync("src/home/presentation.js","utf8");
const calendar=readFileSync("src/calendar/browser-entry.js","utf8");
const learn=readFileSync("src/learn/presentation.js","utf8");
const learnOwner=readFileSync("src/learn/browser-entry.js","utf8");
const prayOwner=readFileSync("src/pray/browser-entry.js","utf8");
const prayPresentation=readFileSync("src/pray/presentation-runtime.js","utf8");
const settingsOwner=readFileSync("src/settings/browser-entry.js","utf8");
const settings=readFileSync("src/settings/presentation.js","utf8");

assert.match(appEntry,/canonicalAssetIdForSurface/);
assert.match(appEntry,/resolveCanonicalAssetUrl/);
assert.match(appEntry,/aoCanonicalRibbonIcon/);
assert.match(appEntry,/data-ao-asset-renderer|aoAssetRenderer/);
assert.match(appEntry,/button\.dataset\.aoAssetId=assetId/);
assert.match(home,/ao-ui-previous/);
assert.match(home,/ao-ui-next/);
assert.match(home,/ao-ui-close/);
assert.match(calendar,/ao-ui-back/);
assert.match(calendar,/ao-ui-previous/);
assert.match(calendar,/ao-ui-next/);
assert.match(learn,/canonicalAssetIdForLearnRoute/);
assert.doesNotMatch(learn,/AO_ICON_REGISTRY_V4333/,"Learn still depends on the historical icon registry");
assert.match(learn,/asset\.kind==="mask"/,"Learn cannot render canonical file-backed mask assets");
assert.match(learn,/data-ao-asset-renderer="mask"/,"Learn file-backed assets lack renderer diagnostics");
assert.ok(existsSync("assets/active/modules/ao-module-catechism.png"),"canonical Traditional Catechism asset was not externalized");
assert.match(learnOwner,/canonicalAssetIdForSurface\("learn"\)/);
assert.match(prayOwner,/canonicalAssetIdForSurface\("pray"\)/);
assert.match(prayPresentation,/ao-ui-back/);
assert.match(prayPresentation,/ao-ui-close/);
assert.match(prayPresentation,/ao-ui-next/);
assert.match(prayPresentation,/ao-ui-search/);
assert.match(settingsOwner,/canonicalAssetIdForSurface\("settings"\)/);
assert.match(settings,/ao-ui-back/);
assert.match(settings,/ao-ui-close/);
assert.match(settings,/ao-ui-next/);

console.log("PASS canonical non-Mass asset consumers: all current presentation consumers resolve to physical frozen assets or approved embedded canonical symbols.");
