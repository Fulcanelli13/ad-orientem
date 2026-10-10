import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {captureModuleOrigin,returnToObservedOrigin} from "../src/app/module-return.js";
const calls=[];
let surface="home",parentStatus={open:false,child:null,externalReturn:null};
const win={
 AO_APP_SHELL_V1:{getActive:()=>surface,navigate:async(target)=>{calls.push("navigate:"+target);return {ok:true,surface:target}}},
 AO_LEARN_APP_V1:{status:()=>parentStatus,open:()=>{calls.push("restore:learn");return true}},
 AO_PRAY_APP_V1:{status:()=>parentStatus,open:()=>{calls.push("restore:pray");return true}},
};
const flush=async()=>{for(let i=0;i<4;i++)await Promise.resolve()};
function exit(receipt){
 returnToObservedOrigin(win,receipt,{
  close:()=>calls.push("close"),
  restoreParent:()=>{calls.push("restore:"+receipt.domain);return true}
 });
}
const homeEntry=captureModuleOrigin(win,"learn");
assert.deepEqual(homeEntry,{surface:"home",parentVisited:false,domain:"learn"});
exit(homeEntry);await flush();
assert.deepEqual(calls.splice(0),["close","navigate:home"],"direct Home deep link created an unvisited Formation parent");
surface="learn";parentStatus={open:false,child:null};
const unvisited=captureModuleOrigin(win,"learn");
assert.equal(unvisited.surface,"home","active Learn shell without an opened parent is not evidence of a visited parent");
exit(unvisited);await flush();
assert.deepEqual(calls.splice(0),["close","navigate:home"]);
parentStatus={open:false,child:"learn.sexual_ethics"};
const formed=captureModuleOrigin(win,"learn");
assert.equal(formed.parentVisited,true,"suspended Formation family should count as a genuinely visited parent");
exit(formed);await flush();
assert.deepEqual(calls.splice(0),["close","restore:learn"],"return should restore suspended family without resetting its state");
parentStatus={open:false,child:"learn.rites.sick",externalReturn:{surface:"pray",route:"pray.dying_companion"}};
const bedside=captureModuleOrigin(win,"learn");
exit(bedside);await flush();
assert.deepEqual(calls.splice(0),["close"],
  "explicit Prayer-to-Formation-to-Prayer return must remain owned by the parent monitor");
parentStatus={open:false,child:"learn.sexual_ethics",externalReturn:null};
surface="pray";parentStatus={open:true};
exit(captureModuleOrigin(win,"pray"));await flush();
assert.deepEqual(calls.splice(0),["close","restore:pray"]);
surface="calendar";parentStatus={open:false};
exit(captureModuleOrigin(win,"pray"));await flush();
assert.deepEqual(calls.splice(0),["close","navigate:calendar"]);
surface="home";
const source=new Map([
 ["novena",readFileSync("src/pray/novena-runtime.js","utf8")],
 ["traditional-pray",readFileSync("src/pray/traditional-pray-runtime.js","utf8")],
 ["core-pray",readFileSync("src/pray/presentation-runtime.js","utf8")],
 ["sexual-ethics",readFileSync("src/learn/sexual-ethics.js","utf8")],
 ["spiritual-life",readFileSync("src/learn/spiritual-life.js","utf8")],
 ["traditional-formation",readFileSync("src/learn/traditional-life.js","utf8")],
 ["latin",readFileSync("src/learn/latin-course-v2.js","utf8")],
 ["mass-formation",readFileSync("src/learn/mass-formation.js","utf8")]
]);
for(const [name,content] of source){
 assert.match(content,/captureModuleOrigin/,"module origin not recorded: "+name);
 assert.match(content,/returnToObservedOrigin/,"module Back can invent parent: "+name);
}
assert.match(source.get("sexual-ethics"),/visitedFrames\.pop\(\)/,"internal dossier Back not tied to actual visit history");
assert.match(source.get("novena"),/detailFromOverview/,"direct Novena detail Back cannot invent overview");
assert.match(source.get("traditional-pray"),/guidedFromList/,"guided Prayer cannot jump to a list never opened");
console.log("PASS module Back: observed surfaces and genuinely visited internal screens, no synthetic parent routes");
