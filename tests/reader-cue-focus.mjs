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

console.log("reader cue focus: PASS — top/bottom ownership, zero-lag geometry and 39% focus zone.");
