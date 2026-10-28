import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createPrayerPurposeIndex,prayerPurposeFor,prayerPurposeDefault,normalizePrayerPurposeSelection} from "../src/pray/prayer-purpose-index.js";
import {GOOD_DEATH_PRAYER_PURPOSES} from "../src/pray/good-death-purpose-map.js";
import {PRAY_CANONICAL_DATA_V435930 as canonical} from "../src/pray/canonical-data.js";
import {GOOD_DEATH_DYING_V384} from "../src/pray/good-death-data.js";
import {JOSEPH_LITANY_1909_V1,JOSEPH_LITANY_2021_V1} from "../src/pray/st-joseph-litany-1909.v1.js";

const stages=[
 "devotion_litany_st_joseph","devotion_ad_te_beate_ioseph","devotion_memorare_st_joseph",
 "foundations_act_of_faith","foundations_act_of_hope","foundations_act_of_love",
 "sacrament_act_of_contrition","foundations_hail_mary","aspirations"
];
const index=createPrayerPurposeIndex(GOOD_DEATH_PRAYER_PURPOSES,{ordinary:stages});
assert.equal(index.ordinary.length,5);
assert.deepEqual(index.ordinary.flatMap(group=>group.ids),stages,"All nine original stages remain in order, exactly once");
assert.equal(prayerPurposeFor(index,"ordinary","devotion_litany_st_joseph").id,"joseph");
assert.equal(prayerPurposeFor(index,"ordinary","devotion_memorare_st_joseph").id,"joseph");
for(const id of ["foundations_act_of_faith","foundations_act_of_hope","foundations_act_of_love"]){
 assert.equal(prayerPurposeFor(index,"ordinary",id).id,"virtues");
 assert.equal(prayerPurposeFor(index,"ordinary",id).relationship,"distinct","Do not confuse theological acts with interchangeable versions");
}
assert.equal(prayerPurposeFor(index,"ordinary","sacrament_act_of_contrition").id,"contrition");
assert.equal(prayerPurposeFor(index,"ordinary","foundations_hail_mary").id,"mary");
assert.equal(prayerPurposeFor(index,"ordinary","aspirations").id,"aspirations");
assert.equal(prayerPurposeDefault(index,"ordinary","joseph"),"devotion_litany_st_joseph");
assert.deepEqual(normalizePrayerPurposeSelection(index,{ordinary:{
 joseph:"devotion_memorare_st_joseph",virtues:"foundations_act_of_hope",contrition:"forged",
 aspirations:"devotion_litany_st_joseph",unknown:"foundations_hail_mary"
}}),{ordinary:{joseph:"devotion_memorare_st_joseph",virtues:"foundations_act_of_hope"}},"Invalid and cross-purpose saved source IDs fail closed");
assert.deepEqual(normalizePrayerPurposeSelection(index,{ordinary:{joseph:"devotion_litany_st_joseph_2021"}}),{ordinary:{}},"An edition is not a tenth prayer card");
assert.throws(()=>createPrayerPurposeIndex({ordinary:[{id:"joseph",relationship:"distinct",ids:["devotion_litany_st_joseph"]}]},{ordinary:stages}),/not classified/);
for(const id of stages.filter(x=>x!=="aspirations")){
 const p=canonical.prayers[id];
 assert.ok(p&&p.en?.trim()&&p.fr?.trim()&&p.la?.trim(),"Source-owned complete canonical prayer is required: "+id);
}
for(const lang of ["en","fr","la"])assert.ok(GOOD_DEATH_DYING_V384.aspirations[lang]?.length>100);
assert.ok(JOSEPH_LITANY_1909_V1.la.length>1000);
assert.ok(JOSEPH_LITANY_2021_V1.la.length>JOSEPH_LITANY_1909_V1.la.length);
const rt=readFileSync(new URL("../src/pray/traditional-pray-runtime.js",import.meta.url),"utf8");
const original=rt.match(/const GOOD_DEATH_STAGES=Object\.freeze\(\[([\s\S]*?)\]\);/);
assert.ok(original,"Original historical nine-stage sequence missing");
for(const id of stages)assert.match(original[1],new RegExp('"'+id+'"'),"Stage vanished: "+id);
assert.equal((original[1].match(/\["/g)||[]).length,9,"Historical sequence must retain nine named stages");
assert.match(rt,/goodDeathPurposePicker\(GOOD_DEATH_STAGES,id\)/,"Direct picker must be visible outside historical card");
assert.match(rt,/data-tp381-good-death-source/);
assert.match(rt,/data-tp381-good-death-purpose/);
assert.match(rt,/rememberGoodDeathPurpose\(/);
assert.match(rt,/ao\.pray\.good-death-purpose\.v1/);
assert.match(rt,/kind:"goodDeath",chapters,activeIndex:S\.goodDeathStep/,"Keep nine original horizontal/vertical source cards");
assert.match(rt,/goodDeathJosephEdition:"1909"/,"1909 Litany default retained");
assert.match(rt,/data-tp381-joseph-edition="2021"/,"2021 Litany remains separately selectable");
assert.match(rt,/data-tp381-route="pray\.dying_companion"/,"Urgent priest-first bedside route retained");
assert.match(rt,/function renderDyingCompanion\(/,"Separate urgent companion unchanged");
console.log("PASS: Good Death B11 nine source-owned prayers in five accurate purposes; saved source-ID validation; historical Litany default and bedside route preserved.");
