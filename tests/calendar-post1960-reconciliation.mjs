import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {reconcileSaintPersonRecords} from "../src/calendar/sanctoral-person-reconciliation.js";
import {saintRecognitionAt,supplementarySaintsForDate} from "../src/calendar/living-sanctoral.js";
const pilot=JSON.parse(readFileSync(new URL("../data/calendar/living-sanctoral-pilot.v1.json",import.meta.url),"utf8"));
const census=JSON.parse(readFileSync(new URL("../data/calendar/post1960-canonizations.official-batch1.v1.json",import.meta.url),"utf8"));
const people=reconcileSaintPersonRecords(pilot.persons,census);
assert.equal(people.length,261,"Six pilot people + 258 official named, 3 shared identities");
const ids=new Set(people.map(x=>x.id));assert.equal(ids.size,261);
assert.equal(people.filter(x=>x.sourceReconciliation?.existingRecordKept).length,3);
for(const id of ["saint.john-henry-newman","saint.carlo-acutis","saint.pio-pietrelcina"]){
 const x=people.find(p=>p.id===id);
 assert.equal(x.sourceReconciliation.existingRecordKept,true);
 assert.equal(x.recognition.canonizedOn,census.persons.find(p=>p.id===id).canonizedOn);
}
assert.ok(census.groups.every(g=>!ids.has("saint."+g.id)));
assert.ok(ids.has("saint.louis-martin") && ids.has("saint.zelie-guerin"));
assert.ok(ids.has("saint.hildegard-bingen"));
assert.ok(ids.has("saint.john-avila"),"1970 saint reuses the 2012 Doctor identity");
const conflicted=people.find(p=>p.id==="saint.jadwiga-queen-poland");
assert.equal(conflicted.publicationHold,undefined,"Papal homily has resolved Queen Jadwiga identity");
assert.ok(conflicted.reviewFlags.includes("DICASTERY_1997_BIOGRAPHY_APPARENTLY_CONFLATES_HEDWIG_SILESIA"));
assert.equal(conflicted.identityAdjudication.status,"CERTIFIED_IDENTITY_BY_PAPAL_CANONIZATION_HOMILY");
assert.equal(conflicted.identityAdjudication.sourceUrl,"https://www.vatican.va/content/john-paul-ii/en/homilies/1997/documents/hf_jp-ii_hom_19970608_cracovia.html");
const hypotheticalConflict=structuredClone(conflicted);
hypotheticalConflict.observances=[{calendar:"CURRENT_ROMAN_GENERAL",monthDay:"06-08",sourceIds:["example-only"],publishedOn:"1997-06-08"}];
assert.deepEqual(supplementarySaintsForDate("2026-06-08",[hypotheticalConflict]).map(x=>x.personId),["saint.jadwiga-queen-poland"],"Papal-homily-adjudicated identity can be presented when an independently sourced memorial is later added");

assert.equal(people.find(p=>p.id==="saint.francisco-marto").recognition.canonizedOn,"2017-05-13");
assert.equal(saintRecognitionAt(people.find(p=>p.id==="saint.teresa-calcutta"),"2015-09-05").recognizedAsSaint,false);
assert.equal(saintRecognitionAt(people.find(p=>p.id==="saint.teresa-calcutta"),"2017-09-05").recognizedAsSaint,true);
assert.equal(supplementarySaintsForDate("2026-09-05",people).length,0,"No unsupported universal feast from canonization alone");
assert.deepEqual(supplementarySaintsForDate("2026-10-09",people).map(x=>x.personId),["saint.john-henry-newman"]);
const mutated=structuredClone(census);
mutated.persons.find(x=>x.id==="saint.john-henry-newman").canonizedOn="2018-10-13";
assert.throws(()=>reconcileSaintPersonRecords(pilot.persons,mutated),/source conflict|identity conflict/);
assert.equal(Object.isFrozen(people),true);
console.log("Living sanctoral source reconciliation: PASS (261 canonical people, 3 reused IDs, 13 group records kept separate)");
