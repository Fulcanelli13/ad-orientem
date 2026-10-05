import assert from "node:assert/strict";
import { pickActiveCue } from "../src/mass/reader-cue-focus.js";

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

console.log("reader cue focus: PASS — top/bottom ownership, zero-lag geometry and 39% focus zone.");
