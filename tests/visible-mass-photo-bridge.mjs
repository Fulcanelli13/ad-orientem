import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {projectVisibleMassSanctuary, assertVisibleMassIntegrity,
  VISIBLE_MASS_ZONE_COUNTS, VISIBLE_MASS_ROUTES} from "../previews/visible-mass-3d/photographic-scene-bridge.mjs";

const base="previews/visible-mass-3d/";
const pilot=JSON.parse(fs.readFileSync(base+"PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json","utf8"));
const view=fs.readFileSync(base+"sanctuary-hotspot-pilot.html","utf8");
const m=view.match(/const SPOTS\s*=\s*(\[[\s\S]*?\]);/);
assert.ok(m, "Original photo hotspot array must remain available");
const spots=vm.runInNewContext("("+m[1]+")",Object.create(null));
const glossary={};
for(const file of ["concepts-001-150.v1.json","concepts-151-300.v1.json","concepts-301-450.v1.json"]){
 const parsed=JSON.parse(fs.readFileSync("data/glossary/"+file,"utf8"));
 for(const entry of parsed.entries)glossary[entry.id]=entry;
}
const projection=projectVisibleMassSanctuary(pilot,glossary,spots);
assertVisibleMassIntegrity(projection);
assert.equal(projection.length,6);
assert.equal(Object.values(VISIBLE_MASS_ZONE_COUNTS).reduce((a,b)=>a+b,0),170);
assert.equal(projection.filter(x=>x.glossaryRelation==="RELATED_PARENT_ONLY").length,3);
assert.ok(projection.every(x=>x.questionAnswersPublished===false));
assert.ok(projection.every(x=>x.photoId==="BROMPTON_ALTAR_2019_B"));
assert.equal(VISIBLE_MASS_ROUTES.find(x=>x.id==="NEWMAN_DUBLIN").role,"CATHOLIC_ARCHITECTURE_NOT_TLM");
assert.throws(()=>projectVisibleMassSanctuary(pilot,glossary,spots.map(s=>s.id==="AL01"?{...s,g:"G191"}:s)),/mismatch/);
assert.throws(()=>projectVisibleMassSanctuary({...pilot,status:"PUBLISHED"},glossary,spots),/research-owned/);
console.log("PASS: 170 zone ownership, 6 source-identical photo hotspots, exact glossary and research-only boundaries.");
