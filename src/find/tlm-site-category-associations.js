/**
 * TLM Atlas category census for all canonical CL2 physical sites.
 *
 * Category = context reported by the source, not verified building ownership.
 * Exact institute ministry evidence lives in institutional_liturgy, with its
 * own source-ID join and liturgical norm; never infer current priest, Una Cum,
 * rite or Missal from this category census.
 */
export const CL2_SITE_CATEGORY_MATRIX_URL=new URL(
 "../../data/directory/cl2-source-site-category-matrix-20261111.v1.json",import.meta.url).href;
const CATEGORIES=new Set([
 "DIOCESAN_OR_PARISH_CONTEXT","PRIESTLY_SOCIETY_OR_CLERGY","RELIGIOUS_HOUSE",
 "LAY_ASSOCIATION_OR_LOCAL_GROUP","MIXED_OR_HOST_RELATIONSHIP",
 "DIRECTORY_GROUP_ONLY","UNRESOLVED",
]);
const BASES=new Set(["SOURCE_REPORTED","DIRECTORY_NOT_OPERATOR","UNVERIFIED"]);
const VISUALS=new Set(["DIOCESAN_PHOTO","EMBLEM_OR_NEUTRAL","NEUTRAL"]);
const KEYS=["literal_source_affiliation","category","classification_basis",
 "reported_group_hint","visual_lane"];
const T=x=>String(x??"").trim();
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

export function validateCL2SiteCategoryMatrix(index,matrix){
 if(index?.schema!=="AO_CL2_PHYSICAL_SITE_RUNTIME_INDEX_V1"||
  !Array.isArray(index.records)||index.records.length!==2580||
  matrix?.schema!=="AO_CL2_SOURCE_SITE_CATEGORY_MATRIX_V1"||
  matrix?.scope!=="SOURCE_LABEL_CONTEXT_NOT_VERIFIED_VENUE_OWNERSHIP_MINISTRY_OR_CELEBRANT"||
  matrix?.source_index!=="data/directory/generated/cl2-physical-site-index.v1.json"||
  !same(matrix?.columns,KEYS)||!Array.isArray(matrix.rows))
   throw Error("Invalid CL2 site-category manifest");
 const keys=new Set(),byLabel=new Map();
 for(const row of matrix.rows){
  if(!Array.isArray(row)||row.length!==5||typeof row[0]!=="string"||
    !CATEGORIES.has(row[1])||!BASES.has(row[2])||
    (row[3]!==null&&(!/^[A-Z][A-Z0-9_]*$/.test(row[3])))||
    !VISUALS.has(row[4])||keys.has(row[0]))
    throw Error("Duplicate or malformed source-label category");
  if((row[1]==="UNRESOLVED")!==(row[2]==="UNVERIFIED")||
    (row[1]==="DIRECTORY_GROUP_ONLY")!==(row[2]==="DIRECTORY_NOT_OPERATOR")||
    (row[1]==="DIOCESAN_OR_PARISH_CONTEXT")!==(row[4]==="DIOCESAN_PHOTO")||
    (row[2]!=="SOURCE_REPORTED"&&row[3]!==null))
    throw Error("Unsafe source-label category or visual policy");
  keys.add(row[0]);byLabel.set(row[0],row);
 }
 const actual={site_total:0,exact_source_ministry_sites:1335,
   by_category:{},by_basis:{},unresolved_or_directory_group_only:0,
   distinct_labels:byLabel.size};
 const seen=new Set();
 for(const row of index.records){
  const label=row?.[5],anchor=row?.[0],sourceIds=row?.[1];
  if(typeof label!=="string"||!T(anchor)||seen.has(anchor)||
    !Array.isArray(sourceIds)||!sourceIds.length||!byLabel.has(label))
    throw Error("Unmapped or duplicate physical site category: "+anchor);
  seen.add(anchor);actual.site_total++;
  const [,category,basis]=byLabel.get(label);
  actual.by_category[category]=(actual.by_category[category]??0)+1;
  actual.by_basis[basis]=(actual.by_basis[basis]??0)+1;
  if(category==="UNRESOLVED"||category==="DIRECTORY_GROUP_ONLY")
    actual.unresolved_or_directory_group_only++;
 }
 if(actual.site_total!==2580||byLabel.size!==140||
   !same(actual,matrix.summary))
   throw Error("CL2 category census no longer reconciles with source index");
 return Object.freeze(byLabel);
}

export function attachCL2SiteCategories(items,index,matrix){
 const lookup=validateCL2SiteCategoryMatrix(index,matrix);
 const byAnchor=new Map(index.records.map(row=>[row[0],row]));
 const seen=new Set();let joined=0;
 const mapped=(Array.isArray(items)?items:[]).map(item=>{
  if(item?.physical_site_source!=="CL2_MASTER")return item;
  const anchor=item.physical_group_id,source=byAnchor.get(anchor);
  if(!source||seen.has(anchor)||item.kind!=="TLM_VENUE"||
     item.site_category||!Array.isArray(item.source_ids)||
     !same(item.source_ids,source[1]))
   throw Error("CL2 category source identity mismatch: "+anchor);
  seen.add(anchor);
  const [label,category,basis,hint,visual]=lookup.get(source[5]);
  const direct=item?.institutional_liturgy?.scope==="SOURCE_MINISTRY"
    ?item.institutional_liturgy.ministries:[];
  if(!Array.isArray(direct))throw Error("Invalid source-scoped ministry evidence");
  if(direct.length)joined++;
  const site_category=Object.freeze({
    category,source_label:label||null,source_scope:"CL2_SOURCE_REPORTED_NOT_VENUE_OWNERSHIP",
    classification_basis:basis,
    reported_group_hint:hint,
    verified_ministry_groups:Object.freeze([...new Set(direct.map(x=>x.institute_id))]),
    ministry_evidence:direct.length?"EXACT_SOURCE_MINISTRY":"NOT_VERIFIED_BY_THIS_CENSUS",
    visual_lane:visual,
  });
  return Object.freeze({...item,site_category});
 });
 if(seen.size!==2580||![0,1335].includes(joined))
  throw Error("Incomplete CL2 site category attachment");
 return Object.freeze(mapped);
}
