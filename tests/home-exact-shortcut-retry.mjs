import assert from "node:assert/strict";
import {createHomeOwner} from "../src/home/browser-entry.js";
import {installLazyPrayRegistry} from "../src/pray/lazy-module-registry.js";

class Element {
  constructor(tag="div"){
    this.tagName=tag.toUpperCase();
    this.dataset={};
    this.children=[];
    this.parentElement=null;
    this.style={};
    this.textContent="";
  }
  appendChild(child){child.parentElement=this;this.children.push(child);return child;}
  append(...children){for(const child of children)this.appendChild(child);}
  remove(){
    if(!this.parentElement)return;
    this.parentElement.children=this.parentElement.children.filter(x=>x!==this);
    this.parentElement=null;
  }
  setAttribute(k,v){this[k]=v;}
  contains(node){return node===this||this.children.some(x=>x.contains(node));}
  closest(selector){
    const match=selector==="[data-home-shortcut-retry]"?this.dataset.homeShortcutRetry:
      selector==="[data-home-shortcut-error]"?this.dataset.homeShortcutError:
      selector==="[data-home-cu-route]"?this.dataset.homeCuRoute:
      selector==="[data-home-cu-dynamic]"?this.dataset.homeCuDynamic:
      selector==="[data-home-cu-static]"?this.dataset.homeCuStatic:null;
    return match?this:this.parentElement?.closest(selector)??null;
  }
  querySelectorAll(selector){
    const matches=selector.includes("data-home-shortcut-error")?x=>!!x.dataset.homeShortcutError:()=>false;
    const out=[];
    function walk(node){for(const child of node.children){if(matches(child))out.push(child);walk(child)}}
    walk(this);return out;
  }
}
const screen=new Element("section"),target=new Element("button");
target.dataset.homeCuRoute="pray.novenas";screen.appendChild(target);
const handlers={},calls=[];
let routeOk=false,language="en";
const win={
  document:{
    querySelector(selector){return selector===".homeScreen"?screen:null;},
    querySelectorAll(selector){return screen.querySelectorAll(selector);},
    getElementById(){return null;},
    createElement(tag){return new Element(tag);},
    addEventListener(type,fn){handlers[type]=fn;},
    removeEventListener(){},
  },
  AO_RUNTIME_V8:{store:{getState:()=>({route:"home",language}),subscribe:()=>()=>{}}},
  AO_MODULES:{async open(id){calls.push("registry:"+id);return routeOk?{ok:true}:{ok:false};}},
  AO_PRAY_V435930:{open(id){calls.push("direct:"+id);return false;}},
  AO_PRAY_APP_V1:{open(){calls.push("BAD_GENERIC_HUB");return true;}},
};
createHomeOwner(win);
const fire=async node=>{
  handlers.click({target:node,preventDefault(){}});
  await new Promise(resolve=>setImmediate(resolve));
};
await fire(target);
assert.deepEqual(calls,["registry:pray.novenas","direct:pray.novenas"]);
assert.equal(calls.includes("BAD_GENERIC_HUB"),false);
let box=screen.querySelectorAll("[data-home-shortcut-error]")[0];
assert.ok(box,"failed target must show an accessible retry");
assert.equal(box.role,"alert");
assert.equal(box.dataset.homeShortcutError,"pray.novenas");
assert.match(box.children[0].textContent,/requested item/);
const retry=box.children[1];
assert.equal(retry.dataset.homeShortcutRetry,"pray.novenas");
assert.equal(retry.style.cssText.includes("44px"),true);

routeOk=true;
await fire(retry);
assert.deepEqual(calls.slice(2),["registry:pray.novenas"]);
assert.equal(screen.querySelectorAll("[data-home-shortcut-error]").length,0,"successful retry must clear error");
assert.equal(calls.includes("BAD_GENERIC_HUB"),false);

// French failure copy must remain tied to the selected source route.
language="fr";routeOk=false;
await fire(target);
box=screen.querySelectorAll("[data-home-shortcut-error]")[0];
assert.match(box.children[0].textContent,/Impossible d’ouvrir/);
assert.equal(box.children[1].textContent,"Réessayer");
assert.equal(box.dataset.homeShortcutError,"pray.novenas");


// The daily Home Angelus cannot launch a second AO_RULE_V411 prayer sheet.
// Its morning/noon/evening context and static shortcut must converge on the
// exact same module ID used in the Prayer catalogue, without opening its hub.
routeOk=true;language="en";
win.AO_RULE_V411={
  openDynamic(id){calls.push("BAD_DYNAMIC_RULE:"+id);return true;},
  openStatic(id){calls.push("BAD_STATIC_RULE:"+id);return true;}
};
const staticAngelus=new Element("button");staticAngelus.dataset.homeCuStatic="angelus";screen.appendChild(staticAngelus);
const dynamicAngelus=new Element("button");
dynamicAngelus.dataset.homeCuDynamic="angelus.noon";
dynamicAngelus.dataset.homeCuRoute="pray.angelus_regina";
screen.appendChild(dynamicAngelus);
calls.length=0;
await fire(staticAngelus);
await fire(dynamicAngelus);
assert.deepEqual(calls,["registry:pray.angelus_regina","registry:pray.angelus_regina"],
  "Home must use one canonical Angelus/Regina reader regardless of shortcut");
assert.equal(calls.some(c=>/BAD_|BAD_GENERIC_HUB/.test(c)),false,
  "Legacy Daily Rule reader still intercepts the Angelus");
const staticRosary=new Element("button");staticRosary.dataset.homeCuStatic="rosary";screen.appendChild(staticRosary);
calls.length=0;
await fire(staticRosary);
assert.deepEqual(calls,["registry:pray.rosary"],"Home Rosary must preserve canonical engine ownership");
for(const [quickId,canonical] of [["morning","pray.morning_evening"],["evening","pray.morning_evening"],["examen","pray.nightly_examen"]]){
  const shortcut=new Element("button");shortcut.dataset.homeCuStatic=quickId;screen.appendChild(shortcut);
  calls.length=0;
  await fire(shortcut);
  assert.deepEqual(calls,["registry:"+canonical],quickId+" reopened legacy Daily Rule instead of a canonical Prayer module");
}
const otherPrayer=new Element("button");
otherPrayer.dataset.homeCuDynamic="custom.rule";
otherPrayer.dataset.homeCuRoute="pray.morning_evening";
screen.appendChild(otherPrayer);
calls.length=0;await fire(otherPrayer);
assert.deepEqual(calls,["registry:pray.morning_evening"],
  "Home contextual Prayer route unexpectedly opened a second reader");
routeOk=false;calls.length=0;
await fire(staticAngelus);
assert.deepEqual(calls,["registry:pray.angelus_regina","direct:pray.angelus_regina"]);
assert.equal(screen.querySelectorAll("[data-home-shortcut-error]")[0]?.dataset?.homeShortcutError,
  "pray.angelus_regina","Unavailable canonical Angelus should show an exact-route retry, not the legacy reader");

// Cold Home resolves the canonical Marian route before loading PRAY. The lazy
// handoff must install the one existing runtime and never call an absent or
// competing legacy module owner.
const cold={AO_MODULES:{
  definitions:{},aliases:{},get(){return null;},
  resolve(){return {ok:false,error:"UNKNOWN_MODULE"};},
  open(){throw new Error("Cold Home fell through to an unloaded registry");}
}};
let loaded=0;
assert.equal(installLazyPrayRegistry(cold,async({win:host})=>{
  loaded+=1;
  host.AO_MODULES={open:async id=>({ok:true,canonicalId:id})};
}),true);
assert.equal(cold.AO_MODULES.resolve("pray.angelus_regina")?.ok,true);
assert.equal(cold.AO_MODULES.get("pray.angelus_regina")?.id,"pray.angelus_regina");
const coldResult=await cold.AO_MODULES.open("pray.angelus_regina");
assert.equal(coldResult?.ok,true,"Cold Home could not open the actual Angelus module");
assert.equal(coldResult?.canonicalId,"pray.angelus_regina");
assert.equal(loaded,1,"Lazy Angelus loaded more than one reader");

console.log("PASS Home exact shortcut, visible EN/FR retry and no generic Pray fallback");
