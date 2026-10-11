import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const data = path => JSON.parse(readFileSync(new URL("../"+path, import.meta.url), "utf8"));
const root = data("data/geography/research/mass-1962-105-source-path-chant-index-20261011.v1.json");
const segments = ["a","b","c"].map(s => data("data/geography/research/mass-chant-source-index-segment-"+s+"-20261011.v1.json"));
const appSources = [
  ...data("data/mass/scripture-reading-witness-register.v1.json").celebrations,
  ...data("data/mass/scripture-feast-reading-supplement.v1.json").celebrations
];
const slots = ["INTROIT","GRADUAL","OFFERTORY","COMMUNION"];

assert.equal(root.schema,"MASS_1962_105_WITNESSED_PROPER_CHANT_SOURCE_INDEX_V1");
assert.equal(root.scope.parentRegistryCount,105);
assert.deepEqual(root.scope.properSlots,slots);
assert.equal(appSources.length,105);
assert.equal(new Set(appSources.map(x=>x.sourcePath)).size,105);
assert.equal(root.rows.length,420);
assert.deepEqual(segments.map(x=>x.records.length),[164,144,112]);
assert.equal(root.rows.length,segments.reduce((n,x)=>n+x.records.length,0));
assert.deepEqual(root.rows,segments.flatMap(s=>s.records).map(x=>({...x,knownAsProperPath:true,publicationGate:"CLOSED_SOURCE_EDITION_AND_SCRIPTURE_COLLATION_PENDING"})));

const keys = root.rows.map(r=>r.sourcePath+"|"+r.properSlot);
assert.equal(new Set(keys).size,420,"No duplicated source path+chant slot");
const sourceKeys = new Set(appSources.map(x=>x.sourcePath));
assert.ok(root.rows.every(r=>sourceKeys.has(r.sourcePath)),"No unrelated source paths");
for(const celebration of appSources) {
  const group=root.rows.filter(r=>r.sourcePath===celebration.sourcePath);
  assert.deepEqual(group.map(r=>r.properSlot),slots,"All four correct order for "+celebration.sourcePath);
}
assert.ok(root.rows.every(r=>r.sourceUrl==="https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/"+r.sourcePath+".txt"));
assert.ok(root.rows.every(r=>typeof r.latinIncipit==="string"||r.latinIncipit===null));
assert.ok(root.rows.every(r=>r.sourceBiblicalAnnotations.every(s=>s.length>0 && !s.startsWith("!"))));
assert.ok(root.rows.every(r=>r.sourceAlreadyInspected===true && !r.sourceFileError));
assert.ok(root.rows.every(r=>r.bibleVerseTextCertified===false && r.missal1962FacsimileCertified===false && r.publishable===false));
assert.ok(root.rows.every(r=>r.publicationGate==="CLOSED_SOURCE_EDITION_AND_SCRIPTURE_COLLATION_PENDING"));
assert.equal(root.stats.paths,105);
assert.equal(root.stats.rows,420);
assert.equal(root.stats.withAnnotations,364);
assert.equal(root.stats.unannotated,56);
assert.equal(root.stats.sourceAnnotationLines,536);
assert.equal(root.rows.filter(r=>r.sourceBiblicalAnnotations.length).length,364);
assert.equal(root.rows.reduce((n,r)=>n+r.sourceBiblicalAnnotations.length,0),536);
assert.equal(root.rows.filter(r=>r.inheritanceDirectives.length).length,42);
assert.equal(root.rows.filter(r=>r.sequenceMarkers.length).length,23);
assert.equal(root.sourceHolds.length,56);
assert.ok(root.sourceHolds.every(h=>root.rows.some(r=>r.sourcePath===h.sourcePath && r.properSlot===h.slot)));
assert.equal(root.abbreviationAudit.length,7);
assert.ok(root.abbreviationAudit.every(x=>x.recognizedCanonicalBook && x.status.includes("NOT_CERTIFIED")));
const reference = (path,slot,needle) => root.rows.some(r=>r.sourcePath===path && r.properSlot===slot && r.sourceBiblicalAnnotations.some(c=>c.includes(needle)));
assert.ok(reference("Tempora/Nat1-0","INTROIT","Sap 18"));
assert.ok(reference("Tempora/Pasc7-0","INTROIT","Sap 1"));
assert.ok(reference("Tempora/Pent01-4","OFFERTORY","Levit 21"));
assert.ok(reference("Tempora/Pent21-0","INTROIT","Esth 13"));
assert.ok(reference("Tempora/Pent22-0","OFFERTORY","Esth 14"));
assert.ok(reference("Tempora/Pent02-5","COMMUNION","Joannes 19"));
const hard = (path,slot) => root.rows.find(r=>r.sourcePath===path && r.properSlot===slot);
assert.equal(hard("Tempora/Quad6-4","INTROIT").sourceStatus,"SECTION_ABSENT");
assert.equal(hard("Sancti/03-25","INTROIT").sourceStatus,"INHERITED_SOURCE_REQUIRES_RESOLUTION");
assert.equal(hard("Sancti/02-02","INTROIT").parentSourceIfLocated.parentSourcePath,"Tempora/Pent08-0");
assert.ok(root.scope.missingChantFamilies.includes("TRACT"),"No false tract/alleluia completeness");
assert.ok(root.scope.inScopeOnly.includes("excludes non-witnessed feasts"),"105 must never be advertised as full 1962 Missal");
console.log("PASS: 105/105 app-witnessed Proper paths, 420 source chant slots; 364 annotated positions, 536 citation notes, 56 non-direct holds, 42 inheritances, 23 sequence markers. 0 publication certifications.");
