import assert from "node:assert/strict";
import { pickActiveCue, pickReadingParagraph, markActiveCue, markUncuedReadingFocus } from "../src/mass/reader-cue-focus.js";

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
// A Proper TEXT does not acquire a fabricated source cue. It has a separate
// visual reading state, while the liturgical cue and priest action are intact.
let top=80;
const makeRow=(y,id)=>({
  dataset:id?{kind:"TEXT",cueId:id,active:"true"}:{kind:"TEXT"},
  getClientRects:()=>[{}],
  getBoundingClientRect:()=>({top:y-top,bottom:y+38-top}),
  hidden:false
});
const cueRow=makeRow(0,"AO.SM.C0001"),properRow=makeRow(115,null);
const body={dataset:{},querySelectorAll:()=>[cueRow,properRow]};
const scroll={scrollTop:top,scrollHeight:300,clientHeight:100,
  querySelector:()=>body,getBoundingClientRect:()=>({top:0})};
assert.equal(markUncuedReadingFocus(scroll),properRow);
assert.equal(properRow.dataset.readingActive,"true");
assert.equal(body.dataset.aoVisualFocus,"uncued");
assert.equal(properRow.dataset.cueId,undefined,"Proper must never receive invented ceremonial cue");
assert.equal(properRow.dataset.readingPosition,"current");
assert.equal(cueRow.dataset.readingPosition,"previous");
assert.equal(cueRow.dataset.readingActive,"false",
  "The source cue may remain ceremonially active without lighting the wrong text");

assert.equal(cueRow.dataset.active,"true","Priest/faithful source cue must remain unchanged");
top=0;scroll.scrollTop=0;
markUncuedReadingFocus(scroll);
assert.equal(properRow.dataset.readingActive,"false");
assert.equal(body.dataset.aoVisualFocus,undefined);
assert.equal(cueRow.dataset.readingActive,"true","Cued text must receive visual reading focus");
assert.equal(cueRow.dataset.readingPosition,"current");
assert.equal(properRow.dataset.readingPosition,"next");


// Every visible paragraph, whether cued or uncued, gets sequential reading
// territory during a slow finger scroll. This is distinct from ceremonial
// source-cue ownership and does not invent event IDs.
const readingItems=[
  {top:24,bottom:92,id:"source-prayer"},
  {top:108,bottom:137,id:"proper"},
  {top:146,bottom:160,id:"short-response"},
  {top:171,bottom:220,id:"long-prayer"},
  {top:245,bottom:330,id:"last-paragraph"},
];
let previous=-1;
const reached=[];
for(let y=0;y<=570;y++){
  const selected=pickReadingParagraph({
    scrollTop:y,clientHeight:130,scrollHeight:700,items:readingItems
  });
  const index=readingItems.indexOf(selected);
  assert.ok(index>=0,"A nonempty reading card lost visual focus");
  assert.ok(index>=previous&&index<=previous+1,
    "Slow continuous scrolling skipped or reversed a paragraph at scrollTop "+y);
  if(index!==previous)reached.push(selected.id);
  previous=index;
}
assert.deepEqual(reached,readingItems.map(x=>x.id),
 "Every paragraph must illuminate once in canonical source order");
// Between two prayer rows, focus the physically nearest text edge, not
// the centre of a preceding long prayer or the centre of a tiny response.
const gapRows=[{id:"long-prayer",top:0,bottom:200},
  {id:"short-response",top:220,bottom:225},
  {id:"following",top:245,bottom:420}];
assert.equal(pickReadingParagraph({
  scrollTop:166,clientHeight:100,scrollHeight:600,items:gapRows
})?.id,"long-prayer","short response lit too early in inter-paragraph whitespace");
assert.equal(pickReadingParagraph({
  scrollTop:178,clientHeight:100,scrollHeight:600,items:gapRows
})?.id,"short-response","short response never acquired its nearest-edge reading territory");

// An omitted or hidden paragraph cannot steal illumination from actual text.
const emptyRow={...makeRow(48,null),textContent:"",closest:()=>null};
const hiddenRow={...makeRow(64,null),textContent:"Hidden",closest:()=>({hidden:true})};
const realRow={...makeRow(80,null),textContent:"A source-backed prayer",closest:()=>null};
const filteredBody={dataset:{},querySelectorAll:()=>[emptyRow,hiddenRow,realRow]};
const filteredScroll={scrollTop:0,scrollHeight:300,clientHeight:100,
  querySelector:()=>filteredBody,getBoundingClientRect:()=>({top:0})};
markUncuedReadingFocus(filteredScroll);
assert.equal(realRow.dataset.readingActive,"true",
  "Empty/hidden rows displaced actual prayer focus");
assert.equal(emptyRow.dataset.readingActive,"false");
assert.equal(hiddenRow.dataset.readingActive,"false");

assert.equal(pickReadingParagraph({items:[]}),null);

console.log("reader cue focus: PASS — 39% focus zone and no redundant DOM mutations.");
