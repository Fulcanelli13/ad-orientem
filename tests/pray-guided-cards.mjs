import assert from "node:assert/strict";
import {DAILY_GUIDED_STEPS,NIGHTLY_EXAMEN_CARDS,guidedDailyCards,clampPrayerCardStep,guidedStepLabel} from "../src/pray/guided-daily-cards.js";
import {MORNING_PRAYER_SEQUENCE_V381,EVENING_PRAYER_SEQUENCE_V381} from "../src/pray/traditional-pray-data.js";
assert.deepEqual(guidedDailyCards("morning").map(x=>x.id),MORNING_PRAYER_SEQUENCE_V381.map(x=>x[0]));
assert.deepEqual(guidedDailyCards("evening").map(x=>x.id),EVENING_PRAYER_SEQUENCE_V381.map(x=>x[0]));
assert.equal(DAILY_GUIDED_STEPS.morning.length,11);
assert.equal(DAILY_GUIDED_STEPS.evening.length,13);
assert.equal(DAILY_GUIDED_STEPS.evening[8].kind,"examination");
assert.deepEqual(DAILY_GUIDED_STEPS.evening.filter(x=>x.kind==="examination").map(x=>x.id),["pray.nightly_examen"]);
assert.deepEqual(NIGHTLY_EXAMEN_CARDS.map(x=>x.id),["recollect","god","neighbour","self","resolve"]);
for(const p of NIGHTLY_EXAMEN_CARDS){
 assert.ok(p.titleEn.length>4 && p.titleFr.length>4 && p.bodyEn.length>60 && p.bodyFr.length>60);
 assert.ok(!/record your sin|score your sin/i.test(p.bodyEn));
}
assert.equal(clampPrayerCardStep(-17,11),0);
assert.equal(clampPrayerCardStep(987,11),11);
assert.equal(clampPrayerCardStep(7.8,11),7);
assert.equal(guidedStepLabel(0,11),"Step 1 of 11");
assert.equal(guidedStepLabel(12,13,"fr"),"Étape 13 sur 13");
assert.equal(guidedStepLabel(13,13),"Finished");
assert.throws(()=>guidedDailyCards("night"),/Unknown/);
assert.throws(()=>guidedStepLabel(14,13),/Invalid/);
console.log("Guided morning/evening 11/13 prayer cards and 5 nightly examen cards pass source/order contracts");
