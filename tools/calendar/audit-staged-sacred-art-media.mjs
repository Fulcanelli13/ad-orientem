#!/usr/bin/env node
/**
 * After all source-acquisition Actions shards, verify actual saved bytes and
 * assemble ONE immutable, source-only media QA queue. No release, no commits.
 * Usage: node tools/calendar/audit-staged-sacred-art-media.mjs
 */
import assert from "node:assert/strict";
import {readFileSync,existsSync,readdirSync,statSync,mkdirSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {join} from "node:path";
import {hasPradoProvenance} from "./sacred-art-source-policy.mjs";
import {parseImageDimensions} from "./acquire-sacred-art-bulk.mjs";

const load=p=>JSON.parse(readFileSync(p,"utf8"));
const ROOT=new URL("../../",import.meta.url);
const freeze=load(new URL("data/research/sacred-art-user-frozen-decisions-20261017.v1.json",ROOT));
const intake=load(new URL("data/research/sacred-art-bulk-source-intake-451-20261020.v1.json",ROOT));
const approved=new Set(freeze.approved.map(x=>x.artworkId));
const legacy=new Set(freeze.historicallyFiveIDsPreservedSeparately);
const rejected=new Set(freeze.rejected.map(x=>x.artworkId));
const catalog=new Map(intake.works.map(x=>[x.id,x]));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function resolutionTier(w,h) {
 return Math.min(w,h)>=2400?"HIGH_RESOLUTION":Math.min(w,h)>=1600?"MEDIUM_RESOLUTION":"LOW_RESOLUTION";
}
export function summarizeSourceRows(rows) {
 const hashes=new Map();
 for(const row of rows){
  const k=row.image.sha256;
  if(!hashes.has(k))hashes.set(k,[]);
  hashes.get(k).push(row.artworkId);
 }
 const duplicatePhotoGroups=[...hashes.entries()].filter(([,v])=>v.length>1)
  .map(([sha256,artworkIds])=>({sha256,artworkIds,reviewRequired:true}));
 return {technicalFiles:rows.length,distinctImageBytes:hashes.size,
  highResolution:rows.filter(r=>r.image.resolutionTier==="HIGH_RESOLUTION").length,
  mediumResolution:rows.filter(r=>r.image.resolutionTier==="MEDIUM_RESOLUTION").length,
  lowResolution:rows.filter(r=>r.image.resolutionTier==="LOW_RESOLUTION").length,
  exactDuplicatePhotoGroups:duplicatePhotoGroups,
  sourceOriginalCertified:0,photoRightsIndependentlyCertified:0,phoneQaApproved:0,
  productionReleased:0};
}
function validatedPhoto({artworkId,title,artist,provider,sourcePage,sourceMetadata,expected,filename,folder,
  curatorAuthority,preferredPreviewKeyPresent,matchedPreferredRawBytes}) {
 const match=catalog.get(artworkId);
 assert(match&&!rejected.has(artworkId)&&match.sourcePolicy?.noFetch!==true,
   "Rejected, missing, or Prado-held artwork cannot become QA media: "+artworkId);
 assert((match.reviewGate==="APPROVED"&&approved.has(artworkId))||
   (match.reviewGate==="LEGACY_FIVE_PRESERVED"&&legacy.has(artworkId)),
   "Unapproved artwork ID "+artworkId);
 assert(!hasPradoProvenance({...match,sourceUrl:sourcePage}),"No Prado originals or mirrors");
 const file=join(folder,filename);
 assert(existsSync(file),"Acquired image missing: "+file);
 const bytes=readFileSync(file);
 const sha=createHash("sha256").update(bytes).digest("hex");
 assert.equal(sha,expected.sha256,"Image hash mismatch: "+artworkId);
 const mime=filename.toLowerCase().endsWith(".png")?"image/png":"image/jpeg";
 const dims=parseImageDimensions(bytes,mime);
 assert.equal(dims.width,expected.width,"Pixel width mismatch: "+artworkId);
 assert.equal(dims.height,expected.height,"Pixel height mismatch: "+artworkId);
 assert(bytes.length>=70000&&bytes.length<=35000000,"Bad image size "+artworkId);
 const res=resolutionTier(dims.width,dims.height);
 const rights=provider==="NGA_OPEN_ACCESS"?"NGA_OPENACCESS_1":
   sourceMetadata?.licenseName||sourceMetadata?.rights||"UNVERIFIED";
 const alerts=[];
 if(res==="LOW_RESOLUTION")alerts.push("LOW_RESOLUTION_REPLACE_OR_ACCEPT_EXCEPTION");
 if(matchedPreferredRawBytes===false&&preferredPreviewKeyPresent===true)
   alerts.push("PREVIEW_BYTES_DIFFER_OR_WERE_REENCODED_CHECK_VISUALLY");
 if(/BY-SA|CC BY/i.test(rights))alerts.push("VERIFY_ATTRIBUTION_LICENSE_REQUIREMENTS");
 if(rights==="UNVERIFIED")alerts.push("NO_PHOTO_RIGHTS_DECLARATION");
 const originalMatch=sourceMetadata?.metadataAgreement;
 if(originalMatch?.titleComparable===true&&originalMatch.titleAgreement===false)
   alerts.push("MUSEUM_TITLE_DIFFERS_FROM_CATALOGUE_VERIFY_PHYSICAL_OBJECT");
 return {artworkId,title,artist,sourcePage,sourceProvider:provider,approvalSource:curatorAuthority,
  photoRightsClaim:rights,imageRightsEvidenceUrl:sourceMetadata?.licenseUrl||sourceMetadata?.rightsUrl||null,
  image:{relativeArtifactPath:file.split("artifacts/").pop(),sha256:sha,bytes:bytes.length,
    ...dims,resolutionTier:res},
  preferredPreviewKeyPresent,rawBytesMatchPreferredPreview:matchedPreferredRawBytes,
  sourceMetadataAgreement:originalMatch??null,reviewAlerts:alerts,
  exactOriginalIndependentlyVerified:false,photoLicensingIndependentlyVerified:false,
  portraitCropHumanVerified:false,mobileVisualQAApproved:false,productionCertified:false};
}
export function runAudit({bulkDir="artifacts/qa-merged-bulk",ngaDir="artifacts/qa-nga",
 outputDir="artifacts/qa-integrated"}={}) {
 const rows=[],batchSummary=[];
 for(let n=1;n<=10;n++){
  const folder=join(bulkDir,"batch-"+String(n).padStart(2,"0"));
  const record=load(join(folder,"results.json"));
  assert(record.results.length===(n===10?1:50),"Missing canonical 50-work shard "+n);
  batchSummary.push({batch:n,evaluated:record.results.length,staged:record.stagedForQA});
  let actual=0;
  for(const src of record.results)if(src.imageStaged){
   actual++;
   const t=src.technical;
   rows.push(validatedPhoto({artworkId:src.artworkId,title:src.catalogTitle,artist:src.catalogArtist,
    provider:src.sourceMetadata.provider,sourcePage:src.originalSourcePage,
    sourceMetadata:src.sourceMetadata,expected:t,filename:t.filename,folder,
    curatorAuthority:src.curatorAuthority,
    preferredPreviewKeyPresent:src.preferredReviewHashKnown,
    matchedPreferredRawBytes:src.matchesPreferredReviewBytes}));
  }
  assert.equal(actual,record.stagedForQA,"Staged-image count mismatch "+n);
 }
 const nga=load(join(ngaDir,"results.json"));
 assert.equal(nga.results.length,6,"NGA six-item source run is required");
 for(const src of nga.results)if(src.image){
  assert(src.datasetRightsFlag===1&&src.ngaPublishedImage?.openaccess===1
    &&src.ngaPublishedImage?.viewtype==="primary","NGA image not explicitly Open Access");
  const im=src.image;
  rows.push(validatedPhoto({artworkId:src.artworkId,title:src.title,artist:src.artist,
   provider:"NGA_OPEN_ACCESS",sourcePage:src.objectPage,
   sourceMetadata:{rightsUrl:src.rightsDocumentation},
   expected:im,filename:im.file,folder:ngaDir,
   curatorAuthority:"OCT17_OR_W64_APPROVED",preferredPreviewKeyPresent:false,
   matchedPreferredRawBytes:false}));
 }
 assert.equal(new Set(rows.map(x=>x.artworkId)).size,rows.length,"Duplicated canonical artwork IDs");
 const summary=summarizeSourceRows(rows);
 const output={schema:"AO_INTEGRATED_IMAGE_TECHNICAL_QA_V1",asOf:"2026-10-20",
  linkedActionsRun:process.env.GITHUB_RUN_ID||null,sourceBatches:batchSummary,
  requiresHumanApproval:["physicalOriginalIdentity","photoRights","attributionAndShareAlike",
    "selectedPhotographicReproduction","crop","phoneVisualQA"],
  excluded:["Museo del Prado originals and reproductions","unapproved or rejected paintings"],
  summary,images:rows};
 mkdirSync(outputDir,{recursive:true});
 writeFileSync(join(outputDir,"manifest.json"),JSON.stringify(output,null,2)+"\n");
 const cards=rows.map(x=>'<tr><td>'+esc(x.title)+'</td><td>'+esc(x.artist)+'</td><td>'+
  esc(x.sourceProvider)+'</td><td>'+x.image.width+' × '+x.image.height+'</td><td>'+
  esc(x.photoRightsClaim)+'</td><td>'+esc(x.reviewAlerts.join("; "))+'</td><td>'+
  '<a href="'+esc(x.sourcePage)+'">source</a></td></tr>').join("");
 writeFileSync(join(outputDir,"review.html"),'<meta charset="utf-8"><title>Ad Orientem · Staged originals</title>'+
  '<style>body{font:15px Georgia;background:#090d13;color:#ded8ca;margin:28px}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #4a4a4a;padding:9px;text-align:left}a{color:#c4d4e6}</style>'+
  '<h1>Technical originals QA — no production publication</h1><p>Source metadata and files verified; not curator-approved photographic masters. Human review required.</p>'+
  '<p>'+summary.technicalFiles+' files; '+summary.distinctImageBytes+' distinct byte hashes; '+
   summary.lowResolution+' low-resolution photographs</p><table><tr><th>Work</th><th>Artist</th><th>Provider</th><th>Dimensions</th><th>Rights claim</th><th>Required review</th><th>Object page</th></tr>'+cards+'</table>');
 console.log(JSON.stringify({summary,batches:batchSummary}));
 return output;
}
if(process.argv[1]?.endsWith("audit-staged-sacred-art-media.mjs"))runAudit();
