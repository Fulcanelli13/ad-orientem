import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildReviewedSanctoralCards} from "../src/calendar/reviewed-sanctoral-cards.js";
const load=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const registry=load("data/calendar/living-sanctoral-modern-observances.review.v1.json");
const artMap=load("data/calendar/living-sanctoral-place-art-crosswalk.review.v1.json");
const pilot=load("data/calendar/living-sanctoral-pilot.v1.json");
const census=load("data/calendar/post1960-canonizations.official-batch1.v1.json");
const doctors=load("data/calendar/doctors-of-church-roster.review.v1.json");
const media=load("data/geography/approved-place-media.v1.json");
const geography=load("data/geography/seed-registry.v1.json");
const opts={observanceRegistry:registry,visualCrosswalk:artMap,pilotPersons:pilot.persons,
  censusPersons:census.persons,doctorRoster:doctors.doctors,martyrGroups:census.groups,
  approvedSiteMedia:media.items};
const get=(date,overrides={})=>buildReviewedSanctoralCards({date,...opts,...overrides});
const byId=new Set([...pilot.persons,...census.persons].map(x=>x.id));
const doctorIds=new Set(doctors.doctors.map(x=>x.canonicalPersonId));
const groupIds=new Set(census.groups.map(x=>"canon-group."+x.id));
const places=new Set(geography.places.map(x=>x.place_id));
const mediaPaths=new Set(media.items.filter(x=>x.status==="APPROVED" &&
  x.rights_verified&&x.subject_verified&&x.crop_reviewed).map(x=>x.asset_path));
assert.equal(registry.observances.length,14);
assert.equal(registry.observances.filter(x=>x.universalStatus==="CERTIFIED_BY_DECREE").length,5);
assert.equal(registry.observances.filter(x=>x.authorityScope.startsWith("USCCB_")).length,9);
assert.equal(new Set(registry.observances.map(x=>x.subjectId+":"+x.monthDay)).size,14);
for(const r of registry.observances){
 assert.ok(byId.has(r.subjectId)||doctorIds.has(r.subjectId)||groupIds.has(r.subjectId),r.subjectId);
 assert.match(r.monthDay,/^\d\d-\d\d$/);
 assert.ok(r.sourceUrl.startsWith("https://"));
 assert.equal(r.mass1962Effect,"NONE");
 assert.equal(r.approved1962FormularyId,null);
 assert.ok(["GENERAL_ROMAN_VATICAN_DECREE","USCCB_2026_CALENDAR_WITNESS","USCCB_HISTORIC_CALENDAR_WITNESS"].includes(r.authorityScope));
 if(r.universalStatus==="CERTIFIED_BY_DECREE"){
   assert.equal(r.authorityScope,"GENERAL_ROMAN_VATICAN_DECREE");
   assert.match(r.publishedOn,/^20\d\d-\d\d-\d\d$/);
   assert.match(r.sourceUrl,/^https:\/\/(?:press|www)\.vatican\.va\//);
 } else assert.notEqual(r.authorityScope,"GENERAL_ROMAN_VATICAN_DECREE");
}
assert.equal(artMap.links.length,5);
assert.equal(artMap.approvedPlacePhotographs,2);
assert.equal(artMap.approvedPaintingCount,0);
assert.equal(artMap.rules.placePhotoIsNotPainting,true);
for(const link of artMap.links){
 assert.ok(places.has(link.placeId), "Unregistered geography place ID: "+link.placeId);
 assert.ok(byId.has(link.canonicalId)||groupIds.has(link.canonicalId));
 assert.equal(link.paintingArtworkId,null);
 assert.equal(link.paintingApproval,"NOT_CERTIFIED");
 if(link.placePhotoAsset){
   assert.ok(mediaPaths.has(link.placePhotoAsset),"Site photo must have reviewed licence and subject: "+link.placePhotoAsset);
   assert.equal(media.items.find(x=>x.asset_path===link.placePhotoAsset).place_id,link.placeId);
   assert.equal(link.photoApproval,"APPROVED_SITE_PHOTO_NOT_SACRED_PAINTING");
 }
 if(link.candidatePainting)assert.equal(link.candidatePainting.status,"ART_PIPELINE_RESEARCH_NOT_EDITORIALLY_APPROVED");
}
assert.deepEqual(get("2026-10-09").map(x=>x.id),["saint.john-henry-newman"]);
assert.deepEqual(get("2025-10-09").map(x=>x.id),[]);
assert.deepEqual(get("2026-09-05").map(x=>x.id),["saint.teresa-calcutta"]);
assert.ok(get("2026-09-05")[0].whyHonoured.includes("poorest"));
assert.ok(get("2026-02-27")[0].whyHonoured.includes("Armenian"));
assert.ok(get("2026-05-10")[0].whyHonoured.includes("priest"));
assert.ok(get("2026-09-17",{language:"fr"})[0].whyHonoured.includes("bénédictine"));
assert.ok(get("2026-10-09")[0].whyHonoured.includes("theologian"));
assert.deepEqual(get("2024-09-05").map(x=>x.id),[]);
assert.deepEqual(get("2026-02-27").map(x=>x.id),["saint.gregory-narek"]);
assert.deepEqual(get("2020-02-27").map(x=>x.id),[]);
assert.deepEqual(get("2026-05-10").map(x=>x.id),["saint.john-avila"]);
assert.deepEqual(get("2026-09-17").map(x=>x.id),["saint.hildegard-bingen"]);
assert.deepEqual(get("2026-07-09").map(x=>x.id),[],"US date witness is not automatically worldwide");
assert.deepEqual(get("2026-07-09",{jurisdiction:"US"}).map(x=>x.id),["canon-group.martyrs-china-1648-1930"]);
assert.deepEqual(get("2026-09-20",{jurisdiction:"US"}).map(x=>x.id),["canon-group.korean-martyrs-103"]);
const ug=get("2026-06-03",{jurisdiction:"US"})[0];
assert.equal(ug.id,"canon-group.uganda-martyrs-22");
assert.equal(ug.site.placeId,"place:UG:namugongo-martyrs");
assert.equal(ug.site.approvedSitePhotoPath,"assets/approved/place-media/UG-namugongo-martyrs.webp");
assert.equal(ug.site.mediaKind,"PHYSICAL_SITE_PHOTO_NOT_SACRED_PAINTING");
assert.equal(ug.approvedSacredPaintingId,null);
assert.equal(ug.requiresMartyrMemberEnumeration,false);
const lis=get("2026-10-01",{jurisdiction:"US",language:"fr"})[0];
assert.equal(lis.id,"saint.therese-lisieux");
assert.equal(lis.site.placeId,"place:FR:basilique-sainte-therese-lisieux");
assert.equal(lis.site.approvedSitePhotoPath,"assets/approved/place-media/FR-basilique-sainte-therese-lisieux.webp");
assert.ok(lis.whyHonoured.includes("petite voie"));
const pio=get("2026-09-23",{jurisdiction:"US"})[0];
assert.equal(pio.site.placeId,"place:IT:santuario-san-pio-rotondo");
assert.equal(pio.site.approvedSitePhotoPath,null);
assert.equal(pio.massSelectionAuthority,"NONE");
assert.equal(pio.changes1962Principal,false);
assert.deepEqual(get("2026-10-15",{jurisdiction:"US",observedPrincipalId:"sancti:10-15:3:w"}),[],"Already principal 1962 saint must not repeat");
assert.deepEqual(get("2026-10-01",{jurisdiction:"US",observedCommemorationIds:["sancti:10-03:3:w"]}),[],"Commemorated traditional saint must not be duplicated in secondary card");
assert.deepEqual(get("2026-10-01",{jurisdiction:"US",observedCommemorationIds:[{id:"sancti:10-03:3:w"}]}),[],"Commemoration object IDs also deduplicate");
assert.deepEqual(get("2026-10-01",{jurisdiction:"US",observedCommemorationIds:["sancti:09-29:1:w"]}).map(x=>x.id),["saint.therese-lisieux"],"Unrelated commemoration must not hide a saint");
assert.deepEqual(get("2026-10-15",{jurisdiction:"US"}).map(x=>x.id),["saint.teresa-avila"]);
assert.deepEqual(get("2026-06-28",{jurisdiction:"US"}),[],"2024 USCCB witness not projected as certified for 2026");
assert.deepEqual(get("2026-10-12"),[],"No universal calendar date was asserted for Carlo Acutis");
assert.equal(get("2026-09-28",{jurisdiction:"US"})[0].kind,"COLLECTIVE_MARTYR_PROFILE");
for(const c of [...get("2026-10-09"),...get("2026-09-20",{jurisdiction:"US"}),...get("2026-10-01",{jurisdiction:"US"})]){
 assert.equal(c.secondaryOnly,true);
 assert.equal(c.selectedFormularyId,null);
 assert.equal(c.massSelectionAuthority,"NONE");
 assert.equal(c.changes1962Principal,false);
 assert.equal(c.approvedSacredPaintingId,null);
 assert.ok(Object.isFrozen(c));
}
assert.throws(()=>get("2026-02-30"),TypeError);
console.log("Living sanctoral reviewed cards: PASS (14 date witnesses; five universal decrees, 5 real place IDs, two approved *site photos*, no Mass/artwork substitution)");
