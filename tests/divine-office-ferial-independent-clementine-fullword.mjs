/**
 * Exact-word comparison of every Tuesday–Friday Advent I Compline psalm:
 * original pinned Divinum Officium versus a second independently transcribed
 * Clementine Vulgate edition. The latter is NOT the original Mame 1961
 * Psalter leaf. No EN/FR translation is imported or approved by this gate.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const witness=read("../data/office/research/compline-ferial-clementine-fullword-witness.v1.json");
const tuesday=read("./fixtures/office/advent-i-feria-iii-compline-la.json");
const remaining=read("./fixtures/office/advent-i-week-compline-la.json");
const source={...remaining.psalms,...tuesday.psalms};
const psalms=Object.freeze([11,12,15,33,60,69,70,76,85]);
const byDate=Object.freeze({
 "2026-12-01":Object.freeze([11,12,15]),
 "2026-12-02":Object.freeze([33,60]),
 "2026-12-03":Object.freeze([69,70]),
 "2026-12-04":Object.freeze([76,85])
});
const stichCounts=Object.freeze({11:9,12:6,15:11,33:22,60:8,69:7,70:26,76:20,85:16});

function tokens(str){
 return String(str)
  .replace(/\u009c/gu,"œ")
  .replace(/[ǽǼ]/gu,"ae")
  .replace(/[æÆ]/gu,"ae")
  .replace(/[œŒ]/gu,"oe")
  .normalize("NFD").replace(/\p{M}/gu,"")
  .toLowerCase().replaceAll("j","i").replaceAll("v","u")
  .match(/[a-z]+/gu)||[];
}
function originalLatin(number){
 const rows=source[number]?.text?.trim().split(/\r?\n/u);
 assert.equal(rows?.length,stichCounts[number],"missing numbered stichs: "+number);
 for(const row of rows)assert.match(row,new RegExp("^"+number+":\\d+[ab]?\\s","u"));
 return rows.map(row=>row
  .replace(/^\d+:\d+[ab]?\s+/u,"")
  .replace(/\(\d+[ab]?\)/gu,"")
  .replace(/[†‡*]/gu,""))
  .join(" ");
}
test("independent Clementine Vulgate witness has nine explicit full Psalms and no unauthorized rights claims",()=>{
 assert.equal(witness.source.repository,"jrichter/ClementineVulgateConverter");
 assert.equal(witness.source.revision,"1f7093a14fa61374b0fe85db1965d9bd45dfdae1");
 assert.equal(witness.source.path,"latin/Ps.lat");
 assert.deepEqual(Object.keys(witness.psalms).map(Number),psalms);
 assert.equal(witness.printedAssignmentReferences.length,2);
 assert.equal(witness.releaseBoundary.originalMame1961PsalmLeafCertified,false);
 assert.equal(witness.releaseBoundary.exactOriginalEditionReproduction,false);
 assert.equal(witness.releaseBoundary.translatorRightsIncluded,false);
 assert.equal(witness.releaseBoundary.language,"la");
 assert.deepEqual(witness.releaseBoundary.dates,Object.keys(byDate));
 assert.equal(witness.totals.approvedOrthographicVariants,10);
 assert.equal(witness.totals.missingOrExtraWords,0);
 assert.equal(witness.totals.substantiveDifferences,0);
});
test("all 1,536 Latin words in nine full weekday Compline Psalms agree independently with only ten enumerated spellings",()=>{
 let words=0,stichs=0,approvedCount=0;
 for(const number of psalms){
  const current=tokens(originalLatin(number));
  const independent=tokens(witness.psalms[number].latin);
  assert.equal(current.length,independent.length,"missing/extra word in Psalm "+number);
  const differences=witness.allowedOrthographicVariants.filter(x=>x.psalm===number);
  assert.equal(new Set(differences.map(x=>x.wordIndex)).size,differences.length);
  const approved=new Map(differences.map(x=>[x.wordIndex,x]));
  const mismatches=[];
  for(let i=0;i<current.length;i++){
   const target=independent[i],spoken=current[i];
   if(target===spoken){
    assert.equal(approved.has(i+1),false,
     "approved spelling discrepancy disappeared in Psalm "+number+" word "+(i+1));
   }else{
    const change=approved.get(i+1);
    assert.ok(change,"unknown Latin word change in Psalm "+number+
     " index "+(i+1)+": "+spoken+" != "+target);
    assert.equal(spoken,change.pinned);
    assert.equal(target,change.independent);
    mismatches.push(i+1);approvedCount++;
   }
  }
  assert.equal(mismatches.length,differences.length,
   "independent full Latin text not accounted for in Psalm "+number);
  words+=current.length;
  stichs+=stichCounts[number];
 }
 assert.equal(stichs,125);
 assert.equal(words,1536);
 assert.equal(words,witness.totals.independentLatinWords);
 assert.equal(approvedCount,10);
});
test("each civil ferial date has complete unmodified pinned Latin before any release",()=>{
 const expected={ "2026-12-01":334,"2026-12-02":335,
  "2026-12-03":398,"2026-12-04":469};
 for(const [date,numbers] of Object.entries(byDate)){
  const words=numbers.map(n=>tokens(originalLatin(n)).length).reduce((a,b)=>a+b,0);
  assert.equal(words,expected[date],date+": word-count drift");
 }
});
test("changing or omitting even one middle word fails the independent Latin witness",()=>{
 const words=tokens(originalLatin(70));
 const independent=tokens(witness.psalms[70].latin);
 const altered=words.slice();altered[214]="libertatis";
 assert.notDeepEqual(altered,independent);
 assert.notEqual(altered[214],independent[214]);
});
