import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {RACCOLTA_1857_READER_WORKS_V1 as works,raccolta1857Work,raccolta1857Matches} from "../src/pray/raccolta-1857-two-source-readers.v1.js";
import {PRAY_CANONICAL_DATA_V435930 as canon} from "../src/pray/canonical-data.js";
assert.equal(Object.keys(canon.prayers).length,48);
assert.equal(works.length,3,"Three distinct 1857 historical source works");
assert.deepEqual(works.map(w=>w.acquisitionId),["AO-AQ-037","AO-AQ-038","AO-AQ-039"]);
assert.deepEqual(works.map(w=>w.subject),["I","I","I"]);
assert.equal(new Set(works.map(w=>w.id)).size,3);
for(const work of works){
 assert.ok(["en","la"].includes(work.originalLanguageWitness));
 assert.equal(work.originalPrintImageCollated,false);
 assert.equal(work.frenchEditionHistorical,false);
 assert.match(work.frenchLanguageStatus,/^MODERN_EDITORIAL_TRANSLATION_FROM_1857_(ENGLISH|LATIN_AND_ENGLISH)$/);
 assert.equal(work.indulgencesCurrent,false);
 assert.match(work.sourceUrl,/^https:\/\/en\.wikisource\.org\/wiki\/The_Raccolta/);
 assert.equal(raccolta1857Work(work.id),work);
 assert.equal(raccolta1857Matches({subject:"I",search:work.title}).length,1);
 assert.equal(raccolta1857Matches({subject:"VI",search:work.title}).length,0);
 assert.equal(raccolta1857Matches({category:"essentials",search:work.title}).length,0);
 for(const step of work.steps){
  if(step.linesEn||step.linesFr){
   assert.equal(step.linesEn.length,step.linesFr.length,"1:1 full line parity "+step.id);
   assert.ok(step.linesEn.every(x=>x.length>12),"English source has no gaps");
   assert.ok(step.linesFr.every(x=>x.length>12),"French editorial version has no gaps");
  }
  if(step.bodyEn)assert.ok(step.bodyFr);
  for(const p of step.repetitions){
   assert.ok(["foundations_glory_be","foundations_hail_mary","foundations_eternal_rest"].includes(p.canonicalId));
   assert.ok(canon.prayers[p.canonicalId].en&&canon.prayers[p.canonicalId].fr);
  }
 }
}
const chaplet=works[0],petition=works[1];
assert.equal(chaplet.steps.length,6);
assert.deepEqual(chaplet.steps.map(x=>x.id),["decade_1","decade_2","decade_3","decade_4","decade_5","collect"]);
assert.equal(chaplet.steps.slice(0,5).flatMap(x=>x.linesEn).length,50,"Full 50 love aspirations");
assert.deepEqual(chaplet.steps.slice(0,5).map(x=>x.repetitions[0]?.canonicalId),Array(5).fill("foundations_glory_be"));
assert.ok(chaplet.steps[5].bodyLa&&chaplet.steps[5].bodyEn&&chaplet.steps[5].bodyFr);
assert.equal(chaplet.steps[5].historicalConclusionTruncatedByPrint,true);
assert.match(chaplet.steps[5].bodyEn,/Christ, &c\./);
assert.equal(petition.steps.length,2);
assert.equal(petition.steps[0].linesEn.length,10,"9 fixed + source-blank tenth petition");
assert.equal(petition.steps[0].originalTenthIsEllipsis,true);
assert.match(petition.steps[0].linesEn[9],/printed edition gives an ellipsis/);
const pietate=works[2];
assert.equal(pietate.id,"raccolta_1857_12_pietate_tua");
assert.equal(pietate.originalLanguageWitness,"la");
assert.equal(pietate.steps.length,1);
assert.equal(pietate.steps[0].id,"full_text");
assert.ok(pietate.steps[0].bodyLa.length>750);
assert.ok(pietate.steps[0].bodyEn.length>750);
assert.ok(pietate.steps[0].bodyFr.length>850);
assert.match(pietate.steps[0].bodyLa,/Pontificem nostrum N\. conserva/);
assert.match(pietate.steps[0].bodyEn,/Pius IX/);
assert.equal(pietate.steps[0].historicalPrintedPope,"Pius IX");
assert.equal(pietate.steps[0].noCurrentPontiffReplacement,true);
assert.equal(pietate.frenchEditionHistorical,false);
assert.equal(pietate.steps[0].repetitions.length,0);
assert.equal(raccolta1857Matches({search:"pietate tua"}).length,1);
assert.deepEqual(petition.steps[1].repetitions.map(x=>[x.canonicalId,x.count]),[
 ["foundations_glory_be",3],["foundations_hail_mary",1],["foundations_eternal_rest",1]
]);
const ui=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
for(const token of [
 "import {RACCOLTA_1857_READER_WORKS_V1",
 "function renderRaccolta1857Reader(){",
 "data-ao-raccolta-1857-reader",
 "data-ao-raccolta-1857-library",
 "data-ao-raccolta-1857-open",
 "data-ao-raccolta-aspirations",
 "data-ao-raccolta-shared",
 "data-p435930-raccolta-next",
 "data-p435930-raccolta-prev",
 "data-p435930-raccolta-finish",
 "if(LIB.open&&raccolta1857Work(LIB.open))return renderRaccolta1857Reader();",
 "if(raccolta1857Work(b.dataset.p435930LibOpen))RACCOLTA_1857_STAGE=0"
])assert.ok(ui.includes(token),"Unwired complete historical Prayer reader: "+token);
console.log("Raccolta 1857 §§10–12: three complete historic source works, 50 acts, 10 petitions, full Pietate tua LA/EN with editorial FR, reused common prayers, canon 48 preserved PASS");
