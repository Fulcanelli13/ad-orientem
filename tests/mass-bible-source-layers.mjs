import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 validateMassBibleStudy,massBibleRows,validateProperWitnesses,properReadingIndex,
 renderMassBibleStudy,renderMassProperWitnessStudy,massBibleStudyCss
} from "../src/learn/mass-bible-study.js";
import {MASS_FORMATION_ROUTE,MASS_FORMATION_VERSION} from "../src/learn/mass-formation.js";
import {parseScriptureContext} from "../src/scripture/context.js";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const corpus=read("data/learn/mass-bible-source-layers.v1.json");
const first=read("data/mass/scripture-reading-witness-register.v1.json");
const second=read("data/mass/scripture-feast-reading-supplement.v1.json");
const segmented=read("data/mass/scripture-segmented-proper.v1.json");
const formation=read("data/learn/mass-formation-campion.v1.json");
assert.equal(validateMassBibleStudy(corpus),true);
assert.equal(corpus.rows.length,26);
assert.equal(corpus.reviewHolds.length,4);
assert.ok(corpus.reviewHolds.every(x=>!x.public));
assert.equal(MASS_FORMATION_ROUTE,"learn.mass");
assert.equal(MASS_FORMATION_VERSION,"mass-formation-campion-v1");
assert.equal(formation.stages.length,8);
assert.deepEqual([...new Set(corpus.rows.map(x=>x.formationStage))].sort(),formation.stages.map(x=>x.id).sort(),"all original eight stages covered");
const classes=["DIRECT_SCRIPTURAL_WORDING","SCRIPTURAL_WORDING_ADAPTED","EXPLICIT_BIBLICAL_FIGURE","VARIABLE_PROPER_READING","VARIABLE_RITE_SCRIPTURE_READING","NARRATIVE_SCRIPTURE_CONNECTION","DOCTRINAL_SCRIPTURE_CONNECTION","SCRIPTURAL_PARALLEL_NOT_QUOTATION","INTERPRETIVE_BIBLICAL_TYPOLOGY"];
for(const c of classes)assert.ok(corpus.rows.some(x=>x.classification===c),c);
assert.equal(massBibleRows(corpus,{category:"all"}).length,26);
assert.equal(corpus.rows.filter(r=>Boolean(r.scriptureReaderRef)).length,20,"only unambiguous context-handoff references are exposed");
assert.ok(corpus.rows.filter(r=>r.scriptureReaderRef).every(r=>parseScriptureContext(r.scriptureReaderRef)),"native links must resolve Catholic book/chapter");
assert.ok(["MB01","MB02","MB06","MB07","MB09","MB25"].every(id=>!corpus.rows.find(r=>r.id===id).scriptureReaderRef),"held Psalm-numbering and Proper examples are external-source only");
assert.equal(massBibleRows(corpus,{category:"names"}).length,3);
assert.equal(massBibleRows(corpus,{category:"text"}).length,10);
assert.equal(massBibleRows(corpus,{category:"variable"}).length,3);
assert.equal(massBibleRows(corpus,{category:"interpretation"}).length,10);
assert.ok(massBibleRows(corpus,{stage:"CANON"}).every(r=>r.group==="CANON"));
for(const row of corpus.rows){
 assert.ok(row.sourceLinks.some(x=>x.role==="1962_MISSAL_ORDER_AND_TEXT"),"source Missal "+row.id);
 assert.ok(row.sourceLinks.some(x=>x.role==="BIBLICAL_CONTEXT"),"source Bible "+row.id);
 const srcUrl=row.sourceLinks.find(x=>x.role==="BIBLICAL_CONTEXT").url;
 if(row.id==="MB25")assert.equal(srcUrl,"https://vulgate.org/ot/psalms_115.htm",
  "Clementine Psalm 115 must not point to an English merged Psalm 116 page");
 else assert.match(srcUrl,/^https:\/\/www\.newadvent\.org\/bible\//,row.id);
 assert.doesNotMatch(srcUrl,/\/jhn001\.htm$/,row.id+" bad John abbreviation");
 assert.ok(row.reading.fr.length>28&&row.reading.en.length>28,"bilingual actual exposition "+row.id);
 assert.ok(!Object.hasOwn(row,"liveCardId"),"no fictional 48-card mapping "+row.id);
 assert.ok(!Object.hasOwn(row,"mapPin"),"no imagined GPS "+row.id);
}
assert.ok(corpus.rows.find(x=>x.id==="MB18").qualification==="ISAAC_NOT_KILLED");
assert.ok(corpus.rows.find(x=>x.id==="MB15").qualification.includes("MYSTERIUM_FIDEI"));
assert.ok(corpus.rows.find(x=>x.id==="MB24").qualification.includes("PUER_MEUS"));
assert.ok(corpus.rows.find(x=>x.id==="MB26").classification==="VARIABLE_RITE_SCRIPTURE_READING");
const byId=id=>corpus.rows.find(x=>x.id===id);
assert.equal(byId("MB05").classification,"SCRIPTURAL_WORDING_ADAPTED",
 "Luke's Vulgate 'altissimis' cannot be represented as literal 'excelsis'");
assert.match(byId("MB05").reading.en,/altissimis.*excelsis/);
assert.match(byId("MB19").qualification,/GENESIS_PROFERENS/);
assert.match(byId("MB19").reading.en,/does not explicitly narrate a sacrificial offering/);
assert.match(byId("MB25").scriptureReference,/115:3–4.*116:12–13/);
assert.match(byId("MB25").qualification,/CLEMENTINE_115_3_4/);
assert.match(byId("MB11").qualification,/VULGATE_EXERCITUUM_VERSUS_LITURGICAL_SABAOTH/);
for(const id of ["MB08","MB23","MB26"]){
 assert.equal(byId(id).sourceLinks.find(x=>x.role==="BIBLICAL_CONTEXT").url,
  "https://www.newadvent.org/bible/joh001.htm");
}
assert.equal(corpus.rows.filter(r=>r.classification==="DIRECT_SCRIPTURAL_WORDING").length,5);
assert.equal(corpus.rows.filter(r=>r.classification==="SCRIPTURAL_WORDING_ADAPTED").length,5);
const en=renderMassBibleStudy(corpus,{language:"en",category:"names"});
const fr=renderMassBibleStudy(corpus,{language:"fr",category:"all",stage:"COMMUNION"});
assert.equal((en.match(/data-ao-mass-bible-row=/g)||[]).length,3);
assert.ok(en.includes("Melchisedech"));
assert.ok(en.includes("Genesis 14:18–20"));
assert.match(en,/Source-linked research preview/);
assert.match(fr,/La Bible|Agneau de Dieu|sacro|prière|Notre Père/i);
assert.doesNotMatch(en,/<img\b|<canvas\b|data-live-card=/,"learn.mass only");
assert.match(massBibleStudyCss(),/aoMBConnection/);
let corrupt=structuredClone(corpus);corrupt.status="PUBLIC_APPROVED";
assert.equal(validateMassBibleStudy(corrupt),false);
assert.equal(massBibleRows(corrupt).length,0);
assert.doesNotMatch(renderMassBibleStudy(corrupt),/data-ao-mass-bible-row/);
assert.equal(validateProperWitnesses(first,second,segmented),true,"all original source registries must be unchanged");
const lookup=properReadingIndex(first,second,segmented);
assert.equal(lookup.length,105);
assert.equal(new Set(lookup.map(x=>x.sourcePath)).size,105);
assert.equal(lookup.reduce((s,x)=>s+x.slots.length,0),195,"195 ordinary Proper slots");
assert.equal(segmented.readings.length,15);
assert.equal(lookup.filter(x=>x.holds.length).length>0,true,"held or segmented readings are represented");
const pent=lookup.find(x=>x.sourcePath==="Tempora/Pent10-0");
assert.equal(pent.slots.find(x=>x.slot==="GOSPEL").reference,"Luke 18:9–14");
assert.equal(pent.slots.find(x=>x.slot==="EPISTLE_OR_LESSON").reference,"1 Corinthians 12:2–11");
const properHtml=renderMassProperWitnessStudy(lookup,{sourcePath:"Tempora/Pent10-0",language:"en"});
assert.match(properHtml,/105 source-path-specific/);
assert.match(properHtml,/Luke 18:9–14/);
assert.match(properHtml,/Scitis quoniam/);
assert.match(properHtml,/select data-ao-mf-bible-proper/);
assert.doesNotMatch(properHtml,/data-live-card|data-bible-step|<canvas/);
const mutate=structuredClone(first);mutate.celebrations[0].readings.GOSPEL.latinIncipit="";
assert.equal(validateProperWitnesses(mutate,second,segmented),false,"source Latin identity is essential");

const sourceQueue=read("data/learn/mass-bible-source-certification-queue.v1.json");
assert.equal(sourceQueue.schema,"AO_MASS_BIBLE_CERTIFICATION_QUEUE_V1");
assert.equal(sourceQueue.rows.length,105);
assert.equal(sourceQueue.stats.sourcePositions,420);
assert.equal(sourceQueue.stats.sourceMarkerPositions,364);
assert.equal(sourceQueue.stats.unannotatedPositions,56);
assert.equal(sourceQueue.stats.inheritedPositions,42);
assert.equal(sourceQueue.stats.printedPriorityPackets,100);
assert.equal(sourceQueue.stats.candidatePrintedPageClusters,44);
assert.equal(sourceQueue.stats.sourceTypedInterpretations,54);
assert.equal(sourceQueue.stats.fortescueObservations,30);
assert.equal(sourceQueue.stats.dujardinMeditationPositions,22);
assert.equal(sourceQueue.stats.independentlyPrintedAndBibleCertified,0);
assert.equal(sourceQueue.rows.flatMap(z=>z.chantSlots).length,420);
assert.equal(new Set(sourceQueue.rows.map(z=>z.sourcePath)).size,105);
assert.deepEqual(sourceQueue.rows.map(z=>z.sourcePath).sort(),lookup.map(z=>z.sourcePath).sort());
assert.ok(sourceQueue.rows.every(x=>x.chantSlots.length===4&&!x.independentEditionCertified&&x.chantSlots.every(y=>!y.originalMissalAndBibleWordsCertified&&!y.publishable)));
assert.equal(sourceQueue.rows.flatMap(x=>x.chantSlots).filter(y=>y.upstreamBibleAnnotationCount>0).length,364);
assert.equal(sourceQueue.rows.filter(x=>x.priority==="PRINTED_PAGE_CLUSTER_REQUIRES_ADJUDICATION").length,44);
assert.equal(sourceQueue.rows.filter(x=>x.priority!=="NOT_IN_FIRST_100_PACKET_LIST").length,100);
console.log("PASS Mass–Bible bridge: 26 bilingual classified/cited connections, eight-stage learn.mass, 105 original-source Proper identities and 195 reading slots, 15 disjoint guards; no R17 mutation");
