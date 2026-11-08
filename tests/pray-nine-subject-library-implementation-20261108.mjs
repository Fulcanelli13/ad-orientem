import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {
 PRAYER_SUBJECTS_V1,PRAYER_CANONICAL_SUBJECT_IDS_V1,
 prayerSubjectFor,prayerSubjectsForLibrary,prayerSubjectCounts
} from "../src/pray/prayer-subject-index.v1.js";

const core=PRAY_CANONICAL_DATA_V435930.prayers,records=Object.values(core);
assert.equal(Object.keys(core).length,48,"The established canonical Prayer bank must remain 48 source records");
assert.deepEqual(PRAYER_SUBJECTS_V1.map(x=>x.id),["I","II","III","IV","V","VI","VII","VIII","IX"]);
assert.equal(new Set(PRAYER_SUBJECTS_V1.map(x=>x.en)).size,9);
assert.equal(new Set(PRAYER_SUBJECTS_V1.map(x=>x.fr)).size,9);
assert.equal(Object.keys(PRAYER_CANONICAL_SUBJECT_IDS_V1).length,46,"Only 46 approved published independent prayer identities may enter the initial subject index");
assert.ok(Object.keys(PRAYER_CANONICAL_SUBJECT_IDS_V1).every(id=>!!core[id]),"A subject index cannot link unapproved or missing source text");
assert.ok(Object.values(PRAYER_CANONICAL_SUBJECT_IDS_V1).every(id=>PRAYER_SUBJECTS_V1.some(s=>s.id===id)));
const counted=prayerSubjectCounts(records);
assert.equal(counted.total,48);
assert.equal(counted.unmapped,2,"Unclassified legacy records remain available under All, never silently omitted");
assert.deepEqual(counted.counts,{I:12,II:4,III:10,IV:2,V:6,VI:6,VII:1,VIII:3,IX:2});
assert.equal(Object.values(counted.counts).reduce((a,b)=>a+b,0),46);
for(const s of PRAYER_SUBJECTS_V1){
 const visible=prayerSubjectsForLibrary(records,s.id);
 assert.equal(visible.length,counted.counts[s.id],s.id+" wrong original prayer count");
 assert.ok(visible.every(p=>prayerSubjectFor(p.id)===s.id&&core[p.id]===p));
}
assert.equal(prayerSubjectsForLibrary(records).length,48);
assert.equal(prayerSubjectsForLibrary(records,"invalid").length,0);
assert.equal(prayerSubjectFor("source-only-office_dead_vespers_1960"),null);
assert.equal(prayerSubjectFor("pray.confession"),null,"Reader route is not a new canonical prayer text identity");
assert.equal(prayerSubjectFor("foundations_hail_mary"),"V");
assert.equal(prayerSubjectFor("weekday_magnificat"),"VIII");
assert.equal(prayerSubjectFor("sacrament_come_holy_spirit"),"IV");
assert.equal(prayerSubjectFor("foundations_eternal_rest"),"IX");
const ui=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
for(const contract of [
 'import {PRAYER_SUBJECTS_V1,prayerSubjectsForLibrary,prayerSubjectCounts}',
 'data-ao-prayer-subject-browser',
 'data-p435930-lib-subject',
 'prayerSubjectsForLibrary(rows,LIB.subject)',
 'LIB.subject=id;LIB.subjectOpen=true;LIB.cat=\'all\'',
 "LIB.subject='all';LIB.subjectOpen=false",
 'renderLibraryEntryRows(rows,q)',
 'function renderPrayHome()',
 'function renderRosary()',
 'function renderConfession()',
 'function renderAdoration()',
 'function renderBenediction()'
])assert.ok(ui.includes(contract),"Existing protected Prayer reader/browser contract absent: "+contract);
console.log("PASS implementation: nine theological families, 46 mapped of 48 existing canonical records; no research-only import or specialised reader mutation");
