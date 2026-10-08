import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=x=>JSON.parse(readFileSync(x,"utf8"));
const ids=["sspx-oct26-europe","sspx-oct26-americas","sspx-oct26-poland"];
const groups=ids.map(id=>read("data/directory/generated/v19/"+id+".v1.json"));
const records=groups.flatMap(x=>x.records);
const held=read("data/directory/research/sspx-oct26-multiregion-holds.v1.json");
assert.deepEqual(groups.map(g=>g.records.length),[61,44,38]);
assert.equal(records.length,143);
assert.equal(records.filter(x=>x.ps==="CONDITIONAL_MASS").length,33);
assert.equal(held.withheld_venue_count,6);
assert.equal(held.held_venues.length,6);
assert.equal(held.poland_irregular_venue_holds.length,4);
const keys=new Set(),addresses=new Set();
const normalized=x=>String(x).normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replace(/[^a-z0-9]/g,"");
for(const r of records){
 assert.equal(r.cc.length,2);
 assert.ok(["CURRENT_PUBLIC_MASS","CONDITIONAL_MASS"].includes(r.ps));
 assert.ok(r.u.startsWith("SSPX-OCT26-"));
 assert.ok(r.su.startsWith("https://"),r.u+": missing official source URL");
 assert.ok(r.a.length>=15,r.u+": physical address too imprecise");
 assert.ok(r.sr.trim().length>=10,r.u+": explicit Mass schedule evidence missing");
 assert.equal(r.source_checked_on,"2026-10-08");
 assert.ok(!keys.has(r.u),"Duplicate provider venue ID: "+r.u);
 keys.add(r.u);
 const addressKey=r.cc+":"+normalized(r.a);
 assert.ok(!addresses.has(addressKey),"Duplicate physical site: "+r.u);
 addresses.add(addressKey);
}
for(const h of held.held_venues){
 assert.ok(!keys.has(h.source_id),"Held unknown-address Mass source published in Find");
 assert.equal(h.reason,"ADDRESS_UNSUITABLE_FOR_PHYSICAL_VENUE_PUBLICATION");
}
const brazil=records.filter(x=>x.cc==="BR"&&x.l==="Niterói");
assert.equal(brazil.length,1,"Brazilian first-party duplicate Niterói chapel was not collapsed");
assert.ok(!records.some(x=>x.cc==="AT"&&x.a.includes("Fockygasse")),
 "Vienna weekday-only priory created a fictitious regular Sunday venue");
assert.ok(!records.some(x=>x.cc==="IT"&&x.l==="Brixen"),
 "Brixen is already present under the Austrian district listing and must not duplicate");
assert.ok(!records.some(x=>x.cc==="BE"&&x.a.includes("Rue de la Concorde")),
 "Brussels weekday-only priory should not duplicate its separate Sunday church");
assert.ok(records.some(x=>x.cc==="PL"&&x.l==="Warszawa"&&x.sr.includes("10:00")));
assert.ok(!records.some(x=>x.cc==="PL"&&["Chełm","Kołobrzeg","Włocławek","Biała Podlaska"].includes(x.l)));
console.log("SSPX October multi-region bulk: PASS — 143 physical source rows, 33 conditional, 10 held");
