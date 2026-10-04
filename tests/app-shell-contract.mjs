import assert from "node:assert/strict";
import {
  APP_SURFACES,
  NON_MASS_DONOR_CONTRACT,
  createAppHostAdapter,
  createAppShellController,
} from "../src/app/index.js";
import { installAppShellBridge, installLiveStructuralSettingsGuard, installLiveSessionGuard } from "../src/app/browser-entry.js";

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
  h.openDomain = (id) => { h.calls.push(`domain:${id}`); return true; };
  const shell = createAppShellController({ host: h });
  const nav = await shell.go("mass");
  assert.equal(nav.ok, true);
  assert.equal(nav.resumedMass, true);
  assert.equal(shell.getActive(), "mass");
  assert.deepEqual(
    h.calls,
    ["dismiss-settings", "defer", "domain:mass"],
    "resumable Mass navigation must bypass destructive hard-Home reset",
  );
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
  const h = host({ route: "home", confirm: false });
  h.liveMassActive = () => true;
  const shell = createAppShellController({ host: h, initialSurface: "mass" });
  const nav = await shell.go("pray");
  assert.equal(nav.reason, "LIVE_MASS_LEAVE_CANCELLED");
  assert.equal(shell.getActive(), "mass");
  assert.deepEqual(h.calls, ["dismiss-settings", "confirm-live"]);
}

// native reader authority survives historical route reset

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

// resumable Mass bypasses donor domain
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

{
  let clickHandler=null;
  let route="live";
  const alerts=[];
  const doc={
    addEventListener(type,fn,capture){ if(type==="click"&&capture===true)clickHandler=fn; },
    removeEventListener(){},
  };
  const win={
    document:doc,
    AO_RUNTIME_V8:{store:{getState:()=>({route,language:"en"})}},
    alert:(message)=>alerts.push(message),
  };
  const guard=installLiveStructuralSettingsGuard({win});
  assert.equal(guard.installed,true);
  assert.equal(typeof clickHandler,"function");
  let prevented=false,stopped=false;
  clickHandler({
    target:{closest:(selector)=>selector.includes("[data-live-form]")?{}:null},
    preventDefault(){prevented=true;},
    stopImmediatePropagation(){stopped=true;},
  });
  assert.equal(prevented,true);
  assert.equal(stopped,true);
  assert.equal(alerts.length,1);
  assert.match(alerts[0],/locked while Mass is in progress/);

  route="home";
  prevented=false;
  stopped=false;
  clickHandler({
    target:{closest:()=>({})},
    preventDefault(){prevented=true;},
    stopImmediatePropagation(){stopped=true;},
  });
  assert.equal(prevented,false);
  assert.equal(stopped,false);
  assert.equal(alerts.length,1);
  guard.dispose();
}

{
  let subscriber=null;
  let route="home";
  const classes=new Set();
  const bodyClasses=new Set();
  const attrs={};
  const writes=[];
  let hapticsEnabled=true;
  let vibrate=null;
  const ribbon={
    hidden:false,
    setAttribute(key,value){attrs[key]=value;},
  };
  const store={
    getState:()=>({route}),
    subscribe(fn){subscriber=fn;return ()=>{subscriber=null;};},
  };
  const win={
    document:{
      documentElement:{classList:{toggle(name,on){on?classes.add(name):classes.delete(name);}}},
      body:{classList:{toggle(name,on){on?bodyClasses.add(name):bodyClasses.delete(name);}}},
      getElementById:id=>id==="ao-global-ribbon"?ribbon:null,
    },
    AO_RUNTIME_V8:{store},
    AO_HAPTICS_V4319:{setEnabled(value){hapticsEnabled=value;}},
    localStorage:{setItem(key,value){writes.push([key,value]);}},
    navigator:{vibrate(value){vibrate=value;}},
  };
  const guard=installLiveSessionGuard({win});
  assert.equal(guard.installed,true);
  assert.equal(ribbon.hidden,false);
  route="live";
  subscriber?.();
  assert.equal(ribbon.hidden,true);
  assert.equal(attrs["aria-hidden"],"true");
  assert.equal(classes.has("aoAppLive"),true);
  assert.equal(bodyClasses.has("aoAppLive"),true);
  assert.equal(hapticsEnabled,false);
  assert.deepEqual(writes.at(-1),["ao-haptics-enabled","0"]);
  assert.equal(vibrate,0);
  route="home";
  subscriber?.();
  assert.equal(ribbon.hidden,false);
  assert.equal(attrs["aria-hidden"],"false");
  assert.equal(classes.has("aoAppLive"),false);
  guard.dispose();
}

// LIVE structural settings guard contract

console.log("PASS app shell contract");
