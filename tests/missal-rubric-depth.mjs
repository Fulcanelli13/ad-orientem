import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {missalRubricDetailForParagraph,MISSAL_RUBRIC_DETAIL_OWNER}
 from "../src/mass/reader-missal-rubric-detail.js";
import {withPublishedMissalParagraphRubrics}
 from "../src/mass/reader-missal-rubrics.js";
import {normalizeReaderMoment} from "../src/mass/reader-dom.js";
const registry=JSON.parse(readFileSync(
 new URL("../data/presentation/reader-rubric-events.v1.json",import.meta.url),"utf8"));
const p=(id,text,kind="TEXT")=>({
 id,sourceCueIds:[id],kind,primary:text,secondary:"Source translation"
});
function published(row,lang="en",form="LOW"){
 return withPublishedMissalParagraphRubrics([row],registry,{language:lang,form})[0];
}
const host=published(p("AO.SM.C0174",
 "[GENUFLECTS — ELEVATES THE SACRED HOST — REPLACES IT — GENUFLECTS]","RUBRIC"));
const hostDetail=missalRubricDetailForParagraph(host);
assert.equal(hostDetail.owner,MISSAL_RUBRIC_DETAIL_OWNER);
assert.equal(hostDetail.shortAlreadyInSource,true);
assert.equal(hostDetail.observedNow,false);
assert.deepEqual(hostDetail.steps.map(x=>x.id),[
 "AO.RUB.C0174.01","AO.RUB.C0174.02",
 "AO.RUB.C0174.04","AO.RUB.C0174.05"
]);
assert.equal(hostDetail.steps.length,4);
const finger=host.publishedMissalRubrics.find(x=>x.id==="AO.RUB.C0174.06");
assert.equal(finger?.kind,"STATE",
 "Newly approved finger discipline from #1374 must remain visible in short Missal");
assert.equal(hostDetail.steps.some(x=>x.id==="AO.RUB.C0174.06"),false,
 "Persistent finger discipline is NOT a fifth timed elevation step");
assert.equal(new Set(hostDetail.steps.map(x=>x.cueId)).size,1);
assert.match(hostDetail.sourceUrl,/ritus-servandus/);
const paten=published(p("AO.SM.C0111",
 "[MAKES THE CROSS WITH THE PATEN — PLACES THE HOST — SETS THE PATEN ASIDE]"));
assert.deepEqual(missalRubricDetailForParagraph(paten).steps.map(x=>x.id),[
 "AO.RUB.C0111.01","AO.RUB.C0111.02","AO.RUB.C0111.03"
]);
assert.equal(missalRubricDetailForParagraph(paten).shortAlreadyInSource,true);
const head=published(p("AO.SM.C0058","Gratias agimus tibi"));
const placed=missalRubricDetailForParagraph(head);
assert.equal(placed.steps.length,1);
assert.equal(placed.steps[0].latinTrigger,"Gratias agimus tibi");
assert.equal(placed.shortAlreadyInSource,false);
const silent=published(p("AO.SM.C0161","Hanc igitur"));
assert.equal(missalRubricDetailForParagraph(silent),null,
 "Single generic rubric without a source word or role distinction must stay short");
const hostFr=published(p("AO.SM.C0174","[ACTION DU PRÊTRE]","RUBRIC"),"fr");
assert.deepEqual(hostFr.publishedMissalRubrics.map(x=>x.id),
 host.publishedMissalRubrics.map(x=>x.id));
assert.ok(missalRubricDetailForParagraph(hostFr).steps.every(x=>x.text.startsWith("Le prêtre")));
const normalized=normalizeReaderMoment({paragraphs:[host]});
assert.equal(missalRubricDetailForParagraph(normalized.paragraphs[0]).steps.length,4);
const forged={...host,publishedMissalRubrics:host.publishedMissalRubrics.map(x=>({
 ...x,owner:"RESEARCH_PENDING"
}))};
assert.equal(missalRubricDetailForParagraph(forged),null,
 "Held research must never sneak through long-rubric expansion");
assert.equal(missalRubricDetailForParagraph(p("AO.SM.C0174","[NO EVENTS]")),null);
console.log("PASS Missal short/long rubric source owner: bracket deduplication, four-step Host, paten trio, Latin trigger, EN/FR, fail-closed research.");
