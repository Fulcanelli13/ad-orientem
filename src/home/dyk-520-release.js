// Curated Customs + Glossary discoveries for the existing Home DYK surface.
// The source is the compact bilingual 520-card projection. Historical source
// provenance remains in the separate research registry, not in the app bundle.
const SOURCE=new URL("../../data/did-you-know/dyk-customs-glossary-520.v1.json",import.meta.url);
const SCHEMA="AO_DYK_CUSTOMS_GLOSSARY_520_V1";
const isUrl=s=>typeof s==="string"&&/^https:\/\/[^\\s<>"']+$/.test(s);
const clean=s=>typeof s==="string"?s.trim():"";
const validDate=s=>{
 if(typeof s!=="string"||!/^\\d{4}-\\d{2}-\\d{2}$/.test(s))return false;
 const d=new Date(s+"T12:00:00Z");
 return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s;
};
const norm=s=>clean(s).normalize("NFKC").toLocaleLowerCase().replace(/\\s+/g," ");
let pending=null;
export function loadDyk520Release(win=globalThis){
 if(pending)return pending;
 pending=Promise.resolve().then(async()=>{
  const r=await win.fetch(SOURCE,{cache:"no-store"});
  if(!r?.ok)throw Error("DYK_520_UNAVAILABLE");
  return r.json();
 }).catch(error=>{pending=null;throw error;});
 return pending;
}
// Validate the entire publication input: malformed rows never become Home facts.
export function dyk520Candidates(data,date){
 if(!validDate(date)||data?.schema!==SCHEMA||
    data.release_stage!=="INTEGRATED_CONTENT"||data.count!==520||
    data.counts?.customs!==378||data.counts?.glossary!==142||
    !Array.isArray(data.records)||data.records.length!==520)return [];
 const ids=new Set(),titles={en:new Set(),fr:new Set()},facts={en:new Set(),fr:new Set()};
 let customs=0,glossary=0;
 for(const r of data.records){
  if(!/^DYK-[A-Z0-9-]+$/.test(r?.id||"")||ids.has(r.id)||
     !["CUSTOMS","GLOSSARY"].includes(r.category)||
     !clean(r.title?.en)||!clean(r.title?.fr)||
     clean(r.fact?.en).length<25||clean(r.fact?.fr).length<25||
     !clean(r.source?.id)||!isUrl(r.source?.url)||
     !Array.isArray(r.source.alternative_urls)||
     !r.source.alternative_urls.every(isUrl))return [];
  ids.add(r.id);
  for(const lang of ["en","fr"]){
   const title=norm(r.title[lang]),fact=norm(r.fact[lang]);
   if(titles[lang].has(title)||facts[lang].has(fact))return [];
   titles[lang].add(title);facts[lang].add(fact);
  }
  if(r.category==="CUSTOMS")customs++;else glossary++;
 }
 if(customs!==378||glossary!==142)return [];
 return data.records.map(r=>({
  id:r.id,category:r.category,title:r.title,
  pilot_home_copy:r.fact,source_family:"CURATED_CUSTOMS_GLOSSARY_2026",
  source_id:r.source.id,source:r.source
 }));
}
export function dyk520Model(data,id,date,language="en"){
 const row=dyk520Candidates(data,date).find(r=>r.id===id);
 if(!row)return null;
 const fr=language==="fr";
 return Object.freeze({
  id:row.id,language:fr?"fr":"en",
  title:row.title[fr?"fr":"en"],
  fact:row.pilot_home_copy[fr?"fr":"en"],
  label:row.category==="CUSTOMS"?
    (fr?"Coutumes et traditions":"Customs and traditions"):
    (fr?"Découvertes du glossaire":"Glossary discoveries"),
  sourceId:row.source_id,sourceUrl:row.source.url,
  links:[{page:null,url:row.source.url,
    label:fr?"Consulter la source":"Read the source"}],
  published:true
 });
}
