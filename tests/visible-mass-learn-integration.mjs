import assert from "node:assert/strict";
import fs from "node:fs";
import {visibleMassReviewEnabled,VISIBLE_MASS_REVIEW_ROUTE} from "../src/learn/visible-mass-review-gate.js";
import {createVisibleMassReviewRuntime} from "../src/learn/visible-mass-review.js";

assert.equal(VISIBLE_MASS_REVIEW_ROUTE,"learn.visible_mass");
assert.equal(visibleMassReviewEnabled({location:{search:""}}),false);
assert.equal(visibleMassReviewEnabled({location:{search:"?aoVisibleMassReview=0"}}),false);
assert.equal(visibleMassReviewEnabled({location:{search:"?aoVisibleMassReview=1"}}),true);
assert.equal(visibleMassReviewEnabled({location:{search:"?page=1&aoVisibleMassReview=1&other=2"}}),true);
assert.equal(visibleMassReviewEnabled({location:{search:"?xaoVisibleMassReview=1"}}),false);
const blocked=createVisibleMassReviewRuntime({location:{search:""},document:{body:{}}});
assert.equal(blocked.open(),false);

const byId=new Map();
function element(tag,doc){
  return {tagName:tag.toUpperCase(),children:[],attrs:{},dataset:{},events:{},hidden:false,textContent:"",id:"",
    classList:{add(){},remove(){}},
    append(...children){this.children.push(...children);children.forEach(x=>{if(x.id)byId.set(x.id,x)});},
    setAttribute(key,value){this.attrs[key]=value;},
    addEventListener(type,handler){this.events[type]=handler;},
    remove(){if(this.id)byId.delete(this.id);this.removed=true;},
    focus(){doc.focused=this;}
  };
}
const doc={
  createElement(tag){return element(tag,doc);},
  getElementById(id){return byId.get(id)||null;},
  body:{children:[],classList:{add(){},remove(){}},append(node){
    this.children.push(node);if(node.id)byId.set(node.id,node);
  }},
  activeElement:null
};
const calls=[];
const parent={
 location:{search:"?aoVisibleMassReview=1",origin:"https://app.example.test"},
 document:doc,
 AO_MODULES:{async open(route,opts){calls.push({route,opts});return {ok:true};}},
 console:{warn(){}}
};
const runtime=createVisibleMassReviewRuntime(parent);
assert.equal(runtime.status().open,false);
assert.equal(runtime.open(),true);
assert.equal(runtime.status().open,true);
assert.equal(runtime.status().researchAnswersPublished,false);
const node=byId.get("ao-visible-mass-review-root");
assert.ok(node);
const frame=node.children.find(x=>x.tagName==="IFRAME");
assert.ok(frame.src.endsWith("/previews/visible-mass-3d/sanctuary-hotspot-pilot.html"));
const child={location:{origin:"https://app.example.test"}};
frame.contentWindow=child;
frame.events.load();
assert.equal(typeof child.AO_MODULES.open,"function");
assert.deepEqual(await child.AO_MODULES.open("mass",{}),{ok:false,error:"UNAPPROVED_MASS_CONTEXT"});
assert.deepEqual(await child.AO_MODULES.open("learn.mass_explorer",{momentKey:"AO.CARD.016"}),{ok:false,error:"UNAPPROVED_MASS_CONTEXT"});
assert.equal(calls.length,0);
const originButton={focus(){}};
const accepted=await child.AO_MODULES.open("learn.mass_explorer",{momentKey:"AO.CARD.024",trigger:originButton});
assert.deepEqual(accepted,{ok:true});
assert.equal(calls.length,1);
assert.equal(calls[0].route,"learn.mass_explorer");
assert.deepEqual(calls[0].opts,{momentKey:"AO.CARD.024",trigger:originButton});
runtime.close();
assert.equal(runtime.status().open,false);
assert.deepEqual(await child.AO_MODULES.open("learn.mass_explorer",{momentKey:"AO.CARD.010"}),{ok:false,error:"REVIEW_NOT_ACTIVE"});

const lazy=fs.readFileSync("src/learn/lazy-module-registry.js","utf8");
const learn=fs.readFileSync("src/learn/browser-entry.js","utf8");
const formation=fs.readFileSync("src/learn/presentation.js","utf8");
const owner=fs.readFileSync("src/learn/visible-mass-review.js","utf8");
assert.match(lazy,/visibleMassReviewEnabled\(win\)/);
assert.match(lazy,/VISIBLE_MASS_REVIEW_ROUTE/);
assert.match(learn,/if\(id===VISIBLE_MASS_REVIEW_ROUTE\)/);
assert.match(formation,/family\.id==="liturgy-tradition"&&visibleMassReviewEnabled\(win\)/);
assert.doesNotMatch(formation,/id:"learn\.visible_mass",type:"module"/);
assert.ok(owner.includes("sanctuary-hotspot-pilot.html"));
assert.ok(!owner.includes("reader-live"));
console.log("PASS Visible Mass gated Formation entry: no public module, source-owned iframe, exact original Mass Explorer path, six-photo review, return/close.");
