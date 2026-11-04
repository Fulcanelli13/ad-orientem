// Source-owned, deterministic editorial audit. Never turns research into publication.
import {readFileSync,writeFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const paths={
  "geography": "data/geography/seed-registry.v1.json",
  "shrines": "data/shrines/shrines-pilgrimages-seed.v1.json",
  "shrine_sources": "data/shrines/source-registry.v1.json",
  "phenomena": "data/explore/sacred-phenomena-seed.v1.json",
  "customs": "data/customs/customs-atlas-seed.v1.json",
  "approved_covers": "data/geography/approved-place-media.v1.json",
  "approved_gallery": "data/geography/approved-place-gallery.v1.json",
  "saints_pilot": "data/saints/holiness-first-editorial-pilot-20261015.v1.json",
  "saints_recovered": "data/geography/research/sacred-atlas-saints-branch-recovery-20261104.v1.json",
  "r25_originals": "data/geography/research/sacred-atlas-round25-23place-64-original-review-20261104.json",
  "guide_ireland": "data/shrines/illustrated-place-guides-ireland.v1.json",
  "guide_france": "data/shrines/illustrated-place-guides-france.v1.json",
  "guide_france_r67": "data/shrines/illustrated-place-guides-france-r67.v1.json",
  "guide_world_marian": "data/shrines/illustrated-place-guides-world-marian-r1.v1.json",
  "guide_world_saints": "data/shrines/illustrated-place-guides-global-saints-r1.v1.json",
  "guide_global_marian_b2": "data/shrines/illustrated-place-guides-global-marian-b2.v1.json"
};
const compute=function compute(data){
 const a=x=>Array.isArray(x)?x:[],str=x=>String(x??"").trim();
 const uniq=x=>[...new Set(x.filter(Boolean))],sorted=x=>[...x].sort((a,b)=>str(a).localeCompare(str(b),"en"));
 const srcById=new Map(a(data.shrine_sources.sources).map(x=>[x.id,x]));
 const geo=a(data.geography.places);
 const shrineByPlace=new Map(a(data.shrines.shrines).map(x=>[x.place_id,x]));
 const shrineById=new Map(a(data.shrines.shrines).map(x=>[x.shrine_id,x]));
 const pilgrimageByPlace=new Map();
 for(const p of a(data.shrines.pilgrimages)){
  const placeId=shrineById.get(p.destination_shrine_id)?.place_id;
  if(placeId){if(!pilgrimageByPlace.has(placeId))pilgrimageByPlace.set(placeId,[]);pilgrimageByPlace.get(placeId).push(p);}
 }
 const guideDefs=[["guide_ireland","Ireland"],["guide_france","France"],["guide_france_r67","France R67"],["guide_world_marian","World Marian R1"],["guide_world_saints","Global Saints R1"],["guide_global_marian_b2","Global Marian B2"]];
 const guides=guideDefs.flatMap(([key,cohort])=>a(data[key]?.guides).filter(x=>x.publication==="PUBLISHED").map(x=>({...x,cohort,source_file:key})));
 const guidesByPlace=new Map(guides.map(x=>[x.place_id,x]));
 const covers=new Map(a(data.approved_covers.items).filter(x=>x.status==="APPROVED").map(x=>[x.place_id,x]));
 const galleryByPlace=new Map();
 for(const x of a(data.approved_gallery.items).filter(x=>x.status==="APPROVED")){
  if(!galleryByPlace.has(x.place_id))galleryByPlace.set(x.place_id,[]);
  galleryByPlace.get(x.place_id).push(x);
 }
 const verified=new Map(a(data.r25_originals.places).map(x=>[x.place_id,x]));
 const apparitionByPlace=new Map(),relicByPlace=new Map(),customByPlace=new Map();
 for(const [items,map] of [[data.phenomena.apparitions,apparitionByPlace],[data.phenomena.relics,relicByPlace]]){
  for(const row of a(items)){if(!map.has(row.place_id))map.set(row.place_id,[]);map.get(row.place_id).push(row);}
 }
 const customsById=new Map(a(data.customs.customs).map(x=>[x.custom_id,x]));
 for(const x of a(data.customs.attestations)){
  if(!x.place_id||x.map_policy!=="PLACE"||x.geographic_precision!=="PLACE"||x.strength!=="STRONG"||!customsById.has(x.custom_id))continue;
  if(!customByPlace.has(x.place_id))customByPlace.set(x.place_id,[]);
  customByPlace.get(x.place_id).push(x);
 }
 const pilotByLegacy=new Map(a(data.saints_pilot.people).map(p=>[p.legacy_source_name,p]).filter(([name])=>str(name)));
 const rows=geo.map(place=>{
  const placeId=place.place_id,shrine=shrineByPlace.get(placeId),guide=guidesByPlace.get(placeId);
  const pilgrimages=pilgrimageByPlace.get(placeId)||[];
  const apparitions=apparitionByPlace.get(placeId)||[],relics=relicByPlace.get(placeId)||[],customs=customByPlace.get(placeId)||[];
  const coversGallery=galleryByPlace.get(placeId)||[],r25=verified.get(placeId);
  const saints=uniq(a(shrine?.associated_saints));
  const sourceIds=uniq([...a(place.source_ids),...a(shrine?.source_ids),...pilgrimages.flatMap(x=>a(x.source_ids)),...customs.flatMap(x=>a(x.source_ids))]);
  const bibliography=sourceIds.map(id=>srcById.get(id)).filter(Boolean).map(s=>({
   id:s.id,title:s.title,issuer:s.issuer,directness:s.directness,url:s.url
  }));
  const missingSourceIds=sourceIds.filter(id=>!srcById.has(id));
  const official=bibliography.filter(s=>/^OFFICIAL|^PRIMARY_INSTITUTIONAL/.test(s.directness||""));
  const narrativeStatus=guide?"PUBLISHED_EXTENDED_GUIDE":shrine?"BILINGUAL_SHRINE_SYNOPSIS_ONLY":apparitions.length||relics.length||customs.length?"RELATED_TOPIC_ONLY_NO_SHRINE_HISTORY":"PLACE_IDENTITY_ONLY";
  const pilotMatches=saints.filter(x=>pilotByLegacy.has(x)).map(label=>{
   const p=pilotByLegacy.get(label);return {source_label:label,person_id:p.saint_id,publication:p.publication};
  });
  const score=(shrine&&!guide?35:0)+(bibliography.length?7:0)+(official.length?15:0)+Math.min(10,3*bibliography.length)
   +(saints.length?13:0)+(apparitions.length?10:0)+(relics.length?9:0)
   +(pilgrimages.length?7:0)+(guide?0:!covers.has(placeId)?5:0)
   +Math.min(8,a(shrine?.origin_summary?.match(/.{1,80}/g)).length*2);
  const media={cover_status:covers.has(placeId)?"APPROVED":"NO_APPROVED_PHOTO",cover_asset:covers.get(placeId)?.asset_path||null,
   gallery_approved_ids:coversGallery.map(x=>x.media_id),
   r25_byte_verified_unapproved_originals:r25?.images?.filter(x=>x.byte_verified===true).length||0,
   r25_cover_candidate_count:r25?.images?.filter(x=>x.role==="COVER_CANDIDATE").length||0,
   r25_restrictions:r25?.site_warning||null};
  return {
   place_id:placeId,name:place.name?.official||placeId,country_code:place.address?.country_code||null,
   place_type:place.place_type,source_place_ids:a(place.source_ids),
   editorial_state:narrativeStatus,priority_score:score,
   published_guide:guide?{cohort:guide.cohort,sections:a(guide.sections).length,paragraphs:a(guide.sections).reduce((n,s)=>n+a(s.paragraphs).length,0),
    chronology_entries:a(guide.chronology).length,stops:a(guide.stops).length,programmes:a(guide.programmes).length,official_url:guide.official_url}:null,
   shrine:shrine?{shrine_id:shrine.shrine_id,shrine_kind:shrine.shrine_kind,recognition_class:shrine.recognition_class,
    origin_en:shrine.origin_summary,origin_fr:shrine.origin_summary_fr,source_ids:a(shrine.source_ids)}:null,
   saint_name_associations:saints,exact_pilot_draft_matches:pilotMatches,
   pilgrimage_ids:pilgrimages.map(x=>x.pilgrimage_id),
   apparition_ids:apparitions.map(x=>x.id),relic_ids:relics.map(x=>x.id),exact_site_custom_attestations:customs.map(x=>x.attestation_id),
   bibliography,unresolved_source_ids:missingSourceIds,
   media,
   next_action:guide?"NO_REWRITE_VERIFY_IMAGES_AND_SAINT_LINKS":shrine?"EXTEND_HISTORY_FROM_EXISTING_SOURCED_SYNOPSIS":
    bibliography.length?"RESEARCH_SITE_HISTORY_FROM_KNOWN_SOURCE":"FIND_EXACT_SITE_HISTORICAL_SOURCE",

  };
 }).sort((x,y)=>x.place_id.localeCompare(y.place_id,"en"));
 const sortQueue=list=>list.sort((a,b)=>b.priority_score-a.priority_score||a.place_id.localeCompare(b.place_id,"en"));
 const cohorts={
  "existing_extended_guides":sortQueue(rows.filter(x=>x.editorial_state==="PUBLISHED_EXTENDED_GUIDE")),
  "shrine_guide_expansion":sortQueue(rows.filter(x=>x.editorial_state==="BILINGUAL_SHRINE_SYNOPSIS_ONLY")),
  "related_topic_place_history":sortQueue(rows.filter(x=>x.editorial_state==="RELATED_TOPIC_ONLY_NO_SHRINE_HISTORY")),
  "physical_site_history":sortQueue(rows.filter(x=>x.editorial_state==="PLACE_IDENTITY_ONLY"))
 };
 const packages={};
 const batchSize={"shrine_guide_expansion":56,"physical_site_history":54,"related_topic_place_history":30};
 for(const [key,items] of Object.entries(cohorts)){
  if(key==="existing_extended_guides")continue;
  const chunk=batchSize[key];
  packages[key]=Array.from({length:Math.ceil(items.length/chunk)},(_,i)=>({
   batch:i+1,place_ids:items.slice(i*chunk,(i+1)*chunk).map(x=>x.place_id)
  }));
 }
 const labels=new Map();
 for(const row of rows)for(const name of row.saint_name_associations){
  if(!labels.has(name))labels.set(name,{source_name:name,linked_place_ids:[],pilot_person_id:pilotByLegacy.get(name)?.saint_id||null,publication:pilotByLegacy.get(name)?.publication||"NO_MATCHED_BIOGRAPHY_IN_SIX_PERSON_PILOT"});
  labels.get(name).linked_place_ids.push(row.place_id);
 }
 const saintLabels=[...labels.values()].sort((x,y)=>x.source_name.localeCompare(y.source_name,"en"));
 const saintsBatches=Array.from({length:Math.ceil(saintLabels.length/60)},(_,i)=>({
  batch:i+1,labels:saintLabels.slice(i*60,(i+1)*60).map(x=>x.source_name)
 }));
 const sum={
  canonical_places:rows.length,
  shrine_records:a(data.shrines.shrines).length,
  bilingual_shrine_synopses:rows.filter(x=>x.shrine?.origin_en?.trim()&&x.shrine?.origin_fr?.trim()).length,
  extended_guides:cohorts.existing_extended_guides.length,
  shrine_guides_to_write:cohorts.shrine_guide_expansion.length,
  other_topic_only_places:cohorts.related_topic_place_history.length,
  site_history_without_topic_records:cohorts.physical_site_history.length,
  no_extended_guide:rows.filter(x=>!x.published_guide).length,
  short_shrines_with_known_sources:cohorts.shrine_guide_expansion.filter(x=>x.bibliography.length).length,
  short_shrines_with_official_sources:cohorts.shrine_guide_expansion.filter(x=>x.bibliography.some(y=>/^OFFICIAL|^PRIMARY_INSTITUTIONAL/.test(y.directness||""))).length,
  named_saint_associations:saintLabels.length,
  exactly_matched_six_person_pilot:saintLabels.filter(x=>x.pilot_person_id).length,
  pilot_biographies_review_only:a(data.saints_pilot.people).filter(x=>x.publication==="EDITORIAL_REVIEW_ONLY").length,
  additional_branch_bilingual_biography_drafts:a(data.saints_recovered.biography_drafts).length,
  total_known_bilingual_draft_biographies:a(data.saints_pilot.people).length+a(data.saints_recovered.biography_drafts).length,
  approved_saint_portraits_in_pilot:0,
  approved_covers:covers.size,places_without_photo:rows.filter(x=>x.media.cover_status!=="APPROVED").length,
  unphotographed_registered_shrines:rows.filter(x=>x.shrine&&x.media.cover_status!=="APPROVED").length,
  gallery_images:a(data.approved_gallery.items).length,places_with_approved_gallery:galleryByPlace.size,
  r25_places_with_verified_unapproved_originals:verified.size,
  sites_with_any_source_registry_entry:rows.filter(x=>x.bibliography.length).length,
  sites_with_unresolved_source_ids:rows.filter(x=>x.unresolved_source_ids.length).length
 };
 if(sum.canonical_places!==530||sum.shrine_records!==257||sum.extended_guides!==33||sum.shrine_guides_to_write!==224||sum.approved_covers!==379||sum.gallery_images!==42||sum.r25_places_with_verified_unapproved_originals!==23||sum.pilot_biographies_review_only!==6)throw Error("Source baseline changed; reconcile before generating master "+JSON.stringify(sum));
 return {
  schema:"AO_SACRED_ATLAS_EDITORIAL_MASTER_530_V1",as_of:"2026-11-04",
  notice:"EDITORIAL RESEARCH MASTER ONLY. Not an app registry, authorisation to publish an image, approved biography, or an assertion that a linked source proves an unwritten history.",
  source_paths:paths,
  policy:{
   canonical_place_identity:"Keep existing CL/Place IDs; no map identity additions",
   saints:"A name association is not a biography or identity merge; six-pilot facts remain editorial review only",
   sources:"Source links identify review material, not verified full-text history; read and attribute before authoring",
   photographs:"Only approved-place-media/approved-place-gallery publish; R25 original bytes are unapproved",
   publication:"An extended guide must be source-scoped, bilingual and second-reviewed; never promote queue rows by script",
   built_output:"Research master is under data/geography/research and excluded from GitHub Pages static release"
  },
  summary:sum,
  additional_saints_research_branch:{branch:data.saints_recovered.source_branch,source_records:data.saints_recovered.counts,manifest_file:paths.saints_recovered},
  batch_plan:{
   shrine_guide_expansion:packages.shrine_guide_expansion,
   related_topic_place_history:packages.related_topic_place_history,
   physical_site_history:packages.physical_site_history,
   saints_identity_review:saintsBatches,
   first_editorial_working_set:cohorts.shrine_guide_expansion.slice(0,56).map(x=>x.place_id),
   verified_photo_reviewer_file:"data/geography/research/sacred-atlas-round25-23place-64-original-editorial-review-20261104.html",
   next_photo_work:"Editorially select only exact subject, rights-cleared, phone-crop-reviewed pictures; retain current fallbacks otherwise"
  },
  saint_association_index:saintLabels,
  places:rows
 };
};
const data={};for(const [key,path] of Object.entries(paths))data[key]=JSON.parse(readFileSync(resolve(root,path),"utf8"));
const ledger=compute(data);
const location=resolve(root,"data/geography/research/sacred-atlas-editorial-master-530-20261104.v1.json");
if(process.argv.includes("--write")){
 writeFileSync(location,JSON.stringify(ledger)+"\n");
 console.log("Written "+location);
}else if(process.argv.includes("--check")){
 const committed=JSON.parse(readFileSync(location,"utf8"));
 const a=JSON.stringify(ledger),b=JSON.stringify(committed);
 if(a!==b)throw Error("Editorial master is stale; run node tools/geography/audit-sacred-atlas-editorial.mjs --write and review the diff");
 console.log("SACRED ATLAS EDITORIAL MASTER PASS "+JSON.stringify(ledger.summary));
}else console.log(JSON.stringify(ledger.summary,null,2));
