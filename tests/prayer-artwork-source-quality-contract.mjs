import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const rd=p=>JSON.parse(readFileSync(new URL("../data/prayer/artwork-editorial-20261031/"+p,import.meta.url),"utf8"));
const index=rd("all-267-source-linked-artwork-candidate-collection.v1.json");
const provenance=rd("source-link-recovery-1506-placements-20261031.v1.json");
const attribution=rd("artist-attribution-source-resolution-wave01.v1.json");
const sourceQA=rd("priority-photo-source-and-licence-qa-wave01.v1.json");
const metWave02=rd("met-source-verification-wave02-20261031.v1.json");
const subjectWave03=rd("subject-source-verification-wave03-20261031.v1.json");
const commonsWave04=rd("commons-pageid-exact-source-wave04-20261031.v1.json");
const commonsWave05=rd("commons-pageid-ricci-wave05-20261031.v1.json");
const remainingQueue=rd("remaining-50-unique-source-acquisition-queue-20261031.v1.json");
const wave06=rd("commons-exact-pageid-wave06-20261031.v1.json");
const remaining43=rd("remaining-43-source-identity-queue-20261031.v1.json");
const wave07=rd("commons-exact-pageid-wave07-20261031.v1.json");
const remaining37=rd("remaining-37-source-identities-20261031.v1.json");
const wave08=rd("commons-exact-pageid-wave08-20261031.v1.json");
const remaining34=rd("remaining-34-source-identities-20261031.v1.json");
const provisional=rd("provisional-one-choice-per-267-art-position.v1.json");
test("1506 proposed original artwork placements are never released, including exact-ID photo-source recoveries",()=>{
 const x=index.qaState;assert.equal(x.candidatePlacementRelationships,1506);
 assert.equal(x.originalMissingSourcePage,329);
 assert.equal(x.sourceLinksRestoredByExactArtworkID,140);
 assert.equal(x.sourceLinksAddedByDirectMuseumAndCommonsVerification,2);
 assert.equal(x.nowStillWithoutSourcePages,75);
 assert.equal(x.sourceLinksVerifiedByCommonsExactPageIDWave08,6);
 assert.equal(x.sourceLinksVerifiedByCommonsExactPageIDWave07,17);
 assert.equal(x.strictCCBYSAResearchPhotoHoldsWave07,7);
 assert.equal(x.sourceLinksVerifiedByCommonsExactPageIDWave06,23);
 assert.equal(x.sourceLinksVerifiedByCommonsExactPageIDWave05,4);
 assert.equal(x.sourceLinksVerifiedByCommonsExactPageIDWave04,32);
 assert.equal(x.sourceLinksVerifiedBySubjectSourceWave03,11);
 assert.equal(x.nowWithSourcePages,1431);
 assert.equal(x.sourceLinksVerifiedByMetWave02,36);
 assert.equal(x.distinctSourceLessCandidateIdentities,34);
 assert.equal(x.pradoPhotoSourcesExcluded,17);
 assert.equal(x.unverifiedNameOnlySourceAlternatives,0);
 assert.equal(x.confirmedNewUserArtworkApprovals,0);
 assert.equal(x.publicReleaseEnabled,false);
 assert.equal(provenance.stats.exactArtworkIDRecovered,140);
 assert.equal(provenance.stats.unidentifiedArtistPlacements,45);
 let remaining=0,active=0,anonymous=0,unresolvedAnonymous=0,linked=0;
 for(const shard of index.shards){
  const d=rd("collection-family-"+shard.family+".v1.json");
  assert.equal(d.slots.length,shard.slots);
  for(const s of d.slots)for(const w of s.reviewCollection){
   assert.equal(w.productionEnabled,false,s.slot);
   active++;
   if(!w.sourcePage)remaining++;else linked++;
   if(w.artistAttribution?.status==="MUSEUM_CATALOGUED_ANONYMOUS")anonymous++;
   if(w.artistAttribution?.status==="UNRESOLVED_OBJECT_IDENTITY")unresolvedAnonymous++;
  }
 }
 assert.equal(active,1506);
 assert.equal(linked,1431);
 assert.equal(remaining,75);
 assert.equal(anonymous,41);
 assert.equal(unresolvedAnonymous,4);
});
test("real anonymous Cleveland painters are preserved without fabricated author names",()=>{
 const x=attribution.counts;
 assert.equal(x.blankArtistCandidatePlacements,45);
 assert.equal(x.museumDocumentedAnonymousPlacements,41);
 assert.equal(x.unresolvedPlacements,4);
 assert.equal(attribution.originals.length,3);
 const observed=provisional.placements.filter(x=>x.assignment.painting && !x.assignment.painting.artist);
 assert.equal(observed.length,4);
 for(const row of observed){
  assert.ok(row.assignment.painting.artistAttribution.includes("Unidentified"));
  assert.ok(row.assignment.painting.officialOriginalMuseumLink);
  assert.equal(row.assignment.productionEnabled,false);
 }
});
test("verified original Palm Sunday source retains its historical artwork user approval without releasing photo",()=>{
 const palm=provisional.placements.find(p=>p.slot==="HERO-08");
 assert.ok(palm);
 assert.equal(palm.assignment.painting.artist,"Anthony van Dyck");
 assert.equal(palm.assignment.painting.sourcePage,"https://commons.wikimedia.org/wiki/File:Entry_of_Christ_into_Jerusalem_by_Anthony_van_Dyck.jpg");
 assert.equal(palm.assignment.originalMuseumObject.accession,"58.3");
 assert.equal(palm.assignment.originalMuseumObject.photoWidth,5043);
 assert.equal(palm.assignment.productionEnabled,false);
});
test("priority photo QA and user review remain separate",()=>{
 assert.equal(sourceQA.noNewUserApproval,true);
 assert.equal(sourceQA.productionPublicationAllowed,false);
 assert.equal(sourceQA.verifiedSources.length,8);
 assert.ok(sourceQA.verifiedSources.find(x=>x.slot==="HERO-21"&&/ASPECT_MISMATCH/.test(x.status)));
});

test("wave 2 exact Met original-source repair remains research-only and source-linked",()=>{
 assert.equal(metWave02.counts.museumObjects,14);
 assert.equal(metWave02.counts.sourcePlacementLinksRecovered,36);
 assert.equal(metWave02.newUserApprovals,0);
 assert.equal(metWave02.liveProductionEnabled,false);
 assert.equal(metWave02.officialMuseumRecords.length,14);
 let repaired=0;
 for(const original of metWave02.officialMuseumRecords){
  assert.ok(original.sourcePage.endsWith("/"+original.museumObjectID));
  for(const source of original.slotReferences){
   const shard=rd("collection-family-"+source.family+".v1.json");
   const slot=shard.slots.find(x=>x.slot===source.slot);
   assert.ok(slot,source.slot);
   const painting=slot.reviewCollection.find(x=>x.sourcePage===original.sourcePage && x.sourceIDs.some(id=>source.originalIDs.includes(id)));
   assert.ok(painting,source.slot);
   assert.equal(painting.productionEnabled,false);
   repaired++;
  }
 }
 assert.equal(repaired,36);
 const bosch=rd("collection-family-home.v1.json").slots.flatMap(s=>s.reviewCollection).find(a=>a.sourceIDs.includes("REVIEW::met:435725"));
 assert.equal(bosch.artist,"Follower of Hieronymus Bosch");
});

test("wave 3 subject sources keep photo, rights, aspect-ratio and release gates separate",()=>{
 assert.equal(subjectWave03.counts.sourcePlacementLinksRecovered,11);
 assert.equal(subjectWave03.counts.stillWithoutSource,157);
 assert.equal(subjectWave03.counts.distinctMissingCandidateIdentities,59);
 assert.equal(subjectWave03.newArtApproved,0);
 assert.equal(subjectWave03.releaseEnabled,false);
 const lamb=subjectWave03.sources.find(s=>s.sourceID==="PRAYER::saints--vaneyck");
 const mercy=subjectWave03.sources.find(s=>s.sourceID==="PRAYER::w1-kazimirowski");
 const souls=subjectWave03.sources.find(s=>s.sourceID==="HERO-21");
 assert.equal(lamb.count,7);
 assert.equal(mercy.count,3);
 assert.deepEqual(mercy.nativePhotoDimensions,[4553,7680]);
 assert.equal(souls.count,1);
 assert.match(souls.status,/LOW_RESOLUTION_HOLD/);
 for(const sh of index.shards){
  const data=rd("collection-family-"+sh.family+".v1.json");
  for(const sl of data.slots)for(const painting of sl.reviewCollection){
   if(painting.sourceIDs.includes("PRAYER::saints--vaneyck"))assert.equal(painting.sourcePage,lamb.link);
   if(painting.sourceIDs.includes("PRAYER::w1-kazimirowski"))assert.equal(painting.sourcePage,mercy.link);
  }
 }
});

test("wave 4 eight verified Commons page IDs propagate 32 source links while no artwork is published",()=>{
 assert.equal(commonsWave04.counts.uniqueOriginalFilePages,8);
 assert.equal(commonsWave04.counts.sourcePlacementLinksRecovered,32);
 assert.equal(commonsWave04.counts.sourceLinkedCandidatePlacementsNow,1381);
 assert.equal(commonsWave04.counts.sourceUnlinkedCandidatePlacementsNow,125);
 for(const gate of Object.values(commonsWave04.safety))assert.equal(gate,false);
 const ids=new Set();let found=0;
 for(const original of commonsWave04.records){
  assert.ok(!ids.has(original.commonsPageId));ids.add(original.commonsPageId);
  assert.equal(original.sourceArtworkID,"REVIEW::commons:"+original.commonsPageId);
  assert.ok(original.sourcePage.includes("commons.wikimedia.org/wiki/File:"));
  assert.equal(original.identityVerification,"EXACT_COMMONS_PAGE_ID_CONFIRMED_ON_FILE_PAGE_INFORMATION");
  assert.equal(original.nativeFileDimensions.length,2);
  for(const sl of original.placements){
   const options=index.shards.flatMap(meta=>rd("collection-family-"+meta.family+".v1.json").slots)
    .filter(item=>item.slot===sl).flatMap(item=>item.reviewCollection);
   const row=options.find(x=>x.sourceIDs.includes(original.sourceArtworkID) && x.sourcePage===original.sourcePage);
   assert.ok(row,"Missing verified source link in "+sl);
   assert.equal(row.productionEnabled,false);
   found++;
  }
 }
 assert.equal(found,32);
});

test("wave 5 Ricci is exact Page ID matched and the 50-identity backlog retains publication hold",()=>{
 assert.equal(commonsWave05.counts.sourcePlacementsRecovered,4);
 assert.equal(commonsWave05.counts.sourceLinkedTotal,1385);
 assert.equal(commonsWave05.record.commonsPageId,22002144);
 assert.equal(commonsWave05.imagePublicationAllowed,false);
 assert.equal(commonsWave05.newUserApprovals,0);
 let found=0;
 for(const sh of index.shards){
  const slots=rd("collection-family-"+sh.family+".v1.json").slots;
  for(const sl of slots)for(const p of sl.reviewCollection){
   if(!p.sourceIDs.includes(commonsWave05.record.sourceArtworkID))continue;
   assert.equal(p.sourcePage,commonsWave05.record.sourcePage);
   assert.equal(p.productionEnabled,false);
   found++;
  }
 }
 assert.equal(found,4);
 assert.equal(remainingQueue.totals.sourceUnlinkedDistinctIdentities,50);
 assert.equal(remainingQueue.totals.sourceUnlinkedPlacements,121);
 assert.equal(remainingQueue.items.length,50);
 const unresolved=[];
 for(const shard of index.shards){
  for(const sl of rd("collection-family-"+shard.family+".v1.json").slots){
   for(const p of sl.reviewCollection)unresolved.push({slot:sl.slot,ids:p.sourceIDs,title:p.title,artist:p.artist});
  }
 }
 const remainingCount=remainingQueue.items.reduce((n,item)=>n+item.placementCount,0);
 assert.equal(remainingCount,121);
 for(const item of remainingQueue.items){
  assert.equal(item.publicationAllowed,false);
  assert.equal(item.newApprovalGranted,false);
  assert.equal(item.verifiedSourcePage,null);
  assert.equal(item.placementCount,item.placements.length);
  for(const ref of item.placements){
   const expected=unresolved.find(u=>u.slot===ref.slot &&
      ((u.ids||[]).join("||")||"UNKEYED::"+u.title+"::"+u.artist)===item.identityKey);
   assert.ok(expected,"Unresolved queue item must match exact source record "+ref.slot);
  }
 }
});

test("wave 6 seven exact Commons page IDs, 23 safely linked placements and quarantined name matches",()=>{
 assert.equal(wave06.counts.distinctConfirmedSourceFilePages,7);
 assert.equal(wave06.counts.placementSourcePagesRecovered,23);
 assert.equal(wave06.counts.sourceLinkedTotal,1408);
 assert.equal(wave06.counts.sourceMissingTotal,98);
 assert.equal(wave06.counts.remainingDistinctCandidateIdentities,43);
 assert.equal(wave06.publicationEnabled,false);
 assert.equal(wave06.newEditorialApprovals,0);
 assert.equal(wave06.imageDownloaded,false);
 let linked=0;
 for(const w of wave06.verifiedSources){
  assert.equal(w.sourceID,"REVIEW::commons:"+w.pageId);
  assert.ok(w.informationPage.startsWith("https://commons.wikimedia.org/w/index.php?"));
  assert.ok(w.sourcePage.startsWith("https://commons.wikimedia.org/wiki/File:"));
  for(const ref of w.placements){
   const sl=rd("collection-family-"+ref.family+".v1.json").slots.find(s=>s.slot===ref.slot);
   assert.ok(sl);
   const a=sl.reviewCollection.find(x=>x.sourceIDs.includes(w.sourceID));
   assert.ok(a);
   assert.equal(a.sourcePage,w.sourcePage);
   assert.equal(a.productionEnabled,false);
   linked++;
  }
 }
 assert.equal(linked,23);
 for(const rejected of wave06.nearMatchQuarantine){
  assert.ok(rejected.status.includes("DO_NOT")||rejected.status.includes("DIFFERENT"));
 }
 assert.equal(remaining43.distinctIdentityGroups,43);
 assert.equal(remaining43.totalUnlinkedCandidatePlacements,98);
 assert.equal(remaining43.items.length,43);
 assert.equal(remaining43.items.reduce((n,x)=>n+x.placementCount,0),98);
 for(const group of remaining43.items){
  assert.equal(group.productionEnabled,false);
  assert.equal(group.newUserApprovalGranted,false);
  assert.equal(group.sourceRecordStatus,"SOURCE_PAGE_UNRESOLVED");
  for(const ref of group.placements){
   const x=rd("collection-family-"+ref.family+".v1.json").slots.find(s=>s.slot===ref.slot);
   assert.ok(x);
   assert.ok(x.reviewCollection.some(a=>((a.sourceIDs||[]).join("||")||"UNKEYED::"+a.title+"::"+a.artist)===group.identityKey));
  }
 }
});

test("wave 7 six exact original IDs, 17 research links, 7 strict-photo-license holds, and remaining 37-identity source queue",()=>{
 assert.equal(wave07.counts.verifiedOriginalFilePages,6);
 assert.equal(wave07.counts.placementSourcePagesRecovered,17);
 assert.equal(wave07.counts.sourceLinkedTotal,1425);
 assert.equal(wave07.counts.sourceMissingTotal,81);
 assert.equal(wave07.counts.strictCCBYSAHoldPlacements,7);
 assert.equal(wave07.publicationEnabled,false);
 assert.equal(wave07.noNewArtworkApprovals,true);
 let verified=0,licenseHolds=0;
 const seen=new Set();
 for(const original of wave07.sourceRecords){
  assert.ok(!seen.has(original.pageId));seen.add(original.pageId);
  assert.equal(original.sourceID,"REVIEW::commons:"+original.pageId);
  assert.ok(original.pageInformationUrl.includes("action=info"));
  for(const placement of original.placements){
   const s=rd("collection-family-"+placement.family+".v1.json").slots.find(v=>v.slot===placement.slot);
   assert.ok(s,placement.slot);
   const artwork=s.reviewCollection.find(a=>a.sourceIDs.includes(original.sourceID));
   assert.ok(artwork,placement.slot);
   assert.equal(artwork.sourcePage,original.sourcePage);
   assert.equal(artwork.productionEnabled,false);
   verified++;
   if(original.productionPhotoGate==="HOLD_STRICT_PD_CC0_POLICY_NO_EXCEPTION"){
    licenseHolds++;
    assert.equal(artwork.photoSourceLicense,original.photographicLicense);
    assert.match(artwork.photoSourceEligibility,/PHOTO_NOT_PD_CC0/);
   }
  }
 }
 assert.equal(verified,17);
 assert.equal(licenseHolds,7);
 assert.equal(remaining37.counts.sourceUnlinkedPlacements,81);
 assert.equal(remaining37.counts.distinctUnlinkedSourceIdentities,37);
 assert.equal(remaining37.items.length,37);
 assert.equal(remaining37.items.reduce((n,x)=>n+x.placementCount,0),81);
 assert.equal(remaining37.rules.includes("All candidate files productionEnabled:false"),true);
 for(const entry of remaining37.items){
  assert.equal(entry.sourcePage,null);
  assert.equal(entry.publicationEnabled,false);
  assert.equal(entry.newApprovalGranted,false);
  for(const ref of entry.placements){
   const slot=rd("collection-family-"+ref.family+".v1.json").slots.find(v=>v.slot===ref.slot);
   assert.ok(slot);
   assert.ok(slot.reviewCollection.some(a=>((a.sourceIDs||[]).join("||")||"UNKEYED::"+a.title+"::"+a.artist)===entry.identityKey));
  }
 }
});

test("wave 8 verified exact Commons originals add six source links without new approvals and keep 34 missing identity groups",()=>{
 assert.equal(wave08.counts.distinctExactOriginalSourceFiles,3);
 assert.equal(wave08.counts.placementSourcePagesRecovered,6);
 assert.equal(wave08.counts.sourceLinkedTotal,1431);
 assert.equal(wave08.counts.sourceUnlinkedTotal,75);
 assert.equal(wave08.counts.remainingDistinctSourceIdentityGroups,34);
 assert.equal(wave08.productionEnabled,false);
 assert.equal(wave08.newArtApproved,false);
 assert.equal(wave08.downloadedImageFiles,false);
 assert.equal(wave08.photoRightsAndMobileCropCertified,false);
 let count=0;
 for(const file of wave08.verifiedOriginals){
  assert.equal(file.sourceID,"REVIEW::commons:"+file.id);
  assert.ok(file.pageInfo.includes("action=info"));
  for(const ref of file.placements){
   const shard=rd("collection-family-"+ref.family+".v1.json");
   const s=shard.slots.find(a=>a.slot===ref.slot);
   assert.ok(s);
   const p=s.reviewCollection.find(x=>x.sourceIDs.includes(file.sourceID));
   assert.ok(p);
   assert.equal(p.sourcePage,file.sourcePage);
   assert.equal(p.productionEnabled,false);
   if(file.id===124722400)assert.match(p.photoSourceEligibility,/AUCTION_PHOTOGRAPH_SOURCE_HOLD/);
   count++;
  }
 }
 assert.equal(count,6);
 assert.equal(remaining34.stats.linkedPlacementCandidates,1431);
 assert.equal(remaining34.stats.missingSourcePlacementCandidates,75);
 assert.equal(remaining34.stats.distinctMissingOriginalIdentities,34);
 assert.equal(remaining34.items.length,34);
 assert.equal(remaining34.items.reduce((a,x)=>a+x.placementCount,0),75);
 let missing=0;
 for(const sh of index.shards){
  for(const sl of rd("collection-family-"+sh.family+".v1.json").slots)for(const x of sl.reviewCollection)if(!x.sourcePage)missing++;
 }
 assert.equal(missing,75);
 for(const entry of remaining34.items){
  assert.equal(entry.productionEnabled,false);
  assert.equal(entry.newApprovalGranted,false);
  for(const ref of entry.placements){
   const shard=rd("collection-family-"+ref.family+".v1.json");
   const s=shard.slots.find(a=>a.slot===ref.slot);
   assert.ok(s);
   assert.ok(s.reviewCollection.some(p=>!p.sourcePage && ((p.sourceIDs||[]).join("||")||"UNKEYED::"+p.title+"::"+p.artist)===entry.identityKey));
  }
 }
});
