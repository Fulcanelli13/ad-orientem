import assert from "node:assert/strict";
import { auditVenue } from "../src/find/contracts.js";
import {
  isHeldDirectoryPublication,
  publishableDirectoryRecords,
  expandResearchProviderSnapshot,
} from "../src/find/data-service.js";

function completeRecord(overrides={}) {
  return {
    venue: {
      venue_id:"ao-existing-test",
      name:{official:"Igreja São José Operário"},
      address:{line1:"Rua Teste 123",city:"Barra Mansa",country_code:"BR",formatted:"Rua Teste 123, Barra Mansa, BR"},
      geo:{lat:null,lng:null,precision:"unknown",geocoding_source:null},
      upstream:{provider:"DIOCESAN"},
      ...overrides,
    },
    ministries:[],
    sources:[],
  };
}
function published(record) {
  return publishableDirectoryRecords([record]).length;
}

// This demonstrates why auditVenue alone was inadequate:
const completeHeld=completeRecord({publication_state:"RESEARCH_ONLY_NOT_PUBLIC"});
assert.deepEqual(auditVenue(completeHeld.venue),[]);
assert.equal(isHeldDirectoryPublication(completeHeld),true);
assert.equal(published(completeHeld),0);

// Research flags must win even with a full, otherwise publishable venue:
for(const state of [
  "RESEARCH_ONLY_NOT_PUBLIC",
  "research only not public",
  "HOLD_NOT_PUBLIC_APPROVED",
  "HOLD_FOR_BUILDING_REVIEW",
  "B88_SOURCE_ONLY_NEW_ID",
  "DRAFT_PIN",
  "STAGING_FOR_GEOCODING",
  "PROVISIONAL_PHYSICAL_SITE",
  "UNVERIFIED_RECURRING_MASS",
  "OFFICIAL_LISTED_MASS_TIMES_UNCONFIRMED",
  "NOT_FOR_PUBLICATION",
  "PUBLICATION_HOLD",
  "NO_PUBLIC_MAP_PIN",
  "INTERNAL_ONLY",
]) {
  const record=completeRecord({publication_state:state});
  assert.equal(published(record),0,state);
}
assert.equal(published(completeRecord({research_only:true})),0);
assert.equal(published({...completeRecord(),research_only:true}),0);
assert.equal(published({...completeRecord(),publication_state:"HOLD_NOT_PUBLIC_APPROVED"}),0);
assert.equal(published(completeRecord({
  upstream:{provider:"AO_B91_RESEARCH_ONLY"},
  publication_state:"CURRENT_PUBLIC_MASS",
})),0,"research provider can never override hold with published state");

// Existing publicly listed records lacking publication_state must remain
// available: do not inadvertently remove the already live AASJMV feed.
for(const status of [undefined,null,"CURRENT_PUBLIC_MASS","CONDITIONAL_MASS"]) {
  const item=completeRecord({publication_state:status});
  assert.equal(isHeldDirectoryPublication(item),false,String(status));
  assert.equal(published(item),1,String(status));
}

// Regression using a real-shaped upstream AO AASJMV research provider record:
const previousAasjmv=expandResearchProviderSnapshot({
  schema:"AO_DIRECTORY_RESEARCH_PROVIDER_V1",
  provider:"AASJMV",
  defaults:{
    c:"AASJMV",f:"ROMAN",b:"1962",mf:"TRADITIONAL_LATIN",
    rel:"served_by",su:"https://oratoriosaojosebh.org/comunidades-atendidas/",
  },
  records:[{
    u:"AASJMV-EXT-001",cc:"BR",l:"Belo Horizonte",
    n:"Capela do Oratório São José",
    a:"Rua Aiuruoca 148, Belo Horizonte, MG",
    sr:"DAILY",su:"https://oratoriosaojosebh.org/comunidades-atendidas/",
  }],
});
const legacy={
  venue:previousAasjmv.venues[0],
  ministries:previousAasjmv.ministries.map(m=>({
    ...m,schedules:previousAasjmv.schedules,
  })),
  sources:previousAasjmv.sources,
};
assert.equal(published(legacy),1,"existing AASJMV source unexpectedly suppressed");
assert.equal(published({
  ...legacy,
  venue:{...legacy.venue, publication_state:"RESEARCH_ONLY_NOT_PUBLIC"},
}),0,"held version of an existing provider unexpectedly published");

console.log("B94 Find publication hold: 20+ positive/negative cases passed");
