import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas,atlasCinemaChapters,atlasCinemaPlate,renderBibleAtlasToString}
 from "../src/find/bible-atlas.js";
import {parseScriptureContext} from "../src/scripture/context.js";
const corpus=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
const stops=buildBibleAtlas(corpus.entries),chapters=atlasCinemaChapters(stops);
assert.equal(stops.length,151);
assert.equal(chapters.length,11);
assert.equal(chapters[0].index,0);
assert.equal(chapters[0].era,"ORIGINS");
assert.equal(chapters.at(-1).era,"REVELATION");
assert.ok(chapters.every(c=>stops[c.index].era===c.era));
assert.deepEqual(chapters.map(c=>c.index),chapters.map(c=>stops.find(x=>x.era===c.era).index));
assert.ok(stops.every(s=>s.eventKey&&parseScriptureContext(s.reference)));
const preview=renderBibleAtlasToString({
 atlasStops:stops,atlasIndex:0,language:"en",cinematicPreview:true,
 cinemaFollow:true,cinemaSheetExpanded:false
});
const ordinary=renderBibleAtlasToString({
 atlasStops:stops,atlasIndex:0,language:"en"
});
assert.equal((preview.match(/ data-bible-step="/g)||[]).length,151);
assert.equal((preview.match(/ data-bible-chapter="/g)||[]).length,11);
assert.equal((preview.match(/data-bible-map/g)||[]).length,1);
assert.match(preview,/data-bible-cinematic="review"/);
assert.match(preview,/data-bible-sheet="collapsed"/);
assert.match(preview,/data-bible-sheet-toggle aria-expanded="false"/);
assert.match(preview,/data-bible-follow[^>]+aria-pressed="true"/);
assert.match(preview,/data-ao-scripture-context/);
assert.doesNotMatch(ordinary,/data-bible-chapter="/);
assert.doesNotMatch(ordinary,/data-bible-sheet-toggle/);
assert.doesNotMatch(ordinary,/data-bible-cinematic="review"/);
assert.equal((ordinary.match(/ data-bible-step="/g)||[]).length,151);
assert.match(atlasCinemaPlate("PATRIARCHS","fr"),/Les Patriarches/);
assert.match(atlasCinemaPlate("PATRIARCHS","en"),/data-bible-chapter-dismiss/);
assert.equal(atlasCinemaPlate("NONEXISTENT","en"),"");
const unlocated=stops.find(s=>s.reference==="Acts 27:13–44");
assert.ok(unlocated&&!unlocated.geo,"no fabricated shipwreck point");
assert.ok(preview.includes("SCRIPTURE BEFORE GEOGRAPHY"));
const other=renderBibleAtlasToString({
 atlasStops:stops,atlasIndex:unlocated.index,language:"fr",
 cinematicPreview:true,cinemaFollow:false,cinemaSheetExpanded:true
});
assert.match(other,/data-bible-sheet="expanded"/);
assert.match(other,/data-bible-follow[^>]+aria-pressed="false"/);
assert.match(other,/data-ao-scripture-context="Acts 27:13–44"/);
assert.equal((other.match(/ data-bible-step="/g)||[]).length,151);
assert.equal(new Set(stops.map(s=>s.eventKey)).size,151);
console.log("PASS opt-in cinematic 151-source chapters, no duplicate timelines, canonical Scripture, no ungrounded pins");
