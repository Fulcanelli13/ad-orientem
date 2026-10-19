import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dailyHorizonState,monthlyDevotionalRegister} from "../src/pray/quiet-devotional-progression.js";
import {devotionalProgressMarkup} from "../src/pray/devotional-progress.js";
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
assert.deepEqual(incomplete.cells.slice(0,3).map(x=>x.status),["recorded","recorded","incomplete"],"Interrupted series must retain earlier reported months visually");
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
assert.ok(programme.includes("function devotionalMonthSummary("));
assert.ok(programme.includes("devotionalMonthSummary('friday',records,tracking,date)"));
assert.ok(programme.includes("devotionalMonthSummary('saturday',records,tracking,date)"));
assert.ok(programme.includes("devotionalMonthRegisterMarkup(kind,records,tracking,selectedDate)"));
assert.ok(programme.includes('data-ao-month-tracking='),"Opt-in privacy status missing");
assert.ok(programme.includes('data-p435930-ff-save'));
assert.ok(programme.includes('data-p435930-fs-save'));
assert.ok(css.includes("prefers-reduced-motion:reduce"));
assert.ok(css.includes('data-ao-traditional-dual-axis="daily"'));
const english=devotionalProgressMarkup({index:1,total:5,language:"en",unit:"stage"});
const french=devotionalProgressMarkup({index:5,total:6,language:"fr",unit:"stage"});
assert.match(english,/aria-valuenow="2"/);
assert.match(english,/aria-valuemax="5"/);
assert.match(english,/Stage 2 of 5/);
assert.match(english,/--ao-devo-progress:40%/);
assert.match(french,/Étape 6 sur 6/);
assert.match(french,/--ao-devo-progress:100%/);
assert.equal(devotionalProgressMarkup({total:0}),"");
const navStart=programme.indexOf("function programmeNav(");
const navEnd=programme.indexOf("function programmeSummary(",navStart);
assert.ok(navStart>=0&&navEnd>navStart,"First devotion stage-navigation owner missing");
const programmeNavOwner=programme.slice(navStart,navEnd);
assert.doesNotMatch(programmeNavOwner,/data-p435930-\\$\\{kind\\}-(?:prev|next)/,
 "First Friday/Saturday should use swipe or stage rail, not Prev/Next");
assert.match(programmeNavOwner,/data-p435930-program-home/,"Preserve explicit final exit");
assert.match(programme,/devotionalProgressMarkup\\(\\{index:step,total:items.length/,
 "First Friday/Saturday progress must be bound to the exact current stage");
assert.match(programme,/view==='firstFriday'\\|\\|view==='firstSaturday'/,
 "Both programmes must accept keyboard card navigation");
const programmeStyles=readFileSync("src/pray/devotional-card-deck-styles.js","utf8");
assert.match(programmeStyles,/aoP435930ProgrammeNavShell/,"Stage progress must remain visible with its navigation rail");
console.log("PASS quiet devotion: 11/13 canonical cards, painterly five-phase horizon, 9/5 opt-in monthly register, real record boundaries");
