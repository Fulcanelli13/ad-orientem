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
assert.equal(transition,null,"top-level ribbon navigation must not synthesize a generic full-screen cinematic");
assert.equal(calendar.dataset.aoPresentationFx,"entered");
assert.equal(calendar.dataset.aoPresentationFxSurface,"calendar");
assert.equal(html.dataset.aoPresentationFxOwner,PRESENTATION_FX_VERSION);
assert.notEqual(loader.attrs["aria-hidden"],"false","top-level ribbon navigation must not synthesize a generic loader");
assert.equal(fx.status().routeTransitionPolicy,"SEMANTIC_ONLY");
assert.equal(fx.status().genericRouteLoader,false);
assert.equal(fx.showTransition({kicker:"STATIONS OF THE CROSS",title:"Station II",hold:430}),true);
assert.deepEqual(transition,{kicker:"STATIONS OF THE CROSS",title:"Station II",hold:430});
assert.equal(fx.showTransition("calendar"),false,"semantic transition API accepted a surface-name shortcut");
assert.equal(fx.showLoader({kind:"calendar-week",title:"Preparing the liturgical week",sub:"3 of 7 days prepared"}),true);
assert.equal(loader.titleNode.textContent,"Preparing the liturgical week");
assert.equal(loader.subNode.textContent,"3 of 7 days prepared");
fx.hideLoader();

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
assert.match(fxSource,/function installRuntimeHook\(\)/,"modular presentation FX no longer follows canonical runtime state renders");
assert.match(fxSource,/AO_RUNTIME_V8\?\.store\?\.subscribe/,"modular presentation FX lost the observer-free runtime-store hook");
assert.match(fxSource,/function syncLegacyWorkloadLoader/,"exact donor loader foreground guard disappeared");
assert.match(fxSource,/next\?\.scripture\?\.loading/,"Scripture workload loader is no longer preserved");
assert.match(fxSource,/next\?\.resolving && active === "calendar"/,"Calendar resolver loader is no longer foreground-scoped");
assert.match(fxSource,/dataset\?\.kind === "calendar-week"/,"Calendar week-progress loader is not protected from the legacy guard");
assert.doesNotMatch(fxSource,/querySelectorAll\?\.\(["']img["']\)/,"presentation FX regressed to scanning every image in the app");
assert.doesNotMatch(fxSource,/SURFACE_META/,"generic six-surface cinematic metadata returned");
assert.doesNotMatch(fxSource,/showTransition\(surface\)/,"route navigation again synthesizes full-screen destination cinematics");
assert.doesNotMatch(fxSource,/showLoader\(surface\)/,"route navigation again synthesizes destination loaders");
assert.match(fxSource,/SEMANTIC_ONLY/,"semantic-only transition policy is not exposed");
assert.match(fxSource,/function scheduleInitialScan\(\)/,"initial Home presentation scan lost its bounded late-render recovery");
assert.match(fxSource,/initialScanAttempts >= 16/,"initial Home presentation scan is no longer bounded");
assert.match(fxSource,/scheduleInitialScan\(\);\s*\n\s*return Object\.freeze/,"initial Home surface no longer receives presentation FX scan");

const appEntrySource=readFileSync("src/app/browser-entry.js","utf8");
assert.match(appEntrySource,/cinematic-runtime\.js/,"production shell does not load the recovered v43.12 cinematic owner");
const cinemaSource=readFileSync("src/app/cinematic-runtime.js","utf8");
for(const id of ["ao-cinema-boot","ao-cinema-transition","ao-cinema-loader"]){
  assert.ok(cinemaSource.includes(id),"recovered cinematic runtime lost "+id);
}
assert.match(cinemaSource,/AO_CINEMATIC_V4312/,"recovered v43.12 cinematic API is not exported to production");
assert.match(cinemaSource,/const bootWatchdog=win\.setTimeout\?\.\(\(\)=>finishBoot\("guard-timeout"\),8000\)/,"startup curtain can trap pointer events if animation frames stall");
assert.match(cinemaSource,/win\.clearTimeout\?\.\(bootWatchdog\)/,"startup watchdog must be cancelled when home becomes stable");
assert.match(cinemaSource,/220/,"v43.12 workload-loader delay changed");
assert.match(cinemaSource,/enter-prepare/,"Preparation semantic transition missing");
assert.match(cinemaSource,/enter-thanksgiving/,"Thanksgiving semantic transition missing");
assert.match(cinemaSource,/scripture-open/,"Scripture semantic transition missing");
assert.doesNotMatch(cinemaSource,/surface.*calendar.*title/i,"cinematic runtime must not synthesize generic destination-name transitions");

console.log("PASS modular presentation FX bridge");
