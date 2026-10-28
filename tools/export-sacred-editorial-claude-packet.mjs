#!/usr/bin/env node
// Bounded, offline, no-network Claude research-pack exporter.
// Example: node tools/export-sacred-editorial-claude-packet.mjs --places place:FR:chartres-notre-dame,place:FR:notre-dame-paris
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,resolve} from "node:path";
import {publishedPlaceIntro,existingSaintBiographyPreview} from "../src/find/place-editorial-reuse.js";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=path=>JSON.parse(readFileSync(resolve(root,path),"utf8"));
const guidePaths=[
  "data/shrines/illustrated-place-guides-france.v1.json",
  "data/shrines/illustrated-place-guides-france-r67.v1.json",
  "data/shrines/illustrated-place-guides-ireland.v1.json",
  "data/shrines/illustrated-place-guides-world-marian-r1.v1.json",
  "data/shrines/illustrated-place-guides-global-saints-r1.v1.json",
  "data/shrines/illustrated-place-guides-global-marian-b2.v1.json",
];
const sourceLink=s=>typeof s==="string"&&/^https:\/\/[^\s]+$/.test(s);
const rows=a=>Array.isArray(a)?a:[];
const unique=a=>[...new Set(a)];
const parsed=process.argv.slice(2);
const flag=parsed.indexOf("--places");
if(flag<0||!parsed[flag+1]||parsed.length!==2){
  console.error("Usage: node tools/export-sacred-editorial-claude-packet.mjs --places place:FR:chartres-notre-dame,place:FR:notre-dame-paris");
  process.exit(2);
}
const placeIds=parsed[flag+1].split(",").map(s=>s.trim());
if(placeIds.length<1||placeIds.length>12||new Set(placeIds).size!==placeIds.length||
  placeIds.some(id=>!/^place:[A-Z]{2}:[a-z0-9-]+$/.test(id))){
  console.error("Choose 1–12 distinct exact canonical Place IDs; no world scan.");
  process.exit(2);
}
const geography=read("data/geography/seed-registry.v1.json");
const shrines=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const shrineSources=read("data/shrines/source-registry.v1.json");
const saints=read("data/saints/holiness-first-editorial-pilot-20261015.v1.json");
const phenomena=read("data/explore/sacred-phenomena-seed.v1.json");
const customs=read("data/customs/customs-atlas-seed.v1.json");
const guides=guidePaths.map(read);
const known=new Map(geography.places.map(p=>[p.place_id,p]));
if(placeIds.some(id=>!known.has(id))){
  console.error("Unknown canonical Place ID: "+placeIds.filter(id=>!known.has(id)).join(", "));
  process.exit(2);
}
const publisherById=new Map(shrineSources.sources.map(s=>[s.id,s]));
for(const placeId of placeIds){
  const place=known.get(placeId),guide=publishedPlaceIntro(placeId,guides);
  const atSite=shrines.shrines.filter(x=>x.place_id===placeId);
  const atSiteId=new Set(atSite.map(x=>x.shrine_id));
  const pilgrimage=shrines.pilgrimages.filter(x=>atSiteId.has(x.destination_shrine_id));
  const objects=phenomena.relics.filter(x=>x.place_id===placeId)
    .map(x=>({id:x.id,title_en:x.title_en,title_fr:x.title_fr,
      custody_claim:x.source_claim,authentication:x.authentication,
      source_url:x.source_url}));
  const siteCustoms=customs.attestations.filter(x=>x.place_id===placeId&&x.geographic_precision==="PLACE")
    .map(x=>({attestation_id:x.attestation_id,custom_id:x.custom_id,source_ids:x.source_ids,
      publication:customs.customs.find(y=>y.custom_id===x.custom_id)?.publication_state||"UNKNOWN"}));
  // Exact existing saint links only: no fuzzy matching of shrine dedication or
  // textual saint-name aliases. Never send duplicate biographies for editing.
  const persons=saints.people.filter(x=>rows(x.place_links)
    .some(link=>link.place_id===placeId&&link.relation_kind==="SHRINE_ASSOCIATION_ONLY"))
    .map(x=>({saint_id:x.saint_id,display_name:x.display_name,
      current_editorial_bio:existingSaintBiographyPreview(x.saint_id,saints)?.short_bio||null,
      publication:"EDITORIAL_REVIEW_ONLY",not_a_calendar_feast:true}));
  const sourceIds=unique([...atSite.flatMap(x=>rows(x.source_ids)),
    ...pilgrimage.flatMap(x=>rows(x.source_ids))]);
  const urls=unique([
    ...(guide?[guide.official_url,guide.source_url]:[]),
    ...sourceIds.map(id=>publisherById.get(id)?.url),
    ...objects.map(x=>x.source_url),
  ].filter(sourceLink)).slice(0,18);
  const packet={
    schema:"ao.sacred-editorial-claude-packet.v1",place_id:placeId,
    immutable_place:{name:place.name.official,place_type:place.place_type,
      address:place.address?.formatted||null,country_code:place.address?.country_code||null},
    current_content:{published_illustrated_guide:Boolean(guide),
      reused_guide_subtitle:guide?.title||null,
      existing_guide_intro_source_url:guide?.source_url||null,
      needs_new_place_biography:!guide},
    shrines:atSite.map(x=>({shrine_id:x.shrine_id,kind:x.shrine_kind,
      origin_en:x.origin_summary,origin_fr:x.origin_summary_fr,source_ids:x.source_ids})),
    pilgrimage_context:pilgrimage.map(x=>({pilgrimage_id:x.pilgrimage_id,
      name:x.name,temporal_link_ids:x.temporal_link_ids})),
    existing_sacred_objects:objects,existing_custom_attestations:siteCustoms,
    exact_linked_saints:persons,starting_source_urls:urls,
    research_instruction:guide?
      "Do NOT rewrite the existing published Place biography. Find sourced missing subject details, relic/reliquary distinction and source-quality gaps only.":
      "Research a short original EN/FR site biography, distinctive sacred objects and documentable person associations. Never invent the history or claim feast dates.",
    output_constraints:{site_bio_word_limit:guide?0:130,
      saint_bios_duplicated:false,max_distinctive_objects:6,
      literal_place_id_required:true,source_url_per_claim:true,
      historical_tradition_separate:true,faithful_french:true,
      output:"One JSON object per Place; research only, never auto-publish."}
  };
  process.stdout.write(JSON.stringify(packet)+"\n");
}
