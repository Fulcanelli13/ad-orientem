import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {gitBlobSha1,parsePinnedLatinChantSections,validatePinnedLatinFile,
 validatePinnedSourceInventory} from "../scripts/schola/pinned-1962-source-library.mjs";
const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const inventory=load("../data/research/mass-music-1962-pinned-full-source-universe.v1.json");
const prior=load("../data/research/mass-music-1962-source-roster-91.v1.json");
const proof=validatePinnedSourceInventory(inventory,prior);
assert.equal(proof.fileCount,1049);
assert.equal(proof.preservedPriorWitnesses,91);
assert.equal(inventory.sourceFiles.filter(x=>x.path.startsWith("Tempora/")).length,523);
assert.equal(inventory.sourceFiles.filter(x=>x.path.startsWith("Sancti/")).length,524);
assert.equal(inventory.sourceFiles.filter(x=>x.path.startsWith("Commune/")).length,2);
assert.deepEqual(inventory.sourceFiles.map(x=>x.path),
 [...inventory.sourceFiles.map(x=>x.path)].sort((a,b)=>a.localeCompare(b)));
const latin="[Officium]\nDominica\n[Introitus]\n!Ps 1\nTextus primi.\n"+
 "[Graduale]\nV. Versus veri.\n[GradualeP] (rubrica 1960)\nDo not select\n"+
 "[Offertorium]\nOffertorium verum\n[Communio]\n@Commune/C10:Communio\n";
const parsed=parsePinnedLatinChantSections(latin);
assert.equal(parsed.sections.Introitus,"!Ps 1\nTextus primi.");
assert.equal(parsed.sections.Graduale,"V. Versus veri.");
assert.equal(parsed.sections.Offertorium,"Offertorium verum");
assert.equal(parsed.sections.Communio,"@Commune/C10:Communio");
assert.ok(!Object.hasOwn(parsed.sections,"GradualeP"));
assert.deepEqual(parsed.conditionalSections,["GradualeP"]);
const duplicate=parsePinnedLatinChantSections("[Introitus]\nOne\n[Introitus]\nTwo\n");
assert.ok(!Object.hasOwn(duplicate.sections,"Introitus"),"Conflicting sections cannot be chosen");
assert.deepEqual(duplicate.duplicateSections,["Introitus"]);
const bytes=Buffer.from(latin);
const entry={path:"Tempora/Adv4-0",sha:gitBlobSha1(bytes),size:bytes.length};
assert.equal(validatePinnedLatinFile({entry,bytes}).status,"SHA_MATCH");
assert.throws(()=>validatePinnedLatinFile({entry,bytes:Buffer.from(latin+"X")}),
 /PINNED_SOURCE_SIZE_MISMATCH/);
assert.throws(()=>validatePinnedLatinFile({entry:{...entry,sha:"f".repeat(40)},bytes}),
 /PINNED_SOURCE_SHA_DRIFT/);
const mutated=structuredClone(inventory);
mutated.sourceFiles[0].sha="0".repeat(40);
assert.throws(()=>validatePinnedSourceInventory(mutated,prior),
 /ORIGINAL_91_WITNESS_CHANGED|PINNED_SOURCE_ENTRY_INVALID/);
assert.equal(inventory.status,
 "PINNED_GIT_TREE_ONLY_NO_CALENDAR_SELECTED_MASSES_OR_MUSICAL_APPROVAL");
console.log("PASS 1049 pinned source identities, 91 historical SHA parity, strict section parsing and blob tamper gate");
