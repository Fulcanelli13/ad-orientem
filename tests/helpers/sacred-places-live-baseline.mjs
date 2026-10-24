import {readFileSync} from "node:fs";

const read = path => JSON.parse(readFileSync(new URL("../../"+path,import.meta.url),"utf8"));
export const LEDGER = read("data/geography/sacred-places-live-release-chain.v1.json");
export const RELEASES = LEDGER.releases.map(({id,manifest})=>({id,path:manifest,data:read(manifest)}));
const fields=["places","sources","heritage_crosswalk","places_without_direct_claim","geo_areas","directory_place_links"];
const historical={...LEDGER.starting_point};
const label={places:"places",sources:"sources",heritage_crosswalk:"crosswalk",places_without_direct_claim:"unlinked",geo_areas:"geo_areas",directory_place_links:"directory_links"};
let current={...historical};
for(const release of RELEASES){
 const {baseline,proposed}=release.data;
 if(!baseline || !proposed)throw new Error(release.id+" lacks explicit baseline/proposed counts");
 for(const field of fields){
  const key=label[field];
  const before=baseline[key] ?? (field==="sources"?baseline.source_registry:field==="heritage_crosswalk"?baseline.heritage_crosswalk:field==="places_without_direct_claim"?baseline.unlinked:field==="geo_areas"?baseline.geographic_areas:field==="directory_place_links"?baseline.directory_place_links:undefined);
  const after=proposed[key] ?? (field==="sources"?proposed.source_registry:field==="heritage_crosswalk"?proposed.heritage_crosswalk:field==="places_without_direct_claim"?proposed.unlinked:field==="geo_areas"?proposed.geographic_areas:field==="directory_place_links"?proposed.directory_place_links:undefined);
  if(before!==current[field]||!Number.isInteger(after)||after<0)
   throw new Error(release.id+" broken frozen chain for "+field+": expected "+current[field]+", received "+before+" -> "+after);
  current[field]=after;
 }
}
export const LIVE=Object.freeze({...current,unlinked:current.places_without_direct_claim,areas:current.geo_areas,links:current.directory_place_links});
export const BASE=Object.freeze(historical);
export const CURRENT_RELEASE_PLACE_IDS=Object.freeze(RELEASES.flatMap(r=>(r.data.published_new||[]).map(x=>x.place_id)));
