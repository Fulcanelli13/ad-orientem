/**
 * Compact, actionable 289-source provenance repair register from immutable
 * 383 canonical baseline and research-only archive scan. Never overwrites
 * canonical source pages or photo/rights approvals.
 */
import {readFileSync,writeFileSync} from "node:fs";
const dir="data/calendar/";
const load=n=>JSON.parse(readFileSync(dir+n,"utf8"));
const data=load("sacred-art-phase1-canonical383-archive-provenance-20261030.v1.json");
const exact=load("sacred-art-phase1-archive-exact-source-to-accepted856-20261030.v1.json");
if(data.records.length!==383||exact.counts.exactAcceptedPageMatchCandidateEdges!==0||
 data.summary.originalCanonicalSourcePageMissing!==289)throw Error("Research baselines changed");
function normalize(url){
 try{
  const u=new URL(url);
  let path;try{path=decodeURIComponent(u.pathname)}catch{path=u.pathname}
  return u.hostname.toLowerCase().replace(/^www\./,"")+path
    .replace(/_/g," ").toLowerCase().replace(/\/+$/,"");
 }catch{return url;}
}
const review=[];
const byStatus={};const byHost={};
for(const x of data.records.filter(r=>r.missingSourcePage)){
 const urlMap=new Map();
 for(const e of x.archiveEvidence){
  if(e.matchMethod!=="EXACT_CANONICAL_ID")continue;
  for(const f of e.fields||[]){
   if(f.kind!=="OBJECT_OR_FILE_PAGE")continue;
   const normalized=normalize(f.value),existing=urlMap.get(normalized)||{
    value:f.value,category:f.value.includes("commons.wikimedia.org")?
     "COMMONS_SOURCE_FILE":"MUSEUM_OBJECT_OR_COLLECTION_PAGE",
    sourceFiles:new Set(),archivePointers:[],sameCanonicalId:true};
   existing.sourceFiles.add(e.file);
   existing.archivePointers.push({file:e.file,recordPointer:e.path,sourceField:f.field});
   urlMap.set(normalized,existing);
  }
 }
 const sourceUrls=[...urlMap.values()].map(r=>({
   url:r.value,kind:r.category,
   independentArchiveFileCount:r.sourceFiles.size,
   archiveFiles:[...r.sourceFiles].slice(0,5),
   samplePointer:r.archivePointers[0],
   certifiedOfficialObject:false,certifiedPhoto:false
 })).sort((a,b)=>b.independentArchiveFileCount-a.independentArchiveFileCount||
   a.url.localeCompare(b.url));
 for(const u of sourceUrls)try{const host=new URL(u.url).hostname;
  byHost[host]=(byHost[host]||0)+1;}catch{}
 const unambiguous=sourceUrls.length===1;
 let status=sourceUrls.length===0?"NO_ARCHIVED_OBJECT_OR_FILE_URL":
  unambiguous?"SINGLE_ARCHIVED_URL_LEAD":"MULTIPLE_ARCHIVED_URLS_REVIEW_REQUIRED";
 byStatus[status]=(byStatus[status]||0)+1;
 review.push({canonicalArtworkId:x.artworkId,title:x.title,artist:x.artist,
  historicalCanonicalPhotoSha:x.priorPhotoSha256||null,
  sourcePageCurrentlyBlank:true,
  status,
  knownArchiveSourceUrls:sourceUrls.length,
  sourceUrlOptions:sourceUrls.slice(0,8),
  additionalUrlsOmittedMathMax:Math.max(0,sourceUrls.length-8),
  archiveRecordCount:x.candidateEvidenceCount,
  sourceAction:sourceUrls.length===1?"VERIFY_ARCHIVED_URL_MUSEUM_OBJECT_AND_ATTRIBUTION":
   sourceUrls.length>1?"RESOLVE_WHICH_URL_IDENTIFIES_ORIGINAL_PROTECTED_WORK":
   x.archiveStatus==="ARCHIVED_PHOTO_HASH_ASSOCIATION_ONLY"?
   "TRACE_HASH_TO_SOURCE_FILE_PROVENANCE":"RESEARCH_ORIGINAL_OBJECT_IDENTIFIER",
  originalChoiceUnchanged:true,
  canonical383UpdateAllowed:false,photoRightsApproved:false,
  nativePhotoCertified:false,productionMutation:false});
}
const stats={totalCanonical383:383,originalSourcePageAlreadyPresent:94,
 sourcePageMissing:289,sourceMissingRowsTriageCompleted:review.length,
 uniqueArchivedUrlOption:byStatus.SINGLE_ARCHIVED_URL_LEAD||0,
 multipleArchivedUrlOptions:byStatus.MULTIPLE_ARCHIVED_URLS_REVIEW_REQUIRED||0,
 noArchivedObjectUrl:byStatus.NO_ARCHIVED_OBJECT_OR_FILE_URL||0,
 newExactAccepted856SourceMatches:0,sourcePagesWrittenToCanonical:0,
 photoRightsCertified:0,productionImported:0};
if(review.length!==289||stats.uniqueArchivedUrlOption+stats.multipleArchivedUrlOptions+
 stats.noArchivedObjectUrl!==289||review.some(x=>x.canonical383UpdateAllowed!==false||
 x.photoRightsApproved!==false||x.nativePhotoCertified!==false||
 x.productionMutation!==false))throw Error("source audit disjointness/release error");
const result={schema:"AO_SACRED_ART_CANONICAL383_SOURCE_PAGE_REPAIR_QUEUE_V1",
 generatedAt:new Date().toISOString(),authority:
 "exact canonical ID evidence in archived research files; no official photograph or legal certification",
 sourceArchive:"sacred-art-phase1-canonical383-archive-provenance-20261030.v1.json",
 exactAcceptedCrosswalk:"sacred-art-phase1-archive-exact-source-to-accepted856-20261030.v1.json",
 rules:["All 289 missing-source canonical records receive a source action; archived URLs are candidates, never automatically trusted.",
  "Only exact canonical artwork-ID record matches may introduce archived object-page URLs; photo-SHA-only evidence cannot justify a physical artwork source URL.",
  "Competing archival URLs stay unresolved; no title/similarity or uploader claims used.",
  "Original user choices, photo version, canonical ID, attribution and production remain unchanged."],
 stats,byStatus,sourceHostUrlMentions:byHost,
 rows:review,release:{canon383Untouched:true,sourcePagesAutofilled:0,
 sourceIdentityLinksPromoted:0,imageApprovals:0,productionMutation:false}};
writeFileSync(dir+"sacred-art-phase1-canonical383-source-repair-priorities-20261030.v1.json",
 JSON.stringify(result,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify({stats,examples:review.filter(x=>x.status==="SINGLE_ARCHIVED_URL_LEAD")
 .slice(0,8).map(x=>({id:x.canonicalArtworkId,title:x.title,url:x.sourceUrlOptions[0]?.url})),
 hostMentions:Object.entries(byHost).sort((a,b)=>b[1]-a[1]).slice(0,10)},null,2));
