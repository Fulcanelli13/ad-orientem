import fs from 'node:fs/promises';
import path from 'node:path';
const records=JSON.parse(await fs.readFile('data/directory/research/staging/map-first-r37/r47-priority-original-venue-links.json','utf8')).records;
const shard=Number(process.argv[2]??0),pages=[...new Set(records.map(r=>r.src))].sort();
const selected=pages.filter((_,i)=>i%3===shard);
const output=path.join(process.env.RUNNER_TEMP||'/tmp','r47-original-'+shard);
const name=s=>String(s??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/<[^>]+>/g,' ').replace(/&[^;]+;/g,' ').replace(/[^a-z0-9]+/g,' ').trim();
const decode=s=>String(s||'').replace(/&amp;/g,'&').replace(/&#038;/g,'&');
let last=0,requests=0;const cache=new Map(),pins=[],holds=[];
async function get(url){
 if(cache.has(url))return cache.get(url);
 const d=Date.now()-last;if(d<1500)await new Promise(r=>setTimeout(r,1500-d));last=Date.now();requests++;
 const r=await fetch(url,{headers:{'User-Agent':'AdOrientemSiteResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem)','Accept':'text/html'},signal:AbortSignal.timeout(25000)});
 if(!r.ok)throw Error('HTTP_'+r.status);
 const value=await r.text();cache.set(url,value);return value;
}
const robots=await get('https://adorientem.church/robots.txt');
let agent='*';for(const line of robots.split(/\r?\n/)){
 const a=line.match(/^user-agent:\s*(.*)/i),b=line.match(/^disallow:\s*(.*)/i);
 if(a)agent=a[1].trim();
 if(b&&(agent==='*'||/AdOrientemSiteResearch/i.test(agent))&&['/','/find','/find/'].includes(b[1].trim()))throw Error('ROBOTS_DENY');
}
function links(html){
 const m=new Map();
 for(const a of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
  let url;try{url=new URL(decode(a[1]),'https://adorientem.church')}catch{continue}
  if(url.hostname!=='adorientem.church'||!/^\/find\/[^/?#]+\/?$/.test(url.pathname))continue;
  const label=name(a[2]);if(label)m.set(url.origin+url.pathname,label);
 }
 return [...m].map(([url,label])=>({url,label}));
}
function point(html){
 for(const m of decode(html).matchAll(/(?:https?:\/\/)?(?:www\.)?openstreetmap\.org\/\?[^"'<> \s]+/gi)){
  try{const u=new URL(m[0].startsWith('http')?m[0]:'https://'+m[0]);const lat=Number(u.searchParams.get('mlat')),lon=Number(u.searchParams.get('mlon'));
  if(Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180&&(lat||lon))return [lon,lat]}catch{}
 }return null;
}
for(const src of selected){
 const sourceRecords=records.filter(r=>r.src===src);let cards;
 try{cards=links(await get(src))}catch(e){for(const r of sourceRecords)holds.push({...r,reason:String(e)});continue}
 for(const r of sourceRecords){
  const exact=cards.filter(c=>c.label===name(r.n));
  if(exact.length!==1){holds.push({...r,reason:'NOT_EXACTLY_ONE_SOURCE_DETAIL',matches:exact.length});continue}
  try{const pos=point(await get(exact[0].url));
   if(!pos){holds.push({...r,reason:'NO_MAP_MARKER_ON_DETAIL'});continue}
   pins.push({type:'Feature',geometry:{type:'Point',coordinates:pos},properties:{source_id:r.id,name:r.n,iso:r.cc,affiliation:r.aff,source_url:exact[0].url,index_url:r.src,precision:'source_marker_unassessed',status:'research_only',attribution:'© OpenStreetMap contributors, ODbL 1.0'}});
  }catch(e){holds.push({...r,reason:String(e)})}
 }
}
const report={shard,source_records:records.length,handled:records.filter(r=>selected.includes(r.src)).length,requests,pins:pins.length,holds:holds.length};
await fs.mkdir(output,{recursive:true});
await fs.writeFile(path.join(output,'pins.geojson'),JSON.stringify({type:'FeatureCollection',features:pins},null,2));
await fs.writeFile(path.join(output,'holds.json'),JSON.stringify(holds,null,2));
await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));
console.log('R47_SOURCE_RESULT',JSON.stringify(report));