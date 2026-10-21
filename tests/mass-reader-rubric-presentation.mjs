import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {publishedMissalRubricsForParagraph} from "../src/mass/reader-missal-rubrics.js";
import {conciseMissalSourceRubric,conciseMissalInlineSequence,liveActionCoveredByIcon,RUBRIC_PRESENTATION_OWNER} from "../src/mass/reader-rubric-presentation.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const registry=read("../data/presentation/reader-rubric-events.v1.json");
const sung=read("../data/presentation/reader-text-sung.v1.json");
const mk=(cue,form,language,kind)=>({kind,sourceCueIds:[cue],publishedMissalRubrics:publishedMissalRubricsForParagraph({sourceCueIds:[cue]},registry,{form,language})});
const sourceSequences=["AO.SM.C0111","AO.SM.C0117","AO.SM.C0174","AO.SM.C0262","AO.SM.C0263"];
for(const cue of sourceSequences){
 const original=sung.blocks.flatMap(b=>b.units).find(u=>u.cue_id===cue);
 assert.ok(original&&original.latin.startsWith("["),cue+" not a source-only action bracket");
 for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  for(const language of ["en","fr"]){
   const row=mk(cue,form,language,"RUBRIC");
   const projection=conciseMissalSourceRubric(row,{form,language});
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
for(const cue of ["AO.SM.C0232","AO.SM.C0234"]){
 for(const language of ["en","fr"]){
  const row=mk(cue,"LOW",language,"TEXT");
  const compact=conciseMissalInlineSequence(row.publishedMissalRubrics,{form:"LOW",language});
  assert.ok(compact&&compact.eventIds.length===2);
  assert.equal(compact.sourceCueId,cue);
 }
}
const covered=mk("AO.SM.C0232","LOW","en","TEXT").publishedMissalRubrics;
assert.equal(liveActionCoveredByIcon(covered[1],{cueId:"AO.SM.C0232",priestAction:{cueId:"AO.SM.C0232",label:"RECEIVES HOST"},iconKey:"communion",iconResolved:true}),true);
assert.equal(liveActionCoveredByIcon(covered[0],{cueId:"AO.SM.C0232",priestAction:{cueId:"AO.SM.C0232",label:"RECEIVES HOST"},iconKey:"communion",iconResolved:true}),false,"Precise Sign of the Cross remains textual");
assert.equal(liveActionCoveredByIcon(covered[1],{cueId:"AO.SM.C0232",priestAction:{cueId:"AO.SM.C0232",label:"RECEIVES HOST"},iconKey:"communion",iconResolved:false}),false,"No icon means no suppression");
assert.equal(liveActionCoveredByIcon(covered[1],{cueId:"AO.SM.C0234",priestAction:{cueId:"AO.SM.C0232",label:"RECEIVES HOST"},iconKey:"communion",iconResolved:true}),false,"Stale cue must not suppress");
assert.equal(conciseMissalSourceRubric(mk("AO.SM.C0174","LOW","en","TEXT"),{form:"LOW"}),null);
assert.equal(conciseMissalInlineSequence(covered,{form:"GOOD_FRIDAY"}),null);
// Integration must use the concise treatment ONLY in Missal; do not
// rewrite canonical prayer text or erase words when LIVE has no icon.
const dom=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
assert.match(dom,/mode==="MISSAL"\?conciseMissalInlineSequence\(shortRubrics/);
assert.match(dom,/const conciseSource=bookRubric \? conciseMissalSourceRubric\(p/);
assert.match(dom,/shortAction:typeof event\.shortAction==="string"\?event\.shortAction:null/);
assert.match(dom,/liveActionCoveredByIcon\(event,/);
assert.match(dom,/iconNode&&!iconNode\.hidden&&iconKey/);
assert.match(dom,/for\(const note of root\.querySelectorAll\?\.\("\.ao-live-inline-rubrics"\)/);
assert.match(dom,/mode==="MISSAL"\|\|mode==="LIVE"/);
assert.match(dom,/source\.href=event\.sourceUrl/);
assert.doesNotMatch(dom,/data-prayer-suggestion|optional-private-prayer/);
const native=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
assert.match(native,/withCertifiedSolemnMissalMinisters/);
assert.match(native,/withPublishedMissalParagraphRubrics/);
console.log("PASS: exact-source short Missal sequences, EN/FR, four Mass forms, LIVE icon coverage fail-open, no devotional additions and draft guards");
