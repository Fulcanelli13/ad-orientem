import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createAppHostAdapter } from "../src/app/host-adapter.js";
import {
  LEARN_DONOR_RELEASE,
  LEARN_LAYOUT,
  LEARN_MODULE_IDS,
  LEARN_PRESENTATION_VERSION,
} from "../src/learn/presentation.js";

assert.equal(LEARN_DONOR_RELEASE,"43.59.30");
assert.equal(LEARN_PRESENTATION_VERSION,"modular-learn-presentation-v1");
assert.deepEqual(LEARN_LAYOUT.kicker,["FORMATION","FORMATION"]);
assert.deepEqual(LEARN_LAYOUT.title,["Learn","Apprendre"]);
assert.deepEqual(
  LEARN_LAYOUT.sections.map(section=>section.title),
  [
    ["Daily formation","Formation quotidienne"],
    ["Courses & study","Parcours & étude"],
    ["Traditional Catholic life","Vie catholique traditionnelle"],
    ["Today in context","Le jour en contexte"],
  ],
);
assert.deepEqual(
  LEARN_MODULE_IDS,
  ["learn.catechism.daily","learn.mass","learn.catechism","learn.rites.sick","learn.rites.baptism","learn.rites.matrimony","learn.serve_mass.responses","learn.scapular","learn.seasonal_rites","today.gospel","today.saint"],
  "Learn launcher order changed after v38.1 traditional-life extraction",
);
assert.deepEqual(
  LEARN_LAYOUT.sections.flatMap(section=>section.items.filter(item=>item.featured).map(item=>item.id)),
  ["learn.catechism.daily","learn.mass"],
  "locked Learn featured-card ownership changed",
);

const presentation=readFileSync("src/learn/presentation.js","utf8");
const owner=readFileSync("src/learn/browser-entry.js","utf8");
const appEntry=readFileSync("src/app/browser-entry.js","utf8");
const host=readFileSync("src/app/host-adapter.js","utf8");

assert.match(owner,/AO_LEARN_APP_V1/);
assert.match(owner,/modular-learn-v1/);
assert.match(owner,/aoLearnRouteOwner/);
assert.match(owner,/aoLearnOwner/);
assert.match(owner,/ao-v37-root/,"modular Learn no longer explicitly retires its historical donor root");
assert.doesNotMatch(presentation,/utility\.sources|data-v37-domain|aoV37DomainDock/,"obsolete donor navigation leaked into modular Learn presentation");
assert.doesNotMatch(owner,/openDomain\?\.\("learn"\)|openDomain\("learn"\)/,"modular Learn revives the historical Learn domain");
assert.match(appEntry,/import "\.\.\/learn\/browser-entry\.js";/);
assert.match(host,/domain === "learn"[\s\S]*AO_LEARN_APP_V1/);

{
  const calls=[];
  const win={
    AO_RUNTIME_V8:{store:{getState:()=>({route:"home",language:"en"}),subscribe:()=>()=>{}}},
    AO_HOME_APP_V1:{open:()=>{calls.push("home:open");return true;}},
    AO_LEARN_APP_V1:{
      open:()=>{calls.push("learn:open");return true;},
      close:()=>{calls.push("learn:close");return true;},
    },
    AO_V37_SHELL:{
      openDomain:id=>{calls.push("donor:"+id);return true;},
      openModule:async()=>({ok:true}),
    },
  };
  const adapter=createAppHostAdapter(win);
  assert.equal(await adapter.openDomain("learn"),true);
  assert.deepEqual(calls,["learn:open"],"Learn production route fell through to historical donor shell");
  assert.equal(adapter.hardHome(),true);
  assert.deepEqual(calls,["learn:open","learn:close","home:open"]);
}

{
  const calls=[];
  const win={
    AO_RUNTIME_V8:{store:{getState:()=>({route:"home",language:"en"}),subscribe:()=>()=>{}}},
    AO_NAV_V362:{home:()=>true},
    AO_V37_SHELL:{
      openDomain:id=>{calls.push("donor:"+id);return true;},
      openModule:async()=>({ok:true}),
    },
  };
  const adapter=createAppHostAdapter(win);
  assert.equal(await adapter.openDomain("learn"),false,"Learn did not fail closed when modular owner was unavailable");
  assert.deepEqual(calls,[],"Learn silently fell back to historical donor shell");
}

{
  const calls=[];
  let settingsOpen=false;
  const win={
    AO_RUNTIME_V8:{store:{getState:()=>({route:"home",language:"en"}),subscribe:()=>()=>{}}},
    AO_LEARN_APP_V1:{close:()=>{calls.push("learn:close");return true;}},
    AO_SETTINGS_APP_V1:{
      open(){settingsOpen=true;calls.push("settings:open");return true;},
      status(){return {installed:true,open:settingsOpen};},
    },
  };
  const adapter=createAppHostAdapter(win);
  assert.equal(adapter.openSettings(),true);
  assert.deepEqual(calls,["learn:close","settings:open"],"Settings left modular Learn active underneath");
}

console.log("PASS modular Learn owner: v43.59.30 hub plus v38.1 traditional-life extraction, shell-routed, donor fallback retired.");
