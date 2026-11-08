// After completing 2,568 Atlas map markers, every locality point must be
// visibly disclosed in both languages. R28 keeps specific source cautions;
// older R1–R27 markers must not appear as navigable church-door positions.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateCL2PhysicalIndex,projectCL2PhysicalDirectory} from "../src/find/cl2-physical-directory.js";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites} from "../src/find/preliminary-directory-r49.js";
import {renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
import {renderTlmMapResultRail} from "../src/find/tlm-map-result-rail.js";
import {isIllustrativeLocalityMarker,isR28ApproximateMarker,tlmApproximateMapLabel,tlmApproximateMapSource,tlmApproximateMapNotice} from "../src/find/tlm-approximate-map-disclosure.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const index=validateCL2PhysicalIndex(read("data/directory/generated/cl2-physical-site-index.v1.json"));
const preliminary=projectPreliminaryR49(read("data/directory/preliminary-map-r49.v1.json"));
const published=projectPublishedProvisionalMassSites(preliminary,read("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const world=projectCL2PhysicalDirectory(published,index);
const byId=new Map(world.map(x=>[x.physical_group_id,x]));
assert.equal(world.length,2582);
assert.equal(world.filter(x=>x.map_publishable).length,2568);
const locality=world.filter(isIllustrativeLocalityMarker);
const older=locality.filter(x=>!isR28ApproximateMarker(x));
const eight=locality.filter(isR28ApproximateMarker);
assert.ok(older.length>200,"Existing locality pins must be fully disclosed");
assert.equal(eight.length,8);
for(const item of locality){
 assert.ok(item.map_publishable);
 for(const lang of ["en","fr"]){
  const label=tlmApproximateMapLabel(item,lang);
  assert.ok(label&&label.length>10,"Approximate site missing "+lang+" label: "+item.physical_group_id);
  assert.equal(tlmApproximateMapSource(item),isR28ApproximateMarker(item)?"r28":"locality");
 }
}
for(const id of ["RG-6C322C1860C9","RG-5E751D3AAEFA","RG-650EDC1EC27B","RG-0DCEDA190517","RG-615FF6835AAE","RG-B72-BD22249C1E0A"]){
 const site=byId.get(id);
 assert.ok(isIllustrativeLocalityMarker(site),"Representative owner-approved locality missing: "+id);
 for(const lang of ["en","fr"]){
  const label=tlmApproximateMapLabel(site,lang),source=tlmApproximateMapSource(site);
  const card=renderDirectoryVenueCard(site,lang),profile=renderTlmChurchProfile(site,lang);
  const rail=renderTlmMapResultRail({items:[site],language:lang,center:{lat:site.geo.lat,lng:site.geo.lng}});
  assert.ok(card.includes('data-tlm-approximate-source="'+source+'"')&&card.includes(label),"Card silently turns a map proxy into a church position: "+id);
  assert.ok(rail.includes('data-tlm-approximate-source="'+source+'"')&&rail.includes(label),"Map rail lacks precision disclosure: "+id);
  assert.ok(profile.includes("aoTlmProfileCaution"),"Full profile must disclose position uncertainty: "+id);
  if(isR28ApproximateMarker(site)){
   assert.ok(tlmApproximateMapNotice(site,lang));
   assert.ok(profile.includes('data-tlm-approximate-source="r28"'));
  }else{
   assert.equal(tlmApproximateMapNotice(site,lang),null);
   assert.ok(profile.includes(lang==="fr"?"Repère indicatif":"Illustrative town marker"));
  }
  assert.ok(site.actions.every(a=>!a.url.includes("/maps/dir/")),"Do not offer directions to illustrative coordinates");
 }
}
const exact=world.find(x=>x.map_publishable&&x.geo?.precision==="site"&&!isR28ApproximateMarker(x));
assert.ok(exact);
assert.equal(tlmApproximateMapSource(exact),null);
assert.equal(tlmApproximateMapLabel(exact,"en"),null);
assert.equal(tlmApproximateMapLabel(exact,"fr"),null);
assert.equal(tlmApproximateMapLabel(null,"en"),null);
console.log("PASS Atlas locality disclosure: "+locality.length+" illustrative markers, "+older.length+" older + 8 R28, bilingual card and map rail precision warnings, no GPS routing or fabricated exact-site classification");
