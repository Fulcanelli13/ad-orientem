import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas,renderBibleAtlasToString,ATLAS_GEO} from "../src/find/bible-atlas.js";
import {ATLAS_READING_CHAPTERS,atlasReadingChapters,renderAtlasReadingContents} from "../src/find/bible-atlas-reading-chapters.js";
import {parseScriptureContext} from "../src/scripture/context.js";
const places=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
const stops=buildBibleAtlas(places.entries),chapters=atlasReadingChapters(stops);
assert.equal(stops.length,151);
assert.equal(chapters.length,37,"37 non-overlapping source-based Scripture reading groups");
assert.equal(ATLAS_READING_CHAPTERS.length,37);
assert.equal(chapters.reduce((sum,ch)=>sum+ch.count,0),151);
assert.equal(new Set(chapters.flatMap(ch=>ch.eventKeys)).size,151);
assert.deepEqual(chapters.flatMap(ch=>ch.eventKeys),stops.map(s=>s.eventKey),
 "Every Scripture milestone is used exactly once in exact original order");
assert.equal(chapters[0].start,0);
assert.equal(chapters.at(-1).end,150);
for(const ch of chapters){
 assert.match(ch.id,/^reading-chapter:/);
 assert.ok(ch.title_en&&ch.title_fr&&ch.title_en!==ch.title_fr);
 assert.equal(ch.count,ch.end-ch.start+1);
 assert.equal(stops[ch.start].era,ch.era);
 for(let i=ch.start;i<=ch.end;i++){
  assert.equal(stops[i].era,ch.era);
  assert.ok(parseScriptureContext(stops[i].reference),"Must retain original Scripture entry "+i);
 }
}
const eraButtons=[...new Set(chapters.map(c=>c.era))];
assert.equal(eraButtons.length,11);
const en=renderBibleAtlasToString({atlasStops:stops,atlasIndex:0,language:"en",cinematicPreview:true,historicalPreview:true});
const fr=renderBibleAtlasToString({atlasStops:stops,atlasIndex:0,language:"fr",cinematicPreview:true,historicalPreview:true});
assert.match(en,/data-bible-reading-toggle/);
assert.match(en,/Stories · 37/);
assert.match(fr,/Récits · 37/);
assert.match(fr,/Bible intégrale/);
assert.match(en,/not an abridged or complete Bible/);
assert.match(en,/data-bible-reading-panel hidden/);
assert.equal((en.match(/data-bible-reading-start="/g)||[]).length,37);
assert.equal((en.match(/data-bible-step="/g)||[]).length,151);
assert.equal((en.match(/data-bible-chapter="/g)||[]).length,11);
assert.equal((en.match(/data-bible-map/g)||[]).length,1);
assert.match(en,/data-ao-scripture-context/);
assert.match(fr,/data-ao-scripture-context/);
assert.match(en,/data-bible-reading-start="0" data-bible-reading-end="2" aria-pressed="true"/);
const active=renderAtlasReadingContents(stops,[], "en",18);
assert.match(active,/data-bible-reading-start="18" data-bible-reading-end="20" aria-pressed="true"/);
const reordered=[...stops];[reordered[0],reordered[1]]=[reordered[1],reordered[0]];
assert.deepEqual(atlasReadingChapters(reordered),[],
 "Reject non-source ordering instead of silently mixing passages");
const missing=stops.slice(1);assert.deepEqual(atlasReadingChapters(missing),[]);
const repeated=[...stops];repeated[19]=repeated[18];assert.deepEqual(atlasReadingChapters(repeated),[]);
assert.deepEqual(atlasReadingChapters([]),[]);
assert.deepEqual(atlasReadingChapters(null),[]);
assert.ok(stops.every(x=>!x.geo||Object.values(ATLAS_GEO).some(y=>y.key===x.geo.key&&y.lat===x.geo.lat&&y.lng===x.geo.lng)));
const plain=renderBibleAtlasToString({atlasStops:stops,atlasIndex:0,language:"en"});
assert.doesNotMatch(plain,/data-bible-reading-toggle/);
assert.doesNotMatch(plain,/data-bible-reading-panel/);
console.log("PASS 37 bilingual small Scripture reading groups exactly partition canonical 151 events, preserve one map/reader and fail closed");
