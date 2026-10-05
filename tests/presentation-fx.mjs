import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createPresentationFxBridge, PRESENTATION_FX_VERSION } from "../src/app/presentation-fx.js";

function classList(){
  const set=new Set();
  return {
    add(...xs){xs.forEach(x=>set.add(x));},
    remove(...xs){xs.forEach(x=>set.delete(x));},
    contains(x){return set.has(x);},
  };
}

function node(){
  return {
    dataset:{},
    classList:classList(),
    attrs:{},
    offsetWidth:390,
    setAttribute(k,v){this.attrs[k]=String(v);},
    querySelector(selector){
      if(selector==="[data-ao-cinema-loader-title]")return this.titleNode;
      if(selector==="[data-ao-cinema-loader-sub]")return this.subNode;
      return null;
    },
    titleNode:{textContent:""},
    subNode:{textContent:""},
  };
}

const html=node(),loader=node(),calendar=node();
let transition=null;
const win={
  document:{
    documentElement:html,
    getElementById(id){return id==="ao-cinema-loader"?loader:null;},
    querySelector(selector){return selector.includes("#ao-calendar-modular-root")?calendar:null;},
  },
  AO_RUNTIME_V8:{store:{getState:()=>({language:"en",settings:{reducedMotion:false}})}},
  AO_CINEMATIC_V4312:{
    version:"43.12-ZERO-OBSERVER-CINEMATIC-CERTIFICATION",
    showTransition(meta){transition=meta;},
    isReducedMotion(){return false;},
    queuePresentationScan(){},
  },
  setTimeout(fn){fn();return 1;},
  clearTimeout(){},
  requestAnimationFrame(fn){fn();},
  matchMedia(){return {matches:false};},
};

const fx=createPresentationFxBridge({win,getActive:()=>"home",loaderDelay:220,surfaceDuration:520});
assert.equal(fx.version,PRESENTATION_FX_VERSION);
assert.equal(fx.status().legacyCinematicAvailable,true);
const result=await fx.navigate("calendar",async()=>({ok:true,surface:"calendar"}));
assert.equal(result.ok,true);
assert.deepEqual(transition,{kicker:"SACRED TIME",title:"Calendar"});
assert.equal(calendar.dataset.aoPresentationFx,"entered");
assert.equal(calendar.dataset.aoPresentationFxSurface,"calendar");
assert.equal(html.dataset.aoPresentationFxOwner,PRESENTATION_FX_VERSION);
assert.equal(loader.attrs["aria-hidden"],"true");

const appEntry=readFileSync("src/app/browser-entry.js","utf8");
assert.match(appEntry,/createPresentationFxBridge/,"app shell no longer installs modular presentation FX bridge");
assert.match(appEntry,/presentationFx\?\.navigate/,"app shell navigation bypasses presentation FX bridge");

const fxSource=readFileSync("src/app/presentation-fx.js","utf8");
for(const selector of [".celebrationBlock",".aoP435930Hero",".aoLearnModHero",".aoCalSacredTime"]){
  assert.ok(fxSource.includes(selector),`modular presentation FX lost approved hero selector ${selector}`);
}
assert.match(fxSource,/aoModularHeroIn/,"modular hero entry choreography disappeared");
assert.match(fxSource,/legacyCinema\(win\)\?\.scanArt\?\.\(root\)/,"modular surfaces no longer invoke the approved v43.12 art-loading owner");
assert.match(fxSource,/prefers-reduced-motion:reduce/,"modular hero FX lost reduced-motion CSS");
assert.match(fxSource,/installPresentationHook/,"modular presentation rescans no longer follow rendered child surfaces");
assert.doesNotMatch(fxSource,/querySelectorAll\?\.\(["']img["']\)/,"presentation FX regressed to scanning every image in the app");
assert.match(fxSource,/function scheduleInitialScan\(\)/,"initial Home presentation scan lost its bounded late-render recovery");
assert.match(fxSource,/initialScanAttempts >= 16/,"initial Home presentation scan is no longer bounded");
assert.match(fxSource,/scheduleInitialScan\(\);\s*\n\s*return Object\.freeze/,"initial Home surface no longer receives presentation FX scan");

const index=readFileSync("index.html","utf8");
for(const id of ["ao-cinema-boot","ao-cinema-transition","ao-cinema-loader"]){
  assert.match(index,new RegExp(`id=["']${id}["']`),`legacy cinematic surface ${id} disappeared before modular extraction`);
}
assert.match(index,/AO_CINEMATIC_V4312/,"v43.12 cinematic owner disappeared before modular extraction");

console.log("PASS modular presentation FX bridge");
