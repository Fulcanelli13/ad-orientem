import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SETTINGS_PRESENTATION_VERSION, buildSettingsViewModel, canonicalSettingsAppVersion, renderSettingsToString, settingsCss } from "../src/settings/presentation.js";
import { OWNER, VERSION } from "../src/settings/browser-entry.js";
import { DEFAULT_PREFERENCES } from "../src/settings/donor-state.js";

const prefs=JSON.parse(JSON.stringify(DEFAULT_PREFERENCES));
const fakeWin={
  AO_SETTINGS_DONOR_V4359:{snapshot:()=>({version:"43.59.6",preferences:prefs,profiles:[]})},
  document:{documentElement:{dataset:{aoRelease:"43.59.99"}}},
};
assert.equal(OWNER,"AO_SETTINGS_APP_V1");
assert.equal(VERSION,"modular-settings-v4359.6");
assert.equal(SETTINGS_PRESENTATION_VERSION,"modular-settings-presentation-v4359.6");
assert.equal(canonicalSettingsAppVersion(fakeWin),"43.59.99");

const vm=buildSettingsViewModel(fakeWin);
assert.equal(vm.language,"en");
assert.equal(vm.preferences.mass.defaultExperience,"simple");
assert.equal(vm.preferences.prayer.stations.mode,"guided");

const landing=renderSettingsToString(fakeWin,{route:"/settings"});
for(const route of ["/settings/general","/settings/accessibility","/settings/language-reading","/settings/mass","/settings/local-customs","/settings/prayer","/settings/privacy-data","/settings/about-sources"]){
  assert.ok(landing.includes('data-settings-route="'+route+'"'),route+" missing from donor Settings landing");
}
assert.match(landing,/Display &amp; Accessibility/);
assert.match(landing,/Local Church &amp; Customs/);
assert.match(landing,/Privacy &amp; Data/);
assert.equal((landing.match(/data-settings-close/g)||[]).length,1);
assert.doesNotMatch(landing,/43\.59\.99/,"version must appear in About only");

const general=renderSettingsToString(fakeWin,{route:"/settings/general"});
assert.doesNotMatch(general,/data-pref-path="general\.uiLanguage"/,"General regained duplicate app-language ownership");
const languageReading=renderSettingsToString(fakeWin,{route:"/settings/language-reading"});
assert.match(languageReading,/data-pref-path="general\.uiLanguage"/,"Language & Text lost sole app-language ownership");


const css=settingsCss();
assert.match(css,/z-index:var\(--ao-z-modal,2147483200\)/,"Settings must consume the shared modal elevation token");
assert.match(css,/inset:0 0 calc\(var\(--ao-global-ribbon-h,68px\) \+ var\(--safe-bottom,0px\)\) 0/,"Settings must reserve the global ribbon footprint");
assert.match(css,/data-ao-settings-surface="open"\] #ao-global-ribbon\{z-index:var\(--ao-z-global-nav,2147483300\)!important/,"Settings must consume the shared global-nav elevation token");
assert.doesNotMatch(css,/z-index:2147483(?:250|400)/,"Settings must not invent a raw overlay z-index");
assert.match(css,/min-height:var\(--ao-control-h,44px\)/,"Settings compact controls must converge on the canonical touch target");
assert.match(css,/\.aoSetRowText b\{[^}]*var\(--ao-font-ui/,"Settings utility rows regressed to decorative display typography");

const mass=renderSettingsToString(fakeWin,{route:"/settings/mass",live:true});
assert.match(mass,/data-pref-path="mass\.defaultExperience"/);
assert.match(mass,/data-pref-path="mass\.defaultForm"/);
assert.match(mass,/Future sessions only/);
assert.match(mass,/will not change a Mass already in progress/);

const prayer=renderSettingsToString(fakeWin,{route:"/settings/prayer"});
for(const marker of ["prayer.recitationMode","prayer.rosary.fatimaPrayer","prayer.rosary.scriptureCues","prayer.rosary.commentary","prayer.stations.mode","prayer.stations.stabatMater","prayer.angelus.seasonalForm"]){
  assert.ok(prayer.includes(marker),marker+" missing from Prayer & Devotions");
}
const privacy=renderSettingsToString(fakeWin,{route:"/settings/privacy-data",live:true});
assert.match(privacy,/data-data-action="clear-mass" disabled/);
assert.match(privacy,/not stored as a persistent list of sins/);

const about=renderSettingsToString(fakeWin,{route:"/settings/about-sources"});
assert.match(about,/1962 Roman Mass/);
assert.match(about,/Scripture editions/);
assert.match(about,/Artwork sources &amp; rights/);
assert.match(about,/How source labels work/,"About lost collapsed source-methodology disclosure");
assert.match(about,/Official \/ governing source/,"About lost provenance vocabulary");
assert.doesNotMatch(about,/>PROVENANCE</,"Provenance taxonomy returned as a standalone Settings section");
assert.match(about,/43\.59\.99/);
assert.equal((about.match(/data-settings-info\\b/g)||[]).length,7,
  "Seven informational About rows must be static text, not dead buttons");
assert.equal((about.match(/<button type="button" class="aoSetRow"/g)||[]).length,1,
  "Only the actionable Privacy route should remain a button in About");
assert.match(about,/data-settings-route="\/settings\/privacy-data"/,
  "About must link to the real privacy controls");

const stateSource=readFileSync("src/settings/donor-state.js","utf8");
for(const key of ["ao2:preferences:v1","ao2:local-profiles:v1","defaultExperience","preparationDepth","thanksgivingDepth","postureGuidance","secondConfiteorParticipation"]){
  assert.ok(stateSource.includes(key),key+" missing from recovered v43.59.6 state model");
}
const owner=readFileSync("src/settings/browser-entry.js","utf8");
assert.match(owner,/createSettingsDonorState/);
assert.match(owner,/AO_SETTINGS_DONOR_V4359/);
assert.match(owner,/\/settings\/local-customs/);
assert.match(owner,/dataAction/);
assert.match(owner,/AO_APP_LIVE_SESSION_GUARDS_V1/);
assert.match(owner,/\[data-v37-module='utility\.settings'\]/);

const host=readFileSync("src/app/host-adapter.js","utf8");
assert.match(host,/AO_SETTINGS_APP_V1/);
assert.doesNotMatch(host,/AO_SETTINGS_V4359|AO_SETTINGS_V4358|AO_SETTINGS_V4356/);
console.log("PASS v43.59.6 modular Settings donor contract");
