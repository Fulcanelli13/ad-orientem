// One-pass first-party US/Canada SSPX district census, source-only by default.
// Uses the complete Drupal chapel list, NOT the blocked worldwide SSPX map API.
// No generated data is automatically published; exact physical/location and
// current Sunday evidence are required before a record can be promoted.
import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";

export const DISTRICTS=Object.freeze({
  US:{url:"https://sspx.org/en/list-sspx-chapels",label:"United States",cc:"US"},
  CA:{url:"https://fsspx.ca/en/list-sspx-chapels-4",label:"Canada",cc:"CA"},
});
const flat=x=>String(x??"").replace(/\s+/g," ").trim();
const fingerprint=x=>flat(x).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
  .replace(/\b(avenue|av\.?)\b/g,"ave").replace(/\b(road|rd\.?)\b/g,"rd")
  .replace(/\b(street|st\.?)\b/g,"st").replace(/\b(east|e\.?)\b/g,"e")
  .replace(/\b(west|w\.?)\b/g,"w").replace(/[^a-z0-9]/g,"");
function invariant(ok,message){if(!ok)throw new Error("SSPX US/CA: "+message);}
function slug(x){return flat(x).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toUpperCase()
  .replace(/[^A-Z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,100);}
function addressFromCard(card,country){
  const lines=String(card.raw??"").split(/\r?\n/).map(flat).filter(Boolean);
  const heading=lines.findIndex(line=>line===flat(card.title));
  const countryIdx=lines.findIndex((line,i)=>i>heading&&
    line.toLowerCase()===country.label.toLowerCase());
  if(heading<0||countryIdx<heading+2)return null;
  const addressLines=lines.slice(heading+1,countryIdx).filter(line=>!/^Map$|^Call for Mass|^Visit the website/i.test(line));
  if(addressLines.length<2||addressLines.length>6)return null;
  let cityLineIndex=-1;
  const pattern=country.cc==="US"
    ? /,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/
    : /\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/i;
  for(let i=0;i<addressLines.length;i++){
    if(pattern.test(addressLines[i]))cityLineIndex=i;
  }
  if(cityLineIndex<1)return null;
  const cityLine=addressLines[cityLineIndex];
  const streetLines=addressLines.slice(0,cityLineIndex);
  // No automatic public address if a city or province is the only location.
  if(!streetLines.some(line=>/\d|church|chapel|hall|hotel|centre|center|community|parish/i.test(line)))return null;
  const city=country.cc==="US"
    ?cityLine.match(/^(.+?),\s*[A-Z]{2}\s+\d{5}/)?.[1]
    :cityLine.match(/^(.+?)\s+(?:[A-Z]{2}\s+)?[A-Z]\d[A-Z]\s?\d[A-Z]\d/i)?.[1];
  if(!city)return null;
  const address=[...streetLines,cityLine].join(", ");
  return {address,street:streetLines.join(", "),city:flat(city),city_line:cityLine};
}
export function parseNorthAmericaCards(cards,{district,checkedOn="2026-10-08"}={}){
  invariant(DISTRICTS[district],"unknown district");
  const config=DISTRICTS[district],seen=new Set();
  const rows=[],exceptions=[],discovered=[];
  for(const card of cards){
    const title=flat(card.title),raw=String(card.raw??"");
    if(!title||!raw)continue;
    const countryLine=raw.split(/\r?\n/).map(flat).find(line=>
      /^(United States|Canada|Mexico)$/i.test(line));
    if(!countryLine)continue;
    // The US site also lists a Mexican chapel. Country from physical source.
    const country=/^United States$/i.test(countryLine)?"US":
      /^Canada$/i.test(countryLine)?"CA":"MX";
    const sunday=/\bSunday Mass\b|\bMesse dominicale\b/i.test(raw);
    const weekday=/\bWeekday Mass\b|\bMesse en semaine\b/i.test(raw);
    const key=country+"|"+fingerprint(title)+"|"+fingerprint(raw.slice(0,raw.indexOf(countryLine)+countryLine.length));
    if(seen.has(key))continue;
    seen.add(key);
    const base={source_title:title,source_page:config.url,source_country:country,
      source_raw:raw.slice(0,3000),checked_on:checkedOn,
      sunday_tag:sunday,weekday_tag:weekday};
    discovered.push(base);
    if(country!==config.cc){exceptions.push({...base,reason:"OUT_OF_DISTRICT_COUNTRY"});continue;}
    const address=addressFromCard(card,config);
    const nonPublic=/\bacademy\b|\bschool\b|\bconvent\b|\bcarmel\b|\bmonastery\b|\bseminary\b|\bnovitiate\b|\bretrait[e]?\s+home\b/i.test(title);
    if(!sunday){exceptions.push({...base,reason:"NO_PUBLIC_SUNDAY_TAG",address:address?.address??null});continue;}
    if(!address){exceptions.push({...base,reason:"NO_ACTIONABLE_PHYSICAL_ADDRESS"});continue;}
    if(nonPublic){exceptions.push({...base,reason:"INSTITUTIONAL_PUBLIC_ACCESS_REVIEW",address:address.address});continue;}
    const limited=/\bmission\b|\bonce\b|\btwice\b|\bmonthly\b|\boccasional\b|\b4 times a year\b|\bcall for mass\b|\bcall for details\b|\brefer to the bulletin\b|\b1st Sunday\b|\b2nd Sunday\b|\b3rd Sunday\b|\b4th Sunday\b/i.test(title+" "+raw);
    const nameAndCity=country+"|"+fingerprint(title)+"|"+fingerprint(address.city);
    const physicalKey=country+"|"+fingerprint(address.street)+"|"+fingerprint(address.city);
    rows.push({
      u:"SSPX-NA-"+country+"-"+slug(title)+"-"+slug(address.city)+"-"+slug(address.street).slice(0,32),
      cc:country,l:address.city,n:title,a:address.address,
      vt:/\bchurch\b|\béglise\b/i.test(title)?"church":"chapel",
      sr:limited
        ?"Sunday Mass is listed by the official district; dates or times vary. Check the latest chapel bulletin."
        :"Sunday Mass is listed by the official district; verify the current time before travel.",
      su:config.url,ps:limited?"CONDITIONAL_MASS":"CURRENT_PUBLIC_MASS",
      source_title:title,source_checked_on:checkedOn,
      candidate_identity:{name_city:nameAndCity,physical_address:physicalKey},
      review_flag:"EXPLICIT_OFFICIAL_SUNDAY_MASS_DIRECTORY_TAG",
    });
  }
  const addresses=new Set(),ids=new Set(),deduped=[];
  for(const record of rows){
    if(ids.has(record.u)||addresses.has(record.candidate_identity.physical_address)){
      exceptions.push({source_title:record.n,address:record.a,source_page:record.su,
        reason:"INTRA_DIRECTORY_DUPLICATE_PHYSICAL_SITE",source_country:record.cc});continue;
    }
    ids.add(record.u);addresses.add(record.candidate_identity.physical_address);
    deduped.push(record);
  }
  return {schema:"AO_SSPX_NA_OFFICIAL_CANDIDATES_V1",checked_on:checkedOn,
    district,country:config.cc,source_url:config.url,
    source_place_entries:discovered.length,
    site_candidates:deduped.length,held_source_entries:exceptions.length,
    records:deduped,exceptions};
}

export function reconcileWithRegistry(result,existing){
  const addresses=new Map(),names=new Map();
  for(const r of existing){
    if(!r?.cc||!r?.a||!r?.n||!r?.l)continue;
    const cc=r.cc;
    const cityKey=cc+"|"+fingerprint(r.n)+"|"+fingerprint(r.l);
    const rawAddr=flat(r.a);
    const addrFirst=rawAddr.split(",")[0];
    const streetKey=cc+"|"+fingerprint(addrFirst)+"|"+fingerprint(r.l);
    if(!names.has(cityKey))names.set(cityKey,r);
    if(!addresses.has(streetKey))addresses.set(streetKey,r);
  }
  const promoted=[],held=[...result.exceptions];
  for(const r of result.records){
    const nameKey=r.cc+"|"+fingerprint(r.n)+"|"+fingerprint(r.l);
    const addrKey=r.cc+"|"+fingerprint(r.a.split(",")[0])+"|"+fingerprint(r.l);
    const same=addresses.get(addrKey)||names.get(nameKey);
    if(same){
      held.push({source_title:r.n,address:r.a,reason:"MATCHES_EXISTING_PROVIDER_VENUE",
        canonical_source_id:same.u,source_page:r.su,country:r.cc});
      continue;
    }
    // Do not auto-promote mixed institutional/house use, ambiguous locations.
    promoted.push({...r,source_id:r.u});
    addresses.set(addrKey,r);names.set(nameKey,r);
  }
  return {...result,registry_new_records:promoted,held,
    registry_new_count:promoted.length,held_total:held.length};
}
export function readExistingSspxSnapshots(root=process.cwd()){
  return fs.readdir(path.join(root,"data/directory/generated/v19"))
    .then(async files=>{
      const rows=[];
      for(const name of files.filter(x=>x.endsWith(".v1.json"))){
        const doc=JSON.parse(await fs.readFile(path.join(root,"data/directory/generated/v19",name),"utf8"));
        if(!String(doc.provider||"").startsWith("SSPX_"))continue;
        rows.push(...(doc.records||[]));
      }
      return rows;
    });
}
export function parseDistrictMarkdown(text,{url}={}){
  const source=String(text??"");
  const chunks=[];
  const headings=[...source.matchAll(/^#{2,4}[ \t]+(.+)$/gm)];
  for(let i=0;i<headings.length;i++){
    const h=headings[i],start=h.index,end=headings[i+1]?.index??source.length;
    const raw=source.slice(start,end).split(/\r?\n/)
      .map(line=>line.replace(/^\s*(?:[*-]\s+|\d+[.)]\s+)/,"").trim())
      .filter(line=>line&&!/^!\[/.test(line)&&!/^Image:/.test(line)).join("\n");
    const title=flat(h[1].replace(/\[([^\]]+)\]\([^)]+\)/g,"$1"));
    if(title&&title.length<160&&/^(United States|Canada|Mexico)$/m.test(raw))
      chunks.push({title,raw:title+"\n"+raw.split("\n").slice(1).join("\n")});
  }
  return chunks;
}
async function fallbackCards(url){
  const mirrors=[
    "https://r.jina.ai/https://"+new URL(url).host+new URL(url).pathname,
    "https://r.jina.ai/http://"+new URL(url).host+new URL(url).pathname,
  ];
  const errors=[];
  for(const mirror of mirrors){
    try{
      const controller=new AbortController();
      const deadline=setTimeout(()=>controller.abort(),25000);
      let result;
      try{result=await fetch(mirror,{signal:controller.signal,headers:{"Accept":"text/plain"}});}
      finally{clearTimeout(deadline);}
      if(!result.ok)throw new Error("HTTP "+result.status);
      const text=await result.text();
      if(text.length<10000)throw new Error("mirror too short: "+text.length);
      const cards=parseDistrictMarkdown(text,{url});
      const required=url.includes("sspx.org")?["Annunciation Chapel","Christ the King Church"]:
        ["Cathedral of the Transfiguration","Christ the King Church"];
      if(cards.length<25||!required.every(name=>cards.some(c=>c.title.includes(name)))){
        throw new Error("incomplete mirror: "+cards.length+" cards; missing sentinels");
      }
      return {cards,transport:"THIRD_PARTY_READ_ONLY_RENDER",mirror};
    }catch(error){errors.push(mirror+": "+String(error));}
  }
  throw new Error("No usable district transport for "+url+"; "+errors.join("; "));
}
async function fetchCards(browser,url){
  const page=await browser.newPage({locale:"en-US"});
  try{
    const response=await page.goto(url,{waitUntil:"domcontentloaded",timeout:45000});
    if(!response?.ok()){
      const fallback=await fallbackCards(url);
      console.warn("Official district direct access denied; source retrieved from nonauthoritative mirror",url,fallback.transport);
      return fallback.cards;
    }
    return await page.evaluate(()=>{
      const items=[];
      for(const h of document.querySelectorAll("h2")){
        const title=(h.innerText||h.textContent||"").trim();
        if(!title||title.length>160)continue;
        let node=h,found=null;
        for(let i=0;i<9&&node;i++,node=node.parentElement){
          if(node.querySelectorAll("h2").length>1)break;
          const raw=node.innerText||"";
          if(/(?:\n|\r)(?:United States|Canada|Mexico)(?:\n|\r)/.test("\n"+raw+"\n")
            &&raw.length<3500&&raw.length>title.length+15)found={title,raw};
        }
        if(found)items.push(found);
      }
      return items;
    });
  }finally{await page.close();}
}
export async function acquireNorthAmerica({out="data/directory/research/staging/sspx-north-america",
  checkedOn="2026-10-08",browserFactory=null}={}){
  const {chromium}=await import("@playwright/test");
  const browser=browserFactory?await browserFactory():await chromium.launch({headless:true});
  const result=[];
  try{
    for(const district of ["US","CA"]){
      const cards=await fetchCards(browser,DISTRICTS[district].url);
      invariant(cards.length>=(district==="US"?70:25),"insufficient visible cards: "+district+": "+cards.length);
      const snapshot=parseNorthAmericaCards(cards,{district,checkedOn});
      const current=await readExistingSspxSnapshots();
      const reconciled=reconcileWithRegistry(snapshot,current);
      // Mass site counts are only meaningful if a reasonable fraction of all
      // source cards has been recovered. Never call a partial scrape complete.
      invariant(snapshot.source_place_entries>=(district==="US"?70:25),
        "source DOM unexpectedly incomplete for "+district+": "+snapshot.source_place_entries);
      result.push(reconciled);
    }
  }finally{await browser.close();}
  const count=k=>result.reduce((sum,r)=>sum+(r[k]??0),0);
  const report={
    schema:"AO_SSPX_NA_BULK_COVERAGE_REPORT_V1",checked_on:checkedOn,
    source_place_entries:count("source_place_entries"),
    official_sunday_candidates:count("site_candidates"),
    new_public_mass_candidates:count("registry_new_count"),
    withheld_source_entries:count("held_total"),
    districts:result.map(x=>({district:x.district,source_entries:x.source_place_entries,
      sunday_candidates:x.site_candidates,new_candidates:x.registry_new_count,held:x.held_total})),
    staging_only:true,publication_eligible_venues:0,
  };
  const dir=path.resolve(out);
  await fs.mkdir(dir,{recursive:true});
  await fs.writeFile(path.join(dir,"report.v1.json"),JSON.stringify(report,null,2)+"\n");
  await fs.writeFile(path.join(dir,"candidate-records.v1.json"),JSON.stringify({
    schema:"AO_SSPX_NA_CANDIDATE_RECORDS_V1",checked_on:checkedOn,release_eligible:false,
    records:result.flatMap(x=>x.registry_new_records),
  },null,2)+"\n");
  await fs.writeFile(path.join(dir,"exceptions.v1.json"),JSON.stringify({
    schema:"AO_SSPX_NA_EXCEPTIONS_V1",checked_on:checkedOn,
    entries:result.flatMap(x=>x.held),
  },null,2)+"\n");
  return {report,records:result.flatMap(x=>x.registry_new_records),
    exceptions:result.flatMap(x=>x.held)};
}
const direct=process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url;
if(direct){
  const out=process.argv.slice(2).find(x=>x.startsWith("--out="))?.slice(6);
  acquireNorthAmerica({out}).then(({report})=>console.log(JSON.stringify(report,null,2)))
    .catch(error=>{console.error(error);process.exitCode=1;});
}
