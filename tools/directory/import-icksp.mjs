import path from "node:path";
import { pathToFileURL } from "node:url";
import { countryCodeFromText } from "./lib/country-codes.mjs";
import { absoluteUrl, emailAddresses, extractAnchors, extractTagBlocks, fetchText, phoneCandidates, stripTags, textLines } from "./lib/html-source-utils.mjs";
import { writeDirectoryDataset } from "./lib/write-directory-dataset.mjs";

export const ICKSP_US_URL="https://www.institute-christ-king.org/";
export const ICKSP_INTL_URL="https://institute-christ-king.org/international-home";

function slugify(v){return String(v??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");}
function venueType(name){
  const n=String(name??"").toLowerCase();
  if(/seminary/.test(n))return "seminary";
  if(/retreat/.test(n))return "retreat_house";
  if(/shrine/.test(n))return "church";
  if(/oratory/.test(n))return "oratory";
  if(/church|basilica|chiesa|parish/.test(n))return "church";
  return "other";
}
function blockAfter(lines,startRe,stopRe){
  const i=lines.findIndex(line=>startRe.test(line));
  if(i<0)return [];
  const out=[];
  const remainder=lines[i].replace(startRe,"").replace(/^\s*[|:-]?\s*/,"").trim();
  if(remainder)out.push(remainder);
  for(let j=i+1;j<lines.length;j+=1){
    if(stopRe.test(lines[j]))break;
    out.push(lines[j]);
  }
  return out.filter(Boolean);
}
function scheduleLines(lines){
  return lines.filter(line=>/\b(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sundays|Weekdays?|Feast Days?)\b/i.test(line)&&/\bMass\b/i.test(line));
}
function discoverUs(html){
  const seen=new Set(),out=[];
  for(const a of extractAnchors(html,ICKSP_US_URL)){
    let u;try{u=new URL(a.url);}catch{continue;}
    if(!/institute-christ-king\.org$/i.test(u.hostname))continue;
    if(!/-home\/?$/i.test(u.pathname))continue;
    if(/international-home|institute-home/i.test(u.pathname))continue;
    if(!a.text||seen.has(a.url))continue;
    seen.add(a.url);out.push({url:a.url,label:a.text,countryCode:"US"});
  }
  return out;
}
function parseUsDetail(html,candidate){
  const lines=textLines(html),text=stripTags(html);
  const h=extractTagBlocks(html,"h6").map(x=>x.text).find(Boolean);
  const title=h??candidate.label.split(" - ").slice(1).join(" - ")||candidate.label;
  const church=blockAfter(lines,/^Church\s*:/i,/^(Priory|Phone|Email|©)/i);
  const address=church.length>1?church.slice(1).join(", "):church.join(", ");
  const rawSchedule=scheduleLines(lines).join("\n")||null;
  return {
    title,address,countryCode:"US",diocese:null,detailUrl:candidate.url,
    emails:emailAddresses(text),phones:phoneCandidates(text),massRaw:rawSchedule,
    detailText:text
  };
}
export function parseIckspInternationalHtml(html,{pageUrl=ICKSP_INTL_URL}={}){
  const sections=[];
  const re=/<h2\b[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2\b|$)/gi;
  let m,index=0;
  while((m=re.exec(String(html??"")))){
    const heading=stripTags(m[1]);if(!heading||/links to web sites/i.test(heading))continue;
    const countryCode=countryCodeFromText(heading);
    if(!countryCode)continue;
    const body=m[2],h4=extractTagBlocks(body,"h4")[0]?.text??heading;
    const lines=textLines(body);
    const schedule=scheduleLines(lines).join("\n")||null;
    const scheduleStart=lines.findIndex(line=>/^(Sundays?|During the Week|Weekdays?|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/i.test(line));
    const addressLines=(scheduleStart>0?lines.slice(1,scheduleStart):lines.slice(1,5))
      .filter(line=>!/^Map & Directions$/i.test(line)&&!/^Phone:|^Email:/i.test(line));
    sections.push({
      index:index++,title:h4,address:addressLines.join(", "),countryCode,diocese:null,detailUrl:pageUrl,
      emails:emailAddresses(stripTags(body)),phones:phoneCandidates(stripTags(body)),massRaw:schedule,detailText:stripTags(body)
    });
  }
  return sections;
}
export function discoverIckspInternationalCountrySites(html,{pageUrl=ICKSP_INTL_URL}={}){
  const baseHost=new URL(pageUrl).hostname;
  return extractAnchors(html,pageUrl)
    .map(a=>({label:a.text,url:a.url,countryCode:countryCodeFromText(a.text)}))
    .filter(x=>x.countryCode&&new URL(x.url).hostname!==baseHost);
}

async function concurrentMap(items,concurrency,mapper){
  const out=new Array(items.length);let cursor=0;
  async function worker(){while(true){const i=cursor++;if(i>=items.length)return;out[i]=await mapper(items[i],i);}}
  await Promise.all(Array.from({length:Math.max(1,concurrency)},()=>worker()));return out;
}

export function buildIckspDataset(records,{retrievedAt=new Date().toISOString()}={}){
  const venues=[],ministries=[],schedules=[],sources=[];
  records.forEach((r,index)=>{
    const key=slugify(`${r.title}-${r.address||r.detailUrl}-${index}`);
    const venueId=`ao-icksp-${key}`,sourceId=`src-icksp-${key}`;
    venues.push({
      venue_id:venueId,name:{official:r.title,alternate:[]},venue_type:venueType(r.title),
      upstream:{provider:"ICKSP_OFFICIAL",detail_url:r.detailUrl},
      address:{line1:null,line2:null,postal_code:null,city:null,region:null,country_code:r.countryCode,country:null,formatted:r.address||null},
      geo:{lat:null,lng:null,precision:"unknown",geocoding_source:null},
      diocese:{diocese_id:null,name:r.diocese??null,type:"diocese"},
      contact:{phone:r.phones??[],email:r.emails??[],website:[r.detailUrl].filter(Boolean),schedule_url:[r.detailUrl].filter(Boolean),bulletin_url:[],contact_form:[],official_social:[]},
      status:"active",source_ids:[sourceId],upstream_updated_at:null
    });
    const ministryId=`ao-ministry-${venueId}`;
    ministries.push({
      ministry_id:ministryId,venue_id:venueId,community_id:"ICKSP",relationship:"served_by",affiliation_confidence:"DIRECT",
      community_profile_ref:"ICKSP",liturgical_usage:{family:"ROMAN",books:"1962",mass_form:"TRADITIONAL_LATIN",evidence_source_ids:["SRC_ICKSP_OFFICIAL_LOCATIONS"]},
      active:true,source_ids:[sourceId]
    });
    if(r.massRaw)schedules.push({schedule_id:`ao-schedule-${key}-1`,ministry_id:ministryId,service_type:"MASS",mass_type:"UNKNOWN",payload:{raw:r.massRaw},source_ids:[sourceId],verification:{state:"OFFICIAL_LIVE",checked_at:retrievedAt}});
    sources.push({source_id:sourceId,registry_source_id:"SRC_ICKSP_OFFICIAL_LOCATIONS",source_type:"COMMUNITY_OFFICIAL",publisher:"Institute of Christ the King Sovereign Priest",title:r.title,url:r.detailUrl,retrieved_at:retrievedAt,authority:"PRIMARY",fields_supported:["venue","venue.contact","schedule"]});
  });
  return {venues,ministries,schedules,sources};
}

export async function runIckspImport({out="data/directory/generated/icksp",concurrency=6,fetchImpl=fetch}={}){
  const [usHtml,intlHtml]=await Promise.all([fetchText(ICKSP_US_URL,{fetchImpl}),fetchText(ICKSP_INTL_URL,{fetchImpl})]);
  const usCandidates=discoverUs(usHtml);
  const usRecords=await concurrentMap(usCandidates,concurrency,async candidate=>{
    try{return parseUsDetail(await fetchText(candidate.url,{fetchImpl}),candidate);}
    catch(error){return {title:candidate.label,address:null,countryCode:"US",diocese:null,detailUrl:candidate.url,emails:[],phones:[],massRaw:null,detailWarning:String(error?.message??error)};}
  });
  const intlRecords=parseIckspInternationalHtml(intlHtml);
  const discovery=discoverIckspInternationalCountrySites(intlHtml);
  const retrievedAt=new Date().toISOString(),records=[...usRecords,...intlRecords];
  const dataset=buildIckspDataset(records,{retrievedAt});
  const result=await writeDirectoryDataset(path.resolve(out),{
    provider:"ICKSP",retrievedAt,...dataset,discovery,
    coverage:{us_location_links:usCandidates.length,us_detail_records:usRecords.length,central_international_records:intlRecords.length,international_country_sites:discovery.length,international_scope:"PARTIAL_CENTRAL_PLUS_COUNTRY_DISCOVERY"}
  });
  return result.report;
}
const invoked=process.argv[1]?pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url:false;
if(invoked)runIckspImport().then(r=>process.stdout.write(JSON.stringify(r,null,2)+"\n")).catch(e=>{console.error(e);process.exitCode=1;});
