import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CLASS_I_OWNER_SUPERSESSIONS_2026,classIOwnerSupersession2026,
 effectiveFrozenClassISelection2026} from "../src/home/class-i-2026-owner-supersessions.js";
import {annualHomeArtworkDay2026,ANNUAL_HOME_ARTWORK_DAYS_2026,
 annualHomeArtworkStatus2026} from "../src/home/annual-home-artwork-2026.js";
import {approved2026HomeArtwork} from "../src/home/approved-dated-artwork-2026.js";
const prior=JSON.parse(readFileSync(new URL("../data/artwork/2026-prior-date-artwork-evidence.v1.json",import.meta.url),"utf8"));
const date="2026-04-06",id="tempora:Pasc0-1:1:w",proper="Tempora/Pasc0-1";
const archive=prior.days.find(x=>x.date===date);
assert.equal(prior.days.length,365);
assert.equal(archive.selection.title,"The Supper at Emmaus");
assert.equal(archive.selection.artist,"Caravaggio","Historical 20 Oct archive must remain immutable");
assert.equal(archive.selection.editorialBasis,"NEW_DATE_SPECIFIC_APPROVAL");
assert.deepEqual(Object.keys(CLASS_I_OWNER_SUPERSESSIONS_2026),["2026-04-06","2026-04-07"]);
const superseded=classIOwnerSupersession2026(date,id,proper);
assert.ok(superseded);
assert.equal(superseded.ownerDecisionDate,"2026-10-26");
assert.equal(superseded.selection.title,"The Supper at Emmaus");
assert.equal(superseded.selection.artist,"Matthias Stom");
assert.equal(superseded.selection.artworkId,"thyssen-375-1976-66");
assert.equal(superseded.selection.editorialBasis,"LATER_EXPLICIT_OWNER_DATE_APPROVAL_20261026");
assert.equal(superseded.museumIdentity,"Museo Nacional Thyssen-Bornemisza, inventory 375 (1976.66)");
assert.equal(superseded.museumObject,
 "https://www.museothyssen.org/en/collection/artists/stom-matthias/supper-emmaus");
assert.equal(superseded.candidatePhotoPage,
 "https://commons.wikimedia.org/wiki/File:Matthias_Stom_-_The_supper_at_Emmaus.jpg");
assert.equal(superseded.photoSourceInstitution,"Museo Nacional Thyssen-Bornemisza");
assert.equal(superseded.sourcePhotographStatus,
 "HELD_MUSEUM_COMMERCIAL_PHOTO_PERMISSION_NOT_CLEARED");
assert.match(superseded.sourceRightsNotes,/commercial/);
assert.equal(superseded.image,null);
assert.equal(superseded.newPhotoApprovalCreated,false);
assert.equal(superseded.ownerApprovedCrop,false);
assert.equal(classIOwnerSupersession2026(date,id,"wrong"),null);
assert.equal(classIOwnerSupersession2026(date,"wrong",proper),null);
assert.equal(classIOwnerSupersession2026("2026-04-07",id,proper),null);
const tue=CLASS_I_OWNER_SUPERSESSIONS_2026["2026-04-07"];
assert.equal(tue.ownerDecisionDate,"2026-10-26");
assert.equal(tue.principalId,"tempora:Pasc0-2:1:w");
assert.equal(tue.properPath,"Tempora/Pasc0-2");
assert.equal(tue.supersedes.artist,"Anthony van Dyck");
assert.equal(tue.selection.artist,"Peter Paul Rubens");
assert.equal(tue.selection.artworkId,"kmska-307");
assert.equal(tue.museumIdentity,
 "Royal Museum of Fine Arts Antwerp (KMSKA), centre panel inventory 307, Rockox Triptych");
assert.equal(tue.museumObject,"https://vlaamsekunstcollectie.be/en/collection/307");
assert.equal(tue.sourcePhotographStatus,"CC0_INSTITUTIONAL_SOURCE_CANDIDATE_PENDING_LOCAL_QA");
assert.equal(tue.image,null);
assert.equal(tue.newPhotoApprovalCreated,false);
assert.equal(tue.ownerApprovedCrop,false);
assert.match(tue.iconographicCaution,/Thomas/);
const tueArchive=prior.days.find(x=>x.date==="2026-04-07");
assert.equal(tueArchive.selection.artist,"Anthony van Dyck");
assert.equal(tueArchive.selection.title,"Appearance of Christ to His Disciples");
const tueAnnual=annualHomeArtworkDay2026(tue.date,tue.principalId);
assert.deepEqual(tueAnnual.selection,tue.selection);

const annual=annualHomeArtworkDay2026(date,id);
assert.equal(annual.rank,"I");
assert.equal(annual.selection.artist,"Matthias Stom");
assert.deepEqual(annual.selection,superseded.selection);
assert.equal(annualHomeArtworkStatus2026(date,id,null),"DATE_SELECTION_IMAGE_UNRELEASED");
assert.equal(Object.keys(ANNUAL_HOME_ARTWORK_DAYS_2026).length,365);
assert.equal(Object.values(ANNUAL_HOME_ARTWORK_DAYS_2026).filter(x=>x.selection).length,53);
assert.equal(effectiveFrozenClassISelection2026(
 date,"I",id,[archive.selection.title,archive.selection.artist,archive.selection.artworkId,archive.selection.editorialBasis]
)?.artist,"Matthias Stom");
assert.equal(effectiveFrozenClassISelection2026(
 date,"I",id,["Wrong",archive.selection.artist,null,"NEW_DATE_SPECIFIC_APPROVAL"]),null);
const state=(d=date,p=id,path=proper)=>({
 selectedDate:d,route:"home",resolving:false,
 resolution:{date:d,status:"ready",day:{main:{id:p}},
  proper:{status:"ready",sourcePath:path,data:{sourcePath:path}}}
});
assert.equal(approved2026HomeArtwork(state()),null,
 "Do not show Caravaggio or Thyssen-sourced photography without clearance");
const tuePhoto=approved2026HomeArtwork(state("2026-04-07",tue.principalId,tue.properPath));
assert.equal(tuePhoto?.artworkId,"kmska-307",
 "Later owner-selected Rubens panel must render, never stale Van Dyck");
assert.equal(tuePhoto?.image,"/assets/home/class-i-2026/rubens-rockox-kmska307-central-panel-original.jpg");
assert.equal(tuePhoto?.selectionKind,"FROZEN_CLASS_I_LATER_OWNER_RUBENS_KMSKA307_EXACT_LOCAL_CC0_PHOTO");
assert.equal(approved2026HomeArtwork(state(date,id,"bad")),null);
assert.equal(approved2026HomeArtwork(state(date,"wrong",proper)),null);
assert.equal(approved2026HomeArtwork(state("2026-04-07",id,proper)),null);
for(const protectedDate of ["2026-10-25","2026-11-29"]){
 const day=annualHomeArtworkDay2026(protectedDate);
 assert.ok(day?.selection);
}
console.log("PASS 26 Oct Stom/Rubens owner supersessions override Easter Mon/Tue only; Stom photo rights held, Rubens CC0 candidate pending QA; 365 days/53 selections retained");
