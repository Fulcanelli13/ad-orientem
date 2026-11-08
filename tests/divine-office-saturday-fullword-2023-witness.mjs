// Complete 2023 print/Divinum-Officium comparison, not the original 1961
// printed Psalterium. Strictly source-only and entirely excluded from Pages.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const witness=read("../data/office/research/compline-saturday-printed-2023-fullword-witness.v1.json");
const pinned=read("./fixtures/office/advent-i-saturday-compline-la.json");
const tokenize=s=>String(s).toLowerCase().replaceAll("æ","ae").replaceAll("œ","oe")
 .normalize("NFD").replace(/[\u0300-\u036f]/gu,"").match(/[a-z]+/gu)||[];
test("all 473 Latin Psalm words agree with the independent 2023 print except three documented orthographies",()=>{
 assert.equal(witness.review.privateOnly,true);
 assert.equal(witness.review.independentOriginal1961Leaf,false);
 assert.equal(witness.review.original1961VerbatimCollated,false);
 assert.equal(witness.review.wholeHourCertified,false);
 assert.equal(witness.review.rightsApproved,false);
 assert.equal(witness.review.publicReleaseApproved,false);
 assert.equal(witness.document.printedPages,"177–179");
 let words=0,stichs=0;
 const actualVariants=[];
 for(const psalm of [87,102]){
  const printed=witness.printedLatin[psalm];
  const sourceRows=pinned.psalms[psalm].trim().split(/\r?\n/u);
  assert.equal(printed.length,witness.review.psalmWindows[psalm]);
  assert.equal(sourceRows.length,printed.length);
  const sourceTokens=tokenize(sourceRows.map(line=>
   line.replace(/^\d+:\d+\s+/u,"").replaceAll("*","")).join(" "));
  const printedTokens=tokenize(printed.join(" "));
  assert.equal(sourceTokens.length,printedTokens.length,
   "Printed/source Latin word count changed: Psalm "+psalm);
  for(let i=0;i<sourceTokens.length;i++)
   if(sourceTokens[i]!==printedTokens[i])
    actualVariants.push({psalm,pinned:sourceTokens[i],printed:printedTokens[i]});
  stichs+=sourceRows.length;words+=sourceTokens.length;
 }
 assert.equal(stichs,41);
 assert.equal(words,witness.review.wordCount);
 assert.equal(words,473);
 assert.deepEqual(actualVariants,witness.orthographicVariants.map(v=>({
  psalm:v.psalm,pinned:tokenize(v.pinned).join(""),printed:tokenize(v.printed).join("")
 })),"No new, removed or substituted Latin word may be silently accepted");
});
test("traditional Vulgate release is separate from unverified exact 1961 edition",()=>{
 const source=readFileSync(new URL("../src/office/latin-compline-public-release.js",import.meta.url),"utf8");
 assert.match(source,/psalter1961VerbatimCollated:false/u);
 assert.match(source,/exact1961EditionPsalterLeafVerified:false/u);
 for(const flag of ["printedVulgatePatternDualWitnessCollated","completeHourCollated","rightsApproved","publicReleaseApproved"])
  assert.match(source,new RegExp(flag+":true"),"Narrow Latin release approval missing: "+flag);
 const build=readFileSync(new URL("../tools/build-web-preview.mjs",import.meta.url),"utf8");
 assert.match(build,/data\/office\/research/,"Private witness files must be excluded from public Pages");
});
