import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const p = JSON.parse(readFileSync(
  new URL('../data/artwork/research/m2m-st-peter-alcantara-ribera-alternative-20261110.v1.json',import.meta.url),'utf8'));
assert.equal(p.status,'RESEARCH_ALTERNATIVE_NOT_OWNER_SELECTED_OR_PUBLISHED');
assert.equal(p.originalPlacement.date,'2026-10-19');
assert.equal(p.originalPlacement.artworkKey,'Walters:37.1146');
assert.equal(p.originalPlacement.originalRemainsSelectedOrHeld,true);
const c=p.candidate;
assert.equal(c.key,'Pinakothek:909');
assert.equal(c.inventory,'909');
assert.equal(c.artist,'Jusepe de Ribera');
assert.equal(c.firstPartyLicence,'CC_BY_SA_4_0');
assert.equal(c.sourceImageStatus,'OFFICIAL_COLLECTION_COLOUR_IMAGE_VISUALLY_EXAMINED_DOWNLOAD_BYTES_NOT_VERIFIED');
assert.equal(c.ownerApprovedPlacement,false);
assert.equal(c.productionEligible,false);
assert.equal(c.originalBytesAcquired,false);
assert.equal(c.photoSha256,null);
assert.equal(c.formalMobileCropQAPass,false);
assert.equal(p.sourceIntegrity.pradoPhotoBanUnchanged,true);
console.log('PASS: licensed Ribera research alternative is distinct from Walters selection; source bytes and owner approval still pending');
