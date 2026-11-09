import assert from "node:assert/strict";
import {
  buildCanonicalEventIndex,
  loadCanonicalReaderEvents,
  READER_EVENT_FILES,
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
  id:"MC-CRD-025",phase:"CREDO",actor:"PRIEST",title:"Priest reaches Et incarnatus",
  contentRef:"ordinary.credo",sourceMomentRefs:["E21"],
  voice:{audibility:"LOW_VOICE",speechAudibility:"LOW_VOICE"},
};
const gloria={
  id:"MC-GLR-020",phase:"GLORIA",actor:"PRIEST",title:"Priest recites while Schola sings",
  contentRef:"ordinary.gloria",sourceMomentRefs:["E10"],
  voice:{audibility:"MIXED",speechAudibility:"MIXED"},
};
const credoGeneric={
  id:"MC-CRD-020",phase:"CREDO",actor:"PRIEST",title:"Priest recites while Schola sings",
  contentRef:"ordinary.credo",sourceMomentRefs:["E20"],
  voice:{audibility:"MIXED",speechAudibility:"MIXED"},
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

const g=projectNativeEventChannels(gloria);
assert.equal(g.gesture,null,"GLORIA must fail closed until faithful bows are adjudicated");
assert.equal(g.ownership.gesture,"R17_FAIL_CLOSED_PENDING_SOURCE_ADJUDICATION");

const cg=projectNativeEventChannels(credoGeneric);
assert.equal(cg.gesture,null,"generic CREDO must fail closed until faithful bows are adjudicated");
assert.equal(cg.ownership.gesture,"R17_FAIL_CLOSED_PENDING_SOURCE_ADJUDICATION");

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

// Actual six-source loader contract: recover one transient CDN 503 without
// changing the required chunk count or retrying healthy event files.
const canonicalFixture=name=>({events:[{
  id:"MC-TST-"+String(READER_EVENT_FILES.indexOf(name)+1).padStart(3,"0"),
  actor:"PRIEST",title:"Source-owned test event"
}]});
const eventHttpResponse=(status,name)=>({ok:status===200,status,
  json:async()=>canonicalFixture(name)});
const requests=new Map();
const restored=await loadCanonicalReaderEvents({fetchImpl:async url=>{
  const file=String(url).split("/").pop();
  const n=(requests.get(file)??0)+1;requests.set(file,n);
  return eventHttpResponse(file==="mc-events-06.v1.json"&&n===1?503:200,file);
}});
assert.equal(restored.length,6,"All six canonical MC source chunks remain required");
assert.equal(requests.get("mc-events-06.v1.json"),2,
  "Only the transiently failed chunk is retried");
for(const file of READER_EVENT_FILES.slice(0,5))
  assert.equal(requests.get(file),1,"Healthy chunks remain single-fetch");
for(const status of [404,500,503,504]){
  let attempts=0;
  await assert.rejects(loadCanonicalReaderEvents({fetchImpl:async url=>{
    const file=String(url).split("/").pop();
    if(file==="mc-events-06.v1.json"){
      attempts++;return eventHttpResponse(status,file);
    }
    return eventHttpResponse(200,file);
  }}),new RegExp("Unable to load canonical Mass events \\("+status+"\\)"));
  assert.equal(attempts,status===404?1:3,
    "Permanent errors fail immediately; transient retries are bounded");
}
await assert.rejects(loadCanonicalReaderEvents({fetchImpl:async url=>{
  const file=String(url).split("/").pop();
  return file==="mc-events-06.v1.json"
    ? {ok:true,status:200,json:async()=>{throw new SyntaxError("Bad event JSON")}}
    : eventHttpResponse(200,file);
}}),/Bad event JSON/,"Corrupt source JSON must not be retried or hidden");
let aborted=0;
await assert.rejects(loadCanonicalReaderEvents({fetchImpl:async url=>{
  const file=String(url).split("/").pop();
  if(file==="mc-events-06.v1.json"){
    aborted++;throw Object.assign(new Error("cancel"),{name:"AbortError"});
  }
  return eventHttpResponse(200,file);
}}),/Unable to load canonical Mass events \\(network\\)/);
assert.equal(aborted,1,"Aborted navigation must not retry");

let networkCalls=0;
const recoveredNetwork=await loadCanonicalReaderEvents({fetchImpl:async url=>{
  const file=String(url).split("/").pop();
  if(file==="mc-events-06.v1.json"&&++networkCalls===1)
    throw new TypeError("Network down");
  return eventHttpResponse(200,file);
}});
assert.equal(recoveredNetwork.length,6);
assert.equal(networkCalls,2);
console.log("reader source loader: all six chunks required; short-lived CDN/network errors recovered; source corruption and abort fail closed");
