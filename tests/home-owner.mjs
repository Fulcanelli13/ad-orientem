import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHomeOwner } from "../src/home/browser-entry.js";

const calls=[];
let core={route:"pray",homeSheet:"rule"};
const screen={dataset:{}};
const store={
  getState:()=>core,
  dispatch(action){
    calls.push("dispatch:"+action.type);
    if(action.type==="home-sheet")core={...core,homeSheet:null};
    if(action.type==="scripture-close"||action.type==="leave-live"||action.type==="leave-prepare"||action.type==="leave-thanksgiving")core={...core,route:"home"};
  },
};
const closers=name=>({close(){calls.push(name+":close");}});
const win={
  document:{
    querySelector(sel){return sel===".homeScreen"?screen:null;},
    querySelectorAll(){return[];},
    getElementById(){return null;},
  },
  AO_RUNTIME_V8:{store},
  AO_CALENDAR_APP_V1:{close(){calls.push("calendar:close");}},
  AO_V37_SHELL:{close(){calls.push("shell:close");}},
  AO_NAV_V25:{closePanel(){calls.push("panel:close");}},
  AOTraditionalPrayerBook:{close(){calls.push("prayerbook:close");}},
  AO_UNDERSTAND_MASS:closers("understand"),
  AO_TRADITIONAL_CATECHISM:closers("catechism"),
  AO_DAILY_CATECHISM:closers("daily"),
  AO_TRAD_V26:closers("trad"),
  AO_EUCHARISTIC_V354:closers("eucharistic"),
  AO_SETTINGS_APP_V1:{restoreHome(){calls.push("settings:restore");}},
  AO_APP_SHELL_V1:{syncSurface(surface){calls.push("surface:"+surface);}},
  AO_NAV_V362:{home(){calls.push("DONOR_HOME_CALLED");}},
};

const home=createHomeOwner(win);
assert.equal(home.open(),true);
assert.equal(calls.includes("DONOR_HOME_CALLED"),false,"modular Home delegated back to AO_NAV_V362.home()");
assert.equal(screen.dataset.aoHomeOwner,"modular-home-v2");
assert.equal(home.status().visibleOwner,"modular-home-v2");
assert.equal(home.status().donorHomeAvailable,true);
assert.ok(calls.includes("calendar:close"));
assert.ok(calls.includes("shell:close"));
assert.ok(calls.includes("dispatch:home-sheet"));
assert.ok(calls.includes("settings:restore"));
assert.ok(calls.includes("surface:home"));

core={route:"live",homeSheet:null};
calls.length=0;
home.open();
assert.ok(calls.includes("dispatch:leave-live"),"Home did not leave historical live route");
assert.equal(calls.includes("DONOR_HOME_CALLED"),false);

const ownerSource=readFileSync("src/home/browser-entry.js","utf8");
assert.doesNotMatch(ownerSource,/AO_COMING_UP_V4323\?\.render|AO_COMING_UP_V4323\.render/,"Home still rehydrates donor Coming Up");
assert.doesNotMatch(ownerSource,/AO_DAILY_CATECHISM\?\.ensureHome|AO_DAILY_CATECHISM\.ensureHome/,"Home still rehydrates donor Daily Catechism card");
assert.doesNotMatch(ownerSource,/AO_V37_SHELL\?\.openDomain\?\.\("learn"\)|AO_V37_SHELL\.openDomain\("learn"\)/,"Home enrichers revive historical Learn domain");
assert.match(ownerSource,/navigate\?\.\("calendar"\)/,"Coming Up View all no longer routes through modular Calendar");
assert.match(ownerSource,/\[data-resume-mass\]/,"Home Resume is not intercepted by the modular owner");
assert.match(ownerSource,/Modular Home Mass resume failed/,"Home Resume does not use modular app-shell ownership");
assert.ok((ownerSource.match(/navigate\?\.\("mass"\)/g)||[]).length>=2,"Home fresh entry and Resume are not both routed through the app shell");
assert.match(ownerSource,/navigate\?\.\("find"\)/,"Home Find entry does not route through the modular app shell");
assert.match(ownerSource,/\[data-home-settings\]/,"Home does not own the new Settings utility entry");
assert.match(ownerSource,/navigate\?\.\("settings"\)/,"Home Settings utility does not route through the modular shell");
assert.match(ownerSource,/MutationObserver/,"Home does not continuously retire asynchronously reinserted donor enrichers");
assert.match(ownerSource,/retireLegacyHomeEnrichers/,"Home donor enricher retirement helper is missing");
assert.match(ownerSource,/retireUnresolvedSaintArt/,"Home does not suppress terminal saint-art cards without resolved artwork");
assert.match(ownerSource,/\.aoSaintArtCard/,"Home saint-art terminal-state cleanup selector is missing");

assert.match(ownerSource,/data-home-cu-static/,"Daily Rule click owner missing");
assert.match(ownerSource,/opened===false/,"Daily Rule does not recognize a rejected legacy action");
assert.match(ownerSource,/rosary:"pray\\.rosary"/,"Daily Rule Rosary lacks a canonical fallback");

console.log("PASS modular Home navigation/reset owner");
