import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {
  PRIME_LITURGICAL_WITNESSES,auditAllSoulsPrime
} from "../scripts/office/audit-all-souls-prime-critical.mjs";
const text={
  la:"Martyrologium {anticipatur}\nV. In memória ætérna erunt justi.\nR. Ab auditióne mala non timébunt.\nv. Deus, véniæ largítor, ut ánimas ómnium fidélium qui ex hoc sǽculo transiérunt.",
  en:"Martyrology {anticipated}\nV. The just shall be in everlasting remembrance.\nv. O God the giver of pardon: that thou grant the brethren of our congregation, kinsfolk, and benefactors.",
  fr:"Martyrologe {anticipé}\nV. En souvenir éternel seront les justes.\nv. Ô Dieu, qui donnez le pardon, aux âmes de tous les fidèles qui sont sortis de ce monde.",
};
const document=(language,body=text[language])=>({
  schema:"ao.office.source-cells.v1",
  sourceRevision:DIVINUM_OFFICIUM_PIN,
  status:"STRUCTURED_UNVERIFIED",publishable:false,
  date:"2026-11-02",hour:"PRIME",language,
  sections:["Prima4","Prima5","Prima6"].map((id,i)=>({
    index:i+1,sourceIndex:i+1,sourceCellId:id,
    text:id==="Prima5"?body:i===0?"Oratio\nTest prayer":"Conclusio",
    semantic:{role:id==="Prima5"?"MARTYROLOGY":id==="Prima4"?"PRAYER":"CONCLUSION",
      latinSourceCellId:id},
  })),
});
test("All Souls Prime report blocks mismatched English while preserving source evidence",()=>{
  const report=auditAllSoulsPrime({
    latin:document("la"),english:document("en"),french:document("fr")
  });
  assert.equal(report.sourceRevision,DIVINUM_OFFICIUM_PIN);
  assert.equal(report.recipientScope.mismatch,true);
  assert.equal(report.recipientScope.englishVariantFromRomanProperEstablished,false);
  assert.equal(report.martyrologyCalendarDate,"2026-11-03");
  assert.equal(report.martyrology2026_11_03TextVerified,false);
  assert.equal(report.martyrology1961VariationAppliedAndVerified,false);
  assert.equal(report.primeCollectComparedAgainstPrintedRomanProper,false);
  assert.equal(report.readyForPublicReader,false);
  assert.equal(report.published,0);
  assert.equal(report.sourceCellSha256.latin.length,64);
  assert.equal(report.sourceCellSha256.french.length,64);
  assert.equal(report.martyrologySourceContainsMarker.french,true);
});
test("source contract fails on fake dates, semantics, placeholders and absent sections",()=>{
  const normal={latin:document("la"),english:document("en"),french:document("fr")};
  assert.throws(()=>auditAllSoulsPrime({...normal,
    french:{...normal.french,date:"2026-11-03"}
  }),/INVALID_SOURCE/);
  assert.throws(()=>auditAllSoulsPrime({...normal,
    english:{...normal.english,sections:normal.english.sections.slice(0,2)}
  }),/SOURCE_MISSING_ID/);
  assert.throws(()=>auditAllSoulsPrime({...normal,
    latin:document("la","special is missing")
  }),/MARTYROLOGY_SOURCE_UNRESOLVED/);
  assert.throws(()=>auditAllSoulsPrime({...normal,
    french:{...normal.french,sections:normal.french.sections.map(s=>
      s.sourceCellId==="Prima5"?{...s,semantic:{...s.semantic,role:"PRAYER"}}:s)}
  }),/MARTYROLOGY_SOURCE_UNRESOLVED/);
});
test("printed rubrical witnesses are referenced but not misrepresented as proof of the whole 1960 Martyrology",()=>{
  assert.match(PRIME_LITURGICAL_WITNESSES.romanMartyrologyChanges1960,/Martyrologio/);
  assert.equal(PRIME_LITURGICAL_WITNESSES.printedMartyrologyFor2026_11_03FullyCollated,false);
  assert.equal(PRIME_LITURGICAL_WITNESSES.printedRomanPrayerFor2026_11_02FullyCollated,false);
});
