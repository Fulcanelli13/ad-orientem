import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createLoadingDirector,LOADING_ART_SEQUENCES,LOADING_ART_TIMING } from "../src/app/loading-director.js";
const expected={
 boot:["marian","logo","evangelists"],
 pray:["marian","logo","evangelists"],
 learn:["evangelists","logo","marian"],
 calendar:["logo","evangelists","marian"],
 scripture:["evangelists","logo","marian"],
 find:["logo","marian","evangelists"],
 mass:["logo","marian","evangelists"]
};
for(const [key,sequence] of Object.entries(expected))assert.deepEqual(LOADING_ART_SEQUENCES[key],sequence);
assert.deepEqual(LOADING_ART_TIMING,{reveal:300,second:2000,third:5000});
function classList(){
 const values=new Set();
 return {add(...names){names.forEach(n=>values.add(n))},remove(...names){names.forEach(n=>values.delete(n))},contains(name){return values.has(name)}};
}
function element(className=""){
 const attributes={};
 const el={dataset:{},className,classList:classList(),children:[],textContent:"",
   setAttribute(k,v){attributes[k]=String(v)},getAttribute(k){return attributes[k]??null},
   append(child){this.children.push(child)},
   querySelectorAll(selector){return selector===".aoLoadingArtLayer"?this.children.filter(x=>x.className==="aoLoadingArtLayer"):[]},
   querySelector(selector){
     if(selector==="[data-ao-cinema-loader-title]")return this.title;
     if(selector==="[data-ao-cinema-loader-sub]")return this.sub;
     if(selector===".aoCinemaBootCross"||selector===".aoCinemaLoaderMark")return this.mark;
     return null;
   }
 };
 return el;
}
const boot=element(),loader=element();
boot.mark=element("aoCinemaBootCross");
loader.mark=element("aoCinemaLoaderMark");
loader.title=element();loader.sub=element();
let t=0,id=0;
const timers=new Map();
const nodes=new Map([["ao-cinema-boot",boot],["ao-cinema-loader",loader]]);
let route="home",motion=false,language="en";
const win={
 document:{getElementById:key=>nodes.get(key)??null,
   createElement:()=>element(),
   documentElement:{dataset:{}} },
 performance:{now:()=>t},
 setTimeout(fn,delay){const key=++id;timers.set(key,{at:t+delay,fn});return key},
 clearTimeout(key){timers.delete(key)},
 matchMedia:()=>({matches:motion}),
 AO_RUNTIME_V8:{store:{getState:()=>({route,language,settings:{reducedMotion:false}})}}
};
function advance(ms){
 const target=t+ms;let guard=0;
 while(guard++<1000){
  const next=[...timers].filter(([,x])=>x.at<=target).sort((a,b)=>a[1].at-b[1].at||a[0]-b[0])[0];
  if(!next)break;
  t=next[1].at;timers.delete(next[0]);next[1].fn();
 }
 assert.ok(guard<1000,"unbounded loading timer");
 t=target;
}
const director=createLoadingDirector({win});
assert.equal(director.startBoot(),true);
assert.equal(boot.dataset.aoLoadingArt,"marian");
assert.equal(boot.mark.children.length,3);
advance(1999);assert.equal(boot.dataset.aoLoadingArt,"marian");
advance(1);assert.equal(boot.dataset.aoLoadingArt,"logo");
advance(3000);assert.equal(boot.dataset.aoLoadingArt,"evangelists");
director.endBoot();nodes.delete("ao-cinema-boot");
const fast=director.begin("pray");
advance(200);fast.end();advance(300);
assert.equal(loader.classList.contains("aoCinemaLoaderOn"),false,"quick loads must never show animation");
language="fr";
const work=director.begin("learn");
advance(300);
assert.equal(loader.dataset.aoLoadingArt,"evangelists");
assert.equal(loader.title.textContent,"Préparation de la formation");
assert.equal(loader.getAttribute("aria-hidden"),"false");
advance(1700);assert.equal(loader.dataset.aoLoadingArt,"logo");
advance(3000);assert.equal(loader.dataset.aoLoadingArt,"marian");
assert.equal(work.end(),true);assert.equal(work.end(),false);
assert.equal(loader.getAttribute("aria-hidden"),"true");
assert.equal(director.status().active,0);
const early=director.begin("find");advance(350);
const later=director.begin("calendar");advance(350);
assert.equal(loader.dataset.aoLoadingArt,"logo");
early.end();assert.equal(loader.classList.contains("aoCinemaLoaderOn"),true);
later.cancel();assert.equal(loader.classList.contains("aoCinemaLoaderOn"),false);
motion=true;
const reduced=director.begin("pray");advance(350);
assert.equal(loader.dataset.aoLoadingArt,"marian");advance(6000);
assert.equal(loader.dataset.aoLoadingArt,"marian","reduced motion must not sequence");
reduced.end();motion=false;
route="live";
const blocked=director.begin("find");advance(900);
assert.equal(blocked.active,false);assert.equal(loader.classList.contains("aoCinemaLoaderOn"),false);
route="home";
loader.classList.add("aoCinemaLoaderOn");
director.adoptLegacy("scripture");
assert.equal(loader.dataset.aoLoadingArt,"evangelists");
advance(2000);assert.equal(loader.dataset.aoLoadingArt,"logo");
director.releaseLegacy();advance(6000);
assert.equal(loader.dataset.aoLoadingArt,"logo","stale legacy work must not advance");
const source=readFileSync("src/app/browser-entry.js","utf8");
assert.match(source,/loading-director\.js/);
const css=readFileSync("assets/loading/rose-windows.css","utf8");
for(const artwork of ["rose-marian-v4343.png","rose-evangelists-v4343.png","ao-brand-emblem.png"])assert.ok(css.includes(artwork));
assert.match(css,/transition:opacity 400ms/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.doesNotMatch(css,/@keyframes\s+.*spin|rotate\(/i);
console.log("loading director: PASS — 3 exact art masks, 300ms suppression, 2/5s sequencing, cancellation, concurrency, French, reduced motion, LIVE protection.");
