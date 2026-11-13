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
console.log("Explore app-design bridge: source-owned, scoped, and import-wired.");
