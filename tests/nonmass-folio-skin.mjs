import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {angelusCardPlan} from "../src/pray/devotional-card-deck.js";
import {NONMASS_FOLIO_VERSION,NONMASS_FOLIO_CSS} from "../src/pray/folio-presentation.js";
const entry=readFileSync("src/pray/browser-entry.js","utf8");
const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
assert.equal(NONMASS_FOLIO_VERSION,"nonmass-folio-p0-reconciled-v1");
assert.deepEqual(angelusCardPlan({form:"angelus"}).map(x=>x.id),
 ["announcement","fiat","incarnation","intercession","collect"]);
assert.deepEqual(angelusCardPlan({form:"regina"}).map(x=>x.id),
 ["rejoice","resurrection","intercession","collect"]);
assert.match(entry,/await import\("\.\/folio-presentation\.js"\)/);
assert.match(NONMASS_FOLIO_CSS,/--ao-liturgical-accent/);
assert.match(NONMASS_FOLIO_CSS,/prefers-reduced-motion:reduce/);
assert.match(NONMASS_FOLIO_CSS,/max-width:520px/);
assert.match(NONMASS_FOLIO_CSS,/\.aoDevoDeck/);
assert.match(runtime,/angelusCommunalParts/);
assert.match(runtime,/aoFolioIncarnationCue/);
assert.match(runtime,/angelusGuided/);
assert.doesNotMatch(NONMASS_FOLIO_CSS,/position:fixed;\s*inset:0/);
console.log("PASS Folio P0 shared skin reuses current main's Angelus owner, recitation and guided modes");
