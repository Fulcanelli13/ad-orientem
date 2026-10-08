import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {expandResearchProviderSnapshot} from "../../src/find/data-service.js";
import {normalizeAddress} from "../../src/find/entity-resolution.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const LIVE=Object.freeze(["fssp","icksp","ibp"]);
const RESEARCH=Object.freeze([
  "diocesan","aasjmv","fsvf","canons-st-john-cantius","cmri","rci",
  "cspv","smmd","icksp-federated","sspx-district-seed","sspx-france-first-party","sspx-france-second-pass","sspx-four-district-bulk","sspx-oct26-europe","sspx-oct26-americas","sspx-oct26-poland","sspx-asia-central-americas","sspx-north-america-20261008",
]);
function file(relative){
  return JSON.parse(fs.readFileSync(path.join(ROOT,relative),"utf8"));
}
function list(value){return Array.isArray(value)?value:[]}
function providerCensus(label,venues,ministries,schedules){
  const massMinistries=new Set(list(schedules).filter(s=>s.service_type==="MASS"&&
    list(s.source_ids).length>0&&String(s?.payload?.raw??"").trim())
    .map(s=>s.ministry_id));
  const massVenues=new Set(list(ministries).filter(m=>massMinistries.has(m.ministry_id))
    .map(m=>m.venue_id));
  const countryCounts={};
  for(const v of venues){const cc=String(v?.address?.country_code??"UNKNOWN").toUpperCase();
    countryCounts[cc]=(countryCounts[cc]||0)+1;
  }
  return {provider:label,records:venues.length,
    mass_evidenced_records:venues.filter(v=>massVenues.has(v.venue_id)).length,
    without_mass_assertion:venues.filter(v=>!massVenues.has(v.venue_id)).length,
    countries:countryCounts};
}
function physicalCollisionGroups(all){
  const addressMap=new Map();
  for(const {provider,venue} of all){
    const country=venue?.address?.country_code;
    // A city or postcode alone is never a reliable physical-address identity.
    const street=venue?.address?.line1||venue?.address?.formatted;
    const formatted=normalizeAddress(street);
    if(!country||!formatted||formatted.length<14)continue;
    const key=String(country).toUpperCase()+"|"+formatted;
    const group=addressMap.get(key)??[];
    group.push({provider,venue_id:venue.venue_id,
      name:venue?.name?.official??"Unnamed",country_code:country,
      address:venue?.address?.formatted??street});
    addressMap.set(key,group);
  }
  return [...addressMap].filter(([,group])=>new Set(group.map(x=>x.provider)).size>1)
    .map(([fingerprint,records])=>({fingerprint,records}))
    .sort((a,b)=>b.records.length-a.records.length)
}
export function auditWorldwideDirectory(){
  const providers=[],all=[];
  for(const id of LIVE){
    const dir="data/directory/generated/"+id+"/";
    const venues=list(file(dir+"venues.v1.json").records);
    const ministries=list(file(dir+"ministries.v1.json").records);
    const schedules=list(file(dir+"schedules.v1.json").records);
    providers.push(providerCensus(id.toUpperCase()+"_LIVE",venues,ministries,schedules));
    all.push(...venues.map(venue=>({provider:id.toUpperCase()+"_LIVE",venue})));
  }
  for(const name of RESEARCH){
    const snapshot=file("data/directory/generated/v19/"+name+".v1.json");
    const projected=expandResearchProviderSnapshot(snapshot);
    providers.push(providerCensus(snapshot.provider,projected.venues,projected.ministries,projected.schedules));
    all.push(...projected.venues.map(venue=>({provider:snapshot.provider,venue})));
  }
  const totals=providers.reduce((o,p)=>({
    source_venue_records:o.source_venue_records+p.records,
    mass_evidenced_records:o.mass_evidenced_records+p.mass_evidenced_records,
    without_mass_assertion:o.without_mass_assertion+p.without_mass_assertion,
  }),{source_venue_records:0,mass_evidenced_records:0,without_mass_assertion:0});
  const collisions=physicalCollisionGroups(all);
  const allCountries=new Set(all.map(x=>x.venue?.address?.country_code).filter(Boolean));
  const report={
    schema:"AO_DIRECTORY_WORLDWIDE_COVERAGE_AUDIT_V1",
    measurement:"REPOSITORY_SOURCE_RECORDS_NOT_UNIQUE_WORLDWIDE_PHYSICAL_MASS_VENUES",
    ...totals,countries_represented:allCountries.size,
    cross_provider_exact_address_review_groups:collisions.length,
    possible_cross_provider_duplicate_groups:collisions,
    by_provider:providers,
    controls:{
      has_worldwide_physical_dedupe:false,
      has_provider_overlap_adjudication_for_every_record:false,
      missing_worldwide_venue_count:null,
      externally_claimed_venues_not_imported:true,
    },
    benchmark_context:{
      sspx_published_mass_locations_reference:798,
      sspx_seed_mass_records:
        (providers.find(x=>x.provider==="SSPX_DISTRICT_SEED")?.mass_evidenced_records??0)+
        (providers.find(x=>x.provider==="SSPX_FRANCE_FIRST_PARTY")?.mass_evidenced_records??0)+
        (providers.find(x=>x.provider==="SSPX_FRANCE_SECOND_PASS")?.mass_evidenced_records??0)+
        (providers.find(x=>x.provider==="SSPX_FOUR_DISTRICT_BULK")?.mass_evidenced_records??0)+
        (providers.find(x=>x.provider==="SSPX_OCT26_MULTIREGION")?.mass_evidenced_records??0)+
        (providers.find(x=>x.provider==="SSPX_OCT26_AMERICAS")?.mass_evidenced_records??0)+
        (providers.find(x=>x.provider==="SSPX_OCT26_POLAND")?.mass_evidenced_records??0)+
        (providers.find(x=>x.provider==="SSPX_ASIA_CENTRAL_AMERICAS_20261008")?.mass_evidenced_records??0)+
        (providers.find(x=>x.provider==="SSPX_NA_DISTRICTS_20261008")?.mass_evidenced_records??0),
      sspx_raw_count_shortfall_non_authoritative:798-
        ((providers.find(x=>x.provider==="SSPX_DISTRICT_SEED")?.mass_evidenced_records??0)+
         (providers.find(x=>x.provider==="SSPX_FRANCE_FIRST_PARTY")?.mass_evidenced_records??0)+
        (providers.find(x=>x.provider==="SSPX_FRANCE_SECOND_PASS")?.mass_evidenced_records??0)+
        (providers.find(x=>x.provider==="SSPX_FOUR_DISTRICT_BULK")?.mass_evidenced_records??0)+
        (providers.find(x=>x.provider==="SSPX_OCT26_MULTIREGION")?.mass_evidenced_records??0)+
        (providers.find(x=>x.provider==="SSPX_OCT26_AMERICAS")?.mass_evidenced_records??0)+
        (providers.find(x=>x.provider==="SSPX_OCT26_POLAND")?.mass_evidenced_records??0)+
        (providers.find(x=>x.provider==="SSPX_ASIA_CENTRAL_AMERICAS_20261008")?.mass_evidenced_records??0)+
        (providers.find(x=>x.provider==="SSPX_NA_DISTRICTS_20261008")?.mass_evidenced_records??0)),
      note:"Provider historical/public statistics are neither a unique physical count nor a date-matched missing-site inventory.",
    },
  };
  return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const report=auditWorldwideDirectory();
  if(process.argv.includes("--json"))console.log(JSON.stringify(report,null,2));
  else console.log(JSON.stringify({
    records:report.source_venue_records,mass_evidenced:report.mass_evidenced_records,
    without_mass_evidence:report.without_mass_assertion,
    countries:report.countries_represented,
    potential_exact_address_groups:report.cross_provider_exact_address_review_groups,
    by_provider:report.by_provider.map(x=>({p:x.provider,n:x.records,mass:x.mass_evidenced_records})),
  },null,2));
}
