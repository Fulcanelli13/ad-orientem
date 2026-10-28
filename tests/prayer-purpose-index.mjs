import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createPrayerPurposeIndex,prayerPurposeFor,prayerPurposeDefault,normalizePrayerPurposeSelection} from "../src/pray/prayer-purpose-index.js";
import {COMMUNION_PRAYER_PURPOSES} from "../src/pray/communion-prayer-purpose-map.js";
import {COMMUNION_TREASURY_V383} from "../src/pray/traditional-pray-data.js";

const before=[
 "sacrament_come_holy_spirit","foundations_act_of_faith","foundations_act_of_hope",
 "foundations_act_of_love","sacrament_act_of_contrition","beforeThomas","beforeAmbrose"
];
const after=["adoration_anima_christi","afterThomas","afterBonaventure","enEgo"];
const catalog=createPrayerPurposeIndex(COMMUNION_PRAYER_PURPOSES,{before,after});
assert.equal(catalog.before.length,3);
assert.equal(catalog.after.length,3);
assert.deepEqual(catalog.before.flatMap(x=>x.ids),before);
assert.deepEqual(new Set(catalog.after.flatMap(x=>x.ids)),new Set(after));
assert.equal(prayerPurposeFor(catalog,"before","beforeThomas").id,"approach");
assert.equal(prayerPurposeFor(catalog,"before","beforeAmbrose").relationship,"alternatives");
for(const id of ["foundations_act_of_faith","foundations_act_of_hope","foundations_act_of_love","sacrament_act_of_contrition"]){
 assert.equal(prayerPurposeFor(catalog,"before",id).id,"disposition","The four separate acts must never be rewritten as the same prayer");
 assert.equal(prayerPurposeFor(catalog,"before",id).relationship,"distinct");
}
assert.equal(prayerPurposeFor(catalog,"after","afterBonaventure").id,"union");
assert.equal(prayerPurposeFor(catalog,"after","afterThomas").id,"thanksgiving");
assert.equal(prayerPurposeFor(catalog,"after","enEgo").id,"crucifix");
assert.equal(prayerPurposeFor(catalog,"before","enEgo"),null);
assert.equal(prayerPurposeDefault(catalog,"after","union"),"adoration_anima_christi");
assert.equal(prayerPurposeDefault(catalog,"after","forged"),null);
assert.deepEqual(normalizePrayerPurposeSelection(catalog,{
 before:{approach:"beforeAmbrose",disposition:"afterThomas",forged:"beforeThomas"},
 after:{union:"afterBonaventure",crucifix:"enEgo",thanksgiving:"bad"}
}),{before:{approach:"beforeAmbrose"},after:{union:"afterBonaventure",crucifix:"enEgo"}});
assert.deepEqual(normalizePrayerPurposeSelection(catalog,{before:{approach:"beforeThomas"}}),
 {before:{approach:"beforeThomas"},after:{}});
assert.throws(()=>createPrayerPurposeIndex({before:[{id:"a",ids:["beforeThomas"],relationship:"alternatives"}]},
 {before}),/not classified/);
assert.throws(()=>createPrayerPurposeIndex({before:[{id:"a",ids:["beforeThomas","beforeThomas"],relationship:"alternatives"}]},
 {before:["beforeThomas"]}),/repeated/);
assert.throws(()=>createPrayerPurposeIndex({before:[{id:"a",ids:["invented"],relationship:"alternatives"}]},
 {before:["beforeThomas"]}),/Unknown/);
for(const id of ["beforeThomas","beforeAmbrose","afterThomas","afterBonaventure","enEgo"]){
 const source=COMMUNION_TREASURY_V383[id];
 assert.ok(source&&source.en?.length>100&&source.fr?.length>100&&source.la?.length>100);
 assert.ok(source.witness?.length>20,"Historical attribution should stay associated with complete prayer text");
}
const rt=readFileSync(new URL("../src/pray/traditional-pray-runtime.js",import.meta.url),"utf8");
assert.match(rt,/communionPurposePicker\(tab,stages,id\)/);
assert.match(rt,/data-tp381-communion-source/);
assert.match(rt,/data-tp381-communion-purpose/);
assert.match(rt,/rememberCommunionPurpose\(/);
assert.match(rt,/ao\.pray\.communion-purpose\.v1/);
assert.match(rt,/function renderMassFolioPrayers\(/,"Existing Before/After Mass entry points must not be replaced");
assert.match(rt,/installSequentialDevotionalReader/);
assert.ok(!rt.includes("data-ao-communion-direct-picker"),"The source choice should not be buried in a details disclosure");
console.log("PASS: 11 canonical Communion prayers grouped in 6 accurate purposes; source-IDs persisted; no invented alternatives, no rite rewrites.");
