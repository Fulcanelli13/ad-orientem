import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ATLAS_GEO,ATLAS_SETTLEMENT_LABELS,buildBibleAtlas} from "../src/find/bible-atlas.js";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const old=JSON.parse(read("data/explore/biblical-atlas-pleiades-crosswalk.research.v1.json"));
const collation=JSON.parse(read("data/explore/biblical-atlas-source-collation.research.v1.json"));
const phase2=JSON.parse(read("data/explore/biblical-atlas-geography-phase2.research.v1.json"));
const corpus=JSON.parse(read("data/explore/bible-places-compact.v1.json"));
assert.equal(buildBibleAtlas(corpus.entries).length,151);
assert.equal(Object.keys(ATLAS_SETTLEMENT_LABELS).length,22);
assert.equal(collation.schema,"AO_BIBLICAL_ATLAS_PINNED_SOURCE_COLLATION_V1");
assert.equal(collation.status,"RESEARCH_ONLY");
assert.equal(collation.sources.pleiadesRevision,old.source.revision);
assert.equal(collation.sources.openBibleRevision,"7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f");
assert.equal(collation.sources.openBibleModernBlob,"9da83575127fc5aa1dab7aff61e01d4bc5ac9fdc");
assert.equal(collation.records.length,28);
assert.equal(collation.counts.originalModernGeocodingCoordinatesExact,24);
assert.equal(collation.counts.originalModernGeocodingCoordinatesDiffer,4);
const coordinateExceptions=new Set(["bethlehem","capernaum","nazareth","tabor"]);
assert.equal(new Set(collation.records.map(x=>x.anchorKey)).size,28);
assert.equal(phase2.records.length,35);
const matchByKey=new Map(collation.records.map(x=>[x.anchorKey,x]));
let names=0,locations=0;
const owners=Object.values(ATLAS_GEO);
for(const original of old.records){
 const match=matchByKey.get(original.anchorKey);
 if(!original.pleiades){assert.equal(match,undefined);continue;}
 assert.ok(match,"Missing pinned scholarly candidate "+original.anchorKey);
 assert.equal(match.pleiades.id,original.pleiades.placeId);
 assert.equal(match.pleiades.published,true);
 assert.equal(match.pleiades.uriMatches,true);
 assert.equal(match.pleiades.titleMatches,true);
 assert.equal(match.pleiades.reprPointMatches,true);
 assert.equal(match.pleiades.sourceFile,
   "https://github.com/isawnyu/pleiades.datasets/blob/"+collation.sources.pleiadesRevision+
   "/data/json/"+original.pleiades.placeId.slice(0,-2).split("").join("/")+"/"+original.pleiades.placeId+".json");
 assert.match(match.pleiades.sha,/^[0-9a-f]{40}$/);
 assert.equal(match.pleiades.matchedNames.length,original.pleiades.candidateNames.length);
 for(const [i,n] of match.pleiades.matchedNames.entries()){
  const source=original.pleiades.candidateNames[i];
  assert.equal(n.uri,source.uri);
  assert.equal(n.name,source.name);
  assert.equal(n.originalPresent,true);
  assert.equal(n.rangeMatchesBaseline,true);
  assert.equal(n.sourceDateRange.start,source.after);
  assert.equal(n.sourceDateRange.end,source.before);
  assert.ok(Array.isArray(n.attestations));
  names++;
 }
 for(const loc of match.pleiades.locationWitnesses){
  assert.ok(loc.uri.startsWith(original.pleiades.uri+"/"));
  assert.equal(loc.associationCertainty,"certain");
  assert.ok(loc.accuracyMeters===null||(Number.isFinite(loc.accuracyMeters)&&loc.accuracyMeters>=0));
  locations++;
 }
 const modern=match.openBible;
 assert.equal(modern.id,original.canonicalLocationEvidence.sourceRecordId);
 assert.ok(modern.hasOriginalRecord);
 assert.equal(modern.currentAtlasSourceUrl,original.canonicalLocationEvidence.url);
 assert.ok(Number.isFinite(modern.precisionMeters));
 const [lng,lat]=modern.coordinates.split(",").map(Number);
 const current=owners.find(g=>g.key===original.anchorKey);
 assert.ok(current,"Missing original Atlas coordinate owner "+original.anchorKey);
 const diff=111195*Math.hypot(lat-current.lat,(lng-current.lng)*Math.cos((lat+current.lat)*Math.PI/360));
 assert.ok(Math.abs(diff-modern.coordinateDifferenceMeters)<0.1);
 if(coordinateExceptions.has(original.anchorKey)){
  assert.ok(diff>0.1&&diff<50,"Existing separately sourced pin discrepancy changed "+original.anchorKey);
  assert.equal(modern.coordinateRelationship,"EXISTING_PIN_HAS_SEPARATE_COORDINATE_AUTHORITY");
 }else{
  assert.ok(diff<0.1,"Unexpected original source coordinate difference "+original.anchorKey);
  assert.equal(modern.coordinateRelationship,"EXACT_SOURCE_COORDINATE");
 }
 assert.equal(match.editorial,"CANDIDATE_IDENTITY_AND_NAME_METADATA_CHECKED_NOT_BIBLICAL_EVENT_CERTIFIED");
}
assert.equal(names,128);
assert.equal(locations,45);
assert.equal(matchByKey.get("athens").pleiades.locationWitnesses.length,0);
assert.equal(matchByKey.get("rome").pleiades.locationWitnesses.length,0);
assert.equal(matchByKey.get("ein-karem").pleiades.matchedNames.length,0);
for(const f of ["src/find/bible-atlas.js","src/find/browser-entry.js","src/find/map-runtime.js"])
 assert.ok(!read(f).includes("biblical-atlas-source-collation.research.v1.json"));
console.log("PASS source collation: 28 pinned Pleiades / 28 OpenBible / 128 names / 45 locations / 0 pins altered");
