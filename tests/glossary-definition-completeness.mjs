import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const parts=[
  JSON.parse(readFileSync("data/glossary/concepts-001-150.v1.json","utf8")),
  JSON.parse(readFileSync("data/glossary/concepts-151-300.v1.json","utf8")),
  JSON.parse(readFileSync("data/glossary/concepts-301-450.v1.json","utf8")),
];
const entries=parts.flatMap(x=>x.entries);
assert.equal(entries.length,450);
for(const e of entries){
  assert.equal(e.definition_status,"SOURCE_BACKED",e.id+" definition not source-backed");
  assert.ok(e.short_definition?.en?.trim(),e.id+" missing EN short definition");
  assert.ok(e.short_definition?.fr?.trim(),e.id+" missing FR short definition");
  assert.ok(e.explanation?.en?.trim(),e.id+" missing EN explanation");
  assert.ok(e.explanation?.fr?.trim(),e.id+" missing FR explanation");
  assert.ok(e.definition_source_ids?.length,e.id+" missing definition source ids");
  for(const id of e.definition_source_ids)assert.ok(e.source_ids.includes(id),e.id+" definition source is not in owner source_ids: "+id);
  assert.ok(!/text pending|à venir|to be populated/i.test(e.short_definition.en+" "+e.short_definition.fr+" "+e.explanation.en+" "+e.explanation.fr),e.id+" contains placeholder copy");
}
console.log("Glossary definition completeness: 450/450 EN/FR entries are source-backed.");
