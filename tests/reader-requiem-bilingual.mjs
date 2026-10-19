import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildRequiemAbsolutionPayload,createRequiemAbsolutionReaderController}
  from "../src/mass/reader-requiem-absolution.js";
import {projectRequiemBilingualRow,REQUIEM_EDITORIAL_TEXT_SOURCE}
  from "../src/mass/reader-requiem-text.js";
import {projectSpecialRiteReadingPages,specialRiteVernacular}
  from "../src/mass/reader-special-missal-pages.js";
const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const source=load("../data/presentation/reader-requiem-absolution.v1.json");
const graph=load("../data/mass/special-days-extension.v1.3.json").graphs.ABS;
const sourceIds=new Set(graph.map(x=>x.id));
assert.match(REQUIEM_EDITORIAL_TEXT_SOURCE.status,/EDITORIAL/);
const permutations=[];
for(const bodyPresent of [false,true]){
 for(const burialProcession of [false,true]){
  const args={graph,payload:source,bodyPresent,burialProcession};
  const built=buildRequiemAbsolutionPayload(args);
  const ctrl=createRequiemAbsolutionReaderController(args);
  const displayed=built.cards.flatMap(card=>card.paragraphs);
  const expected=bodyPresent?(burialProcession?27:25):23;
  assert.equal(displayed.length,expected,
    "Requiem branch lost or manufactured liturgical text rows");
  assert.ok(displayed.every(row=>row.latin&&row.english&&row.french &&
    row.sourceStatus===REQUIEM_EDITORIAL_TEXT_SOURCE.status &&
    row.translationSource?.startsWith("AO_ORIGINAL_EDITORIAL_1962_REQUIEM") &&
    sourceIds.has(row.sourceRecordId)),
    "One funeral text row is missing its source-owned aligned bilingual reading");
  const uniqueIds=new Set(displayed.map(p=>p.id));
  assert.equal(uniqueIds.size,displayed.length,"Requiem duplicated a liturgical row");
  for(const row of displayed){
   assert.equal(specialRiteVernacular(row,{language:"en"}),row.english);
   assert.equal(specialRiteVernacular(row,{language:"fr"}),row.french);
  }
  const nr=built.cards.find(c=>c.id==="ABS-R02");
  assert.equal(Boolean(nr),bodyPresent,
    "Non intres was displayed outside its existing body-present branch");
  const burial=built.cards.find(c=>c.id==="ABS-R05");
  assert.equal(Boolean(burial),bodyPresent&&burialProcession,
    "In paradisum shown without explicit funeral procession and body presence");
  if(burial){
   assert.deepEqual(burial.paragraphs.map(row=>row.id),["ABS-R05-I","ABS-R05-C"]);
   assert.equal(burial.handoff,"BURIAL_PROCESSION");
  }
  const oration=built.cards.find(c=>c.id==="ABS-R04").paragraphs.find(row=>row.id==="ABS-R04-O");
  assert.equal(oration.latin,bodyPresent?source.kyriePaterVersicles.prayerBodyPresent:
    source.kyriePaterVersicles.prayerBodyAbsent,
    "The two 1962 funeral collects are not interchangeable");
  assert.ok(oration.english.length>145&&oration.french.length>155,
    "Alternate oration was replaced by a short summary");
  assert.match(oration.translationSource,new RegExp(bodyPresent?"present$":"absent$"));
  const expectedCards=bodyPresent?(burialProcession?5:4):3;
  assert.equal(built.cards.length,expectedCards);
  assert.equal(ctrl.project().card.id,"ABS-R01");
  for(let i=1;i<built.cards.length;i++){
   ctrl.next();assert.equal(ctrl.project().card.id,built.cards[i].id);
  }
  assert.equal(ctrl.project().atEnd,true);
  assert.notEqual(ctrl.project().posture,"PROCESSIONAL",
    "Requiem burial posture must never be imposed before personal confirmation");
  if(burial){
   ctrl.setBurialParticipant(true);
   assert.equal(ctrl.project().posture,"PROCESSIONAL");
   ctrl.setBurialParticipant(false);
   assert.notEqual(ctrl.project().posture,"PROCESSIONAL");
  }
  const hymn=built.cards.find(c=>c.id==="ABS-R03");
  assert.deepEqual(hymn.paragraphs.map(row=>row.latin),source.liberaMe.map(r=>r.latin));
  assert.equal(hymn.paragraphs[0].english,hymn.paragraphs.at(-1).english);
  assert.equal(hymn.paragraphs[0].french,hymn.paragraphs.at(-1).french);
  const pages=projectSpecialRiteReadingPages("ABS-R04",
    built.cards.find(c=>c.id==="ABS-R04").paragraphs);
  assert.deepEqual(pages.map(p=>p.rows.length),[4,6,4,2],
    "Kyrie, Pater, V/R, and complete oration/response must retain source order");
  assert.deepEqual(pages.flatMap(p=>p.rows),
    built.cards.find(c=>c.id==="ABS-R04").paragraphs);
  permutations.push({bodyPresent,burialProcession,paragraphs:displayed.length});
 }
}
const verse=source.liberaMe[0].latin;
assert.throws(()=>projectRequiemBilingualRow("ABS-R03-1","RESPONSE",
  verse.replace("morte ætérna","morte alia"),"ABS-030"),
  /REQUIEM_SOURCE_OR_EDITORIAL_ALIGNMENT_INVALID/,
  "A changed 1962 Latin word cannot pass a stale EN/FR translation");
assert.throws(()=>projectRequiemBilingualRow("ABS-R04-O","TEXT",
  "Deus, non canon", "ABS-040"),
  /REQUIEM_SOURCE_OR_EDITORIAL_ALIGNMENT_INVALID/);
assert.throws(()=>projectRequiemBilingualRow("ABS-R02-P","TEXT",
  source.nonIntres.latin,"ABS-NOT-OWNED"),/REQUIEM_UNOWNED_SOURCE_RECORD/);
console.log("PASS 1962 Requiem Absolution complete source-locked EN/FR, four rite branches, and personal burial stance. "+JSON.stringify(permutations));
