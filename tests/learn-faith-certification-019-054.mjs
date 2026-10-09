import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load = file => JSON.parse(readFileSync(file,"utf8"));
const overlay=load("data/learn/learn-the-faith-certification-019-054.v1.json");
const recovered=load("data/learn/learn-the-faith-recovered-54.v1.json");
const witness=load("data/learn/ltfaith-pius-x-en-witness-index.v1.json");
const sources=recovered.sourceRegistries.claimBased;
const ownership=load("data/learn/content-ownership-registry.v1.json");
const presentation=readFileSync("src/learn/presentation.js","utf8");
const qq=new Map(witness.entries.map(q=>[q.q,q]));
const mm=new Map(recovered.lessons.map(x=>[x.id,x]));
assert.equal(overlay.lessons.length,36);
assert.equal(overlay.batchFindings.lessons,36);
assert.equal(overlay.batchFindings.selectedBilingualClaims,122);
assert.equal(overlay.batchFindings.correctedBilingualClaimPairs,10);
assert.equal(overlay.reviewGate.publicationApproved,false);
assert.equal(overlay.reviewGate.theologicalApproval,false);
assert.equal(overlay.reviewGate.nativeFrenchHistoricSourceCollation,false);
assert.equal(overlay.curriculumReconciliation.historicalUniqueLessons,54);
assert.equal(recovered.lessons.length,54);
assert.equal(witness.entries.length,433);
assert.equal(new Set(overlay.lessons.map(x=>x.id)).size,36);
let claims=0;let corrected=0;let witnessRefs=0;
for(let i=0;i<36;i++){
 const row=overlay.lessons[i];
 assert.equal(row.id,"LTF-"+String(i+19).padStart(3,"0"));
 assert.equal(row.status,"SOURCE_LOCATOR_RECONCILED_NOT_PUBLISHED");
 assert.equal(row.reviewGates.publicationApproved,false);
 assert.equal(row.reviewGates.nativeFrenchApproved,false);
 assert.equal(row.reviewGates.completeOriginalPassageTheologyVerified,false);
 assert.deepEqual(row.title,mm.get(row.id).title);
 assert.equal(row.claims.length,mm.get(row.id).v2ClaimDraft.claims.length);
 assert.ok(row.editorialSourceScopeFinding?.length>25,row.id);
 for(const claim of row.claims){
  claims++;
  corrected+=Number(claim.draftState==="EN_FR_CORRECTED_NOT_HUMAN_CERTIFIED");
  assert.ok(claim.en.length>25&&claim.fr.length>25,row.id+" missing bilingual copy");
  assert.ok(claim.sources.length>0,row.id+" no source");
  for(const source of claim.sources){
   assert.ok(source.refs?.length>0,row.id);
   if(source.source==="PIUS_X_1912"){
    assert.equal(source.locators.length,source.refs.length,row.id);
    for(const q of source.locators){
     const n=+q.ref.slice(-3);const upstream=qq.get(n);
     assert.ok(upstream,row.id+" nonexistent question "+n);
     assert.equal(q.stem,upstream.q_stem,row.id+" question text mismatch "+n);
     assert.equal(q.url,upstream.source_file_url,row.id+" source URL differs from pinned question");
     assert.ok(q.url.includes(witness.upstreamCommit),row.id+" unpinned source");
     witnessRefs++;
    }
   }else{
    const known=sources[source.source]||overlay.supplementarySourceRegistry[source.source];
    assert.ok(known,row.id+" unknown source "+source.source);
    assert.equal(source.url,known.url,row.id+" mismatched original source URL");
   }
  }
 }
}
assert.equal(claims,122);
assert.equal(corrected,10);
const by=Object.fromEntries(overlay.lessons.map(x=>[x.id,x]));
const has=(lesson,part)=>JSON.stringify(by[lesson].claims).includes(part);
assert.ok(has("LTF-019","PX1912-Q146"));
assert.ok(!has("LTF-019","PX1912-Q147"),"Confession duty unsupported by Q147");
assert.ok(!has("LTF-025","PX1912-Q312"),"Confirmation dispositions polluted by ritual/sponsors questions");
assert.ok(has("LTF-025","PX1912-Q311"));
assert.ok(has("LTF-027","PX1912-Q352"));
assert.ok(has("LTF-031","CIC_1983_MARRIAGE"));
assert.ok(!has("LTF-039","PX1912-Q259"),"Passions wrongly cited as temperance definition");
assert.ok(has("LTF-051","CCC_1667_1671"));
assert.ok(has("LTF-052","historical"));
assert.equal(
 ownership.learn_the_faith_certification?.batch_019_054?.overlay,
 "data/learn/learn-the-faith-certification-019-054.v1.json"
);
assert.equal(ownership.learn_the_faith_certification?.batch_019_054?.publicationApproved,false);
assert.ok(!presentation.includes('id:"learn.faith"'));
console.log(JSON.stringify({status:"PASS",lessons:36,claims,correctedBilingualPairs:corrected,pinnedQuestionLocators:witnessRefs,published:0}));
