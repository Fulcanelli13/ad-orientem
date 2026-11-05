// R1/R2/R3/R4/R5/R6 approved CL2 illustrative discovery positions: no GPS-coordinate navigation,
// no venue identity merges and no current Mass or ecclesial status inferred.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS} from "../src/find/cl2-illustrative-locality-pins.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R2} from "../src/find/cl2-illustrative-locality-pins-r2.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R3} from "../src/find/cl2-illustrative-locality-pins-r3.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R4} from "../src/find/cl2-illustrative-locality-pins-r4.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R5} from "../src/find/cl2-illustrative-locality-pins-r5.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R6} from "../src/find/cl2-illustrative-locality-pins-r6.js";
import {validateCL2PhysicalIndex,projectCL2PhysicalDirectory} from "../src/find/cl2-physical-directory.js";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites} from "../src/find/preliminary-directory-r49.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const audit=read("data/directory/research/illustrative-locality-20261104/review.v1.json");
const index=validateCL2PhysicalIndex(read("data/directory/generated/cl2-physical-site-index.v1.json"));
const base=projectPreliminaryR49(read("data/directory/preliminary-map-r49.v1.json"));
const pub=projectPublishedProvisionalMassSites(base,read("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const world=projectCL2PhysicalDirectory(pub,index);
assert.equal(audit.schema,"AO_CL2_ILLUSTRATIVE_LOCALITY_REVIEW_V1");
assert.equal(audit.scope,"EXCEL_APPROVED_LOCALITY_MARKERS_NO_GPS_DESTINATIONS_PRECISE_OVERRIDES_HELD");
assert.equal(audit.records.length,435);
assert.equal(audit.counts.eligible,158);
assert.equal(audit.counts.identity_holds,12);
assert.equal(audit.counts.excel_exact_preferred,8);
assert.equal(audit.counts.remaining_after_eligible,277);
const excelPreciseHolds=audit.records.filter(r=>r.status==="HOLD_EXCEL_APPROVED_PRECISE_SITE_PREFERRED");
assert.equal(excelPreciseHolds.length,8);
assert.ok(excelPreciseHolds.every(r=>r.excel_preferred_geometry?.evidence_url?.startsWith("https://")));
assert.equal(audit.records.filter(r=>r.status==="HOLD_EXCEL_IDENTITY_AMBIGUITY").length,1);
assert.equal(audit.counts.ambiguous,8);
assert.equal(audit.counts.no_safe_match,249);
assert.equal(audit.counts.current_published_map_pins,2147);
const pins=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS);
assert.equal(pins.length,158);
assert.equal(new Set(pins.map(([id])=>id)).size,158);
const origins=new Map(index.records.map(r=>[r[0],r]));
const items=new Map(world.map(item=>[item.physical_group_id,item]));
const approvals=audit.records.filter(r=>r.status==="APPROVED_ILLUSTRATIVE_PIN_EXCEL_STAGED_PENDING_RELEASE_GATE");
assert.equal(approvals.length,158);
assert.ok(approvals.every(r=>r.excel_review_scope==="APPROVED_LOCALITY_ONLY_NOT_CHURCH_GPS"));
assert.deepEqual(new Set(approvals.map(r=>r.cl2_anchor)),new Set(pins.map(([id])=>id)));
for(const [id,loc] of pins){
 const original=origins.get(id),found=items.get(id);
 assert.ok(original&&found,"Candidate must remain on the frozen physical-site master");
 assert.ok(original[1].includes(loc.sourceId)&&original[2]===loc.name&&original[3]===loc.country);
 assert.ok(String(original[4]).includes(loc.addressNeedle));
 assert.equal(loc.precision,"locality");
 assert.ok(Number.isFinite(loc.lat)&&Math.abs(loc.lat)<=90);
 assert.ok(Number.isFinite(loc.lng)&&Math.abs(loc.lng)<=180);
 assert.match(loc.sourceRef,/^geonames-locality:[A-Z]{2}:[a-z0-9-]+:[a-z0-9-]+$/);
 assert.ok(loc.sourceUrl.includes("joelacus/world-cities/blob/e9afd6a75709df79ce9c3d1332eac2c4b5937477/"));
 assert.equal(loc.reviewScope,"ILLUSTRATIVE_LOCALITY_POINT_NOT_WORSHIP_BUILDING_NOT_ENTRANCE");
 assert.ok(loc.evidence.every(x=>x.startsWith("https://")));
 assert.ok(found.map_publishable&&found.map_state==="PROVISIONAL");
 assert.equal(found.geo.precision,"locality");
 assert.equal(found.geo.approximate,true);
 assert.equal(found.geo.lat,loc.lat);assert.equal(found.geo.lng,loc.lng);
 assert.match(found.geo.review_scope,/ILLUSTRATIVE_LOCALITY_POINT/);
 assert.ok(found.note.includes("not a church GPS point"));
 assert.ok(found.summary.includes("not been independently verified"));
 assert.match(found.status,/MASS UNVERIFIED/);
 assert.equal(found.affiliation_scope,"SOURCE_LABEL_ONLY");
 assert.ok(!found.celebration_evidence);
 assert.equal(found.sections.length,0);
 assert.equal(found.actions.length,1);
 const action=found.actions[0];
 assert.equal(action.label,"Search location");
 const u=new URL(action.url);
 assert.equal(u.hostname,"www.google.com");assert.equal(u.pathname,"/maps/search/");
 assert.equal(u.searchParams.get("api"),"1");
 const q=u.searchParams.get("query");
 assert.ok(q.includes(loc.name),"Map search must use actual church title");
 assert.ok(q.includes(loc.country),"Map search must retain frozen country");
 // A provisional town centroid must never be routed to as GPS destination.
 assert.ok(!q.includes(loc.lat+","+loc.lng));
 assert.ok(!q.includes(loc.lat+"%2C"+loc.lng));
 assert.ok(!action.url.includes("/maps/dir/"));
}
const withheld=audit.records.filter(r=>r.status!=="APPROVED_ILLUSTRATIVE_PIN_EXCEL_STAGED_PENDING_RELEASE_GATE");
assert.equal(withheld.length,277); // frozen R1 audit: 435 original unpinned minus 158 accepted localities
const r2=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS_R2);
assert.equal(r2.length,93,"R2 has exactly 93 independent Excel-approved localities");
assert.ok(r2.every(([id])=>!CL2_ILLUSTRATIVE_LOCALITY_PINS[id]), "R2 may not downgrade R1 pins");
// Nine additional Excel-approved exact/named-POI sites are imported by the
// separate precise-site gate, not as inferred locality pins. Historical
// identity holds and every other R1 withheld record remain unpinned.
const laterPreciseSiteIds=new Set([
 "RG-A164E7D0C229","RG-ABBC659D0388","RG-D7C8B7693CEC",
 "RG-605CC195A1EF","RG-B10417F7A69D","RG-5B65864A842D",
 "RG-A504818C84DC","RG-50BE1A7B5F18","RG-8EC1B37099D3",
]);
assert.equal(laterPreciseSiteIds.size,9);
assert.ok(r2.every(([id])=>!laterPreciseSiteIds.has(id)), "R2 may not downgrade a precise site");
const r3=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS_R3);
assert.equal(r3.length,91,"Only 91 owner-approved R3 research coordinates are eligible");
assert.equal(new Set(r3.map(([id])=>id)).size,91);
for(const [id,pin] of r3){
 const frozen=origins.get(id),site=items.get(id);
 assert.ok(frozen&&site,"R3 coordinates must map to an exact frozen CL2 site: "+id);
 assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS[id]&&!CL2_ILLUSTRATIVE_LOCALITY_PINS_R2[id],
  "R3 must not override previously mapped R1/R2 CL2 geometry: "+id);
 assert.ok(frozen[1].includes(pin.sourceId)&&frozen[2]===pin.name&&frozen[3]===pin.country);
 assert.ok(String(frozen[4]).includes(pin.addressNeedle));
 assert.ok(Number.isFinite(pin.lat)&&Math.abs(pin.lat)<=90);
 assert.ok(Number.isFinite(pin.lng)&&Math.abs(pin.lng)<=180);
 assert.ok(pin.sourceRef.startsWith("independent:r3-illustrative-"));
 assert.ok(pin.sourceUrl.startsWith("https://")&&pin.evidence.every(x=>x.startsWith("https://")));
 assert.ok(["locality","site"].includes(pin.precision));
 assert.ok(pin.reviewScope.includes("NOT_")||pin.reviewScope.includes("NOT_VISITOR_ENTRANCE"));
 assert.ok(site.map_publishable&&site.map_state==="PROVISIONAL");
 assert.equal(site.geo.lat,pin.lat);assert.equal(site.geo.lng,pin.lng);
 assert.equal(site.geo.precision,pin.precision);assert.equal(site.geo.approximate,true);
 assert.equal(site.geo.source_ref,pin.sourceRef);
 assert.match(site.status,/MASS UNVERIFIED/);
 assert.equal(site.affiliation_scope,"SOURCE_LABEL_ONLY");
 assert.equal(site.sections.length,0);
 assert.ok(!site.celebration_evidence);
 if(pin.precision==="locality"){
  assert.equal(site.actions.length,1);
  assert.equal(site.actions[0].label,"Search location");
  const url=new URL(site.actions[0].url);
  assert.equal(url.hostname,"www.google.com");
  assert.equal(url.pathname,"/maps/search/");
  assert.ok(url.searchParams.get("query").includes(site.title));
  assert.ok(!site.actions[0].url.includes("/maps/dir/"));
  assert.ok(!site.actions[0].url.includes(String(pin.lat)+","+String(pin.lng)));
 }else assert.equal(site.actions.length,0,"Site source point must not be promoted to GPS directions");
}
const r4=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS_R4);
assert.equal(r4.length,8,"R4 must contain exactly 8 owner-approved, Excel-reconciled places");
assert.equal(new Set(r4.map(([id])=>id)).size,8);
for(const [id,pin] of r4){
 const frozen=origins.get(id),site=items.get(id);
 assert.ok(frozen&&site,"R4 must match a frozen CL2 site: "+id);
 assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS[id]&&!CL2_ILLUSTRATIVE_LOCALITY_PINS_R2[id]&&!CL2_ILLUSTRATIVE_LOCALITY_PINS_R3[id],
  "No R4 site may overwrite R1/R2/R3 geometry: "+id);
 assert.ok(frozen[1].includes(pin.sourceId)&&frozen[2]===pin.name&&frozen[3]===pin.country);
 assert.ok(String(frozen[4]).includes(pin.addressNeedle));
 assert.ok(Number.isFinite(pin.lat)&&Math.abs(pin.lat)<=90&&Number.isFinite(pin.lng)&&Math.abs(pin.lng)<=180);
 assert.ok(pin.sourceRef.startsWith("independent:r4-illustrative-"));
 assert.ok(pin.sourceUrl.startsWith("https://")&&pin.evidence.length>=2&&pin.evidence.every(x=>x.startsWith("https://")));
 assert.equal(site.map_publishable,true);
 assert.equal(site.map_state,"PROVISIONAL");
 assert.equal(site.geo.lat,pin.lat);assert.equal(site.geo.lng,pin.lng);
 assert.equal(site.geo.precision,pin.precision);
 assert.equal(site.geo.approximate,true);
 assert.equal(site.geo.source_ref,pin.sourceRef);
 assert.match(site.status,/MASS UNVERIFIED/);
 assert.equal(site.affiliation_scope,"SOURCE_LABEL_ONLY");
 assert.equal(site.sections.length,0);
 assert.equal(site.celebration_evidence,undefined);
 if(pin.precision==="locality"){
  assert.match(site.geo.review_scope,/ILLUSTRATIVE_LOCALITY_POINT_NOT_WORSHIP_BUILDING_NOT_ENTRANCE/);
  assert.equal(site.actions.length,1);
  const action=site.actions[0],url=new URL(action.url);
  assert.equal(action.label,"Search location");
  assert.equal(url.hostname,"www.google.com");
  assert.equal(url.pathname,"/maps/search/");
  assert.ok(url.searchParams.get("query").includes(site.title));
  assert.ok(!action.url.includes("/maps/dir/"));
  assert.ok(!action.url.includes(String(pin.lat)+","+String(pin.lng)));
 }else{
  assert.equal(id,"RG-FFAAC62B0A2D","Only Baladou has independent approximate named-house geometry");
  assert.equal(site.geo.review_scope,"REVIEWED_NAMED_RELIGIOUS_HOUSE_SITE_NOT_VISITOR_ENTRANCE");
  assert.equal(site.actions.length,0,"Approximate named-house marker is never an entrance route");
 }
}
const r5=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS_R5);
assert.equal(r5.length,4,"R5 contains exactly four owner-approved Excel geography-only venues");
assert.equal(new Set(r5.map(([id])=>id)).size,4);
for(const [id,pin] of r5){
 const frozen=origins.get(id),site=items.get(id);
 assert.ok(frozen&&site,"R5 must preserve frozen CL2 identity: "+id);
 assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS[id]&&!CL2_ILLUSTRATIVE_LOCALITY_PINS_R2[id]&&!CL2_ILLUSTRATIVE_LOCALITY_PINS_R3[id]&&!CL2_ILLUSTRATIVE_LOCALITY_PINS_R4[id],"R5 cannot override existing map pin: "+id);
 assert.ok(frozen[1].includes(pin.sourceId)&&frozen[2]===pin.name&&frozen[3]===pin.country);
 assert.ok(String(frozen[4]).includes(pin.addressNeedle));
 assert.ok(Number.isFinite(pin.lat)&&Math.abs(pin.lat)<=90&&Number.isFinite(pin.lng)&&Math.abs(pin.lng)<=180);
 assert.ok(pin.sourceRef.startsWith("independent:r5-illustrative-"));
 assert.equal(pin.precision,"locality");
 assert.ok(pin.evidence.length>=2&&pin.evidence.every(u=>u.startsWith("https://")));
 assert.ok(site.map_publishable&&site.map_state==="PROVISIONAL");
 assert.equal(site.geo.lat,pin.lat);assert.equal(site.geo.lng,pin.lng);
 assert.equal(site.geo.precision,"locality");assert.equal(site.geo.approximate,true);
 assert.equal(site.geo.source_ref,pin.sourceRef);
 assert.match(site.geo.review_scope,/ILLUSTRATIVE_LOCALITY_POINT_NOT_WORSHIP_BUILDING_NOT_ENTRANCE/);
 assert.match(site.status,/MASS UNVERIFIED/);
 assert.equal(site.affiliation_scope,"SOURCE_LABEL_ONLY");
 assert.equal(site.sections.length,0);assert.equal(site.celebration_evidence,undefined);
 assert.equal(site.actions.length,1);assert.equal(site.actions[0].label,"Search location");
 const url=new URL(site.actions[0].url);
 assert.equal(url.hostname,"www.google.com");assert.equal(url.pathname,"/maps/search/");
 assert.ok(url.searchParams.get("query").includes(site.title));
 assert.ok(!site.actions[0].url.includes("/maps/dir/"));
 assert.ok(!site.actions[0].url.includes(String(pin.lat)+","+String(pin.lng)));
}
const r6=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS_R6);
assert.equal(r6.length,6,"R6 must contain exactly six Excel-approved geography-only identities");
assert.equal(new Set(r6.map(([id])=>id)).size,6,"R6 must not duplicate CL2 identities");
for(const [id,pin] of r6){
 const frozen=origins.get(id),site=items.get(id);
 assert.ok(frozen&&site,"R6 identity must be in the frozen CL2 index: "+id);
 for(const previous of [CL2_ILLUSTRATIVE_LOCALITY_PINS,CL2_ILLUSTRATIVE_LOCALITY_PINS_R2,CL2_ILLUSTRATIVE_LOCALITY_PINS_R3,CL2_ILLUSTRATIVE_LOCALITY_PINS_R4,CL2_ILLUSTRATIVE_LOCALITY_PINS_R5])
  assert.ok(!previous[id],"R6 cannot override prior map position: "+id);
 assert.ok(frozen[1].includes(pin.sourceId)&&frozen[2]===pin.name&&frozen[3]===pin.country);
 assert.ok(String(frozen[4]).includes(pin.addressNeedle),"R6 must preserve frozen CL2 address identity");
 assert.ok(Number.isFinite(pin.lat)&&Math.abs(pin.lat)<=90&&Number.isFinite(pin.lng)&&Math.abs(pin.lng)<=180);
 assert.match(pin.sourceRef,/^independent:r6-illustrative-[a-z0-9-]+$/);
 assert.equal(pin.precision,"locality");
 assert.ok(pin.evidence.length>=2&&pin.evidence.every(x=>x.startsWith("https://")));
 assert.ok(site.map_publishable&&site.map_state==="PROVISIONAL"&&site.geo?.approximate);
 assert.equal(site.geo.lat,pin.lat);assert.equal(site.geo.lng,pin.lng);
 assert.equal(site.geo.precision,"locality");
 assert.match(site.geo.review_scope,/ILLUSTRATIVE_LOCALITY_POINT_NOT_WORSHIP_BUILDING_NOT_ENTRANCE/);
 assert.match(site.status,/MASS UNVERIFIED/);
 assert.equal(site.affiliation_scope,"SOURCE_LABEL_ONLY");
 assert.equal(site.sections.length,0);assert.equal(site.celebration_evidence,undefined);
 assert.equal(site.actions.length,1);assert.equal(site.actions[0].label,"Search location");
 const target=new URL(site.actions[0].url);
 assert.equal(target.hostname,"www.google.com");assert.equal(target.pathname,"/maps/search/");
 assert.ok(target.searchParams.get("query").includes(site.title));
 assert.ok(!site.actions[0].url.includes("/maps/dir/"));
 assert.ok(!site.actions[0].url.includes(String(pin.lat)+","+String(pin.lng)));
}
const dy=items.get("RG-CF40DBEAD235"),jp=items.get("RG-40C164A0B0B7");
assert.ok(dy?.map_publishable&&jp?.map_publishable);
assert.notEqual(dy.physical_group_id,jp.physical_group_id,"Dyrdy St Barbara chapel and St John Paul II church are distinct physical sites");
assert.equal(dy.geo.approximate,true);assert.equal(jp.geo.approximate,true);
assert.ok(dy.actions.every(x=>!/maps\/dir/.test(x.url)),"Shared illustrative town centre must not become church-door navigation");
for(const r of withheld){
 assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS[r.cl2_anchor],"Exact-site and held profiles cannot be assigned a locality fallback");
 const item=items.get(r.cl2_anchor);
 if(CL2_ILLUSTRATIVE_LOCALITY_PINS_R2[r.cl2_anchor]){
  const pin=CL2_ILLUSTRATIVE_LOCALITY_PINS_R2[r.cl2_anchor];
  assert.equal(r.status,"NO_SAFE_LOCALITY_CANDIDATE","Only R1 previously unresearched locality candidates may be promoted to R2");
  assert.ok(item?.map_publishable&&item.geo?.precision==="locality");
  assert.equal(item.geo.lat,pin.lat);assert.equal(item.geo.lng,pin.lng);
  assert.ok(item.geo.attribution.includes("GeoNames"));
  assert.equal(item.actions.length,1);
  assert.ok(!item.actions[0].url.includes("/maps/dir/"));
 }else if(CL2_ILLUSTRATIVE_LOCALITY_PINS_R3[r.cl2_anchor]){
  assert.equal(r.status,"NO_SAFE_LOCALITY_CANDIDATE",
   "R3 may only publish formerly unresearched R1 locality candidates");
  const pin=CL2_ILLUSTRATIVE_LOCALITY_PINS_R3[r.cl2_anchor];
  assert.ok(item?.map_publishable&&item.geo?.approximate);
  assert.equal(item.geo.lat,pin.lat);assert.equal(item.geo.lng,pin.lng);
  assert.ok(pin.sourceUrl.startsWith("https://"));
 }else if(CL2_ILLUSTRATIVE_LOCALITY_PINS_R4[r.cl2_anchor]){
  assert.equal(r.status,"NO_SAFE_LOCALITY_CANDIDATE",
   "Only a formerly R1 unresearched geography candidate may gain R4 coordinate");
  const pin=CL2_ILLUSTRATIVE_LOCALITY_PINS_R4[r.cl2_anchor];
  assert.ok(item?.map_publishable&&item.geo?.approximate);
  assert.equal(item.geo.lat,pin.lat);assert.equal(item.geo.lng,pin.lng);
  assert.ok(pin.sourceUrl.startsWith("https://"));
 }else if(CL2_ILLUSTRATIVE_LOCALITY_PINS_R5[r.cl2_anchor]){
  assert.equal(r.status,"NO_SAFE_LOCALITY_CANDIDATE","R5 cannot override an R1 identity hold");
  const pin=CL2_ILLUSTRATIVE_LOCALITY_PINS_R5[r.cl2_anchor];
  assert.ok(item?.map_publishable&&item.geo?.approximate);
  assert.equal(item.geo.lat,pin.lat);assert.equal(item.geo.lng,pin.lng);
  assert.ok(pin.sourceUrl.startsWith("https://"));
 }else if(CL2_ILLUSTRATIVE_LOCALITY_PINS_R6[r.cl2_anchor]){
  assert.equal(r.status,"NO_SAFE_LOCALITY_CANDIDATE","R6 cannot override an R1 identity hold");
  const pin=CL2_ILLUSTRATIVE_LOCALITY_PINS_R6[r.cl2_anchor];
  assert.ok(item?.map_publishable&&item.geo?.approximate);
  assert.equal(item.geo.lat,pin.lat);assert.equal(item.geo.lng,pin.lng);
  assert.ok(pin.sourceUrl.startsWith("https://"));
 }else if(laterPreciseSiteIds.has(r.cl2_anchor)){
  assert.ok(item?.map_publishable&&item.geo?.precision==="site","Excel precise site must use independently sourced site point: "+r.cl2_anchor);
  assert.ok(item.geo.source_ref&&!item.geo.source_ref.startsWith("geonames"),"Precise point may not use city-centre evidence: "+r.cl2_anchor);
 }else{
  assert.ok(item&&!item.map_publishable&&!item.geo,"Historical alias/identity and unreviewed site must remain held: "+r.cl2_anchor);
 }
}
for(const anchor of [
 "RG-50082C65DA56", // Sheffield St Joseph identity unresolved in Excel
 "RG-50BE1A7B5F18","RG-5B65864A842D","RG-605CC195A1EF",
 "RG-8EC1B37099D3","RG-A164E7D0C229","RG-A504818C84DC",
 "RG-B10417F7A69D","RG-D7C8B7693CEC",
])assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS[anchor],"Excel-held exact-site/identity candidate must never be downgraded to locality: "+anchor);
assert.equal(audit.records.filter(r=>r.status==="HOLD_EXISTING_CL2_IDENTITY_CONFLICT").length,2);
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS["RG-B66-ACD5E3A16E10"],"Kłodzko chapel identity hold");
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS["RG-18E53EDD9E9C"],"San Jose chapel identity hold");
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS["RG-615FF6835AAE"],"Poprad city identity conflict must remain held");
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS["RG-2C84B50B3667"],"Bootle closed-site hold");
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS["RG-0DCEDA190517"],"Reading church identity hold");
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS["RG-B65-77C86C7B3EC4"],"Cagliari Santa Croce potential alias already mapped");
assert.equal(world.length,2582);
assert.equal(world.filter(x=>x.map_publishable).length,2516);
assert.equal(world.filter(x=>!x.map_publishable).length,66);
const first=items.get(pins[0][0]);
assert.match(renderTlmChurchProfile(first,"en"),/Illustrative town marker ONLY/);
assert.match(renderTlmChurchProfile(first,"en"),/Find church by name\/address on Google Maps/);
assert.match(renderTlmChurchProfile(first,"fr"),/Repère indicatif de la commune UNIQUEMENT/);
assert.match(renderTlmChurchProfile(first,"fr"),/Rechercher l’église par nom\/adresse sur Google Maps/);
console.log("PASS CL2 illustrative localities: 158 R1 plus 93 R2 plus 91 R3 plus 8 R4 plus 4 R5 plus 6 R6 Excel-approved, 66 held/address-only; GPS routing blocked; frozen 2,582 identities and CL27 scope preserved");
