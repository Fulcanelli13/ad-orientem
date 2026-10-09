import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const corpus=read("data/learn/learn-the-faith-recovered-54.v1.json");
const governance=read("data/learn/content-ownership-registry.v1.json");
const ap=read("data/learn/apologetics-canonical.v1.json");
const cr=read("data/learn/church-crisis-canonical.v1.json");
const learn=readFileSync("src/learn/presentation.js","utf8");
const byId=new Map(corpus.lessons.map(x=>[x.id,x]));
assert.equal(corpus.status,"RECOVERED_RESEARCH_COMPOSITE_NOT_PUBLISHED");
assert.equal(corpus.lessons.length,54);
assert.equal(byId.size,54);
assert.equal(corpus.sourceBranchManifest.length,3);
assert.deepEqual(corpus.sourceBranchManifest.map(x=>x.role),["V1_EXPLANATORY_PROSE","V2_PRIMARY_CLAIM_CANDIDATE","COMPACT_CATECHISM_MAPPING"]);
assert.equal(corpus.sourceRegistries.expository.length,13);
assert.equal(Object.keys(corpus.sourceRegistries.claimBased).length,9);
assert.equal(corpus.summary.v1SourceBearingProseParagraphs,162);
assert.equal(corpus.summary.v2SourceBearingClaimBlocks,176);
assert.equal(corpus.summary.compactMappedClaims,108);
assert.equal(corpus.summary.distinctPiusXIndicesIndexedInCompactMapping,433);
assert.equal(corpus.summary.distinctPiusXIndicesActuallyCitedByV2Claims,375);
assert.equal(corpus.summary.validNumberedPiusXClaimReferences,523);
assert.equal(corpus.summary.partialDirectCatechismLessonMappings,6);
assert.equal(corpus.summary.lessonsWithCrossLinks,10);
assert.equal(corpus.summary.lessonsWithReferenceDifferences,43);
assert.equal(corpus.summary.certifiedLessons,0);
assert.equal(corpus.summary.publicRoutesAdded,0);
const validOwners=new Set([...ap.dossiers.map(x=>x.id),...cr.dossiers.map(x=>x.id)]);
const sourceClaim=corpus.sourceRegistries.claimBased, sourceProse=new Set(corpus.sourceRegistries.expository.map(x=>x.id));
const unionIndex=new Set(),unionClaim=new Set();
let proseCount=0,claimCount=0,compactCount=0,claimRefCount=0,diffCount=0;
for(let i=1;i<=54;i++){
 const id="LTF-"+String(i).padStart(3,"0"),l=byId.get(id);
 assert.ok(l,"lesson missing "+id);
 assert.ok(l.title.en&&l.title.fr,id);
 assert.equal(l.doctrineOwner,"learn.catechism",id);
 assert.equal(l.v1ProseDraft.paragraphs.length,3,id);
 assert.equal(l.compactClaimMapping.claims.length,2,id);
 assert.ok(l.v2ClaimDraft.claims.length>=1,id);
 assert.equal(l.reviewState.publicationApproved,false,id);
 assert.equal(l.reviewState.sourceContextVerified,false,id);
 assert.equal(l.reviewState.catechismQuestionWordingIndividuallyCollated,false,id);
 assert.equal(l.reviewState.frenchNativeEdited,false,id);
 assert.equal(l.reviewState.crossModuleDeduplicationApproved,false,id);
 const indexed=new Set(l.catechismIndexRefs),cited=new Set(l.detailedClaimPiusXRefs);
 for(const q of indexed){
  assert.match(q,/^PX1912-Q[0-9]{3}$/);
  const n=Number(q.slice(8));assert.ok(n>=1&&n<=433,"invalid catechism mapping "+q);
  unionIndex.add(n);
 }
 for(const p of l.v1ProseDraft.paragraphs){
  assert.ok(p.en&&p.fr&&p.sources.length,"lost bilingual prose "+id);
  for(const s of p.sources)assert.ok(sourceProse.has(s),"unknown prose source "+id+" "+s);
  proseCount++;
 }
 for(const c of l.v2ClaimDraft.claims){
  assert.ok(c.text.en&&c.text.fr&&c.sourceRefs?.length,"lost bilingual claims "+id);
  for(const s of c.sourceRefs){
   assert.ok(sourceClaim[s.source],"unknown claim source "+id+" "+s.source);
   assert.ok(s.refs.length,"source lacking contextual locator "+id);
   if(s.source==="PIUS_X_1912")for(const q of s.refs){
    assert.match(q,/^PXQ[0-9]{3}$/);
    const n=Number(q.slice(3));assert.ok(n>=1&&n<=433,"out-of-range PXQ "+q);
    unionClaim.add(n);claimRefCount++;
   }
  }
  claimCount++;
 }
 for(const c of l.compactClaimMapping.claims){
  assert.ok(c.text.en&&c.text.fr&&c.sourceRefs?.length,"compact bilingual claim missing "+id);
  for(const q of c.catechismRefs){assert.ok(indexed.has(q),"compact reference outside indexed set "+id);}
  compactCount++;
 }
 for(const q of cited)assert.ok(unionClaim.has(Number(q.slice(8)))||l.v2ClaimDraft.claims.length>0);
 assert.deepEqual(l.claimRefsNotInIndex,[...cited].filter(x=>!indexed.has(x)).sort(),id+" v2-only indexes");
 assert.deepEqual(l.indexRefsNotCitedInDetailedClaims,[...indexed].filter(x=>!cited.has(x)).sort(),id+" compact-only indexes");
 if(l.claimRefsNotInIndex.length||l.indexRefsNotCitedInDetailedClaims.length)diffCount++;
 for(const link of l.explicitCrossLinks)if(link.startsWith("APOL-")||link.startsWith("CR-"))assert.ok(validOwners.has(link),"unknown canonical crosslink "+link);
}
assert.equal(proseCount,162);
assert.equal(claimCount,176);
assert.equal(compactCount,108);
assert.equal(claimRefCount,523);
assert.equal(unionIndex.size,433);
assert.equal(unionClaim.size,375);
assert.equal(diffCount,43);
assert.ok(!learn.includes('id:"learn.faith"'),"unauthorized duplicate Catechism route");
assert.equal(governance.formation_master_inventory_20261009.unmerged_recoverable_branch_family.recovered_composite_on_main.exact_54_lesson_ids_preserved,true);
assert.equal(governance.formation_master_inventory_20261009.unmerged_recoverable_branch_family.recovered_composite_on_main.human_editorial_certifications,0);
console.log(JSON.stringify({status:"PASS",lessons:54,prose:proseCount,claims:claimCount,mappedClaims:compactCount,distinctCatechismIndex:unionIndex.size,distinctClaimCitations:unionClaim.size,referenceDiscrepancyLessons:diffCount,certified:0,published:false}));
