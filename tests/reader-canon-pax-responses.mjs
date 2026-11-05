import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CANON_PAX_1961_WITNESSES,CANON_PAX_REFERENCE_SCORES}
 from "../src/mass/reader-canon-pax-response-reference-scores.js";
import {PARTICIPATION_REFERENCE_SCORES,participationReferenceScoresForParagraph}
 from "../src/mass/reader-participation-reference-scores.js";
import {researchGabcPhrases}
 from "../src/mass/reader-music-gabc-source-screen.js";
const file=async path=>JSON.parse(await readFile(new URL("../"+path,import.meta.url),"utf8"));
const corpus=await file("data/presentation/reader-text-sung.v1.json");
const roles=(await file("data/mass/ordinary-sung-speaker-audit.v1.json")).records;
const byCue=new Map(corpus.blocks.flatMap(b=>b.units.map(u=>[u.cue_id,u])));
const amenCoverage=await file("data/mass/participation-amen-1962-coverage.v1.json");
assert.equal(amenCoverage.schema,"ao-mass-amen-response-coverage-v1");
assert.equal(amenCoverage.records.length,13);
assert.equal(amenCoverage.noInferredMelodyFromIdenticalAmenText,true);
assert.deepEqual(amenCoverage.records.filter(x=>x.classification.startsWith("RESEARCH")).map(x=>x.sourceCueId),
 ["AO.SM.C0136","AO.SM.C0207","AO.SM.C0218","AO.SM.C0260"]);
assert.deepEqual(amenCoverage.records.filter(x=>x.classification==="HOLD_DYNAMIC_PROPER").map(x=>x.sourceCueId),
 ["AO.SM.C0074","AO.SM.C0255"]);
for(const row of amenCoverage.records){
 assert.equal(row.publicApproved,false);
 assert.equal(row.sourceBlockId,roles.find(x=>x.cueId===row.sourceCueId)?.blockId);
 const original=corpus.blocks.flatMap(b=>b.units).find(x=>x.cue_id===row.sourceCueId);
 assert.equal(row.sourceLatin,original?.latin);
 assert.equal(row.sourceClock,original?.clock);
 assert.equal(row.properSlot,original?.proper_slot??null);
}

const byRole=new Map(roles.map(x=>[x.cueId,x.role]));
const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/[æœ]/gi,m=>m.toLowerCase()==="æ"?"ae":"oe")
 .replace(/j/gi,"i").toLowerCase().replace(/[^a-z0-9]/g,"");
const expected=[
 ["AO.SM.C0207",7282,1,"CANON_END","amen"],
 ["AO.SM.C0218",4327,1,"PAX_DOMINI","amen"],
 ["AO.SM.C0220",4327,3,"PAX_DOMINI","etcumspiritutuo"]
];
assert.deepEqual(CANON_PAX_1961_WITNESSES.map(w=>w.sourceId),[7282,4327]);
assert.equal(CANON_PAX_REFERENCE_SCORES.length,3);
assert.equal(new Set(CANON_PAX_REFERENCE_SCORES.map(x=>x.id)).size,3);
for(const [cueId,id,index,owner,latin] of expected){
 const source=CANON_PAX_1961_WITNESSES.find(w=>w.sourceId===id);
 const score=CANON_PAX_REFERENCE_SCORES.find(x=>x.sourceCueIds[0]===cueId);
 assert.ok(source&&score, cueId+" must have an independently source-attested phrase");
 assert.equal(score.sourceId,id);
 assert.equal(score.sourcePhraseIndex,index);
 assert.equal(score.eventId,owner);
 assert.equal(score.publicScoreApproved,false);
 assert.equal(score.printVerification,"PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION");
 assert.equal(score.sourceUrl,"https://gregobase.selapa.net/chant.php?id="+id);
 assert.equal(byRole.get(cueId),"RESPONDERS");
 assert.equal(norm(byCue.get(cueId).latin),norm(score.sourceLatin));
 assert.deepEqual(score.sourceCueLatin,[byCue.get(cueId).latin]);
 assert.equal(norm(score.sourceLatin),latin);
 const originalPhrases=researchGabcPhrases(source.fullSourceGabc);
 assert.equal(originalPhrases.length,4,"Exactly four original Gregorian turns in #"+id);
 const excerpt=researchGabcPhrases(score.gabc);
 assert.deepEqual(excerpt,[originalPhrases[index]],
  "No fabricated pitches, altered words or crossing liturgical source turns");
 assert.equal(norm(excerpt[0]),latin);
 assert.ok(PARTICIPATION_REFERENCE_SCORES.includes(score));
}
const resolvedMass={schema:"ao-resolved-mass-v2",form:"MISSA_CANTATA_SIMPLE",
 overlays:[],distinctRite:null};
const p=n=>({id:"ROW"+n,kind:"TEXT",primary:byCue.get("AO.SM.C"+String(n).padStart(4,"0"))?.latin??null,
 secondary:"Original English translation remains visible",
 sourceCueIds:["AO.SM.C"+String(n).padStart(4,"0")]});
const choose=(n,m=resolvedMass,mod={})=>{
 const row=p(n);
 return participationReferenceScoresForParagraph({
  paragraph:row,paragraphs:[row],form:"MISSA_CANTATA_SIMPLE",
  resolvedMass:m,...mod}).map(s=>s.sourceId);
};
assert.deepEqual(choose(207),[7282]);
assert.deepEqual(choose(218),[4327]);
assert.deepEqual(choose(220),[4327]);
for(const n of [207,218,220]){
 assert.deepEqual(choose(n,null),[],"No score without an actual selected Mass");
 assert.deepEqual(choose(n,{...resolvedMass,distinctRite:"GOOD_FRIDAY"}),[]);
 assert.deepEqual(choose(n,resolvedMass,{form:"LOW"}),[]);
 const row=p(n);
 const broken={...row,primary:"℟. Altered Latin"};
 assert.deepEqual(choose(n,resolvedMass,{paragraph:broken}),[]);
 assert.deepEqual(choose(n,resolvedMass,{paragraphs:[row,row]}),[]);
 assert.deepEqual(choose(n,resolvedMass,{paragraphs:[{...row,primary:"Translation only"}]}),[]);
 const bilingual={...row,primary:"English response",secondary:row.primary};
 assert.deepEqual(choose(n,resolvedMass,{paragraph:bilingual,paragraphs:[bilingual]}),
  [n===207?7282:4327],
  "Correct Latin may be in the bilingual secondary reader column");
}
for(const n of [20,25,27,74,133,160,162,191,195,211,225,239,241,246,255,261,266]){
 const row=p(n);
 // Even if an unresolved Proper paragraph is accidentally supplied "Amen",
 // an unowned cue does not acquire the musical formula of a different prayer.
 assert.deepEqual(participationReferenceScoresForParagraph({
  paragraph:{...row,primary:"℟. Amen."},paragraphs:[{...row,primary:"℟. Amen."}],
  form:"SOLEMN",resolvedMass
 }),[],"No unapproved Amen reassignment to "+n);
}
console.log("PASS Canon C0207 + Pax C0218/C0220: 3 unchanged original 1961 score excerpts, exact cue owners, bilingual and Low guards");
