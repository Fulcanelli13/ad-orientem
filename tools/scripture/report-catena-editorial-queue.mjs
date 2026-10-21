/**
 * Living Catena: repeatable editorial retrieval inspection.
 * Uses the EXACT selectors shipped to the Messenger (including abstention).
 * Never creates replacement answers or changes corpus/benchmark fixtures.
 *
 * Usage:
 *   node tools/scripture/report-catena-editorial-queue.mjs
 *   node tools/scripture/report-catena-editorial-queue.mjs --json
 *   node tools/scripture/report-catena-editorial-queue.mjs --check
 *
 * "Miss" = selected original exemplar absent from first four results;
 * NOT a judgement that every other authentic excerpt is irrelevant.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 indexCatenaMessages,retrieveCatenaQuestionMatches,catenaQuestionHasUnsupportedContext
} from "../../src/scripture/catena-messenger.js";
import {
 catenaRelatedTopic,retrieveCatenaRelatedMessages
} from "../../src/scripture/catena-related-vocabulary.js";
const fixture=JSON.parse(readFileSync(
 new URL("../../data/scripture/catena/editorial-challenge.v1.json",import.meta.url),"utf8"));
const corpus=new Map();
for(const gospel of ["matthew","mark","luke","john"]){
 const g=JSON.parse(readFileSync(
  new URL("../../data/scripture/catena/"+gospel+".json",import.meta.url),"utf8"));
 for(const p of g.pericopes)corpus.set(p.id,p);
}
const excerpt=row=>({
 id:row.id,father:row.father,citation:row.citation,sourceUrl:row.sourceUrl,
 preview:row.text.replace(/\s+/g," ").slice(0,240),
 // The full passage lives only in canonical corpus, not duplicated here.
 originalSegmentOrdinal:row.ordinal
});
const inspect=c=>{
 const source=corpus.get(c.pericope);
 assert.ok(source,"Unknown original source "+c.id);
 const rows=indexCatenaMessages([{
  id:source.id,citation:source.citation,
  source:{url:source.source_url},segments:source.segments
 }]);
 assert.equal(rows.length,source.segments.length,"Source text missing");
 const target=rows.find(x=>x.ordinal===c.sourceOrdinal);
 assert.ok(target&&target.father===c.father&&target.text.includes(c.evidence),
  "Unverified editorial target "+c.id);
 const abstained=catenaQuestionHasUnsupportedContext(c.question,rows);
 const topic=catenaRelatedTopic(c.question);
 const selected=retrieveCatenaQuestionMatches(rows,c.question,{limit:4});
 const related=selected.some(row=>row.relatedSourceEvidence);
 let reason;
 if(selected.some(row=>row.id===target.id))reason="target-in-top-four";
 else if(abstained)reason="attestation-veto";
 else if(related)reason="reviewed-topic-ranking";
 else if(!selected.length)reason="no-extract-selected";
 else reason="ranking-or-author-diversity";
 return {
  id:c.id,question:c.question,passage:c.passage,reason,
  relatedTopic:topic?.id||null,
  selectedTarget:excerpt(target),
  displayed: selected.map(excerpt),
  needsHumanReview:reason!=="target-in-top-four"
 };
};
const report=fixture.positives.map(inspect);
const misses=report.filter(x=>x.needsHumanReview);
const reasons=Object.fromEntries([...new Set(misses.map(x=>x.reason))].sort()
 .map(reason=>[reason,misses.filter(x=>x.reason===reason).map(x=>x.id)]));
if(process.argv.includes("--check")){
 assert.equal(report.length,38);
 assert.ok(misses.length>=0&&misses.length<=report.length);
 for(const c of report)for(const message of c.displayed){
  assert.ok(corpus.get(message.id.split(":")[0]),"Noncanonical source!");
  assert.ok(message.sourceUrl.startsWith("https://www.ecatholic2000.com/"));
 }
 console.log("PASS Catena reproducible editorial inspection: 38 original cases, "+
  misses.length+" selected-target misses, with exact retrieved source IDs.");
}else if(process.argv.includes("--json")){
 console.log(JSON.stringify({schema:"ao.catena.editorial-diagnostic.v1",
  caveat:"Unreviewed candidate excerpts. Miss is NOT a human quality grade.",
  total:report.length,misses:misses.length,reasons,cases:misses},null,2));
}else{
 console.log("LIVING CATENA editorial triage | "+report.length+" questions | "+
  misses.length+" source-target misses");
 for(const [reason,ids] of Object.entries(reasons)){
  console.log("\n"+reason+": "+ids.length+" — "+ids.join(", "));
  for(const id of ids){
   const row=misses.find(x=>x.id===id);
   console.log("  "+id+" "+row.passage+" | "+row.question);
   console.log("    Gold: "+row.selectedTarget.id+" "+row.selectedTarget.father+
    " — "+row.selectedTarget.preview);
   for(const [i,message] of row.displayed.entries())
    console.log("    #"+(i+1)+" "+message.id+" "+message.father+
     " — "+message.preview);
  }
 }
 console.log("\nRequires an independent reader of every complete original extract.");
}
