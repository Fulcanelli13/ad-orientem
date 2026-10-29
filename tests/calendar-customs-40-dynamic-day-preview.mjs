import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {v384Dates} from "../src/calendar/traditional-year-v384.js";
import {
 calendarStagedPublishedCustomVariantsOnDate,
 calendarStagedCustomsFullDayContextPreview,
 CUSTOMS_RESEARCH_VARIANT_ANCHORS
} from "../src/calendar/customs-research-preview.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const variants=read("data/customs/master/customs-22-existing-owner-bilingual-variants-20261029.v1.json");
const unpublished=read("data/calendar/customs-18-bilingual-staged-context-20261029.v1.json");
const src=read("data/customs/master/customs-all408-consolidated-editorial-decision-ledger-20261029.v1.json");
const ids=new Set(src.records.map(r=>r.provisional_group_id));
assert.equal(variants.records.length,22);
assert.equal(unpublished.records.length,18);
assert.equal(new Set(variants.records.map(r=>r.variant_id)).size,22);
assert.equal(CUSTOMS_RESEARCH_VARIANT_ANCHORS.length,16);
for(const r of variants.records){
 assert.ok(ids.has(r.source_group_id));
 assert.ok(CUSTOMS_RESEARCH_VARIANT_ANCHORS.includes(r.calendar.anchor_key));
 assert.equal(r.presentation.variant_not_extra_card,true);
 assert.equal(r.editorial.publication_authorized,false);
}
const day=(d,opts)=>calendarStagedPublishedCustomVariantsOnDate(d,variants,opts);
const all=(d,opts)=>calendarStagedCustomsFullDayContextPreview(d,unpublished,variants,opts);
const contains=(d,id)=>day(d).some(x=>x.variant_id===id);
const exact=(d,id)=>day(d).find(x=>x.variant_id===id);
const x26=v384Dates(2026),x27=v384Dates(2027);
assert.equal(x26.easter,"2026-04-05");
assert.equal(x26.pentecost,"2026-05-24");
assert.equal(x26.corpus,"2026-06-04");
assert.equal(contains("2026-03-29","AO-CUST-VAR-005"),true);
assert.equal(contains("2026-03-29","AO-CUST-VAR-006"),true);
assert.equal(contains("2026-04-04","AO-CUST-VAR-007"),true);
assert.equal(contains("2026-04-06","AO-CUST-VAR-008"),true);
assert.equal(contains("2026-06-04","AO-CUST-VAR-010"),true);
assert.equal(contains("2026-06-04","AO-CUST-VAR-011"),true);
assert.equal(contains("2026-06-04","AO-CUST-VAR-012"),true);
assert.equal(contains("2026-07-26","AO-CUST-VAR-022"),true);
assert.equal(contains("2026-08-15","AO-CUST-VAR-016"),true);
assert.equal(contains("2026-11-01","AO-CUST-VAR-017"),true);
assert.equal(contains("2026-11-02","AO-CUST-VAR-019"),true);
assert.equal(contains("2026-11-02","AO-CUST-VAR-020"),true);
assert.equal(contains("2026-12-27","AO-CUST-VAR-004"),true);
assert.equal(contains("2026-11-29","AO-CUST-VAR-003"),true);
assert.equal(contains("2026-12-06","AO-CUST-VAR-003"),true);
assert.equal(contains("2026-12-13","AO-CUST-VAR-003"),true);
assert.equal(contains("2026-12-20","AO-CUST-VAR-003"),true);
assert.equal(contains("2026-12-27","AO-CUST-VAR-003"),false);
assert.equal(contains("2026-12-07","AO-CUST-VAR-001"),true);
assert.equal(contains("2026-12-08","AO-CUST-VAR-001"),false);
assert.equal(contains(x26.emberAdvent[0],"AO-CUST-VAR-002"),true);
assert.equal(contains(x27.emberPent[2],"AO-CUST-VAR-002"),true);
assert.equal(contains(x27.palm,"AO-CUST-VAR-005"),true);
assert.equal(contains(x27.corpus,"AO-CUST-VAR-010"),true);
assert.equal(day("2026-11-02").some(x=>x.variant_id==="AO-CUST-VAR-015"),false,"unknown real shrine anniversary is not fabricated");
assert.equal(day("2026-08-15").some(x=>x.variant_id==="AO-CUST-VAR-013"),false,"local patronal date unknown");
assert.equal(day("2026-07-26").some(x=>x.variant_id==="AO-CUST-VAR-014"),false,"individual patron name day unknown");
assert.equal(day("2026-04-05").some(x=>x.variant_id==="AO-CUST-VAR-009"),false,"general Easter preparation does not get invented exact date");
const en=exact("2026-06-04","AO-CUST-VAR-010");
const fr=day("2026-06-04",{fr:true}).find(x=>x.variant_id==="AO-CUST-VAR-010");
assert.ok(en);assert.ok(fr);
assert.notEqual(en.title,fr.title);
assert.equal(en.calendar_context_date,"2026-06-04");
assert.equal(en.parent_custom_id,"CORP-001");
assert.equal(en.source_reference.url,"https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf");
assert.equal(en.source_scope_region_required,true);
assert.equal(en.occurrence_is_only_historical_context,true);
assert.equal(en.may_appear_in_live_calendar,false);
assert.equal(en.local_event_confirmed,false);
assert.equal(en.name_day_person_match_assumed,false);
assert.deepEqual(en.linked_indulgence_claims,[]);
assert.equal(en.is_new_custom_card,false);
assert.equal(en.publication_state,"RESEARCH_VARIANT_DETAIL_NOT_PUBLISHED");
assert.equal(all("2026-12-24").filter(x=>x.preview_class==="UNPUBLISHED_HOUSEHOLD_CONTEXT").length,4);
assert.equal(all("2026-06-04").filter(x=>x.preview_class==="PUBLISHED_PARENT_RESEARCH_VARIANT").length,3);
assert.ok(all("2026-06-04").every(x=>x.may_appear_in_live_calendar===false));
assert.equal(all("2026-06-23").filter(x=>x.custom_id==="CANDIDATE-STJOHN-BONFIRE").length,0,"No unannounced St John bonfire");
assert.equal(all("2026-08-14").filter(x=>x.custom_id==="CUST-ASSUMPTION-TIVOLI-INCHINATA").length,0,"No unconfirmed Tivoli procession");
const union=new Set();
for(let y=2026;y<=2027;y++){
 for(let m=1;m<=12;m++){
  const last=new Date(y,m,0).getDate();
  for(let d=1;d<=last;d++){
   const iso=[y,String(m).padStart(2,"0"),String(d).padStart(2,"0")].join("-");
   for(const row of day(iso)){
    union.add(row.variant_id);
    assert.equal(row.may_appear_in_live_calendar,false);
    assert.equal(row.is_new_custom_card,false);
    assert.equal(row.date_approved,false);
    assert.equal(row.indulgence_associated,false);
   }
  }
 }
}
const noExact=new Set(["AO-CUST-VAR-009","AO-CUST-VAR-013","AO-CUST-VAR-014","AO-CUST-VAR-015"]);
assert.deepEqual(new Set(variants.records.filter(r=>!union.has(r.variant_id)).map(r=>r.variant_id)),noExact);
assert.throws(()=>day("2026-02-30"),TypeError);
assert.throws(()=>calendarStagedPublishedCustomVariantsOnDate("2026-04-05",{records:variants.records.slice(0,21)}),TypeError);

const preview=readFileSync(new URL("../docs/CUSTOMS_CALENDAR_40_BILINGUAL_CONTENT_PREVIEW_20261029.html",import.meta.url),"utf8");
const indexMatch=preview.match(/const DAY_INDEX=(\{[^\n]+\});/);
assert.ok(indexMatch,"Offline bilingual Calendar preview must embed its actual 2026/2027 day index");
const dayIndex=JSON.parse(indexMatch[1]);
const content=read("data/customs/master/customs-calendar-bilingual-content-40-20261029.v1.json").records;
const idByVariantSource=new Map(content.filter(x=>x.type==="EXISTING_OWNER_VARIANT_DETAIL").map(x=>[x.source_registry_id,x.entry_id]));
const idByCandidate=new Map(content.filter(x=>x.type==="EXISTING_UNPUBLISHED_BILINGUAL_PROFILE").map(x=>[x.custom_id,x.entry_id]));
const sourceByVariant=new Map(variants.records.map(x=>[x.variant_id,x.source_group_id]));
assert.equal(content.length,40);
assert.equal(new Set(content.map(x=>x.entry_id)).size,40);
assert.match(preview,/id="day"/);
assert.match(preview,/id="clearDay"/);
assert.match(preview,/Historical date context only; not a live event/);
assert.match(preview,/Contexte historique uniquement/);
assert.equal(Object.keys(dayIndex).length,159);
for(let y=2026;y<=2027;y++){
 for(let m=1;m<=12;m++){
  const last=new Date(y,m,0).getDate();
  for(let d=1;d<=last;d++){
   const isoDate=[y,String(m).padStart(2,"0"),String(d).padStart(2,"0")].join("-");
   const expected=all(isoDate).map(r=>{
    if(r.preview_class==="PUBLISHED_PARENT_RESEARCH_VARIANT"){
     const sourceId=sourceByVariant.get(r.variant_id);
     assert.ok(sourceId);
     return idByVariantSource.get(sourceId);
    }
    assert.equal(r.preview_class,"UNPUBLISHED_HOUSEHOLD_CONTEXT");
    return idByCandidate.get(r.custom_id);
   });
   const got=dayIndex[isoDate]||[];
   assert.deepEqual(got,expected,"Offline 40-item Calendar view disagrees with real 1962 preview on "+isoDate);
  }
 }
}
assert.deepEqual(dayIndex["2026-12-24"].length,4);
assert.equal((dayIndex["2026-06-23"]||[]).some(id=>idByCandidate.get("CANDIDATE-STJOHN-BONFIRE")===id),false);
assert.ok(!preview.includes("Current parish event confirmed"));
console.log("PASS: Existing 40-item EN/FR preview date filter matches native 1962 Calendar research functions on all 730 dates of 2026/2027.");

console.log("PASS: all 22 published-owner source variants retain original parent, region, source, liturgy and nonrelease safeguards.");
console.log("PASS: 2026–27 date-aware calendar research preview covers 18 fixed/movable/weekday/Ember variants; four local or season-only variants stay undated.");
console.log("PASS: 18 unpublished profile contexts remain previews, no local event, indulgence, feast override, or new published Customs.");
