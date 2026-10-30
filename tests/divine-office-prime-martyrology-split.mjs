import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {
  splitAllSoulsPrimeMartyrologyCell,primeSplitRequired,
  OFFICE_PRIME_SOURCE_BOUNDARY
} from "../src/office/prime-martyrology-split.js";
import {
  projectOfficeMassStyleCards,renderOfficeMassStyleResearchReader
} from "../src/office/mass-style-research-reader.js";

const texts=Object.freeze({
  la:"Martyrologium {anticipatur}\nDie tertia Novembris\nSanctorum commemoratio\n"+
     "V. In memória ætérna erunt justi.\nR. Ab auditióne mala non timébunt.\n"+
     "Orémus\nv. Deus, véniæ largítor et humánæ salútis amátor.\nAmen.",
  fr:"Martyrologe {anticipé}\nLe trois novembre\nCommémoration des saints\n"+
     "V. En souvenir éternel seront les justes.\nR. L'annonce du malheur, ils ne la craindront pas.\n"+
     "Prions\nv. Ô Dieu, qui donnez le pardon et aimez le salut de l’homme.\nAmen.",
  en:"Martyrology {anticipated}\nThe third of November\nCommemoration of saints\n"+
     "V. The just shall be in everlasting remembrance.\nR. They will not fear.\n"+
     "Let us pray\nv. O God the giver of pardon and lover of human salvation.\nAmen.",
});
const source=(lang,date="2026-11-02")=>({
  schema:"ao.office.source-cells.v1",date,hour:"PRIME",language:lang,
  headline:"Commemoratio omnium fidelium defunctorum",
  sourceRevision:DIVINUM_OFFICIUM_PIN,
  status:"STRUCTURED_UNVERIFIED",publishable:false,
  verification:{rubrical:false,languageCompleteness:false},
  sections:[
    {index:1,sourceIndex:1,sourceCellId:"Prima1",
      text:"Prima Opening\n℣. Deus in adiutorium.",semantic:{role:"OPENING",latinSourceCellId:"Prima1"}},
    {index:2,sourceIndex:5,sourceCellId:"Prima5",
      text:texts[lang],semantic:{role:"MARTYROLOGY",latinSourceCellId:"Prima5"}},
    {index:3,sourceIndex:6,sourceCellId:"Prima6",
      text:"Conclusio\nFidelium animae",semantic:{role:"CONCLUSION",latinSourceCellId:"Prima6"}},
  ],
});
test("All Souls Prime splits at one independently anchored versicle in LA EN FR, losslessly",()=>{
  assert.equal(OFFICE_PRIME_SOURCE_BOUNDARY,"ao.office.prime-martyrology-source-boundary.v1");
  for(const [lang,text] of Object.entries(texts)){
    const s=splitAllSoulsPrimeMartyrologyCell(text,lang);
    assert.equal(s.sourceTextFullyPreserved,true);
    assert.equal(s.boundaryLine,3);
    assert.equal(s.martyrology+"\n"+s.postPrayer,text);
    assert.match(s.martyrology,/Novemb|novembre|November/i);
    assert.doesNotMatch(s.martyrology,/veniae|giver of pardon|donnez le pardon/i);
    assert.match(s.postPrayer,/deus|O God|Ô Dieu/i);
    assert.ok(!s.postPrayer.includes("Martyrologium"));
  }
});
test("pinned composer Latin iusti and source justi both split losslessly, never ambiguously",()=>{
  const original="V. In memória ætérna erunt justi.";
  const variants=[
    texts.la,
    texts.la.replace(original,"℣. In memória ætérna erunt iusti."),
    texts.la.replace(original,"℣. In memória ætérna erunt justi."),
  ];
  for(const sourceText of variants){
    const result=splitAllSoulsPrimeMartyrologyCell(sourceText,"la");
    assert.equal(result.boundaryLine,3);
    assert.equal(result.martyrology+"\n"+result.postPrayer,sourceText);
    assert.match(result.postPrayer,/Deus, véniæ largítor/);
  }
  const duplicate=texts.la.replace(original,
    "℣. In memória ætérna erunt iusti.\nV. In memória ætérna erunt justi.");
  assert.throws(()=>splitAllSoulsPrimeMartyrologyCell(duplicate,"la"),
    /OFFICE_PRIME_SPLIT_VERSICLE_BOUNDARY_AMBIGUOUS/);
});
test("source-part renderer keeps exactly one Prima5 identity but two ordered cards",()=>{
  const latin=source("la"),translation=source("fr");
  const original=latin.sections[1].text;
  const model=projectOfficeMassStyleCards({latin,translation,locale:"fr"});
  assert.equal(model.cards.length,4);
  assert.deepEqual(model.cards.map(c=>c.index),[0,1,2,3]);
  assert.equal(model.cards[1].sourceCellId,"Prima5");
  assert.equal(model.cards[2].sourceCellId,"Prima5");
  assert.deepEqual(model.cards.slice(1,3).map(c=>c.sourcePart),
    ["MARTYROLOGY_READING","POST_MARTYROLOGY_PRAYER"]);
  assert.equal(model.cards[1].latin+"\n"+model.cards[2].latin,original);
  assert.equal(model.cards[1].vernacular+"\n"+model.cards[2].vernacular,translation.sections[1].text);
  assert.equal(model.cards[1].translationAlignment,"SOURCE_ATTESTED_SEGMENT_ONLY");
  assert.equal(model.cards[2].translationAlignment,"SOURCE_ATTESTED_SEGMENT_ONLY");
  assert.equal(model.cards[3].sourceCellId,"Prima6");
  assert.equal(latin.sections[1].text,original);
  const html=renderOfficeMassStyleResearchReader({
    latin,translation,locale:"fr",availableHours:["PRIME"],availableDates:["2026-11-02"],
    availableLocales:["fr"],
  });
  assert.equal((html.match(/data-office-source-part="MARTYROLOGY_READING"/g)||[]).length,1);
  assert.equal((html.match(/data-office-source-part="POST_MARTYROLOGY_PRAYER"/g)||[]).length,1);
  assert.equal((html.match(/data-office-omit-martyrology/g)||[]).length,1);
  assert.match(html,/Hors du chœur/);
  assert.match(html,/data-office-total="4"/);
  assert.match(html,/data-office-research-only="true"/);
  assert.match(html,/data-office-published="false"/);
});
test("boundary is not manufactured for another date/hour/source role",()=>{
  assert.equal(primeSplitRequired({date:"2026-11-02",hour:"PRIME",
    role:"MARTYROLOGY",sourceCellId:"Prima5"}),true);
  for(const item of [
    {date:"2026-11-01",hour:"PRIME",role:"MARTYROLOGY",sourceCellId:"Prima5"},
    {date:"2026-11-02",hour:"LAUDS",role:"MARTYROLOGY",sourceCellId:"Prima5"},
    {date:"2026-11-02",hour:"PRIME",role:"PRAYER",sourceCellId:"Prima5"},
    {date:"2026-11-02",hour:"PRIME",role:"MARTYROLOGY",sourceCellId:"Prima6"}
  ])assert.equal(primeSplitRequired(item),false);
  assert.throws(()=>projectOfficeMassStyleCards({
    latin:source("la","2026-11-03"),translation:source("fr","2026-11-03"),locale:"fr"
  }),/ALL_SOULS_DATE_CONFLICT/);
});
test("All Souls Prime split follows the shared 1960 transfer date in future years",()=>{
  const isSplit=(date,hour="PRIME",role="MARTYROLOGY",sourceCellId="Prima5")=>
    primeSplitRequired({date,hour,role,sourceCellId});
  // 2026 and 2027: November 2 is not a Sunday.
  assert.equal(isSplit("2026-11-02"),true);
  assert.equal(isSplit("2027-11-02"),true);
  assert.equal(isSplit("2027-11-03"),false);
  // 2025 and 2031: November 2 falls on Sunday; the Office moves to Monday.
  for(const year of [2025,2031]){
    assert.equal(isSplit(year+"-11-02"),false);
    assert.equal(isSplit(year+"-11-03"),true);
  }
  for(const date of ["2031-11-02","2031-11-04","2026-11-03","2026-10-31",
                     "bogus","2026-11-02T00:00:00","0000-11-02"]){
    assert.equal(isSplit(date),false,date);
  }
  assert.equal(isSplit("2031-11-03","VESPERS"),false);
  assert.equal(isSplit("2031-11-03","PRIME","PRAYER"),false);
  assert.equal(isSplit("2031-11-03","PRIME","MARTYROLOGY","Prima6"),false);
});
test("future All Souls Prime has two source-lossless navigable cards, not a dropped prayer",()=>{
  for(const date of ["2027-11-02","2031-11-03"]){
    const latin=source("la",date);
    const french=source("fr",date);
    const model=projectOfficeMassStyleCards({latin,translation:french,locale:"fr"});
    assert.equal(model.cards.length,4,date);
    assert.deepEqual(model.cards.slice(1,3).map(c=>c.sourcePart),
      ["MARTYROLOGY_READING","POST_MARTYROLOGY_PRAYER"]);
    assert.equal(model.cards[1].latin+"\n"+model.cards[2].latin,latin.sections[1].text);
    assert.equal(model.cards[1].vernacular+"\n"+model.cards[2].vernacular,french.sections[1].text);
    assert.equal(model.cards[3].sourceCellId,"Prima6");
  }
  // Sunday Nov 2 cannot render an All Souls source as the ordinary Office.
  assert.throws(()=>projectOfficeMassStyleCards({
    latin:source("la","2031-11-02"),translation:source("fr","2031-11-02"),locale:"fr"
  }),/ALL_SOULS_DATE_CONFLICT/);
});
test("missing, duplicated or locale-inconsistent marker refuses publication and rendering",()=>{
  assert.throws(()=>splitAllSoulsPrimeMartyrologyCell(
    "Martyrologium\nDeus, veniae largitor","la"),/BOUNDARY_AMBIGUOUS/);
  assert.throws(()=>splitAllSoulsPrimeMartyrologyCell(
    texts.la+"\nV. In memória ætérna erunt justi.","la"),/BOUNDARY_AMBIGUOUS/);
  assert.throws(()=>splitAllSoulsPrimeMartyrologyCell(
    "V. In memória ætérna erunt justi.\nDeus, veniae largitor","la"),/BOUNDARY_AMBIGUOUS/);
  assert.throws(()=>splitAllSoulsPrimeMartyrologyCell(
    texts.fr.replace("Ô Dieu, qui donnez le pardon","Oraison inconnue"),"fr"),/PRAYER_OR_READING_MISSING/);
  const french=source("fr");
  french.sections[1].text=french.sections[1].text.replace(
    "V. En souvenir éternel seront les justes.","Verset absent");
  assert.throws(()=>projectOfficeMassStyleCards({latin:source("la"),translation:french,locale:"fr"}),
    /BOUNDARY_AMBIGUOUS/);
});
