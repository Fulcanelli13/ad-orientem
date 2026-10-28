import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {renderOfficeResearchReader,validateResearchOfficePair} from "../src/office/research-reader.js";

const doc=(locale,overrides={})=>({
  schema:"ao.office.source-cells.v1",
  date:"2026-10-31",hour:"VESPERS",language:locale,
  sourceRevision:DIVINUM_OFFICIUM_PIN,
  sourceEngine:"DivinumOfficium/EofficiumXhtml.pl",
  headline:locale==="la"?"Omnium Sanctorum ~ I. classis":"All Saints",
  status:"STRUCTURED_UNVERIFIED",publishable:false,
  verification:{
    structural:true,rubrical:false,languageCompleteness:false,
    crossLanguageAlignment:false,independentPrintedBreviary:false,
  },
  omittedSourceCells:[],
  sections:[
    {index:1,sourceIndex:1,sourceCellId:"Vespera1",text:"Incipit\n℣. Deus ✠ in adiutórium meum inténde.",
      semantic:{role:"OPENING",basis:"LATIN_SOURCE_PREFIX",certainty:"HEURISTIC",latinSourceCellId:"Vespera1"}},
    {index:2,sourceIndex:locale==="la"?2:3,sourceCellId:locale==="la"?"Vespera2":"Vespera3",
      text:"Ant. Vidi turbam\nPsalmus 109 [1]\n109:1 Dixit Dóminus <script>alert('x')</script> & adoremus",
      semantic:{role:"PSALMODY",basis:"LATIN_SOURCE_PREFIX",certainty:"HEURISTIC",latinSourceCellId:"Vespera2"}},
  ],...overrides,
});
const latin=doc("la"), english=doc("en"), french=doc("fr");

test("guarded Office reader preserves source-cell offset but demands canonical Latin semantic alignment",()=>{
  const v=validateResearchOfficePair({latin,translation:english,locale:"en"});
  assert.equal(v.count,2);
  assert.equal(v.witness,DIVINUM_OFFICIUM_PIN);
  const html=renderOfficeResearchReader({latin,translation:english,locale:"en"});
  assert.match(html,/aoP435930Body aoTenebBody/);
  assert.match(html,/data-office-research-only="true"/);
  assert.match(html,/data-source-cell-la="Vespera2"/);
  assert.match(html,/data-source-cell-vernacular="Vespera3"/);
  assert.match(html,/Psalmody/);
  assert.match(html,/<div class="aoOfficeResearchText aoTenebPrayer" lang="en">/);
  assert.match(html,/&lt;script&gt;alert\(&#39;x&#39;\)&lt;\/script&gt;/);
  assert.doesNotMatch(html,/<script>/);
  assert.match(html,/&amp; adoremus/);
  assert.match(html,/Research preview only/);
  assert.match(html,/href="#ao-office-section-2"/);
});

test("French research reader stays source-aligned and uses French labels",()=>{
  const html=renderOfficeResearchReader({latin,translation:french,locale:"fr",mode:"vernacular"});
  assert.match(html,/Psalmodie/);
  assert.match(html,/Aperçu de recherche uniquement/);
  assert.match(html,/lang="fr"/);
  assert.doesNotMatch(html,/lang="la"/);
  assert.doesNotMatch(html,/<script>/);
});

test("reader rejects unreviewed or mismatched contexts rather than subtly falling back",()=>{
  const bad=[
    [doc("la",{sourceRevision:"abc"}),english,"SOURCE_PIN_MISMATCH"],
    [latin,doc("en",{date:"2026-11-01"}),"SOURCE_CONTEXT_MISMATCH"],
    [latin,doc("en",{status:"READY",publishable:true}),"PUBLICATION_GATE"],
    [latin,doc("fr"),"LANGUAGE_MISMATCH"],
    [latin,doc("en",{sections:[]}),"SECTIONS_MISSING"],
    [latin,doc("en",{sections:[english.sections[1],english.sections[0]]}),"SECTION_ORDER_INVALID"],
    [latin,doc("en",{sections:english.sections.map((v,i)=>i===1?{...v,semantic:{...v.semantic,role:"PRAYER"}}:v)}),"SEMANTIC_ALIGNMENT_INVALID"],
    [latin,doc("en",{sections:english.sections.map((v,i)=>i===1?{...v,text:""}:v)}),"SOURCE_TEXT_MISSING"],
  ];
  for(const [la,en,reason] of bad)
    assert.throws(()=>renderOfficeResearchReader({latin:la,translation:en,locale:"en"}),new RegExp(reason));
  assert.throws(()=>renderOfficeResearchReader({latin,translation:english,mode:"new"}),/MODE_INVALID/);
});

test("single-language switches do not lose source references or invent translation text",()=>{
  const la=renderOfficeResearchReader({latin,translation:english,mode:"latin"});
  assert.match(la,/lang="la"/);
  assert.doesNotMatch(la,/lang="en"/);
  const en=renderOfficeResearchReader({latin,translation:english,mode:"vernacular"});
  assert.match(en,/lang="en"/);
  assert.doesNotMatch(en,/lang="la"/);
  assert.equal((la.match(/aoOfficeResearchSection aoTenebReading/g)||[]).length,2);
});
