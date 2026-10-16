import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildMassExplorerCatalog,massExplorerMomentHtml} from "../src/learn/mass-explorer.js";
import {massMapHtml,projectMassMap} from "../src/learn/mass-map.js";
import {massMomentExistingGuideSections,massMomentStudyDetailHtml,massMomentStudyLinks,massMomentsStudyListHtml} from "../src/learn/mass-moments-study.js";
import {massStudyStages,massStudyPathsHtml} from "../src/learn/mass-study-paths.js";
import {searchDiscovery} from "../src/learn/discovery.js";
import {LEARN_LAYOUT} from "../src/learn/presentation.js";
import {MASS_FORMATION_SCRIPTURE_ANCHORS} from "../src/learn/mass-formation-scripture-context.js";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const data=path=>JSON.parse(read(path));
const guide=data("data/presentation/guide-registry.v1.json"),
  corpus=data("data/presentation/reader-text-sung.v1.json"),
  french=data("data/presentation/reader-french-ordinary.v1.json"),
  course=data("data/learn/mass-formation-campion.v1.json");
const catalog=buildMassExplorerCatalog(guide,corpus,french,course);
const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
assert.deepEqual(projectMassMap(catalog).phases.map(p=>p.stops.length),[1,9,9,7,6]);
assert.equal(catalog.sequence.length,32);
assert.equal(catalog.byBlock.size,96);
const stageIds=massStudyStages(course).map(x=>x.id);
assert.deepEqual(stageIds,Array.from({length:8},(_,i)=>"MF"+String(i+1).padStart(2,"0")));
assert.equal(course.stages.reduce((sum,x)=>sum+x.claims.length,0),24,"All 24 original published Formation claims remain");
const sourceSet=new Set(course.sources.map(x=>x.id));
assert.equal(sourceSet.size,course.sources.length,"Original source IDs must remain unique");
for(const stage of course.stages){
  assert.ok(stage.claims.length);
  for(const claim of stage.claims){
    assert.ok(claim.id&&claim.text?.en&&claim.text?.fr,"Missing original published bilingual claim");
    for(const id of claim.sources||[])assert.ok(sourceSet.has(id),"Unresolved source reference: "+id);
  }
}
const mapHtml=massMapHtml(catalog,{studyHtml:massStudyPathsHtml(catalog.formationStages)});
for(const id of stageIds)assert.ok(mapHtml.includes('data-ao-mx-stage="'+id+'"'),"Unreachable original Formation lesson "+id);
assert.equal((mapHtml.match(/data-ao-mx-map-block="/g)||[]).length,96);
assert.equal((mapHtml.match(/data-ao-mx-moment="/g)||[]).length,32);
const legacy=massMomentsStudyListHtml(guide);
assert.equal((legacy.match(/data-ao-mf-moment="/g)||[]).length,32,
 "Research-only original Guide index must remain addressable");
for(const key of catalog.sequence){
  const entry=catalog.byKey.get(key),article=massExplorerMomentHtml(catalog,key);
  const historic=massMomentStudyDetailHtml(guide,key);
  assert.ok(article.includes('data-ao-mx-current="'+key+'"'),"Missing new study route "+key);
  assert.ok(historic.includes('data-ao-mf-moment-detail="'+key+'"'),"Missing retained legacy route "+key);
  for(const {heading,text} of massMomentExistingGuideSections(entry.guide)){
    assert.ok(historic.includes(escapeHtml(heading)),key+" legacy heading vanished");
    assert.ok(article.includes(escapeHtml(heading)),key+" new heading vanished");
    assert.ok(article.includes(escapeHtml(text)),key+" original published Guide explanation changed");
  }
  for(const block of entry.blocks){
    const selected=massExplorerMomentHtml(catalog,key,{blockId:block.Block_ID});
    assert.ok(selected.includes('data-ao-mx-block="'+block.Block_ID+'"'),
      "Original source block unavailable through new Formation reader: "+block.Block_ID);
  }
  const references=massMomentStudyLinks(key);
  for(const anchorId of references.scriptureAnchorIds){
    assert.ok(MASS_FORMATION_SCRIPTURE_ANCHORS.some(x=>x.id===anchorId),
      "Unapproved Scripture relation leaked into P1: "+anchorId);
  }
}
const liturgy=LEARN_LAYOUT.sections.find(x=>x.id==="liturgy-tradition");
assert.deepEqual(liturgy.items.filter(x=>x.id==="learn.mass").map(x=>x.id),["learn.mass"],
 "Do not erase original Formation route from canonical registry");
const found=searchDiscovery("Mass",{sections:LEARN_LAYOUT.sections});
assert.ok(found.some(x=>x.kind==="module"&&x.id==="learn.mass_explorer"));
assert.ok(!found.some(x=>x.kind==="module"&&x.id==="learn.mass"),
 "Do not present two competing public Mass learning destinations");
assert.match(read("src/learn/mass-formation.js"),/opts\.view==="moments"/,
 "Explicit original Guide legacy deep link disappeared");
assert.match(read("src/learn/mass-formation.js"),/openModule\?\.\("learn\.mass_explorer"/,
 "Old public Guide entry not consolidated under Mass Map");
assert.doesNotMatch(read("src/mass/browser-entry.js"),/mass-reader-study-bridge|Understand this Mass moment/,
 "Do not reintroduce Formation calls to action during liturgy");
console.log("PASS Mass Formation non-loss: 32 Guide moments, 96 source blocks, 8 thematic lessons, 24 sourced claims, Scripture ownership, one public destination and legacy deep links");
