import fs from "node:fs/promises";
import path from "node:path";
import {discoverApprovedDirectory} from "./discover-approved-mass-worldwide.mjs";

const pathToExisting="data/directory/research/approved-mass-worldwide-candidates-20261009.v1.json";
const pathToIndex="data/directory/research/adorientem-church-public-benchmark-20261009.v1.json";
export async function recoverWorldSourceGaps({existing,index,fetchImpl=fetch,delayMs=1300}={}){
 const missing=existing.country_coverage.filter(x=>!x.complete).map(x=>x.country_code);
 const fresh=await discoverApprovedDirectory({countries:missing,maxPages:45,maxDetails:0,delayMs,fetchImpl});
 const byId=new Map(existing.records.map(x=>[x.source_id,x]));
 const newRecords=[];
 for(const record of fresh.records){
  if(!byId.has(record.source_id)){newRecords.push(record);byId.set(record.source_id,record)}
 }
 const allRecords=[...byId.values()];
 const country_coverage=existing.country_coverage.map(row=>{
  const country_code=row.country_code;
  const retrieved=fresh.country_coverage.find(x=>x.country_code===country_code);
  const total=index?.independent_official_source?.latinmassdir_country_counts?.[country_code]??row.listed_total;
  const discovered_unique=allRecords.filter(x=>x.country_code===country_code).length;
  return {...row,listed_total:total,discovered_unique,pages_fetched:row.pages_fetched+(retrieved?.pages_fetched??0),
   complete:Number.isInteger(total)&&total===discovered_unique};
 });
 const expected=Object.values(index.independent_official_source.latinmassdir_country_counts).reduce((n,x)=>n+x,0);
 return {
  ...existing,generated_at:new Date().toISOString(),
  summary:{...existing.summary,requests:existing.summary.requests+fresh.summary.requests,
   unique_discovered:allRecords.length,errors:existing.summary.errors+fresh.summary.errors,
   full_countries:country_coverage.filter(x=>x.complete).length,source_index_expected:expected,
   recovered_new_records:newRecords.length,unresolved_after_recovery:expected-allRecords.length},
  country_coverage,records:allRecords,
  recovery:{at:new Date().toISOString(),attempted_countries:missing,
   fresh_country_coverage:fresh.country_coverage,errors:fresh.errors,added_records:newRecords.length},
  newRecords
 };
}
const invoked=process.argv[1]?.endsWith("/recover-approved-world-source-gaps.mjs");
if(invoked){
 const out=process.argv.find(a=>a.startsWith("--out="))?.slice(6);
 if(!process.argv.includes("--remote")||!out)throw Error("Usage: --remote --out=FILE");
 const existing=JSON.parse(await fs.readFile(pathToExisting,"utf8"));
 const index=JSON.parse(await fs.readFile(pathToIndex,"utf8"));
 const result=await recoverWorldSourceGaps({existing,index});
 await fs.mkdir(path.dirname(out),{recursive:true});
 const {newRecords,...snapshot}=result;
 await fs.writeFile(out,JSON.stringify(snapshot,null,2)+"\n");
 console.log("RECOVERY_SUMMARY_JSON="+JSON.stringify({summary:snapshot.summary,remaining:snapshot.country_coverage.filter(c=>!c.complete)}));
 console.log("RECOVERED_SOURCE_ROWS_JSON="+JSON.stringify(newRecords));
}
