import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectSpecialRiteReadingPages,createSpecialRiteMissalPageCursor}
  from "../src/mass/reader-special-missal-pages.js";
import {buildCandlemasPayload} from "../src/mass/reader-candlemas.js";
import {buildAshPayload} from "../src/mass/reader-ash.js";
import {buildRogationsPayload} from "../src/mass/reader-rogations.js";
import {buildEasterVigilReader} from "../src/mass/reader-easter-vigil.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const ext=load("../data/mass/special-days-extension.v1.3.json").graphs;
const core=load("../data/mass/special-days-core.v1.1.json").graphs;
const cand=buildCandlemasPayload({
  graph:ext.CND,payload:load("../data/presentation/reader-candlemas.v1.json")}).cards;
const ash=buildAshPayload({
  graph:ext.ASH,payload:load("../data/presentation/reader-ash.v1.json")}).cards;
const rog=buildRogationsPayload({
  graph:ext.ROG,payload:load("../data/presentation/reader-rogations.v1.json")}).cards;
const evSource=load("../data/presentation/reader-easter-vigil.v1.json");
const vigil=buildEasterVigilReader({
  graph:core.EV,payload:evSource,fontMode:"IN_CHURCH",baptismPresent:false}).steps;
const separated=buildEasterVigilReader({
  graph:core.EV,payload:evSource,fontMode:"SEPARATE_BAPTISTERY",baptismPresent:false}).steps;
const source=(collection,id)=>collection.find(c=>c.id===id||c.recordId===id);
const scenarios=[
  ["CND-R01",source(cand,"CND-R01").paragraphs,6],
  ["ASH-R01",source(ash,"ASH-R01").paragraphs,5],
  ["ROG-R02",source(rog,"ROG-R02").paragraphs,1],
  ["ROG-R03",source(rog,"ROG-R03").paragraphs,2],
  ["ROG-R05",source(rog,"ROG-R05").paragraphs,6],
  ["EV-LIT1-400",source(vigil,"EV-LIT1-400").paragraphs,2],
  ["EV-LIT2-600",source(vigil,"EV-LIT2-600").paragraphs,2],
  ["EV-FONT-420",source(vigil,"EV-FONT-420").paragraphs,2],
  ["EV-FONT-440",source(separated,"EV-FONT-440").paragraphs,2],
];
for(const [id,rows,min] of scenarios){
  const pages=projectSpecialRiteReadingPages(id,rows);
  assert.ok(pages.length>=min,id+" was not divided into source prayer/response pages");
  assert.deepEqual(pages.flatMap(page=>page.rows),rows,id+" lost or duplicated source text");
  assert.ok(pages.every(p=>p.rows.every(x=>rows.includes(x))),id+" cloned canonical rows");
  assert.deepEqual(pages.flatMap(p=>p.sourceIds),rows.map(x=>x.id),
    id+" changed canonical cue/text source sequence");
  assert.equal(projectSpecialRiteReadingPages(id,rows,{mode:"LIVE"}).length,1,
    id+" split LIVE ritual events");
  assert.equal(projectSpecialRiteReadingPages(id,rows,{mode:"SIMPLE"}).length,1,
    id+" split SIMPLE ritual events");
}
const candles=projectSpecialRiteReadingPages("CND-R01",source(cand,"CND-R01").paragraphs);
assert.equal(candles.length,6,"Five Candlemas orations require five separate prayer pages");
for(const page of candles.slice(1)){
  assert.equal(page.rows.length,3,"One Candlemas Oremus, prayer and Amen must remain together");
  assert.match(page.rows[0].id,/-INTRO$/);
  assert.match(page.rows[1].id,/CND-R01-O\d$/);
  assert.match(page.rows[2].id,/-AMEN$/);
}
const ashes=projectSpecialRiteReadingPages("ASH-R01",source(ash,"ASH-R01").paragraphs);
assert.equal(ashes.length,5,"Four blessing orations must each stay whole");
const litany=projectSpecialRiteReadingPages("EV-LIT1-400",source(vigil,"EV-LIT1-400").paragraphs);
assert.equal(litany.length,4,"Forty-six pairs of first Litany source lines require four pages");
assert.ok(litany.every(p=>p.rows.length%2===0),"Litany call and response separated");
const exsSource=source(vigil,"EV-EXS-200").paragraphs;
const exsEnglish=exsSource.map(row=>({
  ...row,primary:row.latin,secondary:row.english,
}));
const exsPages=projectSpecialRiteReadingPages("EV-EXS-200",exsEnglish);
assert.equal(exsPages.length,12,
  "Exsultet should follow the twelve paired Latin/English source passages");
assert.equal(exsPages.map(p=>p.rows[0].primary).slice(0,2).join(" "),
  exsEnglish[0].primary.split(" Quaprópter astántes")[0]+" Quaprópter astántes"+
  exsEnglish[0].primary.split(" Quaprópter astántes")[1],
  "Introductory Exsultet paragraphs must rejoin with no altered Latin");
const latParts=exsPages.map(p=>p.rows[0].primary);
const englishParts=exsPages.map(p=>p.rows[0].secondary);
assert.equal(latParts.slice(0,2).join(" ")+
  "\\n\\n"+latParts.slice(2).join("\\n\\n"),exsEnglish[0].primary,
  "Latin Exsultet must reconstruct exactly, including all punctuation and responses");
assert.equal(englishParts.join("\\n\\n"),exsEnglish[0].secondary,
  "English Exsultet must reconstruct exactly, with no missing/duplicated sentences");
assert.equal(exsPages[2].rows[0].primary.startsWith("℣. Dóminus vobíscum."),true);
assert.equal(exsPages[2].rows[0].secondary.startsWith("℣. The Lord be with you."),true);
assert.equal(projectSpecialRiteReadingPages("EV-EXS-200",exsEnglish,{mode:"LIVE"}).length,1,
  "Exsultet LIVE still owns one unsplit canonical donor paragraph");
const exsFrench=projectSpecialRiteReadingPages("EV-EXS-200",
  exsSource.map(row=>({...row,primary:row.latin,secondary:null})));
assert.equal(exsFrench.length,12);
assert.ok(exsFrench.every(p=>p.rows[0].secondary===null),
  "Do not manufacture French text from incomplete editorial Exsultet summary");
assert.equal(exsPages[4].rows[0].primary.startsWith("Hæc nox est"),true);
assert.equal(projectSpecialRiteReadingPages("CND-R02",[]).length,1,
  "A silent action stage needs one controller stage without fake text");

const cursor=createSpecialRiteMissalPageCursor();
const first=source(cand,"CND-R01").paragraphs,second=source(cand,"CND-R02").paragraphs;
let initial=cursor.project("CND-R01",first);
assert.equal(initial.pageIndex,0);
assert.equal(initial.totalPages,6);
for(let i=0;i<5;i++){
  assert.equal(cursor.turn("next"),true,"Opening a reading subpage must absorb page turn");
  const page=cursor.project("CND-R01",first);
  assert.equal(page.pageIndex,i+1,"Ritual stage index changed before all pages were read");
}
assert.equal(cursor.turn("next"),false,"At final subpage control may advance actual ceremony");
assert.equal(cursor.project("CND-R02",second).pageIndex,0);
assert.equal(cursor.turn("previous"),false);
assert.equal(cursor.project("CND-R01",first).pageIndex,5,
  "Returning to previous ritual stage must reopen its last reading page");
assert.equal(cursor.turn("previous"),true);
assert.equal(cursor.project("CND-R01",first).pageIndex,4);
cursor.clear();
assert.equal(cursor.project("CND-R01",first).pageIndex,0);
const live=createSpecialRiteMissalPageCursor({mode:"LIVE"});
assert.equal(live.project("CND-R01",first).totalPages,1);
assert.equal(live.turn("next"),false);
console.log("PASS nine real special-rite source groups; every canonical row survives and stage controller never advances inside a page");
