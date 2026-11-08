// H225 historical liturgies publication gate: source-scoped records only.
// This is not a directory of contemporary 1962 Roman rubrics.
const SOURCE=new URL("../../data/did-you-know/dyk-h225-world-liturgies-25-publication.v1.json",import.meta.url);
const SCHEMA="AO_DYK_H225_WORLD_LITURGIES_25_PUBLICATION_V1";
const FAMILIES=Object.freeze({
 AMBROSIAN:{code:"01394a",title:"Ambrosian Liturgy and Rite",count:4},
 MOZARABIC:{code:"10611a",title:"Mozarabic Rite",count:4},
 DOMINICAN:{code:"13064b",title:"Rites",count:4},
 CARTHUSIAN:{code:"03388a",title:"The Carthusian Order",count:3},
 MARONITE:{code:"09683c",title:"Maronites",count:3},
 EAST_SYRIAN:{code:"14413a",title:"East Syrian Rite",count:2},
 ARMENIAN:{code:"13078a",title:"Rites in the United States",count:3},
 CELTIC:{code:"03493a",title:"The Celtic Rite",count:2}
});
const clean=x=>typeof x==="string"?x.trim():"";
const validDate=x=>{
 if(typeof x!=="string"||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(x))return false;
 const dt=new Date(x+"T12:00:00Z");
 return !Number.isNaN(dt.getTime())&&dt.toISOString().slice(0,10)===x;
};
let pending=null;
export function loadDyk225Release(win=globalThis){
 if(pending)return pending;
 pending=Promise.resolve().then(()=>win.fetch(SOURCE,{cache:"no-store"})).then(response=>{
  if(!response?.ok)throw Error("DYK_H225_UNAVAILABLE");
  return response.json();
 }).catch(err=>{pending=null;throw err;});
 return pending;
}
export function dyk225Candidates(data,date){
 if(!validDate(date)||data?.schema!==SCHEMA||data.release_stage!=="APPROVED_PARTIAL_LIVE"||
    data.counts?.total!==25||!Array.isArray(data.records)||data.records.length!==25)return [];
 for(const [name,config] of Object.entries(FAMILIES)){
  if(data.counts?.[name.toLowerCase()]!==config.count)return [];
 }
 const ids=new Set(),sources=new Set(),familyCounts=new Map();
 return data.records.filter(row=>{
  const id=row?.id||"",source=row?.source,copy=row?.pilot_home_copy;
  const family=FAMILIES[row?.tradition],url=family&&"https://www.newadvent.org/cathen/"+family.code+".htm";
  if(!/^DYK-H225-R-0(?:0[1-9]|1[0-9]|2[0-5])$/.test(id)||ids.has(id)||
    !/^CE1912[.]H225[.][A-Z0-9_]+$/.test(row?.source_id||"")||sources.has(row.source_id)||!family)return false;
  ids.add(id);sources.add(row.source_id);
  const n=(familyCounts.get(row.tradition)||0)+1;familyCounts.set(row.tradition,n);
  return n<=family.count&&row.source_family==="CATHOLIC_ENCYCLOPEDIA_HISTORICAL"&&
   row.topic==="HISTORICAL_LITURGICAL_VARIANT"&&row.publication_kind==="SOURCE_SCOPED_HISTORICAL"&&
   row.historical_local_only===true&&row.liturgical_rubric_1962===false&&
   clean(row.region_scope).length>35&&/1962/.test(row.region_scope)&&
   row.editorial_approval===true&&row.semantic_novelty_reviewed===true&&
   row.release_authorized===true&&row.published===true&&
   copy?.final_english_signoff===true&&copy?.final_french_signoff===true&&
   clean(copy.en).length>70&&clean(copy.fr).length>70&&
   source?.url===url&&source.type==="html"&&source.deep_link_checked===true&&
   source.original_text_checked===true&&source.source_record_id===row.source_id&&
   Array.isArray(source.pdf_pages_1based)&&source.pdf_pages_1based.length===0&&
   clean(source.primary_locator).startsWith("Catholic Encyclopedia: "+family.title+" · ");
 });
}
export function dyk225Model(data,id,date,language="en"){
 const row=dyk225Candidates(data,date).find(x=>x.id===id);
 if(!row)return null;
 const fr=language==="fr",s=row.source;
 return Object.freeze({id:row.id,language:fr?"fr":"en",fact:row.pilot_home_copy[fr?"fr":"en"],
  label:fr?"Traditions liturgiques · Source historique":"Liturgical traditions · Historical source",
  sourceId:row.source_id,sourceUrl:s.url,
  links:[{page:null,url:s.url,label:fr?"Consulter l'article historique":"Read historical source article"}],
  published:true});
}
