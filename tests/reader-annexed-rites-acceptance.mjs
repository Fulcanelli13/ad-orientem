import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildAspergesPayload,createAspergesReaderController} from "../src/mass/reader-asperges.js";
import {buildPalmPayload,createPalmReaderController} from "../src/mass/reader-palm.js";
import {buildAshPayload,createAshReaderController} from "../src/mass/reader-ash.js";
import {buildCandlemasPayload,createCandlemasReaderController} from "../src/mass/reader-candlemas.js";
import {buildRogationsPayload,createRogationsReaderController} from "../src/mass/reader-rogations.js";
import {buildRequiemAbsolutionPayload,createRequiemAbsolutionReaderController} from "../src/mass/reader-requiem-absolution.js";
import {buildCorpusChristiProcessionPayload,createCorpusChristiProcessionReaderController} from "../src/mass/reader-corpus-christi.js";
import {buildHolyThursdayPostPayload,createHolyThursdayPostReaderController} from "../src/mass/reader-holy-thursday-post.js";
import {buildGenericProcessionReader,createGenericProcessionReaderController} from "../src/mass/reader-generic-procession.js";
import {specialRiteVernacular,projectSpecialRiteReadingPages}
  from "../src/mass/reader-special-missal-pages.js";

const json=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const graphs=json("../data/mass/special-days-extension.v1.3.json").graphs;
const cases=[
  ["ASPERGES","ASP","reader-asperges",buildAspergesPayload,createAspergesReaderController,{},5,"FOOT_CLUSTER"],
  ["PALM","PALM","reader-palm",buildPalmPayload,createPalmReaderController,{},7,"INTROIT"],
  ["ASH","ASH","reader-ash",buildAshPayload,createAshReaderController,{},5,"INTROIT"],
  ["CANDLEMAS","CND","reader-candlemas",buildCandlemasPayload,createCandlemasReaderController,{},7,"INTROIT"],
  ["ROGATIONS","ROG","reader-rogations",buildRogationsPayload,createRogationsReaderController,{},6,"INTROIT"],
  ["REQUIEM_ABSOLUTION","ABS","reader-requiem-absolution",buildRequiemAbsolutionPayload,
    createRequiemAbsolutionReaderController,{bodyPresent:true,burialProcession:true},5,"BURIAL_PROCESSION"],
  ["CORPUS_CHRISTI_PROCESSION","CORPUS","reader-corpus-christi",buildCorpusChristiProcessionPayload,
    createCorpusChristiProcessionReaderController,{},6,"POST_MASS_LIFECYCLE"],
  ["HOLY_THURSDAY_POST","HT_POST","reader-holy-thursday-post",buildHolyThursdayPostPayload,
    createHolyThursdayPostReaderController,{},6,"POST_MASS_LIFECYCLE"],
];
const coverage=[];
for(const [name,graphKey,file,builder,controller,options,expectedCount,handoff] of cases){
  const graph=graphs[graphKey],payload=json("../data/presentation/"+file+".v1.json");
  const args={graph,payload,...options};
  const built=builder(args),cards=built.cards,ctl=controller(args);
  assert.equal(cards.length,expectedCount,name+" source stage count unexpectedly changed");
  assert.equal(ctl.project().card.id,cards[0].id,name+" initial stage wrong");
  const graphIds=new Set(graph.map(e=>e.id));
  let sourceRows=0,frRows=0,enRows=0;
  const ids=new Set();
  for(const [i,card] of cards.entries()){
    assert.ok(card.sourceRecordIds?.length,name+" orphan page without original 1962 graph records");
    for(const id of card.sourceRecordIds){
      assert.ok(graphIds.has(id),name+" invented source record "+id);
    }
    assert.ok(card.title?.trim(),name+" untitled page");
    for(const row of card.paragraphs??[]){
      sourceRows++;
      assert.ok(String(row.latin??"").trim(),name+" empty source text "+row.id);
      assert.ok(graphIds.has(row.sourceRecordId),
        name+" source paragraph "+row.id+" references missing original rite record");
      assert.equal(ids.has(row.id),false,name+" duplicate text cue "+row.id);
      ids.add(row.id);
      if(specialRiteVernacular(row,{language:"en"}))enRows++;
      if(specialRiteVernacular(row,{language:"fr"}))frRows++;
    }
    assert.equal(ctl.project().card.id,card.id,name+" controller skipped stage "+i);
    if(i<cards.length-1)ctl.next();
  }
  assert.equal(ctl.project().atEnd,true,name+" missing ritual completion stage");
  assert.equal(ctl.project().handoff,handoff,name+" changed the Mass/lifecycle handoff");
  ctl.previous();
  assert.equal(ctl.project().card.id,cards.at(-2).id,name+" previous arrow skips source stage");
  assert.ok(sourceRows>0,name+" has no 1962 liturgical source text");
  const latinComplete=sourceRows>0;
  // Coverage is descriptive, not a false assertion that all rites have a
  // reviewed parallel translation. The matrix prints actual source columns.
  if(name==="ASPERGES"||name==="CORPUS_CHRISTI_PROCESSION"){
    assert.equal(frRows,sourceRows,name+" editorial French parallel text is incomplete");
    assert.equal(enRows,sourceRows,name+" editorial English parallel text is incomplete");
    if(name==="ASPERGES")assert.equal(
      projectSpecialRiteReadingPages("ASP-R04",cards[3].paragraphs).length,2);
  }else if(name==="HOLY_THURSDAY_POST"){
    assert.equal(frRows,6,"Holy Thursday Pange lingua / Tantum ergo six stanzas lack French");
    assert.equal(enRows,6,"Holy Thursday Pange lingua / Tantum ergo six stanzas lack English");
    assert.equal(sourceRows,21,"Holy Thursday Psalm 21 source rows changed");
    assert.ok(cards.find(c=>c.id==="HT-R05").paragraphs.every(row=>
      !specialRiteVernacular(row,{language:"en"})&&
      !specialRiteVernacular(row,{language:"fr"})),
      "Do not fabricate Psalm 21 translations from the independently sourced hymn");
  }else{
    assert.equal(frRows,0,name+" appears to have unsourced French text");
    assert.equal(enRows,0,name+" appears to have unsourced English text");
  }
  coverage.push({name,graphRecords:graph.length,stages:cards.length,latinRows:sourceRows,
    englishRows:enRows,frenchRows:frRows,latinComplete,handoff});
}
const requiemWithoutBody=buildRequiemAbsolutionPayload({graph:graphs.ABS,
  payload:json("../data/presentation/reader-requiem-absolution.v1.json"),
  bodyPresent:false,burialProcession:true});
assert.equal(requiemWithoutBody.cards.some(c=>c.id==="ABS-R05"),false,
  "Burial hymn was shown with no body/conditional procession");
const requiemNoBurial=buildRequiemAbsolutionPayload({graph:graphs.ABS,
  payload:json("../data/presentation/reader-requiem-absolution.v1.json"),
  bodyPresent:true,burialProcession:false});
assert.equal(requiemNoBurial.cards.some(c=>c.id==="ABS-R05"),false);
const corpus=createCorpusChristiProcessionReaderController({graph:graphs.CORPUS,
  payload:json("../data/presentation/reader-corpus-christi.v1.json")});
corpus.goTo("CORPUS-R03");
assert.equal(corpus.project().posture,"LOCAL_REVERENT",
  "Corpus non-participant was instructed to walk in Eucharistic procession");
corpus.setProcessionParticipant(true);
assert.equal(corpus.project().posture,"PROCESSIONAL");
const thursday=createHolyThursdayPostReaderController({graph:graphs.HT_POST,
  payload:json("../data/presentation/reader-holy-thursday-post.v1.json")});
thursday.goTo("HT-R02");
assert.notEqual(thursday.project().posture,"STAND_WALK",
  "Holy Thursday movement imposed on nonparticipant");
thursday.setJoiningState("JOINING");
assert.equal(thursday.project().posture,"STAND_WALK");
thursday.setJoiningState("NOT_JOINING");
assert.notEqual(thursday.project().posture,"STAND_WALK");
const genericPayload=json("../data/presentation/reader-generic-procession.v1.json");
const genericArgs={graph:graphs.PROC,payload:genericPayload};
const genericBuilt=buildGenericProcessionReader(genericArgs);
assert.equal(genericBuilt.surfaces.length,3);
assert.equal(genericBuilt.feastSpecificTextOwned,false,
  "Generic procession must not invent Mass/procession hymn texts");
assert.ok(genericBuilt.surfaces.every(s=>s.paragraphs.length===0));
const generic=createGenericProcessionReaderController(genericArgs);
generic.goTo("PROC-100-020");
assert.equal(generic.project().posture,"LOCAL");
generic.setParticipating(true);
assert.equal(generic.project().posture,"PROCESSIONAL");
generic.goTo("PROC-100-030");
assert.equal(generic.project().handoff,"POST_MASS_LIFECYCLE");
console.log("PASS eight source-pinned annexed rites, branch and handoff invariant matrix");
console.log(JSON.stringify({version:"2026-10-19",coverage,
  generic:{graphRecords:graphs.PROC.length,surfaces:genericBuilt.surfaces.length,
    textSourceStatus:"STRUCTURAL_ONLY_NO_FEAST_TEXT"}},null,2));
