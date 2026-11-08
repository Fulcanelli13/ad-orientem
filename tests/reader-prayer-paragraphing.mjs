import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {readingPrayerFragments,PRAYER_READING_PARAGRAPHS_VERSION} from "../src/mass/reader-reading-paragraphs.js";
import {createReaderSectionResolver} from "../src/mass/reader-sections.js";
import {buildReaderSectionCard} from "../src/mass/reader-text.js";

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const corpora=[
  read("../data/presentation/reader-text-sung.v1.json"),
  read("../data/presentation/reader-text-low.v1.json"),
];
const sectionResolver=createReaderSectionResolver(read("../data/presentation/reader-section-map.v0.13.1.json"));
const row=(model,blockId,cueId)=>{
  const block=model.blocks.find(block=>block.Block_ID===blockId);
  assert.ok(block,blockId+" must exist");
  const cue=block.units.find(unit=>unit.cue_id===cueId);
  assert.ok(cue,cueId+" must exist");
  return cue;
};
const chunks=(text,block,kind="TEXT",mode="MISSAL")=>
  readingPrayerFragments(text,{sourceBlockId:block,kind,mode});
assert.equal(PRAYER_READING_PARAGRAPHS_VERSION,"mass-prayer-reading-paragraphs-v1");

for(const corpus of corpora){
  // The complete real reader projection must carry block IDs through to DOM.
  const canonCard=buildReaderSectionCard({
    corpus,section:sectionResolver.sectionById("AO.CARD.014"),
  });
  const paterCard=buildReaderSectionCard({
    corpus,section:sectionResolver.sectionById("AO.CARD.019"),
  });
  const teRow=canonCard.paragraphs.find(p=>p.id==="AO.SM.C0153");
  const paterRow=paterCard.paragraphs.find(p=>p.id==="AO.SM.C0209");
  assert.equal(teRow?.sourceBlockId,"AO.SM.B047");
  assert.equal(paterRow?.sourceBlockId,"AO.SM.B063");
  assert.ok(chunks(teRow.primary,teRow.sourceBlockId).length>=2,
    "Projected Te igitur must actually receive display breaks");
  assert.ok(chunks(paterRow.primary,paterRow.sourceBlockId).length>=4,
    "Projected Pater must actually receive display breaks");
  // Authentic 1962 Te igitur and Pater noster—not simulated samples.
  const te=row(corpus,"AO.SM.B047","AO.SM.C0153");
  assert.ok(chunks(te.latin,"AO.SM.B047").length>=3,"Te igitur petitions");
  const pater=row(corpus,"AO.SM.B063","AO.SM.C0209");
  assert.ok(chunks(pater.latin,"AO.SM.B063").length>=5,"Latin Pater noster petitions");
  assert.ok(chunks(pater.english,"AO.SM.B063").length>=4,"English Pater noster petitions");
  const libera=row(corpus,"AO.SM.B064","AO.SM.C0212");
  assert.ok(chunks(libera.latin,"AO.SM.B064").length>=2,"Libera nos invocation");

  let visited=0;
  for(const block of corpus.blocks){
    for(const unit of block.units??[]){
      for(const language of ["latin","english"]){
        const original=String(unit[language]??"");
        for(const mode of ["MISSAL","LIVE"]){
          const result=chunks(original,block.Block_ID,"TEXT",mode);
          assert.equal(result.join(""),original,
            block.Block_ID+"/"+unit.cue_id+"/"+language+"/"+mode+": content was altered");
          if(original)assert.ok(result.every(Boolean),"No empty synthetic prayer fragment");
          else assert.deepEqual(result,[""],"Empty canonical source stays empty");
        }
      }
      visited++;
    }
  }
  assert.ok(visited>200,"Substantial canonical source coverage");
  // The host/chalice Consecration and event-specific rubrics must not segment.
  const consecration=row(corpus,"AO.SM.B052","AO.SM.C0173");
  assert.equal(chunks(consecration.latin,"AO.SM.B052").length,1);
  const display=pater.latin;
  assert.equal(chunks(display,"AO.SM.B063","RUBRIC").length,1);
  assert.equal(chunks(display,"AO.SM.B063","CONSECRATION_WORDS").length,1);
  assert.equal(chunks(display,"AO.SM.B063","TEXT","SIMPLE").length,1);
  assert.equal(chunks(display,"AO.SM.B026").length,1,"Gospel not split");
  assert.equal(chunks("[A priestly ceremonial rubric with a colon: and a semicolon; of sufficient length that it could otherwise be split.]","AO.SM.B063").length,1);
}
const french="Notre Père, qui êtes aux cieux : que votre nom soit sanctifié ; que votre règne arrive ; que votre volonté soit faite sur la terre comme au ciel. Donnez-nous aujourd'hui notre pain quotidien ; pardonnez-nous nos offenses.";
const frenchParts=chunks(french,"AO.SM.B063");
assert.ok(frenchParts.length>=4,"French prayer supports native punctuation");
assert.equal(frenchParts.join(""),french);
console.log("Mass prayer reading paragraphing: bilingual preservation, real Canon/Pater/Libera, cue-safe modes passed");
