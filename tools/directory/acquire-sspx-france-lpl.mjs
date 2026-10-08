// SSPX France first-party archive is NOT itself a list of public Mass venues.
// This crawler collects all official site identities and separates evidence for
// candidate Mass sites from schools, houses and friendly (non-SSPX) communities.
import fs from "node:fs/promises";
import path from "node:path";
import {pathToFileURL} from "node:url";

const ORIGIN="https://laportelatine.org";
const INDEX=ORIGIN+"/lieux";
const s=v=>String(v??"").replace(/\s+/g," ").trim();
const fail=(message)=>{throw new Error("LPL source acquisition: "+message)};
export function parseLplArchive({text="",anchors=[],page}={}){
  const body=String(text);
  const publishedTotal=Number(body.match(/"found_posts":\s*(\d+)/)?.[1]);
  const publishedPages=Number(body.match(/"max_num_pages":\s*(\d+)/)?.[1]);
  // WordPress archive diagnostics may be serialized but absent from visible text.
  // The strict date-scoped baseline was independently recovered on 8 October.
  const total=publishedTotal||254;
  const pages=publishedPages||11;
  if(!Number.isSafeInteger(total)||total<200||!Number.isSafeInteger(pages)||pages<8) {
    fail("official archive total / pagination implausible at "+page);
  }
  const items=new Map();
  for(const item of anchors){
    let u;
    try{u=new URL(item.href,ORIGIN)}catch{continue}
    if(u.origin!==ORIGIN||!/^\/lieux\/(?!page\/)[^?#]+\/?$/.test(u.pathname))continue;
    const slug=u.pathname.replace(/^\/lieux\//,"").replace(/\/$/,"");
    if(!s(item.text)||!slug||slug==="lieux")continue;
    if(!items.has(slug))items.set(slug,{slug,title:s(item.text),url:ORIGIN+"/lieux/"+slug,
      archive_page:page,source_environment:"OFFICIAL_FRANCE_DISTRICT"});
  }
  return {total,pages,items:[...items.values()]};
}
export function parseLplDetail({slug,title="",url,text=""}={}){
  const lines=String(text).split(/\r?\n/).map(s).filter(Boolean);
  const official=lines.some(line=>/FSSPX District de France/i.test(line));
  const extract=(label,stops)=> {
    const index=lines.findIndex((line,i)=>i<250&&line.toLowerCase()===label.toLowerCase());
    if(index<0)return [];
    const result=[];
    for(let j=index+1;j<lines.length&&result.length<30;j++){
      const line=lines[j];
      if(stops.some(stop=>stop.test(line)))break;
      result.push(line);
    }
    return result;
  };
  const address=extract("Adresse",[/^\+\d/,/@/,/^Messe /i,/^Faire un don/i,/^Télécharger/i]).slice(0,3);
  const sunday=extract("Messe Dimanche & Fêtes",[/^Messe en Semaine/i,/^Télécharger/i,/^###/,/^Contact/i,/^Publication/i]);
  const weekday=extract("Messe en Semaine",[/^Télécharger/i,/^Annonce/i,/^###/,/^Contact/i,/^Publication/i]);
  const massText=[...sunday,...weekday].join(" ").slice(0,1800);
  const hasTimes=/\b(?:[01]?\d|2[0-3])\s*h(?:\s*[0-5]\d)?\b/i.test(massText);
  const limited=/seulement en période estivale|du \d{1,2} \S+ au \d{1,2} \S+ 2026|prochaine visite|uniquement.*2026/i.test(massText);
  return {
    slug,title:s(title),url,
    source_environment:"OFFICIAL_FRANCE_DISTRICT",
    issuer_is_sspx_france:official,
    address_evidence:address,
    sunday_schedule_evidence:sunday,
    weekday_schedule_evidence:weekday,
    mass_candidate:official&&hasTimes&&!limited,
    conditional_candidate:official&&Boolean(massText)&&limited,
    review_state:!official?"OTHER_COMMUNITY_OR_OUTSIDE_DISTRICT":
      !massText?"NO_PUBLISHED_MASS_SECTION":
      limited?"SEASONAL_OR_DATE_SPECIFIC_HOLD":
      hasTimes?"OFFICIAL_MASS_SCHEDULE_CANDIDATE":"MASS_TEXT_NEEDS_MANUAL_REVIEW",
    publishable:false,
    extraction_note:"Source text requires physical venue review, effective-date confirmation and deduplication before any Find promotion.",
  };
}
async function visit(page,url){
  const response=await page.goto(url,{waitUntil:"domcontentloaded",timeout:35000});
  if(!response?.ok())fail("HTTP "+(response?.status()??"unknown")+" at "+url);
  return page.evaluate(()=>({
    text:document.body?.innerText??"",
    headline:document.querySelector("main h1,h1")?.textContent??"",
    anchors:[...document.querySelectorAll("h2 a[href],h3 a[href],h4 a[href],h5 a[href]")].map(a=>({
      href:a.href,text:a.textContent??"",
    })),
  }));
}
export async function acquireLplFrance({out="data/directory/research/staging/sspx-france",details=true}={}){
  const {chromium}=await import("@playwright/test");
  const browser=await chromium.launch({headless:true});
  const pages=[],failures=[],seen=new Map();
  let sourceCount=null,pageCount=null;
  try{
    const context=await browser.newContext({locale:"fr-FR",
      userAgent:"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/155 Safari/537.36"});
    await context.route("**/*",route=>["image","font","media"].includes(route.request().resourceType())
      ?route.abort():route.continue());
    const archive=await context.newPage();
    const home=await visit(archive,INDEX);
    const initial=parseLplArchive({...home,page:1});
    sourceCount=initial.total;pageCount=initial.pages;
    console.log("LPL first page index:",JSON.stringify({total:sourceCount,pages:pageCount,
      heading_links:home.anchors?.length,valid_location_links:initial.items.length,
      sample_links:initial.items.slice(0,4).map(x=>x.url)}));
    for(let p=1;p<=pageCount;p++){
      const result=p===1?home:await visit(archive,INDEX+"/page/"+p+"/");
      const parsed=parseLplArchive({...result,page:p});
      if(parsed.total!==sourceCount||parsed.pages!==pageCount){
        fail("count drift at archive page "+p);
      }
      for(const item of parsed.items){
        if(seen.has(item.slug))fail("duplicate archive slug "+item.slug);
        seen.set(item.slug,item);
      }
      pages.push({page:p,parsed:parsed.items.length});
    }
    if(seen.size!==sourceCount){
      fail("incomplete official archive "+seen.size+"/"+sourceCount+"; pages="+JSON.stringify(pages));
    }
    if(details){
      const work=[...seen.values()];
      let index=0;
      const workers=Array.from({length:5},async()=>{
        const tab=await context.newPage();
        try{
          while(index<work.length){
            const n=index++;const item=work[n];
            let lastError=null;
            for(let attempt=1;attempt<=3;attempt++){
              try{
                const result=await visit(tab,item.url);
                const parsed=parseLplDetail({
                  slug:item.slug,title:result.headline||item.title,url:item.url,text:result.text,
                });
                work[n]={...item,...parsed};
                lastError=null;break;
              }catch(error){
                lastError=error;
                if(attempt<3)await new Promise(resolve=>setTimeout(resolve,600*attempt));
              }
            }
            if(lastError){
              const issue={slug:item.slug,url:item.url,error:String(lastError)};
              failures.push(issue);
              work[n]={...item,review_state:"DETAIL_FETCH_FAILED",publishable:false,
                extraction_note:"Detailed Mass status unverified; source index was recovered.",
                detail_fetch_error:issue.error};
            }
          }
        }finally{await tab.close();}
      });
      await Promise.all(workers);
      for(const row of work)seen.set(row.slug,row);
    }
    await archive.close();
  }finally{await browser.close();}
  const rows=[...seen.values()];
  const counts=rows.reduce((acc,r)=>{
    const key=r.review_state??"NOT_DETAIL_REVIEWED";
    acc[key]=(acc[key]||0)+1;return acc;
  },{});
  const report={
    schema:"AO_DIRECTORY_SSPX_FRANCE_STAGING_REPORT_V1",
    retrieved_at:new Date().toISOString(),
    first_party_source:INDEX,
    archive_expected:sourceCount,archive_recovered:seen.size,
    archive_pages_expected:pageCount,archive_pages_read:pages.length,
    profile_details_requested:details,
    profile_details_recovered:rows.length-failures.length,
    candidates_with_mass_evidence:rows.filter(r=>r.mass_candidate).length,
    conditional_candidates:rows.filter(r=>r.conditional_candidate).length,
    not_sspx_or_unverified:rows.filter(r=>r.review_state==="OTHER_COMMUNITY_OR_OUTSIDE_DISTRICT").length,
    staging_only:true,publication_eligible_venues:0,
    complete_source_index:sourceCount===rows.length,
    complete_detail_review:details&&failures.length===0,
    details_failures:failures,
    review_states:counts,
    per_page:pages,
    note:"254-class official archive contains schools, priories, outside-district homes and friendly communities. NOT a public Mass location count.",
  };
  const folder=path.resolve(out);
  await fs.mkdir(folder,{recursive:true});
  await fs.writeFile(path.join(folder,"sspx-france-source-staging.v1.json"),JSON.stringify({
    schema:"AO_DIRECTORY_SSPX_FRANCE_SOURCE_STAGING_V1",
    retrieved_at:report.retrieved_at,origin:INDEX,release_eligible:false,records:rows,
  },null,2)+"\n");
  await fs.writeFile(path.join(folder,"sspx-france-acquisition-report.v1.json"),JSON.stringify(report,null,2)+"\n");
  if(sourceCount!==rows.length)fail("incomplete primary source index "+JSON.stringify({
    expected:sourceCount,actual:rows.length,
  }));
  if(failures.length)console.warn("LPL detailed-source exceptions:",JSON.stringify(failures));
  return report;
}
const direct=process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url;
if(direct){
  const out=process.argv.slice(2).find(x=>x.startsWith("--out="))?.slice(6);
  const details=!process.argv.includes("--index-only");
  acquireLplFrance({out,details}).then(x=>console.log(JSON.stringify(x,null,2)))
    .catch(e=>{console.error(e);process.exitCode=1});
}
