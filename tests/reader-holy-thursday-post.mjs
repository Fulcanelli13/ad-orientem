import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildHolyThursdayPostPayload,createHolyThursdayPostReaderController} from "../src/mass/reader-holy-thursday-post.js";
import {makeResolvedMass,compileMassPlan} from "../src/mass/session-engine.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const extension=load("../data/mass/special-days-extension.v1.3.json");
const payload=load("../data/presentation/reader-holy-thursday-post.v1.json");
const graph=extension.graphs.HT_POST;

assert.equal(graph.length,6);
assert.deepEqual(graph.map(x=>x.id),[
  "HT-TRN-010","HT-TRN-020","HT-TRN-030","HT-TRN-040","HT-STRIP-010","HT-POST-900"
]);

const built=buildHolyThursdayPostPayload({graph,payload});
assert.equal(built.readerPayloadComplete,true);
assert.equal(built.sourceBlobSha,"fc4dd294c86b1f3e6dd6938615fc6ffbc868f10b");
assert.equal(built.cards.length,6);
assert.equal(built.cards[0].paragraphs.length,4);
assert.equal(built.cards[2].paragraphs.length,2);
assert.ok(built.cards[4].paragraphs.length>=30,"Holy Thursday stripping lost Psalm 21");
assert.match(built.cards[4].paragraphs[0].latin,/Divisérunt sibi vestiménta mea/);
assert.equal(built.cards[4].posture,"LOCAL_OR_INHERIT");
assert.equal(built.cards[5].handoff,"POST_MASS_LIFECYCLE");

const ctrl=createHolyThursdayPostReaderController({graph,payload});
let s=ctrl.project();
assert.equal(s.card.id,"HT-R01");
assert.equal(s.posture,null,"translation card fabricated kneeling before the Sacrament passed");
s=ctrl.setRiteState("SSMM_PASSES_PEWS");
assert.equal(s.card.id,"HT-R01");
assert.equal(s.posture,"KNEEL");

ctrl.setJoining(false);
s=ctrl.setRiteState("SSMM_HAS_PASSED");
assert.equal(s.card.id,"HT-R02");
assert.equal(s.posture,null,"non-joiner inherited processional posture");
ctrl.setJoining(true);
assert.equal(ctrl.project().posture,"STAND_WALK");
assert.equal(ctrl.project().personalAction,"FOLLOW_BEHIND");

s=ctrl.setRiteState("ARRIVE_ALTAR_OF_REPOSE");
assert.equal(s.card.id,"HT-R03");
assert.equal(s.posture,"KNEEL");
assert.match(s.card.paragraphs[0].latin,/Tantum ergo Sacraméntum/);

s=ctrl.setRiteState("SILENT_ADORATION_COMPLETE");
assert.equal(s.card.id,"HT-R04");
assert.equal(s.posture,"STAND_DOUBLE_KNEE_GENUFLECTION_STAND");
assert.equal(s.personalAction,"RETURN_AFTER_ADORATION");

s=ctrl.setRiteState("STRIPPING_OF_ALTARS_BEGINS");
assert.equal(s.card.id,"HT-R05");
assert.equal(s.posture,null,"stripping of altars fabricated a universal faithful posture");
s=ctrl.setRiteState("STRIPPING_COMPLETE");
assert.equal(s.card.id,"HT-R06");
assert.equal(s.handoff,"POST_MASS_LIFECYCLE");
assert.throws(()=>ctrl.setRiteState("DATE_IS_HOLY_THURSDAY"),/Unsupported/,
  "Holy Thursday date fabricated a post-Mass state");

const mass=makeResolvedMass({
  date:"2027-03-25",form:"MISSA_CANTATA_INCENSE",presentationMode:"SIMPLE",
  calendarCelebration:{id:"holy-thursday",type:"CALENDAR"},
  followingActions:["HOLY_THURSDAY_POST"],
});
const plan=compileMassPlan(mass);
assert.equal(plan.dismissal,"BENEDICAMUS_DOMINO");
assert.equal(plan.blessingAllowed,false);
assert.equal(plan.normalLastGospel,false);
assert.deepEqual([...plan.followingGraphs],["HOLY_THURSDAY_POST"]);

const dateOnly=makeResolvedMass({
  date:"2027-03-25",form:"MISSA_CANTATA_INCENSE",presentationMode:"SIMPLE",
  calendarCelebration:{id:"holy-thursday",type:"CALENDAR"},
});
assert.deepEqual([...compileMassPlan(dateOnly).followingGraphs],[],
  "Holy Thursday date alone fabricated the explicit post-Mass following action");

console.log("native Holy Thursday post-Mass: PASS — explicit translation/reposition, participant state, stripping and lifecycle handoff.");
