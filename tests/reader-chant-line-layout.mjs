import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {insertChantPhraseBreaks,CHANT_PHRASE_CUE_IDS} from "../src/mass/reader-chant-line-layout.js";
import {normalizeReaderMoment} from "../src/mass/reader-dom.js";

const sung=JSON.parse(readFileSync(new URL("../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
const french=JSON.parse(readFileSync(new URL("../data/presentation/reader-french-ordinary.v1.json",import.meta.url),"utf8"));
const units=new Map(sung.blocks.flatMap(b=>(b.units??[]).map(u=>[u.cue_id,u])));
assert.equal(CHANT_PHRASE_CUE_IDS.length,7);
for(const id of CHANT_PHRASE_CUE_IDS){
  const source=units.get(id);
  assert.ok(source?.latin && source?.english,id+": no source-backed phrase");
  for(const value of [source.latin,source.english,french.byCue[id]]){
    assert.ok(value,id+": missing one bilingual text");
    const display=insertChantPhraseBreaks(value,[id]);
    assert.equal(display.replace(/\s+/g," ").trim(),value.replace(/\s+/g," ").trim(),
      id+": display-only breaks altered prayer words");
    assert.ok(!display.includes("\n\n"),id+": blank chant display line");
  }
}
for(const id of ["AO.SM.C0055","AO.SM.C0094","AO.SM.C0097","AO.SM.C0103"]){
  assert.ok(insertChantPhraseBreaks(units.get(id).latin,[id]).includes("\n"),
    id+": source-backed phrase display still crammed into a single line");
}
const sample=units.get("AO.SM.C0055");
assert.equal(insertChantPhraseBreaks(sample.latin,["AO.SM.C0054"]),sample.latin,
  "phrase break misapplied to a different cue");
assert.equal(insertChantPhraseBreaks(sample.latin,["AO.SM.C0055","AO.SM.C0054"]),sample.latin,
  "composite cue must never be split into pseudo gestures");
const moment=normalizeReaderMoment({cardTitle:"Gloria",paragraphs:[{
  id:sample.cue_id,kind:"TEXT",primary:sample.latin,alternate:sample.english,
  sourceCueIds:[sample.cue_id],replaceOnToggle:true,speakerRole:"SCHOLA",
}]});
assert.ok(moment.paragraphs[0].primary.includes("\n"),"native reader did not project visual chant phrase breaks");
assert.equal(moment.paragraphs[0].speakerRole,"SCHOLA");
assert.deepEqual(moment.paragraphs[0].sourceCueIds,[sample.cue_id]);
console.log("Mass chant paragraphs PASS — Latin/English/French phrase lines, original words/cue ownership conserved.");
