/**
 * Import human duplicate/photo preference choices without mutating the master,
 * its protected editorial decisions, licences or publication queues.
 *
 * Usage: node scripts/art/import-sacred-art-duplicate-review-20261030.mjs <exported.json>
 * The resulting source-bound decision ledger is reviewed and committed separately.
 */
import {readFileSync,writeFileSync} from "node:fs";
const source=process.argv[2];
if(!source)throw Error("Supply exported Ad_Orientem_Duplicate_Review_Decisions.json path");
const root="data/calendar/sacred-art-master-v2/";
const index=JSON.parse(readFileSync(root+"duplicate-review-groups-20261030.v1.json","utf8"));
const review=JSON.parse(readFileSync(source,"utf8"));
if(index.schema!=="AO_SACRED_ART_DUPLICATE_GROUP_INDEX_V1"||
 review.schema!=="AO_SACRED_ART_DUPLICATE_REVIEW_DECISIONS_V1"||
 index.snapshot!==review.registrySnapshot)throw Error("Wrong review schema or registry snapshot");
const groups=new Map(index.groups.map(g=>[g.id,g]));
if(groups.size!==index.groups.length)throw Error("Duplicate group IDs in master index");
if(!Array.isArray(review.decisions)||review.decisions.length>groups.size)
 throw Error("Invalid user decisions");
const used=new Set(),decisions=[];
for(const d of review.decisions){
 if(used.has(d.groupId))throw Error("Duplicate review decision "+d.groupId);
 used.add(d.groupId);
 const g=groups.get(d.groupId);
 if(!g)throw Error("Unknown group "+d.groupId);
 const ids=g.members.map(m=>m.id);
 const urls=g.members.map(m=>m.sourceUrl||"");
 const displayPhotos=g.members.map(m=>m.reviewImageSourceUrl||m.sourceUrl||"");
 if(JSON.stringify(d.memberIds)!==JSON.stringify(ids)||
 JSON.stringify(d.sourceUrls)!==JSON.stringify(urls)||
 JSON.stringify(d.displayedPhotoSourceUrls)!==JSON.stringify(displayPhotos))
  throw Error("Source/member mismatch for "+g.id);
 if(!["NOT_DUPLICATE_KEEP_ALL","SAME_WORK_KEEP_PREFERRED"].includes(d.reviewDecision))
  throw Error("Invalid decision "+g.id);
 const preferred=d.preferredMemberId||"";
 if(d.reviewDecision==="SAME_WORK_KEEP_PREFERRED"&&!ids.includes(preferred))
  throw Error("Preferred member is not in this group: "+g.id);
 if(d.reviewDecision==="NOT_DUPLICATE_KEEP_ALL"&&preferred)
  throw Error("Distinct artworks may not have an arbitrarily preferred member: "+g.id);
 decisions.push({groupId:g.id,identityDisposition:d.reviewDecision,
  preferredSourceRecord:preferred,
  allRecordsRetained:true,
  priorEditorialDecisionsPreserved:true,
  requiresFinalExactPhotoRightAndByteQa:true,
  notDuplicatePairHold:d.reviewDecision==="NOT_DUPLICATE_KEEP_ALL"?
   ids.flatMap((x,i)=>ids.slice(i+1).map(y=>[x,y])):[],
  memberIds:ids,sourceUrls:urls,displayedPhotoSourceUrls:displayPhotos,
  preferredDisplayedPhotoSourceUrl:preferred?displayPhotos[ids.indexOf(preferred)]:"",
  decidedAt:d.decidedAt||null});
}
decisions.sort((a,b)=>a.groupId.localeCompare(b.groupId));
const output={schema:"AO_SACRED_ART_DUPLICATE_DECISION_LEDGER_V1",
 sourceReviewSchema:review.schema,sourceRegistrySnapshot:index.snapshot,
 sourceGroupIndex:root+"duplicate-review-groups-20261030.v1.json",
 totalGroupCount:groups.size,decisionsRecorded:decisions.length,
 markedNotDuplicate:decisions.filter(d=>d.identityDisposition==="NOT_DUPLICATE_KEEP_ALL").length,
 preferredPhotoSelections:decisions.filter(d=>d.identityDisposition==="SAME_WORK_KEEP_PREFERRED").length,
 unresolvedGroups:groups.size-decisions.length,
 decisions,masterEditorialDecisionsChanged:0,queue1Promotions:0,
 originalFileRightsCertified:0,productionImports:0,feeEur:0};
const out=root+"duplicate-review-user-decisions-20261030.v1.json";
writeFileSync(out,JSON.stringify(output,null,2)+"\n");
console.log(JSON.stringify({out,decisionsRecorded:output.decisionsRecorded,
  markedNotDuplicate:output.markedNotDuplicate,
  preferredPhotoSelections:output.preferredPhotoSelections,queue1Promotions:0}));
