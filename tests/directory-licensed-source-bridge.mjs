import assert from "node:assert/strict";
import {expandLicensedDirectoryFeed} from "../src/find/licensed-source-bridge.js";
import {loadDirectoryDataset,filterDirectoryRecords} from "../src/find/data-service.js";
import {projectDirectoryItems} from "../src/find/explore-projection.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
import {isMapPublishableGeo} from "../src/find/geo-provenance.js";

const grant={status:"GRANTED",granted_to:"AD_ORIENTEM_APP",
 grant_reference:"SIGNED-REUSE-GRANT-EXAMPLE",attribution:"Latin Mass Directory — licensed",
 grant_evidence_url:"https://example.org/authorizations/receipt"};
const items=[
 {source_id:"new-dublin",name:"St Columba Church",country_code:"IE",city:"Dublin",
  address:"9 Chapel Road, Dublin, Ireland",listing_url:"https://www.latinmassdir.org/venue/st-columba-dublin/"},
 {source_id:"existing-venue",name:"Another Name Same Street",country_code:"IE",city:"Dublin",
  address:"12 Chapel Road, Dublin, Ireland",listing_url:"https://www.latinmassdir.org/venue/existing/"},
 {source_id:"duplicate-name",name:"St Columba Church",country_code:"IE",city:"Dublin",
  address:"9 Chapel Road, Dublin, Ireland",listing_url:"https://www.latinmassdir.org/venue/duplicate/"},
 {source_id:"no-locality",name:"St Unknown",country_code:"IE",
  listing_url:"https://www.latinmassdir.org/venue/unknown/"},
 {source_id:"unsafe-url",name:"Chapel B",country_code:"FR",city:"Lyon",
  listing_url:"javascript:alert(1)"},
];
const existing=[{venue:{venue_id:"already-verified",name:{official:"Church at 12 Chapel Road"},
 address:{country_code:"IE",city:"Dublin",line1:"12 Chapel Road, Dublin, Ireland"}}}];
const feed={schema:"AO_LICENSED_DIRECTORY_FEED_V1",source_id:"LMD_AUTHORIZED",
 generated_at:"2026-10-09T14:00:00Z",permission:grant,records:items};

const unauthorized=expandLicensedDirectoryFeed({...feed,permission:{...grant,status:"PENDING"}},{existingRecords:existing});
assert.equal(unauthorized.records.length,0);
assert.equal(unauthorized.summary.license_status,"NOT_GRANTED");
const noEvidence=expandLicensedDirectoryFeed({...feed,permission:{...grant,grant_evidence_url:null}},{existingRecords:existing});
assert.equal(noEvidence.records.length,0);
const result=expandLicensedDirectoryFeed(feed,{existingRecords:existing});
assert.equal(result.summary.source_rows,5);
assert.equal(result.summary.listing_records,1);
assert.equal(result.summary.duplicate_holds,2);
assert.equal(result.summary.missing_identity_holds,1);
assert.equal(result.summary.invalid_url_holds,1);
const r=result.records[0];
assert.equal(r.venue.publication_state,"DIRECTORY_LISTED_UNVERIFIED");
assert.equal(r.ministries[0].schedules.length,0);
assert.equal(r.ministries[0].liturgical_usage.books,"UNKNOWN");
assert.equal(r.ministries[0].active,false);
assert.equal(r.sources[0].authority,"SECONDARY");
assert.equal(isMapPublishableGeo(r.venue.geo,"IE"),false);
assert.equal(filterDirectoryRecords([r],{day:"SUNDAY"}).length,0);
assert.equal(filterDirectoryRecords([r],{liturgy:"1962"}).length,0);
const projected=projectDirectoryItems([r]);
assert.equal(projected[0].status,"SCHEDULE UNVERIFIED");
assert.equal(projected[0].map_publishable,false);
assert.equal(projected[0].sections.length,0);
assert.equal(projected[0].actions.length,1);
assert.equal(projected[0].actions[0].label,"Open external listing");
assert.ok(!projected[0].actions.some(x=>x.label==="Directions"));
const html=renderExploreToString(buildExploreViewModel({items:projected,lens:"tlm",language:"en"}));
assert.match(html,/SCHEDULE UNVERIFIED/);
assert.match(html,/https:\/\/www\.latinmassdir\.org\/countries\//);
assert.match(html,/Other directories may have additional locations/);
assert.match(html,/https:\/\/www\.latinmass\.com\/find-latin-mass/);
assert.doesNotMatch(html,/<iframe[^>]*viewer\.mapme/);
assert.doesNotMatch(html,/Source-backed current directory record/);
const fr=renderExploreToString(buildExploreViewModel({items:[],lens:"tlm",language:"fr"}));
assert.match(fr,/annuaire mondial/);
const shrine=renderExploreToString(buildExploreViewModel({items:[],lens:"shrines",language:"en"}));
assert.doesNotMatch(shrine,/https:\/\/www\.latinmassdir\.org\/countries\//);

// Simulate the optional source feed without changing any checked-in research dataset.
const fakeFetch=async input=>{
 const u=String(input);
 if(u.includes("/licensed/approved-mass.v1.json"))return {ok:true,json:async()=>feed};
 return {ok:false,status:404};
};
const dataset=await loadDirectoryDataset({providers:[],researchProviders:[],fetchImpl:fakeFetch});
assert.equal(dataset.records.length,2);
assert.equal(dataset.licensedListingSummary.listing_records,2);
assert.equal(dataset.loadedProviders.includes("licensed-external-listings"),true);
assert.equal(dataset.records[0].venue.publication_state,"DIRECTORY_LISTED_UNVERIFIED");
assert.equal(dataset.records[0].venue.geo?.lat,null);
const empty=await loadDirectoryDataset({providers:[],researchProviders:[],fetchImpl:async()=>({ok:false,status:404})});
assert.equal(empty.records.length,0);
assert.equal(empty.complete,true);
const unauthorizedLoad=await loadDirectoryDataset({
 providers:[],researchProviders:[],
 fetchImpl:async input=>String(input).includes("/licensed/approved-mass.v1.json")
  ?{ok:true,json:async()=>({...feed,permission:{...grant,status:"PENDING"}})}
  :{ok:false,status:404},
});
assert.equal(unauthorizedLoad.records.length,0,"A disabled or invalid license must not render any user-facing locations");
const largeItems=Array.from({length:260},(_,i)=>({...projected[0],item_id:"tlm:synthetic-"+i}));
const preview=renderExploreToString(buildExploreViewModel({items:largeItems,lens:"tlm",language:"en"}));
assert.equal((preview.match(/data-explore-item="/g)||[]).length,120,"Large dataset must not create 260 DOM cards");
assert.match(preview,/data-find-show-more/);
assert.match(preview,/120 \/ 260/);
const more=renderExploreToString(buildExploreViewModel({items:largeItems,lens:"tlm",language:"en",displayLimit:240}));
assert.equal((more.match(/data-explore-item="/g)||[]).length,240);
assert.match(more,/240 \/ 260/);
const complete=renderExploreToString(buildExploreViewModel({items:largeItems,lens:"tlm",language:"en",displayLimit:360}));
assert.equal((complete.match(/data-explore-item="/g)||[]).length,260);
assert.doesNotMatch(complete,/data-find-show-more/);
console.log("Licensed source bridge: PASS — no grant no publication, no false Mass times or map pins, two-language link");
