import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 PRAYER_ART_EDITORIAL_SLOTS_V1,PRAYER_ART_EDITORIAL_PROVENANCE_V1,prayerEditorialSlot
} from "../src/pray/editorial-artwork-assignments.v1.js";
import {resolvePrayerEditorialArtwork,prayerEditorialArtworkMarkup,prayerEditorialPublicationSummary,PRAY_DOOR_ART_SLOTS_V1,hasReleasedDoorPainting} from "../src/pray/art-slot-map.v1.js";
import {RELEASED_MODULE_PAINTINGS} from "../src/art/released-module-paintings.v1.js";

const source=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const master=JSON.parse(source("data/prayer/artwork-editorial-20261101/curatorial-master-267-20261101.v1.json"));
const entries=master.assignments;
const ids=entries.map(a=>a.slot);
assert.equal(master.publicationAllowed,false,"The editorial research master does not itself authorise image publication");
assert.equal(entries.length,267);
assert.equal(new Set(ids).size,267);
assert.deepEqual(Object.keys(PRAYER_ART_EDITORIAL_SLOTS_V1).sort(),ids.slice().sort());
assert.equal(PRAYER_ART_EDITORIAL_PROVENANCE_V1.sourceBlob,"96f2d9526a84ec9ab56df7183edd0bb2c017ecde");
assert.equal(PRAYER_ART_EDITORIAL_PROVENANCE_V1.approvedOrInherited,244);
assert.equal(PRAYER_ART_EDITORIAL_PROVENANCE_V1.provisional,23);
assert.equal(master.count.primaryHolds20261101,14);
const covered=entries.filter(a=>a.userAlreadyCoveredByPriorApprovalOrInheritance===true);
assert.equal(covered.length,244);

for(const a of entries){
 const row=prayerEditorialSlot(a.slot),result=resolvePrayerEditorialArtwork(a.slot);
 assert.ok(row&&result);
 assert.equal(row.kind,a.kind,a.slot);
 assert.equal(row.approvedOrInherited,!!a.userAlreadyCoveredByPriorApprovalOrInheritance,a.slot);
 assert.equal(row.editorialStatus,a.editorialStatus,a.slot);
 assert.equal(row.selected?.title||null,a.currentAssignment?.painting?.title||null,a.slot);
 assert.equal(row.selected?.artist||null,a.currentAssignment?.painting?.artist||null,a.slot);
 assert.equal(row.selected?.sourcePage||null,a.currentAssignment?.painting?.sourcePage||null,a.slot);
 assert.equal(row.sourceIdentityVerified,a.sourceCrosswalk?.sourceIdentityVerified===true,a.slot);
 const held=a.editorialStatus==="EDITORIAL_HOLD_DO_NOT_USE"||
  a.currentAssignment?.mode==="HOLD_NO_ELIGIBLE_PRIMARY"||
  a.sourceCrosswalk?.method==="HOLD_NOT_AN_ACTIVE_PAINTING"||
  a.sceneAndScopeAudit?.holdForExactSlotPublication===true;
 assert.equal(row.hold,!!held,a.slot);
 if(result.photo){
  assert.equal(result.state,"PUBLISHED_EXACT_PHOTO");
  assert.equal(row.hold,false,a.slot);
  assert.equal(row.protectedCover,false,a.slot);
  assert.equal(row.approvedOrInherited,true,a.slot);
  assert.equal(row.sourceIdentityVerified,true,a.slot);
  assert.ok(RELEASED_MODULE_PAINTINGS[result.artId],a.slot);
  if(a.slot!=="DOOR-D5")assert.equal(row.selected?.sourcePage,result.photo.source,
   "Exact source URL, not an inferred subject or similar painting: "+a.slot);
 }
}
assert.equal(Object.values(PRAYER_ART_EDITORIAL_SLOTS_V1).filter(x=>x.hold).length,15,
 "14 primary holds plus 1 additional scope hold must remain quarantined");
const counts=prayerEditorialPublicationSummary();
assert.equal(counts.total,267);
assert.ok(counts.states.APPROVED_EXACT_PHOTO_PENDING>100);
assert.equal(resolvePrayerEditorialArtwork("HERO-05").state,"PROVISIONAL_NOT_PUBLISHED",
 "A released Murillo photo does not turn a provisional Septuagesima hero into an approval");
assert.equal(resolvePrayerEditorialArtwork("HERO-03").state,"SCOPE_HOLD",
 "A Visit to the Blessed Sacrament approval does not imply Epiphany hero approval");
for(const id of ["COV-pray.penitential_psalms","STG-pray.rosary-16",
 "COV-pray.montfort_consecration","COV-pray.for_priests"])
 assert.equal(resolvePrayerEditorialArtwork(id).state,"EDITORIAL_HOLD",id);
for(const id of ["COV-pray.rosary","COV-prayer.seven_sorrows_chaplet",
 "COV-novena.st_therese","COV-pray.confession"])
 assert.equal(resolvePrayerEditorialArtwork(id).state,"PROTECTED_EXISTING_COVER",id);

for(const [id,art] of [
 ["DOOR-D5","adoration"],["COV-pray.angelus_regina","regina"],
 ["COV-foundations_hail_mary","angelus"],["COV-devotion_memorare_st_joseph","joseph"],
 ["STG-pray.rosary-12","regina"]
]){
 const v=resolvePrayerEditorialArtwork(id);
 assert.equal(v.state,"PUBLISHED_EXACT_PHOTO",id);
 assert.equal(v.artId,art,id);
 assert.match(prayerEditorialArtworkMarkup(id),/data-ao-editorial-slot=/);
}
for(const id of ["COV-dead_de_profundis","COV-foundations_eternal_rest"]){
 const v=resolvePrayerEditorialArtwork(id);
 assert.equal(v.state,"APPROVED_EXACT_PHOTO_PENDING",id);
 assert.match(v.editorial.selected.title,/Saint Teresa of Avila Interceding for Souls in Purgatory/);
 assert.equal(v.photo,null,"Giordano may not replace the exact approved Rubens source");
 assert.equal(prayerEditorialArtworkMarkup(id),"");
}
const doors=Object.values(PRAY_DOOR_ART_SLOTS_V1);
assert.equal(doors.length,9);
assert.ok(doors.every(d=>d.editorialAssigned===true));
assert.ok(doors.every(d=>d.editorialSource==="CURATORIAL_MASTER_267_PR2144"));
assert.ok(doors.every(d=>d.publicationState!=="UNASSIGNED"));
assert.equal(PRAY_DOOR_ART_SLOTS_V1.daily.publicationState,"INHERITED_POOL_NO_FIXED_PAINTING");
assert.equal(PRAY_DOOR_ART_SLOTS_V1.eucharistic.publicationState,"PUBLISHED_EXACT_PHOTO");
assert.equal(hasReleasedDoorPainting(PRAY_DOOR_ART_SLOTS_V1.eucharistic),true);
assert.equal(hasReleasedDoorPainting(PRAY_DOOR_ART_SLOTS_V1.library),false);

const pilot=source("src/pray/prayer-design-pilot.js");
const runtime=source("src/pray/presentation-runtime.js");
assert.match(pilot,/resolvePrayerEditorialArtwork\(slot\.slotId\)/);
assert.doesNotMatch(pilot,/tile\.id==="eucharistic"\?releasedModulePhoto/,
 "Never hard-code just one Prayer door again");
assert.match(runtime,/prayerEditorialArtworkMarkup\("COV-"\+LIB\.open/);
assert.match(runtime,/prayerEditorialArtworkMarkup\('COV-'\+id/);
assert.doesNotMatch(runtime,/const soulsCover=\['dead_de_profundis'/,
 "Do not silently publish the wrong Giordano artwork for two approved Rubens covers");
assert.ok(!runtime.includes("EDITORIAL_HOLD_DO_NOT_USE"),"Do not embed research decision rules in the Prayer renderer");
console.log("PASS Prayer editorial artwork: 267 source-identical slots, 244 prior approved/inherited, 15 holds, nine doors, exact-source released joins and no Giordano substitutions");
