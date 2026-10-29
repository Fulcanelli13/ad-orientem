#!/usr/bin/env node
// Finite, offline audit over the canonical 122 relic records.
// Hints never authorize published locations. No remote request or AI.
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const relic=read("data/explore/sacred-phenomena-seed.v1.json");
const placement=read("data/explore/relic-indoor-placement.v1.json");
const places=read("data/geography/seed-registry.v1.json");
const known=new Set(places.places.map(x=>x.place_id));
const byId=new Map(placement.entries.map(x=>[x.relic_id,x]));
const recorded=new Set(relic.relics.map(x=>x.id));
if(placement.entries.length!==byId.size||placement.entries.some(x=>!recorded.has(x.relic_id)||
  !known.has(x.place_id)))throw new Error("Unmatched placement ID; reconcile original owner first.");
const missing=relic.relics.filter(x=>!byId.has(x.id));
const hint=entry=>/\b(crypt|chapel|altar|transept|level|reliquary|châsse|crypte|chapelle|sarcophagus)\b/i.test(entry.summary_en||"")
  ?"POSSIBLE_INDOOR_DETAIL_REQUIRES_ORIGINAL_SOURCE_INSPECTION":"NO_EXPLICIT_INDOOR_DETAIL_IN_SUMMARY";
const output=missing.map(x=>Object.freeze({
  relic_id:x.id,place_id:x.place_id,relic_kind:x.relic_kind,
  title:x.title_en,source_url:x.source_url,
  starting_summary:x.summary_en,
  research_hint:hint(x),publication:"RESEARCH_ONLY_NOT_DISPLAYED",
}));
const stats={
  schema:"AO_RELIC_INDOOR_P67_AUDIT_V1",
  relic_records:relic.relics.length,
  physical_places_with_relics:new Set(relic.relics.map(x=>x.place_id)).size,
  source_attributed_indoor_placements:placement.entries.length,
  places_with_indoor_positions:new Set(placement.entries.map(x=>x.place_id)).size,
  site_only_relics:missing.length,
  possible_source_details_to_check:output.filter(x=>x.research_hint.startsWith("POSSIBLE")).length,
  remaining_queue_by_priority:output.length,
  new_physical_pins:0,
  new_relic_authentications:0,
};
if(process.argv.includes("--jsonl"))for(const record of output)process.stdout.write(JSON.stringify(record)+"\n");
else process.stdout.write(JSON.stringify(stats,null,2)+"\n");
