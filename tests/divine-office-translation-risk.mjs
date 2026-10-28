import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {triLanguageRisks} from "../scripts/office/audit-translation-risks.mjs";
const latinBody="Psalmus 109 ".repeat(18);
const normalEn="The Lord said to my Lord ".repeat(14);
const normalFr="Le Seigneur a dit à mon Seigneur ".repeat(12);
const source=(language,text)=>{
  return {
    schema:"ao.office.source-cells.v1",
    date:"2026-11-02",hour:"VESPERS",language,
    status:"STRUCTURED_UNVERIFIED",publishable:false,
    sourceRevision:DIVINUM_OFFICIUM_PIN,
    sections:[{index:1,sourceCellId:language==="la"?"Vespera1":language==="en"?"Vespera2":"Vespera3",
      text,semantic:{latinSourceCellId:"Vespera1",role:"PSALMODY"}}],
  };
};
test("tri-language audit screens all translated cells but never certifies any",()=>{
  const x=triLanguageRisks({latin:source("la",latinBody),
    english:source("en",normalEn),french:source("fr",normalFr)});
  assert.equal(x.localeCellsScreened,2);
  assert.equal(x.flagCount,0);
  assert.equal(x.manualTranslationReviewRequired,true);
  assert.equal(x.translationCertified,false);
});
test("source-identical long blocks are flagged for manual review, not auto-rejected",()=>{
  const x=triLanguageRisks({latin:source("la",latinBody),
    english:source("en",latinBody),french:source("fr",normalFr)});
  assert.equal(x.flagCount,1);
  assert.ok(x.flags[0].reason.includes("LONG_CELL_IDENTICAL_TO_LATIN"));
  assert.equal(x.flags[0].latinSourceCellId,"Vespera1");
});
test("suspiciously small source translations get flagged but exact textual correctness is not inferred",()=>{
  const x=triLanguageRisks({latin:source("la",latinBody),
    english:source("en","Abbreviated"),french:source("fr",normalFr)});
  assert.equal(x.flagCount,1);
  assert.ok(x.flags[0].reason.includes("EXTREME_LENGTH_RATIO"));
});
test("translation audit cannot accept a mismatched or promoted document",()=>{
  const latin=source("la",latinBody);
  const english=source("en",normalEn);
  const french=source("fr",normalFr);
  assert.throws(()=>triLanguageRisks({latin,english:{...english,date:"2026-11-03"},french}),/CONTEXT_MISMATCH/);
  assert.throws(()=>triLanguageRisks({latin,english:{...english,status:"READY",publishable:true},french}),/SOURCE_INVALID/);
  assert.throws(()=>triLanguageRisks({latin,english:{...english,sections:[]},french}),/SOURCE_INVALID/);
  assert.throws(()=>triLanguageRisks({latin,english:{...english,sections:english.sections.map(x=>({...x,semantic:{latinSourceCellId:"Vespera0"}}))},french}),/ALIGNMENT_INVALID/);
});
