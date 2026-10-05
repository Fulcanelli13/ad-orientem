import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  SETTINGS_PRESENTATION_VERSION,
  buildSettingsViewModel,
  canonicalSettingsAppVersion,
  renderSettingsToString,
} from "../src/settings/presentation.js";
import { OWNER, VERSION } from "../src/settings/browser-entry.js";

const settings={
  massForm:"sung",
  followMode:"vox",
  textMode:"oriented",
  participationMode:"quiet",
  faithfulCommunion:true,
  secondConfiteor:false,
  joinSecondConfiteor:false,
  sundayAsperges:true,
  reducedMotion:false,
  textScale:"normal",
  massPostureProfile:"FOLLOW_CONGREGATION",
  massGestureProfile:"GUIDED_1962",
  localPostures:{},
  localMassPostures:{},
};
const fakeWin={
  AO_RUNTIME_V8:{store:{getState:()=>({route:"home",language:"en",settings})}},
  AO_RELEASE_AUTHORITY_V4359:{version:"43.59.30"},
  AO_HAPTICS_V4319:{isEnabled:()=>true},
  document:{documentElement:{dataset:{aoRelease:"43.59.99"}}},
};

assert.equal(OWNER,"AO_SETTINGS_APP_V1");
assert.equal(VERSION,"modular-settings-v1");
assert.equal(SETTINGS_PRESENTATION_VERSION,"modular-settings-presentation-v1");
assert.equal(canonicalSettingsAppVersion(fakeWin),"43.59.30","Settings About stopped using canonical release authority");

const vm=buildSettingsViewModel(fakeWin);
assert.equal(vm.language,"en");
assert.equal(vm.settings.massForm,"sung");
assert.equal(vm.settings.massPostureProfile,"FOLLOW_CONGREGATION");
assert.equal(vm.settings.massGestureProfile,"GUIDED_1962");
assert.equal(vm.haptics,true);

const html=renderSettingsToString(fakeWin);
for(const marker of [
  'data-setting-language="en"',
  'data-setting-form="sung"',
  'data-setting-follow="vox"',
  'data-setting-follow="simple"',
  'data-setting-follow="missal"',
  'data-setting-text="oriented"',
  'data-setting-participation="quiet"',
  'data-setting-posture-profile="FOLLOW_CONGREGATION"',
  'data-setting-posture-profile="TRADITIONAL_WALSH"',
  'data-setting-gesture-profile="ESSENTIAL"',
  'data-setting-gesture-profile="GUIDED_1962"',
  'data-setting-faithful-communion',
  'data-setting-second-confiteor',
  'data-setting-join-confiteor',
  'data-sunday-asperges',
  'data-setting-scale="normal"',
  'data-setting-motion',
  'data-setting-haptics',
  'data-reset-postures',
  'data-settings-sources',
]){
  assert.ok(html.includes(marker),marker+" missing from modular Settings");
}
assert.match(html,/data-setting-structural="true"/,"structural Settings controls are not exposed to the canonical live-session guard");

const liveHtml=renderSettingsToString(fakeWin,{live:true});
assert.match(liveHtml,/Structural Mass settings are locked while the current Mass is in progress/);
assert.match(liveHtml,/data-setting-haptics="0"[^>]*disabled/,"live Settings did not lock haptics");

const sources=renderSettingsToString(fakeWin,{route:"about-sources"});
assert.match(sources,/Liturgical books &amp; 1962 basis/);
assert.match(sources,/Prayer &amp; devotional methods/);
assert.match(sources,/How provenance is labelled/);
assert.match(sources,/Application version/);
assert.match(sources,/43\.59\.30/);
assert.match(sources,/Sins are not recorded/);

const frWin={
  ...fakeWin,
  AO_RUNTIME_V8:{store:{getState:()=>({route:"home",language:"fr",settings:{...settings,language:"fr"}})}},
};
const fr=renderSettingsToString(frWin,{route:"about-sources"});
assert.match(fr,/Sources et à propos/);
assert.match(fr,/Livres liturgiques et base 1962/);
assert.match(fr,/Version de l’application/);

const host=readFileSync("src/app/host-adapter.js","utf8");
assert.match(host,/AO_SETTINGS_APP_V1/);
assert.doesNotMatch(host,/AO_SETTINGS_V4359|AO_SETTINGS_V4358|AO_SETTINGS_V4356/,"normal host adapter still probes historical Settings owners");
assert.doesNotMatch(host,/openModule\("utility\.settings"\)/,"normal host adapter still falls back to utility.settings");

const home=readFileSync("src/home/presentation.js","utf8");
assert.doesNotMatch(home,/function homeSettings\(/,"Home still owns a second Settings presentation");
assert.doesNotMatch(home,/data-ao-home-settings/);
assert.doesNotMatch(home,/data-home-open-settings/);
assert.match(home,/data-ao-settings-open/);

const owner=readFileSync("src/settings/browser-entry.js","utf8");
for(const api of ["open","close","dismiss","restoreHome","status"]){
  assert.ok(owner.includes(api),"Settings owner missing "+api+" API");
}
assert.match(owner,/AO_APP_LIVE_SESSION_GUARDS_V1/,"Settings created or used a live rule outside the modular guard");
assert.match(owner,/hydrate-settings/,"Settings is not attached to canonical app preference persistence");
assert.match(owner,/watchReleaseMetadata/,"Settings does not observe canonical release metadata");
assert.match(owner,/data-ao-release/,"Settings does not repaint when canonical release metadata settles");
assert.match(owner,/queueMicrotask/,"Sources/About does not schedule a post-route canonical-version repaint");
assert.match(owner,/\[data-v37-module='utility\.settings'\]/,"modular owner does not suppress stale utility.settings surfaces");

const nonMass=readFileSync("src/app/nonmass-convergence.js","utf8");
assert.doesNotMatch(nonMass,/d6:\s*"integrated-on-settings"/,"D6 still claims a donor-backed Settings owner");
assert.doesNotMatch(nonMass,/integrated-on-settings-compatibility/,"D6 still exposes a historical Settings compatibility fallback");
assert.match(nonMass,/settings-modular-owner-unavailable/,"D6 does not fail closed when the modular Settings owner is unavailable");

console.log("PASS modular Settings owner/presentation contract");
