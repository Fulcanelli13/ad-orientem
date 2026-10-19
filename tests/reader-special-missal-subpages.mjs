import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectSpecialRiteReadingPages,createSpecialRiteMissalPageCursor}
  from "../src/mass/reader-special-missal-pages.js";
import {buildAspergesPayload} from "../src/mass/reader-asperges.js";
import {buildCandlemasPayload} from "../src/mass/reader-candlemas.js";
import {buildAshPayload} from "../src/mass/reader-ash.js";
import {buildRogationsPayload} from "../src/mass/reader-rogations.js";
import {buildPalmPayload} from "../src/mass/reader-palm.js";
import {buildRequiemAbsolutionPayload} from "../src/mass/reader-requiem-absolution.js";
import {buildCorpusChristiProcessionPayload} from "../src/mass/reader-corpus-christi.js";
import {buildHolyThursdayPostPayload} from "../src/mass/reader-holy-thursday-post.js";
import {buildEasterVigilReader} from "../src/mass/reader-easter-vigil.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const ext=load("../data/mass/special-days-extension.v1.3.json").graphs;
const core=load("../data/mass/special-days-core.v1.1.json").graphs;
const asp=buildAspergesPayload({graph:ext.ASP,payload:load("../data/presentation/reader-asperges.v1.json")}).cards;
const cand=buildCandlemasPayload({
  graph:ext.CND,payload:load("../data/presentation/reader-candlemas.v1.json")}).cards;
const ash=buildAshPayload({
  graph:ext.ASH,payload:load("../data/presentation/reader-ash.v1.json")}).cards;
const rog=buildRogationsPayload({
  graph:ext.ROG,payload:load("../data/presentation/reader-rogations.v1.json")}).cards;
const palm=buildPalmPayload({graph:ext.PALM,
  payload:load("../data/presentation/reader-palm.v1.json")}).cards;
const abs=buildRequiemAbsolutionPayload({graph:ext.ABS,bodyPresent:true,burialProcession:true,
  payload:load("../data/presentation/reader-requiem-absolution.v1.json")}).cards;
const corpus=buildCorpusChristiProcessionPayload({graph:ext.CORPUS,
  payload:load("../data/presentation/reader-corpus-christi.v1.json")}).cards;
const ht=buildHolyThursdayPostPayload({graph:ext.HT_POST,
  payload:load("../data/presentation/reader-holy-thursday-post.v1.json")}).cards;
const evSource=load("../data/presentation/reader-easter-vigil.v1.json");
const vigil=buildEasterVigilReader({
  graph:core.EV,payload:evSource,fontMode:"IN_CHURCH",baptismPresent:false}).steps;
const separated=buildEasterVigilReader({
  graph:core.EV,payload:evSource,fontMode:"SEPARATE_BAPTISTERY",baptismPresent:false}).steps;
const source=(collection,id)=>collection.find(c=>c.id===id||c.recordId===id);
const scenarios=[
  ["ASP-R04",source(asp,"ASP-R04").paragraphs,2],
  ["PALM-R01",source(palm,"PALM-R01").paragraphs,2],
  ["PALM-R04",source(palm,"PALM-R04").paragraphs,2],
  ["PALM-R06",source(palm,"PALM-R06").paragraphs,2],
  ["ABS-R03",source(abs,"ABS-R03").paragraphs,2],
  ["ABS-R04",source(abs,"ABS-R04").paragraphs,4],
  ["CORPUS-R02",source(corpus,"CORPUS-R02").paragraphs,2],
  ["CORPUS-R05",source(corpus,"CORPUS-R05").paragraphs,2],
  ["HT-R01",source(ht,"HT-R01").paragraphs,2],
  ["HT-R05",source(ht,"HT-R05").paragraphs,4],
  ["CND-R01",source(cand,"CND-R01").paragraphs,6],
  ["ASH-R01",source(ash,"ASH-R01").paragraphs,5],
  ["ROG-R02",source(rog,"ROG-R02").paragraphs,1],
  ["ROG-R03",source(rog,"ROG-R03").paragraphs,2],
  ["ROG-R05",source(rog,"ROG-R05").paragraphs,6],
  ["EV-LIT1-400",source(vigil,"EV-LIT1-400").paragraphs,2],
  ["EV-LIT2-600",source(vigil,"EV-LIT2-600").paragraphs,2],
  ["EV-FONT-420",source(vigil,"EV-FONT-420").paragraphs,2],
  ["EV-FONT-440",source(separated,"EV-FONT-440").paragraphs,2],
  ["EV-LESS-01-READ",source(vigil,"EV-LESS-01-READ").paragraphs,5],
  ["EV-LESS-02-READ",source(vigil,"EV-LESS-02-READ").paragraphs,2],
  ["EV-LESS-03-READ",source(vigil,"EV-LESS-03-READ").paragraphs,2],
  ["EV-LESS-04-READ",source(vigil,"EV-LESS-04-READ").paragraphs,2],
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
// Whole source-owned liturgical units must not be split between pages.
const reqlast=projectSpecialRiteReadingPages("ABS-R04",source(abs,"ABS-R04").paragraphs);
assert.deepEqual(reqlast.map(p=>p.rows.length),[4,6,4,2],
  "Kyrie, Pater noster, complete five versicle pairs, and oration/Amen must stay intact");
assert.equal(reqlast.at(-1).rows.at(-1).id,"ABS-R04-A");
const stripping=projectSpecialRiteReadingPages("HT-R05",source(ht,"HT-R05").paragraphs);
assert.deepEqual(stripping.map(p=>p.rows.length),[4,4,4,3]);
assert.equal(stripping[0].rows[0].id,"HT-R05-A1");
assert.equal(stripping.at(-1).rows.at(-1).id,"HT-R05-A2");
const palms=projectSpecialRiteReadingPages("PALM-R04",source(palm,"PALM-R04").paragraphs);
assert.deepEqual(palms.map(p=>p.rows.length),[2,1],
  "Procedamus and response may not separate or contaminate Gloria laus");
const corpusHymn=projectSpecialRiteReadingPages("CORPUS-R02",source(corpus,"CORPUS-R02").paragraphs);
assert.deepEqual(corpusHymn.map(p=>p.rows.length),[2,2],
  "All four Pange lingua stanzas must stay intact");
const absturn=createSpecialRiteMissalPageCursor();
const absRows=source(abs,"ABS-R04").paragraphs;
assert.equal(absturn.project("ABS-R04",absRows).totalPages,4);
for(let n=0;n<3;n++){
  assert.equal(absturn.turn("next"),true);
  assert.equal(absturn.project("ABS-R04",absRows).pageIndex,n+1);
}
assert.equal(absturn.turn("next"),false);
assert.equal(absturn.project("ABS-R05",source(abs,"ABS-R05").paragraphs).pageIndex,0);
assert.equal(absturn.turn("previous"),false);
assert.equal(absturn.project("ABS-R04",absRows).pageIndex,3);
const aspRows=source(asp,"ASP-R04").paragraphs;
const aspPages=projectSpecialRiteReadingPages("ASP-R04",aspRows);
assert.equal(aspPages.length,2);
assert.deepEqual(aspPages.map(p=>p.rows.length),[6,3],
  "Three paired versicles must precede the whole Oremus, collect and Amen");
assert.equal(aspPages[1].rows[0].latin,"Orémus.");
assert.deepEqual(aspPages.flatMap(p=>p.rows),aspRows,
  "Asperges collector discarded source rows during page projection");
const aspCursor=createSpecialRiteMissalPageCursor();
assert.equal(aspCursor.project("ASP-R04",aspRows).pageIndex,0);
assert.equal(aspCursor.turn("next"),true);
assert.equal(aspCursor.project("ASP-R04",aspRows).pageIndex,1);
assert.equal(aspCursor.turn("next"),false);
assert.equal(aspCursor.project("ASP-R05",source(asp,"ASP-R05").paragraphs).pageIndex,0);
assert.equal(aspCursor.turn("previous"),false);
assert.equal(aspCursor.project("ASP-R04",aspRows).pageIndex,1);
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
// Verify the 1962 order: the entire Scripture lesson precedes its canticle;
// a shorter Missal page may NEVER detach or reorder a liturgical canticle.
for(let i=1;i<=4;i++){
  const id="EV-LESS-"+String(i).padStart(2,"0")+"-READ";
  const original=source(vigil,id).paragraphs;
  const pages=projectSpecialRiteReadingPages(id,original);
  assert.deepEqual(pages.flatMap(p=>p.rows),original,id+" source was mutated");
  assert.ok(pages.slice(0,-1).every(p=>p.rows.every(row=>/-T\d+$/.test(row.id))),
    id+" prophecy paragraphs mixed with the canticle");
  if(i>1){
    const last=pages.at(-1).rows;
    assert.match(last[0].id,/-CIT$/);
    assert.ok(last.slice(1).every(row=>/-CANT\d+$/.test(row.id)));
  }
}
const exsSource=source(vigil,"EV-EXS-200").paragraphs;
const exsEnglish=exsSource.map(row=>({
  ...row,primary:row.latin,secondary:row.english,
}));
const exsPages=projectSpecialRiteReadingPages("EV-EXS-200",exsEnglish);
assert.equal(exsPages.length,12,
  "Exsultet should follow the twelve paired Latin/English source passages");
const exsIntro=exsEnglish[0].primary.split("\n\n")[0];
assert.equal(exsPages.slice(0,2).map(p=>p.rows[0].primary).join(" "),exsIntro,
  "Introductory Exsultet paragraphs must rejoin with no altered Latin");
const latParts=exsPages.map(p=>p.rows[0].primary);
const englishParts=exsPages.map(p=>p.rows[0].secondary);
assert.equal(latParts.slice(0,2).join(" ")+
  "\n\n"+latParts.slice(2).join("\n\n"),exsEnglish[0].primary,
  "Latin Exsultet must reconstruct exactly, including all punctuation and responses");
assert.equal(englishParts.join("\n\n"),exsEnglish[0].secondary,
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
assert.equal(live.setMode("MISSAL"),true);
assert.equal(live.project("CND-R01",first).totalPages,6,
  "LIVE to MISSAL toggle must build source-owned subpages at current rite stage");
assert.equal(live.turn("next"),true);
assert.equal(live.project("CND-R01",first).pageIndex,1);
assert.equal(live.setMode("MISSAL"),false,"Repeated mode selection reset an in-progress prayer");
assert.equal(live.project("CND-R01",first).pageIndex,1);
assert.equal(live.setMode("SIMPLE"),true);
assert.equal(live.project("CND-R01",first).totalPages,1);
assert.equal(live.setMode("MISSAL"),true);
assert.equal(live.project("CND-R01",first).pageIndex,0,
  "Switching back into Missal must reopen the same ceremony's first display page");
assert.throws(()=>live.setMode("RUBRIC"),/SPECIAL_MISSAL_CURSOR_MODE_INVALID/);
console.log("PASS twenty-three real special-rite source groups; every canonical row survives and stage controller never advances inside a page");
