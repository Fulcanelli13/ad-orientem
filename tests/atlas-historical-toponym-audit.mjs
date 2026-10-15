import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ATLAS_GEO,ATLAS_SETTLEMENT_LABELS,buildBibleAtlas} from "../src/find/bible-atlas.js";
const json=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const research=json("data/explore/biblical-atlas-toponym-audit.research.v1.json");
const crosswalk=json("data/explore/biblical-atlas-pleiades-crosswalk.research.v1.json");
const atlas=json("data/explore/bible-places-compact.v1.json");
const stops=buildBibleAtlas(atlas.entries);
assert.equal(stops.length,151);
assert.equal(crosswalk.records.length,35);
assert.equal(crosswalk.metrics.candidates,28);
assert.equal(crosswalk.metrics.noDirectMatches,7);
assert.equal(research.pinnedPleiadesRevision,crosswalk.source.revision);
assert.equal(research.integration,"RESEARCH_ONLY_ZERO_RUNTIME_IMPORT");
assert.equal(research.metrics.runtimeLabelChanges,0);
assert.equal(research.metrics.mapCoordinatesChanged,0);
assert.deepEqual(Object.keys(ATLAS_SETTLEMENT_LABELS).sort(),research.aliasReview.map(x=>x.anchorKey).sort());
assert.equal(research.aliasReview.length,22);
assert.equal(new Set(research.aliasReview.map(x=>x.anchorKey)).size,22);
for(const row of research.aliasReview){
 const original=crosswalk.records.find(r=>r.anchorKey===row.anchorKey);
 const geo=Object.values(ATLAS_GEO).find(g=>g.key===row.anchorKey);
 assert.ok(original?.pleiades&&geo,"No unreconciled candidate may receive an alias research entry");
 assert.equal(original.pleiades.placeId,row.crosswalkPlaceId);
 assert.equal(original.pleiades.precision,row.originalPleiadesPrecision);
 assert.equal(row.existingEnglishLabel,ATLAS_SETTLEMENT_LABELS[row.anchorKey][0]);
 assert.equal(row.existingFrenchLabel,ATLAS_SETTLEMENT_LABELS[row.anchorKey][1]);
 assert.equal(row.sourceConfidence,"CANDIDATE_UNCOLLATED");
 assert.equal(row.status,"EDITORIAL_HOLD");
 assert.equal(row.automaticDisplay,false);
 assert.equal(row.automaticCoordinateChange,false);
 assert.equal(row.requireIndependentHistoricalAttestation,true);
 assert.ok(Array.isArray(row.flags)&&row.flags.length>0);
 for(const variant of row.periodSpecificVariants){
  assert.ok(original.pleiades.candidateNames.some(n=>n.name===variant.name&&
   n.uri===variant.sourceUri&&n.after===variant.sourceAfter&&n.before===variant.sourceBefore),
   "Names and dates must be derived verbatim from pinned Pleiades export, not invented");
  assert.match(variant.sourceUri,/^https:\/\/pleiades\.stoa\.org\/places\/\d+\//);
 }
}
for(const key of ["athens","rome"]){
 const row=research.aliasReview.find(x=>x.anchorKey===key);
 assert.ok(row.flags.includes("ROUGH_GAZETTEER_REPRESENTATIVE_POINT"));
}
assert.ok(research.aliasReview.find(x=>x.anchorKey==="jerusalem").flags.includes("AELIA_CAPITOLINA_POST_NEW_TESTAMENT"));
assert.ok(research.aliasReview.find(x=>x.anchorKey==="samaria").flags.includes("KINGDOM_VS_LATER_SEBASTE"));
const gaps=crosswalk.records.filter(r=>r.pleiades===null);
assert.equal(gaps.length,7);
assert.deepEqual(gaps.map(x=>x.anchorKey).sort(),research.nonPleiadesSiteResearch.map(x=>x.anchorKey).sort());
for(const gap of research.nonPleiadesSiteResearch){
 const owner=crosswalk.records.find(x=>x.anchorKey===gap.anchorKey);
 assert.equal(owner.matchStatus,"NO_DEFENSIBLE_DIRECT_MATCH");
 assert.equal(gap.pleiadesDirectMatch,null);
 assert.equal(gap.editorialStatus,"HOLD");
 assert.equal(gap.newCoordinate,null);
 assert.equal(gap.publishLocation,false);
 assert.equal(gap.publishNewPeriodName,false);
 assert.ok(gap.scopeNote.length>45);
 assert.ok(gap.sources.length>=1);
 for(const s of gap.sources){
  assert.ok(s.url.startsWith("https://"),"Evidence URL required");
  assert.ok(s.type.length>3);
 }
}
for(const flag of Object.values(research.safeguards))assert.equal(flag,true);
const runtime=readFileSync(new URL("../src/find/browser-entry.js",import.meta.url),"utf8");
assert.ok(!runtime.includes("biblical-atlas-toponym-audit.research.v1.json"),
 "Research evidence must never load in the public runtime");
assert.ok(stops.some(x=>x.geo===null),"Unlocated events still unlocated");
console.log("PASS 22 source-linked historical-name reviews, seven non-Pleiades cases, exact 151-event no-publication contract");
console.log(JSON.stringify({sourceAnchors:35,candidateURIs:28,periodLabelsUnpublished:22,sourceSpecificGapNotes:7}));
