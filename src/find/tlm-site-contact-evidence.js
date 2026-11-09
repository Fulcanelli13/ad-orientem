// Exact CL2 site contact overlay. This is NOT a Mass/schedule or ecclesial
// classification publisher, and it never creates a new Place or venue.
export const CL27_SITE_CONTACT_URL=new URL(
  "../../data/directory/cl27-site-contact-evidence-20261108.v1.json",import.meta.url).href;
const T=v=>String(v??"").trim();
const HTTPS=v=>/^https:\/\/[^\s<>"']+$/i.test(T(v));
const EXACT_COUNT=26;

export function attachPublishedSiteContactEvidence(items,manifest){
 if(manifest?.schema!=="AO_CL27_EXACT_SITE_CONTACT_RELEASE_V1"||
    manifest?.publication!=="EXACT_CL2_SITE_CONTACT_AND_SOURCE_RELATIONSHIP_ONLY"||
    !Array.isArray(manifest.records)||manifest.records.length!==EXACT_COUNT)
   throw new Error("Invalid CL27 exact-site contact publication manifest");
 const claims=new Map(),seenAnchors=new Set();
 for(const c of manifest.records){
   if(!/^RG-[A-F0-9]{12}$/.test(T(c.cl2_anchor))||
      !/^SSPXMAP:OPE-\d{6}$/.test(T(c.source_id))||
      c.country!=="FR"||!T(c.canonical_name)||!T(c.physical_description)||
      !HTTPS(c.existing_source_url)||!HTTPS(c.review_source_url)||
      !T(c.community_named_by_source)||!/^\+33 [0-9 ]{12,}$/.test(T(c.public_phone))||
      !T(c.note_en)||!T(c.note_fr)||!/^20\d\d-\d\d-\d\d$/.test(T(c.review_date))||
      c.source_role!=="PUBLISHED_SITE_AND_ASSOCIATED_COMMUNITY_NOT_OWNERSHIP"||
      c.publication_status!=="SITE_CONTACT_ONLY_NO_MASS_OR_ECCLESIAL_ASSERTION"||
      claims.has(c.source_id)||seenAnchors.has(c.cl2_anchor)||
      ["schedule","mass_times","una_cum","canonical_status","missal","owner","celebrant","gps"].some(k=>Object.hasOwn(c,k)))
      throw new Error("Unsupported CL27 site contact evidence: "+T(c.source_id));
   seenAnchors.add(c.cl2_anchor);claims.set(c.source_id,c);
 }
 const attached=new Set();
 const updated=(Array.isArray(items)?items:[]).map(item=>{
   const hits=Array.isArray(item?.source_ids)?item.source_ids.filter(id=>claims.has(id)):[];
   if(!hits.length)return item;
   if(hits.length!==1)throw new Error("Multiple site contact claims for one CL2 site");
   const c=claims.get(hits[0]);
   if(item.kind!=="TLM_VENUE"||item.physical_group_id!==c.cl2_anchor||
      item.country_code!==c.country||item.source_id!==c.source_id||
      item.source_location_description!==c.physical_description||
      !Array.isArray(item.source_links)||!item.source_links.some(s=>s?.url===c.existing_source_url)||
      attached.has(c.source_id))
     throw new Error("CL27 site contact identity/source mismatch: "+c.source_id);
   attached.add(c.source_id);
   return Object.freeze({...item,site_contact_evidence:Object.freeze({...c})});
 });
 if(attached.size!==EXACT_COUNT)throw new Error("Unmatched CL27 site contact evidence");
 return Object.freeze(updated);
}
