import assert from "node:assert/strict";
import {hasPradoProvenance,commonsMetadataHasPradoProvenance,PRADO_SOURCE_HOLD} from "../tools/calendar/sacred-art-source-policy.mjs";
import {readFileSync} from "node:fs";
import {BATCH_SIZE,makeBatches,sourceGate,parseImageDimensions,commonsLicenseUsable,metadataAgreement} from "../tools/calendar/acquire-sacred-art-bulk.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const intake=read("data/research/sacred-art-bulk-source-intake-451-20261020.v1.json");
const freeze=read("data/research/sacred-art-user-frozen-decisions-20261017.v1.json");
const certified=read("data/calendar/sacred-art-certified-media.v1.json");
assert.equal(intake.works.length,451);
assert.equal(new Set(intake.works.map(x=>x.id)).size,451,"No duplicate canonical artwork identifiers");
assert.equal(BATCH_SIZE,50);
const shards=makeBatches();
assert.equal(shards.length,10);
assert.equal(shards.slice(0,9).every(s=>s.length===50),true);
assert.equal(shards[9].length,1);
assert.deepEqual(shards.flat().map(x=>x.id),intake.works.map(x=>x.id),"No skip, reorder or duplicate across 50-work shards");
assert.equal(intake.counts.latestApproved,107);
assert.equal(intake.counts.legacyFivesIn451,77);
assert.equal(intake.counts.excluded,68);
assert.equal(intake.counts.editorialHold,199);
assert.equal(intake.counts.eligibleExactMet,22);
assert.equal(intake.counts.eligibleExactCommons,61);
assert.equal(intake.counts.eligibleExactCleveland,14);
assert.equal(intake.counts.eligibleOtherSource,54);
assert.equal(intake.counts.eligibleExactNga,6);
assert.equal(intake.counts.pradoAcquisitionHolds,31);
assert.equal(intake.counts.pradoHoldsApprovedOrHistoric,26);
assert.deepEqual(certified.media,[],"Bulk ingestion cannot silently certify release files");
assert.equal(commonsLicenseUsable("CC BY-SA 4.0","True"),true,"Attribution/share-alike allows technical staging");
assert.equal(commonsLicenseUsable("CC0","True"),true,"Explicit CC0 licence is valid even when Commons marks it copyrighted");
assert.equal(commonsLicenseUsable("CC BY 3.0","True"),true,"Copyrighted CC-licensed file may be staged");
assert.equal(commonsLicenseUsable("Public domain","False"),true);
assert.equal(commonsLicenseUsable("Public domain","True"),false,"Conflicting public-domain claim is held");
assert.equal(commonsLicenseUsable("All rights reserved","True"),false);
const accepted=new Set(freeze.approved.map(x=>x.artworkId));
const rejected=new Set(freeze.rejected.map(x=>x.artworkId));
const legacy=new Set(freeze.historicallyFiveIDsPreservedSeparately);
const statuses=intake.works.map(x=>sourceGate(x));
for(const [id,exact] of [
 ["G31-001","SK-A-4423"],
 ["W05-027","Santa Maria del Popolo"],
 ["W07-007","Galleria Borghese"],
 ["B01-MARK-MARATTA-THYSSEN","Maratta"],
 ["W38-006","GG 9703"]
]) {
 const row=intake.works.find(x=>x.id===id);
 assert(row?.provider==="COMMONS_EXACT_FILE_CANDIDATE"&&row.sourceUrl.includes("commons.wikimedia.org/wiki/File:"));
 assert(sourceGate(row)==="COMMONS");
 assert([row.sourceUrl,row.sourceObjectUrl,row.imageSourceVerification?.institution].join(" ").replaceAll("_"," ").includes(exact),
   "Institution or accession matching evidence missing: "+id);
}
assert(intake.works.some(x=>x.id==="W14-016"&&x.provider==="NO_EXACT_OPEN_SOURCE"
  &&x.assetHolds.includes("VAN_DYCK_WORKSHOP_VERSUS_AUTOGRAPH")),
  "Disputed workshop/autograph Judas Thaddeus must not be auto-acquired");
assert(hasPradoProvenance({sourceUrl:"https://www.museodelprado.es/en/the-collection/art-work/example"}));
assert(hasPradoProvenance({id:"prado-rubens-p001647",sourceUrl:"https://commons.wikimedia.org/wiki/File:Mirror.jpg"}));
assert(commonsMetadataHasPradoProvenance({Credit:{value:'<a href="https://www.museodelprado.es">Museo del Prado</a>'}}));
assert.equal(commonsMetadataHasPradoProvenance({Credit:{value:"National Gallery of Art"}}),false);
assert.equal(sourceGate({...intake.works.find(x=>x.provider==="MET_OPEN_ACCESS_CANDIDATE"),sourcePolicy:{status:PRADO_SOURCE_HOLD}}),PRADO_SOURCE_HOLD);
assert(intake.works.every((x,i)=>!(hasPradoProvenance(x)&&statuses[i]!==PRADO_SOURCE_HOLD)),"No Prado original can enter an acquisition shard");
assert.equal(statuses.filter(x=>x==="MET").length,22);
assert.equal(statuses.filter(x=>x==="HOLD_CANONICAL_ALIAS_REUSE").length,1);
assert.equal(intake.works.find(x=>x.id==="met-438724").canonicalArtworkId,"ART-hilippe-de-hampaigne-he-nnunciation");
const saintRosalia=intake.works.find(x=>x.id==="ART-nthony-van-yck-aint-osalia-nterceding-for-alermo");
assert.equal(saintRosalia.sourceUrl,"https://www.metmuseum.org/art/collection/search/436257");
assert.equal(saintRosalia.verifiedMuseumAccession,"71.41");
assert.equal(saintRosalia.sourceIdentityCorrection?.wrongObjectId,436235);
assert.equal(saintRosalia.sourceIdentityCorrection?.wrongArtist,"Joseph Siffred Duplessis");
assert.equal(saintRosalia.sourceIdentityCorrection?.replacementPhotoNotYetHumanApproved,true);
const officialAlias=metadataAgreement(saintRosalia,
  saintRosalia.sourceIdentityCorrection.actualMetTitle,"Anthony van Dyck");
assert.equal(officialAlias.titleAgreement,true,"Historically selected Rosalia = official Met Rosalie title");
assert.equal(officialAlias.documentaryTitleAliasMatch,true);
const impostor=metadataAgreement(saintRosalia,"Madame de Saint-Morys","Joseph Siffred Duplessis");
assert.equal(impostor.titleAgreement,false);
assert.equal(impostor.artistAgreement,false);
assert.equal(metadataAgreement({...saintRosalia,verifiedMuseumAccession:"OTHER"},
  saintRosalia.sourceIdentityCorrection.actualMetTitle,"Anthony van Dyck").documentaryTitleAliasMatch,false,
  "An unverified accession cannot activate a documented title exception");


assert.equal(statuses.filter(x=>x==="COMMONS").length,61);
assert.equal(statuses.filter(x=>x==="CLEVELAND").length,14);
assert.equal(statuses.filter(x=>x==="HOLD_REJECTED").length,68);
assert.equal(statuses.filter(x=>x==="HOLD_NOT_APPROVED").length,194);
assert.equal(statuses.filter(x=>x==="HOLD_NO_AUTHORIZED_SOURCE").length,54);
assert.equal(statuses.filter(x=>x==="HOLD_NGA_DEDICATED_BATCH").length,6);
assert.equal(statuses.filter(x=>x===PRADO_SOURCE_HOLD).length,31);
assert.equal(sourceGate(intake.works.find(x=>x.id==="ART-os-de-ibera-acob-s-ream")),PRADO_SOURCE_HOLD);
assert(intake.works.filter(x=>["W14-006","ART-aravaggio-he-acrifice-of-saac","ART-eter-aul-ubens-iracles-of-aint-rancis-of-aola"].includes(x.id)).every(x=>sourceGate(x)==="COMMONS"));
const originals=intake.works.filter(x=>x.verifiedStationRoman);
assert.equal(originals.length,12);
assert.equal(new Set(originals.map(x=>x.verifiedStationRoman)).size,12);
assert(originals.every(x=>sourceGate(x)==="COMMONS"&&x.sourceUrl.includes("Chiesa_di_San_Polo_(Venice)_-_VIA_CRUCIS_")));
assert(originals.every(x=>x.imageSourceVerification?.productionCertified===false
  &&x.imageSourceVerification.photoRightsToConfirmFromOriginalFile===true));
assert(intake.works.filter(x=>x.verifiedStationRoman).every(x=>!x.sourceUrl.includes("via-crucis-jesus-is-taken-down-from-the-cross")));

for(let i=0;i<intake.works.length;i++){
 const row=intake.works[i],gate=statuses[i];
 if(gate==="MET"||gate==="COMMONS"||gate==="CLEVELAND")
   assert((accepted.has(row.id)&&row.reviewGate==="APPROVED"||
    legacy.has(row.id)&&row.reviewGate==="LEGACY_FIVE_PRESERVED")&&!rejected.has(row.id),
    "Unreviewed or rejected work must not be fetched");
 if(row.reviewGate==="EXCLUDED")assert(rejected.has(row.id));
 assert.equal(row.verifiedImageForRelease,undefined,"No release assertions in source intake");
}
assert(intake.policy.noAutomaticPublication&&intake.policy.skipExcluded&&intake.policy.noPermissionRequests);
const png=Buffer.alloc(24);Buffer.from("89504e470d0a1a0a","hex").copy(png);png.writeUInt32BE(2500,16);png.writeUInt32BE(1800,20);
assert.deepEqual(parseImageDimensions(png,"image/png"),{width:2500,height:1800});
assert.throws(()=>parseImageDimensions(Buffer.from("notimage"),"image/jpeg"));
const script=readFileSync(new URL("../tools/calendar/acquire-sacred-art-bulk.mjs",import.meta.url),"utf8");
assert(!script.includes("git push")&&!script.includes("assets/approved/sacred-art/"),
 "Bulk script cannot commit or deploy verified masters");
assert(script.includes("sourceClaimsAreNotRightsEvidence:true"));
assert(script.includes("MET_SOURCE_WRONG_PHYSICAL_WORK")&&script.includes("Exact museum accession mismatch"),"Met cannot stage an object where title and artist both disagree");
assert(script.includes("phoneQaApproved:false"));
console.log("PASS Sacred Art: 451 original records / ten 50-work shards / 103 distinct exact-source candidates; 31 Prado-source holds; 68 rejects and 199 holds; zero released");
