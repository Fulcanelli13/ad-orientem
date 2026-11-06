import fs from "node:fs";
import path from "node:path";
import {pathToFileURL} from "node:url";

const providers={
  fssp:{minVenues:400},
  icksp:{minVenues:25},
  ibp:{minVenues:34},
  sspx:{minVenues:100},
};

/**
 * Validate every acquired provider against canonical quality thresholds.
 * If and only if SSPX produced an explicit two-attempt upstream HTTP 403
 * witness, validate a non-publishable, zero-record HOLD instead. Never
 * synthesize an empty dataset or quietly reuse a stale SSPX snapshot.
 */
export function validateRuntimeSnapshots({
  generatedRoot="data/directory/generated",
  logger=console,
}={}){
  let failed=false,partial=false;
  const outcomes={};
  for(const [provider,rule] of Object.entries(providers)){
    const base=path.resolve(generatedRoot,provider);
    const holdFile=path.join(base,"source-unavailable.v1.json");
    if(provider==="sspx" && fs.existsSync(holdFile)){
      let evidence;
      try{evidence=JSON.parse(fs.readFileSync(holdFile,"utf8"));}
      catch(error){
        outcomes[provider]="FAIL";failed=true;
        logger.error("SSPX: FAIL — unreadable source-unavailable witness: "+error.message);
        continue;
      }
      const expected={
        schema:"AO_DIRECTORY_SOURCE_AVAILABILITY_HOLD_V1",
        provider:"SSPX",
        status:"UNAVAILABLE_UPSTREAM_403",
        upstream_status:403,
        source_registry_id:"SRC_SSPX_MAP_API",
        source_origin:"https://map.fsspx.org/api/v1",
        publishable:false,
        source_coverage_verified:false,
        acquired_records:0,
        requires_new_successful_acquisition:true,
      };
      const errors=[];
      for(const [key,value] of Object.entries(expected))
        if(evidence[key]!==value)errors.push("invalid hold "+key);
      if(!Array.isArray(evidence.attempted_paths) ||
         JSON.stringify(evidence.attempted_paths)!==
         JSON.stringify(["DIRECT_OFFICIAL_API","OFFICIAL_SITE_BROWSER_SESSION"]))
        errors.push("official direct+browser attempts not recorded");
      if(!Number.isFinite(Date.parse(evidence.checked_at)) ||
         Math.abs(Date.now()-Date.parse(evidence.checked_at))>86400000)
        errors.push("source availability witness must be from this run");
      for(const filename of ["venues.v1.json","ministries.v1.json",
        "schedules.v1.json","sources.v1.json","geo.v1.geojson",
        "import-report.v1.json"])
        if(fs.existsSync(path.join(base,filename)))
          errors.push("stale source snapshot alongside 403 hold: "+filename);
      if(errors.length){
        failed=true;outcomes[provider]="FAIL";
        logger.error("SSPX: FAIL — "+errors.join("; "));
      }else{
        partial=true;outcomes[provider]="HELD_403";
        logger.warn("SSPX: HELD — official source HTTP 403 on both acquisition paths. Zero SSPX records published; manual recheck required.");
      }
      continue;
    }
    const errors=[];
    let report,issues,venues;
    try{
      report=JSON.parse(fs.readFileSync(path.join(base,"import-report.v1.json"),"utf8"));
      issues=JSON.parse(fs.readFileSync(path.join(base,"validation-issues.v1.json"),"utf8")).issues??[];
      venues=JSON.parse(fs.readFileSync(path.join(base,"venues.v1.json"),"utf8")).records??[];
    }catch(error){
      failed=true;outcomes[provider]="FAIL";
      logger.error(provider.toUpperCase()+": FAIL — missing or unreadable source snapshot: "+error.message);
      continue;
    }
    if(Number(report.venue_count)<rule.minVenues)
      errors.push("venue_count "+report.venue_count+" < "+rule.minVenues);
    if(issues.length)errors.push(issues.length+" canonical venue validation issue(s)");
    if(provider==="fssp"&&venues.some(v=>["←","→","↑","↓","+","-","Home","End","Page Up","Page Down"].includes(String(v?.name?.official??"").trim())))
      errors.push("FSSP navigation-control rows survived parsing");
    if(venues.some(v=>!v?.address?.country_code))
      errors.push("venue without country code");
    const venueIds=venues.map(v=>v?.venue_id).filter(Boolean);
    const duplicateVenueIds=[...new Set(venueIds.filter((id,index)=>venueIds.indexOf(id)!==index))];
    if(duplicateVenueIds.length)
      errors.push("duplicate venue_id values: "+duplicateVenueIds.slice(0,10).join(", "));
    if(errors.length){
      failed=true;outcomes[provider]="FAIL";
      logger.error(provider.toUpperCase()+": FAIL — "+errors.join("; "));
    }else{
      outcomes[provider]="PASS";
      logger.log(provider.toUpperCase()+": PASS — "+report.venue_count+" venues, 0 canonical venue issues");
    }
  }
  if(failed)logger.error("Directory runtime snapshot quality: FAIL");
  else if(partial)logger.warn("Directory runtime snapshot quality: PARTIAL — three verified provider snapshots; SSPX unavailable, no SSPX snapshot published");
  else logger.log("Directory runtime snapshot quality: PASS — four verified provider snapshots");
  return Object.freeze({ok:!failed,partial,outcomes:Object.freeze(outcomes)});
}

const invokedDirectly=process.argv[1]&&
  pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url;
if(invokedDirectly){
  const result=validateRuntimeSnapshots();
  if(!result.ok)process.exitCode=1;
}
