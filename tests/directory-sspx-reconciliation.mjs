import assert from "node:assert/strict";
import {readFileSync,mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {buildCanonicalSspxDataset,runSspxImport} from "../tools/directory/import-sspx.mjs";
import {joinDirectoryRecords,publishableDirectoryRecords} from "../src/find/data-service.js";
import {buildFindViewModel,renderFindToString} from "../src/find/presentation.js";
import {applySspxAdjudications,SSPX_PUBLICATION_STATES} from "../tools/directory/lib/sspx-reconciliation.mjs";

const at="2026-10-08T06:30:00Z";
const base={
  crmId:"OPE-TEST-01",slug:"test-priory",name:"Test Priory",kind:"priory",
  alsoKinds:["chapel"],relationship:"fsspx",countryCode:"ZA",city:"Durban",
  address:{line1:"1 Old Street",city:"Durban",countryCode:"ZA"},
  lat:-29.9,lng:30.9,sundayMass:true,weekdayMass:true,
  url:"https://map.fsspx.org/en/places/test-priory",updatedAt:"2026-09-01T00:00:00Z",
  schedules:[{kind:"text",source:"global",payload:{raw:"Sunday Mass"}}],
};
const official=()=>({
  tier:"LOCAL_APOSTOLATE",
  url:"https://example.org/official-priory-bulletin",
  checked_on:"2026-10-08",
  effective_from:"2026-09-01",
  title:"Official local schedule",
});
const site=(key,name,street,state,mass)=>({
  key,name,venue_type:"chapel",state,
  address:{formatted:street+", Durban, South Africa",line1:street,city:"Durban",country_code:"ZA"},
  mass,
});
const saturday={raw:"Saturday 17:00, seasonal; check bulletin",cadence:"SEASONAL",exceptions:[]};
const regular={raw:"Sunday 08:30",cadence:"WEEKLY"};
const split={
  upstream_id:base.crmId,
  witness:official(),
  state:"HOUSE_WITH_PUBLIC_CHAPEL",
  physical_sites:[
    site("old-church","Sunday Church","12 Church Road","CURRENT_PUBLIC_MASS",regular),
    site("new-chapel","Weekday Chapel","29 New Road","CONDITIONAL_MASS",saturday),
  ],
};
const splitData=buildCanonicalSspxDataset([base],{retrievedAt:at,adjudications:[split]});
assert.equal(splitData.report.source_entity_count,1);
assert.equal(splitData.report.venue_count,3);
assert.equal(splitData.report.added_physical_site_count,2);
assert.equal(splitData.report.adjudicated_source_count,1);
assert.equal(splitData.report.find_publishable_venue_count,2);
assert.equal(splitData.report.geo_feature_count,0,"new physical addresses cannot inherit priory coordinates");
const parent=splitData.venues[0];
assert.equal(parent.publication_state,"HOUSE_WITH_PUBLIC_CHAPEL");
assert.equal(parent.address.line1,"1 Old Street");
assert.equal(parent.upstream.crm_id,base.crmId);
const churches=splitData.venues.slice(1);
assert.notEqual(churches[0].venue_id,churches[1].venue_id);
assert.equal(churches.every(v=>v.upstream.parent_source_id===base.crmId),true);
assert.equal(churches.every(v=>v.geo.lat===null),true);
assert.equal(churches[0].address.line1,"12 Church Road");
assert.equal(churches[1].address.line1,"29 New Road");
const published=publishableDirectoryRecords(joinDirectoryRecords({
  venues:splitData.venues,ministries:splitData.ministries,
  schedules:splitData.schedules,sources:splitData.sources,
}));
assert.equal(published.length,2,"only separately evidenced physical Mass sites should be publishable");
assert.equal(published.some(r=>r.venue.venue_id===parent.venue_id),false);
assert.equal(splitData.sources.some(s=>s.url===official().url),true);
assert.equal(splitData.schedules.filter(s=>s.service_type==="MASS").length,2);
assert.equal(splitData.schedules.some(s=>s.payload?.cadence==="SEASONAL"),true);
assert.equal(splitData.report.duplicate_upstream_id_count,0,
  "physical fan-out is not repeated-source duplication");

const global={
  upstream_id:base.crmId,
  witness:{...official(),tier:"INTERNATIONAL_OFFICIAL",url:base.url},
  state:"PROVIDER_HOUSE_ONLY",
};
const local={
  upstream_id:base.crmId,witness:official(),state:"CURRENT_PUBLIC_MASS",
  physical_address:{formatted:"100 Correct Road, Durban, South Africa",
    line1:"100 Correct Road",city:"Durban",country_code:"ZA"},
  mass:regular,
};
const override=buildCanonicalSspxDataset([base],{retrievedAt:at,adjudications:[global,local]});
assert.equal(override.venues[0].publication_state,"CURRENT_PUBLIC_MASS");
assert.equal(override.venues[0].address.line1,"100 Correct Road");
assert.equal(override.venues[0].geo.lat,null,"old address geocode must not survive physical relocation");
assert.equal(override.venues[0].upstream.previous_physical_address.line1,"1 Old Street");
assert.equal(override.report.adjudicated_source_count,1);
assert.equal(override.report.adjudication_exception_count,0);
const overridePublished=publishableDirectoryRecords(joinDirectoryRecords({
  venues:override.venues,ministries:override.ministries,
  schedules:override.schedules,sources:override.sources,
}));
const overrideHtml=renderFindToString(buildFindViewModel({records:overridePublished,language:"en"}));
assert.match(overrideHtml,/Sunday 08:30/);
assert.doesNotMatch(overrideHtml,/Sunday Mass/,
  "global source schedule assertion must not be displayed alongside locally reviewed Mass times");

assert.equal(publishableDirectoryRecords(joinDirectoryRecords({
  venues:override.venues,ministries:override.ministries,
  schedules:override.schedules,sources:override.sources,
})).length,1);

const olderLocal={...local,witness:{...official(),effective_from:"2026-01-01",effective_until:"2026-09-30"}};
const expired=buildCanonicalSspxDataset([base],{retrievedAt:at,adjudications:[olderLocal]});
assert.equal(expired.report.adjudication_exception_count,1);
assert.equal(expired.report.find_publishable_venue_count,0);
assert.equal(expired.venues[0].publication_state,"PENDING_CURRENT_EVIDENCE");

const conflicting={...local,physical_address:{...local.physical_address,line1:"101 Conflicting Road"}};
const ambiguous=buildCanonicalSspxDataset([base],{retrievedAt:at,adjudications:[local,conflicting]});
assert.equal(ambiguous.report.adjudication_exception_count,1);
assert.equal(ambiguous.venues[0].publication_state,"PENDING_CURRENT_EVIDENCE");

assert.throws(()=>buildCanonicalSspxDataset([base],{retrievedAt:at,adjudications:[
  {...local,mass:null},
]}),/specific Mass evidence/);
assert.throws(()=>buildCanonicalSspxDataset([base],{retrievedAt:at,adjudications:[
  {...local,witness:{...official(),tier:"SECONDARY"}},
]}),/secondary\/historical source/);
assert.throws(()=>buildCanonicalSspxDataset([base],{retrievedAt:at,adjudications:[
  {...split,physical_sites:[
    site("same","Chapel One","1 Chapel Road","CURRENT_PUBLIC_MASS",regular),
    site("same","Chapel Two","2 Chapel Road","CURRENT_PUBLIC_MASS",regular),
  ]},
]}),/repeated physical site key/);
const institutional=buildCanonicalSspxDataset([base],{retrievedAt:at,adjudications:[{
  upstream_id:base.crmId,witness:official(),state:"INSTITUTION_ONLY",
}]});
assert.equal(institutional.report.find_publishable_venue_count,0);
const staleWitness={...local,witness:{...official(),checked_on:"2026-01-01"}};
const staleData=buildCanonicalSspxDataset([base],{retrievedAt:at,adjudications:[staleWitness]});
assert.equal(staleData.report.find_publishable_venue_count,0,
  "unreviewed long-expired local verification must not publish a public Mass");
assert.equal(staleData.report.adjudication_exception_count,1);
assert.throws(()=>buildCanonicalSspxDataset([base],{retrievedAt:at,adjudications:[
  {...local,mass:{...regular,effective_from:"2026-11-01"}},
]}),/future-effective Mass/);
assert.throws(()=>buildCanonicalSspxDataset([base],{retrievedAt:at,adjudications:[
  {...local,mass:{...regular,effective_until:"2026-09-01"}},
]}),/expired Mass/);

const realManifest=JSON.parse(readFileSync(new URL("../data/directory/research/sspx-physical-adjudications.v1.json",import.meta.url),"utf8"));
assert.equal(realManifest.schema,"AO_DIRECTORY_SSPX_ADJUDICATIONS_V1");
const durbanDecision=realManifest.decisions.find(x=>x.upstream_id==="our-lady-of-the-holy-rosary-priory");
assert.ok(durbanDecision,"reviewed Durban physical sites must be retained");
const durban=buildCanonicalSspxDataset([{
  ...base,crmId:"OPE-MOCK-REAL-SLUG",slug:"our-lady-of-the-holy-rosary-priory",
  name:"Our Lady of the Holy Rosary Priory",
}],{retrievedAt:at,adjudications:[durbanDecision]});
assert.equal(durban.report.source_entity_count,1);
assert.equal(durban.report.venue_count,3);
assert.equal(durban.report.find_publishable_venue_count,2);
assert.equal(durban.report.adjudication_exception_count,0);
assert.equal(durban.venues[0].publication_state,"HOUSE_WITH_PUBLIC_CHAPEL");
assert.equal(durban.venues[1].address.line1,"12 Gumtree Avenue");
assert.equal(durban.venues[2].address.line1,"29 Abelia Road");
assert.equal(durban.venues[2].publication_state,"CONDITIONAL_MASS");
assert.equal(durban.schedules.some(x=>x.payload?.cadence==="IRREGULAR"),true);
assert.equal(durban.venues.slice(1).every(v=>v.geo.lat===null),true);
const school=buildCanonicalSspxDataset([{
  ...base,crmId:"OPE-SCHOOL",kind:"school",alsoKinds:[],
  sundayMass:false,weekdayMass:false,schedules:[],
}],{retrievedAt:at});
assert.equal(school.venues[0].publication_state,"INSTITUTION_ONLY");
const house=buildCanonicalSspxDataset([{
  ...base,crmId:"OPE-HOUSE",kind:"residence",alsoKinds:[],
  sundayMass:false,weekdayMass:false,schedules:[],
}],{retrievedAt:at});
assert.equal(house.venues[0].publication_state,"PROVIDER_HOUSE_ONLY");
const multiKind=buildCanonicalSspxDataset([{
  ...base,crmId:"OPE-MULTIFUNCTION",kind:"seminary",alsoKinds:["chapel"],
  sundayMass:false,weekdayMass:false,schedules:[],
}],{retrievedAt:at});
assert.equal(multiKind.venues[0].publication_state,"PENDING_CURRENT_EVIDENCE");
assert.equal(school.report.publication_state_counts.INSTITUTION_ONLY,1);
assert.equal(SSPX_PUBLICATION_STATES.length,8);
const mockUpstream=Array.from({length:107},(_,i)=>({
  crmId:"OPE-"+String(i+1).padStart(6,"0"),
  slug:"source-"+(i+1),
  relationship:i%5===0?"friend":"fsspx",
  kind:i%4===0?"priory":"mission",
  countryCode:i%2===0?"ZA":"CH",
}));
const mockFetch=async url=>{
  const u=new URL(url);
  const offset=Number(u.searchParams.get("offset")||0);
  const limit=Number(u.searchParams.get("limit")||1000);
  return {ok:true,json:async()=>({total:107,items:mockUpstream.slice(offset,offset+limit)})};
};
const out=mkdtempSync(join(tmpdir(),"ao-sspx-acquisition-"));
try{
  const acquisition=await runSspxImport({snapshotOnly:true,fetchImpl:mockFetch,
    pageSize:30,out,details:true});
  assert.equal(acquisition.upstream_total,107);
  assert.equal(acquisition.raw_snapshot_only,true);
  assert.equal(acquisition.publication_eligible_venues,0);
  assert.equal(acquisition.by_country.ZA,54);
  assert.equal(acquisition.by_country.CH,53);
  const raw=JSON.parse(readFileSync(join(out,"raw-source-inventory.v1.json"),"utf8"));
  assert.equal(raw.records.length,107);
  const saved=JSON.parse(readFileSync(join(out,"acquisition-report.v1.json"),"utf8"));
  assert.equal(saved.upstream_total,107);
  assert.equal(saved.by_relationship.fsspx,85);
  assert.throws(()=>readFileSync(join(out,"venues.v1.json"),"utf8"),/ENOENT/,
    "acquisition-only must never write runtime publication records");
}finally{
  rmSync(out,{force:true,recursive:true});
}
console.log("SSPX physical-venue adjudication and local override: PASS");
