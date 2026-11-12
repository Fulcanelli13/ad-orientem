import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {directoryVenueVisualPolicy,directoryVenueMapGroup} from "../src/find/tlm-venue-visual-policy.js";
import {eligibleRenderedDirectoryImage,renderDirectoryVenueCard,renderDirectoryIdentityFallback,
 renderDirectoryGallery} from "../src/find/directory-card.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
import {exploreMapFeatures} from "../src/find/map-runtime.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
import {attachCL2SiteCategories} from "../src/find/tlm-site-category-associations.js";
import {attachCL2ExactVenueCategoryWitnesses} from "../src/find/tlm-exact-venue-categories.js";

const image={place_id:"place:GB:source-exact",status:"APPROVED",
 asset_path:"assets/approved/place-media/GB-verified.webp",
 credit:"Church photographer",license:"CC0-1.0",
 license_url:"https://creativecommons.org/publicdomain/zero/1.0/",
 source_url:"https://commons.wikimedia.org/wiki/File:Verified-Church.jpg",
 derivative_sha256:"a".repeat(64),
 rights_verified:true,subject_verified:true,crop_reviewed:true,
 alt_en:"Source-matched church",alt_fr:"Église identifiée",
};
const galleryImage={...image,asset_path:"assets/approved/place-gallery/GB-nave.webp",
 media_role:"INTERIOR",label_en:"Nave",label_fr:"Nef"};
const venue={item_id:"tlm:test:1",source_id:"test:1",physical_site_source:"CL2_MASTER",
 physical_group_id:"RG-SOURCE-TEST",kind:"TLM_VENUE",lens:"tlm",title:"St Example",
 subtitle:"Village · GB",eyebrow:"FSSP",community_id:"FSSP",place_id:image.place_id,
 cover_media:image,gallery_media:[galleryImage],sections:[],
 map_publishable:true,geo:{lat:52,lng:-1},status:"SCHEDULE UNVERIFIED"};
const category=(type,lane,more={})=>({source_scope:"CL2_SOURCE_REPORTED_NOT_VENUE_OWNERSHIP",
 classification_basis:"SOURCE_REPORTED",category:type,visual_lane:lane,...more});
const diocesan={...venue,site_category:category("DIOCESAN_OR_PARISH_CONTEXT",
 "DIOCESAN_PHOTO",{reported_group_hint:null})};
const society={...venue,site_category:category("PRIESTLY_SOCIETY_OR_CLERGY",
 "EMBLEM_OR_NEUTRAL",{reported_group_hint:"FSSP"})};
const religious={...venue,community_id:"OTHER",eyebrow:"Unclassified (LMD source)",
 site_category:category("RELIGIOUS_HOUSE","EMBLEM_OR_NEUTRAL",{
 classification_basis:"EXACT_FIRST_PARTY_VENUE_WITNESS",reported_group_hint:null,
 related_ministry_hint:"BENEDICTINE"})};
const host={...venue,site_category:category("MIXED_OR_HOST_RELATIONSHIP","NEUTRAL",{
 reported_group_hint:null})};
const held={...venue,eyebrow:"CMRI DIRECTORY (affiliation of celebrant not inferred)",
 site_category:category("DIRECTORY_GROUP_ONLY","NEUTRAL",{
 classification_basis:"DIRECTORY_NOT_OPERATOR",reported_group_hint:null})};
const unresolved={...venue,eyebrow:"UNVERIFIED_OPERATOR_LMS_DISCOVERY",
 site_category:category("UNRESOLVED","NEUTRAL",{
 classification_basis:"UNVERIFIED",reported_group_hint:null})};
assert.equal(directoryVenueVisualPolicy(diocesan).photoAllowed,true);
assert.equal(directoryVenueVisualPolicy(diocesan).emblem,null);
assert.equal(directoryVenueMapGroup(diocesan),"DIOCESAN");
assert.equal(eligibleRenderedDirectoryImage(image,diocesan),true);
assert.match(renderDirectoryVenueCard(diocesan),/GB-verified\.webp/);
assert.doesNotMatch(renderDirectoryVenueCard(diocesan),/FSSP_emblem/);
assert.match(renderTlmChurchProfile(diocesan),/GB-verified\.webp/);
assert.doesNotMatch(renderTlmChurchProfile(diocesan),/FSSP_emblem/);
assert.match(renderDirectoryGallery(diocesan),/GB-nave\.webp/);

for(const v of [society,religious,host,held,unresolved]){
 assert.equal(directoryVenueVisualPolicy(v).photoAllowed,false);
 assert.equal(eligibleRenderedDirectoryImage(image,v),false);
 assert.doesNotMatch(renderDirectoryVenueCard(v),/GB-verified\.webp/);
 assert.doesNotMatch(renderTlmChurchProfile(v),/GB-verified\.webp/);
 assert.equal(renderDirectoryGallery(v),"");
 const vm=buildExploreViewModel({language:"en",lens:"tlm",items:[v],
   view:"map",selectedId:v.item_id,filters:{directoryGroup:"ALL"}});
 const html=renderExploreToString(vm);
 assert.doesNotMatch(html,/GB-verified\.webp/);
 assert.match(html,/aoTlmVenueIdentity--preview/);
}
// Source-exact Directory covers are building evidence, not operator evidence.
 // They must display even for an SSPX house or an unresolved source category;
 // unrelated Place photographs above remain blocked for those same records.
const exactVenuePhoto={...image,place_id:undefined,venue_id:venue.source_id,
 asset_path:"assets/approved/directory-media/GB-source-exact.webp"};
for(const v of [society,held,unresolved]){
 const exact={...v,cover_media:exactVenuePhoto};
 assert.equal(eligibleRenderedDirectoryImage(exactVenuePhoto,exact),true);
 assert.match(renderDirectoryVenueCard(exact,"en"),/GB-source-exact\.webp/);
 assert.match(renderDirectoryVenueCard(exact,"fr"),/GB-source-exact\.webp/);
 assert.match(renderTlmChurchProfile(exact,"fr"),/GB-source-exact\.webp/);
}
assert.equal(eligibleRenderedDirectoryImage({...exactVenuePhoto,venue_id:"wrong-site"},society),false);
assert.equal(eligibleRenderedDirectoryImage({...exactVenuePhoto,status:"CANDIDATE"},society),false);

assert.match(renderDirectoryVenueCard(society),/data-visual-kind="emblem"/);
assert.match(renderDirectoryVenueCard(society),/FSSP_emblem/);
assert.equal(directoryVenueMapGroup(society),"FSSP");
assert.match(renderDirectoryVenueCard(religious),/Order-wide symbol/);
assert.equal(directoryVenueMapGroup(religious),"BENEDICTINE");
assert.match(renderDirectoryVenueCard(host),/Shared \/ hosted venue/);
assert.doesNotMatch(renderDirectoryVenueCard(host),/FSSP_emblem/);
assert.equal(directoryVenueMapGroup(host),"OTHER");
assert.match(renderDirectoryVenueCard(held),/Directory-listed venue/);
assert.doesNotMatch(renderDirectoryIdentityFallback(held),/FSSP_emblem/);
assert.equal(directoryVenueMapGroup(held),"OTHER");
assert.equal(directoryVenueMapGroup(unresolved),"OTHER");

const witnessed={...religious,site_category:{...religious.site_category,
 category:"PRIESTLY_SOCIETY_OR_CLERGY",related_ministry_hint:"ICKSP"}};
assert.match(renderDirectoryVenueCard(witnessed),/Institute_of_Christ_the_King/);
assert.equal(directoryVenueMapGroup(witnessed),"ICKSP");
const unverifiableGroup={...society,site_category:{...society.site_category,
 reported_group_hint:null}};
assert.doesNotMatch(renderDirectoryVenueCard(unverifiableGroup),/FSSP_emblem/);
assert.equal(directoryVenueMapGroup(unverifiableGroup),"OTHER");
const legacy={...venue}; // old installed data lacks the classification overlay
assert.equal(eligibleRenderedDirectoryImage(image,legacy),true);
assert.match(renderDirectoryVenueCard(legacy),/GB-verified\.webp/);
assert.equal(directoryVenueMapGroup(legacy),"FSSP");

const featureItems=[diocesan,society,host,religious].map((v,i)=>({
 ...v,item_id:"tlm:test:"+i,geo:{lat:52+i*.01,lng:-1-i*.01},
}));
const features=exploreMapFeatures(featureItems);
assert.deepEqual(features.map(x=>x.properties.provider_group),
 ["DIOCESAN","FSSP","OTHER","BENEDICTINE"]);

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const index=read("data/directory/generated/cl2-physical-site-index.v1.json");
const matrix=read("data/directory/cl2-source-site-category-matrix-20261111.v1.json");
const witnesses=read("data/directory/cl2-exact-venue-category-witnesses-20261111.v1.json");
const items=index.records.map(r=>({
 kind:"TLM_VENUE",physical_site_source:"CL2_MASTER",
 physical_group_id:r[0],source_ids:r[1],community_id:"OTHER",
}));
const classified=attachCL2ExactVenueCategoryWitnesses(
 attachCL2SiteCategories(items,index,matrix),index,witnesses);
const counts={DIOCESAN_PHOTO:0,EMBLEM_OR_NEUTRAL:0,NEUTRAL:0};
for(const v of classified){
 const p=directoryVenueVisualPolicy(v);
 assert.ok(p.lane in counts,"All 2580 published CL2 sites require a determined visual lane");
 counts[p.lane]++;
}
assert.deepEqual(counts,{DIOCESAN_PHOTO:762,EMBLEM_OR_NEUTRAL:1506,NEUTRAL:312});
console.log("PASS 2580 TLM venue visual lanes: 762 photo, 1506 emblem/neutral, 312 neutral; card, preview, profile, gallery and map agree");
