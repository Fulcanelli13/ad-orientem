/**
 * Final existing-source-only pass over 26 2026 Sacred Art research exceptions.
 * Restores frozen Class III sources and contextual art with explicit relevance
 * grades. No acquisition, human approval inference, or production publication.
 *
 * Prerequisites: 365 verified Gospel audit + 104 reuse + 48 exception audit.
 */
import assert from "node:assert/strict";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const read=async p=>JSON.parse(await readFile(resolve(root,p),"utf8"));
const [audit,earlier,legacy,context,groups,source,sermon]=await Promise.all([
 "artifacts/sacred-art-2026/365-existing-gallery-bulk-match.json",
 "artifacts/sacred-art-2026/48-existing-gallery-exception-reconciliation.json",
 "data/artwork/2026-26-legacy-classIII-source-recovery.v1.json",
 "data/artwork/2026-26-existing-contextual-reuse-proposals.v1.json",
 "data/artwork/research-operational-989.v1.json",
 "data/artwork/research-source-records-3205.v1.json",
 "data/artwork/2026-26-historical-sermon-on-mount-reuse.v1.json"
].map(read));
assert.equal(audit.dates.length,365);
assert.equal(audit.stats.sourceResolvedGospels,355,"Only run after verified selected Proper Gospel");
assert.equal(earlier.outstandingDates.length,48);
assert.equal(earlier.totals.provisionalWithArtworkLead,339,"Baseline changed; re-audit before reuse");
assert.equal(earlier.totals.stillWithoutExistingGalleryProposal,26);
assert.equal(legacy.rows.length,8);
assert.equal(context.entries.length,9);
assert.equal(sermon.dates.length,6);
assert.equal(sermon.artwork.breviarum_plate_id,'plate-bloch-sermon');
assert.equal(sermon.artwork.artist_as_credited,'Carl Bloch');
assert.equal(sermon.artwork.production_allowed,false);
assert.equal(sermon.artwork.user_editorial_approval_for_this_work,false);
assert.equal(groups.works.length,989);
assert.equal(source.records.length,3205);
const works=new Map(groups.works.map(w=>[w.workGroupId,w]));
const records=new Map(source.records.map(w=>[w.recordId,w]));
const byDate=new Map(audit.dates.map(d=>[d.date,d]));
const missing=earlier.outstandingDates.filter(d=>d.candidates.length===0);
assert.equal(missing.length,26);
const eligible=new Set(missing.map(d=>d.date));
const legacyByDate=new Map(),contextByDate=new Map(),sermonByDate=new Map();
for(const row of legacy.rows){
 assert.ok(eligible.has(row.date)&&!legacyByDate.has(row.date));
 legacyByDate.set(row.date,row);
 assert.equal(row.principalId,byDate.get(row.date).observedPrincipalId);
 assert.ok(["EXACT_NAMED_FEAST","PARTIAL_COMPOSITE_FEAST"].includes(row.scope));
}
for(const row of context.entries){
 assert.ok(eligible.has(row.date)&&!contextByDate.has(row.date));
 assert.ok(!legacyByDate.has(row.date),"No overwriting exact source with contextual art");
 assert.equal(row.gospelReference,byDate.get(row.date).gospel.reference);
 assert.equal(byDate.get(row.date).gospel.status,"ACTUAL_SELECTED_PROPER_GOSPEL_VERIFIED");
 contextByDate.set(row.date,row);
}
for(const row of sermon.dates){
 assert.ok(eligible.has(row.date)&&!sermonByDate.has(row.date));
 assert.ok(!legacyByDate.has(row.date)&&!contextByDate.has(row.date));
 assert.equal(row.gospelReference,byDate.get(row.date).gospel.reference);
 assert.equal(byDate.get(row.date).gospel.status,"ACTUAL_SELECTED_PROPER_GOSPEL_VERIFIED");
 assert.match(row.gospelReference,/^Matthew [567]:/);
 sermonByDate.set(row.date,row);
}
const forbidden=w=>w.historicalExclusion||
 (w.userReviewStates??[]).some(x=>["REJECT","PLACEMENT_REJECT"].includes(x))||
 /fra angelico|el greco/i.test(w.artist??"")||
 /museodelprado\.es/i.test(w.selectedSourceUrl??"");
const state={
 exact:0,partial:0,contextual:0,sermon:0,unmatched:0,legacySourcePaintingLeads:0,
 contextualGalleryLeads:0,protectedDonorBridges:0,excludedHistoricNonpaintings:0
};
const retained=[];
function candidateFromExistingGroup(id,basis,extra={}){
 const work=works.get(id);
 assert.ok(work&&!forbidden(work),"Existing group missing/rejected/excluded "+id);
 assert.ok(records.get(work.preferredRecordId)?.isOperationalCandidate,
  "Preferred source group no longer operational: "+id);
 state.contextualGalleryLeads++;
 return {
  evidenceBasis:basis,workGroupId:work.workGroupId,
  sourceRecordId:work.preferredRecordId,
  artworkId:work.canonicalArtworkId??null,title:work.artworkTitle,
  artist:work.artist??null,sourceUrl:work.selectedSourceUrl??null,
  originalEditorialStates:work.userReviewStates,rightsQueue:work.queue,
  originalPhotoRightsCertified:false,sceneDepictionVerified:false,
  physicalObjectIdentityVerified:false,photoNativeQualityCertified:false,
  dateUserApproval:false,productionPublished:false,...extra
 };
}
for(const day of missing){
 const legacyRow=legacyByDate.get(day.date);
 const contextual=contextByDate.get(day.date);
 const sermonRow=sermonByDate.get(day.date);
 let basis="NO_RELEVANT_EXISTING_ARTWORK_RECONCILED",candidates=[];
 let originalSourcesExcluded=[];
 let additional=[];
 if(legacyRow){
  basis=legacyRow.scope==="EXACT_NAMED_FEAST"
   ?"EXACT_NAMED_HISTORICAL_ARTWORK_LEAD_NOT_RELEASED"
   :"PARTIAL_COMPOSITE_FEAST_SUBJECT_LEAD_NOT_COMPLETE_FEAST";
  const evidence=legacyRow.scope==="EXACT_NAMED_FEAST"
   ?legacyRow.originalSourceCandidates
   :legacyRow.originalPartialOrExcluded;
  for(const record of evidence){
   const srcId=record.sourceId??null;
   const artworkMedium=record.originalPaintingMedium??"MEDIUM_UNVERIFIED";
   const url=record.sourceObjectUrl??null;
   // A pre-existing rejected source, print, unproven painting or the
   // *Seville* St Rufina cannot become a 1962 Roman martyrs' Home lead.
   const prohibited=Boolean(srcId==="commons:29858581"||
     /etching|print on paper|engraving|tapestry|sculpture/i.test(artworkMedium)||
     !url);
   if(prohibited){
    state.excludedHistoricNonpaintings++;
    originalSourcesExcluded.push({sourceId:srcId,title:record.title,
      reason:srcId==="commons:29858581"?"DIFFERENT_RUFINA_OF_SEVILLE":
       !url?"NO_SOURCE_URL_OR_ARTWORK_IDENTITY":
       "NOT_A_PAINTING_IN_STRICT_GALLERY_SCOPE"});
    continue;
   }
   const groupId=srcId?("REVIEW::"+srcId):null;
   const group=works.get(groupId);
   const src=group?records.get(group.preferredRecordId):null;
   if(srcId&&records.has(groupId)){
     const original=records.get(groupId);
     assert.ok(original.isOperationalCandidate &&
       !["REJECT","PLACEMENT_REJECT"].includes(original.originalUserDecision),
       "Historical class III source was rejected: "+srcId);
   }
   if(group){
    assert.ok(!forbidden(group)&&src?.isOperationalCandidate,
      "Operational original had been rejected: "+srcId);
    assert.equal(group.selectedSourceUrl?.replace(/\/$/,""),url.replace(/\/$/,""),
      "Existing gallery source URL changed for "+groupId);
   }
   candidates.push({
    evidenceBasis:basis,
    workGroupId:group?.workGroupId??null,
    sourceRecordId:group?.preferredRecordId??null,
    historicalSourceId:srcId,
    artworkId:group?.canonicalArtworkId??null,
    title:record.title,artist:record.artist??null,
    sourceUrl:url,originalPaintingMedium:artworkMedium,
    originalResearchFamily:record.sourceFamily,
    sourceIdentityCaveat:record.identityGate??null,
    originalRightsNotes:record.rightsOrQualityNotes??null,
    rightsQueue:group?.queue??"HISTORICAL_SOURCE_PHOTO_LICENSE_RECONCILIATION_REQUIRED",
    originalEditorialStates:group?.userReviewStates??[],
    originalPhotoRightsCertified:false,sceneDepictionVerified:false,
    physicalObjectIdentityVerified:false,photoNativeQualityCertified:false,
    dateUserApproval:false,productionPublished:false
   });
   state.legacySourcePaintingLeads++;
  }
  assert.ok(candidates.length>0,"No usable existing painted source for "+day.date);
  if(legacyRow.scope==="EXACT_NAMED_FEAST")state.exact++;
  else state.partial++;
 }
 if(contextual){
  basis="CONTEXTUAL_GOSPEL_THEOLOGICAL_LINK_NOT_EXACT_SCENE";
  if(contextual.workGroupId){
   candidates.push(candidateFromExistingGroup(contextual.workGroupId,basis,{
     sourceRelation:contextual.evidenceKind
   }));
  }else{
   const donor=byDate.get(contextual.historicalDonorDate);
   assert.ok(donor,"Historical donor date absent");
   const matches=donor.candidates.filter(c=>
    c.evidenceKind===contextual.historicalDonorEvidenceKind&&
    c.title===contextual.historicalDonorArtworkTitle);
   assert.equal(matches.length,1,"Protected historical donor not unique or missing");
   const art=matches[0];
   assert.equal(art.approval,"USER_LOCKED_DATE_ARTWORK");
   assert.doesNotMatch(art.originalSource??"",/museodelprado\.es/i);
   candidates.push({
    evidenceBasis:basis,workGroupId:art.groupId??null,
    sourceRecordId:null,historicalDonorDate:donor.date,
    historicalDonorEditorialState:art.approval,
    artworkId:art.artworkId??null,title:art.title,artist:art.artist,
    sourceUrl:art.originalSource,
    sourceRelation:contextual.evidenceKind,
    originalEditorialStates:[],
    rightsQueue:"HISTORICAL_DATE_DONOR_PHOTO_RECONCILIATION_REQUIRED",
    originalPhotoRightsCertified:false,sceneDepictionVerified:false,
    physicalObjectIdentityVerified:false,photoNativeQualityCertified:false,
    dateUserApproval:false,productionPublished:false
   });
   state.protectedDonorBridges++;
  }
  assert.ok(candidates.length>0);
  state.contextual++;
 }
 if(sermonRow){
  const art=sermon.artwork;
  assert.equal(art.hard_artist_exclusion,false);
  assert.equal(art.aesthetic_triage,"CONTEXTUAL_PAINTING_CANDIDATE");
  assert.equal(art.source_metadata_rights_hold,false);
  basis="SAME_GOSPEL_SERMON_SETTING_ONLY_NOT_VERSE_SCENE";
  candidates.push({
   evidenceBasis:basis,
   workGroupId:null,sourceRecordId:null,
   historicalSourceId:art.breviarum_plate_id,
   originalResearchFamily:"BREVIARIUM_83_FROZEN_GALLERY_RECORD",
   artworkId:null,title:art.title,artist:art.artist_as_credited,
   sourceUrl:art.commons_current_imageinfo.file_page,
   originalSourceFilePath:art.source_file_path_url,
   selectedSourceSha1:art.commons_current_imageinfo.sha1,
   originalNativeWidth:art.commons_current_imageinfo.native_width_px,
   originalNativeHeight:art.commons_current_imageinfo.native_height_px,
   explicitlyLowNativeResolution:art.low_native_resolution_candidate,
   sourceRelation:"THE_SERMON_ON_THE_MOUNT_GOSPEL_SETTING_NOT_THE_EXACT_SPOKEN_VERSES",
   rightsQueue:"PRIOR_IMAGE_LOW_NATIVE_RESOLUTION_AND_EXACT_PHOTO_RIGHTS_REVIEW",
   originalEditorialStates:["CONTEXTUAL_PAINTING_CANDIDATE_NOT_USER_APPROVED"],
   originalPhotoRightsCertified:false,sceneDepictionVerified:false,
   physicalObjectIdentityVerified:false,photoNativeQualityCertified:false,
   dateUserApproval:false,productionPublished:false
  });
  state.sermon++;
 }
 if(!legacyRow&&!contextual&&!sermonRow)state.unmatched++;
 assert.ok(candidates.every(x=>x.dateUserApproval===false&&x.productionPublished===false));
 retained.push({
  date:day.date,observedPrincipalId:day.observedPrincipalId,
  observedTitle:day.observedTitle,liturgicalClass:day.liturgicalClass,
  gospel:day.gospel,
  reconciliationState:basis,
  existingResearchScope:legacyRow?.scope??(contextual?"CONTEXTUAL_PERICOPE":sermonRow?"EXACT_GOSPEL_SETTING_NOT_VERSE_SCENE":"NONE"),
  contextualEditorialNote:contextual?.editorialNote??(sermonRow?"Previously inventoried Carl Bloch Sermon on the Mount: Matthew 5–7 setting, not exact spoken verses; 1377×1545 source photo is low-resolution and unapproved":null),
  excludedEarlierSourceRows:originalSourcesExcluded,
  candidates,additionalNotes:additional,
  strictWholeFeastSubjectCoveredByThisPass:legacyRow?.scope==="EXACT_NAMED_FEAST",
  partialCompositeFeastOnly:legacyRow?.scope==="PARTIAL_COMPOSITE_FEAST",
  homepageImageProductionCertified:false,
  exactSelectedImageRightsVerified:false,
  originalPhotoNativeQaPassed:false
 });
}
assert.deepEqual([state.exact,state.partial,state.contextual,state.sermon,state.unmatched],[4,4,9,6,3]);
const report={
 schema:"AO_2026_26_EXISTING_GALLERY_AND_PRIOR_SOURCES_RECONCILIATION_V1",
 year:2026,generatedAt:new Date().toISOString(),
 sourceInputs:{
  verifiedBaseline:"PR #2316 339-day 48-exception audited artifact",
  frozenClassIII:legacy.source,
  contextual:"2026-26-existing-contextual-reuse-proposals.v1.json",
  historicalSermon:sermon.source,
  operationalGallery:"989 groups and 3205 original source records"
 },
 rules:["PROVISIONAL_ART_LEAD_NOT_RELEASED_OR_USER_DATE_APPROVED",
  "COMPOSITE_FEAST_PARTIAL_MATCH_NEVER_COUNTS_AS_WHOLE_FEAST",
  "TYPOLOGICAL_OR_SEASONAL_ART_NOT_EXACT_GOSPEL_SCENE",
  "PREVIOUS_USER_LOCKED_ARTWORK_REUSE_DOES_NOT_TRANSFER_APPROVAL",
  "NO_PRADO_NO_REJECTED_WORK_NO_FRA_ANGELICO_NO_EL_GRECO",
  "NO_NEW_ACQUISITION_OR_ART_RESEARCH","NO_REPRODUCTION_RIGHTS_CERTIFICATION"],
 totals:{
  baselineProvisionalDays:339,previousUnmatchedDates:26,
  newStrictExactFeastPaintingLeads:state.exact,
  newCompositeFeastPartialLeads:state.partial,
  newContextualGospelLeads:state.contextual,
  newSermonSettingOnlyLeads:state.sermon,
  stillWithoutAnyProvisionalLead:state.unmatched,
  datesWithAnyProvisionalArtLead:339+state.exact+state.partial+state.contextual+state.sermon,
  datesWithNoOrOnlyPartialFeastCoverage:state.unmatched+state.partial,
  strictFullFeastOrContextualArtworkCandidates:339+state.exact+state.contextual+state.sermon,
  originalPhotoRightsCertified:0,productionHomeDatesNewlyCertified:0,
  retrievedLegacyPaintingRows:state.legacySourcePaintingLeads,
  contextualExistingGalleryRows:state.contextualGalleryLeads,
  historicalProtectedDonorBridges:state.protectedDonorBridges,
  explicitlyExcludedNonPaintingOrWrongIdentity:state.excludedHistoricNonpaintings
 },
 dates:retained
};
assert.equal(report.totals.datesWithAnyProvisionalArtLead+report.totals.stillWithoutAnyProvisionalLead,365);
assert.equal(report.totals.strictFullFeastOrContextualArtworkCandidates+
 report.totals.datesWithNoOrOnlyPartialFeastCoverage,365);
await mkdir(resolve(root,"artifacts/sacred-art-2026"),{recursive:true});
await writeFile(resolve(root,"artifacts/sacred-art-2026/26-existing-sources-reconciliation.json"),
 JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report.totals,null,2));
