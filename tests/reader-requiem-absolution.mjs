import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildRequiemAbsolutionPayload, createRequiemAbsolutionReaderController } from "../src/mass/reader-requiem-absolution.js";
import {withRequiemXIII3MissalNotes,REQUIEM_XIII3_NOTE_OWNER,REQUIEM_XIII3_SOURCE} from "../src/mass/reader-requiem-conditions.js";
import {normalizeReaderMoment} from "../src/mass/reader-dom.js";
import { makeResolvedMass, compileMassPlan } from "../src/mass/session-engine.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const extension=load("../data/mass/special-days-extension.v1.3.json");
const payload=load("../data/presentation/reader-requiem-absolution.v1.json");
const graph=extension.graphs.ABS;

assert.equal(graph.length,5);

let built=buildRequiemAbsolutionPayload({graph,payload,bodyPresent:true,burialProcession:true});
assert.equal(built.cards.length,5);
assert.equal(built.cards[0].id,"ABS-R01");
// Every ceremonial direction is rendered inline at its own existing native
// Absolution card; the reader's legacy Guide panel is hidden in production.
const rubrics=built.cards.flatMap(card=>card.paragraphs
  .filter(x=>x.kind==="RUBRIC").map(x=>({...x,cardId:card.id})));
assert.deepEqual(rubrics.map(x=>x.cardId),
  ["ABS-R01","ABS-R02","ABS-R03","ABS-R04","ABS-R05"]);
assert.deepEqual(rubrics.map(x=>x.id),
  ["ABS-R01-R","ABS-R02-R","ABS-R03-R","ABS-R04-R","ABS-R05-R"]);
assert.deepEqual(rubrics.map(x=>x.sourceRecordId),
  ["ABS-010","ABS-020","ABS-030","ABS-040","ABS-050"]);
for(const note of rubrics){
 assert.equal(note.owner,"RITUALE_1952_ABSOLUTION");
 assert.equal(note.observedNow,false,"Book directions must not appear as observed actions");
 assert.match(note.sourceUrl,/burial_of_adults\.php$/);
 assert.ok(note.english.length>50 && note.french.length>50);
 assert.equal(note.latin,undefined,"English rubrics must not masquerade as original Latin");
}
assert.match(rubrics[0].english,/deacon and subdeacon assist; otherwise servers assist/i);
assert.match(rubrics[0].english,/If a sermon is given.*before the Absolution/i);
assert.match(rubrics[1].english,/Non intres.*before.*Libera me/i);
assert.match(rubrics[2].english,/choir sings Libera me/i);
assert.match(rubrics[3].english,/first sprinkles.*then circles it again to incense/i);
assert.match(rubrics[3].french,/asperge d’abord.*puis en fait de nouveau le tour pour l’encenser/i);
assert.match(rubrics[4].english,/Only those actually joining/i);
assert.equal(built.cards[2].paragraphs.filter(p=>p.kind!=="RUBRIC").length,payload.liberaMe.length,
 "Choir rubric must not replace or reorder canonical Libera text");
assert.equal(built.cards[3].paragraphs.findIndex(p=>p.id==="ABS-R04-R"),
 built.cards[3].paragraphs.findIndex(p=>p.id==="ABS-R04-PN")+1,
 "Sprinkling and incensation must appear beside Pater noster");
for(const language of ["en","fr"]){
 const visible=built.cards.flatMap(card=>card.paragraphs.map(p=>({
  id:p.id,kind:p.kind,primary:p.kind==="RUBRIC"
     ?(language==="fr"?p.french:p.english):p.latin,sourceCueIds:[p.sourceRecordId]})));
 const normalized=normalizeReaderMoment({paragraphs:visible});
 assert.equal(normalized.paragraphs.filter(p=>p.kind==="RUBRIC").length,5);
 assert.ok(normalized.paragraphs.every(p=>p.primary?.length),
  "A visible localized ritual direction must not go blank");
}
assert.match(built.cards[0].guide,/sermon.*after Mass.*before this Absolution/i);
assert.match(built.cards[0].guide,/If candles were distributed, they are lit for the Absolution/i);
assert.match(built.cards[0].guideFr,/prédication.*après la messe.*avant cette absoute/i);
assert.match(built.cards[0].guideFr,/Si des cierges ont été distribués.*on les allume/i);
assert.match(built.cards[0].guide,/no universal lay posture is imposed/i);
assert.equal(built.cards[0].guideSourceUrl,REQUIEM_XIII3_SOURCE);

// XIII.3 has three conditional in-Mass moments and an explicit, separately
// selected post-Mass Absolution. Do not invent a fourth in-Mass sermon card.
const original=[...["AO.SM.C0076","AO.SM.C0082","AO.SM.C0174","AO.SM.C0181"].map(cueId=>({
 id:cueId,sourceCueIds:[cueId],kind:cueId==="AO.SM.C0174"?"RUBRIC":"TEXT",
 primary:cueId==="AO.SM.C0174"?"[GENUFLECTS — ELEVATES HOST]":"Latin",
 publishedMissalRubrics:[],
}))];
const dead={form:"SOLEMN",actualCelebration:{type:"REQUIEM",id:"requiem"}};
const plain={form:"SOLEMN",actualCelebration:{type:"CALENDAR",id:"ordinary"}};
for(const language of ["en","fr"]){
 const rows=withRequiemXIII3MissalNotes(original,dead,{language});
 assert.equal(rows.length,4,"XIII.3 must not create or remove Mass paragraphs");
 assert.deepEqual(rows.map(x=>x.publishedMissalRubrics?.length??0),[1,1,1,0]);
 assert.equal(rows[0].publishedMissalRubrics[0].sourceCueId,"AO.SM.C0076");
 assert.equal(rows[1].publishedMissalRubrics[0].sourceCueId,"AO.SM.C0082");
 assert.equal(rows[2].publishedMissalRubrics[0].sourceCueId,"AO.SM.C0174");
 const events=rows.flatMap(x=>x.publishedMissalRubrics??[]);
 assert.equal(events.length,3);
 for(const event of events){
  assert.equal(event.owner,REQUIEM_XIII3_NOTE_OWNER);
  assert.equal(event.sourceId,"MR62_RITUS");
  assert.equal(event.sourceUrl,REQUIEM_XIII3_SOURCE);
  assert.equal(event.actor,"FAITHFUL");
  assert.equal(event.kind,"CONDITIONAL_DIRECTION");
  assert.equal(event.observedNow,false);
  assert.match(event.displayText,language==="fr"?/Si des cierges/:/If candles/);
 }
 const normalized=normalizeReaderMoment({paragraphs:rows});
 assert.deepEqual(normalized.paragraphs.map(x=>x.publishedMissalRubrics.length),[1,1,1,0],
   "Reader normalization hid a source-backed Requiem conditional note");
}
assert.deepEqual(withRequiemXIII3MissalNotes(original,plain).map(x=>x.publishedMissalRubrics?.length??0),[0,0,0,0]);
assert.deepEqual(withRequiemXIII3MissalNotes(original,{...dead,form:"UNKNOWN"}).map(x=>x.publishedMissalRubrics?.length??0),[0,0,0,0]);
assert.equal(withRequiemXIII3MissalNotes([{id:"other",sourceCueIds:["AO.SM.C0100"],publishedMissalRubrics:[]}],dead)[0].publishedMissalRubrics.length,0);
assert.equal(built.cards[1].id,"ABS-R02");
assert.ok(built.cards[1].paragraphs[0].latin.startsWith("Non intres"));
assert.equal(built.cards[2].id,"ABS-R03");
assert.ok(built.cards[2].paragraphs.some(x=>x.kind!=="RUBRIC" && x.latin?.includes("Líbera me")));
assert.equal(built.cards[3].faithfulGesture,null);
assert.ok(built.cards[3].paragraphs.some(x=>x.latin==="Pater noster."));
assert.equal(built.cards[4].id,"ABS-R05");
assert.equal(built.cards[4].posture,"PROCESSIONAL");
assert.equal(built.cards[4].handoff,"BURIAL_PROCESSION");

built=buildRequiemAbsolutionPayload({graph,payload,bodyPresent:false,burialProcession:true});
assert.equal(built.cards.length,3,"body-absent branch retained body/burial-only cards");
assert.equal(built.cards.flatMap(card=>card.paragraphs).filter(p=>p.kind==="RUBRIC").length,3);
assert.ok(built.cards.every(card=>card.paragraphs.every(p=>p.kind!=="RUBRIC" || p.observedNow===false)));
assert.ok(!built.cards.flatMap(c=>c.paragraphs).some(p=>p.id==="ABS-R02-R"),
 "Body-absent catafalque must not inherit the body-present Non intres direction");
assert.ok(!built.cards.some(x=>x.id==="ABS-R02"),"Non intres appeared without body present");
assert.ok(!built.cards.some(x=>x.id==="ABS-R05"),"In paradisum appeared without a body-present burial procession");
assert.ok(built.cards.find(x=>x.id==="ABS-R04").paragraphs.some(x=>x.kind!=="RUBRIC" && x.latin?.startsWith("Absolve")));

const ctrl=createRequiemAbsolutionReaderController({graph,payload,bodyPresent:true,burialProcession:true});
assert.equal(ctrl.project().card.id,"ABS-R01");
ctrl.next();
assert.equal(ctrl.project().card.id,"ABS-R02");
ctrl.next();
assert.equal(ctrl.project().card.id,"ABS-R03");
ctrl.next();
assert.equal(ctrl.project().card.id,"ABS-R04");
ctrl.next();
assert.equal(ctrl.project().card.id,"ABS-R05");
assert.equal(ctrl.project().atEnd,true);
assert.equal(ctrl.project().burialParticipant,false);
assert.equal(ctrl.project().posture,null,
  "Requiem burial procession imposed a personal walking posture on all faithful");
ctrl.setBurialParticipant(true);
assert.equal(ctrl.project().posture,"PROCESSIONAL",
  "person explicitly following the Requiem burial procession lost its cue");
ctrl.setBurialParticipant(false);
assert.equal(ctrl.project().posture,null,
  "Requiem stopped-participating state retained processional posture");
ctrl.previous();
assert.equal(ctrl.project().card.id,"ABS-R04");

const proper={status:"READY",data:{
  sourcePath:"Votive/Requiem",
  introit:{lat:"Requiem aeternam",en:"Eternal rest"},
  collects:[{lat:"Deus indulgentiarum",en:"O God"}],
  epistle:{lat:"Lectio",en:"Lesson"},
  gradual:{lat:"Requiem aeternam",en:"Eternal rest"},
  sequence:{lat:"Dies irae",en:"Day of wrath"},
  gospel:{lat:"Sequentia sancti Evangelii",en:"Gospel"},
  offertory:{lat:"Domine Jesu Christe",en:"Lord Jesus Christ"},
  secrets:[{lat:"Propitiare",en:"Be propitious"}],
  preface:{lat:"Praefatio",en:"Preface"},
  communion:{lat:"Lux aeterna",en:"Eternal light"},
  postcommunions:[{lat:"Praesta quaesumus",en:"Grant we beseech"}],
}};
const requiem=makeResolvedMass({
  date:"2026-10-04",form:"SOLEMN",presentationMode:"SIMPLE",
  calendarCelebration:{id:"TEMP",type:"CALENDAR"},
  requestedCelebration:{id:"requiem",type:"REQUIEM",title:"Requiem"},
  proper,
  overlays:["REQUIEM"],
  followingActions:["REQUIEM_ABSOLUTION"],
});
const plan=compileMassPlan(requiem);
assert.equal(plan.normalLastGospel,false);
assert.equal(plan.blessingAllowed,false);
assert.deepEqual([...plan.followingGraphs],["REQUIEM_ABSOLUTION"]);
assert.equal(plan.lifecycle.followingAction.active,true);

assert.throws(()=>compileMassPlan(makeResolvedMass({
  date:"2026-10-04",form:"SOLEMN",presentationMode:"SIMPLE",
  calendarCelebration:{id:"TEMP",type:"CALENDAR"},
  followingActions:["REQUIEM_ABSOLUTION"],
})),/requires the Requiem overlay/);

console.log("native Requiem Absolution: PASS — body branch, Libera, responses, no lay imitation and burial-procession branch.");
