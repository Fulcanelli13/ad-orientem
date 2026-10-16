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
assert.equal(read.observanceRegistry.observances.length,26);
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
for(const date of ["2020-02-27","2024-09-05","2025-10-09","2024-10-12","2026-06-03","2026-10-15"])assert.deepEqual(cards(date),[]);
const html=renderSecondarySaintSection(newman);
assert.ok(html.includes("Also honoured")&&html.includes("1962 Calendar"));
assert.ok(html.includes("John Henry Newman")&&html.includes("<details>"));
assert.ok(html.includes('rel="noopener noreferrer"'));
assert.ok(!html.includes("<img")&&!html.includes("data-cal-mass"));
assert.ok(!html.includes("aoCalV2Hero"));
const french=renderSecondarySaintSection(cards("2026-10-09","fr"),{language:"fr"});
assert.ok(french.includes("Également honorés")&&french.includes("calendrier de 1962"));
const carlo=cards("2026-10-12")[0];
assert.equal(carlo.id,"saint.carlo-acutis");
assert.equal(carlo.universalDateCertified,false);
assert.equal(carlo.dateAuthorityStatus,"DATE_ATTESTED_JURISDICTION_NOT_ESTABLISHED");
const carloHtml=renderSecondarySaintSection([carlo]);
assert.match(carloHtml,/Holy See feast-date witness · scope not established/);
assert.match(carloHtml,/www\.causesanti\.va/);
assert.ok(!carloHtml.includes("data-cal-mass"),"Dicastery date is not a Mass selector");
const pioHtml=renderSecondarySaintSection(cards("2026-09-23"));
assert.match(pioHtml,/papal announcement/,"Source was not a separate decree");
assert.ok(pioHtml.includes('data-cal-secondary-place="place:IT:santuario-san-pio-rotondo"'),"Verified Italian site must be actionable");
assert.ok(pioHtml.includes('data-cal-secondary-saint="saint.pio-pietrelcina"'),"Exact person ID, not a display-name match");
assert.ok(pioHtml.includes("View associated place"),"Associated site action must have a clear description");
assert.ok(pioHtml.includes("View associated place") && !pioHtml.includes("data-cal-mass"),"Site links never select Masses");
assert.match(renderSecondarySaintSection(cards("2026-09-23","fr"),{language:"fr"}),/Voir le lieu associé/);
assert.ok(!html.includes("data-cal-secondary-place"),"Newman has no verified physical site in this projection");
assert.ok(!renderSecondarySaintSection([{...cards("2026-09-23")[0],site:{...cards("2026-09-23")[0].site,placeId:"javascript:alert(1)"}}]).includes("data-cal-secondary-place"),"Unsafe, unreviewed IDs fail closed");
assert.ok(!renderSecondarySaintSection([{...cards("2026-09-23")[0],site:null}]).includes("data-cal-secondary-place"),"No synthetic Place links");
assert.equal(renderSecondarySaintSection([]),"");
assert.ok(SANCTORAL_DAY_CSS.includes(".aoCalSecondarySaintCard"));
const unsafe=renderSecondarySaintSection([{...newman[0],title:"<img src=x>",sourceUrls:["javascript:alert(1)"]}]);
assert.ok(unsafe.includes("&lt;img")&&!unsafe.includes("<img")&&!unsafe.includes("javascript:"));
assert.equal(renderSecondarySaintSection([{...newman[0],changes1962Principal:true}]),"");
const cal=readFileSync(new URL("../src/calendar/calendar-runtime.js",import.meta.url),"utf8");
for(const text of ["function loadCalendarSecondarySaints()","loadCalendarPilgrimagePlaces();loadCalendarSecondarySaints();",
 "observedPrincipalId:r.day.main.id","observedCommemorationIds:canonical1962Commemorations(r).map(x=>x.sourceId)",'renderSecondarySaintSection(cards,{language:fr()?"fr":"en"})',
 "SANCTORAL_DAY_CSS","supplementaryDayMarkup(selected,r)","canonical1962Commemorations"]){assert.ok(cal.includes(text),text);}
assert.ok(!cal.includes("jurisdiction:\"US\""),"Cannot silently infer user's jurisdiction");
for(const guard of [
 "function supplementaryDayCards(selected,r)","async function openSecondarySaintPlace(button)",
 "r?.date!==selected","card.id===saintId&&card.site?.placeId===placeId",
 'globalThis.AO_APP_SHELL_V1?.navigate?.("find")',
 'owner.open({lens:"shrines",view:"map",placeId,query:""})',
 "owner.status?.().selectedPlaceId!==placeId",
 'event.target.closest?.("[data-cal-secondary-place]")'
])assert.ok(cal.includes(guard),"Missing fail-closed native Place route guard: "+guard);

const home=readFileSync(new URL("../src/home/today-v2-sections.js",import.meta.url),"utf8");
assert.ok(home.includes('data-home-calendar data-home-calendar-view="day"'),"Home must keep canonical Calendar day entry");
assert.ok(home.includes('reviewed-sanctoral-cards.js'),"Home uses Calendar's exact reviewed modern-saint projection, not a parallel resolver");
assert.ok(home.includes('living-sanctoral-read-model.js'),"Home shares the source-owned lazy Calendar dataset");
assert.ok(!home.includes('sanctoral-day-ui.js'),"Do not duplicate the full Calendar panel on Home");

console.log("Secondary Calendar saints: PASS (26-source read-model, 1962 isolation, safe EN/FR text and links)");
