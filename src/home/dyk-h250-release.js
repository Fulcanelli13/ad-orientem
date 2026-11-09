// Source-scoped H250 heritage records; never reinterpret UNESCO sites as Roman 1962 rubrics.
const SOURCE=new URL("../../data/did-you-know/dyk-h250-unesco-sacred-geography-25-publication.v1.json",import.meta.url);
const SCHEMA="AO_DYK_H250_UNESCO_SACRED_GEOGRAPHY_25_PUBLICATION_V1";
const SITES=Object.freeze({
 RAVENNA:{number:788,title:"Early Christian Monuments of Ravenna",count:4},
 CHILOE:{number:971,title:"Churches of Chiloé",count:4},
 ASSISI:{number:990,title:"Assisi, the Basilica of San Francesco and Other Franciscan Sites",count:3},
 GOA:{number:234,title:"Churches and Convents of Goa",count:3},
 WIES:{number:271,title:"Pilgrimage Church of Wies",count:3},
 SANTIAGO:{number:868,title:"Routes of Santiago de Compostela in France",count:3},
 CONGONHAS:{number:334,title:"Sanctuary of Bom Jesus do Congonhas",count:3},
 GUARANI:{number:275,title:"Jesuit Missions of the Guaranis",count:2}
});
const clean=v=>typeof v==="string"?v.trim():"";
function validDate(value){
 if(typeof value!=="string"||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value))return false;
 const date=new Date(value+"T12:00:00Z");
 return Number.isFinite(date.valueOf())&&date.toISOString().slice(0,10)===value;
}
let request=null;
export function loadDyk250Release(win=globalThis){
 if(request)return request;
 request=Promise.resolve().then(()=>win.fetch(SOURCE,{cache:"no-store"})).then(r=>{
  if(!r?.ok)throw Error("DYK_H250_UNAVAILABLE");
  return r.json();
 }).catch(error=>{request=null;throw error;});
 return request;
}
export function dyk250Candidates(data,date){
 if(!validDate(date)||data?.schema!==SCHEMA||data.release_stage!=="APPROVED_PARTIAL_LIVE"||
    data.counts?.total!==25||!Array.isArray(data.records)||data.records.length!==25)return [];
 for(const [site,config] of Object.entries(SITES))
  if(data.counts?.[site.toLowerCase()]!==config.count)return [];
 const ids=new Set(),sources=new Set(),counts=new Map();
 return data.records.filter(row=>{
  const site=SITES[row?.site_id],copy=row?.pilot_home_copy,source=row?.source;
  if(!site||!/^DYK-H250-S-0(?:0[1-9]|1[0-9]|2[0-5])$/.test(row?.id||"")||
    ids.has(row.id)||!/^UNESCO[.]WHC[.][0-9]+[.]H250[.][A-Z0-9_]+$/.test(row?.source_id||"")||
    sources.has(row.source_id))return false;
  ids.add(row.id);sources.add(row.source_id);
  const n=(counts.get(row.site_id)||0)+1;counts.set(row.site_id,n);
  const url="https://whc.unesco.org/en/list/"+site.number;
  const locator="UNESCO World Heritage Centre: "+site.title+" · Outstanding Universal Value · Brief synthesis";
  return n<=site.count&&row.source_family==="UNESCO_WORLD_HERITAGE_CENTRE"&&
   row.topic==="CHRISTIAN_SACRED_GEOGRAPHY"&&row.heritage_property===site.title&&
   row.publication_kind==="SOURCE_SCOPED_HERITAGE"&&
   row.historical_local_only===true&&row.liturgical_rubric_1962===false&&
   clean(row.region_scope).length>35&&row.region_scope.includes("1962")&&
   row.editorial_approval===true&&
   row.approval_scope==="SOURCE_VERIFIED_COPY_ONLY_NOT_OWNER_HANDED_ART"&&
   row.semantic_novelty_reviewed===true&&row.release_authorized===true&&
   row.published===true&&copy?.final_english_signoff===true&&
   copy?.final_french_signoff===true&&
   clean(copy.en).length>70&&clean(copy.fr).length>70&&
   source?.url===url&&source.type==="html"&&
   source.page_identifier===String(site.number)&&
   source.primary_locator===locator&&source.original_text_checked===true&&
   source.deep_link_checked===true&&source.source_record_id===row.source_id;
 });
}
export function dyk250Model(data,id,date,language="en"){
 const row=dyk250Candidates(data,date).find(x=>x.id===id);
 if(!row)return null;
 const fr=language==="fr",src=row.source;
 return Object.freeze({id:row.id,language:fr?"fr":"en",
  fact:row.pilot_home_copy[fr?"fr":"en"],
  label:fr?"Géographie sacrée · Patrimoine documenté":"Sacred geography · Documented heritage",
  sourceId:row.source_id,sourceUrl:src.url,
  links:[{page:null,url:src.url,label:fr?"Consulter la source UNESCO":"Read UNESCO heritage source"}],
  published:true});
}
