import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildRogationsPayload} from "../src/mass/reader-rogations.js";

const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const dossier=read("../data/mass/rogation-historical-language-witnesses.v1.json");
const donor=read("../data/presentation/reader-rogations.v1.json");
const graph=read("../data/mass/special-days-extension.v1.3.json").graphs.ROG;
const built=buildRogationsPayload({graph,payload:donor});
const rows=built.cards.flatMap(c=>c.paragraphs);
assert.equal(dossier.status,"SOURCE_WITNESS_LOCATED_SEGMENTS_NOT_1962_READER_APPROVED");
assert.equal(dossier.sourceRowCount,187);
assert.equal(rows.length,187);
assert.deepEqual(dossier.currentExactMatches,{
  ordinary:22,prayWithoutOrdinary:15,notExactToThoseOwners:150
});
assert.equal(dossier.notAnAdditionalCertifiedMatchCount,true);
assert.equal(dossier.historicalWitneses.length,2);
assert.deepEqual(dossier.historicalWitneses.map(x=>[x.year,x.language]),[
  [1883,"en"],[1862,"fr"]
]);
for(const source of dossier.historicalWitneses){
  assert.match(source.exactRevision,/oldid=\\d+/);
  assert.match(source.release,/NEVER_AUTO_IMPORT/);
  assert.equal(source.scope.orations.count,10);
  assert.equal(source.scope.orations.present,true);
  assert.equal(source.scope.psalm69.present,true);
  assert.equal(source.scope.suffrages.present,true);
  assert.equal(source.scope.litany.present,true);
  assert.equal(source.scope.pater.present,true);
  assert.equal(source.scope.final.present,true);
  assert.deepEqual(source.scope.orations.ids,
    Array.from({length:10},(_,i)=>"ROG-R05-O"+(i+1)));
  assert.ok(source.scope.orations.ids.every(id=>
    rows.find(x=>x.id===id)?.latin===donor.postLitany.orations[Number(id.slice(9))-1]));
  assert.ok(!Object.hasOwn(source,"english")&&!Object.hasOwn(source,"french"),
    "Scope discovery must not copy an unapproved historical translation");
}
const fr=dossier.historicalWitneses.find(x=>x.language==="fr");
assert.equal(fr.scope.psalm69.preferredForTextReview,
  "FRENCH_PROSE_PARALLEL_NOT_POETIC_ADAPTATION");
assert.ok(fr.knownVersionVariations.includes("ST_JOSEPH_ABSENT_IN_1862_FRENCH_SAINTS_LIST"));
const en=dossier.historicalWitneses.find(x=>x.language==="en");
assert.ok(en.knownVersionVariations.includes("MISSING_A_PESTE_FAME_ET_BELLO_FROM_DELIVERANCE_SEQUENCE"));
assert.equal(dossier.importantBoundaries.englishFrenchContentCopiedIntoThisRegistry,false);
assert.ok(dossier.importantBoundaries.historicalSource.includes("continues beyond"));
assert.ok(dossier.sourceReviewActions.some(x=>x.includes("do not translate them again")));
console.log("PASS pre-existing 1883 English and 1862 French Rogations appendix witnesses: ten collects in each, Psalm, suffrages and Litany, no 1962 certification or copied language");
