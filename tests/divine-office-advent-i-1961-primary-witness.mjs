import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../src/app/source-transport-compat.js";
import {reviewAdventI2026CollectConclusion}
 from "../src/office/advent-i-collect-ending-1960-research.js";
const manifest=JSON.parse(readFileSync(new URL(
 "../data/office/research/advent-i-2026-primary-1961-print-and-translation-audit.json",
 import.meta.url),"utf8"));
const fixture=JSON.parse(readFileSync(new URL(
 "../tests/fixtures/office/advent-i-2026-collect-dialogue-source-sections.json",
 import.meta.url),"utf8"));
function readSource(path,lang){
 const f=fixture.sections[lang];
 const proper=path==="Tempora/Adv1-0";
 assert.ok(proper||path==="Psalterium/Common/Prayers");
 return Promise.resolve({
  sourceRevision:PIN,sourcePath:path,language:lang,
  sourceBlobSha:proper?f.properSha:f.prayersSha,
  map:proper?new Map([["Oratio",f.Oratio]]):
   new Map(["Dominus","Oremus","Qui vivis",
    "Benedicamus Domino","Fidelium animae"].map(k=>[k,f[k]]))
 });
}
test("1961 Mame Vulgate and Pius XII editions are not conflated",()=>{
 assert.equal(manifest.schema,"ao.office.advent-i-2026-primary-print-translation-review.v1");
 assert.equal(manifest.edition.psalterFamily,"VULGATA_GALLICAN");
 assert.equal(manifest.edition.pagesInAvailableScan,145);
 assert.equal(manifest.edition.completePsalmAndAdventProperPrintVisible,false);
 assert.equal(manifest.parallelEdition.psalterFamily,"PIUS_XII");
 assert.equal(manifest.parallelEdition.notWordForWordPsalterComparator,true);
 assert.equal(manifest.primaryPrintedOrdinary.concludingDialogue.section,53);
 assert.equal(manifest.primaryPrintedOrdinary.concludingDialogue.page,130);
 assert.equal(manifest.primaryPrintedOrdinary.concludingDialogue.previousResearchOmissionCorrected,true);
 assert.equal(manifest.primaryPrintedOrdinary.sourceNoteNotAuthorityToSuppressSection53,true);
 assert.equal(manifest.fullHourCertified,false);
 assert.equal(manifest.publishable,false);
});
test("all minister variants include concluding dialogue from printed 1961 §53",async()=>{
 for(const [recitation,minister,offset] of [
  ["SOLO","BELOW_DEACON",2],
  ["SOLO","DEACON_OR_HIGHER",2],
  ["CHOIR_OR_COMMON","BELOW_DEACON",2],
  ["CHOIR_OR_COMMON","DEACON_OR_HIGHER",0]
 ]){
  const r=await reviewAdventI2026CollectConclusion({
   readSource,recitation,minister
  });
  assert.equal(r.status,
   "THREE_LANGUAGE_SOURCE_COLLECT_AND_DISMISSAL_VARIANTS_NOT_PRINT_CERTIFIED",
   r.reason);
  assert.equal(r.concludingDialogue1961OrdinariumSection53Reviewed,true);
  assert.equal(r.omittedSecondDomineExaudi,false);
  for(const lang of ["la","en","fr"]){
   assert.deepEqual(r.languages[lang].beforeBenedicamus,
    fixture.sections[lang].Dominus.slice(offset,offset+2));
  }
  assert.equal(r.completeHourCertified,false);
  assert.equal(r.publishable,false);
 }
});
test("the inherited English and French textual issues are unresolved, never replaced automatically",()=>{
 assert.equal(manifest.translationIssues.length,2);
 assert.deepEqual(manifest.translationIssues.map(x=>x.language),["en","fr"]);
 for(const issue of manifest.translationIssues){
  assert.equal(issue.editorialStatus,"NEEDS_QUALIFIED_REVIEW");
  assert.equal(issue.automaticReplacement,false);
 }
 assert.equal(manifest.originalTranslationsChanged,false);
 assert.equal(manifest.translationsApproved,false);
 assert.equal(manifest.rightsApproved,false);
 assert.equal(manifest.published,false);
});
