import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CANONICAL_TEXT_CORRECTIONS,
  applyCanonicalTextCorrection,
} from "../src/mass/canonical-text-corrections.js";

const manifest=JSON.parse(readFileSync(new URL("../data/mass/canonical-text-corrections.v1.json",import.meta.url),"utf8"));
const low=JSON.parse(readFileSync(new URL("../data/presentation/reader-text-low.v1.json",import.meta.url),"utf8"));
const sung=JSON.parse(readFileSync(new URL("../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));

for(const row of manifest.corrections){
  const spec=CANONICAL_TEXT_CORRECTIONS[row.cueId];
  assert.ok(spec,row.cueId+" missing JS correction");
  assert.equal(spec.blockId,row.blockId);
  assert.equal(spec.from,row.from);
  assert.equal(spec.to,row.to);
}

for(const corpus of [low,sung]){
  for(const row of manifest.corrections){
    const block=corpus.blocks.find(b=>b.Block_ID===row.blockId);
    assert.ok(block,corpus.form+" missing "+row.blockId);
    const unit=(block.units??[]).find(u=>u.cue_id===row.cueId);
    assert.ok(unit,corpus.form+" missing "+row.cueId);
    const corrected=applyCanonicalTextCorrection(row.blockId,unit);
    assert.ok(corrected.latin.includes(row.to),corpus.form+" correction not applied at "+row.cueId);
    assert.equal(corrected.canonicalCorrectionId,row.id);
    const twice=applyCanonicalTextCorrection(row.blockId,corrected);
    assert.equal(twice.latin,corrected.latin,"correction must be idempotent");
  }
}

assert.throws(
  ()=>applyCanonicalTextCorrection("AO.SM.BAD",{cue_id:"AO.SM.C0148",latin:"Benedíctus qui venit"}),
  /block ownership changed/
);

console.log("canonical text corrections: PASS — 5 reconciled cue corrections applied before runtime projection.");
