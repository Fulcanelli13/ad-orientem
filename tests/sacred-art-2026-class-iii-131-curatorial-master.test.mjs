import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const base="data/artwork/";
const master=read(base+"sacred-art-2026-class-iii-131-curatorial-master-20261110.v1.json");
const census=read(base+"sacred-art-2026-coverage-first-master-20261110.v1.json");
const prior=read(base+"2026-prior-date-artwork-evidence.v1.json");
const gallery=read(base+"research-semantic-candidates-989.v1.json");
const extra=read(base+"sacred-art-2026-class-iii-final-gap-seven-source-leads-20261110.v1.json");
const counts=master.counts;
const get=(x,keys)=>keys.map(k=>x?.[k]).find(v=>typeof v==="string"&&v.trim())||null;
const expected=census.calendar.days.filter(d=>d.rank==="III"&&d.status!=="NEW_CONTEXTUAL_LOCAL_IMAGE_MAPPED");
const rows=master.dates;
assert.equal(master.schema,"AO_SACRED_ART_2026_CLASS_III_131_RECONCILED_CURATORIAL_MASTER_V1");
assert.equal(rows.length,131);
assert.equal(counts.dates,131);
assert.equal(new Set(rows.map(x=>x.date)).size,131);
assert.deepEqual(new Set(rows.map(x=>x.date)),new Set(expected.map(x=>x.date)));
const oldByDate=new Map(prior.days.map(x=>[x.date,x]));
const gById=new Map(gallery.artworks.map(x=>[x.workGroupId,x]));
const newByDate=new Map(extra.artworkResearch.map(x=>[x.date,x]));
for(const r of rows){
 const source=oldByDate.get(r.date);
 const censusDay=expected.find(x=>x.date===r.date);
 assert.ok(source&&censusDay,r.date);
 assert.equal(r.rank,"III",r.date);
 assert.equal(r.observance,censusDay.observance,r.date);
 assert.equal(r.principalId,censusDay.principalId,r.date);
 assert.equal(r.baselineStatus,censusDay.status,r.date);
 assert.equal(r.scope,"CLASS_III_ARTWORK_CANDIDATE_ONLY");
 assert.equal(r.paintingDepictionIndependentlyScreened,false,r.date);
 assert.equal(r.exactPhotoRightsAndQualityCertified,false,r.date);
 assert.equal(r.ownerDatePlacementApproved,false,r.date);
 assert.equal(r.calendarAppReleaseEnabled,false,r.date);
 const all=[...(source.catalogue||[]),...(source.externalExistingResearch||[]),...(source.study||[])];
 assert.equal(r.originalDateSourceRowCount,all.length,r.date);
 const named=all.map(x=>({
  title:get(x,["title","titleAsSource","titleAsCatalogued","name"]),
  artist:get(x,["artist","artistAsSource","artistAsCatalogued"]),
  id:get(x,["artworkId","researchSourceId","id"])
 })).filter(x=>x.title&&x.artist);
 assert.equal(r.originalNamedPaintingCount,named.length,r.date);
 const selected=r.proposedClassIIIArtwork;
 if(r.originalNamedPaintingCount){
  assert.ok(selected,r.date);
  assert.notEqual(selected.sourceKind,"FROZEN_989_GALLERY_TITLE_RESEARCH_NOT_ADMITTED",r.date);
  assert.ok(named.some(x=>x.title===selected.title&&x.artist===selected.artist&&x.id===selected.artworkId),r.date);
 }else if(selected?.sourceKind==="FROZEN_989_GALLERY_TITLE_RESEARCH_NOT_ADMITTED"){
  const g=gById.get(selected.artworkId);
  assert.ok(g,r.date);
  assert.equal(g.title,selected.title,r.date);
  assert.equal(g.artist,selected.artist,r.date);
  assert.equal(selected.editorialPriorStatus,"UNAPPROVED_TITLE_BASED_RESEARCH");
 }else if(selected){
  assert.equal(selected.sourceKind,"NEW_20261110_IDENTIFIED_OBJECT_RESEARCH_NOT_ADMITTED",r.date);
  const e=newByDate.get(r.date);
  assert.ok(e,r.date);
  assert.equal(selected.artworkId,e.objectId,r.date);
  assert.equal(selected.title,e.title,r.date);
  assert.equal(selected.artist,e.artist,r.date);
  assert.equal(selected.objectReference,e.sourceUrl,r.date);
  assert.equal(selected.editorialPriorStatus,"NEW_CURATORIAL_LEAD_NOT_OWNER_APPROVED",r.date);
  assert.equal(r.newEvidenceScope,e.scope,r.date);
 }
 if(selected){
  assert.equal(selected.ownerApprovedForClassIIIDate,false,r.date);
  assert.equal(selected.photographRightsForAppCleared,false,r.date);
  assert.equal(selected.directProductionPhotoAbsentOrUnconfirmed,true,r.date);
 }
 if(r.identityDisambiguationRule)assert.ok(r.identityDisambiguationRule.length>20,r.date);
}
const histogram=key=>Object.fromEntries([...new Set(rows.map(key))].map(k=>[k,rows.filter(d=>key(d)===k).length]));
assert.equal(rows.filter(x=>x.baselineHasResearchLead).length,106);
assert.equal(rows.filter(x=>!x.baselineHasResearchLead).length,25);
assert.equal(rows.filter(x=>x.originalNamedPaintingCount>0).length,106);
assert.equal(rows.reduce((n,x)=>n+x.originalNamedPaintingCount,0),177);
assert.equal(rows.filter(x=>x.proposedClassIIIArtwork?.sourceKind==="FROZEN_989_GALLERY_TITLE_RESEARCH_NOT_ADMITTED").length,15);
assert.equal(rows.filter(x=>x.proposedClassIIIArtwork).length,128);
assert.equal(rows.filter(x=>!x.proposedClassIIIArtwork).length,3);
assert.equal(rows.filter(x=>x.identityDisambiguationRule).length,17);
assert.equal(rows.filter(x=>x.proposedClassIIIArtwork?.sourceKind==="NEW_20261110_IDENTIFIED_OBJECT_RESEARCH_NOT_ADMITTED").length,7);
assert.equal(rows.filter(x=>x.curatorialState==="NEW_PARTIAL_GROUP_SCENE_CANDIDATE").length,2);
assert.equal(extra.counts.newNamedWorkLeads,7);
assert.equal(extra.counts.partialGroupIdentities,2);
assert.equal(extra.counts.stillNoArtworkObjectForDate,3);
assert.deepEqual(new Set(extra.remainingGaps.map(x=>x.date)),new Set(rows.filter(x=>!x.proposedClassIIIArtwork).map(x=>x.date)));
assert.deepEqual(counts.sourceStatusBreakdown,histogram(x=>x.curatorialState));
assert.equal(counts.ownerVettedSourceLevelRecommendations,rows.filter(x=>x.proposedClassIIIArtwork?.artworkLevelPreviouslyAccepted).length);
assert.equal(counts.newDateApprovals,0);
assert.equal(counts.newReleasedPhotos,0);
// Regression: exact similarly named saints and different Gospel/feast acts.
const pick=date=>rows.find(x=>x.date===date);
assert.match(pick("2026-06-25").proposedClassIIIArtwork.title,/William of Vercelli/i);
assert.match(pick("2026-11-26").identityDisambiguationRule,/Sylvester Gozzolini/);
assert.match(pick("2026-11-12").identityDisambiguationRule,/Pope Martin I/);
assert.match(pick("2026-01-17").identityDisambiguationRule,/Anthony the Abbot/);
assert.match(pick("2026-09-28").proposedClassIIIArtwork.artist,/Škréta/i);
assert.equal(pick("2026-11-18").curatorialState,"CONTEXTUAL_GALLERY_SAINTS_NOT_DEDICATION");
assert.equal(pick("2026-09-03").proposedClassIIIArtwork.artworkId,"COMMONS-MULLERURY-PIUSX");
assert.equal(pick("2026-08-20").proposedClassIIIArtwork.artworkId,"prado-ribalta-p002804");
assert.equal(pick("2026-07-22").proposedClassIIIArtwork.artworkLevelPreviouslyAccepted,true);
console.log("PASS Class III 131-date coverage: 106 existing named dates, 15 gallery title leads, 7 independent source objects, 128 proposals, 3 gaps (2 partial feast groups); no date/photo publication.");
