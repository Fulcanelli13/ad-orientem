// Independent printed 2008 / 2023 Sunday Compline reading, 30 complete
// Vulgate stichs. Not an exact original 1961 Psalter leaf reproduction.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const witness=read("../data/office/research/compline-sunday-2008-2023-fullword-witness.v1.json");
const source=read("./fixtures/office/advent-i-week-compline-la.json");
const tokenize=s=>String(s).toLowerCase().normalize("NFD")
 .replace(/\p{M}/gu,"").replaceAll("æ","ae").replaceAll("œ","oe")
 .match(/[a-z]+/gu)||[];

test("all 329 original Latin words of Sunday Compline Psalm 4, 90, 133 agree with the full printed witness",()=>{
 assert.deepEqual(witness.scope.psalmIds,[4,90,133]);
 assert.equal(witness.sources.length,2);
 assert.ok(witness.sources.every(x=>/^https:\/\//u.test(x.url)));
 assert.equal(witness.collation.editionOriginal1961Leaf,false);
 assert.equal(witness.collation.claimExact1961PrintedEdition,false);
 assert.equal(witness.collation.translationRightsGranted,false);
 let words=0,rows=0;
 for(const [psalm,count] of [[4,10],[90,16],[133,4]]){
  const pinned=source.psalms[psalm].text.trim().split(/\r?\n/u);
  const printed=witness.printedLatin[psalm];
  assert.equal(pinned.length,count);
  assert.equal(printed.length,count);
  for(let i=0;i<count;i++){
   const original=pinned[i].replace(/^\d+:\d+[a-z]?\s+/iu,"");
   const left=tokenize(original),right=tokenize(printed[i]);
   assert.deepEqual(left,right,"Psalm "+psalm+" stich "+(i+1));
   words+=left.length;rows++;
  }
 }
 assert.equal(rows,30);
 assert.equal(words,329);
 assert.equal(words,witness.scope.wordCount);
});

test("an altered or omitted word inside a Psalm 90 stich fails full printed collation",()=>{
 const original=witness.printedLatin[90][13];
 assert.notDeepEqual(tokenize(original),tokenize(original.replace("nomen meum","meum")));
});

test("the Sunday print witness does not certify another date, language or exact 1961 Mame facsimile",()=>{
 assert.deepEqual(witness.scope.approvedDateCandidates,["2026-11-29","2026-11-30"]);
 assert.equal(witness.collation.publicReleaseByThisResearchFile,false);
 assert.equal(witness.collation.independentWitnessesChecked,2);
 assert.equal(witness.collation.semanticAlterationsPermitted,0);
 assert.equal(source.sourceRevision,witness.sourceRevision);
});
