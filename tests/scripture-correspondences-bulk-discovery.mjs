import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CATHOLIC_BOOK_IDS } from "../src/scripture/canon.js";

const read=(name)=>JSON.parse(readFileSync(new URL("../data/scripture/correspondences/"+name,import.meta.url),"utf8"));
const crosswalk=read("external-book-crosswalk.v1.json");
const ubs=read("ubs-parallel-passages.v1.json");
const catholic=read("catholic-deuterocanon-candidates.v1.json");
const index=read("discovery-index.v1.json");
const seed=read("thematic-seed.v1.json");
const leads=read("thematic-source-leads.v1.json");
const odr=read("original-douay-margins.v1.json");

assert.equal(crosswalk.count,73);
assert.deepEqual(crosswalk.books.map(x=>x.book_id),CATHOLIC_BOOK_IDS,"use existing canonical owner");
const rawIds=new Map(crosswalk.books.map(x=>[x.standard_source_code,x.book_id]));
const nt=new Set(crosswalk.books.filter(x=>x.testament==="NT").map(x=>x.standard_source_code));
assert.equal(rawIds.size,73);
assert.equal(crosswalk.books.find(x=>x.book_id==="Esther").original_douay_code,"ESG");
assert.equal(crosswalk.books.find(x=>x.book_id==="Daniel").original_douay_code,"DAG");
assert.deepEqual(crosswalk.excluded_appendix.map(x=>x.original_douay),["1ES","2ES","MAN"]);
for(const extra of crosswalk.excluded_appendix)assert.ok(!rawIds.has(extra.original_douay),"never promote an appendix book");
const cohorts={ot_only:[],nt_only:[],cross_testament:[],gospel_only:[],ranges:[]};
const byBook={};
let totalEntries=0;
for(let i=0;i<ubs.groups.length;i++){
 const group=ubs.groups[i], codes=new Set(group.map(x=>x[0].split(" ")[0]));
 assert.ok([...codes].every(x=>rawIds.has(x)),"all book names must normalize to the local canon");
 const a=[...codes].some(x=>nt.has(x)),b=[...codes].some(x=>!nt.has(x));
 const type=a&&b?"cross_testament":a?"nt_only":"ot_only";cohorts[type].push(i);
 if([...codes].every(x=>["MAT","MRK","LUK","JHN"].includes(x)))cohorts.gospel_only.push(i);
 if(group.some(x=>/[-,]/.test(x[0].split(":")[1])))cohorts.ranges.push(i);
 for(const code of codes)(byBook[rawIds.get(code)]??=[]).push(i);
 totalEntries+=group.length;
}
assert.deepEqual(cohorts,index.cohorts,"indexed UBS cohorts must be regenerated when sources change");
assert.deepEqual(byBook,index.ubs_groups_by_book,"every UBS group must be discoverable by canonical book");
assert.equal(cohorts.ot_only.length,1184);
assert.equal(cohorts.nt_only.length,760);
assert.equal(cohorts.cross_testament.length,249);
assert.equal(cohorts.gospel_only.length,624);
assert.equal(cohorts.ranges.length,441);
assert.equal(totalEntries,5266);
assert.equal(Object.keys(byBook).length,60);
assert.equal(index.classification_policy.includes("never infer quotation"),true);

const catholicByBook={};
for(let i=0;i<catholic.rows.length;i++){
 const [from,to]=catholic.rows[i];const fromId=rawIds.get(from.split(".")[0]);
 assert.ok(fromId && rawIds.has(to.split(".")[0]),"unknown Catholic code");
 (catholicByBook[fromId]??=[]).push(i);
}
assert.deepEqual(catholicByBook,index.catholic_records_by_source_book);

const familyIds=new Set(seed.families.map(x=>x[0]));
assert.equal(familyIds.size,11);
assert.equal(leads.research_topics.length,56);
const allCross=new Set(cohorts.cross_testament),seen=new Set(),usedGroups=new Set();
for(const topic of leads.research_topics){
 assert.ok(familyIds.has(topic.family),"subject refers to nonexistent family");
 assert.ok(!seen.has(topic.id),"topic ID collision"); seen.add(topic.id);
 assert.ok(topic.status.includes("candidate") && !topic.status.includes("published"));
 for(const id of topic.ubs_group_ids){assert.ok(allCross.has(id),"non-cross-testament source group in NT-OT subject: "+topic.id+" / "+id);usedGroups.add(id)}
}
assert.equal(usedGroups.size,80);
assert.equal(leads.metrics.distinct_cross_testament_ubs_groups_covered,usedGroups.size);
assert.equal(leads.metrics.unassigned_cross_testament_ubs_groups,169);

assert.equal(odr.source.commit,"d82b2852d55a2ab8f0e57311ee42acde25740781");
assert.equal(odr.audit.original_verses_with_marginal_marks,217);
assert.equal(odr.audit.original_marginal_entries,227);
assert.equal(odr.audit.modern_source_addresses,202);
assert.equal(odr.audit.shared_source_verse_addresses,199);
assert.equal(odr.audit.original_only_source_verse_addresses,18);
assert.equal(odr.audit.modern_only_source_verse_addresses,3);
assert.equal(odr.original_source_verses.length,217);
assert.equal(odr.modern_only_addresses.length,3);
for(const row of odr.original_source_verses) {
 assert.ok(Array.isArray(row.printed_margins) && row.printed_margins.length>0);
 const expected=catholic.rows.filter(x=>x[0]===row.source && x[3]==="douay").map(x=>x[1]);
 assert.deepEqual(row.upstream_normalized_targets,expected);
}
assert.ok(odr.original_source_verses.find(x=>x.source==="WIS.11.18")?.printed_margins[0].includes("Levi. 26."));
assert.ok(odr.original_source_verses.find(x=>x.source==="TOB.4.3")?.printed_margins[0]==="1.");
console.log("Biblical correspondence bulk gate PASS: 73 canonical books, 2,193 UBS groups, 249 cross-Testament groups, 624 Gospel-only groups, 56 thematic leads, 227 historical Douay margins.");
