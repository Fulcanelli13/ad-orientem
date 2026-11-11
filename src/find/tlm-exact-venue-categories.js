/**
 * Exact-site first-party venue-category witnesses.
 * This improves category/visual selection, not the institute/celebrant,
 * Mass schedule, books, Una Cum, canonical or ecclesial classification.
 */
export const CL2_EXACT_VENUE_CATEGORY_WITNESSES_URL=new URL(
 "../../data/directory/cl2-exact-venue-category-witnesses-20261111.v1.json",import.meta.url).href;
const T=v=>String(v??"").trim();
const safeUrl=v=>/^https:\/\/[^\s<>"']+$/i.test(T(v)) &&
 !/(?:latinmassdir\.org|lms\.org\.uk|weekdaymasses\.org\.uk)/i.test(T(v));
const categoryLane=Object.freeze({
 DIOCESAN_OR_PARISH_CONTEXT:"DIOCESAN_PHOTO",
 RELIGIOUS_HOUSE:"EMBLEM_OR_NEUTRAL",
 MIXED_OR_HOST_RELATIONSHIP:"NEUTRAL",
 PRIESTLY_SOCIETY_OR_CLERGY:"EMBLEM_OR_NEUTRAL",
});
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function validateCL2ExactVenueCategoryWitnesses(index,manifest){
 if(manifest?.schema!=="AO_CL2_EXACT_VENUE_CATEGORY_WITNESS_V1"||
  manifest.scope!=="EXACT_SITE_VENUE_CONTEXT_NOT_MINISTRY_LITURGY_OR_CANONICAL_STATUS"||
  manifest.reviewed_on!=="2026-11-11"||
  manifest.source_index!=="data/directory/generated/cl2-physical-site-index.v1.json"||
  !Array.isArray(index?.records)||index.records.length!==2580||
  !Array.isArray(manifest.records)||manifest.records.length!==122)
   throw Error("Invalid CL2 exact venue category witness manifest");
 const indexByAnchor=new Map(index.records.map(r=>[r[0],r]));
 const seen=new Set(),byAnchor=new Map(),stats={reviewed_exact_venues:0,from_initial_unresolved:0,by_category:{}};
 for(const record of manifest.records){
  const id=T(record?.cl2_anchor),site=indexByAnchor.get(id),category=T(record?.category);
  if(!site||seen.has(id)||!Object.hasOwn(categoryLane,category)||
   record.visual_lane!==categoryLane[category]||
   !same(record.source_id,site[1][0])||record.exact_name!==site[2]||
   record.country!==site[3]||record.source_affiliation_label!==site[5]||
   !["Unclassified (LMD source)","UNVERIFIED_OPERATOR_LMS_DISCOVERY",""].includes(site[5])||
   !safeUrl(record.identity_evidence_url)||
   !["CURRENT_FIRST_PARTY_VENUE","DIOCESAN_NEWS_HISTORIC"].includes(record.evidence_basis)||
   record.role_scope!=="VENUE_CATEGORY_AND_REPORTED_RELATIONSHIP_ONLY"||
   !T(record.note)||!("related_ministry_hint" in record)||
   (record.related_ministry_hint!==null&&!/^[A-Z][A-Z0-9_]*$/.test(record.related_ministry_hint)))
   throw Error("Unsafe site-category witness: "+id);
  // A source page can identify a HOST or a COMMUNITY without authorising
  // ministry-wide Missal or claiming the institution owns the building.
  seen.add(id);byAnchor.set(id,Object.freeze(record));
  stats.reviewed_exact_venues++;stats.from_initial_unresolved++;
  stats.by_category[category]=(stats.by_category[category]??0)+1;
 }
 if(!same(stats,manifest.summary))throw Error("Mismatched exact venue witness census");
 return Object.freeze(byAnchor);
}
export function attachCL2ExactVenueCategoryWitnesses(items,index,manifest){
 const verified=validateCL2ExactVenueCategoryWitnesses(index,manifest);
 const attached=new Set();
 const result=(Array.isArray(items)?items:[]).map(item=>{
  const id=item?.physical_group_id, witness=verified.get(id);
  if(!witness)return item;
  if(item?.physical_site_source!=="CL2_MASTER"||
   item?.kind!=="TLM_VENUE"||!item.site_category||
   attached.has(id)||item.site_category.category!=="UNRESOLVED"||
   item.site_category.classification_basis!=="UNVERIFIED")
    throw Error("Venue witness does not match an unresolved physical site: "+id);
  attached.add(id);
  const site_category=Object.freeze({
   ...item.site_category,
   category:witness.category,visual_lane:witness.visual_lane,
   classification_basis:"EXACT_FIRST_PARTY_VENUE_WITNESS",
   original_category:"UNRESOLVED",
   verification_scope:"VENUE_CONTEXT_ONLY_NOT_MINISTRY_OR_LITURGY",
   evidence_url:witness.identity_evidence_url,
   evidence_basis:witness.evidence_basis,
   source_note:witness.note,
   // Group hint is only reported contextual identity. CL27 source-ID-exact
   // institutional_liturgy remains the sole institutional book inheritance.
   related_ministry_hint:witness.related_ministry_hint,
  });
  return Object.freeze({...item,site_category});
 });
 if(attached.size!==verified.size)throw Error("Missing exact venue-category attachment");
 return Object.freeze(result);
}
