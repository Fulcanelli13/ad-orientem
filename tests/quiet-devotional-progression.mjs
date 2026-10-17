import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dailyHorizonState,monthlyDevotionalRegister} from "../src/pray/quiet-devotional-progression.js";
import {MORNING_PRAYER_SEQUENCE_V381,EVENING_PRAYER_SEQUENCE_V381} from "../src/pray/traditional-pray-data.js";

assert.equal(MORNING_PRAYER_SEQUENCE_V381.length,11);
assert.equal(EVENING_PRAYER_SEQUENCE_V381.length,13);
const morning=[...Array(12)].map((_,i)=>dailyHorizonState("morning",i,11));
const evening=[...Array(14)].map((_,i)=>dailyHorizonState("evening",i,13));
assert.equal(morning[0].phase,0);
assert.equal(morning[11].phase,4);
assert.equal(evening[0].phase,0);
assert.equal(evening[13].phase,4);
assert.ok(morning.every((x,i)=>i===0||x.phase>=morning[i-1].phase));
assert.ok(evening.every((x,i)=>i===0||x.phase>=evening[i-1].phase));
assert.equal(morning[2].phase,0,"Atmosphere should not jump for every individual prayer");
assert.equal(morning[5].en,"Dawn");
assert.equal(evening[6].en,"Blue hour");
assert.ok(evening[13].low!==morning[11].low);
assert.throws(()=>dailyHorizonState("stations",0,14),RangeError);
const three=monthlyDevotionalRegister([
 {date:"2026-01-02",complete:true},
 {date:"2026-02-06",complete:true},
 {date:"2026-03-06",complete:true}
],{needed:9,selectedDate:"2026-04-03"});
assert.equal(three.streak,3);
assert.deepEqual(three.cells.slice(0,4).map(x=>[x.key,x.status]),[
 ["2026-01","recorded"],["2026-02","recorded"],
 ["2026-03","recorded"],["2026-04","unrecorded"]
]);
assert.equal(three.cells.length,9);
const incomplete=monthlyDevotionalRegister([
 {date:"2026-01-03",complete:true},
 {date:"2026-02-07",complete:true},
 {date:"2026-03-07",complete:false}
],{needed:5,selectedDate:"2026-03-07"});
assert.equal(incomplete.streak,0,"Latest explicitly incomplete month interrupts the chain");
assert.equal(incomplete.interrupted,true);
assert.equal(incomplete.cells[0].status,"incomplete");
const resuming=monthlyDevotionalRegister([
 {date:"2026-10-02",complete:true},
 {date:"2026-11-06",complete:false},
 {date:"2026-12-04",complete:true},
 {date:"2027-01-01",complete:true}
],{needed:5,selectedDate:"2027-01-01"});
assert.equal(resuming.streak,2);
assert.deepEqual(resuming.cells.slice(0,2).map(x=>x.key),["2026-12","2027-01"]);
const untracked=monthlyDevotionalRegister([],{needed:5,selectedDate:"2026-10-03"});
assert.equal(untracked.streak,0);
assert.equal(untracked.cells[0].key,"2026-10");
assert.ok(untracked.cells.every(x=>x.status==="unrecorded"));
const daily=readFileSync("src/pray/traditional-pray-runtime.js","utf8");
const programme=readFileSync("src/pray/presentation-runtime.js","utf8");
const css=readFileSync("src/pray/quiet-devotional-progression-styles.js","utf8");
assert.ok(daily.includes("dailyHorizonMarkup(rows.length)"),"Daily donor does not display atmospheric progress");
assert.ok(daily.includes('data-ao-horizon-phase='),"Daily scene must expose its phase for browser verification");
assert.ok(programme.includes('devotionalMonthRegisterMarkup("friday",records,tracking,date)'));
assert.ok(programme.includes('devotionalMonthRegisterMarkup("saturday",records,tracking,date)'));
assert.ok(programme.includes('data-ao-month-tracking='),"Opt-in privacy status missing");
assert.ok(programme.includes('data-p435930-ff-save'));
assert.ok(programme.includes('data-p435930-fs-save'));
assert.ok(css.includes("prefers-reduced-motion:reduce"));
assert.ok(css.includes('data-ao-traditional-dual-axis="daily"'));
console.log("PASS quiet devotion: 11/13 canonical cards, painterly five-phase horizon, 9/5 opt-in monthly register, real record boundaries");
