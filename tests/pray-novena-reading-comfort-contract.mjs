import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";
const css=readFileSync(new URL("../src/pray/novena-styles.js",import.meta.url),"utf8");
const runtime=readFileSync(new URL("../src/pray/novena-runtime.js",import.meta.url),"utf8");
const adapter=readFileSync(new URL("../src/pray/devotional-sequence-adapter.js",import.meta.url),"utf8");
assert.equal(NOVENA_CORPUS_V4_IDS.length,16,"Novena canon must not change");
assert.match(adapter,/kind==="novena"\?\(adjacent\?"\.80":"\.65"\)/,
 "Novena inactive paragraphs need a readable .65 minimum, with .80 for adjacent paragraphs");
assert.match(adapter,/\(adjacent\?"\.56":"\.30"\)/,
 "Preserve the existing contrast cadence for non-Novena devotional readers");
const comfort=css.slice(css.indexOf("/* B35: comfortable source provenance"));
assert.ok(comfort.length>400,"B35 overlay should remain distinct from the donor CSS");
assert.match(comfort,/#aoPray435930 \.aoN1Reader \.aoN1SourceText>small/);
assert.match(comfort,/font-size:12px;line-height:1\.45/,"Source witness provenance cannot be tiny text");
assert.match(comfort,/#aoPray435930 \.aoN1Reader \.aoN1Details>summary/);
assert.match(comfort,/font-size:14px;line-height:1\.45;min-height:48px/);
assert.match(comfort,/#aoPray435930 \.aoN1Reader \.aoN1Nav\{/);
assert.match(comfort,/position:sticky;bottom:0;z-index:12/);
assert.match(comfort,/min-height:48px/);
assert.match(comfort,/env\(safe-area-inset-bottom\)/);
assert.match(css,/\.aoN1Reader \.aoN1SourceText \.aoN1PrayerParagraph\{[^\n]*clamp\(18px,4\.5vw,22px\)\/1\.66/,"Do not reduce primary source prayer text");
assert.match(runtime,/\<details class="aoN1Details aoN1SourceDetails"/,"Edition notes must remain discoverable");
assert.doesNotMatch(runtime,/\<details class="aoN1Details aoN1SourceDetails" open/,"Do not open dense source metadata by default");
console.log("PASS Prayer B35: source labels >=12px, closed edition disclosures >=14px, 48px+ sticky phone dock; unchanged 18px prayer body.");
