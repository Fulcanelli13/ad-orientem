import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { APP_SURFACES } from "../src/app/contracts.js";
import { LEARN_MODULE_IDS } from "../src/learn/presentation.js";
import { APOSTOLATE_SCENARIO_IDS, APOSTOLATE_SKILLS } from "../src/apostolate/contracts.js";

const registry=JSON.parse(readFileSync("data/app/content-navigation-registry.v1.json","utf8"));
const file=p=>JSON.parse(readFileSync(p,"utf8"));
const corpus=id=>registry.corpora.find(x=>x.id===id);
const route=id=>registry.routes.find(x=>x.id===id);

assert.equal(registry.schema,"AO_CONTENT_NAVIGATION_REGISTRY_V1");
assert.equal(registry.status,"REVIEW_ONLY_NO_RUNTIME_CHANGES");
assert.equal(registry.scope,"ROUTE_AND_CORPUS_FAMILY_CENSUS");
assert.deepEqual(registry.navigation.current_ribbon,APP_SURFACES);
assert.deepEqual(registry.navigation.proposed_ribbon,["today","mass","pray","learn","explore"]);
assert.equal(registry.navigation.proposed_status,"DESIGN_PROPOSAL_NOT_RELEASED");
assert.equal(new Set(registry.routes.map(x=>x.id)).size,registry.routes.length,"duplicate route identifier");
assert.equal(new Set(registry.corpora.map(x=>x.id)).size,registry.corpora.length,"duplicate corpus identifier");
assert.deepEqual(
 LEARN_MODULE_IDS.slice().sort(),
 registry.routes.filter(x=>x.status==="LAUNCHER_DECLARED").map(x=>x.id).sort(),
 "Learn launcher inventory drifted"
);
assert.ok(registry.routes.every(x=>x.source&&existsSync(x.source)),"route source missing");
assert.ok(registry.corpora.every(x=>x.source_of_truth&&existsSync(x.source_of_truth)),"corpus authority missing");
assert.ok(registry.cross_module_handoffs.every(x=>x.return_to_origin_required&&x.source_copy_forbidden),"handoff policy drift");
for(const id of ["learn.apologetics","learn.church_crisis"]){
 assert.equal(LEARN_MODULE_IDS.includes(id),false,id+" cannot be public before source certification");
 assert.equal(route(id).status,"PUBLICATION_GATED");
}
for(const id of ["learn.catholic_life","learn.seasonal_rites"]){
 assert.equal(LEARN_MODULE_IDS.includes(id),false,id+" must not become a public Learn launcher");
}
assert.equal(corpus("apologetics").count,file("data/learn/apologetics-canonical.v1.json").dossiers.length);
assert.equal(corpus("church-crisis").count,file("data/learn/church-crisis-canonical.v1.json").dossiers.length);
assert.equal(corpus("learn-the-faith-54").count,file("data/learn/learn-the-faith-recovered-54.v1.json").lessons.length);
assert.equal(corpus("novenas").count,file("data/pray/novena-sot.v1.json").novenas.length);
assert.equal(corpus("glossary").count,file("data/glossary/glossary-navigation-sot.v1.json").entry_index.length);
assert.equal(corpus("apostolate-scenarios").count,APOSTOLATE_SCENARIO_IDS.length);
assert.equal(corpus("apostolate-skills").count,APOSTOLATE_SKILLS.length);
const geo=file("data/geography/seed-registry.v1.json");
const shr=file("data/shrines/shrines-pilgrimages-seed.v1.json");
const phen=file("data/explore/sacred-phenomena-seed.v1.json");
const cus=file("data/customs/customs-atlas-seed.v1.json");
const indices=[
 ["geographical-places",geo.places],["shrines",shr.shrines],["pilgrimages",shr.pilgrimages],
 ["pilgrimage-routes",shr.routes],["apparitions",phen.apparitions],["relics",phen.relics],
 ["customs",cus.customs],["customs-attestations",cus.attestations]
];
for(const [id,arr] of indices)assert.equal(corpus(id).count,arr.length,id+" count drift");
const sites=file("data/explore/relic-principal-sites-publication.2026-10-09.json").sites;
const places=new Set(geo.places.map(x=>x.place_id));
const shrineIds=new Set(shr.shrines.map(x=>x.shrine_id));
const relicIds=new Set(phen.relics.map(x=>x.id));
assert.equal(sites.length,corpus("published-relic-principal-sites").count);
assert.ok(sites.every(x=>places.has(x.place_id)&&shrineIds.has(x.shrine_id)&&relicIds.has(x.relic_id)),"relic sites must already exist; never duplicate import");
const editions=Object.keys(readFileSync("src/scripture/catalogue.js","utf8").match(/export const SCRIPTURE_EDITIONS = Object.freeze\(\{([\s\S]*?)\n\}\);/)?.[1]?.match(/\n\s+"[^"]+": Object.freeze/g)||{}).length;
assert.equal(corpus("scripture-editions").count,4);
assert.equal(registry.navigation.prayer_current_families.length,6);
assert.equal(registry.navigation.explore_families.flatMap(x=>x.lenses).length,6);
assert.equal(registry.migrations.length,9);
assert.ok(registry.routes.every(x=>x.browser_verified===false),"source census cannot assert browser verification");
console.log(JSON.stringify({
 result:"PASS",
 currentDestinations:registry.navigation.current_ribbon.length,
 proposedDestinations:registry.navigation.proposed_ribbon.length,
 routeOrLensIds:registry.routes.length,
 corpusFamilies:registry.corpora.length,
 crossModuleHandoffs:registry.cross_module_handoffs.length,
 migrationPackages:registry.migrations.length,
 publishedNavigationAltered:false
},null,2));
