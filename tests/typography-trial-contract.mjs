import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  TYPOGRAPHY_TRIAL_VERSION,
  TYPOGRAPHY_TRIAL_MODES,
  normalizeTypographyTrial,
  typographyTrialCss,
  installTypographyTrial,
} from "../src/app/typography-trial.js";

assert.equal(TYPOGRAPHY_TRIAL_VERSION,"sans-serif-typography-trial-v1");
assert.deepEqual(Object.keys(TYPOGRAPHY_TRIAL_MODES),["inter","source-sans-3"]);
assert.equal(normalizeTypographyTrial("inter"),"inter");
assert.equal(normalizeTypographyTrial("SOURCE-SANS-3"),"source-sans-3");
for(const disallowed of ["serif","comic-sans","",null,"baseline","../inter","inter;body{display:none}"])
  assert.equal(normalizeTypographyTrial(disallowed),null,"Unknown font trial mode must fail closed");
assert.equal(installTypographyTrial({document:{createElement(){}},location:{search:""}}),null,
  "No URL flag must leave the production typography unchanged");
const css=typographyTrialCss();
assert.match(css,/--font-display:var\(--ao-trial-family\)/);
assert.match(css,/--font-liturgical:var\(--ao-trial-family\)/);
assert.match(css,/--ao-font-body:var\(--ao-trial-family\)/);
assert.match(css,/#ao-r17-native-reader-preview/);
assert.match(css,/#aoPray435930/);
assert.match(css,/#ao-scripture-overlay/);
assert.match(css,/\.homeScreen/);
assert.match(css,/:not\(svg\)/,"Typeface comparison must not distort vector icons");
assert.doesNotMatch(css,/font-size\s*:/,"Typeface-only study must not change app typography scale");
assert.doesNotMatch(css,/line-height\s*:/,"Typeface-only study must not change line spacing");
const entry=readFileSync("src/app/browser-entry.js","utf8");
assert.match(entry,/installTypographyTrial\(globalThis\)/);
const guide=readFileSync("docs/TYPOGRAPHY-SANS-SERIF-TRIAL-2026-10-19.md","utf8");
assert.match(guide,/not a production typography change/i);
console.log("PASS typography trials: URL-gated only, four true app scopes, font-family-only styling");
