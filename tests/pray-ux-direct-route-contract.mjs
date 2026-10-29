import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {INTERNAL_PRAYER_VIEWS,supportedDirectPrayerRoute} from "../src/pray/internal-route-owner.js";

/* Cheap CI guard against entries advertised by the canonical route registry
 * but missing in the actual presentation-runtime open(id) dispatcher.
 * Browser acceptance separately verifies that every view actually renders. */
const source=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const start=source.indexOf("function open(id,opts={})");
const end=source.indexOf("\nfunction close(",start);
assert.ok(start>=0&&end>start,"Review dispatcher extraction after changing the Prayer shell");
const dispatcher=source.slice(start,end);
const routes=Object.keys(INTERNAL_PRAYER_VIEWS);
assert.equal(routes.length,27);
for(const route of routes){
 const literal="id==='"+route+"'";
 assert.ok(dispatcher.includes(literal),route+" is declared as supported but the direct-open dispatcher omits it");
 assert.ok(supportedDirectPrayerRoute(route),route+" must stay a supported internal route");
}
assert.ok(dispatcher.includes("id==='pray.rosary'"),"Holy Rosary delegation must remain explicit");
assert.equal(supportedDirectPrayerRoute("pray.rosary"),true);
assert.equal(supportedDirectPrayerRoute("pray.unknown"),false);
for(const view of new Set(Object.values(INTERNAL_PRAYER_VIEWS))){
 assert.ok(source.includes("view==='"+view+"'")||view==="prayerOnly",
  "Advertised route targets a missing canonical reader: "+view);
}
console.log("PASS Prayer direct-entry contract: 27 registered internal IDs all handled by open(id); Rosary delegated; unknown route fails closed.");
