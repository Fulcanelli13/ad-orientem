/** CL27 ministry-scoped institutional Roman/1962 inheritance.
 * Bulk-reconciled from the checksum-frozen CL2 research master. Identity
 * evidence and inference IDs are INTERNAL, not church-card footnotes.
 * No site-wide Missal, current Mass or Una Cum is ever certified here.
 */
export const CL27_INSTITUTIONAL_LITURGY_URL=new URL(
 "../../data/directory/cl27-institutional-ministry-liturgy-20261110.v1.json",import.meta.url).href;
const EXPECTED=Object.freeze({
 FSSP:"https://www.fssp.org/en/decree-of-pope-francis-confirming-the-use-of-the-1962-liturgical-books/",
 ICKSP:"https://institute-christ-king.org/institute/traditional-latin-mass",
 IBP:"https://www.institutdubonpasteur.org/my-blog/articles-et-etudes/le-charisme-liturgique-de-linstitut-du-bon-pasteur-dans-le-droit-de-leglise/",
 SSPX:"https://sspx.org/en/why-sspx-uses-1962-missal-30158",
 AASJMV:"https://oratoriosaojosebh.org/legislacao/"
});
const T=v=>String(v??"").trim();
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const APPROVED_COUNT=1389;
const APPROVED_SITES=1306;
const SITE_COUNT=2580;
const HELD_COUNT=3;
const FROZEN_ROWS_HASH="fnv1a32:8f919f52";
const recordFingerprint=rows=>{
 let h=2166136261;
 for(const ch of JSON.stringify(rows)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}
 return "fnv1a32:"+(h>>>0).toString(16).padStart(8,"0");
};
const forbid=new Set(["una_cum","canonical_status","ecclesial_position","pope_named_in_canon",
 "ownership","celebrant","current_mass","mass_schedule","rrule","rubrical_basis"]);
const containsForbidden=obj=>obj&&typeof obj==="object"&&
 [...forbid].some(k=>Object.hasOwn(obj,k));
export function validateInstitutionalMinistryNormManifest(manifest){
 if(manifest?.schema!=="AO_CL27_INSTITUTIONAL_MINISTRY_LITURGY_V1"||
   manifest.scope!=="EXACT_CL2_SOURCE_MINISTRY_INHERITANCE_NOT_VENUE_WIDE_OR_CURRENT_MASS_CERTIFICATION"||
   manifest.created_on!=="2026-11-10"||
   manifest?.counts?.physical_sites!==SITE_COUNT||
   manifest?.counts?.source_ministry_joins!==APPROVED_COUNT||
   manifest?.counts?.distinct_physical_sites!==APPROVED_SITES||
   manifest?.counts?.held_group_disagreements!==HELD_COUNT||
   manifest?.upstream?.research_branch!=="data/cl2-unified-source-location-classification-20261026"||
   !Array.isArray(manifest.rules)||manifest.rules.length!==5||
   !Array.isArray(manifest.records)||manifest.records.length!==APPROVED_COUNT||
   manifest.records_fingerprint!==FROZEN_ROWS_HASH||
   recordFingerprint(manifest.records)!==FROZEN_ROWS_HASH||
   !Array.isArray(manifest.holds)||manifest.holds.length!==HELD_COUNT)
  throw Error("Invalid CL27 source-ministry norm census");
 const byRule=new Map();
 for(const rule of manifest.rules){
  const id=T(rule?.institute_id);
  if(!Object.hasOwn(EXPECTED,id)||byRule.has(id)||rule.scope!=="MINISTRY"||
   rule.status!=="INFERRED_INSTITUTIONAL"||
   rule.evidence_rule_id!=="CL2-INST-"+id+"-ROMAN-1962"||
   !Array.isArray(rule.assertions)||rule.assertions.length!==2||
   !same(rule.assertions.map(a=>a.field),["liturgical_use","missal_edition"])||
   rule.assertions[0].value!=="ROMAN"||rule.assertions[1].value!=="1962"||
   rule.assertions.some(a=>a.subject_scope!=="MINISTRY"||
     a.evidence_url!==EXPECTED[id]||containsForbidden(a))||
   containsForbidden(rule))throw Error("Invalid or modified institute-level liturgical rule "+id);
  byRule.set(id,rule);
 }
 if(byRule.size!==5)throw Error("Missing institute norms");
 const seen=new Set(),byAnchor=new Map(),counts={FSSP:0,ICKSP:0,IBP:0,SSPX:0,AASJMV:0};
 for(const line of manifest.records){
  if(!Array.isArray(line)||line.length!==3)throw Error("Malformed CL27 source-ministry record");
  const [anchor,source,institute]=line;
  if(!/^RG-(?:B\d{2}-)?[A-F0-9]{12}$/.test(T(anchor))||!T(source)||!byRule.has(institute)||
   seen.has(anchor+"|"+source))throw Error("Invalid or duplicated CL2 source ID");
  seen.add(anchor+"|"+source);
  counts[institute]++;
  const group=byAnchor.get(anchor)??[];
  group.push(Object.freeze({source_id:source,institute_id:institute}));
  byAnchor.set(anchor,group);
 }
 if(byAnchor.size!==APPROVED_SITES||Object.keys(counts).some(k=>counts[k]!==manifest.counts.by_institute?.[k]))
  throw Error("Changed institute/site/source classification totals");
 const heldSources=new Set();
 for(const hold of manifest.holds){
  if(!T(hold?.source_id)||seen.has(hold.research_anchor+"|"+hold.source_id)||
    heldSources.has(hold.source_id)||hold.reason!=="RESEARCH_TO_LIVE_CL2_ANCHOR_DISAGREES_HOLD"||
    !byRule.has(hold.institute_id)||hold.research_anchor===hold.live_anchor)
    throw Error("Unresolved alias/source conflict was promoted");
  heldSources.add(hold.source_id);
 }
 return Object.freeze(byAnchor);
}
export function attachInstitutionalMinistryLiturgy(items,manifest){
 const groups=validateInstitutionalMinistryNormManifest(manifest);
 const attached=new Set(),result=[];
 for(const item of Array.isArray(items)?items:[]){
  const group=groups.get(item?.physical_group_id);
  if(!group){result.push(item);continue}
  if(attached.has(item.physical_group_id)||item.kind!=="TLM_VENUE"||
    item.physical_site_source!=="CL2_MASTER"||
    !Array.isArray(item.source_ids)||item.institutional_liturgy||
    group.some(m=>!item.source_ids.includes(m.source_id)))
    throw Error("Failed exact site/source ministry link for "+item.physical_group_id);
  attached.add(item.physical_group_id);
  const grouped=new Map();
  for(const row of group){
   const ids=grouped.get(row.institute_id)??[];
   ids.push(row.source_id);
   grouped.set(row.institute_id,ids);
  }
  const ministries=[...grouped].map(([institute_id,source_ids])=>
    Object.freeze({institute_id,liturgical_use:"ROMAN",missal_edition:"1962",
      subject_scope:"SOURCE_MINISTRY_NOT_WHOLE_VENUE",source_ids:Object.freeze(source_ids),
      evidence_state:"INFERRED_INSTITUTIONAL",rule_id:"CL2-INST-"+institute_id+"-ROMAN-1962"}));
  result.push(Object.freeze({...item,institutional_liturgy:Object.freeze({
    scope:"SOURCE_MINISTRY",ministries:Object.freeze(ministries)
  })}));
 }
 if(attached.size!==APPROVED_SITES)throw Error("Missing 1306 exact CL2 physical site relationships");
 return Object.freeze(result);
}
// A record describes an institute's usual liturgical books, NOT the current
// physical venue, another celebrant, a scheduled Mass or its status.
export function institutionalRiteMissal(item){
 const i=item?.institutional_liturgy;
 if(item?.physical_site_source!=="CL2_MASTER"||i?.scope!=="SOURCE_MINISTRY"||
  !Array.isArray(i.ministries)||!Array.isArray(item.source_ids))return null;
 const valid=i.ministries.filter(m=>
  Object.hasOwn(EXPECTED,T(m.institute_id))&&
  m.subject_scope==="SOURCE_MINISTRY_NOT_WHOLE_VENUE"&&
  m.evidence_state==="INFERRED_INSTITUTIONAL"&&
  m.rule_id==="CL2-INST-"+m.institute_id+"-ROMAN-1962"&&
  m.liturgical_use==="ROMAN"&&m.missal_edition==="1962"&&
  Array.isArray(m.source_ids)&&m.source_ids.length>0&&
  m.source_ids.every(source=>item.source_ids.includes(source)));
 return valid.length&&valid.length===i.ministries.length?Object.freeze(valid):null;
}
