import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MONTFORT_B26_SOURCE,MONTFORT_B26_PHASES,MONTFORT_B26_AVE_MARIS_LATIN,
 MONTFORT_B26_CONSECRATION_ACT_EN,montfortPhaseForDay,montfortSchedule,
 montfortTodayLocal,montfortNextFeast,montfortAddDays} from "../src/pray/montfort-consecration-b26.js";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";
import {internalPrayerView,supportedDirectPrayerRoute} from "../src/pray/internal-route-owner.js";
assert.equal(MONTFORT_B26_SOURCE.instructionParagraphs,"§§227–233");
assert.equal(MONTFORT_B26_SOURCE.dailyReadingListAuthoredByMontfort,false);
assert.equal(MONTFORT_B26_SOURCE.montfortAuthoredDistinctDays,false);
assert.equal(MONTFORT_B26_SOURCE.printedActImageCollated,false);
assert.match(MONTFORT_B26_SOURCE.rightsNotice,/1987/);
assert.equal(MONTFORT_B26_SOURCE.sourceLanguage,"en");
assert.deepEqual(MONTFORT_B26_PHASES.map(p=>[p.first,p.last]),[[1,12],[13,19],[20,26],[27,33]]);
assert.equal(MONTFORT_B26_PHASES.reduce((sum,p)=>sum+p.last-p.first+1,0),33);
for(let i=1;i<=33;i++){
 const p=montfortPhaseForDay(i);
 assert.ok(p && i>=p.first && i<=p.last,"Phase correctly owns day "+i);
 assert.ok(p.sourceSection.startsWith("§"));
}
assert.equal(montfortPhaseForDay(0),null);
assert.equal(montfortPhaseForDay(34),null);
assert.equal(montfortPhaseForDay(1).id,"spirit_world");
assert.equal(montfortPhaseForDay(12).id,"spirit_world");
assert.equal(montfortPhaseForDay(13).id,"self");
assert.equal(montfortPhaseForDay(19).id,"self");
assert.equal(montfortPhaseForDay(20).id,"mary");
assert.equal(montfortPhaseForDay(26).id,"mary");
assert.equal(montfortPhaseForDay(27).id,"jesus");
assert.equal(montfortPhaseForDay(33).id,"jesus");
const s=montfortSchedule("2026-12-08","2026-11-05");
assert.deepEqual(s.phaseCounts,[12,7,7,7]);
assert.equal(s.start,"2026-11-05");
assert.equal(s.lastPreparationDay,"2026-12-07");
assert.equal(s.consecrationDay,"2026-12-08");
assert.equal(s.dayIndex,1);
assert.equal(s.inPreparation,true);
assert.equal(s.calendarDateForDay(1),"2026-11-05");
assert.equal(s.calendarDateForDay(12),"2026-11-16");
assert.equal(s.calendarDateForDay(13),"2026-11-17");
assert.equal(s.calendarDateForDay(20),"2026-11-24");
assert.equal(s.calendarDateForDay(27),"2026-12-01");
assert.equal(s.calendarDateForDay(33),"2026-12-07");
assert.equal(s.calendarDateForDay(34),"2026-12-08");
assert.equal(s.calendarDateForDay(0),null);
assert.equal(s.calendarDateForDay(35),null);
assert.equal(montfortSchedule("2026-12-08","2026-12-07").dayIndex,33);
assert.equal(montfortSchedule("2026-12-08","2026-12-08").dayIndex,34);
assert.equal(montfortSchedule("2026-12-08","2026-10-29").daysBeforeStart,7);
assert.equal(montfortSchedule("2026-12-08","2027-01-04").dayIndex,34);
assert.equal(montfortAddDays("2028-03-25",-33),"2028-02-21","Leap year correct");
assert.equal(montfortAddDays("2027-03-25",-33),"2027-02-20");
assert.equal(montfortAddDays("2026-02-30",0),null,"Invalid February date rejected");
assert.equal(montfortAddDays("2026-13-01",0),null);
assert.equal(montfortSchedule("not-a-date"),null);
assert.equal(montfortNextFeast("2026-10-29").date,"2026-12-08");
assert.equal(montfortNextFeast("2026-12-09").date,"2027-03-25");
assert.equal(montfortNextFeast("not-a-date"),null);
assert.equal(montfortTodayLocal(new Date(2026,9,29)), "2026-10-29");
assert.equal(MONTFORT_B26_AVE_MARIS_LATIN.length,7);
assert.match(MONTFORT_B26_AVE_MARIS_LATIN[0],/Ave, maris stella/);
assert.match(MONTFORT_B26_AVE_MARIS_LATIN[6],/Spiritui Sancto/);
assert.equal(MONTFORT_B26_CONSECRATION_ACT_EN.length,10);
assert.match(MONTFORT_B26_CONSECRATION_ACT_EN[0],/^O Eternal and Incarnate Wisdom/);
assert.match(MONTFORT_B26_CONSECRATION_ACT_EN[5],/vows of my Baptism/);
assert.match(MONTFORT_B26_CONSECRATION_ACT_EN.at(-1),/Amen\.$/);
assert.ok(MONTFORT_B26_CONSECRATION_ACT_EN.join(" ").length>3000,"Faber original act must not be truncated");
assert.equal(Object.keys(PRAY_CANONICAL_DATA_V435930.prayers).length,48);
assert.equal(NOVENA_CORPUS_V4_IDS.length,16);
for(const p of MONTFORT_B26_PHASES)for(const id of p.canonicalIds){
 const v=PRAY_CANONICAL_DATA_V435930.prayers[id];
 assert.ok(v?.en&&v?.fr&&v?.la, "Only canonical original prayers may be called by identifier: "+id);
}
assert.ok(MONTFORT_B26_PHASES.some(p=>p.dailyDirectionEn.includes("Litany of the Holy Spirit")));
assert.ok(MONTFORT_B26_PHASES.some(p=>p.dailyDirectionEn.includes("Litany of the Holy Name")));
assert.equal(internalPrayerView("pray.montfort_consecration"),"montfort");
assert.equal(supportedDirectPrayerRoute("pray.montfort_consecration"),true);
const ui=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const style=readFileSync(new URL("../src/pray/montfort-consecration-styles-b26.js",import.meta.url),"utf8");
for(const token of ["function renderMontfortB26()", "data-ao-montfort-b26-reader",
 "data-p435930-montfort-target","data-p435930-montfort-mark",
 "data-p435930-montfort-phase","data-p435930-montfort-prev",
 "data-p435930-montfort-next","data-p435930-montfort-today",
 "MONTFORT_B26_CONSECRATION_ACT_EN","source-directed",
 "return open('pray.rosary'","'pray.montfort_consecration':{id:"
])assert.ok(ui.includes(token), "Montfort reader contract missing "+token);
assert.ok(!ui.includes("const MONTFORT_33_DAILY_PRAYERS"),"No invented 33 authorial daily prayers");
assert.match(style,/min-height:48px/);
assert.match(style,/prefers-reduced-motion/);
assert.match(ui,/The Litany of the Holy Spirit and of the Holy Name need independent original-form admission/);
console.log("PASS B26 Montfort: 12+7+7+7, Faber 1863 original act, canonical 48, fixed and leap dates, no invented daily readings or translations");
