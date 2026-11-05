// Exact native DayResolver LAT/EN/FR source-recovery regression.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const p=".tmp/mass-april-1962/trilingual-dayresolver-snapshots.json";
const j=JSON.parse(readFileSync(p,"utf8"));
assert.equal(j.schema,"ao-mass-april-1962-trilingual-dayresolver-snapshots-v1");
const byDate=new Map(j.dates.map(x=>[x.date,x]));
assert.equal(byDate.size,7);
const keys=["2026-04-13","2026-04-14","2026-04-29"];
for(const d of keys){
 const x=byDate.get(d);
 assert.ok(x,"missing "+d);
 assert.equal(x.recoveryError,undefined,x.recoveryError);
 assert.equal(x.recovered?.correction?.schema,
  "ao-mr62-april-three-paschal-saint-propers-v1",d);
 assert.equal(x.recovered?.sourcePath,x.sourcePath,d);
 const proof=x.recovered?.proof;
 assert.equal(proof.status,"1962_DATED_LITURGICAL_TEXT_CORRECTED_NO_MUSIC_CERTIFICATION");
 assert.equal(proof.sourceAliasesApproved,0);
 assert.equal(proof.scoreApprovals,0);
 assert.equal(proof.parts?.length,2);
 assert.ok(proof.parts.every(x=>x.kind==="ALLELUIA"));
 for(const lang of ["lat","en","fr"]){
  const first=proof.parts[0].text[lang],second=proof.parts[1].text[lang];
  assert.ok(first&&second&&first.length>40&&second.length>40);
  assert.equal(x.recovered.gradual[lang],first+"\n"+second);
  assert.ok(!x.recovered.gradual[lang].includes("Invéni David"));
  if(lang==="lat")assert.ok(!x.recovered.gradual[lang].includes("Perdam sapiéntiam"));
 }
 for(const [lang,s] of [["en",x.recovered.readerSlotsEN],["fr",x.recovered.readerSlotsFR]]){
  for(const field of ["first","second"]){
   assert.equal(s[field]?.length,1,d+" "+lang+" "+field+" count");
   const row=s[field][0];
   assert.equal(row.liturgicalGroup,"AO.CHANT.ALLELUIA",d+" "+lang+" "+field);
   assert.equal(row.chantKind,"ALLELUIA");
   assert.ok(row.latin?.length>30&&row.vernacular?.length>30);
   assert.equal(row.editorialMusicApproval,false);
  }
  assert.equal(s.first[0].liturgicalPosition,1);
  assert.equal(s.second[0].liturgicalPosition,2);
 }
 assert.ok(x.recovered.preGospelChants.every(x=>x.kind==="alleluia"));
}
const x13=byDate.get("2026-04-13");
assert.ok(x13.recovered.introit.lat.includes("Protexísti me, Deus"));
assert.ok(x13.recovered.epistle.lat.includes("Sap 5:1-5"));
assert.ok(x13.recovered.gradual.lat.includes("Confitebúntur cœli"));
assert.ok(x13.recovered.gradual.lat.includes("Posuísti, Dómine"));
assert.ok(x13.recovered.off.lat.includes("Confitebúntur cœli"));
assert.ok(x13.recovered.communion.lat.includes("Lætábitur justus"));
assert.ok(x13.recovered.postcommunion.lat.includes("Refécti participatióne"));
assert.ok(x13.recovered.postcommunion.lat.includes("Hermenegildo"));
assert.ok(!x13.recovered.postcommunion.lat.includes(" N."));
assert.ok(!x13.recovered.introit.lat.includes("In virtúte tua"));
assert.ok(!x13.recovered.off.lat.includes("Glória et honóre"));
assert.equal(x13.recovered.gospel.lat,x13.gospel.lat);
const x29=byDate.get("2026-04-29");
assert.ok(x29.recovered.introit.lat.includes("Protexísti me, Deus"));
assert.ok(x29.recovered.gospel.lat.includes("Joannes 15:1-7"));
assert.ok(x29.recovered.gospel.lat.includes("Ego sum vitis vera"));
assert.ok(x29.recovered.gradual.lat.includes("Confitebúntur cœli"));
assert.ok(x29.recovered.off.lat.includes("Confitebúntur cœli"));
assert.ok(x29.recovered.communion.lat.includes("Lætábitur justus"));
assert.ok(!x29.recovered.gospel.lat.includes("Matt 10:34-42"));
assert.equal(x29.recovered.epistle.lat,x29.epistle.lat);
const x14=byDate.get("2026-04-14");
assert.ok(x14.recovered.gradual.lat.includes("Verúmtamen exístimo"));
assert.ok(x14.recovered.gradual.lat.includes("Sapiéntia hujus mundi"));
assert.ok(!x14.recovered.gradual.lat.includes("Perdam sapiéntiam"));
for(const field of ["introit","off","communion"]){
 for(const lang of ["lat","en","fr"]){
  assert.ok(!x14.recovered[field][lang].includes("(Alleluia"));
  assert.ok(!x14.recovered[field][lang].includes("(Alléluia"));
 }
}
assert.equal(x14.recovered.epistle.lat,x14.epistle.lat);
assert.equal(x14.recovered.gospel.lat,x14.gospel.lat);
for(const date of ["2026-04-12","2026-04-15","2026-04-28","2026-04-30"]){
 const x=byDate.get(date);
 assert.equal(x.recoveryError,undefined,x.recoveryError);
 assert.equal(x.recovered?.correction,null);
 assert.equal(x.recovered?.proof,null);
 assert.equal(x.recovered?.gradual?.lat,x.gradual?.lat);
}
console.log("PASS 3 April 1962 Paschal saint Masses: exact LAT/EN/FR re-owned source sections, 2 Alleluias each, independent proper orations and adjacent dates preserved; 0 Gregorian score approvals");
