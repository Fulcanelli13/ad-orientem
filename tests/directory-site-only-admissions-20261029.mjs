import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  expandResearchProviderSnapshot,
  joinDirectoryRecords,
  publishableDirectoryRecords,
  filterDirectoryRecords,
} from "../src/find/data-service.js";
import { auditVenue } from "../src/find/contracts.js";
import { isMapPublishableGeo } from "../src/find/geo-provenance.js";
import { buildFindViewModel, renderFindToString } from "../src/find/presentation.js";
import { applyIndicativeSspxLocations, applyIndicativeOtherCommunities } from "../src/find/sspx-indicative-geo.js";

function readSnapshot(file){
  return JSON.parse(readFileSync(new URL("../data/directory/generated/v19/"+file,import.meta.url),"utf8"));
}
function publish(snapshot){
  const expanded=expandResearchProviderSnapshot(snapshot);
  return {expanded,records:publishableDirectoryRecords(joinDirectoryRecords(expanded))};
}
const poland=readSnapshot("sspx-oct26-poland.v1.json");
const diocesan=readSnapshot("diocesan.v1.json");
assert.equal(poland.records.length,39,"preserve 38 existing Polish records and add exactly one site");
assert.equal(new Set(poland.records.map(r=>r.u)).size,poland.records.length,"no duplicated Polish upstream IDs");
const additions=[
  {snapshot:poland,upstream:"SSPX-OCT26-PL-KRAKOW-KAPLICA-SW-PIUSA-X",anchor:"RG-CB2AF398310E",query:"Dąbka 10",city:"Kraków"},
  {snapshot:diocesan,upstream:"DIO-GB-EASTANGLIA-WITHERMARSH-GREEN-1962",anchor:"RG-163599BE4EDF",query:"Withermarsh",city:"Withermarsh Green"},
];
for(const item of additions){
  const count=item.snapshot.records.filter(r=>r.u===item.upstream).length;
  assert.equal(count,1,"source upstream ID must be unique: "+item.upstream);
  const raw=item.snapshot.records.find(r=>r.u===item.upstream);
  assert.equal(raw.ps,"SITE_ONLY_SOURCE_CONFIRMED");
  assert.equal(raw.soa,"FIRST_PARTY_SITE_APPROVED_2026_10_29");
  assert.equal(raw.rg,item.anchor);
  assert.equal(raw.sr,"","no new Mass timetable rows");
  assert.ok(raw.a&&raw.su.startsWith("https://"),"source and street address required");

  const {expanded,records}=publish(item.snapshot);
  const venueId="ao-research-"+item.snapshot.provider.toLowerCase().replace(/[^a-z0-9]+/g,"-")+"-"+item.upstream.toLowerCase().replace(/[^a-z0-9]+/g,"-");
  const record=records.find(r=>r.venue.upstream.upstream_id===item.upstream);
  assert.ok(record,"eligible source-certified site must appear in public Find");
  assert.equal(record.venue.venue_id,venueId,"stable provider identity, not speculative research ID");
  assert.equal(record.venue.upstream.research_group_ids,item.anchor);
  assert.deepEqual(auditVenue(record.venue),[]);
  assert.equal(record.venue.geo.lat,null);
  assert.equal(record.venue.geo.lng,null);
  assert.equal(isMapPublishableGeo(record.venue.geo,record.venue.address.country_code),false,"address-only venue must not become a map pin");
  const indicator=item.snapshot.provider==="SSPX_OCT26_POLAND"
    ?applyIndicativeSspxLocations([record]):applyIndicativeOtherCommunities([record]);
  assert.strictEqual(indicator.records[0],record,"indicative location pass must leave address-only entry untouched");
  assert.equal(isMapPublishableGeo(indicator.records[0].venue.geo,record.venue.address.country_code),false);
  assert.equal(record.ministries.length,1);
  assert.equal(record.ministries[0].schedules.length,0,"no uncertified schedule asserted");
  assert.equal(expanded.schedules.filter(s=>s.ministry_id===record.ministries[0].ministry_id).length,0);
  assert.equal(filterDirectoryRecords(records,{query:item.query}).filter(r=>r.venue.venue_id===venueId).length,1,"venue must be findable by address or place");
  assert.equal(filterDirectoryRecords(records,{query:item.city}).filter(r=>r.venue.venue_id===venueId).length,1,"venue must be findable by city");
  for(const [language,expectedText] of [["en","Mass times not verified"],["fr","Horaires de messe non vérifiés"]]){
    const listHtml=renderFindToString(buildFindViewModel({records:[record],language}));
    const detailHtml=renderFindToString(buildFindViewModel({records:[record],selectedId:venueId,language}));
    assert.ok(listHtml.includes(expectedText),"schedule uncertainty must appear in list: "+language);
    assert.ok(detailHtml.includes(expectedText),"schedule uncertainty must appear in detail: "+language);
    assert.ok(detailHtml.includes("data-find-close-detail"),"detail panel must remain functional");
  }

  const invalidApproval={...record,venue:{...record.venue,upstream:{...record.venue.upstream,site_only_approval:null}}};
  assert.equal(publishableDirectoryRecords([invalidApproval]).length,0,"unapproved site-only entry must fail closed");
  const inventedCoordinates={...record,venue:{...record.venue,geo:{lat:50,lng:20,precision:"building",geocoding_source:"OFFICIAL_SOURCE"}}};
  assert.equal(publishableDirectoryRecords([inventedCoordinates]).length,0,"site-only lane must reject pins");
  const inventedSchedule={...record,ministries:[{...record.ministries[0],schedules:[{service_type:"MASS",payload:{raw:"Sunday 10:00"}}]}]};
  assert.equal(publishableDirectoryRecords([inventedSchedule]).length,0,"site-only lane must reject timetable additions");
  const researchHeld={...record,venue:{...record.venue,publication_state:"RESEARCH_ONLY_NOT_PUBLIC"}};
  assert.equal(publishableDirectoryRecords([researchHeld]).length,0,"research hold still wins");
}
assert.equal(poland.records.filter(r=>r.ps==="SITE_ONLY_SOURCE_CONFIRMED").length,1);
assert.equal(diocesan.records.filter(r=>r.ps==="SITE_ONLY_SOURCE_CONFIRMED").length,1);
assert.equal(poland.records.filter(r=>r.u.includes("LIBERTOW")).length,1,"existing Libertów is not the distinct Kraków chapel");
assert.equal(diocesan.records.filter(r=>r.u==="DIO-GB-PORTSMOUTH-SOUTHAMPTON-HOLY-FAMILY").length,1,"existing Southampton unchanged");

console.log("Directory 41-certificate reconciliation: 39 existing static sites retained; 2 address-only additions; 0 new Mass times; 0 new pins");
