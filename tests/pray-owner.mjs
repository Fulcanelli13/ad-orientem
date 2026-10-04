import assert from "node:assert/strict";
import { createPrayOwner } from "../src/pray/browser-entry.js";

const calls=[];
const root={dataset:{},classList:{contains:name=>name==="open"}};
const documentElement={dataset:{}};
const win={
  document:{documentElement,getElementById:id=>id==="aoPray435930"?root:null},
  setTimeout(fn){fn();},
  queueMicrotask(fn){fn();},
  AO_PRAY_V435930:{
    open(id,options){calls.push(["open",id,options]);return true;},
    close(){calls.push(["close"]);},
    state(){return {rosary:{recitation:"individual"}};},
  },
  AO_APP_SHELL_V1:{syncSurface(surface){calls.push(["surface",surface]);}},
};
const pray=createPrayOwner(win);
assert.equal(await pray.open(),true);
assert.deepEqual(calls[0],["open","pray.hub",{returnContext:null}]);
assert.equal(documentElement.dataset.aoPrayRouteOwner,"modular-pray-v1");
assert.equal(root.dataset.aoPrayOwner,"modular-pray-v1");
assert.deepEqual(calls[1],["surface","pray"]);
assert.equal(pray.status().routeOwner,"modular-pray-v1");
assert.equal(pray.status().visibleOwner,"modular-pray-v1");
assert.equal(pray.status().presentationOwner,"AO_PRAY_V435930");
assert.equal(pray.status().donorAvailable,true);
assert.equal(pray.close(),true);

let polls=0;
const delayedRoot={dataset:{},classList:{contains:name=>name==="open"}};
const delayed={
  document:{documentElement:{dataset:{}},getElementById:()=>delayedRoot},
  setTimeout(fn){
    polls+=1;
    if(polls===2)delayed.AO_PRAY_V435930=win.AO_PRAY_V435930;
    fn();
  },
  queueMicrotask(fn){fn();},
  AO_APP_SHELL_V1:win.AO_APP_SHELL_V1,
};
const delayedOwner=createPrayOwner(delayed,{pollMs:1,maxPolls:3});
assert.equal(await delayedOwner.open(),true,"modular PRAY owner did not wait for donor installation");
assert.ok(polls>=2);
assert.equal(delayed.document.documentElement.dataset.aoPrayRouteOwner,"modular-pray-v1");

const absent=createPrayOwner({
  document:{documentElement:{dataset:{}},getElementById:()=>null},
  setTimeout(fn){fn();}
},{pollMs:1,maxPolls:1});
assert.equal(await absent.open(),false);

console.log("PASS modular PRAY navigation owner");
