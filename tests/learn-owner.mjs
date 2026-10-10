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
assert.deepEqual(LEARN_LAYOUT.title,["Formation","Formation"]);
assert.deepEqual(
  LEARN_LAYOUT.sections.map(section=>section.title),
  [
    ["Foundations","Fondements"],
    ["Spiritual & Moral Life","Vie spirituelle & morale"],
    ["Liturgy & Tradition","Liturgie & tradition"],
    ["Sacraments & Life Events","Sacrements & étapes de vie"],
    ["Latin","Latin"],
    ["Reference","Référence"],
  ],
);
assert.deepEqual(
  LEARN_MODULE_IDS,
  ["learn.catechism.daily","learn.catechism","learn.spiritual_life","learn.sexual_ethics","learn.scapular","learn.mass","learn.serve_mass.responses","learn.rites.sick","learn.rites.baptism","learn.rites.first_communion","learn.rites.confirmation","learn.rites.holy_orders","learn.rites.matrimony","learn.latin","learn.glossary"],
  "Formation learning-intent layout changed unexpectedly",
);
assert.equal(LEARN_MODULE_IDS.some(id=>id.startsWith("formation.")),false,"A2 introduced a forbidden formation.* route namespace");
assert.deepEqual(
  LEARN_LAYOUT.sections.flatMap(section=>section.items.filter(item=>item.featured).map(item=>item.id)),
  ["learn.catechism.daily","learn.mass"],
  "locked Learn featured-card ownership changed",
);

const presentation=readFileSync("src/learn/presentation.js","utf8");
const owner=readFileSync("src/learn/browser-entry.js","utf8");
const lazy=readFileSync("src/learn/lazy-module-registry.js","utf8");
assert.match(owner,/installLazyLearnRegistry/,"Formation first-use registry must remain installed during Home");
assert.match(owner,/await ensureLearnModule\(id,win\)/,"Formation children must load before invoking registry");
const appEntry=readFileSync("src/app/browser-entry.js","utf8");
const host=readFileSync("src/app/host-adapter.js","utf8");

assert.match(owner,/AO_LEARN_APP_V1/);
assert.match(lazy,/installLatinCourseModule/,"Latin course is not installed by the Formation owner");
assert.match(lazy,/installSexualEthicsModule/,"Catholic Sexual Ethics is not installed by the Formation owner");
assert.match(lazy,/installSpiritualLifeModule/,"Spiritual Life is not installed by the Formation owner");
assert.match(lazy,/ensureLearnModule/,"Spiritual Life registry is not composed into Formation");
assert.match(lazy,/ensureLearnModule/,"Latin course registry is not composed into Formation");
assert.match(lazy,/installGlossaryModule/,"Glossary module is not installed by the Formation owner");
assert.match(lazy,/ensureLearnModule/,"Glossary registry is not composed into Formation");
assert.match(presentation,/id:"learn\.glossary"/,"Glossary launcher is missing from Formation");
assert.match(presentation,/id:"learn\.latin"/,"Latin course launcher is missing from Formation");
assert.match(presentation,/id:"learn\.spiritual_life"/,"Spiritual Life launcher is missing from Formation");
assert.match(owner,/node\.setAttribute\("aria-label","Formation"\)/,"Formation owner lost its visible/ARIA label");
assert.match(presentation,/data-ao-learn-apostolate/,"Formation lost its Apostolate entry action");
assert.match(presentation,/data-ao-learn-back/,"Formation lost hierarchical Back");
assert.match(presentation,/data-ao-learn-home/,"Formation lost explicit global Home");
assert.match(presentation,/ao-refined-help/,"Formation Apostolate entry lost its canonical icon");
assert.ok(owner.includes('navigateFromLearn("apostolate")')&&owner.includes("AO_APP_SHELL_V1?.navigate?.(target)"),"Formation Apostolate action must use the canonical failure-aware app-shell route");
assert.match(owner,/openModule\(id,opts=\{\}\)/,"Formation child launcher cannot receive a return context");
assert.match(owner,/external\?\.surface==="apostolate"/,"Formation cannot restore a suspended Apostolate parent");
assert.match(owner,/new Set\(\[\.\.\.LEARN_MODULE_IDS,"today\.saint","today\.gospel",SPIRITUAL_LIFE_ROUTE_ID\]\)/,"Learn module set lost hidden Today compatibility routes or Spiritual Life");
assert.doesNotMatch(presentation,/Saint of the Day|Saint du jour/,"Saint of the Day remained duplicated in visible Learn");
assert.doesNotMatch(presentation,/id:"today\.gospel"/,"Today’s Gospel returned as a Formation launcher");
assert.match(owner,/"today\.gospel"/,"Today’s Gospel compatibility route was removed rather than hidden");
assert.match(presentation,/Spiritual & Moral Life/);
assert.match(presentation,/Sacraments & Life Events/);
assert.match(presentation,/data-ao-learn-family/,"Formation landing does not expose learning-intent doors");
assert.match(presentation,/aoLearnFamilyGrid/,"Formation family-door grid is missing");
assert.match(owner,/state\.family/,"Formation owner does not retain family navigation state");
assert.match(owner,/familyId:state\.family/,"Formation presentation is not driven by family state");
const spiritualSection=LEARN_LAYOUT.sections.find(section=>section.id==="spiritual-moral");
const liturgySection=LEARN_LAYOUT.sections.find(section=>section.id==="liturgy-tradition");
assert.ok(spiritualSection?.items.some(item=>item.id==="learn.scapular"),"Brown Scapular is not classified under Spiritual & Moral Life");
assert.equal(liturgySection?.items.some(item=>item.id==="learn.scapular"),false,"Brown Scapular remains misclassified under Liturgy & Tradition");
assert.match(presentation,/type:"practice".*learn\.serve_mass\.responses|id:"learn\.serve_mass\.responses",type:"practice"/s,"Serve Low Mass is not classified as practice");
assert.match(owner,/modular-learn-v1/);
assert.match(owner,/aoLearnRouteOwner/);
assert.match(owner,/aoLearnOwner/);
assert.match(owner,/ao-v37-root/,"modular Learn no longer explicitly retires its historical donor root");
assert.doesNotMatch(presentation,/utility\.sources|data-v37-domain|aoV37DomainDock/,"obsolete donor navigation leaked into modular Learn presentation");
assert.doesNotMatch(presentation,/id:"learn\.seasonal_rites"/,"final v38.4 duplicate seasonal discovery card returned");
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

console.log("PASS modular Learn owner: v43.59.30 hub plus Spiritual Life and v38.4 sacramental formation, shell-routed, donor fallback retired.");

await import("./learn-public-discovery.mjs");
await import("./learn-direct-entry-stale-launch.mjs");
await import("./learn-back-home-recovery.mjs");
