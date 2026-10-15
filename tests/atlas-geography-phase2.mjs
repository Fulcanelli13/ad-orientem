import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ATLAS_GEO,ATLAS_SETTLEMENT_LABELS,buildBibleAtlas} from "../src/find/bible-atlas.js";

const root=p=>new URL("../"+p,import.meta.url);
const base=JSON.parse(readFileSync(root("data/explore/biblical-atlas-pleiades-crosswalk.research.v1.json"),"utf8"));
const phase=JSON.parse(readFileSync(root("data/explore/biblical-atlas-geography-phase2.research.v1.json"),"utf8"));
const corpus=JSON.parse(readFileSync(root("data/explore/bible-places-compact.v1.json"),"utf8"));
assert.equal(buildBibleAtlas(corpus.entries).length,151);
assert.equal(phase.scope,"RESEARCH_ONLY_NO_RUNTIME_IMPORT");
assert.equal(phase.metrics.records,35);
assert.equal(phase.records.length,base.records.length);
assert.equal(phase.policy.publishedPinsUnchanged,true);
assert.equal(phase.policy.publishedNameAliasesUnchanged,true);
assert.equal(phase.policy.publishHistoricalNames,false);
assert.equal(phase.policy.certifyExactEvent,false);
assert.equal(phase.policy.automaticPeriodBoundApproval,false);
const keys=new Set(base.records.map(r=>r.anchorKey));
assert.equal(keys.size,35);
const baseByKey=new Map(base.records.map(r=>[r.anchorKey,r]));
assert.deepEqual(new Set(phase.records.map(r=>r.anchorKey)),keys);
const physicalKeys=new Set(Object.values(ATLAS_GEO).map(r=>r.key));
assert.deepEqual(physicalKeys,keys);
const labels=Object.keys(ATLAS_SETTLEMENT_LABELS);
assert.equal(labels.length,22);
let labelCount=0,siteCount=0,otherCount=0;
for(const p of phase.records){
 const b=baseByKey.get(p.anchorKey);
 assert.ok(b);
 assert.equal(p.pleiadesPlaceId,b.pleiades?.placeId??null);
 assert.equal(p.publishedCoordinateChanged,false);
 assert.equal(p.publishedCoordinateAuthority,"ATLAS_GEO");
 assert.ok(!p.labelReview||!p.siteReview);
 assert.ok(!p.labelReview||!p.otherHold);
 assert.ok(!p.siteReview||!p.otherHold);
 if(p.labelReview){
  labelCount++;
  assert.ok(labels.includes(p.anchorKey));
  assert.equal(p.labelReview.existingAliasRetained,true);
  assert.equal(p.labelReview.decision,"HOLD_NO_RUNTIME_LABEL_CHANGE");
  assert.equal(p.labelReview.sourceNameRecordPresent,true);
  assert.ok(b.pleiades.candidateNames.some(n=>n.name===p.labelReview.ancientFormForPossibleEditorialAnnotation));
 }
 if(p.siteReview){
  siteCount++;
  assert.equal(p.siteReview.editorialStatus,"HOLD");
  assert.ok(p.siteReview.scripture.length>0);
  assert.ok(p.siteReview.evidenceURLs.length>0&&p.siteReview.evidenceURLs.every(url=>url.startsWith("https://")));
  assert.ok(!b.pleiades);
 }
 if(p.otherHold)otherCount++;
}
assert.equal(labelCount,22);
assert.equal(siteCount,7);
assert.equal(otherCount,6);
assert.deepEqual(phase.records.filter(r=>r.siteReview).map(r=>r.anchorKey).sort(),["nain","bethesda","siloam","bethphage","olives","gethsemane","holy-sepulchre"].sort());
assert.match(phase.records.find(r=>r.anchorKey==="jerusalem").labelReview.caveat,/Aelia Capitolina/);
assert.match(phase.records.find(r=>r.anchorKey==="samaria").labelReview.caveat,/Sebaste/);
for(const p of ["src/find/bible-atlas.js","src/find/browser-entry.js","src/find/map-runtime.js"]){
 const content=readFileSync(root(p),"utf8");
 assert.ok(!content.includes("biblical-atlas-geography-phase2.research.v1.json"),"Research overlay imported into runtime "+p);
}

const blockedByPeriod=new Map([
 ["jerusalem",["Aelia Capitolina","Col. Aelia Capitolina"]],
 ["samaria",["Sebaste"]],
 ["caesarea-maritima",["Stratonos Pyrgos"]],
 ["banias",[]], // Paneas / Caesarea Philippi city context: no false event point
 ["troas",["Antigoneia"]],
 ["philippi",["Krenides"]],
 ["tarsus",["Antiochia ad Cydnum"]],
 ["corinth",[]] // Roman colonia: architecture distinction, not false name
]);
assert.equal(phase.metrics.independentlyAttestedNamingGuards,8);
assert.equal(phase.policy.noAutomaticHistoricAliasPromotionAfterAttestation,true);
assert.deepEqual(
 [...new Set(phase.records.filter(p=>p.attestedNamingGuard?.status==="SOURCE_CORROBORATED_EDITORIAL_HOLD").map(p=>p.anchorKey))].sort(),
 [...blockedByPeriod.keys()].sort(),
 "One in-place owner for exactly eight independently corroborated naming cases"
);
for(const [key,excluded] of blockedByPeriod){
 const rec=phase.records.find(x=>x.anchorKey===key);
 const base=baseByKey.get(key);
 const gate=rec.attestedNamingGuard;
 assert.equal(gate.status,"SOURCE_CORROBORATED_EDITORIAL_HOLD",key);
 assert.equal(gate.existingDisplayLabelPreserved,true,key);
 assert.equal(gate.publication,"NO_AUTOMATIC_NAME_SUBSTITUTION",key);
 assert.equal(gate.eventCoordinatesChanged,false,key);
 assert.equal(gate.cityIdentityIsNotExactEventLocation,true,key);
 assert.equal(gate.independentSourceComparedToPleiades,true,key);
 assert.equal(gate.reviewedNarrativeContext.length>2,true,key);
 assert.equal(gate.contextualQualification.length>45,true,key);
 assert.deepEqual(gate.excludedAutomaticAliases,excluded,key);
 assert.ok(gate.independentEvidence.length>=1,key);
 for(const ev of gate.independentEvidence){
  assert.match(ev.url,/^https:\/\/(academic\.oup\.com|www\.attalus\.org|www\.perseus\.tufts\.edu|whc\.unesco\.org|www\.ascsa\.org)\//);
  assert.ok(ev.title.length>12&&ev.establishes.length>35&&ev.category.length>12);
 }
 for(const name of excluded){
  assert.ok(base.pleiades.candidateNames.some(n=>n.name===name),
   "Block only original source-attested names; avoid synthetic historic names: "+key+" / "+name);
 }
 if(key==="banias")assert.ok(!labels.includes(key),"Do not introduce Caesarea Philippi city label from research");
 else assert.ok(labels.includes(key),"Do not add a new label owner: "+key);
}
const aelia=baseByKey.get("jerusalem").pleiades.candidateNames
 .find(n=>n.name==="Aelia Capitolina");
assert.ok(aelia.after<0,"Pleiades range actually predates Hadrian, so independent source gate matters");
assert.match(phase.records.find(r=>r.anchorKey==="jerusalem").attestedNamingGuard.pinnedGISDateCaveat,/Hadrian/);
const sebaste=baseByKey.get("samaria").pleiades.candidateNames
 .find(n=>n.name==="Sebaste");
assert.ok(sebaste.after>0,"Pleiades range starts after Josephus's Herodian renaming");
assert.match(phase.records.find(r=>r.anchorKey==="samaria").attestedNamingGuard.pinnedGISDateCaveat,/Josephus/);
for(const p of ["src/find/bible-atlas.js","src/find/browser-entry.js","src/find/map-runtime.js"]){
 const content=readFileSync(root(p),"utf8");
 assert.ok(!content.includes("attestedNamingGuard"),
  "Research gate must never be silently treated as a runtime name/date decision in "+p);
}

const secondBatchKeys=new Set([
 "hebron","jericho","nazareth","capernaum","joppa",
 "nineveh","babylon","damascus","antioch-syria","athens",
 "ephesus","rome","lystra","thessalonica","miletus"
]);
assert.equal(secondBatchKeys.size,15);
assert.equal(phase.metrics.narrativeAndArchaeologicalNamingGuards,15);
assert.equal(phase.metrics.totalNamingGuards,23);
assert.equal(phase.metrics.labelKeysWithGuard,22);
assert.equal(phase.policy.noAutomaticAncientSpellingFromTranslatedScripture,true);
assert.equal(phase.policy.geographicContextDoesNotLocateEvent,true);
const newOwners=phase.records.filter(x=>x.attestedNamingGuard?.status==="NARRATIVE_OR_ARCHAEOLOGICAL_CORROBORATION_EDITORIAL_HOLD");
assert.equal(newOwners.length,15);
assert.deepEqual(new Set(newOwners.map(x=>x.anchorKey)),secondBatchKeys);
assert.equal(new Set(phase.records.filter(x=>x.attestedNamingGuard).map(x=>x.anchorKey)).size,23);
assert.ok(phase.records.filter(x=>x.labelReview).every(x=>x.attestedNamingGuard),
 "All 22 original bilingual label owners must now have name/period evidence guards");
for(const p of newOwners){
 const gate=p.attestedNamingGuard;
 const old=baseByKey.get(p.anchorKey);
 assert.ok(old?.pleiades,"Attested label must preserve original pinned Pleiades candidate identity");
 assert.ok(labels.includes(p.anchorKey),"No non-display owner can be introduced in this batch");
 assert.equal(gate.existingDisplayLabelPreserved,true);
 assert.equal(gate.publication,"NO_AUTOMATIC_NAME_SUBSTITUTION");
 assert.equal(gate.eventCoordinatesChanged,false);
 assert.equal(gate.cityIdentityIsNotExactEventLocation,true);
 assert.equal(gate.historicalSpellingVerifiedFromTheseSources,false);
 assert.equal(gate.philologicalCollationStillRequired,true);
 assert.equal(gate.independentSourceComparedToPleiades,true);
 assert.ok(gate.reviewedNarrativeContext.length>2);
 assert.ok(gate.contextualQualification.length>85);
 assert.ok(Array.isArray(gate.independentEvidence)&&gate.independentEvidence.length>0);
 for(const e of gate.independentEvidence){
  const host=new URL(e.url).hostname;
  assert.ok(["bible.usccb.org","whc.unesco.org","www.biblegateway.com",
   "www.osservatoreromano.va","www.miletgrabung.uni-hamburg.de"].includes(host),
   "Only a reviewed direct scripture/archaeology source in this batch: "+e.url);
  assert.ok(e.locator.length>=8);
  assert.ok(e.establishes.length>=65,"Source claim needs a scope limitation");
  assert.ok(e.category.length>=15);
 }
}
assert.ok(newOwners.find(x=>x.anchorKey==="hebron").attestedNamingGuard.contextualQualification.includes("Kiriath-arba"));
assert.ok(newOwners.find(x=>x.anchorKey==="miletus").attestedNamingGuard.contextualQualification.includes("modern coastline"));
assert.ok(newOwners.find(x=>x.anchorKey==="jericho").attestedNamingGuard.contextualQualification.includes("Tell es-Sultan"));
assert.ok(newOwners.find(x=>x.anchorKey==="rome").attestedNamingGuard.contextualQualification.includes("ROUGH"));
const sourceStrings=["attestedNamingGuard","noAutomaticAncientSpellingFromTranslatedScripture",
 "NARRATIVE_OR_ARCHAEOLOGICAL_CORROBORATION_EDITORIAL_HOLD"];
for(const path of ["src/find/bible-atlas.js","src/find/browser-entry.js","src/find/map-runtime.js"]){
 const runtime=readFileSync(root(path),"utf8");
 for(const term of sourceStrings)assert.ok(!runtime.includes(term),
  "Keep editorial source/period fields unimported by active app "+path);
}
console.log("PASS all 15 remaining bilingual settlement labels: contextual scripture/site guards, 22/22 owner coverage, zero coordinate/label change");

console.log("PASS eight independent name attestations: Josephus/Strabo/academic/archaeology, two GIS date conflicts, 0 runtime promotions");

console.log("PASS Phase 2 research: 35 keyed / 22 label holds / 7 site exceptions / 6 distinct caveats / 0 promotions");
