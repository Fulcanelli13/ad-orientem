import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const rows=JSON.parse(await fs.readFile(path.join(ROOT,"data/directory/research/staging/map-first-r37/r49-206-unresolved-addresses.json"),"utf8")).records;
const shard=Number((process.argv.find(x=>x.startsWith("--shard="))||"--shard=0").split("=")[1]);
const shards=3;if(!Number.isInteger(shard)||shard<0||shard>=shards)throw Error("INVALID_SHARD");
const countries=[...new Set(rows.map(x=>x.cc))].sort();
const countryList=countries.filter((_,i)=>i%shards===shard);
const targets=rows.filter(x=>countryList.includes(x.cc));
const out=path.join(process.env.RUNNER_TEMP||"/tmp","r49-lmd-source-crossmatch-"+shard);
const report={shard,expected_targets:targets.length,countries:countryList,requests:0,listed:0,matched:0,pins:0,holds:0,errors:0,country_audits:{},robots_allowed:false};
const BASE="https://www.latinmassdir.org";let last=0;
const pins=[],holds=[],errors=[];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const unescape=s=>String(s||"").replace(/&#(x[0-9a-f]+|[0-9]+);/gi,(m,n)=>{const cp=n[0].toLowerCase()==="x"?parseInt(n.slice(1),16):Number(n);return Number.isInteger(cp)&&cp>=0&&cp<=0x10ffff?String.fromCodePoint(cp):m}).replace(/&amp;/gi,"&").replace(/&quot;/gi,'"').replace(/&apos;/gi,"'").replace(/&nbsp;/gi," ").replace(/&lt;/gi,"<").replace(/&gt;/gi,">");
const clean=s=>unescape(String(s||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim());
const normalize=s=>clean(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();
const stop=new Set(["saint","sainte","st","ste","church","chapel","catholic","parish","eglise","chapelle","of","the","de","la","le","des","du","di","del","san","santa","santo","igreja","parroquia"]);
const tokens=s=>[...new Set(normalize(s).split(" ").filter(t=>t.length>2&&!stop.has(t)))];
async function get(url){
 const d=Date.now()-last;if(d<1500)await sleep(1500-d);
 last=Date.now();report.requests++;
 const res=await fetch(url,{headers:{"User-Agent":"AdOrientemSiteResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)","Accept":"text/html"},signal:AbortSignal.timeout(20000)});
 if(!res.ok)throw Error("HTTP_"+res.status);
 return await res.text();
}
const robots=await get(BASE+"/robots.txt");
let ua="",blocked=false;
for(const line of robots.split(/\r?\n/)){
 const t=line.trim();if(/^user-agent:/i.test(t))ua=t.split(":").slice(1).join(":").trim();
 if((ua==="*"||/AdOrientemSiteResearch/i.test(ua))&&/^disallow:/i.test(t)){
  const p=t.split(":").slice(1).join(":").trim();
  if(["/","/country","/country/","/venue","/venue/"].includes(p))blocked=true;
 }
}
if(blocked)throw Error("ROBOTS_BLOCKED");
report.robots_allowed=true;
function listingLinks(html){
 const out=new Set();
 for(const m of html.matchAll(/href\s*=\s*["']([^"']*\/venue\/[^"'#?]+\/?)["']/gi)){
  try{const u=new URL(unescape(m[1]),BASE);if(u.hostname==="www.latinmassdir.org")out.add(u.origin+u.pathname)}catch{}
 }return [...out];
}
function totalCount(html){
 const t=clean(html),m=t.match(/Results:\s*([\d,]+)\s+venues\b/i)||t.match(/Showing\s+\d+\s*[-–]\s*\d+\s+of\s+([\d,]+)/i);
 return m?Number(m[1].replace(/,/g,"")):null;
}
function point(html){
 for(const m of unescape(html).matchAll(/https?:\/\/(?:www\.)?google\.com\/maps\/search\/\?[^"'<> \t\r\n]+/gi)){
  try{const u=new URL(m[0]),q=u.searchParams.get("query")||"",z=q.match(/^\s*([-+]?\d+(?:\.\d+)?)\s*,\s*([-+]?\d+(?:\.\d+)?)\s*$/);
   if(z){const lat=+z[1],lng=+z[2];if(Math.abs(lat)<=90&&Math.abs(lng)<=180&&(lat||lng))return {lat,lng,url:u.href}}
  }catch{}
 }return null;
}
function scoreTitle(name,slug){
 const n=tokens(name),v=tokens(slug);
 if(!n.length)return 0;
 const intersection=n.filter(t=>v.includes(t)).length;
 const overlap=intersection/n.length;
 const n0=normalize(name),v0=normalize(slug);
 return Math.max(overlap,n0.length>=10&&v0.includes(n0)?1:0);
}
function cityInSlug(r,slug){
 const candidate=normalize(r.city||"").split(" ").filter(t=>t.length>=5);
 if(candidate.length&&candidate.some(t=>slug.includes(t)))return true;
 const addr=normalize(r.address).split(" ").filter(t=>t.length>=5);
 return addr.some(t=>slug.includes(t));
}
for(const cc of countryList){
 const local=targets.filter(t=>t.cc===cc);
 const audit={expected:null,listings:0,links:0,complete:false,targets:local.length,visited_pages:0};
 report.country_audits[cc]=audit;let urlList=[];
 try{
  const first=await get(BASE+"/country/"+cc.toLowerCase()+"/?view=list");
  audit.expected=totalCount(first);const links=new Set(listingLinks(first));audit.listings++;
  const pageLimit=audit.expected===null?1:Math.min(70,Math.ceil(audit.expected/20));
  for(let n=2;n<=pageLimit;n++){
   try{const html=await get(BASE+"/country/"+cc.toLowerCase()+"/page/"+n+"/?view=list");
    audit.listings++;listingLinks(html).forEach(x=>links.add(x));
   }catch(e){errors.push({country:cc,page:n,error:String(e)})}
  }
  audit.links=links.size;audit.complete=audit.expected!==null&&audit.expected===audit.links;
  urlList=[...links];report.listed+=urlList.length;
 }catch(e){errors.push({country:cc,error:String(e)});local.forEach(x=>holds.push({...x,reason:"COUNTRY_INDEX_UNAVAILABLE"}));continue}
 for(const r of local){
  if(/\b(house|residence|rectory|office|seminary|presbytery|headquarters)\b/i.test(r.name)&&!/\b(church|chapel|oratory|shrine|sanctuary)\b/i.test(r.name)){
   holds.push({...r,reason:"NON_WORSHIP_FACILITY"});continue;
  }
  const candidates=urlList.map(u=>({url:u,slug:decodeURIComponent(u.split("/venue/")[1]||"")}))
    .map(x=>({...x,score:scoreTitle(r.name,x.slug)}))
    .filter(x=>x.score>=0.8).sort((a,b)=>b.score-a.score);
  const best=candidates.filter(x=>x.score>=0.98);
  let choices=best.length?best:candidates;
  if(choices.length>1){
   const localChoices=choices.filter(x=>cityInSlug(r,normalize(x.slug)));
   if(localChoices.length===1)choices=localChoices;
  }
  if(choices.length!==1){holds.push({...r,reason:choices.length?"AMBIGUOUS_DIRECTORY_NAMES":"NO_DIRECTORY_NAME_MATCH",candidate_urls:choices.slice(0,4).map(x=>x.url)});continue}
  const choice=choices[0];let html;
  try{html=await get(choice.url);audit.visited_pages++}catch(e){errors.push({source_id:r.id,error:String(e)});holds.push({...r,reason:"VENUE_FETCH_FAILED"});continue}
  const title=clean((html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)||[])[1]);
  if(scoreTitle(r.name,title)<0.7){holds.push({...r,reason:"DIRECTORY_TITLE_CONFLICT",venue_url:choice.url,title});continue}
  const geo=point(html);
  if(!geo){holds.push({...r,reason:"VENUE_MAP_POINT_UNAVAILABLE",venue_url:choice.url});continue}
  pins.push({type:"Feature",geometry:{type:"Point",coordinates:[geo.lng,geo.lat]},properties:{
   source_id:r.id,name:r.name,iso:r.cc,affiliation:r.aff,address:r.address,
   source_url:r.url,directory_url:choice.url,map_url:geo.url,
   directory_title:title,coordinate_precision:"SOURCE_MARKER_UNASSESSED",
   source_family:"LATIN_MASS_DIRECTORY_R49_CROSSMATCH",status:"PROVISIONAL_SITE_IDENTITY_CHECK",
   no_mass_times:true,note:"Independent approved Latin Mass directory listing; does not prove precise entrance or individual una-cum commemoration"
  }});
 }
}
report.pins=pins.length;report.holds=holds.length;report.errors=errors.length;
report.matched=new Set(pins.map(x=>x.properties.source_id)).size;
await fs.mkdir(out,{recursive:true});
await Promise.all([
 fs.writeFile(path.join(out,"source-pins.geojson"),JSON.stringify({type:"FeatureCollection",features:pins,metadata:{scope:"source crossmatch, not production",site_markers_not_entrances:true,no_mass_times:true}},null,2)),
 fs.writeFile(path.join(out,"holds.json"),JSON.stringify(holds,null,2)),
 fs.writeFile(path.join(out,"errors.json"),JSON.stringify(errors,null,2)),
 fs.writeFile(path.join(out,"report.json"),JSON.stringify(report,null,2))
]);
console.log("R49_CROSSMATCH",JSON.stringify(report));
