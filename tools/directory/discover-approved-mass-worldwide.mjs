import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {extractAnchors,extractTableRows,extractTagBlocks,stripTags} from "./lib/html-source-utils.mjs";

const BASE="https://www.latinmassdir.org";
const iso=s=>String(s||"").trim().toUpperCase();
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const sourceUrl=x=>{try{return new URL(x,BASE).href}catch{return null}};
const venueUrl=x=>/^https:\/\/www\.latinmassdir\.org\/venue\/[a-z0-9-]+\/?$/i.test(x||"");
export function countryIndexFromHtml(html){
 const rows=extractTableRows(html),result=[];
 for(const row of rows){
  const anchors=extractAnchors(row.html,BASE).filter(a=>/\/country\/[a-z]{2}\/?/i.test(a.url));
  if(!anchors.length)continue;
  const m=anchors[0].url.match(/\/country\/([a-z]{2})\//i);
  const num=row.cells.map(x=>x.text.match(/^[\d,]+$/)?.[0]).filter(Boolean)[0];
  if(!m||!num)continue;
  result.push({country_code:iso(m[1]),expected:Number(num.replace(/,/g,"")),index_url:anchors[0].url});
 }
 return result;
}
export function parseCountryPage(html,{countryCode,pageUrl}){
 const seen=new Map();
 for(const a of extractAnchors(html,pageUrl)){
  if(!venueUrl(a.url))continue;
  const id=new URL(a.url).pathname.split("/").filter(Boolean).pop();
  if(!seen.has(id))seen.set(id,{source_id:"LMD:"+id,external_id:id,name:a.text||id,
   country_code:iso(countryCode),directory_url:a.url,source_type:"THIRD_PARTY_DIRECTORY",publication_state:"RESEARCH_ONLY"});
 }
 const match=stripTags(html).match(/Showing\s+(\d+)\s*[-–]\s*(\d+)\s+of\s+([\d,]+)/i);
 return {venues:[...seen.values()],pagination:match?{first:+match[1],last:+match[2],total:+match[3].replace(/,/g,"")}:null};
}
const HAS_MASS=/\b(?:Mass|Messe|Missa|Misa|messe|messe tridentine|Sung Mass|Low Mass)\b/i;
const NOT_MASS=/\b(?:Vespers|Benediction|Confessions|Rosary|Holy Hour|Lauds|Adoration)\b/i;
export function parseVenuePage(html,{directoryUrl}){
 const headings=extractTagBlocks(html,"h1"),body=stripTags(html);
 const name=headings[0]?.text||null;
 const h2=extractTagBlocks(html,"h2");
 const services=[];
 // Day / Time / Service table is deliberately extracted as raw evidence, not a normalized schedule.
 for(const table of extractTagBlocks(html,"table")){
  for(const tr of extractTableRows(table.html)){
   const cells=tr.cells.map(x=>x.text).filter(Boolean);
   if(cells.length<2||/^Day$/i.test(cells[0]))continue;
   if(cells.some(x=>HAS_MASS.test(x))&&!(cells.every(x=>NOT_MASS.test(x))))
    services.push({day:cells[0],time:cells.length>=3?cells[1]:null,service:cells.at(-1)});
  }
 }
 const anchors=extractAnchors(html,directoryUrl);
 const outlinks=[...new Set(anchors.map(x=>x.url).filter(url=>{
  try{const host=new URL(url).hostname;return host!=="www.latinmassdir.org"&&host!=="latinmassdir.org"&&
    !/^(www\.)?google\./.test(host)&&!/(donorbox|facebook|instagram|twitter|youtube)\./.test(host)}catch{return false}
 }))];
 const modified=body.match(/Last modified\s+([^\n]+?)(?:Created|Sorry for the interruption|$)/i)?.[1]?.trim()||null;
 const hasMass=services.length>0;
 return {name,original_sources:outlinks,mass_service_evidence:services,has_mass_evidence:hasMass,
   snapshot_last_modified_label:modified,publication_state:"RESEARCH_ONLY",verification_state:"THIRD_PARTY_UNCONFIRMED",
   liturgical_form_evidence:"SPECIALIZED_DIRECTORY_CLAIM_ONLY",
   directory_url:directoryUrl,section_labels:h2.map(h=>h.text).filter(Boolean)};
}
function pageUrl(code,page){return BASE+"/country/"+code.toLowerCase()+"/"+(page>1?"page/"+page+"/":"")+"?view=list"}
function argsFor(argv){
 const opts={countries:["US","FR","PL","IT","GB","BR","DE"],maxPages:60,maxDetails:0,delayMs:1800,
  out:"/tmp/ao-approved-directory-research.json",allowRemote:false};
 for(const item of argv){
  if(item==="--remote")opts.allowRemote=true;
  else if(item.startsWith("--countries="))opts.countries=item.slice(12).split(",").map(iso).filter(Boolean);
  else if(item.startsWith("--max-pages="))opts.maxPages=Number(item.slice(12));
  else if(item.startsWith("--max-details="))opts.maxDetails=Number(item.slice(14));
  else if(item.startsWith("--delay-ms="))opts.delayMs=Number(item.slice(11));
  else if(item.startsWith("--out="))opts.out=item.slice(6);
 }
 if(!Number.isInteger(opts.maxPages)||opts.maxPages<1||opts.maxPages>200)throw Error("max-pages must be 1..200");
 if(!Number.isInteger(opts.maxDetails)||opts.maxDetails<0||opts.maxDetails>2000)throw Error("max-details must be 0..2000");
 if(!Number.isInteger(opts.delayMs)||opts.delayMs<1000)throw Error("Rate limit: at least 1000ms between requests");
 return opts;
}
export async function discoverApprovedDirectory({countries=["US","FR"],maxPages=60,maxDetails=0,delayMs=1800,
 fetchImpl=fetch}={}){
 const candidates=[],errors=[],countryCoverage=[];let requests=0;
 // Sequential, bounded, and deliberately nonaggressive: full data comes from ordinary public pages only.
 async function get(url){
  if(requests)await sleep(delayMs);
  requests++;
  const response=await fetchImpl(url,{headers:{accept:"text/html,application/xhtml+xml",
   "user-agent":"AdOrientem Research Directory/1.0 (+source-only; no automatic republication)"}});
  if(!response?.ok)throw Error("HTTP "+response?.status+" at "+url);
  return response.text();
 }
 let remaining=maxPages;
 for(const code of countries){
  if(remaining<=0)break;
  const found=new Map();let total=null,pages=0;
  for(let page=1;remaining>0;page++){
   const url=pageUrl(code,page);
   let parsed;
   try{parsed=parseCountryPage(await get(url),{countryCode:code,pageUrl:url})}
   catch(error){errors.push({country_code:code,page,error:String(error?.message??error)});break}
   remaining--;pages++;
   if(parsed.pagination)total=parsed.pagination.total;
   if(!parsed.venues.length){errors.push({country_code:code,page,error:"NO_VENUE_LINKS_OR_PARSER_CHANGED"});break}
   for(const item of parsed.venues)found.set(item.external_id,item);
   if(parsed.pagination&&parsed.pagination.last>=parsed.pagination.total)break;
   if(parsed.venues.length<20&&!parsed.pagination)break;
   if(page>=100){errors.push({country_code:code,page,error:"PAGE_LIMIT"});break}
  }
  candidates.push(...found.values());
  countryCoverage.push({country_code:code,listed_total:total,discovered_unique:found.size,pages_fetched:pages,
    complete:total!==null&&found.size===total});
 }
 let detailed=0;
 for(const candidate of candidates){
  if(detailed>=maxDetails)break;
  try{Object.assign(candidate,parseVenuePage(await get(candidate.directory_url),{directoryUrl:candidate.directory_url}));detailed++}
  catch(error){errors.push({venue_id:candidate.source_id,error:String(error?.message??error)})}
 }
 return {schema:"AO_APPROVED_MASS_RESEARCH_DISCOVERY_V1",source:"https://www.latinmassdir.org/",
   scope:"RESEARCH_ONLY_NOT_PUBLICATION",generated_at:new Date().toISOString(),
   provenance_notice:"Third-party discovery data requires original-source confirmation of current Mass, liturgical form and physical identity.",
   summary:{requests,unique_discovered:candidates.length,detail_pages_read:detailed,errors:errors.length,
    full_countries:countryCoverage.filter(x=>x.complete).length,requested_countries:countries.length},
   country_coverage:countryCoverage,errors,records:candidates};
}
const directlyInvoked=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(directlyInvoked){
 const args=argsFor(process.argv.slice(2));
 if(!args.allowRemote)throw Error("Pass --remote to acknowledge paced external access. Tests use fixtures offline.");
 const result=await discoverApprovedDirectory(args);
 await fs.mkdir(path.dirname(path.resolve(args.out)),{recursive:true});
 await fs.writeFile(args.out,JSON.stringify(result,null,2)+"\n");
 console.log(JSON.stringify({summary:result.summary,countries:result.country_coverage,errors:result.errors.slice(0,10)}));
 if(!result.summary.unique_discovered)process.exitCode=1;
}
