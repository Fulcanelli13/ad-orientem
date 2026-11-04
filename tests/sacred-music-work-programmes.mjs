import assert from "node:assert/strict";
import {SACRED_MUSIC_WORKS,sacredMusicWork,sacredMusicProgramme} from "../src/mass/sacred-music-works.js";
import {readFile} from "node:fs/promises";
import {sungTextForMovement,sungTextCoverage} from "../src/mass/sacred-music-sung-texts.js";
import {SHARED_REQUIEM_TEXT_UNITS,sharedRequiemTextUnit,REQUIEM_TEXT_TRACK_XWALK} from "../src/mass/shared-requiem-text-units.js";
import {SACRED_MUSIC_TEXT_PLANS} from "../src/mass/sacred-music-sung-texts.js";
assert.equal(SACRED_MUSIC_WORKS.length,4,"Four curated work families");
const counts={"faure-requiem-op48":7,"durufle-requiem-op9":9,
  "mozart-requiem-k626":14,"palestrina-missa-pro-defunctis":4};
for(const work of SACRED_MUSIC_WORKS){
 assert.equal(work.movements.length,counts[work.id],work.id+" movement count");
 assert.ok(work.sources.length&&work.sources.every(x=>x.startsWith("https://")),"Source links missing");
 assert.ok(work.rights.includes("METADATA_ONLY")||work.rights.includes("METADATA_AND_ORIGINAL_COMMENTARY_ONLY"),
   "No recording or score clearance claimed");
 const ids=new Set(work.movements.map(x=>x.id));
 assert.equal(ids.size,work.movements.length,"Movement identifiers must be unique");
 for(const m of work.movements){
  assert.ok(m.title&&m.role&&m.explanation.en&&m.explanation.fr,
    work.id+" missing EN/FR movement");
 }
 const concert=sacredMusicProgramme(work.id,{mode:"CONCERT"});
 assert.equal(concert.mode,"CONCERT");
 assert.match(concert.scope,/not a Mass/);
 const mass=sacredMusicProgramme(work.id,{mode:"MASS",language:"fr"});
 assert.equal(mass.mode,"MASS");assert.match(mass.scope,/1962/);
 assert.equal(mass.movements.length,work.movements.length);
}
const faure=sacredMusicWork("faure-requiem-op48");
assert.deepEqual(faure.movements.map(x=>x.title),[
 "Introit et Kyrie","Offertoire","Sanctus","Pie Jesu",
 "Agnus Dei","Libera me","In paradisum"]);
assert.equal(faure.movements[3].role,"DIES_IRAE_EXCERPT",
 "Pie Jesu must not replace the 1962 sequence");
assert.equal(faure.movements[5].role,"ABSOLUTION_IF_CELEBRATED");
assert.equal(faure.movements[6].role,"FUNERAL_PROCESSION_IF_CELEBRATED");
assert.equal(faure.movements[2].role,"SANCTUS");
assert.ok(!faure.movements.some(x=>x.role==="BENEDICTUS"),"No invented Fauré Benedictus");
const durufle=sacredMusicWork("durufle-requiem-op9");
assert.match(durufle.rights,/COPYRIGHTED/,"Post-1947 score may not be assumed available");
const faureCoverage=sungTextCoverage("faure-requiem-op48",faure.movements.map(m=>m.id));
assert.deepEqual({total:faureCoverage.total,complete:faureCoverage.complete},{total:7,complete:7},"Full Fauré lyrics");
let totalPairs=0;
for(const m of faure.movements){
 const text=sungTextForMovement(faure.id,m.id);
 assert.ok(text,"No lyrics for "+m.title);
 for(const line of text.lines){assert.ok(line.latin&&line.en&&line.fr,"Untranslated verse "+m.title);totalPairs++;}
}
assert.equal(totalPairs,60,"All Latin-translation pairs must be preserved");
assert.equal(Object.keys(SHARED_REQUIEM_TEXT_UNITS).length,48,
  "60 sung uses share 48 distinct canonical text+translation units");
const plan=SACRED_MUSIC_TEXT_PLANS[faure.id];
assert.equal(plan.length,7,"All Fauré movements need source-linked sequences");
const references=plan.flatMap(m=>m.textIds);
assert.equal(references.length,60);
assert.equal(new Set(references).size,48,"Repeated lines must point to the SAME registry unit");
for(const id of references){
 const line=sharedRequiemTextUnit(id);
 assert.ok(line?.latin&&line.en&&line.fr,"Missing shared text "+id);
}
assert.equal(REQUIEM_TEXT_TRACK_XWALK.PIE_JESU_SEQUENCE_EXCERPT,null,
  "Fauré Pie Jesu alone must never stand in for a full sung Dies irae");
assert.equal(REQUIEM_TEXT_TRACK_XWALK.ABSOLUTION_RESPONSORY,null,
  "An optional Absolution cannot silently become part of Mass Ordinary");
assert.equal(REQUIEM_TEXT_TRACK_XWALK.FUNERAL_PROCESSION,null,
  "In paradisum is not an automatic All Souls Mass Schola cue");
assert.match(sungTextForMovement(faure.id,faure.movements[5].id).lines.at(-1).latin,/judicare/);
assert.equal(sungTextForMovement("durufle-requiem-op9","durufle-requiem-op9-1"),null,"No unverified replacement words");
assert.equal(sacredMusicWork("not-a-work"),null);
assert.equal(sacredMusicProgramme("not-a-work"),null);
const html=await readFile(new URL("../sacred-music.html",import.meta.url),"utf8");
const dom=await readFile(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
const build=await readFile(new URL("../tools/build-web-preview.mjs",import.meta.url),"utf8");
assert.match(html,/src\/mass\/sacred-music-guide\.js/,"Guide must be a working module");
const guide=await readFile(new URL("../src/mass/sacred-music-guide.js",import.meta.url),"utf8");
assert.match(guide,/sungTextForMovement/);
assert.match(guide,/aoMusicVersePair/);
assert.match(dom,/data-sacred-music-library/,"Live Schola needs a discoverable guide link");
assert.match(build,/"sacred-music\.html"/,"Ship the standalone guide with production");
assert.doesNotMatch(html,/<audio|<video|\.mp3|\.ogg/,"No recordings or score files");
console.log("PASS 4 curated works / 34 movements; independent Mass-vs-concert and rights boundaries");
