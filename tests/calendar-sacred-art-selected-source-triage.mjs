import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const triage=read("data/calendar/sacred-art-masterpiece-selected-source-triage-20261012.v1.json");
const decisions=read("data/calendar/sacred-art-user-235-subject-decisions-20261012.v1.json");
const master=read("data/calendar/sacred-art-masterpiece-anchor-wave-20261012.v1.json");
const archive=read("data/calendar/sacred-art-candidates.v1.json");
const byId=new Map(decisions.decisions.map(x=>[x.subject_id,x]));
const byArchive=new Map(archive.artworks.map(x=>[x.id,x]));
assert.equal(triage.schema,"AO_MASTERPIECE_ANCHOR_CHOSEN_OBJECT_SOURCE_TRIAGE_20261012_V1");
assert.equal(triage.summary.scopedUserSelectedAnchorThemes,13);
assert.equal(triage.summary.officialSourcesOrCollectionWitnesses,13);
assert.equal(triage.summary.institutionalSeriesOrDerivativeWitnessPending,2);
assert.equal(triage.summary.previouslyArchiveHashMatched,1);
assert.equal(triage.summary.readyForPublication,0);
assert.equal(triage.summary.newOriginalsDownloaded,0);
assert.equal(new Set(triage.selectedAnchorSourceReconciliations.map(x=>x.anchorTheme)).size,13);
const selected=master.themes.filter(x=>x.primary.kind==="USER_SELECTED_20261012");
assert.equal(selected.length,triage.selectedAnchorSourceReconciliations.length);
for(const r of triage.selectedAnchorSourceReconciliations){
  const source=byId.get(r.subjectId),wave=selected.find(x=>x.key===r.anchorTheme);
  assert.ok(source&&wave,"All triage rows must match current chosen anchor");
  assert.equal(source.decision,"selected");
  assert.equal(r.subjectId,wave.primary.subjectId);
  assert.equal(r.userSelectionId,source.selected_artwork_id);
  assert.equal(r.userChosenLocation,source.selected_artwork.location);
  assert.equal(r.userChosenTitle,source.selected_artwork.title);
  assert.equal(r.selectedSourceUrlAtExport,source.selected_artwork.source_url||null);
  assert.match(r.verifiedSourceUrl,/^https:\/\//);
  assert.notEqual(r.reproductionLicenseVerified,true);
  assert.equal(r.homeCropApproved,false);
  assert.equal(r.homeAestheticApproved,false);
  assert.equal(r.pixelsAcquiredInThisBatch,false);
  for(const a of r.museumArchiveOriginalsAcquired){
    assert.match(a.originalSha256,/^[a-f0-9]{64}$/);
    assert.equal(a.originalSha256,byArchive.get(a.archiveId).acquisition.originalSha256);
  }
}
const checked=new Map(triage.selectedAnchorSourceReconciliations.map(x=>[x.anchorTheme,x]));
assert.equal(checked.get("presentation").verifiedInventory,"CA 104");
assert.match(checked.get("presentation").verifiedSourceUrl,/musees\.dijon\.fr/);
assert.ok(!checked.get("presentation").verifiedSourceUrl.includes("fine-arts-museum.be"),
  "Dijon 1628 must not be silently replaced with Brussels 1648");
assert.equal(checked.get("nativity").verifiedInventory,"RF 1983 92");
assert.equal(checked.get("trinity").verifiedInventory,"KMSKA 314");
assert.equal(checked.get("trinity").iiif.manifestUrl,"https://iiif.kmska.be/iiif/2/28958/manifest.json");
assert.ok(checked.get("trinity").iiif.reportedMaxWidth>19000);
assert.ok(checked.get("trinity").iiif.reportedMaxHeight>19000);
assert.equal(checked.get("trinity").iiif.manifestLicense,"https://creativecommons.org/publicdomain/mark/1.0/");
assert.equal(checked.get("trinity").iiif.originalBytesAcquired,false,
  "Cataloguing an IIIF manifest is NOT acquiring a full-resolution original");
assert.equal(checked.get("passiontide").verifiedInventory,"KMSKA 297");
assert.equal(checked.get("pentecost").verifiedInventory,"INV 20303");
assert.equal(checked.get("holy-thursday").verifiedInventory,"INV 1125");
assert.equal(checked.get("ascension").objectIdentificationMatchesUserChoice,"PARTIAL_PENDING_INDIVIDUAL_OBJECT_SOURCE");
assert.equal(checked.get("saint-michael").sourceEvidenceTier,"OFFICIAL_DERIVATIVE_WITNESS_NOT_ORIGINAL_OBJECT_PAGE");
assert.equal(checked.get("annunciation").museumArchiveOriginalsAcquired[0].archiveId,"met-438724");
console.log("PASS: 13 current selected anchor artworks source-matched; Dijon/Brussels versions protected; Restout/Champaigne original identified; unknown photo rights remain closed");
