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
  const calls = [];
  let open = false;
  const win = {
    AO_RUNTIME_V8: { store: { getState: () => ({ route: "home", language: "en" }), subscribe: () => () => {} } },
    AO_NAV_V362: { home: () => calls.push("home") },
    AO_V37_SHELL: {
      openDomain: (id) => { calls.push(`domain:${id}`); return true; },
      openModule: async (id) => { calls.push(`module:${id}`); return { ok: true }; },
    },
    AO_SETTINGS_V4359: {
      get state() { return { navigation: { open } }; },
      open() { open = true; calls.push("settings:open"); },
      dismiss() { open = false; calls.push("settings:dismiss"); },
    },
    confirm: () => true,
    setTimeout: (fn) => { fn(); return 1; },
  };
  win.AO_R17_NATIVE_READER_PREVIEW={destroy(){calls.push("mass:destroy");}};
  const adapter = createAppHostAdapter(win);
  assert.equal(adapter.hardHome(), true);
  assert.equal(adapter.openDomain("pray"), true);
  assert.equal(await adapter.openCalendar(), true);
  assert.equal(adapter.openSettings(), true);
  assert.equal(adapter.dismissSettings(), true);
  assert.equal(adapter.leaveLiveMass(), true);
  assert.deepEqual(calls, ["home", "domain:pray", "module:today.calendar", "settings:open", "settings:dismiss","mass:destroy"]);
}

{
  const calls = [];
  const dataset = {};
  let capturedClick=null;
  function ribbonButton(value){
    const attrs=new Map([["data-ao-ribbon",value]]);
    return {
      value,
      classList:{toggle(){}},
      getAttribute(name){return attrs.get(name)??null;},
      setAttribute(name,next){attrs.set(name,String(next));},
      removeAttribute(name){attrs.delete(name);},
      has(name){return attrs.has(name);},
    };
  }
  const ribbonButtons=[ribbonButton("home"),ribbonButton("learn")];
  const nav={
    attrs:new Map(),
    querySelectorAll(selector){
      if(selector==="[data-ao-ribbon]")return ribbonButtons.filter(button=>button.has("data-ao-ribbon"));
      if(selector==="[data-ao-app-surface]")return ribbonButtons.filter(button=>button.has("data-ao-app-surface"));
      return [];
    },
    querySelector(selector){return this.querySelectorAll(selector)[0]??null;},
    setAttribute(name,value){this.attrs.set(name,String(value));},
    getAttribute(name){return this.attrs.get(name)??null;},
    contains(button){return ribbonButtons.includes(button);},
  };
  const win = {
    document: {
      documentElement: { dataset },
      getElementById:(id)=>id==="ao-global-ribbon"?nav:null,
    },
    addEventListener(type,fn,options){
      if(type==="click"&&(options===true||options?.capture===true))capturedClick=fn;
    },
    removeEventListener(){},
    AO_RUNTIME_V8: {
      store: {
        getState: () => ({ route: "home", language: "en" }),
        subscribe: () => () => {},
      },
    },
    AO_NAV_V362: { home: () => calls.push("home") },
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
  assert.equal(bridge.status().visibleRibbonOwned,true);
  assert.equal(bridge.status().legacyRibbonClickNeutralized,true);
  assert.equal(dataset.aoAppShellOwner,"modular");
  assert.equal(nav.getAttribute("data-ao-app-owner"),"modular");
  assert.equal(nav.querySelectorAll("[data-ao-ribbon]").length,0);
  assert.equal(nav.querySelectorAll("[data-ao-app-surface]").length,2);
  assert.equal((await bridge.navigate("learn")).ok, true);
  assert.equal(typeof capturedClick,"function");
  let prevented=false,stopped=false;
  capturedClick({
    target:{closest:(selector)=>selector==="[data-ao-app-surface]"?ribbonButtons[1]:null},
    preventDefault(){prevented=true;},
    stopPropagation(){stopped=true;},
  });
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(prevented,true);
  assert.equal(stopped,true);
  assert.deepEqual(calls, ["home", "domain:learn","home","domain:learn"]);
}

console.log("PASS app shell contract");
