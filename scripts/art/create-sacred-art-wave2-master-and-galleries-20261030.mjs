/**
 * Materialize Sacred Art master v2, three exclusive queues and two large
 * first-look photo review galleries from 493 source-status records.
 * Never touches first human review 73 or prior user decisions.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createHash} from "node:crypto";
const V1="data/calendar/sacred-art-master-v1/";
const V2="data/calendar/sacred-art-master-v2/";
const old=JSON.parse(readFileSync(V1+"master.json","utf8"));
const priorSummary=JSON.parse(readFileSync(V1+"summary.json","utf8"));
const audit=JSON.parse(readFileSync(V1+"wave2-493-official-source-audit-20261030.v1.json","utf8"));
const auditByGroup=new Map(audit.results.map(x=>[x.group,x]));
const previous73=new Set(old.reviewBatch.map(x=>x.id));
if(old.counts.registryRecords!==3205||old.operationalWorks.length!==989||
 previous73.size!==73||audit.results.length!==493||auditByGroup.size!==493)
 throw Error("Source scope changed");
const works=structuredClone(old.operationalWorks);
const registry=structuredClone(old.registry);
let promoted=0,officialClear=0,deferred=0,exceptions=0;
const trace=[];
for(const w of works){
 const a=auditByGroup.get(w.workGroupId);
 if(!a)continue;
 const before={queue:w.queue,rightsCategory:w.rightsCategory,
  source:w.selectedSourceUrl};
 if(a.status==="COMMONS_PD_OR_CC0_FILE_METADATA"){
  if(w.queue!=="RIGHTS_OR_ALTERNATIVE"||!a.fileSha1||!a.sourcePageCurrentImageUrl||
     !a.freeSourceFileMetadataCandidate)throw Error("Invalid Commons liberation "+w.workGroupId);
  w.queue="PHOTO_QA_OR_REPAIR";
  w.rightsCategory="PUBLIC_DOMAIN_OR_CC0_COMMONS_FILE_METADATA";
  w.rightsLabel=a.licenceShortName||"Public domain";
  w.rightsEvidence="CURRENT_COMMONS_ORIGINAL_FILE_IMAGEINFO_SHA1";
  w.rightsTerms="File metadata suggests PD/CC0; check exact file and jurisdiction before publishing";
  w.rightsPolicyUrl=a.licenceUrl||"";
  w.photographerCredit=a.author||a.credit||"";
  w.selectedPhotoFingerprint=a.fileSha1;
  w.selectedSourceUrl=a.sourceUrl;
  w.qualityReviewImageUrl=a.sourcePageCurrentImageUrl;
  w.qualityReviewPreviewUrl=a.previewImageUrl||a.sourcePageCurrentImageUrl;
  w.qualityReviewSourceSha1=a.fileSha1;
  w.qualityReviewDimensions=[a.fileWidth,a.fileHeight];
  w.officialMetadataLabel=a.licenceShortName;
  w.substatus="READY_FOR_USER_NATIVE_VISUAL_INSPECTION_RIGHTS_FINAL_GATE_PENDING";
  w.readyForUserPristineQualityReview=true;
  w.currentSourceProof="COMMONS_FILE_IMAGEINFO_20261030";
  promoted++;
 }else if(a.status==="OFFICIAL_OPEN_ACCESS_IMAGE_CANDIDATE"){
  if(w.queue!=="PHOTO_QA_OR_REPAIR"||
     !a.originalImageUrl||!a.currentRightsOpen)throw Error("Invalid official candidate "+w.workGroupId);
  w.rightsCategory="OFFICIAL_OPEN_ACCESS_CURRENT_PRIMARY_IMAGE_METADATA";
  w.rightsEvidence="OFFICIAL_OBJECT_ID_RIGHTS_IMAGE_API_20261030";
  w.rightsLabel="CC0 / Public domain (official collection API)";
  w.rightsTerms="Current open-access image candidate; independently verify saved original bytes and any earlier alternate photograph";
  w.qualityReviewImageUrl=a.originalImageUrl;
  w.qualityReviewPreviewUrl=a.previewImageUrl||a.originalImageUrl;
  w.qualityReviewSourceSha1=null;
  w.qualityReviewDimensions=a.publishedDimensions||null;
  w.substatus="READY_FOR_USER_NATIVE_VISUAL_INSPECTION_VERIFY_ALTERNATE_VERSION";
  w.readyForUserPristineQualityReview=true;
  w.currentSourceProof="MUSEUM_OBJECT_API_20261030";
  officialClear++;
 }else{
  w.lastSourceAuditStatus=a.status;
  if(a.status==="CC_BY_OR_BY_SA_COMPLIANCE_DEFERRED"||
     a.status==="COPYRIGHT_CONFLICT_METADATA"){
   if(w.queue!=="RIGHTS_OR_ALTERNATIVE")throw Error("Unexpected rights lane "+w.workGroupId);
   w.substatus=a.status==="COPYRIGHT_CONFLICT_METADATA"?
    "RIGHTS_METADATA_CONFLICT_FIND_FREE_ALTERNATE":
    "ATTRIBUTION_AND_SHAREALIKE_LICENSE_DEFERRED";
   w.qualityReviewImageUrl=null;deferred++;
  }else {
   // A transient 403/429 is not a licence denial: retain source-rights research queue.
   w.substatus="SOURCE_API_CURRENTLY_UNREACHABLE_RETAIN_EARLIER_REUSE_EVIDENCE";
   exceptions++;
  }
 }
 w.imageOriginalNativeLocallyVerified=false;
 w.userPhotoQualityApproval=false;
 w.exactPhotoRightsCertifiedForSelectedBytes=false;
 w.productionReleased=false;
 trace.push({workGroupId:w.workGroupId,sourceAuditStatus:a.status,
  oldQueue:before.queue,newQueue:w.queue,oldRightsCategory:before.rightsCategory,
  newRightsCategory:w.rightsCategory,sourceUrl:w.selectedSourceUrl,
  exactPhotoRightsReleased:false,originalPhotoQualityApproved:false});
}
if(promoted!==331||officialClear!==40||deferred!==20||exceptions!==102||
 trace.length!==493)throw Error("Expected audited transitions 331/40/20/102");
const grouped=new Map(works.map(x=>[x.workGroupId,x]));
for(const original of registry){
 const a=auditByGroup.get(original.workGroupId);
 const w=grouped.get(original.workGroupId);
 if(!a||!w||original.sourceUrl!==a.sourceUrl)continue;
 // Exact-source metadata for this variant only: preserve ALL prior approval fields.
 if(a.status==="COMMONS_PD_OR_CC0_FILE_METADATA"||
    a.status==="OFFICIAL_OPEN_ACCESS_IMAGE_CANDIDATE"){
  original.rights={...original.rights,classification:w.rightsCategory,
   label:w.rightsLabel,evidence:w.rightsEvidence,
   terms:w.rightsTerms,policyUrl:w.rightsPolicyUrl||"",
   sourcePhotoId:w.selectedPhotoFingerprint||"",
   credit:w.photographerCredit||"",
   exactImageFileProof:"OFFICIAL_METADATA_NOT_NATIVE_BYTES",
   requiresFileByteCheck:true};
  original.wave2CurrentSourceImageUrl=w.qualityReviewImageUrl;
  original.wave2PhotoQualityUserCertified=false;
 }
}
const qNames=["READY_TO_PUBLISH","PHOTO_QA_OR_REPAIR","RIGHTS_OR_ALTERNATIVE"];
const queues=Object.fromEntries(qNames.map(n=>[n,works.filter(x=>x.queue===n)]));
const counts={registryRecords:registry.length,
 operationalArtworkGroups:works.length,
 initialQualityReview73Protected:previous73.size,
 sourceGroupsRechecked:trace.length,
 originalQueuePhotoQa:old.counts.queuePhotoQaOrRepair,
 originalQueueRights:old.counts.queueRightsOrAlternative,
 movedFromRightsToPhotoQa:promoted,
 currentMuseumImageCandidates:officialClear,
 deferredAttributionOrConflict:deferred,
 transientMuseumApiExceptions:exceptions,
 queueReadyToPublish:queues.READY_TO_PUBLISH.length,
 queuePhotoQaOrRepair:queues.PHOTO_QA_OR_REPAIR.length,
 queueRightsOrAlternative:queues.RIGHTS_OR_ALTERNATIVE.length,
 pristinePhotoApprovals:0,
 exactPhotoRightsReleaseCertifications:0,productionImports:0,
 newEditorialApprovals:0,costEur:0};
if(counts.queueReadyToPublish!==0||
 counts.queuePhotoQaOrRepair!==548||
 counts.queueRightsOrAlternative!==441||
 counts.queuePhotoQaOrRepair+counts.queueRightsOrAlternative!==989)
 throw Error("New three-queue partition incorrect");
const newlyReviewed=works.filter(w=>!previous73.has(w.workGroupId)&&
 w.readyForUserPristineQualityReview&&
 (w.currentSourceProof==="COMMONS_FILE_IMAGEINFO_20261030"||
  w.currentSourceProof==="MUSEUM_OBJECT_API_20261030"));
newlyReviewed.sort((a,b)=>b.priorityScore-a.priorityScore||
 a.artworkTitle.localeCompare(b.artworkTitle));
if(newlyReviewed.length!==371||newlyReviewed.some(w=>previous73.has(w.workGroupId)))
 throw Error("Expected disjoint 371 candidates");
const batches=[newlyReviewed.slice(0,200),newlyReviewed.slice(200)];
if(batches[0].length!==200||batches[1].length!==171)throw Error("Bad 200/171 pagination");
const quote=x=>{
 if(x==null)return "";
 const s=Array.isArray(x)?x.join(" | "):typeof x==="object"?JSON.stringify(x):String(x);
 return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;
};
const csv=(rows,cols)=>"\uFEFF"+cols.join(",")+"\n"+rows.map(r=>cols.map(c=>quote(r[c])).join(",")).join("\n")+(rows.length?"\n":"");
const outputQueue=w=>({
 physical_work_group:w.workGroupId,title:w.artworkTitle,artist:w.artist,
 queue:w.queue,substatus:w.substatus,
 rights_category:w.rightsCategory,rights_label:w.rightsLabel,
 rights_evidence:w.rightsEvidence,rights_terms:w.rightsTerms,
 rights_policy_url:w.rightsPolicyUrl,photographer_credit:w.photographerCredit,
 selected_photo_file_fingerprint:w.selectedPhotoFingerprint,
 source_url:w.selectedSourceUrl,original_sha256:w.sourceOriginalSha256,
 source_record:w.preferredRecordId,canon_artwork_id:w.canonicalArtworkId,
 module_targets:w.moduleIds,source_variant_count:w.allSourceVariantCount,
 priority_score:w.priorityScore,official_image_original:w.qualityReviewImageUrl||"",
 official_image_preview:w.qualityReviewPreviewUrl||"",
 photo_file_sha1:w.qualityReviewSourceSha1||"",
 official_dimensions:w.qualityReviewDimensions||"",
 native_original_verified:false,human_pristine_approved:false,approved_in_app:false
});
const columns=["physical_work_group","title","artist","queue","substatus",
 "rights_category","rights_label","rights_evidence","rights_terms","rights_policy_url",
 "photographer_credit","selected_photo_file_fingerprint","source_url",
 "original_sha256","source_record","canon_artwork_id","module_targets",
 "source_variant_count","priority_score","official_image_original",
 "official_image_preview","photo_file_sha1","official_dimensions",
 "native_original_verified","human_pristine_approved","approved_in_app"];
mkdirSync(V2,{recursive:true});
for(const name of qNames)
 writeFileSync(V2+"queue-"+name.toLowerCase().replaceAll("_","-")+".csv",
 csv(queues[name].map(outputQueue).sort((a,b)=>b.priority_score-a.priority_score||
 String(a.title||"").localeCompare(String(b.title||""))),columns));
const reviewCols=["batch_position",...columns,"user_photo_decision","quality_issue_notes",
 "user_reviewed_image_sha256","reviewed_on"];
const md=structuredClone(old);
md.registry=registry;md.operationalWorks=works;
md.counts={...old.counts,wave2SourceRecordsChecked:493,
 queueReadyToPublish:counts.queueReadyToPublish,
 queuePhotoQaOrRepair:counts.queuePhotoQaOrRepair,
 queueRightsOrAlternative:counts.queueRightsOrAlternative,
 secondWaveNewPristineCandidates:newlyReviewed.length,
 newQualityApprovalsGranted:0,newPhotoPublicationApprovals:0};
md.schema="AO_SACRED_ART_MASTER_WAVE2_V2";
md.wave2Audit="data/calendar/sacred-art-master-v1/wave2-493-official-source-audit-20261030.v1.json";
md.routingAudit=trace;
md.release={productionMutation:false,editorialChanges:0,userPhotoApproved:0,
 original73ReviewContentsUnchanged:true};
writeFileSync(V2+"master.json",JSON.stringify(md,null,2)+"\n");
const originalCsv=readFileSync(V1+"master.csv","utf8");
const parseCsv=(text)=>{
 let arr=[],row=[],cell="",q=false;for(let i=0;i<text.length;i++){
  const c=text[i];if(c==='"'){if(q&&text[i+1]==='"'){cell+='"';i++}else q=!q}
  else if(c===","&&!q){row.push(cell);cell=""}
  else if((c==="\n"||c==="\r")&&!q){if(c==="\r"&&text[i+1]==="\n")i++;
   row.push(cell);if(row.some(Boolean))arr.push(row);row=[];cell=""}
  else cell+=c;
 }const headers=arr.shift().map((x,i)=>i?x:x.replace(/^\uFEFF/,""));
 return {headers,rows:arr.map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]||""])))};
};
const orig=parseCsv(originalCsv),registryById=new Map(registry.map(x=>[x.recordId,x]));
for(const row of orig.rows){
 const item=registryById.get(row.record_id),a=item&&auditByGroup.get(item.workGroupId);
 if(item&&a&&item.sourceUrl===a.sourceUrl&&
  ["COMMONS_PD_OR_CC0_FILE_METADATA","OFFICIAL_OPEN_ACCESS_IMAGE_CANDIDATE"].includes(a.status)){
  row.rights_class=item.rights.classification;row.rights_licence_label=item.rights.label;
  row.rights_evidence=item.rights.evidence;row.rights_terms=item.rights.terms;
  row.rights_policy_url=item.rights.policyUrl||"";
  row.rights_credit=item.rights.credit||"";
  row.photo_fingerprint=item.rights.sourcePhotoId||"";
 }
 row.wave2_source_proof=a?.status||"";
 row.wave2_rights_rechecked=!!a;
}
writeFileSync(V2+"master.csv",csv(orig.rows,[...orig.headers,"wave2_source_proof","wave2_rights_rechecked"]));
function reviewRow(w,i){return {...outputQueue(w),
 batch_position:i+1,user_photo_decision:"",quality_issue_notes:"",
 user_reviewed_image_sha256:"",reviewed_on:""}}
for(let i=0;i<batches.length;i++)
 writeFileSync(V2+"first-look-photo-review-batch-"+String(i+2).padStart(2,"0")+".csv",
 csv(batches[i].map(reviewRow),reviewCols));
const template=readFileSync("docs/SACRED_ART_WAVE1_PRISTINE_REVIEW_73_20261030.html","utf8");
const match=template.match(/const items=(\[[\s\S]*?\]);const key=/);
if(!match)throw Error("First gallery source template not found");
for(let i=0;i<batches.length;i++){
 const no=i+2,batch=batches[i],total=batch.length;
 const entries=batch.map((w,index)=>({
  batch_position:index+1,physical_work_group:w.workGroupId,
  title:w.artworkTitle,artist:w.artist,
  rights_label:w.rightsLabel,
  source_url:w.selectedSourceUrl||"",
  original_sha256:w.sourceOriginalSha256||"",
  module_targets:w.moduleIds.join(" | "),
  substatus:w.substatus,
  preview:w.qualityReviewPreviewUrl||"",
  original:w.qualityReviewImageUrl||w.selectedSourceUrl,
  photo_file_sha1:w.qualityReviewSourceSha1||"",
  source_provenance:w.currentSourceProof}));
 let page=template.replace(match[1],JSON.stringify(entries).replace(/</g,"\\u003c")
  .replace(/>/g,"\\u003e").replace(/&/g,"\\u0026"));
 page=page.replace('const key="ao-sacred-art-quality-batch-20261030"',
  'const key="ao-sacred-art-quality-wave2-batch-'+no+'-20261030"');
 page=page.replace('FIRST WAVE · 73 PAINTINGS','WAVE 2 · BATCH '+no+' · '+total+' PAINTINGS');
 page=page.replace('All 73','All '+total).replace(' / 73 reviewed',' / '+total+' reviewed');
 page=page.replace('sacred-art-photo-decisions-batch-01.csv',
  'sacred-art-photo-decisions-batch-'+String(no).padStart(2,"0")+'.csv');
 page=page.replace('Pristine photograph review','Pristine photograph review · Batch '+no);
 const file="docs/SACRED_ART_WAVE2_PRISTINE_REVIEW_BATCH"+String(no).padStart(2,"0")+"_20261030.html";
 writeFileSync(file,page);
}
const hash=s=>createHash("sha256").update(s).digest("hex");
const outputs=["master.json","master.csv","queue-ready-to-publish.csv",
 "queue-photo-qa-or-repair.csv","queue-rights-or-alternative.csv",
 "first-look-photo-review-batch-02.csv","first-look-photo-review-batch-03.csv"];
const summary={schema:"AO_SACRED_ART_OPERATIONAL_MASTER_V2",
 generatedAt:new Date().toISOString(),counts,
 batch02:{size:200,sourceRecords:batches[0].map(w=>w.workGroupId)},
 batch03:{size:171,sourceRecords:batches[1].map(w=>w.workGroupId)},
 previousFirstReview73Unmodified:true,
 sha256ByFile:Object.fromEntries(outputs.map(f=>[f,hash(readFileSync(V2+f,"utf8"))])),
 clearances:"NONE_PUBLISHED_OR_PRISTINE_APPROVED",
 warnings:["331 newly eligible Commons sources move to photo QA solely on dated PD/CC0 file metadata",
 "102 failed museum API requests remain a retrieval exception, not denied rights",
 "The additional 371 previews link to the live current images, not yet saved full-byte certified originals",
 "Neither current-source rights metadata nor user image-quality approval alone constitutes release authority",
 "The original 73-review files and their exported user decisions stay separate",
 "Same physical artwork not deduplicated from textual similarity"]};
writeFileSync(V2+"summary.json",JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify({counts,batch02:200,batch03:171,first73Touched:false},null,2));
