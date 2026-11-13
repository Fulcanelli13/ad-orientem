import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {EXPLORE_APP_DESIGN_STYLE} from "../src/find/explore-app-design-style.js";

// Visual donor is a reference, never a second Explore runtime or a parallel
// source of truth. This contract intentionally does not certify pixel fidelity.
const source=readFileSync("src/find/browser-entry.js","utf8");
assert.match(source,/import \{ EXPLORE_APP_DESIGN_STYLE \} from "\.\/explore-app-design-style\.js"/);
assert.match(source,/\+SACRED_ATLAS_PHOTO_FIRST_STYLE\+EXPLORE_APP_DESIGN_STYLE/);
for(const selector of [
  ".aoExploreSurface", ".aoHeritageCardTitle", ".aoAtlasPrimaryTabs",
  ".aoAtlasMassTabs", ".aoTlmProfilePanel", ".aoHeritagePreview",
  ".aoExplorePlaceSheet", ".aoTlmChurchProfile",
])assert.ok(EXPLORE_APP_DESIGN_STYLE.includes(selector),"Missing host selector: "+selector);
for(const forbidden of [
  /@font-face\b/i,/\.phone\s*\{/i,/\.tabbar\s*\{/i,
  /\bdata:image\b/i,/\bconst\s+AO\s*=/i,
  /\bnew\s+Date\s*\(/i,/object-fit\s*:\s*cover/i
])assert.doesNotMatch(EXPLORE_APP_DESIGN_STYLE,forbidden);
assert.match(EXPLORE_APP_DESIGN_STYLE,/var\(--ao-font-display/);
assert.match(EXPLORE_APP_DESIGN_STYLE,/var\(--ao-font-body/);
assert.match(EXPLORE_APP_DESIGN_STYLE,/:focus-visible/);
// QA2 covers actual production cards and detailed profiles, not only palette.
for(const selector of [
  ".aoTlmVenueCard", ".aoTlmVenueSchedule", ".aoHeritagePlaceThumb",
  ".aoExplorePlaceChapters", ".aoExploreStoryChapter",
  ".aoExploreStoryEvidence", ".aoTlmProfileWeeklySource",
  ".aoTlmProfileSchedule",
])assert.ok(EXPLORE_APP_DESIGN_STYLE.includes(selector),
  "Missing canonical card/profile selector: "+selector);
assert.match(EXPLORE_APP_DESIGN_STYLE,/object-fit:contain!important/);
assert.match(EXPLORE_APP_DESIGN_STYLE,/figcaption/);
assert.doesNotMatch(EXPLORE_APP_DESIGN_STYLE,/\bnextMass\s*\(/);
assert.doesNotMatch(EXPLORE_APP_DESIGN_STYLE,/\bconst\s+(?:VENUES|PLACES|TOWNS)\s*=/);


// The latest app-design donor has TWO atlas destinations, not a three-tab
// Discover/Sacred/Latin-Mass header or a parallel full-screen app shell.
const sacredSource=readFileSync("src/find/heritage-presentation.js","utf8");
const massSource=readFileSync("src/find/explore-presentation.js","utf8");
const sacredStart=sacredSource.indexOf('html+=\'<nav class="aoAtlasPrimaryTabs"');
const sacredEnd=sacredSource.indexOf("html+='</nav>';",sacredStart);
assert.ok(sacredStart>=0&&sacredEnd>sacredStart,"Sacred Atlas navigation missing");
const sacredTabs=sacredSource.slice(sacredStart,sacredEnd);
assert.equal((sacredTabs.match(/<button type="button"/g)||[]).length,2,
  "Sacred Atlas has more than two global tabs");
assert.match(sacredTabs,/data-find-filter-value="tlm"/);
assert.match(sacredTabs,/data-atlas-entry-tab="sacred"/);
assert.doesNotMatch(sacredTabs,/data-atlas-entry-tab="discover"/);
assert.match(sacredSource,/data-atlas-entry-tab="discover".*Discover overview/);
assert.equal((sacredSource.match(/data-atlas-entry-tab="sacred"/g)||[]).length,1,
  "The primary Sacred Atlas button must be the only Sacred Atlas target");
assert.equal((sacredSource.match(/data-atlas-entry-tab="discover"/g)||[]).length,1,
  "Discover must be reachable once, from Layers");
const massStart=massSource.indexOf('html+=\'<nav class="aoAtlasMassTabs"');
const massEnd=massSource.indexOf("+'</nav>';",massStart);
assert.ok(massStart>=0&&massEnd>massStart,"TLM Atlas navigation missing");
const massTabs=massSource.slice(massStart,massEnd);
assert.equal((massTabs.match(/<button type="button"/g)||[]).length,2,
  "TLM Atlas has more than two global tabs");
assert.match(massTabs,/data-atlas-mass-return="sacred"/);
assert.match(massTabs,/aria-current="page"/);
assert.doesNotMatch(massTabs,/data-atlas-mass-return="discover"/);
assert.match(EXPLORE_APP_DESIGN_STYLE,/QA3: Exactly two atlas collections/);

console.log("Explore app-design bridge: source-owned, styled, and two-atlas navigation wired.");
