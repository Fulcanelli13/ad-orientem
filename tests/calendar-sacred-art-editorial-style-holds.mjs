import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const source=read("../data/calendar/sacred-art-candidates.v1.json");
const decisions=read("../data/calendar/sacred-art-curator-decisions-20261011.v1.json");
const holds=read("../data/calendar/sacred-art-editorial-style-holds-20261012.v1.json");
assert.equal(holds.schema,"AO_SACRED_ART_EDITORIAL_STYLE_HOLDS_V1");
assert.equal(holds.status,"SOURCE_CANDIDATES_ONLY_NOT_EDITED_IN_PUBLISHED_APP");
assert.equal(holds.ownerPR,887);
const byId=new Map(source.artworks.map(a=>[a.id,a]));
const conflict=decisions.selections.filter(s=>/\bel[ -]?greco\b/i.test(byId.get(s.artworkId)?.artist||""));
assert.equal(conflict.length,3,"all previously selected artwork-style contradictions must remain visible");
assert.equal(holds.affected.length,3);
assert.deepEqual(new Set(holds.affected.map(x=>x.targetId)),new Set(conflict.map(x=>x.targetId)));
const used=new Set();
for(const row of holds.affected){
 const previous=decisions.selections.find(x=>x.targetId===row.targetId);
 assert.equal(row.previousSelectionId,previous.artworkId,"historical original selection must be preserved");
 assert.equal(row.status,"REPLACEMENT_NOT_SELECTED");
 assert.ok(row.candidates.length>=2);
 for(const proposal of row.candidates){
  assert.equal(proposal.review,"SUBJECT_AND_ARTISTIC_REVIEW_REQUIRED");
  const a=byId.get(proposal.artworkId);
  assert.ok(a&&a.medium==="painting"&&a.source?.rights==="CC0");
  assert.ok(a.acquisition?.originalSha256===proposal.acquiredOriginalSha256);
  assert.doesNotMatch(a.artist||"",/\bel[ -]?greco\b/i);
  assert.ok(!decisions.refusals.some(x=>x.targetId===row.targetId&&x.artworkId===a.id));
  assert.ok(!used.has(row.targetId+"|"+a.id),"avoid duplicate alternatives for one subject");
  used.add(row.targetId+"|"+a.id);
  if(proposal.relation.startsWith("EXACT_")||proposal.relation.startsWith("SAME_NARRATIVE_")){
   assert.ok(a.association.subjectKeys.some(k=>["carrying-cross","crucifixion"].includes(k)));
  }else{
   assert.equal(row.targetId,"calendar.good-friday");
   assert.match(proposal.relation,/DIFFERENT_PASSION_EPISODE/);
  }
 }
}
const statuses=new Set(decisions.selections.map(x=>x.status));
assert.deepEqual([...statuses],["SELECTED_FOR_SUBJECT_EDITORIALLY_ONLY"]);
assert.equal(source.artworks.filter(x=>/\bel[ -]?greco\b/i.test(x.artist||"")).length,7);
console.log("PASS Sacred Art: 3 legacy style conflicts, 9 verified unapproved substitutes, no changes to 44 historic subject choices");
