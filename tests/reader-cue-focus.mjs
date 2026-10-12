import assert from "node:assert/strict";
import { pickActiveCue, markActiveCue } from "../src/mass/reader-cue-focus.js";

const items=[
  {cueId:"AO.SM.C0001",top:0,bottom:34},
  {cueId:"AO.SM.C0002",top:44,bottom:84},
  {cueId:"AO.SM.C0003",top:94,bottom:134},
];

assert.equal(pickActiveCue({scrollTop:0,clientHeight:80,scrollHeight:180,items}),"AO.SM.C0001",
  "first cue lost ownership at scrollTop zero");
assert.equal(pickActiveCue({scrollTop:28,clientHeight:80,scrollHeight:180,items}),"AO.SM.C0002");
assert.equal(pickActiveCue({scrollTop:100,clientHeight:80,scrollHeight:180,items}),"AO.SM.C0003",
  "last cue lost ownership at bottom edge");
// Compact LIVE cards start with ~22px top padding; the second cue must
// acquire a focus interval without requiring negative scrollTop.
const opening=[
  {cueId:"AO.SM.C0055",top:22,bottom:103},
  {cueId:"AO.SM.C0056",top:130,bottom:164},
  {cueId:"AO.SM.C0057",top:178,bottom:248},
];
assert.equal(pickActiveCue({scrollTop:0,clientHeight:724,scrollHeight:1298,items:opening}),"AO.SM.C0055");
assert.equal(pickActiveCue({scrollTop:45,clientHeight:724,scrollHeight:1298,items:opening}),"AO.SM.C0056",
  "second Gloria line skipped because 39% focus line is below the first cues");
assert.equal(pickActiveCue({scrollTop:165,clientHeight:724,scrollHeight:1298,items:opening}),"AO.SM.C0057",
  "opening focus adaptation stalls before the third source cue");

assert.equal(pickActiveCue({
  scrollTop:0,clientHeight:80,scrollHeight:80,
  items:[{cueId:"not-a-cue",top:0,bottom:40}],
}),null);

assert.equal(pickActiveCue({
  scrollTop:30,clientHeight:100,scrollHeight:240,
  items:[
    {cueId:"AO.SM.C0100",top:60,bottom:71},
    {cueId:"AO.SM.C0101",top:72,bottom:90},
    {cueId:"AO.SM.C0102",top:100,bottom:120},
  ],
}),"AO.SM.C0100","default LIVE focus point no longer sits in the approved ~39% reading zone");

// Repeated focus/resize projections must not rewrite identical data-active
// states. A cue handoff updates only the paragraphs that actually change.
const writes=[];
const node=id=>{
  const dataset=new Proxy({cueId:id,active:"false"},{set(target,key,value){
    writes.push([id,key,value]);target[key]=value;return true;
  }});
  return {dataset};
};
const activeNodes=[node("AO.SM.C0001"),node("AO.SM.C0002")];
const simulated={querySelectorAll:()=>activeNodes};
markActiveCue(simulated,"AO.SM.C0001");
assert.equal(writes.length,1);
markActiveCue(simulated,"AO.SM.C0001");
assert.equal(writes.length,1,"unchanged focus state rewrote live DOM attributes");
markActiveCue(simulated,"AO.SM.C0002");
assert.deepEqual(writes,[["AO.SM.C0001","active","true"],["AO.SM.C0001","active","false"],["AO.SM.C0002","active","true"]]);
// Multiple display paragraphs of the *same* Proper lesson share one source
// event, but only the paragraph nearest the moving 39% reading line lights up.
// Do not create duplicate canonical C0075 events or pull C0076 forward.
const makeProper=(offset,id)=>{
  const el={dataset:{cueId:id,properCueScope:id,active:"false"}};
  el.getBoundingClientRect=()=>({
    top:offset-scoped.scrollTop,bottom:offset+100-scoped.scrollTop,height:100
  });
  return el;
};
const scoped={scrollTop:0,scrollHeight:320,clientHeight:100,
  getBoundingClientRect:()=>({top:0,bottom:100,height:100}),
  querySelectorAll:()=>properRows
};
const properRows=[makeProper(0,"AO.SM.C0075"),makeProper(110,"AO.SM.C0075")];
markActiveCue(scoped,"AO.SM.C0075");
assert.deepEqual(properRows.map(p=>p.dataset.active),["true","false"],
  "opening of Epistle lost first lit paragraph");
scoped.scrollTop=80;
markActiveCue(scoped,"AO.SM.C0075");
assert.deepEqual(properRows.map(p=>p.dataset.active),["false","true"],
  "second Epistle paragraph did not light without inventing another cue");
markActiveCue(scoped,"AO.SM.C0076");
assert.deepEqual(properRows.map(p=>p.dataset.active),["false","false"],
  "Epistle illumination leaked into server response");

console.log("reader cue focus: PASS — 39% focus zone and no redundant DOM mutations.");
