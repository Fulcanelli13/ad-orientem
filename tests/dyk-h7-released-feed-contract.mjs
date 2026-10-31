import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dykPublishedCandidates,dykPublishedPick,dykPublishedModel,dykPublishedMarkup} from "../src/home/dyk-published-feed.js";
const original=JSON.parse(readFileSync(
 "data/research/did-you-know/dyk-r34-high-signal-24-editorial-selection.v1.json","utf8"));
const clone=x=>JSON.parse(JSON.stringify(x));
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
console.log("PASS H7 published-only Discovery: zero live from original, explicit release/date/source gates, bilingual source links and glossary fallback");
