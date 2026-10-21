/*
 * Living Catena: validate 16 + 4 Eusebius epitome inventory
 * without passing modern navigation questions off as ancient quotations.
 * DOES NOT certify manuscript text, full solutions, doctrinal adjudication,
 * or rights in twentieth/twenty-first-century edited/translations.
 * node tests/scripture-catena-eusebius-epitome.mjs
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const root="data/scripture/catena/research/";
const d=load(root+"eusebius-epitome-20-questions.v1.json");
const earlier=load(root+"quaestiones-primary-source-crosswalk.v1.json");
const supplements=load(root+"eusebius-marinus-supplement-problem-index.v1.json");
const manifest=load("data/scripture/catena/manifest.v1.json");
assert.equal(d.schema,"ao.catena.eusebius-epitome-questions.v1");
assert.equal(d.status,"research_index_only__no_published_answers");
assert.equal(manifest.totalFragments,12692);
assert.deepEqual(d.counts,{stephanus:16,marinus:4,total:20});
assert.equal(d.records.length,20);
const maps=new Map();
const allVerses=new Set();
for(const gospel of ["matthew","mark","luke","john"]){
 const pack=load("data/scripture/catena/"+gospel+".json");
 for(const p of pack.pericopes){
  assert.ok(!maps.has(p.id),"duplicated canonical pericope");
  maps.set(p.id,p);
  for(const k of p.verse_keys)allVerses.add(k);
 }
}
assert.equal(maps.size,814);
const entries=new Set();
const count={stephanus:0,marinus:0},printedLinks=new Set();
for(const row of d.records){
 assert.ok(!entries.has(row.id),"duplicated Eusebius record "+row.id);
 entries.add(row.id);count[row.recipient]++;
 assert.equal(row.id,`eusebius-${row.recipient}-${String(row.questionNumberInEpitome).padStart(2,"0")}`);
 assert.equal(row.epitomeDivisionId,`${row.recipient==="stephanus"?"St":"Ma"}.${row.questionNumberInEpitome}`);
 assert.equal(row.originalComposition,"lost_full_work");
 assert.equal(row.preservedWitness,"abridged_selection_in_Vat_Pal_gr_220");
 assert.ok(row.readerQuestionModern.endsWith("?"));
 assert.equal(row.readerQuestionAuthorship,"modern_editorial_formulation_not_greek_verbatim");
 assert.equal(row.publicationStatus,"research_only__not_a_verified_published_father_reply");
 assert.equal(row.answerLocation,"epitome_section__no_imported_english_answer");
 assert.ok(!("answerTranslation" in row),"no imported modern English source");
 assert.ok(!("generatedFatherReply" in row),"no fabricated utterances");
 assert.ok(!("originalFatherQuestionExact" in row),"modern question is not asserted as ancient wording");
 assert.ok(row.biblicalReferences.length>0);
 for(const k of row.biblicalReferences)assert.ok(allVerses.has(k),"Scripture key absent "+k);
 assert.ok(row.canonicalCatenaLocationCandidates.length>0);
 for(const c of row.canonicalCatenaLocationCandidates){
  const per=maps.get(c.pericopeId);
  assert.ok(per,"absent Catena link: "+c.pericopeId);
  assert.ok(per.verse_keys.some(k=>row.biblicalReferences.includes(k)),"link without shared verse");
  assert.equal(c.association,"scripture-location-only__not_eusebius_same_work_proof");
  assert.equal(c.candidateReview,"not_reviewed");
  printedLinks.add(row.id+"|"+c.pericopeId);
 }
 if(row.recipient==="marinus"){
  assert.equal(row.questionNumberInEpitome<=4,true);
  assert.match(row.witnessFolia,/^\d+r–\d+r$/);
 }else assert.equal(row.witnessFolia,"61r–88r (collection level)");
 if(row.greekExactQuestionSourceQuote!==null){
  assert.equal(row.id,"eusebius-marinus-01","only original Greek directly transcribed from web witness");
  assert.equal(row.sourceLanguageTextStatus,"short_greek_opening_anchor_checked_in_abridgement__incomplete_quote");
 }else assert.equal(row.sourceLanguageTextStatus,"not_transcribed__no_unverified_greek_reconstruction");
}
assert.deepEqual(count,{stephanus:16,marinus:4});
for(let n=1;n<=16;n++)assert.ok(entries.has(`eusebius-stephanus-${String(n).padStart(2,"0")}`));
for(let n=1;n<=4;n++)assert.ok(entries.has(`eusebius-marinus-${String(n).padStart(2,"0")}`));
assert.equal(printedLinks.size,33);
const africanus=d.records.find(x=>x.id==="eusebius-stephanus-04");
assert.equal(africanus.solutionResearchStatus,"quotation_transmitted_not_eusebius_own_unmediated_solution");
const mar1=d.records.find(x=>x.id==="eusebius-marinus-01");
assert.equal(mar1.historicalQuestionSpeaker,"Marinus_as_addressed_by_eusebius");
assert.equal(mar1.solutionStructuralNotes.length,2);
assert.ok(earlier.records.some(x=>x.id==="eusebius-marinus-1"),"previous Marinus pilot not silently replaced");
assert.equal(supplements.entries.length,3,"supplement research kept separate from epitome");
assert.ok(d.copyrightPolicy.includes("Do not bulk reproduce"));
console.log("PASS: 16 + 4 epitome divisions; 33 location-only Catena pointers; no invented replies, no spurious Africanus attribution.");
