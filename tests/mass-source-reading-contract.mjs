import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {massSourceStudyRecord,massSourceStudyHtml,massSourceStudyCss} from "../src/learn/mass-source-reading.js";
import {sourceReferencePanelHtml} from "../src/learn/source-reference-panel.js";
import {releasedMassFormationPassages} from "../src/learn/mass-passage-publication.js";
const formation=JSON.parse(readFileSync(new URL("../data/learn/mass-formation-campion.v1.json",import.meta.url),"utf8"));
const stage=formation.stages.find(x=>x.id==="MF03");
const primary=massSourceStudyRecord(formation,"MF03","SRC-MEDIATOR-DEI");
assert.equal(primary.stageId,"MF03");
assert.equal(primary.sourceId,"SRC-MEDIATOR-DEI");
assert.equal(primary.sourceTitle,"Pius XII — Mediator Dei");
assert.equal(primary.canonicalUrl,"https://www.vatican.va/content/pius-xii/en/encyclicals/documents/hf_p-xii_enc_20111947_mediator-dei.html");
assert.deepEqual(primary.claims.map(x=>x.id),["MF03-C02","MF03-C03"],
  "Existing Mediator Dei relation must include both linked original course claims");
const en=massSourceStudyHtml(primary);
const fr=massSourceStudyHtml(primary,{french:true});
for(const html of [en,fr]){
 assert.match(html,/data-ao-mf-source-reader="SRC-MEDIATOR-DEI"/);
 assert.match(html,/data-ao-mf-source-claim="MF03-C02"/);
 assert.match(html,/data-ao-mf-source-claim="MF03-C03"/);
 assert.doesNotMatch(html,/data-ao-mf-source-claim="MF03-C01"/,
   "Unrelated 1962 Missal-only lesson claim must not be incorrectly attributed to encyclical");
 assert.match(html,/target="_blank" rel="noopener noreferrer"/);
 assert.doesNotMatch(html,/data-ao-mx-open-mass|data-ao-r17|AO\.LIVE\./,
   "Source study must not offer a ritual action");
}
assert.match(en,/not quotations or verified passages/);
assert.match(en,/<details class="aoMFSourceLimitations">/);
assert.match(en,/Lesson commentary · not original quotations/);
assert.ok(en.indexOf("aoMFSourceMetaSummary")<en.indexOf("aoMFSourceClaimList"),
  "Source identity should be compact and placed ahead of the lesson claims");
assert.match(en,/Papal encyclical/);
assert.match(fr,/non des citations ou des passages vérifiés/);
assert.match(fr,/Encyclique pontificale/);
assert.match(fr,/À l’Orate|Pie XII enseigne/);
assert.equal(massSourceStudyRecord(formation,"MF03","SRC-OCONNELL-1962"),null,
  "A globally listed but uncited work cannot become an arbitrary Offertory reference");
assert.equal(massSourceStudyRecord(formation,"MF09","SRC-MEDIATOR-DEI"),null);
assert.equal(massSourceStudyRecord(formation,"MF03","UNKNOWN"),null);
const campion=massSourceStudyRecord(formation,"MF03","SRC-CAMPION-1954");
assert.deepEqual(campion.claims.map(x=>x.id),["MF03-C03"]);
const missal=massSourceStudyRecord(formation,"MF03","SRC-MR62");
assert.deepEqual(missal.claims.map(x=>x.id),["MF03-C01"]);
const corpus=Object.fromEntries(formation.sources.map(x=>[x.id,x]));
const rows=stage.claims.map(c=>({id:c.id,text:c.text.en,sourceIds:c.sources}));
const withStudy=sourceReferencePanelHtml({rows,registry:corpus,idPrefix:"MF03",enableStudySource:true});
const defaultPanel=sourceReferencePanelHtml({rows,registry:corpus,idPrefix:"MF03"});
assert.equal((withStudy.match(/data-ao-reference-study-source="/g)||[]).length,3,
 "Exactly three cited sources should have reader controls");
assert.doesNotMatch(withStudy,/data-ao-reference-study-source="SRC-OCONNELL-1962"/);
assert.doesNotMatch(defaultPanel,/data-ao-reference-study-source="/,
 "Shared source readers outside Mass Formation must not change");
assert.equal((withStudy.match(/data-ao-reference-id="/g)||[]).length,
 (defaultPanel.match(/data-ao-reference-id="/g)||[]).length,
 "Original outbound citations and all claim-level documentary edges must be preserved");
assert.match(massSourceStudyCss(),/\.aoMFSourceReading/);
let covered=0;
for(const stage of formation.stages){
 const sourceIds=[...new Set(stage.claims.flatMap(claim=>claim.sources))];
 const evidenceRows=stage.claims.map(c=>({id:c.id,text:c.text.en,sourceIds:c.sources}));
 const panel=sourceReferencePanelHtml({
   rows:evidenceRows,registry:corpus,enableStudySource:true,idPrefix:stage.id
 });
 assert.equal((panel.match(/data-ao-reference-study-source="/g)||[]).length,sourceIds.length,
   stage.id+" source context must be offered for each originally cited source");
 for(const sourceId of sourceIds){
  const record=massSourceStudyRecord(formation,stage.id,sourceId);
  const expected=stage.claims.filter(claim=>claim.sources.includes(sourceId)).map(x=>x.id);
  assert.deepEqual(record?.claims.map(x=>x.id),expected,
   stage.id+" changed source-to-claim ownership for "+sourceId);
  for(const language of [false,true]){
   const html=massSourceStudyHtml(record,{french:language});
   assert.equal((html.match(/data-ao-mf-source-original="/g)||[]).length,
     record.canonicalUrl?1:0,"Document link appears multiple times");
   assert.ok(html.includes("aoMFSourceAccess"),"Original link must be accessible before the long source claim list");
   assert.ok(html.indexOf("aoMFSourceAccess")<html.indexOf("aoMFSourceClaimList"),
     "Original link is unnecessarily buried below the lesson claims");
   for(const claimId of expected)assert.ok(html.includes('data-ao-mf-source-claim="'+claimId+'"'));
  }
  covered++;
 }
}
assert.equal(covered,23,"All 23 existing stage-source associations should be represented, with no new relationships");
// This shipped manifest has NO released historical texts. P0 research has
// not made any textual or reproduction-rights decisions for public output.
const heldManifest=JSON.parse(readFileSync(
 new URL("../data/learn/mass-formation-approved-passages.v1.json",import.meta.url),"utf8"));
assert.equal(heldManifest.status,"NO_APPROVED_PASSAGES");
assert.equal(heldManifest.entries.length,0);
assert.equal(releasedMassFormationPassages(heldManifest,formation).length,0);
assert.doesNotMatch(massSourceStudyHtml(massSourceStudyRecord(formation,"MF03","SRC-MEDIATOR-DEI",
 {passageManifest:heldManifest})),/data-ao-mf-approved-extract=/);

// Only synthetic test fixture text is introduced here; it is not historical
// prose and is NEVER placed in the source or public release data registry.
const synthetic={
 id:"AO.FORM.PASSAGE.0001",source_id:"SRC-MEDIATOR-DEI",
 stage_id:"MF03",claim_ids:["MF03-C02"],language:"en",
 exact_text:"SYNTHETIC FIXTURE <not a historical quotation> & test",
 locus:"TEST § 1",edition:"Test edition — not a real source",
 edition_url:"https://example.test/fake-edition",
 rights_basis:"PERMISSION_GRANTED",rights_evidence_url:"https://example.test/fake-permission",
 review_status:"APPROVED_FOR_PUBLICATION",reviewed_by:"Automated acceptance fixture",
 reviewed_on:"2026-10-16",use:"FORMATION_ONLY"
};
const approved={schema:"ao-formation-approved-passages-v1",scope:"FORMATION_ONLY",
 status:"RELEASED_FOR_FORMATION",release_id:"AO-P1-FORMATION-2026-10-16-TEST",
 reviewed_by:"Automated acceptance fixture",approved_on:"2026-10-16",entries:[synthetic]};
assert.equal(releasedMassFormationPassages(approved,formation).length,1);
const mockPublished=massSourceStudyRecord(formation,"MF03","SRC-MEDIATOR-DEI",
 {passageManifest:approved});
const mockHtml=massSourceStudyHtml(mockPublished);
assert.match(mockHtml,/data-ao-mf-approved-extract="AO.FORM.PASSAGE.0001"/);
assert.match(mockHtml,/SYNTHETIC FIXTURE &lt;not a historical quotation&gt; &amp; test/);
assert.doesNotMatch(mockHtml,/<not a historical quotation>/);
assert.equal((mockHtml.match(/data-ao-mf-source-original=/g)||[]).length,1);
assert.match(mockHtml,/target="_blank" rel="noopener noreferrer"/);
assert.equal(massSourceStudyRecord(formation,"MF03","SRC-MR62",
 {passageManifest:approved})?.passages.length,0);

function denied(modifier,label){
 const copy=JSON.parse(JSON.stringify(approved));
 modifier(copy);
 assert.deepEqual(releasedMassFormationPassages(copy,formation),[],label);
 assert.equal(massSourceStudyRecord(formation,"MF03","SRC-MEDIATOR-DEI",
  {passageManifest:copy})?.passages.length,0,label+" must render NO text");
}
denied(x=>{x.status="DRAFT"},"draft not a release");
denied(x=>{x.release_id=null},"missing release identifier");
denied(x=>{x.scope="RITUAL_MASS"},"research crossing into ritual reader");
denied(x=>{x.approved_on=null},"missing editorial approval date");
denied(x=>{x.reviewed_by=""},"missing editorial owner");
denied(x=>{x.entries[0].review_status="IN_RESEARCH"},"uncertified excerpt");
denied(x=>{x.entries[0].claim_ids=["MF03-C01"]},"wrong supporting claim");
denied(x=>{x.entries[0].stage_id="MF04"},"unsupported claim of another lesson");
denied(x=>{x.entries[0].source_id="SRC-MR62"},"source association mismatch");
denied(x=>{x.entries[0].edition_url="javascript:alert(1)"},"unsafe original edition URL");
denied(x=>{x.entries[0].rights_evidence_url=""},"undocumented reproduction rights");
denied(x=>{x.entries[0].rights_basis="UNKNOWN"},"uncertified rights category");
denied(x=>{x.entries[0].exact_text=""},"no actual source passage");
denied(x=>{x.entries=[synthetic,synthetic]},"duplicate excerpt ID");
denied(x=>{x.entries[0].use="FORMATION_AND_MASS"},"liturgical reader scope forbidden");
console.log("PASS source-study context: source metadata, explicit claim provenance, all 23 course source associations, safe original, bilingual, release-gated excerpts only or source relationship");
