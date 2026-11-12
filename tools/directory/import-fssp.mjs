import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { countryCodeFromText } from "./lib/country-codes.mjs";
import { absoluteUrl, emailAddresses, extractAnchors, extractTableRows, fetchText, phoneCandidates, stripTags } from "./lib/html-source-utils.mjs";
import { writeDirectoryDataset } from "./lib/write-directory-dataset.mjs";
import { selectOfficialGeoFromHtml } from "./lib/official-geo-utils.mjs";

export const FSSP_DIRECTORY_URL="https://www.fssp.org/en/find-us/where-are-we/";
export const FSSP_MARKERS_URL="https://www.fssp.org/wp-json/wpgmza/v1/markers";
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


/**
 * First-party WP Go Maps REST data powering the exact FSSP worldwide directory.
 * Only map 1 is the public directory. Do not admit control rows, anonymous
 * records, duplicate marker IDs, empty addresses or unknown countries.
 * Source-provided coordinates are intentionally NOT published from this
 * research importer; CL2/Excel approval remains the map admission gate.
 */
export function parseFsspOfficialMarkers(payload){
  if(!Array.isArray(payload))throw new Error("FSSP official markers schema drift: expected array");
  const markers=payload.filter(m=>m&&String(m.map_id??"")==="1");
  const ids=new Set();
  return markers.map((m,index)=>{
    const markerId=String(m.id??"").trim();
    const title=stripTags(String(m.title??"")).trim();
    const address=stripTags(String(m.address??"")).trim();
    const description=stripTags(String(m.description??"")).trim();
    if(!markerId||ids.has(markerId))throw new Error("FSSP official markers: missing or duplicate source marker ID");
    ids.add(markerId);
    if(!title||!address||!description||isDirectoryControlRow(title,address))
      throw new Error(`FSSP official markers: incomplete or control record ${markerId}`);
    const countryCode=countryCodeFromText(address)??countryCodeFromText(description);
    if(!countryCode)throw new Error(`FSSP official markers: unknown country for marker ${markerId}`);
    const rawLink=String(m.link??"").trim();
    let link=null;
    if(rawLink){
      try{const parsed=new URL(rawLink);if(["http:","https:"].includes(parsed.protocol))link=parsed.href;}
      catch{}
    }
    return {index,title,address,description,countryCode,detailUrl:null,
      diocese:dioceseFromText(description),massRaw:massText(description),
      upstreamMarkerId:markerId,
      emails:emailAddresses(description),phones:phoneCandidates(description),
      externalLinks:link?[link]:[]};
  });
}

function normalizedHost(url){
  try{return new URL(url).hostname.toLowerCase().replace(/^www\./,"");}catch{return null}
}
function likelyGeoLink(anchor,detailUrl){
  const baseHost=normalizedHost(detailUrl),linkHost=normalizedHost(anchor?.url);
  if(!baseHost||!linkHost||baseHost!==linkHost)return false;
  const signal=(String(anchor?.text??"")+" "+String(anchor?.url??"")).toLowerCase();
  return /(contact|kontakt|contatt|contacto|directions|direction|location|where|visit|access|find|map|nous-contacter|pour-nous-contacter|horaires|schedule|mass-times|mass-schedule|parish|church)/i.test(signal)
    && !/\.(?:pdf|jpe?g|png|gif|webp|svg)(?:$|[?#])/i.test(anchor.url);
}
function canonicalVenueIdForRecord(record){
  const key=slugify(`${record.title}-${record.address}`)||`row-${record.index}`;
  return `ao-fssp-${key}`;
}
async function loadPreviouslyUnresolved(out){
  try{
    const raw=await fs.readFile(path.join(path.resolve(out),"geocode-report.v1.json"),"utf8");
    const report=JSON.parse(raw);
    return new Set((report?.unresolved_records??[]).map(x=>x?.venue_id).filter(Boolean));
  }catch{return new Set();}
}
function coherentGeoList(geos){
  if(geos.length<=1)return true;
  const first=geos[0];
  return geos.every(g=>Math.abs(Number(g.lat)-Number(first.lat))<=0.00035&&Math.abs(Number(g.lng)-Number(first.lng))<=0.00035);
}
export function linkedOfficialGeoPageCandidates(anchors,detailUrl,{maxPages=2}={}){
  const pages=anchors.filter(a=>likelyGeoLink(a,detailUrl)).map(a=>a.url);
  return [...new Set(pages)].filter(url=>url!==detailUrl).slice(0,maxPages);
}
export async function recoverLinkedOfficialGeo(record,anchors,{fetchImpl=fetch,maxPages=2}={}){
  const unique=linkedOfficialGeoPageCandidates(anchors,record.detailUrl,{maxPages});
  const recovered=[],rejected=[];let attempted=0;
  for(const url of unique){
    attempted+=1;
    try{
      const html=await fetchText(url,{fetchImpl});
      const result=selectOfficialGeoFromHtml(html,{pageUrl:url,expectedText:[record.title,record.address].filter(Boolean).join(" ")});
      if(result.geo)recovered.push(result.geo);
      rejected.push(...(result.rejectedCandidates??[]));
    }catch{}
  }
  if(!recovered.length)return {geo:null,attempted,ambiguous:false,rejected};
  if(!coherentGeoList(recovered))return {geo:null,attempted,ambiguous:true,rejected};
  return {geo:recovered[0],attempted,ambiguous:false,rejected};
}

async function enrichDetail(record,{fetchImpl=fetch,linkedGeoRecovery=false}={}){
  if(!record.detailUrl)return {...record,detailText:null,emails:[],phones:[],externalLinks:[]};
  try{
    const html=await fetchText(record.detailUrl,{fetchImpl});
    const text=stripTags(html);
    const anchors=extractAnchors(html,record.detailUrl);
    const links=anchors.map(x=>x.url);
    const officialGeo=selectOfficialGeoFromHtml(html,{pageUrl:record.detailUrl,expectedText:[record.title,record.address].filter(Boolean).join(" ")});
    let linked={geo:null,attempted:0,ambiguous:false,rejected:[]};
    if(linkedGeoRecovery&&!officialGeo.geo&&!officialGeo.ambiguous){
      linked=await recoverLinkedOfficialGeo(record,anchors,{fetchImpl});
    }
    return {
      ...record,
      detailText:text,
      emails:emailAddresses(text),
      phones:phoneCandidates(text),
      externalLinks:[...new Set(links)],
      officialGeo:officialGeo.geo??linked.geo,
      officialGeoAmbiguous:officialGeo.ambiguous||linked.ambiguous,
      officialGeoRejected:(officialGeo.rejectedCandidates??[]).length>0||linked.rejected.length>0,
      linkedGeoPagesAttempted:linked.attempted,
      linkedGeoRecovered:Boolean(linked.geo),
      linkedGeoAmbiguous:linked.ambiguous
    };
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
      upstream:{provider:"FSSP_WORLD_DIRECTORY",row_index:record.index,detail_url:record.detailUrl??null,marker_id:record.upstreamMarkerId??null},
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
  let base=null,carrier="official_markers_api",sourceFailure=null;
  try{
    const response=await fetchImpl(FSSP_MARKERS_URL,{
      headers:{"Accept":"application/json","User-Agent":"AdOrientemDirectory/1.0"},
      signal:AbortSignal.timeout(28000)
    });
    const returnedHost=new URL(response.url||FSSP_MARKERS_URL).hostname;
    if(!["www.fssp.org","fssp.org"].includes(returnedHost))
      throw new Error("FSSP official marker endpoint redirected to non-FSSP host");
    if(!response.ok)throw new Error(`FSSP official marker endpoint HTTP ${response.status}`);
    base=parseFsspOfficialMarkers(await response.json());
  }catch(error){sourceFailure=String(error?.message??error);base=null;}
  if(!base){
    carrier="official_html_table";
    let html=await fetchText(FSSP_DIRECTORY_URL,{fetchImpl});
    base=parseFsspDirectoryHtml(html);
    if(base.length===0){
      html=await renderFsspDirectoryHtml(FSSP_DIRECTORY_URL);
      base=parseFsspDirectoryHtml(html);
    }
  }
  if(base.length < 100) {
    throw new Error(`FSSP import coverage guard: expected at least 100 official directory rows, received ${base.length} (carrier ${carrier}; marker endpoint: ${sourceFailure??"ok"}).`);
  }
  // The runtime contract requires 400 distinct current venues. Reject a
  // partial REST response here, before writing any directory candidate.
  if(carrier==="official_markers_api"&&base.length<400)
    throw new Error(`FSSP official marker coverage drift: ${base.length} < 400`);
  const previouslyUnresolved=await loadPreviouslyUnresolved(out);
  const records=carrier==="official_markers_api"?base:
    await concurrentMap(base,concurrency,record=>enrichDetail(record,{
      fetchImpl,
      linkedGeoRecovery:previouslyUnresolved.has(canonicalVenueIdForRecord(record))
    }));
  const retrievedAt=new Date().toISOString();
  const dataset=buildFsspDataset(records,{retrievedAt});
  const countryKnown=dataset.venues.filter(v=>v.address.country_code).length;
  const result=await writeDirectoryDataset(path.resolve(out),{
    provider:"FSSP",retrievedAt,...dataset,
    coverage:{
      source_rows:base.length,
      carrier,
      canonical_unique_rows:dataset.venues.length,
      exact_duplicate_rows:dataset.exactDuplicateRows.length,
      detail_pages_attempted:base.filter(r=>r.detailUrl).length,
      country_code_known:countryKnown,
      country_code_unknown:dataset.venues.length-countryKnown,
      official_geo_recovered:records.filter(r=>r.officialGeo).length,
      official_geo_ambiguous:records.filter(r=>r.officialGeoAmbiguous).length,
      official_geo_rejected_conflict:records.filter(r=>r.officialGeoRejected).length,
      linked_geo_targeted:records.filter(r=>previouslyUnresolved.has(canonicalVenueIdForRecord(r))).length,
      linked_geo_pages_attempted:records.reduce((sum,r)=>sum+(r.linkedGeoPagesAttempted??0),0),
      linked_geo_recovered:records.filter(r=>r.linkedGeoRecovered).length,
      linked_geo_ambiguous:records.filter(r=>r.linkedGeoAmbiguous).length
    }
  });
  return result.report;
}

const invoked=process.argv[1]?pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url:false;
if(invoked)runFsspImport().then(r=>process.stdout.write(JSON.stringify(r,null,2)+"\n")).catch(e=>{console.error(e);process.exitCode=1;});
