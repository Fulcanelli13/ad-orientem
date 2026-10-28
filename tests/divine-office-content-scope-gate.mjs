import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {officeTranslationContentBlockers,OFFICE_SOURCE_CONTENT_GATE_VERSION}
  from "../src/office/source-content-gate.js";
import {validateResearchOfficePair} from "../src/office/research-reader.js";
const doc=(language,prayer,date="2026-11-02",hour="PRIME")=>({
  schema:"ao.office.source-cells.v1",
  date,hour,language,sourceRevision:DIVINUM_OFFICIUM_PIN,
  status:"STRUCTURED_UNVERIFIED",publishable:false,
  verification:{rubrical:false,languageCompleteness:false},
  headline:"All Souls",
  sections:[{
    index:1,sourceIndex:1,sourceCellId:"Prima5",text:prayer,
    semantic:{role:"MARTYROLOGY",latinSourceCellId:"Prima5"},
  }],
});
const latin=doc("la","Martyrologium. Deus, véniæ largítor; ut ánimas ómnium fidélium qui ex hoc sǽculo transiérunt.");
const english=doc("en","Martyrology. O God, the giver of pardon, grant the brethren of our congregation, kinsfolk, and benefactors.");
const french=doc("fr","Martyrologe. Ô Dieu, pour les âmes de tous les fidèles.");
test("the known All Souls English Prime beneficiary mismatch is a hard reader blocker",()=>{
  assert.equal(OFFICE_SOURCE_CONTENT_GATE_VERSION,"ao.office.content-gate.v1");
  const result=officeTranslationContentBlockers({latin,translation:english});
  assert.equal(result.length,1);
  assert.equal(result[0].translationSourceCellId,"Prima5");
  assert.equal(result[0].reason,"EN_PRIME_RECIPIENT_SCOPE_MISMATCH");
  assert.equal(result[0].canPublish,false);
  assert.throws(()=>validateResearchOfficePair({latin,translation:english,locale:"en"}),/CONTENT_SCOPE_MISMATCH/);
  assert.equal(officeTranslationContentBlockers({latin,translation:french}).length,0);
});
test("the strict mismatch rule must not delete arbitrary prayers or expand into other dates",()=>{
  const other=doc("en",english.sections[0].text,"2026-11-03");
  const otherLatin=doc("la",latin.sections[0].text,"2026-11-03");
  assert.deepEqual(officeTranslationContentBlockers({latin:otherLatin,translation:other}),[]);
  assert.deepEqual(officeTranslationContentBlockers({
    latin,translation:doc("en","O God, grant rest unto the souls of all the faithful departed")
  }),[]);
  assert.throws(()=>officeTranslationContentBlockers({
    latin,translation:doc("en",english.sections[0].text,"2026-10-31")
  }),/CONTEXT_OR_PIN_INVALID/);
});
