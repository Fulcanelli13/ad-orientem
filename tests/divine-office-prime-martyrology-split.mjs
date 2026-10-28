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
  assert.equal(projectOfficeMassStyleCards({
    latin:source("la","2026-11-03"),translation:source("fr","2026-11-03"),locale:"fr"
  }).cards.length,3);
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
