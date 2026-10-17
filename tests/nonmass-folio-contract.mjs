import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {angelusCardPlan} from "../src/pray/devotional-card-deck.js";
import {PRAY_FOLIO_VERSION,PRAY_FOLIO_CSS} from "../src/pray/folio-presentation.js";
import {selectAngelusOpeningArtwork} from "../src/pray/angelus-cinematic-policy.js";
const read=path=>readFileSync(path,"utf8");

assert.equal(PRAY_FOLIO_VERSION,"nonmass-folio-p0-v1");
const angelus=angelusCardPlan({form:"angelus"});
assert.deepEqual(angelus.map(x=>x.id),
 ["announcement","fiat","incarnation","intercession","collect"]);
assert.deepEqual(angelus.map(x=>x.unitIndices),
 [[0,1],[2,3],[4,5],[6],[7]]);
const full=angelusCardPlan({form:"angelus",historicalConclusion:true});
assert.equal(full.length,5,"Historical conclusions belong on Collect, not separate cards");
assert.deepEqual(full.at(-1).appendixIndices,[0,1,2]);
assert.deepEqual(angelus.at(-1).appendixIndices,[]);
assert.equal(angelus.find(x=>x.id==="incarnation").ritual,"profound-bow");
const regina=angelusCardPlan({form:"regina",historicalConclusion:true});
assert.equal(regina.length,4);
assert.ok(regina.every(x=>!x.appendixIndices.length));
assert.equal(selectAngelusOpeningArtwork(),null,
 "Unapproved reproductions must not appear in the prayer folio");
const deck=read("src/pray/devotional-card-deck.js");
assert.match(deck,/host\.replaceChildren\(viewport,timeline\)/,
 "Compact timeline must follow prayer in DOM reading order");
assert.match(deck,/appendixToggle\)body\.append\(appendixToggle\)/,
 "Historical conclusion toggle must live on Collect");
assert.match(deck,/installAngelusFolioArtwork\(/);
const scene=read("src/pray/devotional-cinematic.js");
const runtime=read("src/pray/presentation-runtime.js");
assert.match(scene,/aoFolioInlineGesture/);
assert.match(scene,/unit\.after\(note\)/);
assert.doesNotMatch(runtime,/showDevotionalInterlude\(/,
 "Prayer entry must not interrupt with a timed full-screen tableau");
assert.match(runtime,/anchor:paragraph/);
assert.match(PRAY_FOLIO_CSS,/--ao-liturgical-accent/);
assert.match(PRAY_FOLIO_CSS,/prefers-reduced-motion:reduce/);
assert.match(PRAY_FOLIO_CSS,/max-width:520px/);
console.log("PASS non-Mass Folio P0: Angelus/Regina 5-movement structure, inline cue, theme and art gates");
