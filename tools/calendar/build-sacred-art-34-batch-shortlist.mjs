#!/usr/bin/env node
/**
 * Collapse the current Commons 117-candidate research evidence to ONE
 * preliminary physical-object research shortlist across 34 approved works.
 * No photo is selected for production, no rating or date placement altered.
 * Input requires fresh Commons live metadata evidence from same current CI.
 */
import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";

const read=p=>JSON.parse(readFileSync(p,"utf8"));
const root=process.argv[2]||"artifacts/qa-discovery-merged";
const qa=read(join(root,"discovery-117-screened.json"));
const live=read(join(root,"discovery-117-live-commons-evidence.json"));
const photoExclusions=JSON.parse(readFileSync(new URL("../../data/research/sacred-art-29-photograph-identity-exceptions-20261021.v1.json",import.meta.url),"utf8"));
const normalizeFile=x=>decodeURIComponent(String(x||"")).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[_%20\s]+/g," ");
const blockedPhotoURLs=new Set(photoExclusions.quarantinedPhotoFiles.map(x=>x.artworkId+"|"+normalizeFile(x.candidateFilePage)));

const pri={"OBJECT_ACCESSION_REQUIRED":0,"SMALLER_SOURCE_NEEDS_COMPARISON":1,
 "WEAK_METADATA_MATCH":2,"MEDIUM_OR_COPY_CONFLICT":3,
 "PHOTO_LICENSE_UNRESOLVED":4,"EMBARGO_PRADO":5};
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const k=(id,url)=>id+"\u0001"+url;
function build(discovery,checks){
 assert(discovery.schema==="AO_SACRED_ART_76_DISCOVERY_CANDIDATE_SCREEN_V1");
 assert(checks.schema==="AO_SACRED_ART_COMMONS_117_LIVE_METADATA_CHECK_V1");
 assert(discovery.counts.approvedPhotos===0&&checks.counts.published===0);
 const index=new Map();
 for(const x of checks.records){
  const key=k(x.artworkId,x.candidateFilePage);
  assert(!index.has(key),"Duplicate live metadata evidence for "+key);
  index.set(key,x);
 }
 const fingerprintOwners=new Map();
 for(const x of checks.records){
  const sha=x.evidence.actualFileSha1;
  if(!sha)continue;
  const ids=fingerprintOwners.get(sha)||new Set();ids.add(x.artworkId);
  fingerprintOwners.set(sha,ids);
 }
 const fingerprintReuse=[...fingerprintOwners.entries()].filter(([,ids])=>ids.size>1)
  .map(([sha1,ids])=>({sha1,paintingIDs:[...ids].sort(),requiresObjectIdentityReview:true}));
 const rows=[];
 let sum=0;
 for(const x of discovery.records){
  if(!x.candidates?.length)continue;
  const ranked=x.candidates.map(c=>{
   const found=index.get(k(x.artworkId,c.filePage));
   assert(found,"No live evidence for "+x.artworkId+" "+c.filePage);
   const status=found.evidence.status;
   const owners=found.evidence.actualFileSha1?
     [...(fingerprintOwners.get(found.evidence.actualFileSha1)||[])].sort():[];
   const crossPaintingReuse=owners.length>1;
   const knownWrongPhoto=blockedPhotoURLs.has(x.artworkId+"|"+normalizeFile(c.filePage));
   const valid=!knownWrongPhoto&&status==="METADATA_COHERENT_ONLY"&&
    c.reviewLane!=="EMBARGO_PRADO"&&c.reviewLane!=="MEDIUM_OR_COPY_CONFLICT"&&
    !crossPaintingReuse;
   let lane=knownWrongPhoto?"REJECTED_CONFIRMED_WRONG_PHOTO":valid?"PRELIMINARY_OBJECT_IDENTITY_COMPARISON":
     crossPaintingReuse?"SHARED_IMAGE_FINGERPRINT_CROSS_PAINTING":
     status!=="METADATA_COHERENT_ONLY"?"LIVE_METADATA_EXCEPTION":
     c.reviewLane==="MEDIUM_OR_COPY_CONFLICT"?"COPY_OR_DIFFERENT_MEDIUM_HOLD":
     "PROVENANCE_HOLD";
   return {filePage:c.filePage,commonsTitle:c.commonsTitle,
    originalScore:c.documentScore||0,searchLane:c.reviewLane,
    shortEdgePx:Math.min(c.image?.width||0,c.image?.height||0),
    liveEvidenceStatus:status,liveExceptionFlags:found.evidence.issues,
    liveDeclaredLicence:found.evidence.liveLicense||null,
    liveSHA1:found.evidence.actualFileSha1||null,
    sharedAcrossPaintingIDs:owners,
    disposition:lane,confirmedWrongPhotograph:knownWrongPhoto,eligibleForHumanSourceComparison:valid,
    exactArtworkIdentityVerified:false,photoLicenceVerified:false,
    mobileCropVerified:false,productionPublished:false};
  }).sort((a,b)=>
    Number(b.eligibleForHumanSourceComparison)-Number(a.eligibleForHumanSourceComparison)||
    (pri[a.searchLane]??10)-(pri[b.searchLane]??10)||
    b.originalScore-a.originalScore||
    b.shortEdgePx-a.shortEdgePx||
    a.filePage.localeCompare(b.filePage));
  sum+=ranked.length;
  const proposal=ranked.find(c=>c.eligibleForHumanSourceComparison)||null;
  const flags=[...new Set(ranked.flatMap(c=>c.liveExceptionFlags))];
  rows.push({artworkId:x.artworkId,title:x.approvedArtTitle,artist:x.approvedArtist,
   researchCandidates:ranked.length,preliminaryFileForHumanObjectMatch:proposal?.filePage||null,
   candidateSelectionIsNotArtworkChoice:true,
   candidateSelectionIsNotPhotoPublication:true,
   reviewBucket:proposal?"ONE_SOURCE_FOR_PHYSICAL_ORIGINAL_COMPARISON":"NO_SAFE_PRELIMINARY_SOURCE",
   flaggedMetadataExceptions:flags,
   remainingFiles:ranked});
 }
 assert.equal(sum,discovery.counts.fileCandidates);
 assert.equal(index.size,checks.counts.catalogueCandidates);
 const counts={
  sourceWorks:rows.length,sourceCandidates:sum,
  metadataCoherent:checks.records.filter(x=>x.evidence.status==="METADATA_COHERENT_ONLY").length,
  metadataExceptions:checks.records.filter(x=>x.evidence.status!=="METADATA_COHERENT_ONLY").length,
  uniqueLiveSourceFiles:checks.counts.distinctFiles,
  worksWithOnePreliminaryObjectComparisonSource:rows.filter(x=>x.preliminaryFileForHumanObjectMatch).length,
  worksWithoutSafePreliminarySource:rows.filter(x=>!x.preliminaryFileForHumanObjectMatch).length,
  candidateFilesInHumanComparisonLane:rows.reduce((n,x)=>n+x.remainingFiles.filter(c=>c.eligibleForHumanSourceComparison).length,0),
  quarantinedWrongPhotographs:rows.reduce((n,x)=>n+x.remainingFiles.filter(c=>c.confirmedWrongPhotograph).length,0),
  knownWrongPhotographRegistryEntries:photoExclusions.quarantinedPhotoFiles.length,
  sharedImageFingerprints: fingerprintReuse.length,
  productionMasterCertified:0,artworkDecisionsChanged:0
 };
 assert(rows.every(x=>x.remainingFiles.every(c=>!c.productionPublished&&!c.exactArtworkIdentityVerified)));
 return {schema:"AO_SACRED_ART_34_BULK_SOURCE_IDENTITY_SHORTLIST_V1",
  asOf:checks.asOf,inputs:["discovery-117-screened.json","discovery-117-live-commons-evidence.json"],
  counts,reviewPolicy:{
   shortlistIsOnlyOneResearchFilePerArtworkNotAnApprovedPhotograph:true,
   anOfficialAccessionAndCuratorPhysicalOriginalPhotoMatchMustBeVerified:true,
   unknownOrCrossSharedShaCannotBePromoted:true,
   noReRatingOrApprovalReopening:true,noPradoOrMirrors:true,noFeesOrMuseumContacts:true,
   doNotPublishWithoutRightsAndHandsetCropChecks:true,
   noOutputWritesToAppOrCalendar:true,
   confirmedWrongPhotographsExcludedFromShortlist:true},
  crossPaintingFingerprintHolds:fingerprintReuse,records:rows};
}
export {build as buildBatchShortlist};
const out=build(qa,live);
mkdirSync(root,{recursive:true});
writeFileSync(join(root,"batch-34-object-shortlist.json"),JSON.stringify(out,null,2)+"\n");
const csv=s=>'"'+String(s??"").replace(/"/g,'""')+'"';
const lines=["artworkId,title,artist,reviewBucket,sourceCandidateCount,preliminaryFileForIdentityComparison,allMetadataExceptions,sourceStatus"];
for(const r of out.records)lines.push([r.artworkId,r.title,r.artist,r.reviewBucket,r.researchCandidates,
 r.preliminaryFileForHumanObjectMatch||"",r.flaggedMetadataExceptions.join(";"),
 r.preliminaryFileForHumanObjectMatch?"NOT_VERIFIED_FOR_USE":"HOLD"].map(csv).join(","));
writeFileSync(join(root,"batch-34-object-shortlist.csv"),lines.join("\n")+"\n");
const cards=out.records.map((x,i)=>{
 const first=x.remainingFiles.find(c=>c.eligibleForHumanSourceComparison)||null;
 return '<article data-name="'+esc((x.title+" "+x.artist).toLowerCase())+'"><header><strong>'+
  (i+1)+'. '+esc(x.title)+'</strong><p>'+esc(x.artist)+'</p></header>'+
  '<div class="picture">'+(first?
   '<img loading="lazy" alt="Unverified exact Commons source candidate" src="https://commons.wikimedia.org/wiki/Special:Redirect/file/'+
   encodeURIComponent(first.commonsTitle.replace(/^File:/i,""))+'?width=320">':
   '<p>No source file candidate</p>')+'</div>'+
  '<p><strong>'+esc(x.reviewBucket)+'</strong> · '+x.researchCandidates+' source files</p>'+
  '<p>'+(x.preliminaryFileForHumanObjectMatch?
   '<a target="_blank" rel="noopener noreferrer" href="'+esc(x.preliminaryFileForHumanObjectMatch)+'">Open preliminary Commons file</a>':
   'All returned candidates remain held')+'</p>'+
  '<details><summary>Inspect '+x.remainingFiles.length+' file statuses</summary>'+
   '<ul>'+x.remainingFiles.map(c=>'<li><a target="_blank" rel="noopener noreferrer" href="'+esc(c.filePage)+'">'+
    esc(c.commonsTitle)+'</a> · '+esc(c.disposition)+' · '+esc(c.liveEvidenceStatus)+
    (c.liveExceptionFlags.length?' · '+esc(c.liveExceptionFlags.join("; ")):'')+'</li>').join("")+
   '</ul></details></article>';
}).join("");
const html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">'+
 '<title>Ad Orientem · 34-artwork bulk object verification</title>'+
 '<style>body{background:#080d13;color:#e8e0d3;font:15px/1.4 Georgia;margin:0}body>header{padding:24px 5%;background:#17202b}h1{font:normal 30px Georgia}'+
 'header p{color:#b4ab9d}nav{padding:14px 5%}input{padding:11px;background:#17202b;color:#eee;border:1px solid #59606a;max-width:95%;width:300px}'+
 'main{padding:18px 3%;display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:16px}article{border:1px solid #464b51;padding:14px;background:#101821}article header p{margin:2px 0}'+
 'article .picture{height:230px;display:flex;align-items:center;justify-content:center;background:#090d13}article img{width:100%;height:100%;object-fit:contain}'+
 'article p,li,summary{font-size:13px;overflow-wrap:anywhere}a{color:#accce6}details{border-top:1px solid #444;padding-top:7px}li{margin:6px 0}</style>'+
 '<header><h1>34 approved paintings · source identity shortlist</h1><p>All '+out.counts.sourceCandidates+' Commons file leads screened; '+
 out.counts.worksWithOnePreliminaryObjectComparisonSource+' paintings have one preliminary source for exact-object comparison. '+out.counts.worksWithoutSafePreliminarySource+
 ' require further research. Source file photos and rights are NOT certified. Online thumbnails require an internet connection.</p></header>'+
 '<nav><input type="search" id="filter" placeholder="Find painter or painting" aria-label="Filter"></nav><main id="gallery">'+cards+
 '</main><script>document.getElementById("filter").oninput=e=>{const q=e.target.value.toLowerCase();'+
 'document.querySelectorAll("article[data-name]").forEach(x=>x.hidden=!x.dataset.name.includes(q))}</script></html>';
writeFileSync(join(root,"batch-34-object-comparison.html"),html);
console.log(JSON.stringify(out.counts));
