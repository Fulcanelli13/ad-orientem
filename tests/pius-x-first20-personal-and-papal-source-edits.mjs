import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const read=async file=>JSON.parse(await readFile(resolve(root,file),"utf8"));
const overlays=await read("data/learn/research/pius-x-first20-personal-and-papal-source-corrected-dialogue-20261020.v1.json");
const selection=await read("artifacts/pius-x-complete-corpus/SPX_Balanced_130_Release_Candidates.json");
assert.equal(overlays.schema,"AO_SPX_FIRST20_DIRECT_SOURCE_BILINGUAL_SCENE_REVISIONS_V1");
assert.equal(overlays.records.length,20);
assert.equal(overlays.counts.revised,20);
assert.equal(overlays.counts.documentaryBiography,9);
assert.equal(overlays.counts.primaryPapalText,11);
assert.equal(overlays.counts.intentOverlapPairs,3);
assert.equal(overlays.counts.distinctVisitorIntentsInThisCohort,17);
assert.equal(overlays.counts.primaryReviewEntries,17);
assert.equal(overlays.counts.aliasRepliesNotSeparateEntrypoints,3);
assert.equal(overlays.counts.independentApproval,0);
assert.equal(overlays.counts.published,0);
assert.equal(selection.actual,130);
const byId=new Map(selection.candidates.map(x=>[x.id,x]));
const duplicates=new Map(),owners=new Map();
for(const entry of overlays.records){
 assert.ok(!owners.has(entry.id),"duplicate revised candidate "+entry.id);
 const owned=byId.get(entry.id);
 assert.ok(owned,"first-20 revision not in selected 130: "+entry.id);
 assert.equal(owned.ownerFile,entry.originalOwner,"wrong canonical owner "+entry.id);
 assert.ok(entry.witness.url.startsWith("https://"),"missing source URL");
 assert.equal(owned.source.url,entry.witness.url,"witness URL differs from selected original "+entry.id);
 assert.equal(entry.witness.noVerbatimPapalQuoteAsserted,true);
 assert.equal(entry.witness.originalLanguageBilingualLineSignoff,false);
 assert.equal(entry.evidenceStatus,"PUBLIC_WITNESS_PASSAGE_SPOTCHECKED_NOT_INDEPENDENTLY_CERTIFIED");
 assert.equal(entry.approval.production,false);
 assert.equal(entry.approval.humanTheology,false);
 assert.equal(entry.approval.english,false);
 assert.equal(entry.approval.french,false);
 assert.equal(entry.approval.historicalVoice,false);
 assert.ok(entry.proposedDraft.en.length>=120 && entry.proposedDraft.fr.length>=120);
 assert.equal(entry.noNewPrivatePapalAnecdotes,true);
 assert.equal(entry.noCurrentDisciplineInstruction,true);
 assert.ok(Array.isArray(entry.boundaries)&&entry.boundaries.length>=1);
 if(entry.factualSourceClass==="LATER_HISTORICAL_BIOGRAPHY"){
  assert.equal(entry.proposedDisplayRole,"EDITORIAL_BIOGRAPHY_PANEL");
  assert.ok(!/\bI remember\b|\bI felt\b|\bI believed\b/i.test(entry.proposedDraft.en),
    "secondary source cannot claim personal recollection");
 }else{
  assert.equal(entry.factualSourceClass,"AUTHORED_PAPAL_PRIMARY_TEXT");
  assert.equal(entry.proposedDisplayRole,"PIUS_X_DOCUMENT_BOUND_RECONSTRUCTION");
  assert.ok(entry.witness.url.includes("vatican.va"));
 }
 assert.equal(entry.intentTreatment.productionReady,false);
 if(entry.sameVisitorIntentFamily){
  if(!duplicates.has(entry.sameVisitorIntentFamily))duplicates.set(entry.sameVisitorIntentFamily,[]);
  duplicates.get(entry.sameVisitorIntentFamily).push(entry.id);
 }
 owners.set(entry.id,true);
}
assert.equal(owners.size,20);
assert.equal([...owners.keys()].filter(x=>x.startsWith("SPX-EXP-00")).length,9);
assert.equal([...duplicates].length,3);
for(const [family,ids] of duplicates)assert.equal(ids.length,2,"must be exact pair "+family);
for(const [group, ids] of duplicates){
 const entries=ids.map(id=>overlays.records.find(x=>x.id===id));
 assert.equal(entries.filter(e=>e.intentTreatment.status==="CANONICAL_ENTRY_REVIEW_ONLY").length,1);
 assert.equal(entries.filter(e=>e.intentTreatment.status==="ALIAS_NO_DUPLICATE_ENTRY").length,1);
 const canonical=entries.find(e=>e.intentTreatment.status==="CANONICAL_ENTRY_REVIEW_ONLY");
 assert.ok(entries.every(e=>e.intentTreatment.primaryFamilyId===canonical.id));
}
assert.deepEqual(duplicates.get("ELECTION_RELUCTANCE_1903").sort(),["SPX-EXP-010","SPX-PILOT-01"]);
assert.deepEqual(duplicates.get("ADULT_CATECHESIS_1905").sort(),["SPX-012","SPX-PILOT-08"]);
assert.deepEqual(duplicates.get("PRIESTLY_MEDITATION_1908").sort(),["SPX-EXP-045","SPX-PILOT-09"]);
const oldOwner=await read("data/learn/research/pius-x-batch50-part-a-20261019.v1.json");
const original=oldOwner.records.find(x=>x.id==="SPX-EXP-010");
assert.ok(original);
assert.notEqual(original.turns[0].response.en,overlays.records.find(x=>x.id==="SPX-EXP-010").proposedDraft.en);
console.log("PASS St Pius X source-edited first20: 9 secondary-history editorial panels, 11 papal-document bounded EN/FR drafts, 3 overlapping-intent pairs, exact 130 shortlist membership, canonical originals unchanged, 0 releases.");
