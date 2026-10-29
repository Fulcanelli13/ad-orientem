// An optional, source-bound indoor site feature for an existing relic.
// This is NOT an indoor map coordinate, live placement, or authentication.
export const RELIC_PLACEMENT_SCHEMA="AO_RELIC_INDOOR_PLACEMENT_V1";
const kinds=new Set(["CHAPEL","SIDE_CHAPEL","TREASURY_CHAPEL","CRYPT","BELOW_ALTAR","ALTAR","TRANSEPT_CHAPEL","ADJACENT_ROOM","EXHIBITION_LEVEL","RELICS_CHAPEL"]);
const secure=x=>typeof x==="string"&&/^https:\/\/[^\s]+$/.test(x);
const label=x=>typeof x==="string"&&x.trim().length>=5&&x.trim().length<=180;

/** An exact relic ID + exact Place ID match is mandatory.
 * Never infer the object position from a building's type, string matching,
 * another saint's tomb, or the position of a photo. */
export function resolveRelicIndoorPlacement(collection, relicId, placeId){
  if(collection?.schema!==RELIC_PLACEMENT_SCHEMA||
     collection?.status!=="PUBLISHED_SOURCE_ATTRIBUTED_LOCATIONS_NOT_LIVE_INDOOR_NAVIGATION"||
     !/^relic:[A-Z]{2}:[\p{L}0-9-]+$/u.test(relicId||"")||
     !/^place:[A-Z]{2}:[a-z0-9-]+$/.test(placeId||""))return null;
  const entries=Array.isArray(collection.entries)?collection.entries:[];
  const matching=entries.filter(x=>x?.relic_id===relicId);
  // Even contradictory duplicate IDs are rejected; no first-match wins.
  if(matching.length!==1)return null;
  const item=matching[0];
  if(item.place_id!==placeId||item.verification!=="CUSTODIAN_SOURCE_DESCRIBED"||
     item.source_scope!=="INDOOR_SITE_FEATURE"||
     !kinds.has(item.placement_kind)||!label(item.location_en)||
     !label(item.location_fr)||!secure(item.source_url)||
     !["CHECK_WITH_CUSTODIAN","TEMPORARY_CLOSURE_ANNOUNCED_2026_04_16"].includes(item.access_state)||
     (item.access_state!=="CHECK_WITH_CUSTODIAN"&&!secure(item.access_source_url)))return null;
  return Object.freeze({
    location_en:item.location_en,
    location_fr:item.location_fr,
    placement_kind:item.placement_kind,
    source_url:item.source_url,
    access_state:item.access_state,
    access_source_url:item.access_source_url||null,
    qualification:"SOURCE_DESCRIBED_POSITION_NO_INDOOR_NAVIGATION",
  });
}
