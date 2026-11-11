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
// User-facing definitions must explain Catholic, liturgical or historical terms;
// notes addressed to the application's editors or classification machinery belong
// in internal governance files, not in the reader's glossary.
const internalMeta=/\b(?:the app|the application|the glossary|this glossary|in Ad Orientem|the directory|directory data|the UI|user.interface mode|project taxonomy|project data type|the lexical entry|this entry exists|should link to|must link to|search must|the app must)\b|(?:l’application|le glossaire|dans Ad Orientem|l’annuaire|l’entrée lexicale|taxonomie de projet|type de donnée du projet|la recherche doit|l’application doit)/iu;
for(const entry of entries){
 for(const field of ["short_definition","explanation"]){
  for(const language of ["en","fr"]){
   const content=entry[field]?.[language]||"";
   assert.doesNotMatch(content,internalMeta,
    entry.id+" "+field+"/"+language+" contains internal implementation commentary");
  }
 }
}
// The published definitions use term names, not internal G-IDs, UI instructions,
// editorial directives or implementation-layer terminology.
const residualEditorial=/\bG\d{3}\b|\b(?:phrase layer|gesture registry|search may|the canonical objects|source-backed|editorial note|should be presented|should be taught|current descriptions should|translation must preserve)\b|(?:couche des phrases|registre des gestes|objets canoniques|doivent être présentés|doit être enseigné|doivent être exposés)/iu;
for(const entry of entries){
 for(const field of ["short_definition","explanation"]){
  for(const language of ["en","fr"]){
   assert.doesNotMatch(entry[field][language],residualEditorial,
    entry.id+" "+field+"/"+language+" contains glossary implementation language");
  }
 }
}

// Reject metadata labels and content-authoring advice discovered by a separate
// human editorial review; distinguish them from genuine doctrinal terminology.
const exposedMetadata=/\b(?:PROFILE_1962|HISTORICAL object|reference layer|phrase object|liturgical profile)\b|(?:profil 1962\/historique|couche de référence chant\/latin|objet de phrase latine|tableau de postures intemporel)/iu;
for(const entry of entries){
 for(const field of ["short_definition","explanation"]){
  for(const language of ["en","fr"]){
   assert.doesNotMatch(entry[field][language],exposedMetadata,
    entry.id+" "+field+"/"+language+" exposes implementation metadata");
  }
 }
}

const apostasy=entries.find(e=>e.id==="G141"),heresy=entries.find(e=>e.id==="G142"),schism=entries.find(e=>e.id==="G143");
assert.match(apostasy.explanation.en,/Christian faith as a whole/i);
assert.match(heresy.explanation.en,/material heresy.*formal heresy/i);
assert.match(schism.explanation.en,/Roman Pontiff/i);

console.log("Glossary definition completeness: 450/450 EN/FR entries are source-backed.");
