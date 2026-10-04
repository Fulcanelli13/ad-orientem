import assert from "node:assert/strict";
import { createPrayOwner } from "../src/pray/browser-entry.js";

const calls=[];
const root={dataset:{},classList:{contains:name=>name==="open"}};
const documentElement={dataset:{}};
const win={
  document:{documentElement,getElementById:id=>id==="aoPray435930"?root:null},
  AO_PRAY_V435930:{
    open(id,options){calls.push(["open",id,options]);},
    close(){calls.push(["close"]);},
    state(){return {rosary:{recitation:"individual"}};},
  },
  AO_APP_SHELL_V1:{syncSurface(surface){calls.push(["surface",surface]);}},
};
const pray=createPrayOwner(win);
assert.equal(pray.open(),true);
assert.deepEqual(calls[0],["open","pray.hub",{returnContext:null}]);
assert.equal(root.dataset.aoPrayOwner,"modular-pray-v1");
assert.equal(documentElement.dataset.aoPrayRouteOwner,"modular-pray-v1");
assert.deepEqual(calls[1],["surface","pray"]);
assert.equal(pray.status().visibleOwner,"modular-pray-v1");
assert.equal(pray.status().routeOwner,"modular-pray-v1");
assert.equal(pray.status().presentationOwner,"AO_PRAY_V435930");
assert.equal(pray.status().donorAvailable,true);
assert.equal(pray.close(),true);
assert.deepEqual(calls[2],["close"]);

let delayedRoot=null;
const delayedWin={
  document:{getElementById:id=>id==="aoPray435930"?delayedRoot:null},
  queueMicrotask(fn){queueMicrotask(fn);},
  setTimeout(fn){setTimeout(fn,0);},
  AO_PRAY_V435930:{
    open(){
      queueMicrotask(()=>{
        delayedRoot={dataset:{},classList:{contains:name=>name==="open"}};
      });
      return true;
    },
    state(){return {};},
  },
};
const delayed=createPrayOwner(delayedWin);
assert.equal(delayed.open(),true);
await new Promise(resolve=>setTimeout(resolve,5));
assert.equal(delayedRoot?.dataset?.aoPrayOwner,"modular-pray-v1");
assert.equal(delayed.status().visibleOwner,"modular-pray-v1");

const absent=createPrayOwner({document:{getElementById:()=>null}});
assert.equal(absent.open(),false);

console.log("PASS modular PRAY navigation owner");
