import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {triageExcerptPositions,excerptPosition} from "../tools/mass/triage-gr1961-first200-excerpt-positions.mjs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const saved=JSON.parse(read("data/mass/chant-corpus/gr1961-first200-excerpt-position.v1.json"));
const produced=triageExcerptPositions(
 JSON.parse(read("data/mass/chant-corpus/gr1961-first200-source-review.v1.json")),
 JSON.parse(read("data/mass/chant-corpus/gr1961-first200-latin-witness-screen.v1.json")),
 {reportBlobSha:saved.reportBlobSha,witnessBlobSha:saved.witnessBlobSha});
assert.equal(read("data/mass/chant-corpus/gr1961-first200-excerpt-position.v1.json"),JSON.stringify(produced,null,2)+"\n");
assert.deepEqual(produced.summary,{records:46,occurrences:61,excerptInitial:37,verseMarkedInitial:14,embedded:10,anyInitial:43,embeddedOnly:3,mixed:1,certifiedProper:0,promoted:0});
assert.deepEqual(produced.records.filter(x=>x.disposition==="EMBEDDED_ONLY").map(x=>x.id),["GREGOBASE-63","GREGOBASE-124","GREGOBASE-134"]);
assert.equal(produced.records.find(x=>x.id==="GREGOBASE-13").disposition,"MIXED");
assert.equal(excerptPosition({incipit:"Ad te levavi",latinExcerpt:"v. Ad te levávi ánimam meam"}),"VERSE_MARKED_INITIAL");
assert.equal(excerptPosition({incipit:"Cor meum",latinExcerpt:"Parátum cor meum"}),"EMBEDDED");
assert.throws(()=>excerptPosition({incipit:"Cor meum",latinExcerpt:"No match"}),/No incipit/);
assert.ok(produced.records.every(x=>x.canonical1962Proper==="NOT_VERIFIED"&&x.release==="NONE"));
for(const file of ["src/mass/reader-dom.js","src/mass/reader-chant-score-pilot.js"])
 assert.doesNotMatch(read(file),/gr1961-first200-excerpt-position/);
console.log("PASS first-200 excerpt-position triage; no mass-reader promotions");
