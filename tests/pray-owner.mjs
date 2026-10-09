import assert from "node:assert/strict";
import { createPrayOwner } from "../src/pray/browser-entry.js";

const calls=[];
const root={dataset:{},classList:{contains:name=>name==="open"}};
const documentElement={dataset:{}};
const win={
  document:{documentElement,getElementById:id=>id==="aoPray435930"?root:null},
  setTimeout(fn){fn();},
  AO_PRAY_V435930:{
    open(id,options){calls.push(["open",id,options]);return true;},
    close(){calls.push(["close"]);},
    state(){return {view:"hub",rosary:{recitation:"individual"}};},
  },
  AO_APP_SHELL_V1:{syncSurface(surface){calls.push(["surface",surface]);}},
};

const pray=createPrayOwner(win);
assert.equal(pray.status().routeOwner,null,"status() must not fabricate route ownership");
assert.equal(await pray.open(),true);
assert.deepEqual(calls[0],["open","pray.hub",{returnContext:null}]);
assert.equal(documentElement.dataset.aoPrayRouteOwner,"modular-pray-v1");
assert.equal(root.dataset.aoPrayOwner,"modular-pray-v1");
assert.deepEqual(calls[1],["surface","pray"]);
assert.equal(pray.status().routeOwner,"modular-pray-v1");
assert.equal(pray.status().visibleOwner,"modular-pray-v1");
assert.equal(pray.status().presentationOwner,"AO_PRAY_V435930");
assert.equal(pray.status().presentationRoot,"aoPray435930");
assert.equal(pray.status().donorAvailable,true);
assert.equal(pray.close(),true);
assert.deepEqual(calls[2],["close"]);

let polls=0;
const delayed={
  document:{documentElement:{dataset:{}},getElementById:()=>root},
  setTimeout(fn){
    polls+=1;
    if(polls===2)delayed.AO_PRAY_V435930=win.AO_PRAY_V435930;
    fn();
  },
  AO_APP_SHELL_V1:win.AO_APP_SHELL_V1,
};
const delayedOwner=createPrayOwner(delayed,{pollMs:1,maxPolls:3});
assert.equal(await delayedOwner.open(),true,"modular PRAY owner did not wait for final presentation installation");
assert.ok(polls>=2);

const absent=createPrayOwner({
  document:{documentElement:{dataset:{}},getElementById:()=>null},
  setTimeout(fn){fn();}
},{pollMs:1,maxPolls:1});
assert.equal(await absent.open(),false);

console.log("PASS modular PRAY navigation owner");

import {readFileSync} from "node:fs";
const runtimeSource=readFileSync("src/pray/presentation-runtime.js","utf8");
assert.ok(runtimeSource.includes("function openExternalFamilyRoute(button,route,returnFamily)"),"PRAY external family launch lacks canonical failure-aware handler");
assert.ok(runtimeSource.includes("result===true||result?.ok===true"),"PRAY external family launch accepts implicit or failed results");
assert.match(runtimeSource,/data-p435930-family-open-error/,"PRAY external family failure lacks a visible alert");
assert.match(runtimeSource,/p435930RetryExternal/,"PRAY external module failure lacks an exact-route Retry action");
assert.match(runtimeSource,/min-height:44px/,"PRAY retry target is too small");
