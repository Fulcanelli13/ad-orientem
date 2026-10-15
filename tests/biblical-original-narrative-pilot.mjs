import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const get=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const src=get("data/explore/biblical-reading-continuity-review.v1.json");
const trial=get("data/explore/biblical-original-narrative-pilot.v1.json");
assert.equal(trial.schema,"AO_BIBLICAL_THEATRE_ORIGINAL_NARRATIVE_DRAFT_V1");
assert.equal(trial.status,"DRAFT_UNCOLLATED_NOT_PUBLIC");
assert.equal(trial.editorialRules.originalRetellingNotBookTranscription,true);
assert.equal(trial.editorialRules.noPublicationOrRuntimeUse,true);
assert.equal(trial.episodes.length,11);
const seen=new Set(),paragraphs=new Set();
let paragraphCount=0,origins=0;
for(const e of trial.episodes) {
 assert.ok(!seen.has(e.eventKey),"Duplicate manuscript event "+e.eventKey);
 seen.add(e.eventKey);
 const source=src.events.find(x=>x.eventKey===e.eventKey);
 assert.ok(source,"Unknown canonical identity "+e.eventKey);
 assert.equal(e.reference,source.reference);
 assert.equal(e.chapterId,source.readingChapterId);
 assert.equal(e.approval,"DRAFT_NOT_PRINT_COLLATED_OR_EDITORIALLY_APPROVED");
 assert.equal(e.narrative.length,2);
 assert.equal(e.sources.length,2);
 if(source.era==="ORIGINS")origins++;
 for(const paragraph of e.narrative) {
  assert.ok(!paragraphs.has(paragraph.id),"Duplicate paragraph "+paragraph.id);
  paragraphs.add(paragraph.id);
  assert.equal(paragraph.kind,"SCRIPTURE_BASED_RE-TELLING");
  assert.ok(paragraph.id.startsWith(e.eventKey+":"));
  assert.ok(paragraph.text_en.length>=80&&paragraph.text_fr.length>=80);
  assert.ok(paragraph.scriptureRefs.length>0);
  paragraphCount++;
 }
}
assert.equal(origins,6);
assert.equal(paragraphCount,22);
assert.equal(new Set(trial.episodes.map(e=>e.eventKey)).size,11);
for(let i=0;i<6;i++)assert.equal(trial.episodes[i].eventKey,src.events[i].eventKey);
for(const b of trial.bridges) {
 assert.ok(src.events.some(e=>e.eventKey===b.fromEventKey));
 assert.ok(src.events.some(e=>e.eventKey===b.toEventKey));
 assert.equal(b.status,"SOURCE_PASSAGE_IDENTIFIED_DRAFT_NARRATIVE_NOT_AUTHORED");
}
console.log("Biblical original narrative draft: 11 canonical episodes; 22 bilingual paragraphs; 6 sequential Origins; no publication clearance.");
