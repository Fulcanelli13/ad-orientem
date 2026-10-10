// Official HTML index acquisition fallback for SSPX source coverage.
// The output is discovery evidence, NEVER a canonical Mass-schedule dataset.
import fs from "node:fs/promises";
import path from "node:path";
import {pathToFileURL} from "node:url";

const ORIGIN="https://map.fsspx.org";
const LANGUAGES="en|fr|de|es|it";
function regexFor(kind){
  return new RegExp("^/(?:"+LANGUAGES+")/"+kind+"/([^/]+)/?$","i");
}
function parseLinks(anchors,kind){
  const pattern=regexFor(kind), seen=new Map();
  for(const a of anchors||[]){
    let url;
    try{url=new URL(a.href,ORIGIN);}catch{continue;}
    if(url.origin!==ORIGIN)continue;
    const match=url.pathname.match(pattern);
    if(!match)continue;
    const key=decodeURIComponent(match[1]).toLowerCase();
    if(kind==="countries"&&!/^[a-z]{2}$/.test(key))continue;
    if(!seen.has(key))seen.set(key,{
      key,url:url.origin+url.pathname,label:String(a.text??"").trim().replace(/\s+/g," ")
    });
  }
  return [...seen.values()];
}
export function parseSspxCountryIndex(anchors){
  return parseLinks(anchors,"countries").map(entry=>({
    country_code:entry.key.toUpperCase(),url:entry.url,label:entry.label,
  })).sort((a,b)=>a.country_code.localeCompare(b.country_code));
}
export function parseSspxCountryPage({countryCode,headline,anchors,pageUrl}){
  const matched=String(headline??"").match(/\b(\d+)\s+(?:places|lieux|orte|lugares|luoghi)\b/i);
  if(!matched)throw new Error("SSPX HTML: missing official country count for "+countryCode+": "+headline);
  const expected=Number(matched[1]);
  const links=parseLinks(anchors,"places");
  return {
    country_code:countryCode,
    page_url:pageUrl,
    headline:String(headline??"").trim(),
    expected_source_entities:expected,
    recovered_source_entities:links.length,
    coverage_complete:links.length===expected,
    records:links.map(x=>({
      source_slug:x.key,source_url:x.url,label:x.label,
      country_code:countryCode,country_page_url:pageUrl,
      acquisition_class:"OFFICIAL_HTML_DISCOVERY_ONLY",
    })),
  };
}
function argumentsFrom(argv){
  const options={out:"data/directory/research/sspx-html-source-index",lang:"en",countries:null};
  for(const a of argv){
    if(a.startsWith("--out="))options.out=a.slice(6);
    else if(a.startsWith("--lang="))options.lang=a.slice(7);
    else if(a.startsWith("--countries="))options.countries=a.slice(12).split(",").map(s=>s.trim().toUpperCase()).filter(Boolean);
  }
  if(!["en","fr","de","es","it"].includes(options.lang))throw new Error("Unsupported language");
  if(options.countries && options.countries.some(code=>!/^[A-Z]{2}$/.test(code)))throw new Error("Invalid country code");
  return options;
}
async function visit(page,url){
  for(let attempt=0;attempt<2;attempt++){
    try{
      const response=await page.goto(url,{waitUntil:"domcontentloaded",timeout:25000});
      if(!response||!response.ok())throw new Error("HTTP "+(response?.status()??"unknown"));
      return await page.evaluate(()=>({
        title:document.title,
        headline:document.querySelector("h1")?.textContent??"",
        anchors:[...document.querySelectorAll("a[href]")].map(a=>({
          href:a.href,text:a.textContent??"",
        })),
      }));
    }catch(error){
      if(attempt===1)throw new Error("SSPX HTML acquisition failed at "+url+": "+String(error));
      await new Promise(resolve=>setTimeout(resolve,1500*(attempt+1)));
    }
  }
}
export async function acquireSspxHtmlInventory({out,lang="en",countries=null}={}){
  const {chromium}=await import("@playwright/test");
  const browser=await chromium.launch({headless:true});
  const rows=[],countryReports=[],failures=[],crossCountryDuplicates=[];
  let index=null;
  try{
    const page=await browser.newPage({locale:"en-US",
      userAgent:"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155 Safari/537.36"});
    await page.route("**/*",route=>["image","font","media"].includes(route.request().resourceType())
      ?route.abort():route.continue());
    const indexUrl=ORIGIN+"/"+lang+"/countries";
    const home=await visit(page,indexUrl);
    index=parseSspxCountryIndex(home.anchors);
    if(index.length<60)throw new Error("SSPX HTML country index incomplete: "+index.length+" links");
    const selected=countries?index.filter(c=>countries.includes(c.country_code)):index;
    if(countries&&selected.length!==new Set(countries).size) {
      throw new Error("SSPX HTML country lookup missing requested country codes");
    }
    for(const c of selected){
      const url=ORIGIN+"/"+lang+"/countries/"+c.country_code.toLowerCase();
      try{
        const result=await visit(page,url);
        const parsed=parseSspxCountryPage({
          countryCode:c.country_code,headline:result.headline,anchors:result.anchors,pageUrl:url,
        });
        countryReports.push({
          country_code:c.country_code,expected:parsed.expected_source_entities,
          recovered:parsed.recovered_source_entities,complete:parsed.coverage_complete,url,
        });
        rows.push(...parsed.records);
      }catch(error){
        failures.push({country_code:c.country_code,url,error:String(error)});
        // Repeated host-level access failures must not cause hours of futile requests.
        if(failures.length>=2)break;
      }
    }
  }finally{
    await browser.close();
  }
  const bySlug=new Map();
  for(const row of rows){
    const existing=bySlug.get(row.source_slug);
    if(existing&&existing.country_code!==row.country_code){
      crossCountryDuplicates.push({
        slug:row.source_slug,countries:[existing.country_code,row.country_code],
      });
    }else if(!existing)bySlug.set(row.source_slug,row);
  }
  const retrievedAt=new Date().toISOString();
  const complete=failures.length===0 && countryReports.every(c=>c.complete) &&
    crossCountryDuplicates.length===0;
  const report={
    schema:"AO_DIRECTORY_SSPX_HTML_DISCOVERY_REPORT_V1",
    retrieved_at:retrievedAt,country_index_count:index.length,
    country_pages_expected:countries?.length??index.length,
    country_pages_retrieved:countryReports.length,
    source_rows_recovered:rows.length,unique_source_slugs:bySlug.size,
    sum_of_country_expected_counts:countryReports.reduce((n,c)=>n+c.expected,0),
    all_pages_complete:complete,
    source_type:"OFFICIAL_HTML_DISCOVERY_ONLY",
    canonical_mass_venues_published:0,
    failures,cross_country_duplicates:crossCountryDuplicates,
    country_reports:countryReports,
  };
  const directory=path.resolve(out??"data/directory/research/sspx-html-source-index");
  await fs.mkdir(directory,{recursive:true});
  await fs.writeFile(path.join(directory,"html-source-rows.v1.json"),
    JSON.stringify({schema:"AO_DIRECTORY_SSPX_HTML_SOURCE_ROWS_V1",retrieved_at:retrievedAt,records:rows},null,2)+"\n");
  await fs.writeFile(path.join(directory,"html-acquisition-report.v1.json"),JSON.stringify(report,null,2)+"\n");
  if(!complete)throw new Error("SSPX HTML country coverage incomplete: "+JSON.stringify({
    recovered:rows.length,expected:report.sum_of_country_expected_counts,failures:failures.length,
    mismatched:countryReports.filter(c=>!c.complete),duplicates:crossCountryDuplicates,
  }));
  return report;
}
const direct=process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url;
if(direct){
  acquireSspxHtmlInventory(argumentsFrom(process.argv.slice(2)))
    .then(report=>process.stdout.write(JSON.stringify(report,null,2)+"\n"))
    .catch(error=>{console.error(error);process.exitCode=1});
}
