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
const provisional=rd("provisional-one-choice-per-267-art-position.v1.json");
test("1506 proposed original artwork placements are never released, including exact-ID photo-source recoveries",()=>{
 const x=index.qaState;assert.equal(x.candidatePlacementRelationships,1506);
 assert.equal(x.originalMissingSourcePage,329);
 assert.equal(x.sourceLinksRestoredByExactArtworkID,140);
 assert.equal(x.sourceLinksAddedByDirectMuseumAndCommonsVerification,2);
 assert.equal(x.nowStillWithoutSourcePages,125);
 assert.equal(x.sourceLinksVerifiedByCommonsExactPageIDWave04,32);
 assert.equal(x.sourceLinksVerifiedBySubjectSourceWave03,11);
 assert.equal(x.nowWithSourcePages,1381);
 assert.equal(x.sourceLinksVerifiedByMetWave02,36);
 assert.equal(x.distinctSourceLessCandidateIdentities,51);
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
 assert.equal(linked,1381);
 assert.equal(remaining,125);
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
