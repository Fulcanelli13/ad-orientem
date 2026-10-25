import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const input=JSON.parse(await fs.readFile(path.join(root,"data/directory/research/staging/map-first-r37/r44-locality-source-queue.json"),"utf8")).records;
const shard=Number((process.argv.find(x=>x.startsWith("--shard="))||"--shard=0").split("=")[1]);
const shards=Number((process.argv.find(x=>x.startsWith("--shards="))||"--shards=3").split("=")[1]);
const max=Number((process.argv.find(x=>x.startsWith("--max-targets="))||"--max-targets=9999").split("=")[1]);
if(!Number.isInteger(shard)||!Number.isInteger(shards)||shards<1||shard<0||shard>=shards||!Number.isInteger(max)||max<1)throw Error("INVALID_SHARD");
const out=path.join(process.env.RUNNER_TEMP||"/tmp","r44-source-venue-recovery-shard-"+shard);
const targets=input.filter(x=>["AO_PUBLIC_INDEX","ADORIENTEM_PUBLIC_COUNTRY_INDEX_R35"].includes(x.fam));
const pages=[...new Set(targets.map(x=>x.src))].sort();
const myPages=pages.filter((_,i)=>i%shards===shard);
const myTargets=targets.filter(x=>myPages.includes(x.src)).slice(0,max);
const report={shard,shards,target_count:myTargets.length,page_count:myPages.length,distinct_pages_attempted:0,detail_pages_attempted:0,requests:0,found:0,holds:0,errors:0,aliases:0,not_site_precise:0,robots_allowed:false};
const accepted=[],held=[],errors=[],cache=new Map();
let last=0;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const entities=s=>String(s||"").replace(/&#(x[0-9a-f]+|\d+);/gi,(m,n)=>{const p=n[0].toLowerCase()==="x"?parseInt(n.slice(1),16):Number(n);return Number.isInteger(p)&&p<=0x10ffff?String.fromCodePoint(p):m}).replace(/&amp;/gi,"&").replace(/&quot;/gi,'"').replace(/&apos;|&#039;/gi,"'").replace(/&nbsp;/gi," ").replace(/&lt;/gi,"<").replace(/&gt;/gi,">");
const clean=s=>entities(String(s||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim());
const norm=s=>clean(s).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();
async function get(url){
 if(cache.has(url))return cache.get(url);
 const delta=Date.now()-last;
 if(delta<1500)await sleep(1500-delta);
 last=Date.now();report.requests++;
 const r=await fetch(url,{headers:{"User-Agent":"AdOrientemSiteResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem; site coordinates and attribution only)","Accept":"text/html"},signal:AbortSignal.timeout(22000),redirect:"follow"});
 if(!r.ok)throw Error("HTTP_"+r.status);
 const html=await r.text();cache.set(url,html);return html;
}
function cardLinks(html){
 const items=[],seen=new Set();
 for(const m of html.matchAll(/<a\b([^>]*?\bhref\s*=\s*["']([^"']+)["'][^>]*)>([\s\S]*?)<\/a>/gi)){
  let u;
  try{u=new URL(entities(m[2]),"https://adorientem.church");}catch{continue}
  if(u.hostname!=="adorientem.church"||!/^\/find\/[^/?#]+\/?$/.test(u.pathname))continue;
  const name=clean(m[3]);
  if(!name||seen.has(u.pathname))continue;
  seen.add(u.pathname);
  items.push({name,url:u.origin+u.pathname});
 }
 return items;
}
function coords(html){
 const expanded=entities(html);
 const matches=[...expanded.matchAll(/(?:https?:\/\/)?(?:www\.)?openstreetmap\.org\/\?[^"'<> \s]+/gi)];
 for(const m of matches){
  try{
   const u=new URL(m[0].startsWith("http")?m[0]:"https://"+m[0]);
   const lat=Number(u.searchParams.get("mlat")),lon=Number(u.searchParams.get("mlon"));
   if(Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180&&(lat!==0||lon!==0))
    return {lat,lon,url:u.toString()};
  }catch{}
 }
 return null;
}
let robots;
try{robots=await get("https://adorientem.church/robots.txt")}catch(e){throw Error("ROBOTS_UNAVAILABLE_"+e)}
let ua="*",prohibited=false;for(const line of robots.split(/\r?\n/)){
 const t=line.trim(),agent=t.match(/^user-agent:\s*(.*)/i),deny=t.match(/^disallow:\s*(.*)/i);
 if(agent)ua=agent[1].trim();
 if(deny&&(ua==="*"||/AdOrientemSiteResearch/i.test(ua))){
  const p=deny[1].trim();
  if(p==="/"||p==="/find"||p==="/find/"||p.startsWith("/find/"))prohibited=true;
 }
}
if(prohibited)throw Error("ROBOTS_BLOCKS_FIND_CRAWL");
report.robots_allowed=true;
const byPage=new Map();
for(const t of myTargets){if(!byPage.has(t.src))byPage.set(t.src,[]);byPage.get(t.src).push(t)}
for(const [page,rows] of byPage){
 let cards;
 try{cards=cardLinks(await get(page));report.distinct_pages_attempted++}
 catch(e){errors.push({page,error:String(e)});rows.forEach(row=>held.push({...row,reason:"INDEX_FETCH_FAILED"}));continue}
 for(const item of rows){
  const candidates=cards.filter(c=>norm(c.name)===norm(item.n));
  if(!candidates.length){held.push({...item,reason:"NO_LISTING_NAME_MATCH",list_cards:cards.length});continue}
  const valid=[];
  for(const c of candidates){
   try{
    const html=await get(c.url);report.detail_pages_attempted++;
    const title=clean((html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)||[])[1]);
    const point=coords(html);
    if(!point){held.push({...item,reason:"DETAIL_HAS_NO_MARKER",detail_url:c.url});continue}
    const expectedLocal=norm(item.city).split(" ").filter(x=>x.length>=3);
    const textSample=norm(html.slice(0,90000));
    const cityMatch=!expectedLocal.length||expectedLocal.filter(t=>textSample.includes(t)).length>=Math.min(expectedLocal.length,1);
    if(!cityMatch){held.push({...item,reason:"CITY_NOT_CONFIRMED",detail_url:c.url});continue}
    valid.push({c,title,point});
   }catch(e){errors.push({id:item.id,detail:c.url,error:String(e)})}
  }
  if(valid.length!==1){
   if(valid.length>1)held.push({...item,reason:"MULTIPLE_MATCHING_VENUE_DETAILS",detail_urls:valid.map(x=>x.c.url)});
   else if(!candidates.length)held.push({...item,reason:"NO_VALID_DETAIL"});
   continue;
  }
  const {c,title,point}=valid[0];
  accepted.push({type:"Feature",geometry:{type:"Point",coordinates:[point.lon,point.lat]},properties:{
   source_id:item.id,name:title||item.n,iso:item.cc,city:item.city,affiliation_label:item.aff,
   source_url:c.url,index_source_url:item.src,coordinate_source_url:point.url,
   coordinate_origin:"PUBLIC_VENUE_OPEN_IN_MAPS",coordinate_precision:"SOURCE_MARKER_UNASSESSED",
   source_family:item.fam,map_status:"PROVISIONAL_VENUE_IDENTITY_CHECK",no_mass_times:true,
   attribution:"© OpenStreetMap contributors, ODbL 1.0",caveat:"Listed venue marker; not verified church entrance or liturgical commemoration"
  }});
 }
 console.log("R44_PAGE",JSON.stringify({page,targets:rows.length,cards:cards.length,recovered:accepted.length,holds:held.length,errors:errors.length}));
}
report.found=accepted.length;report.holds=held.length;report.errors=errors.length;
await fs.mkdir(out,{recursive:true});
await fs.writeFile(path.join(out,"source-coordinates.geojson"),JSON.stringify({type:"FeatureCollection",metadata:{status:"RESEARCH_ONLY_NOT_PUBLISHED",precision:"unassessed",attribution:"© OpenStreetMap contributors, ODbL 1.0",no_mass_times:true},features:accepted},null,2));
await fs.writeFile(path.join(out,"holds.json"),JSON.stringify(held,null,2));
await fs.writeFile(path.join(out,"errors.json"),JSON.stringify(errors,null,2));
await fs.writeFile(path.join(out,"report.json"),JSON.stringify(report,null,2));
console.log("R44_FINISH",JSON.stringify(report));
