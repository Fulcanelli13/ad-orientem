import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 SOURCE_REFERENCE_PANEL_VERSION,sourceReferenceSafeUrl,
 sourceReferencePanelHtml,sourceReferencePanelCss
} from "../src/learn/source-reference-panel.js";

const data=JSON.parse(readFileSync("data/learn/mass-formation-campion.v1.json","utf8"));
const pilot=JSON.parse(readFileSync("data/reference/canonical-works-pilot.v1.json","utf8"));
assert.equal(SOURCE_REFERENCE_PANEL_VERSION,"source-reference-panel-v1");
assert.equal(pilot.state,"PARTIAL_FOUNDATION_NOT_GLOBAL_MIGRATION");
assert.equal(pilot.works.length,13);
const triage=JSON.parse(readFileSync("data/reference/source-witness-triage-pilot.v1.json","utf8"));
assert.equal(triage.sources.length,16);
assert.equal(new Set(triage.sources.map(x=>x.source_id)).size,16);
const massIDs=data.sources.map(x=>x.id);
assert.deepEqual(
 pilot.works.flatMap(x=>x.witness_ids).filter(id=>massIDs.includes(id)).sort(),
 massIDs.sort(),
 "Work identities must preserve every published Mass Formation source ID."
);
const allIds=pilot.works.flatMap(x=>x.witness_ids).sort();
assert.deepEqual(allIds,triage.sources.map(x=>x.source_id).sort(),
 "Every work witness must have exactly one pilot source triage record.");
assert.ok(triage.sources.every(x=>x.rights.includes("REVIEW_REQUIRED")),
 "No third-party edition may be silently approved for full-text embedding.");
assert.equal(triage.direct_link_exception.source_id,"SL-CIC83-992-997");

assert.match(sourceReferencePanelCss(),/focus-visible/);
assert.match(sourceReferencePanelCss(),/44px/);
assert.equal(sourceReferenceSafeUrl("javascript:alert(1)"),"");
assert.equal(sourceReferenceSafeUrl("http://example.org/book"),"");
assert.equal(sourceReferenceSafeUrl("https://editor:password@example.org/book"),"");
assert.equal(sourceReferenceSafeUrl("https://example.org/book"),"https://example.org/book");
const registry=Object.fromEntries(data.sources.map(s=>[s.id,s]));
let totalClaims=0,totalLinks=0;
for(const stage of data.stages){
 const rows=stage.claims.map(x=>({id:x.id,text:x.text.en,sourceIds:x.sources}));
 totalClaims+=rows.length;
 totalLinks+=rows.reduce((n,x)=>n+x.sourceIds.length,0);
 const featured=stage.claims.some(x=>x.sources.includes("SRC-MEDIATOR-DEI"))?["SRC-MEDIATOR-DEI"]:[];
 for(const french of [false,true]){
  const html=sourceReferencePanelHtml({
    rows:rows.map((x,i)=>({...x,text:french?stage.claims[i].text.fr:x.text})),
    registry,french, furtherReadingIds:[...featured,"SRC-OCONNELL-1962","NOT-CITED"],
    idPrefix:stage.id
  });
  assert.match(html,/<details class="aoReferencePanel"/);
  assert.equal((html.match(/data-ao-evidence-row=/g)||[]).length,rows.length);
  assert.equal((html.match(/data-ao-reference-id=/g)||[]).length,
   rows.reduce((n,x)=>n+x.sourceIds.length,0)+
   (featured.length+Number(stage.claims.some(x=>x.sources.includes("SRC-OCONNELL-1962")))),
   "Every evidence edge remains rendered, with only explicitly curated further links."
  );
  for(const row of rows)assert.ok(html.includes('data-ao-evidence-row="'+row.id+'"'),row.id+" lost");
  assert.ok(html.includes(french?"Justificatifs par paragraphe":"Evidence by paragraph"));
  assert.ok(!html.includes("NOT-CITED"),"Unrelated sources must not become further reading.");
  assert.ok(!html.includes("<script"),"Unsafe HTML should be escaped.");
 }
}
assert.equal(data.stages.length,8);
assert.equal(totalClaims,24);
assert.ok(totalLinks>=24);
const noSources=sourceReferencePanelHtml({rows:[{id:"HOLD",text:"Unverified <input>",sourceIds:["missing"]}],registry:{},furtherReadingIds:["missing"]});
assert.match(noSources,/data-ao-reference-hold="missing"/);
assert.match(noSources,/Unverified &lt;input&gt;/);
assert.equal((noSources.match(/<a /g)||[]).length,0);
assert.equal(sourceReferencePanelHtml({rows:[]}),"");

// Keep the source presentation change away from the native Missal, Simple and
// LIVE implementation and away from the unfinished 65-card reconciliation.
const massReader=readFileSync("src/learn/mass-formation.js","utf8");
assert.match(massReader,/sourceReferencePanelHtml/);
assert.match(massReader,/data-ao-mf-claim/);
assert.doesNotMatch(massReader,/class="aoMFSources"/,"Per-claim source chips still visible.");
const formation=readFileSync("src/learn/formation-research-preview.js","utf8");
assert.match(formation,/data-ao-fr-aggregated-sources/);
assert.match(formation,/captureEvidence\(p\.source_ids,kind/);
assert.match(formation,/formationResearchSourceLinks/,"Original documentary links and Scripture witness handoff lost.");
console.log("PASS reference display pilot: 8 published lessons and internal Formation preview; evidence untouched.");
