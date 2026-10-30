/**
 * Research-only reconciliation of recovered canonical artwork provenance
 * against 856 accepted/conditional sources. A frozen canonical ID record
 * with an EXACT accepted original source-object/File URL is a direct lead.
 * Official accepted-source identity alone is not equivalent to photo QA.
 */
import {readFileSync,writeFileSync} from "node:fs";
const B="data/calendar/";
const load=n=>JSON.parse(readFileSync(B+n,"utf8"));
const archive=load("sacred-art-phase1-canonical383-archive-provenance-20261030.v1.json");
const cross=load("sacred-art-accepted-856-to-canonical-383-20261029.v1.json");
const museum=load("sacred-art-phase1-museum-479-accession-audit-20261029.v1.json");
const commons=load("sacred-art-phase1-commons-305-official-file-audit-20261030.v2.json");
if(archive.records.length!==383||cross.records.length!==856||
 cross.counts.confirmed!==72||cross.counts.unlinked!==784||
 museum.rows.length!==479||commons.rows.length!==305||
 archive.summary.missingCanonicalSourcePagesWithRecordedArchiveSource!==179)
 throw Error("Frozen provenance or accepted baseline drift");
const museumIds=new Set(museum.rows.map(r=>r.sourceId));
const commonsIds=new Set(commons.rows.map(r=>r.sourceId));
const canonicalPage=r=>r.priorSourcePage||null;
const normalizeUrl=url=>{
 if(!url||typeof url!=="string")return null;
 try{
  const u=new URL(url),host=u.hostname.toLowerCase().replace(/^www\./,"");
  let path;
  try{path=decodeURIComponent(u.pathname)}catch{path=u.pathname;}
  if(host==="commons.wikimedia.org"&&path.startsWith("/wiki/File:"))
    return host+"/wiki/File:"+path.slice(11).replace(/_/g," ").toLowerCase();
  return host+path.toLowerCase().replace(/\/+$/,"");
 }catch{return null;}
};
const acceptedByUrl=new Map();
const acceptedById=new Map(cross.records.map(r=>[r.sourceId,r]));
for(const r of cross.records){
 const key=normalizeUrl(r.review.originalSourceUrl);
 if(!key)continue;
 acceptedByUrl.set(key,[...(acceptedByUrl.get(key)||[]),r.sourceId]);
}
const confirmed=new Set(cross.records.filter(r=>r.canonical383.status==="CONFIRMED_IDENTITY")
 .map(r=>r.sourceId));
const unresolved=new Set(cross.records.filter(r=>r.canonical383.status==="NO_CONFIRMED_IDENTITY")
 .map(r=>r.sourceId));
const candidates=[];
for(const r of archive.records){
 if(!r.missingSourcePage)continue;
 const byTarget=new Map();
 for(const e of r.archiveEvidence){
  if(e.matchMethod!=="EXACT_CANONICAL_ID")continue;
  for(const f of e.fields||[]){
   if(f.kind!=="OBJECT_OR_FILE_PAGE")continue;
   const norm=normalizeUrl(f.value);
   for(const sid of acceptedByUrl.get(norm)||[]){
    if(!unresolved.has(sid))continue;
    // Source identity must have passed the independent 479 museum / 305 Commons audit.
    if(!museumIds.has(sid)&&!commonsIds.has(sid))continue;
    const key=r.artworkId+"|"+sid;
    const rec=byTarget.get(key)||{
     canonicalArtworkId:r.artworkId,canonicalTitle:r.title,canonicalArtist:r.artist,
     acceptedSourceId:sid,acceptedReviewTitle:acceptedById.get(sid).review.title,
     acceptedOriginalDecision:acceptedById.get(sid).review.decision,
     acceptedOriginalSourcePage:acceptedById.get(sid).review.originalSourceUrl,
     sourceLane:sid.startsWith("commons:")?"COMMONS_FILE":"INSTITUTIONAL_OBJECT",
     frozenArchiveIdentityEvidence:[],originalSourceUrlExactMatch:true,
     sourceIdentityVerifiedInCompletedExternalSourcePass:true,
     alternativePhotosRemainIndependentlyReviewed:true,productionMutation:false
    };
    rec.frozenArchiveIdentityEvidence.push({
     archiveFile:e.file,jsonOrCsvPointer:e.path,sourceField:f.field,
     archivedSourcePage:f.value,matchBasis:"EXACT_ARCHIVED_SOURCE_PAGE_TO_ACCEPTED_ORIGINAL_SOURCE_PAGE"
    });
    byTarget.set(key,rec);
   }
  }
 }
 candidates.push(...byTarget.values());
}
const byCanonical=new Map(),byAccepted=new Map();
for(const c of candidates){
 byCanonical.set(c.canonicalArtworkId,[...(byCanonical.get(c.canonicalArtworkId)||[]),c]);
 byAccepted.set(c.acceptedSourceId,[...(byAccepted.get(c.acceptedSourceId)||[]),c]);
}
for(const x of candidates){
 const distinctCanonical=byAccepted.get(x.acceptedSourceId).length;
 const distinctAccepted=byCanonical.get(x.canonicalArtworkId).length;
 x.status=distinctCanonical===1?
  (distinctAccepted===1?"EXACT_ARCHIVAL_PAGE_IDENTITY_SINGLE_PAIR":"EXACT_ARCHIVAL_PAGE_MULTIPLE_ACCEPTED_SOURCES"):
  "CONFLICT_SAME_ACCEPTED_SOURCE_MAPS_TO_MULTIPLE_CANONICAL_IDS";
 x.identityAddedToLockedCrosswalk=false;
 x.exactPhotoRightsCertified=false;x.visualCertified=false;
}
const m={};
for(const x of candidates)m[x.status]=(m[x.status]||0)+1;
const counts={
 accepted:856,lockedCanonical:383,alreadyLinkedInOriginalCrosswalk:72,
 unlinkedInOriginalCrosswalk:784,
 canonicalMissingSourcePage:289,archivalSourcePageLeads:179,
 exactAcceptedPageMatchCandidateEdges:candidates.length,
 distinctUnlinkedAcceptedSourceIds:new Set(candidates.map(x=>x.acceptedSourceId)).size,
 distinctCanonicalArtworkIds:new Set(candidates.map(x=>x.canonicalArtworkId)).size,
 uniqueOneToOneExactArchivedSourcePagePairs:
  candidates.filter(x=>x.status==="EXACT_ARCHIVAL_PAGE_IDENTITY_SINGLE_PAIR").length,
 ambiguousCandidateEdges:candidates.filter(x=>x.status.startsWith("CONFLICT")).length,
 untouchedExistingCanonicalCrosswalkLinks:72,
 canonicalMasterFilesUpdated:0,newLinksWrittenToLockedCrosswalk:0,
 exactPhotoRightsCertified:0,productionImports:0,byStatus:m
};
if(candidates.some(x=>x.identityAddedToLockedCrosswalk!==false||
 x.exactPhotoRightsCertified!==false||x.visualCertified!==false||
 x.productionMutation!==false))throw Error("Release gate changed");
const out={schema:"AO_SACRED_ART_CANONICAL_ARCHIVE_TO_ACCEPTED856_EXACT_SOURCE_JOIN_V1",
 generatedAt:new Date().toISOString(),
 sourceArchive:"data/calendar/sacred-art-phase1-canonical383-archive-provenance-20261030.v1.json",
 sourceCrosswalk:"data/calendar/sacred-art-accepted-856-to-canonical-383-20261029.v1.json",
 sourceOfficialMuseum:"data/calendar/sacred-art-phase1-museum-479-accession-audit-20261029.v1.json",
 sourceOfficialCommons:"data/calendar/sacred-art-phase1-commons-305-official-file-audit-20261030.v2.json",
 policy:["Only exact canonical art-ID references in historical archival records supply candidate source page; hash-only references excluded.",
  "The canonical source must be exactly the accepted original museum object page or Commons File page after URL normalization.",
  "An accepted source was verified as a current museum/Commons identity in earlier passes, but archival metadata and image quality must still be evaluated separately.",
  "Conflicting mapping, duplicate source-target links, attribution/ensemble identity require independent inspection before updating crosswalk.",
  "No title similarity, work-QID subject statements, or identical accession across museums are used here.",
  "Existing 72 canonical accepted-source links, canonical 383 and source-specific user decisions remain frozen."],
 counts,candidates,unmatchedArchiveSourcePageCanonicalIds:archive.records.filter(r=>r.missingSourcePage&&
 ["ARCHIVED_OBJECT_PAGE_CANDIDATE","ARCHIVED_COMMONS_FILE_PAGE_CANDIDATE"].includes(r.archiveStatus)&&
 !byCanonical.has(r.artworkId)).map(r=>r.artworkId),
 release:{historicalChoicesUnchanged:true,locked383Unchanged:true,
 baseline72Unchanged:true,newImageApprovals:0,productionMutation:false}};
writeFileSync(B+"sacred-art-phase1-archive-exact-source-to-accepted856-20261030.v1.json",
 JSON.stringify(out,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify({counts,candidatesPreview:candidates.slice(0,15).map(x=>({
  canonical:x.canonicalArtworkId,sourceId:x.acceptedSourceId,status:x.status}))},null,2));
