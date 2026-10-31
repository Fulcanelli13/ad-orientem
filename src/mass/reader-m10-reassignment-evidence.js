// M10 independent reassignment REVIEW, never automatic chant replacement.
// The six research batches point to the original #1749 1961 GABCs by SHA,
// with a literal source-language text cue. 1962 actual Proper + printed
// neumes + separate editorial decision are still unverified.
const freeze=Object.freeze;
const HASH=/^[0-9a-f]{64}$/;
const BLOB=/^[0-9a-f]{40}$/;
const ID=/^GREGOBASE-\d+$/;
const CLAUSES=freeze([
 "NONINITIAL_OR_DISCONTINUOUS_OVERLAP",
 "SAME_INITIAL_WORD_BUT_DIFFERENT_CONTINUATION",
 "DIFFERENT_OPENING_WITHOUT_SECURE_OVERLAP"
]);
const DISPOSITIONS=freeze(["PROVISIONAL_REASSIGNMENT_CANDIDATES",
 "SOURCE_TEXT_OR_ROLE_INVESTIGATION_REQUIRED"]);
function bad(reason){return freeze({schema:"ao-mass-music-m10-review-audit-v1",
 status:"SOURCE_OR_EDITORIAL_HOLD",reason,publicScores:0});}
function summaryIs(value,expected){
 return Object.keys(expected).every(k=>value?.[k]===expected[k]) &&
  Object.keys(value??{}).every(k=>Object.hasOwn(expected,k));
}
function sourceTextValid(text){
 return typeof text==="string"&&text.length>0&&
  text.length<1500&&text===text.trim()&&
  !/[^a-z0-9 ]/.test(text)&&!/\s{2}/.test(text);
}
function phraseIsCorrect(record,alt){
 const words=record.normalizedDonorLatin.split(" ");
 if(alt.matchClass==="COMPLETE_DONOR_LINE_CONTIGUOUS")
   return alt.matchedNormalizedLatin===record.normalizedDonorLatin&&words.length>=4;
 if(alt.matchClass==="FIRST_EIGHT_DONOR_WORDS")
   return words.length>=8&&alt.matchedNormalizedLatin===words.slice(0,8).join(" ");
 return false;
}
export function auditM10ReassignmentEvidence({
 batches,m09Batches,m07Batches
}={}){
 if(!Array.isArray(batches)||batches.length!==6||
    !Array.isArray(m09Batches)||m09Batches.length!==6||
    !Array.isArray(m07Batches)||m07Batches.length!==6)
  return bad("SIX_PINNED_ARCHIVE_BATCHES_REQUIRED");
 const allCandidates=new Map(m07Batches.flatMap(b=>b.candidates??[]).map(c=>[c.id,c]));
 if(allCandidates.size!==1195)return bad("ORIGINAL_1195_CATALOGUE_MISSING");
 const fullSet=new Set(),weakKeys=new Set(),reasonTotals={},roleTotals={};
 let weak=0,alternatives=0,withLead=0,noLead=0,multiLead=0;
 const distinctAltScores=new Set();
 for(let i=0;i<6;i++){
  const b=batches[i],old=m09Batches[i],expectedBatch=String(i+1).padStart(3,"0");
  if(b?.schema!=="ao-mass-music-m10-weak-reassignment-batch-v1"||
      b.batch!==expectedBatch||old?.batch!==expectedBatch||
      b.sourceM09BatchPath!=="data/research/mass-music-m09-1962-line-qa-"+expectedBatch+".v1.json"||
      !BLOB.test(b.sourceM09GitBlobSha??"")||
      !BLOB.test(b.sourceArchiveGitBlobSha??"")||
      b.sourceArchivePath!=="data/mass/chant-corpus/gr1961-proper-"+expectedBatch+".json"||
      b.sourceArchiveGitBlobSha!==m07Batches[i]?.origin?.sourceBlobSha||
      b.nonApprovalStatus!=="SOURCE_TEXT_LEADS_ONLY"||
      !Array.isArray(b.records)||b.weakOccurrences!==b.records.length)
   return bad("ARCHIVE_BATCH_OR_SOURCE_PIN_CHANGED");
  const sourceMap=new Map(old.records.flatMap(r=>r.occurrences.map((o,index)=>[
    r.id+":"+index,{...o,id:r.id,part:r.part,tier:r.tier,sha:r.gabcSha256}
  ])));
  const expectedWeak=[...sourceMap.values()].filter(x=>x.comparisonClass==="NO_SECURE_FOUR_WORD_PREFIX");
  if(b.records.length!==expectedWeak.length)return bad("WEAK_OCCURRENCE_MISSING");
  const local={},distinctLocal=new Set();
  for(const row of b.records){
   const original=sourceMap.get(row.id+":"+row.occurrenceIndex);
   const sourceScore=allCandidates.get(row.id);
   const key=expectedBatch+":"+row.id+":"+row.occurrenceIndex;
   if(!original||original.comparisonClass!=="NO_SECURE_FOUR_WORD_PREFIX"||
      weakKeys.has(key)||!sourceScore||row.id!==original.id||
      row.sourceRole!==original.part||row.originalTriageTier!==original.tier||
      row.originalScoreSha256!==sourceScore.sourceSha256||
      row.originalScoreSha256!==original.sha||
      row.originalScoreFolio!==sourceScore.folio||
      row.originalScoreSourceUrl!==sourceScore.sourceUrl||
      row.sourcePath!==original.sourcePath||
      row.sourceBlobSha!==original.sourceBlobSha||
      row.sourceSection!==original.sourceSection||
      row.sourcePosition!==original.sourcePosition||
      row.sourceRisk!==original.sourceRisk||
      !sourceTextValid(row.normalizedDonorLatin)||
      !sourceTextValid(row.originalScoreNormalizedOpening)||
      row.sourceWitnessWordCount!==row.normalizedDonorLatin.split(" ").length||
      !Number.isInteger(row.originalLongestSharedContiguousWords)||
      row.originalLongestSharedContiguousWords<0||
      row.originalLongestSharedContiguousWords>row.sourceWitnessWordCount||
      !Number.isInteger(row.originalSharedSpanStartsAtDonorWord)||
      row.originalSharedSpanStartsAtDonorWord<(-1)||
      row.initialWordAgrees!==(row.normalizedDonorLatin.split(" ")[0]===
        row.originalScoreNormalizedOpening.split(" ")[0])||
      !CLAUSES.includes(row.sourceEvidenceClass)||
      row.scorePublished!==false||row.scoreUserApproved!==false||
      row.printed1961NoteParity!=="UNVERIFIED"||
      row.selected1962MassMatch!=="UNVERIFIED"||
      row.editorialDecision!=="COLLECT_ALL_THEN_REVIEW")
    return bad("SOURCE_IDENTITY_TEXT_OR_EDITORIAL_GATE_CONFLICT");
   const reason=row.originalLongestSharedContiguousWords>=4?
      CLAUSES[0]:row.initialWordAgrees?CLAUSES[1]:CLAUSES[2];
   if(row.sourceEvidenceClass!==reason)return bad("ORIGINAL_MATCH_CLASS_FALSIFIED");
   if(row.originalLongestSharedContiguousWords>=4&&
      row.originalSharedSpanStartsAtDonorWord<0)return bad("OVERLAP_SPAN_MISSING");
   if(row.originalLongestSharedContiguousWords<4&&
      row.originalSharedSpanStartsAtDonorWord!==-1)return bad("UNCLAIMED_SPAN_FOR_NO_MATCH");
   const alts=row.alternatives;
   if(!Array.isArray(alts)||row.alternativeCount!==alts.length||
     !DISPOSITIONS.includes(row.triageDisposition)||
     row.triageDisposition!==(alts.length?DISPOSITIONS[0]:DISPOSITIONS[1]))
    return bad("SOURCE_REASSIGNMENT_STATUS_INVALID");
   const unique=new Set();
   for(const alt of alts){
    const originalCandidate=allCandidates.get(alt.scoreId);
    if(!ID.test(alt.scoreId??"")||unique.has(alt.scoreId)||
       alt.scoreId===row.id||!originalCandidate||
       alt.role!==row.sourceRole||
       originalCandidate.part!==row.sourceRole||
       alt.sourceSha256!==originalCandidate.sourceSha256||
       alt.sourceUrl!==originalCandidate.sourceUrl||
       alt.sourceFolio!==originalCandidate.folio||
       !HASH.test(alt.sourceSha256??"")||
       alt.sourceStatus!=="TEXT_LEAD_ONLY_1962_AND_PRINTED_NOTES_PENDING"||
       !phraseIsCorrect(row,alt))
      return bad("ALTERNATIVE_SCORE_ROLE_HASH_OR_LATIN_EVIDENCE_INVALID");
    unique.add(alt.scoreId);distinctAltScores.add(alt.scoreId);
   }
   weakKeys.add(key);distinctLocal.add(row.id);fullSet.add(row.id);
   reasonTotals[reason]=(reasonTotals[reason]??0)+1;
   local[reason]=(local[reason]??0)+1;
   roleTotals[row.sourceRole]=(roleTotals[row.sourceRole]??0)+1;
   weak++;alternatives+=alts.length;
   if(alts.length>0)withLead++;else noLead++;
   if(alts.length>1)multiLead++;
  }
  if(distinctLocal.size!==b.weakSourceScoreIds||
     !summaryIs(b.evidenceClasses,local))
   return bad("BATCH_RISK_COUNTS_CHANGED");
 }
 if(weak!==99||fullSet.size!==54||withLead!==54||noLead!==45||
    alternatives!==114||multiLead!==17||
    !summaryIs(reasonTotals,{
      NONINITIAL_OR_DISCONTINUOUS_OVERLAP:26,
      SAME_INITIAL_WORD_BUT_DIFFERENT_CONTINUATION:8,
      DIFFERENT_OPENING_WITHOUT_SECURE_OVERLAP:65
    })||
    !summaryIs(roleTotals,{gr:14,tr:21,in:25,al:27,of:4,co:8}))
   return bad("AGGREGATED_WEAK_TALLY_CHANGED");
 return freeze({
  schema:"ao-mass-music-m10-review-audit-v1",
  status:"EVIDENCE_CLASSIFIED_REASSIGNMENT_RESEARCH_ONLY",
  originalWeakOccurrences:weak,
  originalDistinctScoreIds:fullSet.size,
  weakWithExistingSameRoleAlternatives:withLead,
  weakWithNoSameRoleAlternative:noLead,
  alternativeTextRelationships:alternatives,
  distinctAlternativeScoreIds:distinctAltScores.size,
  sourceCasesWithMultipleAlternatives:multiLead,
  evidenceClasses:freeze({...reasonTotals}),roles:freeze({...roleTotals}),
  full1962MassRoleVerified:0,printed1961NoteByNoteVerified:0,
  userApprovedScores:0,publicScores:0,automaticReassignments:0,
  next:"EXACT_1962_PROPER_AND_PRINTED_FACSIMILE_VARIANT_ADJUDICATION"
 });
}
export function promoteM10CandidateToMass(_proposedReassignment,_source,_approval){return null;}
