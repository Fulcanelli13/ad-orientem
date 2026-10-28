import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {defaultExploreGlyphStack,FIND_MAP_RUNTIME} from "../src/find/map-runtime.js";

const stack=defaultExploreGlyphStack(FIND_MAP_RUNTIME.style);
assert.deepEqual(stack,["Noto Sans Regular"],
  "OpenFreeMap Dark needs its published font family, not implicit MapLibre Open Sans");
assert.equal(defaultExploreGlyphStack("https://tiles.openfreemap.org/styles/bright"),null,
  "Do not replace font ownership in another basemap");
assert.equal(defaultExploreGlyphStack(FIND_MAP_RUNTIME.style,"custom"),null,
  "Bible Atlas and explicit map styles remain their own typography owners");
const source=readFileSync("src/find/map-runtime.js","utf8");
assert.match(source,/const glyphStack=defaultExploreGlyphStack\(selectedStyle,styleOverride\)/);
assert.match(source,/layout:\{"text-field":\["get","point_count_abbreviated"\],"text-size":12,\s+\.\.\.\(glyphStack/);
assert.match(source,/"text-field":\["get","point_count_abbreviated"\],\s+\.\.\.\(glyphStack/);
assert.match(source,/layout:\{"text-field":\["get","name"\],"text-size":11,"text-max-width":12,\s+\.\.\.\(glyphStack/);
assert.match(source,/layout:\{"text-field":\["get","atlas_label"\],\s+\.\.\.\(glyphStack/);
assert.ok(!source.includes('["Open Sans Regular","Arial Unicode MS Regular"]'),
  "No hard-coded MapLibre default Open Sans stack permitted");
console.log("PASS Explore text symbol layers request OpenFreeMap-hosted Noto Sans; custom styles unchanged");
