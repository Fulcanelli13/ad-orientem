import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ATLAS_GEO,ATLAS_SETTLEMENT_LABELS,buildBibleAtlas}
 from "../src/find/bible-atlas.js";

const file=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const crosswalk=JSON.parse(file("data/explore/biblical-atlas-pleiades-crosswalk.research.v1.json"));
const corpus=JSON.parse(file("data/explore/bible-places-compact.v1.json"));
const actualOwners=Object.entries(ATLAS_GEO);
const keys=new Set(actualOwners.map(([,g])=>g.key));
assert.equal(buildBibleAtlas(corpus.entries).length,151);
assert.equal(actualOwners.length,38);
assert.equal(keys.size,35);
assert.equal(crosswalk.records.length,35);
assert.equal(crosswalk.metrics.ownerEntries,38);
assert.equal(crosswalk.metrics.distinctAnchorKeys,35);
assert.equal(crosswalk.metrics.candidates,28);
assert.equal(crosswalk.metrics.noDirectMatches,7);
assert.equal(crosswalk.metrics.runtimeNameChanges,0);
assert.equal(crosswalk.metrics.pinChanges,0);
assert.equal(crosswalk.integration,"RESEARCH_ONLY_NO_RUNTIME_IMPORT");
assert.equal(crosswalk.source.revision,"d8c06f28656312eee6b7a0f76415b34a89e3c728");
assert.match(crosswalk.source.license,/CC BY 3\.0/);
assert.ok(crosswalk.source.placesBlob&&crosswalk.source.namesBlob);
assert.equal(new Set(crosswalk.records.map(x=>x.anchorKey)).size,35);
const byKey=new Map(crosswalk.records.map(x=>[x.anchorKey,x]));
const radians=Math.PI/180;
const distance=(a,b)=>6371*Math.hypot((a.lat-b.lat)*radians,
  (a.lng-b.lng)*radians*Math.cos((a.lat+b.lat)*radians/2));
let selected=0,unmatched=0,rough=0;
for(const [key,g] of actualOwners){
 const r=byKey.get(g.key);
 assert.ok(r,"missing canonical anchor "+g.key);
 assert.ok(r.owners.includes(key),"missing source owner "+key);
 assert.equal(r.kind,g.kind);
 assert.deepEqual(r.currentCoordinate,{lat:g.lat,lng:g.lng});
 assert.equal(r.canonicalLocationEvidence.url,g.url);
 assert.equal(r.canonicalLocationEvidence.sourceRecordId,g.source_record_id??null);
}
for(const rec of crosswalk.records){
 assert.deepEqual(rec.owners.sort(),actualOwners.filter(([,v])=>v.key===rec.anchorKey).map(([k])=>k).sort());
 assert.deepEqual(rec.editorial,{status:"HOLD",publishAncientLabel:false,changeCoordinate:false,certifyExactEvent:false});
 assert.ok(rec.canonicalLocationEvidence.url.startsWith("https://"));
 if(!rec.pleiades){
  unmatched++;
  assert.equal(rec.matchStatus,"NO_DEFENSIBLE_DIRECT_MATCH");
  assert.ok(rec.caveat.length>=25);
  continue;
 }
 selected++;
 const p=rec.pleiades;
 assert.equal(p.uri,"https://pleiades.stoa.org/places/"+p.placeId);
 assert.ok(["precise","rough"].includes(p.precision));
 if(p.precision==="rough")rough++;
 const d=distance(rec.currentCoordinate,p.representativeCoordinate);
 assert.ok(d<18,"Distant candidate "+rec.anchorKey+": "+d.toFixed(1));
 assert.ok(Math.abs(d-p.distanceKm)<0.06,"Incorrect distance "+rec.anchorKey);
 assert.ok(p.title.length>2);
 assert.ok(p.candidateNames.length>0||rec.anchorKey==="ein-karem",
  "If a Pleiades candidate has no attested name records, it needs an explicit hold");
 assert.ok(p.candidateNames.every(n=>n.uri.startsWith(p.uri+"/")&&
  (n.after===null||Number.isInteger(n.after))&&
  (n.before===null||Number.isInteger(n.before))&&
  (n.after===null||n.before===null||n.after<=n.before)));
 if(["traditional","mountain_region"].includes(rec.kind))
  assert.notEqual(rec.matchStatus,"TITLE_AND_VICINITY_CANDIDATE_UNCOLLATED");
}
assert.equal(selected,28);
assert.equal(unmatched,7);
assert.equal(rough,2);
for(const key of ["athens","rome"]){
 assert.equal(byKey.get(key).pleiades.precision,"rough");
 assert.match(byKey.get(key).caveat,/ROUGH/);
}
assert.deepEqual(byKey.get("jerusalem").owners.sort(),["cenacle","jerusalem-temple","jerusalem-trial"].sort());
assert.deepEqual(byKey.get("holy-sepulchre").owners.sort(),["christ-tomb","golgotha"].sort());
assert.deepEqual(
 crosswalk.records.filter(x=>!x.pleiades).map(x=>x.anchorKey).sort(),
 ["bethesda","bethphage","gethsemane","holy-sepulchre","nain","olives","siloam"].sort()
);
assert.equal(byKey.get("tabor").matchStatus,"ANCIENT_PLACE_RECORD_DOES_NOT_VERIFY_TRADITIONAL_SITE");
assert.equal(byKey.get("bethlehem").matchStatus,"ANCIENT_PLACE_RECORD_DOES_NOT_VERIFY_TRADITIONAL_SITE");
assert.ok(Object.keys(ATLAS_SETTLEMENT_LABELS).length===22);
for(const runtime of ["src/find/bible-atlas.js","src/find/browser-entry.js","src/find/map-runtime.js"]){
 assert.ok(!file(runtime).includes("biblical-atlas-pleiades-crosswalk.research.v1.json"),
  "Research-only crosswalk cannot be imported by runtime: "+runtime);
}
console.log("PASS 35 keyed locations / 38 owners / 28 pinned Pleiades candidates / seven held / zero display or coordinate promotions");
console.log(JSON.stringify({owners:38,keys:35,candidates:selected,noMatch:unmatched,rough:rough,uiChanged:false}));
