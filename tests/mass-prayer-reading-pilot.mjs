import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validatePrayerReadingPilot,prayerReadingEditorialPreviewHtml,prayerReadingEditorialPreviewCss,
 validateMassTransitionReadingPilot,massTransitionEditorialPreviewHtml}
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
const nextPilot=read("data/learn/research/mass-formation-orate-preface-reading-pilot-20261016.v1.json");
const guide=read("data/presentation/guide-registry.v1.json");
const next=validateMassTransitionReadingPilot(nextPilot,sung,formation,guide);
assert.equal(next.ok,true,next.reason);
assert.deepEqual(next.readings.map(x=>x.block_id),
 ["AO.SM.B039","AO.SM.B041","AO.SM.B042","AO.SM.B043","AO.SM.B044","AO.SM.B046"]);
assert.deepEqual(next.withheld.map(x=>x.block_id),["AO.SM.B040","AO.SM.B045"]);
assert.deepEqual(next.withheld.map(x=>x.proper_slot),["SECRET_SET","PREFACE"]);
for(const lg of [false,true]){
 const html=massTransitionEditorialPreviewHtml(next,{french:lg});
 assert.match(html,/data-ao-formation-editorial-only/);
 assert.match(html,lg?/ÉBAUCHE ÉDITORIALE/:/EDITORIAL DRAFT/);
 assert.equal((html.match(/data-ao-formation-prayer-block=/g)||[]).length,6);
 assert.equal((html.match(/data-ao-formation-proper-held=/g)||[]).length,2);
 assert.doesNotMatch(html,/data-ao-r17|data-ao-mass-reader|data-ao-mx-study/,
  "Transition editorial preview must not offer in-ritual actions");
 assert.match(html,lg?/Préface/:/Preface/);
}
assert.equal(next.readings.reduce((count,row)=>count+row.scripture_within_text.length,0),0,
 "No unapproved inferred Bible parallels or quoted verses may be introduced");
const mutateNext=change=>{
 const copy=JSON.parse(JSON.stringify(nextPilot));
 change(copy);
 return validateMassTransitionReadingPilot(copy,sung,formation,guide);
};
for(const [title,change] of [
 ["invalid release promotion",p=>{p.status="RELEASED_FOR_FORMATION"}],
 ["incorrect moment",p=>{p.entries[1].moment_id="AO.CARD.010"}],
 ["Canon collision",p=>{p.entries[2].block_id="AO.SM.B047"}],
 ["wrong theme",p=>{p.entries[2].stage_id="MF03"}],
 ["unpublished prayer wording",p=>{p.entries[0].text_anchor_en="Revelation 22:18"}],
 ["new Scripture claim",p=>{p.entries[0].scripture_within_text=["Psalm 112"]}],
 ["missing French reading",p=>{p.entries[5].reading.fr=""}],
 ["duplicate id",p=>{p.entries[0].id=p.entries[1].id}],
 ["missing study",p=>{p.entries.pop()}],
 ["variable Secret accidentally included",p=>{p.entries[0].block_id="AO.SM.B040"}],
 ["variable Preface accidentally included",p=>{p.entries[0].block_id="AO.SM.B045"}],
 ["hold removed",p=>{p.withheld_variable_propers.pop()}],
 ["hold incorrectly labelled",p=>{p.withheld_variable_propers[0].proper_slot="PREFACE"}],
 ["hold misleading",p=>{p.withheld_variable_propers[1].reason=""}]
]){
 assert.equal(mutateNext(change).ok,false,title+" must fail closed");
}
assert.equal(validateMassTransitionReadingPilot(nextPilot,{blocks:[]},formation,guide).ok,false);
assert.equal(validateMassTransitionReadingPilot(nextPilot,sung,formation,{entries:{}}).ok,false);
assert.doesNotMatch(readFileSync(new URL("../src/mass/browser-entry.js",import.meta.url),"utf8"),
 /mass-prayer-reading-pilot/,
 "The native Mass reader must remain study-free");
console.log("PASS P2 editorial pilot: 14 bilingual fixed-text readings + two variable Proper holds; source anchors, moment IDs, thematic navigation, no invented Scripture or production release");
