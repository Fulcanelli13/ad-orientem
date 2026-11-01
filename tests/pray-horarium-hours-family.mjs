import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {leonineSourceSections,LEONINE_SOURCE_BLOCKS} from "../src/pray/horarium-leonine-source-blocks.js";
import {angelusCommunalParts} from "../src/pray/angelus-folio-recitation.js";
import {angelusCardPlan} from "../src/pray/devotional-card-deck.js";

const read=x=>readFileSync(x,"utf8");
const runtime=read("src/pray/presentation-runtime.js");
const daily=read("src/pray/traditional-pray-runtime.js");
const focus=read("src/pray/devotional-card-deck.js");
const styles=read("src/pray/horarium-hours-styles.js");

test("F04 all three: Angelus, Regina and Leonine preserve their source-owned routes",()=>{
 assert.match(runtime,/function renderAngelus\(\)/);
 assert.match(runtime,/angelusChoice\(\)/);
 assert.match(runtime,/angelusExactPosture\(\)/);
 assert.match(runtime,/angelusSaturdayVespersDate/);
 assert.match(runtime,/angelusHistoricalConclusion/);
 assert.match(runtime,/data-ao-hours-family="ritual"/);
 const angelus=angelusCardPlan({form:"angelus",language:"en"});
 const regina=angelusCardPlan({form:"regina",language:"fr"});
 assert.deepEqual(angelus.map(x=>x.id),["announcement","fiat","incarnation","intercession","collect"]);
 assert.deepEqual(regina.map(x=>x.id),["rejoice","resurrection","intercession","collect"]);
 assert.match(runtime,/mass_devotion_leonine/);
 assert.match(runtime,/data-ao-hours-family="leonine"/);
 assert.equal(LEONINE_SOURCE_BLOCKS.length,5);
 for(const language of ["en","fr","la"]){
  const p=PRAY_CANONICAL_DATA_V435930.prayers.mass_devotion_leonine;
  assert.ok(p[language],"No invented translation");
  const sections=leonineSourceSections(p[language]);
  assert.equal(sections?.length,5,language+" must retain five source sections");
  assert.equal(sections.map(x=>x.raw).join("\n----\n"),p[language],
   language+" must reconstruct byte-exact canonical witness");
  assert.equal(sections[1].paragraphs.filter(x=>x.role==="versicle").length,1);
  assert.equal(sections[1].paragraphs.filter(x=>x.role==="response").length,1);
 }
 assert.equal(leonineSourceSections("Changed unverified witness"),null);
});

test("F04 collective Hail Mary and Gloria use no invented V/R; authentic versicles remain",()=>{
 const hail=PRAY_CANONICAL_DATA_V435930.prayers.foundations_hail_mary;
 for(const language of ["en","fr","la"]){
  const parts=angelusCommunalParts(hail[language],"hail");
  assert.ok(parts&&parts.length===2,language+" familiar prayer halves");
  assert.ok(parts.every(p=>!/[℣℟]/.test(p.text)));
 }
 assert.match(runtime,/sourceVersicles:true/);
 assert.match(runtime,/collective:S\.rosary\.recitation==='group'/);
 assert.match(runtime,/sourceVersicles\?\x60/);
 assert.match(focus,/ordinaryPrayerHalf\(doc,p\.role,p\.text\)/);
 assert.match(focus,/i<active\?"\.54":"\.80"/);
 assert.match(styles,/\.aoHoursCollective\[data-ao-devo-active="true"\]/);
});

test("F05/F12 family: one book-first rule and private nightly examination, both with focus",()=>{
 assert.match(daily,/data-ao-hours-family="rule"/);
 assert.match(daily,/data-ao-hours-family="examen"/);
 assert.match(daily,/renderDailyBookPills/);
 assert.match(daily,/renderDailyReaderOptions/);
 assert.match(daily,/renderDailyGuided/);
 assert.match(daily,/renderNightlyExamen\(\)/);
 assert.match(daily,/personalDailyPrefs\(\)/);
 assert.match(daily,/examenContrition/);
 assert.match(daily,/installSequentialDevotionalReader/);
 assert.match(styles,/prefers-reduced-motion:reduce/);
 assert.doesNotMatch(styles,/localStorage|sessionStorage|new Date\(/);
});
