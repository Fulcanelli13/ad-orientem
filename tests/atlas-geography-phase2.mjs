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
console.log("PASS Phase 2 research: 35 keyed / 22 label holds / 7 site exceptions / 6 distinct caveats / 0 promotions");
