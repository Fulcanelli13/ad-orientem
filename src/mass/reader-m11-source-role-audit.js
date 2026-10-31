// M11 — source-literal chant-role recovery. These are research-only metadata.
// Divinum Officium source file SHA is REQUIRED before trusting section role.
// A role segment is not itself proof of an actually selected 1962 Mass.
const freeze=Object.freeze;
const roles=freeze({GRADUAL:"gr",TRACT:"tr",ALLELUIA:"al",OFFERTORY:"of",COMMUNION:"co"});
const roleCode=new Set(Object.values(roles));
const sha40=/^[0-9a-f]{40}$/,sha64=/^[0-9a-f]{64}$/;
const key=x=>x.originalScoreId+"|"+x.sourcePath+"|"+x.sourceSha+"|"+x.donorLatin;
export function normalizeM11Latin(value){
 return String(value??"").normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"").replace(/æ/gi,"ae")
  .replace(/œ/gi,"oe").toLowerCase().replace(/j/g,"i")
  .replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
}
/** Identify role only when the source itself places a line in a bounded
 * region. Textual owner and musical score do NOT follow from this alone.
 */
export function findM11SourceRole(sourceText,donor,requestedSection="Graduale"){
 const src=String(sourceText??"");
 const block=src.match(new RegExp("(?:^|\\n)\\["+requestedSection+"\\]\\r?\\n([\\s\\S]*?)(?=\\r?\\n\\[[^\\]]+\\]|$)"))?.[1];
 if(!block)return freeze({status:"NO_SOURCE_SECTION",foundRoles:freeze([])});
 const target=normalizeM11Latin(donor);
 let part=requestedSection==="Communio"?"COMMUNION":
  requestedSection==="Offertorium"?"OFFERTORY":"GRADUAL";
 const found=[];
 block.split(/\r?\n/).forEach((value,index)=>{
  const line=value.trim(),heading=normalizeM11Latin(line);
  if(requestedSection==="Graduale"){
   if(heading==="alleluia alleluia"){part="ALLELUIA";return;}
   if(/^!\s*Tractus\b/i.test(line)){part="TRACT";return;}
  }
  if(!line||line==="_"||line.startsWith("!"))return;
  const txt=normalizeM11Latin(line.replace(/^[vr]\.\s*/i,""));
  if(txt&&(txt===target||txt.includes(target)||target.includes(txt)))
    found.push(freeze({line:index,role:part}));
 });
 return freeze({status:found.length===1?"SOURCE_LINE_LOCATED":
   found.length>1?"AMBIGUOUS_SOURCE_LINE":"SOURCE_LINE_NOT_FOUND",
   foundRoles:freeze(found)});
}
function denied(reason){return freeze({schema:"ao-mass-music-m11-role-audit-v1",
 status:"SOURCE_OR_EDITORIAL_HOLD",reason,publicScores:0});}
export function auditM11SourceRoleRecovery({
 segments,sourceCorrected,residual15,priorResidual45,m07Batches
}={}){
 if(!Array.isArray(segments)||segments.length!==4||
  sourceCorrected?.schema!=="ao-mass-music-m11-45-source-role-recovery-v1"||
  residual15?.schema!=="ao-mass-music-m11-residual15-source-priority-v1"||
  priorResidual45?.schema!=="ao-mass-music-m10-remaining45-research-queue-v1"||
  !Array.isArray(m07Batches)||m07Batches.length!==6)
   return denied("MANDATORY_PROVENANCE_MISSING");
 const catalogue=new Map(m07Batches.flatMap(b=>b.candidates??[]).map(x=>[x.id,x]));
 if(catalogue.size!==1195)return denied("ORIGINAL_SCORE_CATALOGUE_INVALID");
 const sourceFiles=new Map(),seen=new Set(),prior=new Map();
 for(const x of priorResidual45.records){
  const id=x.id+"|"+x.sourcePath+"|"+x.sourceBlobSha+"|"+x.normalizedLatinWitness;
  if(prior.has(id))return denied("NONUNIQUE_RESIDUAL_PROVENANCE");
  prior.set(id,x);
 }
 if(prior.size!==45)return denied("ORIGINAL_RESIDUAL_INCOMPLETE");
 for(let i=0;i<4;i++){
  const s=segments[i];
  if(s?.schema!=="ao-mass-music-m11-1962-pre-gospel-segment-v1"||
      s.segmentBatch!==i+1||
      s.sourceRepo!=="DivinumOfficium/divinum-officium"||
      s.sourcePolicy!=="CHECK_SHA_BEFORE_TRUSTING_ROLE_SEGMENT"||
      s.approval!==false||s.publicReader!==false||
      s.sourceFiles?.length!==7)return denied("SOURCE_FILE_BATCH_INVALID");
  for(const f of s.sourceFiles){
   if(sourceFiles.has(f.path)||!sha40.test(f.sourceBlobSha??"")||
       f.sourceShaVerified!==true||f.expectedBlobSha!==f.sourceBlobSha||
       !Array.isArray(f.matches))return denied("DONOR_BLOB_IDENTITY_CONFLICT");
   sourceFiles.set(f.path,f);
   for(const m of f.matches){
    const id=m.id+"|"+f.path+"|"+f.sourceBlobSha+"|"+m.donor;
    if(seen.has(id)||!prior.has(id)||
       !Number.isInteger(m.sourceTextMatches)||
       m.sourceTextMatches!==1||
       m.sourceSegments?.length!==1||
       !Object.hasOwn(roles,m.classification)||
       m.sourceSegments[0].role!==m.classification||
       m.originalRole!==prior.get(id).sourceRole)
      return denied("ORIGINAL_DONOR_LINE_ROLE_RECONCILIATION_FAILED");
    seen.add(id);
   }
  }
 }
 if(sourceFiles.size!==28||seen.size!==45)
   return denied("PINNED_28_SOURCE_FILES_NOT_COMPLETE");
 if(!Array.isArray(sourceCorrected.records)||
    sourceCorrected.records.length!==45||
    sourceCorrected.sourceFilesVerified!==28||
    sourceCorrected.sourceOccurrences!==45||
    !Array.isArray(residual15.stillUnresolved)||
    residual15.count!==15||
    residual15.stillUnresolved.length!==15)
   return denied("CORRECTED_COLLECTION_INCOMPLETE");
 let changes=0,withCandidate=0,none=0,relationships=0,multiple=0;
 const latest=new Map(),countRoles={};
 for(const row of sourceCorrected.records){
  const origin=prior.get(row.originalScoreId+"|"+row.sourcePath+"|"+
    row.sourceSha+"|"+row.donorLatin);
  const m=sourceFiles.get(row.sourcePath)?.matches?.find(y=>
    y.id===row.originalScoreId&&y.donor===row.donorLatin);
  if(!origin||!m||latest.has(key(row))||
     row.sourceSha!==origin.sourceBlobSha||
     row.originalScorePart!==origin.sourceRole||
     row.originalGabcSha256!==origin.originalScoreSha256||
     row.sourceSegment!==m.classification||
     row.sourceTextMatches!==1||
     row.sourceLines?.length!==1||
     row.sourceLines[0].role!==m.classification||
     row.correctedRoleCandidate!==roles[row.sourceSegment]||
     row.roleConflict!==(row.correctedRoleCandidate!==row.originalScorePart)||
     row.selected1962ProperVerified!==false||
     row.printedMelodicNotesVerified!==false||
     row.userApproved!==false||row.publicReader!==false||
     row.sourceRevision!=="PINNED_GIT_BLOB_VERIFIED"||
     row.status!=="CORRECTED_SOURCE_ROLE_TEXT_LEADS_ONLY")
    return denied("SOURCE_ROLE_OR_APPROVAL_CONFLICT");
  if(!Array.isArray(row.candidates)||
     row.provisionalCandidateCount!==row.candidates.length)
    return denied("CANDIDATE_COUNT_CORRUPTED");
  const unique=new Set();
  for(const c of row.candidates){
   const original=catalogue.get(c.id);
   if(unique.has(c.id)||!original||original.part!==row.correctedRoleCandidate||
      c.part!==row.correctedRoleCandidate||
      c.id===row.originalScoreId||
      c.sourceFolio!==original.folio||
      c.sourceUrl!==original.sourceUrl||
      c.gabcSha256!==original.sourceSha256||
      !sha64.test(c.gabcSha256??"")||
      !["FULL_DONOR_LINE_TEXT","FIRST_EIGHT_WORDS_ONLY"].includes(c.latinEvidence))
     return denied("SCORE_ROLE_OR_TEXT_LEAD_SPOOF");
   unique.add(c.id);
  }
  latest.set(key(row),row);
  countRoles[row.sourceSegment]=(countRoles[row.sourceSegment]??0)+1;
  if(row.roleConflict)changes++;
  if(row.candidates.length)withCandidate++;else none++;
  if(row.candidates.length>1)multiple++;
  relationships+=row.candidates.length;
 }
 if(changes!==37||withCandidate!==30||none!==15||relationships!==35||
    multiple!==5||
    JSON.stringify(countRoles)!==JSON.stringify({
      GRADUAL:36,ALLELUIA:4,TRACT:3,OFFERTORY:1,COMMUNION:1
    }))return denied("ACTUAL_ROLE_REASSIGNMENT_COUNTS_CHANGED");
 const remaining=new Set();
 for(const r of residual15.stillUnresolved){
  const found=[...latest.values()].find(x=>x.originalScoreId===r.originalScoreId&&
    x.sourcePath===r.sourcePath&&x.sourceSha===r.sourceSha&&
    x.candidates.length===0);
  const id=r.originalScoreId+"|"+r.sourcePath+"|"+r.sourceSha+"|"+r.donorLatin;
  if(!found||r.sourceRole!==found.correctedRoleCandidate||
     r.roleConflict!==found.roleConflict||
     r.rejected!==false||r.releaseApproved!==false||
     r.notFoundInPrintedBook!==false||remaining.has(id))
    return denied("RESIDUAL15_SOURCE_OR_STATUS_INVALID");
  remaining.add(id);
 }
 if(remaining.size!==15||
    JSON.stringify(residual15.roles)!==JSON.stringify({
      GRADUAL:11,ALLELUIA:2,OFFERTORY:1,COMMUNION:1
    }))return denied("RESIDUAL15_CLASSIFICATION_CHANGED");
 return freeze({
  schema:"ao-mass-music-m11-role-audit-v1",
  status:"SOURCE_ROLE_RESEARCH_RECONCILED",
  pinnedSourceFiles:28,pinnedSourceShaMatches:28,
  originallyWeakOccurrences:45,correctedRoleConflicts:37,
  candidatesFoundAfterCorrectRole:30,remainingNoTextCandidate:15,
  recoveredTextRelationships:35,multiCandidateOccurrences:5,
  sourceRoleParts:freeze({...countRoles}),
  actualSelected1962ProperVerified:0,
  printed1961NeumesCompared:0,userApprovals:0,publicScores:0,
  automatedReassignments:0
 });
}
/** The source ledger can never publish, regardless of client claims. */
export function promoteM11Score(_source,_notationalProof,_reviewer){return null;}
