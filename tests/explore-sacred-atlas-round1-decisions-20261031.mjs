import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const approved=read("data/geography/research/sacred-atlas-chat-photo-decisions-round1-20261031.v1.json");
const places=read("data/geography/seed-registry.v1.json").places;
const subjects=read("data/geography/research/exact-sacred-subject-photo-inventory-20261031.v1.json").subjects;
const relics=read("data/explore/sacred-phenomena-seed.v1.json").relics;
const files=read("data/geography/approved-place-media.v1.json").items;
const galleries=read("data/geography/approved-place-gallery.v1.json").items;
const placeById=new Map(places.map(x=>[x.place_id,x]));
const subjectById=new Map(subjects.map(x=>[x.subject_id,x]));
const relicById=new Map(relics.map(x=>[x.id,x]));
assert.equal(approved.schema,"AO_SACRED_ATLAS_CHAT_PHOTO_DECISIONS_V1");
assert.equal(approved.batch,1);
assert.equal(approved.total_votes,20);
assert.equal(approved.decisions.length,20);
assert.equal(approved.all_votes,"KEEP");
assert.deepEqual(approved.decisions.map(x=>x.number),Array.from({length:20},(_,i)=>i+1));
assert.equal(new Set(approved.decisions.map(x=>x.place_id)).size,20,
 "Round 1 contains twenty distinct canonical Place owners");
const expectedSites=[
 "place:IE:knock-shrine","place:FR:sanctuaire-notre-dame-de-lourdes",
 "place:FR:espace-bernadette-nevers","place:IT:basilica-sant-antonio-padova",
 "place:PT:fatima-sanctuary","place:PL:jasna-gora",
 "place:MX:basilica-guadalupe-mexico-city","place:IT:loreto-santa-casa",
 "place:DE:altoetting-gnadenkapelle","place:AT:mariazell-basilica",
 "place:FR:sanctuary-of-our-lady-of-rocamadour","place:IE:st-peters-oliver-plunkett-drogheda",
 "place:IN:basilica-bom-jesus-old-goa","place:GB:walsingham-catholic-shrine",
 "place:FR:chartres-notre-dame","place:BR:aparecida-national-shrine",
 "place:CA:sainte-anne-de-beaupre","place:FR:sanctuaire-sacre-coeur-paray",
 "place:BE:banneux","place:FR:notre-dame-la-salette-fallavaux"
];
assert.deepEqual(approved.decisions.map(x=>x.place_id),expectedSites,
 "User's 20 review-order Place identities must remain exact");
for(const row of approved.decisions){
 assert(placeById.has(row.place_id),row.number+" must refer to a canonical Place");
 assert.equal(row.decision,"KEEP");
 assert.equal(row.candidate_state,"USER_ACCEPTED_PREVIEW_UNPINNED");
 assert.equal(row.decision_scope,"EDITORIAL_APPROVAL_OF_USER_SHOWN_PREVIEW_SUBJECT_AND_PHOTO_CHOICE");
 assert(row.displayed_image_search_query?.startsWith("Wikimedia Commons "));
 assert(row.identity_warning?.length>15);
 assert.equal(row.confirmed_commons_file_id,null,"Do not invent a specific Commons file ID");
 assert.equal(row.confirmed_commons_file_url,null,"Do not invent an original Commons page");
 assert.equal(row.confirmed_image_bytes_sha256,null);
 for(const field of [
  "identity_verified","photographer_rights_verified","underlying_artwork_rights_verified",
  "source_original_downloaded","high_resolution_quality_approved",
  "media_asset_created","published"
 ])assert.equal(row[field],false,field+" cannot be inferred from a chat preview");
 if(row.subject_registry_link_status==="LINKED_TO_EXISTING_EXACT_SUBJECT"){
  assert.equal(subjectById.get(row.subject_id)?.place_id,row.place_id);
 }else{
  assert.equal(row.subject_registry_link_status,"ROUND1_REVIEW_ID_NOT_YET_PROMOTED_TO_SOURCE_REGISTRY");
  assert.equal(subjectById.has(row.subject_id),false);
 }
 if(row.canonical_relic_id){
  assert.equal(relicById.get(row.canonical_relic_id)?.place_id,row.place_id);
 }
}
assert.equal(approved.decisions.filter(r=>r.subject_registry_link_status==="LINKED_TO_EXISTING_EXACT_SUBJECT").length,8);
assert.equal(approved.decisions.filter(r=>r.subject_registry_link_status==="ROUND1_REVIEW_ID_NOT_YET_PROMOTED_TO_SOURCE_REGISTRY").length,12);
assert(approved.preservation_policy.includes("Does not change any existing user approvals"));
assert(approved.caution.includes("Exact image file IDs"));
assert(files.length>=100&&galleries.length>=30,
 "Existing publication owners are read-only, never replaced by research choices");
console.log("Sacred Atlas Round 1: 20/20 KEEP, 20 exact Places, 8 linked research subjects, 12 held for identity, 0 images promoted PASS");
