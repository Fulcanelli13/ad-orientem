import path from "node:path";
import { pathToFileURL } from "node:url";
import { countryCodeFromText } from "./lib/country-codes.mjs";
import { absoluteUrl, emailAddresses, extractAnchors, extractTableRows, fetchText, phoneCandidates, stripTags } from "./lib/html-source-utils.mjs";
import { writeDirectoryDataset } from "./lib/write-directory-dataset.mjs";
import { selectOfficialGeoFromHtml } from "./lib/official-geo-utils.mjs";

export const FSSP_DIRECTORY_URL="https://www.fssp.org/en/find-us/where-are-we/";
export const FSSP_SOURCE_ID="SRC_FSSP_WORLD_DIRECTORY";

function slugify(value){
  return String(value??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
}
function venueType(name){
  const n=String(name??"").toLowerCase();
  if(/\b(house|haus|huis|maison|casa)\b/.test(n))return "residence";
  if(/seminar/.test(n))return "seminary";
  if(/monast|abbey|abbaye/.test(n))return "monastery";
  if(/chapel|chapelle|kapelle|capilla/.test(n))return "chapel";
  if(/oratory|oratoire/.test(n))return "oratory";
  if(/church|eglise|église|kirche|parish|paroisse|parroquia/.test(n))return "church";
  return "other";
}
function dioceseFromText(value){
  const match=String(value??"").match(/(?:Arch)?Dioc(?:ese|èse|esis|eze|èse)\s*:\s*([^\n/]+)/i);
  return match?.[1]?.trim()??null;
}
function massText(value){
  const text=String(value??"");
  const match=text.match(/(?:Masses?|Messes?|Misas?)\s*:\s*([\s\S]+)/i);
  return match?.[1]?.trim()??null;
}
function rowLink(row,pageUrl){
  const links=extractAnchors(row.html,pageUrl);
  return links.find(a=>/detail|détail|plus|more/i.test(a.text))?.url
    ?? links.find(a=>a.url!==pageUrl)?.url
    ?? null;
}
const FSSP_CONTROL_TITLES=new Set(["←","→","↑","↓","+","-","Home","End","Page Up","Page Down"]);
function isDirectoryControlRow(title,address){
  if(FSSP_CONTROL_TITLES.has(String(title??"").trim()))return true;
  return /^(?:Move (?:left|right|up|down)|Zoom (?:in|out)|Jump (?:left|right|up|down) by 75%)$/i.test(String(address??"").trim());
}
function rowRecord(row,pageUrl,index){
  const texts=row.cells.map(c=>c.text.trim());
  const descIndex=texts.findIndex(t=>/(?:Arch)?Dioc(?:ese|èse|esis)|Masses?|Messes?|Misas?/i.test(t));
  let title=null,address=null,description=null;
  if(descIndex>=2){
    title=texts[descIndex-2]||null;
    address=texts[descIndex-1]||null;
    description=texts.slice(descIndex).filter(Boolean).join(" ");
  }else{
    const nonEmpty=texts.map((text,i)=>({text,i})).filter(x=>x.text);
    title=nonEmpty[0]?.text??null;
    address=nonEmpty[1]?.text??null;
    description=nonEmpty.slice(2).map(x=>x.text).join(" ");
  }
  if(!title||/^(image|title|address|description|link)$/i.test(title)||/^(image|title|address|description|link)$/i.test(address??"")||isDirectoryControlRow(title,address))return null;
  const countryCode=countryCodeFromText(address)??countryCodeFromText(description);
  const detailUrl=rowLink(row,pageUrl);
  return {index,title,address,description,countryCode,detailUrl,diocese:dioceseFromText(description),massRaw:massText(description)};
}

export function parseFsspDirectoryHtml(html,{pageUrl=FSSP_DIRECTORY_URL}={}){
  return extractTableRows(html).map((row,index)=>rowRecord(row,pageUrl,index)).filter(Boolean);
}

async function enrichDetail(record,{fetchImpl=fetch}={}){
  if(!record.detailUrl)return {...record,detailText:null,emails:[],phones:[],externalLinks:[]};
  try{
    const html=await fetchText(record.detailUrl,{fetchImpl});
    const text=stripTags(html);
    const links=extractAnchors(html,record.detailUrl).map(x=>x.url);
    const officialGeo=selectOfficialGeoFromHtml(html,{pageUrl:record.detailUrl});
    return {...record,detailText:text,emails:emailAddresses(text),phones:phoneCandidates(text),externalLinks:[...new Set(links)],officialGeo:officialGeo.geo,officialGeoAmbiguous:officialGeo.ambiguous};
  }catch(error){
    return {...record,detailText:null,emails:[],phones:[],externalLinks:[],detailWarning:String(error?.message??error)};
  }
}

async function concurrentMap(items,concurrency,mapper){
  const out=new Array(items.length);let cursor=0;
  async function worker(){while(true){const i=cursor++;if(i>=items.length)return;out[i]=await mapper(items[i],i);}}
  await Promise.all(Array.from({length:Math.max(1,concurrency)},()=>worker()));
  return out;
}

export function buildFsspDataset(records,{retrievedAt=new Date().toISOString()}={}){
  const venues=[],ministries=[],schedules=[],sources=[],exactDuplicateRows=[];
  const seenKeys=new Map();
  for(const record of records){
    const key=slugify(`${record.title}-${record.address}`)||`row-${record.index}`;
    if(seenKeys.has(key)){
      exactDuplicateRows.push({
        key,
        first_row_index:seenKeys.get(key),
        duplicate_row_index:record.index,
        title:record.title,
        address:record.address,
      });
      continue;
    }
    seenKeys.set(key,record.index);
    const venueId=`ao-fssp-${key}`,sourceId=`src-fssp-${key}`;
    const contactUrls=[record.detailUrl,...(record.externalLinks??[])].filter(Boolean);
    const venue={
      venue_id:venueId,
      name:{official:record.title,alternate:[]},
      venue_type:venueType(record.title),
      upstream:{provider:"FSSP_WORLD_DIRECTORY",row_index:record.index,detail_url:record.detailUrl??null},
      address:{line1:null,line2:null,postal_code:null,city:null,region:null,country_code:record.countryCode,country:null,formatted:record.address},
      geo:record.officialGeo??{lat:null,lng:null,precision:"unknown",geocoding_source:null},
      diocese:{diocese_id:null,name:record.diocese,type:"diocese"},
      contact:{phone:record.phones??[],email:record.emails??[],website:[...new Set(contactUrls)],schedule_url:record.detailUrl?[record.detailUrl]:[],bulletin_url:[],contact_form:[],official_social:[]},
      status:"active",source_ids:[sourceId],upstream_updated_at:null
    };
    const ministry={
      ministry_id:`ao-ministry-${venueId}`,venue_id:venueId,community_id:"FSSP",relationship:"served_by",
      affiliation_confidence:"DIRECT",community_profile_ref:"FSSP",
      liturgical_usage:{family:"ROMAN",books:"1962",mass_form:"TRADITIONAL_LATIN",evidence_source_ids:["SRC_FSSP_WORLD_DIRECTORY"]},
      active:true,source_ids:[sourceId]
    };
    if(record.massRaw){
      schedules.push({schedule_id:`ao-schedule-${key}-1`,ministry_id:ministry.ministry_id,service_type:"MASS",mass_type:"UNKNOWN",payload:{raw:record.massRaw},source_ids:[sourceId],verification:{state:"OFFICIAL_LIVE",checked_at:retrievedAt}});
    }
    sources.push({source_id:sourceId,registry_source_id:FSSP_SOURCE_ID,source_type:"COMMUNITY_OFFICIAL",publisher:"Priestly Fraternity of Saint Peter",title:record.title,url:record.detailUrl??FSSP_DIRECTORY_URL,retrieved_at:retrievedAt,authority:"PRIMARY",fields_supported:["venue","venue.geo","venue.diocese","venue.contact","schedule"]});
    venues.push(venue);ministries.push(ministry);
  }
  return {venues,ministries,schedules,sources,exactDuplicateRows};
}

async function renderFsspDirectoryHtml(url=FSSP_DIRECTORY_URL){
  const { chromium }=await import("@playwright/test");
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage();
    await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000});
    await page.waitForTimeout(2500);
    await page.waitForLoadState("networkidle",{timeout:15000}).catch(()=>{});
    return await page.content();
  }finally{await browser.close();}
}

export async function runFsspImport({out="data/directory/generated/fssp",concurrency=6,fetchImpl=fetch}={}){
  let html=await fetchText(FSSP_DIRECTORY_URL,{fetchImpl});
  let base=parseFsspDirectoryHtml(html);
  if(base.length===0){
    html=await renderFsspDirectoryHtml(FSSP_DIRECTORY_URL);
    base=parseFsspDirectoryHtml(html);
  }
  if(base.length < 100) {
    throw new Error(`FSSP import coverage guard: expected at least 100 official directory rows, received ${base.length}.`);
  }
  const records=await concurrentMap(base,concurrency,record=>enrichDetail(record,{fetchImpl}));
  const retrievedAt=new Date().toISOString();
  const dataset=buildFsspDataset(records,{retrievedAt});
  const countryKnown=dataset.venues.filter(v=>v.address.country_code).length;
  const result=await writeDirectoryDataset(path.resolve(out),{
    provider:"FSSP",retrievedAt,...dataset,
    coverage:{
      source_rows:base.length,
      canonical_unique_rows:dataset.venues.length,
      exact_duplicate_rows:dataset.exactDuplicateRows.length,
      detail_pages_attempted:base.filter(r=>r.detailUrl).length,
      country_code_known:countryKnown,
      country_code_unknown:dataset.venues.length-countryKnown,
      official_geo_recovered:records.filter(r=>r.officialGeo).length,
      official_geo_ambiguous:records.filter(r=>r.officialGeoAmbiguous).length
    }
  });
  return result.report;
}

const invoked=process.argv[1]?pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url:false;
if(invoked)runFsspImport().then(r=>process.stdout.write(JSON.stringify(r,null,2)+"\n")).catch(e=>{console.error(e);process.exitCode=1;});
