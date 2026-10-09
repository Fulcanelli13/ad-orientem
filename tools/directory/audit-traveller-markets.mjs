import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {DEFAULT_PROVIDERS,RESEARCH_PROVIDERS,expandResearchProviderSnapshot} from "../../src/find/data-service.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const rootFile=relative=>path.join(ROOT,relative);
const read=relative=>JSON.parse(fs.readFileSync(rootFile(relative),"utf8"));
const items=value=>Array.isArray(value)?value:[];
const officialSources=source=>["PRIMARY","OFFICIAL","PARISH","DIOCESE","COMMUNITY","ORATORY","CATHEDRAL","SHRINE"].some(term=>String(source?.authority||source?.issuer||source?.source_type||"").toUpperCase().includes(term));
const asISO=value=>String(value??"").trim().toUpperCase();
const date=value=>/^20\d\d-\d\d-\d\d/.test(String(value??""))?String(value).slice(0,10):null;
const addressFingerprint=venue=>{
 const formatted=String(venue?.address?.line1??venue?.address?.formatted??"").normalize("NFKD")
   .replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
 if(formatted.length<14||!/\d/.test(formatted))return null;
 return asISO(venue.address.country_code)+"|"+formatted;
};
function inventoryFromFiles(today){
 const providers=[...DEFAULT_PROVIDERS.map(x=>({kind:"LIVE",name:x,path:"data/directory/generated/"+x+"/"})),
  ...RESEARCH_PROVIDERS.map(x=>({kind:"RESEARCH",name:x.key,path:"data/directory/generated/v19/"+x.file,geoFile:x.geoFile}))];
 const index=[],missing=[];
 for(const p of providers){
  let venues,ministries,schedules,sources;
  if(p.kind==="LIVE"){
   const paths=["venues","ministries","schedules","sources"].map(part=>p.path+part+".v1.json");
   if(!paths.every(f=>fs.existsSync(rootFile(f)))){missing.push({provider:p.name,reason:"LIVE_PROVIDER_SOURCE_FILE_NOT_MOUNTED"});continue}
   [venues,ministries,schedules,sources]=paths.map(f=>items(read(f).records));
  }else{
   if(!fs.existsSync(rootFile(p.path))){missing.push({provider:p.name,reason:"RESEARCH_PROVIDER_SOURCE_FILE_NOT_MOUNTED"});continue}
   const geoRecords=p.geoFile&&fs.existsSync(rootFile("data/directory/generated/v19/"+p.geoFile))
     ?items(read("data/directory/generated/v19/"+p.geoFile).records):[];
   const x=expandResearchProviderSnapshot(read(p.path),{geoRecords});
   ({venues,ministries,schedules,sources}=x);
  }
  const massSchedules=items(schedules).filter(s=>s.service_type==="MASS"&&
    items(s.source_ids).length>0&&String(s?.payload?.raw??"").trim());
  const schedulesByMinistry=new Map();
  for(const schedule of massSchedules){
   const list=schedulesByMinistry.get(schedule.ministry_id)??[];
   list.push(schedule);schedulesByMinistry.set(schedule.ministry_id,list);
  }
  const massVenues=new Map();
  for(const m of items(ministries)){
   const list=schedulesByMinistry.get(m.ministry_id);
   if(!list)continue;
   const rows=massVenues.get(m.venue_id)??[];
   rows.push(...list);massVenues.set(m.venue_id,rows);
  }
  const bySource=new Map(items(sources).map(x=>[x.source_id,x]));
  for(const venue of items(venues)){
   const cc=asISO(venue.address?.country_code);
   if(!/^[A-Z]{2}$/.test(cc))continue;
   const mass=massVenues.get(venue.venue_id)??[];
   const linked=items(venue.source_ids).map(id=>bySource.get(id)).filter(Boolean);
   const reviews=mass.map(s=>date(s?.verification?.review_due_at)).filter(Boolean);
   const due=reviews.length?reviews.some(d=>d<today):null;
   const sourceUndated=mass.some(s=>/SOURCE_PAGE_UNDATED|NOT_VERIFIED|REQUIRES_DATE_CONFIRMATION/i.test(String(s?.verification?.state??"")));
   const sunday=mass.some(s=>/(?:sunday|dimanche|domingo|domenica|sonntag|domingo|\bsun\b|dim\.)/i.test(s?.payload?.raw??""));
   const hasWebsite=items(venue.contact?.website).concat(items(venue.contact?.schedule_url))
     .some(x=>/^https?:\/\//.test(x));
   index.push({
    provider:p.name,kind:p.kind,cc,venue_id:venue.venue_id,
    hasMass:mass.length>0,sunday,hasWebsite,
    oldReview:due,unknownReview:mass.length>0&&reviews.length===0,sourceUndated,
    hasAddress:Number(String(venue.address?.line1||venue.address?.formatted||"").length)>=14,
    hasOfficialSource:linked.some(officialSources),
    addressFingerprint:addressFingerprint(venue)
   });
  }
 }
 return {index,missing};
}
export function auditTravellerMarkets({today="2026-10-09"}={}){
 if(!/^20\d\d-\d\d-\d\d$/.test(today))throw new Error("Expected ISO audit day");
 const cfg=read("data/directory/research/traveller-priority-markets-20261009.v1.json");
 const benchmark=read("data/directory/research/adorientem-church-public-benchmark-20261009.v1.json");
 const {index,missing}=inventoryFromFiles(today);
 const countries=[...cfg.primary.map(m=>({...m,tier:"PRIMARY"})),...cfg.secondary.map(m=>({...m,tier:"SECONDARY"}))];
 const countryReports=countries.map(c=>{
  const records=index.filter(x=>x.cc===c.code),mass=records.filter(x=>x.hasMass);
  const fingerprints=new Map();
  for(const record of records){
   if(!record.addressFingerprint)continue;
   const rows=fingerprints.get(record.addressFingerprint)??[];
   rows.push(record);fingerprints.set(record.addressFingerprint,rows);
  }
  const collisions=[...fingerprints].filter(([,rows])=>rows.length>1)
    .map(([address_fingerprint,rows])=>({address_fingerprint,providers:[...new Set(rows.map(r=>r.provider))],
      source_ids:rows.map(r=>r.venue_id)}));
  const expected=benchmark.independent_official_source?.latinmassdir_country_counts?.[c.code]??null;
  const result={country_code:c.code,name:c.name,tier:c.tier,
    source_records:records.length,mass_asserted_source_records:mass.length,
    without_schedule_mass_evidence:records.length-mass.length,
    sunday_evidenced_source_records:mass.filter(x=>x.sunday).length,
    original_link_present:records.filter(x=>x.hasWebsite).length,
    original_link_missing:records.filter(x=>!x.hasWebsite).length,
    scheduled_records_review_due:mass.filter(x=>x.oldReview===true).length,
    scheduled_records_review_unknown:mass.filter(x=>x.unknownReview).length,
    scheduled_records_with_undated_source:mass.filter(x=>x.sourceUndated).length,
    known_exact_address_collision_groups:collisions.length,
    exact_address_collision_review:collisions.slice(0,15),
    third_party_discovery_snapshot_count:expected,
    third_party_discovery_is_not_completeness_denominator:true,
    verified_unique_physical_mass_venues:null,
    official_inventory_completeness:null,
    traveller_ready_percentage:null};
  return result;
 });
 return {schema:"AO_FIND_TRAVELLER_MARKET_AUDIT_V1",as_of:today,
  metric:"REPOSITORY_SOURCE_ROWS_NOT_DEDUPLICATED_PHYSICAL_VENUES",
  priority_markets:countryReports.filter(x=>x.tier==="PRIMARY"),
  secondary_markets:countryReports.filter(x=>x.tier==="SECONDARY"),
  summary:{primary_market_count:cfg.primary.length,secondary_market_count:cfg.secondary.length,
    primary_source_rows:countryReports.filter(x=>x.tier==="PRIMARY").reduce((n,c)=>n+c.source_records,0),
    primary_mass_asserted_rows:countryReports.filter(x=>x.tier==="PRIMARY").reduce((n,c)=>n+c.mass_asserted_source_records,0),
    unmounted_provider_source_files:missing,
    notes:["One venue can be present in multiple provider feeds; do not sum to a unique physical count.","Geographic/source coverage is not proof of a Mass on a specific future date.","Third-party country counts are research leads only, not a certified denominator or permission to redistribute."]
  },
  quality_gates:cfg.quality,source_priority:"OFFICIAL_PARISH_INSTITUTE_DIOCESE_FIRST",
  background_worldwide_countries_deprioritized:true};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const arg=process.argv.find(x=>x.startsWith("--today="));
 const report=auditTravellerMarkets({today:arg?.slice(8)||new Date().toISOString().slice(0,10)});
 if(process.argv.includes("--json"))console.log(JSON.stringify(report,null,2));
 else{
  for(const c of report.priority_markets)console.log([c.country_code,c.source_records,c.mass_asserted_source_records,c.scheduled_records_review_due,c.scheduled_records_review_unknown,c.known_exact_address_collision_groups].join("\t"));
  console.log("Unverified physical-venue and official-inventory completeness: intentionally unknown");
 }
}