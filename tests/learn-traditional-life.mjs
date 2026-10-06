import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  LOW_MASS_RESPONSES_V381,
  SEASONAL_PRACTICES_V381,
  TRADITIONAL_LEARN_SOURCES_V381,
} from "../src/learn/traditional-life-data.js";
import { TRADITIONAL_LEARN_ROUTES } from "../src/learn/traditional-life.js";
import { LEARN_MODULE_IDS } from "../src/learn/presentation.js";

const expected=[
  "learn.rites.sick",
  "learn.rites.baptism",
  "learn.rites.matrimony",
  "learn.serve_mass.responses",
  "learn.scapular",
  "learn.seasonal_rites",
];

assert.deepEqual(Object.keys(TRADITIONAL_LEARN_ROUTES),expected,"v38.1 traditional Learn route identity/order changed");
assert.equal(LOW_MASS_RESPONSES_V381.length,15,"Low Mass response trainer no longer matches donor 15-card corpus");
assert.equal(LOW_MASS_RESPONSES_V381[0].lat,"℟. Ad Deum, qui lætíficat iuventútem meam.");
assert.equal(LOW_MASS_RESPONSES_V381.at(-1).lat,"℟. Deo grátias.");
assert.equal(SEASONAL_PRACTICES_V381.length,10,"seasonal lay-practice list changed");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.ritual1952,/alcuinus\.org/);
assert.ok(expected.every(id=>LEARN_MODULE_IDS.includes(id)),"recovered traditional routes are not visible in modular Learn");

const runtime=readFileSync("src/learn/traditional-life.js","utf8");
const browser=readFileSync("src/learn/browser-entry.js","utf8");
const presentation=readFileSync("src/learn/presentation.js","utf8");
const assets=readFileSync("src/assets/asset-registry.js","utf8");

assert.match(runtime,/priestCeremonialExposed:false/,"lay-only scope guard disappeared");
assert.match(runtime,/AO_TRADITIONAL_LEARN_V381/);
assert.match(runtime,/learn\.serve_mass.*learn\.serve_mass\.responses/s,"Low Mass alias disappeared");
assert.doesNotMatch(runtime,/AO_TRADITION_V38/,"historical Traditions monolith was restored as a runtime owner");
assert.match(browser,/ensureTraditionalLearnRegistry/);
assert.match(browser,/TRADITIONAL_LEARN_ROUTES\[id\]/);
assert.match(presentation,/Traditional Catholic life/);
assert.match(assets,/"learn\.rites\.sick"\s*:\s*"ao-refined-help"/);
assert.match(assets,/"learn\.rites\.baptism"\s*:\s*"ao-rich-guides"/);
assert.match(assets,/"learn\.rites\.matrimony"\s*:\s*"ao-rich-guides"/);
assert.match(assets,/"learn\.serve_mass\.responses"\s*:\s*"ao-refined-study"/);
assert.match(assets,/"learn\.scapular"\s*:\s*"ao-rich-our-lady-marian-devotions"/);
assert.match(assets,/"learn\.seasonal_rites"\s*:\s*"ao-refined-calendar-upcoming"/);

console.log("PASS modular v38.1 traditional Learn extraction");
