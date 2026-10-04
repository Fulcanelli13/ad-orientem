import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildHolyThursdayPostPayload,createHolyThursdayPostReaderController} from "../src/mass/reader-holy-thursday-post.js";
import {makeResolvedMass,compileMassPlan} from "../src/mass/session-engine.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const extension=load("../data/mass/special-days-extension.v1.3.json");
const payload=load("../data/presentation/reader-holy-thursday-post.v1.json");
const graph=extension.graphs.HT_POST;

assert.equal(graph.length,6);
const built=buildHolyThursdayPostPayload({graph,payload});
assert.equal(built.readerPayloadComplete,true);
assert.equal(built.cards.length,6);
assert.equal(built.cards[0].posture,"KNEEL");
assert.equal(built.cards[0].paragraphs.length,4);
assert.equal(built.cards[2].paragraphs.length,2);
assert.equal(built.cards[4].posture,"LOCAL_OR_INHERIT");
assert.ok(built.cards[4].paragraphs.length>=15,"Pian Psalm 21 was not fully retained");
assert.equal(built.cards[5].handoff,"POST_MASS_LIFECYCLE");

const ctrl=createHolyThursdayPostReaderController({graph,payload});
assert.equal(ctrl.project().card.id,"HT-R01");
ctrl.next();
assert.equal(ctrl.project().card.id,"HT-R02");
assert.equal(ctrl.project().posture,"KNEEL");
ctrl.setJoiningState("JOINING");
assert.equal(ctrl.project().posture,"STAND_WALK");
assert.equal(ctrl.project().action,"FOLLOW_BEHIND");
ctrl.setJoiningState("NOT_JOINING");
assert.equal(ctrl.project().posture,"LOCAL_OR_INHERIT");
ctrl.next();
assert.equal(ctrl.project().card.id,"HT-R03");
assert.equal(ctrl.project().posture,"KNEEL");
ctrl.next();
assert.equal(ctrl.project().card.id,"HT-R04");
ctrl.setJoiningState("JOINING");
assert.equal(ctrl.project().action,"STAND_DOUBLE_KNEE_GENUFLECTION_STAND_RETURN");
ctrl.next();
assert.equal(ctrl.project().card.id,"HT-R05");
assert.equal(ctrl.project().posture,"LOCAL_OR_INHERIT");
assert.equal(ctrl.project().action,null);
ctrl.next();
assert.equal(ctrl.project().card.id,"HT-R06");
assert.equal(ctrl.project().handoff,"POST_MASS_LIFECYCLE");

const mass=makeResolvedMass({
  date:"2027-03-25",form:"MISSA_CANTATA_INCENSE",presentationMode:"SIMPLE",
  calendarCelebration:{id:"holy-thursday",type:"CALENDAR"},
  followingActions:["HOLY_THURSDAY_POST"],
});
const plan=compileMassPlan(mass);
assert.deepEqual([...plan.followingGraphs],["HOLY_THURSDAY_POST"]);
assert.equal(plan.blessingAllowed,false);
assert.equal(plan.normalLastGospel,false);
assert.equal(plan.lifecycle.followingAction.active,true);

console.log("native Holy Thursday post-Mass: PASS — translation, personal joining state, altar of repose, Pian Psalm 21 stripping and lifecycle handoff.");
