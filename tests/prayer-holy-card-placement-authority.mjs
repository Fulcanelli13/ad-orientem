import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolvePrayerEditorialArtwork,prayerEditorialArtworkMarkup,
 PRAYER_UNRELEASED_HOLY_CARD_SLOTS_V1}
 from "../src/pray/art-slot-map.v1.js";
import {claudeHolyCard} from "../src/pray/claude-holy-card.js";
const master=JSON.parse(readFileSync(new URL(
 "../data/prayer/artwork-editorial-20261101/curatorial-master-267-20261101.v1.json",
 import.meta.url),"utf8"));
const row=master.assignments.find(x=>x.slot==="COV-sacrament_act_of_contrition");
assert.ok(row,"Editorial source master no longer contains the exact cover assignment");
assert.equal(row.currentAssignment?.painting?.title,"The Penitent Magdalen");
assert.equal(row.previousApprovedArtReuses?.[0]?.from,"STG-pray.confession-02");
assert.equal(row.noApprovalGranted,true);
assert.equal(row.productionEnabled,false);
assert.equal(row.currentAssignment.productionEnabled,false);
assert.equal(row.sourceCrosswalk?.photoRightsAndPixelQAPassed,false);
assert.deepEqual(PRAYER_UNRELEASED_HOLY_CARD_SLOTS_V1,
 ["COV-sacrament_act_of_contrition"]);
const cover=resolvePrayerEditorialArtwork(row.slot);
assert.equal(cover.slotId,row.slot);
assert.equal(cover.state,"CARD_SPECIFIC_REUSE_NOT_PUBLICATION_APPROVED");
assert.equal(cover.photo,null);
assert.equal(cover.artId,null);
assert.equal(prayerEditorialArtworkMarkup(row.slot),"");
const releasedConfession=resolvePrayerEditorialArtwork("STG-pray.confession-02");
assert.equal(releasedConfession.state,"PUBLISHED_EXACT_PHOTO",
 "Only the unapproved Holy Card placement must be withheld");
assert.equal(releasedConfession.photo?.title,"The Penitent Magdalen");
const artUrl=cover.photo?.image?"/"+cover.photo.image:"";
const html=claudeHolyCard({id:"sacrament_act_of_contrition",
 p:{title:"Act of Contrition",la:"Deus meus, ex toto corde poenitet me.",
 en:"O my God, I am heartily sorry for having offended Thee."},
 face:"en",esc:x=>String(x).replaceAll("&","&amp;"),artUrl});
assert.match(html,/data-ao-essential-card="sacrament_act_of_contrition"/);
assert.doesNotMatch(html,/<img\b/i,
 "The placeholder Holy Card may not inherit a licensed photo from an unapproved placement");
assert.equal(resolvePrayerEditorialArtwork("DOOR-D5").state,"PUBLISHED_EXACT_PHOTO",
 "A valid independent user-approved Door artwork must remain published");
console.log("PASS Holy Card cover-specific approval hold; original La Tour Confession stage and approved Door art preserved");
