import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(relative)=>JSON.parse(readFileSync(
 new URL(relative,import.meta.url),"utf8"));
const witness=read("../data/office/research/compline-saturday-printed-diurnale-2008-row-witness.json");
const pinned=read("./fixtures/office/advent-i-saturday-compline-la.json");
const unaccent=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/gu,"").toLowerCase();
const sourceStichs=n=>pinned.psalms[n].trim().split(/\r?\n/u);

test("independent printed 2008 1961-pattern witness checks all 41 appointed Latin stich incipits",()=>{
 assert.equal(witness.limits.privateResearchOnly,true);
 assert.equal(witness.limits.independentFull1961PrintedLeaf,false);
 assert.equal(witness.limits.editionVerbatimCertified,false);
 assert.equal(witness.limits.usableForPublicPublicationWithoutFurtherApproval,false);
 assert.match(witness.document.printedPages,/349/u);
 assert.equal(witness.psalms.length,2);
 let count=0;
 for(const printed of witness.psalms){
  const original=sourceStichs(printed.number);
  assert.equal(original.length,printed.sourceRows);
  assert.equal(printed.rows.length,original.length);
  if(printed.number===102)assert.equal(printed.divisionAfterRow,12);
  for(let i=0;i<original.length;i++){
   const source=original[i].replace(/^\d+:\d+ /u,"");
   assert.equal(source.startsWith(original[i]),false);
   assert.ok(unaccent(source).startsWith(unaccent(printed.rows[i])),
    "Printed stich incipit mismatch at Psalm "+printed.number+" row "+(i+1));
   assert.ok(source.includes("*"),"missing liturgical caesura");
   count++;
  }
 }
 assert.equal(count,41);
});
test("printed/modern spelling variation never silently earns 1961 exact-edition certification",()=>{
 const ps102=sourceStichs(102);
 assert.equal(ps102.length,22);
 assert.match(ps102[13],/homo, sicut fænum/u);
 assert.equal(witness.observedOrthographicDifferences[0].print,"fœnum");
 assert.equal(witness.observedOrthographicDifferences[0].pinned,"fænum");
 assert.match(ps102[19],/Ángeli/u);
 assert.equal(witness.observedOrthographicDifferences[1].print,"Angeli");
 const source=readFileSync(new URL("../src/office/latin-compline-public-release.js",import.meta.url),"utf8");
 assert.match(source,/psalter1961VerbatimCollated:false/u);
 assert.match(source,/exact1961EditionPsalterLeafVerified:false/u);
 assert.match(source,/printedVulgatePatternDualWitnessCollated:true/u);
 assert.match(source,/publicReleaseApproved:true/u);
});
