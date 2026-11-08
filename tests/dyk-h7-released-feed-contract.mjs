import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dykPublishedCandidates,dykPublishedPick,dykPublishedModel,dykPublishedMarkup,dykHistoricalCandidates,dykHistoricalModel,dykWeiser16Candidates,dykWeiser16Model,dykHomeRotationSlot,DYK_GLOSSARY_FALLBACK_IDS} from "../src/home/dyk-published-feed.js";
const original=JSON.parse(readFileSync(
 "data/research/did-you-know/dyk-r34-high-signal-24-editorial-selection.v1.json","utf8"));
import {HOME_DYK_GLOSSARY_IDS,HOME_DYK_GLOSSARY_FACTS,homeDidYouKnowSelect} from "../src/home/did-you-know-glossary.js";
const clone=x=>JSON.parse(JSON.stringify(x));

const history=JSON.parse(readFileSync(
 "data/did-you-know/weiser-historical-20-publication.v1.json","utf8"));
const histRows=dykHistoricalCandidates(history,"2026-11-08");
assert.equal(histRows.length,20,"All 20 historically scoped bilingual facts must pass release gates");
assert.equal(new Set(histRows.map(x=>x.id)).size,20);
assert.equal(new Set(histRows.map(x=>x.source_id)).size,20);
for(const row of histRows){
 assert.ok(row.pilot_home_copy.en.length>25&&row.pilot_home_copy.fr.length>25);
 assert.equal(row.historical_local_only,true);
 assert.equal(row.source.original_image_checked,true);
 assert.equal(row.semantic_novelty_reviewed,true);
 assert.equal(row.source.source_record_id,row.source_id);
 assert.ok(row.source.pdf_pages_1based.every(p=>Number.isInteger(p)&&p>0&&p<=384));
 const model=dykHistoricalModel(history,row.id,"2026-11-08","fr");
 assert.equal(model.fact,row.pilot_home_copy.fr);
 assert.ok(dykPublishedMarkup(model).includes("data-dyk-published"));
 assert.ok(dykPublishedMarkup(model).includes("#page="));
}
assert.deepEqual(dykHistoricalCandidates({...history,release_stage:"RESEARCH_ONLY"},"2026-11-08"),[]);
for(const property of ["editorial_approval","release_authorized","semantic_novelty_reviewed","historical_local_only"]){
 const tampered=clone(history);tampered.records[0][property]=false;
 assert.equal(dykHistoricalCandidates(tampered,"2026-11-08").length,19,
  "No publication when "+property+" is withheld");
}
for(const property of ["original_image_checked","deep_link_checked"]){
 const tampered=clone(history);tampered.records[0].source[property]=false;
 assert.equal(dykHistoricalCandidates(tampered,"2026-11-08").length,19,
  "No publication when "+property+" is withheld");
}
assert.equal(dykHistoricalCandidates(history,"2026-11-31").length,0);

const r50=JSON.parse(readFileSync(
 "data/did-you-know/weiser-r50-sixteen-publication.v1.json","utf8"));
const r50Rows=dykWeiser16Candidates(r50,"2026-11-08");
assert.equal(r50Rows.length,16,"All sixteen reviewed Weiser R50 facts must pass source gates");
assert.equal(new Set(r50Rows.map(x=>x.id)).size,16);
assert.equal(new Set(r50Rows.map(x=>x.source_id)).size,16);
assert.equal(new Set([...histRows,...r50Rows].map(x=>x.id)).size,36);
assert.equal(new Set([...histRows,...r50Rows].map(x=>x.source_id)).size,36,
 "No two released historical facts may claim the same original source record");
for(const row of r50Rows){
 assert.ok(row.pilot_home_copy.en.length>25&&row.pilot_home_copy.fr.length>25);
 assert.equal(row.source.original_image_checked,true);
 assert.equal(row.source.source_record_id,row.source_id);
 assert.equal(row.historical_local_only,true);
 assert.equal(row.source.pdf_pages_1based.length,row.source.printed_pages.length);
 assert.ok(row.source.printed_pages.every((p,i)=>row.source.pdf_pages_1based[i]===p+18));
 const model=dykWeiser16Model(r50,row.id,"2026-11-08","fr");
 assert.equal(model.fact,row.pilot_home_copy.fr);
 assert.ok(dykPublishedMarkup(model).includes("data-dyk-published"));
 assert.ok(dykPublishedMarkup(model).includes("#page="));
}
assert.deepEqual(dykWeiser16Candidates({...r50,release_stage:"RESEARCH_ONLY"},"2026-11-08"),[]);
assert.deepEqual(dykWeiser16Candidates(r50,"2026-11-31"),[]);
for(const [group,key] of [
 ["row","editorial_approval"],["row","release_authorized"],
 ["row","semantic_novelty_reviewed"],["row","historical_local_only"],
 ["copy","final_english_signoff"],["copy","final_french_signoff"],
 ["source","original_image_checked"],["source","deep_link_checked"]]){
 const damaged=clone(r50),row=damaged.records[0];
 if(group==="row")row[key]=false;
 else if(group==="copy")row.pilot_home_copy[key]=false;
 else row.source[key]=false;
 assert.equal(dykWeiser16Candidates(damaged,"2026-11-08").length,15,
  "Unapproved R50 record must be excluded: "+group+"."+key);
}
const wrongPage=clone(r50);wrongPage.records[0].source.pdf_pages_1based[0]++;
assert.equal(dykWeiser16Candidates(wrongPage,"2026-11-08").length,15,
 "Wrong original printed-page to PDF-page mapping must fail closed");


// Every new public teaser must resolve to an existing source-backed bilingual
// Glossary entry and must never silently expose draft research as public copy.
const gloss=JSON.parse(readFileSync("data/glossary/concepts-151-300.v1.json","utf8"));
assert.equal(HOME_DYK_GLOSSARY_IDS.length,24);
assert.equal(new Set(HOME_DYK_GLOSSARY_IDS).size,24);
assert.deepEqual(new Set(Object.keys(HOME_DYK_GLOSSARY_FACTS)),new Set(HOME_DYK_GLOSSARY_IDS));
for(const id of HOME_DYK_GLOSSARY_IDS){
 const source=gloss.entries.find(row=>row.id===id);
 assert.ok(source,"Missing canonical source "+id);
 assert.equal(source.status,"SOURCE_OWNER_LOCKED");
 assert.equal(source.definition_status,"SOURCE_BACKED");
 assert.ok(source.source_ids.length>0);
 assert.ok(HOME_DYK_GLOSSARY_FACTS[id].en.length>25);
 assert.ok(HOME_DYK_GLOSSARY_FACTS[id].fr.length>25);
 assert.equal(homeDidYouKnowSelect(gloss.entries,"2026-11-08",id)?.id,id);
}

for(const date of ["2026-11-01","2026-11-02","2026-12-25","2027-04-04"]){
 assert.deepEqual(dykPublishedCandidates(original,date),[],"Unapproved R34 must never publish");
 assert.equal(dykPublishedPick(original,date),null);
}
assert.deepEqual(dykPublishedCandidates({}, "2026-11-02"),[]);
assert.deepEqual(dykPublishedCandidates(original, "2026-11-31"),[]);
const data=clone(original),row=data.records.find(x=>x.id==="DYK-UM02-014");
data.publication_stage="APPROVED_PARTIAL_LIVE";
row.publication_days=["2026-11-02"];
row.editorial_approval=true;row.release_authorized=true;
row.pilot_home_copy.final_english_signoff=true;
row.pilot_home_copy.final_french_signoff=true;
row.priority_lexical_screen.manual_semantic_novelty_approved=true;
row.pilot_destination_audit.publishable_deep_link=true;
row.pilot_destination_audit.exact_in_app_route_verified=true;
row.pilot_source_folio.link_browser_verified=true;
assert.equal(dykPublishedCandidates(data,"2026-11-02").length,1,
  "All gates together, including exact date, can publish one fact");
assert.equal(dykPublishedCandidates(data,"2026-11-01").length,0,
  "A November 2-only custom must not be treated as an undated rotation");
const model=dykPublishedModel(data,row.id,"2026-11-02","fr");
assert.equal(model.fact,row.pilot_home_copy.fr);
assert.equal(model.links[0].page,331);
assert.ok(dykPublishedMarkup(model).includes("data-dyk-published"));
assert.ok(dykPublishedMarkup(model).includes("#page=331"));
assert.equal(dykPublishedMarkup({...model,sourceUrl:"javascript:alert(1)"}),"");
for(const path of [
 ["publication_stage","MISSING"],["editorial_approval",false],
 ["release_authorized",false],["pilot_home_copy.final_english_signoff",false],
 ["pilot_home_copy.final_french_signoff",false],
 ["priority_lexical_screen.manual_semantic_novelty_approved",false],
 ["pilot_destination_audit.publishable_deep_link",false],
 ["pilot_destination_audit.exact_in_app_route_verified",false],
 ["pilot_source_folio.link_browser_verified",false],
 ["publication_days",[]]]){
 const broken=clone(data);let target=broken;
 const key=path[0].split(".");
 if(path[0]!=="publication_stage")target=broken.records.find(x=>x.id===row.id);
 for(const part of key.slice(0,-1))target=target[part];
 target[key.at(-1)]=path[1];
 assert.equal(dykPublishedCandidates(broken,"2026-11-02").length,0,
   "Must fail closed when "+path[0]+" is missing or false");
}
const tampered=clone(data);
tampered.records.find(x=>x.id===row.id).pilot_source_folio.url="javascript:alert(1)";
assert.deepEqual(dykPublishedCandidates(tampered,"2026-11-02"),[]);
const item=clone(original);
assert.equal(item.records.filter(x=>x.release_authorized===true).length,0,
 "Read-only source master must not be silently promoted by the selector");

// With no new approved facts the fallback itself receives a fair, non-repeating
// daily shuffle. The mixed pool must rotate once through every entry per cycle.
function alignedDates(size,cycles=1){
 const today=Math.floor(Date.UTC(2026,10,8)/86400000);
 const start=today-(today%size);
 return Array.from({length:size*cycles},(_,i)=>
   new Date((start+i)*86400000).toISOString().slice(0,10));
}
for(const [published,poolSize] of [
 [[],DYK_GLOSSARY_FALLBACK_IDS.length],
 [histRows.map(x=>x.id),DYK_GLOSSARY_FALLBACK_IDS.length+20],
 [[...histRows,...r50Rows].map(x=>x.id),DYK_GLOSSARY_FALLBACK_IDS.length+36],
 [["DYK-M04-CANON-021","DYK-M04-CANON-022","DYK-M04-CANON-047","DYK-M04-CANON-058"],DYK_GLOSSARY_FALLBACK_IDS.length+4]
]){
 const cycle=alignedDates(poolSize);
 const results=cycle.map(date=>dykHomeRotationSlot(date,published));
 assert.equal(new Set(results).size,poolSize,"No repeat before all eligible slots shown");
 assert.deepEqual(new Set(results),new Set([...published,...DYK_GLOSSARY_FALLBACK_IDS]));
 const nextCycle=alignedDates(poolSize,2).slice(poolSize).map(date=>dykHomeRotationSlot(date,published));
 assert.equal(new Set(nextCycle).size,poolSize,"Every slot gets one turn in each complete cycle");
 assert.notEqual(results.at(-1),nextCycle[0],"No immediate cycle-boundary repeat");
}
assert.equal(dykHomeRotationSlot("2026-11-31",[]),null);
assert.equal(dykHomeRotationSlot("2026-11-08",[],[]),null);
// The compiled 24-item R34 review selection is not a permanent six/24-item
// release ceiling. Adding staged *unapproved* rows cannot affect publication.
const expanded=clone(data);
expanded.records.push({id:"DYK-UNRELEASED-PLACEHOLDER",editorial_approval:false,release_authorized:false});
assert.equal(dykPublishedCandidates(expanded,"2026-11-02").length,1);

console.log("PASS H7 60-fact Discovery: 24 Glossary + 36 independently released historical, original R34 held, bilingual original-page links and nonrepeating rotation");
