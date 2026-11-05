// R1/R2/R3/R4/R5/R6/R7/R8/R9/R10/R11/R12/R13/R14/R15 approved CL2 illustrative discovery positions: no GPS-coordinate navigation,
// no venue identity merges and no current Mass or ecclesial status inferred.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS} from "../src/find/cl2-illustrative-locality-pins.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R2} from "../src/find/cl2-illustrative-locality-pins-r2.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R3} from "../src/find/cl2-illustrative-locality-pins-r3.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R4} from "../src/find/cl2-illustrative-locality-pins-r4.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R5} from "../src/find/cl2-illustrative-locality-pins-r5.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R6} from "../src/find/cl2-illustrative-locality-pins-r6.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R7} from "../src/find/cl2-illustrative-locality-pins-r7.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R8} from "../src/find/cl2-illustrative-locality-pins-r8.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R9} from "../src/find/cl2-illustrative-locality-pins-r9.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R10} from "../src/find/cl2-illustrative-locality-pins-r10.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R11} from "../src/find/cl2-illustrative-locality-pins-r11.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R12} from "../src/find/cl2-illustrative-locality-pins-r12.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R13} from "../src/find/cl2-illustrative-locality-pins-r13.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R14} from "../src/find/cl2-illustrative-locality-pins-r14.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R15} from "../src/find/cl2-illustrative-locality-pins-r15.js";
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
const r7=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS_R7);
assert.equal(r7.length,4,"R7 requires exactly four Excel-gated geography-only sites");
assert.equal(new Set(r7.map(([id])=>id)).size,4);
const expectedR7=new Set(["RG-51F3D5B6D522","RG-A59E16CD01C5","RG-D44F46EE8EFF","RG-FC9C1D79B1FC"]);
assert.deepEqual(new Set(r7.map(([id])=>id)),expectedR7);
for(const [id,pin] of r7){
 const frozen=origins.get(id),site=items.get(id);
 assert.ok(frozen&&site,"R7 canonical identity must exist: "+id);
 for(const previous of [CL2_ILLUSTRATIVE_LOCALITY_PINS,CL2_ILLUSTRATIVE_LOCALITY_PINS_R2,CL2_ILLUSTRATIVE_LOCALITY_PINS_R3,CL2_ILLUSTRATIVE_LOCALITY_PINS_R4,CL2_ILLUSTRATIVE_LOCALITY_PINS_R5,CL2_ILLUSTRATIVE_LOCALITY_PINS_R6])
  assert.ok(!previous[id],"R7 must not shadow an earlier geo layer: "+id);
 assert.ok(frozen[1].includes(pin.sourceId)&&frozen[2]===pin.name&&frozen[3]===pin.country);
 assert.ok(String(frozen[4]).includes(pin.addressNeedle),"R7 requires frozen address match: "+id);
 assert.ok(Number.isFinite(pin.lat)&&Math.abs(pin.lat)<=90&&Number.isFinite(pin.lng)&&Math.abs(pin.lng)<=180);
 assert.equal(pin.precision,"locality");
 assert.equal(pin.sourceRef,"independent:r7-illustrative-"+id.replaceAll("-","").toLowerCase());
 assert.ok(pin.sourceUrl.startsWith("https://")&&pin.evidence.length>=3&&pin.evidence.every(url=>url.startsWith("https://")));
 assert.equal(pin.reviewScope,"ILLUSTRATIVE_LOCALITY_POINT_NOT_WORSHIP_BUILDING_NOT_ENTRANCE");
 assert.ok(site.map_publishable&&site.map_state==="PROVISIONAL"&&site.geo?.approximate);
 assert.equal(site.geo.lat,pin.lat);assert.equal(site.geo.lng,pin.lng);
 assert.equal(site.geo.precision,"locality");
 assert.match(site.geo.review_scope,/ILLUSTRATIVE_LOCALITY_POINT/);
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
for(const duplicate of ["RG-FECDA1DB9A9E","RG-D6F294379CEF","RG-AFAA6529F2CD"]){
 assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS_R7[duplicate],"Alias/identity hold must not produce a second map pin: "+duplicate);
 assert.ok(items.get(duplicate)&&!items.get(duplicate).map_publishable);
}
assert.ok(!items.get("RG-D44F46EE8EFF").actions[0].url.includes("36.95192"),
 "Rural Ava monastery must never route to town marker");

const r8=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS_R8);
assert.equal(r8.length,8,"R8 must contain eight exact Excel-gated GEO-only anchors");
assert.equal(new Set(r8.map(([id])=>id)).size,8);
const expectedR8=new Set(["RG-B65-1792675F4E43","RG-B65-2A5ED1E07442","RG-B65-7556A0E25BC6",
 "RG-B65-84A7E1C30EF2","RG-B65-91DEE2BDFFF4","RG-B65-FE28B1E6CB47",
 "RG-DAB6D34F5157","RG-E941C843ABE7"]);
assert.deepEqual(new Set(r8.map(([id])=>id)),expectedR8);
for(const [id,pin] of r8){
 const frozen=origins.get(id),site=items.get(id);
 assert.ok(frozen&&site,"R8 must keep canonical CL2 anchor "+id);
 for(const prev of [CL2_ILLUSTRATIVE_LOCALITY_PINS,CL2_ILLUSTRATIVE_LOCALITY_PINS_R2,
   CL2_ILLUSTRATIVE_LOCALITY_PINS_R3,CL2_ILLUSTRATIVE_LOCALITY_PINS_R4,
   CL2_ILLUSTRATIVE_LOCALITY_PINS_R5,CL2_ILLUSTRATIVE_LOCALITY_PINS_R6,
   CL2_ILLUSTRATIVE_LOCALITY_PINS_R7])
   assert.ok(!prev[id],"R8 cannot shadow any earlier pin "+id);
 assert.ok(frozen[1].includes(pin.sourceId)&&frozen[2]===pin.name&&frozen[3]===pin.country);
 assert.ok(String(frozen[4]).includes(pin.addressNeedle));
 assert.ok(Number.isFinite(pin.lat)&&Math.abs(pin.lat)<=90&&Number.isFinite(pin.lng)&&Math.abs(pin.lng)<=180);
 assert.equal(pin.sourceRef,"independent:r8-illustrative-"+id.replaceAll("-","").toLowerCase());
 assert.equal(pin.precision,"locality");
 assert.ok(pin.sourceUrl.startsWith("https://")&&pin.evidence.length>=3&&pin.evidence.every(x=>x.startsWith("https://")));
 assert.equal(pin.reviewScope,"ILLUSTRATIVE_LOCALITY_POINT_NOT_WORSHIP_BUILDING_NOT_ENTRANCE");
 assert.ok(pin.searchAddress?.length>18&&pin.correctedAddress?.length>12);
 assert.ok(site.map_publishable&&site.map_state==="PROVISIONAL"&&site.geo?.approximate);
 assert.equal(site.geo.lat,pin.lat);assert.equal(site.geo.lng,pin.lng);
 assert.equal(site.geo.precision,"locality");assert.match(site.geo.review_scope,/ILLUSTRATIVE_LOCALITY_POINT/);
 assert.match(site.status,/MASS UNVERIFIED/);assert.equal(site.affiliation_scope,"SOURCE_LABEL_ONLY");
 assert.equal(site.sections.length,0);assert.equal(site.celebration_evidence,undefined);
 assert.equal(site.actions.length,1);assert.equal(site.actions[0].label,"Search location");
 const url=new URL(site.actions[0].url);
 assert.equal(url.hostname,"www.google.com");assert.equal(url.pathname,"/maps/search/");
 const q=url.searchParams.get("query");
 assert.ok(q.includes(pin.name));assert.ok(q.includes(pin.searchAddress),
   "R8 external search must preserve verified town and full name");
 assert.ok(!site.actions[0].url.includes("/maps/dir/"));
 assert.ok(!site.actions[0].url.includes(String(pin.lat)+","+String(pin.lng)),
   "R8 point must never be used for GPS routing");
}
assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R8["RG-B65-1792675F4E43"].searchAddress.includes("8132 Egg"));
assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R8["RG-B65-2A5ED1E07442"].searchAddress.includes("Steinen SZ"));
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS_R8["RG-B65-2A5ED1E07442"].searchAddress.includes("Einsiedeln"));
assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R8["RG-B65-FE28B1E6CB47"].searchAddress.includes("Saint-Pierre-de-Clages"));
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS_R8["RG-B65-FE28B1E6CB47"].searchAddress.includes("Porrentruy"));
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS_R8["RG-B65-84A7E1C30EF2"].searchAddress.includes("Baselstrasse 21"));
for(const hold of ["RG-0FF5C3333BCC","RG-FECDA1DB9A9E","RG-D6F294379CEF",
 "RG-7A7B048E1F59","RG-B65-AC330F6E2481"]){
 assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS_R8[hold],"Identity or overlapping-site hold "+hold);
 assert.ok(items.get(hold)&&!items.get(hold).map_publishable);
}

const r9=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS_R9);
const expectedR9=new Set(["RG-4D32CE07E424","RG-7F9BB8497D93","RG-B610D55233B1","RG-BBD7BD44E860"]);
assert.equal(r9.length,4,"R9 must contain four separate Excel GEO-only approvals");
assert.deepEqual(new Set(r9.map(([anchor])=>anchor)),expectedR9);
for(const [anchor,pin] of r9){
 const frozen=origins.get(anchor),site=items.get(anchor);
 assert.ok(frozen&&site,"R9 must retain a frozen CL2 anchor: "+anchor);
 for(const prev of [CL2_ILLUSTRATIVE_LOCALITY_PINS,CL2_ILLUSTRATIVE_LOCALITY_PINS_R2,
   CL2_ILLUSTRATIVE_LOCALITY_PINS_R3,CL2_ILLUSTRATIVE_LOCALITY_PINS_R4,
   CL2_ILLUSTRATIVE_LOCALITY_PINS_R5,CL2_ILLUSTRATIVE_LOCALITY_PINS_R6,
   CL2_ILLUSTRATIVE_LOCALITY_PINS_R7,CL2_ILLUSTRATIVE_LOCALITY_PINS_R8])
  assert.ok(!prev[anchor],"R9 no previous pin override: "+anchor);
 assert.ok(frozen[1].includes(pin.sourceId)&&pin.name===frozen[2]&&pin.country===frozen[3]);
 assert.ok(String(frozen[4]).includes(pin.addressNeedle),"R9 frozen original address match");
 assert.ok(Number.isFinite(pin.lat)&&Math.abs(pin.lat)<=90&&Number.isFinite(pin.lng)&&Math.abs(pin.lng)<=180);
 assert.equal(pin.sourceRef,"independent:r9-illustrative-"+anchor.replaceAll("-","").toLowerCase());
 assert.ok(pin.evidence.length>=3&&pin.evidence.every(u=>u.startsWith("https://")));
 assert.equal(pin.precision,"locality");
 assert.equal(pin.reviewScope,"ILLUSTRATIVE_LOCALITY_POINT_NOT_WORSHIP_BUILDING_NOT_ENTRANCE");
 assert.ok(site.map_publishable&&site.map_state==="PROVISIONAL"&&site.geo?.approximate);
 assert.equal(site.geo.lat,pin.lat); assert.equal(site.geo.lng,pin.lng);
 assert.equal(site.geo.precision,"locality");assert.match(site.status,/MASS UNVERIFIED/);
 assert.equal(site.affiliation_scope,"SOURCE_LABEL_ONLY");assert.equal(site.sections.length,0);
 assert.equal(site.celebration_evidence,undefined);
 assert.equal(site.actions.length,1);assert.equal(site.actions[0].label,"Search location");
 const url=new URL(site.actions[0].url);
 assert.equal(url.hostname,"www.google.com");assert.equal(url.pathname,"/maps/search/");
 const query=url.searchParams.get("query");
 assert.ok(query.includes(pin.name)&&query.includes(pin.searchAddress),"R9 searchable corrected locality");
 assert.ok(!site.actions[0].url.includes("/maps/dir/"));
 assert.ok(!site.actions[0].url.includes(String(pin.lat)+","+String(pin.lng)),"no coordinates in routing URL");
}
assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R9["RG-4D32CE07E424"].searchAddress.includes("Am Hummelberg 2"));
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS_R9["RG-4D32CE07E424"].searchAddress.includes("Steinklingener Str."));
assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R9["RG-7F9BB8497D93"].searchAddress.includes("Posada 121A"));
assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R9["RG-B610D55233B1"].searchAddress.includes("Koenji-Minami"));
assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R9["RG-BBD7BD44E860"].searchAddress.includes("Broughton Hall"));
for(const hold of ["RG-D6F294379CEF","RG-AFAA6529F2CD","RG-FECDA1DB9A9E","RG-3D31819B8E6B"]){
 assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS_R9[hold],"R9 cannot pin source alias hold "+hold);
 assert.ok(items.get(hold)&&!items.get(hold).map_publishable);
}
assert.ok(items.get("RG-2618E5D29428")?.map_publishable,
 "The FSSP Duingt parish church already has one physical site marker");

const r10=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS_R10);
const expectedR10=new Set(["RG-A3F94D9DDAE3","RG-B65-CFAD7E37F3B2",
 "RG-CC53C4123771","RG-D8598963F6F1","RG-54B61A039DD9","RG-660F31BEE50E"]);
assert.equal(r10.length,6,"R10 requires six separately approved Excel GEO-only anchors");
assert.deepEqual(new Set(r10.map(([anchor])=>anchor)),expectedR10);
for(const [anchor,pin] of r10){
 const frozen=origins.get(anchor),site=items.get(anchor);
 assert.ok(frozen&&site,"R10 must retain original CL2 physical identity "+anchor);
 for(const prev of [CL2_ILLUSTRATIVE_LOCALITY_PINS,CL2_ILLUSTRATIVE_LOCALITY_PINS_R2,
   CL2_ILLUSTRATIVE_LOCALITY_PINS_R3,CL2_ILLUSTRATIVE_LOCALITY_PINS_R4,
   CL2_ILLUSTRATIVE_LOCALITY_PINS_R5,CL2_ILLUSTRATIVE_LOCALITY_PINS_R6,
   CL2_ILLUSTRATIVE_LOCALITY_PINS_R7,CL2_ILLUSTRATIVE_LOCALITY_PINS_R8,
   CL2_ILLUSTRATIVE_LOCALITY_PINS_R9])
  assert.ok(!prev[anchor],"R10 may not shadow previously mapped source "+anchor);
 assert.ok(frozen[1].includes(pin.sourceId)&&pin.name===frozen[2]&&pin.country===frozen[3]);
 assert.ok(String(frozen[4]).includes(pin.addressNeedle));
 assert.ok(Number.isFinite(pin.lat)&&Math.abs(pin.lat)<=90&&Number.isFinite(pin.lng)&&Math.abs(pin.lng)<=180);
 assert.equal(pin.sourceRef,"independent:r10-illustrative-"+anchor.replaceAll("-","").toLowerCase());
 assert.equal(pin.precision,"locality");
 assert.ok(pin.sourceUrl.startsWith("https://")&&pin.evidence.length>=3&&pin.evidence.every(x=>x.startsWith("https://")));
 assert.equal(pin.reviewScope,"ILLUSTRATIVE_LOCALITY_POINT_NOT_WORSHIP_BUILDING_NOT_ENTRANCE");
 assert.ok(pin.searchAddress?.length>17&&pin.correctedAddress?.length>17);
 assert.ok(site.map_publishable&&site.map_state==="PROVISIONAL"&&site.geo?.approximate);
 assert.equal(site.geo.lat,pin.lat);assert.equal(site.geo.lng,pin.lng);
 assert.equal(site.geo.precision,"locality");assert.match(site.status,/MASS UNVERIFIED/);
 assert.equal(site.affiliation_scope,"SOURCE_LABEL_ONLY");assert.equal(site.sections.length,0);
 assert.equal(site.celebration_evidence,undefined);assert.equal(site.actions.length,1);
 assert.equal(site.actions[0].label,"Search location");
 const url=new URL(site.actions[0].url);
 assert.equal(url.hostname,"www.google.com");assert.equal(url.pathname,"/maps/search/");
 const query=url.searchParams.get("query");
 assert.ok(query.includes(pin.name)&&query.includes(pin.searchAddress));
 assert.ok(!site.actions[0].url.includes("/maps/dir/"));
 assert.ok(!site.actions[0].url.includes(String(pin.lat)+","+String(pin.lng)));
}
const holySpirit=CL2_ILLUSTRATIVE_LOCALITY_PINS_R10["RG-54B61A039DD9"];
const loreto=CL2_ILLUSTRATIVE_LOCALITY_PINS_R10["RG-660F31BEE50E"];
assert.equal(holySpirit.lat,48.8549242);
assert.equal(holySpirit.lng,14.4886578);
assert.equal(loreto.lat,48.8561753);
assert.equal(loreto.lng,14.4878419);
assert.notEqual(holySpirit.lat,loreto.lat,"Official FSSP Church and Loreto are distinct worship loci");
assert.notEqual(holySpirit.lng,loreto.lng);
assert.ok(holySpirit.sourceUrl.includes("kostel-ducha-svateho"));
assert.ok(loreto.sourceUrl.includes("kaple-lorety"));
assert.ok(holySpirit.searchAddress.includes("Kostel Ducha svatého"));
assert.ok(loreto.searchAddress.includes("Loretánská kaple"));
assert.ok(!holySpirit.searchAddress.includes("Loretánská"));
assert.ok(!loreto.searchAddress.includes("48.8561753"));
assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R10["RG-A3F94D9DDAE3"].searchAddress.includes("Jules Gilly"));
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS_R10["RG-A3F94D9DDAE3"].searchAddress.includes("Saint-Sépulcre"));
assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R10["RG-B65-CFAD7E37F3B2"].searchAddress.includes("Szamotuły"));
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS_R10["RG-B65-CFAD7E37F3B2"].searchAddress.includes("Września"));
assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R10["RG-D8598963F6F1"].searchAddress.includes("Hlavná 67"));
for(const hold of ["RG-D6F294379CEF","RG-7A7B048E1F59","RG-1319CD21788A",
 "RG-B65-AC330F6E2481","RG-2565E7B509ED"]){
 assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS_R10[hold],"R10 must protect source alias/multi-faith identity "+hold);
 assert.ok(items.get(hold)&&!items.get(hold).map_publishable);
}

const r11=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS_R11);
const expectedR11=new Set(["RG-278C58AD5CAD","RG-3FB2F55DB78A","RG-4285190BD8AE",
 "RG-562C27FA24C2","RG-7C8BB6333C7F","RG-AADE0DB1F592",
 "RG-C19C55301A0B","RG-DE8F28D8A0EC"]);
assert.equal(r11.length,8,"R11 requires exactly eight original Excel GEO-only approvals");
assert.deepEqual(new Set(r11.map(([anchor])=>anchor)),expectedR11);
for(const [anchor,pin] of r11){
 const frozen=origins.get(anchor),site=items.get(anchor);
 assert.ok(frozen&&site,"R11 original CL2 identity required "+anchor);
 for(const prev of [CL2_ILLUSTRATIVE_LOCALITY_PINS,CL2_ILLUSTRATIVE_LOCALITY_PINS_R2,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R3,CL2_ILLUSTRATIVE_LOCALITY_PINS_R4,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R5,CL2_ILLUSTRATIVE_LOCALITY_PINS_R6,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R7,CL2_ILLUSTRATIVE_LOCALITY_PINS_R8,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R9,CL2_ILLUSTRATIVE_LOCALITY_PINS_R10])
  assert.ok(!prev[anchor],"R11 must not shadow previous pin "+anchor);
 assert.ok(frozen[1].includes(pin.sourceId)&&pin.name===frozen[2]&&pin.country===frozen[3]);
 assert.ok(String(frozen[4]).includes(pin.addressNeedle));
 assert.ok(Number.isFinite(pin.lat)&&Math.abs(pin.lat)<=90&&Number.isFinite(pin.lng)&&Math.abs(pin.lng)<=180);
 assert.equal(pin.sourceRef,"independent:r11-illustrative-"+anchor.replaceAll("-","").toLowerCase());
 assert.equal(pin.precision,"locality");
 assert.equal(pin.reviewScope,"ILLUSTRATIVE_LOCALITY_POINT_NOT_WORSHIP_BUILDING_NOT_ENTRANCE");
 assert.ok(pin.sourceUrl.startsWith("https://")&&pin.evidence.length>=3&&pin.evidence.every(u=>u.startsWith("https://")));
 assert.ok(pin.searchAddress?.length>18&&pin.correctedAddress?.length>18);
 assert.ok(site.map_publishable&&site.map_state==="PROVISIONAL"&&site.geo?.approximate);
 assert.equal(site.geo.lat,pin.lat);assert.equal(site.geo.lng,pin.lng);assert.equal(site.geo.precision,"locality");
 assert.match(site.status,/MASS UNVERIFIED/);assert.equal(site.affiliation_scope,"SOURCE_LABEL_ONLY");
 assert.equal(site.sections.length,0);assert.equal(site.celebration_evidence,undefined);assert.equal(site.actions.length,1);
 assert.equal(site.actions[0].label,"Search location");
 const url=new URL(site.actions[0].url);
 assert.equal(url.hostname,"www.google.com");assert.equal(url.pathname,"/maps/search/");
 const q=url.searchParams.get("query");
 assert.ok(q.includes(pin.name)&&q.includes(pin.searchAddress),"R11 original name and corrected locality in external search");
 assert.ok(!site.actions[0].url.includes("/maps/dir/"));
 assert.ok(!site.actions[0].url.includes(String(pin.lat)+","+String(pin.lng)),
  "R11 approximate coordinates cannot be GPS routing destinations");
}
assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R11["RG-278C58AD5CAD"].searchAddress.includes("Klostermannovo"));
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS_R11["RG-3D31819B8E6B"],
 "Alternate Železná Ruda CL2 source is held as alias; only one physical church");
assert.ok(!items.get("RG-3D31819B8E6B").map_publishable,"Second Železná Ruda source cannot get duplicate pin");
assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R11["RG-4285190BD8AE"].searchAddress.includes("Cuenca"));
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS_R11["RG-4285190BD8AE"].searchAddress.includes("Priego"));
assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R11["RG-562C27FA24C2"].searchAddress.includes("Almería"));
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS_R11["RG-562C27FA24C2"].searchAddress.includes("Madrid"));
assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R11["RG-7C8BB6333C7F"].searchAddress.includes("Sevilla"));
assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R11["RG-AADE0DB1F592"].searchAddress.includes("Massenet 43"));
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS_R11["RG-AADE0DB1F592"].searchAddress.includes("41.44696"));
assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R11["RG-C19C55301A0B"].searchAddress.includes("Pamplona"));
assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R11["RG-DE8F28D8A0EC"].searchAddress.includes("Tenerife"));
for(const hold of ["RG-D6F294379CEF","RG-3D31819B8E6B","RG-FECDA1DB9A9E",
 "RG-B65-AC330F6E2481","RG-2565E7B509ED"]){
 assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS_R11[hold],"R11 protect aliases/conflicting source "+hold);
 assert.ok(items.get(hold)&&!items.get(hold).map_publishable);
}

const r12=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS_R12);
const expectedR12=new Set(["RG-411313EEC8D4","RG-B68-BA20FDA13BAB"]);
assert.equal(r12.length,2,"R12 has exactly two independent Excel-approved site identities");
assert.deepEqual(new Set(r12.map(([anchor])=>anchor)),expectedR12);
for(const [anchor,pin] of r12){
 const frozen=origins.get(anchor),site=items.get(anchor);
 assert.ok(frozen&&site,"R12 must preserve frozen CL2 source anchor "+anchor);
 for(const prev of [CL2_ILLUSTRATIVE_LOCALITY_PINS,CL2_ILLUSTRATIVE_LOCALITY_PINS_R2,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R3,CL2_ILLUSTRATIVE_LOCALITY_PINS_R4,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R5,CL2_ILLUSTRATIVE_LOCALITY_PINS_R6,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R7,CL2_ILLUSTRATIVE_LOCALITY_PINS_R8,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R9,CL2_ILLUSTRATIVE_LOCALITY_PINS_R10,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R11])
  assert.ok(!prev[anchor],"R12 cannot override any prior pinned source "+anchor);
 assert.ok(frozen[1].includes(pin.sourceId)&&pin.name===frozen[2]&&pin.country===frozen[3]);
 assert.ok(String(frozen[4]).includes(pin.addressNeedle));
 assert.ok(Number.isFinite(pin.lat)&&Math.abs(pin.lat)<=90&&Number.isFinite(pin.lng)&&Math.abs(pin.lng)<=180);
 assert.equal(pin.sourceRef,"independent:r12-illustrative-"+anchor.replaceAll("-","").toLowerCase());
 assert.equal(pin.precision,"locality");
 assert.equal(pin.reviewScope,"ILLUSTRATIVE_LOCALITY_POINT_NOT_WORSHIP_BUILDING_NOT_ENTRANCE");
 assert.ok(pin.evidence.length>=3&&pin.evidence.every(u=>u.startsWith("https://")));
 assert.ok(pin.searchAddress?.length>18&&pin.correctedAddress?.length>18);
 assert.ok(site.map_publishable&&site.map_state==="PROVISIONAL"&&site.geo?.approximate);
 assert.equal(site.geo.lat,pin.lat);assert.equal(site.geo.lng,pin.lng);
 assert.equal(site.geo.precision,"locality");assert.match(site.status,/MASS UNVERIFIED/);
 assert.equal(site.affiliation_scope,"SOURCE_LABEL_ONLY");
 assert.equal(site.sections.length,0);assert.equal(site.celebration_evidence,undefined);
 assert.equal(site.actions.length,1);
 const action=site.actions[0],url=new URL(action.url);
 assert.equal(action.label,"Search location");
 assert.equal(url.hostname,"www.google.com");assert.equal(url.pathname,"/maps/search/");
 const query=url.searchParams.get("query");
 assert.ok(query.includes(pin.name)&&query.includes(pin.searchAddress));
 assert.ok(!action.url.includes("/maps/dir/"));
 assert.ok(!action.url.includes(String(pin.lat)+","+String(pin.lng)));
}
assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R12["RG-411313EEC8D4"].searchAddress.includes("Le Bois"));
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS_R12["RG-411313EEC8D4"].searchAddress.includes("11 place de"));
assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R12["RG-B68-BA20FDA13BAB"].searchAddress.includes("Nußbach"));
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS_R12["RG-B65-AC330F6E2481"],
 "Abbreviated Nußbach source is alias, not a second physical church");
assert.ok(!items.get("RG-B65-AC330F6E2481").map_publishable,
 "One Nußbach parish must produce one discovery marker");

const r13=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS_R13);
assert.equal(r13.length,2,"R13 contains exactly two separate Excel GEO-only approvals");
assert.deepEqual(new Set(r13.map(([id])=>id)),new Set(["RG-CAE1B1B5608A","RG-5EE981E628B6"]));
for(const [id,pin] of r13){
 const frozen=origins.get(id),site=items.get(id);
 assert.ok(frozen&&site,"R13 frozen CL2 identity required "+id);
 for(const prior of [CL2_ILLUSTRATIVE_LOCALITY_PINS,CL2_ILLUSTRATIVE_LOCALITY_PINS_R2,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R3,CL2_ILLUSTRATIVE_LOCALITY_PINS_R4,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R5,CL2_ILLUSTRATIVE_LOCALITY_PINS_R6,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R7,CL2_ILLUSTRATIVE_LOCALITY_PINS_R8,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R9,CL2_ILLUSTRATIVE_LOCALITY_PINS_R10,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R11,CL2_ILLUSTRATIVE_LOCALITY_PINS_R12])
  assert.ok(!prior[id],"R13 may not override previously mapped anchor "+id);
 assert.ok(frozen[1].includes(pin.sourceId)&&frozen[2]===pin.name&&frozen[3]===pin.country);
 assert.ok(String(frozen[4]).includes(pin.addressNeedle));
 assert.equal(pin.sourceRef,"independent:r13-illustrative-"+id.replaceAll("-","").toLowerCase());
 assert.ok(Number.isFinite(pin.lat)&&Math.abs(pin.lat)<=90&&Number.isFinite(pin.lng)&&Math.abs(pin.lng)<=180);
 assert.equal(pin.precision,"locality");
 assert.equal(pin.reviewScope,"ILLUSTRATIVE_LOCALITY_POINT_NOT_WORSHIP_BUILDING_NOT_ENTRANCE");
 assert.ok(pin.sourceUrl.startsWith("https://")&&pin.evidence.length>=3&&pin.evidence.every(u=>u.startsWith("https://")));
 assert.ok(site.map_publishable&&site.map_state==="PROVISIONAL"&&site.geo?.approximate);
 assert.equal(site.geo.lat,pin.lat);assert.equal(site.geo.lng,pin.lng);
 assert.equal(site.geo.precision,"locality");assert.match(site.geo.review_scope,/ILLUSTRATIVE_LOCALITY_POINT/);
 assert.match(site.status,/MASS UNVERIFIED/);assert.equal(site.affiliation_scope,"SOURCE_LABEL_ONLY");
 assert.equal(site.sections.length,0);assert.equal(site.celebration_evidence,undefined);
 assert.equal(site.actions.length,1);assert.equal(site.actions[0].label,"Search location");
 const action=site.actions[0],url=new URL(action.url),q=url.searchParams.get("query");
 assert.equal(url.hostname,"www.google.com");assert.equal(url.pathname,"/maps/search/");
 assert.ok(q.includes(pin.name)&&q.includes(pin.searchAddress));
 assert.ok(!action.url.includes("/maps/dir/"));
 assert.ok(!action.url.includes(String(pin.lat)+","+String(pin.lng)),"Never route to approximate R13 coordinates");
}
const jerez=CL2_ILLUSTRATIVE_LOCALITY_PINS_R13["RG-CAE1B1B5608A"];
const santo=CL2_ILLUSTRATIVE_LOCALITY_PINS_R13["RG-5EE981E628B6"];
assert.equal(jerez.lat,36.682276);assert.equal(jerez.lng,-6.137682);
assert.ok(jerez.searchAddress.includes("Calle Remedios 2"));
assert.ok(!jerez.searchAddress.includes("Puerta Real"));
assert.ok(jerez.attribution.includes("Calle Remedios 4"),"Preserve diocesan street-number discrepancy");
assert.ok(jerez.attribution.includes("DISTINCT chapel"),"Do not conflate adjoining Puerta Real");
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS_R13["RG-965DA280BA11"],"Jerez secondary CL2 stays alias");
assert.ok(!items.get("RG-965DA280BA11").map_publishable,"One Jerez Remedies site, one map marker");
assert.equal(santo.lat,-23.65022);assert.equal(santo.lng,-46.70524);
assert.ok(santo.localityName.includes("hospital campus"));
assert.ok(santo.attribution.includes("NOT a chapel coordinate"));
assert.ok(!santo.searchAddress.includes("-23.65022"));

const r14=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS_R14);
assert.equal(r14.length,1,"R14 exactly one Excel-approved source-matched named subdivision");
assert.equal(r14[0][0],"RG-1590B939A075");
for(const [anchor,pin] of r14){
 const frozen=origins.get(anchor),site=items.get(anchor);
 assert.ok(frozen&&site,"R14 must preserve exact original CL2 source identity");
 for(const prev of [CL2_ILLUSTRATIVE_LOCALITY_PINS,CL2_ILLUSTRATIVE_LOCALITY_PINS_R2,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R3,CL2_ILLUSTRATIVE_LOCALITY_PINS_R4,CL2_ILLUSTRATIVE_LOCALITY_PINS_R5,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R6,CL2_ILLUSTRATIVE_LOCALITY_PINS_R7,CL2_ILLUSTRATIVE_LOCALITY_PINS_R8,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R9,CL2_ILLUSTRATIVE_LOCALITY_PINS_R10,CL2_ILLUSTRATIVE_LOCALITY_PINS_R11,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R12,CL2_ILLUSTRATIVE_LOCALITY_PINS_R13])
   assert.ok(!prev[anchor],"R14 cannot shadow prior canonical marker");
 assert.ok(frozen[1].includes(pin.sourceId)&&frozen[2]===pin.name&&frozen[3]===pin.country);
 assert.ok(String(frozen[4]).includes(pin.addressNeedle));
 assert.equal(pin.sourceRef,"independent:r14-illustrative-rg1590b939a075");
 assert.equal(pin.lat,15.0804);assert.equal(pin.lng,120.64086);
 assert.equal(pin.precision,"locality");
 assert.equal(pin.reviewScope,"ILLUSTRATIVE_LOCALITY_POINT_NOT_WORSHIP_BUILDING_NOT_ENTRANCE");
 assert.ok(pin.evidence.length>=3&&pin.evidence.every(x=>x.startsWith("https://")));
 assert.ok(pin.searchAddress.includes("Perpetual Heights")&&!pin.searchAddress.includes("Camp Olivas"));
 assert.ok(pin.attribution.includes("Camp Olivas")&&pin.localityName.includes("entrance unverified"));
 assert.ok(site.map_publishable&&site.map_state==="PROVISIONAL"&&site.geo?.approximate);
 assert.equal(site.geo.lat,pin.lat);assert.equal(site.geo.lng,pin.lng);
 assert.equal(site.geo.precision,"locality");assert.match(site.geo.review_scope,/ILLUSTRATIVE_LOCALITY_POINT/);
 assert.match(site.status,/MASS UNVERIFIED/);assert.equal(site.affiliation_scope,"SOURCE_LABEL_ONLY");
 assert.equal(site.sections.length,0);assert.equal(site.celebration_evidence,undefined);
 assert.equal(site.actions.length,1);assert.equal(site.actions[0].label,"Search location");
 const u=new URL(site.actions[0].url);assert.equal(u.hostname,"www.google.com");assert.equal(u.pathname,"/maps/search/");
 const q=u.searchParams.get("query");
 assert.ok(q.includes(pin.name)&&q.includes(pin.searchAddress));
 assert.ok(!site.actions[0].url.includes("/maps/dir/"));
 assert.ok(!site.actions[0].url.includes(String(pin.lat)+","+String(pin.lng)));
}

const r15=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS_R15);
assert.equal(r15.length,1,"R15 one exact Excel approved named novitiate location");
assert.equal(r15[0][0],"RG-5276B75A8193");
for(const [anchor,pin] of r15){
 const frozen=origins.get(anchor),site=items.get(anchor);
 assert.ok(frozen&&site,"R15 must retain frozen CL2 site identity");
 for(const old of [CL2_ILLUSTRATIVE_LOCALITY_PINS,CL2_ILLUSTRATIVE_LOCALITY_PINS_R2,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R3,CL2_ILLUSTRATIVE_LOCALITY_PINS_R4,CL2_ILLUSTRATIVE_LOCALITY_PINS_R5,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R6,CL2_ILLUSTRATIVE_LOCALITY_PINS_R7,CL2_ILLUSTRATIVE_LOCALITY_PINS_R8,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R9,CL2_ILLUSTRATIVE_LOCALITY_PINS_R10,CL2_ILLUSTRATIVE_LOCALITY_PINS_R11,
  CL2_ILLUSTRATIVE_LOCALITY_PINS_R12,CL2_ILLUSTRATIVE_LOCALITY_PINS_R13,CL2_ILLUSTRATIVE_LOCALITY_PINS_R14])
   assert.ok(!old[anchor],"R15 cannot override previously pinned site");
 assert.ok(frozen[1].includes(pin.sourceId)&&pin.name===frozen[2]&&pin.country===frozen[3]);
 assert.ok(String(frozen[4]).includes(pin.addressNeedle));
 assert.equal(pin.sourceRef,"independent:r15-illustrative-rg5276b75a8193");
 assert.equal(pin.lat,10.8582625);assert.equal(pin.lng,122.557328125);
 assert.equal(pin.precision,"locality");
 assert.equal(pin.reviewScope,"ILLUSTRATIVE_LOCALITY_POINT_NOT_WORSHIP_BUILDING_NOT_ENTRANCE");
 assert.ok(pin.evidence.length>=3&&pin.evidence.every(u=>u.startsWith("https://")));
 assert.ok(pin.sourceUrl.includes("query_place_id=ChIJt71EQ2EdrzMRLoEpEm6kbS8"));
 assert.ok(pin.attribution.includes("VH54+8W4")&&pin.attribution.includes("7Q24VH54+8W4"));
 assert.ok(pin.localityName.includes("entrance unverified"));
 assert.ok(site.map_publishable&&site.map_state==="PROVISIONAL"&&site.geo?.approximate);
 assert.equal(site.geo.lat,pin.lat);assert.equal(site.geo.lng,pin.lng);assert.equal(site.geo.precision,"locality");
 assert.match(site.geo.review_scope,/ILLUSTRATIVE_LOCALITY_POINT/);
 assert.match(site.status,/MASS UNVERIFIED/);assert.equal(site.affiliation_scope,"SOURCE_LABEL_ONLY");
 assert.equal(site.sections.length,0);assert.equal(site.celebration_evidence,undefined);
 assert.equal(site.actions.length,1);assert.equal(site.actions[0].label,"Search location");
 const u=new URL(site.actions[0].url),q=u.searchParams.get("query");
 assert.equal(u.hostname,"www.google.com");assert.equal(u.pathname,"/maps/search/");
 assert.ok(q.includes(pin.name)&&q.includes(pin.searchAddress),"Search uses real name and original Purok/Barangay address");
 assert.ok(!site.actions[0].url.includes("/maps/dir/"),"No GPS directions for recovered plus code");
 assert.ok(!site.actions[0].url.includes(String(pin.lat)+","+String(pin.lng)),"Approximate point must not enter navigation URL");
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
 }else if(CL2_ILLUSTRATIVE_LOCALITY_PINS_R7[r.cl2_anchor]){
   assert.equal(r.status,"NO_SAFE_LOCALITY_CANDIDATE","R7 cannot override R1 identity holds");
   const pin=CL2_ILLUSTRATIVE_LOCALITY_PINS_R7[r.cl2_anchor];
   assert.ok(item?.map_publishable&&item.geo?.approximate);
   assert.equal(item.geo.lat,pin.lat);assert.equal(item.geo.lng,pin.lng);
   assert.ok(pin.sourceUrl.startsWith("https://"));
 }else if(CL2_ILLUSTRATIVE_LOCALITY_PINS_R8[r.cl2_anchor]){
   assert.equal(r.status,"NO_SAFE_LOCALITY_CANDIDATE","R8 does not override an R1 identity hold");
   const pin=CL2_ILLUSTRATIVE_LOCALITY_PINS_R8[r.cl2_anchor];
   assert.ok(item?.map_publishable&&item.geo?.approximate);
   assert.equal(item.geo.lat,pin.lat);assert.equal(item.geo.lng,pin.lng);
   assert.ok(pin.sourceUrl.startsWith("https://"));
 }else if(CL2_ILLUSTRATIVE_LOCALITY_PINS_R9[r.cl2_anchor]){
   assert.equal(r.status,"NO_SAFE_LOCALITY_CANDIDATE","R9 cannot override identity-hold source");
   const pin=CL2_ILLUSTRATIVE_LOCALITY_PINS_R9[r.cl2_anchor];
   assert.ok(item?.map_publishable&&item.geo?.approximate);
   assert.equal(item.geo.lat,pin.lat);assert.equal(item.geo.lng,pin.lng);
   assert.ok(pin.sourceUrl.startsWith("https://"));
 }else if(CL2_ILLUSTRATIVE_LOCALITY_PINS_R10[r.cl2_anchor]){
   assert.equal(r.status,"NO_SAFE_LOCALITY_CANDIDATE","R10 cannot override identity holds");
   const pin=CL2_ILLUSTRATIVE_LOCALITY_PINS_R10[r.cl2_anchor];
   assert.ok(item?.map_publishable&&item.geo?.approximate);
   assert.equal(item.geo.lat,pin.lat);assert.equal(item.geo.lng,pin.lng);
   assert.ok(pin.sourceUrl.startsWith("https://"));
 }else if(CL2_ILLUSTRATIVE_LOCALITY_PINS_R11[r.cl2_anchor]){
   assert.equal(r.status,"NO_SAFE_LOCALITY_CANDIDATE","R11 cannot override R1 identity hold");
   const pin=CL2_ILLUSTRATIVE_LOCALITY_PINS_R11[r.cl2_anchor];
   assert.ok(item?.map_publishable&&item.geo?.approximate);
   assert.equal(item.geo.lat,pin.lat);assert.equal(item.geo.lng,pin.lng);
   assert.ok(pin.sourceUrl.startsWith("https://"));
 }else if(CL2_ILLUSTRATIVE_LOCALITY_PINS_R12[r.cl2_anchor]){
   assert.equal(r.status,"NO_SAFE_LOCALITY_CANDIDATE","R12 cannot override R1 identity hold");
   const pin=CL2_ILLUSTRATIVE_LOCALITY_PINS_R12[r.cl2_anchor];
   assert.ok(item?.map_publishable&&item.geo?.approximate);
   assert.equal(item.geo.lat,pin.lat);assert.equal(item.geo.lng,pin.lng);
   assert.ok(pin.sourceUrl.startsWith("https://"));
 }else if(CL2_ILLUSTRATIVE_LOCALITY_PINS_R13[r.cl2_anchor]){
  const approvedPreviousStatus=r.cl2_anchor==="RG-CAE1B1B5608A"
   ?"HOLD_KNOWN_ALIAS_OR_IDENTITY_OR_CLOSED_SITE"
   :r.cl2_anchor==="RG-5EE981E628B6"?"HOLD_AMBIGUOUS_GAZETTEER_MATCH":null;
  assert.ok(approvedPreviousStatus,"No other historical identity hold may gain R13 geography");
  assert.equal(r.status,approvedPreviousStatus,"R13 explicitly resolves only these two researched source holds");
  const pin=CL2_ILLUSTRATIVE_LOCALITY_PINS_R13[r.cl2_anchor];
  assert.ok(item?.map_publishable&&item.geo?.approximate);
  assert.equal(item.geo.lat,pin.lat);assert.equal(item.geo.lng,pin.lng);
  assert.ok(pin.sourceUrl.startsWith("https://"));
 }else if(CL2_ILLUSTRATIVE_LOCALITY_PINS_R14[r.cl2_anchor]){
 assert.equal(r.cl2_anchor,"RG-1590B939A075","Only the Excel-approved Perpetual Heights historical site hold may be resolved in R14");
 assert.equal(r.status,"HOLD_AMBIGUOUS_GAZETTEER_MATCH");
 const pin=CL2_ILLUSTRATIVE_LOCALITY_PINS_R14[r.cl2_anchor];
 assert.ok(item?.map_publishable&&item.geo?.approximate);
 assert.equal(item.geo.lat,pin.lat);assert.equal(item.geo.lng,pin.lng);
 assert.ok(pin.sourceUrl.startsWith("https://"));
 }else if(CL2_ILLUSTRATIVE_LOCALITY_PINS_R15[r.cl2_anchor]){
 assert.equal(r.cl2_anchor,"RG-5276B75A8193","R15 cannot silently override any other historical identity hold");
 assert.equal(r.status,"HOLD_AMBIGUOUS_GAZETTEER_MATCH");
 const pin=CL2_ILLUSTRATIVE_LOCALITY_PINS_R15[r.cl2_anchor];
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
assert.equal(world.filter(x=>x.map_publishable).length,2552);
assert.equal(world.filter(x=>!x.map_publishable).length,30);
const first=items.get(pins[0][0]);
assert.match(renderTlmChurchProfile(first,"en"),/Illustrative town marker ONLY/);
assert.match(renderTlmChurchProfile(first,"en"),/Find church by name\/address on Google Maps/);
assert.match(renderTlmChurchProfile(first,"fr"),/Repère indicatif de la commune UNIQUEMENT/);
assert.match(renderTlmChurchProfile(first,"fr"),/Rechercher l’église par nom\/adresse sur Google Maps/);
console.log("PASS CL2 illustrative localities: 158 R1 plus 93 R2 plus 91 R3 plus 8 R4 plus 4 R5 plus 6 R6 Excel-approved, 4 R7 and 8 R8 and 4 R9 and 6 R10 and 8 R11 and 2 R12 and 2 R13 and 1 R14 and 1 R15 Excel-approved, 30 held/address-only; GPS routing blocked; frozen 2,582 identities and CL27 scope preserved");
