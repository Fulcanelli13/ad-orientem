import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {NOVENA_CORPUS_V4} from "../src/pray/novena-corpus-v4.js";
import {ICKSP_DIVINE_INFANT_KING_NOVENA_V1} from "../src/pray/icksp-divine-infant-king-novena.v1.js";
import {ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1} from "../src/pray/icksp-immaculate-conception-novena.v1.js";
import {NOVENA_HOLY_FACE_1887_B25} from "../src/pray/holy-face-janvier-1887-b25.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const json=p=>JSON.parse(readFileSync(resolve(root,p),"utf8"));
const ledger=json("data/pray/prayer-release-coverage-evidence.v1.json");
const matrix=json("data/pray/prayer-language-route-matrix.v1.json");
const cross=json("data/pray/prayer-multitext-reader-crosswalk.v1.json");
const certificate=json("data/pray/prayer-source-certification-inventory.v3.json");
const scripts=Object.values(json("package.json").scripts);
const idSet=rows=>rows.map(r=>r.id).sort();
const byId=new Map(matrix.routes.map(r=>[r.id,r]));
const byMulti=new Map(cross.routes.map(r=>[r.route,r]));
const knownStatuses=new Set([
 "CANONICAL_SOURCE_FACE_ASSERTED",
 "TARGETED_SOURCE_COMPONENT_ASSERTED",
 "SHARED_OR_OWNER_EVIDENCE_ONLY"
]);

assert.equal(ledger.schema,"ao.pray.release-coverage-evidence.v1");
assert.equal(ledger.routes.length,41);
assert.deepEqual(idSet(ledger.routes),idSet(matrix.routes),
 "The 41 destinations must be exactly the union of actual nine-door and legacy route inventories");
assert.equal(new Set(ledger.routes.map(r=>r.id)).size,41,"Duplicate Prayer destinations");
assert.equal(ledger.counts.uniqueRoutes,matrix.summary.uniqueRoutes);
assert.equal(ledger.counts.legacyRoutes,matrix.summary.legacyRoutes);
assert.equal(ledger.counts.doorRoutes,matrix.summary.currentDoorRoutes);
assert.equal(ledger.counts.canonicalCore,Object.keys(PRAY_CANONICAL_DATA_V435930.prayers).length);
assert.equal(ledger.counts.canonicalLatin,Object.values(PRAY_CANONICAL_DATA_V435930.prayers).filter(x=>!!x.la?.trim()).length);
assert.deepEqual(ledger.counts.uniqueSourceHeldCanonical,matrix.summary.sourceHeldCanonical);
assert.equal(ledger.counts.independentOriginalPrintCertificates,certificate.counts.fullyCertified);
assert.equal(certificate.provenance,"REPOSITORY_RECORD_EXTRACTION_NOT_INDEPENDENT_COLLATION");

const supplement=[ICKSP_DIVINE_INFANT_KING_NOVENA_V1,ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1,NOVENA_HOLY_FACE_1887_B25];
const programmes=[...Object.values(NOVENA_CORPUS_V4),...supplement];
assert.equal(programmes.length,ledger.counts.novenaProgrammes);
assert.equal(programmes.length,19);
const counts={days:0,french:0};
for(const novena of programmes){
 assert.equal(novena.days.length,9,novena.id+" incomplete Novena days");
 for(const day of novena.days){
  counts.days++;
  const text=novena.form==="REPEAT_FORM"?novena.repeatText:day.text;
  if(typeof text?.fr==="string"&&text.fr.trim())counts.french++;
 }
}
assert.equal(counts.days,ledger.counts.novenaProperDays);
assert.equal(counts.french,ledger.counts.novenaFrenchProperDays);
assert.equal(counts.days,171);
assert.equal(counts.french,162);

const seenMulti=new Set();
const exactTestFiles=new Set();
let tested=0,shared=0,canonical=0;
const held=new Set();
for(const row of ledger.routes){
 const original=byId.get(row.id);
 assert.ok(original,row.id+" absent from authority");
 assert.equal(row.kind,original.sourceFamily==="canonical-prayer"?"SINGLE_CANONICAL":"MULTI_TEXT",row.id+" wrong source type");
 assert.deepEqual(row.ownerFiles,original.sourceFiles,row.id+" stale source-owner list");
 for(const path of row.ownerFiles)assert.ok(existsSync(resolve(root,path)),row.id+" missing source owner "+path);
 assert.ok(knownStatuses.has(row.assertionScope),row.id+" unexpected assertion scope");
 assert.ok(Array.isArray(row.assertionFiles)&&row.assertionFiles.length>0,row.id+" missing linked tests");
 assert.equal(row.allStageBrowserVariantCertificate,false,row.id+" claims a blanket phone or language certificate without evidence");
 assert.equal(row.independentPrintEditionCertificate,false,row.id+" claims an independent print certificate");
 assert.ok(Array.isArray(row.editionAndLanguageHolds),row.id+" source exceptions must be explicit");
 assert.ok(["CANONICAL_EDITION_REVIEW_LATER","FULL_ROUTE_VARIANT_BROWSER_ACCEPTANCE","SOURCE_TO_CARD_CENSUS_AND_VARIANT_BROWSER_ACCEPTANCE"].includes(row.nextGate),row.id+" no actionable next gate");
 if(row.editionAndLanguageHolds.length)held.add(row.id);
 for(const testPath of row.assertionFiles){
  assert.match(testPath,/^tests\/[A-Za-z0-9._-]+\.mjs$/,row.id+" invalid test path");
  assert.ok(existsSync(resolve(root,testPath)),row.id+" test not checked in: "+testPath);
  const text=readFileSync(resolve(root,testPath),"utf8");
  assert.match(text,/assert\./,row.id+" reference does not contain an executable assertion: "+testPath);
  assert.ok(scripts.some(s=>s.includes(testPath)),row.id+" supposed evidence test not reachable from npm scripts: "+testPath);
  exactTestFiles.add(testPath);
 }
 if(row.kind==="SINGLE_CANONICAL"){
  canonical++;
  assert.equal(row.assertionScope,"CANONICAL_SOURCE_FACE_ASSERTED",row.id+" cannot imply a multi-stage text test");
  assert.equal(row.readerOwner,"src/pray/canonical-data.js");
  assert.equal(row.renderer,"canonical-prayer-card");
  const source=PRAY_CANONICAL_DATA_V435930.prayers[row.id];
  assert.ok(source,"Missing canonical source "+row.id);
  assert.deepEqual(row.attestedCanonicalLanguages,
   Object.fromEntries(["en","fr","la"].map(k=>[k,typeof source[k]==="string"&&!!source[k].trim()])),
   row.id+" falsely claims source language presence");
 }else{
  seenMulti.add(row.id);
  const crosswalk=byMulti.get(row.id);
  assert.ok(crosswalk,row.id+" missing multi-text crosswalk");
  assert.equal(row.readerOwner,crosswalk.owner,row.id+" wrong renderer owner");
  assert.equal(row.renderer,crosswalk.renderer,row.id+" wrong stage renderer");
  assert.equal(row.attestedCanonicalLanguages,null,row.id+" many-text route cannot claim one language witness");
  if(row.assertionScope==="TARGETED_SOURCE_COMPONENT_ASSERTED")tested++;
  else if(row.assertionScope==="SHARED_OR_OWNER_EVIDENCE_ONLY")shared++;
  else assert.fail(row.id+" is a multi-text route with an unsupported evidence level");
 }
}
assert.deepEqual([...seenMulti].sort(),cross.routes.map(r=>r.route).sort(),"32 source reader routes not reconciled");
assert.equal(canonical,ledger.counts.singleCanonical);
assert.equal(tested,ledger.counts.targetedComponentEvidence);
assert.equal(shared,ledger.counts.sharedOrOwnerEvidenceOnly);
assert.equal(canonical,ledger.counts.canonicalSourceFaceEvidence);
assert.equal(canonical,9);assert.equal(tested,26);assert.equal(shared,6);
assert.equal(ledger.counts.multiText,32);
assert.equal(ledger.counts.fullRouteVariantCertificates,0);
assert.equal(ledger.counts.independentOriginalPrintCertificates,0);
assert.ok(held.has("pray.rosary")&&held.has("pray.novenas")&&held.has("pray.litany_saints")&&held.has("pray.tenebrae"));
const sourceHeld=ledger.routes.find(r=>r.id==="marian_consecration_immaculate_heart");
assert.deepEqual(sourceHeld.attestedCanonicalLanguages,{en:true,fr:false,la:false});
assert.ok(sourceHeld.editionAndLanguageHolds.some(x=>x.includes("ENGLISH_ONLY")));
// Release sequence enforces the historical-source phase rather than silently
// substituting paraphrases or repeating already completed component audits.
assert.equal(ledger.sequencing.length,4);
assert.ok(ledger.sequencing[0].scope.includes("6 remaining shared/owner-evidence"));
assert.ok(ledger.gates.safeguards.some(x=>x.includes("Rosary bead reader")));
console.log("PASS · 41/41 Prayer routes indexed; 32 multi-text = 26 targeted component + 6 shared/owner, 9 canonical source faces; "+counts.days+" Novena day occasions, "+counts.french+" FR proper days; "+held.size+" exceptional route holds, "+exactTestFiles.size+" executable test files mapped; 0 blanket route/browser certifications, 0 original-print certificates");
console.log("NEXT · source-to-card census for "+ledger.routes.filter(r=>r.nextGate==="SOURCE_TO_CARD_CENSUS_AND_VARIANT_BROWSER_ACCEPTANCE").map(r=>r.id).join(", "));
