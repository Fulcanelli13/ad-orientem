import assert from "node:assert/strict";
import { createPrayOwner } from "../src/pray/browser-entry.js";

const calls=[];
const root={dataset:{},classList:{contains:name=>name==="open"}};
const documentElement={dataset:{}};
const win={
  document:{documentElement,getElementById:id=>id==="aoPrayerBookRoot"?root:null},
  setTimeout(fn){fn();},
  AOTraditionalPrayerBook:{
    open(options){calls.push(["open",options]);},
    close(options){calls.push(["close",options]);},
    getState(){return {view:"hub"};},
  },
  AO_APP_SHELL_V1:{syncSurface(surface){calls.push(["surface",surface]);}},
};

const pray=createPrayOwner(win);
assert.equal(pray.status().routeOwner,null,"status() must not fabricate route ownership");
assert.equal(await pray.open(),true);
assert.deepEqual(calls[0],["open",{returnContext:null}]);
assert.equal(documentElement.dataset.aoPrayRouteOwner,"modular-pray-v1");
assert.equal(root.dataset.aoPrayRouteOwner,"modular-pray-v1");
assert.deepEqual(calls[1],["surface","pray"]);
assert.equal(pray.status().routeOwner,"modular-pray-v1");
assert.equal(pray.status().rootOwner,"modular-pray-v1");
assert.equal(pray.status().presentationOwner,"AOTraditionalPrayerBook");
assert.equal(pray.status().presentationRoot,"aoPrayerBookRoot");
assert.equal(pray.status().donorAvailable,true);
assert.deepEqual(pray.status().donorState,{view:"hub"});
assert.equal(pray.close(),true);
assert.deepEqual(calls[2],["close",{silent:true}]);

let polls=0;
const delayed={
  document:{documentElement:{dataset:{}},getElementById:()=>root},
  setTimeout(fn){
    polls+=1;
    if(polls===2)delayed.AOTraditionalPrayerBook=win.AOTraditionalPrayerBook;
    fn();
  },
  AO_APP_SHELL_V1:win.AO_APP_SHELL_V1,
};
const delayedOwner=createPrayOwner(delayed,{pollMs:1,maxPolls:3});
assert.equal(await delayedOwner.open(),true,"modular PRAY owner did not wait for production Prayer Book owner");
assert.ok(polls>=2);

const absent=createPrayOwner({
  document:{documentElement:{dataset:{}},getElementById:()=>null},
  setTimeout(fn){fn();}
},{pollMs:1,maxPolls:1});
assert.equal(await absent.open(),false);

console.log("PASS modular PRAY navigation owner");
