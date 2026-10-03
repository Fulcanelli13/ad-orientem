import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createReaderSectionResolver } from "../src/mass/reader-sections.js";
import {
  validateReaderTextCorpus,
  selectReaderTextCorpus,
  buildReaderSectionCard,
} from "../src/mass/reader-text.js";

const load=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const low=load("../data/presentation/reader-text-low.v1.json");
const sung=load("../data/presentation/reader-text-sung.v1.json");
const map=load("../data/presentation/reader-section-map.v0.13.1.json");
const sections=createReaderSectionResolver(map);

const la=validateReaderTextCorpus(low);
const sa=validateReaderTextCorpus(sung);
assert.equal(la.blocks,96);
assert.equal(sa.blocks,96);
assert.equal(la.rawSha256,"2ed36ea25b00d515a9f4a6edd1e02da274ebb92c082ecaea4dfc73feade03044");
assert.equal(sa.rawSha256,"050ce4b65918890a252078c9942f1dde282d2494dabe0e522bb842c03be20b28");
assert.equal(la.properBlocks,11);
assert.equal(sa.properBlocks,11);

for(const corpus of [low,sung]){
  for(const block of corpus.blocks.filter(b=>b.Proper_Slot)){
    assert.ok(block.units.every(u=>u.latin===null && u.english===null),
      block.Block_ID+" leaked donor-date Proper text");
  }
}

assert.equal(selectReaderTextCorpus({form:"LOW",lowCorpus:low,sungCorpus:sung}).family,"LOW");
assert.equal(selectReaderTextCorpus({form:"MISSA_CANTATA_SIMPLE",lowCorpus:low,sungCorpus:sung}).family,"SUNG");
assert.equal(selectReaderTextCorpus({form:"SOLEMN",lowCorpus:low,sungCorpus:sung}).family,"SUNG");

const kyrie=buildReaderSectionCard({
  corpus:low,
  section:sections.sectionById("AO.CARD.002"),
});
assert.equal(kyrie.title,"Kyrie");
assert.ok(kyrie.paragraphs.length>0);
assert.ok(kyrie.paragraphs.every(p=>p.primary));

assert.throws(()=>buildReaderSectionCard({
  corpus:low,
  section:sections.sectionById("AO.CARD.001"),
}),/Proper slot INTROIT is unresolved/);

const slots=[
  "INTROIT","COLLECT_SET","EPISTLE_OR_LESSON","GRADUAL","ALLELUIA_TRACT_SEQUENCE",
  "GOSPEL","OFFERTORY","SECRET_SET","PREFACE","COMMUNION","POSTCOMMUNION_SET"
];
const properSlots=Object.fromEntries(slots.map(slot=>[slot,{
  status:"READY",
  data:{
    latin:"LATIN "+slot,
    english:"ENGLISH "+slot,
  }
}]));

for(const corpus of [low,sung]){
  for(const section of sections.sections){
    const card=buildReaderSectionCard({corpus,section,properSlots});
    assert.equal(card.sequence,section.sequence);
    assert.ok(card.paragraphs.length>0,section.sectionId+" built a blank card");
    assert.ok(card.paragraphs.every(p=>p.primary),section.sectionId+" has blank primary text");
  }
}

const introit=buildReaderSectionCard({
  corpus:low,
  section:sections.sectionById("AO.CARD.001"),
  properSlots,
});
assert.ok(introit.paragraphs.some(p=>p.primary==="ENGLISH INTROIT"),"resolved Proper was not inserted");
assert.ok(!introit.paragraphs.some(p=>/Salus p[oó]puli/i.test(p.primary)),"donor-date Introit leaked into generic card");

const lastGospel=buildReaderSectionCard({
  corpus:sung,
  section:sections.sectionById("AO.CARD.030"),
  properSlots,
});
assert.equal(lastGospel.title,"Last Gospel");
assert.ok(lastGospel.paragraphs.length>0);

console.log("reader text corpus: PASS — verified donors, Proper fail-closed, all 30 Low/Sung cards nonblank.");
