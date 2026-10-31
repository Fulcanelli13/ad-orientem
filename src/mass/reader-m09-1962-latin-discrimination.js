// M09: normalized LATIN donor-line comparison to existing CC0 1961 GABC.
// This is STRICTLY textual screening; never claim full-score or neume fidelity.
// Original source GABC and original rich donor lines are research PR #1749.
const freeze=Object.freeze;
const CLASS=freeze({
 LINE:"NORMALIZED_DONOR_LINE_CONTIGUOUS",
 EIGHT:"SOURCE_PREFIX_EIGHT_OR_MORE_WORDS",
 FOUR:"SOURCE_PREFIX_FOUR_TO_SEVEN_WORDS",
 NONE:"NO_SECURE_FOUR_WORD_PREFIX"
});
export const M09_COMPARISON_CLASSES=CLASS;
export const M09_SOURCE_ROLE_PARTS=freeze(["in","gr","al","tr","of","co"]);
const ROLE=new Set(M09_SOURCE_ROLE_PARTS);
export const normalize1962LatinWitness=value=>
 String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/œ/gi,"oe")
 .toLowerCase().replace(/j/g,"i").replace(/[^a-z0-9]+/g," ")
 .trim().replace(/\s+/g," ");

/** GABC group contents are not Latin syllables: discard all (...) groups;
 * braces are Latin syllabic continuations, as in allelú{ia}, and remain.
 * Drop edition-only note headers, role sigla and typographic directives.
 * Retains a concatenated score-wide TEXT stream, NOT a full chant collation.
 */
export function gabcScoreLatinStream(gabc){
 return normalize1962LatinWitness(String(gabc??"")
  .replace(/<i>[^<]*<\/i>/gi," ")
  .replace(/<sp>.*?<\/sp>/gi," ")
  .replace(/<[^>]+>/g," ")
  .replace(/\([^)]*\)/g,"")
  .replace(/\{([^}]*)\}/g,"$1")
  .replace(/[*~]/g," "));
}
export function normalizedProperDonorLine(line){
 return normalize1962LatinWitness(String(line??"").replace(/^[vr]\.\s*/i,""));
}
export function screen1962ProperSourceLine(gabc,donorLine){
 const text=gabcScoreLatinStream(gabc);
 const witness=normalizedProperDonorLine(donorLine);
 const tokens=witness.split(" ").filter(Boolean);
 if(!text||tokens.length<4)return freeze({
  comparisonClass:CLASS.NONE,donorWordCount:tokens.length,
  initialMatchingWords:0,normalizedDonorLineContained:false,
  reason:"MISSING_OR_SHORT_SOURCE_WITNESS"
 });
 const score=" "+text+" ";
 let prefix=0;
 for(let i=1;i<=tokens.length;i++){
  if(score.includes(" "+tokens.slice(0,i).join(" ")+" "))prefix=i;
  else break;
 }
 const entire=score.includes(" "+witness+" ");
 const comparisonClass=entire?CLASS.LINE:prefix>=8?CLASS.EIGHT:
    prefix>=4?CLASS.FOUR:CLASS.NONE;
 return freeze({
  comparisonClass,donorWordCount:tokens.length,
  initialMatchingWords:prefix,
  normalizedDonorLineContained:entire,
  reason:"TEXT_ONLY_NOT_SCORE_OR_1962_MASS_PROOF"
 });
}
function fail(reason){return freeze({schema:"ao-mass-music-m09-evidence-audit-v1",
 status:"SOURCE_EVIDENCE_HOLD",reason,publicScores:0})}
/** Audit six metadata-only M09 ledgers against the M07 triage and M08
 * original score hashes. No source line identity -> automatic publication.
 */
export function auditM09SourceLines({batches,triage,m08Batches,selected2026}={}){
 if(!Array.isArray(batches)||batches.length!==6||
    !Array.isArray(m08Batches)||m08Batches.length!==6||
    triage?.schema!=="ao-mass-music-m07-342-source-triage-v1"||
    selected2026?.schema!=="ao-mass-music-m07-2026-bounded-selected-text-evidence-v1")
  return fail("REQUIRED_SOURCE_PROOF_MISSING");
 const original=new Map(m08Batches.flatMap(b=>b.records??[]).map(x=>[x.id,x]));
 const prior=new Map((triage.records??[]).map(x=>[x.id,x]));
 const covered=new Set();
 const count={NORMALIZED_DONOR_LINE_CONTIGUOUS:0,SOURCE_PREFIX_EIGHT_OR_MORE_WORDS:0,
  SOURCE_PREFIX_FOUR_TO_SEVEN_WORDS:0,NO_SECURE_FOUR_WORD_PREFIX:0};
 let total=0,positionRisks=0,unverified=0;
 for(let i=0;i<6;i++){
  const b=batches[i],from=m08Batches[i];
  if(b?.schema!=="ao-mass-music-m09-source-line-qa-v1"||
      b.batch!==String(i+1).padStart(3,"0")||
      b.sourceArchiveSha!==from?.source?.archiveBlobSha||
      !Array.isArray(b.records)||b.recordCount!==b.records.length||
      b.records.some(x=>x.originalSourceBatch!==b.batch))
    return fail("SOURCE_BATCH_BINDING_MISMATCH");
  for(const r of b.records){
   const score=original.get(r.id),e=prior.get(r.id);
   if(!score||!e||covered.has(r.id)||
      score.gabcSha256!==r.gabcSha256||
      score.part!==r.part||
      !ROLE.has(r.part)||
      r.tier!==e.tier||
      r.occurrences.length!==e.eligibleSourceRefs.length||
      r.printedMusicNoteParity!=="NOT_COMPARED"||
      r.selectedMass1962!=="NOT_VERIFIED"||
      r.editorialApproval!==false||
      r.publicReader!==false)
    return fail("RESEARCH_RECORD_IDENTITY_OR_RELEASE_CONFLICT");
   covered.add(r.id);
   for(let j=0;j<r.occurrences.length;j++){
    const o=r.occurrences[j],v=e.eligibleSourceRefs[j];
    if(o.sourcePath!==v.path||o.sourceBlobSha!==v.sourceBlobSha||
       o.sourceSection!==v.section||o.sourcePosition!==v.position||
       o.sourceRisk!==v.risk||
       !Object.values(CLASS).includes(o.comparisonClass)||
       !Number.isInteger(o.donorWordCount)||o.donorWordCount<4||
       !Number.isInteger(o.initialMatchingWords)||
       o.initialMatchingWords<0||o.initialMatchingWords>o.donorWordCount||
       o.normalizedDonorLineContained!==(o.comparisonClass===CLASS.LINE)||
       o.editorialTextStatus!=="AUTOMATED_SCREEN_NOT_VERIFIED")
      return fail("OCCURRENCE_TEXT_PROVENANCE_OR_STATUS_CHANGED");
    // Categories cannot make stronger claims than the token counters allow.
    if(o.comparisonClass===CLASS.LINE&&
       o.initialMatchingWords!==o.donorWordCount)return fail("COMPLETE_DONOR_LINE_INCONSISTENT");
    if(o.comparisonClass===CLASS.EIGHT&&o.initialMatchingWords<8)
      return fail("EIGHT_WORD_PREFIX_INCONSISTENT");
    if(o.comparisonClass===CLASS.FOUR&&
       (o.initialMatchingWords<4||o.initialMatchingWords>=8))
      return fail("FOUR_WORD_PREFIX_INCONSISTENT");
    if(o.comparisonClass===CLASS.NONE&&o.initialMatchingWords>=4)
      return fail("NO_PREFIX_INCONSISTENT");
    count[o.comparisonClass]++;total++;
    if(v.position!=="POSITION_NOT_VERIFIED"||v.risk!=="UNADJUDICATED")positionRisks++;
    if(o.comparisonClass===CLASS.NONE)unverified++;
   }
  }
 }
 if(covered.size!==342||total!==506||
    count.NORMALIZED_DONOR_LINE_CONTIGUOUS!==239||
    count.SOURCE_PREFIX_EIGHT_OR_MORE_WORDS!==124||
    count.SOURCE_PREFIX_FOUR_TO_SEVEN_WORDS!==44||
    count.NO_SECURE_FOUR_WORD_PREFIX!==99)
  return fail("EXPECTED_SOURCE_COMPARISON_COUNTS_CHANGED");
 if(selected2026.scope?.distinctTextMatchedCandidateIds!==3||
    selected2026.scope?.sourceMatchOccurrences!==4||
    selected2026.matches?.length!==4||
    selected2026.matches.some(x=>!original.has(x.id)||
       x.musicalApproval!==false||x.editorialApproval!==false))
  return fail("BOUNDED_SELECTED_CALENDAR_PROOF_CONFLICT");
 return freeze({schema:"ao-mass-music-m09-evidence-audit-v1",
  status:"TEXT_ONLY_SECONDARY_SCREEN_COMPLETE",
  sourceCandidateIds:covered.size,sourceOccurrences:total,
  comparisons:freeze({...count}),
  unresolvedOrInsecureOccurrences:unverified,
  positionOrRoleRiskOccurrences:positionRisks,
  selected2026TextMatchedScoreIds:3,selected2026Occurrences:4,
  fullScoreLatinVerified:0,facsimileNeumesVerified:0,
  sourceApprovedFor1962Day:0,editorialApprovals:0,publicScores:0,
  noAutomatedPromotion:true
 });
}
export function permitM09LiveScore(_candidate,_verifiedNoteSheet,_userDecision){
 return null;
}
