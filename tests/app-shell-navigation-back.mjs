import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createAppShellController} from "../src/app/shell-controller.js";
const calls=[];
let failDomain=null;
const host={
 currentCoreRoute:()=> "home",
 liveMassActive:()=>false,
 hasResumableMass:()=>false,
 subscribeCoreRoute:()=>()=>{},
 hardHome:()=>{calls.push("home-reset");return true},
 openDomain:domain=>{calls.push("open:"+domain);return domain!==failDomain},
 openCalendar:()=>{calls.push("open:calendar");return "calendar"!==failDomain},
 openSettings:()=>true,
 dismissSettings:()=>{},
 defer:fn=>fn(),
 restoreSettingsHome:()=>{},
};
const c=createAppShellController({host});
assert.equal((await c.go("find")).ok,true);
assert.equal((await c.go("calendar")).ok,true);
assert.deepEqual(c.getReturnTrail(),["home","find"]);
assert.equal((await c.back()).surface,"find");
assert.deepEqual(c.getReturnTrail(),["home"],"Back must not push the screen just departed");
assert.equal((await c.back()).surface,"home");
assert.deepEqual(c.getReturnTrail(),[]);
assert.equal((await c.go("pray")).surface,"pray");
assert.equal((await c.go("learn")).surface,"learn");
assert.equal((await c.back()).surface,"pray");
assert.equal((await c.back()).surface,"home");
assert.equal((await c.back()).surface,"home","Empty history must gracefully fall back to Today");
// A refused destination cannot become a phantom history entry.
failDomain="find";
assert.equal((await c.go("find")).ok,false);
assert.equal(c.getActive(),"home");
assert.deepEqual(c.getReturnTrail(),[]);
failDomain=null;
const owners=[
 ["src/find/browser-entry.js",/AO_APP_SHELL_V1\?\.back\?\.\(\)/],
 ["src/calendar/calendar-runtime.js",/AO_APP_SHELL_V1\?\.back\?\.\(\)/],
 ["src/pray/presentation-runtime.js",/AO_APP_SHELL_V1\.back\(\)/],
 ["src/learn/browser-entry.js",/AO_APP_SHELL_V1\.back\(\)/],
];
for(const [path,pattern] of owners){
 const source=readFileSync(new URL("../"+path,import.meta.url),"utf8");
 assert.match(source,pattern,path+" does not use the shared Back command");
}
const mass=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
assert.doesNotMatch(mass,/AO_APP_SHELL_V1\.back\(/,"LIVE Mass back ownership must remain separate");
c.dispose();
console.log("PASS cross-domain Back trail, error fallback, per-module root integration and untouched LIVE Mass.");
