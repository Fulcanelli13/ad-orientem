import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAYER_SUBJECT_GUIDED_LINKS_V1,guidedPrayerLinksForSubject} from "../src/pray/prayer-subject-guided-links.v1.js";
import {PRAYER_SUBJECTS_V1,PRAYER_CANONICAL_SUBJECT_IDS_V1} from "../src/pray/prayer-subject-index.v1.js";
import {supportedDirectPrayerRoute} from "../src/pray/internal-route-owner.js";
const want=Object.freeze({
 II:["pray.five_wounds","pray.precious_blood","pray.little_crown","pray.seven_words"],
 VI:["pray.st_joseph_seven_sorrows"],
 VII:["pray.for_priests","pray.occasional_intercessions"]
});
assert.equal(PRAYER_SUBJECT_GUIDED_LINKS_V1.length,7);
assert.equal(new Set(PRAYER_SUBJECT_GUIDED_LINKS_V1.map(x=>x.id)).size,7);
for(const subject of PRAYER_SUBJECTS_V1){
 assert.deepEqual(guidedPrayerLinksForSubject(subject.id).map(x=>x.id),want[subject.id]||[],subject.id+" incorrect guided subjects");
}
assert.deepEqual(guidedPrayerLinksForSubject("all"),[]);
for(const entry of PRAYER_SUBJECT_GUIDED_LINKS_V1){
 assert.ok(supportedDirectPrayerRoute(entry.id),entry.id+" not registered in original live route table");
 assert.ok(PRAYER_SUBJECTS_V1.some(s=>s.id===entry.subject));
 assert.ok(entry.en?.length>7&&entry.fr?.length>7);
 assert.ok(entry.descriptionEn?.length>15&&entry.descriptionFr?.length>15);
 assert.ok(!(entry.id in PRAYER_CANONICAL_SUBJECT_IDS_V1),"Do not create duplicate canonical prayer identity");
}
const presentation=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
for(const c of [
 'guidedPrayerLinksForSubject(LIB.subject)',
 'data-ao-prayer-subject-guided',
 "prayFamilyItem(['own',item.id",
 'data-p435930-own',
 'internalPrayerView(id)',
 'pushView();routeOwn(id)',
 'function renderRosary()',
 'function renderConfession()',
 'function renderAdoration()',
 'function renderBenediction()'
])assert.ok(presentation.includes(c),"Source-owned reader handoff missing "+c);
console.log("PASS seven existing original guide routes in 3 theological subject families; no duplicate reader or unsourced text");
