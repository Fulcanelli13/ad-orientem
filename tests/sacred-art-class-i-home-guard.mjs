import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  APPROVED_CLASS_I_2026, RELEASED_SACRED_ART_MASTERS,
  approvedClassIEntry, releasedClassIArtwork,
  releasedClassIArtworkMarkup, safeLegacyHomeArtMarkup
} from "../src/home/sacred-art-selection.js";

assert.equal(APPROVED_CLASS_I_2026.length,18);
assert.equal(new Set(APPROVED_CLASS_I_2026.map(x=>x.date)).size,18);
assert.ok(APPROVED_CLASS_I_2026.every(x=>x.artworkId&&x.principalId&&x.sourcePath));
assert.equal(Object.keys(RELEASED_SACRED_ART_MASTERS).length,0,
  "Uninspected art masters must not be published automatically");
assert.equal(approvedClassIEntry("2026-03-25").artworkId,
  "ART-hilippe-de-hampaigne-he-nnunciation");
assert.equal(approvedClassIEntry("2026-04-02").relation,"FEAST_EUCHARIST",
  "Holy Thursday's Last Supper is not literal John 13 foot washing");
assert.equal(approvedClassIEntry("2026-05-24").relation,"FEAST_EVENT",
  "Pentecost Acts 2 iconography is not John 14 Gospel narrative");
assert.equal(approvedClassIEntry("2026-08-15").relation,"FEAST_EVENT",
  "Assumption is not the literal Gospel scene of the Visitation");
assert.equal(approvedClassIEntry("2026-06-29").relation,"FEAST_PERSONS",
  "Apostles portraits must not be labelled Matthew 16");
assert.equal(approvedClassIEntry("2026-11-01"),null,
  "Unapproved All Saints image must not enter the released source");

const entry=approvedClassIEntry("2026-03-25");
const state={
  route:"home",resolving:false,selectedDate:entry.date,
  resolution:{
    status:"ready",
    day:{main:{id:entry.principalId}},
    proper:{status:"ready",data:{
      sourcePath:entry.sourcePath,
      gospel:{en:"Continuation of the Gospel\nLuke 1:26\nHail, full of grace."},
    }},
  }
};
const good={
  artworkId:entry.artworkId,releaseGate:"ALL_CHECKS_PASS",
  path:"assets/approved/sacred-art/champaigne-annunciation.webp",
  sha256:"a".repeat(64),sourceUrl:"https://example.org/original-artwork",
  credit:"Philippe de Champaigne",reuse:"PUBLIC_DOMAIN",
  width:2400,height:1800,placementReviewed:"exact",
  physicalOriginalVerified:true,imageBytesVerified:true,
  legalReuseVerified:true,cropReviewed:true,properAndGospelReviewed:true,
  alt:"The Annunciation by Philippe de Champaigne"
};
const masters={[entry.artworkId]:good};
assert.equal(releasedClassIArtwork(state),null,"No real released master exists yet");
assert.equal(releasedClassIArtwork({...state,resolving:true},masters),null);
assert.equal(releasedClassIArtwork({...state,resolution:{...state.resolution,
  proper:{status:"failed"}}},masters),null);
assert.equal(releasedClassIArtwork({...state,resolution:{...state.resolution,
  day:{main:{id:"tempora:wrong"}}}},masters),null);
assert.equal(releasedClassIArtwork({...state,resolution:{...state.resolution,
  proper:{status:"ready",data:{...state.resolution.proper.data,
    sourcePath:"Sancti/04-01"}}}},masters),null);
assert.equal(releasedClassIArtwork({...state,resolution:{...state.resolution,
  proper:{status:"ready",data:{...state.resolution.proper.data,
    gospel:{en:"Luke 1:39"}}}}},masters),null);
for(const bad of [
  {releaseGate:"PENDING"},
  {path:"https://remote.example/test.webp"},
  {sha256:"unknown"},
  {credit:""},
  {reuse:"UNKNOWN"},
  {width:200},
  {physicalOriginalVerified:false},
  {imageBytesVerified:false},
  {legalReuseVerified:false},
  {cropReviewed:false},
  {properAndGospelReviewed:false},
])assert.equal(releasedClassIArtwork(state,{[entry.artworkId]:{...good,...bad}}),null);
const approved=releasedClassIArtwork(state,masters);
assert.equal(approved.artworkId,entry.artworkId);
assert.match(releasedClassIArtworkMarkup(approved),/assets\/approved\/sacred-art\/champaigne-annunciation\.webp/);
assert.match(releasedClassIArtworkMarkup(approved),/data-ao-approved-artwork-id/);

// The historical v43 selector includes images by permanently excluded artists.
// Fail closed even if the donor HTML hides its artist or file ID.
const donor='<div class="aoPhase1HomeArt"><img src="historic.jpg"></div>';
for(const path of ["Sancti/03-25","Tempora/Pasc7-0",
  "Tempora/Pent01-0","Tempora/Pent01-0r","Tempora/Pent09-0"])
  assert.equal(safeLegacyHomeArtMarkup({resolution:{proper:{data:{sourcePath:path}}}},donor),"",
    "Excluded legacy selector artwork resurfaced for "+path);
assert.equal(safeLegacyHomeArtMarkup({},'<img src="x" data-art-id="AO105">'),"");
assert.equal(safeLegacyHomeArtMarkup({},'<img src="x" alt="El Greco — Trinity">'),"");
assert.equal(safeLegacyHomeArtMarkup({},'<img src="x" alt="Fra Angelico Annunciation">'),"");
assert.equal(safeLegacyHomeArtMarkup({resolution:{proper:{data:{sourcePath:"Sancti/07-01"}}}},donor),donor);
const home=readFileSync("src/home/presentation.js","utf8");
assert.match(home,/releasedClassIArtwork\(state\)/);
assert.match(home,/safeLegacyHomeArtMarkup\(state,art,win\)/);
assert.match(home,/renderHomeToString/,"Home markup and Mass controls must remain intact");
console.log("PASS Class I approved-art projection, exact Proper matching, source and image release safeguards");
