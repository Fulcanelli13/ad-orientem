import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {loadDirectoryDataset} from "../../src/find/data-service.js";

const normalized=value=>String(value??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const meaningful=s=>normalized(s).split(" ").filter(t=>t.length>1);
const commonNames=new Set(["church","chapel","saint","st","santa","santo","holy","eglise","chapelle","de","la","le","du","des","of","the","our","lady","parish","catholic","notre","dame"]);
function compareNames(a,b){
 const as=new Set(meaningful(a).filter(t=>!commonNames.has(t)));
 const bs=new Set(meaningful(b).filter(t=>!commonNames.has(t)));
 if(!as.size||!bs.size)return 0;
 let intersection=0;for(const t of as)if(bs.has(t))intersection++;
 return intersection/Math.max(as.size,bs.size);
}
async function fetchFromRepositoryFiles(url){
 if(!url.startsWith("file:"))return {ok:false,status:404};
 try{const buffer=await fs.readFile(fileURLToPath(url),"utf8");
  return {ok:true,json:async()=>JSON.parse(buffer)}
 }catch{return {ok:false,status:404}}
}
export async function reconcileApprovedCandidates(corpus,{loadExisting=loadDirectoryDataset}={}){
 if(!Array.isArray(corpus?.records))throw Error("Missing candidate records");
 const existing=(await loadExisting({fetchImpl:fetchFromRepositoryFiles})).records;
 const existingCountry=new Map();
 for(const record of existing){
  const venue=record.venue??{},cc=venue.address?.country_code;
  if(!cc)continue;
  const row={venue_id:venue.venue_id,name:venue.name?.official??"",address:venue.address?.formatted||"",
   city:venue.address?.city||"",communities:(record.ministries||[]).map(m=>m.community_id)};
  if(!existingCountry.has(cc))existingCountry.set(cc,[]);
  existingCountry.get(cc).push(row);
 }
 const summary={third_party_source_records:corpus.records.length,existing_directory_records:existing.length,
  matched_name_review:0,ambiguous_name_review:0,likely_novel_needs_source:0,
  requires_detail:0,has_mass_claim_and_original_link:0,no_mass_in_detail:0,primary_source_missing:0,
  published:0,by_country:{}};
 const results=[];
 for(const candidate of corpus.records){
  const cc=String(candidate.country_code||"").toUpperCase();
  const pool=existingCountry.get(cc)||[];
  const close=pool.map(v=>({...v,score:compareNames(candidate.name,v.name)}))
    .filter(v=>v.score>=0.85).sort((a,b)=>b.score-a.score).slice(0,10);
  const state=close.length===1?"NAME_ONLY_CANDIDATE_MATCH":
    close.length>1?"AMBIGUOUS_NAME_MATCH":"UNMATCHED_RESEARCH_LEAD";
  if(close.length===1)summary.matched_name_review++;
  else if(close.length>1)summary.ambiguous_name_review++;
  else summary.likely_novel_needs_source++;
  let evidence="NEEDS_DETAIL_FETCH";
  if(candidate.has_mass_evidence===false)evidence="NO_MASS_IN_DETAIL";
  else if(candidate.has_mass_evidence===true&&candidate.original_sources?.length)evidence="MASS_CLAIM_WITH_ORIGINAL_LINK_TO_CHECK";
  else if(candidate.has_mass_evidence===true)evidence="MASS_CLAIM_NO_ORIGINAL_LINK";
  if(evidence==="NEEDS_DETAIL_FETCH")summary.requires_detail++;
  else if(evidence==="NO_MASS_IN_DETAIL")summary.no_mass_in_detail++;
  else if(evidence==="MASS_CLAIM_WITH_ORIGINAL_LINK_TO_CHECK")summary.has_mass_claim_and_original_link++;
  else summary.primary_source_missing++;
  const bucket=summary.by_country[cc]??={candidates:0,name_matches:0,needs_detail:0,needs_original_check:0};
  bucket.candidates++;
  if(close.length)bucket.name_matches++;
  if(evidence==="NEEDS_DETAIL_FETCH")bucket.needs_detail++;
  else bucket.needs_original_check++;
  results.push({source_id:candidate.source_id,name:candidate.name,country_code:cc,
   directory_url:candidate.directory_url,source_state:evidence,duplicate_state:state,
   candidate_matches:close.map(m=>({venue_id:m.venue_id,name:m.name,score:m.score})),
   original_sources:candidate.original_sources||[],publication_state:"RESEARCH_ONLY_NOT_MASS_VENUE"});
 }
 return {schema:"AO_APPROVED_MASS_CROSSWALK_V1",reviewed_at:new Date().toISOString(),summary,
  warning:"Name matches are non-binding research hints. Mass and liturgical form require confirmation from the original source.",
  candidates:results};
}
const invoked=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(invoked){
 const input=process.argv[2],out=process.argv[3];
 if(!input||!out)throw Error("Usage: node tools/directory/reconcile-approved-mass-candidates.mjs INPUT.json OUTPUT.json");
 const corpus=JSON.parse(await fs.readFile(input,"utf8"));
 const result=await reconcileApprovedCandidates(corpus);
 await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,JSON.stringify(result,null,2)+"\n");
 console.log(JSON.stringify({summary:result.summary,...{by_country:undefined}}));
}
