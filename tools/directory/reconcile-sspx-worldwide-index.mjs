import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const normalize=value=>String(value??"").normalize("NFKD")
  .replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"");
const source=relative=>JSON.parse(fs.readFileSync(path.join(ROOT,relative),"utf8"));
const directory="data/directory/generated/v19";
export function loadSspxSnapshotRows(){
  const names=fs.readdirSync(path.join(ROOT,directory)).filter(n=>n.endsWith(".v1.json"));
  const rows=[];
  for(const name of names){
    const doc=source(directory+"/"+name);
    if(!String(doc.provider??"").startsWith("SSPX_"))continue;
    rows.push(...(Array.isArray(doc.records)?doc.records:[]));
  }
  return rows;
}
const isInstitutional=label=>/École|School|Schule|Couvent|Carmel|Kloster|Monastère|Monastery|Seminary|Séminaire|affiliated|Communauté amie/i.test(label);
export function reconcileSspxMap(mapRecords,existingRows){
  const cases=[];
  for(const row of mapRecords){
    const label=normalize(row.label);
    const matches=existingRows.filter(record=>{
      const title=normalize(record.n);
      return title.length>6&&label.includes(title);
    });
    const exact=matches.filter(record=>{
      const city=normalize(String(record.l??"").split("—")[0]);
      return city.length>=4&&label.includes(city);
    });
    const exactUnique=[...new Set(exact.map(x=>x.u))];
    const nameUnique=[...new Set(matches.map(x=>x.u))];
    const institutional=isInstitutional(row.label);
    const bucket=!row.sunday_badge_claim?"NO_SUNDAY_BADGE":
      institutional?"INSTITUTION_OR_AFFILIATED_HOLD":
      exactUnique.length?"POTENTIAL_MATCH_NAME_CITY":
      nameUnique.length===1?"NAME_MATCH_ONLY_REVIEW":
      "UNRESOLVED_SUNDAY_IDENTITY";
    cases.push({
      source_place_id:row.source_place_id,official_map_url:row.source_url,
      label:row.label,origin_districts:row.district_refs,
      sunday_badge_claim:Boolean(row.sunday_badge_claim),
      review_bucket:bucket,
      existing_candidate_ids:exactUnique.length?exactUnique:nameUnique.length===1?nameUnique:[],
      publication_eligible:false,
    });
  }
  const byBucket={};
  for(const row of cases)byBucket[row.review_bucket]=(byBucket[row.review_bucket]??0)+1;
  const byDistrict=[...new Set(mapRecords.flatMap(r=>r.district_refs))].sort().map(d=>({
    district:d,total:cases.filter(r=>r.origin_districts.includes(d)).length,
    unresolved_sunday:cases.filter(r=>r.origin_districts.includes(d)&&r.review_bucket==="UNRESOLVED_SUNDAY_IDENTITY").length,
  }));
  return {
    schema:"AO_DIRECTORY_SSPX_WORLDWIDE_RECONCILIATION_V1",
    nature:"HEURISTIC_RESEARCH_TRIAGE_ONLY",
    source_entities:mapRecords.length,
    canonical_sspx_mass_records_compared:existingRows.length,
    sunday_labelled_source_entities:cases.filter(x=>x.sunday_badge_claim).length,
    bucket_counts:byBucket,by_district:byDistrict,
    controls:{
      has_automatic_mass_publication:false,
      definitive_unregistered_public_mass_count:null,
      definitive_worldwide_unique_mass_venue_count:null,
      status_label:"UNREVIEWED_UNLESS_INDEPENDENTLY_VERIFIED",
    },
    cases,
  };
}
export function buildCurrentSspxMapReview(){
  const src=source("data/directory/research/staging/sspx-world-map/worldwide-source-index.v1.json");
  if(!Array.isArray(src.records)||src.records.length!==941)
    throw new Error("Official source index absent/incomplete");
  return reconcileSspxMap(src.records,loadSspxSnapshotRows());
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const review=buildCurrentSspxMapReview();
  const full=process.argv.includes("--full");
  console.log(JSON.stringify(full?review:{
    schema:review.schema,source_entities:review.source_entities,
    canonical_sspx_mass_records_compared:review.canonical_sspx_mass_records_compared,
    bucket_counts:review.bucket_counts,by_district:review.by_district,
    definitive_unregistered_public_mass_count:null,
  },null,2));
}
