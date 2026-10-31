// M08 — NON-PUBLISHING bulk 1961 GABC and source-role review.
// Exact 1961 catalogue identity, GABC structural legibility and 1962
// selected Mass role are different facts. This audit never returns a
// publishable score or tells the Schola what it actually sang.
const freeze=Object.freeze;
const SUM=freeze({in:229,gr:189,al:284,tr:83,of:185,co:225});
const SEQUENCES=freeze({
 VICTIMAE_PASCHALI:1086,VENI_SANCTE_SPIRITUS:68,LAUDA_SION:308,
 DIES_IRAE:1198,STABAT_MATER:681
});
function failed(reason){return freeze({schema:"ao-mass-music-m08-bulk-qa-v1",
 status:"SOURCE_HOLD",reason,approvedScores:0,publishedScores:0})}
function sameFields(a,b){return Object.entries(b).every(([k,v])=>a?.[k]===v)&&
 Object.keys(a??{}).every(k=>Object.hasOwn(b,k))}
export function auditM08BulkSourceQA({
 m07Batches,qaBatches,tractLedger,sequenceLedger,priority
}={}){
 if(!Array.isArray(m07Batches)||m07Batches.length!==6||
   !Array.isArray(qaBatches)||qaBatches.length!==6)
  return failed("EXACT_SIX_SOURCE_BATCHES_REQUIRED");
 const all=new Map(),stats={},sourceBatches=new Set();
 for(let i=0;i<6;i++){
  const before=m07Batches[i],batch=qaBatches[i];
  if(before?.schema!=="ao-mass-music-m07-proper-review-ledger-v1"||
     batch?.schema!=="ao-mass-music-m08-gabc-basic-source-qa-v1"||
     batch.batch!==String(i+1).padStart(3,"0")||
     before.origin?.sourceBlobSha!==batch.source.archiveBlobSha||
     !Array.isArray(before.candidates)||!Array.isArray(batch.records)||
     before.itemCount!==batch.records.length||
     before.origin?.path!==batch.source.archivePath||
     batch.structuralPassing!==batch.records.length||
     batch.structuralExceptions.length!==0||
     sourceBatches.has(batch.source.archivePath))
   return failed("SOURCE_BATCH_OR_FINGERPRINT_MISMATCH");
  sourceBatches.add(batch.source.archivePath);
  const original=new Map(before.candidates.map(x=>[x.id,x]));
  for(const row of batch.records){
   const expected=original.get(row.id);
   const proof=row.diagnostics;
   if(!expected||all.has(row.id)||
      row.gabcSha256!==expected.sourceSha256||row.part!==expected.part||
      row.structuralStatus!=="BASIC_GABC_STRUCTURE_PRESENT_NOT_MUSICAL_PROOF"||
      !proof||Object.values(proof).length!==6||
      !Object.values(proof).every(x=>x===true)||
      row.selected1962!=="NOT_SCORE_VERIFIED"||
      row.printed1961NoteCollation!=="NOT_DONE"||
      row.editorialApproval!==false)
    return failed("SOURCE_HASH_OR_STRUCTURAL_QA_MISMATCH");
   stats[row.part]=(stats[row.part]??0)+1;
   all.set(row.id,row);
  }
 }
 if(all.size!==1195||!sameFields(stats,SUM))
  return failed("SOURCE_CORPUS_COUNTS_CHANGED");
 if(tractLedger?.schema!=="ao-mass-music-m08-83-tract-review-v1"||
   !Array.isArray(tractLedger.records)||tractLedger.records.length!==83)
  return failed("TRACT_REVIEW_INCOMPLETE");
 const tstats={sourceStrong:0,partial:0,divergent:0,noTextLead:0,
   positionOrRoleRisk:0};
 const used=new Set();
 for(const tract of tractLedger.records){
  const source=all.get(tract.id);
  if(!source||used.has(tract.id)||source.part!=="tr"||
     tract.sourceSha256!==source.gabcSha256||
     tract.structuralStatus!==source.structuralStatus||
     tract.editorialApproval!==false||tract.publicReader!==false||
     !tract.needsCompleteVerseAndRoleCheck||!tract.needsSyllableToNoteCollation||
     !Array.isArray(tract.candidateProperRefs))
    return failed("TRACT_SOURCE_OR_APPROVAL_MISMATCH");
  used.add(tract.id);
  const lead=source.latinLead;
  if(tract.sourceTextEvidence!==(lead?.tier??"NO_SOURCE_TEXT_LEAD")||
     tract.evidenceCount!==(lead?.donorCount??0)||
     tract.candidateProperRefs.length!==tract.evidenceCount)
    return failed("TRACT_TEXT_EVIDENCE_CHANGED");
  if(tract.sourceTextEvidence==="STRONG_INITIAL_TEXT")tstats.sourceStrong++;
  else if(tract.sourceTextEvidence==="PARTIAL_TEXT")tstats.partial++;
  else if(tract.sourceTextEvidence==="DIVERGENT_EARLY_TEXT")tstats.divergent++;
  else if(tract.sourceTextEvidence==="NO_SOURCE_TEXT_LEAD")tstats.noTextLead++;
  else return failed("TRACT_UNKNOWN_TEXT_TIER");
  if(tract.candidateProperRefs.some(e=>e.position!=="POSITION_NOT_VERIFIED"||
    e.risk!=="UNADJUDICATED"))tstats.positionOrRoleRisk++;
 }
 if(!sameFields(tstats,{sourceStrong:18,partial:3,divergent:5,
      noTextLead:57,positionOrRoleRisk:19})||
    !sameFields(tractLedger.stats,tstats))
  return failed("TRACT_REVIEW_COUNTS_CHANGED");
 if(sequenceLedger?.schema!=="ao-mass-music-m08-five-1961-sequences-v1"||
   !Array.isArray(sequenceLedger.sequences)||sequenceLedger.sequences.length!==5)
  return failed("SEQUENCES_NOT_IDENTIFIED");
 const sequenceIds=new Set(),sequenceSourceIds=new Set();
 for(const seq of sequenceLedger.sequences){
  if(!Object.hasOwn(SEQUENCES,seq.key)||seq.sourceId!==SEQUENCES[seq.key]||
      seq.officialRole!=="SEQUENTIA"||sequenceIds.has(seq.key)||
      sequenceSourceIds.has(seq.sourceId)||seq.userApproved!==false||
      seq.publicScore!==false||seq.facsimileNoteParity!==false||
      seq.fullTextParity!==false||seq.requiresActual1962Proper!==true||
      seq.scoreArchiveMembership!=="OUTSIDE_1195_SIX_PROPER_PARTS"||
      seq.sourceUrl!=="https://gregobase.selapa.net/chant.php?id="+seq.sourceId||
      !seq.printedWitness?.edition?.includes("1961")||
      !seq.printedWitness?.liberUsualis1961Page)
   return failed("SEQUENCE_SOURCE_ROLE_OR_APPROVAL_CONFLICT");
  sequenceIds.add(seq.key);sequenceSourceIds.add(seq.sourceId);
 }
 if(priority?.schema!=="ao-mass-music-m07-priority-source-queue-v1"||
   priority.leads?.length!==27)
  return failed("PRIORITY_SOURCE_LEADS_MISSING");
 const leadIds=[1086,68,308,1198,681];
 const actual=priority.leads.filter(x=>x.family==="SEQUENCE"&&
   x.sourceId!=null).map(x=>x.sourceId).sort((a,b)=>a-b);
 if(actual.length!==5||actual.some((x,i)=>x!==[...leadIds].sort((a,b)=>a-b)[i]))
  return failed("PRIORITY_SEQUENCE_IDS_NOT_CORRESPONDING");
 return freeze({schema:"ao-mass-music-m08-bulk-qa-v1",
  status:"STRUCTURAL_AND_CATALOGUE_METADATA_PASSED",
  sourceCandidatesChecked:1195,sourceBatches:6,
  roles:freeze({...stats}),structuralFailures:0,
  tractCandidates:83,tractWithTextLeads:26,
  tractWithoutTextLead:57,tractNeedsPositionReview:19,
  sequence1961ExactSourceIds:5,sequenceFullyNoteVerified:0,
  sourceOnlyNotMusicApproval:true,
  printedFacsimileNotesCompared:0,approvedScores:0,publishedScores:0,
  selectedMassAssignmentsVerified:0,editorialReview:"COLLECT_THEN_SINGLE_USER_REVIEW"
 });
}
/** Do not trust 'approved:true' in the data or caller flags. The source
 * audit has no access to the separately signed final editorial decision.
 */
export function m08PublicNotation(_candidate,_source,_approval){return null}
