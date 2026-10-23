#!/usr/bin/env node
/** Build evidence-based, NON-PUBLISHING review queues from the integrated source manifest.
 * Does NOT confer rights, verify physical original from pixels, approve crop, or create media.
 */
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";
import assert from "node:assert/strict";
const OFFICIAL=new Set(["MET_OPEN_ACCESS","CLEVELAND_MUSEUM_CC0","NGA_OPEN_ACCESS"]);
const allowed=new Set([...OFFICIAL,"WIKIMEDIA_COMMONS"]);
export function classifyReview(item){
 assert(allowed.has(item.sourceProvider),"Not an approved-source intake provider");
 assert(item.productionCertified===false&&item.exactOriginalIndependentlyVerified===false,"Published/certified item in staging queue");
 const photo=item.image||{};
 const alerts=item.reviewAlerts||[];
 const rights=item.photoRightsClaim||"";
 const low=photo.resolutionTier==="LOW_RESOLUTION";
 const mismatch=alerts.some(x=>x.includes("MUSEUM_TITLE_DIFFERS")||x.includes("MISMATCH"));
 if(low)return {lane:"RESOLUTION_EXCEPTION",priority:5,reviewAction:"Find better source or explicitly approve low-resolution exception"};
 if(mismatch)return {lane:"OBJECT_IDENTITY_REVIEW",priority:4,reviewAction:"Independently match official accession, image and curator-approved physical original"};
 if(OFFICIAL.has(item.sourceProvider))return {lane:"MUSEUM_OPEN_ACCESS_VISUAL_REVIEW",priority:0,
  reviewAction:"Verify original against frozen selection, assess image framing and 2 mobile crops; no automatic release"};
 if(/^CC0$/i.test(rights))return {lane:"COMMONS_CC0_PHOTO_IDENTITY_REVIEW",priority:1,
  reviewAction:"Check file-level CC0 declaration and physical original, then image framing and mobile crops"};
 if(/^CC BY(?:-SA)?\s+[234]\.0$/i.test(rights))return {lane:"ATTRIBUTION_AND_LICENSE_COMPLIANCE",priority:2,
  reviewAction:"Resolve attribution, licence links, ShareAlike on crops/derivatives, original and phone QA"};
 if(rights==="Public domain")return {lane:"PD_ART_RIGHTS_IDENTITY_REVIEW",priority:3,
  reviewAction:"Independently confirm Commons PD-Art source rights/jurisdiction, actual physical original and crop"};
 return {lane:"RIGHTS_UNRESOLVED",priority:6,reviewAction:"Hold until independently verified usable photographic rights"};
}
export function buildReviewQueue(qa){
 assert(qa?.images?.length>0&&qa.summary.productionReleased===0,"Bad or published source manifest");
 const images=qa.images.map(x=>{
  const lane=classifyReview(x);
  return {artworkId:x.artworkId,title:x.title,artist:x.artist,sourceProvider:x.sourceProvider,
   sourcePage:x.sourcePage,rightsClaim:x.photoRightsClaim,
   technicalImage:x.image,reviewAlerts:x.reviewAlerts,sourceMetadataAgreement:x.sourceMetadataAgreement,
   frozenArtworkReviewAuthority:x.approvalSource,
   ...lane,exactPaintingVisualMatchApproved:false,reproductionRightsForAppApproved:false,
   attributionRequirementsCompleted:false,portraitMobileCropApproved:false,landscapeMobileCropApproved:false,
   productionReleaseApproved:false};
 }).sort((a,b)=>a.priority-b.priority||a.artworkId.localeCompare(b.artworkId));
 const groups=Object.fromEntries([...new Set(images.map(x=>x.lane))].map(lane=>[lane,images.filter(x=>x.lane===lane).length]));
 assert.equal(Object.values(groups).reduce((a,b)=>a+b,0),images.length);
 return {schema:"AO_SACRED_ART_VISUAL_RELEASE_REVIEW_QUEUE_V1",asOf:"2026-10-20",
  sourceActionsRun:qa.linkedActionsRun||null,filesStaged:images.length,
  hardLocks:{noPradoOrMirrors:true,noPublicationWithoutCurator:true,noAutomatedRightsClearance:true,
   noRedefinitionOfExistingPaintingRating:true,noImageMasterPushedToRepository:true,
   imageFilesAreNotPublished:true,technicalSourceOnly:true},
  releaseCount:0,groups,records:images};
}
function esc(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
export function writeQueue({manifest="artifacts/qa-integrated/manifest.json",out="artifacts/qa-integrated"}={}){
 const qa=JSON.parse(readFileSync(manifest,"utf8"));
 const result=buildReviewQueue(qa);
 mkdirSync(out,{recursive:true});
 writeFileSync(join(out,"visual-release-review-queue.json"),JSON.stringify(result,null,2)+"\n");
 const headings=Object.entries(result.groups).map(([name,count])=>"<p>"+esc(name)+": "+count+"</p>").join("");
 const rows=result.records.map(x=>"<tr><td>"+esc(x.title)+"</td><td>"+esc(x.artist)+"</td><td>"+esc(x.lane)+
  "</td><td>"+esc(x.technicalImage.width)+"×"+esc(x.technicalImage.height)+
  "</td><td>"+esc(x.reviewAction)+"</td><td><a href=\""+esc(x.sourcePage)+"\">source evidence</a></td></tr>").join("");
 writeFileSync(join(out,"visual-release-review-queue.html"),
  '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Ad Orientem · Sacred art curator gate</title>'+
  '<style>body{background:#090d13;color:#e1d8c7;font:15px Georgia;margin:25px}table{border-collapse:collapse;width:100%}th,td{border-bottom:1px solid #504d49;padding:9px;text-align:left}a{color:#aac6db}</style>'+
  '<h1>Curator approval gate · '+result.filesStaged+' artwork source files</h1><p>NOT approved or published; a metadata triage for physical-original, rights, crop and mobile visual review.</p>'+
   headings+'<table><thead><tr><th>Original</th><th>Painter</th><th>Review lane</th><th>Resolution</th><th>Outstanding review</th><th>Source</th></tr></thead><tbody>'+rows+'</tbody></table></html>');
 console.log(JSON.stringify({imageFiles:result.filesStaged,groupCounts:result.groups,releaseCount:0}));
 return result;
}
if(process.argv[1]?.endsWith("prepare-sacred-art-visual-release-queue.mjs"))writeQueue();
