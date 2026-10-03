import assert from "node:assert/strict";
import {
  compilePreGospelSequenceFromSources,
  assertSourceOrderedPreGospelSequence,
  preGospelManifestFields,
  assertPreGospelSourceOrderProof,
  withCompiledPreGospelSequence,
} from "../src/mass/pre-gospel-sequence.js";

const source=(order,ids=order)=>({
  order:["__TOP__",...order],
  map:Object.fromEntries(ids.map(id=>[id,[id+" text"]])),
});

// Critical regression: numeric suffixes deliberately do NOT describe source order.
// A suffix-pairing implementation would reorder this as O1/L1/G1/O2/L2.
const mismatchedSuffixOrder=[
  "OratioL2",
  "LectioL1",
  "GradualeL1",
  "OratioL1",
  "LectioL2",
];
const compiled=compilePreGospelSequenceFromSources({
  sourcePath:"Tempora/Quad5-6",
  sources:{
    la:source(mismatchedSuffixOrder),
    en:source(mismatchedSuffixOrder),
    fr:source(mismatchedSuffixOrder),
  },
  requireSequence:true,
});
assert.deepEqual(compiled.sourceOrder,mismatchedSuffixOrder);
assert.deepEqual(compiled.sequence.map(x=>x.sourceSectionId),mismatchedSuffixOrder);
assert.deepEqual(compiled.sequence.map(x=>x.type),[
  "ORATION","LESSON","GRADUAL","ORATION","LESSON",
]);
assert.deepEqual(compiled.sequence.map(x=>x.sourceOrderIndex),[0,1,2,3,4]);
assert.ok(compiled.sequence.every(x=>x.orderAuthority==="SOURCE_ORDER"));
assert.equal(compiled.sequence[0].sourceRef,"Tempora/Quad5-6:OratioL2");
assertSourceOrderedPreGospelSequence(compiled);
const manifestFields=preGospelManifestFields(compiled);
assert.deepEqual(manifestFields.preGospelSequence.map(x=>x.sourceSectionId),mismatchedSuffixOrder);
assertPreGospelSourceOrderProof(
  manifestFields.preGospelSequence,
  manifestFields.preGospelSequenceProvenance
);

// Ember-Saturday-shaped fixture: preserve all nodes, including Tract/Alleluia,
// exactly in the order supplied by the source parser.
const ember=[
  "OratioL1","LectioL1","GradualeL1",
  "OratioL2","LectioL2","GradualeL2",
  "OratioL3","LectioL3","TractusL3",
  "OratioL4","LectioL4","GradualeL4",
  "OratioL5","LectioL5","AlleluiaL5",
];
const emberCompiled=compilePreGospelSequenceFromSources({
  sourcePath:"Tempora/Ember-Sat",
  sources:{la:source(ember),en:source(ember),fr:source(ember)},
  requireSequence:true,
});
assert.equal(emberCompiled.sequence.length,ember.length);
assert.deepEqual(emberCompiled.sequence.map(x=>x.sourceSectionId),ember);
assertSourceOrderedPreGospelSequence(emberCompiled);

// Translation payload may be missing without changing structure.
const partial=compilePreGospelSequenceFromSources({
  sources:{
    la:source(["OratioL1","LectioL1"]),
    en:{order:["__TOP__","OratioL1","LectioL1"],map:{OratioL1:["Prayer"]}},
    fr:{order:[],map:{}},
  },
  requireSequence:true,
});
assert.deepEqual(partial.sequence[0].payloadLanguages,["la","en"]);
assert.deepEqual(partial.sequence[1].payloadLanguages,["la"]);

// Structural language disagreement is a hard failure, not a reason to guess.
assert.throws(()=>compilePreGospelSequenceFromSources({
  sources:{
    la:source(["OratioL1","LectioL1"]),
    en:source(["LectioL1","OratioL1"]),
  },
  requireSequence:true,
}),/structural order mismatch/);

// Duplicate IDs and payload-less nodes fail closed.
assert.throws(()=>compilePreGospelSequenceFromSources({
  sources:{la:source(["OratioL1","OratioL1"],["OratioL1"])},
  requireSequence:true,
}),/duplicate source section/);

assert.throws(()=>compilePreGospelSequenceFromSources({
  sources:{la:{order:["OratioL1"],map:{}}},
  requireSequence:true,
}),/has no payload/);

assert.throws(()=>compilePreGospelSequenceFromSources({
  sources:{la:{order:["Introitus","Lectio"],map:{Introitus:["x"],Lectio:["y"]}}},
  requireSequence:true,
}),/required but no ordered extended-reading sections/);

const attached=withCompiledPreGospelSequence({
  schema:"ao-proper-manifest-v2",
  requirements:{crossParity:true},
  crossParityStatus:"PASS",
  orations:{collectSet:[],secretSet:[],postcommunionSet:[]},
  canonPackage:{},
},{
  sourcePath:"Tempora/Quad5-6",
  sources:{la:source(mismatchedSuffixOrder),en:source(mismatchedSuffixOrder)},
});
assert.equal(attached.requirements.preGospelSourceOrder,true);
assert.deepEqual(attached.preGospelSequenceProvenance.sourceOrder,mismatchedSuffixOrder);

const reordered=structuredClone(attached);
reordered.preGospelSequence.reverse();
assert.throws(()=>assertPreGospelSourceOrderProof(
  reordered.preGospelSequence,
  reordered.preGospelSequenceProvenance
),/does not preserve source order|sourceOrderIndex mismatch/);

console.log("PRE_GOSPEL_SEQUENCE compiler: PASS — exact source order preserved; suffix pairing rejected.");
