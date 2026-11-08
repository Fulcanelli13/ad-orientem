import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {reviewAdventI2026CollectConclusion as review}
 from "../src/office/advent-i-collect-ending-1960-research.js";

const fixture=JSON.parse(readFileSync(new URL(
 "../tests/fixtures/office/advent-i-2026-collect-dialogue-source-sections.json",
 import.meta.url),"utf8"));
const proper="Tempora/Adv1-0",prayers="Psalterium/Common/Prayers";
function readSource(mutator=()=>{}){
 return async(path,language)=>{
  const f=fixture.sections[language];
  if(!f)throw Error("NO_FALLBACK");
  const source={sourceRevision:fixture.revision,sourcePath:path,language,
   sourceBlobSha:path===proper?f.properSha:f.prayersSha,
   map:path===proper?new Map([["Oratio",[...f.Oratio]]]):
    new Map(["Dominus","Oremus","Qui vivis","Benedicamus Domino",
     "Fidelium animae"].map(k=>[k,[...f[k]]]))};
  mutator(source,path,language);
  return source;
 };
}
test("source-first trilingual collect has named Oremus, exact macro ending, Benedicamus and Fidelium",async()=>{
 let reads=0;
 const r=await review({readSource:async(...args)=>{
  reads++;return readSource()(...args);
 },recitation:"CHOIR_OR_COMMON",minister:"DEACON_OR_HIGHER"});
 assert.equal(r.status,"THREE_LANGUAGE_SOURCE_COLLECT_AND_DISMISSAL_VARIANTS_NOT_PRINT_CERTIFIED");
 assert.equal(reads,6);
 assert.equal(r.languageComponentsLocated,3);
 assert.equal(r.dialogueVariant,"DOMINUS_VOBISCUM");
 for(const lang of ["la","en","fr"]){
  const x=r.languages[lang],original=fixture.sections[lang];
  assert.equal(x.collectBody,original.Oratio[0]);
  assert.deepEqual(x.collectConclusion,original["Qui vivis"]);
  assert.equal(x.oremus,original.Oremus[0]);
  assert.deepEqual(x.beforeCollect,original.Dominus.slice(0,2));
  assert.deepEqual(x.beforeBenedicamus,original.Dominus.slice(0,2));
  assert.deepEqual(x.benedicamus,original["Benedicamus Domino"]);
  assert.deepEqual(x.fideliumAnimae,original["Fidelium animae"]);
  assert.equal(x.sourceIds.length,6);
 }
 assert.equal(r.collectEndingSourceMacroResolved,true);
 assert.equal(r.exactPrintedCollectEndingCollated,false);
 assert.equal(r.translationFidelityCertified,false);
 assert.equal(r.completeHourCertified,false);
 assert.equal(r.publishable,false);
 assert.equal(r.published,false);
});
test("solo priest uses Domine exaudi both before and after collect under printed 1961 §53",async()=>{
 const r=await review({readSource:readSource(),
  recitation:"SOLO",minister:"DEACON_OR_HIGHER"});
 assert.equal(r.dialogueVariant,"DOMINE_EXAUDI");
 assert.deepEqual(r.languages.la.beforeCollect,
  fixture.sections.la.Dominus.slice(2,4));
 assert.deepEqual(r.languages.la.beforeBenedicamus,
  fixture.sections.la.Dominus.slice(2,4));
 assert.equal(r.omittedSecondDomineExaudi,false);
 assert.equal(r.concludingDialogue1961OrdinariumSection53Reviewed,true);
});
test("a lay or below-deacon leader in common uses Domine exaudi",async()=>{
 const r=await review({readSource:readSource(),
  recitation:"CHOIR_OR_COMMON",minister:"BELOW_DEACON"});
 assert.equal(r.dialogueVariant,"DOMINE_EXAUDI");
 assert.deepEqual(r.languages.en.beforeCollect,
  fixture.sections.en.Dominus.slice(2,4));
 assert.equal(r.languages.fr.oremus,"v. Prions.");
 assert.deepEqual(r.languages.fr.beforeBenedicamus,
  fixture.sections.fr.Dominus.slice(2,4));
});
test("recitation and ministry must be explicitly established; no invented default",async()=>{
 for(const args of [
  {},{recitation:"SOLO"},{minister:"DEACON_OR_HIGHER"},
  {recitation:"UNSPECIFIED",minister:"DEACON_OR_HIGHER"},
  {recitation:"CHOIR_OR_COMMON",minister:"LAITY_UNCERTAIN"},
  {recitation:"SOLO",minister:"DEACON_OR_HIGHER",calendarScope:"LOCAL"}
 ]){
  const r=await review({readSource:readSource(),...args});
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.publishable,false);
 }
});
test("missing, swapped language, changed macro or missing French Oremus blocks all languages",async()=>{
 const variants=[
  (s,p,l)=>{if(l==="fr"&&p===prayers)s.map.delete("Oremus")},
  (s,p,l)=>{if(l==="en"&&p===proper)s.map.set("Oratio",
   ["Something else","$Per Dominum"])},
  (s,p,l)=>{if(l==="fr"&&p===prayers)s.map.get("Qui vivis")[0]="r. UPDATED"},
  (s,p,l)=>{if(l==="la"&&p===prayers)s.map.get("Dominus").splice(4,1)},
  (s,p,l)=>{if(l==="en"&&p===prayers)s.map.get("Benedicamus Domino").splice(1,1)},
  (s,p,l)=>{if(l==="fr")s.sourceRevision="wrong"},
  (s,p,l)=>{if(l==="fr")s.language="en"},
  (s,p,l)=>{if(l==="la")s.sourceBlobSha="unverified"}
 ];
 for(const mutate of variants){
  const r=await review({readSource:readSource(mutate),
   recitation:"SOLO",minister:"BELOW_DEACON"});
  assert.equal(r.status,"WITHHELD",r.reason);
  assert.equal(r.languageComponentsLocated,0);
  assert.equal(r.publishable,false);
 }
});
test("explicit flags preserve French ending and freer English collect for editorial review",async()=>{
 const r=await review({readSource:readSource(),recitation:"SOLO",
  minister:"BELOW_DEACON"});
 assert.deepEqual(r.translationReviewRequired,[
  "FR_QUI_VIVIS_OMITS_EXPLICIT_CUM_DEO_PATRE_PHRASE",
  "EN_ADVENT_I_COLLECT_FREE_PARAPHRASE_NEEDS_LATIN_FIDELITY_REVIEW"
 ]);
 assert.match(r.languages.la.collectConclusion[0],/cum Deo Patre/u);
 assert.doesNotMatch(r.languages.fr.collectConclusion[0],/Père/u);
 assert.match(r.languages.en.collectBody,/wrathful judgments/u);
 assert.equal(r.languages.en.translationFidelityApproved,false);
});
