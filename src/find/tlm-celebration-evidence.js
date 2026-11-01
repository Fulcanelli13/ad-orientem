// A source-scoped publication overlay on the ONE CL2 physical-site Directory.
// No new Place, venue, ministry or schedule registry. Source documents assert
// use of particular liturgical books at SOME celebrations, not a whole church.
export const CL27_PUBLIC_CELEBRATION_URL=new URL(
  "../../data/directory/cl27-approved-celebration-evidence-20261102.v1.json",import.meta.url).href;
const T=v=>String(v??"").trim();
const HTTPS=u=>/^https:\/\/[a-z0-9.-]+\/[\S]+$/i.test(T(u));

export function attachPublishedCelebrationEvidence(items,manifest){
  if(manifest?.schema!=="AO_CL27_EXACT_CELEBRATION_EVIDENCE_RELEASE_V1"||
      manifest?.publication!=="EXACT_SOURCE_SCOPED_CELEBRATION_BOOK_WITNESSES"||
      !Array.isArray(manifest.records)||manifest.records.length!==2)
    throw new Error("Invalid CL27 celebration evidence publication manifest");
  const list=Array.isArray(items)?items:[];
  const used=new Set(),seen=new Set();
  const allowed=new Map();
  for(const claim of manifest.records){
    if(!/^V19:SJC-00[12]$/.test(T(claim.source_id))||
       !/^RG-[A-F0-9]{12}$/.test(T(claim.cl2_anchor))||
       !T(claim.venue_name)||claim.country!=="US"||
       !HTTPS(claim.source_url)||!/^20\d\d-\d\d-\d\d$/.test(T(claim.review_date))||
       claim.source_kind!=="PARISH_FIRST_PARTY"||
       claim.subject_scope!=="NAMED_CELEBRATION_PATTERN_NOT_WHOLE_VENUE"||
       claim.liturgical_use!=="ROMAN"||claim.missal_edition!=="1962"||
       !["label_en","label_fr","detail_en","detail_fr","exception_en","exception_fr"].every(k=>T(claim[k]))||
       seen.has(claim.source_id))
      throw new Error("Invalid or unsupported CL27 public claim: "+T(claim.source_id));
    seen.add(claim.source_id);allowed.set(claim.source_id,claim);
  }
  const result=list.map(item=>{
    const sourceIds=Array.isArray(item?.source_ids)?item.source_ids:[];
    const matches=sourceIds.filter(id=>allowed.has(id));
    if(!matches.length)return item;
    if(matches.length!==1)throw new Error("Ambiguous celebration-to-physical-site join");
    const claim=allowed.get(matches[0]);
    const sourcePresent=Array.isArray(item?.source_links)&&item.source_links.some(s=>s?.url===claim.source_url);
    if(item.physical_group_id!==claim.cl2_anchor||item.title!==claim.venue_name||
       !sourcePresent||used.has(claim.source_id)||item.kind!=="TLM_VENUE")
      throw new Error("CL27 source/physical-site publication identity mismatch: "+claim.source_id);
    used.add(claim.source_id);
    return Object.freeze({...item,celebration_evidence:Object.freeze({...claim}),
      // Exact, non-recurring source label aids search but is not a Mass time.
      search_text:String(item.search_text??"")+" source documented roman 1962 missal"});
  });
  if(used.size!==manifest.records.length)throw new Error("Unmatched CL27 public celebration source");
  return Object.freeze(result);
}
// This is an evidence filter, not a liturgical guarantee: selecting 1962
// means the ORIGINAL PARISH SOURCE lists at least one 1962 celebration.
export function tlmCelebrationEvidenceCounts(items=[]){
  const n=Array.isArray(items)?items.length:0;
  const known=(Array.isArray(items)?items:[]).filter(i=>
    i?.celebration_evidence?.subject_scope==="NAMED_CELEBRATION_PATTERN_NOT_WHOLE_VENUE"&&
    i.celebration_evidence.missal_edition==="1962").length;
  return Object.freeze({ALL:n,SOURCE_1962:known,NOT_ESTABLISHED:n-known});
}
export function tlmCelebrationEvidenceClass(item){
  const evidence=item?.celebration_evidence;
  return evidence?.subject_scope==="NAMED_CELEBRATION_PATTERN_NOT_WHOLE_VENUE"&&
    evidence.missal_edition==="1962"?"SOURCE_1962":"NOT_ESTABLISHED";
}
