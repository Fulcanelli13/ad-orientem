import assert from "node:assert/strict";
import {createHomeOwner} from "../src/home/browser-entry.js";

class E {
 constructor(){this.dataset={};this.parentElement=null;this.children=[];this.textContent="";this.style={};this.hidden=false;}
 append(...elements){for(const el of elements){el.parentElement=this;this.children.push(el);}}
 appendChild(el){this.append(el);return el;}
 remove(){if(this.parentElement){this.parentElement.children=this.parentElement.children.filter(x=>x!==this);this.parentElement=null;}}
 setAttribute(k,v){this[k]=v;}
 contains(el){return this===el||this.children.some(x=>x.contains(el));}
 closest(selector){
  if(selector==="[data-home-shortcut-error]"&&this.dataset.homeShortcutError)return this;
  if(selector==="[data-home-shortcut-retry]"&&this.dataset.homeShortcutRetry)return this;
  const names={"[data-home-mass-entry]":"homeMassEntry","[data-resume-mass]":"resumeMass","[data-home-calendar]":"homeCalendar","[data-home-settings]":"homeSettings","[data-home-customs-atlas]":"homeCustomsAtlas","[data-home-find]":"homeFind","[data-home-cu-all]":"homeCuAll"};
  return names[selector]&&this.dataset[names[selector]]?this:this.parentElement?.closest(selector)??null;
 }
 querySelectorAll(selector){
  const list=[],target=selector.includes("home-shortcut-error")?"homeShortcutError":null;
  const walk=x=>{for(const child of x.children){if(target&&child.dataset[target])list.push(child);walk(child);}};
  walk(this);return list;
 }
}
const screen=new E(),btns=new Map(),handlers={},nav=[],errors=[];
let succeed=false,customs=true,language="en";
for(const [k,v] of [["mass","homeMassEntry"],["resume","resumeMass"],["calendar","homeCalendar"],["settings","homeSettings"],["explore","homeFind"],["customs","homeCustomsAtlas"],["all","homeCuAll"]]){
 const b=new E();b.dataset[v]="true";screen.append(b);btns.set(k,b);
}
const win={
 document:{
  querySelector(sel){return sel===".homeScreen"?screen:null;},
  querySelectorAll(sel){return screen.querySelectorAll(sel);},
  getElementById(){return null;},
  createElement(){return new E();},
  addEventListener(type,fn){handlers[type]=fn;},
  removeEventListener(){}
 },
 AO_RUNTIME_V8:{store:{getState:()=>({route:"home",language}),subscribe:()=>()=>{}}},
 AO_APP_SHELL_V1:{async navigate(dest){nav.push(dest);return succeed?{ok:true}:{ok:false,reason:"OWNER_UNAVAILABLE"};}},
 AO_FIND_APP_V1:{async open(opts){nav.push("lens:"+opts.lens);return customs;}},
 console:{error(...args){errors.push(args);}}
};
const owner=createHomeOwner(win);
assert.equal(typeof handlers.click,"function");
const flush=async()=>{await new Promise(resolve=>setImmediate(resolve));await new Promise(resolve=>setImmediate(resolve));};
async function click(node){
 handlers.click({target:node,preventDefault(){},stopImmediatePropagation(){}});
 await flush();
}
for(const [kind,route] of [["mass","mass"],["resume","mass"],["calendar","calendar"],["settings","settings"],["explore","find"],["all","calendar"]]){
 await click(btns.get(kind));
 assert.equal(nav.at(-1),route);
 const boxes=screen.querySelectorAll("[data-home-shortcut-error]");
 assert.equal(boxes.length,1,kind+" failure did not display a message");
 assert.equal(boxes[0].role,"alert");
 assert.ok(boxes[0].children.some(x=>x.dataset.homeShortcutRetry),"No retry button for "+kind);
 assert.equal(boxes[0].children[1].style.cssText.includes("44px"),true);
}
succeed=true;
await click(screen.querySelectorAll("[data-home-shortcut-error]")[0].children[1]);
assert.equal(screen.querySelectorAll("[data-home-shortcut-error]").length,0,"Successful retry did not clear error");
assert.equal(nav.at(-1),"calendar");
succeed=false;language="fr";
await click(btns.get("settings"));
assert.match(screen.querySelectorAll("[data-home-shortcut-error]")[0].children[0].textContent,/Impossible d’ouvrir/);
succeed=true;language="en";
await click(btns.get("customs"));
assert.deepEqual(nav.slice(-2),["find","lens:heritage"]);
assert.equal(screen.querySelectorAll("[data-home-shortcut-error]").length,0);
customs=false;
await click(btns.get("customs"));
assert.deepEqual(nav.slice(-3),["find","lens:heritage","home"]);
assert.equal(screen.querySelectorAll("[data-home-shortcut-error]")[0].dataset.homeShortcutError,"find.traditions");
customs=true;
await click(screen.querySelectorAll("[data-home-shortcut-error]")[0].children[1]);
assert.deepEqual(nav.slice(-2),["find","lens:heritage"]);
assert.equal(screen.querySelectorAll("[data-home-shortcut-error]").length,0);
assert.equal(owner.status().installed,true);
console.log("PASS Home mass/calendar/settings/explore/Customs shortcuts: explicit failures, bilingual retry and exact destination");
