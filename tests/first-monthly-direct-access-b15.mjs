import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930 as corpus} from "../src/pray/canonical-data.js";
const runtime=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const styles=readFileSync(new URL("../src/pray/first-monthly-direct-prayers-styles.js",import.meta.url),"utf8");
const source=corpus.prayers.sacred_heart_short_prayer;
assert.ok(source&&source.en?.length>80&&source.fr?.length>80&&source.la?.length>60,
 "First Friday direct reader must use the existing canonical Pius XI prayer");
assert.match(runtime,/import "\.\/first-monthly-direct-prayers-styles\.js"/);
assert.match(runtime,/function firstMonthlyDirectPrayers\(kind\)/);
assert.match(runtime,/data-ao-first-monthly-direct=/);
for(const id of ["ff-direct-prayer","fs-direct-rosary","fs-direct-meditate"])
 assert.ok(runtime.includes("data-p435930-"+id),"Missing B15 direct prayer action "+id);
assert.match(runtime,/prayerReturnView='firstFriday';prayerId='sacred_heart_short_prayer'/);
assert.match(runtime,/launchRosaryPlayer\(captureResume\(\)\)/);
assert.match(runtime,/stopTimer\(\);view='fsMeditation';return render\(\)/);
assert.match(runtime,/if\(view!=='firstSaturday'\)return;/);
assert.match(runtime,/firstFriday:\{records:\[\],tracking:false\}/);
assert.match(runtime,/firstSaturday:\{records:\[\],tracking:false\}/);
assert.match(runtime,/FF_STAGES=\[\['Intention'/);
assert.match(runtime,/FS_STAGES=\[\['Intention'/);
assert.match(runtime,/if\(s===3\)return.*prayerBlock\('sacred_heart_short_prayer'/s,
 "First Friday original reparation programme stage must retain its prayer");
assert.match(runtime,/if\(s===3\)return.*data-p435930-own="pray.rosary"/s,
 "Five decades remain an independent constituent act");
assert.match(runtime,/if\(s===4\)return.*data-p435930-fs-meditate/s);
assert.match(runtime,/data-p435930-fs-meditation-return/);
assert.match(runtime,/data-p435930-ff-save/);
assert.match(runtime,/data-p435930-fs-save/);
assert.match(runtime,/The Rosary and fifteen-minute meditation are distinct acts/);
assert.match(runtime,/does not replace reparatory Holy Communion/);
assert.match(styles,/grid-template-columns:1fr/);
const friday=runtime.slice(runtime.indexOf("function renderFirstFriday()"),runtime.indexOf("function firstSaturdayStage("));
const saturday=runtime.slice(runtime.indexOf("function renderFirstSaturday()"),runtime.indexOf("function mysterySetButtons("));
for(const [s,n] of [[friday,"friday"],[saturday,"saturday"]]){
 const direct=s.indexOf("firstMonthlyDirectPrayers('"+n+"')");
 const stage=s.indexOf(n==="friday"?"firstFridayStage(date,valid)":"firstSaturdayStage(date,valid)");
 const history=s.indexOf("devotionalMonthSummary('"+n+"',records,tracking,date)");
 assert.ok(direct>=0&&stage>direct&&history>stage,"Direct "+n+" prayers must precede the optional tracking register");
}
console.log("B15 PASS: source-owned First Friday reparation and distinct First Saturday Rosary / meditation with no auto-reporting or extra conditions.");
