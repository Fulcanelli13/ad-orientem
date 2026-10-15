import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const json=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const r=json("data/explore/biblical-existing-author-selection-review.v1.json");
const canonical=json("data/explore/biblical-reading-continuity-review.v1.json");
assert.equal(r.schema,"AO_BIBLICAL_EXISTING_AUTHOR_SELECTION_REVIEW_V1");
assert.equal(r.status,"RESEARCH_ONLY_NO_PROSE_IMPORTED");
assert.equal(r.policy.aiFaithfulTranslationOfVerifiedExistingAuthorAllowed,true);
assert.equal(r.policy.translationRequiresEditorialReviewBeforePublication,true);
assert.equal(r.policy.aiOriginalNarrativeProhibited,true);
for(const k of ["noAiNarrative","noAiBridges","verbatimExistingAuthorOnly","noPermissionRequests","metadataOnly"])assert.equal(r.policy[k],true);
assert.equal(r.eventSelections.length,151);
assert.equal(r.sections.length,101);
assert.equal(r.works.length,4);
const ids=new Set(r.sections.map(s=>s.id));
assert.equal(ids.size,101);
const count={};
for(const [i,row] of r.eventSelections.entries()) {
 const source=canonical.events[i];
 assert.equal(row.eventKey,source.eventKey);
 assert.equal(row.reference,source.reference);
 assert.equal(row.readingChapterId,source.readingChapterId);
 assert.equal(row.fallback.reference,source.reference);
 assert.equal(row.fallback.nativeCatholicScriptureReader,true);
 assert.equal(row.english.importedText,false);
 assert.equal(row.french.importedText,false);
 assert.deepEqual(row.english.approvedParagraphs,[]);
 assert.deepEqual(row.french.approvedParagraphs,[]);
 if(row.english.sectionId)assert.ok(ids.has(row.english.sectionId));
 count[row.english.status]=(count[row.english.status]||0)+1;
}
assert.deepEqual(count,{ONLINE_CHAPTER_OPENED_NOT_COLLATED:10,TOC_TOPIC_CANDIDATE_ONLY:125,NO_SELECTED_AUTHORED_SECTION:16});

console.log("Source-only Bible crosswalk: 151 event IDs; 101 author section candidates; 0 imported prose.");
