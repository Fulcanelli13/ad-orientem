import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const pack=read("data/directory/generated/v19/sspx-asia-central-americas.v1.json");
const ledger=read("data/directory/research/sspx-asia-central-americas-review-20261008.v1.json");
const records=pack.records,held=ledger.holds;
assert.equal(pack.provider,"SSPX_ASIA_CENTRAL_AMERICAS_20261008");
assert.equal(records.length,47);
assert.equal(records.filter(r=>r.ps==="CONDITIONAL_MASS").length,25);
assert.equal(held.length,27);
assert.equal(ledger.official_asia_index_count,52);
assert.equal(ledger.asia_published_candidate_count,36);
assert.equal(ledger.asia_hold_count,16);
assert.equal(ledger.central_official_source_count,15);
assert.equal(ledger.central_published_candidate_count,7);
assert.equal(ledger.central_hold_count,8);
assert.equal(ledger.south_america_published_count,4);
assert.equal(ledger.south_america_hold_count,3);
assert.equal(records.filter(r=>r.source_directory==="ASIA").length,36);
assert.equal(records.filter(r=>r.source_directory==="CENTRAL_AMERICA").length,7);
assert.equal(records.filter(r=>r.source_directory==="SOUTH_AMERICA_REMAINDER").length,4);
const ids=new Set(),physical=new Set();
for(const record of records){
  assert.ok(record.u.startsWith("SSPX-OCT26-ACAS-"));
  assert.ok(["CURRENT_PUBLIC_MASS","CONDITIONAL_MASS"].includes(record.ps));
  assert.ok(record.su.startsWith("https://"),record.u+": missing source");
  assert.ok(record.a.length>=18,record.u+": physical location missing");
  assert.ok(record.sr.length>=10,record.u+": Mass proof missing");
  assert.equal(record.source_checked_on,"2026-10-08");
  assert.ok(!ids.has(record.u),"repeated provider venue id "+record.u);
  ids.add(record.u);
  const key=record.cc+"|"+record.a.normalize("NFKD")
    .toLowerCase().replace(/[^a-z0-9]+/g,"");
  assert.ok(!physical.has(key),"duplicate physical chapel "+record.u);
  physical.add(key);
}
assert.equal(records.filter(r=>r.cc==="PH").length,22);
assert.equal(records.filter(r=>r.cc==="IN").length,7);
assert.ok(!records.some(r=>/Philippines.*School of Quezon City|Servi Domini|Coonoor/i.test(r.n)));
assert.ok(!records.some(r=>r.cc==="PA"),"Conflicting Panama venue accidentally promoted");
assert.ok(!records.some(r=>r.cc==="AE"||r.cc==="ID"||r.cc==="HK"),
  "No-address monthly mission incorrectly published");
assert.ok(!records.some(r=>r.cc==="AR"&&r.l==="Pilar"),"Postal-box-only convent published");
const sv=records.find(r=>r.cc==="SV");
assert.equal(sv.su,"https://centroamerica.fsspx.org/es/mision-san-pio-x-san-salvador-30836");
assert.ok(sv.a.includes("Calle Arce No. 910"));
assert.ok(held.some(h=>h.district==="CENTRAL_AMERICA"&&h.name.includes("Panama")&&
  h.state==="CONFLICTING_PHYSICAL_ADDRESS"));
assert.ok(held.some(h=>h.district==="ASIA"&&h.name.includes("Catholic School")&&
  h.state==="INSTITUTION_NOT_PUBLIC_CHAPEL"));
assert.equal(new Set(held.map(h=>h.district+":"+h.source_identifier)).size,held.length);
console.log("SSPX Asia, Central America & SA remainder: PASS — 47 sites, 25 conditional, 27 held");
