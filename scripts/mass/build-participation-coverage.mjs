// Run: node scripts/mass/build-participation-coverage.mjs
// Regenerate the source-anchored Mass participation coverage snapshot; no
// publication of any GABC, no manuscript/music promotion, no Mass card edits.
import {writeFile} from "node:fs/promises";
import {buildParticipationCoverage} from "../../src/mass/reader-participation-coverage.js";
const target=new URL("../../data/mass/participation-20-event-coverage.v1.json",import.meta.url);
const inventory=buildParticipationCoverage();
if(inventory.counts.events!==20||inventory.counts.uniqueCueIds!==23)
 throw Error("CANONICAL_PARTICIPATION_CUES_CHANGED__REVIEW_BEFORE_REGENERATING");
await writeFile(target,JSON.stringify(inventory,null,2)+"\n","utf8");
console.log("Participation inventory",JSON.stringify(inventory.counts));
