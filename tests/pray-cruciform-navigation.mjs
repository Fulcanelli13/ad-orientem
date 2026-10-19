import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {updateDevotionalProgress,DEVOTIONAL_PROGRESS_VERSION} from "../src/pray/devotional-progress.js";

assert.equal(DEVOTIONAL_PROGRESS_VERSION,"card-progress-v1");
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const browser=read("src/pray/browser-entry.js");
const angelus=read("src/pray/devotional-card-deck.js");
const sequential=read("src/pray/devotional-sequence-adapter.js");
const rosary=read("src/pray/presentation-runtime.js");
const css=read("src/pray/devotional-card-deck-styles.js");

assert.doesNotMatch(browser,/cruciform-navigation/,"The cross overlay must not lazy load");
assert.equal(existsSync(new URL("../src/pray/cruciform-navigation.js",import.meta.url)),false);
assert.equal(existsSync(new URL("../src/pray/cruciform-navigation-styles.js",import.meta.url)),false);
for(const [name,source] of [["Angelus",angelus],["Sequential",sequential]]){
 assert.match(source,/updateDevotionalProgress\(/,name+" must expose card progress");
 assert.doesNotMatch(source,/aoDevoNavArrow|aoDevoSequenceMove|aoDevoMove/,name+" must not render previous/next arrows");
 assert.match(source,/ArrowLeft/,name+" needs a keyboard fallback");
 assert.match(source,/ArrowRight/,name+" needs a keyboard fallback");
 assert.match(source,/touchend/,name+" must retain horizontal swipe");
 assert.match(source,/aoDevoCardScroll/,name+" must retain vertical reading scroll");
}
assert.match(rosary,/updateDevotionalProgress\(timeline,\{index:selected,total:chapters\.length/, "Rosary progress must follow its native chapter cursor");
assert.match(css,/\.aoDevoProgressFill/, "Shared progress line missing");
assert.match(css,/prefers-reduced-motion:reduce/, "Motion preference must be respected");

// Minimal DOM stand-in: progress uses the canonical index, never stored progress.
const makeNode=(doc)=>({
 ownerDocument:doc,children:[],attributes:{},style:{values:{},
  setProperty(name,value){this.values[name]=value}},
 setAttribute(name,value){this.attributes[name]=value},
 append(child){this.children.push(child)},
 querySelector(selector){
  if(selector!==":scope > .aoDevoProgress")return null;
  return this.children.find(x=>x.className==="aoDevoProgress")||null;
 }
});
const doc={createElement(){return makeNode(doc)}};
const timeline=makeNode(doc);
const first=updateDevotionalProgress(timeline,{index:0,total:5,language:"en"});
assert.equal(first.attributes["aria-valuenow"],"1");
assert.equal(first.attributes["aria-valuemax"],"5");
assert.equal(first.attributes["aria-valuetext"],"Card 1 of 5");
assert.equal(first.style.values["--ao-devo-progress"],"20%");
const last=updateDevotionalProgress(timeline,{index:4,total:5,language:"fr"});
assert.strictEqual(first,last,"Do not duplicate the bar at each card");
assert.equal(last.attributes["aria-valuetext"],"Carte 5 sur 5");
assert.equal(last.style.values["--ao-devo-progress"],"100%");
assert.equal(timeline.children.length,1);
assert.equal(updateDevotionalProgress(timeline,{index:3,total:0}),null);
console.log("PASS: cross removed; one swipe/keyboard owner; Angelus, sequential and Rosary progress");
