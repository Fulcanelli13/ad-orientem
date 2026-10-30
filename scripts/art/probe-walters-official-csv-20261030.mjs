/**
 * Walters Art Museum official static CSV schema and targeted source-row probe.
 * Live v1 API retired in 2023. Research-only; no image downloads/approvals.
 */
import {readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
const source=JSON.parse(readFileSync("data/calendar/sacred-art-phase1-museum-479-accession-audit-20261029.v1.json","utf8"));
const rows=source.rows.filter(r=>r.museum==="walters");
if(rows.length!==42||rows.filter(r=>r.userDecision==="IMPORT_WITH_CORRECTIONS").length!==2)throw Error("Frozen Walters source scope changed");
const base="https://raw.githubusercontent.com/WaltersArtMuseum/api-thewalters-org/main/";
const sha=x=>createHash("sha256").update(x).digest("hex");
function csv(txt,handler){
 const data=txt.replace(/^\uFEFF/,"");let row=[],cell="",quoted=false,header=null,lines=0;
 const push=()=>{row.push(cell);cell=""};
 const end=()=>{push(); if(!header)header=row.map(s=>s.trim());else if(row.some(x=>x!==""))handler(Object.fromEntries(header.map((x,i)=>[x,row[i]??""])),++lines);row=[]};
 for(let i=0;i<data.length;i++){const c=data[i];if(quoted){if(c==='"'){if(data[i+1]==='"'){cell+='"';i++}else quoted=false}else cell+=c}
 else if(c==='"')quoted=true;else if(c===',')push();else if(c==='\n')end();else if(c==='\r'){if(data[i+1]!=='\n')end()}else cell+=c;}
 if(quoted)throw Error("Unclosed CSV quote");
 if(row.length||cell.length)end();
 return {header,lines};
}
const probes={};
for(const filename of ["art.csv","relationships.csv"]){
 const url=base+filename;let details;
 try{
  const res=await fetch(url,{signal:AbortSignal.timeout(75000),headers:{"User-Agent":"AdOrientem-SourceVerification/1.0"}});
  if(!res.ok)throw Error("HTTP_"+res.status);
  const raw=await res.text();
  const selections=[],first=[];
  const stats=csv(raw,(r,i)=>{if(i<=2)first.push(r);
   if(filename==="art.csv"){
    const hay=JSON.stringify(r).toLowerCase();
    if(["37.667","37.278","37.531b"].some(x=>hay.includes(x)))selections.push(r);
   }else if(JSON.stringify(r).includes("37.667")||JSON.stringify(r).includes("1016"))selections.push(r);
  });
  details={http:res.status,bytes:raw.length,sha256:sha(raw),rows:stats.lines,header:stats.header,first:first.slice(0,2),
   matchingSamples:selections.slice(0,14)};
 }catch(e){details={error:String(e).slice(0,250)}}
 probes[filename]=details;
}
const snapshot={schema:"AO_WALTERS_42_OFFICIAL_STATIC_CSV_PROBE_V1",at:new Date().toISOString(),
 officialRepository:"https://github.com/WaltersArtMuseum/api-thewalters-org",
 frozenSourceRecords:42,originalConditionalSelections:2,sourceFiles:probes,
 officialSourceRecordsCertified:0,originalUserDecisionsChanged:false,
 physicalUniquenessCertified:false,photographsCertified:false,productionMutation:false};
writeFileSync("data/calendar/sacred-art-phase1-walters-official-csv-probe-20261030.v1.json",JSON.stringify(snapshot,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify({art:{header:probes["art.csv"].header,rows:probes["art.csv"].rows,
 sample:probes["art.csv"].matchingSamples?.slice(0,4),error:probes["art.csv"].error},
 relationships:{header:probes["relationships.csv"].header,rows:probes["relationships.csv"].rows,
 sample:probes["relationships.csv"].matchingSamples?.slice(0,4),error:probes["relationships.csv"].error}},null,2));
