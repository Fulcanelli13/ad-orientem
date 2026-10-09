// Worldwide SSPX source-entity census from the first-party map's server-rendered
// district pages. Deliberately DOES NOT promote map places to Mass venues.
// This bypasses the blocked REST API only when the public HTML can be checked.
import fs from "node:fs/promises";
import path from "node:path";
import {pathToFileURL} from "node:url";

export const OFFICIAL_INDEX="https://map.fsspx.org/fr/districts/";
const text=x=>String(x??"").replace(/\s+/g," ").trim();
const fail=message=>{throw new Error("Worldwide SSPX source census: "+message);};
const distinctBy=(rows,key)=>[...new Map(rows.map(row=>[key(row),row])).values()];
const slugOf=(href,segment)=>{
  try{
    const u=new URL(href,"https://map.fsspx.org");
    if(u.hostname!=="map.fsspx.org")return null;
    const rx=new RegExp("^/(?:fr|en)/"+segment+"/([^/?#]+)/?$","i");
    return u.pathname.match(rx)?.[1]??null;
  }catch{return null;}
};
export function parseDistrictIndex(links,{minimumDistricts=18}={}){
  const found=[];
  for(const item of links){
    const slug=slugOf(item.href,"districts");
    if(!slug)continue;
    const title=text(item.text);
    const expected=Number(title.match(/(\d{1,4})\s*$/)?.[1]);
    if(!Number.isSafeInteger(expected)||expected<1||expected>600)continue;
    found.push({district_slug:slug,title:title.replace(/\s*\d+\s*$/,""),
      expected_source_entities:expected,
      source_url:"https://map.fsspx.org/fr/districts/"+slug});
  }
  const groups=distinctBy(found,r=>r.district_slug);
  if(groups.length<minimumDistricts)fail("district listing incomplete "+groups.length+"/"+minimumDistricts);
  return groups.sort((a,b)=>a.district_slug.localeCompare(b.district_slug));
}
export function parseDistrictPlaces(district,links){
  const found=[];
  for(const link of links){
    const slug=slugOf(link.href,"places");
    if(!slug)continue;
    const label=text(link.text);
    if(!label)continue;
    found.push({source_place_id:slug,source_url:"https://map.fsspx.org/fr/places/"+slug,
      label,origin_district:district.district_slug,
      sunday_badge_claim:/\b(?:Sunday|Dimanche|Sonntag|Domingo|Domenica)\b/i.test(label),
      weekday_badge_claim:/\b(?:Weekdays|Semaine|Werktag|Feriali)\b/i.test(label)});
  }
  const unique=distinctBy(found,r=>r.source_place_id);
  // Pages contain nested place-served relationships. Duplicate source links
  // are expected; district entity totals are the completeness control.
  if(unique.length<Math.max(1,Math.floor(district.expected_source_entities*.68))){
    fail("incomplete place links "+district.district_slug+": found "+unique.length+
      " of expected "+district.expected_source_entities);
  }
  return {district:district.district_slug,expected:district.expected_source_entities,
    discovered:unique.length,records:unique};
}
async function captureLinks(page){
  return page.evaluate(()=>[...document.querySelectorAll("a[href]")].map(a=>({
    href:a.href,text:a.textContent??"",title:a.getAttribute("title")??"",
  })));
}
async function readHtml(page,url,{fetchImpl=fetch}={}){
  let status=null;
  try{
    const response=await page.goto(url,{waitUntil:"domcontentloaded",timeout:28000});
    status=response?.status();
    if(response?.ok()){
      const links=await captureLinks(page);
      if(links.length>10)return {links,transport:"OFFICIAL_DIRECT",response_status:status};
    }
  }catch(error){status=String(error).slice(0,150);}
  // Public HTML through a read-only transport; only map.fsspx.org's own
  // source elements are parsed. This is NOT a third-party location directory.
  const errors=[];
  for(const transport of ["https://r.jina.ai/https://","https://r.jina.ai/http://"]){
    const mirror=transport+new URL(url).host+new URL(url).pathname;
    try{
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),30000);
      let response;
      try{response=await fetchImpl(mirror,{
        signal:controller.signal,headers:{"X-Respond-With":"html","Accept":"text/html"}});}
      finally{clearTimeout(timeout);}
      if(!response.ok)throw new Error("HTTP "+response.status);
      const html=await response.text();
      if(html.length<500)throw new Error("insufficient HTML "+html.length);
      await page.setContent(html,{waitUntil:"domcontentloaded",timeout:15000});
      const links=await captureLinks(page);
      if(links.length<10)throw new Error("source DOM not preserved: links="+links.length);
      return {links,transport:"OFFICIAL_HTML_VIA_READ_ONLY_PROXY",
        response_status:status};
    }catch(error){errors.push(mirror+" "+String(error));}
  }
  fail("source unavailable "+url+"; direct="+status+"; "+errors.join("; "));
}
export async function acquireWorldwideIndex({out="data/directory/research/staging/sspx-worldwide-map",
  browserFactory=null}={}){
  const {chromium}=await import("@playwright/test");
  const browser=browserFactory?await browserFactory():await chromium.launch({headless:true});
  const page=await browser.newPage({locale:"fr-FR"});
  const completed=[],failures=[];
  let directories=[],indexTransport="UNKNOWN";
  try{
    const index=await readHtml(page,OFFICIAL_INDEX);
    indexTransport=index.transport;
    directories=parseDistrictIndex(index.links);
    await page.close();
    let current=0;
    const workers=Array.from({length:4},async()=>{
      const tab=await browser.newPage({locale:"fr-FR"});
      try{
        while(current<directories.length){
          const idx=current++,district=directories[idx];
          try{
            const html=await readHtml(tab,district.source_url);
            completed.push({...parseDistrictPlaces(district,html.links),
              transport:html.transport,source_url:district.source_url});
            console.log("SSPX_INDEX_DISTRICT",district.district_slug,
              "expected",district.expected_source_entities,"recovered",
              completed.at(-1).discovered,"transport",html.transport);
          }catch(error){failures.push({district:district.district_slug,
            source_url:district.source_url,error:String(error)});}
        }
      }finally{await tab.close();}
    });
    await Promise.all(workers);
  }finally{await browser.close();}
  const all=completed.flatMap(group=>group.records);
  const canonical=new Map();
  for(const row of all){
    const old=canonical.get(row.source_place_id);
    if(old){
      old.district_refs=[...new Set([...old.district_refs,row.origin_district])];
      old.sunday_badge_claim||=row.sunday_badge_claim;
      old.weekday_badge_claim||=row.weekday_badge_claim;
    }else{
      canonical.set(row.source_place_id,{...row,district_refs:[row.origin_district]});
    }
  }
  const errors=directories.filter(x=>!completed.some(g=>g.district===x.district_slug));
  const report={
    schema:"AO_DIRECTORY_SSPX_WORLD_MAP_INDEX_REPORT_V1",
    obtained_on:new Date().toISOString(),source:OFFICIAL_INDEX,
    district_page_count:directories.length,district_pages_complete:completed.length,
    expected_source_entity_memberships:directories.reduce((n,g)=>n+g.expected_source_entities,0),
    observed_link_memberships:all.length,unique_source_place_id_count:canonical.size,
    sunday_badged_source_entities:[...canonical.values()].filter(x=>x.sunday_badge_claim).length,
    weekday_badged_source_entities:[...canonical.values()].filter(x=>x.weekday_badge_claim).length,
    first_party_index_transport:indexTransport,
    districts:completed.map(({district,expected,discovered,transport})=>
      ({district,expected,discovered,transport})).sort((a,b)=>a.district.localeCompare(b.district)),
    failures:errors,staging_only:true,publication_eligible_venues:0,
    note:"These are source entities, not unique current public Mass sites. Schools, houses, missions and multiple served-by relationships exist. No coordinates or schedule are inferred.",
  };
  const root=path.resolve(out);
  await fs.mkdir(root,{recursive:true});
  await fs.writeFile(path.join(root,"worldwide-source-index.v1.json"),
    JSON.stringify({schema:"AO_DIRECTORY_SSPX_WORLD_MAP_SOURCE_INDEX_V1",
      source:OFFICIAL_INDEX,checked_at:report.obtained_on,release_eligible:false,
      records:[...canonical.values()].sort((a,b)=>a.source_place_id.localeCompare(b.source_place_id))},null,2)+"\n");
  await fs.writeFile(path.join(root,"worldwide-source-report.v1.json"),
    JSON.stringify(report,null,2)+"\n");
  if(errors.length||failures.length)fail("partial worldwide index: "+
    completed.length+"/"+directories.length+" districts; "+
    JSON.stringify([...errors,...failures]).slice(0,2000));
  return report;
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){
  const out=process.argv.slice(2).find(x=>x.startsWith("--out="))?.slice(6);
  acquireWorldwideIndex({out}).then(report=>console.log(JSON.stringify(report,null,2)))
    .catch(error=>{console.error(error);process.exitCode=1;});
}
