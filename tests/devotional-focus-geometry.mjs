import assert from "node:assert/strict";
import {devotionalFocusIndex} from "../src/pray/devotional-focus-geometry.js";
const positions=[[30,90],[110,143],[160,200],[230,290]];
let top=0;
const body={
  clientHeight:400,scrollHeight:900,
  get scrollTop(){return top},set scrollTop(v){top=v},
  getBoundingClientRect:()=>({top:0,bottom:400})
};
const paragraphs=positions.map(([a,b])=>({getBoundingClientRect:()=>({top:a-top,bottom:b-top})}));
for(const [at,expected] of [[0,0],[20,0],[33,1],[61,2],[100,3],[500,3]]){
 body.scrollTop=at;
 assert.equal(devotionalFocusIndex(body,paragraphs,{ratio:.40}),expected,
   "Lost paragraph reading territory at scrollTop "+at);
}
assert.equal(devotionalFocusIndex(body,[],{}),-1);
console.log("PASS devotional reading focus: each early versicle has reachable active territory");
