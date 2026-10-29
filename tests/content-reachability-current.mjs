import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {APP_SURFACES,APP_ROUTE_SURFACES} from "../src/app/contracts.js";
import {LEARN_MODULE_IDS} from "../src/learn/presentation.js";
import {EXPLORE_LENSES} from "../src/find/explore-projection.js";

const read=path=>readFileSync(path,"utf8");
const previous=JSON.parse(read("data/app/content-reachability-audit.v1.json"));
// Historical audit data is retained as provenance, not promoted to
// current navigation authority. Assert against *live* production exports.
assert.deepEqual(APP_SURFACES,["home","mass","pray","learn","find"],
  "Current five-destination app navigation is no longer canonical");
assert.deepEqual(APP_ROUTE_SURFACES,["home","mass","pray","learn","find","calendar","settings","apostolate"],
  "Calendar/Settings/Apostolate must be routable without adding global tabs");
assert.equal(new Set(APP_ROUTE_SURFACES).size,APP_ROUTE_SURFACES.length);
const home=read("src/home/browser-entry.js");
const homePresentation=read("src/home/presentation.js");
assert.ok(home.includes('navigateHomeShortcut("calendar"')&&homePresentation.includes("data-home-calendar"),
  "Calendar must remain discoverable from Home after removing its tab");

const learn=read("src/learn/browser-entry.js");
const learnLayout=read("src/learn/presentation.js");
assert.equal(LEARN_MODULE_IDS.length,16,"Formation published entry count changed");
assert.ok(LEARN_MODULE_IDS.includes("learn.mass_explorer"),"Separate Mass Explorer launch missing");
assert.equal(new Set(LEARN_MODULE_IDS).size,16,"Duplicate Formation module launcher");
for(const id of LEARN_MODULE_IDS){
  assert.ok(learnLayout.includes('id:"'+id+'"'),"Declared Formation module lost its card "+id);
}
assert.match(learn,/openModule\(id,opts=\{\}\)/,"Formation lost its canonical child launch owner");
for(const id of ["learn.apologetics","learn.church_crisis","learn.catholic_life","learn.seasonal_rites"]){
  assert.ok(!LEARN_MODULE_IDS.includes(id),"Unpublished or retired Formation module became a public card "+id);
}
const pray=read("src/pray/presentation-runtime.js");
const first=pray.indexOf("function prayFamilies()");
const last=pray.indexOf("function prayFamilyDoor(",first);
assert.ok(first>=0&&last>first,"Canonical Prayer family projection moved");
const familySource=pray.slice(first,last);
const published=[...familySource.matchAll(/\['(?:own|external)','([^']+)'/g)].map(x=>x[1]);
const external=[...familySource.matchAll(/\['external','([^']+)'/g)].map(x=>x[1]);
assert.equal(published.length,29,"Prayer family retains the frozen 23 original entries plus six distinct chaplet choices");
const chapletStart=familySource.indexOf("chaplets:Object.freeze(");
const chapletEnd=familySource.indexOf("eucharistic:Object.freeze(",chapletStart);
assert.ok(chapletStart>=0&&chapletEnd>chapletStart,"Shared Rosary & Chaplets family missing");
const chapletSource=familySource.slice(chapletStart,chapletEnd);
const chapletRoutes=[...chapletSource.matchAll(/\['own','([^']+)'/g)].map(x=>x[1]);
assert.deepEqual(chapletRoutes,["pray.rosary","pray.rosary_methods","pray.divine_mercy","pray.five_wounds","pray.precious_blood","pray.little_crown"],
  "Rosary, its methods and Divine Mercy must remain distinct canonical readers");
const coreFamilySource=familySource.slice(0,chapletStart)+familySource.slice(chapletEnd);
const originalPublished=[...coreFamilySource.matchAll(/\['(?:own|external)','([^']+)'/g)].map(x=>x[1]);
assert.equal(originalPublished.length,23,"Original Prayer family entries must remain untouched");
assert.ok(published.includes("pray.tenebrae"),"Seasonal Tenebrae must remain in the Passion family");
assert.equal(external.length,10,"External Prayer card count drifted");
assert.ok(familySource.includes("direct:'pray.library'"),"Prayer Library direct family door missing");
const actual=[...originalPublished.filter(id=>id!=="pray.tenebrae"),"pray.library"].sort();
const prior=previous.routes.filter(x=>x.kind==="PRAY_FAMILY_ITEM").map(x=>x.id).sort();
assert.deepEqual(actual,prior,"Existing 23 audited Prayer family entries must remain unaltered by Tenebrae");
const lazy=read("src/pray/lazy-module-registry.js");
for(const id of external){
  assert.ok(lazy.includes('"'+id+'"'),"External Prayer card has no first-use registry entry "+id);
}
assert.ok(pray.includes("openExternalFamilyRoute")&&pray.includes("p435930RetryExternal"),
  "Prayer external module error/retry ownership lost");
assert.equal(EXPLORE_LENSES.length,7,"Explore preserves original lenses and Saints pilot");
assert.equal(new Set(EXPLORE_LENSES).size,7);
for(const lens of ["tlm","shrines","apparitions","relics","traditions","pilgrimages","saints"]){
  assert.ok(EXPLORE_LENSES.includes(lens),"Explore missing published lens "+lens);
}
console.log("PASS current app reachability: 23 preserved Prayer family items plus 5 Rosary/Chaplet discovery entries, no duplicate engine or route owner");
