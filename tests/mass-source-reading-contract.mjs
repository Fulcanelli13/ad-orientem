import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {massSourceStudyRecord,massSourceStudyHtml,massSourceStudyCss} from "../src/learn/mass-source-reading.js";
import {sourceReferencePanelHtml} from "../src/learn/source-reference-panel.js";
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
console.log("PASS source-study context: source metadata, explicit claim provenance, safe external original, bilingual, no invented excerpt or source relationship");
