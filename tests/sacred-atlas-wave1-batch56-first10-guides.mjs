import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const master=read("data/geography/research/sacred-atlas-editorial-master-530-20261104.v1.json");
const queue=read("data/shrines/research/sacred-atlas-wave1-batch56-editorial-closure-20261105.v1.json");
const draft=read("data/shrines/research/sacred-atlas-wave1-first10-extended-guides-20261105.v1.json");
const geography=read("data/geography/seed-registry.v1.json");
const media=read("data/geography/approved-place-media.v1.json");
const shrine=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const plannedKeys=master.batch_plan.shrine_guide_expansion[0].place_ids;
const keys=queue.rows.map(r=>r.place_id);
assert.deepEqual([...keys].sort(),[...plannedKeys].sort(),
  "Prioritised Wave-1 queue must preserve the original selected site membership");
const existing=new Map(master.places.map(p=>[p.place_id,p]));
const geoids=new Set(geography.places.map(p=>p.place_id));
const shrineids=new Set(shrine.shrines.map(p=>p.shrine_id));
assert.equal(master.summary.extended_guides,33);
assert.equal(media.items.length,388, "Current approved covers must remain untouched by guide drafting");
assert.equal(geography.places.length,530);
assert.equal(keys.length,56);
assert.equal(new Set(keys).size,56);
assert.equal(queue.schema,"AO_SACRED_ATLAS_W1_BATCH01_56_EDITORIAL_CLOSURE_V1");
assert.equal(draft.schema,"AO_SACRED_ATLAS_W1_FIRST10_EXTENDED_GUIDES_RESEARCH_V1");
assert.equal(queue.rows.length,56);
assert.equal(draft.guides.length,10);
assert.ok(queue.counts.expanded_bilingual_drafts_second_editor_pending>=10);
assert.ok(queue.counts.expanded_bilingual_drafts_second_editor_pending<=56);
assert.equal(queue.counts.short_source_synopses_only,56-queue.counts.expanded_bilingual_drafts_second_editor_pending);
assert.equal(draft.counts.new_published_guides,0);
assert.equal(draft.counts.approved_photo_covers_unchanged,379);
assert.equal(queue.counts.published_guide_changes,0);
assert.equal(queue.counts.photo_cover_changes,0);
for(let i=0;i<56;i++){
 const row=queue.rows[i],id=keys[i],p=existing.get(id);
 assert.equal(row.place_id,id);
 assert.equal(row.priority_rank,i+1);
 assert.ok(p&&geoids.has(id));
 assert.ok(p.shrine&&shrineids.has(p.shrine.shrine_id));
 assert.equal(p.editorial_state,"BILINGUAL_SHRINE_SYNOPSIS_ONLY");
 assert.equal(row.bilingual_synopsis_present,true);
 assert.equal(row.publication_authorized,false);
 assert.ok(row.official_source_count>0,"Institutional source absent "+id);
 assert.deepEqual(row.existing_relic_ids,p.relic_ids);
 assert.deepEqual(row.existing_pilgrimage_ids,p.pilgrimage_ids);
 assert.deepEqual(row.unresolved_source_ids,p.unresolved_source_ids);
 if(i<10){
   assert.ok(row.draft_file);
   assert.match(row.extended_draft_state,/SECOND_EDITOR/);
 }else if(row.draft_file){
   assert.match(row.extended_draft_state,/SECOND_EDITOR/);
   assert.equal(row.publication_authorized,false);
 }else{
   assert.match(row.extended_draft_state,/SOURCE_DEEPENING/);
 }
}
for(let i=0;i<10;i++){
 const guide=draft.guides[i],id=keys[i],p=existing.get(id);
 assert.equal(guide.place_id,id);
 assert.equal(guide.place_name,p.name);
 assert.equal(guide.shrine_id,p.shrine.shrine_id);
 assert.equal(guide.state,"BILINGUAL_EXTENDED_DRAFT_SECOND_EDITOR_REQUIRED_NOT_PUBLISHED");
 assert.equal(guide.publication_authorized,false);
 assert.equal(guide.draft_order,i+1);
 assert.equal(guide.sections.length,3);
 assert.ok(guide.subtitle_en.length>55&&guide.subtitle_fr.length>55);
 assert.equal(guide.image_policy,"APPROVED_CANONICAL_PLACE_MEDIA_ONLY_DO_NOT_PROMOTE_RESEARCH_OR_HOLD");
 assert.deepEqual(guide.existing_relic_ids,p.relic_ids);
 assert.deepEqual(guide.existing_pilgrimage_ids,p.pilgrimage_ids);
 assert.match(guide.next_gate,/SECOND_EDITOR/);
 assert.equal(new Set(guide.sections.map(s=>s.id)).size,3);
 const urls=new Set(guide.bibliography_urls);
 assert.ok(urls.size>0&&[...urls].every(x=>/^https:\/\//.test(x)));
 for(const section of guide.sections){
   assert.ok(section.title_en.length>4&&section.title_fr.length>4);
   assert.equal(section.paragraphs.length,1);
   for(const para of section.paragraphs){
     assert.ok(para.en.length>175&&para.fr.length>175,"Thin bilingual paragraph "+id+"/"+section.id);
     assert.ok(/^https:\/\//.test(para.source_url),"Missing direct evidence "+id);
     assert.ok(urls.has(para.source_url),"Unregistered source "+para.source_url);
     assert.ok(!/wikipedia\.org\/wiki\/File:/.test(para.source_url));
     assert.notEqual(para.en,para.fr);
   }
 }
}
assert.match(draft.guides[0].sections[1].paragraphs[0].en,/does not establish the supernatural authenticity/);
assert.match(draft.guides[3].sections[0].paragraphs[0].en,/Montecassino/);
assert.match(draft.guides[6].sections[1].paragraphs[0].en,/September 2026 programme/);
assert.match(draft.guides[9].sections[2].paragraphs[0].en,/2028/);
console.log("Sacred Atlas W1 PASS: frozen first ten 3-section EN/FR guides plus evolving 56-place queue; "+queue.counts.short_source_synopses_only+" still held, 33 production guides and 388 current approved covers unchanged.");
