// Protect the map-first candidate inventory without publishing new identity pins.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const audit=read("data/saints/existing-shrine-geography-readiness-20261016.v1.json");
const ledger=read("data/saints/full-calendar-exact-source-key-ledger-20261016.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const cross=read("data/saints/cross-module-source-reconciliation-20261015.v1.json");
assert.equal(audit.schema,"ao.saints.existing-shrine-geography-readiness-20261016.v1");
assert.equal(audit.status,"SOURCE_LINKED_PLACE_CANDIDATES_NO_NEW_SAINT_PINS_OR_PERSON_ID_APPROVAL");
assert.equal(audit.rows.length,119);
assert.equal(cross.rows.length,119);
const uniqueLedgerKeys=new Set(ledger.records.map(x=>x.source_key));
const places=new Map(geo.places.map(x=>[x.place_id,x]));
let edgeCount=0,single=0,ambig=0,unmatched=0;
const all=new Set();
for(const r of audit.rows){
 assert(r.legacy_name_literal.length>3&&r.canonical_saint_id_approved===null);
 const original=cross.rows.find(x=>x.legacy_name===r.legacy_name_literal);
 assert(original);
 assert.deepEqual(r.physical_place_associations.map(x=>x.place_id),
 original.shrine_places.map(x=>x.place_id));
 assert(r.candidate_source_keys.every(key=>uniqueLedgerKeys.has(key)));
 if(r.identity_match_status==="ONE_EXACT_NAME_CANDIDATE_ID_NOT_CERTIFIED"){
   single++;assert.equal(r.candidate_source_keys.length,1);
 }else if(r.identity_match_status==="MULTIPLE_EXACT_NAME_CANDIDATE_IDS_REVIEW"){
   ambig++;assert(r.candidate_source_keys.length>1);
 }else{
   unmatched++;assert.equal(r.candidate_source_keys.length,0);
   assert.equal(r.identity_match_status,"NAME_STRING_WITHOUT_EXACT_SOURCE_KEY");
 }
 for(const edge of r.physical_place_associations){
   edgeCount++;all.add(edge.place_id);
   const p=places.get(edge.place_id);
   assert(p?.mappable&&Number.isFinite(p.geo?.lat)&&Number.isFinite(p.geo?.lng),
     "A site missing a source-owned coordinate entered the queue");
   assert(edge.provenance_source_ids.length>=1);
   assert.equal(edge.identity_approved_for_pin,false);
   assert.equal(edge.observed_relation,"SHRINE_ASSOCIATION_ONLY_NOT_BIRTH_DEATH_RESIDENCE_OR_RELIC_AUTHENTICATION");
 }
}
assert.deepEqual({rows:audit.rows.length,edges:edgeCount,places:all.size,single,ambig,unmatched},
 {rows:119,edges:145,places:121,single:50,ambig:6,unmatched:63});
assert.equal(audit.counts.confirmed_new_saint_geographical_pins,0);
assert.equal(audit.counts.confirmed_saint_birth_or_death_markers,0);
assert.equal(audit.counts.released_saint_artwork_reproductions,0);
const ambiguousTherese=audit.rows.find(x=>x.legacy_name_literal==="Saint Thérèse of Lisieux");
assert.equal(ambiguousTherese?.candidate_source_keys.length,2,"Thérèse historical aliases not auto-merged");
const laval=audit.rows.find(x=>x.legacy_name_literal==="Blessed Jacques-Désiré Laval");
assert.deepEqual(laval?.candidate_source_keys,["blessed.jacques-desire-laval"]);
assert.equal(laval?.physical_place_associations[0]?.place_id,"place:MU:pere-laval-sainte-croix");
console.log("PASS 119 source-name associations, 145 geolocated links / 121 existing places, 50 single-name candidates, 6 alias collisions, no new map pins");
