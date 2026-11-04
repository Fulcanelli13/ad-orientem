import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {prayerEditorialSlot} from "../src/pray/editorial-artwork-assignments.v1.js";
import {resolvePrayerEditorialArtwork,prayerEditorialPublicationSummary} from "../src/pray/art-slot-map.v1.js";
import {plannedPrayerArtworkSlot} from "../src/pray/planned-photo-slots.v1.js";

const slots={
 sevenWords:["STG-pray.seven_words-01","STG-pray.seven_words-02","STG-pray.seven_words-04","STG-pray.seven_words-05"],
 fiveWounds:["STG-pray.five_wounds-02","STG-pray.five_wounds-03"],
 preciousBlood:["STG-pray.precious_blood-02","STG-pray.precious_blood-04"],
 joseph:["STG-pray.st_joseph_seven_sorrows-02","STG-pray.st_joseph_seven_sorrows-04"],
 benediction:["STG-pray.benediction-02"],
 litany:["STG-pray.litany_saints-03","STG-pray.litany_saints-05"],
 penitential:["STG-pray.penitential_psalms-06"],
 stations:["COV-pray.stations"]
};
const all=Object.values(slots).flat();
assert.equal(Object.keys(slots).length,8);
assert.equal(all.length,15);
assert.equal(new Set(all).size,15);
for(const [owner,ids] of Object.entries(slots))for(const id of ids){
 const row=prayerEditorialSlot(id);
 assert.ok(row,"Missing editorial slot: "+id);
 assert.equal(row.approvedOrInherited,true,id);
 assert.equal(row.hold,false,id);
 assert.equal(row.protectedCover,false,id);
 assert.equal(row.sourceIdentityVerified,true,id);
 assert.ok(row.selected?.sourcePage?.startsWith("https://"));
 const state=resolvePrayerEditorialArtwork(id);
 assert.equal(state.state,"APPROVED_EXACT_PHOTO_PENDING",
   "Do not silently publish artwork not cleared for real photograph");
 const html=plannedPrayerArtworkSlot(id,{owner,className:"aoPrayerEditorialCardCover"});
 assert.ok(html.includes('data-ao-prayer-photo-pending="'+id+'"'),id);
 assert.ok(html.includes('data-ao-photo-publication="pending"'),id);
 assert.ok(html.includes('data-ao-prayer-photo-owner="'+owner+'"'),id);
 assert.ok(!/<img\b|<figure\b|src=/.test(html),"No photo until cleared: "+id);
}
assert.equal(prayerEditorialPublicationSummary().states.PUBLISHED_EXACT_PHOTO,51,
  "Baseline release count shifted; re-audit first");
assert.equal(plannedPrayerArtworkSlot("COV-pray.rosary"),"","Original signature Rosary must remain separate");
assert.equal(plannedPrayerArtworkSlot("STG-pray.rosary-06"),"");
assert.equal(plannedPrayerArtworkSlot("HERO-04"),"","Home artwork must not enter Prayer reader");
assert.equal(plannedPrayerArtworkSlot("DOOR-D2"),"","Door artwork has separate owner");
assert.equal(plannedPrayerArtworkSlot("DOES-NOT-EXIST"),"");
const source=readFileSync("src/pray/presentation-runtime.js","utf8");
assert.match(source,/from "\.\/planned-photo-slots\.v1\.js"/);
for(const [owner,pattern] of Object.entries({
 sevenWords:/owner:'seven-words-word'/,
 fiveWounds:/owner:'five-wounds-group'/,
 preciousBlood:/owner:'precious-blood-mystery'/,
 joseph:/owner:'joseph-sorrow-and-joy'/,
 benediction:/owner:'benediction-hymn-author'/,
 litany:/owner:'litany-saints-section'/,
 penitential:/owner:'penitential-psalm-six'/,
 stations:/owner:'stations-entry'/
}))assert.match(source,pattern,owner+" lacks an exact source-owner mount");
assert.match(source,/progress\.group===2\|\|progress\.group===3/);
assert.match(source,/s\.phase===2\|\|s\.phase===4/);
assert.match(source,/\[1,2,4,5\]\.includes\(i\+1\)/);
assert.match(source,/\[1,3\]\.includes\(JOSEPH_SEVEN\.step\)/);
assert.match(source,/id==='hymn'\?plannedPrayerArtworkSlot/);
assert.match(source,/\[2,4\]\.includes\(LIT\.step\)/);
assert.match(source,/i===5\?plannedPrayerArtworkSlot/);
assert.match(source,/i===0\?plannedPrayerArtworkSlot\('COV-pray\.stations'/);
assert.ok(!source.includes("prayer-r5d-reader-preview"),
  "QA-only research source images cannot be imported in released runtime");
// Module graph must remain valid on both server-like and browser bundlers.
await import("../src/pray/presentation-coherence.js");
console.log("PASS 15 real-route art anchors across eight Prayer experiences, all fail closed. Original Rosary unchanged.");
