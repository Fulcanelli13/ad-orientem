import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../data/"+p,import.meta.url),"utf8"));
const d=read("mass/alphonsus-fortescue-low-sung-differences-adjudicated.v1.json");
const donor=read("mass/alphonsus-fortescue-direct-book-evidence-batch02.v1.json");
const low=read("presentation/reader-text-low.v1.json");
const sung=read("presentation/reader-text-sung.v1.json");
const all=corpus=>new Map(corpus.blocks.flatMap(b=>b.units.filter(u=>/^AO\.SM\.C\d{4}$/.test(u.cue_id)).map(u=>[u.cue_id,{unit:u,block:b}])));
const s=all(sung),l=all(low);
const byId=new Map(donor.items.map(item=>[item.id,item]));
const get=id=>d.items.find(x=>x.evidenceRecordId==="ALPH.BK2."+id);
assert.equal(d.items.length,16);
assert.equal(new Set(d.items.map(x=>x.cueId)).size,14);
assert.equal(d.distinctCueCount,14);
assert.deepEqual(d.totals.counts,{
 VALID_FORM_DELTA:6,SOT_OWNERSHIP_REVIEW:7,
 SHARED_ACTION_NO_REAL_FORM_DELTA:1,SPECIAL_HISTORICAL_1962_GATE:2
});
assert.equal(d.noRuntimeChange,true);
assert.equal(d.sourceBooksPreDate1962,true);
for(const x of d.items){
 const orig=byId.get(x.evidenceRecordId);
 assert(orig&&orig.canonicalCrosswalk.lowSungActionDifference,x.id+" not in audited source differences");
 assert.equal(x.cueId,orig.cueId);
 assert(s.has(x.cueId)&&l.has(x.cueId),x.id+" cue missing");
 assert.equal(x.canonicalMacro,s.get(x.cueId).block.Macro_ID);
 assert.equal(x.originalBookReference.printedPage,orig.alphonsusEvidence.printedPage);
 assert.equal(x.originalBookReference.pdfPage,orig.alphonsusEvidence.pdfPageOneBased);
 assert.equal(x.originalBookReference.excerpt,orig.alphonsusEvidence.evidenceWindow);
 assert.equal(x.liveChangeMade,false);
 assert.equal(x.rubrical1962Approval,"NOT_BY_HISTORICAL_BOOK_ALONE");
 assert(x.bookMeaningAssessment.length>=70);
 assert(x.proposedNextStep.length>=12);
}
assert.equal(get("020").adjudication,"SOT_OWNERSHIP_REVIEW");
assert.equal(s.get("AO.SM.C0076").unit.clock,"USER_RESPONSE");
assert.equal(l.get("AO.SM.C0076").unit.clock,"MINISTER_RESPONSE");
assert.equal(s.get("AO.SM.C0145").unit.clock,"SCHOLA_PUBLIC");
assert.equal(s.get("AO.SM.C0148").unit.clock,"SCHOLA_PUBLIC");
assert.equal(get("044").adjudication,"SOT_OWNERSHIP_REVIEW");
assert.equal(get("045").adjudication,"SOT_OWNERSHIP_REVIEW");
assert.equal(get("072").proposedNextStep,"ADD_VISIBLE_PATEN_OBJECT_EVENT_AFTER_C0211_WITH_FORM_ACTOR_RULES");
assert.equal(s.get("AO.SM.C0211").unit.latin,"Amen.");
for(const i of ["AO.SM.C0229","AO.SM.C0230","AO.SM.C0231"])
 assert(s.get(i).unit.latin.includes("non sum dignus"),"missing repeated priest Communion formula");
assert.equal(get("099").adjudication,"SPECIAL_HISTORICAL_1962_GATE");
assert.equal(get("107").adjudication,"SPECIAL_HISTORICAL_1962_GATE");
assert.equal(get("025").adjudication,"SHARED_ACTION_NO_REAL_FORM_DELTA");
console.log("PASS 16 two-book form differences: 6 form, 7 ownership, 1 shared action, 2 historical cases; 14 distinct cues.");
