import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";
const html=readFileSync(new URL("../tools/mass/kyriale-1961-collation.html",import.meta.url),"utf8");
const ledger=JSON.parse(readFileSync(new URL("../data/research/mass-music-m21-seven-print-image-parity-worklist.v1.json",import.meta.url),"utf8"));
assert.equal(ledger.scores.length,7);
assert.match(html,/<html lang="en"/);
assert.match(html,/1961 Kyriale · notation collation/);
assert.match(html,/offlineKyrialeResearchScore/);
assert.match(html,/createOfflineChantEngraver/);
assert.match(html,/reader-chant-engraver\.js/);
assert.match(html,/reader-kyriale-research-gabc\.js/);
assert.match(html,/mass-music-m21-seven-print-image-parity-worklist\.v1\.json/);
for(const id of ["printImage","engraveViewport","scoreSelect","pageSelect","pitch","neume","underlay","rhythm","reviewNotes","export"]){
 assert.match(html,new RegExp('id="'+id+'"'),"Missing required research review control: "+id);
}
assert.match(html,/URL\.createObjectURL/);
assert.match(html,/localStorage\.setItem/);
assert.match(html,/sourceUrl/);
assert.match(html,/printedPageImageUrls/);
assert.match(html,/editorialApproval:false/);
assert.match(html,/publicScoreCount:0/);
assert.match(html,/allowAutomaticPublication:false/);
assert.match(html,/allPageCategoriesMarkedMatching/);
assert.match(html,/Unreviewed/);
assert.match(html,/Matches printed page/);
assert.match(html,/Discrepancy found/);
assert.match(html,/Uncertain · hold/);
assert.doesNotMatch(html,/<script\s+src=["']https?:/i,"Research tool may never load a remote engraver");
assert.doesNotMatch(html,/new Audio|AudioContext|speechSynthesis|automatic.*(?:publish|promote)/i);
assert.ok(ledger.scores.every(s=>s.publicScore===false&&s.editorialApproval===false));
assert.equal(new Set(ledger.scores.flatMap(s=>s.printedPageImageUrls)).size,10);
for(const row of ledger.scores){
 const score=offlineKyrialeResearchScore(row.movement,row.catalogueSelection);
 assert.ok(score&&score.gabc,"Workbench source was disconnected: "+row.gregobaseId);
 assert.equal(score.scoreId,"GREGOBASE-"+row.gregobaseId);
 assert.equal(row.printedPages.length,row.printedPageImageUrls.length);
}
const publicReader=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
const sw=readFileSync(new URL("../sw.js",import.meta.url),"utf8");
assert.doesNotMatch(publicReader,/kyriale-1961-collation|data-schola-score-open/);
assert.doesNotMatch(sw,/kyriale-1961-collation/);
console.log("PASS M22 isolated 1961 Kyriale editorial workbench: printed 10-page witness + real offline SVG component, four independent notation decisions and JSON export; zero public score promotion");
