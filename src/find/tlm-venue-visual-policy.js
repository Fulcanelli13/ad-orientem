/**
 * The site-category overlay chooses the hero treatment; it does not establish
 * a property's legal owner, an individual celebrant, Mass books or Una Cum.
 *
 * Exact-site classification is deliberately distinct from the institute
 * ministry table. A ministry may be hosted at a diocesan church; its crest
 * belongs beside the ministry record, not in place of the church photograph.
 */
import {massInstitutionEmblem} from "./institution-emblems.js";

const LANES=new Set(["DIOCESAN_PHOTO","EMBLEM_OR_NEUTRAL","NEUTRAL"]);
const SOURCE_NAMED=new Set(["PRIESTLY_SOCIETY_OR_CLERGY","RELIGIOUS_HOUSE"]);
const T=s=>String(s??"").trim();
const frozen=o=>Object.freeze(o);

export function directoryVenueVisualPolicy(item){
 const category=item?.site_category;
 const lane=T(category?.visual_lane);
 // An older installed snapshot may not have the optional site-category overlay.
 // Retain its existing media experience rather than treating legacy data as
 // verified or silently stripping every previously approved photograph.
 if(!LANES.has(lane)){
  const group=T(item?.community_id).toUpperCase();
  return frozen({lane:"LEGACY",photoAllowed:true,emblem:massInstitutionEmblem(group),
   emblemGroup:group,allowNamed:true,category:"LEGACY",sourceBasis:"LEGACY"});
 }
 const type=T(category?.category);
 const basis=T(category?.classification_basis);
 if(lane==="DIOCESAN_PHOTO"){
  return frozen({lane,photoAllowed:true,emblem:null,emblemGroup:null,
   allowNamed:false,category:type,sourceBasis:basis});
 }
 if(lane==="NEUTRAL"||!SOURCE_NAMED.has(type)){
  return frozen({lane:"NEUTRAL",photoAllowed:false,emblem:null,emblemGroup:null,
   allowNamed:false,category:type,sourceBasis:basis});
 }
 // Emblem selection must be source-explicit. Generic Directory memberships,
 // verified ministry at a hosted church and URL provenance alone are not
 // institute-operator evidence. For exact site witnesses, use only their
 // separately documented related-community hint.
 const sourceGroup=basis==="EXACT_FIRST_PARTY_VENUE_WITNESS"
   ?T(category?.related_ministry_hint).toUpperCase()
   :basis==="SOURCE_REPORTED"?T(category?.reported_group_hint).toUpperCase():"";
 const emblem=sourceGroup?massInstitutionEmblem(sourceGroup):null;
 return frozen({lane,photoAllowed:false,emblem,emblemGroup:emblem?sourceGroup:null,
  allowNamed:basis==="SOURCE_REPORTED"||basis==="EXACT_FIRST_PARTY_VENUE_WITNESS",
  category:type,sourceBasis:basis});
}

export function directoryVenueMapGroup(item){
 const policy=directoryVenueVisualPolicy(item);
 // For a legacy/non-CL2 item preserve the pre-category map group.
 if(policy.lane==="LEGACY")return T(item?.community_id).toUpperCase()||"OTHER";
 if(policy.lane==="DIOCESAN_PHOTO")return "DIOCESAN";
 return policy.emblemGroup||"OTHER";
}
