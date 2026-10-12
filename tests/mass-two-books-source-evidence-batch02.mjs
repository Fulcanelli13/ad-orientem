import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=path=>JSON.parse(readFileSync(new URL("../data/"+path,import.meta.url),"utf8"));
const atlas=load("mass/alphonsus-fortescue-direct-book-evidence-batch02.v1.json");
const low=load("presentation/reader-text-low.v1.json");
const sung=load("presentation/reader-text-sung.v1.json");
const realCues=corpus=>new Map(corpus.blocks.flatMap(b=>b.units.filter(u=>/^AO\.SM\.C\d{4}$/.test(u.cue_id)).map(u=>[u.cue_id,b.Macro_ID])));
const l=realCues(low),s=realCues(sung);
assert.equal(l.size,275);
assert.equal(s.size,279);
assert.equal(atlas.items.length,113);
assert.equal(atlas.fortescueHistoricalTopics.length,27);
assert.equal(atlas.metrics.requestedActions,113);
assert.equal(atlas.metrics.passageMatches,113);
assert.equal(atlas.metrics.noMatch,0);
assert.equal(atlas.metrics.cueSotJoined,113);
assert.equal(atlas.metrics.distinctCanonicalCues,91);
assert.equal(atlas.metrics.lowSungActionDifferences,16);
assert.equal(atlas.authority,"HISTORICAL_BOOK_EVIDENCE_ONLY_NOT_1962_RUBRIC_CERTIFICATION");
assert.deepEqual(Object.values(atlas.files),["the_holy_mass.pdf","massstudyofroman00fort_bw.pdf"]);
const unique=new Set();
for(const item of atlas.items){
  assert(!unique.has(item.id),"duplicate source locator "+item.id);
  unique.add(item.id);
  assert(s.has(item.cueId)&&l.has(item.cueId),"unresolvable canonical cue "+item.id);
  assert.equal(item.sourceStatus,"TEXT_LOCATED_SEMANTIC_REVIEW");
  assert.equal(item.historicalDoesNotCertify1962,true);
  assert.equal(item.fortescuePrimaryForGesture,false);
  assert.equal(item.alphonsusEvidence.file,"the_holy_mass.pdf");
  assert.equal(item.alphonsusEvidence.printedPage,item.alphonsusEvidence.pdfPageOneBased);
  assert(item.alphonsusEvidence.evidenceWindow?.length>25,"missing passage excerpt "+item.id);
  assert.equal(item.canonicalCrosswalk.sungMacro,s.get(item.cueId));
  assert.equal(typeof item.canonicalCrosswalk.lowSungActionDifference,"boolean");
  if(item.actionType==="EXCEPTION")assert(/REQUIEM|BISHOP|EXPOSED/.test(item.formConditionReview),"exception without condition "+item.id);
}
const historic=atlas.items.find(x=>x.historicalAction==="SECOND_CONFITEOR_PRE1962");
assert.equal(historic?.formConditionReview,"HISTORIC_ONLY_OMIT_STRICT_1962");
const exposedBell=atlas.items.find(x=>x.historicalAction==="EXPOSED_SACRAMENT_NO_ELEVATION_BELL");
assert.equal(exposedBell.actor,"SERVER");
assert.match(exposedBell.formConditionReview,/OLDER_CUSTOM_NEEDS_1962_GATE/);
const fortIds=new Set();
for(const item of atlas.fortescueHistoricalTopics){
  assert(!fortIds.has(item.id)); fortIds.add(item.id);
  assert.equal(item.pdfPageOneBased,item.printedPage+22);
  assert.equal(item.canCertify1962Gesture,false);
  assert.equal(item.sourceType,"HISTORICAL_CONTEXT");
  assert(item.evidenceWindow?.length>25);
}
console.log("PASS sourced-book evidence: 113 Alphonsus passages / 91 cues, 27 Fortescue contexts, 16 form comparisons; all historical-only.");
