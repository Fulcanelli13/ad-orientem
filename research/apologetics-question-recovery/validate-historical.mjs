import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const folder=path.dirname(fileURLToPath(import.meta.url));
const evidence=JSON.parse(fs.readFileSync(path.join(folder,"ORIGINAL_QUESTION_BANK_EVIDENCE.v1.json"),"utf8"));
const original=evidence.numbered_question_excerpts;
const bank=evidence.bank_prefixes;
const master=fs.readFileSync(path.join(folder,"HISTORICAL_CONVERSATIONS_MASTER_QUESTION_INDEX.md"),"utf8");
const gap=fs.readFileSync(path.join(folder,"HISTORICAL_QUESTION_GAPS.csv"),"utf8");
const canonical=JSON.parse(fs.readFileSync(path.join(folder,"questions.json"),"utf8"));

const assert=(condition,message)=>{if(!condition)throw Error(message)};
assert(original.length===452,"Historical question count drift: review source before changing approved census");
assert(new Set(original.map(q=>q.id)).size===original.length,"Historical original IDs duplicated");
assert(bank.length===50,"Original bank registry count drift");
assert(original.every(q=>q.id&&q.question&&q.bank&&q.original_message_timestamp_utc&&q.witness_kind&&q.fully_verified_against_original_chat_export===false),"Historical source attribution missing or falsely certified");
assert(original.every(q=>bank.some(b=>b.prefix===q.bank)),"Question is not assigned to a historical bank");
assert(original.every(q=>master.includes(q.id+"** "+q.question)),"Historical master missing an original question");
assert(canonical.questions.length===282,"Current source-file catalogue must remain separate and unchanged");
assert(gap.trimEnd().split("\n").length===615,"Historical known-range slot census drift");
for(const b of bank.filter(x=>typeof x.original_range_count==="number")){
 const items=original.filter(x=>x.bank===b.prefix);
 assert(items.length<=b.original_range_count,"Historical bank contains question ID count exceeding original claimed range: "+b.prefix);
 for(const q of items){
   const n=Number(q.id.slice(b.prefix.length+1));
   assert(Number.isInteger(n)&&n>=1&&n<=b.original_range_count,"Original bank ID outside source range: "+q.id);
 }
}
const full=bank.filter(b=>b.original_range_count===25&&original.filter(q=>q.bank===b.prefix).length===25).map(b=>b.prefix);
assert(full.length===10,"Ten complete 25-question indexed banks required");
const allComplete=bank.filter(b=>typeof b.original_range_count==="number"&&original.filter(q=>q.bank===b.prefix).length===b.original_range_count);
assert(allComplete.length===13,"Thirteen complete indexed original-bank lists expected");
const partial=new Set(evidence.truncated_question_fragments.map(x=>x.id));
assert(["ERR-023","ANG-024","MAR-021","SCR-024"].every(id=>partial.has(id)),"Truncated original question flagged as complete");
assert(!original.some(x=>partial.has(x.id)),"Partial original question incorrectly marked complete");
console.log("PASS: 452 numbered historical title excerpts / 50 bank prefixes / 13 complete stated-size indexed lists / 614 known historical slots; 282 separate source records. Full chat-export verification remains outstanding.");
