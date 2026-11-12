import assert from "node:assert/strict";
import {test} from "node:test";
import {PRAYER_CHURCH_CINEMA_VERSION,PRAYER_CINEMA_POSES,mountPrayerChurchCinema}
 from "../src/pray/prayer-church-cinema.v1.js";
test("the animated architecture comes from one donor engine, not a painted placeholder",()=>{
 assert.equal(PRAYER_CHURCH_CINEMA_VERSION,"prayer-church-cinema-donor-v1");
 for(const phase of ["prepare","examine","approach","after"]){
  const c=PRAYER_CINEMA_POSES.confession[phase];
  assert.equal(c.T.length,3);assert.ok(c.dist>0);assert.ok(c.P>400);
 }
 assert.notDeepEqual(PRAYER_CINEMA_POSES.confession.prepare,PRAYER_CINEMA_POSES.confession.approach,
   "Camera moves between source-owned Confession stages");
 assert.notDeepEqual(PRAYER_CINEMA_POSES.tenebrae.office,PRAYER_CINEMA_POSES.tenebrae.candles,
   "Only the optional observed candle ceremony moves toward the hearse");
 assert.equal(mountPrayerChurchCinema({visual:null}),null);
});
