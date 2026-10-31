import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {withPublishedMissalParagraphRubrics,publishedMissalRubricsForParagraph} from "../src/mass/reader-missal-rubrics.js";
import {normalizeReaderMoment,buildReaderShellMarkup} from "../src/mass/reader-dom.js";
import {missalSourceRubricCopy} from "../src/mass/reader-missal-book-rubrics.js";
const read=p=>readFileSync(new URL(p,import.meta.url),"utf8");
const registry=JSON.parse(read("../data/presentation/reader-rubric-events.v1.json"));
const p=(id,cueId)=>({id,kind:"TEXT",primary:"Source Latin text",sourceCueIds:[cueId]});
const published=(cue,options={})=>publishedMissalRubricsForParagraph(p(cue,cue),registry,options);
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
 for(const language of ["en","fr"]){
   const rows=withPublishedMissalParagraphRubrics([
     p("offertory","AO.SM.C0111"),
     p("host","AO.SM.C0174"),
     p("chalice","AO.SM.C0181"),
     p("communion","AO.SM.C0232"),
     p("last","AO.SM.C0263"),
   ],registry,{form,language});
   const normalized=normalizeReaderMoment({cardTitle:"Mass",paragraphs:rows}).paragraphs;
   assert.equal(normalized.length,5);
   for(const [i,row] of rows.entries()){
     assert.equal(normalized[i].publishedMissalRubrics.length,
       row.publishedMissalRubrics?.length??0,
       "Reader normalization must not strip source-backed rubric identity");
     for(const item of normalized[i].publishedMissalRubrics){
       if(item.kind==="BELL"){
         assert.equal(item.actor,"SERVER","A certified bell note cannot become a priest action");
         assert.ok(["AO.RUB.C0174.03","AO.RUB.C0181.03"].includes(item.id));
       }else assert.equal(item.actor,"PRIEST");
       assert.equal(item.sourceId,"MR62_RITUS");
       assert.equal(item.observedNow,false);
       assert.equal(item.owner,"PUBLISHED_R17_MISSAL_INLINE");
       assert.ok(registry.items.some(e=>e.id===item.id&&e.cueId===item.sourceCueId));
       assert.ok(item.displayText.trim());
     }
   }
   assert.ok(rows[0].publishedMissalRubrics.some(e=>e.id==="AO.RUB.C0111.01"));
   assert.ok(rows[1].publishedMissalRubrics.some(e=>e.id==="AO.RUB.C0174.02"));
   assert.ok(rows[2].publishedMissalRubrics.some(e=>e.id==="AO.RUB.C0181.02"));
   assert.equal(rows[2].publishedMissalRubrics.some(e=>e.id==="AO.RUB.C0181.04"),form!=="SOLEMN",
      "Solemn chalice pall must not be falsely assigned to priest");
   assert.ok(rows[0].publishedMissalRubrics[0].displayText.startsWith(language==="fr"?"Le prêtre":"The priest"));
 }
}
assert.equal(published("AO.SM.C0174",{form:"REQUIEM"}).length,0);
assert.equal(published("AO.SM.C0190").length,0,"Unverified Canon cross offset must remain withheld");
assert.equal(published("AO.SM.C9999").length,0);
const synthetic=structuredClone(registry);
synthetic.items.push({id:"AO.RUB.C0111.98",cueId:"AO.SM.C0111",order:98,
 actor:"PRIEST",kind:"ACTION",label:"KISSES ALTAR",authorityClass:"1962_NORMATIVE",sources:["MR62_RITUS"]});
assert.equal(publishedMissalRubricsForParagraph(p("new","AO.SM.C0111"),synthetic).some(e=>e.id==="AO.RUB.C0111.98"),false,
 "New normative-looking research must not silently publish to LIVE");
const markup=buildReaderShellMarkup({readerPreferences:{mode:"LIVE"},
 session:{resolvedMass:{presentationMode:"LIVE",actualCelebration:{title:"Mass"}}}});
assert.match(markup,/data-role="guide-button" disabled hidden aria-hidden="true" tabindex="-1"/);
assert.match(markup,/\.ao-reader-shell \.ao-state-guide/);
assert.match(markup,/\.ao-reader-shell\[data-mode="LIVE"\] \.ao-live-inline-rubrics/);
const native=read("../src/mass/reader-native-preview.js");
const dom=read("../src/mass/reader-dom.js");
assert.match(native,/: String\(readerModel\?\.presentationMode\?\?""\)\.toUpperCase\(\)==="LIVE"/);
assert.match(native,/withPublishedMissalParagraphRubrics\(\s*visibleCard\.paragraphs/);
assert.match(native,/guide:null,/);
assert.equal((native.match(/guide:null,/g)||[]).length>=2,true,"Card and cue updates must both exclude Guide");
assert.match(dom,/const inlineRubrics=mode==="MISSAL"\s*\? p\.publishedMissalRubrics/);
assert.match(dom,/mode==="LIVE"\s*\? p\.publishedMissalRubrics\.filter\(event=>event\.kind!=="BELL"\)/,
 "Printed VIII.6 server bell notes must never become LIVE reader events");
assert.match(dom,/const alreadyPrintedRubric=\(mode==="MISSAL"\|\|mode==="LIVE"\)/);
assert.match(dom,/shell\.dataset\.canonInline="false"/);
// Ecclesia Dei's marginal catechesis is not a LIVE-side rubric. Check the
// production stylesheet, not just a policy note: source ceremonial brackets
// become quiet, source-aligned italic text, and 52px icon rails contain no prose.
const liveSourceRule=markup.match(/\.ao-reader-shell\[data-mode="LIVE"\] \.ao-reader-paragraph\[data-kind="RUBRIC"\]\{[\s\S]*?\n\}/)?.[0]??"";
assert.match(liveSourceRule,/border-radius:0;background:transparent/,
  "LIVE source rubrics must not use a grey boxed/card presentation");
assert.match(liveSourceRule,/font:italic 400/,
  "LIVE source rubrics need small, unobtrusive Missal-serif type");
assert.match(markup,/\.ao-reader-shell\[data-mode="LIVE"\] \.ao-reader-paragraph\[data-kind="RUBRIC"\]::before\{\s*display:none!important/,
  "LIVE must not prepend a large generic RUBRIC label");
assert.match(markup,/\.ao-reader-shell\[data-mode="LIVE"\] \.ao-reader-paragraph\[data-kind="RUBRIC"\]\[data-active="false"\]\{\s*opacity:\.38/,
  "LIVE instruction text must respect paragraph focus");
assert.match(markup,/\.ao-reader-shell\[data-mode="MISSAL"\]\{--ao-missal-rubric-red:#df7e80\}/,
  "MISSAL rubrics must remain red, irrespective of the LIVE treatment");
assert.match(markup,/\.ao-reader-shell\[data-mode="MISSAL"\] \.ao-missal-inline-rubrics\{/,
  "MISSAL must retain its independent printed full-rubric surface");
const ministerRule=markup.match(/\.ao-reader-shell\[data-mode="LIVE"\] \.ao-rail-item\[data-channel="sacred-minister"\] \.ao-rail-copy\{[\s\S]*?\n\}/)?.[0]??"";
assert.match(ministerRule,/display:none!important/,
  "No tiny, explanatory minister words may occupy an icon-only LIVE rail");
assert.doesNotMatch(ministerRule,/display:(?:block|-webkit-box)!important/,
  "An older high-specificity minister rail override reintroduced marginal prose");
// Two silent Canon Mementos: LIVE prints the short source-owned orientation;
// MISSAL continues displaying the full certified head/hands/eyes rubrics.
const sung=JSON.parse(read("../data/presentation/reader-text-sung.v1.json"));
const fr=JSON.parse(read("../data/presentation/reader-french-ordinary.v1.json"));
for(const [cue,english,french] of [
  ["AO.SM.C0155","Silent commemoration of the living","Commémoration silencieuse des vivants"],
  ["AO.SM.C0193","Silent commemoration of the dead","Commémoration silencieuse des défunts"]
]){
  const original=sung.blocks.flatMap(x=>x.units).find(x=>x.cue_id===cue);
  assert.ok(original?.english.startsWith("[") && original?.english.endsWith("]"));
  assert.equal(missalSourceRubricCopy({kind:"RUBRIC",primary:original.english},
    {language:"en"})?.text,english);
  assert.equal(missalSourceRubricCopy({kind:"RUBRIC",primary:fr.byCue[cue]},
    {language:"fr"})?.text,french);
  const full=published(cue,{form:"LOW",language:"en"});
  assert.ok(full.some(x=>x.displayText.length>100 && x.sourceId==="MR62_RITUS"),
    "The complete rubrical description must remain published for "+cue);
}
assert.match(dom,/const liveBriefMemento=mode==="LIVE"&&p.kind==="RUBRIC"/);
assert.match(dom,/\["AO.SM.C0155","AO.SM.C0193"\]\.includes\(p.sourceCueIds\[0\]\)/);
assert.match(dom,/renderReaderText\(primary,conciseSource\?\.text\?\?bookRubric\?\.text\?\?\s*liveBriefCopy\?\.text/);
console.log("PASS: LIVE 65 removes Guide from reader chrome, publishes only certified source-cue EN/FR priest rubrics, no copied explanations, staged exceptions guarded and canonical text untouched.");
