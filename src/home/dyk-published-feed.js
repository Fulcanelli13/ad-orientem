import {loadDyk200Release,dyk200Model} from "./dyk-h200-release.js";
export {loadDyk200Release,dyk200Candidates,dyk200Model} from "./dyk-h200-release.js";
// One canonical R34 source owner for H7 Home's future released discoveries.
// No second bank and no public facts until BOTH global and per-fact gates pass.
const SOURCE=new URL("../../data/research/did-you-know/dyk-r34-high-signal-24-editorial-selection.v1.json",import.meta.url);
const SCHEMA="AO_DYK_R34_HIGH_SIGNAL_24_REVIEW_SELECTION_V1";
const safeUrl=value=>typeof value==="string"&&/^https:\/\/[^<>"'\s]+$/.test(value);
const clean=x=>typeof x==="string"?x.trim():"";
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const validDate=x=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(x||""))return false;const date=new Date(x+"T12:00:00Z");return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===x;};
// Stable per-day shuffle across the *combined* published and Glossary pool.
// No browser storage, tracking, paid runtime, or unreviewed research publication.
export const DYK_GLOSSARY_FALLBACK_IDS=Object.freeze(["G195","G213","G219","G235","G194","G240","G197","G200","G203","G212","G215","G216","G218","G224","G241","G242","G248","G255","G259","G260","G274","G283","G290","G300"]);
function shuffledHomeIds(ids,cycle){
 const ordered=[...new Set(ids)].sort();
 let state=2166136261;
 for(const ch of cycle+"|"+ordered.join("|")){state=Math.imul(state^ch.charCodeAt(0),16777619)}
 state=(state>>>0)||1;
 const random=()=>{
   state^=state<<13;state^=state>>>17;state^=state<<5;
   return state>>>0;
 };
 for(let i=ordered.length-1;i>0;i--){
   const j=random()%(i+1);
   [ordered[i],ordered[j]]=[ordered[j],ordered[i]];
 }
 return ordered;
}
export function dykHomeRotationSlot(date,publishedIds=[],fallbackIds=DYK_GLOSSARY_FALLBACK_IDS){
 if(!validDate(date)||!Array.isArray(publishedIds)||!Array.isArray(fallbackIds))return null;
 const ids=[...new Set([...publishedIds,...fallbackIds].filter(id=>
   typeof id==="string"&&(/^(?:G\d{3}|DYK-[A-Z0-9-]+)$/).test(id)))];
 if(!ids.length)return null;
 const ordinal=Math.floor(Date.parse(date+"T12:00:00Z")/86400000);
 const cycle=Math.floor(ordinal/ids.length);
 const order=shuffledHomeIds(ids,cycle);
 // Avoid an adjacent repeat when the pool shuffles at a cycle boundary.
 if(order.length>1){
   const prior=shuffledHomeIds(ids,cycle-1);
   if(order[0]===prior.at(-1)) [order[0],order[1]]=[order[1],order[0]];
 }
 return order[((ordinal%ids.length)+ids.length)%ids.length];
}

// Publish only the separately source-verified, bilingual historical release projection.
// The 640-row research registry and 612 private previews remain outside the live bundle.
const HISTORY_SOURCE=new URL("../../data/did-you-know/weiser-historical-20-publication.v1.json",import.meta.url);
const HISTORY_SCHEMA="AO_DYK_HISTORICAL_WEISER20_PUBLICATION_V1";
let historicalLoad=null;
export function loadDykHistoricalRelease(win=globalThis){
 if(historicalLoad)return historicalLoad;
 historicalLoad=Promise.resolve().then(()=>win.fetch(HISTORY_SOURCE,{cache:"no-store"})).then(r=>{
   if(!r?.ok)throw Error("DYK_HISTORICAL_UNAVAILABLE");return r.json();
 }).catch(error=>{historicalLoad=null;throw error});
 return historicalLoad;
}
export function dykHistoricalCandidates(data,date){
 if(!validDate(date)||data?.schema!==HISTORY_SCHEMA||
    data.release_stage!=="APPROVED_PARTIAL_LIVE"||
    !Array.isArray(data.records)||data.records.length!==20)return [];
 const unique=new Set();
 return data.records.filter(row=>{
   const copy=row?.pilot_home_copy,source=row?.source;
   if(!/^DYK-G520-W-0(?:0[1-9]|1[0-9]|20)$/.test(row?.id||"")||unique.has(row.id))return false;
   unique.add(row.id);
   return row.editorial_approval===true&&row.release_authorized===true&&
     row.semantic_novelty_reviewed===true&&row.historical_local_only===true&&
     row.publication_kind==="EVERGREEN_HISTORICAL"&&
     row.source_family==="WEISER_1958"&&
     copy?.final_english_signoff===true&&copy?.final_french_signoff===true&&
     clean(copy.en).length>25&&clean(copy.fr).length>25&&
     safeUrl(source?.url)&&source?.original_image_checked===true&&source?.deep_link_checked===true&&
     source.source_record_id===row.source_id&&
     Array.isArray(source.pdf_pages_1based)&&source.pdf_pages_1based.length>0&&
     source.pdf_pages_1based.every(p=>Number.isInteger(p)&&p>=1&&p<=384);
 });
}
export function dykHistoricalModel(data,id,date,language="en"){
 const row=dykHistoricalCandidates(data,date).find(r=>r.id===id);
 if(!row)return null;
 const fr=language==="fr";
 return Object.freeze({
   id:row.id,language:fr?"fr":"en",fact:row.pilot_home_copy[fr?"fr":"en"],
   label:fr?"Weiser · Coutumes historiques":"Weiser · Historical customs",
   sourceId:row.source_id,sourceUrl:row.source.url,
   links:row.source.pdf_pages_1based.map(page=>({page,url:row.source.url+"#page="+page})),
   published:true
 });
}


 // A separate, reviewed release; do not automatically promote the R50 research bank.
const R50_SOURCE=new URL("../../data/did-you-know/weiser-r50-sixteen-publication.v1.json",import.meta.url);
const R50_SCHEMA="AO_DYK_R50_WEISER16_PUBLICATION_V1";
let r50Load=null;
export function loadDykWeiser16Release(win=globalThis){
 if(r50Load)return r50Load;
 r50Load=Promise.resolve().then(()=>win.fetch(R50_SOURCE,{cache:"no-store"})).then(r=>{
   if(!r?.ok)throw Error("DYK_R50_UNAVAILABLE");return r.json();
 }).catch(error=>{r50Load=null;throw error});
 return r50Load;
}
export function dykWeiser16Candidates(data,date){
 if(!validDate(date)||data?.schema!==R50_SCHEMA||data.release_stage!=="APPROVED_PARTIAL_LIVE"||
    !Array.isArray(data.records)||data.records.length!==16)return [];
 const seenIds=new Set(),seenSources=new Set();
 return data.records.filter(row=>{
   const c=row?.pilot_home_copy,s=row?.source;
   if(!/^DYK-R50-W-(?:00[1-9]|01[0-6])$/.test(row?.id||"")||seenIds.has(row.id)||
      !clean(row?.source_id)||seenSources.has(row.source_id))return false;
   seenIds.add(row.id);seenSources.add(row.source_id);
   return row.source_family==="WEISER_1958"&&row.historical_local_only===true&&
      row.publication_kind==="EVERGREEN_HISTORICAL"&&
      row.editorial_approval===true&&row.release_authorized===true&&
      row.semantic_novelty_reviewed===true&&
      c?.final_english_signoff===true&&c?.final_french_signoff===true&&
      clean(c.en).length>25&&clean(c.fr).length>25&&clean(row.region_scope).length>3&&
      safeUrl(s?.url)&&s.original_image_checked===true&&s.deep_link_checked===true&&
      s.source_record_id===row.source_id&&
      Array.isArray(s.printed_pages)&&s.printed_pages.length>0&&
      Array.isArray(s.pdf_pages_1based)&&s.pdf_pages_1based.length===s.printed_pages.length&&
      s.printed_pages.every((p,i)=>Number.isInteger(p)&&p>=1&&p<=366&&
        s.pdf_pages_1based[i]===p+18);
 });
}
export function dykWeiser16Model(data,id,date,language="en"){
 const row=dykWeiser16Candidates(data,date).find(r=>r.id===id);
 if(!row)return null;
 const fr=language==="fr";
 return Object.freeze({
  id:row.id,language:fr?"fr":"en",fact:row.pilot_home_copy[fr?"fr":"en"],
  label:fr?"Weiser · Coutumes historiques":"Weiser · Historical customs",
  sourceId:row.source_id,sourceUrl:row.source.url,
  links:row.source.pdf_pages_1based.map(page=>({page,url:row.source.url+"#page="+page})),
  published:true
 });
}


 // Distinct final R50 release; review flags in the private research bank never
 // authorize themselves. All selected facts use verified original Weiser folios.
const R50B_SOURCE=new URL("../../data/did-you-know/weiser-r50-second-sixteen-publication.v1.json",import.meta.url);
const R50B_SCHEMA="AO_DYK_R50B_WEISER16_PUBLICATION_V1";
let r50bLoad=null;
export function loadDykWeiserSecond16Release(win=globalThis){
 if(r50bLoad)return r50bLoad;
 r50bLoad=Promise.resolve().then(()=>win.fetch(R50B_SOURCE,{cache:"no-store"})).then(r=>{
   if(!r?.ok)throw Error("DYK_R50B_UNAVAILABLE");return r.json();
 }).catch(error=>{r50bLoad=null;throw error});
 return r50bLoad;
}
export function dykWeiserSecond16Candidates(data,date){
 if(!validDate(date)||data?.schema!==R50B_SCHEMA||data.release_stage!=="APPROVED_PARTIAL_LIVE"||
    !Array.isArray(data.records)||data.records.length!==16)return [];
 const seenIds=new Set(),seenSources=new Set();
 return data.records.filter(row=>{
   const c=row?.pilot_home_copy,s=row?.source;
   if(!/^DYK-R50B-W-(?:00[1-9]|01[0-6])$/.test(row?.id||"")||seenIds.has(row.id)||
      !clean(row?.source_id)||seenSources.has(row.source_id))return false;
   seenIds.add(row.id);seenSources.add(row.source_id);
   return row.source_family==="WEISER_1958"&&row.historical_local_only===true&&
      row.publication_kind==="EVERGREEN_HISTORICAL"&&
      row.editorial_approval===true&&row.release_authorized===true&&
      row.semantic_novelty_reviewed===true&&row.published===true&&
      c?.final_english_signoff===true&&c?.final_french_signoff===true&&
      clean(c.en).length>25&&clean(c.fr).length>25&&clean(row.region_scope).length>3&&
      safeUrl(s?.url)&&s.original_image_checked===true&&s.deep_link_checked===true&&
      s.source_record_id===row.source_id&&
      Array.isArray(s.printed_pages)&&s.printed_pages.length>0&&
      Array.isArray(s.pdf_pages_1based)&&s.pdf_pages_1based.length===s.printed_pages.length&&
      s.printed_pages.every((p,i)=>Number.isInteger(p)&&p>=1&&p<=366&&
        s.pdf_pages_1based[i]===p+18);
 });
}
export function dykWeiserSecond16Model(data,id,date,language="en"){
 const row=dykWeiserSecond16Candidates(data,date).find(r=>r.id===id);
 if(!row)return null;
 const fr=language==="fr";
 return Object.freeze({
  id:row.id,language:fr?"fr":"en",fact:row.pilot_home_copy[fr?"fr":"en"],
  label:fr?"Weiser · Coutumes historiques":"Weiser · Historical customs",
  sourceId:row.source_id,sourceUrl:row.source.url,
  links:row.source.pdf_pages_1based.map(page=>({page,url:row.source.url+"#page="+page})),
  published:true
 });
}


 // The H100 mixed-source release is a reviewed public projection, never a
 // loader for the private Pitrè/1962 research banks. Two exact source families.
const H100_SOURCE=new URL("../../data/did-you-know/dyk-h100-pitre-ritus-24-publication.v1.json",import.meta.url);
const H100_SCHEMA="AO_DYK_H100_PITRE12_RITUS12_PUBLICATION_V1";
const H100_PITRE_URL="https://upload.wikimedia.org/wikipedia/commons/9/9b/Biblioteca_delle_tradizioni_popolari_siciliane_%28IA_afm3499.0021.001.umich.edu%29.pdf";
const H100_RITUS_URL="https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/";
let h100Load=null;
export function loadDykMixed24Release(win=globalThis){
 if(h100Load)return h100Load;
 h100Load=Promise.resolve().then(()=>win.fetch(H100_SOURCE,{cache:"no-store"})).then(r=>{
  if(!r?.ok)throw Error("DYK_H100_UNAVAILABLE");return r.json();
 }).catch(error=>{h100Load=null;throw error});
 return h100Load;
}
export function dykMixed24Candidates(data,date){
 if(!validDate(date)||data?.schema!==H100_SCHEMA||data.release_stage!=="APPROVED_PARTIAL_LIVE"||
   !Array.isArray(data.records)||data.records.length!==24)return [];
 const seenIds=new Set(),seenSources=new Set();
 return data.records.filter(row=>{
  const c=row?.pilot_home_copy,s=row?.source;
  if(!/^DYK-H100-[PM]-0(?:0[1-9]|1[0-2])$/.test(row?.id||"")||
     seenIds.has(row.id)||!clean(row?.source_id)||seenSources.has(row.source_id))return false;
  seenIds.add(row.id);seenSources.add(row.source_id);
  const pitre=row.id.includes("-P-");
  const family=pitre?"PITRE_1900":"ROMAN_MASS_1962";
  const sourceUrl=pitre?H100_PITRE_URL:H100_RITUS_URL;
  const qualified=pitre?
   (row.historical_local_only===true&&row.topic==="historical_customs"&&
    row.publication_kind==="EVERGREEN_HISTORICAL"&&
    clean(s?.original_italian_anchor).length>4&&
    Array.isArray(s?.printed_pages)&&s.printed_pages.length===1&&
    Number.isInteger(s.printed_pages[0])&&s.printed_pages[0]>0&&
    s.printed_pages[0]<600):
   (row.historical_local_only===false&&row.liturgical_rubric_1962===true&&
    row.topic==="roman_1962_celebrant_rubrics"&&
    row.publication_kind==="ROMAN_1962_RUBRIC"&&
    /^Ritus servandus [IVX]+[.][0-9]+(?:[–-][0-9]+)?$/.test(s?.primary_locator||"")&&
    Array.isArray(s?.printed_pages)&&s.printed_pages.length>0&&
    s.printed_pages.every((p,i)=>s.pdf_pages_1based?.[i]===p));
  return qualified&&row.source_family===family&&s?.url===sourceUrl&&
    row.editorial_approval===true&&row.release_authorized===true&&
    row.semantic_novelty_reviewed===true&&row.published===true&&
    c?.final_english_signoff===true&&c?.final_french_signoff===true&&
    clean(c.en).length>30&&clean(c.fr).length>30&&clean(row.region_scope).length>5&&
    s.original_image_checked===true&&s.deep_link_checked===true&&
    s.source_record_id===row.source_id&&
    Array.isArray(s.pdf_pages_1based)&&s.pdf_pages_1based.length>0&&
    s.pdf_pages_1based.length<=2&&
    s.pdf_pages_1based.every(p=>Number.isInteger(p)&&p>=1&&p<700);
 });
}
export function dykMixed24Model(data,id,date,language="en"){
 const row=dykMixed24Candidates(data,date).find(r=>r.id===id);
 if(!row)return null;
 const fr=language==="fr";
 const mass=row.source_family==="ROMAN_MASS_1962";
 return Object.freeze({
  id:row.id,language:fr?"fr":"en",fact:row.pilot_home_copy[fr?"fr":"en"],
  label:mass?(fr?"Messe romaine · Ritus servandus":"Roman Mass · Ritus servandus"):
    (fr?"Pitrè · Fêtes siciliennes historiques":"Pitrè · Historical Sicilian feasts"),
  sourceId:row.source_id,sourceUrl:row.source.url,
  links:row.source.pdf_pages_1based.map(page=>({page,url:row.source.url+"#page="+page})),
  published:true
 });
}


const H125_SOURCE=new URL("../../data/did-you-know/dyk-h125-multisource-25-publication.v1.json",import.meta.url);
const H125_SCHEMA="AO_DYK_H125_MULTISOURCE_25_PUBLICATION_V1";
const H125_PITRE_URL="https://upload.wikimedia.org/wikipedia/commons/9/9b/Biblioteca_delle_tradizioni_popolari_siciliane_%28IA_afm3499.0021.001.umich.edu%29.pdf";
const H125_RITUS_URL="https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/";
const H125_EXTRA_URLS=Object.freeze({
 HUNGARIAN_ETHNOGRAPHIC_LEXICON:"https://mek.oszk.hu/02100/02115/html/1-713.html",
 RURAL_LIFE_PRAYERBOOK_1956:"https://www.ewtn.com/catholicism/library/rural-life-prayerbook-11881",
 DIOCESE_BATON_ROUGE:"https://www.diobr.org/news/st-joseph-cathedral-st-joseph-altar-1",
 ROMAN_GENERAL_RUBRICS_1962:"https://maternalheart.org/library/1962rubrics.pdf"
});
let h125Promise=null;
export function loadDyk125Release(win=globalThis){
 if(h125Promise)return h125Promise;
 h125Promise=Promise.resolve().then(()=>win.fetch(H125_SOURCE,{cache:"no-store"})).then(r=>{
  if(!r?.ok)throw Error("DYK_H125_UNAVAILABLE");return r.json();
 }).catch(e=>{h125Promise=null;throw e});
 return h125Promise;
}
export function dyk125Candidates(data,date){
 if(!validDate(date)||data?.schema!==H125_SCHEMA||data.release_stage!=="APPROVED_PARTIAL_LIVE"||
    data.counts?.pitre!==12||data.counts?.ritus!==8||data.counts?.other!==5||
    data.counts?.total!==25||!Array.isArray(data.records)||data.records.length!==25)return [];
 const ids=new Set(),sources=new Set();
 return data.records.filter(row=>{
  const c=row?.pilot_home_copy,s=row?.source,id=row?.id||"";
  if(!/^DYK-H125-(?:P-0(?:0[1-9]|1[0-2])|M-00[1-8]|X-00[1-5])$/.test(id)||
    ids.has(id)||!clean(row?.source_id)||sources.has(row.source_id))return false;
  ids.add(id);sources.add(row.source_id);
  const pitre=id.includes("-P-"),mass=id.includes("-M-");
  const url=pitre?H125_PITRE_URL:mass?H125_RITUS_URL:H125_EXTRA_URLS[row.source_family];
  const family=pitre?"PITRE_1900":mass?"ROMAN_MASS_1962":row.source_family;
  const pdf=pitre||mass||row.source_family==="ROMAN_GENERAL_RUBRICS_1962";
  const sourceType=pdf?
    (s?.type==="pdf"&&Array.isArray(s.pdf_pages_1based)&&
      s.pdf_pages_1based.length>0&&s.pdf_pages_1based.length<=2&&
      s.pdf_pages_1based.every(n=>Number.isInteger(n)&&n>0&&n<=700)):
    (s?.type==="html"&&Array.isArray(s.pdf_pages_1based)&&s.pdf_pages_1based.length===0&&
      clean(s.primary_locator).length>6);
  const familyGate=pitre?
    (row.topic==="historical_customs"&&row.historical_local_only===true&&
      row.publication_kind==="EVERGREEN_HISTORICAL"&&s.original_image_checked===true&&
      clean(s.original_italian_anchor).length>4&&s.pdf_pages_1based.length===1&&
      Array.isArray(s.printed_pages)&&s.printed_pages.length===1&&
      Number.isInteger(s.printed_pages[0])&&s.printed_pages[0]>0&&
      s.printed_pages[0]!==s.pdf_pages_1based[0]):
    mass?
      (row.topic==="roman_1962_celebrant_rubrics"&&row.liturgical_rubric_1962===true&&
       row.historical_local_only===false&&row.publication_kind==="ROMAN_1962_RUBRIC"&&
       /^Ritus servandus [IVX]+[.][0-9]+$/.test(s.primary_locator||"")&&
       s.original_image_checked===true&&Array.isArray(s.supporting_event_ids)&&
       s.supporting_event_ids.length>0&&
       s.supporting_event_ids.every(x=>/^B01-0[0-4][0-9]$/.test(x))&&
       Array.isArray(s.printed_pages)&&s.printed_pages.length===s.pdf_pages_1based.length&&
       s.printed_pages.every((p,i)=>p===s.pdf_pages_1based[i])):
      (Object.hasOwn(H125_EXTRA_URLS,row.source_family)&&
       s.original_text_checked===true&&
       row.publication_kind===(row.source_family==="ROMAN_GENERAL_RUBRICS_1962"?
        "ROMAN_1962_CALENDAR":"SOURCE_SCOPED_HISTORICAL")&&
       (row.source_family!=="ROMAN_GENERAL_RUBRICS_1962"||
        (row.liturgical_rubric_1962===true&&s.pdf_pages_1based[0]===15)));
  return sourceType&&familyGate&&row.source_family===family&&url&&s.url===url&&
    row.editorial_approval===true&&row.release_authorized===true&&
    row.semantic_novelty_reviewed===true&&row.published===true&&
    c?.final_english_signoff===true&&c?.final_french_signoff===true&&
    clean(c.en).length>30&&clean(c.fr).length>30&&clean(row.region_scope).length>6&&
    s.deep_link_checked===true&&s.source_record_id===row.source_id;
 });
}
export function dyk125Model(data,id,date,language="en"){
 const row=dyk125Candidates(data,date).find(r=>r.id===id);if(!row)return null;
 const fr=language==="fr",s=row.source;
 const label=row.source_family==="ROMAN_MASS_1962"?(fr?"Messe romaine · Ritus servandus":"Roman Mass · Ritus servandus"):
  row.source_family==="PITRE_1900"?(fr?"Pitrè · Fêtes siciliennes":"Pitrè · Sicilian feasts"):
  row.source_family==="ROMAN_GENERAL_RUBRICS_1962"?(fr?"Rubriques romaines · 1962":"Roman rubrics · 1962"):
  (fr?"Coutumes · Source originale":"Customs · Original source");
 const links=s.type==="pdf"?s.pdf_pages_1based.map(page=>({page,url:s.url+"#page="+page})):
  [{page:null,url:s.url,label:fr?"Ouvrir la section citée":"Open cited source section"}];
 return Object.freeze({id:row.id,language:fr?"fr":"en",fact:row.pilot_home_copy[fr?"fr":"en"],
   label,sourceId:row.source_id,sourceUrl:s.url,links,published:true});
}


const H150_SOURCE=new URL("../../data/did-you-know/dyk-h150-originals-25-publication.v1.json",import.meta.url);
const H150_SCHEMA="AO_DYK_H150_ORIGINALS25_PUBLICATION_V1";
const H150_URLS=Object.freeze({
 PITRE_1900:"https://upload.wikimedia.org/wikipedia/commons/9/9b/Biblioteca_delle_tradizioni_popolari_siciliane_%28IA_afm3499.0021.001.umich.edu%29.pdf",
 ROMAN_MASS_1962:"https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/",
 RURAL_LIFE_PRAYERBOOK_1956:"https://www.ewtn.com/catholicism/library/rural-life-prayerbook-11881",
 ROMAN_GENERAL_RUBRICS_1962:"https://maternalheart.org/library/1962rubrics.pdf"
});
let h150Promise=null;
export function loadDyk150Release(win=globalThis){
 if(h150Promise)return h150Promise;
 h150Promise=Promise.resolve().then(()=>win.fetch(H150_SOURCE,{cache:"no-store"})).then(r=>{
  if(!r?.ok)throw Error("DYK_H150_UNAVAILABLE");return r.json();
 }).catch(e=>{h150Promise=null;throw e});
 return h150Promise;
}
export function dyk150Candidates(data,date){
 if(!validDate(date)||data?.schema!==H150_SCHEMA||data.release_stage!=="APPROVED_PARTIAL_LIVE"||
    data.counts?.pitre!==8||data.counts?.ritus!==8||data.counts?.prayerbook!==7||
    data.counts?.calendar!==2||data.counts?.total!==25||
    !Array.isArray(data.records)||data.records.length!==25)return [];
 const seenIds=new Set(),seenSources=new Set();
 return data.records.filter(row=>{
  const id=row?.id||"",c=row?.pilot_home_copy,s=row?.source;
  if(!/^DYK-H150-(?:P-00[1-8]|M-00[1-8]|B-00[1-7]|C-00[1-2])$/.test(id)||
     seenIds.has(id)||!clean(row?.source_id)||seenSources.has(row.source_id))return false;
  seenIds.add(id);seenSources.add(row.source_id);
  const group=id.slice(9,10);
  const expectedFamily={P:"PITRE_1900",M:"ROMAN_MASS_1962",
    B:"RURAL_LIFE_PRAYERBOOK_1956",C:"ROMAN_GENERAL_RUBRICS_1962"}[group];
  const isHtml=group==="B";
  const pdfPages=s?.pdf_pages_1based;
  const pagesValid=isHtml?
    (s?.type==="html"&&Array.isArray(pdfPages)&&pdfPages.length===0&&
     clean(s.primary_locator).length>6):
    (s?.type==="pdf"&&Array.isArray(pdfPages)&&pdfPages.length===1&&
     Number.isInteger(pdfPages[0])&&pdfPages[0]>0&&pdfPages[0]<700);
  const specific=group==="P"?
    (row.historical_local_only===true&&row.publication_kind==="EVERGREEN_HISTORICAL"&&
     row.topic==="SICILIAN_HISTORICAL_FEAST"&&s?.original_image_checked===true&&
     clean(s.original_italian_anchor).length>4&&Array.isArray(s.printed_pages)&&
     s.printed_pages.length===1&&Number.isInteger(s.printed_pages[0])&&
     s.printed_pages[0]>0&&pdfPages?.[0]>s.printed_pages[0]&&
     /^PIT1900-/.test(row.source_id)):
   group==="M"?
    (row.historical_local_only===false&&row.liturgical_rubric_1962===true&&
     row.publication_kind==="ROMAN_1962_RUBRIC"&&row.topic==="ROMAN_1962_CELEBRANT_DETAIL"&&
     /^RS1962[.]H150[.]/.test(row.source_id)&&
     /^Ritus servandus [IVX]+[.][0-9]+$/.test(s?.primary_locator||"")&&
     s?.original_image_checked===true&&Array.isArray(s.printed_pages)&&
     s.printed_pages.length===1&&s.printed_pages[0]===pdfPages?.[0]&&
     Array.isArray(s.supporting_event_ids)&&
     s.supporting_event_ids.every(x=>/^B01-0[0-4][0-9]$/.test(x))):
   group==="B"?
    (row.historical_local_only===true&&row.publication_kind==="SOURCE_SCOPED_HISTORICAL"&&
     row.topic==="HISTORICAL_CATHOLIC_BLESSING"&&
     /^RLP1956[.]H150[.]/.test(row.source_id)&&s?.original_text_checked===true):
    (row.historical_local_only===false&&row.liturgical_rubric_1962===true&&
     row.publication_kind==="ROMAN_1962_CALENDAR"&&row.topic==="ROMAN_1962_CALENDAR"&&
     /^RUBR1962[.]H150[.]/.test(row.source_id)&&s?.original_image_checked===true&&
     s.original_text_checked===true&&pdfPages?.[0]===16);
  return pagesValid&&specific&&row.source_family===expectedFamily&&
    s?.url===H150_URLS[expectedFamily]&&s.source_record_id===row.source_id&&
    s.deep_link_checked===true&&row.editorial_approval===true&&
    row.release_authorized===true&&row.semantic_novelty_reviewed===true&&
    row.published===true&&c?.final_english_signoff===true&&
    c?.final_french_signoff===true&&clean(c.en).length>30&&
    clean(c.fr).length>30&&clean(row.region_scope).length>6;
 });
}
export function dyk150Model(data,id,date,language="en"){
 const row=dyk150Candidates(data,date).find(r=>r.id===id);if(!row)return null;
 const fr=language==="fr",s=row.source;
 const label=row.source_family==="ROMAN_MASS_1962"?
   (fr?"Messe romaine · Gestes de 1962":"Roman Mass · 1962 gestures"):
   row.source_family==="PITRE_1900"?
    (fr?"Pitrè · Fêtes siciliennes":"Pitrè · Sicilian feasts"):
   row.source_family==="ROMAN_GENERAL_RUBRICS_1962"?
    (fr?"Calendrier romain · 1962":"Roman calendar · 1962"):
    (fr?"Bénédictions · 1956":"Blessings · 1956");
 const links=s.type==="pdf"?s.pdf_pages_1based.map(page=>({page,url:s.url+"#page="+page})):
   [{page:null,url:s.url,label:fr?"Consulter la section originale":"Read original source section"}];
 return Object.freeze({id:row.id,language:fr?"fr":"en",fact:row.pilot_home_copy[fr?"fr":"en"],
   label,sourceId:row.source_id,sourceUrl:s.url,links,published:true});
}


const H175_SOURCE=new URL("../../data/did-you-know/dyk-h175-multisource-25-publication.v1.json",import.meta.url);
const H175_SCHEMA="AO_DYK_H175_MULTISOURCE25_PUBLICATION_V1";
const H175_URLS=Object.freeze({
 PITRE_1900:"https://upload.wikimedia.org/wikipedia/commons/9/9b/Biblioteca_delle_tradizioni_popolari_siciliane_%28IA_afm3499.0021.001.umich.edu%29.pdf",
 RURAL_LIFE_PRAYERBOOK_1956:"https://www.ewtn.com/catholicism/library/rural-life-prayerbook-11881",
 ROMAN_MASS_1962:"https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/"
});
const H175_RITUS_PAGES=Object.freeze({"VI.2":8,"VI.4":8,"VI.6":9,"VI.7":9,"VI.8":9,"VII.3":10,"VII.6":10});
let h175Promise=null;
export function loadDyk175Release(win=globalThis){
 if(h175Promise)return h175Promise;
 h175Promise=Promise.resolve().then(()=>win.fetch(H175_SOURCE,{cache:"no-store"})).then(r=>{
  if(!r?.ok)throw Error("DYK_H175_UNAVAILABLE");return r.json();
 }).catch(e=>{h175Promise=null;throw e});
 return h175Promise;
}
export function dyk175Candidates(data,date){
 if(!validDate(date)||data?.schema!==H175_SCHEMA||data.release_stage!=="APPROVED_PARTIAL_LIVE"||
    data.counts?.pitre!==3||data.counts?.rural!==14||data.counts?.ritus!==8||
    data.counts?.total!==25||!Array.isArray(data.records)||data.records.length!==25)return [];
 const ids=new Set(),sources=new Set();
 return data.records.filter(row=>{
  const id=row?.id||"",c=row?.pilot_home_copy,s=row?.source;
  if(!/^DYK-H175-(?:P-00[1-3]|B-0(?:0[1-9]|1[0-4])|M-00[1-8])$/.test(id)||
     ids.has(id)||sources.has(row?.source_id)||!clean(row?.source_id))return false;
  ids.add(id);sources.add(row.source_id);
  const group=id.slice(9,10);
  const family={P:"PITRE_1900",B:"RURAL_LIFE_PRAYERBOOK_1956",M:"ROMAN_MASS_1962"}[group];
  const pages=s?.pdf_pages_1based;
  const pageGate=group==="B"?
   (s?.type==="html"&&Array.isArray(pages)&&pages.length===0&&
    clean(s.primary_locator).length>6&&s.original_text_checked===true):
   (s?.type==="pdf"&&Array.isArray(pages)&&pages.length===1&&Number.isInteger(pages[0])&&
    pages[0]>0&&pages[0]<700&&s.original_image_checked===true);
  const familyGate=group==="P"?
   (row.historical_local_only===true&&row.topic==="SICILIAN_HISTORICAL_FEAST"&&
    row.publication_kind==="EVERGREEN_HISTORICAL"&&
    /^PIT1900-/.test(row.source_id)&&clean(s?.original_italian_anchor).length>=4&&
    Array.isArray(s?.printed_pages)&&s.printed_pages.length===1&&
    Number.isInteger(s.printed_pages[0])&&s.printed_pages[0]>0&&
    pages?.[0]>s.printed_pages[0]):
   group==="B"?
   (row.historical_local_only===true&&row.topic==="HISTORICAL_CATHOLIC_BLESSING"&&
    row.publication_kind==="SOURCE_SCOPED_HISTORICAL"&&
    /^RLP1956[.]H175[.]/.test(row.source_id)&&s?.publication_year===1956):
   (row.historical_local_only===false&&row.liturgical_rubric_1962===true&&
    row.topic==="ROMAN_1962_CELEBRANT_DETAIL"&&
    row.publication_kind==="ROMAN_1962_RUBRIC"&&
    /^RS1962[.]H175[.]/.test(row.source_id)&&
    /^Ritus servandus (VI[.]([24678])|VII[.]([36]))$/.test(s?.primary_locator||"")&&
    H175_RITUS_PAGES[s.primary_locator.slice(16)]===pages?.[0]&&
    Array.isArray(s.printed_pages)&&s.printed_pages.length===1&&s.printed_pages[0]===pages[0]);
  return Boolean(pageGate&&familyGate&&row.source_family===family&&s?.url===H175_URLS[family]&&
    s.source_record_id===row.source_id&&s.deep_link_checked===true&&
    row.editorial_approval===true&&row.release_authorized===true&&
    row.semantic_novelty_reviewed===true&&row.published===true&&
    c?.final_english_signoff===true&&c?.final_french_signoff===true&&
    clean(c.en).length>30&&clean(c.fr).length>30&&clean(row.region_scope).length>6);
 });
}
export function dyk175Model(data,id,date,language="en"){
 const row=dyk175Candidates(data,date).find(r=>r.id===id);if(!row)return null;
 const fr=language==="fr",s=row.source;
 const label=row.source_family==="PITRE_1900"?
    (fr?"Pitrè · Fêtes siciliennes":"Pitrè · Sicilian feasts"):
  row.source_family==="ROMAN_MASS_1962"?
    (fr?"Messe romaine · Rubriques de 1962":"Roman Mass · 1962 rubrics"):
    (fr?"Bénédictions · 1956":"Blessings · 1956");
 const links=s.type==="pdf"?s.pdf_pages_1based.map(page=>({page,url:s.url+"#page="+page})):
  [{page:null,url:s.url,label:fr?"Lire la bénédiction originale":"Read original blessing"}];
 return Object.freeze({id:row.id,language:fr?"fr":"en",fact:row.pilot_home_copy[fr?"fr":"en"],
   label,sourceId:row.source_id,sourceUrl:s.url,links,published:true});
}

let selectionPromise=null;
export function loadDykPrioritySelection(win=globalThis){
 if(selectionPromise)return selectionPromise;
 selectionPromise=Promise.resolve().then(()=>win.fetch(SOURCE,{cache:"no-store"})).then(r=>{
   if(!r?.ok)throw Error("DYK_PRIORITY_UNAVAILABLE");return r.json();
 }).catch(e=>{selectionPromise=null;throw e});
 return selectionPromise;
}
export function dykPublishedCandidates(data,date){
 if(data?.schema!==SCHEMA||data.publication_stage!=="APPROVED_PARTIAL_LIVE"||
    !Array.isArray(data.records)||data.records.length<1||data.records.length>1000||!validDate(date))return [];
 const published=data.records.filter(row=>{
   const c=row.pilot_home_copy||row.editorial_review_copy;
   const s=row.pilot_source_folio||row.editorial_source_reference;
   const dest=row.pilot_destination_audit||row.editorial_destination_audit;
   const screen=row.priority_lexical_screen;
   const pages=s?.pdf_pages_1based;
   return /^DYK-[A-Z0-9-]+$/.test(row.id||"")&&
      row.editorial_approval===true&&row.release_authorized===true&&
      c?.final_english_signoff===true&&c?.final_french_signoff===true&&
      screen?.manual_semantic_novelty_approved===true&&
      screen.exact_english_collision_count===0&&screen.exact_french_collision_count===0&&
      screen.exact_source_id_collision_count===0&&
      Array.isArray(row.publication_days)&&row.publication_days.includes(date)&&
      row.publication_days.every(validDate)&&
      ((row.pilot_home_copy&&dest?.publishable_deep_link===true&&
          dest.exact_in_app_route_verified===true)||
       (row.editorial_review_copy&&dest?.publishable===true&&
          dest.verified_in_app===true));
 }).filter(row=>{
   const s=row.pilot_source_folio||row.editorial_source_reference;
   if(!s)return false;
   const url=s.url||s.source_url;
   const pages=s.pdf_pages_1based;
   return safeUrl(url)&&s.source_record_id===row.source_id&&
     Array.isArray(pages)&&pages.length>0&&pages.every(n=>Number.isInteger(n)&&n>=1&&n<=5000)&&
     (s.link_browser_verified===true||s.browser_deep_link_checked===true);
 });
 // At most twelve candidates per selected liturgical date; stable ID order.
 return published.sort((a,b)=>a.id.localeCompare(b.id)).slice(0,12);
}
export function dykPublishedPick(data,date){
 const facts=dykPublishedCandidates(data,date);
 const selected=dykHomeRotationSlot(date,facts.map(row=>row.id));
 return facts.find(row=>row.id===selected)||null;
}
export function dykPublishedModel(data,id,date,language="en"){
 const row=dykPublishedCandidates(data,date).find(r=>r.id===id);
 if(!row)return null;
 const c=row.pilot_home_copy||row.editorial_review_copy;
 const s=row.pilot_source_folio||row.editorial_source_reference;
 const fr=language==="fr",url=s.url||s.source_url;
 const isCanon=row.source_family==="ROMAN_MASS_1962"||s.type==="ROMAN_RITUS";
 const label=isCanon?(fr?"Canon romain · Ritus servandus":"Roman Canon · Ritus servandus"):
   row.source_family==="PITRE_1900"?(fr?"Pitrè · Coutumes historiques":"Pitrè · Historical customs"):
   (fr?"Weiser · Coutumes historiques":"Weiser · Historical customs");
 return Object.freeze({id:row.id,language:fr?"fr":"en",fact:c[fr?"fr":"en"],
   label,sourceId:row.source_id,sourceUrl:url,
   links:s.pdf_pages_1based.map(page=>({page,url:url+"#page="+page})),published:true});
}
const STYLE='.aoDykPublishedShade{position:fixed;inset:0;z-index:2147483620;background:#000b;display:flex;justify-content:center;align-items:flex-end}'+
'.aoDykPublishedCard{box-sizing:border-box;width:min(680px,100%);max-height:90vh;overflow:auto;padding:24px 22px 36px;border-radius:16px 16px 0 0;background:var(--ao-bg-canvas,#0a111a);color:var(--ao-text-primary,#eee5d5);border:1px solid var(--ao-rule,#71654f);font:16px/1.65 var(--ao-font-body,Georgia,serif)}'+
'.aoDykPublishedCard h2{margin:12px 0;font:500 24px/1.3 var(--ao-font-display,Georgia,serif)}'+
'.aoDykPublishedCard a{display:inline-block;min-height:44px;padding:6px 0;color:var(--ao-link,#f0d295);overflow-wrap:anywhere}'+
'.aoDykPublishedCard button{float:right;min-width:44px;min-height:44px;border:1px solid currentColor;background:transparent;color:inherit;border-radius:8px;font-size:22px}'+
'@media(min-width:720px){.aoDykPublishedShade{align-items:center;padding:20px}.aoDykPublishedCard{border-radius:16px}}';
export function dykPublishedMarkup(model){
 if(!model?.published||!safeUrl(model.sourceUrl)||!Array.isArray(model.links)||!model.links.length||
   model.links.some(x=>Number.isInteger(x.page)?
     (x.page<1||x.page>5000||x.url!==model.sourceUrl+"#page="+x.page):
     (x.page!==null||x.url!==model.sourceUrl||!clean(x.label))))return "";
 const fr=model.language==="fr";
 return '<style>'+STYLE+'</style><div class="aoDykPublishedShade" data-dyk-published-shade>'+
   '<article class="aoDykPublishedCard" role="dialog" aria-modal="true" aria-labelledby="ao-dyk-published-title" data-dyk-published="'+esc(model.id)+'">'+
   '<button type="button" data-dyk-published-close aria-label="'+(fr?"Fermer":"Close")+'">×</button>'+
   '<small>'+esc(model.label)+'</small><h2 id="ao-dyk-published-title">'+
   (fr?"Le saviez-vous ?":"Did you know?")+'</h2><p>'+esc(model.fact)+'</p>'+
   '<p>'+esc(fr?"Source originale":"Original source")+' · '+esc(model.sourceId)+'</p>'+
   model.links.map((x,i)=>'<p><a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+
     esc(x.page===null?x.label:(fr?"Consulter la source, PDF p. ":"Read source, PDF p. ")+x.page)+'</a></p>').join("")+
   '<small>'+esc(fr?"Contexte historique ou rubrique de 1962 selon la source citée.":"Historical context or 1962 rubric, as identified in the cited source.")+'</small>'+
   '</article></div>';
}
export async function openDykPublishedSource(win,{id,date,language="en",trigger}={}){
 if(!win?.document?.createElement||!id||!validDate(date))return false;
 const [data,historical,r50,r50b,mixed,h125,h150,h175,h200]=await Promise.all([
   loadDykPrioritySelection(win).catch(()=>null),
   loadDykHistoricalRelease(win).catch(()=>null),
   loadDykWeiser16Release(win).catch(()=>null),
   loadDykWeiserSecond16Release(win).catch(()=>null),
   loadDykMixed24Release(win).catch(()=>null),
   loadDyk125Release(win).catch(()=>null),
   loadDyk150Release(win).catch(()=>null),
   loadDyk175Release(win).catch(()=>null),
   loadDyk200Release(win).catch(()=>null)
 ]);
 const model=dykPublishedModel(data,id,date,language)||
   dykHistoricalModel(historical,id,date,language)||
   dykWeiser16Model(r50,id,date,language)||
   dykWeiserSecond16Model(r50b,id,date,language)||
   dykMixed24Model(mixed,id,date,language)||
   dyk125Model(h125,id,date,language)||
   dyk150Model(h150,id,date,language)||
   dyk175Model(h175,id,date,language)||
   dyk200Model(h200,id,date,language);
 if(!model)return false;
 const node=win.document.createElement("div");node.innerHTML=dykPublishedMarkup(model);
 const shade=node.querySelector("[data-dyk-published-shade]");
 const close=()=>{node.remove();try{trigger?.focus?.({preventScroll:true})}catch{trigger?.focus?.()}};
 if(!shade)return false;
 node.addEventListener("click",event=>{
   if(event.target===shade||event.target?.closest?.("[data-dyk-published-close]"))close();
 });
 node.addEventListener("keydown",event=>{
   if(event.key==="Escape"){event.preventDefault?.();close();return}
   if(event.key!=="Tab")return;
   const items=[...node.querySelectorAll('button,a')];
   if(!items.length)return;
   if(event.shiftKey&&win.document.activeElement===items[0]){event.preventDefault?.();items.at(-1).focus()}
   else if(!event.shiftKey&&win.document.activeElement===items.at(-1)){event.preventDefault?.();items[0].focus()}
 });
 win.document.body.appendChild(node);
 node.querySelector("[data-dyk-published-close]")?.focus?.();
 return true;
}
