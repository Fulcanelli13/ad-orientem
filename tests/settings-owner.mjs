import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SETTINGS_PRESENTATION_VERSION, buildSettingsViewModel, canonicalSettingsAppVersion, renderSettingsToString, settingsCss } from "../src/settings/presentation.js";
import { OWNER, VERSION } from "../src/settings/browser-entry.js";
import { DEFAULT_PREFERENCES } from "../src/settings/donor-state.js";

const prefs=JSON.parse(JSON.stringify(DEFAULT_PREFERENCES));
const fakeWin={
  AO_SETTINGS_DONOR_V4359:{snapshot:()=>({version:"43.59.6",preferences:prefs,profiles:[]})},
  document:{documentElement:{dataset:{aoRelease:"43.59.99"}}},
  location:{hostname:"fulcanelli13.github.io"},
  AO_OFFLINE_APP_V1:{status:{supported:true,registered:true,ready:true,
    version:"abcde0123456f789",pendingVersion:"fedcb98765432100"}},
};
assert.equal(OWNER,"AO_SETTINGS_APP_V1");
assert.equal(VERSION,"modular-settings-v4359.6");
assert.equal(SETTINGS_PRESENTATION_VERSION,"modular-settings-presentation-v4359.6");
assert.equal(canonicalSettingsAppVersion(fakeWin),"43.59.99");

const vm=buildSettingsViewModel(fakeWin);
assert.equal(vm.language,"en");
assert.equal(vm.hostKind,"github_pages");
assert.equal(vm.canonicalHost,true);
assert.equal(vm.appAddress,"https://fulcanelli13.github.io/ad-orientem/");
assert.equal(vm.standalone,false);
assert.equal(vm.preferences.mass.defaultExperience,"simple");
assert.equal(vm.preferences.prayer.stations.mode,"guided");

const landing=renderSettingsToString(fakeWin,{route:"/settings"});
for(const route of ["/settings/general","/settings/accessibility","/settings/language-reading","/settings/mass","/settings/local-customs","/settings/prayer","/settings/privacy-data","/settings/about-sources"]){
  assert.ok(landing.includes('data-settings-route="'+route+'"'),route+" missing from donor Settings landing");
}
assert.match(landing,/Display &amp; Accessibility/);
assert.match(landing,/Local Church &amp; Customs/);
assert.match(landing,/Privacy &amp; Data/);
assert.match(landing,/APP &amp; UPDATES/);
assert.match(landing,/Installed app &amp; sources/);
assert.equal((landing.match(/data-settings-route="\/settings\/about-sources"/g)||[]).length,1,
  "Exactly one Settings entry to update and source diagnostics");
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

const display=renderSettingsToString(fakeWin,{route:"/settings/accessibility"});
assert.match(display,/data-pref-path="appearance\.mode"/,"Missing Settings-owned Auto\/Dark\/Light control");
assert.equal(prefs.appearance.mode,"dark","Existing installs retain a dark default until the user chooses otherwise");
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
assert.equal((about.match(/data-settings-info\b/g)||[]).length,10,
  "Installed site, launch mode, release and sources are static text, not dead buttons");
assert.equal((about.match(/<button type="button" class="aoSetRow"/g)||[]).length,3,
  "Only Privacy and explicit check/apply actions should be actionable");
assert.match(about,/data-settings-apply-update(?!" disabled)/);
const activeMassAbout=renderSettingsToString(fakeWin,{route:"/settings/about-sources",live:true});
assert.match(activeMassAbout,/data-settings-apply-update disabled/,
  "A staged PWA must not be installable while Mass is live");
assert.match(activeMassAbout,/Finish Mass before installing/);
const noCandidate={...fakeWin,AO_OFFLINE_APP_V1:{status:{
  supported:true,registered:true,ready:true,version:"abcde0123456f789",pendingVersion:null}}};
assert.doesNotMatch(renderSettingsToString(noCandidate,{route:"/settings/about-sources"}),
  /data-settings-apply-update/,"An unstaged update must not have an Install control");
assert.match(about,/data-settings-check-update/);
assert.match(about,/abcde0123456/);
assert.match(about,/New copy staged/);
assert.match(about,/data-settings-active-site="github_pages"/);
assert.match(about,/GitHub Pages/);
assert.match(about,/Release label/);
assert.match(about,/Launched from Home Screen|Opened in browser/);
assert.doesNotMatch(about,/data-settings-canonical-site/,
  "An already-canonical installation must not suggest migrating across origins");
const unsupported={...fakeWin,AO_OFFLINE_APP_V1:{status:{supported:false,registered:false,ready:false}}};
const unsupportedAbout=renderSettingsToString(unsupported,{route:"/settings/about-sources"});
assert.match(unsupportedAbout,/data-settings-check-update disabled/);
assert.doesNotMatch(unsupportedAbout,/data-settings-apply-update/);
assert.match(unsupportedAbout,/Offline version tracking unavailable here/);
assert.doesNotMatch(unsupportedAbout,/data-settings-snapshot-id/);
const previewWin={...fakeWin,
 location:{hostname:"ad-orientem.vercel.app",pathname:"/",origin:"https://ad-orientem.vercel.app"},
 AO_OFFLINE_APP_V1:{status:{supported:false,registered:false,ready:false}}};
const preview=renderSettingsToString(previewWin,{route:"/settings/about-sources"});
assert.match(preview,/data-settings-active-site="vercel"/);
assert.match(preview,/https:\/\/ad-orientem\.vercel\.app\//);
assert.match(preview,/Vercel · separate network site/);
assert.match(preview,/different sites|two sites|two sites do not share|two sites do not share offline snapshots/);
assert.doesNotMatch(preview,/data-settings-check-update|data-settings-apply-update/,
  "Network-only Vercel must not offer the GitHub Pages snapshot updater");
assert.match(preview,/data-settings-canonical-site/);
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
