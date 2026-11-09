import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../src/app/source-transport-compat.js";
import {reviewChristmas2026ComplineResearch}
 from "../src/office/compline-christmas-2026-research-gate.js";

const UPSTREAM_GIT_BLOB_SHA="bf44a58ba1076b17466b88fa4004c1cab29f96ae";
const UPSTREAM_PATH="web/www/horas/Latin/Psalterium/Mariaant.txt";
const ORIGINAL_PIN="126a07f91ede04664108abb6fb20ace3f4de14b9";
const raw=readFileSync(new URL(
 "../data/office/research/christmas-2026-marian-latin-pinned-source.txt",
 import.meta.url),"utf8");
const advent=raw.slice(raw.indexOf("[Advent]"),raw.indexOf("[Nativiti]"));
const christmas=raw.slice(raw.indexOf("[Nativiti]"),raw.indexOf("[Quadragesimae]"));
const ledger=JSON.parse(readFileSync(new URL(
 "../data/office/research/compline-christmas-21-27-dec-2026-source-intake.v1.json",
 import.meta.url),"utf8"));

test("exact pinned upstream Latin Marian source byte snapshot, not fabricated 1961 printed collation",()=>{
 const gitBlob=createHash("sha1").update("blob "+Buffer.byteLength(raw,"utf8")+"\\0")
  .update(raw,"utf8").digest("hex");
 assert.equal(PIN,ORIGINAL_PIN);
 assert.equal(gitBlob,UPSTREAM_GIT_BLOB_SHA,
  "File must be byte-identical to "+UPSTREAM_PATH+" at pinned commit");
 assert.equal(ledger.sourceFacsimileMame1961Certified,false);
 assert.equal(ledger.newLatinTextCollated,false);
 const licence=readFileSync(new URL(
  "../src/office/LICENSE-DIVINUM-OFFICIUM-MIT.txt",import.meta.url),"utf8");
 assert.match(licence,/MIT License/u);
});

test("Advent Marian section retains Angelus Domini / Gratiam tuam before Christmas Eve",()=>{
 assert.ok(advent.startsWith("[Advent]"));
 assert.match(advent,/Alma Redemptóris Mater/u);
 assert.match(advent,/Ángelus Dómini nuntiávit Maríæ/u);
 assert.match(advent,/Et concépit de Spíritu Sancto/u);
 assert.match(advent,/Grátiam tuam, quǽsumus, Dómine/u);
 assert.doesNotMatch(advent,/Post partum/u);
 assert.doesNotMatch(advent,/Deus, qui salútis ætérnæ/u);
});

test("Christmas Marian section has Post partum / Deus qui salutis from 24 December evening",()=>{
 assert.ok(christmas.startsWith("[Nativiti]"));
 assert.match(christmas,/Alma Redemptóris Mater/u);
 assert.match(christmas,/Post partum, Virgo, invioláta permansísti/u);
 assert.match(christmas,/Dei Génetrix, intercéde pro nobis/u);
 assert.match(christmas,/Deus, qui salútis ætérnæ, beátæ Maríæ/u);
 assert.match(christmas,/auctórem vitæ suscípere/u);
 assert.doesNotMatch(christmas,/Ángelus Dómini/u);
 assert.doesNotMatch(christmas,/Grátiam tuam/u);
});

test("all 7 finite Christmas date hypotheses select the appropriate Marian section without public authorization",()=>{
 for(const row of ledger.dates){
  const review=reviewChristmas2026ComplineResearch({
   date:row.date,record:row
  });
  assert.equal(review.status,"DATED_ORDO_RESEARCH_ONLY_COMPLETE_HOUR_WITHHELD",
   row.date+" "+review.reason);
  const expected=row.date<"2026-12-24"?"Advent":"Nativiti";
  assert.equal(review.marianSectionResearchOnly,expected);
  assert.equal(review.marianVerseResearchOnly,
   expected==="Advent"?"Angelus Domini":"Post partum");
  assert.equal(review.published,false);
  assert.equal(review.calendarSelectionAuthorized,false);
 }
});
