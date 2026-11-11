import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const root="data/shrines/research/";
const master=read("data/geography/research/sacred-atlas-editorial-master-530-20261104.v1.json");
const queue=read(root+"sacred-atlas-wave1-batch56-editorial-closure-20261105.v1.json");
const first=read(root+"sacred-atlas-wave1-first10-extended-guides-20261105.v1.json");
const a=read(root+"sacred-atlas-wave1-guides11-20-20261105.v1.json");
const b=read(root+"sacred-atlas-wave1-guides21-30-20261105.v1.json");
const live=read("data/geography/approved-place-media.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const shr=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const plannedKeys=master.batch_plan.shrine_guide_expansion[0].place_ids;
// Read the current editorial priority order while preserving the original planned set.
const keys=queue.rows.map(row=>row.place_id);
assert.deepEqual([...keys].sort(),[...plannedKeys].sort(),
  "Wave-1 priority queue must contain exactly the originally selected sites");
const places=new Map(master.places.map(x=>[x.place_id,x]));
const shrines=new Set(shr.shrines.map(x=>x.shrine_id));
assert.equal(keys.length,56);assert.equal(new Set(keys).size,56);
assert.equal(geo.places.length,530);
assert.equal(master.summary.extended_guides,33);
assert.equal(live.items.length,388, "Preserve the current approved-cover inventory; guide drafting changes no covers");
assert.equal(first.guides.length,10);
assert.equal(a.schema,"AO_SACRED_ATLAS_W1_11_TO_20_BILINGUAL_EXTENDED_DRAFTS_V1");
assert.equal(b.schema,"AO_SACRED_ATLAS_W1_21_TO_30_BILINGUAL_EXTENDED_DRAFTS_V1");
assert.equal(a.guides.length,10);assert.equal(b.guides.length,10);
assert.equal(queue.rows.length,56);
assert.ok(queue.counts.expanded_bilingual_drafts_second_editor_pending>=30);
assert.ok(queue.counts.expanded_bilingual_drafts_second_editor_pending<=56);
assert.equal(queue.counts.short_source_synopses_only,56-queue.counts.expanded_bilingual_drafts_second_editor_pending);
assert.equal(queue.counts.published_guide_changes,0);
assert.equal(queue.counts.photo_cover_changes,0);
const all=[...first.guides,...a.guides,...b.guides];
assert.equal(all.length,30);
assert.equal(new Set(all.map(x=>x.place_id)).size,30);
let enCount=0,frCount=0;
for(let i=0;i<56;i++){
 const row=queue.rows[i],p=places.get(keys[i]);
 assert.ok(p&&p.shrine&&shrines.has(p.shrine.shrine_id));
 assert.equal(row.place_id,keys[i]);
 assert.equal(row.shrine_id,p.shrine.shrine_id);
 assert.equal(row.priority_rank,i+1);
 assert.equal(row.publication_authorized,false);
 assert.equal(row.bilingual_synopsis_present,true);
 assert.deepEqual(row.existing_relic_ids,p.relic_ids);
 assert.deepEqual(row.existing_pilgrimage_ids,p.pilgrimage_ids);
 assert.deepEqual(row.unresolved_source_ids,p.unresolved_source_ids);
 if(i<30){
   const guide=all[i];
   assert.equal(guide.place_id,row.place_id);
   assert.equal(guide.place_name,row.place_name);
   assert.equal(guide.shrine_id,row.shrine_id);
   assert.equal(guide.draft_order,i+1);
   assert.equal(guide.publication_authorized,false);
   assert.match(guide.state,/SECOND_EDITOR_REQUIRED_NOT_PUBLISHED/);
   assert.match(guide.next_gate,/SECOND_EDITOR/);
   assert.equal(guide.image_policy,"APPROVED_CANONICAL_PLACE_MEDIA_ONLY_DO_NOT_PROMOTE_RESEARCH_OR_HOLD");
   assert.deepEqual(guide.existing_relic_ids,p.relic_ids);
   assert.deepEqual(guide.existing_pilgrimage_ids,p.pilgrimage_ids);
   assert.equal(guide.sections.length,3);
   assert.equal(new Set(guide.sections.map(s=>s.id)).size,3);
   assert.ok(guide.subtitle_en.length>42&&guide.subtitle_fr.length>42);
   for(const s of guide.sections){
     assert.ok(s.title_en?.length>3&&s.title_fr?.length>3);
     assert.equal(s.paragraphs.length,1);
     const text=s.paragraphs[0];
     assert.ok(text.en?.length>=200&&text.fr?.length>=200,
       "Insufficient substantive original bilingual content "+guide.place_id+"/"+s.id);
     assert.notEqual(text.en,text.fr);
     assert.match(text.source_url,/^https:\/\//);
     assert.ok(guide.bibliography_urls.includes(text.source_url));
     assert.ok(!/\/research\/|\.jpg|\.png|\.webp/i.test(text.source_url));
     enCount++;frCount++;
   }
   if(i<10)assert.equal(row.draft_file,root+"sacred-atlas-wave1-first10-extended-guides-20261105.v1.json");
   else assert.equal(row.draft_file,root+(i<20?"sacred-atlas-wave1-guides11-20-20261105.v1.json":"sacred-atlas-wave1-guides21-30-20261105.v1.json"));
 }else if(row.draft_file){
   assert.match(row.extended_draft_state,/SECOND_EDITOR/);
   assert.equal(row.publication_authorized,false);
 }else{
   assert.match(row.extended_draft_state,/SOURCE_DEEPENING/);
 }
}
assert.equal(enCount,90);
assert.equal(frCount,90);
assert.equal(queue.source_repair_queue.length,2);
assert.equal(a.source_corrections.length,2);
assert.equal(queue.sensitive_second_editor_checklist.length,6);
for(const x of [...queue.source_repair_queue,...queue.sensitive_second_editor_checklist])assert.ok(keys.includes(x.place_id));
assert.match(all[25].sections[1].paragraphs[0].en,/contested|competing|disputed/i);
assert.match(all[24].sections[1].paragraphs[0].en,/Fleury/);
assert.match(all[29].sections[2].paragraphs[0].en,/1979/);
console.log("SACRED ATLAS W1 NEXT20 PASS: first 30 guide draft contracts preserved while batch closure evolves; "+queue.counts.short_source_synopses_only+" undrafted, 33 published guides and 379 covers unchanged.");
