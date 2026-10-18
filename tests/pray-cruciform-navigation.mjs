import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {crossDirection,moveCruciform,CRUCIFORM_NAVIGATION_VERSION} from "../src/pray/cruciform-navigation.js";

assert.equal(CRUCIFORM_NAVIGATION_VERSION,"angelus-cross-v1");
const tap=(x,y)=>crossDirection({x,y,width:68,height:82});
assert.equal(tap(34,15),"up","Latin-cross upper shaft");
assert.equal(tap(34,66),"down","Latin-cross lower shaft");
assert.equal(tap(14,32),"previous","Latin-cross left arm");
assert.equal(tap(54,32),"next","Latin-cross right arm");
assert.equal(crossDirection({dx:-64,dy:5}),"next","swipe left advances one page");
assert.equal(crossDirection({dx:64,dy:-3}),"previous","swipe right returns a page");
assert.equal(crossDirection({dx:5,dy:-64}),"down","swipe up advances through text");
assert.equal(crossDirection({dx:5,dy:64}),"up","swipe down returns through text");
assert.equal(crossDirection({dx:40,dy:40}),null,"ambiguous diagonal drag must fail closed");

let current=1,calls=[];
const ctx={deck:{current:()=>current,go:i=>{calls.push(i);current=i;return true}}};
assert.equal(moveCruciform(ctx,"next"),true);
assert.equal(current,2);
assert.equal(moveCruciform(ctx,"previous"),true);
assert.deepEqual(calls,[2,1]);
assert.equal(moveCruciform(ctx,"diagonal"),false);
assert.equal(moveCruciform(null,"next"),false);

const browser=readFileSync(new URL("../src/pray/browser-entry.js",import.meta.url),"utf8");
const nav=readFileSync(new URL("../src/pray/cruciform-navigation.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/pray/cruciform-navigation-styles.js",import.meta.url),"utf8");
assert.match(browser,/await import\("\.\/cruciform-navigation\.js"\)/,"cross must lazy load with Prayer, never at cold Home");
assert.match(nav,/ctx\.deck\.go/,"horizontal navigation must use existing canonical card owner");
assert.match(nav,/body\.scrollTo/,"vertical navigation must use the existing prayer scroll owner");
assert.match(nav,/dataset\.aoDevoActive/,"focused paragraph must come from existing deck");
assert.doesNotMatch(nav,/src\/mass|AO_MASS|AO_READER/,"Mass reader must remain untouched");
assert.match(css,/\.aoCrossMark/,"Latin-cross silhouette missing");
assert.match(css,/prefers-reduced-motion/,"motion accessibility missing");
console.log("PASS: cruciform directions, one-owner adapter, lazy install, Mass isolation");
