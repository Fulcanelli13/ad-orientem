import assert from "node:assert/strict";
import { installLiveSessionGuards } from "../src/app/live-session-guards.js";

let route="home";
let clickHandler=null;
let alertText=null;
const hapticCalls=[];
const storage=new Map();
const classes=new Set();
const ribbon={
  hidden:false,
  attrs:new Map(),
  setAttribute(name,value){this.attrs.set(name,String(value));},
};
const doc={
  documentElement:{classList:{toggle(name,on){on?classes.add(name):classes.delete(name);}}},
  body:{classList:{toggle(name,on){on?classes.add("body:"+name):classes.delete("body:"+name);}}},
  getElementById(id){return id==="ao-global-ribbon"?ribbon:null;},
  addEventListener(type,fn,capture){if(type==="click"&&capture===true)clickHandler=fn;},
  removeEventListener(type,fn,capture){if(type==="click"&&capture===true&&clickHandler===fn)clickHandler=null;},
};
const win={
  document:doc,
  AO_RUNTIME_V8:{store:{
    getState:()=>({route,language:"en"}),
    subscribe:()=>()=>{},
  }},
  AO_HAPTICS_V4319:{setEnabled(value){hapticCalls.push(["enabled",value]);}},
  localStorage:{setItem(k,v){storage.set(k,String(v));}},
  navigator:{vibrate(v){hapticCalls.push(["vibrate",v]);}},
  alert(value){alertText=String(value);},
};

const guard=installLiveSessionGuards({win});
assert.equal(guard.installed,true);
assert.equal(ribbon.hidden,false);
assert.equal(guard.status().live,false);

route="live";
guard.sync();
assert.equal(ribbon.hidden,true);
assert.equal(ribbon.attrs.get("aria-hidden"),"true");
assert.equal(classes.has("aoAppLive"),true);
assert.equal(classes.has("body:aoAppLive"),true);
assert.equal(storage.get("ao-haptics-enabled"),"0");
assert.deepEqual(hapticCalls,[["enabled",false],["vibrate",0]]);
assert.equal(guard.status().live,true);

let prevented=false;
let stopped=false;
clickHandler?.({
  target:{closest(selector){return selector.includes("[data-live-form]")?{}:null;}},
  preventDefault(){prevented=true;},
  stopImmediatePropagation(){stopped=true;},
});
assert.equal(prevented,true);
assert.equal(stopped,true);
assert.match(alertText,/locked while Mass is in progress/);

route="home";
win.AO_R17_NATIVE_READER_PREVIEW={root:{isConnected:true}};
guard.sync();
assert.equal(ribbon.hidden,true,"native mounted reader must own LIVE even after historical route reset");

win.AO_R17_NATIVE_READER_PREVIEW.root.isConnected=false;
guard.sync();
assert.equal(ribbon.hidden,false);
assert.equal(ribbon.attrs.get("aria-hidden"),"false");
assert.equal(classes.has("aoAppLive"),false);

guard.dispose();
assert.equal(clickHandler,null);
console.log("PASS modular live-session guards");
