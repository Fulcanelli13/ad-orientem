import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectR49PhysicalGroupsFromCL2} from "../src/find/cl2-research-crosswalk-adapter.js";

if(process.argv.length!==3)
  throw new Error("Pass the generated CL2 R49 crosswalk JSON audit path");
const r49=JSON.parse(readFileSync("data/directory/preliminary-map-r49.v1.json","utf8"));
const crosswalk=JSON.parse(readFileSync(process.argv[2],"utf8"));
const rows=projectR49PhysicalGroupsFromCL2(r49,crosswalk);
assert.equal(rows.length,1844);
assert.equal(rows.reduce((n,g)=>n+g.ministry_sources.length,0),1879);
assert.equal(rows.filter(g=>g.possible_shared_building).length,35);
assert.equal(rows.filter(g=>g.coordinate_review_required).length,8);
assert.equal(rows.reduce((n,g)=>n+g.ministry_sources.filter(x=>x.institute_norm_reference!==null).length,0),1183);
assert.deepEqual(
  Object.fromEntries(["FSSP","ICKSP","IBP","SSPX"].map(inst=>[inst,rows.reduce(
    (n,g)=>n+g.ministry_sources.filter(x=>x.institute_norm_reference===inst).length,0)])),
  {FSSP:307,ICKSP:128,IBP:19,SSPX:729});
assert.ok(rows.every(g=>g.marker_location===null &&
  g.venue_wide_liturgical_use==="UNKNOWN"&&g.venue_wide_missal_edition==="UNKNOWN"&&
  g.una_cum==="UNKNOWN"&&g.publication_gate==="RESEARCH_ONLY_EXPLICIT_APPROVAL_REQUIRED"));
assert.ok(rows.every(g=>g.ministry_sources.every(x=>
  x.classification_public_approval===false&&x.current_schedule_verified===false &&
  x.classification_scope==="SOURCE_MINISTRY_ONLY_NOT_SITE_OR_CELEBRATION")));
assert.equal(crosswalk.canonical_physical_sites_not_in_R49.length,735);
const poison=structuredClone(crosswalk);
poison.r49_to_cl2_source_scope[0].cl2_source_id="UNRELATED SOURCE";
assert.throws(()=>projectR49PhysicalGroupsFromCL2(r49,poison),/Unsafe crosswalk/);
const changed=structuredClone(r49);
changed.records[0][6]+=0.001;
assert.throws(()=>projectR49PhysicalGroupsFromCL2(changed,crosswalk),/no exact CL2 identity/);
const unsafe=structuredClone(crosswalk);
unsafe.r49_to_cl2_source_scope[0].classification_public_approval=true;
assert.throws(()=>projectR49PhysicalGroupsFromCL2(r49,unsafe),/Unsafe crosswalk/);
console.log("CL2→R49 read-only Find adapter PASS: 1,879 exact source IDs, 1,844 anchors, 35 duplicate groups, 8 coordinate-review groups, 1,183 inherited institute records; no public approval.");
