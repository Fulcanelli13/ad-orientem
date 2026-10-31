import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const rd=p=>JSON.parse(readFileSync(new URL("../data/prayer/artwork-editorial-20261031/"+p,import.meta.url),"utf8"));
const index=rd("all-267-source-linked-artwork-candidate-collection.v1.json");
const provenance=rd("source-link-recovery-1506-placements-20261031.v1.json");
const attribution=rd("artist-attribution-source-resolution-wave01.v1.json");
const sourceQA=rd("priority-photo-source-and-licence-qa-wave01.v1.json");
const provisional=rd("provisional-one-choice-per-267-art-position.v1.json");
test("1506 proposed original artwork placements are never released, including exact-ID photo-source recoveries",()=>{
 const x=index.qaState;assert.equal(x.candidatePlacementRelationships,1506);
 assert.equal(x.originalMissingSourcePage,329);
 assert.equal(x.sourceLinksRestoredByExactArtworkID,140);
 assert.equal(x.sourceLinksAddedByDirectMuseumAndCommonsVerification,2);
 assert.equal(x.nowStillWithoutSourcePages,204);
 assert.equal(x.pradoPhotoSourcesExcluded,17);
 assert.equal(x.unverifiedNameOnlySourceAlternatives,7);
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
 assert.equal(linked,1302);
 assert.equal(remaining,204);
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
