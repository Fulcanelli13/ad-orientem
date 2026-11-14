import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_OFFICE_PIN} from "../src/office/generator-probe-contract.js";
import {SUNDAY_VESPERS_SLOTS,identifySundayVespers,auditNativeSungVespers} from "../src/office/sung-vespers-gate.js";
import {SOURCES,PILOT_SUNDAY,inspectCandidateGabc,inspectAdventPsalmTemplate} from "../scripts/office/audit-sunday-chant.mjs";
import {auditSundayPair,inspectVespersText} from "../scripts/office/audit-advent-vespers-text.mjs";

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

test("Second Advent Vespers score incipits match only the correct Sunday selection",()=>{
  const latin=(date,psalms,magn)=>({
    schema:"ao.office.source-cells.v1",date,language:"la",hour:"VESPERS",
    status:"STRUCTURED_UNVERIFIED",publishable:false,
    sourceRevision:DIVINUM_OFFICIUM_OFFICE_PIN,
    headline:"Dominica I Adventus",
    sections:[
      {index:1,sourceCellId:"Vespera1",semantic:{role:"OPENING"},text:"Incipit"},
      ...["In illa die","Iucundare","Ecce Dominus veniet","Omnes","Ecce veniet"].map((a,i)=>({
        index:i+2,sourceCellId:"Vespera"+(i+2),semantic:{role:"PSALMODY"},
        text:"Ant. "+a+" * laudamus.\nPsalmus "+psalms[i][0]+(psalms[i][1]?"("+psalms[i][1]+")":"")+" [1]"
      })),
      {index:7,sourceCellId:"Vespera7",semantic:{role:"CHAPTER_HYMN_VERSE"},text:"Capitulum"},
      {index:8,sourceCellId:"Vespera8",semantic:{role:"GOSPEL_CANTICLE"},
        text:"Canticum: Magnificat\nAnt. "+magn+" * gratia"},
      {index:9,sourceCellId:"Vespera9",semantic:{role:"PRAYER"},text:"Oratio"},
      {index:10,sourceCellId:"Vespera10",semantic:{role:"CONCLUSION"},text:"Conclusio"},
    ]
  });
  const first=latin("2026-11-28",[[109,null],[143,"9-15"],[144,"1-9"],[144,"10-13"],[144,"13b-21"]],"Ecce nomen Domini");
  const second=latin("2026-11-29",[[109,null],[110,null],[111,null],[112,null],[113,null]],"Ne timeas Maria");
  const result=auditSundayPair({first,second});
  assert.equal(result.textScoreCandidatesAligned,true);
  assert.equal(result.requiresDistinctFirstVespersMusic,true);
  assert.deepEqual(result.firstAntiphonsMatched,[true,true,true,true,true]);
  assert.deepEqual(result.secondAntiphonsMatched,[true,true,true,true,true]);
  assert.equal(result.scoresPublished,0);
  assert.equal(result.sungButtonEnabled,false);
  const wrong={...second,date:"2026-11-30"};
  assert.throws(()=>auditSundayPair({first,second:wrong}),/DATES_MISMATCH/);
  const mismatched=latin("2026-11-29",[[109,null],[110,null],[111,null],[112,null],[113,null]],"Different chant");
  const incorrect=auditSundayPair({first,second:mismatched});
  assert.equal(incorrect.secondMagnificatMatched,false);
  assert.equal(incorrect.textScoreCandidatesAligned,false);
  const missing={...second,sections:second.sections.map(s=>
    s.sourceCellId==="Vespera3"?{...s,text:"Ant. Iucundare"}:s)};
  assert.throws(()=>inspectVespersText(missing),/PSALM_NUMBER_MISSING/);
});
