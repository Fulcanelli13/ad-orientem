import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildCorpusChristiProcessionPayload,createCorpusChristiProcessionReaderController} from "../src/mass/reader-corpus-christi.js";
import {makeResolvedMass,compileMassPlan} from "../src/mass/session-engine.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const extension=load("../data/mass/special-days-extension.v1.3.json");
const payload=load("../data/presentation/reader-corpus-christi.v1.json");
const graph=extension.graphs.CORPUS;

assert.equal(graph.length,8);
const built=buildCorpusChristiProcessionPayload({graph,payload});
assert.equal(built.readerPayloadComplete,true);
assert.equal(built.cards.length,6);
assert.equal(built.cards[1].paragraphs.length,4);
assert.equal(built.cards[3].paragraphs.length,2);
assert.equal(built.cards[4].paragraphs[0].kind,"VERSICLE");
assert.equal(built.cards[4].paragraphs[1].kind,"RESPONSE");
assert.equal(built.cards[5].handoff,"POST_MASS_LIFECYCLE");

const ctrl=createCorpusChristiProcessionReaderController({graph,payload});
assert.equal(ctrl.project().card.id,"CORPUS-R01");
let s=ctrl.setSacramentalState("MONSTRANCE_PLACED_IN_CELEBRANT_HANDS");
assert.equal(s.card.id,"CORPUS-R02");
assert.equal(s.objectState,"BLESSED_SACRAMENT_IN_PROCESSION");
s=ctrl.setSacramentalState("PROCESSION_ACTIVE");
assert.equal(s.card.id,"CORPUS-R03");
assert.equal(s.posture,"LOCAL_REVERENT","nonparticipant was forced into processional posture");
ctrl.setProcessionParticipant(true);
assert.equal(ctrl.project().posture,"PROCESSIONAL");
s=ctrl.setSacramentalState("BLESSED_SACRAMENT_REPLACED_ON_ALTAR");
assert.equal(s.card.id,"CORPUS-R04");
assert.equal(s.objectState,"BLESSED_SACRAMENT_EXPOSED_AT_ALTAR");
ctrl.next();
assert.equal(ctrl.project().card.id,"CORPUS-R05");
s=ctrl.setSacramentalState("BENEDICTION_COMPLETE");
assert.equal(s.card.id,"CORPUS-R06");
assert.equal(s.handoff,"POST_MASS_LIFECYCLE");
assert.throws(()=>ctrl.setSacramentalState("DATE_IS_CORPUS_CHRISTI"),/Unsupported/,
  "calendar date incorrectly activated a sacramental-state transition");

const mass=makeResolvedMass({
  date:"2027-05-27",form:"MISSA_CANTATA_INCENSE",presentationMode:"SIMPLE",
  calendarCelebration:{id:"corpus-christi",type:"CALENDAR"},
  followingActions:["CORPUS_CHRISTI_PROCESSION"],
});
const plan=compileMassPlan(mass);
assert.equal(plan.dismissal,"BENEDICAMUS_DOMINO");
assert.equal(plan.blessingAllowed,false);
assert.equal(plan.normalLastGospel,false);
assert.deepEqual([...plan.followingGraphs],["CORPUS_CHRISTI_PROCESSION"]);

const dateOnly=makeResolvedMass({
  date:"2027-05-27",form:"MISSA_CANTATA_INCENSE",presentationMode:"SIMPLE",
  calendarCelebration:{id:"corpus-christi",type:"CALENDAR"},
});
assert.deepEqual([...compileMassPlan(dateOnly).followingGraphs],[],
  "Corpus Christi date alone fabricated the optional procession");

console.log("native Corpus Christi procession: PASS — explicit following action, sacramental-state hymn gates, Benediction and lifecycle handoff.");
