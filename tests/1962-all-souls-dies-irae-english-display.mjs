import assert from "node:assert/strict";
import {project1962AllSoulsDiesIraeEnglishDisplayRows as display,ALL_SOULS_DIES_IRAE_SOURCE_NOTE as correction}
 from "../src/mass/1962-all-souls-sequence-english.js";

const original=Object.freeze({
  id:"SEQUENCE",latin:"Dies iræ, dies illa\nSolvet sæclum in favílla:",
  vernacular:"May be omitted at Daily Mass\nDreaded day, that day of ire\nWhen the world shall melt in fire.",
});
const others=Object.freeze({id:"GRADUAL",latin:"Requiem æternam",vernacular:"Eternal rest"});
const rows=Object.freeze([others,original]);
assert.equal(correction.sourcePaths.length,3);
for(const sourcePath of correction.sourcePaths){
  const proper=Object.freeze({sourcePath});
  const english=display(proper,rows,{language:"en"});
  assert.notEqual(english,rows);
  assert.strictEqual(english[0],others,"Other Proper chants may not be altered");
  assert.equal(english[1].vernacular,
    "Dreaded day, that day of ire\nWhen the world shall melt in fire.");
  assert.equal(english[1].latin,original.latin,"Latin must remain exact");
  assert.strictEqual(english[1].sourceEnglishEditorialNote,correction);
  assert.equal(original.vernacular.startsWith(correction.sourceEnglishNote),true,
    "Pinned English source must remain immutable");
  assert.strictEqual(display(proper,english,{language:"en"}),english,
    "Correction must be idempotent");
  assert.strictEqual(display(proper,rows,{language:"fr"}),rows,
    "French and Latin source must not be changed");
}
for(const sourcePath of ["Sancti/11-01","Sancti/11-02","Commune/C9","Sancti/11-03"]){
  assert.strictEqual(display({sourcePath},rows,{language:"en"}),rows,
    "Do not apply All Souls note correction outside its exact three source files");
}
assert.strictEqual(display({sourcePath:"Sancti/11-02m1"},[
  {...original,latin:"Requiem æternam"}],{language:"en"})[0].vernacular,
  original.vernacular,"Without matching Latin hymn identity, never remove source text");
assert.strictEqual(display({sourcePath:"Sancti/11-02m1"},[
  {...original,vernacular:"Other note\nDreaded day"}],{language:"en"})[0].vernacular,
  "Other note\nDreaded day","Never remove unexpected source wording");
console.log("PASS: All Souls Dies irae source editorial heading removed only in EN display");
