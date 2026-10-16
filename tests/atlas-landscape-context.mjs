import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas,atlasDetail,renderBibleAtlasToString} from "../src/find/bible-atlas.js";
import {ATLAS_LANDSCAPE_CONTEXT,atlasLandscapeForStop,atlasLandscapeReview}
 from "../src/find/bible-atlas-landscape-context.js";
const corpus=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
const stops=buildBibleAtlas(corpus.entries);
assert.equal(stops.length,151);
assert.deepEqual(Object.keys(ATLAS_LANDSCAPE_CONTEXT).sort(),["ephesus","miletus"]);
for(const key of ["ephesus","miletus"]){
 const source=ATLAS_LANDSCAPE_CONTEXT[key];
 assert.equal(source.key,key);
 assert.equal(source.era,"APOSTLES");
 assert.equal(source.status,"SOURCE_ATTESTED_TOPOGRAPHIC_CHANGE_NO_GEOMETRY");
 assert.ok(source.evidence_en.length>100&&source.evidence_fr.length>100);
 assert.ok(source.caveat_en.length>55&&source.caveat_fr.length>55);
 assert.ok(source.sources.length>=2);
 for(const record of source.sources){
  assert.match(record.url,/^https:\/\/(whc\.unesco\.org|doi\.org|www\.miletgrabung\.uni-hamburg\.de)\//);
  assert.ok(record.basis.length>25);
 }
 const stop=stops.find(s=>s.geo?.key===key&&s.era==="APOSTLES");
 assert.ok(stop,"Historic-landscape note must bind to an EXISTING source-scoped narrative stop "+key);
 assert.ok(stop.eventKey&&stop.reference,"Note cannot create a synthetic narrative event");
 assert.strictEqual(atlasLandscapeForStop(stop),source);
 const card=atlasLandscapeReview(stop,"en");
 assert.match(card,/data-bible-landscape="/);
 assert.ok(card.includes("rel=\"noopener noreferrer\""));
 assert.ok(card.includes(source.caveat_en.replaceAll("’","’")));
 assert.ok(card.includes(source.sources[0].url));
 const french=atlasLandscapeReview(stop,"fr");
 assert.ok(french.includes(source.caveat_fr));
 assert.ok(!french.includes(source.evidence_en));
 assert.match(french,/Ancien paysage/);
 const ordinary=atlasDetail(stop,"en");
 const reviewed=atlasDetail(stop,"en",{historicalPreview:true});
 assert.doesNotMatch(ordinary,/data-bible-landscape=/,"Default Atlas should stay unchanged");
 assert.ok(reviewed.includes("data-bible-landscape=\""+key+"\""));
 assert.ok(reviewed.includes("data-ao-scripture-context=\""+stop.reference+"\""));
 assert.ok(reviewed.includes("Map evidence"),"Canonical location provenance remains visible");
 const vm={atlasStops:stops,atlasIndex:stop.index,language:"en",cinematicPreview:true,
  cinemaFollow:true,cinemaSheetExpanded:true};
 assert.doesNotMatch(renderBibleAtlasToString({...vm,historicalPreview:false}),/data-bible-landscape=/);
 assert.match(renderBibleAtlasToString({...vm,historicalPreview:true}),new RegExp('data-bible-landscape="'+key+'"'));
 assert.doesNotMatch(renderBibleAtlasToString({...vm,historicalPreview:true,cinematicPreview:false}),/data-bible-landscape=/);
}
assert.equal(atlasLandscapeForStop({geo:{key:"ephesus"},era:"EXILE"}),null);
assert.equal(atlasLandscapeForStop({geo:{key:"none"},era:"APOSTLES"}),null);
assert.equal(atlasLandscapeForStop({era:"APOSTLES"}),null);
assert.equal(atlasLandscapeReview(null,"en"),"");
const mapSource=readFileSync(new URL("../src/find/atlas-physical-style.js",import.meta.url),"utf8");
assert.match(mapSource,/modern coastlines/i,"Modern-physical basemap warning remains authoritative");
const owner=readFileSync(new URL("../src/find/browser-entry.js",import.meta.url),"utf8");
assert.match(owner,/bibleHistoricalPreview=bibleCinemaPreview&&query\.get\("atlasHistory"\)!=="0"/);
const publicRecords=readFileSync(new URL("../data/explore/biblical-atlas-geography-phase2.research.v1.json",import.meta.url),"utf8");
assert.ok(!publicRecords.includes("ATLAS_LANDSCAPE_CONTEXT"),"Research ledger is not forked by UI rendering");
console.log("PASS Ephesus/Miletus historic coastline caveats, 151 canon, source links, bilingual detail, integrated default with explicit historical opt-out");
