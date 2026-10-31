import assert from "node:assert/strict";
import {createAppNativeBackBridge} from "../src/app/native-back.js";
const listeners=new Map(),entries=[{app:"existing"}];let pos=0;
const history={
 get state(){return entries[pos]},
 pushState(state){entries.splice(++pos);entries[pos]=state;},
 replaceState(state){entries[pos]=state;},
 back(){pos=Math.max(0,pos-1);listeners.get("popstate")?.({state:this.state})}
};
let active="home",allowLeave=false,attempts=0;
const subscriptions=[];
const shell={getActive:()=>active,subscribe(fn){subscriptions.push(fn);return()=>subscriptions.splice(subscriptions.indexOf(fn),1)}};
const win={history,location:{href:"https://example.test/app"},addEventListener(n,fn){listeners.set(n,fn)},
 removeEventListener(n){listeners.delete(n)},
 AO_APP_SHELL_V1:{async navigate(target){
   if(active==="mass"&&target!=="mass"&&!allowLeave){
     attempts++;return{ok:false,surface:"mass",reason:"LIVE_MASS_LEAVE_CANCELLED"};
   }
   active=target;subscriptions.forEach(fn=>fn(target));return{ok:true,surface:target};
 }},
 AO_SETTINGS_APP_V1:{status:()=>({open:false})},console:{error(){}}
};
const bridge=createAppNativeBackBridge({win,shell});
assert.equal(bridge.installed,true);
assert.equal(history.state?.__aoNavigationV1,undefined,"Do not push a guard at initial Home");
active="mass";bridge.record("mass");
assert.equal(entries.length,2);
history.back();
await new Promise(ok=>setImmediate(ok));
assert.equal(active,"mass","Refused LIVE leave must not change reader");
assert.equal(attempts,1);
assert.equal(history.state.__aoNavigationV1.surface,"mass","Cancelled Back re-arms Mass entry");
allowLeave=true;
history.back();
await new Promise(ok=>setImmediate(ok));
assert.equal(active,"home","Confirmed leave returns to the previous Home entry");
const stable=entries.length;
bridge.dispose();
assert.equal(listeners.has("popstate"),false);
assert.ok(stable>=2);
console.log("PASS native Back: initial Home not trapped, LIVE cancellation re-armed, confirmed leave restores Home, listener disposed");
