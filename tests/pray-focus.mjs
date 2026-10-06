import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const runtime=readFileSync("src/pray/focus-runtime.js","utf8");
const styles=readFileSync("src/pray/focus-styles.js","utf8");
const browser=readFileSync("src/pray/browser-entry.js","utf8");

assert.match(runtime,/const ratio=phone\(\)\?\.40:\.42/,"40\/42 percent focus line changed");
assert.match(runtime,/\(a\.bottom\+b\.top\)\/2/,"midpoint handoff disappeared");
assert.match(runtime,/const preZone=phone\(\)\?118:138/,"donor anticipation zone changed");
assert.match(runtime,/values\[idx\]=1-\.04\*p/,"current-card anticipation energy changed");
assert.match(runtime,/values\[idx\+1\]=\.76\+\.17\*p/,"next-card anticipation energy changed");
assert.match(runtime,/--ao346-focus-opacity/,"Angelus focus-energy channel missing");
assert.match(runtime,/--ao347-focus-opacity/,"Stations focus-energy channel missing");
assert.match(runtime,/aoP435930StationConsider/,"Stations donor phase structure missing");
assert.match(runtime,/aoP435930StationOrdinary/,"Stations ordinary-prayer phase missing");
assert.match(styles,/opacity \.045s linear/,"45ms donor opacity response changed");
assert.match(styles,/ao346-current/,"Angelus categorical focus styling missing");
assert.match(styles,/ao347-current/,"Stations categorical focus styling missing");
assert.match(browser,/import "\.\/focus-installer\.js";/,"PRAY browser owner no longer installs v3.4.10 focus");
console.log("PASS v3.4.10 non-Mass reading focus recovery");
