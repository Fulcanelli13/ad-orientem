import fs from "node:fs";
import path from "node:path";

const providers={
  fssp:{minVenues:400},
  icksp:{minVenues:25},
  ibp:{minVenues:34},
};

let failed=false;
for(const [provider,rule] of Object.entries(providers)){
  const base=path.resolve("data/directory/generated",provider);
  const report=JSON.parse(fs.readFileSync(path.join(base,"import-report.v1.json"),"utf8"));
  const issues=JSON.parse(fs.readFileSync(path.join(base,"validation-issues.v1.json"),"utf8")).issues??[];
  const venues=JSON.parse(fs.readFileSync(path.join(base,"venues.v1.json"),"utf8")).records??[];
  const errors=[];
  if(Number(report.venue_count)<rule.minVenues)errors.push("venue_count "+report.venue_count+" < "+rule.minVenues);
  if(issues.length)errors.push(issues.length+" canonical venue validation issue(s)");
  if(provider==="fssp"&&venues.some(v=>["←","→","↑","↓","+","-","Home","End","Page Up","Page Down"].includes(String(v?.name?.official??"").trim())))errors.push("FSSP navigation-control rows survived parsing");
  if(venues.some(v=>!v?.address?.country_code))errors.push("venue without country code");
  const venueIds=venues.map(v=>v?.venue_id).filter(Boolean);
  const duplicateVenueIds=[...new Set(venueIds.filter((id,index)=>venueIds.indexOf(id)!==index))];
  if(duplicateVenueIds.length)errors.push("duplicate venue_id values: "+duplicateVenueIds.slice(0,10).join(", "));
  if(errors.length){
    failed=true;
    console.error(provider.toUpperCase()+": FAIL — "+errors.join("; "));
  }else{
    console.log(provider.toUpperCase()+": PASS — "+report.venue_count+" venues, 0 canonical venue issues");
  }
}
if(failed)process.exitCode=1;
else console.log("Directory runtime snapshot quality: PASS");
