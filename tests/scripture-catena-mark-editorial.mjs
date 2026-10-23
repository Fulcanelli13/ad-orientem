import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CATENA_MARK_RESEARCH_COMMIT,validateCatenaMarkEditorial,
 findCatenaMarkResearchQuestion,loadCatenaMarkEditorialSource}
 from "../src/scripture/catena-mark-editorial.js";
import {selectCatenaPericopes} from "../src/scripture/catena-inline.js";
const original=JSON.parse(readFileSync("data/scripture/catena/editorial-mark-original-work-crosswalk.v1.json","utf8"));
const registry=validateCatenaMarkEditorial(original);
assert.equal(original.importedFromResearchCommit,CATENA_MARK_RESEARCH_COMMIT);
assert.equal(registry.rows.length,10);
assert.equal(registry.byPointer.size,10);
assert.equal(original.counts.humanApproved,0);
const chunks=new Map();
function sectionFor(pointer){
 const m=/^catena\.mark\.(\d+)\.(\d+):(\d+)$/.exec(pointer);
 assert.ok(m,pointer);
 const chapter=Number(m[1]),first=1+4*Math.floor((chapter-1)/4);
 const filename="data/scripture/catena/chunks/mark-"+String(first).padStart(2,"0")+"-"+String(first+3).padStart(2,"0")+".json";
 if(!chunks.has(filename))chunks.set(filename,JSON.parse(readFileSync(filename,"utf8")));
 const pericopeId=pointer.slice(0,pointer.lastIndexOf(":"));
 const section=chunks.get(filename).pericopes.find(p=>p.id===pericopeId);
 assert.ok(section,pointer);
 const display=selectCatenaPericopes([section],{book:"Mark",chapter,verseStart:Number(m[2]),verseEnd:Number(m[2])})[0];
 assert.ok(display,"canonical loader must return the selected Mark pericope");
 assert.equal(Object.hasOwn(display,"verse_keys"),false,"display records intentionally omit raw verse keys");
 return {section:display,segment:display.segments[Number(m[3])]};
}
for(const row of registry.rows){
 const {section,segment}=sectionFor(row.sourcePointer);
 assert.equal(segment.father,row.inheritedFatherLabel);
 assert.equal(segment.text.length,row.canonicalCharLength);
 assert.equal(row.canonicalExcerptCopied,false);
 const exact=findCatenaMarkResearchQuestion(registry,row.editorialQuestion);
 assert.equal(exact.sourcePointer,row.sourcePointer);
 assert.equal(exact.publicationEligibility,"blocked_research_only");
 assert.equal(exact.doesNotCertifyAnswer,true);
 const variant=findCatenaMarkResearchQuestion(registry,
  "  "+row.editorialQuestion.toUpperCase().replace("?"," ?!")+"  ");
 assert.equal(variant.sourcePointer,row.sourcePointer);
 const source=await loadCatenaMarkEditorialSource(registry,row.sourcePointer,{
  loader:async()=>[section]});
 assert.equal(source.segment.text,segment.text);
 assert.equal(source.section.citation,section.citation);
 assert.equal(source.publicationEligibility,"blocked_research_only");
 await assert.rejects(()=>loadCatenaMarkEditorialSource(registry,row.sourcePointer,{
  loader:async()=>[{...section,segments:section.segments.map((s,i)=>
   i===Number(row.sourcePointer.split(":")[1])?{...s,text:"Altered research response"}:s)}]}),
  /CANONICAL_SOURCE_MISMATCH/);
 await assert.rejects(()=>loadCatenaMarkEditorialSource(registry,row.sourcePointer,{
  loader:async()=>[{...section,segments:section.segments.map((s,i)=>
   i===Number(row.sourcePointer.split(":")[1])?{...s,father:"Invented ancient speaker"}:s)}]}),
  /CANONICAL_SOURCE_MISMATCH/);
}
assert.equal(findCatenaMarkResearchQuestion(registry,
 "Did Theophylact prove Christ certainly ate the Passover twice?"),null);
assert.equal(findCatenaMarkResearchQuestion(registry,
 "Which Resurrection appearance definitely occurred on the fortieth day?"),null);
assert.equal(findCatenaMarkResearchQuestion(registry,
 "Did Augustine say that both thieves initially mocked Jesus?"),null);
assert.equal(findCatenaMarkResearchQuestion(registry,
 "What is my next month's electricity bill?"),null);
assert.equal(findCatenaMarkResearchQuestion(registry,""),null);
assert.equal(findCatenaMarkResearchQuestion(registry,
 "Why did Christ curse the fig tree when the season of figs had not arrived? Is it cruel?"),null,
 "Do not silently broaden a researched question into a new answer");
assert.throws(()=>validateCatenaMarkEditorial({...original,counts:{...original.counts,humanApproved:1}}),
 /CATENA_MARK_RESEARCH_INVALID/);
assert.throws(()=>validateCatenaMarkEditorial({...original,importedFromResearchCommit:"untracked"}),
 /CATENA_MARK_RESEARCH_INVALID/);
assert.throws(()=>validateCatenaMarkEditorial({...original,rows:original.rows.map((r,i)=>
 i===0?{...r,independentHumanEditorApproved:true}:r)}),
 /CATENA_MARK_RESEARCH_RECORD_INVALID/);
assert.throws(()=>validateCatenaMarkEditorial({...original,rows:original.rows.map((r,i)=>
 i===0?{...r,witnessUrl:"javascript:alert(1)"}:r)}),
 /CATENA_MARK_EXTERNAL_LINK_INVALID/);
const changed=validateCatenaMarkEditorial({...original,rows:original.rows.map((r,i)=>
 i===0?{...r,canonicalCharLength:r.canonicalCharLength+1}:r)});
const changedRow=changed.rows[0], changedSection=sectionFor(changedRow.sourcePointer).section;
await assert.rejects(()=>loadCatenaMarkEditorialSource(changed,changedRow.sourcePointer,{
 loader:async()=>[changedSection]}),/CANONICAL_SOURCE_MISMATCH/);
const canonical=sectionFor("catena.mark.10.17:19").segment.text;
assert.ok(!canonical.includes("Zacchaeus"),"Bede Catena abridgment must remain intact");
assert.match(registry.byPointer.get("catena.mark.10.17:19").readerGuard,/Zacchaeus/);
assert.equal(registry.byPointer.get("catena.mark.14.17:2").independentWorkTextInspected,false);
assert.equal(registry.byPointer.get("catena.mark.14.17:2").criticalEditionChecked,false);
const questionModule=readFileSync("src/scripture/catena-reader-questions.js","utf8");
for(const row of registry.rows)assert.ok(!questionModule.includes('"sourcePointer": "'+row.sourcePointer+'"'),
 "Research-only Mark question cannot be in the curated Messenger catalogue");
const preview=readFileSync("previews/living-catena-editorial-workbench-20261021.html","utf8");
assert.match(preview,/data-filter="mark"/);
assert.match(preview,/findCatenaMarkResearchQuestion/);
assert.match(preview,/loadCatenaMarkEditorialSource/);
assert.match(preview,/No Father reply has been supplied or inferred/);
assert.match(preview,/No approval form is available for Mark/);
console.log("PASS Mark research: 10 exact canonical source routes, read-only workbench, no-answer abstention, original-work caveats and zero approvals");
