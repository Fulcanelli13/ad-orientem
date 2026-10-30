import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const get=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const frozen=get("data/research/sacred-art-user-frozen-decisions-20261017.v1.json");
const exclusions=get("data/research/sacred-art-29-photograph-identity-exceptions-20261021.v1.json");
const research=get("data/research/sacred-art-open-source-recovery-76-20261020.v1.json");
const certified=get("data/calendar/sacred-art-certified-media.v1.json");
assert.equal(exclusions.schema,"AO_SACRED_ART_29_PHOTOGRAPH_IDENTITY_EXCEPTIONS_V1");
assert.equal(exclusions.quarantinedPhotoFiles.length,5);
assert.equal(exclusions.newlyResolvedPhysicalObjects.length,1);
assert.equal(exclusions.quarantinedPhotoFiles.filter(x=>x.alternativeResearchCandidate).length,4);
const approved=new Set([...frozen.approved.map(x=>x.artworkId),...frozen.historicallyFiveIDsPreservedSeparately]);
const rejected=new Set(frozen.rejected.map(x=>x.artworkId));
assert(exclusions.quarantinedPhotoFiles.every(x=>approved.has(x.artworkId)&&!rejected.has(x.artworkId)));
for(const row of exclusions.quarantinedPhotoFiles){
 assert(row.definitiveSourcePhotoExclusion && row.approvedArtworkDecisionUnchanged && row.correctedFileIsNotProductionRelease);
 assert(row.candidateFilePage.startsWith("https://commons.wikimedia.org/wiki/File:"));
 assert(!/(museodelprado|(?:^|[^a-z])prado(?:[^a-z]|$))/i.test(JSON.stringify(row)));
 assert(research.records.some(x=>x.artworkId===row.artworkId&&x.title===row.title));
 if(row.alternativeResearchCandidate)assert(!row.alternativeResearchCandidate.productionEligible);
}
assert(exclusions.quarantinedPhotoFiles.some(x=>x.title==="The Guardian Angel"&&x.quarantineReason==="ARCHITECTURE_PHOTO_WRONG_SUBJECT"));
assert(exclusions.quarantinedPhotoFiles.some(x=>x.title==="Saint Francis in Meditation (1639)"&&x.expectedPhysicalObject==="NG5655"));
assert.equal(exclusions.newlyResolvedPhysicalObjects[0].accession,"297");
assert.equal(exclusions.newlyResolvedPhysicalObjects[0].productionEligible,false);
assert.deepEqual(certified.media,[]);
const shortlist=readFileSync(new URL("../tools/calendar/build-sacred-art-34-batch-shortlist.mjs",import.meta.url),"utf8");
assert(shortlist.includes("REJECTED_CONFIRMED_WRONG_PHOTO")&&shortlist.includes("blockedPhotoURLs"));
console.log("PASS Sacred Art: five wrong photo sources excluded, four replacements held, KMSKA 297 research-only, zero production releases");
