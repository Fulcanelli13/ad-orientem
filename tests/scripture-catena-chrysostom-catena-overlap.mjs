import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const j=p=>JSON.parse(readFileSync(p,"utf8"));
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const dir="dist/schaff-chrysostom-catena-overlap/";
const out=j(dir+"literal-overlap-source-evidence.v1.json"),summary=j(dir+"summary.v1.json");
const source=j("dist/schaff-chrysostom-replies/chrysostom-question-ensuing-prose.v1.json");
const catena=j("data/scripture/catena/matthew.json");
assert.equal(out.schema,"ao.catena.chrysostom-canonical-matthew-literal-overlap-evidence.v1");
assert.equal(summary.schema,"ao.catena.chrysostom-cross-edition-lexical-overlap-summary.v1");
assert.deepEqual(out.summary,summary);
assert.equal(out.sourceSha256,source.originalVolumeSHA256);
assert.equal(out.derivedSearchOnly,true);
assert.equal(out.identicalEnglishAcrossTranslationsNotRequired,true);
assert.equal(out.noMatchNeverProvesNovelty,true);
assert.equal(out.publicationApproval,false);
assert.equal(out.rows.length,180);
assert.equal(out.pinnedWitnesses.length,4);
assert.equal(summary.historicalQuestionProseContextsCompared,180);
assert.equal(summary.historicalPinnedBibliographicWitnessesCompared,4);
assert.equal(summary.previouslyEstablishedCanonicalPointerLinks,1);
assert.equal(summary.unresolvedSubstantiveNovelty,184);
assert.equal(summary.independentlyProvenNovelAnswers,0);
assert.equal(summary.approvedFatherAuthoredNewAnswers,0);
assert.equal(summary.publicationApprovals,0);
const originals=new Map(source.rows.map(x=>[x.id,x]));
const known=new Map(source.pinnedOriginalWorkEvidence.map(x=>[x.seedId,x]));
const pointers=new Map(catena.pericopes.flatMap(section=>section.segments.map((seg,i)=>
 [section.id+":"+i,{text:seg.text,father:seg.father}])));
assert.equal(pointers.size,summary.indexedCanonicalMatthewExcerpts);
const normalized=s=>s.normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .replace(/([A-Za-z])-\s*\n\s*([A-Za-z])/g,"$1$2")
 .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const checkedIds=new Set();
for(const row of [...out.rows,...out.pinnedWitnesses]){
 assert.ok(!checkedIds.has(row.sourceId));checkedIds.add(row.sourceId);
 const original=row.sourceKind==="homily_question_context"?
  originals.get(row.sourceId):known.get(row.sourceId);
 assert.ok(original);
 const comparison=row.sourceKind==="homily_question_context"?
  original.originalEnsuingProseOCR:original.exactOCREnsuingProse;
 assert.equal(row.historicalSourceSHA256,
  row.sourceKind==="homily_question_context"?
  original.originalEnsuingProseSHA256:original.completeOCRSHA256);
 assert.equal(row.historicalSourceSHA256,
  row.sourceKind==="homily_question_context"?
  sha(comparison):sha(original.completeOriginalOCR));
 assert.ok(row.canonicalLexicalOverlapEvidence.length<=5);
 assert.equal(row.thematicOrSemanticOverlapChecked,false);
 assert.equal(row.demonstrablyNovelBeyondCatena,false);
 assert.equal(row.publicationEligible,false);
 const seen=new Set();
 for(const hint of row.canonicalLexicalOverlapEvidence){
  assert.ok(!seen.has(hint.canonicalSourcePointer));seen.add(hint.canonicalSourcePointer);
  const passage=pointers.get(hint.canonicalSourcePointer);
  assert.ok(passage,"Hints must resolve to existing canonical Catena segments");
  assert.equal(hint.canonicalInCatenaFatherLabel,passage.father);
  assert.equal(hint.canonicalInheritedFatherLabelMatchesChrysostom,
   passage.father==="Chrysostom","Do not count Pseudo-Chrysostom or other Fathers as Chrysostom");
  assert.equal(hint.originalCatenaSourceUnchanged,true);
  assert.equal(hint.sourceRelationsStatus,
   "lexical_similarity_only_not_source_identity_or_equivalent_argument");
  assert.ok(hint.sharedIndependentFiveWordPhrases>=2);
  assert.ok(hint.phraseEvidence.length>=1&&hint.phraseEvidence.length<=8);
  for(const fiveGram of hint.phraseEvidence){
   assert.equal(fiveGram.split(/\s+/).length,5);
   assert.ok(normalized(comparison).includes(fiveGram),
    "Every overlap phrase must be present in historical printed OCR");
   assert.ok(normalized(passage.text).includes(fiveGram),
    "Every overlap phrase must be present in canonical Matthew Father text");
  }
 }
}
assert.equal(checkedIds.size,184);
const pinned=out.pinnedWitnesses.find(x=>x.sourceId==="SCH-CHR-001");
assert.equal(pinned.separatelyEstablishedExistingCatenaPointer,"catena.matthew.13.1:17");
assert.equal(pinned.knownPointerIsSourceResearchNotLiteralEquivalenceProof,true);
assert.equal(summary.researchRecordsWithLiteralFiveWordEvidence,
 [...out.rows,...out.pinnedWitnesses].filter(x=>
  x.canonicalLexicalOverlapEvidence.length>0).length);
assert.equal(summary.recordsWithLiteralEvidenceMatchingChrysostom,
 [...out.rows,...out.pinnedWitnesses].filter(x=>
  x.canonicalLexicalOverlapEvidence.some(v=>v.canonicalInheritedFatherLabelMatchesChrysostom)).length);
assert.equal(summary.recordsWithLiteralEvidenceOnlyOtherInheritedLabels,
 [...out.rows,...out.pinnedWitnesses].filter(x=>
  x.canonicalLexicalOverlapEvidence.length>0&&
  x.canonicalLexicalOverlapEvidence.every(v=>!v.canonicalInheritedFatherLabelMatchesChrysostom)).length);
assert.equal(summary.recordsWithLiteralEvidenceMatchingChrysostom+
 summary.recordsWithLiteralEvidenceOnlyOtherInheritedLabels,
 summary.researchRecordsWithLiteralFiveWordEvidence);
assert.equal(summary.uniqueCatenaHitPointersNotVerifiedIdenticalToHomilist,
 new Set([...out.rows,...out.pinnedWitnesses].flatMap(x=>
  x.canonicalLexicalOverlapEvidence.map(v=>v.canonicalSourcePointer))).size);
console.log("PASS: 184 source-checked Schaff->Catena Matthew comparison records; every five-word common phrase attested in both texts, with no novelty claims");
