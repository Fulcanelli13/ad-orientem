import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const root="data/shrines/research/";
const m=read("data/geography/research/sacred-atlas-editorial-master-530-20261104.v1.json");
const q=read(root+"sacred-atlas-wave1-batch56-editorial-closure-20261105.v1.json");
const files=[
 root+"sacred-atlas-wave1-first10-extended-guides-20261105.v1.json",
 root+"sacred-atlas-wave1-guides11-20-20261105.v1.json",
 root+"sacred-atlas-wave1-guides21-30-20261105.v1.json",
 root+"sacred-atlas-wave1-guides31-43-20261105.v1.json",
 root+"sacred-atlas-wave1-guides44-56-20261105.v1.json"
];
const batches=files.map(read);
const all=batches.flatMap(x=>x.guides);
const official=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const media=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
const plannedIds=m.batch_plan.shrine_guide_expansion[0].place_ids;
// The editorial queue re-ranked the same 56 sites without changing their membership.
const ids=q.rows.map(row=>row.place_id);
assert.deepEqual([...ids].sort(),[...plannedIds].sort(),
  "Editorial Wave-1 site membership must match the 530-place master plan");
const byId=new Map(m.places.map(p=>[p.place_id,p]));
const shrineIds=new Set(official.shrines.map(x=>x.shrine_id));
assert.equal(m.summary.extended_guides,33);
assert.equal(media.items.length,388, "Current main-approved Place cover inventory must be preserved");
assert.equal(gallery.items.length,42);
assert.equal(geo.places.length,530);
assert.equal(ids.length,56);
assert.equal(new Set(ids).size,56);
assert.equal(q.rows.length,56);
assert.deepEqual(q.counts,{batch_places:56,expanded_bilingual_drafts_second_editor_pending:56,
  short_source_synopses_only:0,published_guide_changes:0,photo_cover_changes:0});
assert.equal(q.first_wave_status,"ALL_56_FIRST_DRAFTS_COMPLETE_RESEARCH_ONLY_SECOND_EDITOR_PENDING");
assert.deepEqual(batches.map(x=>x.guides.length),[10,10,10,13,13]);
assert.equal(batches[3].schema,"AO_SACRED_ATLAS_W1_GUIDES31_43_BILINGUAL_RESEARCH_V1");
assert.equal(batches[4].schema,"AO_SACRED_ATLAS_W1_GUIDES44_56_BILINGUAL_RESEARCH_V1");
assert.equal(all.length,56);
assert.equal(new Set(all.map(x=>x.place_id)).size,56);
let en=0,fr=0,sections=0;
for(let i=0;i<56;i++){
  const id=ids[i],p=byId.get(id),g=all[i],row=q.rows[i];
  assert.ok(p&&p.shrine&&shrineIds.has(p.shrine.shrine_id));
  assert.equal(p.editorial_state,"BILINGUAL_SHRINE_SYNOPSIS_ONLY");
  assert.equal(row.place_id,id);
  assert.equal(row.priority_rank,i+1);
  assert.equal(row.shrine_id,p.shrine.shrine_id);
  assert.equal(row.bilingual_synopsis_present,true);
  assert.equal(row.publication_authorized,false);
  assert.deepEqual(row.existing_relic_ids,p.relic_ids);
  assert.deepEqual(row.existing_pilgrimage_ids,p.pilgrimage_ids);
  assert.deepEqual(row.unresolved_source_ids,p.unresolved_source_ids);
  assert.equal(row.draft_file,files[i<10?0:i<20?1:i<30?2:i<43?3:4]);
  assert.match(row.extended_draft_state,/SECOND_EDITOR/);
  assert.equal(g.place_id,id);
  assert.equal(g.place_name,p.name);
  assert.equal(g.shrine_id,p.shrine.shrine_id);
  assert.equal(g.draft_order,i+1);
  assert.equal(g.publication_authorized,false);
  assert.equal(g.state,"BILINGUAL_EXTENDED_DRAFT_SECOND_EDITOR_REQUIRED_NOT_PUBLISHED");
  assert.equal(g.image_policy,"APPROVED_CANONICAL_PLACE_MEDIA_ONLY_DO_NOT_PROMOTE_RESEARCH_OR_HOLD");
  assert.deepEqual(g.existing_relic_ids,p.relic_ids);
  assert.deepEqual(g.existing_pilgrimage_ids,p.pilgrimage_ids);
  assert.ok(g.subtitle_en?.length>45&&g.subtitle_fr?.length>45);
  assert.equal(g.sections.length,3);
  assert.equal(new Set(g.sections.map(x=>x.id)).size,3);
  assert.ok(g.bibliography_urls.every(url=>/^https:\/\//.test(url)));
  for(const section of g.sections){
    assert.ok(section.title_en?.length>=4&&section.title_fr?.length>=4);
    assert.equal(section.paragraphs.length,1);
    const v=section.paragraphs[0];sections++;
    assert.ok(v.en?.length>190&&v.fr?.length>190,
      "Insufficient substantive EN/FR content for "+id+"/"+section.id);
    assert.notEqual(v.en,v.fr);
    assert.match(v.source_url,/^https:\/\//);
    assert.ok(g.bibliography_urls.includes(v.source_url),"Unregistered source "+id+"/"+section.id);
    en++;fr++;
  }
}
assert.equal(sections,168);
assert.equal(en,168);assert.equal(fr,168);
assert.equal(q.canonical_source_corrections_requiring_separate_review.length,4);
assert.equal(q.material_sensitive_editorial_holds.length,11);
assert.ok(q.material_sensitive_editorial_holds.every(x=>ids.includes(x.place_id)));
const quentin=all.find(x=>x.place_id==="place:FR:basilique-saint-quentin-aisne");
assert.ok(quentin);
assert.match(quentin.sections[2].paragraphs[0].en,/2008 analysis dated the hand/);
assert.match(quentin.sections[2].paragraphs[0].en,/cannot be Saint Quentin's hand/);
const rome=all.find(x=>x.place_id==="place:IT:santa-croce-gerusalemme-rome");
assert.match(rome.sections[2].paragraphs[0].en,/April 2026/);
assert.match(rome.sections[2].paragraphs[0].en,/reopening for worship on 23 October 2026/);
assert.match(rome.sections[2].paragraphs[0].source_url,/^https:\/\/www\.diocesidiroma\.it\//);
const westminster=all.find(x=>x.place_id==="place:GB:westminster-abbey-st-edward");
assert.match(westminster.sections[2].paragraphs[0].en,/Church of England/);
const ukrainian=all.find(x=>x.place_id==="place:CA:bishop-velychkovsky-martyrs-shrine-winnipeg");
assert.match(ukrainian.sections[2].paragraphs[0].en,/Eastern Catholic services/);
console.log("Sacred Atlas Wave1 COMPLETE DRAFT CHECK: 56 exact named bilingual guides, 168 EN + 168 FR source-linked paragraphs, critical relic/site/rite/access holds, zero public guide or cover changes.");
