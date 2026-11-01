import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";
import {KYRIALE_RESEARCH_NOTATION_EXAMPLES} from "../src/mass/reader-kyriale-catalogue.js";
const ledger=JSON.parse(readFileSync(
 new URL("../data/research/mass-music-m19-seven-complete-facsimiles-and-dismissals.v1.json",import.meta.url),"utf8"));
assert.equal(ledger.schema,"ao-mass-music-m19-seven-printed-span-and-dismissal-sources-v1");
assert.equal(ledger.publication,"NONPUBLIC_SOURCE_REVIEW");
assert.equal(ledger.publicScoreCount,0);
assert.equal(ledger.printedNoteByNoteCertificates,0);
assert.equal(ledger.liveMassReaderAltered,false);
assert.equal(ledger.sevenPrintedScoreSpans.length,7);
const expected=[
 [545,"54*","54*",4],[2982,"38*","39*",4],[1184,"28*","29*",4],
 [961,"29*","30*",18],[749,"64*","66*",19],
 [1384,"30*","31*",1],[2760,"31*","31*",3]
];
for(let i=0;i<expected.length;i++){
 const [id,start,end,expectedFullBarCount]=expected[i];
 const row=ledger.sevenPrintedScoreSpans[i];
 assert.equal(row.gregobaseId,id);
 assert.equal(row.printedStart,start);
 assert.equal(row.printedEnd,end);
 assert.equal(row.firstPdfPageIndex,parseInt(start,10)+1);
 assert.equal(row.lastPdfPageIndex,parseInt(end,10)+1);
 assert.equal(row.printedPageImageReviewed,"ALL_PAGES_FROM_START_TO_END");
 assert.equal(row.sourceUrl,"https://gregobase.selapa.net/chant.php?id="+id);
 assert.ok(row.printedTextCheckpoints.length>=3);
 assert.equal(row.fullRhythmicAndNeumeCheck,"NOT_CERTIFIED");
 assert.equal(row.syllablePitchParity,"NOT_CERTIFIED");
 assert.equal(row.publisherApproval,false);
 assert.equal(row.publicNotation,false);
 const source=KYRIALE_RESEARCH_NOTATION_EXAMPLES.find(x=>x.scoreId==="GREGOBASE-"+id);
 assert.ok(source);
 assert.equal(source.movement,row.movement);
 assert.equal(source.catalogueId,row.selection);
 const gabc=offlineKyrialeResearchScore(row.movement,row.selection).gabc;
 assert.equal((gabc.match(/\(::\)/g)||[]).length,expectedFullBarCount,
  "Do not silently lose printed chant endings "+id);
}
assert.equal(ledger.terminationFamily.kind,"RITE_CONDITIONAL");
assert.equal(ledger.terminationFamily.explicitIteCount,15);
assert.equal(ledger.terminationFamily.explicitBenedicamusCount,2);
assert.equal(ledger.terminationFamily.explicitRequiescantCount,1);
const index=ledger.terminationFamily.indexed;
assert.equal(index.length,18);
const ite=index.filter(x=>x.type==="ITE");
const ben=index.filter(x=>x.type==="BENEDICAMUS");
const req=index.filter(x=>x.type==="REQUIESCANT");
assert.deepEqual(ite.map(x=>x.gregobaseId),
 [2988,2987,1280,804,353,1006,1160,31,832,2989,856,37,878,2986,620]);
assert.deepEqual(ben.map(x=>x.gregobaseId),[16096,2227]);
assert.deepEqual(req.map(x=>x.gregobaseId),[823]);
assert.equal(new Set(index.map(x=>x.gregobaseId)).size,18);
assert.deepEqual(ite.find(x=>x.gregobaseId===804).sourceTaggedKyrialeSelections,
 ["MASS_02","MASS_03"]);
assert.deepEqual(ite.find(x=>x.gregobaseId===2989).sourceTaggedKyrialeSelections,
 ["MASS_09","MASS_10"]);
assert.deepEqual(ite.find(x=>x.gregobaseId===620).sourceTaggedKyrialeSelections,
 ["MASS_15","MASS_16"]);
assert.equal(ite.find(x=>x.gregobaseId===832).sourceGabcVoicePair,
 "Ite missa est (celebrant) / R. Deo gratias");
assert.equal(ben.find(x=>x.gregobaseId===16096).voicePairGabcRead,true);
assert.equal(ben.find(x=>x.gregobaseId===2227).voicePairGabcRead,true);
assert.equal(req[0].sourceGabcVoicePair,
 "Requiescant in pace (celebrant) / R. Amen");
assert.ok(index.every(x=>x.gregobaseUrl===
 "https://gregobase.selapa.net/chant.php?id="+x.gregobaseId));
assert.ok(index.every(x=>x.exact1962UseCertified===false&&
 x.printedNoteByNoteChecked===false&&x.editorialApproval===false&&x.publicViewer===false));
assert.ok(ledger.terminationFamily.contextualRules.some(x=>x.includes("celebrant voice")));
const dom=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
assert.doesNotMatch(dom,/data-schola-score-open|offlineKyrialeResearchScore\(/);
console.log("PASS M19 seven complete printed Kyriale spans, original GABC ending counts, 15 Ite variants, two Benedicamus and one Requiescant; editorial/publication holds closed");
