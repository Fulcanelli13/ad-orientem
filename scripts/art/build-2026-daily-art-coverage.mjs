/**
 * Existing-gallery-first 2026 Sacred Art bulk matcher.
 * No acquisition, image publication, historical approval promotion, or UI changes.
 * Optional actual DayResolver audit lets Gospel comparisons be source-verified.
 *
 * node scripts/art/build-2026-daily-art-coverage.mjs
 * node scripts/art/build-2026-daily-art-coverage.mjs --gospel-audit artifacts/calendar-gospel-home/2026-source-audit.json
 */
import assert from "node:assert/strict";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {APPROVED_CLASS_I_2026} from "../../src/calendar/approved-class-i-heroes-2026.js";
import {gospelCitationOverlap} from "../../src/home/calendar-gospel-curated-art-matcher.js";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const path=relative=>resolve(root,relative);
const read=async relative=>JSON.parse(await readFile(path(relative),"utf8"));
const sourceUrl=value=>String(value??"").trim().replace(/\/$/,"");
const acceptedDecision=d=>!["REJECT","PLACEMENT_REJECT"].includes(String(d??""));
const keyFor=record=>record?.workGroupId??null;
const isDay=day=>/^\d{4}-\d{2}-\d{2}$/.test(day);
const distinct=array=>[...new Set(array)];
const canonical=(a,b)=>String(a??"").trim()===String(b??"").trim();
const isGospelRelation=relation=>["GOSPEL_SCENE","GOSPEL_ONLY"].includes(relation.role);

export async function build2026ArtworkCoverage({gospelAudit=null}={}){
 const [gallery,sources,calendar,prior,curated]=await Promise.all([
  read("data/artwork/research-operational-989.v1.json"),
  read("data/artwork/research-source-records-3205.v1.json"),
  read("data/calendar/research/2026-calendar-gospel-home-artwork-source-crosswalk.v1.json"),
  read("data/artwork/2026-prior-date-artwork-evidence.v1.json"),
  read("data/calendar/research/2026-existing-curated-date-art-reuse.v1.json")
 ]);
 assert.equal(gallery.works.length,989);
 assert.equal(sources.records.length,3205);
 assert.equal(calendar.dates.length,365);
 assert.equal(prior.days.length,365);
 assert.equal(curated.relations.length,58);
 assert.equal(APPROVED_CLASS_I_2026.length,10);
 const groups=new Map(gallery.works.map(w=>[w.workGroupId,w]));
 assert.equal(groups.size,989);
 const recordIds=new Set(),groupSourceCount=new Map();
 for(const row of sources.records){
  assert.ok(row.recordId&&row.workGroupId&&!recordIds.has(row.recordId));
  recordIds.add(row.recordId);
  if(row.isOperationalCandidate)assert.ok(groups.has(row.workGroupId),
   "Accepted operational record lost its group: "+row.recordId);
  // Research includes rejected and inactive source rows whose groups are
  // intentionally absent from the 989 operational works. Preserve their
  // decisions without resurrecting them as publication candidates.
  if(groups.has(row.workGroupId))
   groupSourceCount.set(row.workGroupId,(groupSourceCount.get(row.workGroupId)??0)+1);
 }
 assert.equal(recordIds.size,3205);
 for(const group of gallery.works){
  assert.equal(groupSourceCount.get(group.workGroupId),group.sourceRecordCount);
  assert.ok(!group.productionReleased,"Frozen 2026-10-30 source master is not production inventory");
 }
 // Include only source records identified as usable editorial candidates. A
 // rejected record is never converted into a Home candidate by source matching.
 const byArtId=new Map(),bySource=new Map(),byPrincipal=new Map();
 function index(map,key,group){
  if(!key)return;
  if(!map.has(key))map.set(key,new Set());
  map.get(key).add(group);
 }
 for(const group of gallery.works){
  index(byArtId,group.canonicalArtworkId,group.workGroupId);
  for(const observedId of group.referencedObservedPrincipalIds??[])
   index(byPrincipal,observedId,group.workGroupId);
  index(bySource,sourceUrl(group.selectedSourceUrl),group.workGroupId);
 }
 for(const rec of sources.records){
  if(!rec.isOperationalCandidate||!acceptedDecision(rec.originalUserDecision))continue;
  index(byArtId,rec.canonicalArtworkId,rec.workGroupId);
  index(bySource,sourceUrl(rec.sourceUrl),rec.workGroupId);
  if(rec.recordId?.startsWith("CANONICAL::"))
   index(byArtId,rec.recordId.slice("CANONICAL::".length),rec.workGroupId);
 }
 const priorByDate=new Map(prior.days.map(d=>[d.date,d]));
 const curatedByDate=new Map();
 for(const row of curated.relations){
  if(!curatedByDate.has(row.date))curatedByDate.set(row.date,[]);
  curatedByDate.get(row.date).push(row);
 }
 const approvedByDate=new Map(APPROVED_CLASS_I_2026.map(r=>[r.date,r]));
 const actualByDate=new Map();
 if(gospelAudit){
  assert.equal(gospelAudit.year,2026,"Runtime Gospel audit year mismatch");
  assert.equal(gospelAudit.dates.length,365);
  for(const row of gospelAudit.dates){
   assert.ok(isDay(row.date)&&!actualByDate.has(row.date));
   actualByDate.set(row.date,row);
  }
 }
 const matchedDays=[];
 const allSourceGroupIds=new Set();
 const coverage={I:{days:0,anyCandidate:0,noCandidate:0},
   II:{days:0,anyCandidate:0,noCandidate:0},
   III:{days:0,anyCandidate:0,noCandidate:0},
   IV:{days:0,anyCandidate:0,noCandidate:0}};
 for(let i=0;i<365;i++){
  const day=calendar.dates[i],previous=priorByDate.get(day.date);
  assert.ok(previous&&canonical(day.observedPrincipalId,previous.principalId),
   "2026 observed principal disagreement "+day.date);
  const runtime=actualByDate.get(day.date)??null;
  if(runtime){
   assert.equal(runtime.principalId,day.observedPrincipalId,
    "Runtime observed principal mismatch "+day.date);
  }
  const gospelVerified=runtime?.gospel?.status==="VERIFIED_FROM_SELECTED_PROPER";
  const gospelReference=gospelVerified?runtime.gospel.reference:null;
  const scopedGospelStatus=gospelVerified?"ACTUAL_SELECTED_PROPER_GOSPEL_VERIFIED":
   runtime?"RUNTIME_GOSPEL_UNAVAILABLE":"NO_RUNTIME_EVIDENCE_INDEX_ONLY";
  const candidates=[],signatures=new Set();
  const add=(item)=>{
   const sig=[item.evidenceKind,item.artworkId??"",item.groupId??"",
    item.sourceRecordId??"",item.originalSource??""].join("|");
   if(signatures.has(sig))return;
   signatures.add(sig);
   if(item.groupId)allSourceGroupIds.add(item.groupId);
   candidates.push(item);
  };
  const groupInfo=(groupId)=>{
   const w=groups.get(groupId);
   if(!w)return {groupId:null,physicalObjectIdentityCertified:false,
     originalPhotoRightsCertified:false,originalPhotoQualityCertified:false,
     productionPublished:false};
   return {groupId:w.workGroupId,title:w.artworkTitle,artist:w.artist,
    selectedSourceUrl:w.selectedSourceUrl??null,rightsQueue:w.queue,
    originalPhotoRightsCertified:false,originalPhotoQualityCertified:false,
    productionPublished:false,physicalObjectIdentityCertified:false};
  };
  const resolveExisting=(artworkId,source)=>{
   const exact=byArtId.get(String(artworkId??""))??new Set();
   const fromUrl=bySource.get(sourceUrl(source))??new Set();
   const joined=distinct([...exact,...fromUrl]);
   return joined.length===1?groupInfo(joined[0]):
     {groupId:null,identityReviewState:joined.length>1?
       "MULTIPLE_POSSIBLE_WORK_GROUPS":"UNJOINED_EXISTING_RESEARCH_SOURCE",
       physicalObjectIdentityCertified:false,originalPhotoRightsCertified:false,
       originalPhotoQualityCertified:false,productionPublished:false};
  };
  // Protect currently published selection identity before older research rows.
  const approved=approvedByDate.get(day.date);
  if(approved&&approved.principalId===day.observedPrincipalId)
   add({evidenceKind:"CURRENT_EXPLICIT_DATE_APPROVAL",artworkId:approved.artworkId,
    title:approved.title,artist:approved.artist,originalSource:approved.source??null,
    imageState:approved.imagePublicationStatus,
    approval:"USER_LOCKED_DATE_ARTWORK",canReplaceWithoutApproval:false,
    sceneAgainstGospel:"NOT_ASSERTED",...resolveExisting(approved.artworkId,approved.source)});
  const previousSelection=previous.selection;
  if(previousSelection){
   add({evidenceKind:"PREVIOUS_DATED_ARTWORK_RESEARCH",artworkId:previousSelection.artworkId,
    title:previousSelection.title,artist:previousSelection.artist,
    editorialBasis:previousSelection.editorialBasis,
    originalSource:previousSelection.sourceObjectUrl??null,
    approval:"HISTORICAL_SELECTION_MUST_RECONCILE_WITH_CURRENT_FINAL",
    sceneAgainstGospel:"NOT_ASSERTED",
    ...resolveExisting(previousSelection.artworkId,previousSelection.sourceObjectUrl)});
  }
  for(const rel of curatedByDate.get(day.date)??[]){
   if(rel.sourceObservedPrincipalId!==day.observedPrincipalId)continue;
   const comparison=isGospelRelation(rel)
    ?(gospelReference&&rel.claimedGospelForDate
      ?gospelCitationOverlap(gospelReference,rel.claimedGospelForDate)
      :"NO_VERIFIED_GOSPEL")
    :"FEAST_IDENTITY_ONLY_NOT_GOSPEL";
   const mismatch=isGospelRelation(rel)&&
    (!["EXACT_CITATION","OVERLAPPING_VERSES_NOT_SCENE_PROOF"].includes(comparison));
   const applicable=!mismatch && (isGospelRelation(rel)?gospelVerified:true);
   add({evidenceKind:"FROZEN_CURATED_DATE_ART_ASSOCIATION",
    artworkId:rel.artworkId,sourceRecordId:rel.recordId,role:rel.role,
    editorialBasis:rel.sourceEditorialStatus,
    claimedGospel:rel.claimedGospelForDate,
    gospelCitationComparison:comparison,
    gospelSceneDepictionVerified:false,
    applicableToSelectedGospel:applicable,
    sourceImageKeyPresent:Boolean(rel.selectedImageKey),
    approval:"HISTORICAL_PROPOSAL_ONLY_NOT_PHOTO_RELEASE",
    ...resolveExisting(rel.artworkId,null)});
  }
  for(const groupId of byPrincipal.get(day.observedPrincipalId)??[])
   add({evidenceKind:"EXACT_OBSERVED_PRINCIPAL_FROM_EXISTING_GALLERY",
    artworkId:groups.get(groupId)?.canonicalArtworkId??null,
    approval:"SOURCE_IDENTITY_CANDIDATE_NOT_DAY_APPROVED",
    sceneAgainstGospel:"NOT_ASSERTED",...groupInfo(groupId)});
  for(const art of previous.catalogue??[]){
   const matched=resolveExisting(art.artworkId,art.sourceUrl??null);
   add({evidenceKind:"EXISTING_CATALOGUE_DATE_RESEARCH_MATCH",
    artworkId:art.artworkId??null,title:art.title,artist:art.artist,
    editorialBasis:art.editorial??art.status??null,
    approval:"SOURCE_TITLE_OR_ID_RESEARCH_NOT_NEW_RELEASE",
    sceneAgainstGospel:"NOT_ASSERTED",...matched});
  }
  for(const [kind,proposals] of [
   ["ALREADY_RESEARCHED_EXTERNAL_SOURCE_LEAD",previous.externalExistingResearch??[]],
   ["ALREADY_RESEARCHED_GOSPEL_OR_FEAST_STUDY",previous.study??[]]
  ]){
   for(let j=0;j<proposals.length;j++){
    const art=proposals[j];
    add({evidenceKind:kind,sourceRecordId:kind+":"+day.date+":"+j,
     artworkId:art.artworkId??null,title:art.title??null,artist:art.artist??null,
     originalSource:art.sourceUrl??null,sourceInstitution:art.institution??null,
     editorialBasis:art.sourceStatus??art.relationClaim??null,
     approval:"EXISTING_RESEARCH_LEAD_NOT_USER_APPROVED",
     sceneAgainstGospel:kind.includes("GOSPEL")?
      "HISTORICAL_GOSPEL_CLAIM_NOT_SOURCE_CERTIFIED":"NOT_ASSERTED",
     ...resolveExisting(art.artworkId,art.sourceUrl)});
   }
  }
  const requiresSeasonal=/SEASONAL_REUSE_NEEDED|MARIAN_SATURDAY_REUSE_NEEDED/.test(
   previous.coverageState??"");
  const relevant=candidates.filter(c=>
   c.evidenceKind!=="FROZEN_CURATED_DATE_ART_ASSOCIATION"||
   (c.applicableToSelectedGospel||!isGospelRelation(c)));
  const state=approved?"PROTECTED_DATE_SELECTION":
   previousSelection?"HISTORICAL_DATED_SELECTION_RECONCILIATION":
   relevant.length?"EXISTING_CANDIDATES_REQUIRE_SOURCE_PHOTO_AND_EDITORIAL_GATES":
   requiresSeasonal?"SEASONAL_OR_MARIAN_REUSE_NOT_YET_ASSIGNED":
   "NO_EVIDENCED_DATE_MATCH_FROM_THIS_INVENTORY";
  const rank=previous.rank;
  coverage[rank].days++;
  if(relevant.length||approved||previousSelection)coverage[rank].anyCandidate++;
  else coverage[rank].noCandidate++;
  matchedDays.push({date:day.date,rank,observedPrincipalId:day.observedPrincipalId,
   observedTitle:day.observedTitle,
   gospel:{status:scopedGospelStatus,reference:gospelReference,
    oldIndexLead:day.gospel?.indexCandidateReference??null},
   selectionState:state,seasonalOrMarianReuseRequired:requiresSeasonal,
   protectedDateArtwork:approved?.artworkId??null,
   candidateCount:candidates.length,usableResearchCandidateCount:relevant.length,
   candidates});
 }
 assert.equal(matchedDays.length,365);
 assert.deepEqual(coverage,{...coverage});
 const stats={
  sourceRecords:sources.records.length,operationalArtworkGroups:gallery.works.length,
  acceptedOriginalReviewDecisions:gallery.counts?.acceptedOrConditionalOriginalReviewCards??856,
  2026Dates:matchedDays.length,
  sourceResolvedGospels:matchedDays.filter(x=>x.gospel.status==="ACTUAL_SELECTED_PROPER_GOSPEL_VERIFIED").length,
  runtimeGospelUnresolved:matchedDays.filter(x=>x.gospel.status==="RUNTIME_GOSPEL_UNAVAILABLE").length,
  protectedDateArtDates:matchedDays.filter(x=>x.protectedDateArtwork).length,
  historicalDatedSelectionDates:matchedDays.filter(x=>x.candidates.some(c=>c.evidenceKind==="PREVIOUS_DATED_ARTWORK_RESEARCH")).length,
  historicCuratedProposalDates:matchedDays.filter(x=>x.candidates.some(c=>c.evidenceKind==="FROZEN_CURATED_DATE_ART_ASSOCIATION")).length,
  existingGroupPrincipalMatchedDates:matchedDays.filter(x=>x.candidates.some(c=>c.evidenceKind==="EXACT_OBSERVED_PRINCIPAL_FROM_EXISTING_GALLERY")).length,
  existingCatalogueMatchedDates:matchedDays.filter(x=>x.candidates.some(c=>c.evidenceKind==="EXISTING_CATALOGUE_DATE_RESEARCH_MATCH")).length,
  existingExternalLeadDates:matchedDays.filter(x=>x.candidates.some(c=>c.evidenceKind==="ALREADY_RESEARCHED_EXTERNAL_SOURCE_LEAD")).length,
  existingStudyDates:matchedDays.filter(x=>x.candidates.some(c=>c.evidenceKind==="ALREADY_RESEARCHED_GOSPEL_OR_FEAST_STUDY")).length,
  seasonalOrMarianReuseNeededDates:matchedDays.filter(x=>x.seasonalOrMarianReuseRequired).length,
  candidateDays:matchedDays.filter(x=>x.usableResearchCandidateCount>0).length,
  noSpecificCandidateDates:matchedDays.filter(x=>x.usableResearchCandidateCount===0).length,
  existingOperationalGroupsReferenced:allSourceGroupIds.size,
  artworkDatesPublishedCertifiedByThisAudit:0,
  actualImageBytesCheckedByThisAudit:0
 };
 return {schema:"AO_2026_365_DAILY_SACRED_ART_EXISTING_GALLERY_BULK_MATCH_V1",
  generatedAt:new Date().toISOString(),
  policy:[
   "RESEARCH_ONLY_NOT_PRODUCTION_ARTWORK_SELECTION",
   "UNIQUE_OPERATIVE_GROUP_IS_NOT_VERIFIED_UNIQUE_PAINTING",
   "EXACT_DATE_AND_1962_OBSERVED_PRINCIPAL_REQUIRED",
   "GOSPEL_SCENE_MATCHES_REQUIRE_ACTUAL_SELECTED_PROPER_AND_PAINTED_SUBSCENE_REVIEW",
   "OLD_IMPORT_AND_USER_FROZEN_DECISIONS_ARE_NOT_EXACT_PHOTOGRAPH_RIGHTS_CLEARANCE",
   "PRIOR_CLASS_I_CHOICES_NEVER_OVERRIDDEN_BY_AUTOMATIC_CANDIDATES",
   "NO_NEW_ACQUISITION_UNTIL_EXISTING_GALLERY_AUDIT_AND_EDITORIAL_REVIEW_COMPLETE",
   "NO_FALSE_365_DAY_PUBLICATION_CLAIM"
  ],
  sourceSummaries:{gallery:gallery.source,prior2026:prior.source,
   gospelAudit:gospelAudit?{source:gospelAudit.source,generatedAt:gospelAudit.generatedAt}:null},
  stats,coverageByClass:coverage,dates:matchedDays};
}
const argv=process.argv.slice(2);
let audit=null;
if(argv.includes("--gospel-audit")){
 const index=argv.indexOf("--gospel-audit");
 const filepath=argv[index+1];
 assert.ok(filepath&&filepath!=="--gospel-audit","Missing --gospel-audit filename");
 audit=JSON.parse(await readFile(path(filepath),"utf8"));
}
const report=await build2026ArtworkCoverage({gospelAudit:audit});
const output=path("artifacts/sacred-art-2026/365-existing-gallery-bulk-match.json");
await mkdir(resolve(output,".."),{recursive:true});
await writeFile(output,JSON.stringify(report,null,2)+"\n");
console.log("2026 Sacred Art existing-gallery bulk matching:");
console.log(JSON.stringify({stats:report.stats,coverageByClass:report.coverageByClass},null,2));
console.log("Audit report: "+output);
