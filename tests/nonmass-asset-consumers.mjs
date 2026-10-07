import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { HOME_ENRICHER_ICON_ASSET_IDS } from "../src/home/enrichers.js";
import {
  AO_APP_SURFACE_ASSET_IDS,
  AO_LEARN_ROUTE_ASSET_IDS,
  AO_PRAY_ROUTE_ASSET_IDS,
  AO_REMOVED_ASSET_IDS,
  canonicalAssetIdForLearnRoute,
  canonicalAssetIdForPrayRoute,
  canonicalAssetIdForSurface,
  getCanonicalAsset,
  resolveCanonicalAssetUrl,
} from "../src/assets/asset-registry.js";

assert.deepEqual(AO_APP_SURFACE_ASSET_IDS,{
  home:"ao-nav-home",
  mass:"ao-brand-emblem",
  pray:"ao-nav-pray",
  learn:"ao-nav-learn",
  calendar:"ao-nav-calendar",
  find:"ao-ui-search",
  settings:"ao-nav-settings",
});
assert.deepEqual(AO_LEARN_ROUTE_ASSET_IDS,{
  "learn.catechism.daily":"ao-refined-study",
  "learn.latin":"ao-refined-study",
  "learn.mass":"ao-rich-guides",
  "learn.spiritual_life":"ao-refined-spiritual-life",
  "learn.catechism":"ao-module-catechism",
  "today.gospel":"ao-refined-scripture",
  "today.saint":"ao-refined-saint-of-day",
  "learn.rites.sick":"ao-refined-help",
  "learn.rites.baptism":"ao-rich-guides",
  "learn.rites.first_communion":"ao-rich-eucharistic-life",
  "learn.rites.confirmation":"ao-rich-guides",
  "learn.rites.holy_orders":"ao-rich-guides",
  "learn.rites.matrimony":"ao-rich-guides",
  "learn.serve_mass.responses":"ao-refined-study",
  "learn.scapular":"ao-rich-our-lady-marian-devotions",
  "learn.seasonal_rites":"ao-refined-calendar-upcoming",
});

const PRAY_HOME_ROUTE_ASSET_IDS=Object.freeze({
  "pray.angelus_regina":"ao-rich-angelus",
  "pray.rosary":"ao-rich-rosary",
  "pray.adoration":"ao-rich-adoration",
  "pray.benediction":"ao-rich-adoration",
  "pray.forty_hours":"ao-rich-adoration",
  "pray.confession":"ao-rich-confession",
  "pray.stations":"ao-rich-stations",
  "pray.penitential_psalms":"ao-refined-scripture",
  "pray.seven_words":"ao-rich-stations",
  "pray.litany_saints":"ao-refined-devotions",
  "programme.first_friday":"ao-rich-sacred-heart",
  "programme.first_saturday":"ao-rich-immaculate-heart",
  "pray.library":"ao-rich-prayer-library",
});
for(const [route,id] of Object.entries(PRAY_HOME_ROUTE_ASSET_IDS)){
  assert.equal(AO_PRAY_ROUTE_ASSET_IDS[route],id,"PRAY route asset mapping changed: "+route);
}
for(const [route,id] of Object.entries(AO_PRAY_ROUTE_ASSET_IDS)){
  assert.ok(getCanonicalAsset(id),"PRAY route uses a non-canonical asset: "+route+" -> "+id);
  assert.ok(!AO_REMOVED_ASSET_IDS.includes(id),"PRAY route revived a removed asset: "+route+" -> "+id);
}
assert.equal(canonicalAssetIdForPrayRoute("pray.novenas"),"ao-rich-novenas");
assert.equal(canonicalAssetIdForPrayRoute("pray.morning_evening"),"ao-rich-begin-end-day");
assert.equal(canonicalAssetIdForPrayRoute("unknown"),null);

for(const id of Object.values(AO_APP_SURFACE_ASSET_IDS)){
  assert.ok(getCanonicalAsset(id),"app surface uses a non-canonical asset: "+id);
  assert.ok(!AO_REMOVED_ASSET_IDS.includes(id),"app surface revived a removed asset: "+id);
}
for(const id of Object.values(AO_LEARN_ROUTE_ASSET_IDS)){
  assert.ok(getCanonicalAsset(id),"Learn route uses a non-canonical asset: "+id);
  assert.ok(!AO_REMOVED_ASSET_IDS.includes(id),"Learn route revived a removed asset: "+id);
}

const CONSUMED_DEVOTIONAL_MASK_ASSETS=Object.freeze([
  "ao-rich-adoration",
  "ao-rich-angelus",
  "ao-rich-confession",
  "ao-rich-rosary",
  "ao-rich-sacred-heart",
  "ao-rich-stations",
]);
for(const id of CONSUMED_DEVOTIONAL_MASK_ASSETS){
  const asset=getCanonicalAsset(id);
  assert.ok(asset,"consumed devotional asset is not canonical: "+id);
  assert.equal(asset.kind,"mask","consumed devotional asset changed renderer kind: "+id);
  assert.ok(asset.path,"consumed devotional mask has no canonical path: "+id);
  assert.ok(existsSync(asset.path),"consumed devotional mask is not physically externalized: "+id);
}

assert.equal(canonicalAssetIdForSurface("settings"),"ao-nav-settings");
assert.equal(canonicalAssetIdForSurface("find"),"ao-ui-search");
assert.equal(canonicalAssetIdForLearnRoute("learn.mass"),"ao-rich-guides");
assert.equal(canonicalAssetIdForLearnRoute("learn.spiritual_life"),"ao-refined-spiritual-life");
assert.equal(canonicalAssetIdForLearnRoute("unknown"),null);
assert.equal(canonicalAssetIdForPrayRoute("pray.rosary"),"ao-rich-rosary");

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
  const url=resolveCanonicalAssetUrl(id);
  return Boolean(url&&existsSync(fileURLToPath(url)));
};

for(const id of Object.values(AO_APP_SURFACE_ASSET_IDS)){
  assert.equal(physicalCanonical(id),true,"global ribbon canonical asset is not physically externalized: "+id);
}

const presentationConsumers=new Set([
  ...Object.values(AO_LEARN_ROUTE_ASSET_IDS),
  ...Object.values(PRAY_HOME_ROUTE_ASSET_IDS),
  ...Object.values(HOME_ENRICHER_ICON_ASSET_IDS),
  "ao-ui-back","ao-ui-close","ao-ui-next","ao-ui-previous","ao-ui-search","ao-ui-settings",
  "ao-live-blessing",
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
assert.match(home,/ao-ui-settings/,"Home utility Settings entry lost its canonical asset");
assert.doesNotMatch(home,/ao-ui-close/,"Home regained a modal-sheet Close control after those sheets were retired");
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
assert.match(prayPresentation,/canonicalAssetIdForPrayRoute/);
assert.match(prayPresentation,/data-ao-pray-module-asset/);
assert.match(prayPresentation,/data-ao-asset-renderer="embedded-symbol"/);
assert.doesNotMatch(prayPresentation,/AO_ICON_REGISTRY_V4333/,"PRAY regained the historical icon registry");
assert.match(settingsOwner,/canonicalAssetIdForSurface\("settings"\)/);
assert.match(settings,/ao-ui-back/);
assert.match(settings,/ao-ui-close/);
assert.match(settings,/ao-ui-next/);

console.log("PASS canonical non-Mass asset consumers: all current presentation consumers resolve to physical frozen assets or approved embedded canonical symbols; "+CONSUMED_DEVOTIONAL_MASK_ASSETS.length+" consumed devotional masks are physically externalized.");
