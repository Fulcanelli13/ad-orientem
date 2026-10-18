import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CANONICAL_TEXT_CORRECTIONS,
  getCanonicalTextCorrections,
  applyCanonicalTextCorrection,
} from "../src/mass/canonical-text-corrections.js";

const manifest=JSON.parse(readFileSync(new URL("../data/mass/canonical-text-corrections.v1.json",import.meta.url),"utf8"));
const low=JSON.parse(readFileSync(new URL("../data/presentation/reader-text-low.v1.json",import.meta.url),"utf8"));
const sung=JSON.parse(readFileSync(new URL("../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));

for(const row of manifest.corrections){
  const spec=getCanonicalTextCorrections(row.cueId).find(rule=>rule.field===row.field);
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
    assert.ok(corrected[row.field].includes(row.to),corpus.form+" correction not applied at "+row.cueId);
    for(const field of ["latin","english"]){
      if(field!==row.field && !manifest.corrections.some(other=>other.cueId===row.cueId&&other.field===field))assert.equal(corrected[field],unit[field],
        row.cueId+": correction changed unowned "+field+" field");
    }
    assert.ok(corrected.canonicalCorrectionIds.includes(row.id));
    const twice=applyCanonicalTextCorrection(row.blockId,corrected);
    assert.equal(twice[row.field],corrected[row.field],"correction must be idempotent");
  }
}

for(const corpus of [low,sung]){
  const unit=corpus.blocks.find(x=>x.Block_ID==="AO.SM.B007")
    .units.find(x=>x.cue_id==="AO.SM.C0023");
  const corrected=applyCanonicalTextCorrection("AO.SM.B007",unit);
  assert.match(corrected.latin,/oráre pro me/u);
  assert.match(corrected.english,/and you, Father, to pray/u);
  assert.equal(corrected.canonicalCorrectionId,"P1-011");
  assert.deepEqual(corrected.canonicalCorrectionIds,["P1-011","RED-EN-2013-W4-01"]);
  assert.equal(unit.english.includes("and thee Father, to pray"),true);
  assert.match(unit.latin,/oráre pro me|orare pro me/u,
    "C0023 frozen donor must have recognizable source Latin");
}

for(const corpus of [low,sung]){
  const units=corpus.blocks.find(b=>b.Block_ID==="AO.SM.B027").units;
  const clause=["AO.SM.C0100","AO.SM.C0101","AO.SM.C0102"]
    .map(id=>applyCanonicalTextCorrection("AO.SM.B027",units.find(u=>u.cue_id===id)).english)
    .join(" ");
  assert.equal(clause,
    "Who, together with the Father and the Son, is adored and glorified: who spoke by the Prophets.",
    "Creed English must keep the full 1962 meaning without duplicated 'together'");
}

// Wave 5: independently check the full prayer, not only the substitution
// fragment. Psalm 140's final clause must express Latin verba malitiae
// and ad excusandas excusationes in peccatis in both forms.
for(const corpus of [low,sung]){
  const byCue=new Map(corpus.blocks.flatMap(b=>(b.units??[]).map(u=>[u.cue_id,{blockId:b.Block_ID,unit:u}])));
  const projected=id=>{
    const v=byCue.get(id);
    assert.ok(v,"Missing source cue "+id);
    return applyCanonicalTextCorrection(v.blockId,v.unit);
  };
  const psalm=projected("AO.SM.C0122");
  assert.match(psalm.latin,/verba malítiæ|verba malítiæ/u);
  assert.match(psalm.english,/words of malice, to make excuses for sins/u);
  assert.ok(!psalm.english.includes("deeds of wickedness"),
    "Inherited Psalm 140 semantic mistranslation survived");
  assert.match(psalm.english,/Let my prayer rise before Thee as incense/u);
  const canonOpening=["AO.SM.C0150","AO.SM.C0151","AO.SM.C0152"]
    .map(id=>projected(id).english).join(" ");
  assert.match(canonOpening,/through Jesus Christ Thy Son, our Lord, to accept and bless these gifts/u);
  const canonOblation=["AO.SM.C0163","AO.SM.C0164","AO.SM.C0165",
    "AO.SM.C0166","AO.SM.C0167"].map(id=>projected(id).english).join(" ");
  assert.match(canonOblation,/make this same offering wholly blessed, approved, ratified, reasonable and acceptable/u);
  // English editorial ownership never modifies a frozen Latin source.
  for(const id of ["AO.SM.C0122","AO.SM.C0150","AO.SM.C0151","AO.SM.C0163","AO.SM.C0164"]){
    assert.equal(projected(id).latin,byCue.get(id).unit.latin);
  }
}

assert.throws(
  ()=>applyCanonicalTextCorrection("AO.SM.BAD",{cue_id:"AO.SM.C0148",latin:"Benedíctus qui venit"}),
  /block ownership changed/
);

console.log("canonical text corrections: PASS — "+manifest.corrections.length+" source-owned LATIN/ENGLISH field corrections applied before runtime projection.");
