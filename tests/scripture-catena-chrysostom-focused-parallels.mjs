import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const json=p=>JSON.parse(readFileSync(p,"utf8"));
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const path="dist/schaff-chrysostom-focused-parallels/";
const data=json(path+"focused-chrysostom-source-parallels.v1.json");
const summary=json(path+"summary.v1.json");
const older=json("dist/schaff-chrysostom-catena-overlap/literal-overlap-source-evidence.v1.json");
const originals=json("dist/schaff-chrysostom-replies/chrysostom-question-ensuing-prose.v1.json");
const speech=json("dist/schaff-chrysostom-speech-layers/speech-layer-source-triage.v1.json");
const catena=json("data/scripture/catena/matthew.json");
const canonical=new Map(catena.pericopes.flatMap(p=>p.segments.map((s,i)=>[
 p.id+":"+i,{text:s.text,father:s.father}])));
const source=new Map([...originals.rows.map(x=>[x.id,x]),
 ...originals.pinnedOriginalWorkEvidence.map(x=>[x.seedId,x])]);
const risk=new Map([...speech.rows,...speech.pinnedWitnesses].map(x=>[x.sourceId,x]));
const prior=new Map([...older.rows,...older.pinnedWitnesses].map(x=>[x.sourceId,x]));
const normalize=s=>s.normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .replace(/([A-Za-z])-\s*\n\s*([A-Za-z])/g,"$1$2")
 .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
assert.equal(data.schema,"ao.catena.chrysostom-focused-literal-parallels.v1");
assert.equal(summary.schema,"ao.catena.chrysostom-focused-literal-parallel-summary.v1");
assert.deepEqual(data.summary,summary);
assert.equal(data.originalVolumeSHA256,originals.originalVolumeSHA256);
assert.equal(data.authorIdentityCriticallyVerified,false);
assert.equal(data.printedQuoteMeansScripture,false);
assert.equal(data.notAShippableMessengerCorpus,true);
assert.equal(summary.canonicalCatenaSourceSegments,4825);
assert.equal(summary.sourcesSelectedForSameInheritedAuthorOverlap,24);
assert.equal(summary.historicalOriginalContextPassagesRetained,24);
assert.equal(data.packets.length,24);
assert.equal(data.prioritizedForFurtherSourceResearch.length,24);
assert.equal(new Set(data.packets.map(x=>x.id)).size,24);
assert.equal(new Set(data.prioritizedForFurtherSourceResearch.map(x=>x.id)).size,24);
const flags=["originalQuestionSpeakerAuthenticated","sourceAnswerBoundaryEstablished",
 "patristicTextualIdentityEstablished","patristicArgumentEquivalenceEstablished",
 "novelContentVerified","publicationApproval"];
const observed={paired:0,inside:0,incomplete:0};
const expected=([...(older.rows||[]),...(older.pinnedWitnesses||[])]).filter(r=>
 r.canonicalLexicalOverlapEvidence.some(h=>
  h.canonicalInheritedFatherLabelMatchesChrysostom));
assert.deepEqual(new Set(data.packets.map(x=>x.id)),new Set(expected.map(x=>x.sourceId)));
for(const p of data.packets){
 const original=source.get(p.id),found=risk.get(p.id),prev=prior.get(p.id);
 assert.ok(original&&found&&prev);
 assert.equal(p.sourceKind,prev.sourceKind);
 const question=p.sourceKind==="homily_question_context"?
  original.originalQuestionSourceSpan:original.exactOCRQuestionUpToMark;
 const prose=p.sourceKind==="homily_question_context"?
  original.originalEnsuingProseOCR:original.exactOCREnsuingProse;
 const context=p.sourceKind==="homily_question_context"?
  original.originalContextOCR:original.completeOriginalOCR;
 assert.equal(p.exactOriginalOCRQuestion,question);
 assert.equal(p.exactOriginalOCREnsuingProse,prose);
 assert.equal(p.exactHistoricalOCRContext,context);
 assert.equal(p.originalQuestionSHA256,sha(question));
 assert.equal(p.originalEnsuingProseSHA256,sha(prose));
 assert.equal(p.historicalContextSHA256,sha(context));
 assert.equal(p.historicalVolumeSHA256,originals.originalVolumeSHA256);
 assert.deepEqual(p.quotationSourceEvidence,found.quoteEvidence);
 assert.equal(p.additionalQuestionMarksInsideEnsuingProse,found.additionalQuestionMarksInsideProse);
 assert.deepEqual(p.sourceRisks,found.sourceLayerRisks);
 assert.ok(p.catenaParallels.some(x=>x.inheritedFatherLabel==="Chrysostom"));
 assert.equal(p.inheritedChrysostomCatenaParallelCount,
  p.catenaParallels.filter(x=>x.inheritedFatherLabel==="Chrysostom").length);
 assert.equal(p.catenaParallels.length,prev.canonicalLexicalOverlapEvidence.length);
 for(const f of flags)assert.equal(p[f],false);
 for(const row of p.catenaParallels){
  const sourceCatena=canonical.get(row.pointer);
  assert.ok(sourceCatena);
  assert.equal(row.inheritedFatherLabel,sourceCatena.father);
  assert.equal(row.exactOriginalCatenaWords,sourceCatena.text);
  assert.equal(row.originalCatenaSHA256,sha(sourceCatena.text));
  assert.equal(row.originalWordsOwnedByCanonicalCatena,true);
  assert.equal(row.wordingOverlapIsNotPatristicSourceIdentity,true);
  assert.equal(row.semanticEquivalenceReviewed,false);
  assert.equal(row.possibleSharedGospelTextNotResolved,true);
  assert.ok(row.matchedPhraseEvidence.length>=1);
  const originalEvidence=prev.canonicalLexicalOverlapEvidence.find(x=>
   x.canonicalSourcePointer===row.pointer);
  assert.ok(originalEvidence);
  assert.equal(row.sharedIndependentFiveWordPhrases,
   originalEvidence.sharedIndependentFiveWordPhrases);
  for(const t of row.matchedPhraseEvidence){
   assert.equal(t.fiveWordPhrase.split(" ").length,5);
   assert.ok(normalize(prose).includes(t.fiveWordPhrase),
    "Shared phrase must be in complete printed question-following prose");
   assert.ok(normalize(sourceCatena.text).includes(t.fiveWordPhrase));
   assert.equal(t.assessment,"literal_words_only_speaker_not_verified");
   assert.equal(t.printedQuotationBoundaryIncomplete,
    found.quoteEvidence.unpairedOrUnresolvedDelimiters.length>0);
   if(t.inPairedPrintedQuotation){
    assert.ok(found.quoteEvidence.sourceQuoteSpans.some(
     s=>normalize(s.exactOriginalOCR).includes(t.fiveWordPhrase)));
   }
  }
 }
 observed.paired+=p.hasPairedPrintedQuotation?1:0;
 observed.inside+=p.anyMatchWithinPairedPrintedQuotation?1:0;
 observed.incomplete+=p.quotationSourceEvidence.unpairedOrUnresolvedDelimiters.length>0?1:0;
 const rank=data.prioritizedForFurtherSourceResearch.find(x=>x.id===p.id);
 assert.ok(rank);
 assert.equal(rank.originalPrintedHomilyLabel,p.originalPrintedHomilyLabel);
 assert.deepEqual(rank.sameInheritedAuthorPointers,
  p.catenaParallels.filter(x=>x.inheritedFatherLabel==="Chrysostom").map(x=>x.pointer));
 assert.equal(rank.safeToPublish,false);
}
assert.equal(summary.focusedSourcesWithPrintedQuoteSpans,observed.paired);
assert.equal(summary.focusedSourcesWithLiteralSharedWordsInsidePrintedQuote,observed.inside);
assert.equal(summary.focusedSourcesWithUnresolvedPrintedQuoteBoundary,observed.incomplete);
assert.equal(summary.distinctCanonicalChrysostomCandidatePointers,
 new Set(data.packets.flatMap(x=>x.catenaParallels.filter(y=>
 y.inheritedFatherLabel==="Chrysostom").map(y=>y.pointer))).size);
for(const key of ["historicalQuestionSpeakersAuthenticated",
 "originalAnswerBoundariesEstablished","validatedTheologicalDuplicates",
 "verifiedNovelPatristicAnswers","humanReviews","publicationApprovals"])
 assert.equal(summary[key],0);
console.log("PASS: 24 Chrysostom 1888 question-source contexts fully paired with original canonical Matthew Catena text and quoted-word evidence, zero attribution or publication claims");
