import assert from "node:assert/strict";
import {packSourceCueRail} from "../src/mass/reader-rail-anchors.js";

const C1="AO.SM.C0174",C2="AO.SM.C0181";
assert.deepEqual(packSourceCueRail({height:0,items:[]}),[]);
assert.deepEqual(packSourceCueRail({height:500,items:[
  {id:1,side:"right",cueId:"invented",anchorY:100,height:48}
]}),[],"Invented cue received a visual rail position");
assert.deepEqual(packSourceCueRail({height:500,items:[
  {id:1,side:"right",cueId:C1,anchorY:-20,height:48}
]}),[],"Offscreen source cue retained a floating icon");

const single=packSourceCueRail({height:500,items:[
  {id:1,side:"right",cueId:C1,anchorY:150,height:48}
]});
assert.equal(single.length,1);
assert.equal(single[0].top,126,"A solitary icon must centre on its exact paragraph's reading baseline");
assert.equal(single[0].cueId,C1);

const simultaneous=packSourceCueRail({height:500,items:[
  {id:1,side:"right",cueId:C1,anchorY:160,height:48},
  {id:2,side:"right",cueId:C1,anchorY:160,height:48},
  {id:3,side:"left",cueId:C1,anchorY:160,height:48},
]});
assert.equal(simultaneous.length,3);
const right=simultaneous.filter(x=>x.side==="right");
assert.equal(right.length,2);
assert.ok(right[0].top+48<=right[1].top,
  "Two icons for one source line must not occupy the same painted pixels");
assert.equal((right[0].top+24+right[1].top+24)/2,160,
  "Multi-action icon group no longer centres on its shared published cue");
assert.equal(simultaneous.find(x=>x.side==="left").top,136,
  "Independent faithful cue rail drifted from its own source line");

const crowded=packSourceCueRail({height:250,items:[
  {id:1,side:"right",cueId:C1,anchorY:90,height:48},
  {id:2,side:"right",cueId:C2,anchorY:92,height:48},
]});
assert.equal(crowded.length,2);
assert.ok(crowded[0].top+48<=crowded[1].top);
assert.ok(crowded.every(x=>Math.abs(x.top+24-x.anchorY)<=65),
  "Collision resolution placed an icon too far from its own source cue");

console.log("Mass exact-source rail pack: PASS — no inferred anchors, no stacked overlap.");
