import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildReviewedSanctoralCards} from "../src/calendar/reviewed-sanctoral-cards.js";
import {renderSecondarySaintSection,SANCTORAL_DAY_CSS} from "../src/calendar/sanctoral-day-ui.js";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const full=load("data/calendar/living-sanctoral-modern-observances.review.v1.json");
const place=load("data/calendar/living-sanctoral-place-art-crosswalk.review.v1.json");
const pilot=load("data/calendar/living-sanctoral-pilot.v1.json");
const census=load("data/calendar/post1960-canonizations.official-batch1.v1.json");
const doctors=load("data/calendar/doctors-of-church-roster.review.v1.json");
const media=load("data/geography/approved-place-media.v1.json");
const geo=load("data/geography/seed-registry.v1.json");
const read=load("data/calendar/living-sanctoral-read-model.v1.json");
assert.equal(read.schema,"AO_LIVING_SANCTORAL_READ_MODEL_V1");
assert.equal(read.status,"READ_ONLY_SECONDARY_CALENDAR");
assert.equal(read.observanceRegistry.observances.length,14);
assert.ok(JSON.stringify(read).length<45000,"Lazy read model should remain compact");
assert.deepEqual(read.observanceRegistry.observances,full.observances,"Snapshot source dates drift");
assert.equal(read.martyrGroups.length,5);
for(const p of read.pilotPersons){
 const original=pilot.persons.find(x=>x.id===p.id);
 assert.ok(original);
 assert.deepEqual(p.presentation,original.presentation);
 assert.deepEqual(p.calendar1962,original.calendar1962);
}
for(const p of read.censusPersons)assert.equal(p.canonizedOn,census.persons.find(x=>x.id===p.id)?.canonizedOn);
for(const d of read.doctorRoster)assert.equal(d.declarationDate,doctors.doctors.find(x=>x.canonicalPersonId===d.canonicalPersonId)?.declarationDate);
for(const g of read.martyrGroups){
 assert.deepEqual(g.presentation,census.groups.find(x=>x.id===g.id)?.presentation);
 assert.equal(g.individualMemberExpansionRequirement,"NONE_FOR_APP");
}
for(const l of read.visualCrosswalk.links){
 const original=place.links.find(x=>x.placeId===l.placeId&&x.canonicalId===l.canonicalId);
 assert.ok(original);
 assert.equal(l.placeName,geo.places.find(x=>x.place_id===l.placeId)?.name?.official);
 assert.equal(l.placePhotoAsset,original.placePhotoAsset);
}
for(const img of read.approvedSiteMedia){
 const original=media.items.find(x=>x.asset_path===img.asset_path);
 assert.ok(original?.rights_verified&&original?.subject_verified&&original?.crop_reviewed);
}
const cards=(date,language="en")=>buildReviewedSanctoralCards({date,language,jurisdiction:"UNSPECIFIED",...read});
const newman=cards("2026-10-09");
assert.deepEqual(newman.map(c=>c.id),["saint.john-henry-newman"]);
assert.deepEqual(cards("2026-09-05").map(c=>c.id),["saint.teresa-calcutta"]);
assert.deepEqual(cards("2026-02-27").map(c=>c.id),["saint.gregory-narek"]);
for(const date of ["2020-02-27","2024-09-05","2025-10-09","2026-10-12","2026-06-03","2026-10-15"])assert.deepEqual(cards(date),[]);
const html=renderSecondarySaintSection(newman);
assert.ok(html.includes("Also honoured")&&html.includes("1962 Missal"));
assert.ok(html.includes("John Henry Newman")&&html.includes("<details>"));
assert.ok(html.includes('rel="noopener noreferrer"'));
assert.ok(!html.includes("<img")&&!html.includes("data-cal-mass"));
assert.ok(!html.includes("aoCalV2Hero"));
const french=renderSecondarySaintSection(cards("2026-10-09","fr"),{language:"fr"});
assert.ok(french.includes("Également honorés")&&french.includes("missel de 1962"));
assert.equal(renderSecondarySaintSection([]),"");
assert.ok(SANCTORAL_DAY_CSS.includes(".aoCalSecondarySaintCard"));
const unsafe=renderSecondarySaintSection([{...newman[0],title:"<img src=x>",sourceUrls:["javascript:alert(1)"]}]);
assert.ok(unsafe.includes("&lt;img")&&!unsafe.includes("<img")&&!unsafe.includes("javascript:"));
assert.equal(renderSecondarySaintSection([{...newman[0],changes1962Principal:true}]),"");
const cal=readFileSync(new URL("../src/calendar/calendar-runtime.js",import.meta.url),"utf8");
for(const text of ["function loadCalendarSecondarySaints()","loadCalendarPilgrimagePlaces();loadCalendarSecondarySaints();",
 "observedPrincipalId:r.day.main.id","observedCommemorationIds:(r.day.commemorations||[]).map(x=>x.id).filter(Boolean)",'renderSecondarySaintSection(cards,{language:fr()?"fr":"en"})',
 "SANCTORAL_DAY_CSS","supplementaryDayMarkup(selected,r)"]){assert.ok(cal.includes(text),text);}
assert.ok(!cal.includes("jurisdiction:\"US\""),"Cannot silently infer user's jurisdiction");
console.log("Secondary Calendar saints: PASS (14-source read-model, 1962 isolation, safe EN/FR text and links)");
