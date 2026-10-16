import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validatePrayerReadingPilot,prayerReadingEditorialPreviewHtml,prayerReadingEditorialPreviewCss}
 from "../src/learn/mass-prayer-reading-pilot.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const pilot=read("data/learn/research/mass-formation-offertory-prayer-reading-pilot-20261016.v1.json");
const sung=read("data/presentation/reader-text-sung.v1.json");
const formation=read("data/learn/mass-formation-campion.v1.json");
const accepted=validatePrayerReadingPilot(pilot,sung,formation);
assert.equal(accepted.ok,true,accepted.reason);
assert.equal(accepted.readings.length,8);
assert.equal(pilot.status,"EDITORIAL_DRAFT_NOT_RELEASED");
assert.deepEqual(accepted.readings.map(x=>x.block_id),Array.from({length:8},
  (_,i)=>"AO.SM.B"+String(i+31).padStart(3,"0")));
for(const lang of [false,true]){
 const html=prayerReadingEditorialPreviewHtml(accepted,{french:lang});
 assert.equal((html.match(/data-ao-formation-prayer-block=/g)||[]).length,8);
 assert.match(html,/data-ao-formation-editorial-only/);
 assert.match(html,lang?/ÉBAUCHE ÉDITORIALE/:/EDITORIAL DRAFT/);
 assert.match(html,lang?/Psaume 25/:/Psalm 25|Ps 25/);
 assert.doesNotMatch(html,/data-ao-r17|data-ao-mass-reader|data-ao-mx-study/,
   "Preview must not embed a ritual or published app navigation");
}
assert.match(prayerReadingEditorialPreviewCss(),/max-width:430px/);
const alter=change=>{
 const copy=JSON.parse(JSON.stringify(pilot));change(copy);return validatePrayerReadingPilot(copy,sung,formation)};
assert.equal(alter(x=>{x.status="RELEASED_FOR_FORMATION"}).ok,false,
 "P1 excerpt release status must not authorize unpublished prayer commentaries");
assert.equal(alter(x=>{x.scope="MASS_RITUAL"}).ok,false);
assert.equal(alter(x=>{x.entries[0].text_anchor_en="New unverified history"}).ok,false);
assert.equal(alter(x=>{x.entries[0].block_id="AO.SM.B047"}).ok,false);
assert.equal(alter(x=>{x.entries[0].stage_id="MF04"}).ok,false);
assert.equal(alter(x=>{x.entries[0].scripture_within_text=["Revelation 22:18"]}).ok,false);
assert.equal(alter(x=>{x.entries[0].reading.fr=""}).ok,false);
assert.equal(alter(x=>{x.entries[0].id=x.entries[1].id}).ok,false);
assert.equal(alter(x=>{x.entries.splice(2,1)}).ok,false);
assert.equal(validatePrayerReadingPilot(pilot,{blocks:[]},formation).ok,false);
assert.doesNotMatch(readFileSync(new URL("../src/mass/browser-entry.js",import.meta.url),"utf8"),
 /mass-prayer-reading-pilot/,
 "Do not import editorial commentary into live ceremonial reader");
console.log("PASS P2 editorial pilot: eight source-text-anchored bilingual Offertory studies; no P0 claim promotion; no production UI release");
