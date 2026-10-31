// M07: metadata-only editorial queue for the EXISTING PR #1749 GregoBase
// Graduale 1961 archive. It does not import or render any GABC into Mass.
// No source prefix / matching incipit may be promoted to an assigned Proper.
const freeze=Object.freeze;
const ROLES=freeze({
 in:"INTROIT",gr:"GRADUAL",al:"ALLELUIA",tr:"TRACT",of:"OFFERTORY",co:"COMMUNION"
});
const STAGED=freeze({al:284,in:229,of:185,co:225,gr:189,tr:83});
const ID=/^GREGOBASE-(\d+)$/;
const SHA=/^[0-9a-f]{64}$/;
const REQUIRED_SCHEMA="ao-mass-music-m07-proper-review-ledger-v1";
const sourcePath=/^data\/mass\/chant-corpus\/gr1961-proper-00[1-6]\.json$/;
function fail(reason){return freeze({schema:"ao-mass-music-m07-review-audit-v1",
 status:"INVALID_SOURCE_LEDGER",reason,publicScores:0})}
function tally(items,field){
 const c={};for(const item of items)c[item[field]]=(c[item[field]]??0)+1;
 return c;
}
function sameCount(actual,expect){
 return Object.entries(expect).every(([k,n])=>actual[k]===n)&&
 Object.keys(actual).every(k=>Object.hasOwn(expect,k));
}
/** Arrays are supplied by tests/offline research tooling. Never called from
 * the deployed reader; no network access or score-decoding side effects.
 */
export function auditM07ResearchCollection({
 batches,triage,priority,index=null
}={}){
 if(!Array.isArray(batches)||batches.length!==6||
    triage?.schema!=="ao-mass-music-m07-342-source-triage-v1"||
    priority?.schema!=="ao-mass-music-m07-priority-source-queue-v1")
  return fail("MISSING_RESEARCH_ARCHIVE");
 const all=[],sourceBatchPaths=new Set();
 for(const batch of batches){
  if(batch?.schema!==REQUIRED_SCHEMA||
     batch.origin?.sourceEditionId!==2||
     batch.origin?.release!=="RESEARCH_NOT_APPROVED"||
     !sourcePath.test(batch.origin.path)||
     !/^[0-9a-f]{40}$/.test(batch.origin.sourceBlobSha??"")||
     !Array.isArray(batch.candidates)||batch.itemCount!==batch.candidates.length||
     ![195,200].includes(batch.itemCount))
    return fail("SOURCE_BATCH_INVALID");
  if(sourceBatchPaths.has(batch.origin.path))return fail("DUPLICATE_SOURCE_BATCH");
  sourceBatchPaths.add(batch.origin.path);
  all.push(...batch.candidates);
 }
 if(all.length!==1195)return fail("ARCHIVAL_COUNT_CHANGED");
 const records=new Map(),counts=tally(all,"part");
 if(!sameCount(counts,STAGED))return fail("CHANT_TYPE_COUNTS_DIFFER");
 for(const c of all){
  const m=ID.exec(c.id??"");
  if(!m||Number(m[1])!==c.sourceId||records.has(c.id)||
     !Object.hasOwn(ROLES,c.part)||!SHA.test(c.sourceSha256??"")||
     !c.sourceUrl?.endsWith("id="+c.sourceId)||
     c.disposition!=="SOURCE_INDEXED_NOT_1962_PROPER_MATCHED")
    return fail("CANDIDATE_IDENTITY_OR_SOURCE_CORRUPTED");
  records.set(c.id,c);
 }
 if(!Array.isArray(triage.records)||triage.records.length!==342||
   triage.copiedSummary?.candidates!==342||
   triage.copiedSummary?.strong!==275||
   triage.copiedSummary?.partial!==39||
   triage.copiedSummary?.divergent!==28||
   triage.copiedSummary?.sourceOccurrences!==506||
   triage.copiedSummary?.sourcePaths!==91||
   triage.copiedSummary?.selected1962!==0||
   triage.copiedSummary?.promoted!==0)
   return fail("TEXT_TRIAGE_SUMMARY_CHANGED");
 const triageIds=new Set();let evidenceCount=0;
 for(const e of triage.records){
  const item=records.get(e.id);
  if(!item||e.gabcSha256!==item.sourceSha256||
    e.officePart!==item.part||triageIds.has(e.id)||
    e.selected1962!=="NOT_VERIFIED"||e.approval!=="NOT_GRANTED"||
    e.publication!=="BLOCKED"||!Array.isArray(e.eligibleSourceRefs)||
    !e.eligibleSourceRefs.length)return fail("TEXT_TRIAGE_SOURCE_MISMATCH");
  triageIds.add(e.id);
  for(const ref of e.eligibleSourceRefs){
   if(!/^(?:Tempora|Sancti)\/[A-Za-z0-9-]+$/.test(ref.path??"")||
      !/^[0-9a-f]{40}$/.test(ref.sourceBlobSha??""))
     return fail("TEXT_TRIAGE_HAS_UNVERIFIED_PROPER_PATH");
   evidenceCount++;
  }
 }
 if(evidenceCount!==506)return fail("TEXT_OCCURRENCE_COUNT_CHANGED");
 if(!Array.isArray(priority.leads)||priority.leadCount!==27||
   priority.leads.length!==27)return fail("PRIORITY_LEADS_INCOMPLETE");
 const ids=new Set(),priorityStatuses={};
 for(const lead of priority.leads){
  if(ids.has(lead.id)||!/^L07-0[0-2][0-9]$/.test(lead.id)||
     lead.editorialApproved!==false||lead.publicReader!==false||
     lead.notesVerified!==false||lead.textVerified!==false||
     !lead.sourceIndexUrl?.startsWith("https://gregobase.selapa.net/source.php"))
    return fail("PRIORITY_EDITORIAL_GATE_INVALID");
  if(lead.sourceId!=null &&
     (!Number.isInteger(lead.sourceId)||lead.sourceUrl!==
       "https://gregobase.selapa.net/chant.php?id="+lead.sourceId||
       lead.candidateStatus!=="EXACT_GREGOBASE_RECORD_REFERENCE"))
    return fail("PRIORITY_SOURCE_ID_CONFLICT");
  if(lead.sourceId==null&&(lead.sourceUrl!=null||
    lead.candidateStatus!=="INDEXED_FOLIO_OR_GAP_NO_GABC_ID"))
    return fail("PRIORITY_GAP_PRETENDING_TO_BE_SCORE");
  ids.add(lead.id);
  const x=lead.candidateStatus;
  priorityStatuses[x]=(priorityStatuses[x]??0)+1;
 }
 const archiveInfo=index?.screening??null;
 if(index&&(
   index.schema!=="ao-gregobase-graduale1961-research-index-v1"||
   archiveInfo?.validStaged!==1195||archiveInfo?.transcriptionExceptions!==58||
   archiveInfo?.duplicateExcluded!==1||
   !sameCount(archiveInfo?.byOfficePart??{},STAGED)))
  return fail("PR1749_SOURCE_INDEX_CONTRADICTION");
 return freeze({
  schema:"ao-mass-music-m07-review-audit-v1",
  status:"RESEARCH_LEDGER_VALID",
  archivedCandidates:all.length,sourceBatches:batches.length,
  byOfficePart:freeze({...counts}),
  textEvidenceCandidates:triageIds.size,
  textEvidenceOccurrences:evidenceCount,
  noSourceMatchYet:all.length-triageIds.size,
  sourceReferencedProperCount:triage.copiedSummary.sourcePaths,
  textStrong:triage.copiedSummary.strong,
  textPartial:triage.copiedSummary.partial,
  textDivergent:triage.copiedSummary.divergent,
  outstandingTranscriptionExceptions:index?.screening?.transcriptionExceptions??58,
  separatelyIndexedPriorityLeads:priority.leadCount,
  priorityStatuses:freeze(priorityStatuses),
  // Strict distinction: only three candidate IDs were observed as text
  // matches in a BOUNDED 2026 calendar-Mass sweep; this is not full coverage.
  bounded2026SelectedProperTextIds:3,bounded2026Occurrences:4,
  sourceSpecificMusicalApprovals:0,editorialApprovals:0,publicScores:0,
  actualRiteChantAudio:0,
  finalReview:"USER_REVIEW_ONCE_FULL_COLLECTION_IS_READY",
  nextAction:"SOURCE_FACSIMILE_AND_MASS_ROLE_VALIDATION",
  scoresNeverInferredFromIncipit:true
 });
}
/** No promotion exists here. New Gregorian material requires the user's
 * final editorial decision and a separately trusted approved-score manifest.
 */
export function m07PublicScore(_candidate,_sourceDecision,_approval){
 return null;
}
