// Future Home Did You Know adapter for the 526-card editorial shortlist.
// Deliberately NOT imported by the live Home reader or any current release bank.
// The staged research preview always fails closed: a distinct, owner-authorized
// release artifact and explicit runtime opt-in are BOTH required.
import {dykHomeRotationSlot} from "./dyk-published-feed.js";

export const DYK_526_PREVIEW_SCHEMA="AO_DYK_EDITORIAL_DISPLAY_PREVIEW_526_V1";
export const DYK_526_RELEASE_SCHEMA="AO_DYK_526_APPROVED_RELEASE_V1";
export const DYK_526_DEFAULT_ENABLED=false;

const FIELDS=Object.freeze([
 "owner_approved","editorial_final_en_signoff","editorial_final_fr_signoff",
 "semantic_novelty_approved","source_reference_checked",
 "release_authorized","published"
]);
const clean=x=>typeof x==="string"?x.trim():"";
const validId=x=>/^DYK-[A-Z0-9-]+$/.test(x||"");
const safeUrl=x=>/^https:\/\/[^\s<>"']+$/.test(clean(x));
const normalize=s=>clean(s).normalize("NFKC").toLocaleLowerCase().replace(/\s+/g," ");
const validDate=x=>{
 if(typeof x!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(x))return false;
 const n=new Date(x+"T12:00:00Z");
 return !Number.isNaN(n.getTime())&&n.toISOString().slice(0,10)===x;
};

function eligible(row){
 const gate=row?.release_gate,source=row?.published_source,meta=row?.research_provenance;
 return validId(row?.id)&&
   (row.category==="CUSTOMS"||row.category==="GLOSSARY")&&
   (row.interest_tier==="PRIORITY"||row.interest_tier==="RESERVE")&&
   (row.editorial?.claude_verdict==="KEEP"||row.editorial?.claude_verdict==="REWRITE")&&
   row.editorial?.owner_decision==="APPROVED"&&
   row.editorial?.copy_adjustment_pending===false&&
   row.eligibility==="APPROVED_FOR_LIVE"&&
   clean(row.proposed_title?.en).length>3&&clean(row.proposed_title?.fr).length>3&&
   clean(row.proposed_copy?.en).length>25&&clean(row.proposed_copy?.fr).length>25&&
   meta?.master_fact_id===row.id&&
   clean(meta?.source_ids_raw).length>0&&clean(meta?.source_urls_raw).length>0&&
   FIELDS.every(k=>gate?.[k]===true)&&
   safeUrl(source?.url)&&clean(source?.source_id).length>0&&
   source?.source_record_id===source?.source_id&&
   source?.deep_link_verified===true;
}

/**
 * A separate approved release artifact must pass global gates. The 526-row
 * research preview NEVER passes, even if options.enabled is explicitly true.
 * `options.enabled` defaults to false, and no production caller enables it.
 * A malformed or duplicate-ID release is rejected in its entirety.
 */
export function dyk526ApprovedCandidates(data,{enabled=false}={}){
 if(enabled!==true||data?.schema!==DYK_526_RELEASE_SCHEMA||
   data?.release_stage!=="APPROVED_PARTIAL_LIVE"||
   data?.published!==true||data?.global_release_authorized!==true||
   data?.owner_release_decision!=="APPROVED"||
   !Array.isArray(data.records)||!data.records.length||
   data.records.length>526)return [];
 const ids=new Set();
 for(const row of data.records){
   if(!validId(row?.id)||ids.has(row.id))return [];
   ids.add(row.id);
 }
 const uniqueEn=new Set(),uniqueFr=new Set();
 const candidates=[];
 for(const row of data.records){
   // One uncertified record invalidates the whole release, not just that card.
  if(!eligible(row))return [];
   const titleEn=normalize(row.proposed_title.en),titleFr=normalize(row.proposed_title.fr);
   const factEn=normalize(row.proposed_copy.en),factFr=normalize(row.proposed_copy.fr);
   // Do not silently publish title collisions or exact repeated copy.
   if(uniqueEn.has(titleEn)||uniqueFr.has(titleFr)||
      uniqueEn.has(factEn)||uniqueFr.has(factFr))return [];
   uniqueEn.add(titleEn);uniqueFr.add(titleFr);
   uniqueEn.add(factEn);uniqueFr.add(factFr);
   candidates.push(row);
 }
 return candidates;
}

/** Stable daily rotation from an already authorized subset (no Glossary fallback). */
export function dyk526Pick(data,date,options={}){
 if(!validDate(date))return null;
 const list=dyk526ApprovedCandidates(data,options);
 if(!list.length)return null;
 const id=dykHomeRotationSlot(date,list.map(row=>row.id),[]);
 return list.find(row=>row.id===id)||null;
}

/** Compatible with the existing source-detail model; adds bilingual title. */
export function dyk526Model(data,id,date,language="en",options={}){
 if(!validDate(date)||!validId(id))return null;
 const item=dyk526ApprovedCandidates(data,options).find(row=>row.id===id);
 if(!item)return null;
 const fr=language==="fr",source=item.published_source;
 const label=item.category==="CUSTOMS"?
   (fr?"Coutumes et traditions":"Customs and traditions"):
   (fr?"Découvertes du glossaire":"Glossary discoveries");
 return Object.freeze({
   id:item.id,language:fr?"fr":"en",
   title:item.proposed_title[fr?"fr":"en"],
   fact:item.proposed_copy[fr?"fr":"en"],
   label,sourceId:source.source_id,sourceUrl:source.url,
   links:[{page:null,url:source.url,label:fr?"Consulter la source":"Read the source"}],
   published:true
 });
}
