import assert from "node:assert/strict";
import {
  APP_SURFACES,
  NON_MASS_DONOR_CONTRACT,
  createAppHostAdapter,
  createAppShellController,
} from "../src/app/index.js";
import { installAppShellBridge } from "../src/app/browser-entry.js";

assert.deepEqual(APP_SURFACES, ["home", "mass", "pray", "learn", "calendar", "settings"]);
assert.equal(APP_SURFACES.includes("sources"), false);
assert.equal(NON_MASS_DONOR_CONTRACT.release, "43.59.30");
assert.equal(NON_MASS_DONOR_CONTRACT.prayerOwner, "AO_PRAY_V435930");

function host({ route = "home", confirm = true } = {}) {
  const calls = [];
  let current = route;
  let listener = null;
  return {
    calls,
    currentCoreRoute: () => current,
    subscribeCoreRoute(fn) { listener = fn; return () => { listener = null; }; },
    pushRoute(next) { current = next; listener?.(next, { route: next }); },
    hardHome() { calls.push("home"); current = "home"; return true; },
    openDomain(id) { calls.push(`domain:${id}`); return true; },
    openCalendar() { calls.push("calendar"); return true; },
    openSettings() { calls.push("settings"); return true; },
    dismissSettings() { calls.push("dismiss-settings"); return true; },
    restoreSettingsHome() { calls.push("restore-settings-home"); return true; },
    leaveLiveMass() { calls.push("leave-live"); return true; },
    confirmLeaveLiveMass() { calls.push("confirm-live"); return confirm; },
    defer(fn) { calls.push("defer"); return Promise.resolve(fn()); },
  };
}

{
  const h = host();
  const shell = createAppShellController({ host: h });
  assert.equal((await shell.go("pray")).ok, true);
  assert.equal(shell.getActive(), "pray");
  assert.deepEqual(h.calls, ["dismiss-settings", "home", "defer", "domain:pray"]);
}

{
  const h = host();
  h.hasResumableMass = () => true;
  const shell = createAppShellController({ host: h });
  const nav = await shell.go("mass");
  assert.equal(nav.ok, true);
  assert.equal(nav.resumedMass, true);
  assert.equal(shell.getActive(), "mass");
  assert.deepEqual(h.calls, ["dismiss-settings", "defer", "domain:mass"]);
}

{
  const h = host({ route: "live", confirm: false });
  const shell = createAppShellController({ host: h, initialSurface: "mass" });
  const nav = await shell.go("calendar");
  assert.equal(nav.reason, "LIVE_MASS_LEAVE_CANCELLED");
  assert.equal(shell.getActive(), "mass");
  assert.deepEqual(h.calls, ["dismiss-settings", "confirm-live"]);
}

{
  const h = host({ route: "live", confirm: true });
  const shell = createAppShellController({ host: h, initialSurface: "mass" });
  assert.equal((await shell.go("calendar")).ok, true);
  assert.deepEqual(h.calls, ["dismiss-settings", "confirm-live", "leave-live", "home", "defer", "calendar"]);
}

{
  const h = host({ route: "live" });
  const shell = createAppShellController({ host: h, initialSurface: "mass" });
  assert.equal((await shell.go("settings")).ok, true);
  assert.deepEqual(h.calls, ["settings"]);
  h.pushRoute("prepare");
  assert.equal(shell.getActive(), "mass");
}

{
  const calls=[];
  const win={
    AO_RUNTIME_V8:{store:{getState:()=>({route:"home",language:"en"}),subscribe:()=>()=>{}}},
    AO_NAV_V362:{home:()=>true},
    AO_V37_SHELL:{openDomain:(id)=>{calls.push("donor:"+id);return true;}},
    AO_R17_BROWSER_ENTRY:{
      hasResumable:()=>true,
      resume:async()=>{calls.push("mass:resume");return {ok:true};},
      suspend:()=>{calls.push("mass:suspend");return true;},
    },
  };
  const adapter=createAppHostAdapter(win);
  assert.equal(await adapter.openDomain("mass"),true);
  assert.deepEqual(calls,["mass:resume"]);
  assert.equal(adapter.leaveLiveMass(),true);
  assert.deepEqual(calls,["mass:resume","mass:suspend"]);
}

{
  const calls = [];
  const win = {
    AO_RUNTIME_V8: { store: { getState: () => ({ route: "home", language: "en" }), subscribe: () => () => {} } },
    AO_HOME_APP_V1: { open: () => { calls.push("home:modular"); return true; } },
    AO_NAV_V362: { home: () => { calls.push("home:donor"); return true; } },
    AO_V37_SHELL: { openDomain: () => true, openModule: async () => ({ ok:true }) },
  };
  const adapter=createAppHostAdapter(win);
  assert.equal(adapter.hardHome(),true);
  assert.deepEqual(calls,["home:modular"],"Home fell through to AO_NAV_V362 despite modular owner");
}

{
  const calls = [];
  const win = {
    AO_RUNTIME_V8: { store: { getState: () => ({ route: "home", language: "en" }), subscribe: () => () => {} } },
    AO_NAV_V362: { home: () => { calls.push("home"); return true; } },
    AO_CALENDAR_APP_V1: {
      open: () => { calls.push("calendar:modular"); return true; },
      close: () => { calls.push("calendar:close"); return true; },
    },
    AO_V37_SHELL: {
      openDomain: id => { calls.push("domain:" + id); return true; },
      openModule: async id => { calls.push("module:" + id); return { ok: true }; },
    },
  };
  const adapter = createAppHostAdapter(win);
  assert.equal(await adapter.openCalendar(), true);
  assert.deepEqual(calls, ["calendar:modular"], "Calendar fell through to donor module despite modular owner");
}

{
  const calls = [];
  let open = false;
  const win = {
    AO_RUNTIME_V8: { store: { getState: () => ({ route: "home", language: "en" }), subscribe: () => () => {} } },
    AO_NAV_V362: { home: () => calls.push("home") },
    AO_V37_SHELL: {
      openDomain: (id) => { calls.push(`domain:${id}`); return true; },
      openModule: async (id) => { calls.push(`module:${id}`); return { ok: true }; },
    },
    AO_PRAY_APP_V1: {
      open: async () => { calls.push("pray:open"); return true; },
      close: () => { calls.push("pray:close"); return true; },
    },
    AO_SETTINGS_V4359: {
      get state() { return { navigation: { open } }; },
      open() { open = true; calls.push("settings:open"); },
      dismiss() { open = false; calls.push("settings:dismiss"); },
    },
    confirm: () => true,
    setTimeout: (fn) => { fn(); return 1; },
  };
  const adapter = createAppHostAdapter(win);
  assert.equal(adapter.hardHome(), true);
  assert.equal(await adapter.openDomain("pray"), true);
  assert.equal(await adapter.openCalendar(), true);
  assert.equal(adapter.openSettings(), true);
  assert.equal(adapter.dismissSettings(), true);
  assert.deepEqual(calls, ["pray:close", "home", "pray:open", "module:today.calendar", "settings:open", "settings:dismiss"]);
}

{
  const calls = [];
  const dataset = {};
  const win = {
    document: { documentElement: { dataset } },
    AO_RUNTIME_V8: {
      store: {
        getState: () => ({ route: "home", language: "en" }),
        subscribe: () => () => {},
      },
    },
    AO_NAV_V362: { home: () => calls.push("home") },
    AO_LEARN_APP_V1: {
      open: () => { calls.push("learn:open"); return true; },
    },
    AO_V37_SHELL: {
      openDomain: (id) => { calls.push("domain:" + id); return true; },
      openModule: async () => ({ ok: true }),
    },
    setTimeout: (fn) => { fn(); return 1; },
  };
  const bridge = installAppShellBridge({ win, pollMs: 0, maxPolls: 1 });
  assert.equal(bridge.installed, true);
  assert.equal(bridge.passive, false);
  assert.equal(dataset.aoAppShellBridge, "ready");
  assert.equal(bridge.status().passive, false);
  assert.equal((await bridge.navigate("learn")).ok, true);
  assert.deepEqual(calls, ["home", "learn:open"]);
}


{
  const calls=[];
  let ribbonHandler=null;
  const observerCallbacks=[];
  const buttons=[];
  const makeButton=(surface)=>({
    dataset:{aoRibbon:surface},
    classList:{toggle(){}},
    setAttribute(){},
    removeAttribute(name){ if(name==="data-ao-ribbon")delete this.dataset.aoRibbon; },
  });
  const nav={
    dataset:{},
    querySelectorAll(selector){
      if(selector==="[data-ao-ribbon], [data-ao-app-surface]")return buttons;
      if(selector==="[data-ao-ribbon]")return buttons.filter(x=>x.dataset.aoRibbon);
      if(selector==="[data-ao-app-surface]")return buttons.filter(x=>x.dataset.aoAppSurface);
      return [];
    },
    addEventListener(type,fn){if(type==="click")ribbonHandler=fn;},
    removeEventListener(){},
    contains:button=>buttons.includes(button),
  };
  const win={
    document:{
      documentElement:{dataset:{}},
      getElementById:id=>id==="ao-global-ribbon"?nav:null,
      addEventListener(){},removeEventListener(){},
    },
    MutationObserver:class{
      constructor(fn){observerCallbacks.push(fn);}
      observe(){}
      disconnect(){}
    },
    AO_RUNTIME_V8:{store:{getState:()=>({route:"home",language:"en"}),subscribe:()=>()=>{}}},
    AO_NAV_V362:{home:()=>{calls.push("home");return true;}},
    AO_LEARN_APP_V1:{open:()=>{calls.push("learn:open");return true;}},
    AO_V37_SHELL:{openDomain:id=>{calls.push("domain:"+id);return true;},openModule:async()=>({ok:true})},
    setTimeout:fn=>{fn();return 1;},
  };
  installAppShellBridge({win,pollMs:0,maxPolls:1});
  assert.equal(typeof ribbonHandler,"function","ribbon click listener was not bound while initial donor ribbon was incomplete");
  for(const surface of APP_SURFACES){
    const button=makeButton(surface);
    button.dataset.aoAppSurface=surface;
    delete button.dataset.aoRibbon;
    buttons.push(button);
  }
  for(const fn of observerCallbacks)fn?.();
  assert.equal(win.AO_APP_SHELL_V1.status().visibleOwner,true,"late donor ribbon was not adopted");
  let prevented=false;
  ribbonHandler({
    target:{closest:()=>buttons.find(x=>x.dataset.aoAppSurface==="learn")},
    preventDefault(){prevented=true;},
    stopPropagation(){},
  });
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(prevented,true,"late donor ribbon click was not owned by modular shell");
  assert.deepEqual(calls,["home","learn:open"]);
}

console.log("PASS app shell contract");
