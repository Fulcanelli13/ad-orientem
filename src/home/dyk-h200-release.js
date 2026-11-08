// H200 publication gate: never load research candidates directly.
const SOURCE=new URL("../../data/did-you-know/dyk-h200-three-sources-25-publication.v1.json",import.meta.url);
const SCHEMA="AO_DYK_H200_THREE_SOURCES25_PUBLICATION_V1";
const RURAL="https://www.ewtn.com/catholicism/library/rural-life-prayerbook-11881";
const RITUS="https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/";
const CE_URLS=new Set(["03246a","03245b","06151a","05399b","14506a","12446c"].map(x=>"https://www.newadvent.org/cathen/"+x+".htm"));
const RITUS_PAGES=Object.freeze({"VI.3":8,"VIII.4":14,"VIII.5":15,"VII.5":10,"VI.5":9});
const clean=x=>typeof x==="string"?x.trim():"";
const validDate=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&new Date(x+"T12:00:00Z").toISOString().slice(0,10)===x;
let promise=null;
export function loadDyk200Release(win=globalThis){
 if(promise)return promise;
 promise=Promise.resolve().then(()=>win.fetch(SOURCE,{cache:"no-store"})).then(r=>{
  if(!r?.ok)throw Error("DYK_H200_UNAVAILABLE");return r.json();
 }).catch(e=>{promise=null;throw e});
 return promise;
}
export function dyk200Candidates(data,date){
 if(!validDate(date)||data?.schema!==SCHEMA||data.release_stage!=="APPROVED_PARTIAL_LIVE"||
  data.counts?.encyclopedia!==8||data.counts?.rural!==10||data.counts?.ritus!==7||
  data.counts?.total!==25||!Array.isArray(data.records)||data.records.length!==25)return [];
 const ids=new Set(),sources=new Set();
 return data.records.filter(row=>{
  const id=row?.id||"",c=row?.pilot_home_copy,s=row?.source;
  if(!/^DYK-H200-(?:C-00[1-8]|B-0(?:0[1-9]|10)|M-00[1-7])$/.test(id)||
   ids.has(id)||!clean(row?.source_id)||sources.has(row.source_id))return false;
  ids.add(id);sources.add(row.source_id);
  const g=id.slice(9,10),pages=s?.pdf_pages_1based;
  const fam={C:"CATHOLIC_ENCYCLOPEDIA_HISTORICAL",B:"RURAL_LIFE_PRAYERBOOK_1956",M:"ROMAN_MASS_1962"}[g];
  const proper=g==="C"?
   (row.topic==="HISTORICAL_CATHOLIC_CUSTOM"&&row.publication_kind==="SOURCE_SCOPED_HISTORICAL"&&
    /^CE1912[.]H200[.]/.test(row.source_id)&&CE_URLS.has(s?.url)&&
    /^Catholic Encyclopedia: /.test(s?.primary_locator||"")&&s?.original_text_checked===true):
   g==="B"?
   (row.topic==="HISTORICAL_CATHOLIC_BLESSING"&&row.publication_kind==="SOURCE_SCOPED_HISTORICAL"&&
    /^RLP1956[.]H200[.]/.test(row.source_id)&&s?.url===RURAL&&
    s?.publication_year===1956&&clean(s?.primary_locator).length>10&&s?.original_text_checked===true):
   (row.topic==="ROMAN_1962_CELEBRANT_DETAIL"&&row.publication_kind==="ROMAN_1962_RUBRIC"&&
    /^RS1962[.]H200[.]/.test(row.source_id)&&s?.url===RITUS&&s?.type==="pdf"&&
    Array.isArray(pages)&&pages.length===1&&
    RITUS_PAGES[(s?.primary_locator||"").replace("Ritus servandus ","")]===pages[0]&&
    Array.isArray(s?.printed_pages)&&s.printed_pages.length===1&&s.printed_pages[0]===pages[0]&&
    s.original_image_checked===true&&Array.isArray(s.supporting_event_ids)&&
    s.supporting_event_ids.length===1&&/^(?:B01-0[0-4][0-9]|MR62[.]SOL[.]B02[.]0[0-6][0-9])$/.test(s.supporting_event_ids[0]));
  const html=g!=="M";
  return Boolean(proper&&row.source_family===fam&&row.historical_local_only===html&&
    row.liturgical_rubric_1962===!html&&s.source_record_id===row.source_id&&
    s.deep_link_checked===true&&(html?(s.type==="html"&&Array.isArray(pages)&&pages.length===0):true)&&
    row.editorial_approval===true&&row.semantic_novelty_reviewed===true&&
    row.release_authorized===true&&row.published===true&&
    c?.final_english_signoff===true&&c?.final_french_signoff===true&&
    clean(c.en).length>50&&clean(c.fr).length>50&&clean(row.region_scope).length>10);
 });
}
export function dyk200Model(data,id,date,language="en"){
 const row=dyk200Candidates(data,date).find(x=>x.id===id);if(!row)return null;
 const fr=language==="fr",s=row.source;
 const label=row.source_family==="ROMAN_MASS_1962"?
  (fr?"Messe romaine · Rubriques de 1962":"Roman Mass · 1962 rubrics"):
  row.source_family==="RURAL_LIFE_PRAYERBOOK_1956"?
  (fr?"Bénédictions · 1956":"Blessings · 1956"):
  (fr?"Histoire catholique · Encyclopédie":"Catholic history · Encyclopedia");
 const links=s.type==="pdf"?s.pdf_pages_1based.map(page=>({page,url:s.url+"#page="+page})):
  [{page:null,url:s.url,label:fr?"Consulter l'article ou la section":"Read original article or section"}];
 return Object.freeze({id:row.id,language:fr?"fr":"en",fact:row.pilot_home_copy[fr?"fr":"en"],
  label,sourceId:row.source_id,sourceUrl:s.url,links,published:true});
}
