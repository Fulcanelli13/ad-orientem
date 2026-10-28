import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_OFFICE_PIN} from "../src/office/generator-probe-contract.js";
import {SUNDAY_VESPERS_SLOTS,identifySundayVespers,auditNativeSungVespers} from "../src/office/sung-vespers-gate.js";
import {SOURCES,PILOT_SUNDAY,inspectCandidateGabc,inspectAdventPsalmTemplate} from "../scripts/office/audit-sunday-chant.mjs";

const makeOffice=()=>({
  schema:"ao.office.source-cells.v1",language:"la",hour:"VESPERS",
  date:"2026-11-29",sourceRevision:DIVINUM_OFFICIUM_OFFICE_PIN,
  status:"STRUCTURED_UNVERIFIED",publishable:false,
  verification:{structural:true,rubrical:false,independentPrintedBreviary:false},
  sections:Array.from({length:10},(_,i)=>({index:i+1,sourceCellId:"Vespera"+(i+1),text:"Evidence"})),
});
const precedence=()=>({
  part:"SECOND",sundayDate:"2026-11-29",officeDate:"2026-11-29",
  sourceCalendar:"ROMAN_1960",verified:true,printedWitnesses:["Breviarium Romanum 1961"],
  commemorationsChecked:true,expectedCommemorationChants:0,
});
const slots=()=>SUNDAY_VESPERS_SLOTS.map(id=>({
  id,path:"data/office/chant/advent1/"+id+".gabc",sha256:"a".repeat(64),
  copyright:"CC0",rightsReviewed:true,musicTextVerified:true,svgRenderVerified:true,
  provenance:"Gregobase matched score transcription",scoreEdition:"Roman 1961 sung score",
}));
const chant=()=>({
  schema:"ao.office.sung-vespers.scores.v1",date:"2026-11-29",
  sundayDate:"2026-11-29",part:"SECOND",
  isNative:true,requiresExternalVisit:false,
  sourceWitnessConfirmed:true,complete1960RubricCoverage:true,
  textMusicAlignmentVerified:true,additionalCommemorationSlots:[],
  slots:slots(),
});

test("Only Sunday or immediately preceding Saturday First Vespers can qualify",()=>{
  assert.deepEqual(identifySundayVespers({date:"2026-11-28",part:"FIRST",sundayDate:"2026-11-29"}),
    {valid:true,part:"FIRST",sundayDate:"2026-11-29",officeDate:"2026-11-28"});
  assert.equal(identifySundayVespers({date:"2026-11-29",part:"SECOND",sundayDate:"2026-11-29"}).valid,true);
  assert.equal(identifySundayVespers({date:"2026-11-29",part:"FIRST",sundayDate:"2026-11-29"}).valid,false);
  assert.equal(identifySundayVespers({date:"2026-11-27",part:"FIRST",sundayDate:"2026-11-29"}).valid,false);
  assert.equal(identifySundayVespers({date:"2026-11-30",part:"SECOND",sundayDate:"2026-11-29"}).valid,false);
  assert.equal(identifySundayVespers({date:"2026-02-29",part:"SECOND",sundayDate:"2026-02-29"}).valid,false);
});
test("Research Office from Phase C never displays a Sung Vespers button",()=>{
  const result=auditNativeSungVespers({office:makeOffice(),precedence:precedence(),chant:chant()});
  assert.equal(result.eligible,false);
  assert.equal(result.buttonVisible,false);
  assert.ok(result.issues.includes("OFFICE_TEXT_UNCERTIFIED"));
  assert.equal(result.requiredSlotCount,18);
});
test("Even a hypothetical certified Office requires every locally verified music slot",()=>{
  const office={...makeOffice(),status:"CERTIFIED",publishable:true,
    verification:{structural:true,rubrical:true,independentPrintedBreviary:true}};
  const all=auditNativeSungVespers({office,precedence:precedence(),chant:chant()});
  assert.equal(all.eligible,true); // Contract-only fully certified fixture, not actual content.
  assert.equal(all.requiredSlotCount,18);
  const noMagn=chant();
  noMagn.slots=noMagn.slots.filter(s=>s.id!=="magnificat-tone");
  const result=auditNativeSungVespers({office,precedence:precedence(),chant:noMagn});
  assert.equal(result.buttonVisible,false);
  assert.ok(result.issues.includes("MISSING_MAGNIFICAT_TONE"));
  const withExternal=chant();
  withExternal.slots[0]={...withExternal.slots[0],path:"https://example.com/deus.gabc"};
  assert.ok(auditNativeSungVespers({office,precedence:precedence(),chant:withExternal})
    .issues.includes("NONLOCAL_SCORE"));
  const withUnreviewed=chant();
  withUnreviewed.slots[0]={...withUnreviewed.slots[0],rightsReviewed:false};
  assert.ok(auditNativeSungVespers({office,precedence:precedence(),chant:withUnreviewed})
    .issues.includes("SCORE_RIGHTS_UNVERIFIED"));
  const withCommem=precedence();
  withCommem.expectedCommemorationChants=1;
  assert.ok(auditNativeSungVespers({office,precedence:withCommem,chant:chant()})
    .issues.includes("COMMEMORATION_MUSIC_UNVERIFIED"));
  const withWrong=chant();
  withWrong.date="2026-11-28";
  assert.ok(auditNativeSungVespers({office,precedence:precedence(),chant:withWrong})
    .issues.includes("CHANT_CONTEXT"));
});
test("Advent I candidate inventory includes scores but not presumed psalm-tone or collation proof",()=>{
  assert.equal(PILOT_SUNDAY,"2026-11-29");
  assert.equal(SOURCES.length,10);
  assert.equal(SOURCES.filter(([id])=>id.startsWith("antiphon-")).length,5);
  const gabc="name: In illa die;\nmode: 8G;\ntranscriber: Test;\n%%\n(c4)In(g) il(h)la(h) di(g)e(h.) (::)";
  const plain=inspectCandidateGabc({id:"antiphon-1",path:"test.gabc",content:gabc});
  assert.equal(plain.mode,"8G");
  assert.equal(plain.requiresGabcAdaptation,false);
  assert.equal(plain.usableInApp,false);
  assert.equal(plain.scoreRights,"UNREVIEWED");
  const complex=inspectCandidateGabc({id:"antiphon-2",path:"complex.gabc",
    content:gabc.replace("il(h)la","il(h)la\\greglyph{\\char 23}")});
  assert.equal(complex.requiresGabcAdaptation,true);
  assert.ok(complex.unsupportedMacroCandidates.length>0);
  const template=[1,2,3,4,5].map((i)=>
    "\\definepsalm{"+i+"}{"+(108+i)+"}{8}{G}").join("\n")+
    "\n\\definemag{8}{G}";
  const result=inspectAdventPsalmTemplate(template);
  assert.equal(result.psalms.length,5);
  assert.equal(result.magnificat.tone,8);
  assert.equal(result.psalms.every(x=>x.scoreVerified===false),true);
  assert.throws(()=>inspectAdventPsalmTemplate("\\definepsalm{1}{109}{8}{G}"),/INCOMPLETE/);
});
