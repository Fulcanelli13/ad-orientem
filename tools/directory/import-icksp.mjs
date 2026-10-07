import path from "node:path";
import { pathToFileURL } from "node:url";
import { countryCodeFromText } from "./lib/country-codes.mjs";
import { absoluteUrl, emailAddresses, extractAnchors, extractTagBlocks, fetchText, phoneCandidates, stripTags, textLines } from "./lib/html-source-utils.mjs";
import { writeDirectoryDataset } from "./lib/write-directory-dataset.mjs";
import { selectOfficialGeoFromHtml } from "./lib/official-geo-utils.mjs";

export const ICKSP_US_URL="https://www.institute-christ-king.org/";
export const ICKSP_INTL_URL="https://institute-christ-king.org/international-home";
export const ICKSP_LIVE_MASS_REVIEW_DAYS=120;

function reviewDueAt(checkedAt,days=ICKSP_LIVE_MASS_REVIEW_DAYS){
  const date=new Date(checkedAt);
  if(Number.isNaN(date.getTime()))return null;
  date.setUTCDate(date.getUTCDate()+Number(days||0));
  return date.toISOString();
}

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
function addressFromLines(lines){
  const block=blockAfter(
    lines,
    /^Address\s*:/i,
    /^(?:Mailing\s+Address|Emergency\s+Phone|Phone|Fax|Email|Website|Rectory|Office|Clergy|Oratory\s+Office\s+Hours|©)\s*:?/i,
  );
  if(block.length){
    const parts=block
      .map(line=>line.replace(/^\|\s*/,"").trim())
      .filter(Boolean)
      .filter(line=>!/^(?:Temporary\s+Chapel\s+Address|Church\s+Address|Address)$/i.test(line))
      .slice(0,5);
    if(parts.length)return parts.join(", ");
  }
  const zipIndex=lines.findIndex(line=>/(?:\b[A-Z]{2}\s+\d{5}(?:-\d{4})?\b|\b(?:Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\s+\d{5}(?:-\d{4})?\b)/i.test(line));
  if(zipIndex>=0)return lines.slice(Math.max(0,zipIndex-1),zipIndex+1).join(", ");
  return null;
}
function phonesFromLines(lines){
  const candidates=[];
  for(let i=0;i<lines.length;i+=1){
    if(!/^(?:Emergency\s+Phone|Phone)\s*:/i.test(lines[i]))continue;
    const remainder=lines[i].replace(/^(?:Emergency\s+Phone|Phone)\s*:\s*/i,"").replace(/^\|\s*/,"").trim();
    if(remainder)candidates.push(remainder);
    const next=String(lines[i+1]??"").replace(/^\|\s*/,"").trim();
    if(next&&!/^(?:Fax|Email|Website|Address|Emergency\s+Phone|Phone)\s*:/i.test(next))candidates.push(next);
  }
  return phoneCandidates(candidates.join("\n"));
}
function scheduleLines(lines){
  return lines.filter(line=>/\b(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sundays|Weekdays?|Feast Days?)\b/i.test(line)&&/\bMass\b/i.test(line));
}
function scheduleBlock(lines){
  const start=lines.findIndex(line=>/^(Sundays?|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|During the Week|Weekdays?|Feast Days?|Holy Mass|Mass Times?)/i.test(line));
  if(start<0)return scheduleLines(lines).join("\n")||null;
  const out=[];
  for(let i=start;i<lines.length;i+=1){
    const line=lines[i];
    if(i>start&&/^(Church|Priory|Address|Phone|Email|Clergy|Rector|Canon|Map|Directions|Contact|Website)\s*:?/i.test(line))break;
    if(/\b(Mass|Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Weekdays?|Feast Days?|During the Week)\b/i.test(line)||/\b\d{1,2}(?::|\.)\d{2}\b|\b(?:am|pm)\b/i.test(line))out.push(line);
  }
  return out.some(line=>/\bMass\b/i.test(line))?out.join("\n"):null;
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
export function parseIckspUsDetail(html,candidate){
  const lines=textLines(html),text=stripTags(html);
  const h=extractTagBlocks(html,"h6").map(x=>x.text).find(Boolean);
  const inferred=candidate.label.split(" - ").slice(1).join(" - ");
  const title=h ?? (inferred || candidate.label);
  const church=blockAfter(lines,/^Church\s*:/i,/^(Priory|Phone|Email|©)/i);
  const address=addressFromLines(lines)||(church.length>1?church.slice(1).join(", "):church.join(", "));
  const rawSchedule=scheduleBlock(lines);
  const officialGeo=selectOfficialGeoFromHtml(html,{pageUrl:candidate.url,expectedText:[title,address].filter(Boolean).join(" ")});
  return {
    title,address,countryCode:"US",diocese:null,detailUrl:candidate.url,
    emails:emailAddresses(text),phones:phonesFromLines(lines),massRaw:rawSchedule,
    detailText:text,officialGeo:officialGeo.geo,officialGeoAmbiguous:officialGeo.ambiguous,officialGeoRejected:(officialGeo.rejectedCandidates??[]).length>0
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
    const schedule=scheduleBlock(lines);
    const scheduleStart=lines.findIndex(line=>/^(Sundays?|During the Week|Weekdays?|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/i.test(line));
    const addressLines=(scheduleStart>0?lines.slice(1,scheduleStart):lines.slice(1,5))
      .filter(line=>!/^Map & Directions$/i.test(line)&&!/^Phone:|^Email:/i.test(line));
    const locality=heading.split(",")[0]?.trim()??"";
    const addressBase=addressLines.join(", ");
    const address=locality&&!addressBase.toLowerCase().includes(locality.toLowerCase())
      ?[addressBase,locality].filter(Boolean).join(", ")
      :addressBase;
    const officialGeo=selectOfficialGeoFromHtml(body,{pageUrl,expectedText:[h4,address,heading].filter(Boolean).join(" ")});
    sections.push({
      index:index++,title:h4,address,countryCode,diocese:null,detailUrl:pageUrl,
      emails:emailAddresses(stripTags(body)),phones:phoneCandidates(stripTags(body)),massRaw:schedule,detailText:stripTags(body),
      officialGeo:officialGeo.geo,officialGeoAmbiguous:officialGeo.ambiguous,officialGeoRejected:(officialGeo.rejectedCandidates??[]).length>0
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
      geo:r.officialGeo??{lat:null,lng:null,precision:"unknown",geocoding_source:null},
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
    if(r.massRaw)schedules.push({
      schedule_id:`ao-schedule-${key}-1`,ministry_id:ministryId,service_type:"MASS",mass_type:"UNKNOWN",
      payload:{raw:r.massRaw},source_ids:[sourceId],
      verification:{
        state:"OFFICIAL_LIVE",
        checked_at:retrievedAt,
        review_due_at:reviewDueAt(retrievedAt),
        freshness_policy:"CURRENT_MASS_120D",
      }
    });
    sources.push({source_id:sourceId,registry_source_id:"SRC_ICKSP_OFFICIAL_LOCATIONS",source_type:"COMMUNITY_OFFICIAL",publisher:"Institute of Christ the King Sovereign Priest",title:r.title,url:r.detailUrl,retrieved_at:retrievedAt,authority:"PRIMARY",fields_supported:["venue","venue.geo","venue.contact","schedule"]});
  });
  return {venues,ministries,schedules,sources};
}

export async function runIckspImport({out="data/directory/generated/icksp",concurrency=6,fetchImpl=fetch}={}){
  const [usHtml,intlHtml]=await Promise.all([fetchText(ICKSP_US_URL,{fetchImpl}),fetchText(ICKSP_INTL_URL,{fetchImpl})]);
  const usCandidates=discoverUs(usHtml);
  const usRecords=await concurrentMap(usCandidates,concurrency,async candidate=>{
    try{return parseIckspUsDetail(await fetchText(candidate.url,{fetchImpl}),candidate);}
    catch(error){return {title:candidate.label,address:null,countryCode:"US",diocese:null,detailUrl:candidate.url,emails:[],phones:[],massRaw:null,detailWarning:String(error?.message??error)};}
  });
  const intlRecords=parseIckspInternationalHtml(intlHtml);
  const discovery=discoverIckspInternationalCountrySites(intlHtml);
  const retrievedAt=new Date().toISOString(),records=[...usRecords,...intlRecords];
  const dataset=buildIckspDataset(records,{retrievedAt});
  const result=await writeDirectoryDataset(path.resolve(out),{
    provider:"ICKSP",retrievedAt,...dataset,discovery,
    coverage:{
      us_location_links:usCandidates.length,
      us_detail_records:usRecords.length,
      central_international_records:intlRecords.length,
      international_country_sites:discovery.length,
      international_scope:"PARTIAL_CENTRAL_PLUS_COUNTRY_DISCOVERY",
      official_geo_recovered:records.filter(r=>r.officialGeo).length,
      official_geo_ambiguous:records.filter(r=>r.officialGeoAmbiguous).length,
      official_geo_rejected_conflict:records.filter(r=>r.officialGeoRejected).length
    }
  });
  return result.report;
}
const invoked=process.argv[1]?pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url:false;
if(invoked)runIckspImport().then(r=>process.stdout.write(JSON.stringify(r,null,2)+"\n")).catch(e=>{console.error(e);process.exitCode=1;});
