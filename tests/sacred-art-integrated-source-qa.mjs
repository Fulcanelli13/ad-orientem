import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolutionTier,summarizeSourceRows} from "../tools/calendar/audit-staged-sacred-art-media.mjs";
import {hasPradoProvenance} from "../tools/calendar/sacred-art-source-policy.mjs";
assert.equal(resolutionTier(3000,2400),"HIGH_RESOLUTION");
assert.equal(resolutionTier(3200,1700),"MEDIUM_RESOLUTION");
assert.equal(resolutionTier(1276,1632),"LOW_RESOLUTION");
const rows=[
 {artworkId:"A",image:{sha256:"a".repeat(64),resolutionTier:"HIGH_RESOLUTION"}},
 {artworkId:"B",image:{sha256:"a".repeat(64),resolutionTier:"HIGH_RESOLUTION"}},
 {artworkId:"C",image:{sha256:"b".repeat(64),resolutionTier:"LOW_RESOLUTION"}}
];
const s=summarizeSourceRows(rows);
assert.equal(s.technicalFiles,3);
assert.equal(s.distinctImageBytes,2);
assert.equal(s.exactDuplicatePhotoGroups.length,1);
assert.deepEqual(s.exactDuplicatePhotoGroups[0].artworkIds,["A","B"]);
assert.equal(s.lowResolution,1);
assert.equal(s.highResolution,2);
assert.equal(s.productionReleased,0);
assert.equal(s.photoRightsIndependentlyCertified,0);
assert(hasPradoProvenance({sourceUrl:"https://commons.wikimedia.org/wiki/File:Museo_del_Prado.jpg"}));
const certified=JSON.parse(readFileSync(new URL("../data/calendar/sacred-art-certified-media.v1.json",import.meta.url)));
assert.deepEqual(certified.media,[],"No source technical audit may release any images");
const src=readFileSync(new URL("../tools/calendar/audit-staged-sacred-art-media.mjs",import.meta.url),"utf8");
assert(!src.includes("git push")&&!src.includes("contents: write"));
assert(src.includes("createHash")&&src.includes("readFileSync(file)"));
assert(src.includes("exactOriginalIndependentlyVerified:false")&&src.includes("productionCertified:false"));
console.log("PASS integrated source-image QA contract (fixture counts only; see current-run manifest for total); hash duplicates, photo rights, resolution and embargo remain fail-closed");
