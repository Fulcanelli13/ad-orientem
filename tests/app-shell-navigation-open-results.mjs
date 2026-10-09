import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createAppHostAdapter} from "../src/app/host-adapter.js";
import {createAppShellController} from "../src/app/shell-controller.js";

// A false result from the *requested* owner may not mark another screen active.
// Covers synchronous, asynchronous, missing and structured-failure responses.
const failures=[false,null,undefined,{ok:false},{error:"LOAD_FAILED"}];
const positives=[true,{ok:true}];
const shellApi=()=>({getState:()=>({route:"home",language:"en"}),subscribe:()=>()=>{}});
function windowFor(returned){
 return {
  AO_RUNTIME_V8:{store:shellApi()},
  AO_HOME_APP_V1:{open:()=>true},
  AO_NAV_V362:{home:()=>true},
  AO_R17_BROWSER_ENTRY:{hasResumable:()=>false},
  AO_CELEBRATION_API:{openPreflight:()=>returned},
  AO_PRAY_APP_V1:{open:()=>returned},
  AO_LEARN_APP_V1:{open:()=>returned},
  AO_CALENDAR_APP_V1:{open:()=>returned},
  AO_SETTINGS_APP_V1:{open:()=>returned},
  AO_V37_SHELL:{openModule:()=>returned}
 };
}
for(const returned of failures){
 const host=createAppHostAdapter(windowFor(returned));
 for(const domain of ["mass","pray","learn"]){
  assert.equal(await host.openDomain(domain),false,domain+" false-positive open for "+String(returned));
 }
 assert.equal(await host.openCalendar(),false,"Calendar accepted unsuccessful open");
 assert.equal(await host.openSettings(),false,"Settings accepted unsuccessful open");
 assert.equal(await host.openModule("learn.catechism"),false,"Module accepted unsuccessful open");
 const c=createAppShellController({host});
 const gone=await c.go("learn");
 assert.equal(gone.ok,false,"App navigation reported failed Learn open as success");
 assert.equal(c.getActive(),"home","Failed module displaced the current Home destination");
 c.dispose();
}
for(const returned of positives){
 const host=createAppHostAdapter(windowFor(returned));
 for(const domain of ["mass","pray","learn"]){
  assert.equal(await host.openDomain(domain),true,domain+" rejected explicit success");
 }
 assert.equal(await host.openCalendar(),true);
 assert.equal(await host.openSettings(),true);
 assert.equal(await host.openModule("learn.catechism"),true);
 const c=createAppShellController({host});
 assert.equal((await c.go("learn")).ok,true);
 assert.equal(c.getActive(),"learn");
 c.dispose();
}
for(const returned of [...failures,...positives]){
 const host=createAppHostAdapter({...windowFor(returned),AO_R17_BROWSER_ENTRY:{hasResumable:()=>true,resume:()=>returned}});
 assert.equal(await host.openDomain("mass"),positives.includes(returned),"Resumable Mass returned incorrect success");
}
// The two outer owners must not convert their own unsuccessful reader results
// back to true after host-adapter validation.
const pray=readFileSync(new URL("../src/pray/browser-entry.js",import.meta.url),"utf8");
const calendar=readFileSync(new URL("../src/calendar/browser-entry.js",import.meta.url),"utf8");
assert.match(pray,/opened!==true&&opened\?\.ok!==true/);
assert.match(calendar,/opened===true\|\|opened\?\.ok===true/);
console.log("PASS explicit opened-screen contract for Mass, Pray, Learn, Calendar, Settings and deep modules");
