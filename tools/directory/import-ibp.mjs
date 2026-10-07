import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { countryCodeFromText } from "./lib/country-codes.mjs";
import { attrValue, emailAddresses, fetchText, phoneCandidates, stripTags, textLines, absoluteUrl } from "./lib/html-source-utils.mjs";
import { writeDirectoryDataset } from "./lib/write-directory-dataset.mjs";

export const IBP_INDEX_URL="https://www.institutdubonpasteur.org/nos-apostolats/lieux-dapostolat-dans-le-monde/";

function slugify(v){return String(v??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");}
function venueType(name){
  const n=String(name??"").toLowerCase();
  if(/séminaire|seminar/.test(n))return "seminary";
  if(/chapelle|capela|chapel/.test(n))return "chapel";
  if(/église|eglise|church|paroisse|parish/.test(n))return "church";
  if(/centre/.test(n))return "other";
  if(/maison|casa/.test(n))return "residence";
  return "other";
}
export function discoverIbpIndex(html,{pageUrl=IBP_INDEX_URL}={}){
  let currentCountry=null,currentDiocese=null;
  const out=[],seen=new Set();
  const re=/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>|<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  let m,index=0;
  while((m=re.exec(String(html??"")))){
    if(m[1]){
      const heading=stripTags(m[2]);
      const cc=countryCodeFromText(heading);
      if(cc){currentCountry=cc;currentDiocese=null;}
      if(/(?:archi)?diocèse|diocese|patriarcat/i.test(heading))currentDiocese=heading.replace(/\s*:\s*$/,"").trim();
      continue;
    }
    const body=m[3],text=stripTags(body);
    if(!text||/retour|liste|implantations/i.test(text))continue;
    const anchor=body.match(/<a\b([^>]*)>([\s\S]*?)<\/a>/i);
    const href=anchor?attrValue(anchor[1],"href"):null;
    const url=href?absoluteUrl(href,pageUrl):pageUrl+`#index-${index}`;
    if(href){
      const parsed=new URL(url);
      if(!/institutdubonpasteur\.org$/i.test(parsed.hostname))continue;
      if(!parsed.pathname.includes("/nos-apostolats/lieux-dapostolat-dans-le-monde/"))continue;
      if(url.replace(/\/$/,"")===pageUrl.replace(/\/$/,""))continue;
    }
    const key=`${currentCountry}|${currentDiocese}|${text}`;
    if(seen.has(key))continue;
    seen.add(key);
    out.push({label:text,url,countryCode:currentCountry,diocese:currentDiocese,indexOnly:!href});
    index+=1;
  }
  return out;
}
function addressBlock(lines){
  const i=lines.findIndex(line=>/^Adresse\s*:/i.test(line));
  if(i<0)return null;
  const out=[];
  const rem=lines[i].replace(/^Adresse\s*:\s*/i,"").trim();if(rem)out.push(rem);
  for(let j=i+1;j<lines.length;j+=1){
    if(/^(Prêtre|Pretre|Supérieur|Superieur|Coopérateur|Cooperateur|Numéro de téléphone|Telephone|Téléphone|E-mail|Email|Site|Facebook|Instagram)\s*:/i.test(lines[j]))break;
    out.push(lines[j]);
  }
  return out.join(", ")||null;
}
function massBlock(lines){
  const addressIndex=lines.findIndex(line=>/^Adresse\s*:/i.test(line));
  const source=addressIndex>0?lines.slice(0,addressIndex):lines;
  return source.filter(line=>/Messe|Mass|Confession|Adoration|Chapelet|Salut du Saint Sacrement/i.test(line)).join("\n")||null;
}
function parseDetail(html,candidate){
  const lines=textLines(html),text=stripTags(html);
  const titleMatch=String(html).match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const title=titleMatch?stripTags(titleMatch[1]):candidate.label;
  const address=addressBlock(lines);
  return {
    title,address,countryCode:candidate.countryCode??countryCodeFromText(address),diocese:candidate.diocese,detailUrl:candidate.url,
    emails:emailAddresses(text),phones:phoneCandidates(text),massRaw:massBlock(lines),detailText:text
  };
}
async function concurrentMap(items,concurrency,mapper){
  const out=new Array(items.length);let cursor=0;
  async function worker(){while(true){const i=cursor++;if(i>=items.length)return;out[i]=await mapper(items[i],i);}}
  await Promise.all(Array.from({length:Math.max(1,concurrency)},()=>worker()));return out;
}
export function buildIbpDataset(records,{retrievedAt=new Date().toISOString()}={}){
  const venues=[],ministries=[],schedules=[],sources=[];
  records.forEach((r,index)=>{
    const key=slugify(`${r.title}-${r.address||r.detailUrl}-${index}`);
    const venueId=`ao-ibp-${key}`,sourceId=`src-ibp-${key}`;
    venues.push({
      venue_id:venueId,name:{official:r.title,alternate:[]},venue_type:venueType(r.title),
      upstream:{provider:"IBP_WORLD_DIRECTORY",detail_url:r.detailUrl},
      address:{line1:null,line2:null,postal_code:null,city:r.city??null,region:null,country_code:r.countryCode,country:null,formatted:r.address??r.city??null},
      geo:{lat:null,lng:null,precision:"unknown",geocoding_source:null},
      diocese:{diocese_id:null,name:r.diocese??null,type:"diocese"},
      contact:{phone:r.phones??[],email:r.emails??[],website:[r.detailUrl].filter(Boolean),schedule_url:[r.detailUrl].filter(Boolean),bulletin_url:[],contact_form:[],official_social:[]},
      status:"active",source_ids:[sourceId],upstream_updated_at:null
    });
    const ministryId=`ao-ministry-${venueId}`;
    ministries.push({
      ministry_id:ministryId,venue_id:venueId,community_id:"IBP",relationship:"served_by",affiliation_confidence:"DIRECT",community_profile_ref:"IBP",
      liturgical_usage:{family:"ROMAN",books:"1962",mass_form:"TRADITIONAL_LATIN",evidence_source_ids:["SRC_IBP_LITURGICAL_CHARISM"]},
      active:true,source_ids:[sourceId]
    });
    if(r.massRaw)schedules.push({schedule_id:`ao-schedule-${key}-1`,ministry_id:ministryId,service_type:"MASS",mass_type:"UNKNOWN",payload:{raw:r.massRaw},source_ids:[sourceId],verification:{state:"OFFICIAL_LIVE",checked_at:retrievedAt}});
    sources.push({source_id:sourceId,registry_source_id:"SRC_IBP_WORLD_DIRECTORY",source_type:"COMMUNITY_OFFICIAL",publisher:"Institute of the Good Shepherd",title:r.title,url:r.detailUrl,retrieved_at:retrievedAt,authority:"PRIMARY",fields_supported:["venue","venue.diocese","venue.contact","schedule"]});
  });
  return {venues,ministries,schedules,sources};
}
async function loadIbpIndexWitness(){
  const raw=await fs.readFile(new URL("../../data/directory/source-witnesses/ibp-index-2026-10-07.v1.json",import.meta.url),"utf8");
  return JSON.parse(raw);
}

export function mergeIbpIndexWitness(discovered,witness){
  const remaining=[...(Array.isArray(discovered)?discovered:[])];
  const merged=[];
  for(const entry of witness?.entries??[]){
    const cityKey=slugify(entry.city);
    const labelKey=slugify(entry.label);
    const index=remaining.findIndex(candidate=>{
      if(candidate.countryCode&&candidate.countryCode!==entry.country_code)return false;
      const candidateKey=slugify(candidate.label);
      return candidateKey===labelKey
        || (cityKey.length>=4&&candidateKey.includes(cityKey))
        || (candidateKey.length>=4&&labelKey.includes(candidateKey));
    });
    const candidate=index>=0?remaining.splice(index,1)[0]:null;
    merged.push({
      ...(candidate??{}),
      label:candidate?.label??entry.label,
      url:candidate?.url??IBP_INDEX_URL,
      countryCode:entry.country_code,
      diocese:candidate?.diocese??entry.diocese,
      city:entry.city,
      indexOnly:candidate?.indexOnly??!candidate,
      witnessOnly:!candidate
    });
  }
  for(const candidate of remaining)merged.push({...candidate,sourceDiscoveryExtra:true});
  return merged;
}

export async function runIbpImport({out="data/directory/generated/ibp",concurrency=6,fetchImpl=fetch}={}){
  const html=await fetchText(IBP_INDEX_URL,{fetchImpl});
  const liveCandidates=discoverIbpIndex(html);
  if(liveCandidates.length < 20) throw new Error(`IBP live-discovery guard: expected a substantial official index, discovered only ${liveCandidates.length} entries.`);
  const witness=await loadIbpIndexWitness();
  const candidates=mergeIbpIndexWitness(liveCandidates,witness);
  if(candidates.length < witness.enumerated_entry_count) throw new Error(`IBP witness merge lost entries: expected at least ${witness.enumerated_entry_count}, produced ${candidates.length}.`);
  const records=await concurrentMap(candidates,concurrency,async candidate=>{
    if(candidate.indexOnly)return {title:candidate.label,address:null,countryCode:candidate.countryCode,diocese:candidate.diocese,detailUrl:IBP_INDEX_URL,emails:[],phones:[],massRaw:null,indexOnly:true};
    try{return parseDetail(await fetchText(candidate.url,{fetchImpl}),candidate);}
    catch(error){return {title:candidate.label,address:null,countryCode:candidate.countryCode,diocese:candidate.diocese,detailUrl:candidate.url,emails:[],phones:[],massRaw:null,detailWarning:String(error?.message??error)};}
  });
  const retrievedAt=new Date().toISOString(),dataset=buildIbpDataset(records,{retrievedAt});
  const result=await writeDirectoryDataset(path.resolve(out),{
    provider:"IBP",retrievedAt,...dataset,
    coverage:{
      live_discovered_entries:liveCandidates.length,
      witness_enumerated_entries:witness.enumerated_entry_count,
      official_claimed_apostolates:witness.published_summary?.apostolate_count_claim??null,
      merged_entries:candidates.length,
      witness_only_entries:candidates.filter(x=>x.witnessOnly).length,
      live_extra_entries:candidates.filter(x=>x.sourceDiscoveryExtra).length,
      detail_records:records.length,
      country_code_known:records.filter(r=>r.countryCode).length,
      source_count_discrepancy:witness.discrepancy
    }
  });
  return result.report;
}
const invoked=process.argv[1]?pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url:false;
if(invoked)runIbpImport().then(r=>process.stdout.write(JSON.stringify(r,null,2)+"\n")).catch(e=>{console.error(e);process.exitCode=1;});
