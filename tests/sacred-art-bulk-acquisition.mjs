import assert from "node:assert/strict";
import {hasPradoProvenance,commonsMetadataHasPradoProvenance,PRADO_SOURCE_HOLD} from "../tools/calendar/sacred-art-source-policy.mjs";
import {readFileSync} from "node:fs";
import {BATCH_SIZE,makeBatches,sourceGate,parseImageDimensions,commonsLicenseUsable} from "../tools/calendar/acquire-sacred-art-bulk.mjs";
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
assert.equal(intake.counts.eligibleExactMet,23);
assert.equal(intake.counts.eligibleExactCommons,35);
assert.equal(intake.counts.eligibleExactCleveland,14);
assert.equal(intake.counts.eligibleOtherSource,81);
assert.equal(intake.counts.eligibleExactNga,6);
assert.equal(intake.counts.pradoAcquisitionHolds,30);
assert.equal(intake.counts.pradoHoldsApprovedOrHistoric,25);
assert.deepEqual(certified.media,[],"Bulk ingestion cannot silently certify release files");
assert.equal(commonsLicenseUsable("CC BY-SA 4.0","True"),true,"Attribution/share-alike allows technical staging");
assert.equal(commonsLicenseUsable("CC BY 3.0","True"),true,"Copyrighted CC-licensed file may be staged");
assert.equal(commonsLicenseUsable("Public domain","False"),true);
assert.equal(commonsLicenseUsable("Public domain","True"),false,"Conflicting public-domain claim is held");
assert.equal(commonsLicenseUsable("All rights reserved","True"),false);
const accepted=new Set(freeze.approved.map(x=>x.artworkId));
const rejected=new Set(freeze.rejected.map(x=>x.artworkId));
const legacy=new Set(freeze.historicallyFiveIDsPreservedSeparately);
const statuses=intake.works.map(x=>sourceGate(x));
assert(hasPradoProvenance({sourceUrl:"https://www.museodelprado.es/en/the-collection/art-work/example"}));
assert(hasPradoProvenance({id:"prado-rubens-p001647",sourceUrl:"https://commons.wikimedia.org/wiki/File:Mirror.jpg"}));
assert(commonsMetadataHasPradoProvenance({Credit:{value:'<a href="https://www.museodelprado.es">Museo del Prado</a>'}}));
assert.equal(commonsMetadataHasPradoProvenance({Credit:{value:"National Gallery of Art"}}),false);
assert.equal(sourceGate({...intake.works.find(x=>x.provider==="MET_OPEN_ACCESS_CANDIDATE"),sourcePolicy:{status:PRADO_SOURCE_HOLD}}),PRADO_SOURCE_HOLD);
assert(intake.works.every((x,i)=>!(hasPradoProvenance(x)&&statuses[i]!==PRADO_SOURCE_HOLD)),"No Prado original can enter an acquisition shard");
assert.equal(statuses.filter(x=>x==="MET").length,23);
assert.equal(statuses.filter(x=>x==="COMMONS").length,35);
assert.equal(statuses.filter(x=>x==="CLEVELAND").length,14);
assert.equal(statuses.filter(x=>x==="HOLD_REJECTED").length,68);
assert.equal(statuses.filter(x=>x==="HOLD_NOT_APPROVED").length,194);
assert.equal(statuses.filter(x=>x==="HOLD_NO_AUTHORIZED_SOURCE").length,87);
assert.equal(statuses.filter(x=>x===PRADO_SOURCE_HOLD).length,30);
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
assert(script.includes("phoneQaApproved:false"));
console.log("PASS Sacred Art: 451 original records / ten 50-work shards / 72 exact-source candidates; 30 Prado-source holds; 68 rejects and 199 holds; zero released");
