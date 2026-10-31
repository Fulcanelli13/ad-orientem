// M12 — archival Latin text overlap recheck; source-only, never runtime music.
const freeze=Object.freeze;
const sha40=/^[0-9a-f]{40}$/,sha64=/^[0-9a-f]{64}$/;
const classes=["SUBSTANTIAL_SHARED_PASSAGE","PARTIAL_SHARED_PASSAGE","INSUFFICIENT_SHARED_PASSAGE"];
const denied=reason=>freeze({schema:"ao-mass-music-m12-recheck-audit-v1",status:"SOURCE_OR_EDITORIAL_HOLD",reason,publicScores:0});
const key=x=>[x.originalScoreId??x.scoreId,x.sourcePath,x.sourceSha,x.donorLatin].join("|");
const norm=value=>String(value??"").normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"").replace(/æ/gi,"ae").replace(/œ/gi,"oe")
 .toLowerCase().replace(/j/g,"i").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
function longestShared(donor,score){
 const a=donor.split(" "),b=score.split(" ");
 let best={words:0,donorStart:-1,scoreStart:-1};
 for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++){
  let k=0;
  while(i+k<a.length&&j+k<b.length&&a[i+k]===b[j+k])k++;
  if(k>best.words)best={words:k,donorStart:i,scoreStart:j};
 }
 return {...best,text:best.words?a.slice(best.donorStart,best.donorStart+best.words).join(" "):""};
}
/** Compare against the M11 held evidence and six pinned M07 metadata batches.
 * Source text was extracted from the original #1749 research GABCs by removing
 * pitch syllables; that original music remains in its separate draft archive.
 * This function proves no musical pitches, 1962 selected Mass or publication.
 */
export function auditM12OriginalScoreText({ledger,residual15,m07Batches}={}){
 if(ledger?.schema!=="ao-mass-music-m12-15-original-score-text-recheck-v1"||
    residual15?.schema!=="ao-mass-music-m11-residual15-source-priority-v1"||
    !Array.isArray(m07Batches)||m07Batches.length!==6||
    !Array.isArray(ledger.scoreWitnesses)||!Array.isArray(ledger.occurrences))
  return denied("MANDATORY_RESEARCH_EVIDENCE_MISSING");
 const catalog=new Map(m07Batches.flatMap(b=>b.candidates??[]).map(s=>[s.id,s]));
 if(catalog.size!==1195||ledger.scope?.originalArchiveScores!==1195||
    ledger.scope?.residualOccurrences!==15||
    ledger.scoreWitnesses.length!==12||ledger.occurrences.length!==15||
    residual15.stillUnresolved?.length!==15)
  return denied("ORIGINAL_ARCHIVE_OR_OCCURRENCE_CARDINALITY_CONFLICT");
 const score=new Map();
 for(const s of ledger.scoreWitnesses){
  const ref=catalog.get(s.scoreId),batch=s.archiveBatch;
  if(!ref||score.has(s.scoreId)||!Number.isInteger(batch)||batch<1||batch>6||
     s.archivePath!==`data/mass/chant-corpus/gr1961-proper-00${batch}.json`||
     s.archiveBlobSha!==m07Batches[batch-1].origin?.sourceBlobSha||
     !sha40.test(s.archiveBlobSha??"")||!sha64.test(s.gabcSha256??"")||
     s.gabcSha256!==ref.sourceSha256||s.sourceRole!==ref.part||
     s.sourceFolio!==ref.folio||s.sourceUrl!==ref.sourceUrl||
     s.incipit!==ref.incipit||!s.normalizedScoreText||
     s.normalizedScoreText!==norm(s.normalizedScoreText)||
     s.noteFidelity!=="NOT_CHECKED")
   return denied("ORIGINAL_GABC_IDENTITY_OR_TEXT_STREAM_INVALID");
  score.set(s.scoreId,s);
 }
 const count=Object.fromEntries(classes.map(c=>[c,0])),seen=new Map();
 let conflicts=0;
 for(let i=0;i<15;i++){
  const r=ledger.occurrences[i],old=residual15.stillUnresolved[i],s=score.get(r?.scoreId);
  if(!s||r.index!==i+1||r.scoreId!==old.originalScoreId||
      r.sourcePath!==old.sourcePath||r.sourceSha!==old.sourceSha||
      !sha40.test(r.sourceSha??"")||r.donorLatin!==norm(old.donorLatin)||
      r.sourceRole!==old.sourceRole||r.originalScoreRole!==s.sourceRole||
      r.roleConflict!==old.roleConflict||
      r.roleConflict!==(r.originalScoreRole!==r.sourceRole)||
      r.notA1962MusicalAssignment!==true||r.sourceTextOnly!==true||
      r.printedNotesVerified!==false||r.selectedMassVerified!==false||
      r.userApproved!==false||r.publicReader!==false)
   return denied("SOURCE_OCCURRENCE_OR_EDITORIAL_HOLD_INVALID");
  const overlap=longestShared(r.donorLatin,s.normalizedScoreText);
  const shared={words:overlap.words,donorStartWord:overlap.donorStart,
   scoreStartWord:overlap.scoreStart,text:overlap.text};
  if(JSON.stringify(shared)!==JSON.stringify(r.commonText))
   return denied("SHARED_LATIN_SPAN_NOT_REPRODUCIBLE");
  const c=overlap.words>=8?classes[0]:overlap.words>=4?classes[1]:classes[2];
  if(r.evidenceClass!==c)return denied("LATIN_EVIDENCE_CLASS_INFLATED");
  count[c]++;
  const k=key(r),ordinal=(seen.get(k)??0)+1;
  if(r.occurrenceOrdinal!==ordinal)return denied("SOURCE_OCCURRENCE_MULTIPLICITY_LOST");
  seen.set(k,ordinal);
  if(r.roleConflict)conflicts++;
 }
 const actual=ledger.scope;
 if(score.size!==12||seen.size!==14||conflicts!==7||
    actual.distinctOriginalScoreIds!==12||
    actual.distinctSourceScoreDonorTuples!==14||
    actual.originalRoleConflicts!==7||
    JSON.stringify(count)!==JSON.stringify({
      SUBSTANTIAL_SHARED_PASSAGE:6,PARTIAL_SHARED_PASSAGE:3,
      INSUFFICIENT_SHARED_PASSAGE:6
    })||JSON.stringify(actual.overlapClasses)!==JSON.stringify(count))
  return denied("ARCHIVAL_OVERLAP_COUNTS_NOT_RECONCILED");
 if(Object.values(ledger.holds??{}).some(x=>x!==false)||
    Object.keys(ledger.holds??{}).length!==6)
  return denied("PUBLICATION_OR_APPROVAL_HOLD_VIOLATED");
 return freeze({schema:"ao-mass-music-m12-recheck-audit-v1",
  status:"ORIGINAL_1961_GABC_TEXT_RECHECKED_RESEARCH_ONLY",
  originalScoresReviewed:12,sourceOccurrences:15,distinctSourceCases:14,
  originalRoleConflicts:conflicts,sharedLatinSpanClasses:freeze(count),
  corrected1962SelectedAssignments:0,printed1961NeumesVerified:0,
  userApproved:0,publicScores:0,automaticReplacements:0});
}
// Research records cannot authorize a published Mass melody.
export function promoteM12OriginalScore(_candidate,_proof,_approval){return null;}
