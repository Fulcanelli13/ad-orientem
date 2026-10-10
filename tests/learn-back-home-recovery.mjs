import assert from "node:assert/strict";
import {createLearnOwner} from "../src/learn/browser-entry.js";

const elements=new Map(),events=[],focus=[];
function el(){
 return {id:"",dataset:{},hidden:false,innerHTML:"",style:{},
  listeners:{},setAttribute(key,value){this[key]=value},removeAttribute(key){delete this[key]},
  addEventListener(event,callback){this.listeners[event]=callback;},querySelector(){return {focus(){focus.push("focus")}}},
  contains(){return false},remove(){elements.delete(this.id)},focus(){}};
}
const body={classList:{add(){},remove(){}},append(node){elements.set(node.id,node)}};
const doc={body,documentElement:{dataset:{}},getElementById:id=>elements.get(id)??null,createElement:el};
const store={getState:()=>({language:"en",route:"home"}),subscribe:()=>()=>{}};
let owner;
const win={
 document:doc,AO_RUNTIME_V8:{store},AO_MODULES:{open:async()=>({ok:true})},
 AO_V37_SHELL:{close(){}},AO_APP_SHELL_V1:{
   async navigate(target){events.push("navigate:"+target);owner.close();return {ok:false,reason:"FAILED"};},
   syncSurface(target){events.push("sync:"+target)}
 },
 AO_NAV_V362:{},console:{error(){}},queueMicrotask:fn=>fn()
};
owner=createLearnOwner(win);
const flush=async()=>{for(let i=0;i<8;i++)await new Promise(resolve=>setImmediate(resolve));};
async function press(selector,property){
 const node=elements.get("ao-learn-modular-root");
 node.listeners.click({preventDefault(){},target:{closest(sel){return sel===selector?{dataset:property||{}}:null}}});
 await flush();
}
assert.equal(owner.open(),true);
await press('button[data-ao-learn-family]',{aoLearnFamily:"spiritual-moral"});
assert.equal(owner.status().family,"spiritual-moral");
await press('[data-ao-learn-home]');
assert.equal(owner.status().open,true,"Failed Home leave orphaned the Formation destination");
assert.equal(owner.status().family,"spiritual-moral","Failed Home lost the selected Formation family");
assert.match(elements.get("ao-learn-modular-root").innerHTML,/This section could not be opened/);
assert.ok(events.includes("sync:learn"));
await press('[data-ao-learn-apostolate]');
assert.equal(owner.status().family,"spiritual-moral");
assert.match(elements.get("ao-learn-modular-root").innerHTML,/Please retry/);
assert.equal(owner.status().open,true);
owner.dispose();
console.log("PASS Formation Home/Apostolate recovery: failed routed leave reopens canonical Learn with retained family and visible error");
