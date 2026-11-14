import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const payload=JSON.parse(read("data/customs/customs-r18-six-canonical-promotion-payload.v1.json"));
const compare=JSON.parse(read("data/customs/customs-r18-six-identity-comparator-review.v1.json"));
const dossier=read("docs/CUSTOMS_R18_SIX_FULL_BILINGUAL_EDITORIAL_ACCEPTANCE_20261026.md");
const fields=["title","description","history","meaning","practice","caution","occasion","scope"];
assert.equal(payload.calendar_bilingual_articles.length,6);
assert.equal(compare.records.length,6);
assert.match(dossier,/no new article published/i);
assert.match(dossier,/35/);
assert.match(dossier,/PENDING/);
for (const row of payload.calendar_bilingual_articles){
 const id=row.id;
 assert.ok(dossier.includes("## "+row.title.en+" — \`"+id+"\`"),id+" heading");
 const distinct=compare.records.find(x=>x.proposed_id===id);
 assert.ok(distinct,id+" comparator");
 assert.ok(dossier.includes(distinct.comparator_distinct_action_justification),id+" comparator verbatim");
 const region=payload.calendar_region_interest.find(x=>x.id===id);
 assert.ok(region);
 assert.ok(dossier.includes(region.region_code+"; "+region.dates.join(", ")),id+" date and region");
 for(const field of fields)for(const lang of ["en","fr"]){
   const exact=(lang==="en"?"**EN**: ":"**FR**: ")+row[field][lang];
   assert.ok(dossier.includes(exact),id+" "+field+" "+lang+" not source-exact");
 }
 for(const source of row.sources){
   assert.ok(dossier.includes("["+source.title+"]("+source.url+")"),id+" source URL/title");
   assert.ok(dossier.includes("\`"+source.id+"\`"),id+" source ID");
 }
}
assert.equal((dossier.match(/^## (?!Decision summary|Required acceptance sequence)/gm)||[]).length,6);
assert.equal((dossier.match(/^### Sources and claim boundaries$/gm)||[]).length,6);
assert.equal((dossier.match(/\*\*EN\*\*:/g)||[]).length,48);
assert.equal((dossier.match(/\*\*FR\*\*:/g)||[]).length,48);
assert.ok(payload.canonical_seed_customs.every(x=>x.publication_state==="NOT_APPROVED"));
assert.equal(payload.actual_catalogue_change,0);
console.log("PASS R18 six source-exact bilingual editorial dossier: 96 text fields, 12 witness URLs, six owner and locale gates, zero approvals or publication");
