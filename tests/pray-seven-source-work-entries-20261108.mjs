import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930 as DATA} from "../src/pray/canonical-data.js";
import {PRAYER_SUBJECTS_V1} from "../src/pray/prayer-subject-index.v1.js";
import {PRAYER_SUPPLEMENTAL_LIVE_WORK_LINKS_V1} from "../src/pray/prayer-supplemental-live-works.v1.js";
import {PRAYER_SEVEN_SOURCE_WORK_LINKS_V1 as WORKS,prayerSevenSourceWork,prayerSevenSourceWorksForSubject} from "../src/pray/prayer-seven-source-work-links.v1.js";
import {GOLDEN_ARROW_REPARATION_V1} from "../src/pray/icksp-golden-arrow-reparation.v1.js";
import {NOVENA_HOLY_FACE_1887_B25} from "../src/pray/holy-face-janvier-1887-b25.js";
import {MONTFORT_B27_PRAYERS,montfortB27RequiredForDay,montfortHistoricalPrayerRows} from "../src/pray/montfort-original-prayers-b27.js";
import {MONTFORT_B26_CONSECRATION_ACT_EN} from "../src/pray/montfort-consecration-b26.js";
import {GOOD_DEATH_DYING_V384} from "../src/pray/good-death-data.js";
import {DYING_COMPANION_STAGES} from "../src/pray/dying-companion-flow.js";
import {INTERNAL_PRAYER_VIEWS} from "../src/pray/internal-route-owner.js";
assert.equal(WORKS.length,7);
assert.equal(new Set(WORKS.map(w=>w.id)).size,7);
const distribution={II:2,IV:1,V:2,IX:2};
assert.deepEqual(Object.fromEntries(PRAYER_SUBJECTS_V1.map(s=>[s.id,prayerSevenSourceWorksForSubject(s.id).length])),{I:0,II:2,III:0,IV:1,V:2,VI:0,VII:0,VIII:0,IX:2});
for(const w of WORKS){
 assert.equal(prayerSevenSourceWork(w.id),w);
 assert.equal(DATA.prayers[w.id],undefined,"No second canonical prayer record "+w.id);
 assert.ok(!PRAYER_SUPPLEMENTAL_LIVE_WORK_LINKS_V1.some(x=>x.id===w.id),"No duplicate historical work card");
 assert.ok(PRAYER_SUBJECTS_V1.some(x=>x.id===w.subject));
 assert.ok(w.en?.length>6&&w.fr?.length>6&&w.sourceNoteEn?.length>10&&w.sourceNoteFr?.length>10);
 if(w.mode==="internal"){
  assert.equal(INTERNAL_PRAYER_VIEWS[w.route],"montfort");
  assert.ok(Number.isInteger(w.options.day)&&w.options.day>=13&&w.options.day<=34);
  if(w.options.historicalPrayer)assert.ok(montfortB27RequiredForDay(w.options.day).includes(w.options.historicalPrayer));
 }else assert.ok(["pray.sacred_heart","pray.novenas","pray.dying_companion"].includes(w.route));
}
assert.deepEqual(prayerSevenSourceWorksForSubject("all"),WORKS);
assert.deepEqual(prayerSevenSourceWorksForSubject("all","Proficiscere").map(x=>x.id),["good_death_proficiscere"]);
assert.deepEqual(prayerSevenSourceWorksForSubject("all","Montfort").map(x=>x.id).sort(),["montfort_augustine_prayer","montfort_consecration_act_1863"].sort());
assert.equal(GOLDEN_ARROW_REPARATION_V1.en.length>100,true);
assert.equal(GOLDEN_ARROW_REPARATION_V1.fr.length>100,true);
assert.equal(NOVENA_HOLY_FACE_1887_B25.days.length,9);
assert.ok(NOVENA_HOLY_FACE_1887_B25.days.every(x=>x.text.en.length>200&&!x.text.fr));
assert.equal(montfortHistoricalPrayerRows("holySpirit").length>40,true);
assert.equal(montfortHistoricalPrayerRows("augustine").length>1,true);
assert.equal(MONTFORT_B26_CONSECRATION_ACT_EN.length>1,true);
assert.ok(DYING_COMPANION_STAGES.includes("pray")&&DYING_COMPANION_STAGES.includes("commend"));
assert.ok(GOOD_DEATH_DYING_V384.aspirations.en.includes("Jesus, Mary, Joseph"));
assert.ok(GOOD_DEATH_DYING_V384.proficiscere.la.startsWith("Proficiscere"));
for(const [path,needles] of [
 ["../src/pray/presentation-runtime.js",["data-p435930-source-work","prayerSevenSourceWork(b.dataset.p435930SourceWork)","routeOwn(work.route,work.options)","openSource(work.route,{...work.options","MONTFORT_HISTORICAL_FOCUS","data-ao-montfort-b27-original"]],
 ["../src/pray/novena-runtime.js",["Number.isInteger(opts?.novenaDay)","directDay!==null","N.day=directDay??"]],
 ["../src/pray/traditional-pray-runtime.js",["DYING_COMPANION_STAGES.includes(opts.dyingStep)"]]
]){const source=readFileSync(new URL(path,import.meta.url),"utf8");for(const needle of needles)assert.ok(source.includes(needle),path+" missing "+needle)}
console.log("PASS seven original-source work entry targets: 2 Holy Face, 3 Montfort, 2 Dying Companion; all existing bodies retained, no fabricated translation");
