// Read-only bridge from the existing R49 map feed into the ONE CL2 physical-site
// registry. Not activated in Find. Does not approve map pins, current Mass times,
// specific celebrants, ecclesial status, Una Cum or any venue-wide liturgical book.
import {validateR49Snapshot} from "./preliminary-directory-r49.js";

const SCHEMA="AO_CL27_R49_EXACT_CL2_CROSSWALK_RESEARCH_V1";
const UNKNOWN="UNKNOWN";

export function projectR49PhysicalGroupsFromCL2(r49, crosswalk) {
  validateR49Snapshot(r49);
  if(crosswalk?.schema!==SCHEMA || crosswalk?.public_use!=="RESEARCH_ONLY_NOT_AN_APP_IMPORT")
    throw new Error("Missing canonical CL2 research crosswalk");
  const pins=crosswalk.r49_to_cl2_source_scope;
  const sites=crosswalk.represented_physical_anchors;
  if(!Array.isArray(pins)||pins.length!==1879||!Array.isArray(sites)||sites.length!==1844)
    throw new Error("CL2 crosswalk does not match frozen R49 baseline");
  const pinById=new Map();
  for(const row of pins) {
    if(row.identity_join!=="EXACT_FROZEN_SOURCE_ID_AND_GROUP"||
       row.cl2_source_id!==row.r49_pin_id || !row.cl2_physical_anchor_id ||
       row.scope!=="SOURCE_MINISTRY_ONLY_NOT_SITE_OR_CELEBRATION" ||
       row.classification_public_approval!==false ||
       row.mass_schedule_public_approval!==false || pinById.has(row.r49_pin_id))
      throw new Error("Unsafe crosswalk source-scope identity or classification");
    pinById.set(row.r49_pin_id,row);
  }
  const byAnchor=new Map();
  for(const r49pin of r49.records) {
    const [id,name,country,,,,lat,lon]=r49pin;
    const match=pinById.get(id);
    if(!match||match.venue_name!==name||match.country!==country ||
       match.r49_coordinate?.[0]!==lat||match.r49_coordinate?.[1]!==lon)
      throw new Error("R49 pin source has no exact CL2 identity and coordinate agreement: "+id);
    const anchor=match.cl2_physical_anchor_id;
    if(!byAnchor.has(anchor))byAnchor.set(anchor,[]);
    byAnchor.get(anchor).push(Object.freeze({
      source_id:id, historical_group_id:match.cl2_historical_group_id,
      name,country,coordinates:Object.freeze([lat,lon]),
      institute_norm_reference:match.institute_id_with_CL2_inherited_norm,
      source_ministry_liturgical_use:match.source_ministry_liturgical_use,
      source_ministry_missal_edition:match.source_ministry_missal_edition,
      source_ministry_claim_grade:match.source_ministry_claim_grade,
      direct_owner_missal_witness:match.direct_1962_source_witness,
      classification_scope:"SOURCE_MINISTRY_ONLY_NOT_SITE_OR_CELEBRATION",
      current_schedule_verified:false,classification_public_approval:false
    }));
  }
  if(byAnchor.size!==1844)throw new Error("CL2 physical anchor parity failed");
  const grouped=sites.map(site=>{
    const members=byAnchor.get(site.anchor_id);
    if(!members||members.length!==site.pin_count ||
       site.multiple_pin_sources!==(members.length>1) ||
       site.representative_pin_selected!==false ||
       site.physical_site_rite!==UNKNOWN||site.physical_site_missal!==UNKNOWN ||
       JSON.stringify(site.source_pin_ids)!==
          JSON.stringify(members.map(x=>x.source_id).sort()))
      throw new Error("R49 physical anchor not joined without loss: "+site.anchor_id);
    const coords=new Set(members.map(x=>x.coordinates.join(",")));
    if(site.coordinates_identical!==(coords.size===1))
      throw new Error("Duplicate R49 geometry disagreement: "+site.anchor_id);
    return Object.freeze({
      anchor_id:site.anchor_id,
      country:members[0].country,
      ministry_sources:Object.freeze(members),
      distinct_source_count:members.length,
      coordinates_identical:site.coordinates_identical,
      coordinate_review_required:coords.size!==1,
      possible_shared_building:members.length>1,
      // No marker selected, no classification copied onto venue.
      marker_location:null,
      venue_wide_liturgical_use:UNKNOWN,
      venue_wide_missal_edition:UNKNOWN,
      una_cum:UNKNOWN,
      publication_gate:"RESEARCH_ONLY_EXPLICIT_APPROVAL_REQUIRED"
    });
  });
  const duplicates=grouped.filter(g=>g.possible_shared_building);
  const conflicting=duplicates.filter(g=>g.coordinate_review_required);
  const counts=crosswalk.counts;
  if(duplicates.length!==35||conflicting.length!==8||
     counts.exact_source_and_group_id_links!==1879||
     counts.physical_anchors_not_in_R49!==735||
     counts.newly_published_pins!==0||
     counts.newly_published_classifications!==0||
     counts.newly_published_mass_times!==0)
    throw new Error("CL2 research-only source gate / duplicate audit mismatch");
  return Object.freeze(grouped);
}
