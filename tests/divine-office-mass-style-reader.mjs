import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {
  OFFICE_HOURS,projectOfficeMassStyleCards,moveOfficeCard,
  renderOfficeMassStyleResearchReader,
} from "../src/office/mass-style-research-reader.js";
import {readFileSync} from "node:fs";

const latinCell=(id,index,text,role)=>({
  index,sourceIndex:index,sourceCellId:id,text,
  semantic:{role,basis:"LATIN_SOURCE_PREFIX",certainty:"HEURISTIC",latinSourceCellId:id},
});
const source=(language="la",hour="VESPERS",date="2026-11-29")=>{
  const la=language==="la";
  return {
    schema:"ao.office.source-cells.v1",date,hour,language,
    sourceRevision:DIVINUM_OFFICIUM_PIN,
    sourceEngine:"DivinumOfficium/EofficiumXhtml.pl",
    headline:la?"Dominica I Adventus ~ I. classis":"First Sunday in Advent",
    status:"STRUCTURED_UNVERIFIED",publishable:false,
    verification:{
      structural:true,rubrical:false,languageCompleteness:false,
      crossLanguageAlignment:false,independentPrintedBreviary:false,
    },
    sections:[
      latinCell(la?"Vespera1":"Vespera2",1,
        la?"Incipit\n℣. Deus ✠ in adiutórium meum inténde.\n℟. Dómine, ad adiuvándum me festína.":
        "Opening\n℣. O God, come to my assistance.\n℟. O Lord, make haste to help me.","OPENING"),
      latinCell(la?"Vespera3":"Vespera4",2,
        la?"Ant. In illa die\nPsalmus 109 [1]\n109:1 Dixit Dóminus Dómino meo.\n109:2 <script>alert(3)</script> & content":
        "Ant. In that day\nPsalm 109\nThe Lord said to my Lord.\nAdditional explanation not equivalent to a Latin verse.","PSALMODY"),
      latinCell(la?"Vespera5":"Vespera6",3,
        la?"Oratio\nExcita, quaesumus, Domine, potentiam tuam.":
        "Prayer\nStir up thy power, we beseech thee, O Lord.","PRAYER"),
    ].map((s,i)=>({...s,
      semantic:{...s.semantic,latinSourceCellId:"Vespera"+(i*2+1)},
      sourceIndex:i*2+(la?1:2)})),
  };
};
const latin=source("la"),english=source("en"),french=source("fr");
test("Mass-style Office projects only source-owned cards, preserving complete Latin and translation cells",()=>{
  const model=projectOfficeMassStyleCards({latin,translation:english});
  assert.equal(model.cards.length,3);
  assert.deepEqual(model.cards.map(c=>c.sourceCellId),["Vespera1","Vespera3","Vespera5"]);
  assert.deepEqual(model.cards.map(c=>c.vernacularSourceCellId),["Vespera2","Vespera4","Vespera6"]);
  assert.equal(model.cards[1].latinLines.join("\n"),latin.sections[1].text);
  assert.equal(model.cards[1].vernacular,english.sections[1].text);
  assert.equal(model.cards.every(c=>c.translationAlignment==="SOURCE_CELL_ONLY"),true);
  assert.equal(model.cards.every(c=>Object.isFrozen(c)),true);
  assert.equal(model.context.count,3);
});
test("LIVE has illuminated Latin source lines; MISSAL has whole bilingual source cells, not false verse matching",()=>{
  const html=renderOfficeMassStyleResearchReader({
    latin,translation:english,locale:"en",availableHours:["VESPERS"],
    availableDates:["2026-11-29"],
  });
  assert.match(html,/class="ao-reader-shell aoOfficeMassReader"/);
  assert.match(html,/class="ao-reader-top-ribbon"/);
  assert.match(html,/class="ao-state-ribbon aoOfficeStateRibbon"/);
  assert.match(html,/class="ao-progress-track aoOfficeProgressTop"/);
  assert.match(html,/class="ao-card-viewport aoOfficeMassViewport"/);
  assert.match(html,/class="ao-reader-paragraph aoOfficeLiveParagraph"/);
  assert.match(html,/data-office-source-role/);
  assert.match(html,/data-office-mode-select="LIVE"/);
  assert.match(html,/data-office-mode-select="MISSAL"/);
  assert.doesNotMatch(html,/data-office-mode-select="SIMPLE"/);
  assert.match(html,/data-office-research-only="true"/);
  assert.match(html,/data-office-published="false"/);
  assert.match(html,/data-office-chant-enabled="false"/);
  assert.match(html,/data-office-total="3"/);
  assert.match(html,/data-source-cell-la="Vespera3"/);
  assert.match(html,/data-source-cell-vernacular="Vespera4"/);
  assert.match(html,/data-office-translation-alignment="SOURCE_CELL_ONLY"/);
  assert.match(html,/&lt;script&gt;alert\(3\)&lt;\/script&gt; &amp; content/);
  assert.doesNotMatch(html,/<script>alert/);
  assert.match(html,/Additional explanation not equivalent to a Latin verse/);
  // A real translator may use different line counts: never zip by index.
  const item=model=>model.sections[1].text.split("\n").length;
  assert.equal(item(latin),4);assert.equal(item(english),4);
  assert.equal((html.match(/class="aoOfficeFullTranslation"/g)||[]).length,3);
  assert.equal((html.match(/data-office-card="/g)||[]).length,3);
  assert.match(html,/href="2026-11-29-vespers-en.html"/);
  assert.doesNotMatch(html,/https?:\/\/|target="_blank"/);
  assert.doesNotMatch(html,/href="2026-11-29-matins-en.html"/);
});
test("all eight canonical hours use same renderer and cannot fabricate titles or a production route",()=>{
  assert.equal(OFFICE_HOURS.length,8);
  const sourceNames=["Matins","Lauds","Prime","Terce","Sext","None","Vespers","Compline"];
  for(const [idx,[hour,en]] of OFFICE_HOURS.entries()){
    assert.equal(en,sourceNames[idx]);
    const la=source("la",hour),tr=source("fr",hour);
    const html=renderOfficeMassStyleResearchReader({latin:la,translation:tr,locale:"fr"});
    assert.match(html,new RegExp('data-office-hour="'+hour+'"'));
    assert.match(html,/data-office-mode="LIVE"/);
    assert.match(html,/data-office-card-index="0"/);
    assert.match(html,/FRANÇAIS/);
    assert.match(html,/APERÇU DE RECHERCHE/);
  }
});
test("navigation bounds and preview context fail closed",()=>{
  assert.equal(moveOfficeCard({index:0,total:3,delta:-1}),0);
  assert.equal(moveOfficeCard({index:2,total:3,delta:1}),2);
  assert.equal(moveOfficeCard({index:0,total:3,delta:1}),1);
  assert.throws(()=>moveOfficeCard({index:0,total:0,delta:1}),/NAV_INVALID/);
  assert.throws(()=>moveOfficeCard({index:1,total:2,delta:2}),/NAV_INVALID/);
  assert.throws(()=>renderOfficeMassStyleResearchReader({
    latin,translation:english,availableHours:["LAUDS"],
  }),/NAV_CONTEXT_INVALID/);
  assert.throws(()=>renderOfficeMassStyleResearchReader({
    latin,translation:english,availableDates:["2026-11-29","../../path"],
  }),/NAV_CONTEXT_INVALID/);
  assert.throws(()=>renderOfficeMassStyleResearchReader({
    latin,translation:{...english,status:"READY",publishable:true},
  }),/PUBLICATION_GATE/);
  assert.throws(()=>renderOfficeMassStyleResearchReader({
    latin,translation:{...english,date:"2026-11-01"},
  }),/SOURCE_CONTEXT_MISMATCH/);
});
test("research browser interactions are self-contained and preserve reading semantics",()=>{
  const js=readFileSync(new URL("../src/office/mass-style-research-ui.js",import.meta.url),"utf8");
  const css=readFileSync(new URL("../src/office/mass-style-research.css",import.meta.url),"utf8");
  assert.match(js,/scrollTop/);
  assert.match(js,/touchstart/);
  assert.match(js,/touchend/);
  assert.match(js,/ArrowRight/);
  assert.match(js,/ArrowLeft/);
  assert.match(js,/getBoundingClientRect/);
  assert.match(js,/aria-expanded/);
  assert.match(js,/dataset\.officeMode/);
  assert.doesNotMatch(js,/\bfetch\s*\(|\bXMLHttpRequest\b|\bwindow\.location\s*=|\binnerHTML\s*=/);
  assert.match(css,/\.ao-reader-paragraph\[data-active="true"\]/);
  assert.match(css,/\.ao-reader-top-ribbon/);
  assert.match(css,/\.aoOfficeMissalCols/);
  assert.match(css,/@media\(max-width:650px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
