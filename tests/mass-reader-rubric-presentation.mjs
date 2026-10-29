import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {exactIconBackedRubric} from "../src/mass/reader-icon-backed-rubrics.js";
import {publishedMissalRubricsForParagraph} from "../src/mass/reader-missal-rubrics.js";
import {conciseMissalSourceRubric,conciseMissalInlineSequence,RUBRIC_PRESENTATION_OWNER} from "../src/mass/reader-rubric-presentation.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const registry=read("../data/presentation/reader-rubric-events.v1.json");
const sung=read("../data/presentation/reader-text-sung.v1.json");
const mk=(cue,form,language,kind)=>({kind,sourceCueIds:[cue],publishedMissalRubrics:publishedMissalRubricsForParagraph({sourceCueIds:[cue]},registry,{form,language})});
const sourceSequences=["AO.SM.C0111","AO.SM.C0115","AO.SM.C0117","AO.SM.C0174",
 "AO.SM.C0181","AO.SM.C0262","AO.SM.C0263"];
for(const cue of sourceSequences){
 const original=sung.blocks.flatMap(b=>b.units).find(u=>u.cue_id===cue);
 assert.ok(original&&original.latin.startsWith("["),cue+" not a source-only action bracket");
 for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  for(const language of ["en","fr"]){
   const row=mk(cue,form,language,"RUBRIC");
   const projection=conciseMissalSourceRubric(row,{form,language});
   const mixedRoleSolemn=form==="SOLEMN"&&
     (cue==="AO.SM.C0115"||cue==="AO.SM.C0181");
   if(mixedRoleSolemn){
     assert.equal(projection,null,"Solemn mixed-role chalice actions retain source witness");
     continue;
   }
   assert.ok(projection,cue+" missing certified concise rubric");
   assert.equal(projection.owner,RUBRIC_PRESENTATION_OWNER);
   assert.equal(projection.observedNow,false);
   assert.ok(projection.eventIds.length>=2);
   assert.match(projection.text,language==="fr"?/^Le prêtre /:/^The priest /);
   const incomplete={...row,publishedMissalRubrics:row.publishedMissalRubrics.slice(1)};
   assert.equal(conciseMissalSourceRubric(incomplete,{form,language}),null,"partial published sequence must fail");
   const draft=structuredClone(row);draft.publishedMissalRubrics[0].review="EDITORIAL_DRAFT";
   assert.equal(conciseMissalSourceRubric(draft,{form,language}),null);
  }
 }
}
// Existing certified source-only Memento brackets need their full 1962
// hand/head/eye movements. The concise projection is reused in Missal and
// LIVE, without adding priest observations, icons or prayer text mutations.
for(const [cue,phrase] of [
 ["AO.SM.C0155",/head slightly bowed/],
 ["AO.SM.C0193",/eyes fixed on the Blessed Sacrament/],
]){
 const sourceRow=sung.blocks.flatMap(b=>b.units).find(x=>x.cue_id===cue);
 assert.ok(sourceRow?.latin.startsWith("[SILENT COMMEMORATION"),cue);
 for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  for(const language of ["en","fr"]){
   const p=mk(cue,form,language,"RUBRIC");
   const result=conciseMissalSourceRubric(p,{form,language});
   assert.ok(result,cue+" needs exact source rubric "+form+" "+language);
   assert.deepEqual(result.eventIds,[cue==="AO.SM.C0155"?"AO.RUB.C0155.01":"AO.RUB.C0193.01"]);
   assert.equal(result.observedNow,false);
   assert.match(result.text,language==="en"?phrase:
     cue==="AO.SM.C0155"?/tête légèrement inclinée/:/yeux fixés sur le Saint-Sacrement/);
   const bad=structuredClone(p);
   bad.publishedMissalRubrics[0].sourceId="EDITORIAL_RESEARCH";
   assert.equal(conciseMissalSourceRubric(bad,{form,language}),null);
  }
 }
}
for(const cue of ["AO.SM.C0232","AO.SM.C0234"]){
 for(const language of ["en","fr"]){
  const row=mk(cue,"LOW",language,"TEXT");
  const compact=conciseMissalInlineSequence(row.publishedMissalRubrics,{form:"LOW",language});
  assert.ok(compact&&compact.eventIds.length===2);
  assert.equal(compact.sourceCueId,cue);
 }
}
const covered=mk("AO.SM.C0232","LOW","en","TEXT").publishedMissalRubrics;
assert.ok(exactIconBackedRubric("AO.RUB.C0232.02",{
 mode:"LIVE",cueId:"AO.SM.C0232",priestActionIconKey:"final_ea_priest_communion_host_original",
 iconResolved:true,priestActionLabel:"RECEIVES HOST",
}),"Existing main source-verified asset/gesture owner retained");
assert.equal(exactIconBackedRubric("AO.RUB.C0232.02",{
 mode:"LIVE",cueId:"AO.SM.C0232",priestActionIconKey:"communion",
 iconResolved:true,priestActionLabel:"RECEIVES HOST",
}),null,"Never suppress rubric via rejected art");
assert.equal(conciseMissalSourceRubric(mk("AO.SM.C0174","LOW","en","TEXT"),{form:"LOW"}),null);
assert.equal(conciseMissalInlineSequence(covered,{form:"GOOD_FRIDAY"}),null);
// Integration must use the concise treatment ONLY in Missal; do not
// rewrite canonical prayer text or erase words when LIVE has no icon.
const dom=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
assert.match(dom,/mode==="MISSAL"\?conciseMissalInlineSequence\(shortRubrics/);
assert.match(dom,/const conciseSource=bookRubric \? conciseMissalSourceRubric\(p/);
assert.match(dom,/const liveMemento=mode==="LIVE"/);
assert.match(dom,/event.id==="GM.P.C0204.01"/);
assert.match(dom,/node.prepend\(note\)/);
assert.match(dom,/shortAction:typeof event\.shortAction==="string"\?event\.shortAction:null/);
assert.match(dom,/syncExactIconBackedRubrics\(root,current,mode,iconResolver\)/);
assert.match(dom,/renderedIcon&&!renderedIcon\.hidden/);
assert.match(dom,/syncExactIconBackedRubrics/);
assert.match(dom,/mode==="MISSAL"\|\|mode==="LIVE"/);
assert.match(dom,/source\.href=event\.sourceUrl/);
assert.match(dom,/node\.dataset\.rubricPresentationOwner=conciseSource\.owner/);
assert.doesNotMatch(dom,/data-prayer-suggestion|optional-private-prayer/);
const native=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
assert.match(native,/withCertifiedSolemnMissalMinisters/);
assert.match(native,/withPublishedMissalParagraphRubrics/);
console.log("PASS: exact-source short Missal sequences, EN/FR, four Mass forms, LIVE icon coverage fail-open, no devotional additions and draft guards");
