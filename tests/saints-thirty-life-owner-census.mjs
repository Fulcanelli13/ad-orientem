import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const read=f=>JSON.parse(readFileSync(resolve(root,f),"utf8"));
const six=read("data/saints/holiness-first-editorial-pilot-20261015.v1.json");
const eight=read("data/saints/holiness-first-eight-doctors-research-20261015.v1.json");
const sixteen=read("data/saints/holiness-first-sixteen-cross-vocation-research.v1.json");
assert.equal(six.people.length,6);
assert.equal(eight.people.length,8);
assert.equal(sixteen.people.length,16);
const normalized=x=>x.replace(/^saint:/,"saint.").replace(/^blessed:/,"blessed.");
const entries=[
...six.people.map(x=>({id:normalized(x.saint_id),name:x.display_name.en,owner:"NATIVE_SIX_PROFILE_PILOT",
 biography_state:"PILOT_RESEARCH_APP_DRAFT",visible_on_public_pages:false,subject_kind:x.recognition_status,
 facts:x.biography_facts.length,extraordinary_reports:x.extraordinary_accounts.length,
 artwork_ready:x.approved_artwork_ids.length>0,map_location_scope:"SOURCE_OWNED_EXISTING_PLACES",
 life_data_status:x.life?.birth?.date&&x.life?.death?.date?"NATIVE_DATES_SOURCED_EDITORIAL_REVIEW":"MISSING_LIFE_DATES",
 birth_date_precision:x.life?.birth?.date?"EXACT_DATE":null,death_date_precision:x.life?.death?.date?"EXACT_DATE":null,
 celebration_scope:x.life?.celebration?.scope||"PENDING"})),
...eight.people.map(x=>({id:x.calendar_person_id,name:x.name.en,owner:"HELD_EIGHT_DOCTOR_DRAFTS",
 biography_state:x.editorial_status,visible_on_public_pages:false,subject_kind:"SAINT",
 facts:x.biography_facts.length,extraordinary_reports:x.extraordinary_accounts.length,
 artwork_ready:!!x.approved_artwork_id,map_location_scope:"NONE",
 life_data_status:x.life_events_review?.review_status?"HISTORICAL_DATES_RESEARCHED_NOT_APPROVED":"MISSING_LIFE_DATES",
 birth_date_precision:x.life_events_review?.birth?.date_precision??null,
 death_date_precision:x.life_events_review?.death?.date_precision??null,
 celebration_scope:"CALENDAR_OWNER_PENDING"})),
...sixteen.people.map(x=>({id:x.person_id,name:x.name.en,owner:"HELD_SIXTEEN_DIVERSE_DRAFTS",
 biography_state:x.editorial_status,visible_on_public_pages:false,subject_kind:x.recognition_status,
 facts:x.biography_facts.length,extraordinary_reports:x.extraordinary_accounts.length,
 artwork_ready:!!x.artwork_master_id,map_location_scope:"NONE",
 life_data_status:"MISSING_LIFE_DATES",birth_date_precision:null,death_date_precision:null,
 celebration_scope:"CALENDAR_OWNER_PENDING"}))
];
assert.equal(entries.length,30);
assert.equal(new Set(entries.map(x=>x.id)).size,30,"30 lives must represent 30 distinct people, not duplicate owner profiles");
assert(entries.every(x=>x.id&&x.name&&x.facts>=3));
assert.equal(entries.filter(x=>x.owner==="NATIVE_SIX_PROFILE_PILOT").length,6);
assert.equal(entries.filter(x=>x.owner!=="NATIVE_SIX_PROFILE_PILOT").length,24);
assert(entries.every(x=>!x.visible_on_public_pages&&!x.artwork_ready));
assert.equal(entries.reduce((s,x)=>s+x.facts,0),6*3+8*3+16*3);
assert.equal(entries.reduce((s,x)=>s+x.extraordinary_reports,0),2+2+2);
assert(entries.some(x=>x.id==="blessed.jacques-desire-laval"&&x.subject_kind==="BEATIFIED_NOT_CANONIZED"));
assert(!entries.some(x=>x.id==="saint.francois-de-montmorency-laval"),
  "Do not replace Blessed Jacques-Désiré Laval with François de Montmorency-Laval");
const output={schema:"ao.saints.30-holiness-first-person-census.v1",status:"RESEARCH_CENSUS_NOT_A_30_PERSON_PUBLIC_APP",
 counts:{distinct_person_profiles:30,existing_native_six_profiles:6,additional_held_doctors:8,
 additional_held_other_vocations:16,not_yet_individually_editorially_signed_off:24,
 drafts_with_an_existing_map_lens_surface:6,public_pages_released_from_this_pr:0,
 individually_approved_new_portraits:0,additional_map_pins_created:0,
 native_six_life_date_records:entries.filter(x=>x.life_data_status==="NATIVE_DATES_SOURCED_EDITORIAL_REVIEW").length,
 held_doctor_life_date_records:entries.filter(x=>x.life_data_status==="HISTORICAL_DATES_RESEARCHED_NOT_APPROVED").length,
 missing_life_dates:entries.filter(x=>x.life_data_status==="MISSING_LIFE_DATES").length,
 sourced_fact_summaries:entries.reduce((s,x)=>s+x.facts,0),
 historically_attributed_extraordinary_accounts:entries.reduce((s,x)=>s+x.extraordinary_reports,0)},
 caution:"30 content drafts do not mean 30 verified calendar entries, 30 map pins, 30 certified saint canonizations or 30 image-complete app profiles.",
 entries};
const path=resolve(root,"artifacts/saints-calendar-census/saints-30-holiness-first-person-census.json");
mkdirSync(resolve(root,"artifacts/saints-calendar-census"),{recursive:true});
writeFileSync(path,JSON.stringify(output,null,2)+"\n");
assert.equal(output.counts.native_six_life_date_records,6);
assert.equal(output.counts.held_doctor_life_date_records,8);
assert.equal(output.counts.missing_life_dates,16);
console.log("PASS consolidated no-duplicate 30-person holiness-first research census: "+JSON.stringify(output.counts));
