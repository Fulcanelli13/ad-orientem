import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const p=JSON.parse(readFileSync(new URL("../data/calendar/sacred-art-2026-hero-assignment-master-20261021.v1.json",import.meta.url),"utf8"));
const c=p.counts;
assert.equal(p.freeOnlyAndNoContacts,true);
assert.equal(p.noPaidImages,true);
assert.equal(p.noEmails,true);
assert.equal(p.publishedProductionCountVerified,0);
assert.equal(p.sundays.length,52);
assert.equal(p.classI.length,53);
assert.equal(p.optionalSpotlights.length,17);
assert.equal(c.classIWithApprovedDateSelection,10);
assert.equal(c.sundayWithApprovedDateSelection,5);
assert.equal(c.classIWithPriorApprovedArtworkIDsAsPoolLeads,40);
const dates=[...new Set([...p.sundays,...p.classI,...p.optionalSpotlights].map(x=>x.date))];
assert.equal(dates.length,102);
const all=[...p.sundays,...p.classI,...p.optionalSpotlights];
for(const row of all){
  assert.match(row.date,/^2026-\d\d-\d\d$/);
  assert.equal(row.productionHeroReleased,false);
  assert.ok(["NOT_DATE_ASSIGNED","CURATOR_APPROVED_EXACT_DATE"].includes(row.approvedDateHero.state));
}
const expected=new Map([
["2026-03-29","Anthony van Dyck"],
["2026-04-02","Ugolino da Siena"],
["2026-05-23","Juan Bautista Maíno"],
["2026-05-24","Jean II Restout"],
["2026-05-27","Philippe de Champaigne"],
["2026-06-12","Juan Patricio Morlete Ruiz"],
["2026-10-25","Ambrosius Benson"],
["2026-11-01","Carlo Saraceni"],
["2026-11-02","Ludovico Carracci"],
["2026-11-29","John Martin"]
]);
for(const [date,artist] of expected){
  const rows=all.filter(x=>x.date===date);
  assert.ok(rows.length>0,date);
  assert.ok(rows.every(x=>x.approvedDateHero.state==="CURATOR_APPROVED_EXACT_DATE" && x.approvedDateHero.artist===artist),date+" must retain approval");
}
assert.equal(all.filter(x=>x.approvedDateHero.state==="CURATOR_APPROVED_EXACT_DATE" && !expected.has(x.date)).length,0);
assert.equal(p.sundays.filter(x=>x.sourceLeadCount===0).length,23);
console.log("2026 HERO MATRIX PASS: 52 Sundays, 53 Class I, 17 optional, 102 distinct dates, 10 immutable assignments, 40 Class I with historically approved pool leads; zero photo releases or contacts.");
