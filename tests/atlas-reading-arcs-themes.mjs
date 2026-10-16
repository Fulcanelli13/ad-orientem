import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas,renderBibleAtlasToString} from "../src/find/bible-atlas.js";
import {atlasReadingChapters} from "../src/find/bible-atlas-reading-chapters.js";
import {ATLAS_JOURNEY_ARCS,ATLAS_JOURNEY_THEMES,atlasJourneyIndex,renderAtlasJourneyViews} from "../src/find/bible-atlas-journeys.js";
const places=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
const stops=buildBibleAtlas(places.entries),chapters=atlasReadingChapters(stops),data=atlasJourneyIndex(stops,chapters);
assert.equal(stops.length,151);
assert.equal(chapters.length,37);
assert.equal(ATLAS_JOURNEY_ARCS.length,10);
assert.equal(ATLAS_JOURNEY_THEMES.length,9);
assert.ok(data);
assert.equal(data.arcs.length,10);
assert.equal(data.themes.length,9);
assert.equal(data.arcs[0].id,"arc:salvation-history");
assert.deepEqual(data.arcs[0].chapters.flatMap(ch=>ch.eventKeys),stops.map(s=>s.eventKey));
assert.equal(new Set(data.arcs.map(x=>x.id)).size,10);
assert.equal(new Set(data.themes.map(x=>x.id)).size,9);
for(const arc of data.arcs){
 assert.ok(arc.title_en&&arc.title_fr&&arc.eraKeys.length);
 assert.ok(arc.chapters.every(ch=>arc.eraKeys.includes(ch.era)));
 assert.ok(arc.chapters.every(ch=>stops[ch.start].eventKey===ch.eventKeys[0]));
}
const expectedMatches=[3,6,4,4,16,8,0,5,5];
assert.deepEqual(data.themes.map(t=>t.indices.length),expectedMatches);
for(const t of data.themes){
 assert.ok(t.title_en&&t.title_fr);
 assert.equal(t.unreviewed,true);
 assert.deepEqual(t.eventKeys.map(key=>stops.findIndex(s=>s.eventKey===key)),t.indices);
 for(let i=1;i<t.indices.length;i++)assert.ok(t.indices[i]>t.indices[i-1]);
}
const kingdom=data.themes.find(t=>t.id==="theme:kingdom-and-mercy");
assert.ok(kingdom);
assert.equal(kingdom.indices.length,0,"Do not invent theological links for unverified theme");
const en=renderBibleAtlasToString({atlasStops:stops,atlasIndex:0,language:"en",cinematicPreview:true,historicalPreview:true});
const fr=renderBibleAtlasToString({atlasStops:stops,atlasIndex:0,language:"fr",cinematicPreview:true,historicalPreview:true});
for(const html of [en,fr]){
 assert.equal((html.match(/data-bible-reading-tab=/g)||[]).length,3);
 assert.equal((html.match(/data-bible-arc=/g)||[]).length,10);
 assert.equal((html.match(/data-bible-theme=/g)||[]).length,9);
 assert.match(html,/data-bible-reading-view="chapters"/);
 assert.match(html,/data-bible-reading-view="arcs" hidden/);
 assert.match(html,/data-bible-reading-view="themes" hidden/);
 assert.equal((html.match(/data-bible-step=/g)||[]).length,151,"Canonical timeline unchanged");
 assert.equal((html.match(/data-bible-map/g)||[]).length,1,"Still one map");
}
assert.match(en,/10 arcs/);
assert.match(en,/9 themes/);
assert.match(en,/Provisional thematic selection/);
assert.match(fr,/Parcours thématiques provisoires/);
assert.match(en,/No exact match yet/);
assert.doesNotMatch(en,/AI-authored narrative chapters/);
assert.match(en,/selected Scripture episodes/);
const plain=renderBibleAtlasToString({atlasStops:stops,atlasIndex:0,language:"en"});
assert.doesNotMatch(plain,/data-bible-reading-view=/);
assert.equal(atlasJourneyIndex([],chapters),null);
assert.equal(atlasJourneyIndex(stops,chapters.slice(1)),null);
assert.equal(atlasJourneyIndex(stops.slice(1),chapters),null);
assert.equal(renderAtlasJourneyViews(stops.slice(1),chapters),"");
console.log("PASS 10 broad Scripture arcs and 9 provisional exact-citation themes; no prose, 151 events, 37 chapters and one canonical map preserved");
