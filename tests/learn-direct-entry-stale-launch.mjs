import assert from "node:assert/strict";
import {createLearnOwner} from "../src/learn/browser-entry.js";

function deferred(){
 let resolve;
 const promise=new Promise(done=>{resolve=done;});
 return {promise,resolve};
}
function fixture(){
 const ids=new Map(),events=[],tasks=[];
 const bodyClasses=new Set();
 const body={classList:{add:x=>bodyClasses.add(x),remove:x=>bodyClasses.delete(x)},
  append(node){ids.set(node.id,node);node.isConnected=true;},
 };
 const doc={
  body,documentElement:{dataset:{}},activeElement:null,
  getElementById:id=>ids.get(id)??null,
  createElement(){
   const el={id:"",dataset:{},hidden:false,inert:false,innerHTML:"",isConnected:false,
    listeners:{},setAttribute(k,v){this[k]=v},removeAttribute(k){delete this[k]},
    getAttribute(k){return this[k]??null},addEventListener(k,cb){this.listeners[k]=cb},
    contains(){return false},querySelector(){return null},remove(){ids.delete(this.id);this.isConnected=false}};
   return el;
  }
 };
 const store={getState:()=>({route:"home",language:"en"}),subscribe:()=>()=>{}};
 const queue=[];
 const modules={open(id){events.push("launch:"+id);const d=deferred();queue.push({id,...d});return d.promise}};
 const win={document:doc,AO_RUNTIME_V8:{store},AO_MODULES:modules,
  AO_NAV_V362:{clearExternalReturn(){}},
  AO_V37_SHELL:{close(){}},
  AO_DAILY_CATECHISM:{close(){events.push("close:daily")}},
  AO_TRADITIONAL_CATECHISM:{close(){events.push("close:catechism")}},
  AO_CATECHISM_GUIDED_MODE_V1:{dispose(){}},
  AO_APP_SHELL_V1:{syncSurface(){}},
  console:{error(){},warn(){}},
  queueMicrotask(fn){tasks.push(fn)}
 };
 return {win,ids,events,queue,tasks,owner:createLearnOwner(win,{maxOpenPolls:30})};
}
async function settle(){await Promise.resolve();await Promise.resolve();}
const f=fixture();
assert.equal(f.owner.open(),true);
let pending=f.owner.openModule("learn.catechism.daily");
f.owner.close();
assert.equal(await pending,false,"A closed parent must not launch a child after an asynchronous import boundary");
assert.equal(f.queue.length,0,"Module registry called after owner was closed");
assert.equal(f.owner.status().open,false);

assert.equal(f.owner.open(),true);
pending=f.owner.openModule("learn.catechism.daily");
await settle();
assert.equal(f.queue.length,1);
f.owner.close();
f.queue.shift().resolve({ok:true});
assert.equal(await pending,false,"Late registry success resurrected a child after the Learn owner closed");
assert.equal(f.owner.status().open,false);
assert.ok(f.events.includes("close:daily"),"Late mounted child was not cleaned up");
assert.equal(f.ids.has("ao-learn-modular-root"),false);

assert.equal(f.owner.open(),true);
const first=f.owner.openModule("learn.catechism.daily");
await settle();
const second=f.owner.openModule("learn.catechism");
await settle();
assert.deepEqual(f.queue.map(x=>x.id),["learn.catechism.daily","learn.catechism"]);
f.queue[0].resolve({ok:true});
assert.equal(await first,false,"Superseded Learn launch was accepted");
assert.ok(f.events.filter(x=>x==="close:daily").length>=2,"Superseded Learn child not closed");
f.queue[1].resolve({ok:true});
assert.equal(await second,true,"Newer Learn launch was lost");
assert.equal(f.owner.status().child,"learn.catechism");
f.owner.close();

assert.equal(f.owner.open(),true);
const rejected=f.owner.openModule("learn.catechism.daily");
await settle();f.queue[2].resolve({ok:false,error:"MISSING_RUNTIME"});
assert.equal(await rejected,false);
assert.equal(f.owner.status().child,null);
assert.equal(f.owner.status().open,true,"Failed Learn module left user on blank child screen");
assert.equal(f.owner.status().family,null);
const root=f.ids.get("ao-learn-modular-root");
assert.match(root.innerHTML,/This module could not be opened/,"Learn failure is not visible in hub");
f.owner.dispose();
console.log("PASS Learn direct-entry concurrency: closed parent, late success, superseded child and visible failed launch");
