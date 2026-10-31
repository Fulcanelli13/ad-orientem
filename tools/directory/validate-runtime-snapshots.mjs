import fs from "node:fs";
import path from "node:path";

const providers={
  fssp:{minVenues:400},
  icksp:{minVenues:25},
  ibp:{minVenues:34},
  sspx:{minVenues:100},
};

// Default remains the strict four-provider quality gate. A workflow may
// explicitly validate a smaller, accurately labelled acquisition artifact;
// unselected providers are NOT assumed acquired or certified.
const args=process.argv.slice(2);
const providerArgs=args.filter(arg=>arg.startsWith("--providers="));
if(providerArgs.length>1 || args.some(arg=>!arg.startsWith("--providers="))){
  console.error("Usage: validate-runtime-snapshots.mjs [--providers=fssp,icksp,ibp,sspx]");
  process.exit(2);
}
const names=providerArgs.length ? providerArgs[0].slice("--providers=".length).split(",") : Object.keys(providers);
if(!names.length || names.some(name=>!Object.hasOwn(providers,name)) || new Set(names).size!==names.length){
  console.error("Invalid providers: "+names.join(","));
  process.exit(2);
}

let failed=false;
for(const provider of names){
  const rule=providers[provider];
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
else console.log("Directory runtime snapshot quality ("+names.join(", ")+"): PASS");
