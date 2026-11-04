// 160 Excel-approved illustrative CL2 locality positions: no GPS-coordinate navigation,
// no venue identity merges and no current Mass or ecclesial status inferred.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS} from "../src/find/cl2-illustrative-locality-pins.js";
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
assert.equal(audit.counts.eligible,160);
assert.equal(audit.counts.identity_holds,10);
assert.equal(audit.counts.excel_exact_preferred,8);
assert.equal(audit.counts.remaining_after_eligible,275);
const excelPreciseHolds=audit.records.filter(r=>r.status==="HOLD_EXCEL_APPROVED_PRECISE_SITE_PREFERRED");
assert.equal(excelPreciseHolds.length,8);
assert.ok(excelPreciseHolds.every(r=>r.excel_preferred_geometry?.evidence_url?.startsWith("https://")));
assert.equal(audit.records.filter(r=>r.status==="HOLD_EXCEL_IDENTITY_AMBIGUITY").length,1);
assert.equal(audit.counts.ambiguous,8);
assert.equal(audit.counts.no_safe_match,249);
assert.equal(audit.counts.current_published_map_pins,2147);
const pins=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS);
assert.equal(pins.length,160);
assert.equal(new Set(pins.map(([id])=>id)).size,160);
const origins=new Map(index.records.map(r=>[r[0],r]));
const items=new Map(world.map(item=>[item.physical_group_id,item]));
const approvals=audit.records.filter(r=>r.status==="APPROVED_ILLUSTRATIVE_PIN_EXCEL_STAGED_PENDING_RELEASE_GATE");
assert.equal(approvals.length,160);
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
const withheld=audit.records.filter(r=>r.status!=="ELIGIBLE_ILLUSTRATIVE_PIN_PENDING_RELEASE_GATE");
assert.equal(withheld.length,275);
for(const r of withheld){
 assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS[r.cl2_anchor]);
 const item=items.get(r.cl2_anchor);
 assert.ok(item&&!item.map_publishable&&!item.geo,"Held records must not gain a pin");
}
for(const anchor of [
 "RG-50082C65DA56", // Sheffield St Joseph identity unresolved in Excel
 "RG-50BE1A7B5F18","RG-5B65864A842D","RG-605CC195A1EF",
 "RG-8EC1B37099D3","RG-A164E7D0C229","RG-A504818C84DC",
 "RG-B10417F7A69D","RG-D7C8B7693CEC",
])assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS[anchor],"Excel-held exact-site/identity candidate must never be downgraded to locality: "+anchor);
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS["RG-615FF6835AAE"],"Poprad city identity conflict must remain held");
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS["RG-2C84B50B3667"],"Bootle closed-site hold");
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS["RG-0DCEDA190517"],"Reading church identity hold");
assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS["RG-B65-77C86C7B3EC4"],"Cagliari Santa Croce potential alias already mapped");
assert.equal(world.length,2582);
assert.equal(world.filter(x=>x.map_publishable).length,2307);
assert.equal(world.filter(x=>!x.map_publishable).length,275);
const first=items.get(pins[0][0]);
assert.match(renderTlmChurchProfile(first,"en"),/Illustrative town marker ONLY/);
assert.match(renderTlmChurchProfile(first,"en"),/Find church by name\/address on Google Maps/);
assert.match(renderTlmChurchProfile(first,"fr"),/Repère indicatif de la commune UNIQUEMENT/);
assert.match(renderTlmChurchProfile(first,"fr"),/Rechercher l’église par nom\/adresse sur Google Maps/);
console.log("PASS CL2 illustrative localities: 160 Excel-approved provisional, 275 held/address-only; precise GPS routing blocked; frozen 2,582 identity and CL27 scope preserved");
