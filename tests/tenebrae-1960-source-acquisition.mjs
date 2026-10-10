import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const registry=JSON.parse(readFileSync(new URL("../data/pray/tenebrae-source-registry.v1.json",import.meta.url),"utf8"));
assert.equal(registry.schema,"ao.pray.tenebrae.1960-acquisition.v1");
assert.equal(registry.status,"SIX_SOURCE_DERIVED_HOURS_ROUTED_PRINT_EDITION_UNCOLLATED");
assert.equal(registry.source.commit,"b9f8c8eb15d52b2b2c02e2ca24807cfaa73758f0");
assert.equal(registry.publicationStatus,"RESEARCH_SOURCE_FREEZE_ONLY");
assert.equal(registry.dates.length,3);
assert.equal(registry.progress.rawProperFilesPreserved,9);
assert.equal(registry.progress.assembliesReady,6);
assert.equal(registry.progress.psalterSourceLeavesPreserved,111);
assert.equal(registry.progress.independentPrintedBreviaryCertifiedHours,0);
assert.equal(registry.progress.readerRoutesPublished,1);
assert.equal(registry.assemblyHold.excluded.includes("full daily Divine Office"),true);
assert.equal(registry.assemblyHold.excluded.includes("simulated universal 1962 evening Tenebrae"),true);
const rights=readFileSync(new URL("../data/pray/tenebrae-1960-source/LICENSE",import.meta.url),"utf8");
assert.match(rights,/Copyright \(c\) 2026 Divinum Officium/);
assert.match(rights,/Permission is hereby granted/);
let sections=0, unresolved=0;
for(const [dayIndex,day] of registry.dates.entries()){
 assert.equal(day.relativeToEasterDays,dayIndex-3);
 assert.deepEqual(day.offices,["MATINS","LAUDS"]);
 for(const locale of ["la","en","fr"]){
  const file=day.files[locale];
  const raw=readFileSync(new URL("../"+file,import.meta.url),"utf8");
  assert.ok(raw.length>10000,file+" too short");
  for(let n=1;n<=9;n++){
   assert.match(raw,new RegExp("^\\[Lectio"+n+"\\]","m"),file+" missing Lesson "+n);
   assert.match(raw,new RegExp("^\\[Responsory"+n+"\\]","m"),file+" missing responsory "+n);
   sections+=2;
  }
  assert.match(raw,/^\[Ant Matutinum\]/m,file+" missing Matins antiphons");
  assert.match(raw,/^\[Ant Laudes\]/m,file+" missing Lauds antiphons");
  // A source 'proper' is not a complete office. Preserve explicit unresolved
  // cross-references and version conditions for later native assembly.
  unresolved+=(raw.match(/^@/gm)||[]).length;
 }
}
assert.ok(unresolved>3,"Unexpected disappearance of source cross-references; re-audit edition");
assert.equal(sections,162);
console.log("Tenebrae 1960 source acquisition: PASS — 9 licensed Latin/English/French original leaves, 27 lessons + 27 responsories across 3 locales, 6 source-derived assembled offices with 0 false printed certifications.");
