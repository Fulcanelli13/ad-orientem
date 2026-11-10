import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 LIVE_HANDOFF_GEOMETRY_SCHEMA,LIVE_HANDOFF_ORIENTATION,
 LIVE_HANDOFF_SOURCE_POINTS,LIVE_HANDOFF_ALTAR_PLAN,
 LIVE_HANDOFF_SOLEMN_COMMUNION_POSITIONS,
 LIVE_HANDOFF_ASPERGES_ROUTE,LIVE_HANDOFF_INCENSATION_ROUTE,
 LIVE_HANDOFF_REFERENCE_TURNS,LIVE_HANDOFF_REFERENCE_CARD_COUNT,
 LIVE_HANDOFF_EXTERNAL_RITE_IDS,LIVE_HANDOFF_GEOMETRY_PUBLICATION,
 projectLiveHandoffPlanPosition,liveHandoffStationPoint
} from "../src/mass/reader-live-handoff-geometry.js";
assert.equal(LIVE_HANDOFF_GEOMETRY_SCHEMA,
 "ao-live-handoff-2026-11-10-sanctuary-final-v1");
assert.equal(LIVE_HANDOFF_ORIENTATION.altarDirection,"RIGHT");
assert.equal(LIVE_HANDOFF_ORIENTATION.gospelSide,"TOP");
assert.equal(LIVE_HANDOFF_ORIENTATION.noPlanLabels,true);
assert.equal(LIVE_HANDOFF_ORIENTATION.keepLeftAndRightGestureRails,true);
assert.equal(LIVE_HANDOFF_REFERENCE_CARD_COUNT,65);
assert.deepEqual(LIVE_HANDOFF_EXTERNAL_RITE_IDS,["P1","P2","Q1"]);
assert.equal(Object.keys(LIVE_HANDOFF_SOURCE_POINTS).length,13);
assert.deepEqual(LIVE_HANDOFF_SOURCE_POINTS.RAIL,[300,268],
 "Final prototype RAIL is 268, never draft 312");
assert.deepEqual(LIVE_HANDOFF_SOURCE_POINTS.PULPIT,[131,229],
 "Final prototype PULPIT is 131/229, never draft 80/250");
assert.deepEqual(LIVE_HANDOFF_SOURCE_POINTS.FOOT,[300,190]);
assert.deepEqual(LIVE_HANDOFF_SOURCE_POINTS.GOSPEL,[192,124]);
assert.deepEqual(LIVE_HANDOFF_SOURCE_POINTS.EPISTLE,[408,124]);
assert.deepEqual(LIVE_HANDOFF_SOLEMN_COMMUNION_POSITIONS.DEACON,[330,268,180]);
assert.deepEqual(LIVE_HANDOFF_SOLEMN_COMMUNION_POSITIONS.SUBDEACON,[270,268,180]);
assert.ok(LIVE_HANDOFF_SOURCE_POINTS.RAIL[1]<LIVE_HANDOFF_ALTAR_PLAN.sanctuaryRailY);
assert.ok(LIVE_HANDOFF_SOLEMN_COMMUNION_POSITIONS.DEACON[1]<
 LIVE_HANDOFF_ALTAR_PLAN.sanctuaryRailY);
assert.ok(LIVE_HANDOFF_SOLEMN_COMMUNION_POSITIONS.SUBDEACON[1]<
 LIVE_HANDOFF_ALTAR_PLAN.sanctuaryRailY);
assert.deepEqual([LIVE_HANDOFF_ALTAR_PLAN.lowCandles,LIVE_HANDOFF_ALTAR_PLAN.sungCandles,
 LIVE_HANDOFF_ALTAR_PLAN.solemnCandles],[2,6,6]);
assert.equal(LIVE_HANDOFF_ALTAR_PLAN.requiemTabernacleVeil,"VIOLET");
assert.equal(LIVE_HANDOFF_ALTAR_PLAN.naveCentreAisle,"UNOBSTRUCTED");
assert.equal(LIVE_HANDOFF_ASPERGES_ROUTE.length,10);
assert.equal(LIVE_HANDOFF_INCENSATION_ROUTE.length,7);
assert.deepEqual(LIVE_HANDOFF_ASPERGES_ROUTE[0],{station:"FOOT",rotation:0});
assert.deepEqual(LIVE_HANDOFF_ASPERGES_ROUTE.at(-1),{station:"FOOT",rotation:360});
assert.deepEqual(LIVE_HANDOFF_INCENSATION_ROUTE.at(-1),{station:"EPISTLE",rotation:90});
assert.deepEqual(Object.keys(LIVE_HANDOFF_REFERENCE_TURNS),
 ["10","20","26","55","56","60","61","63"]);
for(const r of [...LIVE_HANDOFF_ASPERGES_ROUTE,...LIVE_HANDOFF_INCENSATION_ROUTE,
 ...Object.values(LIVE_HANDOFF_REFERENCE_TURNS).flat()])
 assert.ok(liveHandoffStationPoint(r.station),
  "Route station missing from final geometry: "+r.station);
assert.equal(liveHandoffStationPoint("unknown"),null);
assert.equal(projectLiveHandoffPlanPosition([1]),null);
assert.equal(projectLiveHandoffPlanPosition([Number.NaN,10]),null);
assert.deepEqual(projectLiveHandoffPlanPosition([300,268]),{x:291.84,y:300});
const above=projectLiveHandoffPlanPosition(LIVE_HANDOFF_SOURCE_POINTS.GOSPEL);
const below=projectLiveHandoffPlanPosition(LIVE_HANDOFF_SOURCE_POINTS.EPISTLE);
assert.ok(above.y<below.y,"The Gospel (north) side must be above Epistle");
assert.ok(projectLiveHandoffPlanPosition(LIVE_HANDOFF_SOURCE_POINTS.CENTER).x>
 projectLiveHandoffPlanPosition(LIVE_HANDOFF_SOURCE_POINTS.AISLE).x,
 "East/altar must be on right of nave");
assert.equal(LIVE_HANDOFF_GEOMETRY_PUBLICATION.publicReaderChanged,false);
assert.equal(LIVE_HANDOFF_GEOMETRY_PUBLICATION.native65CardsRemainSoleAuthority,true);
assert.equal(LIVE_HANDOFF_GEOMETRY_PUBLICATION.solemnLayerIsDraft,true);
const code=readFileSync(new URL("../src/mass/reader-live-handoff-geometry.js",import.meta.url),"utf8");
assert.doesNotMatch(code,/import\s.*reader-(?:model|native-preview|schola)/,
 "Geometry must never allocate a second card model or Schola controller");
assert.doesNotMatch(code,/setTimeout|requestAnimationFrame|getUserMedia|Date\.now|localStorage/);
console.log("LIVE_HANDOFF_FINAL_GEOMETRY_PASS 13 final positions, two overridden coordinates, 10 Asperges and 7 incense route stops; no mounted second timeline");
