import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  contemplativeDailyMode,
  CONTEMPLATIVE_DAILY_PREVIEW_CSS,
  CONTEMPLATIVE_DAILY_PREVIEW_FLAG,
  CONTEMPLATIVE_DAILY_CLASSIC_FALLBACK_FLAG,
  contemplativeDailyEnabled
} from "../src/pray/contemplative-daily-preview.js";

const mount = (route,kind,view="traditional-pray",hasDaypart=true) => ({
  dataset:{
    aoTraditionalPrayRoute:route,
    aoTraditionalDualAxis:kind,
    aoPrayView:view
  },
  querySelector: selector => selector===".aoTP381DaypartStrip"&&hasDaypart ? {} : null
});

assert.equal(CONTEMPLATIVE_DAILY_PREVIEW_FLAG,"aoPrayReader=contemplative");
assert.equal(CONTEMPLATIVE_DAILY_CLASSIC_FALLBACK_FLAG,"aoPrayReader=classic");
assert.equal(contemplativeDailyEnabled(""),true);
assert.equal(contemplativeDailyEnabled("?aoPrayReader=classic"),false);
assert.equal(contemplativeDailyEnabled("?aoPrayReader=regular"),false);
assert.equal(contemplativeDailyEnabled("?aoPrayReader=contemplative"),true);
assert.equal(contemplativeDailyMode("",mount("pray.morning_evening","daily")),"guided","Default must be Design B");
assert.equal(contemplativeDailyMode("?aoPrayReader=classic",mount("pray.morning_evening","daily")),null,"Classic rollback must remain available");
assert.equal(contemplativeDailyMode("?aoPrayReader=regular",mount("pray.morning_evening","daily")),null);
assert.equal(contemplativeDailyMode("?aoPrayReader=contemplative",mount("pray.morning_evening","daily")),"guided");
assert.equal(contemplativeDailyMode("?aoPrayReader=contemplative",mount("pray.morning_evening",undefined)),"list");
assert.equal(contemplativeDailyMode("?aoPrayReader=contemplative",mount("pray.rosary","daily")),null);
assert.equal(contemplativeDailyMode("?aoPrayReader=contemplative",mount("mass.prepare","daily")),null);
assert.equal(contemplativeDailyMode("?aoPrayReader=contemplative",mount("pray.morning_evening","daily","home")),null);
assert.equal(contemplativeDailyMode("?aoPrayReader=contemplative",mount("pray.morning_evening","daily","traditional-pray",false)),null);
assert.equal(contemplativeDailyMode("?aoPrayReader=contemplative",null),null);

const entry=readFileSync(new URL("../src/pray/browser-entry.js",import.meta.url),"utf8");
const prays=readFileSync(new URL("../src/pray/traditional-pray-data.js",import.meta.url),"utf8");
assert.match(entry,/await import\("\.\/contemplative-daily-preview\.js"\)/,"preview must lazy-load under Prayer");
assert.match(entry,/contemplative\.installContemplativeDailyPreview\(win\)/,"Contemplative presentation must load by default after entering Prayer");
assert.match(prays,/MORNING_PRAYER_SEQUENCE_V381=Object\.freeze/);
assert.match(prays,/EVENING_PRAYER_SEQUENCE_V381=Object\.freeze/);
assert.match(CONTEMPLATIVE_DAILY_PREVIEW_CSS,/prefers-reduced-motion:reduce/);
assert.match(CONTEMPLATIVE_DAILY_PREVIEW_CSS,/focus-visible/);
assert.match(CONTEMPLATIVE_DAILY_PREVIEW_CSS,/aoDevoSequenceTimeline/);
assert.match(CONTEMPLATIVE_DAILY_PREVIEW_CSS,/@property --ao-contemplative-top/,"Typed sky palette must animate between cards");
assert.match(CONTEMPLATIVE_DAILY_PREVIEW_CSS,/var\(--ao-contemplative-mid/,"Reader background must use the source-owned sky, not a static dark gradient");
assert.match(CONTEMPLATIVE_DAILY_PREVIEW_CSS,/\.aoQuietHorizon\{position:relative!important/,"Cinematic reader must not hide the original rising/setting horizon");
assert.doesNotMatch(CONTEMPLATIVE_DAILY_PREVIEW_CSS,/\.aoQuietHorizon\{position:absolute!important;width:1px/,"No visually hidden horizon");
assert.doesNotMatch(CONTEMPLATIVE_DAILY_PREVIEW_CSS,/\.homeScreen|\.ao-reader-shell|#ao-calendar-modular-root/,"must not restyle Home, Mass or Calendar");
console.log("Contemplative Morning/Evening default and classic fallback: contract checks passed");
