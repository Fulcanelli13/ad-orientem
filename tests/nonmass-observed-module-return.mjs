import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {captureObservedModuleOrigin,returnToObservedModuleOrigin}
 from "../src/app/observed-module-return.js";

let surface="home",opened=false,child=null;
const events=[];
const win={
 console:{error:error=>events.push("error:"+String(error))},
 AO_APP_SHELL_V1:{
  getActive:()=>surface,
  navigate:async target=>{events.push("navigate:"+target);return {ok:true,surface:target}}
 },
 AO_PRAY_APP_V1:{status:()=>({open:opened,child,donorState:{open:opened}})},
 AO_LEARN_APP_V1:{status:()=>({open:opened,child})},
};
async function flush(){for(let i=0;i<5;i++)await Promise.resolve()}
function exit(receipt){
 returnToObservedModuleOrigin(win,receipt,{
  close:()=>events.push("close"),
  restoreParent:()=>events.push("restore:pray")
 });
}
const home=captureObservedModuleOrigin(win,"pray");
assert.deepEqual(home,{surface:"home",domain:"pray",parentVisited:false});
exit(home);await flush();
assert.deepEqual(events.splice(0),["close","navigate:home"],
 "Direct Home Prayer deep-link invented a Prayer hub");
surface="calendar";
exit(captureObservedModuleOrigin(win,"pray"));await flush();
assert.deepEqual(events.splice(0),["close","navigate:calendar"],
 "Calendar Novena deep-link did not return to actual Calendar");
surface="find";
exit(captureObservedModuleOrigin(win,"pray"));await flush();
assert.deepEqual(events.splice(0),["close","navigate:find"],
 "Explore Prayer deep-link did not return to actual Explore");
surface="pray";opened=false;
const stale=captureObservedModuleOrigin(win,"pray");
assert.equal(stale.surface,"home","Closed Prayer owner does not justify a synthetic parent");
exit(stale);await flush();assert.deepEqual(events.splice(0),["close","navigate:home"]);
opened=true;
const fromPray=captureObservedModuleOrigin(win,"pray");
assert.equal(fromPray.parentVisited,true);
exit(fromPray);await flush();assert.deepEqual(events.splice(0),["restore:pray"],
 "A truly visited Prayer parent should be restored without a hard-home reset");
surface="learn";opened=true;child="learn.rites.sick";
const fromLearn=captureObservedModuleOrigin(win,"learn");
assert.equal(fromLearn.parentVisited,true,"Suspended Formation parent counts as visited");
assert.equal(fromLearn.surface,"learn");
surface="invalid";
assert.equal(captureObservedModuleOrigin(win,"pray").surface,"home",
 "Unrecognised route must fail closed to Home");
assert.equal(captureObservedModuleOrigin(win,"pray").parentVisited,false);
assert.equal(Object.isFrozen(fromPray),true);
const novena=readFileSync("src/pray/novena-runtime.js","utf8");
const traditional=readFileSync("src/pray/traditional-pray-runtime.js","utf8");
for(const [name,body] of [["novenas",novena],["traditional",traditional]]){
 assert.match(body,/captureObservedModuleOrigin\(window,"pray"\)/,name+" origin not captured");
 assert.match(body,/returnToObservedModuleOrigin\(window,OPEN_RECEIPT/,name+" Back not source-driven");
}
assert.match(novena,/detailFromOverview=N.screen==='overview'/,
 "Direct novena detail incorrectly generates unvisited overview on Back");
assert.match(novena,/if\(N.screen==='detail'&&detailFromOverview\)/,
 "Deep-linked Novena detail must not return to an invented overview");
assert.match(traditional,/S\.guidedFromList/,
 "Direct guided Morning Prayer must not return to unvisited Prayer list");
assert.match(traditional,/if\(next==="guided"&&S\.dailyMode==="list"\)S\.guidedFromList=true/,
 "Only explicitly visited list can become a Back target");
assert.match(traditional,/if\(S\.route==="pray\.nightly_examen"&&S\.returnToDaily\)/,
 "Nightly examen must still resume the visited Evening Prayer");
console.log("PASS observed-origin non-Mass Back: Home, Calendar, Explore, actual Prayer parent, Novena and traditional guided guards");
