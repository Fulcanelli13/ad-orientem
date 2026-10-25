import fs from 'node:fs/promises';
const BASE='https://www.latinmassdir.org';
const codes=(process.argv.find(x=>x.startsWith('--countries='))||'--countries=mu,ie,nz,za,au,ca').split('=')[1].split(',');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const entities=s=>String(s||'')
  .replace(/&#(x[0-9a-f]+|[0-9]+);/gi,(m,n)=>{const cp=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n);return Number.isInteger(cp)&&cp>=0&&cp<=0x10ffff?String.fromCodePoint(cp):m})
  .replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&apos;/gi,"'")
  .replace(/&nbsp;/gi,' ').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>');
const clean=s=>entities(String(s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
let last=0,req=0;
async function get(url){const d=Date.now()-last;if(d<1150)await sleep(1150-d);last=Date.now();req++;const response=await fetch(url,{headers:{'User-Agent':'AdOrientemSiteResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)','Accept':'text/html'},signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error('HTTP '+response.status);return await response.text()}
function links(html){const out=new Set();for(const m of html.matchAll(/href\s*=\s*["']([^"']*\/venue\/[^"'#?]+\/?)["']/gi)){try{const u=new URL(entities(m[1]),BASE);if(u.hostname==='www.latinmassdir.org')out.add(u.origin+u.pathname)}catch{}}return [...out]}
function point(html){const x=entities(html);for(const m of x.matchAll(/https?:\/\/(?:www\.)?google\.com\/maps\/search\/\?[^"'<> \t\r\n]+/gi)){try{const u=new URL(m[0]),q=u.searchParams.get('query')||'',p=q.match(/^\s*([-+]?\d+(?:\.\d+)?)\s*,\s*([-+]?\d+(?:\.\d+)?)\s*$/);if(p){const a=Number(p[1]),b=Number(p[2]);if(Math.abs(a)<=90&&Math.abs(b)<=180&&(a||b))return {lat:a,lng:b,url:u.href}}}catch{}}return null}
if(process.argv.includes('--self-test')){
  for(const encoded of ['&amp;','&#038;','&#38;','&#x26;']){
    const html='<a href="https://www.google.com/maps/search/?api=1'+encoded+'query=-20.3218789%2C57.5242987">View map</a>';
    const pos=point(html);
    if(!pos||Math.abs(pos.lat+20.3218789)>0.000001||Math.abs(pos.lng-57.5242987)>0.000001){
      throw new Error('MAP_POINT_DECODE_FAILED: '+encoded);
    }
  }
  console.log('LMD_POINT_PARSER_SELF_TEST_PASSED');process.exit(0);
}
let features=[],holds=[],failures=[],byCountry={},processed=0;
try{const robots=await get(BASE+'/robots.txt');let ua='',deny=false;for(const ln of robots.split(/\r?\n/)){const t=ln.trim();if(/^user-agent:/i.test(t))ua=t.slice(11).trim();if((ua==='*'||/AdOrientem/i.test(ua))&&/^disallow:\s*(\/|\/venue\/?|\/country\/?)\s*$/i.test(t))deny=true;}if(deny)throw new Error('ROBOTS_BLOCKS_ACQUISITION')}catch(e){if(String(e).includes('ROBOTS_BLOCKS_ACQUISITION'))throw e;console.log('robots check unavailable',String(e))}
const seen=new Set();

const maxVenues=Number((process.argv.find(x=>x.startsWith('--max-venues='))||'--max-venues=190').split('=')[1]);
if(!Number.isInteger(maxVenues)||maxVenues<1)throw new Error('INVALID_MAX_VENUES');
const countOnPage=html=>{
  const t=clean(html),m=t.match(/Results:\s*([\d,]+)\s+venues\b/i)||t.match(/Showing\s+\d+\s*[-–]\s*\d+\s+of\s+([\d,]+)/i);
  return m?Number(m[1].replace(/,/g,'')):null;
};
const PAGE_SIZE=20;
for(const cc of codes){
  byCountry[cc]={expected:null,links:0,pages:0,processed:0,pins:0,held:0,unprocessed:0,listing_complete:false};
  if(!/^[a-z]{2}$/.test(cc)){failures.push({country:cc,error:'INVALID_COUNTRY_CODE'});continue}
  try{
    const first=await get(BASE+'/country/'+cc+'/?view=list');
    const expected=countOnPage(first);
    byCountry[cc].expected=expected;
    const urls=new Set(links(first));
    byCountry[cc].pages=1;
    // LMD paginates list mode at 20 venues. Discover every page before claiming completeness.
    if(expected===null){
      failures.push({country:cc,error:'COUNTRY_TOTAL_UNAVAILABLE',first_page_links:urls.size});
    }else{
      const pages=Math.ceil(expected/PAGE_SIZE);
      if(pages>150)throw new Error('DIRECTORY_PAGINATION_EXCEEDS_SAFE_LIMIT');
      for(let n=2;n<=pages;n++){
        try{
          const html=await get(BASE+'/country/'+cc+'/page/'+n+'/?view=list');
          for(const link of links(html))urls.add(link);
          byCountry[cc].pages++;
        }catch(e){failures.push({country:cc,page:n,error:String(e)})}
      }
    }
    byCountry[cc].links=urls.size;
    byCountry[cc].listing_complete=expected!==null&&urls.size===expected;
    if(!byCountry[cc].listing_complete){
      failures.push({country:cc,error:'DIRECTORY_LISTING_INCOMPLETE',expected,found:urls.size});
    }
    for(const url of urls){
      if(processed>=maxVenues){byCountry[cc].unprocessed++;continue}
      if(seen.has(url))continue;
      seen.add(url);
      try{
        const html=await get(url);
        const name=clean((html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)||[])[1]);
        const pos=point(html),p={
          source_id:'LMD:'+url.split('/venue/')[1].replace(/\/$/,''),
          name,iso:cc.toUpperCase(),source_url:url,
          affiliation_label:'Unclassified (LMD source)',
          coordinate_precision:'SOURCE_MARKER_UNASSESSED',
          coordinate_provenance:'LATIN_MASS_DIRECTORY_VENUE_MAP',
          review_status:'PROVISIONAL_WORSHIP_SITE',source_family:'LMD_WORLD_VENUE'
        };
        if(pos&&name){
          features.push({type:'Feature',geometry:{type:'Point',coordinates:[pos.lng,pos.lat]},properties:{...p,coordinate_source_url:pos.url}});
          byCountry[cc].pins++;
        }else{
          holds.push({...p,reason:!name?'NO_NAME':'NO_SOURCE_COORDINATES'});
          byCountry[cc].held++;
        }
      }catch(e){failures.push({url,error:String(e)})}
      processed++;byCountry[cc].processed++;
    }
    console.log('COUNTRY',cc,byCountry[cc]);
  }catch(e){failures.push({country:cc,error:String(e)})}
}
await fs.mkdir('/tmp/lmd-r39',{recursive:true});await fs.writeFile('/tmp/lmd-r39/source-pins.geojson',JSON.stringify({type:'FeatureCollection',metadata:{source:BASE,precision:'unassessed',no_mass_times:true},features},null,2));await fs.writeFile('/tmp/lmd-r39/holds.json',JSON.stringify(holds,null,2));await fs.writeFile('/tmp/lmd-r39/report.json',JSON.stringify({byCountry,processed,maxVenues,pins:features.length,holds:holds.length,failures,requests:req,all_country_listings_complete:Object.values(byCountry).every(c=>c.listing_complete)},null,2));console.log('TOTAL',JSON.stringify({processed,pins:features.length,holds:holds.length,errors:failures.length,requests:req}));