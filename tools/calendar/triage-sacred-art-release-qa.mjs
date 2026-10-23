#!/usr/bin/env node
/** Deterministic, fail-closed triage of current-run integrated source QA evidence. */
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";
import assert from "node:assert/strict";
const data=JSON.parse(readFileSync(process.argv[2]||"artifacts/qa-integrated/manifest.json","utf8"));
const out=process.argv[3]||"artifacts/qa-release-triage";
const priorityOrder=["SOURCE_IDENTITY","LOW_RESOLUTION","PHOTO_RIGHTS","CURATOR_PHOTO_MATCH","MOBILE_QA"];
export function triage(row) {
 const issues=new Set();
 if(row.reviewAlerts.some(x=>x.includes("MUSEUM_TITLE_DIFFERS")))issues.add("SOURCE_IDENTITY");
 if(row.image.resolutionTier==="LOW_RESOLUTION")issues.add("LOW_RESOLUTION");
 if(row.reviewAlerts.some(x=>x.includes("ATTRIBUTION_LICENSE")))issues.add("PHOTO_RIGHTS");
 if(row.reviewAlerts.some(x=>x.includes("PREVIEW_BYTES_DIFFER")))issues.add("CURATOR_PHOTO_MATCH");
 issues.add("MOBILE_QA");
 const required=[...issues].sort((a,b)=>priorityOrder.indexOf(a)-priorityOrder.indexOf(b));
 const humanSourceID=Boolean(row.exactOriginalIndependentlyVerified);
 const rights=Boolean(row.photoLicensingIndependentlyVerified);
 const match=Boolean(row.portraitCropHumanVerified);
 const phone=Boolean(row.mobileVisualQAApproved);
 // Source technical checks NEVER convey independent permission to publish.
 return {artworkId:row.artworkId,title:row.title,artist:row.artist,sourcePage:row.sourcePage,
  imageSha256:row.image.sha256,dimensions:[row.image.width,row.image.height],
  sourceProvider:row.sourceProvider,sourceRightsClaim:row.photoRightsClaim,
  reviewAlerts:row.reviewAlerts,requiredHumanChecks:required,
  releaseGate:{originalIdentityVerified:humanSourceID,photoRightsVerified:rights,
    approvedPhotographicRepresentationVerified:match,phoneDisplayVerified:phone,
    allowedToPublish:humanSourceID&&rights&&match&&phone&&row.productionCertified===true},
  // Top priority: fix wrong source identity, then low-resolution, attribution, selected photo and handset QA.
  reviewPriority:required[0]==="SOURCE_IDENTITY"?0:required[0]==="LOW_RESOLUTION"?1:
    required[0]==="PHOTO_RIGHTS"?2:required[0]==="CURATOR_PHOTO_MATCH"?3:4};
}
export function makeQueue(images) {
 const records=images.map(triage).sort((a,b)=>a.reviewPriority-b.reviewPriority||a.title.localeCompare(b.title));
 const counts={};for(const x of priorityOrder)counts[x]=records.filter(r=>r.requiredHumanChecks.includes(x)).length;
 const priorities={};for(const row of records)priorities[row.reviewPriority]=(priorities[row.reviewPriority]||0)+1;
 return {schema:"AO_STAGE_TO_RELEASE_TRIAGE_V1",technicalImages:records.length,automatedFlagsRequiringReview:
  records.filter(r=>r.reviewAlerts.length>0).length,
  clearOfAutomatedWarnings:records.filter(r=>r.reviewAlerts.length===0).length,
  reviewDimensionCounts:counts,exclusiveFirstPriorityCounts:priorities,
  productionApproved:records.filter(x=>x.releaseGate.allowedToPublish).length,
  policy:{automatedWarningFreeIsNotProductionCertification:true,preserveOriginalArtworkID:true,
   neverPublishPradoSources:true,requireIndependentPhotoRightsReview:true,
   noPaidLicences:true,noCuratorArtworkRatingChanges:true},records};
}
assert(data.schema==="AO_INTEGRATED_IMAGE_TECHNICAL_QA_V1");
assert(data.summary.technicalFiles===data.images.length);
const result=makeQueue(data.images);
assert(result.productionApproved===0,"Automated triage cannot publish uncertified images");
mkdirSync(out,{recursive:true});
writeFileSync(join(out,"release-triage.json"),JSON.stringify(result,null,2)+"\n");
writeFileSync(join(out,"release-triage.csv"),
 "priority,artworkId,title,artist,provider,width,height,reviewAlerts,requiredChecks,photoRights,sha256\n"+
 result.records.map(r=>[r.reviewPriority,r.artworkId,r.title,r.artist,r.sourceProvider,...r.dimensions,
  r.reviewAlerts.join(";"),r.requiredHumanChecks.join(";"),r.sourceRightsClaim,r.imageSha256]
  .map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\n")+"\n");
const e=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const rows=result.records.map((r,i)=>'<tr><td>'+String(i+1)+'</td><td>'+r.reviewPriority+
 '</td><td>'+e(r.title)+'</td><td>'+e(r.artist)+'</td><td>'+r.dimensions.join("×")+
 '</td><td>'+e(r.sourceRightsClaim)+'</td><td>'+e(r.requiredHumanChecks.join(" / "))+
 '</td><td><a href="'+e(r.sourcePage)+'">Source</a></td></tr>').join("");
writeFileSync(join(out,"release-triage.html"),'<meta charset="utf-8"><meta name="viewport" content="width=device-width">'+
 '<title>Ad Orientem · Release-screening queue</title><style>body{background:#090d13;color:#e8e0d0;font:15px Georgia,serif;margin:25px}h1{font-size:1.7rem}p{color:#baa}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #454545;padding:8px;text-align:left}a{color:#becfdc}</style>'+
 '<h1>'+result.technicalImages+'-image technical QA to release</h1><p>'+result.clearOfAutomatedWarnings+' images have no automatic warning; all images require independent identification, photo-rights, crop and handset QA. Nothing is publication-certified.</p>'+
 '<table><tr><th>#</th><th>P</th><th>Painting</th><th>Artist</th><th>Source size</th><th>Rights</th><th>Human review checks</th><th>Source</th></tr>'+rows+'</table>');
console.log(JSON.stringify({technicalImages:result.technicalImages,clearOfWarnings:result.clearOfAutomatedWarnings,
 flags:result.reviewDimensionCounts,reviewFirstPriority:result.exclusiveFirstPriorityCounts,published:result.productionApproved}));
