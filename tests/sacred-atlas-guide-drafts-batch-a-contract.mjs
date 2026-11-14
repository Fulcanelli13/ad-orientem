import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const root="data/geography/research/";
const draft=read(root+"sacred-atlas-batch-a-12-source-verified-bilingual-guide-drafts-20261104.v1.json");
const master=read(root+"sacred-atlas-editorial-master-530-20261104.v1.json");
const queued=new Set(master.batch_plan.shrine_guide_expansion[0].place_ids);
const published=new Set(master.places.filter(x=>x.editorial_state==="PUBLISHED_EXTENDED_GUIDE").map(x=>x.place_id));
assert.equal(draft.schema,"AO_SACRED_ATLAS_BATCH_A_GUIDE_DRAFTS_V1");
assert.equal(draft.guides.length,12);
assert.equal(draft.summary.research_guides,12);
assert.equal(draft.summary.bilingual_paragraph_pairs,36);
assert.equal(draft.summary.publication_approvals,0);
assert.equal(draft.summary.new_photo_approvals,0);
assert.match(draft.policy.deployment,/Never include research/i);
const ids=draft.guides.map(x=>x.place_id);
assert.equal(new Set(ids).size,ids.length);
assert.ok(ids.every(x=>queued.has(x)&&!published.has(x)),"drafts must belong to unpublished Batch A shrine guide queue");
let paragraphPairs=0;
for(const guide of draft.guides){
 assert.equal(guide.publication,"RESEARCH_ONLY_SECOND_EDITOR_PENDING");
 assert.equal(guide.image_policy,"NO_NEW_IMAGES_APPROVED");
 assert.deepEqual(guide.gallery,[]);
 assert.equal(guide.sections.length,3);
 assert.ok(Array.isArray(guide.editorial_notes)&&guide.editorial_notes.length);
 for(const section of guide.sections){
  assert.ok(section.id&&section.title_en&&section.title_fr);
  assert.equal(section.paragraphs.length,1);
  const p=section.paragraphs[0];
  assert.ok(p.en.length>100&&p.fr.length>100,"complete bilingual narrative required");
  assert.ok(p.source_url.startsWith("https://")&&p.issuer&&p.evidence_scope,"per-paragraph original source evidence required");
  paragraphPairs++;
 }
}
assert.equal(paragraphPairs,36);
assert.equal(draft.guides.some(x=>x.place_id==="place:BA:medjugorje-st-james-parish"),true);
assert.equal(draft.guides.some(x=>x.place_id==="place:MU:pere-laval-sainte-croix"),true);
assert.ok(draft.excluded_from_this_pass.every(x=>x.reason&&x.place_id&&!ids.includes(x.place_id)));
console.log("SACRED ATLAS BATCH A GUIDE DRAFT CONTRACT PASS: 12 unique queued shrines, 36 bilingual pairs, source scoped, no production or media approvals.");
