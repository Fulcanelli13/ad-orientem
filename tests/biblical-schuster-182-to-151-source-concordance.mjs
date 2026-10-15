import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const concordance=load("data/explore/biblical-schuster-182-to-atlas-151-source-concordance.v1.json");
const atlas=load("data/explore/biblical-reading-continuity-review.v1.json");
const toc=load("data/explore/biblical-schuster-182-chapter-toc-evidence.v1.json");
const previous=load("data/explore/biblical-existing-author-selection-review.v1.json");
assert.equal(concordance.status,"LATE_ENGLISH_EDITION_TABLE_OF_CONTENTS_ONLY_NOT_TEXT_CERTIFIED");
for(const p of ["differentKnechtAndSchusterNumberingCannotBeEquated","neverInferExactScriptureFromTOC","authorialChapterOrderPreserved","unmappedBookChaptersRetained","noTextImported","noAIOriginalHistoryOrBridges"])assert.equal(concordance.policy[p],true);
assert.equal(concordance.completeSourceChapterSequence.length,182);
assert.equal(concordance.canonicalEventConcordance.length,151);
assert.equal(concordance.counts.modernSchusterChapters,182);
assert.equal(concordance.counts.atlasMilestones,151);
assert.equal(concordance.counts.withTentativeTitleMatch,106);
assert.equal(concordance.counts.withoutTentativeTitleMatch,45);
assert.equal(concordance.counts.chaptersWithAtlasCandidates,92);
assert.equal(concordance.counts.standaloneSourceChapters,90);
assert.equal(concordance.counts.crossEditionNumeralWarnings,35);
assert.equal(concordance.counts.sourceTextPassagesApproved,0);
const chapters=new Map(toc.chapters.map(x=>[x.id,x]));
assert.equal(chapters.size,182);
const inverted=new Map();
for(const [i,row] of concordance.canonicalEventConcordance.entries()){
 assert.equal(row.canonicalEventKey,atlas.events[i].eventKey);
 assert.equal(row.canonicalReference,atlas.events[i].reference);
 assert.equal(row.priorKnechtTOCSelectorId,previous.eventSelections[i].english.sectionId);
 assert.equal(row.sourceParagraphsCollated,0);
 assert.equal(row.approval,"HOLD_NO_SOURCE_TEXT_MAPPED");
 assert.equal(row.openNativeScriptureChapter.reference,atlas.events[i].reference);
 assert.equal(row.matchStatus,row.schusterModernEditionCandidateChapters.length?"EDITORIAL_TITLE_SUBJECT_CANDIDATE_ONLY":"NO_DEFENSIBLE_TOC_SUBJECT_ASSIGNMENT");
 for(const c of row.schusterModernEditionCandidateChapters){
  assert.equal(c.evidence,"MODERN_32ND_EDITION_TABLE_OF_CONTENTS_SUBJECT_LABEL_ONLY");
  assert.equal(c.historical1925ParagraphSourceCertified,false);
  const p=chapters.get(c.chapterId);assert.ok(p,"Unknown Schuster chapter "+c.chapterId);
  assert.equal(c.chapterTitle,p.topicHeading);
  assert.equal(c.printedPageStart,p.printedStartPage);
  const array=inverted.get(c.chapterId)??[];
  array.push(row.canonicalEventKey);
  inverted.set(c.chapterId,array);
 }
}
for(const [i,c]of concordance.completeSourceChapterSequence.entries()){
 assert.equal(c.chapterId,toc.chapters[i].id);
 assert.equal(c.title,toc.chapters[i].topicHeading);
 assert.equal(c.printPageStart,toc.chapters[i].printedStartPage);
 assert.deepEqual(c.linkedAtlasEventKeys,inverted.get(c.chapterId)??[]);
 assert.equal(c.sourceText,"NOT_COLLATED");
 assert.equal(c.french1887ChapterIdentity,"UNKNOWN");
}
const byTitle=s=>concordance.canonicalEventConcordance.find(x=>x.atlasTitle===s);
assert.deepEqual(byTitle("Healing of the man born blind at Siloam").schusterModernEditionCandidateChapters.map(x=>x.chapterId),["schuster:toc:32nd:NT:XLVII"]);
assert.deepEqual(byTitle("The raising of Lazarus").schusterModernEditionCandidateChapters.map(x=>x.chapterId),["schuster:toc:32nd:NT:LVI"]);
assert.deepEqual(byTitle("The agony in the garden").schusterModernEditionCandidateChapters.map(x=>x.chapterId),["schuster:toc:32nd:NT:LXVII"]);
assert.deepEqual(byTitle("Pentecost").schusterModernEditionCandidateChapters.map(x=>x.chapterId),["schuster:toc:32nd:NT:LXXXII"]);
console.log("Schuster 32nd-edition title-level joins: 106/151 tentative; 45 unassigned; 90/182 stand-alone book chapters; 35 edition-number warnings; no prose certified.");
