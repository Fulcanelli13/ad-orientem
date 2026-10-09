import assert from "node:assert/strict";
import {createHomeOwner} from "../src/home/browser-entry.js";

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
      selector==="[data-home-cu-route]"?this.dataset.homeCuRoute:null;
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

console.log("PASS Home exact shortcut, visible EN/FR retry and no generic Pray fallback");
