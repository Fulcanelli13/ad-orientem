import assert from "node:assert/strict";
import {
  buildCanonicalEventIndex,
  createNativeEventStateController,
  extractCanonicalEventId,
  projectNativeEventChannels,
} from "../src/mass/reader-event-state.js";

const priest={
  id:"MC-INT-020",actor:"PRIEST",title:"Priest recites Introit",
  contentRef:"proper.introit",sourceMomentRefs:["E08"],
  voice:{audibility:"LOW_VOICE",speechAudibility:"LOW_VOICE"},
};
const response={
  id:"MC-OFF-170",actor:"LITURGICAL_RESPONDERS",title:"Suscipiat Dominus",
  contentRef:"ordinary.suscipiat_dominus",sourceMomentRefs:["E29"],
  voice:{audibility:"SPOKEN_AUDIBLE",speechAudibility:"SPOKEN_AUDIBLE"},
};
const incarnatus={
  id:"MC-CRD-025",actor:"PRIEST",title:"Priest reaches Et incarnatus",
  contentRef:"ordinary.credo",sourceMomentRefs:["E21"],
  voice:{audibility:"LOW_VOICE",speechAudibility:"LOW_VOICE"},
};

assert.equal(buildCanonicalEventIndex([priest,response,incarnatus]).size,3);

const p=projectNativeEventChannels(priest);
assert.equal(p.priestVoice.label,"LOW VOICE");
assert.equal(p.ownership.priestVoice,"R17_NATIVE");
assert.equal(p.response,null);
assert.equal(p.posture,null);
assert.equal(p.priestPosition,null);

const r=projectNativeEventChannels(response);
assert.equal(r.response.label,"RESPOND");
assert.equal(r.response.contentRef,"ordinary.suscipiat_dominus");
assert.equal(r.ownership.response,"R17_NATIVE");
assert.equal(r.priestVoice,null);

const i=projectNativeEventChannels(incarnatus);
assert.equal(i.gesture.type,"GENUFLECT");
assert.equal(i.gesture.transient,true);
assert.equal(i.ownership.gesture,"R17_NATIVE");

const ctrl=createNativeEventStateController([priest,response,incarnatus]);
assert.equal(ctrl.count,3);
assert.equal(ctrl.project("MC-INT-020").priestVoice.label,"LOW VOICE");
assert.equal(ctrl.project("MC-OFF-170").response.label,"RESPOND");
assert.equal(ctrl.project("missing"),null);

assert.equal(extractCanonicalEventId({currentEventId:"MC-INT-020"}),"MC-INT-020");
assert.equal(extractCanonicalEventId({current:{event:{id:"MC-CRD-025"}}}),null);
assert.equal(extractCanonicalEventId({current:{eventId:"MC-CRD-025"}}),"MC-CRD-025");
assert.equal(extractCanonicalEventId("MC-OFF-170"),"MC-OFF-170");
assert.equal(extractCanonicalEventId({random:"MC-OFF-170"}),null);

console.log("reader event state: PASS");
