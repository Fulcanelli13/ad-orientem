/** B12: Original Vatican 1962 Good Friday p.167 rubric and nine real Solemn Prayer source rows. */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildGoodFridayReader} from "../src/mass/reader-good-friday.js";

const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const audit=load("data/mass/independent-1962-good-friday-b12-solemn-prayers-speaker-and-anchors.v1.json");
const payload=load("data/presentation/reader-good-friday.v1.json");
const graph=load("data/mass/special-days-core.v1.1.json").graphs.GF;
const images=load("data/mass/independent-1962-holy-week-b09-original-image-witness.v1.json");
const fold=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/æ/gi,"ae").replace(/œ/gi,"oe").replace(/foecundas/gi,"fecundas")
  .replace(/j/gi,"i").replace(/[^a-z]/gi," ").replace(/\s+/g," ").toLowerCase().trim();
const contains=(hay,needle)=>(" "+fold(hay)+" ").includes(" "+fold(needle)+" ");

assert.equal(audit.schema,"AO_MR1962_GOOD_FRIDAY_B12_SOLEMN_ORATIONS_PRINTED_SPEAKER_SOURCE_V1");
assert.equal(audit.authority.rubricPage,167);
assert.equal(audit.authority.rubricSection,14);
assert.equal(audit.prayers.length,9);
assert.equal(audit.scope.sourcePrayerMidAndEndPhraseAnchors,18);
assert.equal(audit.scope.sourceTextMutated,false);
assert.equal(audit.scope.normalMassReaderMutated,false);
assert.equal(audit.scope.vaticanPageImagesStoredInRepo,false);
assert.equal(new Set(audit.prayers.map(x=>x.key)).size,9);
assert.equal(payload.solemnPrayers.length,9);
assert.equal(graph.length,56);
const built=buildGoodFridayReader({graph,payload});
assert.equal(built.sourceRecordCount,56);
assert.equal(built.jewishPrayerVariant,"PRINTED_1962");
assert.equal(built.ordinaryMassGraphActive,false);

const opening=built.steps.find(x=>x.recordId==="GF-SOP-410");
assert.ok(opening);
const preliminary=opening.paragraphs.find(x=>x.id==="GF-SOP-BEGIN");
assert.equal(preliminary.latin,"Oremus.");
assert.equal(preliminary.kind,"VERSICLE");
assert.equal(preliminary.speaker,"CELEBRANT","Printed 1962 rubric does not assign the opening cue to the assembly");
assert.deepEqual([...preliminary.sourceIds],["GF-SOP-410"]);

let anchored=0,rows=0;
for(const witness of audit.prayers){
 const number=witness.number,nn=String(number).padStart(2,"0"),src=payload.solemnPrayers[number-1];
 assert.equal(src.key,witness.key,"Source prayer changed order for no. "+number);
 assert.equal(witness.intentionScanUrl,
  "https://gregobase.selapa.net/sources/42/"+(witness.intentionPrintedPage+82)+".png");
 assert.equal(witness.collectScanUrl,
  "https://gregobase.selapa.net/sources/42/"+(witness.collectPrintedPage+82)+".png");
 const originalIntention=src.intention||src.variants?.PRINTED_1962?.intention;
 const originalCollect=src.prayer||src.variants?.PRINTED_1962?.prayer;
 assert.ok(originalIntention?.length>100&&originalCollect?.length>300,"Missing original prayer words: "+number);
 assert.equal(witness.collectOriginalPhraseAnchors.length,2);
 for(const phrase of witness.collectOriginalPhraseAnchors){
  assert.ok(contains(originalCollect,phrase),number+" source print/canonical prayer anchor drifted: "+phrase);
  anchored++;
 }
 assert.deepEqual(witness.postureEventIds,["GF-SOP-"+nn+"-K","GF-SOP-"+nn+"-R"]);
 const kneel=built.steps.find(x=>x.recordId==="GF-SOP-"+nn+"-K");
 const stand=built.steps.find(x=>x.recordId==="GF-SOP-"+nn+"-R");
 assert.ok(kneel&&stand,nn+" Good Friday exact-cue graph incomplete");
 assert.equal(kneel.posture,"KNEEL",nn+" original Flectamus posture broken");
 assert.equal(stand.posture,"STAND",nn+" original Levate posture broken");
 const expected=[
  ["I",originalIntention,"TEXT",[]],
  ["O","Oremus.","VERSICLE",[]],
  ["K","Flectamus genua.","VERSICLE",["GF-SOP-"+nn+"-K"]],
  ["R","Levate.","VERSICLE",["GF-SOP-"+nn+"-R"]],
  ["P",originalCollect,"TEXT",[]]
 ];
 for(const [suffix,latin,kind,ids] of expected){
  const row=kneel.paragraphs.find(x=>x.id==="GF-SOP-"+nn+"-"+suffix);
  assert.ok(row,nn+" missing original liturgical row "+suffix);
  assert.equal(row.latin,latin,nn+" prayer wording edited in presentation");
  assert.equal(row.kind,kind,nn+" printed 1962 spoken kind misattributed: "+suffix);
  assert.equal(row.speaker,"CELEBRANT",nn+" printed 1962 celebrant cue missing: "+suffix);
  assert.deepEqual([...row.sourceIds],ids,nn+" event owner changed for "+suffix);
  const repeat=stand.paragraphs.find(x=>x.id===row.id);
  assert.ok(repeat);
  assert.equal(repeat.speaker,"CELEBRANT",nn+" source speaker changed across K/R cards");
  rows++;
 }
 // These tokens are spoken by the celebrant; only the 1962 event graph
 // sets the posture of the faithful and no spoken cue is ALL/RESPONSE.
 assert.equal(kneel.paragraphs.filter(x=>x.kind==="RESPONSE").length,0);
}

// Poisoned evidence: a 2008 Good Friday oration cannot be taken as the 1962 original.
const defaultEight=built.steps.find(x=>x.recordId==="GF-SOP-08-K").paragraphs;
const with2008=buildGoodFridayReader({graph,payload,jewishPrayerVariant:"HOLY_SEE_2008"});
const laterEight=with2008.steps.find(x=>x.recordId==="GF-SOP-08-K").paragraphs;
assert.notEqual(laterEight.find(x=>x.id==="GF-SOP-08-P").latin,
 defaultEight.find(x=>x.id==="GF-SOP-08-P").latin,"2008 wording replaced printed 1962");
assert.ok(defaultEight.some(x=>/auferat velamen/.test(x.latin)));
assert.ok(laterEight.some(x=>/plenitudine gentium/.test(x.latin)));
assert.ok(laterEight.every(x=>x.speaker==="CELEBRANT"),"2008 alternative changed actor");
const original=images.witnesses.filter(x=>/^SOLEMN_PRAYER/.test(x.id));
assert.equal(original.length,10,"Original B09 nine printed intention incipits plus prayer eight collect changed");
assert.equal(rows,45);
assert.equal(anchored,18);
assert.ok(audit.remaining.some(x=>x.includes("Full-word Latin visual line-by-line")));
console.log("PASS B12 ORIGINAL 1962 GOOD FRIDAY PRAYERS="+JSON.stringify({
 prayers:9,printedMidEndAnchors:18,celebrantOwnedRows:45,
 faithfulKneelStandPairs:9,sourceTextChanged:false,printed1962DistinctFrom2008:true,
 fullyCollatedLatin:false,englishFrenchCertified:false
}));
