import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=p=>JSON.parse(readFileSync(p,"utf8"));
const wave=read("data/calendar/sacred-art-masterpiece-anchor-wave-20261012.v1.json");
const decisions=read("data/calendar/sacred-art-user-235-subject-decisions-20261012.v1.json");
const archive=read("data/calendar/sacred-art-candidates.v1.json");
const occasions=read("data/calendar/sacred-art-home-masterpiece-occasions-2026.v1.json");
const choices=new Map(decisions.decisions.filter(x=>x.decision==="selected").map(x=>[x.subject_id,x]));
const old=new Map(archive.artworks.map(x=>[x.id,x]));
const all=new Set([...occasions.classI,...occasions.optionalSpotlights,...occasions.apostolicMysticAngelicSpotlights].map(x=>x.date));
assert.equal(wave.schema,"AO_SACRED_ART_2026_MASTERPIECE_ANCHOR_WAVE_V1");
assert.equal(wave.phase,"RESEARCH_AND_REUSE_NOT_ACQUISITION_OR_PUBLICATION");
assert.equal(wave.summary.themeCount,23);
assert.equal(wave.themes.length,23);
assert.equal(wave.summary.primaryUserSelected,13);
assert.equal(wave.summary.primaryArchiveSalvage,4);
assert.equal(wave.summary.primaryNewCustodianLeads,5);
assert.equal(wave.summary.extraReviewAlternatives,8);
assert.equal(wave.summary.rightNowProductionReady,0);
assert.equal(wave.policy.existingUserChoicesImmutable,true);
assert.equal(wave.policy.elGrecoExcluded,true);
assert.equal(wave.policy.mustSwitchByDate,false);
assert.equal(new Set(wave.themes.map(x=>x.key)).size,23);
assert.equal(wave.themes.every(x=>x.priority==="P0"),true);
const allowedSource=/^https:\/\/(?:www\.)?(?:nationalgallery\.org\.uk|museivaticani\.va|collections\.louvre\.fr|museodelprado\.es|catalogo\.beniculturali\.it|collections\.augustins\.toulouse\.fr)\//;
const verify=w=>{
 assert.equal(w.homePublicationApproved,false);
 assert.equal(w.userSelectedForHomeMasterpiece,false);
 assert.equal(w.mobileCropApproved,false);
 assert.equal(w.rightsCleared,false);
 assert.doesNotMatch(w.artist||"",/El Greco|Fra Angelico/i,"Declined artists cannot return in active masterpiece shortlist");
 if(w.kind==="OPEN_CURATORIAL_GAP"){
  assert.equal(w.artist,null);
  assert.equal(w.title,null);
  assert.equal(w.homePublicationApproved,false);
  return;
 }
 if(w.kind==="USER_SELECTED_20261012"){
  assert.ok(choices.has(w.subjectId),"Cannot manufacture human subject selection");
  assert.equal(w.artworkSelectionId,choices.get(w.subjectId).selected_artwork_id);
  assert.equal(w.title,choices.get(w.subjectId).selected_artwork.title);
  return;
 }
 if(w.kind==="EXISTING_ACQUIRED_ARCHIVE_ORIGINAL"){
  const source=old.get(w.canonicalArchiveId);
  assert.ok(source,"All reused works must refer to actual previously acquired originals");
  assert.match(w.originalSha256,/^[a-f0-9]{64}$/);
  assert.equal(w.originalSha256,source.acquisition.originalSha256);
  assert.equal(w.sourceUrl,source.source.objectUrl);
  assert.equal(w.title,source.title);
  return;
 }
 assert.equal(w.kind,"NEW_OFFICIAL_CUSTODIAN_RESEARCH_LEAD");
 assert.match(w.sourceUrl,allowedSource,"External research must link to direct custodian record");
 assert.equal(w.objectIdentitySource,"PRIMARY_COLLECTION_PAGE");
 assert.equal(w.originalImageAcquired,false);
 assert.equal(w.userSelectedForSubject,false);
};
for(const row of wave.themes){
 assert.ok(row.key&&row.name&&row.relation);
 assert.ok(Array.isArray(row.dates)&&row.dates.length);
 for(const date of row.dates){
  assert.match(date,/^2026-\d{2}-\d{2}$/);
  assert.ok(all.has(date),"Masterpiece slot requires a real curated 1962 major occasion: "+row.key+" "+date);
 }
 verify(row.primary);
 for(const item of row.additional||[])verify(item);
}
assert.ok(wave.themes.find(x=>x.key==="sacred-heart")?.blocker,
 "The Sacred Heart's art rights gap is not closed by source discovery");
assert.match(wave.themes.find(x=>x.key==="christ-king")?.relation||"",/PENDING|VERIFY/);
assert.match(wave.themes.find(x=>x.key==="all-souls")?.relation||"",/CONTEXTUAL/);
assert.match(wave.themes.find(x=>x.key==="corpus-christi")?.relation||"",/ALLEGORY/);
assert.equal(wave.themes.find(x=>x.key==="lent-temptation").primary.canonicalArchiveId,"nga-50726",
 "Don't reacquire Juan de Flandes: it is already SHA-hashed");
assert.equal(wave.themes.find(x=>x.key==="palm-sunday").primary.canonicalArchiveId,"kress-k2017");
assert.equal(wave.themes.find(x=>x.key==="all-souls").primary.canonicalArchiveId,"kress-k2027");
assert.equal(wave.themes.find(x=>x.key==="all-saints").primary.kind,"OPEN_CURATORIAL_GAP");
assert.deepEqual(wave.policy.excludedArtists,["El Greco","Fra Angelico"]);
assert.equal(wave.summary.unfilledPrimaryThemes,1);
assert.equal(wave.summary.historicalStyleExcludedWorks,2);
assert.equal(wave.themes.find(x=>x.key==="all-saints").historicallyRejectedCandidates.length,2);
assert.ok(wave.themes.find(x=>x.key==="all-souls").additional.some(a=>
 a.provisionalLeadId==="augustins-2004-1-218"
 && a.associationTier==="EXACT_PURGATORY_INTERCESSION_ICONOGRAPHY"
 && a.rightsCleared===false
),"Preserve Champaigne's source-confirmed Purgatory painting as a non-approved All Souls alternative");
console.log("PASS 23 masterpiece-anchor themes: 13 newer selections, 4 hashed original reuses, 5 new museum/church custodian leads, 8 alternates; no user-approval, rights or production promotion");
