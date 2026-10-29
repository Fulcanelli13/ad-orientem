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
test("the exact Prime beneficiary mismatch stays blocked across calendar years",()=>{
  for(const date of ["2026-11-02","2027-11-02","2031-11-03"]){
    const l=doc("la",latin.sections[0].text,date);
    const e=doc("en",english.sections[0].text,date);
    const blocks=officeTranslationContentBlockers({latin:l,translation:e});
    assert.equal(blocks.length,1,date);
    assert.equal(blocks[0].date,date);
    assert.equal(blocks[0].translationSourceCellId,"Prima5");
    assert.throws(()=>validateResearchOfficePair({latin:l,translation:e,locale:"en"}),
      /CONTENT_SCOPE_MISMATCH/,date);
  }
});
test("known content-scope gate is narrow and does not alter source text",()=>{
  const originalLatin=latin.sections[0].text;
  const originalEnglish=english.sections[0].text;
  const otherDay="2026-11-03";
  const other=doc("en",originalEnglish,otherDay,"VESPERS");
  const otherLatin=doc("la",originalLatin,otherDay,"VESPERS");
  assert.deepEqual(officeTranslationContentBlockers({latin:otherLatin,translation:other}),[]);
  assert.deepEqual(officeTranslationContentBlockers({
    latin,translation:doc("en","O God, grant rest unto the souls of all the faithful departed")
  }),[]);
  assert.deepEqual(officeTranslationContentBlockers({
    latin:doc("la","Martyrologium. Deus, veniae largitor pro congregatione"),
    translation:english,
  }),[]);
  assert.throws(()=>officeTranslationContentBlockers({
    latin,translation:doc("en",originalEnglish,"2026-10-31")
  }),/CONTEXT_OR_PIN_INVALID/);
  assert.equal(latin.sections[0].text,originalLatin);
  assert.equal(english.sections[0].text,originalEnglish);
});


test("omitted French XXIII Sunday commemoration blocks otherwise aligned Vespers",()=>{
  const v=(language,date,text)=>({
    ...doc(language,text,date,"VESPERS"),headline:"Omnium Sanctorum",
    sections:[{sourceCellId:"Vespera10",index:1,sourceIndex:1,text,
      semantic:{role:"PRAYER",latinSourceCellId:"Vespera10"}}],
  });
  const comm="Commemoratio Dominica XXIII Post Pentecosten I. Novembris";
  const latin=v("la","2026-11-01","Oratio Omnium Sanctorum.\n"+comm+
    "\nAnt. At Jesus conversus.\n℣. Dirigatur Domine.\nAbsolve quaesumus Domine.");
  const missing=v("fr","2026-11-01","Oraison de Tous les Saints. Ainsi soit-il.");
  const blocks=officeTranslationContentBlockers({latin,translation:missing});
  assert.equal(blocks.length,1);
  assert.equal(blocks[0].reason,"FR_VESPERS_SUNDAY_COMMEMORATION_INCOMPLETE");
  assert.equal(blocks[0].translationSourceCellId,"Vespera10");
  assert.equal(blocks[0].canPublish,false);
  assert.throws(()=>validateResearchOfficePair({latin,translation:missing,locale:"fr"}),
    /CONTENT_SCOPE_MISMATCH/);
  const corrected=v("fr","2026-11-01",
    "Commémoraison du dimanche. Jésus se retournant.\n"+
    "Pardonnez, nous vous en supplions, Seigneur, les offenses de vos peuples.");
  assert.deepEqual(officeTranslationContentBlockers({latin,translation:corrected}),[]);
  const firstLatin=v("la","2026-10-31",comm+"\nAnt. Vidi Dominum sedentem.");
  const firstFrench=v("fr","2026-10-31","Commémoraison du dimanche. Je vis le Seigneur assis sur un trône élevé. Pardonnez, nous vous en supplions, Seigneur, les offenses de vos peuples.");
  assert.deepEqual(officeTranslationContentBlockers({latin:firstLatin,translation:firstFrench}),[]);
  const irrelevant=v("la","2026-11-01","Oratio Omnium Sanctorum.");
  assert.deepEqual(officeTranslationContentBlockers({latin:irrelevant,translation:missing}),[]);
  for(const date of ["2027-11-01","2031-11-01"]){
    const more=officeTranslationContentBlockers({latin:{...latin,date},
      translation:{...missing,date}});
    assert.equal(more.length,1,date);
  }
});


test("French II Vespers missing component is caught when heading and antiphon span cells",()=>{
  const make=(lang,date,header,second)=>({
    schema:"ao.office.source-cells.v1",date,hour:"VESPERS",language:lang,
    sourceRevision:DIVINUM_OFFICIUM_PIN,
    sections:[
      {sourceCellId:"Vespera9",semantic:{role:"PRAYER"},text:header},
      {sourceCellId:"Vespera10",semantic:{role:"PRAYER"},text:second},
    ],
  });
  const latin=make("la","2026-11-01",
    "Oratio Omnium Sanctorum\nCommemoratio Dominica XXIII Post Pentecosten I. Novembris",
    "Ant. At Jesus conversus, et videns eam dixit.\nAbsolve, quaesumus, Domine.");
  const fr=make("fr","2026-11-01","Oraison des saints.","Conclusion.");
  const found=officeTranslationContentBlockers({latin,translation:fr});
  assert.equal(found.length,1);
  assert.equal(found[0].reason,"FR_VESPERS_SUNDAY_COMMEMORATION_INCOMPLETE");
  assert.equal(found[0].translationSourceCellId,"Vespera9");
  const saturday=make("la","2026-10-31",
    "Oratio Omnium Sanctorum\nCommemoratio Dominica XXIII Post Pentecosten I. Novembris",
    "Ant. Vidi Dominum sedentem. Absolve, quaesumus, Domine.");
  const satFr=make("fr","2026-10-31","Commémoraison du dimanche",
    "Je vis le Seigneur assis. Pardonnez, nous vous en supplions, Seigneur.");
  assert.deepEqual(officeTranslationContentBlockers({latin:saturday,translation:satFr}),[]);
});
