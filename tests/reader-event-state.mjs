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

// GitHub Pages occasionally emits a transient HTTP 503 for ONE required
// canonical MC-event chunk. A subsequent valid response may recover, but
// persistent 503/404, missing or corrupted JSON must still fail closed.
const canonicalFixture=name=>({events:[{id:"MC-TST-"+
  String(READER_EVENT_FILES.indexOf(name)+1).padStart(3,"0"),
  actor:"PRIEST",title:"Source-owned test event"}]});
const fakeHttpResponse=(status,name)=>({ok:status===200,status,
  json:async()=>canonicalFixture(name)});
const visits=new Map();
const recovered=await loadCanonicalReaderEvents({
  fetchImpl:async url=>{
    const name=String(url).split("/").pop();
    const n=(visits.get(name)??0)+1;visits.set(name,n);
    return fakeHttpResponse(name==="mc-events-06.v1.json"&&n===1?503:200,name);
  }
});
assert.equal(recovered.length,6,"Reader must have all six event chunks");
assert.equal(visits.get("mc-events-06.v1.json"),2,
  "503 retries only the transiently failed event chunk");
assert.equal(visits.get("mc-events-05.v1.json"),1,
  "Healthy event files must not be refetched");
for(const status of [404,503]){
  let requests=0;
  await assert.rejects(loadCanonicalReaderEvents({fetchImpl:async url=>{
    const name=String(url).split("/").pop();
    if(name==="mc-events-06.v1.json"){requests++;return fakeHttpResponse(status,name)}
    return fakeHttpResponse(200,name);
  }}),new RegExp("Unable to load canonical Mass events \\("+status+"\\)"));
  assert.equal(requests,status===503?3:1,
    "Permanent 404 must fail immediately; 503 must fail after finite retries");
}
await assert.rejects(loadCanonicalReaderEvents({
 fetchImpl:async url=>{
   const name=String(url).split("/").pop();
   if(name==="mc-events-06.v1.json")return {ok:true,status:200,
     json:async()=>{throw new SyntaxError("Bad event JSON")}};
   return fakeHttpResponse(200,name);
 }
}),/Bad event JSON/,
"Malformed canonical event source cannot be suppressed by retry");
let canceled=0;
await assert.rejects(loadCanonicalReaderEvents({fetchImpl:async url=>{
 const name=String(url).split("/").pop();
 if(name==="mc-events-06.v1.json"){canceled++;
   throw Object.assign(new Error("cancel"),{name:"AbortError"})}
 return fakeHttpResponse(200,name);
}}),/Unable to load canonical Mass events \(network\)/);
assert.equal(canceled,1,"Aborted load must not continue after navigation");
console.log("reader canonical event loader: transient 503 recovered; persistent 503, 404, malformed source and abort fail closed");
