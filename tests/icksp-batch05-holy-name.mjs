import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {HOLY_NAME_LITANY_V381 as l} from "../src/pray/traditional-pray-data.js";
const runtime=readFileSync(new URL("../src/pray/traditional-pray-runtime.js",import.meta.url),"utf8");
const shape=[5,4,38,23,3,2,3];
for(const lang of ["la","en","fr"]){
 const parts=l[lang].trim().split(/\n\s*\n/);
 assert.equal(parts.length,7,"All seven source-owned sections: "+lang);
 assert.deepEqual(parts.map(p=>p.split("\n").filter(Boolean).length),shape,"Exact verse and collect structure: "+lang);
 assert.ok(parts[6].startsWith(lang==="la"?"Orémus.":lang==="fr"?"Prions.":"Let us pray."),"Collect not correctly closed");
}
assert.match(runtime,/data-ao-holy-name-music/);
assert.match(runtime,/Downside and Solesmes/);
assert.match(runtime,/data-tp381-golden-arrow/);
assert.match(runtime,/open\("pray.sacred_heart",\{trigger:b,prayer:"golden_arrow"\}\)/,"Holy Name crosslink must arrive at Golden Arrow rather than reset to Litany");
assert.doesNotMatch(l.la,/Flèche d’Or|Golden Arrow/,"Never insert the Golden Arrow as a litany invocation");
console.log("B05 Holy Name: seven parallel LA/EN/FR sections and response counts, chant source and related prayer separated PASS");
