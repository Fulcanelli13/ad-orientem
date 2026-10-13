import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 validateCuratedMassBibleStudy,renderCuratedMassBibleStudy,
 safeMassBibleLinkedText,massBibleCurationCss
} from "../src/learn/mass-bible-curation.js";
import {renderMassProperWitnessStudy} from "../src/learn/mass-bible-study.js";

const data=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const selection=data("data/learn/research/mass-bible-editorial-selection-20261013.v1.json");
const primary=data("data/learn/research/mass-bible-20-primary-polished-bilingual-20261013.v1.json");
const inline=data("data/learn/research/mass-bible-9-inline-and-2-variable-20261013.v1.json");
const old=data("data/learn/mass-bible-source-layers.v1.json");

assert.equal(validateCuratedMassBibleStudy(selection,primary,inline),true);
assert.equal(primary.records.length,20);
assert.equal(inline.inlineNotes.length,9);
assert.deepEqual(inline.variableProper.map(x=>x.id),["MB06","MB07"]);
assert.equal(selection.records.filter(x=>x.disposition==="FULL_TEACHING_ENTRY").length,20);
assert.equal(selection.records.filter(x=>x.disposition==="INLINE_COMPANION").length,9);
assert.equal(selection.records.filter(x=>x.disposition==="DYNAMIC_PROPER_ONLY").length,2);
assert.ok(selection.records.every(x=>x.publicationApproved===false));
assert.ok(primary.records.every(x=>x.technicalPublicationApproved===false));
const sourceRows=old.rows;
assert.equal(sourceRows.filter(x=>x.scriptureReaderRef).length,20);

const en=renderCuratedMassBibleStudy(selection,primary,inline,{language:"en",sourceRows});
const fr=renderCuratedMassBibleStudy(selection,primary,inline,{language:"fr",sourceRows});
assert.equal((en.match(/data-ao-mass-bible-row=/g)||[]).length,29);
assert.equal((fr.match(/data-ao-mass-bible-row=/g)||[]).length,29);
assert.equal((en.match(/<h2>/g)||[]).length,6,"five liturgical sections plus Proper section");
assert.equal((en.match(/class="aoMBConnection aoMBInline"/g)||[]).length,9);
assert.equal((en.match(/class="aoMBConnection"/g)||[]).length,20);
assert.ok((en.match(/data-ao-scripture-context=/g)||[]).length>0,"preserve existing native Scripture handoffs");
assert.match(fr,/panem nostrum cotidianum/,"French text retains 1962 Vatican spelling");
assert.match(en,/Original 1962 Roman Missal page/);
assert.match(en,/data-ao-mf-open-propers/);
assert.doesNotMatch(en,/data-live-card|data-bible-step|<canvas/i,"no new Mass reader");
assert.match(massBibleCurationCss(),/aoMBCurated/);

const off=renderCuratedMassBibleStudy(selection,primary,inline,{language:"en",stage:"OFFERTORY",sourceRows});
assert.equal((off.match(/data-ao-mass-bible-row=/g)||[]).length,5,"Offertory 3 main + 2 inline");
const text=renderCuratedMassBibleStudy(selection,primary,inline,{language:"en",category:"text",sourceRows});
assert.ok((text.match(/data-ao-mass-bible-row=/g)||[]).length<29,"working evidence filter");
assert.match(text,/data-ao-mf-open-propers/);

assert.match(safeMassBibleLinkedText("[Original](https://la.wikisource.org/wiki/De_sacramentis_(Ambrosius))"),/href="https:\/\/la\.wikisource\.org\/wiki\/De_sacramentis_\(Ambrosius\)"/);
const escaped=safeMassBibleLinkedText('<img src=x onerror="x"> [Bible](https://example.org/)');
assert.doesNotMatch(escaped,/<img/i,"HTML from stored drafts cannot execute");
assert.match(escaped,/&lt;img/);
assert.match(escaped,/target="_blank" rel="noopener noreferrer"/);
assert.doesNotMatch(safeMassBibleLinkedText("[Bad](javascript:alert(1))"),/<a /);

for(const kind of ["primary","inline","selection"]){
 const corrupt={selection:structuredClone(selection),primary:structuredClone(primary),inline:structuredClone(inline)};
 if(kind==="primary")corrupt.primary.records[0].technicalPublicationApproved=true;
 if(kind==="inline")corrupt.inline.inlineNotes[0].releaseApproved=true;
 if(kind==="selection")corrupt.selection.records[0].publicationApproved=true;
 assert.equal(validateCuratedMassBibleStudy(corrupt.selection,corrupt.primary,corrupt.inline),false,kind);
 assert.doesNotMatch(renderCuratedMassBibleStudy(corrupt.selection,corrupt.primary,corrupt.inline),/data-ao-mass-bible-row/,kind+" fails closed");
}
const malformed=structuredClone(primary);malformed.records[0].directSources=[];
assert.equal(validateCuratedMassBibleStudy(selection,malformed,inline),false,"Missing original edition link prevents display");

// A reading must never default to the first Mass in a 105-Proper registry.
const dummyIndex=Array.from({length:105},(_,i)=>({
 sourcePath:"Tempora/Dummy"+i,title:"Example Proper "+i,witnessUrl:"https://example.org",
 slots:[{slot:"GOSPEL",reference:"John 1:1",latinIncipit:"In principio erat Verbum"}],
 segmented:[],holds:[]
}));
const none=renderMassProperWitnessStudy(dummyIndex,{language:"en"});
assert.match(none,/Choose the 1962 Proper/);
assert.doesNotMatch(none,/<h3>John 1:1<\/h3>/,"no accidental first reading");
const chosen=renderMassProperWitnessStudy(dummyIndex,{language:"en",sourcePath:"Tempora/Dummy8"});
assert.match(chosen,/Example Proper 8/);
assert.match(chosen,/<h3>John 1:1<\/h3>/);

const runtime=readFileSync(new URL("../src/learn/mass-formation.js",import.meta.url),"utf8");
assert.match(runtime,/ensureCuratedData/);
assert.match(runtime,/renderCuratedMassBibleStudy/);
assert.match(runtime,/sourceRows:state\.bibleData\?\.rows/);
assert.match(runtime,/installFormationNavigation/);
assert.doesNotMatch(runtime,/R17.*replace/);

console.log("PASS learn.mass curated biblical preview: 20 full + 9 inline, proper fail-closed, native handoffs, bilingual links and safe rendering.");
